import Database from 'better-sqlite3';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Detect database type from URL
const databaseUrl = process.env.DATABASE_URL || 'sqlite://martin.db';

let db: any;
let pool: Pool | null = null;

if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
  // PostgreSQL connection
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
  });

  // Test connection
  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
  });

  console.log('📊 Using PostgreSQL database');
} else {
  // SQLite fallback
  const dbPath = databaseUrl.replace('sqlite://', '');
  db = new Database(path.join(__dirname, '../../..', dbPath));
  db.pragma('journal_mode = WAL');
  console.log('📊 Using SQLite database');
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();

  try {
    if (pool) {
      // PostgreSQL
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rows.length });
      return { rows: result.rows, rowCount: result.rowCount };
    } else {
      // SQLite: adapt $1..$n placeholders to ? and map params
      let sql = text;
      const mappedParams: any[] = [];
      if (params && params.length) {
        // Replace $n with ? and reorder accordingly
        sql = text.replace(/\$(\d+)/g, (m, d) => {
          const idx = Number(d) - 1;
          mappedParams[idx] = params[idx];
          return '?';
        });
      }
      const stmt = db.prepare(sql);
      const res = params ? stmt.all(mappedParams) : stmt.all();
      const duration = Date.now() - start;
      console.log('Executed query', { text: sql, duration, rows: res.length });
      return { rows: res as any[], rowCount: res.length };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = () => {
  if (pool) {
    return pool;
  }

  // SQLite compatibility using same adapter as query()
  return {
    query: async (text: string, params?: any[]) => {
      let sql = text;
      const mappedParams: any[] = [];
      if (params && params.length) {
        sql = text.replace(/\$(\d+)/g, (m, d) => {
          const idx = Number(d) - 1;
          mappedParams[idx] = params[idx];
          return '?';
        });
      }
      const stmt = db.prepare(sql);
      const res = params ? stmt.all(mappedParams) : stmt.all();
      return { rows: res, rowCount: (res as any[]).length } as any;
    },
    release: () => {
      // SQLite doesn't need explicit connection release
    }
  } as any;
};

export default db || pool;
