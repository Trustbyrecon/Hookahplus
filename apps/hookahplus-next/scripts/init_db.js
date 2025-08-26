const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    table_name TEXT,
    flavors TEXT[],
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    refills INTEGER,
    notes TEXT[]
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS wallet (
    id SERIAL PRIMARY KEY,
    points INTEGER,
    streak INTEGER
  )`);

  const { rows: sessionCount } = await pool.query('SELECT COUNT(*) FROM sessions');
  if (parseInt(sessionCount[0].count, 10) === 0) {
    await pool.query(`INSERT INTO sessions (table_name, flavors, start_time, end_time, refills, notes) VALUES
      ('A1', ARRAY['Mint','Lemon'], NOW() - INTERVAL '50 minutes', NULL, 1, ARRAY['likes iced water', 'extra lemon']),
      ('B2', ARRAY['Grape'], NOW() - INTERVAL '16 minutes', NULL, 0, ARRAY['no mint requests', 'prefers corner booth', 'check id']),
      ('C3', ARRAY['Watermelon'], NOW() - INTERVAL '10 minutes', NULL, 0, ARRAY['first time visitor']),
      ('D4', ARRAY['Blueberry','Mint'], NOW() - INTERVAL '5 minutes', NULL, 0, ARRAY['prefers tall stems', 'ask about specials']),
      ('E5', ARRAY['Peach','Grape','Apple'], NOW() - INTERVAL '70 minutes', NULL, 2, ARRAY['watch heat', 'last bowl burnt'])
    `);
  }

  const { rows: walletCount } = await pool.query('SELECT COUNT(*) FROM wallet');
  if (parseInt(walletCount[0].count, 10) === 0) {
    await pool.query(`INSERT INTO wallet (points, streak) VALUES (120, 3)`);
  }

  console.log('Database initialized');
  await pool.end();
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
