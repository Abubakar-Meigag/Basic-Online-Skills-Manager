import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
});

pool.on('error', (err) => {
      console.error('Unexpected Postgres error:', err);
});

export default pool;