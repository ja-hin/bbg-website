const sql = require('mssql');

const config = {
  server: '103.205.66.184',
  port: 2499,
  database: 'prexoDB',
  user: 'qo8yhe',
  password: 'tFbs89!0Ryyx1^90',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function testConnection() {
  try {
    console.log('Connecting to SQL Server...');
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ SQL Server connected successfully');
    
    // Check if claim_value_slabs table exists
    const result = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'claim_value_slabs'
    `);
    
    if (result.recordset.length > 0) {
      console.log('✅ claim_value_slabs table exists');
      
      // Check data in the table
      const dataResult = await pool.request().query(`
        SELECT COUNT(*) as count, device_type, brand 
        FROM claim_value_slabs 
        GROUP BY device_type, brand 
        ORDER BY device_type, brand
      `);
      console.log('Current data in claim_value_slabs:');
      dataResult.recordset.forEach(row => {
        console.log(`  ${row.device_type} - ${row.brand || 'NULL'}: ${row.count} records`);
      });
    } else {
      console.log('❌ claim_value_slabs table does NOT exist');
    }
    
    await pool.close();
  } catch (error) {
    console.error('❌ SQL Server connection failed:', error.message);
  }
}

testConnection();
