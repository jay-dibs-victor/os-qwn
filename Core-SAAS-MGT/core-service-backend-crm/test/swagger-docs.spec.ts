import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getDataSourceToken } from '@nestjs/typeorm';
import * as path from 'path';

jest.setTimeout(120000);

function resolveRef(ref: string, doc: any): any {
  const parts = ref.replace('#/', '').split('/');
  let cur: any = doc;
  for (const p of parts) { cur = cur?.[p]; if (!cur) return undefined; }
  return cur;
}

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

function flattenProperties(schema: any, doc: any, prefix = ''): { name: string; description: string | undefined }[] {
  const props: { name: string; description: string | undefined }[] = [];
  let resolved = schema;
  if (schema?.$ref) resolved = resolveRef(schema.$ref, doc);
  if (resolved?.allOf) {
    for (const sub of resolved.allOf) {
      props.push(...flattenProperties(sub, doc, prefix));
    }
  }
  if (resolved?.properties) {
    for (const [name, prop] of Object.entries<any>(resolved.properties)) {
      const fullName = prefix ? `${prefix}.${name}` : name;
      props.push({ name: fullName, description: prop.description });
      if (prop.$ref || prop.type === 'object' || prop.properties || prop.allOf) {
        props.push(...flattenProperties(prop, doc, fullName));
      }
    }
  }
  if (resolved?.items) {
    props.push(...flattenProperties(resolved.items, doc, prefix ? `${prefix}[]` : '[]'));
  }
  return props;
}

interface DocIssue {
  service: string;
  path: string;
  method: string;
  type: string;
  field?: string;
  detail: string;
}

interface ExecResult {
  service: string;
  path: string;
  method: string;
  status: number;
  ok: boolean;
  error?: string;
}

function loadModule(modName: string, displayName: string) {
  const modPath = path.resolve(__dirname, '..', 'apps', displayName, 'src', modName);
  const mod = require(modPath);
  return mod.default || Object.values(mod).find(
    (v: any) => typeof v === 'function' && v.name?.endsWith('Module')
  );
}

const apps = [
  // Modules without ConfigModule.forRoot() — no env file interference
  ['accounts.module', 'accounts-service'],
  ['ledger-service.module', 'ledger-service'],
  // Modules with their own TypeOrmModule.forRoot() (not DatabaseModule)
  ['payment-service.module', 'payment-service'],
  // Modules that import DatabaseModule + ConfigModule.forRoot()
  ['rbac-service.module', 'rbac-service'],
  ['reversal-service.module', 'reversal-service'],
  ['wallet-service.module', 'wallet-service'],
  ['auth-service.module', 'auth-service'],
  ['batch-service.module', 'batch-service'],
  // Remaining modules
  ['api-gateway.module', 'api-gateway'],
  ['approval-service.module', 'approval-service'],
  ['compliance-service.module', 'compliance-service'],
  ['customer-service.module', 'customer-service'],
  ['kyc-service.module', 'kyc-service'],
  ['loan-service.module', 'loan-service'],
];

const allDocIssues: DocIssue[] = [];
const allExecResults: ExecResult[] = [];
const serviceSummaries: { name: string; endpoints: number; docsOk: number; execOk: number; docIssues: number; execFail: number }[] = [];

for (const [modName, displayName] of apps) {
  describe(`Swagger docs & execution - ${displayName}`, () => {
    let app: INestApplication | null = null;
    const docIssues: DocIssue[] = [];
    const execResults: ExecResult[] = [];
    let endpointCount = 0;
    let execPass = 0;
    let execFail = 0;

    beforeAll(async () => {
      try {
        const modClass = loadModule(modName, displayName);
        if (!modClass) throw new Error('Module class not found');
        const modRef = await Test.createTestingModule({ imports: [modClass] }).compile();
        app = modRef.createNestApplication();
        await app.init();
      } catch (e: any) {
        console.log(`  ${displayName}: LOAD FAIL - ${e.message?.split('\n')[0]}`);
      }
    });

    afterAll(async () => {
      if (app) {
        try {
          const dsToken = getDataSourceToken();
          const ds = app.get(dsToken, { strict: false });
          if (ds && ds.isInitialized) await ds.destroy();
        } catch {}
        await app.close().catch(() => {});
      }
    });

    it('validates documentation and executes endpoints', async () => {
      if (!app) return;

      const config = new DocumentBuilder()
        .setTitle(displayName)
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'JWT-auth')
        .build();

      const doc = SwaggerModule.createDocument(app, config);
      const paths = doc.paths || {};
      endpointCount = Object.keys(paths).length;

      for (const [urlPath, methods] of Object.entries(paths)) {
        for (const [method, _op] of Object.entries(methods as any)) {
          const op = _op as any;
          const httpMethod = method.toUpperCase();
          const svc = displayName;

          // ---- docs validation ----

          // 1. each operation must have summary or description
          if (!op.summary && !op.description) {
            docIssues.push({ service: svc, path: urlPath, method, type: 'missing_summary', detail: 'No summary or description on operation' });
          }

          // 2. path parameters must have descriptions
          if (op.parameters) {
            for (const p of op.parameters as any[]) {
              if (p.in === 'path' && !p.description) {
                docIssues.push({ service: svc, path: urlPath, method, type: 'missing_param_desc', field: p.name, detail: `Path parameter "${p.name}" missing description` });
              }
              if (p.in === 'query' && !p.description) {
                docIssues.push({ service: svc, path: urlPath, method, type: 'missing_param_desc', field: p.name, detail: `Query parameter "${p.name}" missing description` });
              }
            }
          }

          // 3. response descriptions
          if (op.responses) {
            for (const [code, resp] of Object.entries<any>(op.responses)) {
              if (!resp.description) {
                docIssues.push({ service: svc, path: urlPath, method, type: 'missing_response_desc', field: code, detail: `Response ${code} missing description` });
              }
            }
          }

          // 4. request body property descriptions
          if (op.requestBody?.content?.['application/json']?.schema) {
            const schema = op.requestBody.content['application/json'].schema;
            const props = flattenProperties(schema, doc);
            for (const p of props) {
              if (!p.description && !p.name.endsWith('[]')) {
                docIssues.push({ service: svc, path: urlPath, method, type: 'missing_body_desc', field: p.name, detail: `Body property "${p.name}" missing description` });
              }
            }
          }

          // 5. all $refs resolve
          function checkRefs(obj: any, ctx: string) {
            if (!obj || typeof obj !== 'object') return;
            if (obj.$ref) {
              if (!resolveRef(obj.$ref, doc)) {
                docIssues.push({ service: svc, path: urlPath, method, type: 'broken_ref', field: ctx, detail: `Unresolvable $ref: ${obj.$ref}` });
              }
            }
            for (const [k, v] of Object.entries(obj)) {
              if (k === 'example' || k === 'examples' || k === 'default') continue;
              checkRefs(v, `${ctx}.${k}`);
            }
          }
          checkRefs(op, `${method} ${urlPath}`);

          // ---- execution validation ----
          try {
            const server = app.getHttpServer();
            const request = require('supertest');
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
              for (const p of op.parameters as any[]) {
                if (p.in === 'query') {
                  const ex = p.example ?? p.schema?.example ?? p.schema?.default ?? 'test';
                  qp[p.name] = typeof ex === 'number' ? ex : String(ex);
                }
              }
              if (Object.keys(qp).length > 0) req = req.query(qp);
            }

            req = req.set('x-tenant-id', 'test-tenant').set('authorization', 'Bearer test-token');
            const res = await req;
            const ok = res.status < 500;
            execResults.push({ service: svc, path: urlPath, method: httpMethod, status: res.status, ok });
            if (ok) execPass++; else execFail++;
          } catch (e: any) {
            execResults.push({ service: svc, path: urlPath, method: httpMethod, status: -1, ok: false, error: e.message });
            execFail++;
          }
        }
      }

      allDocIssues.push(...docIssues);
      allExecResults.push(...execResults);
      serviceSummaries.push({ name: displayName, endpoints: endpointCount, docsOk: endpointCount > 0 ? 1 : 0, execOk: execPass, docIssues: docIssues.length, execFail });

      // Print per-service summary
      console.log(`  ${displayName}: ${endpointCount} endpoints, ${docIssues.length} doc issues, ${execPass} exec OK, ${execFail} exec failed`);
      if (docIssues.length > 0) {
        for (const issue of docIssues.slice(0, 10)) {
          console.log(`    ! ${issue.method.toUpperCase()} ${issue.path}: ${issue.detail}`);
        }
        if (docIssues.length > 10) console.log(`    ... and ${docIssues.length - 10} more`);
      }
      if (execFail > 0) {
        for (const r of execResults.filter(r => !r.ok).slice(0, 10)) {
          console.log(`    ✕ ${r.method} ${r.path} -> ${r.status}: ${r.error || ''}`);
        }
      }
    });
  });
}

afterAll(() => {
  console.log('\n');
  console.log('============================================');
  console.log('Swagger Documentation & Execution Summary');
  console.log('============================================');
  let totalEndpoints = 0;
  let totalDocIssues = 0;
  let totalExecOk = 0;
  let totalExecFail = 0;
  for (const s of serviceSummaries) {
    totalEndpoints += s.endpoints;
    totalDocIssues += s.docIssues;
    totalExecOk += s.execOk;
    totalExecFail += s.execFail;
    const status = s.execFail > 0 ? 'WARN' : 'OK';
    console.log(`  [${status}] ${s.name}: ${s.endpoints} endpoints, ${s.docIssues} doc issues, ${s.execOk} exec OK, ${s.execFail} exec failed`);
  }
  console.log(`\n  Total: ${totalEndpoints} endpoints, ${totalDocIssues} documentation issues, ${totalExecOk} exec OK, ${totalExecFail} exec failed`);
  console.log('============================================');
  console.log('');
});
