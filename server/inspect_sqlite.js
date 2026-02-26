const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error reading SQLite:', err.message);
        process.exit(1);
    }
    console.log('Tables:', tables.map(t => t.name));

    if (tables.some(t => t.name === 'products')) {
        db.all("SELECT COUNT(*) as count FROM products", (err, rows) => {
            if (err) {
                console.error('❌ Error counting products:', err.message);
            } else {
                console.log('Products in SQLite:', rows[0].count);
            }
            db.close();
        });
    } else {
        console.log('No products table found in SQLite.');
        db.close();
    }
});
