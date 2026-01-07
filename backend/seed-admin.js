const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, './data/nexaven.db');
const db = new sqlite3.Database(dbPath);

const username = 'kbozurdilerim';
const password = 'EnsYhy2394+';

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (row) {
      console.log('❌ Admin kullanıcısı zaten mevcut!');
      db.close();
      return;
    }
    
    db.run(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, 'admin@nexaven.com.tr', 'admin'],
      function (err) {
        if (err) {
          console.error('❌ Admin oluşturma hatası:', err);
        } else {
          console.log('✅ Admin kullanıcısı başarıyla oluşturuldu:');
          console.log('   Kullanıcı Adı: kbozurdilerim');
          console.log('   Şifre: EnsYhy2394+');
          console.log('   Rol: admin');
        }
        db.close();
      }
    );
  });
}

seedAdmin();
