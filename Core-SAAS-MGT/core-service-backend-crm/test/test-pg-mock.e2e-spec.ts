describe('PgMockTest', () => {
  it('should use mocked pg via require', () => {
    const pg = require('pg');
    expect(pg.Pool.name).toBe('PgMemPool');
    expect(typeof pg.Pool.prototype.connect).toBe('function');
  });

  it('should work with pool.connect callback pattern', (done) => {
    const { Pool } = require('pg');
    const pool = new Pool({});
    pool.connect((err, client, release) => {
      expect(err).toBeNull();
      expect(client).toBeDefined();
      expect(typeof client.query).toBe('function');
      release();
      done();
    });
  });

  it('pool.connect returns a promise when no callback', async () => {
    const { Pool } = require('pg');
    const pool = new Pool({});
    const client = await pool.connect();
    expect(client).toBeDefined();
  });
});
