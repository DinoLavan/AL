const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (creates "dies.db" if it doesn't exist)
const db = new sqlite3.Database("dies.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
        db.run(`
            CREATE TABLE IF NOT EXISTS dies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dieName TEXT,
                width REAL,
                height REAL,
                across INTEGER,
                around INTEGER,
                type TEXT NOT NULL,
                customer TEXT,
                description TEXT
            )
        `);
    }
});

module.exports = db;
