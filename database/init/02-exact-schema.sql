-- Create the exact schema from the CSV files
-- This will recreate the tables to match your original schema exactly

-- Use public schema as specified in CSV
SET search_path TO public;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS customer_classifications CASCADE;
DROP TABLE IF EXISTS customer_status CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS dorks CASCADE;
DROP TABLE IF EXISTS email CASCADE;
DROP TABLE IF EXISTS industries CASCADE;
DROP TABLE IF EXISTS one_time CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create countries table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(3) UNIQUE
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
    status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
    comment TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL
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

-- Create industries table
CREATE TABLE industries (
    id INTEGER PRIMARY KEY,
    industry TEXT NOT NULL
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

ALTER TABLE customer_status 
ADD CONSTRAINT customer_status_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

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
(2, 'Manufacturing'), 
(4, 'Finance'),
(3, 'Healthcare'), 
(1, 'Technology');

INSERT INTO customers (id, name, website, contact_email, created_at, updated_at) VALUES 
(1, 'Acme Corp', 'acme.com', 'info@acme.com', NOW(), NOW()), 
(3, 'Global Industries', 'global.com', 'hello@global.com', NOW(), NOW()), 
(2, 'Tech Solutions', 'techsol.com', 'contact@techsol.com', NOW(), NOW());

INSERT INTO customer_status (customer_id, status, comment, updated_at, user_id) VALUES 
(1, 'approved', 'Customer approved for collaboration', NOW(), 1), 
(3, 'approved', 'Good fit for our services', NOW(), 2),
(2, 'rejected', 'Not compatible with our products', NOW(), 1);

-- Insert countries data (alphabetically ordered)
INSERT INTO countries (name, code) VALUES
('Afghanistan', 'AF'),
('Albania', 'AL'),
('Algeria', 'DZ'),
('Andorra', 'AD'),
('Angola', 'AO'),
('Antigua and Barbuda', 'AG'),
('Argentina', 'AR'),
('Armenia', 'AM'),
('Australia', 'AU'),
('Austria', 'AT'),
('Azerbaijan', 'AZ'),
('Bahamas', 'BS'),
('Bahrain', 'BH'),
('Bangladesh', 'BD'),
('Barbados', 'BB'),
('Belarus', 'BY'),
('Belgium', 'BE'),
('Belize', 'BZ'),
('Benin', 'BJ'),
('Bhutan', 'BT'),
('Bolivia', 'BO'),
('Bosnia and Herzegovina', 'BA'),
('Botswana', 'BW'),
('Brazil', 'BR'),
('Brunei', 'BN'),
('Bulgaria', 'BG'),
('Burkina Faso', 'BF'),
('Burundi', 'BI'),
('Cabo Verde', 'CV'),
('Cambodia', 'KH'),
('Cameroon', 'CM'),
('Canada', 'CA'),
('Central African Republic', 'CF'),
('Chad', 'TD'),
('Chile', 'CL'),
('China', 'CN'),
('Colombia', 'CO'),
('Comoros', 'KM'),
('Congo, Democratic Republic of the', 'CD'),
('Congo, Republic of the', 'CG'),
('Costa Rica', 'CR'),
('Croatia', 'HR'),
('Cuba', 'CU'),
('Cyprus', 'CY'),
('Czech Republic', 'CZ'),
('Denmark', 'DK'),
('Djibouti', 'DJ'),
('Dominica', 'DM'),
('Dominican Republic', 'DO'),
('Ecuador', 'EC'),
('Egypt', 'EG'),
('El Salvador', 'SV'),
('Equatorial Guinea', 'GQ'),
('Eritrea', 'ER'),
('Estonia', 'EE'),
('Eswatini (Swaziland)', 'SZ'),
('Ethiopia', 'ET'),
('Fiji', 'FJ'),
('Finland', 'FI'),
('France', 'FR'),
('Gabon', 'GA'),
('Gambia', 'GM'),
('Georgia', 'GE'),
('Germany', 'DE'),
('Ghana', 'GH'),
('Greece', 'GR'),
('Grenada', 'GD'),
('Guatemala', 'GT'),
('Guinea', 'GN'),
('Guinea-Bissau', 'GW'),
('Guyana', 'GY'),
('Haiti', 'HT'),
('Honduras', 'HN'),
('Hungary', 'HU'),
('Iceland', 'IS'),
('India', 'IN'),
('Indonesia', 'ID'),
('Iran', 'IR'),
('Iraq', 'IQ'),
('Ireland', 'IE'),
('Israel', 'IL'),
('Italy', 'IT'),
('Jamaica', 'JM'),
('Japan', 'JP'),
('Jordan', 'JO'),
('Kazakhstan', 'KZ'),
('Kenya', 'KE'),
('Kiribati', 'KI'),
('Korea, North', 'KP'),
('Korea, South', 'KR'),
('Kuwait', 'KW'),
('Kyrgyzstan', 'KG'),
('Laos', 'LA'),
('Latvia', 'LV'),
('Lebanon', 'LB'),
('Lesotho', 'LS'),
('Liberia', 'LR'),
('Libya', 'LY'),
('Liechtenstein', 'LI'),
('Lithuania', 'LT'),
('Luxembourg', 'LU'),
('Madagascar', 'MG'),
('Malawi', 'MW'),
('Malaysia', 'MY'),
('Maldives', 'MV'),
('Mali', 'ML'),
('Malta', 'MT'),
('Marshall Islands', 'MH'),
('Mauritania', 'MR'),
('Mauritius', 'MU'),
('Mexico', 'MX'),
('Micronesia, Federated States of', 'FM'),
('Moldova, Republic of', 'MD'),
('Monaco', 'MC'),
('Mongolia', 'MN'),
('Montenegro', 'ME'),
('Morocco', 'MA'),
('Mozambique', 'MZ'),
('Myanmar (Burma)', 'MM'),
('Namibia', 'NA'),
('Nauru', 'NR'),
('Nepal', 'NP'),
('Netherlands', 'NL'),
('New Zealand', 'NZ'),
('Nicaragua', 'NI'),
('Niger', 'NE'),
('Nigeria', 'NG'),
('North Macedonia', 'MK'),
('Norway', 'NO'),
('Oman', 'OM'),
('Pakistan', 'PK'),
('Palau', 'PW'),
('Panama', 'PA'),
('Papua New Guinea', 'PG'),
('Paraguay', 'PY'),
('Peru', 'PE'),
('Philippines', 'PH'),
('Poland', 'PL'),
('Portugal', 'PT'),
('Qatar', 'QA'),
('Romania', 'RO'),
('Russia', 'RU'),
('Rwanda', 'RW'),
('Saint Kitts and Nevis', 'KN'),
('Saint Lucia', 'LC'),
('Saint Vincent and the Grenadines', 'VC'),
('Samoa', 'WS'),
('San Marino', 'SM'),
('Sao Tome and Principe', 'ST'),
('Saudi Arabia', 'SA'),
('Senegal', 'SN'),
('Serbia', 'RS'),
('Seychelles', 'SC'),
('Sierra Leone', 'SL'),
('Singapore', 'SG'),
('Slovakia', 'SK'),
('Slovenia', 'SI'),
('Somalia', 'SO'),
('South Africa', 'ZA'),
('South Sudan', 'SS'),
('Spain', 'ES'),
('Sri Lanka', 'LK'),
('Sudan', 'SD'),
('Suriname', 'SR'),
('Sweden', 'SE'),
('Switzerland', 'CH'),
('Syria', 'SY'),
('Tajikistan', 'TJ'),
('Tanzania', 'TZ'),
('Thailand', 'TH'),
('Timor-Leste (East Timor)', 'TL'),
('Togo', 'TG'),
('Tonga', 'TO'),
('Trinidad and Tobago', 'TT'),
('Tunisia', 'TN'),
('Turkey', 'TR'),
('Turkmenistan', 'TM'),
('Tuvalu', 'TV'),
('Uganda', 'UG'),
('Ukraine', 'UA'),
('United Arab Emirates', 'AE'),
('United Kingdom', 'GB'),
('United States', 'US'),
('Uruguay', 'UY'),
('Uzbekistan', 'UZ'),
('Vanuatu', 'VU'),
('Vatican City (Holy See)', 'VA'),
('Venezuela', 'VE'),
('Vietnam', 'VN'),
('Yemen', 'YE'),
('Zambia', 'ZM'),
('Zimbabwe', 'ZW');