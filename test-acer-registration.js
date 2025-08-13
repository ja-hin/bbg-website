import sql from 'mssql';

// Database connection config  
const dbConfig = {
  server: process.env.PGHOST,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 60000,
  connectionTimeout: 60000,
};

async function testAcerRegistration() {
  try {
    // Connect to database
    await sql.connect(dbConfig);
    console.log('Connected to database');
    
    // First, create a test IMEI if it doesn't exist
    const testImei = 'TESTEMAIL1234567890';
    
    // Check if test IMEI exists
    const checkResult = await sql.query`SELECT * FROM acer_imei_validation WHERE imei = ${testImei}`;
    
    if (checkResult.recordset.length === 0) {
      // Insert test IMEI
      await sql.query`INSERT INTO acer_imei_validation (imei, model, brand) VALUES (${testImei}, 'Aspire 5', 'Acer')`;
      console.log('✅ Test IMEI created:', testImei);
    } else {
      console.log('✅ Test IMEI already exists:', testImei);
      // Reset status to available for testing
      await sql.query`UPDATE acer_imei_validation SET status = NULL, customer_id = NULL, used_at = NULL WHERE imei = ${testImei}`;
      console.log('✅ Test IMEI reset for testing');
    }
    
    // Now test the registration API
    console.log('\n🧪 Testing Acer BBG registration API...');
    
    const fetch = await import('node-fetch').then(m => m.default);
    
    const registrationData = {
      deviceType: 'laptop',
      imeiSerial: testImei,
      brand: 'Acer',
      name: 'Ritwik Test User',
      model: 'Aspire 5',
      email: 'ritwik123tiwary@gmail.com',
      phone: '9953410422',
      pincode: '110001',
      purchasePrice: '45000',
      purchaseDate: '2024-12-01'
    };
    
    const response = await fetch('http://localhost:5000/api/acer-bbg/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationData)
    });
    
    const result = await response.json();
    console.log('\n📋 Registration API Response:');
    console.log('Status:', response.status);
    console.log('Result:', result);
    
    if (result.success) {
      console.log('\n✅ Registration successful!');
      console.log('🎟️ Voucher Code:', result.voucherCode);
      
      // Check if IMEI was marked as used
      const imeiCheck = await sql.query`SELECT * FROM acer_imei_validation WHERE imei = ${testImei}`;
      console.log('\n📊 IMEI Status After Registration:');
      console.log('Status:', imeiCheck.recordset[0]?.status);
      console.log('Customer ID:', imeiCheck.recordset[0]?.customer_id);
      console.log('Used At:', imeiCheck.recordset[0]?.used_at);
      
      // Check if customer was created
      const customerCheck = await sql.query`SELECT * FROM customers WHERE serial_number = ${testImei}`;
      if (customerCheck.recordset.length > 0) {
        console.log('\n👤 Customer Record Created:');
        console.log('ID:', customerCheck.recordset[0].id);
        console.log('Name:', customerCheck.recordset[0].name);
        console.log('Email:', customerCheck.recordset[0].email);
        console.log('Voucher Code:', customerCheck.recordset[0].voucher_code);
        console.log('Registration Source:', customerCheck.recordset[0].registration_source);
      }
    } else {
      console.log('\n❌ Registration failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sql.close();
  }
}

testAcerRegistration();