-- Create database initialization script
-- This script runs when PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS customer_analysis;

-- Set default schema
SET search_path TO customer_analysis, public;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    social_media JSONB DEFAULT '{}',
    website VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timezone VARCHAR(20) DEFAULT 'UTC-5',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    auto_analysis BOOLEAN DEFAULT true,
    email_alerts BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    weekly_reports BOOLEAN DEFAULT true,
    system_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create audit_logs table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_industry ON customers(industry);
CREATE INDEX IF NOT EXISTS idx_customers_score ON customers(score);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (email, password_hash, name, role, permissions, is_active) 
VALUES (
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    'Admin User',
    'admin',
    ARRAY['users.read', 'users.write', 'users.delete', 'customers.read', 'customers.write', 'customers.delete', 'analytics.read', 'settings.write'],
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default regular user (password: user123)
INSERT INTO users (email, password_hash, name, role, permissions, is_active) 
VALUES (
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    'Regular User',
    'user',
    ARRAY['customers.read', 'analytics.read'],
    true
) ON CONFLICT (email) DO NOTHING;

-- Get the user IDs for sample data
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO regular_user_id FROM users WHERE email = 'user@example.com';
    
    -- Insert sample customers
    INSERT INTO customers (name, email, country_code, industry, score, social_media, website, status, notes, description, user_id)
    VALUES 
    (
        'Sarah Johnson',
        'sarah.johnson@techcorp.com',
        'US',
        'Technology',
        89,
        '{"linkedin": "https://linkedin.com/in/sarahjohnson", "twitter": "https://twitter.com/sarahj", "facebook": "https://facebook.com/sarah.johnson"}',
        'https://techcorp.com',
        'pending',
        'High potential lead from tech conference',
        'Senior Software Engineer with 8+ years of experience in full-stack development. Specializes in React, Node.js, and cloud technologies. Active in tech communities and open source projects.',
        admin_user_id
    ),
    (
        'Michael Chen',
        'm.chen@financeplus.com',
        'CA',
        'Finance',
        92,
        '{"linkedin": "https://linkedin.com/in/michaelchen", "twitter": "https://twitter.com/mchen_finance"}',
        'https://financeplus.com',
        'approved',
        'Excellent financial background',
        'Financial Analyst with expertise in investment strategies and risk management. CFA certified with strong analytical skills and proven track record in portfolio management.',
        admin_user_id
    ),
    (
        'Emma Rodriguez',
        'emma.r@healthsolutions.com',
        'MX',
        'Healthcare',
        76,
        '{"linkedin": "https://linkedin.com/in/emmarodriguez", "instagram": "https://instagram.com/emma_health"}',
        'https://healthsolutions.com',
        'pending',
        'Healthcare industry expertise',
        'Healthcare Technology Specialist focused on digital health solutions and patient care optimization. Experience in telemedicine platforms and healthcare data analytics.',
        regular_user_id
    ),
    (
        'Alex Thompson',
        'alex@retailworld.com',
        'UK',
        'Retail',
        34,
        '{"facebook": "https://facebook.com/alex.thompson.retail"}',
        'https://retailworld.com',
        'rejected',
        'Low engagement score',
        'Retail Operations Manager with focus on supply chain optimization and customer experience. Working on digital transformation initiatives in traditional retail.',
        regular_user_id
    );
    
    -- Insert default preferences for users
    INSERT INTO user_preferences (user_id) VALUES (admin_user_id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO user_preferences (user_id) VALUES (regular_user_id) ON CONFLICT (user_id) DO NOTHING;
END $$;