-- Create the exact schema from the CSV files
-- This will recreate the tables to match your original schema exactly

-- Use public schema as specified in CSV
SET search_path TO public;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS customer_classifications CASCADE;
DROP TABLE IF EXISTS customer_status CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS dorks CASCADE;
DROP TABLE IF EXISTS email CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS one_time CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create industries table
CREATE TABLE industries (
    id INTEGER PRIMARY KEY,
    industry TEXT NOT NULL
);

-- Create customers table
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    contact_email TEXT,
    facebook TEXT,
    twitter TEXT,
    linkedin TEXT,
    instagram TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Create dorks table
CREATE TABLE dorks (
    id INTEGER PRIMARY KEY,
    country_code CHARACTER VARYING NOT NULL,
    industry_id INTEGER,
    content TEXT NOT NULL,
    is_analyzed INTEGER
);

-- Create customer_classifications table
CREATE TABLE customer_classifications (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    dork_id INTEGER,
    has_metal_tin_clues TEXT,
    compatible_with_masas_products TEXT,
    compatibility_score INTEGER,
    should_send_intro_email TEXT,
    description TEXT,
    detailed_compatibility_score INTEGER
);

-- Create customer_status table
CREATE TABLE customer_status (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    comment TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Create email table
CREATE TABLE email (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    content TEXT NOT NULL
);

-- Create one_time table
CREATE TABLE one_time (
    id INTEGER PRIMARY KEY,
    website TEXT NOT NULL,
    compatibility_score NUMERIC
);

-- Create users table (the only addition)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    password_reset_token VARCHAR(255),
    password_reset_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraints as specified in the CSV
COMMENT ON TABLE customer_classifications IS 'system_table';
COMMENT ON TABLE customer_status IS 'system_table';
COMMENT ON TABLE customers IS 'system_table';
COMMENT ON TABLE dorks IS 'system_table';
COMMENT ON TABLE users IS 'system_table';

ALTER TABLE customer_classifications 
ADD CONSTRAINT customer_classifications_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE customer_classifications 
ADD CONSTRAINT customer_classifications_dork_id_fkey 
FOREIGN KEY (dork_id) REFERENCES dorks(id);

ALTER TABLE customer_status 
ADD CONSTRAINT customer_status_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE dorks 
ADD CONSTRAINT dorks_industry_id_fkey 
FOREIGN KEY (industry_id) REFERENCES industries(id);

ALTER TABLE email 
ADD CONSTRAINT email_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Insert sample users for testing
-- Note: Using bcrypt for password hashing
INSERT INTO users (email, password_hash, name, role, permissions, is_active) 
VALUES 
(
    'admin@example.com',
    '$2b$10$QPt.nvD6oGDDYyFneG4Um.7uQtLREvggU4sceeIk4iR0H5QftBQ/S', -- password: admin123
    'Admin User',
    'admin',
    ARRAY['users.read', 'users.write', 'users.delete', 'customers.read', 'customers.write', 'customers.delete', 'analytics.read', 'settings.write'],
    true
),
(
    'user@example.com',
    '$2b$10$0mXDSpueEjG1CxyL5eQD2uUn0gHvNvzFNBjIkSsHkofOpa1aXYqjW', -- password: user123
    'Regular User',
    'user',
    ARRAY['customers.read', 'analytics.read'],
    true
);

-- Insert sample data to support charts
INSERT INTO industries (id, industry) VALUES 
(1, 'Technology'), 
(2, 'Manufacturing'), 
(3, 'Healthcare'), 
(4, 'Finance');

INSERT INTO customers (id, name, website, contact_email, created_at, updated_at) VALUES 
(1, 'Acme Corp', 'acme.com', 'info@acme.com', NOW(), NOW()), 
(2, 'Tech Solutions', 'techsol.com', 'contact@techsol.com', NOW(), NOW()), 
(3, 'Global Industries', 'global.com', 'hello@global.com', NOW(), NOW());

INSERT INTO customer_status (id, customer_id, status, comment, updated_at) VALUES 
(1, 1, 'Active', 'Sample customer', NOW()), 
(2, 2, 'Pending', 'New lead', NOW()), 
(3, 3, 'Inactive', 'Old customer', NOW()), 
(4, 1, 'Active', 'Another active', NOW());