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

  db.run(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      icon TEXT,
      order_index INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      specs TEXT,
      image TEXT,
      order_index INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_name TEXT,
      price TEXT,
      duration TEXT,
      features TEXT,
      order_index INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      version TEXT,
      download_url TEXT,
      file_size TEXT,
      order_index INTEGER
    )
  `);
});

module.exports = db;
