import sql from 'mssql';

const config = {
  server: '103.205.66.184',
  port: 2499,
  database: 'bbgdb',
  user: 'qo8yhe',
  password: 'tFbs89!0Ryyx1^90',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function verifyBbgdb() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    const result = await pool.request().query(`
      SELECT 
        device_type,
        brand,
        COUNT(*) as count
      FROM claim_value_slabs 
      WHERE brand IS NOT NULL
      GROUP BY device_type, brand
      ORDER BY device_type, brand
    `);

    console.log('✅ bbgdb claim_value_slabs data verified:');
    result.recordset.forEach(row => {
      console.log(`   ${row.device_type}: ${row.brand} (${row.count} records)`);
    });
    
    const total = await pool.request().query('SELECT COUNT(*) as total FROM claim_value_slabs WHERE brand IS NOT NULL');
    console.log(`\nTotal brand-specific records: ${total.recordset[0].total}`);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyBbgdb();
