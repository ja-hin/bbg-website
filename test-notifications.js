import sql from "mssql";

async function testNotifications() {
  console.log("Testing notification system...");

  const config = {
    server: process.env.DB_SERVER || "127.0.0.1",
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || "bbgdb",
    user: process.env.DB_USERNAME || "sa",
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 30000,
      requestTimeout: 30000,
    },
  };

  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log("✅ Connected to database");

    // Check for existing distributors with referral codes
    const distributorsQuery = `
      SELECT TOP 3 id, name, email, contact, seller_code 
      FROM referral_partners 
      WHERE email IS NOT NULL 
      ORDER BY created_at DESC
    `;

    const distributorsResult = await pool.request().query(distributorsQuery);

    if (distributorsResult.recordset.length === 0) {
      console.log("❌ No distributors found in database");
    } else {
      console.log(
        "✅ Found distributors:",
        distributorsResult.recordset.length,
      );
      distributorsResult.recordset.forEach((dist) => {
        console.log(
          `   - ${dist.name} (${dist.email}) - Referral Code: ${dist.seller_code}`,
        );
      });
    }

    // Check for recent customers with referral codes
    const customersQuery = `
      SELECT TOP 5 id, name, email, contact, seller_code, voucher_code, created_at
      FROM customers 
      WHERE seller_code IS NOT NULL 
      ORDER BY created_at DESC
    `;

    const customersResult = await pool.request().query(customersQuery);

    if (customersResult.recordset.length === 0) {
      console.log("❌ No customers with referral codes found");
    } else {
      console.log(
        "✅ Found customers with referral codes:",
        customersResult.recordset.length,
      );
      customersResult.recordset.forEach((cust) => {
        console.log(
          `   - ${cust.name} (${cust.email}) - Seller: ${cust.seller_code} - BBG: ${cust.voucher_code}`,
        );
      });
    }

    // Check email templates
    const templatesQuery = `
      SELECT * FROM message_templates 
      WHERE event = 'distributor_bbg_notification' AND channel = 'email'
    `;

    const templatesResult = await pool.request().query(templatesQuery);

    if (templatesResult.recordset.length === 0) {
      console.log("❌ Distributor BBG email template not found");
    } else {
      console.log("✅ Found distributor BBG email template");
      const template = templatesResult.recordset[0];
      console.log(`   Subject: ${template.subject}`);
      console.log(
        `   Content preview: ${template.content.substring(0, 100)}...`,
      );
    }

    await pool.close();
  } catch (error) {
    console.error("❌ Database connection or query failed:", error);
  }
}

// Run the test
testNotifications().catch(console.error);
