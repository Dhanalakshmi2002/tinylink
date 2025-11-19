// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For many managed DB providers you may need ssl: { rejectUnauthorized: false }
  // ssl: { rejectUnauthorized: false }
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export default pool;
