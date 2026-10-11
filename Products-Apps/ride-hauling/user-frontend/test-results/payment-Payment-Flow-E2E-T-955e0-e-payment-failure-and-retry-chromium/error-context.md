# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> Payment Flow E2E Tests >> should handle payment failure and retry
- Location: tests/e2e/payment.spec.ts:247:3

# Error details

```
Test timeout of 30000ms exceeded while setting up "authenticatedPage".
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Login")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
      - navigation [ref=e9]:
        - link "Home" [ref=e10] [cursor=pointer]:
          - /url: /
        - link "Features" [ref=e11] [cursor=pointer]:
          - /url: /features
        - link "Pricing" [ref=e12] [cursor=pointer]:
          - /url: /pricing
        - link "Support" [ref=e13] [cursor=pointer]:
          - /url: /support
      - generic [ref=e15]:
        - link "Log In" [ref=e16] [cursor=pointer]:
          - /url: /login
        - link "Sign Up" [ref=e17] [cursor=pointer]:
          - /url: /register
  - main [ref=e18]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic:
          - img:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic: David K.
                      - generic:
                        - text: "Trip:"
                        - generic: Maryland ➔ Ikeja G.R.A
                      - generic: ⭐ 4.8 • On Trip
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-101
                    - generic: Germany ➔ France
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-102
                    - generic: Germany ➔ Canada
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-103
                    - generic: France ➔ Nigeria
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-104
                    - generic: UAE ➔ Nigeria
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-105
                    - generic: Japan ➔ USA
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-106
                    - generic: Canada ➔ Germany
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-107
                    - generic: Japan ➔ France
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-108
                    - generic: USA ➔ UK
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: AIR GOOM • GA-109
                    - generic: Japan ➔ UAE
      - generic [ref=e22]:
        - generic [ref=e23]:
          - img [ref=e25]
          - heading "Welcome Back" [level=3] [ref=e26]
          - paragraph [ref=e27]: Enter your credentials to access your account.
        - generic [ref=e28]:
          - generic [ref=e29]:
            - textbox "Email address" [ref=e30]:
              - /placeholder: name@example.com
              - text: testuser@example.com
            - generic: Email address
          - generic [ref=e31]:
            - textbox "Password" [active] [ref=e32]: TestPassword123!
            - generic: Password
          - generic [ref=e33]:
            - generic [ref=e34]:
              - checkbox "Remember me" [ref=e35]
              - generic [ref=e36]: Remember me
            - link "Forgot password?" [ref=e37] [cursor=pointer]:
              - /url: /forgot-password
          - button "Sign In" [ref=e38] [cursor=pointer]
          - paragraph [ref=e40]: OR
          - button " Continue with Google" [ref=e41] [cursor=pointer]:
            - generic [ref=e42]: 
            - text: Continue with Google
          - button " Continue with Facebook" [ref=e43] [cursor=pointer]:
            - generic [ref=e44]: 
            - text: Continue with Facebook
          - paragraph [ref=e45]:
            - text: Don't have an account?
            - link "Sign up" [ref=e46] [cursor=pointer]:
              - /url: /register
  - contentinfo [ref=e47]:
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - heading "Queens" [level=4] [ref=e51]
          - paragraph [ref=e52]: Making urban mobility accessible, affordable, and reliable for everyone.
        - generic [ref=e53]:
          - heading "Company" [level=6] [ref=e54]
          - list [ref=e55]:
            - listitem [ref=e56]:
              - link "About Us" [ref=e57] [cursor=pointer]:
                - /url: /about-us
            - listitem [ref=e58]:
              - link "Careers" [ref=e59] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e60]:
              - link "Blog" [ref=e61] [cursor=pointer]:
                - /url: "#"
        - generic [ref=e62]:
          - heading "For Riders" [level=6] [ref=e63]
          - list [ref=e64]:
            - listitem [ref=e65]:
              - link "Download App" [ref=e66] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e67]:
              - link "Help & Support" [ref=e68] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e69]:
              - link "Safety" [ref=e70] [cursor=pointer]:
                - /url: "#"
        - generic [ref=e71]:
          - heading "Legal" [level=6] [ref=e72]
          - list [ref=e73]:
            - listitem [ref=e74]:
              - link "Privacy Policy" [ref=e75] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=e76]:
              - link "Terms of Service" [ref=e77] [cursor=pointer]:
                - /url: /terms
            - listitem [ref=e78]:
              - link "Contact" [ref=e79] [cursor=pointer]:
                - /url: "#"
      - paragraph [ref=e81]: © 2026 Queens. All rights reserved. Crafted for seamless urban mobility.
```

# Test source

```ts
  1  | import { test as base, expect } from '@playwright/test';
  2  | 
  3  | export type AuthFixtures = {
  4  |   authenticatedPage: void;
  5  |   testUser: {
  6  |     email: string;
  7  |     password: string;
  8  |     phone: string;
  9  |     firstName: string;
  10 |     lastName: string;
  11 |   };
  12 | };
  13 | 
  14 | export const test = base.extend<AuthFixtures>({
  15 |   testUser: {
  16 |     email: 'testuser@example.com',
  17 |     password: 'TestPassword123!',
  18 |     phone: '+234 810 000 0000',
  19 |     firstName: 'Test',
  20 |     lastName: 'User',
  21 |   },
  22 | 
  23 |   authenticatedPage: async ({ page, testUser }, use) => {
  24 |     // Navigate to login page
  25 |     await page.goto('/login');
  26 | 
  27 |     // Fill login form
  28 |     await page.fill('input[type="email"]', testUser.email);
  29 |     await page.fill('input[type="password"]', testUser.password);
  30 | 
  31 |     // Click login button
> 32 |     await page.click('button:has-text("Login")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  33 | 
  34 |     // Wait for navigation to dashboard
  35 |     await page.waitForURL('/dashboard', { timeout: 10000 });
  36 | 
  37 |     // Verify we're logged in
  38 |     await expect(page.locator('text=Dashboard')).toBeVisible();
  39 | 
  40 |     // Use the authenticated page
  41 |     await use();
  42 | 
  43 |     // Cleanup: logout
  44 |     await page.click('[data-testid="user-menu"]');
  45 |     await page.click('text=Logout');
  46 |     await page.waitForURL('/login');
  47 |   },
  48 | });
  49 | 
  50 | export { expect };
  51 | 
```