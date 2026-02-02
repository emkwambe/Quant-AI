// server/db/adapter.js
// Database adapter layer - supports SQLite (current) and PostgreSQL (future)
// Switch databases by changing DB_TYPE environment variable

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db;
let isAsync = false;

// ============================================
// SQLite Implementation (Synchronous)
// ============================================
if (DB_TYPE === 'sqlite') {
  const dataDir = join(__dirname, '../../data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = process.env.DATABASE_PATH || join(dataDir, 'mathathlon.db');
  const sqliteDb = new Database(dbPath);
  
  // Enable WAL mode for better concurrent read performance
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');

  db = {
    type: 'sqlite',
    isAsync: false,
    raw: sqliteDb, // Direct access if needed

    /**
     * Execute a SELECT query, returns array of rows
     * @param {string} sql - SQL query with ? placeholders
     * @param {Array} params - Parameter values
     * @returns {Array} Array of row objects
     */
    query: (sql, params = []) => {
      const stmt = sqliteDb.prepare(sql);
      return params.length ? stmt.all(...params) : stmt.all();
    },

    /**
     * Execute a SELECT query, returns single row or null
     * @param {string} sql - SQL query with ? placeholders
     * @param {Array} params - Parameter values
     * @returns {Object|null} Single row object or null
     */
    queryOne: (sql, params = []) => {
      const stmt = sqliteDb.prepare(sql);
      return params.length ? stmt.get(...params) : stmt.get();
    },

    /**
     * Execute INSERT/UPDATE/DELETE, returns result info
     * @param {string} sql - SQL statement with ? placeholders
     * @param {Array} params - Parameter values
     * @returns {Object} { changes: number, lastInsertRowid: number }
     */
    execute: (sql, params = []) => {
      const stmt = sqliteDb.prepare(sql);
      const result = params.length ? stmt.run(...params) : stmt.run();
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid
      };
    },

    /**
     * Execute multiple statements in a transaction
     * @param {Function} fn - Function receiving transaction context
     * @returns {*} Result of the transaction function
     */
    transaction: (fn) => {
      const trx = sqliteDb.transaction(fn);
      return trx();
    },

    /**
     * Prepare a statement for repeated execution
     * @param {string} sql - SQL statement
     * @returns {Object} Prepared statement
     */
    prepare: (sql) => {
      return sqliteDb.prepare(sql);
    },

    /**
     * Close database connection
     */
    close: () => {
      sqliteDb.close();
    }
  };

  isAsync = false;
  console.log(`📦 Database: SQLite (${dbPath})`);
}

// ============================================
// PostgreSQL Implementation (Async)
// ============================================
else if (DB_TYPE === 'postgres') {
  // Dynamic import for PostgreSQL (only load if needed)
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
    max: 20, // Maximum connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });

  // Test connection
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });

  /**
   * Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
   */
  function convertPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  }

  /**
   * Convert SQLite DATETIME to PostgreSQL TIMESTAMP syntax
   */
  function convertDatetimeSyntax(sql) {
    return sql
      .replace(/DATETIME/gi, 'TIMESTAMP')
      .replace(/INTEGER PRIMARY KEY(?!\s+AUTOINCREMENT)/gi, 'SERIAL PRIMARY KEY');
  }

  db = {
    type: 'postgres',
    isAsync: true,
    raw: pool, // Direct access if needed

    /**
     * Execute a SELECT query, returns array of rows
     */
    query: async (sql, params = []) => {
      const pgSql = convertPlaceholders(convertDatetimeSyntax(sql));
      const result = await pool.query(pgSql, params);
      return result.rows;
    },

    /**
     * Execute a SELECT query, returns single row or null
     */
    queryOne: async (sql, params = []) => {
      const pgSql = convertPlaceholders(convertDatetimeSyntax(sql));
      const result = await pool.query(pgSql, params);
      return result.rows[0] || null;
    },

    /**
     * Execute INSERT/UPDATE/DELETE, returns result info
     * Note: For INSERT, add RETURNING id to get lastInsertRowid
     */
    execute: async (sql, params = []) => {
      let pgSql = convertPlaceholders(convertDatetimeSyntax(sql));
      
      // Auto-add RETURNING id for INSERT statements
      if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.includes('RETURNING')) {
        pgSql = pgSql.replace(/;?\s*$/, ' RETURNING id;');
      }
      
      const result = await pool.query(pgSql, params);
      return {
        changes: result.rowCount,
        lastInsertRowid: result.rows[0]?.id || null
      };
    },

    /**
     * Execute multiple statements in a transaction
     */
    transaction: async (fn) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Create a transaction-scoped db interface
        const trxDb = {
          query: async (sql, params = []) => {
            const pgSql = convertPlaceholders(sql);
            const result = await client.query(pgSql, params);
            return result.rows;
          },
          queryOne: async (sql, params = []) => {
            const pgSql = convertPlaceholders(sql);
            const result = await client.query(pgSql, params);
            return result.rows[0] || null;
          },
          execute: async (sql, params = []) => {
            let pgSql = convertPlaceholders(sql);
            if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.includes('RETURNING')) {
              pgSql = pgSql.replace(/;?\s*$/, ' RETURNING id;');
            }
            const result = await client.query(pgSql, params);
            return {
              changes: result.rowCount,
              lastInsertRowid: result.rows[0]?.id || null
            };
          }
        };
        
        const result = await fn(trxDb);
        await client.query('COMMIT');
        return result;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    },

    /**
     * Close database connection pool
     */
    close: async () => {
      await pool.end();
    }
  };

  isAsync = true;
  console.log(`📦 Database: PostgreSQL (${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'configured'})`);
}

else {
  throw new Error(`Unknown DB_TYPE: ${DB_TYPE}. Use 'sqlite' or 'postgres'.`);
}

// Export database interface
export default db;
export { isAsync };

// ============================================
// Helper: Wrap sync functions for unified async API
// ============================================
/**
 * Use this wrapper when you want consistent async/await syntax
 * regardless of database type
 * 
 * @example
 * const rows = await dbAsync.query('SELECT * FROM users');
 */
export const dbAsync = {
  query: async (sql, params = []) => {
    return isAsync ? await db.query(sql, params) : db.query(sql, params);
  },
  queryOne: async (sql, params = []) => {
    return isAsync ? await db.queryOne(sql, params) : db.queryOne(sql, params);
  },
  execute: async (sql, params = []) => {
    return isAsync ? await db.execute(sql, params) : db.execute(sql, params);
  },
  transaction: async (fn) => {
    return isAsync ? await db.transaction(fn) : db.transaction(fn);
  }
};
