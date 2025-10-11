const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Create database path
const dbPath = path.join(__dirname, '..', 'martin.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Read and execute the schema
const schemaPath = path.join(__dirname, 'init-db.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Running database migration...');

try {
    // Execute the schema
    db.exec(schema);
    console.log('✅ Database migration completed successfully!');

    // Test with a simple query
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('📋 Created tables:', tables.map(t => t.name));

    db.close();
} catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
}
