# Customer Analysis Dashboard

Enterprise PostgreSQL + Next.js müşteri analiz platformu.

## 🚀 Kurulum

### Gereksinimler
- Windows 11/10 + WSL2
- Docker Desktop (WSL2 entegrasyonu zorunlu)
- Node.js 18+

### Adımlar

```bash
# 1. WSL2 Kurulumu (PowerShell - Yönetici)
wsl --install
wsl --set-default-version 2

# 2. Docker Desktop Kurulumu
# https://docs.docker.com/desktop/install/windows-install/
# İndirip kurun, sonra:
# Docker Desktop > Settings > Resources > WSL Integration
# "Enable integration with my default WSL distro" ✓
# "Enable integration with additional distros: Ubuntu" ✓

# 3. WSL2 Terminal
wsl
cd /mnt/c/Users/[KULLANICI_ADI]/Desktop  # veya Downloads
git clone [REPO_URL]
cd customer-analysis-dashboard

# 4. Node.js Kurulumu (WSL2 içinde)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Docker Test (ÖNEMLİ!)
docker --version
docker-compose --version
# Bu komutlar çalışmazsa aşağıdaki düzeltmeleri uygulayın

# 6. Çalıştırma
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

### ❌ "docker-compose could not be found" Hatası

**Sorun**: WSL2'de docker-compose bulunamıyor

**Çözüm 1: Docker Desktop WSL2 Entegrasyonu**
```bash
# Docker Desktop açın
# Settings > Resources > WSL Integration
# "Enable integration with my default WSL distro" ✓
# "Enable integration with additional distros: Ubuntu" ✓
# Apply & Restart

# WSL2 yeniden başlatın
wsl --shutdown
wsl

# Test edin
docker --version
docker-compose --version
```

**Çözüm 2: Docker Desktop Yeniden Başlatma**
```bash
# Windows'da Docker Desktop'ı tamamen kapatın
# Docker Desktop'ı yeniden başlatın
# WSL2 terminali yeniden açın
wsl
cd /mnt/c/Users/[KULLANICI_ADI]/Desktop/customer-analysis-dashboard
docker-compose --version
```

**Çözüm 3: Manuel Docker Compose Kurulumu**
```bash
# WSL2 içinde
sudo apt update
sudo apt install docker-compose

# Test edin
docker-compose --version
```

### ❌ Docker Daemon Hatası

**Sorun**: Cannot connect to Docker daemon

**Çözüm**:
```bash
# Docker Desktop çalışıyor mu kontrol edin
# Windows'da Docker Desktop'ı başlatın
# WSL2 terminali yeniden açın
wsl
sudo service docker start  # gerekirse
```

### ❌ Port Çakışması
```bash
netstat -ano | findstr :5432
netstat -ano | findstr :8080
# docker-compose.yml'de port değiştir
```

### ❌ WSL2 Sorunu
```bash
wsl --shutdown
wsl
docker context use default
```

### ❌ npm Sorunu
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
# Docker çalışıyor mu?
docker --version
docker-compose --version

# Herşey çalışıyor mu?
docker-compose ps
curl http://localhost:3000
curl http://localhost:8080
```

## 🆘 Acil Durum Kurtarma

**Hiçbir şey çalışmıyorsa:**
```bash
# 1. Her şeyi sıfırla
wsl --shutdown
# Docker Desktop'ı tamamen kapat

# 2. Docker Desktop'ı yeniden başlat
# 3. WSL2 Integration'ı aktif et
# 4. Yeniden dene
wsl
cd /mnt/c/Users/[KULLANICI_ADI]/Desktop/customer-analysis-dashboard
docker-compose --version
npm run db:start
```

---

**Hızlı Başlangıç**: `docker-compose --version && npm run db:start && npm install --legacy-peer-deps && npm run dev`