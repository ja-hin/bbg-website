// This endpoint adds the new registration slab columns to the customers table
// and backfills existing customers with their slab values

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const addRegistrationSlabColumns = `
-- Check and add registration_slab_percentage column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'registration_slab_percentage')
BEGIN
  ALTER TABLE customers ADD registration_slab_percentage INT NULL
  PRINT '✅ Added registration_slab_percentage column'
END
ELSE
  PRINT 'ℹ️ registration_slab_percentage column already exists'

-- Check and add registration_slab_range column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'registration_slab_range')
BEGIN
  ALTER TABLE customers ADD registration_slab_range NVARCHAR(50) NULL
  PRINT '✅ Added registration_slab_range column'
END
ELSE
  PRINT 'ℹ️ registration_slab_range column already exists'

-- Backfill existing customers with their slab values from claimValueSlabId
PRINT '📋 Backfilling existing customers with their slab values...'

UPDATE customers 
SET 
  registration_slab_percentage = claim_value_slabs.percentage,
  registration_slab_range = CONCAT(claim_value_slabs.min_months, '-', claim_value_slabs.max_months, ' months')
FROM customers 
INNER JOIN claim_value_slabs ON customers.claim_value_slab_id = claim_value_slabs.id
WHERE customers.claim_value_slab_id IS NOT NULL 
  AND (customers.registration_slab_percentage IS NULL OR customers.registration_slab_range IS NULL)

PRINT '✅ Backfill complete'
`;

export { addRegistrationSlabColumns };