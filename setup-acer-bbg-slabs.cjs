// Migration script to add registration_source column and create Acer BBG slabs
const sql = require('mssql');

const config = {
  server: process.env.SQL_SERVER_HOST || '103.205.66.184',
  port: parseInt(process.env.SQL_SERVER_PORT || '2499'),
  database: process.env.SQL_SERVER_DATABASE || 'bbgdb',
  user: process.env.SQL_SERVER_USER || 'qo8yhe',
  password: process.env.SQL_SERVER_PASSWORD || 'tFbs89!0Ryyx1^90',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function setupAcerBBGSlabs() {
  try {
    console.log('Connecting to SQL Server...');
    await sql.connect(config);
    console.log('Connected to SQL Server successfully');
    
    // First, add registration_source column if it doesn't exist
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'claim_value_slabs' 
      AND COLUMN_NAME = 'registration_source'
    `;
    
    const columnCheck = await sql.query(checkColumnQuery);
    
    if (columnCheck.recordset.length === 0) {
      const alterQuery = `
        ALTER TABLE claim_value_slabs 
        ADD registration_source NVARCHAR(50) DEFAULT 'regular'
      `;
      
      await sql.query(alterQuery);
      console.log('✅ registration_source column added to claim_value_slabs');
    } else {
      console.log('registration_source column already exists');
    }
    
    // Update all existing slabs to have 'regular' as registration_source
    const updateExistingQuery = `
      UPDATE claim_value_slabs 
      SET registration_source = 'regular'
      WHERE registration_source IS NULL OR registration_source = ''
    `;
    
    const updateResult = await sql.query(updateExistingQuery);
    console.log(`✅ Updated ${updateResult.rowsAffected[0]} existing slabs to regular source`);
    
    // Check if Acer BBG slabs already exist
    const checkAcerBBGQuery = `
      SELECT COUNT(*) as count 
      FROM claim_value_slabs 
      WHERE brand = 'Acer' AND registration_source = 'acer_bbg'
    `;
    
    const acerBBGCheck = await sql.query(checkAcerBBGQuery);
    
    if (acerBBGCheck.recordset[0].count === 0) {
      // Create Acer BBG-specific laptop slabs with different rates
      const acerBBGSlabs = [
        { minMonths: 6, maxMonths: 12, percentage: 80 },   // Higher than regular Acer (70%)
        { minMonths: 13, maxMonths: 18, percentage: 68 },  // Higher than regular Acer (58%)
        { minMonths: 19, maxMonths: 24, percentage: 58 },  // Higher than regular Acer (48%)
        { minMonths: 25, maxMonths: 30, percentage: 48 },  // Higher than regular Acer (38%)
        { minMonths: 31, maxMonths: 36, percentage: 38 },  // Higher than regular Acer (28%)
        { minMonths: 37, maxMonths: 48, percentage: 33 },  // Higher than regular Acer (23%)
        { minMonths: 49, maxMonths: 60, percentage: 28 }   // Higher than regular Acer (18%)
      ];
      
      let createdCount = 0;
      for (const slab of acerBBGSlabs) {
        const insertQuery = `
          INSERT INTO claim_value_slabs 
          (device_type, brand, min_months, max_months, percentage, registration_source, is_active)
          VALUES ('laptop', 'Acer', ${slab.minMonths}, ${slab.maxMonths}, ${slab.percentage}, 'acer_bbg', 1)
        `;
        
        await sql.query(insertQuery);
        createdCount++;
      }
      
      console.log(`✅ Created ${createdCount} Acer BBG-specific laptop claim value slabs with higher rates`);
    } else {
      console.log(`Acer BBG slabs already exist (${acerBBGCheck.recordset[0].count} slabs)`);
    }
    
    // Show all Acer slabs for verification
    const verificationQuery = `
      SELECT device_type, brand, min_months, max_months, percentage, registration_source
      FROM claim_value_slabs 
      WHERE brand = 'Acer'
      ORDER BY registration_source, min_months
    `;
    
    const verification = await sql.query(verificationQuery);
    console.log('\n📊 All Acer claim value slabs:');
    verification.recordset.forEach(slab => {
      console.log(`  ${slab.registration_source}: ${slab.min_months}-${slab.max_months}m = ${slab.percentage}%`);
    });
    
    console.log('\n🎉 Acer BBG slab system setup completed successfully!');
    
    await sql.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up Acer BBG slabs:', error);
    process.exit(1);
  }
}

setupAcerBBGSlabs();