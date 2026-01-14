# 🧪 VPS Test Komutları

## Mevcut Durum
✅ Admin kullanıcısı zaten mevcut: `kbozurdilerim` / `EnsYhy2394+`
✅ Container'lar çalışıyor

---

## 1️⃣ Container Durumlarını Kontrol Et

```bash
docker compose ps
```

**Beklenen Çıktı:**
```
NAME                STATUS              PORTS
nexaven-nginx       Up                 0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
nexaven-backend     Up                 3000/tcp
nexaven-frontend    Up                 5173/tcp
nexaven-ai-worker   Up
certbot             Exited (0)
```

---

## 2️⃣ Site Settings Tablosunu Kontrol Et

```bash
# Backend container'ına gir
docker compose exec backend sh

# SQLite veritabanına bağlan
sqlite3 ./data/nexaven.db

# Tabloları listele
.tables

# site_settings tablosunu kontrol et
SELECT * FROM site_settings;

# Tablo yoksa manuel oluştur
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

# Çık
.quit
exit
```

---

## 3️⃣ Backend Loglarını Kontrol Et

```bash
# Son 50 satır
docker compose logs backend --tail=50

# Gerçek zamanlı takip
docker compose logs -f backend
```

**Aradığımız:**
- ✅ `🚀 Server running on port 3000`
- ✅ `✅ Database initialized successfully`
- ❌ Hata mesajları

---

## 4️⃣ API Test - Site Settings

```bash
# Settings API'yi test et
curl -X GET http://localhost:3000/api/settings

# Admin token ile test (önce login olup token al)
TOKEN="your-token-here"
curl -X GET http://localhost:3000/api/settings \
  -H "Authorization: $TOKEN"
```

**Beklenen Yanıt:**
```json
{
  "site_title": "Nexaven - Profesyonel ECU Chip Tuning",
  "hero_title": "YARIŞIN ÖTESİNE GEÇİN",
  ...
}
```

---

## 5️⃣ Frontend Build Kontrolü

```bash
# Frontend container'ına gir
docker compose exec frontend sh

# Build dosyalarını kontrol et
ls -la /app/dist/

# Exit
exit
```

---

## 6️⃣ Nginx Konfigürasyonu Test Et

```bash
# Nginx container'ına gir
docker compose exec nginx sh

# Konfigurasyon testi
nginx -t

# Exit
exit
```

---

## 7️⃣ Database Backup Al (Önemli!)

```bash
# Backup dizini oluştur
mkdir -p ~/backups

# Database'i yedekle
docker compose exec backend cat /app/data/nexaven.db > ~/backups/nexaven-$(date +%Y%m%d-%H%M%S).db

# Veya
docker cp nexaven-backend:/app/data/nexaven.db ~/backups/nexaven-backup.db
```

---

## 8️⃣ Tüm Container'ları Yeniden Başlat

```bash
# Durdur
docker compose down

# Yeniden başlat (rebuild ile)
docker compose up -d --build

# Veya sadece yeniden başlat (rebuild olmadan)
docker compose restart
```

---

## 🌐 Web Testi

### Login Testi
1. **URL:** https://nexaven.com.tr/login
2. **Kullanıcı:** kbozurdilerim
3. **Şifre:** EnsYhy2394+
4. **Beklenen:** Admin paneline yönlendirme

### Admin Panel - Genel Ayarlar
1. Login yap
2. Sol menüden **"⚙️ Genel Ayarlar"** tab'ına tıkla
3. Hero başlığını değiştir: `"NEXAVEN V2.1 - YENİ NESİL"`
4. **"💾 Değişiklikleri Kaydet"** butonuna bas
5. Ana sayfayı aç: https://nexaven.com.tr
6. **Değişiklik yansıdı mı?**

### API Testi (Curl)

```bash
# 1. Login yap ve token al
curl -X POST https://nexaven.com.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"kbozurdilerim","password":"EnsYhy2394+"}'

# Çıktı: {"token":"eyJhbGc...","user":{...}}
# TOKEN'i kopyala

# 2. Settings'i oku
TOKEN="BURAYA_TOKEN_YAPISTIR"
curl -X GET https://nexaven.com.tr/api/settings \
  -H "Authorization: $TOKEN"

# 3. Settings'i güncelle
curl -X PUT https://nexaven.com.tr/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{
    "hero_title": "NEXAVEN V2.1 TEST",
    "hero_subtitle": "API ile güncellenmiş içerik"
  }'
```

---

## 🐛 Sorun Giderme

### Problem: Login Bağlantı Hatası

**Çözüm 1: Backend Logları**
```bash
docker compose logs backend --tail=100 | grep -i error
```

**Çözüm 2: CORS Kontrolü**
```bash
docker compose exec backend grep -n "cors" /app/src/server.js
```

**Çözüm 3: Port Kontrolü**
```bash
docker compose exec nginx netstat -tulpn | grep :3000
```

---

### Problem: Site Settings API 404

**Kontrol Et:**
```bash
# Route kaydı kontrolü
docker compose exec backend cat /app/src/server.js | grep settings

# Beklenen: app.use("/api/settings", settingsRoutes);
```

**Düzelt:**
```bash
# Container'ı yeniden başlat
docker compose restart backend

# Veya rebuild et
docker compose up -d --build backend
```

---

### Problem: Database Tablosu Yok

**Manuel Oluştur:**
```bash
docker compose exec backend sqlite3 ./data/nexaven.db "
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
"
```

---

### Problem: Admin Şifresi Değiştir

```bash
docker compose exec backend node -e "
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');
const hash = bcrypt.hashSync('YeniSifre123!', 10);
db.run('UPDATE users SET password = ? WHERE username = ?',
  [hash, 'kbozurdilerim'],
  err => { console.log(err || '✅ Şifre güncellendi!'); db.close(); }
);
"
```

---

## 📊 Başarı Kriterleri

✅ Tüm container'lar `Up` durumunda  
✅ Login başarılı  
✅ Admin paneli açılıyor  
✅ "⚙️ Genel Ayarlar" tab'ı görünüyor  
✅ Settings kaydediliyor  
✅ Ana sayfada değişiklikler yansıyor  
✅ Backend loglarında hata yok  

---

## 🎯 Şu Anda Yapılacaklar

1. **`docker compose ps`** - Container durumlarını kontrol et
2. **Site Settings tablosunu oluştur** - Yukarıdaki CREATE TABLE komutunu çalıştır
3. **`docker compose restart backend`** - Backend'i yeniden başlat
4. **https://nexaven.com.tr/login** - Login testi yap
5. **Genel Ayarlar sekmesini test et**

---

**Son Güncelleme:** 14 Ocak 2026  
**Versiyon:** 2.1.0
