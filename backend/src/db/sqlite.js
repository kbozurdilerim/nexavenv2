const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data/nexaven.db");

db.serialize(() => {
  // Users tablosu - Genişletilmiş
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      user_type TEXT DEFAULT 'individual',
      company_name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Licenses tablosu - Genişletilmiş
  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE,
      user_id INTEGER,
      owner TEXT,
      status TEXT DEFAULT 'active',
      hwid TEXT,
      ip TEXT,
      plan_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(plan_id) REFERENCES pricing(id)
    )
  `);

  // License Requests tablosu - YENİ
  db.run(`
    CREATE TABLE IF NOT EXISTS license_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT,
      admin_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(plan_id) REFERENCES pricing(id)
    )
  `);

  // Notifications tablosu - YENİ
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Transactions tablosu - YENİ (Gelir/Gider takibi)
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      license_id INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(license_id) REFERENCES licenses(id)
    )
  `);

  // Features tablosu - Fotoğraf desteği
  db.run(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      image_url TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  // Vehicles tablosu - Fotoğraf desteği
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      specs TEXT,
      image_url TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  // Pricing tablosu - Fotoğraf desteği
  db.run(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_name TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT,
      features TEXT,
      image_url TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);

  // Downloads tablosu - Fotoğraf desteği
  db.run(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      version TEXT,
      download_url TEXT NOT NULL,
      file_size TEXT,
      image_url TEXT,
      order_index INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;
