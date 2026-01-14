#!/bin/bash
# Nexaven v2.1 - Hızlı Deploy Script

echo "🚀 Nexaven v2.1 Deploy Başlatılıyor..."

# 1. Git güncelleme
echo "📥 Git pull..."
cd ~/nexavenv2
git reset --hard HEAD
git pull origin main

# 2. Site Settings Tablosu Oluştur
echo "💾 Site settings tablosu oluşturuluyor..."
docker compose exec -T backend node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');
db.run(\`CREATE TABLE IF NOT EXISTS site_settings (
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
)\`, (err) => {
  console.log(err || '✅ site_settings tablosu oluşturuldu!');
  db.close();
});
" || echo "⚠️ Tablo zaten mevcut veya hata oluştu"

# 3. Nginx Upload Limiti Artır
echo "📤 Nginx upload limiti artırılıyor..."
docker compose exec -T nginx sh -c "echo 'client_max_body_size 50M;' > /etc/nginx/conf.d/upload.conf" || echo "⚠️ Nginx config hatası"

# 4. Container'ları Yeniden Başlat
echo "🔄 Container'lar yeniden başlatılıyor..."
docker compose down
docker compose build --no-cache backend frontend
docker compose up -d

# 5. Logları Göster
echo "📋 Backend logları:"
docker compose logs backend --tail=20

echo ""
echo "✅ Deploy tamamlandı!"
echo "🌐 Test Et: https://nexaven.com.tr/admin"
echo "👤 Kullanıcı: kbozurdilerim / EnsYhy2394+"
