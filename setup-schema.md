# Database Schema Setup

Mevcut PostgreSQL server'ınızda aşağıdaki dosyaları sırasıyla çalıştırın:

## 1. Ana Schema Dosyası
```bash
psql -h your_host -U postgres -d customer_analysis_db -f /mnt/wsl/docker-desktop-bind-mounts/Ubuntu/c9da6f1bcccd7ea9441c388029b85e33eaa32110a36ca79f5dbf9d979ee7a3a8/02-exact-schema.sql
```

## 2. Charts Tablosu Ekleme
```bash
psql -h your_host -U postgres -d customer_analysis_db -f /mnt/wsl/docker-desktop-bind-mounts/Ubuntu/c9da6f1bcccd7ea9441c388029b85e33eaa32110a36ca79f5dbf9d979ee7a3a8/04-add-charts-table.sql
```

## Dosya Konumları
- **02-exact-schema.sql**: `/mnt/wsl/docker-desktop-bind-mounts/Ubuntu/c9da6f1bcccd7ea9441c388029b85e33eaa32110a36ca79f5dbf9d979ee7a3a8/02-exact-schema.sql`
- **04-add-charts-table.sql**: `/mnt/wsl/docker-desktop-bind-mounts/Ubuntu/c9da6f1bcccd7ea9441c388029b85e33eaa32110a36ca79f5dbf9d979ee7a3a8/04-add-charts-table.sql`

Bu dosyalar projenizin mevcut schema dosyalarıdır ve aynen kullanılacaktır.