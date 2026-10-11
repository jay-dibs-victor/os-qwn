/*
  Generates OpenAPI JSON files for each NestJS application under apps/.
  Run with: `ts-node -r tsconfig-paths/register scripts/generate-swagger.ts`
*/
import fs from 'fs';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

console.log('Generating OpenAPI specs...');

function resolveAppModulePath(appName: string) {
  const srcDir = path.resolve(__dirname, '..', 'apps', appName, 'src');
  if (!fs.existsSync(srcDir)) return null;
  const files = fs.readdirSync(srcDir);
  const moduleFiles = files.filter((f) => /\.module\.(ts|js)$/.test(f));
  if (moduleFiles.length === 0) return null;
  const preferred = moduleFiles.find((f) => f.toLowerCase() === `${appName}.module.ts` || f.toLowerCase() === `${appName}.module.js`);
  const picked = preferred ?? moduleFiles[0];
  return path.resolve(srcDir, picked).replace(/\.(ts|js)$/, '');
}

async function generateForApp(appName: string) {
  const modulePath = resolveAppModulePath(appName);
  if (!modulePath) {
    console.warn(`Skipping ${appName}: no *.module.ts found under apps/${appName}/src`);
    return { appName, ok: true, skipped: true as const };
  }

  try {
    console.log(`- using module: ${modulePath}`);
    // dynamic import of the module file (ts-node will handle .ts)
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const mod = require(modulePath);
    console.log(`- module loaded: ${appName}`);
    const exported = Object.values(mod).find((v: any) => typeof v === 'function' && /Module$/.test(v.name));
    if (!exported) {
      console.warn(`Skipping ${appName}: no exported Module class found in ${modulePath}`);
      return { appName, ok: true, skipped: true as const };
    }

    console.log(`- creating nest app: ${appName}`);
    const app = await NestFactory.create(exported as any, { logger: false });
    console.log(`- nest app created: ${appName}`);

    const docBuilder = new DocumentBuilder()
      .setTitle(`${appName} API`)
      .setDescription(`${appName} generated OpenAPI spec`)
      .setVersion('1.0.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth');

    const document = SwaggerModule.createDocument(app, docBuilder.build());

    const outDir = path.resolve(__dirname, '..', 'docs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${appName}.openapi.json`);
    fs.writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf8');
    console.log(`Wrote OpenAPI for ${appName} -> ${outFile}`);

    await app.close();
    return { appName, ok: true, skipped: false as const };
  } catch (err) {
    console.error(`Error generating for ${appName}:`, err instanceof Error ? err.message : err);
    return { appName, ok: false, skipped: false as const };
  }
}

async function main() {
  const appsDir = path.resolve(__dirname, '..', 'apps');
  const entries = fs.readdirSync(appsDir, { withFileTypes: true });
  const apps = entries.filter((e) => e.isDirectory()).map((d) => d.name);

  let hadErrors = false;
  for (const a of apps) {
    // only handle known NestJS apps - skip anything without src/main.ts
    const mainTs = path.join(appsDir, a, 'src', 'main.ts');
    if (!fs.existsSync(mainTs)) {
      console.warn(`Skipping ${a}: no src/main.ts found`);
      continue;
    }
    console.log(`Generating for ${a}...`);
    const res = await generateForApp(a);
    if (res && !res.ok) hadErrors = true;
  }

  process.exitCode = hadErrors ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
