# 🔧 Hostinger Docker Manager Sorun Giderme

## ❌ Sorun: `unknown flag: --quiet-build`

Hostinger'ın Docker Manager'ı bazı Docker Compose flag'lerini desteklemiyor.

## ✅ Çözüm: SSH ile Manuel Kurulum

Hostinger web panelindeki Docker Manager yerine **SSH** kullanarak manuel kurulum yapacağız.

---

## 🔑 SSH ile Adım Adım Kurulum

### 1. SSH Bağlantısı

Windows PowerShell açın:

```powershell
ssh root@VPS_IP_ADRESI
```

Şifre isteyin, Hostinger panelinden aldığınız root şifresini girin.

---

### 2. Sistem Hazırlığı

```bash
# Sistem güncelleme
apt update && apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose plugin
apt-get install docker-compose-plugin -y

# Docker'ı başlat
systemctl start docker
systemctl enable docker

# Git kurulumu
apt install git -y

# Kontrol
docker --version
docker compose version
```

---

### 3. Projeyi Klonlama

```bash
cd ~
git clone https://github.com/kbozurdilerim/nexavenv2.git
cd nexavenv2
```

---

### 4. Ortam Değişkenleri

```bash
nano .env
```

`.env` dosyasında güçlü bir JWT secret belirleyin:

```env
JWT_SECRET=BURAYA_GUCLU_SIFRE_2026_NexavenV2
```

`Ctrl+X` → `Y` → `Enter` ile kaydedin.

---

### 5. Docker Compose ile Build ve Başlatma

```bash
# Servisleri build et ve başlat
docker compose up -d --build

# İlerlemeyi izle
docker compose logs -f
```

**⏳ İlk build 5-10 dakika sürebilir.**

`Ctrl+C` ile loglardan çıkın.

---

### 6. Servisleri Kontrol Et

```bash
docker compose ps
```

Çıktıda tüm servisler **"running"** durumunda olmalı:

```
NAME                   STATUS          PORTS
nexaven-backend        Up              
nexaven-frontend       Up              
nexaven-nginx          Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

### 7. HTTP Testi (SSL öncesi)

Tarayıcıda test edin: **http://nexaven.com.tr**

Sayfa yükleniyorsa ✅ başarılı!

---

### 8. SSL Sertifikası Kurulumu

```bash
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d nexaven.com.tr \
  -d www.nexaven.com.tr \
  --email admin@nexaven.com.tr \
  --agree-tos \
  --no-eff-email
```

✅ "Congratulations" mesajını görün.

```bash
# Nginx'i yeniden başlat
docker compose restart nginx
```

---

### 9. HTTPS Testi

Tarayıcıda: **https://nexaven.com.tr**

🔒 Yeşil kilit görmelisiniz!

---

### 10. SSL Otomatik Yenileme

```bash
crontab -e
```

Editor seçin (1 = nano), en alta ekleyin:

```
0 3 * * * cd ~/nexavenv2 && docker compose run --rm certbot renew && docker compose restart nginx
```

Kaydet ve çık.

---

### 11. Admin Kullanıcısı Oluşturma

```bash
docker exec -it nexaven-backend sh
```

```bash
node
```

Şu kodu yapıştırın:

```javascript
const bcrypt = require('bcrypt');
const db = require('./src/db/sqlite');

bcrypt.hash('admin123', 10, (err, hash) => {
  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    ['admin', hash, 'admin'],
    () => {
      console.log('✅ Admin oluşturuldu!');
      process.exit();
    }
  );
});
```

✅ "Admin oluşturuldu!" mesajını görün.

```bash
exit
```

---

## 🎉 Kurulum Tamamlandı!

- 🌐 Website: https://nexaven.com.tr
- 🔐 Admin: https://nexaven.com.tr/login (admin / admin123)
- 📡 API: https://nexaven.com.tr/api

---

## 📊 Yararlı Komutlar

### Servisleri İzleme
```bash
cd ~/nexavenv2
docker compose logs -f
```

### Yeniden Başlatma
```bash
docker compose restart
```

### Durdurma
```bash
docker compose down
```

### Yeniden Build
```bash
docker compose down
docker compose up -d --build
```

### Disk Kullanımı
```bash
df -h
```

### Container İçine Girme
```bash
# Backend
docker exec -it nexaven-backend sh

# Frontend build kontrolü
docker exec -it nexaven-frontend sh
```

---

## 🆘 Sorun Giderme

### Backend başlamıyor

```bash
docker compose logs backend
```

### Frontend build hatası

```bash
docker compose logs frontend
```

### Port çakışması (80/443)

```bash
# Çakışan servisi bulun
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Apache varsa kaldırın
systemctl stop apache2
systemctl disable apache2
apt remove apache2 -y
```

### SSL sertifikası alınamıyor

```bash
# DNS kontrolü
ping nexaven.com.tr

# Firewall kontrolü
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### Veritabanı hatası

```bash
docker exec -it nexaven-backend sh
ls -la /app/data/
# nexaven.db dosyası olmalı
exit
```

---

## 🔄 Güncelleme (Yeni Kod)

GitHub'a yeni kod push ettikten sonra:

```bash
cd ~/nexavenv2
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 💡 Neden Hostinger Web Panel Çalışmadı?

1. **Eski Docker Compose**: Hostinger'ın Docker Manager'ı eski versiyonlar kullanabilir
2. **Custom Wrapper**: Özel build script'leri bazı flag'leri desteklemiyor
3. **Sınırlı Kontrol**: Web panel tam kontrole izin vermiyor

**Çözüm**: SSH ile manuel kurulum daha stabil ve kontrollü!

---

## ✅ SSH Avantajları

- ✅ Tam kontrol
- ✅ Hata mesajlarını görme
- ✅ Debug yapabilme
- ✅ Tüm Docker Compose özelliklerini kullanma
- ✅ Profesyonel yaklaşım

SSH ile kurulum yaptıktan sonra her şey sorunsuz çalışacak! 🚀
