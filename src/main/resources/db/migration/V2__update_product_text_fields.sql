-- Update product table to allow longer text fields for Arabic content
-- This migration increases the length limits for name and description fields

-- Increase name field length to 500 characters
ALTER TABLE product ALTER COLUMN name TYPE VARCHAR(500);

-- Increase description field length to 2000 characters  
ALTER TABLE product ALTER COLUMN description TYPE VARCHAR(2000);
