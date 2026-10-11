#!/usr/bin/env bash
#===============================================================================
# Shared auth & helpers for per-microservice test scripts
#===============================================================================
set -uo pipefail

BASE="${BASE:-http://localhost:3000}"
PASS=0
FAIL=0
TOKEN=""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

section() { echo; echo -e "${YELLOW}══════════════════════════════════════════════════════════════${NC}"; echo -e "${YELLOW}  $1${NC}"; echo -e "${YELLOW}══════════════════════════════════════════════════════════════${NC}"; }
log()     { echo -e "${CYAN}[TEST]${NC} $1"; }
pass()    { echo -e "  ${GREEN}✓ PASS${NC} $1"; ((PASS++)); }
fail()    { echo -e "  ${RED}✗ FAIL${NC} $1"; ((FAIL++)); }

# Wrappers that never exit the script when curl fails (no `set -e`)
curl_http() { curl -s -o /dev/null -w "%{http_code}" -H "$AUTH_HEADER" "$@" || echo "000"; }
curl_body() { curl -s -w "\n%{http_code}" -H "$AUTH_HEADER" "$@" || echo -e "\n000"; }

extract_token() {
  local body="$1"
  local tok
  tok=$(echo "$body" | grep -o '"access_token"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -n "$tok" ] && echo "$tok" && return
  tok=$(echo "$body" | grep -o '"token"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -n "$tok" ] && echo "$tok" && return
  tok=$(echo "$body" | grep -o '"accessToken"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -n "$tok" ] && echo "$tok" && return
  tok=$(echo "$body" | grep -oE 'eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+' | head -1)
  echo "$tok"
}

do_login() {
  # Wait for auth service to be ready before attempting login
  local attempt=1
  while [ $attempt -le 60 ]; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@queensos.com","password":"Admin@123456"}' 2>/dev/null || echo "000")
    if [ "$code" = "200" ] || [ "$code" = "201" ]; then break; fi
    sleep 1
    ((attempt++))
  done
  local label="${1:-Root Admin}"
  local AUTH_RESULT AUTH_BODY AUTH_CODE
  AUTH_RESULT=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@queensos.com","password":"Admin@123456"}') || true
  AUTH_BODY=$(echo "$AUTH_RESULT" | sed '$d') || true
  AUTH_CODE=$(echo "$AUTH_RESULT" | tail -n1) || true

  if [ "$AUTH_CODE" = "200" ] || [ "$AUTH_CODE" = "201" ]; then
    TOKEN=$(extract_token "$AUTH_BODY")
    if [ -n "$TOKEN" ]; then
      pass "Login as $label (HTTP $AUTH_CODE)"
    else
      fail "Login as $label — HTTP $AUTH_CODE but no token in response"
      log "Response: ${AUTH_BODY:0:200}..."
      exit 1
    fi
  else
    fail "Login as $label (HTTP $AUTH_CODE)"
    log "Response: ${AUTH_BODY:0:200}..."
    # Fallback to direct auth-service
    log "Trying direct auth-service on port 3001..."
    AUTH_RESULT=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3001/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@queensos.com","password":"Admin@123456"}') || true
    AUTH_BODY=$(echo "$AUTH_RESULT" | sed '$d') || true
    AUTH_CODE=$(echo "$AUTH_RESULT" | tail -n1) || true
    if [ "$AUTH_CODE" = "200" ] || [ "$AUTH_CODE" = "201" ]; then
      TOKEN=$(extract_token "$AUTH_BODY")
      if [ -n "$TOKEN" ]; then
        pass "Login as $label via direct auth-service (HTTP $AUTH_CODE)"
      else
        fail "Direct login — HTTP $AUTH_CODE but no token"
        exit 1
      fi
    else
      fail "Direct login also failed (HTTP $AUTH_CODE)"
      exit 1
    fi
  fi
}

summary() {
  local name="$1"
  echo
  echo -e "${YELLOW}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}  $name — Results: PASS=$PASS FAIL=$FAIL${NC}"
  echo -e "${YELLOW}══════════════════════════════════════════════════════════════${NC}"
  [ "$FAIL" -eq 0 ] && echo -e "${GREEN}  All endpoints passed!${NC}" || echo -e "${RED}  $FAIL endpoint(s) failed${NC}"
}
