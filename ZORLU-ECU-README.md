# Zorlu ECU & AI Pipeline

## Kurulum (Lokal Geliştirme)

```bash
# Backend
cd backend
npm install
npm start

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

Adresleri ziyaret et:
- Frontend: http://localhost:3000
- Zorlu ECU: http://localhost:3000/zorlu.ecu/login
- Backend API: http://localhost:5000/api

## Özellikler

### 1. Python AI Worker + Job Queue
- `backend/src/services/aiWorker.js`: Job queue management
- `ai_worker.py`: Python worker script
- Queue sistemi: Her 2 saniyede bir queued job'ları işle
- Status: `queued` → `processing` → `completed`/`failed`

### 2. RBAC Admin Panel
- `/api/admin/users`: Kullanıcı listesi ve rol yönetimi
- `/api/admin/jobs`: Job logları ve detayları
- `/api/admin/files`: Dosya inceleme
- `/api/admin/stats`: İstatistikler
- Frontend: `/zorlu.ecu/admin` (sadece admin role)

### 3. File Metadata & Auto-Match
- Dosya yükleme sırasında otomatik meta veri çıkarımı
  - ECU tipi: Dosya boyutundan tahmin (Stage1, Stage2, Full)
  - Version: Dosya adından parse
- Eşleştirme önerileri: Aynı ECU type'taki dosyalar otomatik önerilir
- Kullanıcıyı kliğe taşınarak eşleştirmeyi hızlı başlat

### 4. Real Progress Tracking (SSE)
- Server-Sent Events: `/api/sse/subscribe/:jobId`
- Job status güncellemeleri realtime taşınır
- Frontend Tuning sayfasında: Progress log + final result
- Durum: queued, processing, completed, failed, error

## Docker Deploy

```bash
docker compose build --no-cache
docker compose up -d
docker compose logs -f backend frontend --tail=50
```

## Test Komutları

```bash
# Kayıt
curl -X POST http://localhost:5000/api/register/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@mail.com","password":"pass123","userType":"individual"}'

# Giriş
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"pass123"}'
# Token kaydet: TOKEN=...

# Dosya yükle
curl -X POST http://localhost:5000/api/zorlu-ecu/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/ecu.bin"

# Tuning başlat
curl -X POST http://localhost:5000/api/zorlu-ecu/tuning \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"strategy":"default","parameters":{"boost":1.1}}'

# Job status (polling)
curl http://localhost:5000/api/zorlu-ecu/tuning/1 \
  -H "Authorization: Bearer $TOKEN"

# SSE subscribe (realtime)
curl http://localhost:5000/api/sse/subscribe/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Sunucuya Deploy (SSH)

```powershell
ssh <user>@<host>
cd /path/to/nexaven
git pull origin main
docker compose build --no-cache backend frontend
docker compose up -d
docker compose logs -f backend frontend nginx --tail=100
```

Test: https://nexaven.com.tr/zorlu.ecu/dashboard

---

**Yapılan Değişiklikler:**

- ✅ Backend: Python worker, job queue, RBAC admin routes, SSE endpoints
- ✅ Frontend: Admin panel (users/roles/jobs/files), file metadata UI, auto-match önerileri, SSE progress tracking
- ✅ Veritabanı: ecu_files meta veri alanları, tuning_jobs queue
- ✅ Theme: Dark mode (kırmızı-beyaz-turuncu) tüm bölümlerde
