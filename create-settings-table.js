// Site Settings Tablosu Oluşturma Script'i
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');

const createTableSQL = `
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_title TEXT,
  site_description TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  about_title TEXT,
  about_text TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  footer_text TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  CHECK (id = 1)
);
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('❌ Hata:', err.message);
    process.exit(1);
  }
  console.log('✅ site_settings tablosu başarıyla oluşturuldu!');
  
  // Tabloyu kontrol et
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='site_settings'", (err, row) => {
    if (err) {
      console.error('❌ Kontrol hatası:', err.message);
    } else if (row) {
      console.log('✅ Tablo doğrulandı:', row.name);
    } else {
      console.log('⚠️ Tablo bulunamadı!');
    }
    db.close();
  });
});
