# Customer Analysis Dashboard - Server Deployment Guide

Bu rehber, Customer Analysis Dashboard projesini production ortamında çalıştırmanız için iki farklı yöntem sunmaktadır.

## 📋 Önkoşullar

- Docker ve Docker Compose kurulu olmalı
- Node.js 18+ (yerel geliştirme için)
- PostgreSQL 15+ server (Yöntem 1 için)

## 🚀 Deployment Yöntemleri

### **Yöntem 1: Mevcut PostgreSQL Server ile (Önerilen)**

Bu yöntem, zaten çalışan bir PostgreSQL server'ınız varsa kullanılmalıdır.

#### Adım 1: Database Schema Kurulumu

1. Mevcut PostgreSQL server'ınızda yeni bir database oluşturun:
```sql
CREATE DATABASE customer_analysis_db;
```

2. Schema migration script'ini çalıştırın:
```bash
# PostgreSQL server'ınıza bağlanın
psql -h your_host -U postgres -d customer_analysis_db

# Migration script'ini çalıştırın
\i migrate-schema.sql
```

**⚠️ DİKKAT:** `migrate-schema.sql` dosyası mevcut tablolarınızı silecektir. Verilerinizi korumak istiyorsanız, dosyadaki `DROP TABLE` satırlarını yorum satırı haline getirin.

#### Adım 2: Environment Konfigürasyonu

1. `.env` dosyası oluşturun:
```bash
cp .env.example .env
```

2. `.env` dosyasını düzenleyin:
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@your_host:5432/customer_analysis_db
DB_HOST=your_host
DB_PORT=5432
DB_NAME=customer_analysis_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SCHEMA=public

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
APP_URL=http://localhost:3000
NODE_ENV=production
```

#### Adım 3: Uygulama Çalıştırma

```bash
# Sadece uygulamayı container'da çalıştır
docker-compose up app
```

### **Yöntem 2: Tam Docker Setup (Development)**

Bu yöntem hem PostgreSQL hem de uygulamayı Docker içinde çalıştırır.

#### Adım 1: Environment Konfigürasyonu

```bash
cp .env.example .env
# .env dosyasında Docker için olan ayarları aktifleştirin
```

#### Adım 2: Tam Setup ile Çalıştırma

```bash
# Hem database hem uygulama ile çalıştır
docker-compose --profile with-db up
```

## 🛠️ Konfigürasyon Detayları

### Database Connection

Uygulama aşağıdaki sırayla bağlantı kurmaya çalışır:

1. `DATABASE_URL` environment variable
2. Ayrı ayrı DB_* environment variable'ları
3. Default değerler

### Environment Variables

| Variable | Açıklama | Default |
|----------|----------|---------|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | - |
| `DB_HOST` | Database host adresi | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database adı | customer_analysis_db |
| `DB_USER` | Database kullanıcısı | postgres |
| `DB_PASSWORD` | Database şifresi | - |
| `JWT_SECRET` | JWT token şifreleme anahtarı | - |
| `NODE_ENV` | Ortam tipi | development |
| `APP_URL` | Uygulama URL'i | http://localhost:3000 |

### Docker Compose Servisleri

#### `app` Servisi
- **Port:** 3000
- **Environment:** Production optimized
- **Network:** Bridge connection
- **Dependencies:** PostgreSQL (host.docker.internal veya postgres service)

#### `postgres` Servisi (Opsiyonel)
- **Port:** 5432
- **Profile:** `with-db`
- **Data:** Persistent volume
- **Init Scripts:** `./database/init/` klasörü

## 🔧 Troubleshooting

### Bağlantı Sorunları

1. **Docker'dan host makineye bağlantı:**
```bash
# Windows/Mac için
host.docker.internal

# Linux için
host.docker.internal
# veya docker0 bridge IP'si
172.17.0.1
```

2. **PostgreSQL bağlantısını test edin:**
```bash
# Container içinden test
docker exec -it customer_analysis_app sh
npm run test:db
```

### Schema Sorunları

1. **Migration script'i tekrar çalıştırın:**
```bash
psql -h your_host -U postgres -d customer_analysis_db -f migrate-schema.sql
```

2. **Manuel schema kontrolü:**
```sql
-- Tablolar var mı kontrol edin
\dt

-- Users tablosunu kontrol edin
SELECT * FROM users LIMIT 5;
```

### Container Sorunları

1. **Logları kontrol edin:**
```bash
docker-compose logs app
docker-compose logs postgres
```

2. **Container'ı yeniden başlatın:**
```bash
docker-compose restart app
```

3. **Container'ı sıfırdan oluşturun:**
```bash
docker-compose down
docker-compose build --no-cache app
docker-compose up app
```

## 📊 Varsayılan Kullanıcılar

Migration script çalıştırıldıktan sonra aşağıdaki kullanıcılar oluşturulur:

### Admin Kullanıcı
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin
- **Permissions:** Tüm yetkilere sahip

### Normal Kullanıcı
- **Email:** user@example.com
- **Password:** user123
- **Role:** user
- **Permissions:** Sadece okuma yetkisi

## 🚀 Production Deployment

### Security Checklist

1. **JWT Secret'ı değiştirin:**
```bash
# Güçlü bir secret oluşturun
openssl rand -base64 32
```

2. **Database şifrelerini güncelleyin**
3. **SSL sertifikası ekleyin**
4. **Firewall kuralları ayarlayın**
5. **Backup stratejisi oluşturun**

### Performance Optimizations

1. **Database connection pooling** zaten aktif
2. **Container resource limits** ayarlayın:
```yaml
app:
  deploy:
    resources:
      limits:
        memory: 1G
        cpus: '0.5'
```

### Monitoring

1. **Health check endpoint:** `/api/health`
2. **Database connection test:** `/api/test-env`
3. **Container logs:** `docker-compose logs -f app`

## 📁 Dizin Yapısı

```
customer-analysis-dashboard/
├── app/                    # Next.js app router
├── components/             # React components
├── lib/                    # Database ve utility fonksiyonları
├── database/
│   └── init/              # PostgreSQL init scripts
├── docker-compose.yml     # Docker configuration
├── Dockerfile            # App container definition
├── migrate-schema.sql    # Database migration script
├── .env.example          # Environment template
└── SERVER_README.md      # Bu dosya
```

## 🔄 Updates ve Maintenance

### Code Update
```bash
git pull origin main
docker-compose build --no-cache app
docker-compose restart app
```

### Database Backup
```bash
# Backup oluştur
pg_dump -h your_host -U postgres customer_analysis_db > backup.sql

# Backup'tan geri yükle
psql -h your_host -U postgres customer_analysis_db < backup.sql
```

### Container Cleanup
```bash
# Kullanılmayan image'leri temizle
docker system prune -f

# Volume'leri temizle (dikkatli olun!)
docker volume prune
```

---

Bu rehber sizin projenizi hızlıca çalışır hale getirmenizi sağlayacaktır. Herhangi bir sorun yaşarsanız, troubleshooting bölümünü kontrol edin veya logları inceleyin.