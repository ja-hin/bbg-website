// Quick debug script to check customer data
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  server: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT),
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

async function checkCustomers() {
  try {
    console.log('Connecting to database...');
    await sql.connect(dbConfig);
    
    // Check if columns exist
    const columnsResult = await sql.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'customers' AND COLUMN_NAME IN ('registration_slab_percentage', 'registration_slab_range', 'claim_value_slab_id')
    `);
    console.log('Columns found:', columnsResult.recordset.map(r => r.COLUMN_NAME));
    
    // Check customer data
    const customersResult = await sql.query(`
      SELECT id, name, voucher_code, claim_value_slab_id, registration_slab_percentage, registration_slab_range
      FROM customers 
      ORDER BY created_at DESC
    `);
    
    console.log('Customer data:');
    customersResult.recordset.forEach(customer => {
      console.log({
        id: customer.id,
        name: customer.name,
        voucherCode: customer.voucher_code,
        claimValueSlabId: customer.claim_value_slab_id,
        registrationSlabPercentage: customer.registration_slab_percentage,
        registrationSlabRange: customer.registration_slab_range
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.close();
  }
}

checkCustomers();