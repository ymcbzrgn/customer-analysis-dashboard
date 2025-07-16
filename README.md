# Customer Analysis Dashboard

Enterprise PostgreSQL + Next.js müşteri analiz platformu.

## 🚀 Kurulum

### Gereksinimler
- Windows 11/10 + WSL2
- Docker Desktop
- Node.js 18+

### Adımlar

```bash
# 1. WSL2 Kurulumu (PowerShell - Yönetici)
wsl --install
wsl --set-default-version 2

# 2. Docker Desktop Kurulumu
# https://docs.docker.com/desktop/install/windows-install/
# WSL2 backend etkinleştir

# 3. WSL2 Terminal
wsl
cd /mnt/c/Users/[KULLANICI_ADI]/Downloads
git clone [REPO_URL]
cd customer-analysis-dashboard

# 4. Node.js Kurulumu (WSL2 içinde)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Çalıştırma
npm run db:start
npm install --legacy-peer-deps
npm run dev
```

## 📱 Erişim

- **App**: http://localhost:3000
- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123
- **pgAdmin**: http://localhost:8080

## 🔧 Komutlar

```bash
# Başlat
npm run db:start && npm install --legacy-peer-deps && npm run dev

# Durdur
npm run db:stop

# Reset
npm run db:reset

# Logs
docker-compose logs -f
```

## 🛠️ Sorun Giderme

### Docker Sorunu
```bash
docker version
docker-compose ps
docker-compose restart
```

### Port Çakışması
```bash
netstat -ano | findstr :5432
netstat -ano | findstr :8080
# docker-compose.yml'de port değiştir
```

### WSL2 Sorunu
```bash
wsl --shutdown
wsl
docker context use default
```

### npm Sorunu
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📊 Özellikler

### ✅ Çalışır Durumda
- JWT Authentication
- User Management (PostgreSQL)
- Data Library (Charts/Tables)
- Role-based Access Control

### 🚧 Geliştirme Aşamasında
- Customer Management (PostgreSQL migration)
- Dashboard Analytics
- Real-time KPIs

## 🏗️ Teknoloji

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API, PostgreSQL
- **Auth**: JWT + bcrypt
- **Container**: Docker Compose

## 📁 Dosya Yapısı

```
app/api/          # API endpoints
app/dashboard/    # Dashboard pages
components/       # UI components
lib/             # Database & utilities
database/        # PostgreSQL setup
```

## 🔑 Veritabanı

```bash
# Erişim
docker exec -it customer_analysis_postgres psql -U postgres -d customer_analysis_db

# Backup
docker exec customer_analysis_postgres pg_dump -U postgres customer_analysis_db > backup.sql

# Restore
docker exec -i customer_analysis_postgres psql -U postgres customer_analysis_db < backup.sql
```

## 📞 Destek

**Yaygın Sorunlar:**
- Docker Desktop çalışmıyor → Yeniden başlat
- Port çakışması → docker-compose.yml'de port değiştir
- WSL2 sorunu → `wsl --shutdown && wsl`
- npm sorunu → Cache temizle, yeniden kur

**Hızlı Test:**
```bash
# Herşey çalışıyor mu?
docker-compose ps
curl http://localhost:3000
curl http://localhost:8080
```

---

**Hızlı Başlangıç**: `npm run db:start && npm install --legacy-peer-deps && npm run dev`