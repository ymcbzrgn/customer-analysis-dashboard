-- Clean up database to keep only public schema
-- Drop customer_analysis schema completely

DROP SCHEMA IF EXISTS customer_analysis CASCADE;

-- Ensure we're using public schema
SET search_path TO public;