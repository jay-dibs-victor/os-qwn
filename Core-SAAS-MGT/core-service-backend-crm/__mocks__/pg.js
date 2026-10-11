const { newDb } = require('pg-mem');

function registerFunctions(db) {
  db.public.registerFunction({
    name: 'version',
    args: [],
    returns: 'text',
    implementation: () => 'PostgreSQL 16.0 on x86_64-pc-linux-gnu',
  });
  db.public.registerFunction({
    name: 'current_schema',
    args: [],
    returns: 'text',
    implementation: () => 'public',
  });
  db.public.registerFunction({
    name: 'current_database',
    args: [],
    returns: 'text',
    implementation: () => 'testdb',
  });
  db.public.registerFunction({
    name: 'uuid_generate_v4',
    args: [],
    returns: 'uuid',
    implementation: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }),
  });
  db.public.registerFunction({
    name: 'replace',
    args: ['text', 'text', 'text'],
    returns: 'text',
    implementation: (str, from, to) => str.split(from).join(to),
  });
  return db;
}

function createFreshPg() {
  const db = registerFunctions(newDb());
  return db.adapters.createPg();
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Intercept INSERT ... VALUES (DEFAULT, ...) and replace DEFAULT for "id" column
// with a fresh UUID, because pg-mem caches uuid_generate_v4() at DDL time.
// Also handles multi-row INSERTs (e.g., VALUES (...), (...)).
function patchDefaultUuidInInsert(sql, params) {
  if (!/^INSERT\s+INTO\s+"\w+"\s*\(/i.test(sql)) return null;
  if (!sql.includes('DEFAULT')) return null;

  const match = sql.match(
    /^INSERT\s+INTO\s+"(\w+)"\s*\(([^)]+)\)\s*VALUES\s+/i
  );
  if (!match) return null;

  const columns = match[2].split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
  const idIndex = columns.indexOf('id');
  if (idIndex === -1) return null;

  // Extract all value groups: (...), (...), ...
  const valuesPart = sql.slice(match.index + match[0].length);
  // value groups are parenthesized and comma-separated outside parens
  const valueGroups = [];
  let depth = 0;
  let current = '';
  for (const ch of valuesPart) {
    if (ch === '(' && depth === 0) {
      current = '';
      depth++;
    } else if (ch === '(') {
      current += ch;
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) {
        valueGroups.push(current);
        current = '';
      } else {
        current += ch;
      }
    } else if (depth > 0) {
      current += ch;
    }
  }

  let modified = false;
  const newGroups = valueGroups.map((group) => {
    const values = group.split(',').map((v) => v.trim());
    if (idIndex < values.length && values[idIndex] === 'DEFAULT') {
      values[idIndex] = `'${generateUUID()}'::uuid`;
      modified = true;
    }
    return `(${values.join(', ')})`;
  });

  if (!modified) return null;

  // Find where the LAST value group ends (after all top-level paren groups)
  let endOfGroups = 0;
  depth = 0;
  for (let i = 0; i < valuesPart.length; i++) {
    const ch = valuesPart[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) {
        endOfGroups = i + 1;
        // DON'T break — keep scanning to find the last group
      }
    }
  }
  const afterValues = valuesPart.slice(endOfGroups);
  const newSql =
    sql.slice(0, match.index + match[0].length) + newGroups.join(', ') + afterValues;

  return { sql: newSql, params };
}

function noopClientEventHandlers(client) {
  const handlers = {};
  const noop = () => {};
  client.on = (event, handler) => {
    if (!handlers[event]) handlers[event] = [];
    handlers[event].push(handler);
    return client;
  };
  client.addListener = client.on;
  client.removeListener = (event, handler) => {
    if (handlers[event]) {
      handlers[event] = handlers[event].filter(h => h !== handler);
    }
    return client;
  };
  client.listeners = (event) => handlers[event] || [];
  client.emit = (event, ...args) => {
    if (handlers[event]) {
      handlers[event].forEach(h => h(...args));
    }
    return true;
  };
  client.once = (event, handler) => {
    const wrapper = (...args) => {
      client.removeListener(event, wrapper);
      handler(...args);
    };
    client.on(event, wrapper);
    return client;
  };
  client.eventNames = () => Object.keys(handlers);
  client.listenerCount = (event) => (handlers[event] || []).length;
  return client;
}

function normalizeResult(result) {
  return result;
}

function wrapQuery(origQuery) {
  return function wrappedQuery(...args) {
    const sql = typeof args[0] === 'string' ? args[0] : args[0]?.text;

    if (!sql) {
      const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
      const result = { rows: [], fields: [] };
      if (cb) { cb(null, result); return undefined; }
      return Promise.resolve(result);
    }

    const normalized = sql.replace(/\s+/g, ' ').trim();

    // Intercept information_schema and pg_catalog queries — return empty
    // TypeORM uses these to introspect the database; most are missing in pg-mem
    if (
      normalized.includes('"information_schema"') ||
      normalized.includes('information_schema.') ||
      normalized.includes('pg_catalog.')
    ) {
      const result = { rows: [], fields: [] };
      const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
      if (cb) { cb(null, result); return undefined; }
      return Promise.resolve(result);
    }

    // Intercept pg_* system catalog table queries
    if (/FROM\s+"?pg_/.test(normalized)) {
      const result = { rows: [], fields: [] };
      const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
      if (cb) { cb(null, result); return undefined; }
      return Promise.resolve(result);
    }

    // Intercept SET TRANSACTION queries (pg-mem doesn't support them)
    if (/^SET\s+TRANSACTION/i.test(normalized)) {
      const result = { rows: [], fields: [] };
      const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
      if (cb) { cb(null, result); return undefined; }
      return Promise.resolve(result);
    }

    // Patch INSERT queries: replace DEFAULT for "id" column with fresh UUID
    // because pg-mem caches uuid_generate_v4() at DDL time (IMMUTABLE behavior).
    let params = null;
    if (typeof args[0] === 'object' && args[0] !== null) {
      params = args[0].values || args[0].parameters || [];
      if (typeof args[0].text === 'string') {
        const patched = patchDefaultUuidInInsert(args[0].text, params);
        if (patched) {
          args[0] = { ...args[0], text: patched.sql, values: patched.params };
        }
      }
    } else if (typeof args[0] === 'string') {
      params = Array.isArray(args[1]) ? args[1] : [];
      const patched = patchDefaultUuidInInsert(args[0], params);
      if (patched) {
        args[0] = patched.sql;
        if (Array.isArray(args[1])) args[1] = patched.params;
      }
    }

    // Execute via pg-mem, catch "already exists" errors
    const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;

    const handleError = (err) => {
      if (
        err?.message?.includes?.('already exists') &&
        /^CREATE\s+(TYPE|TABLE|INDEX|SEQUENCE|VIEW)\s/i.test(sql.trim())
      ) {
        return { rows: [], fields: [] };
      }
      if (err?.message?.includes?.('cannot cast type text to uuid')) {
        return { rows: [], fields: [] };
      }
      throw err;
    };

    try {
      const result = origQuery.apply(this, args);
      if (result && typeof result.then === 'function') {
        return result.then(normalizeResult).catch(handleError);
      }
      return normalizeResult(result);
    } catch (err) {
      return handleError(err);
    }
  };
}

function createQueryable(poolOrClient) {
  return {
    query: wrapQuery(poolOrClient.query.bind(poolOrClient)),
  };
}

class PgMemPool {
  constructor(config) {
    this._config = config;
    this._pg = createFreshPg();
    this._pool = new this._pg.Pool(config);
    this.query = wrapQuery(this._pool.query.bind(this._pool));
    noopClientEventHandlers(this);
  }

  connect(connectCb) {
    const client = new PgMemClient(this._config, this._pg);
    if (connectCb) {
      connectCb(null, client, () => {});
      return undefined;
    }
    return Promise.resolve(client);
  }

  end(cb) {
    if (cb) cb();
    return undefined;
  }

  get totalCount() { return 0; }
  get idleCount() { return 0; }
  get waitingCount() { return 0; }
}

class PgMemClient {
  constructor(config, sharedPg) {
    this._config = config;
    this._pg = sharedPg || createFreshPg();
    this._client = new this._pg.Client(config);
    this.query = wrapQuery(this._client.query.bind(this._client));
    this.connect = (cb) => { if (cb) cb(); return this; };
    this.end = (cb) => { if (cb) cb(); return undefined; };
    this.release = () => {};
    noopClientEventHandlers(this);
  }
}

module.exports = { Pool: PgMemPool, Client: PgMemClient, native: null };
