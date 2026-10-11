#!/usr/bin/env bash
#===============================================================================
# Run all per-microservice curl tests
# Usage: ./scripts/run-all-service-tests.sh [--skip-auth]
#===============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
ALL_PASS=0
ALL_FAIL=0
FAILED_SCRIPTS=""

# Collect all test scripts: per-service + coverage-gaps + mega
TEST_SCRIPTS=()
for s in "$DIR"/test-*.sh; do TEST_SCRIPTS+=("$s"); done
if [ -f "$DIR/../test-coverage-gaps.sh" ]; then TEST_SCRIPTS+=("$DIR/../test-coverage-gaps.sh"); fi
TOTAL=${#TEST_SCRIPTS[@]}

echo -e "${CYAN}================================================================================${NC}"
echo -e "${CYAN}  Running all ${TOTAL} endpoint test suites${NC}"
echo -e "${CYAN}  Base URL: ${BASE:-http://localhost:3000}${NC}"
echo -e "${CYAN}================================================================================${NC}"

for script in "${TEST_SCRIPTS[@]}"; do
  name="$(basename "$script" .sh)"
  echo
  echo -e "${YELLOW}────────────────────────────────────────────────────────────────────────────────${NC}"
  echo -e "${YELLOW}  Running: $name${NC}"
  echo -e "${YELLOW}────────────────────────────────────────────────────────────────────────────────${NC}"

  set +e
  output=$(bash "$script" 2>&1)
  exit_code=$?
  set -e

  # Extract PASS/FAIL counts from summary line
  pass_count=$(echo "$output" | grep -oE 'PASS=[0-9]+' | tail -1 | cut -d= -f2)
  fail_count=$(echo "$output" | grep -oE 'FAIL=[0-9]+' | tail -1 | cut -d= -f2)

  # Show key lines
  echo "$output" | grep -E '(✓ PASS|✗ FAIL|All endpoints|endpoint.*failed)'

  if [ "$exit_code" -eq 0 ] && [ "${fail_count:-0}" -eq 0 ]; then
    echo -e "${GREEN}  >>> $script: ALL PASSED${NC}"
  else
    echo -e "${RED}  >>> $script: FAILURES DETECTED${NC}"
    FAILED_SCRIPTS="$FAILED_SCRIPTS $name"
  fi

  ALL_PASS=$((ALL_PASS + ${pass_count:-0}))
  ALL_FAIL=$((ALL_FAIL + ${fail_count:-0}))
done

echo
echo -e "${CYAN}================================================================================${NC}"
echo -e "${CYAN}  OVERALL RESULTS${NC}"
echo -e "${CYAN}================================================================================${NC}"
echo -e "  Total endpoints tested: $((ALL_PASS + ALL_FAIL))"
echo -e "  ${GREEN}PASS: $ALL_PASS${NC}"
echo -e "  ${RED}FAIL: $ALL_FAIL${NC}"

if [ -n "$FAILED_SCRIPTS" ]; then
  echo
  echo -e "${RED}  Scripts with failures:${NC}"
  for s in $FAILED_SCRIPTS; do
    echo -e "${RED}    - $s${NC}"
  done
  exit 1
else
  echo -e "${GREEN}  All scripts passed!${NC}"
  exit 0
fi
