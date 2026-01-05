#!/bin/bash
# Admin kullanıcısı oluşturma script'i
# Kullanıcı adı: kbozurdilerim
# Şifre: EnsYhy2394+

echo "🔐 Admin kullanıcısı oluşturuluyor..."

docker compose exec backend node -e "
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');

const username = 'kbozurdilerim';
const password = 'EnsYhy2394+';
const hashedPassword = bcrypt.hashSync(password, 10);

// Önce mevcut kullanıcıyı kontrol et
db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
  if (row) {
    console.log('❌ Bu kullanıcı adı zaten mevcut!');
    db.close();
    process.exit(1);
  }
  
  // Yeni kullanıcıyı ekle
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
    [username, hashedPassword], 
    function(err) {
      if (err) {
        console.error('❌ Hata:', err.message);
      } else {
        console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
        console.log('   Kullanıcı adı: kbozurdilerim');
        console.log('   Şifre: EnsYhy2394+');
        console.log('   Giriş: https://nexaven.com.tr/login');
      }
      db.close();
    }
  );
});
"

echo ""
echo "✅ İşlem tamamlandı!"
