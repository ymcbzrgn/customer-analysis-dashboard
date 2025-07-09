#!/bin/bash

# Install PostgreSQL natively in WSL2 Ubuntu
echo "Installing PostgreSQL natively..."

# Update package index
sudo apt update

# Install PostgreSQL and pgAdmin4
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create database user and database
sudo -u postgres psql << EOF
CREATE USER postgres WITH PASSWORD 'postgres_password_2024';
ALTER USER postgres CREATEDB;
CREATE DATABASE customer_analysis_db OWNER postgres;
\q
EOF

# Create database schema
sudo -u postgres psql -d customer_analysis_db -f /mnt/c/Users/Evaict/Downloads/customer-analysis-dashboard/database/init/01-init-database.sql

# Enable PostgreSQL to start automatically
sudo update-rc.d postgresql enable

echo "PostgreSQL installation complete!"
echo "Database: customer_analysis_db"
echo "User: postgres"
echo "Password: postgres_password_2024"
echo "Port: 5432"
echo ""
echo "To connect: psql -h localhost -U postgres -d customer_analysis_db"
echo ""
echo "Update your .env.local file with:"
echo "DATABASE_URL=postgresql://postgres:postgres_password_2024@localhost:5432/customer_analysis_db"