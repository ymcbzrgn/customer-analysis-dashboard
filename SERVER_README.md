# Customer Analysis Dashboard - Server Setup

Bu rehber, mevcut PostgreSQL server'ınızla Customer Analysis Dashboard'u çalıştırmanız için basit adımları içerir.

## 🎯 Hızlı Başlangıç (3 Adım)

### Adım 1: Database Schema'yı Yükle

Mevcut PostgreSQL server'ınızda aşağıdaki komutları çalıştırın:

```bash
# 1. Ana schema dosyasını yükle
psql -h your_host -U postgres -d customer_analysis_db -f /mnt/wsl/docker-desktop-bind-mounts/Ubuntu/c9da6f1bcccd7ea9441c388029b85e33eaa32110a36ca79f5dbf9d979ee7a3a8/02-exact-schema.sql

# 2. Charts tablosunu ekle
psql -h your_host -U postgres -d customer_analysis_db -f /mnt/wsl/docker-desktop-bind-mounts/Ubuntu/c9da6f1bcccd7ea9441c388029b85e33eaa32110a36ca79f5dbf9d979ee7a3a8/04-add-charts-table.sql
```

### Adım 2: Environment Dosyasını Ayarla

```bash
# .env dosyası oluştur
cp .env.example .env

# .env dosyasını düzenle
nano .env
```

.env dosyasında şu değerleri güncelle:
```bash
DATABASE_URL=postgresql://postgres:your_password@your_host:5432/customer_analysis_db
DB_HOST=your_host
DB_PORT=5432
DB_NAME=customer_analysis_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Adım 3: Uygulamayı Başlat

```bash
# Uygulamayı çalıştır
docker-compose up app
```

## 🔧 Konfigürasyon

### Gerekli Environment Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://postgres:password@host:5432/db` |
| `DB_HOST` | Database host adresi | `192.168.1.100` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database adı | `customer_analysis_db` |
| `DB_USER` | Database kullanıcısı | `postgres` |
| `DB_PASSWORD` | Database şifresi | `your_password` |
| `JWT_SECRET` | JWT token anahtarı (min 32 karakter) | `your-super-secret-key` |

### Docker Compose Yapısı

- **Sadece uygulama container'ı** çalıştırılır
- Mevcut PostgreSQL server'ınıza bağlanır
- Port 3000'den erişim sağlar

## 🔍 Test ve Doğrulama

### Database Bağlantı Testi
```bash
# Container içinden test
docker exec -it customer_analysis_app sh
node -e "console.log(process.env.DATABASE_URL)"
```

### Uygulama Kontrolü
```bash
# Logları kontrol et
docker-compose logs app

# Health check
curl http://localhost:3000
```

## 📊 Varsayılan Kullanıcılar

Schema yüklendikten sonra şu kullanıcılar oluşturulur:

### Admin Kullanıcı
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin

### Normal Kullanıcı
- **Email:** user@example.com
- **Password:** user123
- **Role:** user

## 🚨 Troubleshooting

### Bağlantı Sorunları
```bash
# Database bağlantısını test et
telnet your_host 5432

# Container loglarını kontrol et
docker logs customer_analysis_app
```

### Schema Sorunları
```bash
# Tabloları kontrol et
psql -h your_host -U postgres -d customer_analysis_db -c "\dt"

# Users tablosunu kontrol et
psql -h your_host -U postgres -d customer_analysis_db -c "SELECT * FROM users LIMIT 5;"
```

### Container Sorunları
```bash
# Container'ı yeniden başlat
docker-compose restart app

# Container'ı yeniden oluştur
docker-compose down
docker-compose build --no-cache app
docker-compose up app
```

## 🔄 Güncelleme

```bash
# Kodu güncelle
git pull

# Container'ı yeniden oluştur ve başlat
docker-compose down
docker-compose build --no-cache app
docker-compose up app
```

---

**Not:** Bu setup sadece mevcut PostgreSQL server'ınızla çalışır. Database container'ı oluşturulmaz.