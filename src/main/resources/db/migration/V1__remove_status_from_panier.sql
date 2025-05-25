-- First make the column nullable
ALTER TABLE panier ALTER COLUMN status DROP NOT NULL;

-- Then remove the column
ALTER TABLE panier DROP COLUMN status; 