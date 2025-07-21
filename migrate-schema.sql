-- Migration Script for Customer Analysis Dashboard
-- This script applies the current schema to an existing PostgreSQL database
-- Run this script on your existing PostgreSQL server to update the schema

-- Use public schema as specified in CSV
SET search_path TO public;

-- Drop existing tables if they exist (BE CAREFUL - this will delete all data)
-- Comment out the lines below if you want to preserve existing data
DROP TABLE IF EXISTS customer_classifications CASCADE;
DROP TABLE IF EXISTS customer_status CASCADE;
DROP TABLE IF EXISTS charts CASCADE;
DROP TABLE IF EXISTS email CASCADE;
DROP TABLE IF EXISTS dorks CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS one_time CASCADE;

-- Create countries table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(3) UNIQUE
);

-- Create industries table
CREATE TABLE industries (
    id INTEGER PRIMARY KEY,
    industry TEXT NOT NULL
);

-- Create users table
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
    id SERIAL PRIMARY KEY,
    country_code CHARACTER VARYING NOT NULL,
    industry_id INTEGER,
    content TEXT NOT NULL,
    is_analyzed INTEGER,
    started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    analyze_group_id INTEGER
);

-- Create customer_classifications table
CREATE TABLE customer_classifications (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'pending')),
    comment TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL
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

-- Create charts table for Data Library chart management
CREATE TABLE charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    source_table_name VARCHAR(255),
    chart_type VARCHAR(50) NOT NULL DEFAULT 'bar',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    CONSTRAINT charts_name_unique UNIQUE (name)
);

-- Add indexes for performance
CREATE INDEX idx_charts_source_table ON charts(source_table_name);
CREATE INDEX idx_charts_created_by ON charts(created_by);
CREATE INDEX idx_charts_public ON charts(is_public);
CREATE INDEX idx_charts_config_gin ON charts USING gin(config);

-- Add table comments for documentation
COMMENT ON TABLE customer_classifications IS 'system_table';
COMMENT ON TABLE customer_status IS 'system_table';
COMMENT ON TABLE customers IS 'system_table';
COMMENT ON TABLE dorks IS 'system_table';
COMMENT ON TABLE users IS 'system_table';
COMMENT ON TABLE charts IS 'system_table';

-- Add column comments for charts table
COMMENT ON COLUMN charts.config IS 'Chart configuration including type, axes, styling, and data settings';
COMMENT ON COLUMN charts.source_table_name IS 'Optional reference to source table name for data-driven charts';
COMMENT ON COLUMN charts.chart_type IS 'Chart type: bar, line, pie, area, etc.';
COMMENT ON COLUMN charts.is_public IS 'Whether chart is visible on Data Analysis page for regular users';

-- Add foreign key constraints
ALTER TABLE customer_classifications 
ADD CONSTRAINT customer_classifications_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE customer_classifications 
ADD CONSTRAINT customer_classifications_dork_id_fkey 
FOREIGN KEY (dork_id) REFERENCES dorks(id);

ALTER TABLE customer_status 
ADD CONSTRAINT customer_status_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE customer_status 
ADD CONSTRAINT customer_status_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE dorks 
ADD CONSTRAINT dorks_industry_id_fkey 
FOREIGN KEY (industry_id) REFERENCES industries(id);

ALTER TABLE email 
ADD CONSTRAINT email_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Create trigger for updated_at timestamp on charts
CREATE OR REPLACE FUNCTION update_charts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER charts_updated_at_trigger
    BEFORE UPDATE ON charts
    FOR EACH ROW
    EXECUTE FUNCTION update_charts_updated_at();

-- Insert sample users for testing
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

INSERT INTO customer_status (customer_id, status, comment, updated_at, user_id) VALUES 
(1, 'approved', 'Customer approved for collaboration', NOW(), 1), 
(2, 'rejected', 'Not compatible with our products', NOW(), 1),
(3, 'approved', 'Good fit for our services', NOW(), 2);

-- Insert countries data (selected countries for testing)
INSERT INTO countries (name, code) VALUES
('United States', 'US'),
('United Kingdom', 'GB'),
('Germany', 'DE'),
('France', 'FR'),
('Turkey', 'TR'),
('Canada', 'CA'),
('Australia', 'AU'),
('Japan', 'JP'),
('China', 'CN'),
('India', 'IN');

-- Insert sample charts
INSERT INTO charts (name, description, config, source_table_name, chart_type, is_public, created_by) 
SELECT 
    'Company Organization Chart',
    'Shows company organizational structure',
    '{
        "nodes": [
            {
                "id": "1",
                "type": "employee",
                "position": {"x": 250, "y": 50},
                "data": {
                    "label": "CEO",
                    "sublabel": "Chief Executive Officer",
                    "department": "Executive",
                    "level": 1,
                    "email": "ceo@company.com"
                }
            },
            {
                "id": "2",
                "type": "employee",
                "position": {"x": 100, "y": 200},
                "data": {
                    "label": "CTO",
                    "sublabel": "Chief Technology Officer",
                    "department": "Technology",
                    "level": 2,
                    "email": "cto@company.com"
                }
            },
            {
                "id": "3",
                "type": "employee",
                "position": {"x": 400, "y": 200},
                "data": {
                    "label": "CFO",
                    "sublabel": "Chief Financial Officer",
                    "department": "Finance",
                    "level": 2,
                    "email": "cfo@company.com"
                }
            }
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2"},
            {"id": "e1-3", "source": "1", "target": "3"}
        ]
    }',
    null,
    'organizational',
    true,
    u.id
FROM users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

INSERT INTO charts (name, description, config, source_table_name, chart_type, is_public, created_by) 
SELECT 
    'Sales Process Flow',
    'Shows sales team workflow process',
    '{
        "nodes": [
            {
                "id": "1",
                "type": "employee",
                "position": {"x": 250, "y": 50},
                "data": {
                    "label": "Sales Manager",
                    "sublabel": "Team Lead",
                    "department": "Sales",
                    "level": 3,
                    "email": "sales-manager@company.com"
                }
            },
            {
                "id": "2",
                "type": "employee",
                "position": {"x": 100, "y": 200},
                "data": {
                    "label": "Sales Rep A",
                    "sublabel": "Senior Sales",
                    "department": "Sales",
                    "level": 4,
                    "email": "sales-a@company.com"
                }
            },
            {
                "id": "3",
                "type": "employee",
                "position": {"x": 400, "y": 200},
                "data": {
                    "label": "Sales Rep B",
                    "sublabel": "Junior Sales",
                    "department": "Sales",
                    "level": 5,
                    "email": "sales-b@company.com"
                }
            },
            {
                "id": "4",
                "type": "employee",
                "position": {"x": 250, "y": 350},
                "data": {
                    "label": "Support Lead",
                    "sublabel": "Customer Support",
                    "department": "Operations",
                    "level": 3,
                    "email": "support@company.com"
                }
            }
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2"},
            {"id": "e1-3", "source": "1", "target": "3"},
            {"id": "e2-4", "source": "2", "target": "4"},
            {"id": "e3-4", "source": "3", "target": "4"}
        ]
    }',
    null,
    'flow',
    true,
    u.id
FROM users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

-- Migration completed successfully
SELECT 'Schema migration completed successfully!' as status;