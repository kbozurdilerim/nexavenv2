# 🚀 Hızlı Komutlar Rehberi

## 👤 Admin Kullanıcısı Oluşturma

### Tek Komutla (Hızlı Yöntem)
```bash
ssh root@nexaven.com.tr
cd ~/nexavenv2

# Admin kullanıcısı: kbozurdilerim / EnsYhy2394+
docker compose exec backend node -e "
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/nexaven.db');
const username = 'kbozurdilerim';
const password = 'EnsYhy2394+';
const hashed = bcrypt.hashSync(password, 10);
db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], function(err) {
  if (err) console.error('Hata:', err.message);
  else console.log('✅ Admin oluşturuldu! Login: https://nexaven.com.tr/login');
  db.close();
});
"
```

### Veya Script ile
```bash
cd ~/nexavenv2
chmod +x CREATE-ADMIN-USER.sh
./CREATE-ADMIN-USER.sh
```

### ✅ Giriş Bilgileri
- **URL:** https://nexaven.com.tr/login
- **Kullanıcı Adı:** `kbozurdilerim`
- **Şifre:** `EnsYhy2394+`

---

## 🔐 SSL Sertifikası Yönetimi

### Mevcut Sertifika Bilgisi
```bash
# Son kullanma tarihini kontrol et
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/nexaven.com.tr/cert.pem -noout -dates

# Çıktı:
# notBefore=Jan  5 12:30:00 2026 GMT
# notAfter=Apr   5 12:30:00 2026 GMT  ← Bu tarihte sona erer
```

### Manuel Yenileme (Şimdi Yenile)
```bash
cd ~/nexavenv2

# Test modu (gerçekte yenilemez, sadece kontrol eder)
docker compose run --rm certbot renew --dry-run

# Gerçek yenileme
docker compose run --rm certbot renew

# Nginx'i yeniden yükle
docker compose exec nginx nginx -s reload
```

### Otomatik Yenileme Kurulumu (Cron Job)
```bash
# Cron job ekle (her gün saat 02:00'de otomatik yeniler)
crontab -e

# Aşağıdaki satırı ekleyin:
0 2 * * * cd ~/nexavenv2 && docker compose run --rm certbot renew --quiet && docker compose exec nginx nginx -s reload >> /var/log/certbot-renew.log 2>&1
```

### Veya Otomatik Script ile
```bash
cd ~/nexavenv2
chmod +x SSL-RENEW-SETUP.sh
./SSL-RENEW-SETUP.sh
```

### Cron Job'u Kontrol Et
```bash
# Mevcut cron job'ları listele
crontab -l

# Yenileme loglarını görüntüle
tail -f /var/log/certbot-renew.log
```

---

## 📊 Container Yönetimi

### Container Durumlarını Kontrol
```bash
docker compose ps

# Beklenen durum:
# nexaven-backend     - running
# nexaven-frontend    - running  
# nexaven-nginx       - running (80:80, 443:443)
# nexavenv2-certbot-1 - exited (Normal durum)
```

### Container Loglarını İzleme
```bash
# Tüm container'ların logları
docker compose logs -f

# Sadece backend
docker compose logs -f backend

# Sadece frontend  
docker compose logs -f frontend

# Sadece nginx
docker compose logs -f nginx
```

### Container'ları Yeniden Başlat
```bash
# Hepsini yeniden başlat
docker compose restart

# Sadece backend'i
docker compose restart backend

# Sadece frontend'i
docker compose restart frontend
```

### Yeniden Build (Kod değişikliği sonrası)
```bash
cd ~/nexavenv2
git pull origin main

# Hepsini rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# Sadece frontend'i rebuild
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## 🗄️ Database İşlemleri

### SQLite Database'e Bağlan
```bash
docker compose exec backend sqlite3 /app/data/nexaven.db
```

### Tüm Kullanıcıları Listele
```bash
docker compose exec backend sqlite3 /app/data/nexaven.db "SELECT * FROM users;"
```

### Tüm Lisansları Listele
```bash
docker compose exec backend sqlite3 /app/data/nexaven.db "SELECT * FROM licenses;"
```

### CMS İçeriklerini Listele
```bash
# Özellikler
docker compose exec backend sqlite3 /app/data/nexaven.db "SELECT * FROM features;"

# Araçlar
docker compose exec backend sqlite3 /app/data/nexaven.db "SELECT * FROM vehicles;"

# Fiyatlandırma
docker compose exec backend sqlite3 /app/data/nexaven.db "SELECT * FROM pricing;"

# İndirmeler
docker compose exec backend sqlite3 /app/data/nexaven.db "SELECT * FROM downloads;"
```

### Database Backup
```bash
# Backup oluştur
docker compose exec backend sqlite3 /app/data/nexaven.db ".backup /app/data/nexaven-backup-$(date +%Y%m%d).db"

# Backup'ı locale kopyala
docker cp nexaven-backend:/app/data/nexaven-backup-*.db ./
```

---

## 🔄 Güncelleme ve Deployment

### Tam Deployment Süreci
```bash
# 1. VPS'e bağlan
ssh root@nexaven.com.tr

# 2. Proje dizinine git
cd ~/nexavenv2

# 3. Değişiklikleri çek
git pull origin main

# 4. Container'ları durdur
docker compose down

# 5. Yeniden build et (cache kullanmadan)
docker compose build --no-cache

# 6. Başlat
docker compose up -d

# 7. Logları kontrol et
docker compose logs -f
```

### Hızlı Güncelleme (Cache ile)
```bash
cd ~/nexavenv2 && git pull && docker compose up -d --build
```

---

## 🧹 Temizlik İşlemleri

### Kullanılmayan Docker Kaynaklarını Temizle
```bash
# Tüm kullanılmayan kaynakları temizle
docker system prune -a --volumes

# Sadece kullanılmayan image'ları temizle
docker image prune -a

# Container loglarını temizle
truncate -s 0 /var/lib/docker/containers/**/*-json.log
```

### Disk Kullanımını Kontrol Et
```bash
# Docker disk kullanımı
docker system df

# Sunucu disk kullanımı
df -h
```

---

## 🔍 Hata Ayıklama

### Backend API Test
```bash
# Health check
curl http://localhost:5000/api/

# CMS içeriği
curl http://localhost:5000/api/cms
```

### Frontend Test
```bash
# Container içinde nginx config kontrol
docker compose exec frontend nginx -t

# Static dosyaları kontrol
docker compose exec frontend ls -la /usr/share/nginx/html/
```

### Nginx Test
```bash
# Config syntax kontrolü
docker compose exec nginx nginx -t

# Config'i reload et
docker compose exec nginx nginx -s reload
```

### Network Kontrol
```bash
# Port dinlemelerini kontrol et
netstat -tlnp | grep -E '80|443|5000'

# Veya
ss -tlnp | grep -E '80|443|5000'
```

---

## ⚡ Sık Kullanılan Komutlar

```bash
# Admin oluştur
cd ~/nexavenv2 && docker compose exec backend node -e "const bcrypt=require('bcrypt');const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('./data/nexaven.db');const hashed=bcrypt.hashSync('EnsYhy2394+',10);db.run('INSERT INTO users(username,password)VALUES(?,?)',['kbozurdilerim',hashed],err=>console.log(err||'✅ Admin oluşturuldu!'));"

# SSL yenile
cd ~/nexavenv2 && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload

# Container'ları yeniden başlat
cd ~/nexavenv2 && docker compose restart

# Logları izle
cd ~/nexavenv2 && docker compose logs -f

# Git pull + rebuild
cd ~/nexavenv2 && git pull && docker compose down && docker compose up -d --build

# Database backup
docker cp nexaven-backend:/app/data/nexaven.db ~/backup-$(date +%Y%m%d).db
```

---

## 📞 Destek

Sorun yaşarsanız:
1. `docker compose logs -f` ile logları kontrol edin
2. `docker compose ps` ile container durumlarını kontrol edin
3. Browser cache'ini temizleyin (Ctrl+Shift+Delete)
4. Private/Incognito modda test edin

**Önemli:** Şifre ve kullanıcı adı bilgilerini güvenli bir yerde saklayın!
