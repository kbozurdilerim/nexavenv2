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
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);

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

  // Zorlu ECU - Yüklenen dosyalar
  db.run(`
    CREATE TABLE IF NOT EXISTS ecu_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      original_name TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER NOT NULL,
      checksum TEXT,
      ecu_type TEXT,
      ecu_version TEXT,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ecu_files_user_id ON ecu_files(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ecu_files_type ON ecu_files(ecu_type)`);

  // Zorlu ECU - Karşılaştırmalar
  db.run(`
    CREATE TABLE IF NOT EXISTS ecu_comparisons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      file_a INTEGER NOT NULL,
      file_b INTEGER NOT NULL,
      similarity REAL,
      result_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(file_a) REFERENCES ecu_files(id),
      FOREIGN KEY(file_b) REFERENCES ecu_files(id)
    )
  `);

  // Zorlu ECU - Tuning İşleri
  db.run(`
    CREATE TABLE IF NOT EXISTS tuning_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      strategy TEXT,
      model TEXT DEFAULT 'balanced',
      parameters_json TEXT,
      status TEXT DEFAULT 'queued',
      result_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tuning_jobs_status ON tuning_jobs(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tuning_jobs_user_id ON tuning_jobs(user_id)`);
});

module.exports = db;
