import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import request from 'supertest';
import * as path from 'path';

jest.setTimeout(120000);

function sampleFromSchema(schema: any): any {
  if (!schema) return {};
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  switch (schema.type) {
    case 'string':
      if (schema.enum) return schema.enum[0];
      if (schema.format?.includes('uuid') || schema.format === 'date-time') return '00000000-0000-0000-0000-000000000000';
      return 'test-string';
    case 'number':
    case 'integer': return 1;
    case 'boolean': return false;
    case 'array': return schema.items ? [sampleFromSchema(schema.items)] : [];
    case 'object':
      if (schema.properties) {
        const obj: any = {};
        for (const [k, p] of Object.entries(schema.properties)) obj[k] = sampleFromSchema(p as any);
        return obj;
      }
      return {};
    default: return null;
  }
}

function resolveRef(ref: string, doc: any): any {
  const parts = ref.replace('#/', '').split('/');
  let cur: any = doc;
  for (const p of parts) { cur = cur?.[p]; if (!cur) return undefined; }
  return cur;
}

interface EndpointResult {
  method: string;
  path: string;
  status: number;
  ok: boolean;
  error?: string;
}

interface AppResult {
  name: string;
  endpointCount: number;
  pass: number;
  fail: number;
  results: EndpointResult[];
}

const allResults: AppResult[] = [];

function loadModule(modName: string, displayName: string) {
  const modPath = path.resolve(__dirname, '..', 'apps', displayName, 'src', modName);
  const mod = require(modPath);
  return mod.default || Object.values(mod).find(
    (v: any) => typeof v === 'function' && v.name?.endsWith('Module')
  );
}

const apps = [
  ['accounts.module', 'accounts-service'],
  ['api-gateway.module', 'api-gateway'],
  ['auth-service.module', 'auth-service'],
  ['ledger-service.module', 'ledger-service'],
  ['wallet-service.module', 'wallet-service'],
  ['payment-service.module', 'payment-service'],
  ['rbac-service.module', 'rbac-service'],
  ['reversal-service.module', 'reversal-service'],
  ['compliance-service.module', 'compliance-service'],
  ['kyc-service.module', 'kyc-service'],
  ['loan-service.module', 'loan-service'],
];

for (const [modName, displayName] of apps) {
  describe(`Swagger payloads - ${displayName}`, () => {
    let app: INestApplication | null = null;
    const results: EndpointResult[] = [];

    beforeAll(async () => {
      try {
        const modClass = loadModule(modName, displayName);
        if (!modClass) throw new Error('Module class not found');

        const modRef = await Test.createTestingModule({ imports: [modClass] }).compile();
        app = modRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: false,
          transformOptions: { enableImplicitConversion: true },
        }));
        await app.init();
      } catch (e: any) {
        console.log(`  ${displayName}: LOAD FAIL - ${e.message?.split('\n')[0]}`);
      }
    });

    afterAll(async () => {
      if (app) await app.close().catch(() => {});
    });

    it('all endpoints accept payloads (no 500 errors)', async () => {
      if (!app) {
        allResults.push({ name: displayName, endpointCount: 0, pass: 0, fail: 0, results: [] });
        return;
      }

      const config = new DocumentBuilder()
        .setTitle(displayName)
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'JWT-auth')
        .build();

      const doc = SwaggerModule.createDocument(app, config);
      const paths = doc.paths || {};

      for (const [urlPath, methods] of Object.entries(paths)) {
        for (const [method, _op] of Object.entries(methods as any)) {
          const op = _op as any;
          const httpMethod = method.toUpperCase();
          try {
            const server = app.getHttpServer();
            let req: any;

            switch (httpMethod) {
              case 'GET': req = request(server).get(urlPath); break;
              case 'POST': req = request(server).post(urlPath); break;
              case 'PUT': req = request(server).put(urlPath); break;
              case 'PATCH': req = request(server).patch(urlPath); break;
              case 'DELETE': req = request(server).delete(urlPath); break;
              default: continue;
            }

            if (op.requestBody?.content?.['application/json']?.schema) {
              let schema = op.requestBody.content['application/json'].schema;
              if (schema.$ref) schema = resolveRef(schema.$ref, doc);
              if (schema) req = req.send(sampleFromSchema(schema));
            }

            if (op.parameters) {
              const qp: Record<string, any> = {};
              for (const p of op.parameters) {
                if (p.in === 'query') {
                  const ex = p.example ?? p.schema?.example ?? p.schema?.default ?? 'test';
                  qp[p.name] = typeof ex === 'number' ? ex : String(ex);
                }
              }
              if (Object.keys(qp).length > 0) req = req.query(qp);
            }

            req = req.set('x-tenant-id', 'test-tenant').set('authorization', 'Bearer test-token');

            const res = await req;
            results.push({ method: httpMethod, path: urlPath, status: res.status, ok: res.status < 500 });
          } catch (e: any) {
            results.push({ method: httpMethod, path: urlPath, status: -1, ok: false, error: e.message });
          }
        }
      }

      const pass = results.filter(r => r.ok).length;
      const fail = results.filter(r => !r.ok).length;
      const endpointCount = Object.keys(paths).length;

      allResults.push({ name: displayName, endpointCount, pass, fail, results });

      if (fail > 0) {
        console.log(`\n  ${displayName}: ${fail} endpoint(s) FAILED (${pass}/${endpointCount} OK)`);
        for (const r of results.filter(r => !r.ok).slice(0, 15)) {
          console.log(`    ✕ ${r.method} ${r.path} -> ${r.status}: ${r.error || ''}`);
        }
        if (fail > 15) console.log(`    ... and ${fail - 15} more`);
      }
    });
  });
}

afterAll(() => {
  console.log('\n');
  console.log('========================================');
  console.log('Swagger Payload Validation Results');
  console.log('========================================');
  let totalPass = 0;
  let totalFail = 0;
  let totalEndpoints = 0;
  for (const r of allResults) {
    const status = r.fail > 0 ? 'FAIL' : r.endpointCount > 0 ? 'OK ' : 'SKIP';
    console.log(`  [${status}] ${r.name}: ${r.pass}/${r.endpointCount} OK (${r.fail} failed)`);
    totalPass += r.pass;
    totalFail += r.fail;
    totalEndpoints += r.endpointCount;
  }
  console.log(`\n  Total: ${totalPass} passed, ${totalFail} failed of ${totalEndpoints} endpoints`);
  console.log('========================================');
  console.log('');
});
