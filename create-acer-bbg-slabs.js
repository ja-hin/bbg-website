import sql from 'mssql';

async function createAcerBbgSlabs() {
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'bbgdb', 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 30000,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    }
  };

  try {
    console.log('🔍 Connecting to SQL Server...');
    const pool = await sql.connect(config);
    
    // Check if Acer BBG slabs already exist
    const existingCheck = await pool.request()
      .query(`SELECT COUNT(*) as count FROM claim_value_slabs WHERE registration_source = 'acer_bbg'`);
    
    if (existingCheck.recordset[0].count > 0) {
      console.log('✅ Acer BBG slabs already exist:', existingCheck.recordset[0].count);
      await pool.close();
      return;
    }
    
    console.log('🚀 Creating Acer BBG slabs with higher rates...');
    
    // Get all regular Acer laptop slabs to create BBG variants
    const regularAcerSlabs = await pool.request()
      .query(`SELECT * FROM claim_value_slabs 
              WHERE device_type = 'laptop' 
              AND brand = 'Acer' 
              AND (registration_source IS NULL OR registration_source = 'regular')`);
    
    console.log('Found', regularAcerSlabs.recordset.length, 'regular Acer laptop slabs');
    
    let createdCount = 0;
    for (const slab of regularAcerSlabs.recordset) {
      // Create Acer BBG version with higher percentage (add 10% points)
      const bbgPercentage = Math.min(slab.percentage + 10, 80); // Cap at 80%
      
      await pool.request()
        .input('deviceType', sql.NVarChar, 'laptop')
        .input('brand', sql.NVarChar, 'Acer')
        .input('minMonths', sql.Int, slab.min_months)
        .input('maxMonths', sql.Int, slab.max_months)  
        .input('percentage', sql.Decimal(5,2), bbgPercentage)
        .input('registrationSource', sql.NVarChar, 'acer_bbg')
        .query(`INSERT INTO claim_value_slabs 
               (device_type, brand, min_months, max_months, percentage, is_active, registration_source, created_at, updated_at) 
               VALUES (@deviceType, @brand, @minMonths, @maxMonths, @percentage, 1, @registrationSource, GETDATE(), GETDATE())`);
      
      console.log(`✅ Created Acer BBG slab: ${slab.min_months}-${slab.max_months} months, ${bbgPercentage}%`);
      createdCount++;
    }
    
    // Verify creation
    const finalCheck = await pool.request()
      .query(`SELECT COUNT(*) as count FROM claim_value_slabs WHERE registration_source = 'acer_bbg'`);
    
    console.log(`🎉 Created ${finalCheck.recordset[0].count} Acer BBG slabs successfully!`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

createAcerBbgSlabs();