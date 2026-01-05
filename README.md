# 🏎️ NEXAVEN - Assetto Corsa Lisans Yönetim Platformu

Production-ready Docker Compose tabanlı lisans yönetim sistemi.

## ✨ Özellikler

- 🔐 **HWID Bazlı Lisans Kilitleme** - Her lisans bir donanıma kilitlenir
- ⏰ **Süreli Lisans Desteği** - Gün bazlı veya süresiz lisans oluşturma
- 👨‍💼 **Admin Panel** - Modern ve kullanıcı dostu yönetim arayüzü
- 🎮 **Assetto Corsa Entegrasyonu** - REST API ile oyun sunucularına entegrasyon
- 🔒 **HTTPS & SSL** - Let's Encrypt ile otomatik SSL sertifikası
- 🚀 **Docker Compose** - Tek komutla çalışır durum
- 🛡️ **Rate Limiting** - DDoS koruması ve istismar önleme

## 📁 Proje Yapısı

```
nexaven/
├── docker-compose.yml       # Container orkestrasyon
├── .env                      # Gizli anahtarlar
├── .gitignore               # Git ignore kuralları
├── nginx/
│   └── nginx.conf           # Reverse proxy yapılandırması
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js        # Express sunucu
│       ├── db/
│       │   └── sqlite.js    # SQLite veritabanı
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── rateLimit.js
│       └── routes/
│           ├── auth.js      # Kullanıcı girişi
│           ├── license.js   # Admin CRUD
│           └── licenseCheck.js # Client doğrulama
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            └── Admin.jsx
```

## 🚀 Hızlı Başlangıç

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/kullanici-adiniz/nexaven.git
cd nexaven
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env` dosyasını düzenleyin ve güçlü bir JWT secret belirleyin:

```env
JWT_SECRET=BURAYA_GUCLUK_BIR_ANAHTAR_YAZIN
```

### 3. Docker Compose ile Başlatın

```bash
docker compose up -d
```

Servisler şu portlarda çalışmaya başlar:
- **Frontend**: http://localhost (port 80)
- **Backend**: http://localhost:5000
- **HTTPS**: 443 (SSL yapılandırıldıktan sonra)

## 🔒 SSL Sertifikası Kurulumu

### İlk Sertifika Alımı

```bash
# Nginx'i başlat
docker compose up -d nginx

# Let's Encrypt sertifikası al
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d nexaven.com.tr \
  -d www.nexaven.com.tr \
  --email admin@nexaven.com.tr \
  --agree-tos \
  --no-eff-email

# Nginx'i yeniden başlat
docker compose restart nginx
```

### Otomatik Yenileme (Crontab)

VPS sunucunuzda crontab'a ekleyin:

```bash
crontab -e
```

Şu satırı ekleyin (her gün sabah 3'te kontrol eder):

```
0 3 * * * cd /path/to/nexaven && docker compose run --rm certbot renew && docker compose restart nginx
```

## 👨‍💼 İlk Admin Kullanıcısı Oluşturma

Backend container'ına bağlanın ve admin kullanıcısı oluşturun:

```bash
docker exec -it nexaven-backend sh
```

Node.js ile şifre hash'leyin ve veritabanına ekleyin:

```javascript
// Container içinde Node.js çalıştırın
node

const bcrypt = require('bcrypt');
const db = require('./src/db/sqlite');

bcrypt.hash('admin123', 10, (err, hash) => {
  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    ['admin', hash, 'admin'],
    () => {
      console.log('Admin kullanıcısı oluşturuldu!');
      process.exit();
    }
  );
});
```

Artık şu bilgilerle giriş yapabilirsiniz:
- **Kullanıcı**: admin
- **Şifre**: admin123

## 🎮 API Kullanımı

### Lisans Doğrulama (Client/Game Server)

**Endpoint**: `POST /api/license/check`

**Request**:
```json
{
  "license_key": "NXV-AC-2026-001",
  "hwid": "CPU-SSD-MAC-HASH"
}
```

**Response (Geçerli)**:
```json
{
  "valid": true,
  "owner": "Flamingo Game Arena",
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

**Response (Geçersiz)**:
```json
{
  "valid": false,
  "reason": "HWID uyuşmazlığı"
}
```

### Örnek C# Kullanımı

```csharp
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;

var client = new HttpClient();
var payload = new {
    license_key = "NXV-AC-2026-001",
    hwid = GetHardwareID()
};

var content = new StringContent(
    JsonConvert.SerializeObject(payload),
    Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync(
    "https://nexaven.com.tr/api/license/check",
    content
);

var result = await response.Content.ReadAsStringAsync();
var data = JsonConvert.DeserializeObject<LicenseResponse>(result);

if (data.valid) {
    // Lisans geçerli
} else {
    // Lisans geçersiz
}
```

## 🔧 Maintenance Komutları

### Logları İzleme

```bash
# Tüm servisler
docker compose logs -f

# Sadece backend
docker compose logs -f backend

# Sadece frontend
docker compose logs -f frontend
```

### Servisleri Yeniden Başlatma

```bash
docker compose restart
```

### Servisleri Durdurma

```bash
docker compose down
```

### Servisleri Silme (Veritabanı dahil)

```bash
docker compose down -v
```

### Veritabanı Yedekleme

```bash
docker exec nexaven-backend cat /app/data/nexaven.db > backup-$(date +%Y%m%d).db
```

## 🛠️ Geliştirme Modu

Local development için:

```bash
# Backend
cd backend
npm install
npm start

# Frontend (ayrı terminalde)
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

## 📊 Admin Panel Kullanımı

1. Tarayıcıda `https://nexaven.com.tr/login` adresine gidin
2. Admin kullanıcı bilgilerinizle giriş yapın
3. Admin panelde:
   - Yeni lisans oluşturabilirsiniz
   - Mevcut lisansları görüntüleyebilirsiniz
   - Hangi lisansların hangi HWID'lere bağlı olduğunu görebilirsiniz
   - Lisans sürelerini takip edebilirsiniz

## 🌐 Domain Ayarları

Hostinger veya başka bir domain sağlayıcısında A kaydı ekleyin:

```
Tip: A
Host: @
Value: VPS_IP_ADRESINIZ
TTL: 3600

Tip: A
Host: www
Value: VPS_IP_ADRESINIZ
TTL: 3600
```

## 🔐 Güvenlik Önerileri

1. ✅ `.env` dosyasındaki JWT_SECRET'ı güçlü bir değere değiştirin
2. ✅ İlk admin şifresini değiştirin
3. ✅ Sadece HTTPS kullanın (HTTP otomatik yönlendirilir)
4. ✅ Rate limiting aktif (dakikada 5 lisans kontrolü)
5. ✅ Veritabanını düzenli yedekleyin
6. ✅ UFW veya iptables ile port güvenliği sağlayın

## 📝 GitHub'a Deploy

```bash
git init
git add .
git commit -m "Initial Nexaven commit"
git branch -M main
git remote add origin https://github.com/kullanici-adiniz/nexaven.git
git push -u origin main
```

## 🎯 VPS'te Kurulum (Hostinger)

1. VPS'e SSH ile bağlanın
2. Docker ve Docker Compose'u yükleyin:

```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose kurulumu
apt-get install docker-compose-plugin
```

3. Projeyi klonlayın ve başlatın:

```bash
git clone https://github.com/kullanici-adiniz/nexaven.git
cd nexaven
docker compose up -d
```

## 🆘 Sorun Giderme

### Backend bağlanamıyor

```bash
docker compose logs backend
```

### Frontend yüklenmiyor

```bash
docker compose logs frontend
```

### SSL sertifikası hatası

```bash
docker compose logs nginx
docker compose logs certbot
```

### Veritabanı hatası

```bash
docker exec -it nexaven-backend ls -la /app/data
```

## 📄 Lisans

MIT License - Ticari kullanım serbesttir.

## 🤝 Destek

- GitHub Issues: [github.com/kullanici-adiniz/nexaven/issues](https://github.com/kullanici-adiniz/nexaven/issues)
- Email: admin@nexaven.com.tr

---

**Nexaven** - Production-ready Lisans Yönetim Platformu 🚀
