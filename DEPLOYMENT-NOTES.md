# Nexaven v2.1 - Deployment Notları

## ✅ Yapılan Değişiklikler

### Backend
1. **Settings Route Eklendi**
   - `backend/src/routes/settings.js` - Site ayarları API endpoint'leri
   - GET `/api/settings` - Site ayarlarını getir
   - PUT `/api/settings` - Site ayarlarını güncelle (sadece admin)
   
2. **Database Şeması Güncellendi**
   - `backend/src/db/sqlite.js` - `site_settings` tablosu eklendi
   - 13 alan: site_title, site_description, hero_title, hero_subtitle, about_title, about_text, contact_email, contact_phone, social medya linkleri, footer_text
   
3. **Server.js Güncellendi**
   - Settings route'u kayıt edildi

### Frontend
1. **Admin.jsx - CMS Paneli Eklendi**
   - "⚙️ Genel Ayarlar" tab'ı eklendi
   - Tüm site içeriğini admin panelinden düzenleme imkanı
   - Site bilgileri, Hero, Hakkımızda, İletişim, Sosyal Medya, Footer bölümleri
   
2. **Home.jsx - Dinamik İçerik**
   - Artık tüm içerik API'den geliyor
   - Hero başlık ve alt başlık dinamik
   - Footer bilgileri dinamik
   - Sosyal medya linkleri dinamik

3. **Login.jsx**
   - Zaten daha önceki versiyonda karanlık tema uygulanmıştı

## 🚀 VPS'e Deploy Adımları

### 1. Kod Güncellemesi
```bash
# VPS'e SSH ile bağlan
ssh root@nexaven.com.tr

# Proje dizinine git
cd /root/nexaven-v2

# Git pull
git pull origin main
```

### 2. Container'ları Yeniden Başlat
```bash
# Tüm container'ları durdur
docker compose down

# Yeniden başlat
docker compose up -d --build

# Logları kontrol et
docker compose logs -f backend
```

### 3. Database Kontrolü
```bash
# Backend container'ına gir
docker exec -it nexaven-backend sh

# SQLite database'i kontrol et
sqlite3 /app/data/nexaven.db

# site_settings tablosunu kontrol et
.tables
SELECT * FROM site_settings;
.quit
exit
```

## 🎯 Test Adımları

1. **Login Testi**
   - https://nexaven.com.tr/login
   - Kullanıcı: kbozurdilerim / EnsYhy2394+
   
2. **Admin Panel Testi**
   - Admin paneline giriş yap
   - "⚙️ Genel Ayarlar" tab'ına tıkla
   - Hero başlığını değiştir
   - Kaydet butonuna bas
   
3. **Ana Sayfa Testi**
   - Ana sayfaya git: https://nexaven.com.tr
   - Değişikliklerin yansıdığını kontrol et

## 📝 Default İçerik

Eğer database boşsa, API otomatik olarak şu default değerleri döner:

```javascript
{
  site_title: "Nexaven - Profesyonel ECU Chip Tuning",
  site_description: "Araç performansını artırın, yakıt tasarrufu sağlayın.",
  hero_title: "YARIŞIN ÖTESİNE GEÇİN",
  hero_subtitle: "Nexaven ile Performansı Yükseltin.",
  about_title: "NEXAVEN ASSETTO CORSA PROJESİ",
  about_text: "",
  contact_email: "",
  contact_phone: "",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
  footer_text: "© 2024 Nexaven. Tüm hakları saklıdır."
}
```

## 🔧 Sorun Giderme

### Login Bağlantı Hatası
```bash
# Backend loglarını kontrol et
docker compose logs backend --tail=100

# Nginx loglarını kontrol et
docker compose logs nginx --tail=50

# SSL sertifikasını kontrol et
docker compose ps
# Certbot exited ise:
docker compose up -d certbot
```

### Database Hatası
```bash
# Database dosyasının varlığını kontrol et
docker exec nexaven-backend ls -la /app/data/

# Yetkileri düzelt
docker exec nexaven-backend chmod 644 /app/data/nexaven.db
```

### API Bağlantı Hatası
- CORS ayarlarını kontrol et (backend/src/server.js)
- Nginx proxy ayarlarını kontrol et
- Frontend'de API URL'lerinin doğru olduğundan emin ol

## 📊 Özellikler

### Admin Paneli Özellikleri
- ✅ Dashboard (istatistikler)
- ✅ Lisans Talepleri Yönetimi
- ✅ Lisans Yönetimi
- ✅ Özellikler (Features) Yönetimi
- ✅ Araç Vitrini Yönetimi
- ✅ Fiyatlandırma Yönetimi
- ✅ İndirmeler Yönetimi
- ✅ **YENİ:** Genel Site Ayarları (CMS)

### CMS Özellikleri
- Site başlığı ve açıklaması
- Hero bölümü düzenleme
- Hakkımızda bölümü düzenleme
- İletişim bilgileri
- Sosyal medya linkleri
- Footer metni

## 🎨 Tema Bilgileri

**Renk Paleti:**
- Arkaplan: Pure Black (#000000, #0a0a0a, #050505)
- Ana Vurgu: Bright Cyan (#00d4ff, #0099ff, #0066ff)
- Gölgeler: rgba(0, 212, 255, 0.3-0.6)
- Kenarlıklar: rgba(0, 183, 255, 0.25-0.5)

**Typography:**
- Logo: 52px, font-weight: 900
- Başlıklar: 38-56px
- Normal metin: 14-16px
- Font: 'Segoe UI', Inter

---
**Son Güncelleme:** 2024
**Versiyon:** 2.1.0
**Geliştirici:** Nexaven Team
