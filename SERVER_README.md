# Customer Analysis Dashboard - Server Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Server Requirements](#server-requirements)
4. [Installation Methods](#installation-methods)
5. [Method 1: Docker Deployment (Recommended)](#method-1-docker-deployment-recommended)
6. [Method 2: Native Installation](#method-2-native-installation)
7. [Method 3: Cloud Deployment](#method-3-cloud-deployment)
8. [Environment Configuration](#environment-configuration)
9. [Database Setup](#database-setup)
10. [SSL/HTTPS Configuration](#sslhttps-configuration)
11. [Domain Configuration](#domain-configuration)
12. [Monitoring and Logging](#monitoring-and-logging)
13. [Security Hardening](#security-hardening)
14. [Performance Optimization](#performance-optimization)
15. [Backup and Recovery](#backup-and-recovery)
16. [Troubleshooting](#troubleshooting)
17. [Maintenance and Updates](#maintenance-and-updates)

---

## Overview

The Customer Analysis Dashboard is a Next.js 15 application with React 19, TypeScript, and PostgreSQL backend. This guide provides comprehensive instructions for deploying the application on production servers.

### Application Architecture
- **Frontend**: Next.js 15 with React 19 and TypeScript
- **UI Framework**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 15+
- **Authentication**: JWT with bcrypt password hashing
- **State Management**: React Context (AuthContext)
- **Admin Interface**: pgAdmin4 (optional)

---

## Prerequisites

### Required Knowledge
- Basic Linux system administration
- Docker and Docker Compose fundamentals
- Web server configuration (Nginx/Apache)
- SSL certificate management
- Database administration

### Required Tools
- SSH access to your server
- Domain name (recommended)
- SSL certificate (Let's Encrypt recommended)

---

## Server Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Network**: 1Gbps connection

### Recommended Requirements
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: 1Gbps connection with low latency

### Port Requirements
- **80**: HTTP (redirect to HTTPS)
- **443**: HTTPS (main application)
- **5432**: PostgreSQL (internal only, firewall protected)
- **8080**: pgAdmin4 (optional, can be disabled in production)

---

## Installation Methods

## Method 1: Docker Deployment (Recommended)

### Step 1: Server Preparation

#### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git unzip -y
```

#### 1.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply docker group membership
exit
# SSH back in
```

#### 1.3 Verify Docker Installation
```bash
docker --version
docker-compose --version
sudo systemctl enable docker
sudo systemctl start docker
```

### Step 2: Application Deployment

#### 2.1 Clone Repository
```bash
cd /opt
sudo mkdir customer-analysis-dashboard
sudo chown $USER:$USER customer-analysis-dashboard
cd customer-analysis-dashboard

# Clone your repository
git clone <YOUR_REPOSITORY_URL> .
# Or upload your application files via SCP/SFTP
```

#### 2.2 Create Production Environment File
```bash
sudo nano .env.production
```

Add the following content:
```env
# Application Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database Configuration
POSTGRES_DB=customer_analysis_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_production_password_2024
DATABASE_URL=postgresql://postgres:your_secure_production_password_2024@localhost:5432/customer_analysis_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your_super_secure_session_secret_key_here

# Email Configuration (if applicable)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-app-email@gmail.com
SMTP_PASS=your-app-password

# Security Headers
SECURE_COOKIES=true
HTTPS_ONLY=true

# pgAdmin Configuration (optional)
PGADMIN_DEFAULT_EMAIL=admin@your-domain.com
PGADMIN_DEFAULT_PASSWORD=your_secure_pgadmin_password_2024
```

#### 2.3 Create Production Docker Compose File
```bash
sudo nano docker-compose.production.yml
```

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: customer_analysis_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
    networks:
      - customer_analysis_network
    volumes:
      - app_data:/app/data
      - ./logs:/app/logs

  postgres:
    image: postgres:15-alpine
    container_name: customer_analysis_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: customer_analysis_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "127.0.0.1:5432:5432"  # Bind to localhost only for security
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
      - ./backups:/backups
    networks:
      - customer_analysis_network
    command: >
      postgres 
      -c max_connections=100
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100

  # Optional: Include pgAdmin only if needed
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: customer_analysis_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
      PGADMIN_CONFIG_SERVER_MODE: 'True'
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: 'True'
    ports:
      - "127.0.0.1:8080:80"  # Bind to localhost only
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - customer_analysis_network
    depends_on:
      - postgres
    profiles:
      - admin  # Only start when explicitly requested

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local
  app_data:
    driver: local

networks:
  customer_analysis_network:
    driver: bridge
```

#### 2.4 Create Production Dockerfile
```bash
sudo nano Dockerfile
```

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create necessary directories
RUN mkdir -p /app/data /app/logs
RUN chown -R nextjs:nodejs /app/data /app/logs

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 2.5 Update Next.js Configuration for Production
```bash
nano next.config.mjs
```

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['your-domain.com'], // Add your domain
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### Step 3: Build and Deploy

#### 3.1 Build Application
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

#### 3.2 Initialize Database
```bash
# Wait for PostgreSQL to be ready
sleep 30

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres

# Verify database connection
docker exec customer_analysis_postgres pg_isready -U postgres
```

### Step 4: Reverse Proxy Setup (Nginx)

#### 4.1 Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 4.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/customer-analysis-dashboard
```

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream
upstream customer_analysis_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logging
    access_log /var/log/nginx/customer-analysis.access.log;
    error_log /var/log/nginx/customer-analysis.error.log;

    # Client settings
    client_max_body_size 10M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting for API endpoints
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://customer_analysis_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Rate limiting for login
    location /api/auth/login {
        limit_req zone=login burst=10 nodelay;
        proxy_pass http://customer_analysis_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static {
        proxy_pass http://customer_analysis_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Cache static files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main application
    location / {
        proxy_pass http://customer_analysis_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Optional: pgAdmin access (remove in production)
    location /pgadmin/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Script-Name /pgadmin;
    }
}
```

#### 4.3 Enable Site and Test Configuration
```bash
sudo ln -s /etc/nginx/sites-available/customer-analysis-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Method 2: Native Installation

### Step 1: System Preparation

#### 1.1 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

#### 1.2 Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set postgres user password
sudo -u postgres psql
\password postgres
# Enter your secure password
\q
```

#### 1.3 Create Application Database
```bash
sudo -u postgres createdb customer_analysis_db
sudo -u postgres psql -d customer_analysis_db -f database/init/02-exact-schema.sql
```

### Step 2: Application Setup

#### 2.1 Deploy Application
```bash
cd /opt
sudo mkdir customer-analysis-dashboard
sudo chown $USER:$USER customer-analysis-dashboard
cd customer-analysis-dashboard

# Upload your application files
# Install dependencies
npm install --legacy-peer-deps

# Build application
npm run build
```

#### 2.2 Create Environment File
```bash
nano .env.production
```
(Use the same environment variables as in Docker method)

#### 2.3 Create Systemd Service
```bash
sudo nano /etc/systemd/system/customer-analysis-dashboard.service
```

```ini
[Unit]
Description=Customer Analysis Dashboard
After=network.target
After=postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/customer-analysis-dashboard
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/customer-analysis-dashboard/.env.production

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/customer-analysis-dashboard

[Install]
WantedBy=multi-user.target
```

#### 2.4 Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable customer-analysis-dashboard
sudo systemctl start customer-analysis-dashboard
sudo systemctl status customer-analysis-dashboard
```

---

## Method 3: Cloud Deployment

### Deployment on AWS EC2

#### 3.1 EC2 Instance Setup
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Instance type: t3.medium or larger
# Security groups: Allow ports 22, 80, 443
```

#### 3.2 Elastic IP and Route 53
```bash
# Allocate and associate Elastic IP
# Configure Route 53 for your domain
# Point your domain to the Elastic IP
```

#### 3.3 RDS PostgreSQL Setup (Optional)
```bash
# Create RDS PostgreSQL instance
# Configure security groups
# Update .env.production with RDS connection string
```

### Deployment on DigitalOcean

#### 3.1 Droplet Creation
```bash
# Create Ubuntu 22.04 droplet
# Size: 2GB RAM minimum
# Add SSH key
```

#### 3.2 Domain Configuration
```bash
# Add domain in DigitalOcean DNS
# Configure A records pointing to droplet IP
```

### Deployment on Google Cloud Platform

#### 3.1 Compute Engine Setup
```bash
# Create VM instance
# Ubuntu 22.04 LTS
# Allow HTTP/HTTPS traffic
```

#### 3.2 Cloud SQL Setup (Optional)
```bash
# Create PostgreSQL Cloud SQL instance
# Configure authorized networks
# Update connection strings
```

---

## Environment Configuration

### Production Environment Variables
Create comprehensive `.env.production` file:

```env
# ==========================================
# CORE APPLICATION SETTINGS
# ==========================================
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Public URL (used by Next.js for absolute URLs)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/customer_analysis_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=customer_analysis_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_production_password_2024

# Database Pool Settings
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_IDLE=10000
DB_POOL_ACQUIRE=60000
DB_POOL_EVICT=1000

# ==========================================
# AUTHENTICATION & SECURITY
# ==========================================
# JWT Configuration (minimum 32 characters)
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=your_super_secure_session_secret_key_here_also_32_chars_min
SESSION_TIMEOUT=7200000

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_SPECIAL=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_UPPERCASE=true

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# ==========================================
# EMAIL CONFIGURATION
# ==========================================
# SMTP Settings (for password reset, notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-app-email@gmail.com
SMTP_PASS=your-app-specific-password

# Email Templates
FROM_EMAIL=noreply@your-domain.com
FROM_NAME=Customer Analysis Dashboard
ADMIN_EMAIL=admin@your-domain.com

# ==========================================
# APPLICATION FEATURES
# ==========================================
# Feature Flags
ENABLE_REGISTRATION=false
ENABLE_PASSWORD_RESET=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_EXPORT_FEATURES=true

# Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=csv,json,xlsx

# ==========================================
# LOGGING & MONITORING
# ==========================================
# Log Levels: error, warn, info, debug
LOG_LEVEL=info
LOG_FILE_PATH=/app/logs/application.log
ACCESS_LOG_PATH=/app/logs/access.log
ERROR_LOG_PATH=/app/logs/error.log

# Enable request logging
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_REPORTING=true

# ==========================================
# PERFORMANCE & CACHING
# ==========================================
# Next.js optimization
NEXT_TELEMETRY_DISABLED=1

# Cache settings (in seconds)
STATIC_CACHE_TTL=31536000
API_CACHE_TTL=300
PAGE_CACHE_TTL=3600

# ==========================================
# SECURITY HEADERS & CORS
# ==========================================
# CORS Configuration
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true

# Content Security Policy
CSP_REPORT_ONLY=false

# SSL/TLS
FORCE_HTTPS=true
SECURE_COOKIES=true
SAME_SITE_COOKIES=strict

# ==========================================
# OPTIONAL: ADMIN TOOLS
# ==========================================
# pgAdmin (disable in production)
PGADMIN_DEFAULT_EMAIL=admin@your-domain.com
PGADMIN_DEFAULT_PASSWORD=your_secure_pgadmin_password_2024
ENABLE_PGADMIN=false

# ==========================================
# BACKUP CONFIGURATION
# ==========================================
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
BACKUP_LOCATION=/backups

# ==========================================
# EXTERNAL INTEGRATIONS
# ==========================================
# API Keys for external services (if applicable)
# ANALYTICS_API_KEY=your_analytics_key
# SOCIAL_MEDIA_API_KEY=your_social_api_key

# ==========================================
# DEVELOPMENT/DEBUG (disable in production)
# ==========================================
DEBUG=false
ENABLE_DEBUG_ROUTES=false
ALLOW_UNSAFE_EVAL=false
```

### Environment File Security
```bash
# Set proper permissions
chmod 600 .env.production
chown root:www-data .env.production

# Verify no secrets in version control
echo ".env*" >> .gitignore
git status --ignored
```

---

## Database Setup

### PostgreSQL Configuration Tuning

#### 1. Optimize PostgreSQL Settings
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```ini
# Connection settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Performance settings
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%a.log'
log_truncate_on_rotation = on
log_rotation_age = 1d
log_rotation_size = 0
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

#### 2. Configure Authentication
```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

```ini
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

#### 3. Restart PostgreSQL
```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### Database Initialization and Migration

#### 1. Create Production Database
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE customer_analysis_db;
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_app_password';
GRANT ALL PRIVILEGES ON DATABASE customer_analysis_db TO app_user;
ALTER USER app_user CREATEDB;

-- Connect to app database
\c customer_analysis_db

-- Run schema initialization
\i /path/to/database/init/02-exact-schema.sql

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_active ON users(is_active);
CREATE INDEX CONCURRENTLY idx_customers_user_id ON customers(user_id);
CREATE INDEX CONCURRENTLY idx_customer_status_customer_id ON customer_status(customer_id);
CREATE INDEX CONCURRENTLY idx_customer_classifications_customer_id ON customer_classifications(customer_id);

-- Verify tables
\dt+

-- Exit
\q
```

#### 2. Database Health Check Script
```bash
nano check_db_health.sh
chmod +x check_db_health.sh
```

```bash
#!/bin/bash

# Database health check script
DB_NAME="customer_analysis_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "=== Database Health Check ==="
echo "Date: $(date)"
echo "================================"

# Check PostgreSQL service
if systemctl is-active --quiet postgresql; then
    echo "✓ PostgreSQL service is running"
else
    echo "✗ PostgreSQL service is not running"
    exit 1
fi

# Check database connectivity
if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME >/dev/null 2>&1; then
    echo "✓ Database connection is healthy"
else
    echo "✗ Cannot connect to database"
    exit 1
fi

# Check database size
DB_SIZE=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" | xargs)
echo "📊 Database size: $DB_SIZE"

# Check active connections
ACTIVE_CONN=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" | xargs)
echo "🔗 Active connections: $ACTIVE_CONN"

# Check table counts
echo "📋 Table record counts:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables 
ORDER BY schemaname, tablename;
"

echo "================================"
echo "Health check completed successfully"
```

---

## SSL/HTTPS Configuration

### Method 1: Let's Encrypt (Recommended)

#### 1. Install Certbot
```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

#### 2. Obtain SSL Certificate
```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Restart nginx
sudo systemctl start nginx
```

#### 3. Auto-renewal Setup
```bash
sudo crontab -e
```

Add this line:
```cron
0 12 * * * /usr/bin/certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"
```

#### 4. Test Auto-renewal
```bash
sudo certbot renew --dry-run
```

### Method 2: Custom SSL Certificate

If using a commercial SSL certificate:

#### 1. Upload Certificate Files
```bash
sudo mkdir -p /etc/ssl/certs/customer-analysis
sudo mkdir -p /etc/ssl/private/customer-analysis

# Upload your files
sudo cp your-domain.crt /etc/ssl/certs/customer-analysis/
sudo cp your-domain.key /etc/ssl/private/customer-analysis/
sudo cp intermediate.crt /etc/ssl/certs/customer-analysis/

# Set permissions
sudo chmod 644 /etc/ssl/certs/customer-analysis/*
sudo chmod 600 /etc/ssl/private/customer-analysis/*
```

#### 2. Update Nginx Configuration
```nginx
ssl_certificate /etc/ssl/certs/customer-analysis/your-domain.crt;
ssl_certificate_key /etc/ssl/private/customer-analysis/your-domain.key;
```

---

## Domain Configuration

### DNS Configuration

#### 1. A Records
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 300

Type: A  
Name: www
Value: YOUR_SERVER_IP
TTL: 300
```

#### 2. CNAME Records (if using CDN)
```
Type: CNAME
Name: www
Value: your-domain.com
TTL: 300
```

#### 3. Security Records
```
# SPF Record (if sending emails)
Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"

# DMARC Record
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:admin@your-domain.com"
```

### Domain Verification
```bash
# Test DNS propagation
nslookup your-domain.com
nslookup www.your-domain.com

# Test from different locations
dig your-domain.com @8.8.8.8
dig your-domain.com @1.1.1.1
```

---

## Monitoring and Logging

### System Monitoring Setup

#### 1. Install Monitoring Tools
```bash
sudo apt install htop iotop nethogs ncdu -y
```

#### 2. Create Monitoring Script
```bash
nano monitor_system.sh
chmod +x monitor_system.sh
```

```bash
#!/bin/bash

# System monitoring script
LOGFILE="/var/log/system-monitor.log"
DATE=$(date)

echo "=== System Monitor - $DATE ===" >> $LOGFILE

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
echo "CPU Usage: ${CPU_USAGE}%" >> $LOGFILE

# Memory Usage
MEM_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
echo "Memory Usage: ${MEM_USAGE}%" >> $LOGFILE

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
echo "Disk Usage: $DISK_USAGE" >> $LOGFILE

# Load Average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
echo "Load Average: $LOAD_AVG" >> $LOGFILE

# Docker containers status
if command -v docker &> /dev/null; then
    echo "Docker Containers:" >> $LOGFILE
    docker ps --format "table {{.Names}}\t{{.Status}}" >> $LOGFILE
fi

# Application process check
APP_PROCESS=$(pgrep -f "next")
if [ -n "$APP_PROCESS" ]; then
    echo "Application Status: Running (PID: $APP_PROCESS)" >> $LOGFILE
else
    echo "Application Status: Not Running" >> $LOGFILE
fi

echo "================================" >> $LOGFILE
```

#### 3. Setup Cron Job
```bash
sudo crontab -e
```

Add:
```cron
# System monitoring every 15 minutes
*/15 * * * * /path/to/monitor_system.sh

# Log rotation
0 0 * * 0 /usr/sbin/logrotate /etc/logrotate.conf
```

### Application Logging

#### 1. Create Log Directory Structure
```bash
sudo mkdir -p /var/log/customer-analysis
sudo chown -R $USER:$USER /var/log/customer-analysis

# Create log files
touch /var/log/customer-analysis/application.log
touch /var/log/customer-analysis/access.log
touch /var/log/customer-analysis/error.log
```

#### 2. Configure Log Rotation
```bash
sudo nano /etc/logrotate.d/customer-analysis
```

```ini
/var/log/customer-analysis/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su root root
}
```

#### 3. Implement Application Logging
Add to your Next.js application (create `lib/logger.ts`):

```typescript
import { writeFile, appendFile } from 'fs/promises'
import { join } from 'path'

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  meta?: any
}

class Logger {
  private logDir: string

  constructor(logDir = '/var/log/customer-analysis') {
    this.logDir = logDir
  }

  private async writeLog(entry: LogEntry, filename: string) {
    const logLine = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message} ${entry.meta ? JSON.stringify(entry.meta) : ''}\n`
    const filepath = join(this.logDir, filename)
    
    try {
      await appendFile(filepath, logLine)
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  info(message: string, meta?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      meta
    }
    this.writeLog(entry, 'application.log')
  }

  warn(message: string, meta?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      meta
    }
    this.writeLog(entry, 'application.log')
  }

  error(message: string, meta?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      meta
    }
    this.writeLog(entry, 'error.log')
  }

  access(req: any, res: any, duration: number) {
    const entry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    }
    this.writeLog(entry as any, 'access.log')
  }
}

export const logger = new Logger()
```

---

## Security Hardening

### System Security

#### 1. Firewall Configuration (UFW)
```bash
# Install and configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential services
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Optional: Allow PostgreSQL from specific IPs only
# sudo ufw allow from YOUR_ADMIN_IP to any port 5432

# Enable firewall
sudo ufw --force enable
sudo ufw status verbose
```

#### 2. SSH Hardening
```bash
sudo nano /etc/ssh/sshd_config
```

```ini
# SSH Hardening Configuration
Port 22
Protocol 2

# Authentication
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes

# Security Settings
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no
GatewayPorts no
PermitTunnel no

# Session Settings
MaxAuthTries 3
MaxSessions 2
LoginGraceTime 60
ClientAliveInterval 300
ClientAliveCountMax 2

# Allowed users (replace with your username)
AllowUsers your_username

# Ciphers and MACs
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512
```

Restart SSH:
```bash
sudo systemctl restart ssh
```

#### 3. Fail2Ban Installation
```bash
sudo apt install fail2ban -y

# Create custom configuration
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[ssh]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

Start Fail2Ban:
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo fail2ban-client status
```

### Application Security

#### 1. Environment Security
```bash
# Secure environment file
sudo chmod 600 /opt/customer-analysis-dashboard/.env.production
sudo chown root:www-data /opt/customer-analysis-dashboard/.env.production

# Secure application directory
sudo chown -R www-data:www-data /opt/customer-analysis-dashboard
sudo find /opt/customer-analysis-dashboard -type f -exec chmod 644 {} \;
sudo find /opt/customer-analysis-dashboard -type d -exec chmod 755 {} \;
sudo chmod +x /opt/customer-analysis-dashboard/node_modules/.bin/*
```

#### 2. Database Security
```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Revoke public access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE customer_analysis_db FROM PUBLIC;

-- Create limited application user
CREATE USER app_user WITH ENCRYPTED PASSWORD 'secure_random_password';
GRANT CONNECT ON DATABASE customer_analysis_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;
```

#### 3. Security Headers Middleware
Create `middleware.ts` in your Next.js app:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## Performance Optimization

### Next.js Optimization

#### 1. Build Optimization
Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features for performance
  experimental: {
    // Enable edge runtime for API routes where possible
    runtime: 'nodejs',
    // Optimize server components
    serverComponentsExternalPackages: ['@node-rs/argon2'],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
```

#### 2. Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build",

# Run analysis
npm run analyze
```

### Database Performance

#### 1. Connection Pooling
Update `lib/database-postgres.ts`:

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 5,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close and replace connections after they have been used 7500 times
  
  // Performance settings
  application_name: 'customer_analysis_dashboard',
  statement_timeout: 30000, // 30 second statement timeout
  query_timeout: 30000,
  
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database pool has ended')
    process.exit(0)
  })
})

export { pool }
```

#### 2. Query Optimization
```sql
-- Create performance monitoring view
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Create index monitoring
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

### Nginx Optimization

Update Nginx configuration with performance settings:

```nginx
# Add to http block
http {
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/atom+xml
        application/rss+xml
        application/xml+rss
        image/svg+xml;

    # Enable Brotli compression (if available)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Optimize buffers
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;

    # Timeout settings
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 65;
    send_timeout 10;

    # File cache
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # Connection optimization
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=general:10m rate=60r/m;
}
```

---

## Backup and Recovery

### Automated Backup System

#### 1. Database Backup Script
```bash
nano /opt/scripts/backup_database.sh
chmod +x /opt/scripts/backup_database.sh
```

```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/var/backups/customer-analysis"
DB_NAME="customer_analysis_db"
DB_USER="postgres"
DB_HOST="localhost"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
LOG_FILE="/var/log/database_backup.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Start backup
log_message "Starting database backup..."

# Perform backup
if pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f $BACKUP_FILE; then
    # Compress backup
    gzip $BACKUP_FILE
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    
    # Calculate file size
    FILE_SIZE=$(du -h $COMPRESSED_FILE | cut -f1)
    log_message "Backup completed successfully: $COMPRESSED_FILE ($FILE_SIZE)"
    
    # Remove backups older than 30 days
    find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
    log_message "Old backups cleaned up"
    
    # Upload to cloud storage (optional)
    if command -v aws &> /dev/null && [ ! -z "$AWS_S3_BUCKET" ]; then
        aws s3 cp $COMPRESSED_FILE s3://$AWS_S3_BUCKET/database-backups/
        log_message "Backup uploaded to S3"
    fi
    
else
    log_message "ERROR: Database backup failed"
    exit 1
fi

log_message "Backup process completed"
```

#### 2. Application Files Backup Script
```bash
nano /opt/scripts/backup_application.sh
chmod +x /opt/scripts/backup_application.sh
```

```bash
#!/bin/bash

# Application backup script
APP_DIR="/opt/customer-analysis-dashboard"
BACKUP_DIR="/var/backups/customer-analysis"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz"
LOG_FILE="/var/log/application_backup.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

log_message "Starting application backup..."

# Create application backup (excluding node_modules and .next)
if tar -czf $BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.git' \
    -C /opt customer-analysis-dashboard; then
    
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    log_message "Application backup completed: $BACKUP_FILE ($FILE_SIZE)"
    
    # Remove old backups
    find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete
    log_message "Old application backups cleaned up"
    
else
    log_message "ERROR: Application backup failed"
    exit 1
fi

log_message "Application backup process completed"
```

#### 3. Setup Backup Cron Jobs
```bash
sudo crontab -e
```

Add these lines:
```cron
# Database backup at 2 AM daily
0 2 * * * /opt/scripts/backup_database.sh

# Application backup at 3 AM daily
0 3 * * * /opt/scripts/backup_application.sh

# System backup weekly on Sunday at 4 AM
0 4 * * 0 /opt/scripts/backup_system.sh
```

### Recovery Procedures

#### 1. Database Recovery Script
```bash
nano /opt/scripts/restore_database.sh
chmod +x /opt/scripts/restore_database.sh
```

```bash
#!/bin/bash

# Database restore script
BACKUP_DIR="/var/backups/customer-analysis"
DB_NAME="customer_analysis_db"
DB_USER="postgres"
DB_HOST="localhost"
LOG_FILE="/var/log/database_restore.log"

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la $BACKUP_DIR/db_backup_*.sql.gz
    exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_message "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

log_message "Starting database restore from: $BACKUP_FILE"

# Create a backup of current database before restore
CURRENT_BACKUP="$BACKUP_DIR/pre_restore_backup_$(date +"%Y%m%d_%H%M%S").sql"
log_message "Creating pre-restore backup..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f $CURRENT_BACKUP
gzip $CURRENT_BACKUP

# Drop existing database and recreate
log_message "Dropping existing database..."
dropdb -h $DB_HOST -U $DB_USER $DB_NAME
createdb -h $DB_HOST -U $DB_USER $DB_NAME

# Restore from backup
log_message "Restoring database..."
if zcat $BACKUP_FILE | psql -h $DB_HOST -U $DB_USER -d $DB_NAME; then
    log_message "Database restore completed successfully"
    
    # Verify restore
    TABLE_COUNT=$(psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    log_message "Restored database contains $TABLE_COUNT tables"
    
else
    log_message "ERROR: Database restore failed"
    
    # Attempt to restore pre-restore backup
    log_message "Attempting to restore pre-restore backup..."
    dropdb -h $DB_HOST -U $DB_USER $DB_NAME
    createdb -h $DB_HOST -U $DB_USER $DB_NAME
    zcat "${CURRENT_BACKUP}.gz" | psql -h $DB_HOST -U $DB_USER -d $DB_NAME
    
    exit 1
fi

log_message "Database restore process completed"
```

#### 2. Complete System Recovery Guide
```bash
nano /opt/scripts/disaster_recovery_guide.md
```

```markdown
# Disaster Recovery Guide

## Emergency Contacts
- System Administrator: admin@your-domain.com
- Database Administrator: dba@your-domain.com  
- Hosting Provider Support: support@hosting-provider.com

## Recovery Priority Order

### Priority 1: Database Recovery (RTO: 15 minutes)
1. Assess database damage
2. Restore from latest backup
3. Verify data integrity
4. Update application connections

### Priority 2: Application Recovery (RTO: 30 minutes)  
1. Deploy application from backup
2. Install dependencies
3. Configure environment
4. Start services

### Priority 3: Infrastructure Recovery (RTO: 2 hours)
1. Provision new server if needed
2. Configure networking
3. Setup monitoring
4. SSL certificate installation

## Step-by-Step Recovery Process

### Complete System Recovery
```bash
# 1. Provision new server
# 2. Install base system
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx -y

# 3. Restore application
cd /opt
sudo mkdir customer-analysis-dashboard
# Upload backup file
tar -xzf app_backup_latest.tar.gz

# 4. Restore database
./restore_database.sh /var/backups/customer-analysis/db_backup_latest.sql.gz

# 5. Start services
docker-compose -f docker-compose.production.yml up -d

# 6. Verify recovery
./health_check.sh
```

## Verification Checklist
- [ ] Database connection successful
- [ ] Application starts without errors  
- [ ] User authentication works
- [ ] API endpoints respond correctly
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured
- [ ] Backup system operational

## Post-Recovery Tasks
1. Update DNS if IP changed
2. Notify users of service restoration
3. Review incident and improve procedures
4. Test all critical functionality
5. Monitor system closely for 24 hours
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

**Symptoms:**
- Container fails to start
- Application exits with error code
- HTTP 502 Bad Gateway errors

**Troubleshooting Steps:**
```bash
# Check application logs
docker logs customer_analysis_app

# Check system resources
free -h
df -h
top

# Check environment variables
docker exec customer_analysis_app env | grep -E "(NODE_ENV|DATABASE_URL|JWT_SECRET)"

# Check file permissions
ls -la /opt/customer-analysis-dashboard
stat /opt/customer-analysis-dashboard/.env.production

# Manual start for debugging
cd /opt/customer-analysis-dashboard
npm start
```

**Common Solutions:**
```bash
# Fix environment file permissions
sudo chown root:www-data .env.production
sudo chmod 600 .env.production

# Rebuild application
npm install --legacy-peer-deps
npm run build

# Clear Next.js cache
rm -rf .next
npm run build
```

#### 2. Database Connection Issues

**Symptoms:**
- Database connection errors
- Authentication failures
- Timeout errors

**Troubleshooting Steps:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
docker logs customer_analysis_postgres

# Test direct connection
psql -h localhost -U postgres -d customer_analysis_db

# Check port availability
sudo netstat -tlnp | grep :5432
sudo ss -tlnp | grep :5432

# Verify credentials
docker exec customer_analysis_postgres psql -U postgres -c "\l"

# Check database logs
docker logs customer_analysis_postgres | tail -50
```

**Common Solutions:**
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
docker restart customer_analysis_postgres

# Reset password
docker exec -it customer_analysis_postgres psql -U postgres
\password postgres

# Check pg_hba.conf
docker exec customer_analysis_postgres cat /var/lib/postgresql/data/pg_hba.conf
```

#### 3. SSL/HTTPS Issues

**Symptoms:**
- SSL certificate errors
- Mixed content warnings
- Browser security errors

**Troubleshooting Steps:**
```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# Test SSL configuration
curl -I https://your-domain.com
openssl s_client -connect your-domain.com:443

# Check Nginx configuration
sudo nginx -t
sudo nginx -T | grep ssl

# Check certificate expiry
certbot certificates
```

**Common Solutions:**
```bash
# Renew certificate
sudo certbot renew --force-renewal
sudo systemctl reload nginx

# Fix mixed content
# Update all HTTP links to HTTPS in application

# Update security headers
# Check Nginx configuration for proper headers
```

#### 4. Performance Issues

**Symptoms:**
- Slow page loading
- High server load
- Database timeouts

**Troubleshooting Steps:**
```bash
# Check system resources
htop
iotop
free -h
df -h

# Database performance
docker exec customer_analysis_postgres psql -U postgres -d customer_analysis_db -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"

# Application metrics
docker stats customer_analysis_app
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Network testing
ping your-domain.com
traceroute your-domain.com
```

**Performance Optimization:**
```bash
# Optimize database
docker exec customer_analysis_postgres psql -U postgres -d customer_analysis_db -c "VACUUM ANALYZE;"

# Clear application cache
docker exec customer_analysis_app rm -rf .next/cache

# Optimize Nginx
sudo nginx -s reload

# Scale resources (if using cloud)
# Increase server size or add load balancer
```

### Debug Mode Activation

#### 1. Enable Debug Logging
```bash
# Update .env.production temporarily
nano .env.production
```

Add or update:
```env
DEBUG=true
LOG_LEVEL=debug
NODE_ENV=development
```

```bash
# Restart application
docker restart customer_analysis_app

# Watch logs in real-time
docker logs -f customer_analysis_app
```

#### 2. Health Check Script
```bash
nano /opt/scripts/health_check.sh
chmod +x /opt/scripts/health_check.sh
```

```bash
#!/bin/bash

echo "=== Customer Analysis Dashboard Health Check ==="
echo "Date: $(date)"
echo "==============================================="

# Check system resources
echo "🖥️  System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')%"
echo "Disk Usage: $(df -h / | awk 'NR==2 {print $5}')"
echo

# Check services
echo "🔧 Services Status:"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Running"
else
    echo "❌ Nginx: Not Running"
fi

if docker ps | grep -q customer_analysis_app; then
    echo "✅ Application: Running"
else
    echo "❌ Application: Not Running"
fi

if docker ps | grep -q customer_analysis_postgres; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not Running"
fi
echo

# Check database connectivity
echo "🗄️  Database:"
if docker exec customer_analysis_postgres pg_isready -U postgres >/dev/null 2>&1; then
    echo "✅ Database connection: OK"
    
    # Get database stats
    DB_SIZE=$(docker exec customer_analysis_postgres psql -U postgres -d customer_analysis_db -t -c "SELECT pg_size_pretty(pg_database_size('customer_analysis_db'));" | xargs)
    ACTIVE_CONN=$(docker exec customer_analysis_postgres psql -U postgres -d customer_analysis_db -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" | xargs)
    echo "📊 Database size: $DB_SIZE"
    echo "🔗 Active connections: $ACTIVE_CONN"
else
    echo "❌ Database connection: Failed"
fi
echo

# Check application endpoints
echo "🌐 Application Endpoints:"
if curl -s -o /dev/null -w "%{http_code}" https://your-domain.com | grep -q 200; then
    echo "✅ Main page: OK ($(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com))"
else
    echo "❌ Main page: Failed ($(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com))"
fi

if curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/auth/me | grep -q -E "(200|401)"; then
    echo "✅ API endpoints: OK"
else
    echo "❌ API endpoints: Failed"
fi
echo

# Check SSL certificate
echo "🔒 SSL Certificate:"
SSL_EXPIRY=$(openssl s_client -connect your-domain.com:443 -servername your-domain.com 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
if [ ! -z "$SSL_EXPIRY" ]; then
    echo "✅ SSL Certificate: Valid until $SSL_EXPIRY"
else
    echo "❌ SSL Certificate: Invalid or not found"
fi
echo

echo "==============================================="
echo "Health check completed at $(date)"
```

---

## Maintenance and Updates

### Regular Maintenance Tasks

#### 1. Weekly Maintenance Script
```bash
nano /opt/scripts/weekly_maintenance.sh
chmod +x /opt/scripts/weekly_maintenance.sh
```

```bash
#!/bin/bash

LOG_FILE="/var/log/weekly_maintenance.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

log_message "Starting weekly maintenance..."

# Update system packages
log_message "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Docker cleanup
log_message "Cleaning up Docker..."
docker system prune -f
docker image prune -f

# Log rotation
log_message "Rotating logs..."
sudo logrotate -f /etc/logrotate.conf

# Database maintenance
log_message "Database maintenance..."
docker exec customer_analysis_postgres psql -U postgres -d customer_analysis_db -c "
    VACUUM ANALYZE;
    REINDEX DATABASE customer_analysis_db;
"

# Clean temporary files
log_message "Cleaning temporary files..."
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

# Backup verification
log_message "Verifying backups..."
if [ -f "/var/backups/customer-analysis/db_backup_$(date +%Y%m%d)*.sql.gz" ]; then
    log_message "✅ Recent database backup found"
else
    log_message "⚠️  No recent database backup found"
fi

# SSL certificate check
log_message "Checking SSL certificate..."
SSL_DAYS=$(openssl x509 -checkend $((86400*30)) -noout -in /etc/letsencrypt/live/your-domain.com/fullchain.pem && echo "OK" || echo "EXPIRING")
if [ "$SSL_DAYS" = "OK" ]; then
    log_message "✅ SSL certificate valid for 30+ days"
else
    log_message "⚠️  SSL certificate expires within 30 days"
fi

log_message "Weekly maintenance completed"
```

#### 2. Update Procedures

**Application Updates:**
```bash
# Create update script
nano /opt/scripts/update_application.sh
chmod +x /opt/scripts/update_application.sh
```

```bash
#!/bin/bash

APP_DIR="/opt/customer-analysis-dashboard"
BACKUP_DIR="/var/backups/customer-analysis/updates"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create pre-update backup
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/pre_update_$TIMESTAMP.tar.gz" -C /opt customer-analysis-dashboard

cd $APP_DIR

# Pull latest changes (if using git)
git fetch origin
git checkout main
git pull origin main

# Update dependencies
npm install --legacy-peer-deps

# Build application
npm run build

# Restart services
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Health check
sleep 30
./health_check.sh

echo "Application update completed at $(date)"
```

**System Updates:**
```bash
# Create system update script  
nano /opt/scripts/update_system.sh
chmod +x /opt/scripts/update_system.sh
```

```bash
#!/bin/bash

# System update with safety checks
LOG_FILE="/var/log/system_update.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Pre-update backup
log_message "Creating pre-update system backup..."
./backup_application.sh
./backup_database.sh

# Update package lists
log_message "Updating package lists..."
sudo apt update

# Check for available updates
UPDATES=$(apt list --upgradable 2>/dev/null | wc -l)
log_message "Available updates: $((UPDATES-1))"

# Perform updates
log_message "Installing updates..."
sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y

# Update Docker images
log_message "Updating Docker images..."
cd /opt/customer-analysis-dashboard
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Clean up
log_message "Cleaning up..."
sudo apt autoremove -y
sudo apt autoclean

# Reboot if required
if [ -f /var/run/reboot-required ]; then
    log_message "System reboot required. Scheduling reboot in 5 minutes..."
    sudo shutdown -r +5 "System update completed. Reboot required."
else
    log_message "No reboot required."
fi

log_message "System update completed"
```

#### 3. Monitoring and Alerts

**Setup Monitoring Script:**
```bash
nano /opt/scripts/monitoring.sh
chmod +x /opt/scripts/monitoring.sh
```

```bash
#!/bin/bash

# Monitoring script with alerts
ALERT_EMAIL="admin@your-domain.com"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

send_alert() {
    local subject="$1"
    local message="$2"
    
    # Send email alert
    echo "$message" | mail -s "$subject" $ALERT_EMAIL
    
    # Send Slack notification
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 ALERT: $subject\\n$message\"}" \
        $WEBHOOK_URL
}

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    send_alert "High Disk Usage" "Disk usage is at ${DISK_USAGE}%"
fi

# Check memory usage  
MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEM_USAGE -gt 90 ]; then
    send_alert "High Memory Usage" "Memory usage is at ${MEM_USAGE}%"
fi

# Check application status
if ! curl -sf https://your-domain.com > /dev/null; then
    send_alert "Application Down" "Main application is not responding"
fi

# Check database connectivity
if ! docker exec customer_analysis_postgres pg_isready -U postgres > /dev/null; then
    send_alert "Database Down" "PostgreSQL is not responding"
fi

# Check SSL certificate expiry
SSL_DAYS=$(openssl x509 -checkend $((86400*7)) -noout -in /etc/letsencrypt/live/your-domain.com/fullchain.pem && echo "OK" || echo "EXPIRING")
if [ "$SSL_DAYS" = "EXPIRING" ]; then
    send_alert "SSL Certificate Expiring" "SSL certificate expires within 7 days"
fi
```

#### 4. Automated Maintenance Schedule
```bash
sudo crontab -e
```

Add comprehensive maintenance schedule:
```cron
# System monitoring every 5 minutes
*/5 * * * * /opt/scripts/monitoring.sh

# Health check every 15 minutes
*/15 * * * * /opt/scripts/health_check.sh

# Daily backups
0 2 * * * /opt/scripts/backup_database.sh
0 3 * * * /opt/scripts/backup_application.sh

# Weekly maintenance
0 4 * * 0 /opt/scripts/weekly_maintenance.sh

# Monthly system updates (first Sunday of month)
0 5 1-7 * 0 /opt/scripts/update_system.sh

# SSL certificate renewal check
0 6 * * * /usr/bin/certbot renew --quiet --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"

# Log cleanup monthly
0 1 1 * * find /var/log -name "*.log" -mtime +30 -delete
```

---

## Final Production Checklist

### Pre-Launch Checklist

#### Security ✅
- [ ] Firewall configured and enabled
- [ ] SSH hardened with key-based authentication
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database credentials secured
- [ ] Environment variables properly protected
- [ ] Security headers implemented
- [ ] Fail2Ban configured
- [ ] Regular security updates scheduled

#### Performance ✅
- [ ] Database optimized with proper indexes
- [ ] Nginx configured with compression and caching
- [ ] Connection pooling implemented
- [ ] Static assets optimized
- [ ] CDN configured (if applicable)
- [ ] Monitoring system active

#### Reliability ✅
- [ ] Automated backups scheduled and tested
- [ ] Health monitoring in place
- [ ] Error logging configured
- [ ] Disaster recovery procedures documented
- [ ] Update procedures tested
- [ ] Rollback procedures verified

#### Documentation ✅
- [ ] Server access credentials documented
- [ ] API documentation updated
- [ ] User guides created
- [ ] Admin procedures documented
- [ ] Emergency contacts listed
- [ ] Recovery procedures tested

### Post-Launch Tasks

#### Day 1 ✅
- [ ] Monitor all systems for 24 hours
- [ ] Verify all functionality works correctly
- [ ] Check backup completion
- [ ] Validate SSL certificate
- [ ] Test user registration and login
- [ ] Verify email notifications (if enabled)

#### Week 1 ✅
- [ ] Review system performance metrics
- [ ] Analyze access logs
- [ ] Check database performance
- [ ] Verify backup integrity
- [ ] Test disaster recovery procedures
- [ ] Gather user feedback

#### Month 1 ✅
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Backup strategy assessment
- [ ] User training completion
- [ ] Documentation updates
- [ ] Capacity planning review

---

This comprehensive server deployment guide provides everything needed to successfully deploy and maintain your Customer Analysis Dashboard in a production environment. The guide emphasizes security, reliability, and maintainability to ensure your application runs smoothly in production.

Remember to customize all configuration files, credentials, and domain names to match your specific deployment requirements. Regular monitoring and maintenance are crucial for maintaining a healthy production system.

For support or questions, refer to the troubleshooting section or contact your system administrator.