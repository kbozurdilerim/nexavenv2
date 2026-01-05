const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/nexaven.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT,
      owner TEXT,
      status TEXT,
      hwid TEXT,
      ip TEXT,
      expires_at TEXT
    )
  `);
});

module.exports = db;
