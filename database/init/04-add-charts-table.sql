-- Add charts table for Data Library chart management
-- This table stores chart configurations in JSONB format

SET search_path TO public;

-- Create charts table
CREATE TABLE charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Chart configuration stored as JSONB for flexibility
    config JSONB NOT NULL DEFAULT '{}',
    
    -- Optional table linking
    source_table_name VARCHAR(255),
    
    -- Chart type for filtering and display
    chart_type VARCHAR(50) NOT NULL DEFAULT 'bar',
    
    -- Visibility on Data Analysis page
    is_public BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    created_by INTEGER,
    
    -- Constraints
    CONSTRAINT charts_name_unique UNIQUE (name)
);

-- Add indexes for performance
CREATE INDEX idx_charts_source_table ON charts(source_table_name);
CREATE INDEX idx_charts_created_by ON charts(created_by);
CREATE INDEX idx_charts_public ON charts(is_public);
CREATE INDEX idx_charts_config_gin ON charts USING gin(config);

-- Add table comment for documentation (mark as system table)
COMMENT ON TABLE charts IS 'system_table';

-- Add column comments for documentation
COMMENT ON COLUMN charts.config IS 'Chart configuration including type, axes, styling, and data settings';
COMMENT ON COLUMN charts.source_table_name IS 'Optional reference to source table name for data-driven charts';
COMMENT ON COLUMN charts.chart_type IS 'Chart type: bar, line, pie, area, etc.';
COMMENT ON COLUMN charts.is_public IS 'Whether chart is visible on Data Analysis page for regular users';

-- Create trigger for updated_at timestamp
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

-- Insert 2 sample node-based charts for testing
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