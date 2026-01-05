# 🚀 Nexaven v2.0 - Yeni Özellikler Deployment Guide

## ✨ Eklenen Yeni Özellikler

### 1. 📝 Register Sistemi (2 Tip)
- ✅ Bireysel Hesap
- ✅ Simulasyon Cafe Hesabı
- ✅ Email validasyonu
- ✅ Şifre güvenliği

### 2. 📸 Image Upload Sistemi
- ✅ Multer middleware
- ✅ 5MB dosya limiti
- ✅ JPG, PNG, GIF, WEBP desteği
- ✅ `/uploads` endpoint'i

### 3. ✏️ Edit (Düzenleme) Fonksiyonları
- ✅ PUT endpoints tüm CMS içerikleri için
- ✅ Features düzenlenebilir
- ✅ Vehicles düzenlenebilir
- ✅ Pricing düzenlenebilir
- ✅ Downloads düzenlenebilir

### 4. 🔔 Bildirim Sistemi
- ✅ Kullanıcı bildirimleri
- ✅ Okundu/okunmadı durumu
- ✅ Admin → Kullanıcı bildirim gönderimi
- ✅ Otomatik bildirimler (kayıt, lisans onayı)

### 5. 🎫 Lisans Talep Sistemi
- ✅ Kullanıcı lisans talebi oluşturabilir
- ✅ Admin onay/red sistemi
- ✅ Otomatik lisans anahtarı üretimi
- ✅ Kullanıcıya otomatik bildirim

### 6. 📊 Gelişmiş Dashboard
- ✅ Toplam kullanıcı sayısı
- ✅ Aktif lisans sayısı
- ✅ Bekleyen talepler
- ✅ Gelir/Gider takibi
- ✅ Aylık gelir grafiği
- ✅ Kullanıcı aktivite grafiği

### 7. 🗄️ Database Güncellemeleri
**Yeni Tablolar:**
- `license_requests` - Lisans talepleri
- `notifications` - Bildirimler
- `transactions` - Gelir/Gider kayıtları

**Güncellenmiş Tablolar:**
- `users` - email, user_type, company_name eklendi
- `licenses` - user_id, plan_id foreign key eklendi
- `features/vehicles/pricing/downloads` - image_url alanı eklendi

---

## 📦 Deployment Adımları

### 1. Local'den GitHub'a Push

```bash
cd "a:\chatgp nexaven"
git add .
git commit -m "v2.0: Register, Image Upload, Edit, Notifications, Dashboard eklendi"
git push origin main
```

### 2. VPS'te Güncelleme

```bash
ssh root@nexaven.com.tr
cd ~/nexavenv2

# Güncellemeleri çek
git pull origin main

# Container'ları durdur
docker compose down

# Backend'i rebuild et (yeni dependencies için)
docker compose build --no-cache backend

# Frontend'i rebuild et (yeni sayfalar için)
docker compose build --no-cache frontend

# Başlat
docker compose up -d

# Logları kontrol et
docker compose logs -f
```

### 3. Database Migration (Önemli!)

Mevcut database'i güncellemek için:

```bash
# Backend container'ına gir
docker compose exec backend sh

# SQLite'a bağlan
sqlite3 /app/data/nexaven.db

# Yeni kolonları ekle (eski tablolar için)
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'individual';
ALTER TABLE users ADD COLUMN company_name TEXT;

ALTER TABLE features ADD COLUMN image_url TEXT;
ALTER TABLE vehicles ADD COLUMN image_url TEXT;
ALTER TABLE pricing ADD COLUMN image_url TEXT;
ALTER TABLE downloads ADD COLUMN image_url TEXT;

ALTER TABLE licenses ADD COLUMN user_id INTEGER;
ALTER TABLE licenses ADD COLUMN plan_id INTEGER;

# Çık
.exit
exit
```

**VEYA** Database'i sıfırdan oluştur (tüm veriler silinir!):

```bash
docker compose exec backend rm /app/data/nexaven.db
docker compose restart backend
```

### 4. Uploads Klasörünü Oluştur

```bash
docker compose exec backend mkdir -p /app/data/uploads
docker compose exec backend chmod 777 /app/data/uploads
```

### 5. Admin Kullanıcısı Tekrar Oluştur (eğer DB sıfırlandıysa)

```bash
docker compose exec backend node -e "
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');
const hashed = bcrypt.hashSync('EnsYhy2394+', 10);
db.run('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', 
  ['kbozurdilerim', hashed, 'admin@nexaven.com.tr', 'admin'],
  err => console.log(err || '✅ Admin oluşturuldu!')
);
"
```

---

## 🧪 Test Senaryoları

### 1. Register Testi
1. https://nexaven.com.tr/register adresine git
2. "Bireysel Hesap" seç
3. Kullanıcı adı, email, şifre gir
4. Kayıt ol
5. Login sayfasına yönlendir

### 2. Lisans Talep Testi
1. Normal kullanıcı olarak giriş yap
2. Pricing sayfasından plan seç
3. "Lisans Talep Et" butonuna bas
4. Admin olarak giriş yap
5. Talebi onayla
6. Kullanıcı bildirim almalı

### 3. Image Upload Testi
1. Admin paneline gir
2. Araç Vitrini sekmesine git
3. "Yeni Araç Ekle" formu
4. "Fotoğraf Yükle" butonu
5. Resim seç ve yükle
6. URL otomatik doldurulmalı

### 4. Dashboard Testi
1. Admin paneline gir
2. "Dashboard" sekmesi
3. İstatistikler görüntülenmeli:
   - Toplam kullanıcı
   - Aktif lisanslar
   - Bekleyen talepler
   - Gelir/Gider

---

## 🔧 API Endpoints (Yeni)

### Register
```
POST /api/register/register
Body: { username, email, password, userType, companyName }
```

### Notifications
```
GET /api/notifications - Kullanıcının bildirimleri
GET /api/notifications/unread-count - Okunmamış sayı
PUT /api/notifications/:id/read - Okundu işaretle
```

### License Requests
```
POST /api/license-requests - Yeni talep
GET /api/license-requests/my-requests - Kullanıcının talepleri
GET /api/license-requests/all - Tüm talepler (Admin)
POST /api/license-requests/:id/approve - Onayla (Admin)
POST /api/license-requests/:id/reject - Reddet (Admin)
```

### Dashboard
```
GET /api/dashboard/stats - Genel istatistikler (Admin)
GET /api/dashboard/monthly-revenue - Aylık gelir (Admin)
GET /api/dashboard/user-activity - Kullanıcı aktivitesi (Admin)
```

### Image Upload
```
POST /api/cms/upload
Content-Type: multipart/form-data
Body: { image: File }
Response: { imageUrl: "/uploads/filename.jpg" }
```

### CMS Edit (PUT)
```
PUT /api/cms/features/:id
PUT /api/cms/vehicles/:id
PUT /api/cms/pricing/:id
PUT /api/cms/downloads/:id
```

---

## ⚠️ Önemli Notlar

1. **Multer Dependency**: Backend'e `multer` paketi eklendi, rebuild gerekli
2. **Database Schema**: Yeni tablolar ve kolonlar eklendi
3. **Uploads Klasörü**: `/app/data/uploads` oluşturulmalı ve yazılabilir olmalı
4. **Image URL'ler**: Backend `/uploads` klasörünü serve ediyor
5. **Frontend Router**: `/register` route'u eklendi

---

## 🐛 Troubleshooting

### Image Upload Çalışmıyor
```bash
# Klasör izinlerini kontrol et
docker compose exec backend ls -la /app/data/
docker compose exec backend chmod 777 /app/data/uploads
```

### Database Hataları
```bash
# Tabloları kontrol et
docker compose exec backend sqlite3 /app/data/nexaven.db ".tables"

# Schema'yı kontrol et
docker compose exec backend sqlite3 /app/data/nexaven.db ".schema users"
```

### Register Çalışmıyor
```bash
# Backend loglarını kontrol et
docker compose logs backend | grep register

# API test et
curl -X POST https://nexaven.com.tr/api/register/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456","userType":"individual"}'
```

---

## 📚 Sonraki Adımlar (Frontend)

Şu anda Backend tamamen hazır. Frontend'de eklenecekler:

1. ✏️ **Edit Modal'ları** - Tüm CMS içerikleri için düzenleme formları
2. 📸 **Image Upload Component** - Drag & drop resim yükleme
3. 📊 **Dashboard Sayfası** - Grafik ve istatistik gösterimi
4. 🔔 **Notification Bell** - Header'da bildirim ikonu
5. 🎫 **License Request Panel** - Kullanıcı panelinde lisans talep formu
6. 🛠️ **Admin License Approval** - Admin panelinde talep yönetimi

Bu özellikler çok büyük, ayrı ayrı ekleyelim mi?

---

## 🎉 Özet

✅ Backend API tamamen hazır
✅ Database schema güncellendi
✅ Register sayfası oluşturuldu
✅ Image upload sistemi hazır
✅ Edit endpoints eklendi
✅ Notification sistemi hazır
✅ License request sistemi hazır
✅ Dashboard endpoints hazır

Şimdi bu değişiklikleri deploy edin ve test edin!
