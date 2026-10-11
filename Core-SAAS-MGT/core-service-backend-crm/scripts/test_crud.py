#!/usr/bin/env python3
"""
Full CRUD endpoint test for all 5 modules:
  - Drivers (customers/type/driver)
  - Riders (customers/type/rider)
  - Partners (customers/type/partner)
  - Users / Account Officers (auth/users)
  - Analytics + Upload config
"""

import subprocess, json, sys, time

BASE = "http://localhost:3000"
PASS = "\033[0;32m✅\033[0m"
FAIL = "\033[0;31m❌\033[0m"
INFO = "\033[1;33m──\033[0m"

# Unique suffix per run to avoid duplicate conflicts
RUN_ID = str(int(time.time()))[-6:]

def req(method, path, body=None, token=None, expected=None):
    cmd = ["curl", "-s", "-X", method, f"{BASE}{path}"]
    if token:
        cmd += ["-H", f"Authorization: Bearer {token}"]
    if body:
        cmd += ["-H", "Content-Type: application/json", "-d", json.dumps(body)]
    cmd += ["-w", "\n__STATUS__%{http_code}"]
    raw = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode()
    parts = raw.rsplit("\n__STATUS__", 1)
    body_str = parts[0].strip()
    status = int(parts[1].strip()) if len(parts) > 1 else 0
    try:
        data = json.loads(body_str) if body_str else {}
    except Exception:
        data = {"_raw": body_str[:200]}
    if expected and status not in expected:
        print(f"{FAIL} {method} {path} → HTTP {status} (expected {expected})")
        print(f"     Response: {json.dumps(data)[:200]}")
        return data, status, False
    return data, status, True

errors = 0

# ── 1. LOGIN ───────────────────────────────────────────────────────────────────
print(f"\n{INFO} LOGIN")
d, s, ok = req("POST", "/auth/login",
    {"email": "admin@queensos.com", "password": "Admin@123456"})
if not ok or not d.get("access_token"):
    print(f"{FAIL} Login failed HTTP={s}"); sys.exit(1)
TOKEN = d["access_token"]
print(f"{PASS} Login → role=root_admin JWT={len(TOKEN)} chars")

# ── 2. CUSTOMER STATS ─────────────────────────────────────────────────────────
print(f"\n{INFO} CUSTOMER STATS")
d, s, ok = req("GET", "/customers/stats", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Stats → drivers={d.get('drivers')} riders={d.get('riders')} partners={d.get('partners')} total={d.get('totalCustomers')}")
else:
    errors += 1

# ── 3. LIST DRIVERS ────────────────────────────────────────────────────────────
print(f"\n{INFO} LIST DRIVERS")
d, s, ok = req("GET", "/customers/type/driver?take=3", token=TOKEN, expected=[200])
if ok:
    first = d.get("data", [{}])[0]
    m = first.get("metadata") or {}
    print(f"{PASS} List drivers → count={len(d.get('data',[]))} first={first.get('firstName')} tier={m.get('tier')} docs={bool(m.get('docs'))}")
else:
    errors += 1

# ── 4. LIST RIDERS ─────────────────────────────────────────────────────────────
print(f"\n{INFO} LIST RIDERS")
d, s, ok = req("GET", "/customers/type/rider?take=3", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} List riders → count={len(d.get('data',[]))}")
else:
    errors += 1

# ── 5. LIST PARTNERS ───────────────────────────────────────────────────────────
print(f"\n{INFO} LIST ECOSYSTEM PARTNERS")
d, s, ok = req("GET", "/customers/type/partner?take=3", token=TOKEN, expected=[200])
if ok:
    samples = [(c.get("companyName") or f"{c.get('firstName')} {c.get('lastName')}") + f" ({(c.get('metadata') or {}).get('partnerCategory','?')})" for c in d.get("data", [])]
    print(f"{PASS} List partners → {samples}")
else:
    errors += 1

# ── 6. CREATE DRIVER ───────────────────────────────────────────────────────────
print(f"\n{INFO} CREATE DRIVER")
d, s, ok = req("POST", "/customers", {
    "customerType": "driver",
    "email": f"pytest.driver.{RUN_ID}@test.com",
    "phone": f"+2348011{RUN_ID}",
    "firstName": "PyTest",
    "lastName": "Driver",
    "licenseNumber": f"DL-PYTEST-{RUN_ID}",
    "vehicleModel": "Toyota Camry",
    "metadata": {
        "tier": "Swift",
        "licenseClass": "Class B",
        "vehicleColor": "Black",
        "vehicleYear": "2023",
        "vettingStatus": "PENDING",
        "source": "individual"
    }
}, token=TOKEN, expected=[201])
DRIVER_ID = d.get("id", "")
if ok and DRIVER_ID:
    print(f"{PASS} Create driver → id={DRIVER_ID} status={d.get('status')}")
else:
    errors += 1

# ── 7. VERIFY DRIVER ───────────────────────────────────────────────────────────
print(f"\n{INFO} VERIFY DRIVER")
d, s, ok = req("POST", f"/customers/{DRIVER_ID}/verify", token=TOKEN, expected=[200, 201])
if ok:
    print(f"{PASS} Verify → isVerified={d.get('isVerified')} status={d.get('status')} HTTP={s}")
else:
    errors += 1

# ── 8. UPDATE DRIVER WITH DOC URLS ─────────────────────────────────────────────
print(f"\n{INFO} UPDATE DRIVER (document URLs post-upload)")
d, s, ok = req("PUT", f"/customers/{DRIVER_ID}", {
    "metadata": {
        "vettingStatus": "APPROVED",
        "docs": {
            "licenseFront": "https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/pytest/license.jpg",
            "idProof":      "https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/pytest/id.jpg",
            "utilityBill":  "https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/pytest/bill.jpg",
            "insurance":    "https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/pytest/insurance.jpg",
        },
        "biometricSelfie": "https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/pytest/selfie.jpg",
    }
}, token=TOKEN, expected=[200])
if ok:
    m = d.get("metadata") or {}
    print(f"{PASS} Update driver → vetting={m.get('vettingStatus')} docs={bool(m.get('docs'))}")
else:
    errors += 1

# ── 9. SUSPEND DRIVER ──────────────────────────────────────────────────────────
print(f"\n{INFO} SUSPEND DRIVER")
d, s, ok = req("POST", f"/customers/{DRIVER_ID}/suspend", token=TOKEN, expected=[200, 201])
if ok:
    print(f"{PASS} Suspend driver → status={d.get('status')} HTTP={s}")
else:
    errors += 1

# ── 10. CREATE ECOSYSTEM PARTNER ──────────────────────────────────────────────
print(f"\n{INFO} CREATE ECOSYSTEM PARTNER")
d, s, ok = req("POST", "/customers", {
    "customerType": "partner",
    "email": f"pytest.bank.{RUN_ID}@ecosystem.com",
    "phone": f"+2348022{RUN_ID}",
    "firstName": "PyTest",
    "lastName": "Bank",
    "companyName": f"PyTest Bank {RUN_ID}",
    "taxId": f"PYTEST-BANK-{RUN_ID}",
    "businessDescription": "Test bank for automated CRUD validation",
    "metadata": {
        "partnerCategory": "BANK",
        "revenueShare": 2.5,
        "bankName": "PyTest Bank",
        "swiftCode": "PYTBNGLA",
        "integrationStatus": "SANDBOX"
    }
}, token=TOKEN, expected=[201])
PARTNER_ID = d.get("id", "")
if ok and PARTNER_ID:
    print(f"{PASS} Create partner → id={PARTNER_ID} company={d.get('companyName')}")
else:
    errors += 1

# ── 11. UPDATE PARTNER ─────────────────────────────────────────────────────────
print(f"\n{INFO} UPDATE PARTNER")
d, s, ok = req("PUT", f"/customers/{PARTNER_ID}", {
    "metadata": {"integrationStatus": "LIVE", "revenueShare": 3.0}
}, token=TOKEN, expected=[200])
if ok:
    m = d.get("metadata") or {}
    print(f"{PASS} Update partner → integrationStatus={m.get('integrationStatus')}")
else:
    errors += 1

# ── 12. CREATE STAFF USER ──────────────────────────────────────────────────────
print(f"\n{INFO} CREATE STAFF USER")
d, s, ok = req("POST", "/auth/users", {
    "email": f"pytest.staff.{RUN_ID}@tenant-001.com",
    "phone": f"+2348033{RUN_ID}",
    "password": "Staff@123456",
    "firstName": "PyStaff",
    "lastName": "Test",
    "tenantId": "tenant-001",
    "role": "staff"
}, token=TOKEN, expected=[201])
STAFF_ID = d.get("id", "")
if ok and STAFF_ID:
    print(f"{PASS} Create staff → id={STAFF_ID} role={d.get('role')}")
else:
    errors += 1

# ── 13. CREATE ACCOUNT OFFICER ─────────────────────────────────────────────────
print(f"\n{INFO} CREATE ACCOUNT OFFICER")
d, s, ok = req("POST", "/auth/users", {
    "email": f"pytest.ao.{RUN_ID}@tenant-001.com",
    "phone": f"+2348044{RUN_ID}",
    "password": "AO@123456",
    "firstName": "PyAO",
    "lastName": "Test",
    "tenantId": "tenant-001",
    "role": "account_officer"
}, token=TOKEN, expected=[201])
AO_ID = d.get("id", "")
if ok and AO_ID:
    print(f"{PASS} Create account officer → id={AO_ID} role={d.get('role')}")
else:
    errors += 1

# ── 14. GET USER BY ID ─────────────────────────────────────────────────────────
print(f"\n{INFO} GET USER BY ID")
d, s, ok = req("GET", f"/auth/users/{AO_ID}", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Get user → email={d.get('email')} role={d.get('role')}")
else:
    errors += 1

# ── 15. UPDATE USER ROLE ───────────────────────────────────────────────────────
print(f"\n{INFO} UPDATE USER ROLE (staff → account_officer)")
d, s, ok = req("PATCH", f"/auth/users/{STAFF_ID}", {"role": "account_officer"}, token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Update role → new role={d.get('role')}")
else:
    errors += 1

# ── 16. LIST ALL USERS (root-admin cross-tenant) ───────────────────────────────
print(f"\n{INFO} LIST ALL USERS (root-admin cross-tenant)")
d, s, ok = req("GET", "/auth/users", token=TOKEN, expected=[200])
if ok:
    roles = list(set(u.get("role") for u in d.get("data", [])))
    print(f"{PASS} List users → total={d.get('total')} roles={roles}")
else:
    errors += 1

# ── 17. LIST USERS tenant-001 only ────────────────────────────────────────────
print(f"\n{INFO} LIST USERS (tenant-001 filter)")
d, s, ok = req("GET", "/auth/users?tenantId=tenant-001", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Filter tenant-001 → total={d.get('total')}")
    for u in d.get("data", []):
        print(f"     {u.get('email')} role={u.get('role')}")
else:
    errors += 1

# ── 18. ANALYTICS DASHBOARD METRICS ───────────────────────────────────────────
print(f"\n{INFO} ANALYTICS DASHBOARD METRICS (GL-sourced)")
d, s, ok = req("GET", "/analytics/dashboard/metrics", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Metrics → grossVolume={d.get('grossVolume')} commission={d.get('commission')} drivers={d.get('driverCount')}")
else:
    errors += 1

# ── 19. ANALYTICS RECENT TRANSACTIONS ─────────────────────────────────────────
print(f"\n{INFO} RECENT LEDGER TRANSACTIONS")
d, s, ok = req("GET", "/analytics/transactions/recent?limit=3", token=TOKEN, expected=[200])
if ok and isinstance(d, list):
    print(f"{PASS} Transactions → count={len(d)} first ref={d[0].get('reference') if d else 'none'}")
else:
    errors += 1

# ── 20. UPLOAD CONFIG ─────────────────────────────────────────────────────────
print(f"\n{INFO} UPLOAD PROVIDER CONFIG")
d, s, ok = req("POST", "/upload/config", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Upload config → provider={d.get('provider')} cloudName={d.get('cloudName')}")
else:
    errors += 1

# ── 21. LIST TENANTS ───────────────────────────────────────────────────────────
print(f"\n{INFO} LIST TENANTS")
d, s, ok = req("GET", "/auth/tenants", token=TOKEN, expected=[200])
if ok:
    ids = [t.get("tenantId") for t in d.get("data", [])]
    print(f"{PASS} Tenants → total={d.get('total')} ids={ids}")
else:
    errors += 1

# ── 22. CREATE TENANT ──────────────────────────────────────────────────────────
print(f"\n{INFO} CREATE TENANT")
TEST_TENANT = f"pytest-{RUN_ID}"
d, s, ok = req("POST", "/auth/tenants", {
    "tenantId": TEST_TENANT,
    "name": f"PyTest Corp {RUN_ID}",
    "domain": f"pytest-{RUN_ID}.queensos.com",
    "subscriptionPlan": "premium"
}, token=TOKEN, expected=[200, 201])
if ok:
    print(f"{PASS} Create tenant → tenantId={d.get('tenantId')} plan={d.get('subscriptionPlan')}")
else:
    errors += 1

# ── 23. SUSPEND TENANT ─────────────────────────────────────────────────────────
print(f"\n{INFO} SUSPEND TENANT")
d, s, ok = req("PATCH", f"/auth/tenants/{TEST_TENANT}/suspend", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Suspend tenant → status={d.get('status')}")
else:
    errors += 1

# ── 24. ACTIVATE TENANT ────────────────────────────────────────────────────────
print(f"\n{INFO} ACTIVATE TENANT")
d, s, ok = req("PATCH", f"/auth/tenants/{TEST_TENANT}/activate", token=TOKEN, expected=[200])
if ok:
    print(f"{PASS} Activate tenant → status={d.get('status')}")
else:
    errors += 1

# ── CLEANUP ────────────────────────────────────────────────────────────────────
print(f"\n{INFO} CLEANUP")
req("DELETE", f"/customers/{DRIVER_ID}", token=TOKEN, expected=[200])
req("DELETE", f"/customers/{PARTNER_ID}", token=TOKEN, expected=[200])
req("DELETE", f"/auth/users/{STAFF_ID}", token=TOKEN, expected=[204])
req("DELETE", f"/auth/users/{AO_ID}", token=TOKEN, expected=[204])
print(f"{PASS} Cleaned up test records")

# ── SUMMARY ────────────────────────────────────────────────────────────────────
print()
if errors == 0:
    print("\033[0;32m════════════════════════════════════════\033[0m")
    print("\033[0;32m  ALL 24 TESTS PASSED ✅\033[0m")
    print("\033[0;32m════════════════════════════════════════\033[0m")
    print("\nSwagger docs:")
    print("  Auth Service: http://localhost:3001/api/docs")
    print("  API Gateway:  http://localhost:3000/api/docs")
else:
    print(f"\n\033[0;31m{errors} TEST(S) FAILED ❌\033[0m")
    sys.exit(1)
