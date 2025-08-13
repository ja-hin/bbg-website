// Fix existing Acer registration to have correct registration_source
const sql = require('mssql');

const dbConfig = {
  server: '103.205.66.184',
  port: 2499,
  database: 'bbgdb',
  user: 'testuser',
  password: 'hIB7TjmL',
  options: {
    encrypt: false,
    enableArithAbort: true,
    connectTimeout: 60000,
    requestTimeout: 60000,
  },
};

async function fixAcerRegistrationSource() {
  try {
    console.log('Connecting to SQL Server...');
    await sql.connect(dbConfig);
    
    // First, let's see all customers and their current registration_source values
    const checkQuery = `
      SELECT id, name, brand, registration_source, registration_slab_data 
      FROM customers 
      WHERE brand = 'Acer' OR registration_slab_data LIKE '%acer_bbg%'
      ORDER BY id DESC
    `;
    
    console.log('Checking current Acer customer records...');
    const result = await sql.query(checkQuery);
    console.log('Found records:', result.recordset);
    
    // Update customers where brand is 'Acer' and registration_slab_data contains 'acer_bbg'
    const updateQuery = `
      UPDATE customers 
      SET registration_source = 'acer_bbg' 
      WHERE (brand = 'Acer' AND registration_slab_data LIKE '%acer_bbg%') 
         OR (registration_slab_data LIKE '%"registrationSource":"acer_bbg"%')
    `;
    
    console.log('Updating Acer customer registration sources...');
    const updateResult = await sql.query(updateQuery);
    console.log(`Updated ${updateResult.rowsAffected[0]} records`);
    
    // Verify the update
    console.log('Verifying updates...');
    const verifyResult = await sql.query(checkQuery);
    console.log('Updated records:', verifyResult.recordset);
    
    console.log('✅ Fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing registration source:', error);
  } finally {
    await sql.close();
  }
}

// Run the fix
fixAcerRegistrationSource();