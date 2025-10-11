const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Read and execute the schema
const schemaPath = path.join(__dirname, 'init-postgres.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function runMigration() {
    try {
        console.log('🚀 Starting PostgreSQL migration...');

        // Split SQL by semicolons and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            const trimmed = statement.trim();
            if (trimmed) {
                console.log('Executing:', trimmed.substring(0, 50) + '...');
                await pool.query(trimmed);
            }
        }

        console.log('✅ PostgreSQL migration completed successfully!');

        // Test the migration
        const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

        console.log('📋 Created tables:', tablesResult.rows.map(r => r.tablename));

        await pool.end();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
