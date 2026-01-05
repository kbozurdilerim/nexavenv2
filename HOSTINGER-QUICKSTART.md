# 🚀 Hostinger VPS - Hızlı Başlangıç Kılavuzu

Bu kılavuz, **Hostinger Web Panel** ve **SSH** ile Nexaven kurulumu için adım adım talimatlar içerir.

---

## 📋 Gereksinimler

- ✅ Hostinger VPS hesabı
- ✅ Domain (nexaven.com.tr) 
- ✅ GitHub repo: https://github.com/kbozurdilerim/nexavenv2

---

## 🎯 Kurulum Yöntemleri

### 🌐 YÖNTEM 1: Web Panel (Kolay - Önerilen)

### 🔑 YÖNTEM 2: SSH Terminal (Gelişmiş)

Her iki yöntem de aynı sonucu verir. Web panel çalışmazsa SSH kullanın.

---

## 🌐 YÖNTEM 1: WEB PANEL KURULUMU

### ADIM 1: VPS Paneline Giriş

1. Tarayıcıda https://hpanel.hostinger.com açın
2. Giriş yapın
3. Sol menüden **"VPS"** seçin
4. VPS'inizi seçin

### ADIM 2: Web Terminal Açma

VPS dashboard'da:
- **"Browser Terminal"** butonuna tıklayın
- Veya **"Access"** → **"Browser terminal"** seçin
- Terminal penceresi açılacak (siyah ekran)

### ADIM 3: Docker Kurulumu (Web Terminal'de)

Terminal açıldığında sırasıyla komutları girin:

```bash
# Sistem güncelleme
apt update && apt upgrade -y
```

**⏳ Bekleyin**: 2-5 dakika sürebilir. Bitince yeni komut istemi gelir.

```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**⏳ Bekleyin**: 3-5 dakika.

```bash
# Docker Compose kurulumu
apt-get install docker-compose-plugin -y
```

```bash
# Docker'ı başlat
systemctl start docker
systemctl enable docker
```

```bash
# Kurulumu doğrula
docker --version
docker compose version
```

✅ Version numaraları görüyorsanız başarılı!

### ADIM 4: Git Kurulumu

```bash
apt install git -y
```

### ADIM 5: Projeyi Klonlama

```bash
# Home dizinine git
cd ~

# Projeyi klonla
git clone https://github.com/kbozurdilerim/nexavenv2.git

# Klasöre gir
cd nexavenv2
```

### ADIM 6: Ortam Değişkenleri

```bash
# .env dosyasını düzenle
nano .env
```

Açılan editörde:
- `JWT_SECRET=` satırını bulun
- Güçlü bir şifre yazın (örn: `MyS3cr3tK3y!2026_Nexaven`)
- **Ctrl+X** → **Y** → **Enter** ile kaydedin

### ADIM 7: Docker Başlatma

```bash
docker compose up -d --build
```

**⏳ Bekleyin**: İlk build 5-10 dakika sürer.

```bash
# Servisleri kontrol et
docker compose ps
```

✅ Tüm servisler "running" olmalı!

### ADIM 8: SSL Sertifikası

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

✅ "Congratulations" mesajı görürseniz başarılı!

```bash
# Nginx'i yeniden başlat
docker compose restart nginx
```

### ADIM 9: Test

Tarayıcıda açın: **https://nexaven.com.tr**

🎉 **Başarılı!** Yeşil kilit görmelisiniz.

---

## 🔑 YÖNTEM 2: SSH TERMINAL KURULUMU

### ADIM 1: SSH Bilgilerini Alma

1. Hostinger VPS panel → **"SSH Access"**
2. Not alın:
   - **IP Address**: `123.456.789.0`
   - **Username**: `root`
   - **Port**: `22`

### ADIM 2: Windows'tan SSH Bağlantısı

**PowerShell** açın:

```powershell
ssh root@VPS_IP_ADRESI
```

Örnek:
```powershell
ssh root@123.456.789.0
```

İlk bağlantıda:
```
Are you sure you want to continue connecting (yes/no)?
```

**yes** yazın ve Enter.

Şifre istesin. Hostinger panelinden aldığınız root şifresini girin.

✅ Giriş yaptınız!

### ADIM 3-9: Aynı Komutlar

Yukarıdaki **Web Panel** adımlarındaki **ADIM 3'ten ADIM 9'a** kadar olan tüm komutları sırasıyla çalıştırın.

---

## 🔒 SSL Otomatik Yenileme (Her İki Yöntemde Aynı)

Terminal'de (Web veya SSH):

```bash
crontab -e
```

İlk kez açıyorsanız editor seçin: **1** (nano) seçin.

En alta ekleyin:

```
0 3 * * * cd ~/nexavenv2 && docker compose run --rm certbot renew && docker compose restart nginx
```

**Ctrl+X** → **Y** → **Enter** ile kaydedin.

---

## 👨‍💼 Admin Kullanıcısı Oluşturma

### Web Terminal veya SSH'den:

```bash
docker exec -it nexaven-backend sh
```

```bash
node
```

Şu kodu yapıştırın ve Enter:

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

## 🎮 Giriş Yapma

1. **https://nexaven.com.tr/login**
2. Kullanıcı: `admin`
3. Şifre: `admin123`

✅ Admin panele giriş yaptınız!

---

## 📊 Kullanışlı Komutlar

### Servisleri İzleme

```bash
cd ~/nexavenv2
docker compose logs -f
```

(`Ctrl+C` ile çıkın)

### Servisleri Yeniden Başlatma

```bash
cd ~/nexavenv2
docker compose restart
```

### Servisleri Durdurma

```bash
docker compose down
```

### Yeniden Başlatma

```bash
docker compose up -d
```

### Disk Kullanımı

```bash
df -h
```

### Docker Temizliği (Yer Açma)

```bash
docker system prune -a
```

---

## 🆘 Sorun Giderme

### Problem: Web terminal açılmıyor

**Çözüm**: SSH yöntemini kullanın.

### Problem: Docker komutu çalışmıyor

```bash
systemctl status docker
systemctl start docker
```

### Problem: Port 80/443 meşgul

```bash
# Çakışan servisi bulun
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Varsa durdurun
systemctl stop apache2
systemctl stop nginx
```

### Problem: SSL sertifikası alınamıyor

1. Domain DNS'i doğru mu kontrol edin:
```bash
ping nexaven.com.tr
```

2. Firewall kontrolü:
```bash
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

3. Tekrar deneyin

### Problem: Servisler başlamıyor

```bash
cd ~/nexavenv2
docker compose down
docker compose up -d --build
docker compose logs -f
```

---

## 🌟 Web Panel vs SSH - Hangisi Daha İyi?

| Özellik | Web Panel | SSH |
|---------|-----------|-----|
| Kurulum | ⭐⭐⭐⭐⭐ Çok Kolay | ⭐⭐⭐ Orta |
| Hız | ⭐⭐⭐ Yavaş olabilir | ⭐⭐⭐⭐⭐ Hızlı |
| Güvenlik | ⭐⭐⭐⭐ İyi | ⭐⭐⭐⭐⭐ En İyi |
| Önerilen | İlk kurulum için | Profesyonel kullanım |

**İpucu**: İlk kurulumlarda Web Panel deneyin. Sorun olursa SSH'e geçin.

---

## ✅ Kurulum Tamamlandı!

Artık Nexaven production ortamında çalışıyor:

- 🌐 Website: https://nexaven.com.tr
- 🔐 Admin: https://nexaven.com.tr/login
- 📡 API: https://nexaven.com.tr/api

**Başarılar!** 🚀
