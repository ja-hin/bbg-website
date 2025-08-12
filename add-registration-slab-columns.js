import sql from 'mssql';

const config = {
  server: '103.205.66.184',
  port: 1433,
  database: 'bbgdb',
  user: 'bbg_user',
  password: 'Bbg@2024',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  requestTimeout: 30000,
  connectionTimeout: 30000
};

async function addRegistrationSlabColumns() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Connected to SQL Server');

    // Check if columns already exist
    const checkResult = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'customers' 
      AND COLUMN_NAME IN ('registration_slab_percentage', 'registration_slab_range')
    `);

    const existingColumns = checkResult.recordset.map(row => row.COLUMN_NAME);

    // Add registration_slab_percentage column if it doesn't exist
    if (!existingColumns.includes('registration_slab_percentage')) {
      await pool.request().query(`
        ALTER TABLE customers 
        ADD registration_slab_percentage INT NULL
      `);
      console.log('✅ Added registration_slab_percentage column');
    } else {
      console.log('ℹ️ registration_slab_percentage column already exists');
    }

    // Add registration_slab_range column if it doesn't exist  
    if (!existingColumns.includes('registration_slab_range')) {
      await pool.request().query(`
        ALTER TABLE customers 
        ADD registration_slab_range NVARCHAR(50) NULL
      `);
      console.log('✅ Added registration_slab_range column');
    } else {
      console.log('ℹ️ registration_slab_range column already exists');
    }

    // Now backfill existing customers with their slab values from claimValueSlabId
    console.log('📋 Backfilling existing customers with their slab values...');
    
    const customersResult = await pool.request().query(`
      SELECT id, claim_value_slab_id, device_type, brand, date_of_purchase 
      FROM customers 
      WHERE claim_value_slab_id IS NOT NULL 
      AND (registration_slab_percentage IS NULL OR registration_slab_range IS NULL)
    `);

    console.log(`Found ${customersResult.recordset.length} customers to backfill`);

    for (const customer of customersResult.recordset) {
      try {
        // Get the slab details from the claim_value_slabs table
        const slabRequest = pool.request();
        slabRequest.input('slabId', sql.Int, customer.claim_value_slab_id);
        
        const slabResult = await slabRequest.query(`
          SELECT percentage, min_months, max_months 
          FROM claim_value_slabs 
          WHERE id = @slabId
        `);

        if (slabResult.recordset.length > 0) {
          const slab = slabResult.recordset[0];
          const range = `${slab.min_months}-${slab.max_months} months`;
          
          const updateRequest = pool.request();
          updateRequest.input('customerId', sql.Int, customer.id);
          updateRequest.input('percentage', sql.Int, slab.percentage);
          updateRequest.input('range', sql.NVarChar, range);
          
          await updateRequest.query(`
            UPDATE customers 
            SET registration_slab_percentage = @percentage, 
                registration_slab_range = @range
            WHERE id = @customerId
          `);
          
          console.log(`✅ Updated customer ${customer.id} with ${slab.percentage}% (${range})`);
        }
      } catch (error) {
        console.error(`❌ Failed to update customer ${customer.id}:`, error.message);
      }
    }

    await pool.close();
    console.log('✅ Database schema update complete!');
  } catch (error) {
    console.error('❌ Error adding registration slab columns:', error);
  }
}

addRegistrationSlabColumns();