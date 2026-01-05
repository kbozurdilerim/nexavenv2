// Database Migration Script v1 -> v2
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');

console.log('🔄 Database migration başlıyor...\n');

const migrations = [
  // Users tablosu güncellemeleri
  `ALTER TABLE users ADD COLUMN email TEXT`,
  `ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'individual'`,
  `ALTER TABLE users ADD COLUMN company_name TEXT`,
  `ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`,
  `ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
  
  // Licenses tablosu güncellemeleri
  `ALTER TABLE licenses ADD COLUMN user_id INTEGER`,
  `ALTER TABLE licenses ADD COLUMN plan_id INTEGER`,
  `ALTER TABLE licenses ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
  
  // Features tablosu güncelleme
  `ALTER TABLE features ADD COLUMN image_url TEXT`,
  
  // Vehicles tablosu güncelleme
  `ALTER TABLE vehicles ADD COLUMN image_url TEXT`,
  
  // Pricing tablosu güncelleme
  `ALTER TABLE pricing ADD COLUMN image_url TEXT`,
  
  // Downloads tablosu güncelleme
  `ALTER TABLE downloads ADD COLUMN image_url TEXT`,
  
  // Yeni tablolar
  `CREATE TABLE IF NOT EXISTS license_requests (
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
  )`,
  
  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    license_id INTEGER,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(license_id) REFERENCES licenses(id)
  )`
];

let completed = 0;
let errors = 0;

migrations.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log(`⚠️  Migration ${index + 1}: Kolon zaten mevcut (atlandı)`);
      } else if (err.message.includes('already exists')) {
        console.log(`⚠️  Migration ${index + 1}: Tablo zaten mevcut (atlandı)`);
      } else {
        console.error(`❌ Migration ${index + 1} HATA:`, err.message);
        errors++;
      }
    } else {
      console.log(`✅ Migration ${index + 1}: Başarılı`);
      completed++;
    }
    
    if (index === migrations.length - 1) {
      console.log(`\n📊 Özet: ${completed} başarılı, ${errors} hata, ${migrations.length - completed - errors} atlandı`);
      console.log('✅ Migration tamamlandı!\n');
      db.close();
    }
  });
});
