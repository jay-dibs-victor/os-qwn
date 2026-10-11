if (typeof global.crypto === 'undefined') {
  (global as any).crypto = require('crypto').webcrypto;
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ApiGatewayModule } from './api-gateway.module';

const logger = new Logger('SwaggerAggregator');

/**
 * Fetch OpenAPI JSON spec from a downstream service.
 * Retries up to `retries` times with a 2-second delay.
 */
async function fetchSpec(
  host: string,
  port: number,
  path = '/api/docs-json',
  retries = 5,
): Promise<Record<string, any> | null> {
  const url = `http://${host}:${port}${path}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const spec = await res.json();
        logger.log(`Fetched spec from ${url}`);
        return spec;
      }
      logger.warn(`Attempt ${attempt}/${retries}: ${url} returned ${res.status}`);
    } catch (err: any) {
      logger.warn(`Attempt ${attempt}/${retries}: ${url} — ${err.message}`);
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  logger.error(`Failed to fetch spec from ${url} after ${retries} attempts`);
  return null;
}

/**
 * Deep-merge a downstream OpenAPI spec into the gateway's combined document.
 * Only merges `paths`, `components.schemas`, and `tags` — everything else
 * (title, version, servers, security) comes from the gateway.
 */
function mergeSpec(target: Record<string, any>, source: Record<string, any>) {
  if (source.paths) {
    for (const [route, methods] of Object.entries(source.paths)) {
      if (!target.paths[route]) {
        target.paths[route] = {};
      }
      Object.assign(target.paths[route], methods);
    }
  }
  if (source.components?.schemas) {
    if (!target.components) target.components = {};
    if (!target.components.schemas) target.components.schemas = {};
    Object.assign(target.components.schemas, source.components.schemas);
  }
  if (source.tags) {
    const existingTags = new Set((target.tags || []).map((t: any) => t.name));
    for (const tag of source.tags) {
      if (!existingTags.has(tag.name)) {
        target.tags.push(tag);
        existingTags.add(tag.name);
      }
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bufferLogs: true });

  // ── CORS must be the FIRST thing registered — before NestJS middleware,
  // before proxies, before everything. Using the raw Express instance so
  // it runs on every request including proxied and error responses.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, res: any, next: any) => {
    const origin = (req.headers.origin as string) || '';
    const allowed = !origin || origin.startsWith('http://localhost') || [
      'https://queens-driver.netlify.app',
      'https://queens-ride.netlify.app',
      'https://queens-os-crm.com',
    ].includes(origin);

    if (allowed) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Tenant-ID,x-tenant-id,x-user-id,X-User-ID');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    next();
  });

  app.enableCors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'x-tenant-id', 'x-user-id', 'X-User-ID'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Queens OS — Enterprise Banking & CRM API')
    .setDescription(`
## Overview
Complete enterprise-grade financial accounting and transaction orchestration system.
Covers double-entry bookkeeping, event-driven posting, multi-tenant GL, reconciliation, audit trail, and regulated banking operations.

## Authentication
All protected endpoints require a Bearer JWT token.
1. Call **POST /auth/login** with email + password
2. Copy the \`access_token\` from the response
3. Click **Authorize** (top right) and paste: \`Bearer <token>\`

## Base URL
All requests go through the API Gateway at **http://localhost:3000**

## Financial Flow Architecture
\`\`\`
Frontend → API Gateway (port 3000)
           ├── /auth/*          → Auth Service (3001)   [Users, Customers, GL, Upload]
           ├── /customers/*     → Auth Service (3001)   [Drivers, Riders, Partners]
           ├── /upload/*        → Auth Service (3001)   [Cloudinary/S3 adapter]
           ├── /analytics/*     → Auth Service (3001)   [Dashboard metrics, Charts]
           ├── /ledger/*        → Ledger Service (3003) [GL Accounts, Postings]
           ├── /payments/*      → Payment Service (3006)[Payment processing]
           ├── /accounts/*      → Accounts Service (3005)[Customer accounts]
           ├── /approval/*      → Approval Service (3004)[Maker-checker workflows]
           ├── /rbac/*          → RBAC Service (3002)   [Roles & Permissions]
           ├── /reversal/*      → Reversal Service (3008)[Reversals & chargebacks]
           ├── /loan-products   → Loan Service (3013)   [Loan products]
           ├── /loan-applications → Loan Service (3013) [Loan applications]
           ├── /kyc/*           → KYC Service (3010)    [Identity verification]
           ├── /aml-rules       → Compliance Service (3011) [AML rules]
           ├── /monitor         → Compliance Service (3011) [Transaction screening]
           ├── /sars            → Compliance Service (3011) [SAR filing]
           ├── /customer-accounts/* → Customer Service (3014)[Customer accounts]
           ├── /wallet/*        → Wallet Service (3015) [Wallets, earnings, savings]
           └── /batch/*         → Batch Service (3007)  [Batch jobs]
\`\`\`

## Double-Entry Accounting
Every financial event generates balanced debit/credit ledger entries.
GL account codes follow this structure:
- **1xxx** — Assets (Cash, Receivables, Escrow)
- **2xxx** — Liabilities (Driver Payable, Customer Wallet Liability)
- **4xxx** — Income (Platform Revenue, Commission, Subscriptions)
- **5xxx** — Expenses (Driver Payout, Swap Cost)

## Seeded Credentials
| Role | Email | Password | Tenant |
|------|-------|----------|--------|
| Root Admin | admin@queensos.com | Admin@123456 | root-admin |
| Tenant Admin | admin@tenant-001.com | Admin@123456 | tenant-001 |
| Account Officer | finance@tenant-001.com | Finance@123456 | tenant-001 |
| Staff | user@tenant-001.com | User@123456 | tenant-001 |
    `)
    .setVersion('2.0.0')
    .setContact('Queens OS Engineering', 'https://queensos.com', 'engineering@queensos.com')
    .setLicense('Proprietary', 'https://queensos.com/license')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Paste your JWT access_token here (without "Bearer " prefix)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer(`http://localhost:${process.env.PORT || 3000}`)
    .addTag('Authentication', 'Login, register, MFA, OTP, password reset, token refresh')
    .addTag('OAuth 2.0', 'OAuth 2.0 authorization code flow, client credentials, token introspection')
    .addTag('System', 'Health checks and service status')
    .addTag('Customers', 'All customer types: drivers, riders, ecosystem partners — full CRUD + lifecycle')
    .addTag('Drivers', 'Individual drivers and corporate fleet drivers — onboarding, vetting, document upload')
    .addTag('Partners', 'Ecosystem partners: banks, telecoms, fleet operators, fintechs, individual financiers')
    .addTag('Tenant Management', 'Tenant (subscriber) registration, suspension, activation, plan management')
    .addTag('User Management', 'Platform users: root_admin, tenant_admin, account_officer, staff — invite & manage')
    .addTag('Account Officers', 'Elevated financial/legal staff — financial operations, KYC, compliance')
    .addTag('General Ledger', 'Chart of accounts (GL), journal entries, balance queries, posting history')
    .addTag('Payments', 'Payment initiation, capture, settlement, fee distribution, idempotent processing')
    .addTag('Account Management', 'Customer bank accounts, balance, KYC limits, PND/PNC restrictions')
    .addTag('Approvals', 'Maker-checker approval workflows for high-value operations')
    .addTag('Reversals', 'Full/partial reversal, chargebacks, reversal history')
    .addTag('Batch Operations', 'Bulk payment processing, scheduled settlements, batch job management')
    .addTag('Loans', 'Loan origination, repayment schedules, amortization, delinquency tracking')
    .addTag('Analytics', 'Real-time KPI dashboard, revenue charts, driver/customer/partner metrics from GL')
    .addTag('RBAC', 'Role-based access control, permission sets, policy evaluation (ABAC)')
    .addTag('File Upload', 'Document upload via Cloudinary (default) or AWS S3 adapter — driver docs, KYC files')
    .addTag('Scope Management', 'Fine-grained scope assignment per user/tenant for API access control')
    .addTag('Tenant Settings', 'Per-tenant configuration: currency, commission rates, feature flags')
    .addTag('Wallet', 'Wallets, transfers, funding, withdrawals, QCoin exchange')
    .addTag('Driver Earnings', 'Driver earnings recording, payout, summary')
    .addTag('Driver Savings', 'Savings plans, contributions, early withdrawal')
    .addTag('Partner Settlements', 'Partner settlement creation, settlement, balance')
    .addTag('Remittance', 'Remittance scheduling, processing, admin override')
    .addTag('Driver Debt', 'Driver debt tracking, threshold, settlement')
    .addTag('Driver Ledger', 'Driver ledger entries, running balance')
    .addTag('Fraud Detection', 'Fraud flagging, evaluation, review')
    .addTag('Disputes', 'Payment dispute creation, listing, resolution')
    .addTag('Compliance', 'AML rules, transaction monitoring, SAR filing')
    .addTag('KYC', 'KYC records, identity verification (BVN/NIN), liveness check')
    .addTag('Customer Accounts', 'Customer account CRUD with tenant isolation')
    .addTag('Loan Products', 'Loan product configuration with provisioning rates')
    .addTag('Loan Applications', 'Loan application lifecycle')
    .addTag('Loan Accounts', 'Loan account management, accrual, repayment')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ── Swagger Auth Overlay ─────────────────────────────────────────────
  // Protect /api/docs with a login page. Unauthenticated users are shown
  // a login form instead of the Swagger UI. Set SWAGGER_PASSWORD env var.
  const swaggerPassword = process.env.SWAGGER_PASSWORD || 'admin';
  function getCookie(req: any, name: string): string | undefined {
    const raw = req.headers?.cookie;
    if (!raw) return undefined;
    return raw.split(';').map((c: string) => c.trim()).find((c: string) => c.startsWith(name + '='))?.slice(name.length + 1);
  }
  expressApp.use('/api/docs', (req: any, res: any, next: any) => {
    if (req.path.includes('swagger-ui') || req.path.includes('oauth2')) {
      return next();
    }
    if (req.path === '/login' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: string) => body += chunk);
      req.on('end', () => {
        const params = new URLSearchParams(body);
        if (params.get('password') === swaggerPassword) {
          res.setHeader('Set-Cookie', 'swagger_session=authenticated; Path=/api/docs; HttpOnly; SameSite=Lax; Max-Age=86400');
          return res.redirect('/api/docs');
        }
        return res.redirect('/api/docs/login?error=1');
      });
      return;
    }
    if (getCookie(req, 'swagger_session') === 'authenticated') return next();
    if (req.path === '/login') return next();
    res.redirect('/api/docs/login');
  });
  // Serve a styled login page at /api/docs/login
  expressApp.get('/api/docs/login', (_req: any, res: any) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Docs Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1e293b; border-radius: 12px; padding: 40px; width: 360px; box-shadow: 0 25px 50px rgba(0,0,0,.5); }
    h1 { color: #f1f5f9; font-size: 22px; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    input { width: 100%; padding: 12px 16px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #f1f5f9; font-size: 14px; outline: none; }
    input:focus { border-color: #3b82f6; }
    button { width: 100%; padding: 12px; background: #3b82f6; border: none; border-radius: 8px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 16px; }
    button:hover { background: #2563eb; }
    .error { color: #ef4444; font-size: 13px; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>API Documentation</h1>
    <p>Enter the password to access Swagger UI</p>
    <form method="POST" action="/api/docs/login">
      <input type="password" name="password" placeholder="Password" autofocus>
      <button type="submit">Login</button>
    </form>
    ${_req.query.error ? '<div class="error">Incorrect password</div>' : ''}
  </div>
</body>
</html>`);
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showRequestHeaders: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
    },
    customSiteTitle: 'Queens OS API Docs',
    customfavIcon: 'https://res.cloudinary.com/questence/image/upload/v1/queens-os/logo.png',
  });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  logger.log(`API running on http://localhost:${process.env.PORT || 3000}`);
  logger.log(`Swagger UI at http://localhost:${process.env.PORT || 3000}/api/docs`);

  // ──────────────────────────────────────────────────────────────────────────
  // Aggregrate downstream OpenAPI specs into the gateway's Swagger document
  // ──────────────────────────────────────────────────────────────────────────
  const configService = app.get(ConfigService);

  const downstreamServices = [
    { name: 'Auth Service',        host: configService.get('AUTH_SERVICE_HOST', 'localhost'),    port: configService.get('AUTH_SERVICE_PORT', 3001) },
    { name: 'Ledger Service',      host: configService.get('LEDGER_SERVICE_HOST', 'localhost'),  port: configService.get('LEDGER_SERVICE_PORT', 3003) },
    { name: 'Payment Service',     host: configService.get('PAYMENT_SERVICE_HOST', 'localhost'), port: configService.get('PAYMENT_SERVICE_PORT', 3006) },
    { name: 'Accounts Service',    host: configService.get('ACCOUNTS_SERVICE_HOST', 'localhost'),port: configService.get('ACCOUNTS_SERVICE_PORT', 3005) },
    { name: 'RBAC Service',        host: configService.get('RBAC_SERVICE_HOST', 'localhost'),    port: configService.get('RBAC_SERVICE_PORT', 3002) },
    { name: 'Approval Service',    host: configService.get('APPROVAL_SERVICE_HOST', 'localhost'),port: configService.get('APPROVAL_SERVICE_PORT', 3004) },
    { name: 'Loan Service',        host: configService.get('LOAN_SERVICE_HOST', 'localhost'),    port: configService.get('LOAN_SERVICE_PORT', 3013) },
    { name: 'Compliance Service',  host: configService.get('COMPLIANCE_SERVICE_HOST', 'localhost'),port: configService.get('COMPLIANCE_SERVICE_PORT', 3011) },
    { name: 'KYC Service',         host: configService.get('KYC_SERVICE_HOST', 'localhost'),     port: configService.get('KYC_SERVICE_PORT', 3010) },
    { name: 'Reversal Service',    host: configService.get('REVERSAL_SERVICE_HOST', 'localhost'), port: configService.get('REVERSAL_SERVICE_PORT', 3008) },
    { name: 'Customer Service',    host: configService.get('CUSTOMER_SERVICE_HOST', 'localhost'), port: configService.get('CUSTOMER_SERVICE_PORT', 3014) },
    { name: 'Wallet Service',     host: configService.get('WALLET_SERVICE_HOST', 'localhost'),   port: configService.get('WALLET_SERVICE_PORT', 3015) },
    { name: 'Batch Service',       host: configService.get('BATCH_SERVICE_HOST', 'localhost'),   port: configService.get('BATCH_SERVICE_PORT', 3007) },
  ];

  logger.log('Aggregating Swagger specs from downstream services...');

  for (const svc of downstreamServices) {
    const spec = await fetchSpec(svc.host, svc.port);
    if (spec) {
      mergeSpec(document, spec);
      logger.log(`  ✓ ${svc.name} merged`);
    } else {
      logger.warn(`  ✗ ${svc.name} — spec not available (service may be starting or down)`);
    }
  }

  // Patch swagger examples with real working values for "Try it yourself"
  function patchSwaggerExamples(doc: Record<string, any>) {
    const REAL: Record<string, string> = {
      'trip-uuid': 'TRIP-001',
      'cust-uuid': 'root-admin',
      'driver-uuid': 'root-admin',
      'rider-uuid': 'root-admin',
      'paystack-ref-uuid': 'paystack-ref-001',
      'tenant-001': 'root-admin',
      'user-001': 'root-admin',
      'gl-uuid': 'GL-001',
      'wallet-uuid': 'root-admin',
      'customer-uuid': 'root-admin',
    };

    function walk(obj: any): any {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(walk);

      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string') {
          for (const [placeholder, replacement] of Object.entries(REAL)) {
            if (val.includes(placeholder)) {
              (obj as any)[key] = val.replace(new RegExp(placeholder, 'g'), replacement);
            }
          }
        } else if (typeof val === 'object') {
          walk(val);
        }
      }
      return obj;
    }

    // Patch schema examples in components
    if (doc.components?.schemas) {
      for (const [name, schema] of Object.entries(doc.components.schemas) as any) {
        if (schema.example) walk(schema.example);
        if (schema.properties) {
          for (const prop of Object.values(schema.properties) as any) {
            if (prop.example) {
              prop.example = typeof prop.example === 'string'
                ? REAL[prop.example] || prop.example
                : prop.example;
            }
          }
        }
      }
    }

    // Patch requestBody examples in paths
    if (doc.paths) {
      for (const methods of Object.values(doc.paths) as any) {
        for (const spec of Object.values(methods) as any) {
          if (spec.requestBody?.content?.['application/json']?.schema?.example) {
            walk(spec.requestBody.content['application/json'].schema.example);
          }
        }
      }
    }
  }
  patchSwaggerExamples(document);

  // Re-register Swagger UI with the aggregated document
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showRequestHeaders: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
    },
    customSiteTitle: 'Queens OS API Docs',
    customfavIcon: 'https://res.cloudinary.com/questence/image/upload/v1/queens-os/logo.png',
  });

  const totalRoutes = Object.keys(document.paths).length;
  logger.log(`Swagger updated — ${totalRoutes} total routes from ${downstreamServices.length} downstream services`);
}
void bootstrap();
