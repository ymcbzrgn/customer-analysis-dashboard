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
    created_by INTEGER REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT charts_name_unique UNIQUE (name)
);

-- Add indexes for performance
CREATE INDEX idx_charts_source_table ON charts(source_table_name);
CREATE INDEX idx_charts_created_by ON charts(created_by);
CREATE INDEX idx_charts_public ON charts(is_public);
CREATE INDEX idx_charts_config_gin ON charts USING gin(config);

-- Add table comment for documentation
COMMENT ON TABLE charts IS 'Chart management table for Data Library visualization system';

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

-- Insert sample chart data for testing
INSERT INTO charts (name, description, config, source_table_name, chart_type, is_public, created_by) VALUES
('Customer Status Distribution', 'Shows distribution of customer statuses', '{
    "type": "bar",
    "data": {
        "source": "customers",
        "groupBy": "status",
        "aggregation": "count"
    },
    "display": {
        "title": "Customer Status Distribution",
        "xAxis": "Status",
        "yAxis": "Count",
        "colors": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
    }
}', 'customers', 'bar', true, 1),

('Industry Breakdown', 'Breakdown of customers by industry', '{
    "type": "pie",
    "data": {
        "source": "customers",
        "joinTable": "industries",
        "groupBy": "industry",
        "aggregation": "count"
    },
    "display": {
        "title": "Industry Breakdown",
        "colors": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
    }
}', 'customers', 'pie', true, 1),

('Custom Demo Chart', 'Sample independent chart with custom data', '{
    "type": "line",
    "data": {
        "source": "custom",
        "values": [
            {"month": "Jan", "value": 120},
            {"month": "Feb", "value": 180},
            {"month": "Mar", "value": 150},
            {"month": "Apr", "value": 220},
            {"month": "May", "value": 200}
        ]
    },
    "display": {
        "title": "Monthly Trend",
        "xAxis": "Month",
        "yAxis": "Value",
        "color": "#3b82f6"
    }
}', null, 'line', true, 1);