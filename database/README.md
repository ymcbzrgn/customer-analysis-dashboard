# Database Setup Guide

## PostgreSQL + pgAdmin4 Setup

This project uses PostgreSQL as the primary database with pgAdmin4 as the web-based administration interface.

## Quick Start

### 1. Start the Database Services

```bash
# Start PostgreSQL and pgAdmin4
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Access pgAdmin4 Web Interface

- **URL**: http://localhost:8080
- **Email**: admin@customeranalysis.com
- **Password**: pgadmin_password_2024

The database server should be automatically configured and visible in pgAdmin4.

### 3. Database Connection Details

- **Host**: localhost (or postgres if connecting from another container)
- **Port**: 5432
- **Database**: customer_analysis_db
- **Username**: postgres
- **Password**: postgres_password_2024
- **Schema**: customer_analysis

## Database Structure

### Tables

1. **users** - User accounts and authentication
2. **customers** - Customer lead data
3. **user_preferences** - User settings and preferences
4. **user_sessions** - Session management
5. **audit_logs** - Audit trail for changes

### Default Users

Two default users are created during initialization:

1. **Admin User**
   - Email: admin@example.com
   - Password: admin123
   - Role: admin
   - Permissions: Full access

2. **Regular User**
   - Email: user@example.com
   - Password: user123
   - Role: user
   - Permissions: Limited access

## Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Key variables to configure:
- `DATABASE_URL` - Full connection string
- `JWT_SECRET` - Secret for JWT tokens (MUST change in production)
- `DB_PASSWORD` - Database password

## Production Considerations

### Security
- Change all default passwords
- Use strong JWT secrets
- Enable SSL for database connections
- Restrict database access by IP
- Use environment-specific credentials

### Performance
- Configure connection pooling
- Set up read replicas if needed
- Monitor query performance
- Implement proper indexing

### Backup
- Set up automated backups
- Test backup restoration procedures
- Store backups securely

## Database Management Commands

```bash
# Stop services
docker-compose down

# Rebuild and restart (clears data)
docker-compose down -v
docker-compose up -d

# View logs
docker-compose logs postgres
docker-compose logs pgadmin

# Access PostgreSQL directly
docker exec -it customer_analysis_postgres psql -U postgres -d customer_analysis_db

# Backup database
docker exec customer_analysis_postgres pg_dump -U postgres customer_analysis_db > backup.sql

# Restore database
docker exec -i customer_analysis_postgres psql -U postgres customer_analysis_db < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml if 5432 or 8080 are in use
2. **Permission issues**: Ensure Docker has permission to create volumes
3. **Connection refused**: Wait for PostgreSQL to fully start (can take 30-60 seconds)

### Health Checks

```bash
# Check if PostgreSQL is accepting connections
docker exec customer_analysis_postgres pg_isready -U postgres

# Check container status
docker-compose ps

# View container logs
docker-compose logs -f
```

## Schema Migrations

When making schema changes:

1. Create new migration files in `database/migrations/`
2. Test migrations on development database
3. Apply migrations to production with proper backup
4. Update documentation

## Next Steps

After setting up the database:

1. Install PostgreSQL client library: `npm install pg @types/pg`
2. Update database layer to use PostgreSQL instead of JSON files
3. Test all API endpoints with the new database
4. Set up connection pooling for production