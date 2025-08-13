// Utility script to fix customer slab IDs
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

async function fixCustomerSlabs() {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Connected to database');
    
    // Get all customers with invalid slab IDs or missing slab IDs
    const customersRequest = pool.request();
    const customersResult = await customersRequest.query(`
      SELECT 
        c.id, c.device_type, c.brand, c.date_of_purchase, c.claim_value_slab_id, c.voucher_code
      FROM customers c
      LEFT JOIN claim_value_slabs cvs ON c.claim_value_slab_id = cvs.id
      WHERE c.claim_value_slab_id IS NULL OR cvs.id IS NULL
    `);
    
    const customers = customersResult.recordset;
    console.log(`Found ${customers.length} customers with missing/invalid slab IDs`);
    
    // Get all active claim value slabs
    const slabsRequest = pool.request();
    const slabsResult = await slabsRequest.query(`
      SELECT id, device_type, brand, min_months, max_months, percentage
      FROM claim_value_slabs 
      WHERE is_active = 1
      ORDER BY brand, min_months ASC
    `);
    
    const activeSlabs = slabsResult.recordset;
    console.log(`Found ${activeSlabs.length} active claim value slabs`);
    
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const customer of customers) {
      try {
        const purchaseDate = new Date(customer.date_of_purchase);
        const monthsDiff = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        // Find brand-specific slab first
        let matchingSlab = activeSlabs.find(slab => 
          slab.device_type === customer.device_type &&
          slab.brand === customer.brand &&
          monthsDiff >= slab.min_months && 
          monthsDiff <= slab.max_months
        );
        
        // If no brand-specific slab, try generic slab
        if (!matchingSlab) {
          matchingSlab = activeSlabs.find(slab => 
            slab.device_type === customer.device_type &&
            !slab.brand &&
            monthsDiff >= slab.min_months && 
            monthsDiff <= slab.max_months
          );
        }
        
        if (matchingSlab) {
          // Update customer with correct slab ID
          const updateRequest = pool.request();
          updateRequest.input('slabId', sql.Int, matchingSlab.id);
          updateRequest.input('customerId', sql.Int, customer.id);
          
          await updateRequest.query(`
            UPDATE customers 
            SET claim_value_slab_id = @slabId, updated_at = GETDATE()
            WHERE id = @customerId
          `);
          
          console.log(`✅ Updated customer ${customer.voucher_code} (${customer.brand} ${customer.device_type}, ${monthsDiff}mo) with slab ID ${matchingSlab.id} (${matchingSlab.percentage}%)`);
          updatedCount++;
        } else {
          console.log(`❌ No matching slab found for customer ${customer.voucher_code} (${customer.brand} ${customer.device_type}, ${monthsDiff}mo)`);
          failedCount++;
        }
      } catch (customerError) {
        console.error(`Error processing customer ${customer.id}:`, customerError.message);
        failedCount++;
      }
    }
    
    await pool.close();
    console.log(`\n=== Summary ===`);
    console.log(`Total customers processed: ${customers.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Failed to update: ${failedCount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixCustomerSlabs();