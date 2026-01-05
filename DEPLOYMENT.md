# 🚀 NEXAVEN DEPLOYMENT KILAVUZU

Bu kılavuz, Nexaven'i GitHub'dan Hostinger VPS'e deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- ✅ GitHub hesabı
- ✅ Hostinger VPS (Ubuntu 20.04/22.04 önerilir)
- ✅ Domain (nexaven.com.tr)
- ✅ SSH erişimi

## 🎯 ADIM 1: GitHub'a Yükleme

### 1.1 GitHub'da Yeni Repo Oluşturun

✅ Reponuz hazır: https://github.com/kbozurdilerim/nexavenv2

Eğer yeni repo oluşturmak isterseniz:
1. GitHub'a gidin: https://github.com/new
2. Repository adı: `nexavenv2`
3. Private veya Public seçin
4. **"Create repository"** tıklayın

### 1.2 Local Projeyi GitHub'a Push Edin

```bash
# Proje klasörüne gidin
cd "a:\chatgp nexaven"

# Git initialize
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit - Nexaven production ready"

# Ana branch'i main olarak ayarla
git branch -M main

# Remote repository ekle
git remote add origin https://github.com/kbozurdilerim/nexavenv2.git

# GitHub'a push et
git push -u origin main
```

✅ Artık projeniz GitHub'da!

---

## 🖥️ ADIM 2: Hostinger VPS Hazırlığı

### 2.1 VPS'e Bağlanma (2 Yöntem)

#### 🌐 YÖNTEM 1: Web Panel (Önerilen - İlk Deneme)

1. Hostinger'a giriş yapın: https://hpanel.hostinger.com
2. Sol menüden **"VPS"** seçin
3. VPS'inizi seçin
4. **"Browser Terminal"** veya **"Web SSH"** butonuna tıklayın
5. Terminal açılacak - direkt komut girebilirsiniz!

#### 🔑 YÖNTEM 2: SSH Terminal (Çalışmazsa)

Windows PowerShell veya terminal açın:

```bash
ssh root@VPS_IP_ADRESI
```

**Not**: İlk bağlantıda "Are you sure?" sorusu gelirse `yes` yazın.

---

## 🐳 ADIM 2A: Web Panel ile Hızlı Kurulum (Alternatif)

Eğer SSH kullanmak istemiyorsanız, Hostinger Web Panel'den de Docker kurabilirsiniz:

### Hostinger VPS Panel Üzerinden

1. **VPS Dashboard** → **Operating System** → **Docker** seçeneğini bulun
2. Bazı planlarda Docker pre-installed olabilir
3. Veya **Applications** → **Docker** → **Install** seçeneği olabilir

### Web Terminal'den Kurulum

Web terminal açıksa (Browser Terminal), doğrudan şu komutları çalıştırın:

```bash
# Docker kurulum script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose
apt-get install docker-compose-plugin -y

# Kontrol
docker --version
docker compose version
```

**Not**: Web terminal çalışmazsa veya yavaşsa, SSH yöntemini kullanın.

---

```bash
apt update && apt upgrade -y
```

### 2.3 Docker Kurulumu

```bash
# Docker'ı kur
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose'u kur
apt-get install docker-compose-plugin -y

# Docker'ı başlat
systemctl start docker
systemctl enable docker

# Kurulumu doğrula
docker --version
docker compose version
```

### 2.4 Git Kurulumu

```bash
apt install git -y
```

---

## 🌐 ADIM 3: Domain Ayarları

### 3.1 Hostinger Domain Paneli

1. Hostinger panelde **Domain** bölümüne gidin
2. `nexaven.com.tr` için **DNS Zone** açın
3. Şu kayıtları ekleyin:

```
Type: A
Name: @
Value: VPS_IP_ADRESINIZ
TTL: 3600

Type: A
Name: www
Value: VPS_IP_ADRESINIZ
TTL: 3600
```

4. Kaydet ve DNS propagation için 5-30 dakika bekleyin

### 3.2 DNS Kontrolü

```bash
# Local bilgisayarınızda test edin
ping nexaven.com.tr
```

---

## 📦 ADIM 4: Projeyi VPS'e Deploy Etme

### 4.1 Projeyi Klonlayın

```bash
# Home dizinine gidin
cd ~

# GitHub'dan klonlayın
git clone https://github.com/kbozurdilerim/nexavenv2.git

# Proje klasörüne girin
cd nexavenv2
```

### 4.2 Ortam Değişkenlerini Ayarlayın

```bash
# .env dosyasını düzenleyin
nano .env
```

Güçlü bir JWT secret yazın:

```env
JWT_SECRET=BURAYA_COK_GUCLU_BIR_ANAHTAR_YAZIN_12345ABCDEF
```

`Ctrl+X`, `Y`, `Enter` ile kaydedin.

### 4.3 Docker Compose ile Başlatın

```bash
# Servisleri build edin ve başlatın
docker compose up -d --build
```

İlk build 5-10 dakika sürebilir. Logları izleyin:

```bash
docker compose logs -f
```

`Ctrl+C` ile çıkın.

### 4.4 Servislerin Durumunu Kontrol Edin

```bash
docker compose ps
```

Tüm servisler **"running"** olmalı.

---

## 🔒 ADIM 5: SSL Sertifikası Kurulumu

### 5.1 Nginx'i Başlatın

```bash
docker compose up -d nginx
```

### 5.2 Let's Encrypt Sertifikası Alın

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

### 5.3 Nginx'i Yeniden Başlatın

```bash
docker compose restart nginx
```

### 5.4 HTTPS Testı

Tarayıcıda açın: https://nexaven.com.tr

🔒 **Yeşil kilit** görmelisiniz!

---

## 👨‍💼 ADIM 6: İlk Admin Kullanıcısı Oluşturma

### 6.1 Backend Container'a Girin

```bash
docker exec -it nexaven-backend sh
```

### 6.2 Admin Kullanıcısı Oluşturun

```bash
node
```

Şu kodu yapıştırın (Enter'a basın):

```javascript
const bcrypt = require('bcrypt');
const db = require('./src/db/sqlite');

bcrypt.hash('admin123', 10, (err, hash) => {
  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    ['admin', hash, 'admin'],
    () => {
      console.log('✅ Admin kullanıcısı oluşturuldu!');
      process.exit();
    }
  );
});
```

### 6.3 Container'dan Çıkın

```bash
exit
```

---

## 🎉 ADIM 7: Admin Panele Giriş

1. Tarayıcıda açın: **https://nexaven.com.tr/login**
2. Giriş yapın:
   - **Kullanıcı**: `admin`
   - **Şifre**: `admin123`
3. Admin panelde:
   - İlk lisansınızı oluşturun
   - Sistemi test edin

---

## 🔄 ADIM 8: SSL Otomatik Yenileme

### 8.1 Crontab Ekleyin

```bash
crontab -e
```

En alta ekleyin:

```
0 3 * * * cd ~/nexaven && docker compose run --rm certbot renew && docker compose restart nginx >> /var/log/certbot-renew.log 2>&1
```

Kaydedin ve çıkın.

---

## 🔥 BONUS: Firewall Güvenliği

### UFW ile Port Güvenliği

```bash
# UFW'yi kur
apt install ufw -y

# Temel portları aç
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS

# Firewall'ı aktif et
ufw enable

# Durumu kontrol et
ufw status
```

---

## 📊 Deployment Sonrası Kontroller

### ✅ Kontrol Listesi

- [ ] https://nexaven.com.tr açılıyor
- [ ] SSL sertifikası geçerli (yeşil kilit)
- [ ] Admin paneline giriş yapabiliyorum
- [ ] Yeni lisans oluşturabiliyorum
- [ ] Lisans doğrulama API'si çalışıyor
- [ ] Docker compose servisleri running

### Test Komutları

```bash
# Servis durumu
docker compose ps

# Backend sağlık kontrolü
curl http://localhost:5000

# Frontend kontrolü
curl http://localhost

# SSL kontrolü
curl -I https://nexaven.com.tr

# Lisans API testi
curl -X POST https://nexaven.com.tr/api/license/check \
  -H "Content-Type: application/json" \
  -d '{"license_key":"TEST-123","hwid":"TEST-HWID"}'
```

---

## 🆘 Sorun Giderme

### Problem: Docker servisleri başlamıyor

```bash
docker compose down
docker compose up -d --build
docker compose logs -f
```

### Problem: SSL sertifikası alınamıyor

1. Domain DNS'inin doğru olduğundan emin olun
2. VPS'ten 80 ve 443 portlarının açık olduğunu kontrol edin
3. Tekrar deneyin:

```bash
docker compose down
docker compose up -d nginx
docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d nexaven.com.tr -d www.nexaven.com.tr --email admin@nexaven.com.tr --agree-tos --no-eff-email
docker compose restart nginx
```

### Problem: Admin giriş yapamiyor

Backend container'a girip veritabanını kontrol edin:

```bash
docker exec -it nexaven-backend sh
ls -la data/
sqlite3 data/nexaven.db "SELECT * FROM users;"
exit
```

---

## 🔄 Güncelleme (Yeni Kod Push Etme)

GitHub'a yeni kod push ettikten sonra VPS'te:

```bash
cd ~/nexavenv2
git pull origin main
docker compose down
docker compose up -d --build
```

---

## 🎯 Deployment Tamamlandı!

Artık Nexaven production ortamında çalışıyor! 🚀

- 🌐 **Website**: https://nexaven.com.tr
- 🔐 **Admin Panel**: https://nexaven.com.tr/login
- 📡 **API**: https://nexaven.com.tr/api

İyi çalışmalar! 💪

---

## 📞 Yardım İhtiyacı

Sorun yaşıyorsanız:

1. Logları kontrol edin: `docker compose logs -f`
2. GitHub Issues açın
3. VPS loglarını kontrol edin: `/var/log/`

