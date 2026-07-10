const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const schemaPath = path.resolve(__dirname, '../schema.sql');

// Connect to SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database at:', dbPath);
});

// Run Schema initialization
const initDb = () => {
    return new Promise((resolve, reject) => {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // SQLite's exec runs multiple statements separated by semicolons
        db.exec(schemaSql, (err) => {
            if (err) {
                console.error('Error initializing database schema:', err.message);
                return reject(err);
            }
            console.log('Database tables initialized successfully.');
            
            // Populate default system categories if empty
            db.get("SELECT COUNT(*) as count FROM categories WHERE user_id IS NULL", [], (err, row) => {
                if (err) {
                    return reject(err);
                }
                
                if (row.count === 0) {
                    const stmt = db.prepare("INSERT INTO categories (user_id, name, type) VALUES (NULL, ?, ?)");
                    const defaultCategories = [
                        ['Salary', 'income'],
                        ['Freelance', 'income'],
                        ['Investments', 'income'],
                        ['Food', 'expense'],
                        ['Rent', 'expense'],
                        ['Utilities', 'expense'],
                        ['Entertainment', 'expense'],
                        ['Transport', 'expense']
                    ];
                    
                    defaultCategories.forEach(([name, type]) => {
                        stmt.run(name, type);
                    });
                    
                    stmt.finalize();
                    console.log('Default system categories populated.');
                }
                resolve();
            });
        });
    });
};

module.exports = {
    db,
    initDb
};
