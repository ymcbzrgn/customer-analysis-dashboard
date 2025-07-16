# Customer Analysis Dashboard

Modern müşteri analizi ve yönetimi platformu. PostgreSQL, Docker ve Next.js teknolojileri kullanılarak geliştirilmiş enterprise-grade çözüm.

## 📋 İçindekiler

- [🚀 Hızlı Başlangıç](#-hızlı-başlangıç)
- [📊 Proje Hakkında](#-proje-hakkında)
- [🛠️ Gereksinimler](#️-gereksinimler)
- [📥 Kurulum](#-kurulum)
- [🔧 Yapılandırma](#-yapılandırma)
- [🏃 Çalıştırma](#-çalıştırma)
- [🔑 Giriş Bilgileri](#-giriş-bilgileri)
- [🏗️ Proje Mimarisi](#️-proje-mimarisi)
- [📊 Özellikler](#-özellikler)
- [🔧 Geliştirme](#-geliştirme)
- [🗄️ Veritabanı](#️-veritabanı)
- [🛠️ Sorun Giderme](#️-sorun-giderme)
- [🔒 Güvenlik](#-güvenlik)
- [🚀 Deployment](#-deployment)

---

## 🚀 Hızlı Başlangıç

### Gerekli Yazılımlar
```bash
# Windows 11/10 gerekli
# WSL2 aktif olmalı
# Docker Desktop yüklü olmalı (WSL2 backend ile)
```

### 3 Dakikada Başlat
```bash
# 1. WSL2 terminali açın
wsl

# 2. Proje dizinine gidin
cd /mnt/c/Users/[KULLANICI_ADI]/Downloads/customer-analysis-dashboard

# 3. Veritabanını başlatın
npm run db:start

# 4. Bağımlılıkları kurun
npm install --legacy-peer-deps

# 5. Uygulamayı çalıştırın
npm run dev
```

### Erişim
- **Uygulama**: http://localhost:3000
- **Admin Panel**: admin@example.com / admin123
- **pgAdmin**: http://localhost:8080

---

## 📊 Proje Hakkında

### Ne İçeriyor?
- **Müşteri Yönetimi**: Lead tracking, scoring, durum yönetimi
- **Kullanıcı Sistemi**: Rol tabanlı erişim, oturum yönetimi
- **Veri Analizi**: Chart builder, data library, reporting
- **Dashboard**: Real-time analytics, KPI'lar
- **API**: RESTful endpoints, authentication

### Teknoloji Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI/UX**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 15, Docker
- **Auth**: JWT, bcrypt, session management
- **Tools**: Docker Compose, ESLint, Prettier

---

## 🛠️ Gereksinimler

### Sistem Gereksinimleri
- **OS**: Windows 11/10 (WSL2 destekli)
- **RAM**: Minimum 8GB, önerilen 16GB
- **Disk**: 10GB boş alan
- **Network**: İnternet bağlantısı

### Yazılım Gereksinimleri
- **WSL2**: Windows Subsystem for Linux 2
- **Docker Desktop**: WSL2 backend ile
- **Node.js**: 18+ (WSL2 içinde)
- **Git**: WSL2 içinde

---

## 📥 Kurulum

### 1. WSL2 Kurulumu

#### Windows'da WSL2 Aktifleştirme
```bash
# PowerShell'i yönetici olarak açın
wsl --install

# WSL2'yi default yapın
wsl --set-default-version 2

# Ubuntu kurun (gerekirse)
wsl --install -d Ubuntu

# WSL2 sürümünü kontrol edin
wsl -l -v
```

#### WSL2 Yapılandırması
```bash
# WSL2 terminal açın
wsl

# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Gerekli paketleri kurun
sudo apt install -y curl wget git build-essential
```

### 2. Docker Desktop Kurulumu

#### Windows'da Docker Desktop
```bash
# https://docs.docker.com/desktop/install/windows-install/
# Docker Desktop indirin ve kurun
# WSL2 backend seçeneğini etkinleştirin
# Docker Desktop'ı başlatın
```

#### Docker WSL2 Entegrasyonu
```bash
# Docker Desktop Settings > Resources > WSL Integration
# Enable integration with default WSL distro
# Enable integration with additional distros: Ubuntu
```

### 3. Node.js Kurulumu (WSL2 içinde)

#### Node.js 18+ Kurulumu
```bash
# WSL2 terminali
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyonu kontrol edin
node --version  # 18+ olmalı
npm --version   # 9+ olmalı
```

#### Alternatif: NVM ile Kurulum
```bash
# NVM kurun
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js 18 kurun
nvm install 18
nvm use 18
nvm alias default 18
```

### 4. Proje Klonlama

```bash
# WSL2 terminali
cd /mnt/c/Users/[KULLANICI_ADI]/Downloads
git clone [REPO_URL]
cd customer-analysis-dashboard

# İzinleri kontrol edin
ls -la
```

---

## 🔧 Yapılandırma

### Environment Variables
```bash
# .env.local dosyası oluşturun (gerekirse)
cp .env.example .env.local

# Temel yapılandırma
DATABASE_URL=postgresql://postgres:postgres_password_2024@localhost:5432/customer_analysis_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### Port Yapılandırması
```bash
# Eğer portlar çakışırsa docker-compose.yml'i düzenleyin
# PostgreSQL: 5432 -> 5433
# pgAdmin: 8080 -> 8081
# Next.js: 3000 (varsayılan)
```

---

## 🏃 Çalıştırma

### 1. Veritabanı Başlatma
```bash
# PostgreSQL + pgAdmin konteynerlerini başlatın
npm run db:start

# Konteyner durumunu kontrol edin
docker-compose ps

# Logları kontrol edin
docker-compose logs
```

### 2. Bağımlılıkları Kurma
```bash
# Package.json bağımlılıklarını kurun
npm install --legacy-peer-deps

# Kurulum problemlerinde
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 3. Uygulamayı Başlatma
```bash
# Development server başlatın
npm run dev

# Browser'da açın: http://localhost:3000
```

### 4. Veritabanı Kontrol
```bash
# pgAdmin'e gidin: http://localhost:8080
# Email: admin@customeranalysis.com
# Password: pgadmin_password_2024

# PostgreSQL bağlantısı otomatik yapılandırılmış olmalı
```

---

## 🔑 Giriş Bilgileri

### Test Kullanıcıları

#### Admin Kullanıcı
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin
- **Permissions**: Tam erişim (user management, customer CRUD, settings)

#### Normal Kullanıcı
- **Email**: user@example.com
- **Password**: user123
- **Role**: user
- **Permissions**: Customer okuma, analytics görüntüleme

### pgAdmin Erişimi
- **URL**: http://localhost:8080
- **Email**: admin@customeranalysis.com
- **Password**: pgadmin_password_2024

### Veritabanı Bağlantısı
- **Host**: localhost
- **Port**: 5432
- **Database**: customer_analysis_db
- **Username**: postgres
- **Password**: postgres_password_2024
- **Schema**: customer_analysis

---

## 🏗️ Proje Mimarisi

### Dosya Yapısı
```
customer-analysis-dashboard/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Authentication (login, register, verify)
│   │   ├── users/                # User management (CRUD, permissions)
│   │   ├── customers/            # Customer management (CRUD, status)
│   │   └── data-library/         # Charts and tables management
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── customers/            # Customer management UI
│   │   ├── data-library/         # Chart builder, data tables
│   │   └── settings/             # User settings
│   ├── login/                    # Login page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── data-library/             # Chart builders, data grids
│   └── ProtectedRoute.tsx        # Route protection
├── lib/                          # Utility libraries
│   ├── database-postgres.ts      # PostgreSQL operations
│   ├── database-client.ts        # Client-side API calls
│   ├── auth.ts                   # Authentication utilities
│   └── validation.ts             # Form validation schemas
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication state
├── database/                     # Database setup
│   ├── init/                     # SQL initialization scripts
│   └── docker-compose.yml        # PostgreSQL + pgAdmin
├── scripts/                      # Utility scripts
└── public/                       # Static files
```

### Veritabanı Şeması
```sql
-- Kullanıcı sistemi
users (id, email, password_hash, name, role, permissions, is_active)
user_preferences (user_id, timezone, language, theme, notifications)
user_sessions (user_id, session_token, expires_at, ip_address)

-- Müşteri sistemi
customers (id, name, email, country_code, industry, score, status, user_id)

-- Audit ve güvenlik
audit_logs (user_id, action, table_name, record_id, old_values, new_values)
```

### API Endpoints
```
Authentication:
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/verify         # Session verification
GET  /api/auth/me             # Current user info

User Management:
GET    /api/users             # List users (admin only)
POST   /api/users             # Create user (admin only)
GET    /api/users/[id]        # Get user by ID
PUT    /api/users/[id]        # Update user
DELETE /api/users/[id]        # Delete user (admin only)
PUT    /api/users/[id]/status # Toggle user status

Customer Management:
GET    /api/customers         # List customers (user-scoped)
POST   /api/customers         # Create customer
GET    /api/customers/[id]    # Get customer by ID
PUT    /api/customers/[id]    # Update customer
DELETE /api/customers/[id]    # Delete customer
PUT    /api/customers/[id]/status # Update customer status

Data Library:
GET    /api/data-library/tables    # List database tables
GET    /api/data-library/charts    # List charts
POST   /api/data-library/charts    # Create chart
```

### State Management
```typescript
// Authentication Context
AuthContext {
  user: User | null
  login: (email, password) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

// Database Client (Singleton)
DatabaseClient {
  users: UserAPI
  customers: CustomerAPI
  auth: AuthAPI
}
```

---

## 📊 Özellikler

### ✅ Tamamlanan Özellikler

#### Kullanıcı Sistemi
- **Authentication**: JWT tabanlı login/logout
- **Authorization**: Role-based access control (admin/user)
- **User Management**: CRUD operations, status management
- **Session Management**: Secure session handling
- **Password Security**: bcrypt hashing

#### Veritabanı
- **PostgreSQL Integration**: Full PostgreSQL backend
- **Docker Setup**: Containerized database
- **Schema Management**: SQL migrations
- **Data Seeding**: Default users and sample data

#### UI/UX
- **Modern Design**: shadcn/ui components
- **Responsive**: Mobile-first design
- **Dark Mode**: Theme switching
- **Accessibility**: ARIA compliance

#### Veri Kütüphanesi
- **Chart Builder**: Interactive chart creation
- **Data Tables**: Excel-like data grid
- **Export**: CSV/Excel export functionality
- **Permissions**: Chart-level access control

### 🚧 Geliştirme Aşamasında

#### Müşteri Yönetimi
- **PostgreSQL Integration**: Customer API migration
- **Advanced Filtering**: Industry, score, status filters
- **Bulk Operations**: Mass customer updates
- **Import/Export**: CSV customer import

#### Analytics Dashboard
- **Real-time KPIs**: Customer metrics
- **Interactive Charts**: Recharts integration
- **Custom Reports**: Report builder
- **Data Visualization**: Advanced charts

#### Sistem Özellikleri
- **Email Notifications**: System alerts
- **Audit Logging**: Full action logging
- **Backup System**: Automated backups
- **Performance Monitoring**: System metrics

---

## 🔧 Geliştirme

### Development Commands
```bash
# Temel komutlar
npm run dev          # Development server (hot reload)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint linting
npm run lint:fix     # ESLint auto-fix

# Veritabanı komutları
npm run db:start     # Start PostgreSQL + pgAdmin
npm run db:stop      # Stop database containers
npm run db:reset     # Reset database (clears all data)
npm run db:logs      # View database logs
npm run db:backup    # Create database backup
```

### Database Operations
```bash
# PostgreSQL'e direkt erişim
docker exec -it customer_analysis_postgres psql -U postgres -d customer_analysis_db

# Veritabanı yedeği
docker exec customer_analysis_postgres pg_dump -U postgres customer_analysis_db > backup.sql

# Veritabanı geri yükleme
docker exec -i customer_analysis_postgres psql -U postgres customer_analysis_db < backup.sql

# Konteyner durumu
docker-compose ps
docker-compose logs -f
```

### Code Quality
```bash
# TypeScript type checking
npx tsc --noEmit

# ESLint configuration
# .eslintrc.json dosyası mevcuttur
# Tailwind CSS, Next.js, React kuralları aktif

# Prettier formatting (gerekirse)
npx prettier --write .
```

### API Testing
```bash
# Test scriptleri mevcut
node test-api-simple.mjs     # Basic API test
node test-auth-token.mjs     # Auth token test
node test-db-direct.mjs      # Direct database test

# Manual API testing
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 🗄️ Veritabanı

### PostgreSQL Setup

#### Database Structure
```sql
-- Schema: customer_analysis
-- Extensions: uuid-ossp, pgcrypto

-- Ana tablolar:
users             # Kullanıcı hesapları
customers         # Müşteri verileri
user_preferences  # Kullanıcı ayarları
user_sessions     # Oturum yönetimi
audit_logs        # Sistem logları

-- Indexes:
- users: email, role, is_active
- customers: user_id, status, industry, score
- sessions: session_token, user_id, expires_at
```

#### Database Management
```bash
# Database başlatma
docker-compose up -d

# Health check
docker exec customer_analysis_postgres pg_isready -U postgres

# Database connection test
psql postgresql://postgres:postgres_password_2024@localhost:5432/customer_analysis_db

# Schema inspection
\dt                          # List tables
\d users                     # Describe users table
SELECT * FROM users LIMIT 5; # Sample data
```

#### Migration Management
```bash
# Yeni migration oluşturma
# database/init/ klasöründe yeni .sql dosyası
# Dosya adı: 05-your-migration.sql

# Migration uygulama
docker-compose down -v    # Clear data
docker-compose up -d      # Reinitialize
```

### pgAdmin Usage
```bash
# pgAdmin Web UI: http://localhost:8080
# Login: admin@customeranalysis.com / pgadmin_password_2024

# Server connection (otomatik yapılandırılmış):
Name: Customer Analysis DB
Host: postgres
Port: 5432
Username: postgres
Password: postgres_password_2024
Database: customer_analysis_db
```

---

## 🛠️ Sorun Giderme

### Docker Sorunları

#### Docker Desktop Çalışmıyor
```bash
# Docker Desktop durumunu kontrol edin
docker version

# Windows'da Docker Desktop yeniden başlatın
# Docker Desktop > Settings > Reset

# WSL2 entegrasyonu kontrol edin
docker context ls
docker context use default

# WSL2 Docker daemon
sudo service docker start    # WSL2 içinde
```

#### Konteyner Başlatma Sorunları
```bash
# Port çakışması kontrolü
netstat -ano | findstr :5432
netstat -ano | findstr :8080

# Port değiştirme (docker-compose.yml)
ports:
  - "5433:5432"  # PostgreSQL
  - "8081:80"    # pgAdmin

# Konteyner logları
docker-compose logs postgres
docker-compose logs pgadmin

# Konteyner yeniden başlatma
docker-compose restart
docker-compose down && docker-compose up -d
```

### WSL2 Sorunları

#### WSL2 Başlatma Problemleri
```bash
# WSL2 yeniden başlatma
wsl --shutdown
wsl

# WSL2 sürüm kontrol
wsl -l -v

# WSL2 default distro ayarlama
wsl --set-default Ubuntu

# WSL2 memory limiti (gerekirse)
# ~/.wslconfig dosyası:
[wsl2]
memory=8GB
processors=4
```

#### File Permission Sorunları
```bash
# WSL2 içinde dosya izinleri
chmod +x scripts/install-docker-wsl2.sh

# Windows dosya sisteminden erişim
cd /mnt/c/Users/[USERNAME]/Downloads/customer-analysis-dashboard

# Git line ending sorunları
git config --global core.autocrlf input
git config --global core.eol lf
```

### Node.js/NPM Sorunları

#### Package Installation Sorunları
```bash
# npm cache temizleme
npm cache clean --force

# node_modules yeniden kurulumu
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Node.js versiyon kontrolü
node --version  # 18+ olmalı
npm --version   # 9+ olmalı

# Alternatif package manager
npm install -g pnpm
pnpm install
```

#### Build Sorunları
```bash
# TypeScript type checking
npx tsc --noEmit

# Next.js build
npm run build

# Production test
npm run build && npm run start
```

### Veritabanı Sorunları

#### PostgreSQL Bağlantı Sorunları
```bash
# PostgreSQL hazır mı?
docker exec customer_analysis_postgres pg_isready -U postgres

# PostgreSQL logs
docker-compose logs postgres

# Manual connection test
psql postgresql://postgres:postgres_password_2024@localhost:5432/customer_analysis_db

# Database reset
npm run db:reset
```

#### pgAdmin Sorunları
```bash
# pgAdmin konteyner durumu
docker-compose ps

# pgAdmin logs
docker-compose logs pgadmin

# pgAdmin data reset
docker-compose down -v
docker-compose up -d
```

### Network Sorunları

#### Port Çakışmaları
```bash
# Kullanılan portları kontrol edin
netstat -ano | findstr :3000  # Next.js
netstat -ano | findstr :5432  # PostgreSQL
netstat -ano | findstr :8080  # pgAdmin

# Process kill etme
taskkill /F /PID [PID_NUMBER]  # Windows
kill -9 [PID]                 # WSL2
```

### Hata Mesajları ve Çözümler

#### "Cannot connect to Docker daemon"
```bash
# Docker Desktop çalışıyor mu?
docker version

# WSL2 Docker entegrasyonu
# Docker Desktop > Settings > Resources > WSL Integration
```

#### "EADDRINUSE: address already in use"
```bash
# Port kullanımını kontrol edin
netstat -ano | findstr :3000

# Process'i sonlandırın
taskkill /F /PID [PID]
```

#### "Module not found" hataları
```bash
# Dependencies yeniden kur
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Cache temizle
npm cache clean --force
```

#### "Permission denied" WSL2'de
```bash
# File permissions düzelt
chmod +x [file_name]

# WSL2 içinde git clone yap
cd /mnt/c/Users/[USERNAME]/Downloads
git clone [repo_url]
```

---

## 🔒 Güvenlik

### Development Environment

#### Default Credentials
```bash
# Test kullanıcıları - sadece development için
Admin: admin@example.com / admin123
User: user@example.com / user123

# pgAdmin - sadece local development
Email: admin@customeranalysis.com
Password: pgadmin_password_2024

# PostgreSQL - sadece local development
Username: postgres
Password: postgres_password_2024
```

#### Security Settings
```bash
# JWT Secret (development)
JWT_SECRET=dev-secret-change-in-production

# Next.js security headers
# next.config.mjs içinde:
- typescript.ignoreBuildErrors: true
- eslint.ignoreDuringBuilds: true
- images.unoptimized: true
```

### Production Environment

#### Essential Security Steps
```bash
# 1. Environment variables değiştir
DATABASE_URL=postgresql://secure_user:strong_password@db_host:5432/production_db
JWT_SECRET=super-strong-random-secret-key-at-least-32-characters

# 2. Default kullanıcıları kaldır
DELETE FROM users WHERE email IN ('admin@example.com', 'user@example.com');

# 3. Strong passwords enforce et
# Password policy implementation gerekli

# 4. HTTPS enable et
# SSL/TLS certificates kurulumu

# 5. Database security
# PostgreSQL firewall rules
# Connection encryption
# Regular security updates
```

#### Production Checklist
- [ ] Default passwords değiştirildi
- [ ] JWT secret güçlendirildi
- [ ] HTTPS etkinleştirildi
- [ ] Database firewall yapılandırıldı
- [ ] Audit logging etkinleştirildi
- [ ] Rate limiting uygulandı
- [ ] Security headers ayarlandı
- [ ] Backup system kuruldu

### Security Best Practices

#### Authentication
```typescript
// Password hashing (bcrypt)
const hashedPassword = await bcrypt.hash(password, 12);

// JWT token validation
const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });

// Session management
// Secure session storage
// Token refresh mechanism
```

#### Authorization
```typescript
// Role-based access control
const checkPermission = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### Input Validation
```typescript
// Zod schema validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50)
});

// SQL injection prevention
// Parameterized queries kullanılıyor
```

---

## 🚀 Deployment

### Production Deployment

#### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_password@prod_host:5432/prod_db
JWT_SECRET=production-super-secret-key-minimum-32-characters
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=another-super-secret-key

# Database connection pool
DB_POOL_SIZE=20
DB_POOL_TIMEOUT=30000
```

#### Docker Production Build
```dockerfile
# Dockerfile.prod
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

#### Production Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

### Deployment Checklist

#### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Build process verified
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] SSL certificates ready
- [ ] Backup system configured

#### Deployment Steps
1. **Database Setup**
   ```bash
   # Production database kurulumu
   # SSL enabled PostgreSQL
   # Backup system kurulumu
   ```

2. **Application Build**
   ```bash
   npm run build
   npm run start
   ```

3. **Reverse Proxy Setup**
   ```nginx
   # Nginx configuration
   server {
     listen 80;
     server_name yourdomain.com;
     return 301 https://$server_name$request_uri;
   }
   
   server {
     listen 443 ssl;
     server_name yourdomain.com;
     
     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/private.key;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

4. **Monitoring Setup**
   ```bash
   # Log monitoring
   # Performance monitoring
   # Uptime monitoring
   # Error tracking
   ```

### Maintenance

#### Regular Tasks
```bash
# Database backup
npm run db:backup

# Log rotation
# Security updates
# Performance monitoring
# User activity audit
```

#### Monitoring
```bash
# System metrics
# Database performance
# API response times
# Error rates
# User activity
```

---

## 🤝 Katkıda Bulunma

### Development Workflow
```bash
# 1. Fork repository
# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes
# 4. Test changes
npm run lint
npm run build

# 5. Commit changes
git commit -m "feat: add new feature"

# 6. Push to branch
git push origin feature/new-feature

# 7. Create pull request
```

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Extended from Next.js, React
- **Prettier**: Consistent formatting
- **Commit Messages**: Conventional commits

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 📞 Destek

### İletişim
- **Email**: [your-email@domain.com]
- **GitHub Issues**: [GitHub Repository Issues]
- **Documentation**: Bu README.md dosyası

### Sık Sorulan Sorular

#### Q: Docker Desktop bulunamıyor?
A: Docker Desktop'ı resmi siteden indirin ve WSL2 backend'i etkinleştirin.

#### Q: Port çakışması var?
A: `docker-compose.yml` dosyasındaki port numaralarını değiştirin.

#### Q: WSL2 çalışmıyor?
A: `wsl --shutdown` ve `wsl` komutlarını çalıştırın.

#### Q: Database bağlantı sorunu?
A: `npm run db:reset` komutunu çalıştırın.

---

**Son Güncelleme**: 2025-01-16  
**Proje Versiyonu**: 0.1.0  
**Doküman Versiyonu**: 1.0.0

---

## 🔖 Hızlı Referans

### Komutlar
```bash
# Başlangıç
npm run db:start && npm install --legacy-peer-deps && npm run dev

# Durdurma
npm run db:stop

# Reset
npm run db:reset

# Logs
docker-compose logs -f
```

### URL'ler
- http://localhost:3000 - Ana uygulama
- http://localhost:8080 - pgAdmin
- admin@example.com / admin123 - Test kullanıcı

### Dosyalar
- `docker-compose.yml` - Database setup
- `package.json` - Dependencies
- `app/api/` - Backend endpoints
- `components/` - UI components
- `lib/database-postgres.ts` - Database layer