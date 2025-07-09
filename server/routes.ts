import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
// Stripe import removed - using PayU only
import crypto from "crypto";
import { storage } from "./sql-storage";
import { db } from "./db";
import sql from 'mssql';
import { 
  insertDistributorSchema, 
  insertCustomerSchema, 
  insertClaimSchema, 
  insertOtpSchema 
} from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Stripe removed - using PayU only

// PayU Configuration - Using environment variables
const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY || "test_merchant_key",
  salt: process.env.PAYU_SALT || "test_salt",
  baseUrl: process.env.PAYU_BASE_URL || "https://test.payu.in"
};

// Helper function to generate PayU hash
function generatePayUHash(params: any, salt: string): string {
  // PayU hash format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|${params.udf1 || ''}|${params.udf2 || ''}|${params.udf3 || ''}|${params.udf4 || ''}|${params.udf5 || ''}||||||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Distributor registration
  app.post("/api/distributors/register", async (req, res) => {
    try {
      const validatedData = insertDistributorSchema.parse(req.body);
      
      // Check if email already exists
      const existingDistributor = await storage.getDistributorByEmail(validatedData.email);
      if (existingDistributor) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const distributor = await storage.createDistributor(validatedData);
      res.status(201).json({ 
        message: "Distributor registered successfully", 
        sellerCode: distributor.sellerCode,
        distributor: {
          id: distributor.id,
          name: distributor.name,
          email: distributor.email,
          sellerCode: distributor.sellerCode
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Send OTP (for both customer and distributor registration)
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { contact } = req.body;
      if (!contact || contact.length !== 10) {
        return res.status(400).json({ message: "Valid 10-digit contact number required" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createOtp({
        contact,
        otp,
        expiresAt
      });

      // In production, send actual SMS here
      console.log(`OTP for ${contact}: ${otp}`);
      
      res.json({ message: "OTP sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Send OTP (legacy endpoint)
  app.post("/api/otp/send", async (req, res) => {
    try {
      const { contact } = req.body;
      if (!contact || contact.length !== 10) {
        return res.status(400).json({ message: "Valid 10-digit contact number required" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createOtp({
        contact,
        otp,
        expiresAt
      });

      // In production, send actual SMS here
      console.log(`OTP for ${contact}: ${otp}`);
      
      res.json({ message: "OTP sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  // Verify OTP (for both customer and distributor registration)
  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { contact, otp } = req.body;
      const isValid = await storage.verifyOtp(contact, otp);
      
      if (isValid) {
        res.json({ message: "OTP verified successfully", verified: true });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP", verified: false });
      }
    } catch (error: any) {
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  // Verify OTP (legacy endpoint)
  app.post("/api/otp/verify", async (req, res) => {
    try {
      const { contact, otp } = req.body;
      const isValid = await storage.verifyOtp(contact, otp);
      
      if (isValid) {
        res.json({ message: "OTP verified successfully", verified: true });
      } else {
        res.status(400).json({ message: "Invalid or expired OTP", verified: false });
      }
    } catch (error: any) {
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  // Stripe payment intent removed - using PayU only

  // Create PayU payment
  app.post("/api/create-payu-payment", async (req, res) => {
    try {
      const { customerData } = req.body;
      const deviceType = customerData.deviceType;
      const amount = deviceType === 'laptop' ? 125 : 99;
      
      // Generate unique transaction ID
      const txnid = `BBG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payuParams = {
        key: PAYU_CONFIG.merchantKey,
        txnid,
        amount: amount.toString(),
        productinfo: `BBG for ${deviceType}`,
        firstname: customerData.name,
        email: customerData.email,
        phone: customerData.contact,
        surl: `${req.protocol}://${req.get('host')}/api/payu/success`,
        furl: `${req.protocol}://${req.get('host')}/api/payu/failure`,
        udf1: deviceType,
        udf2: customerData.contact,
        udf3: customerData.pincode,
        udf4: customerData.sellerCode || '',
        udf5: JSON.stringify(customerData)
      };

      // Generate hash
      const hash = generatePayUHash(payuParams, PAYU_CONFIG.salt);
      payuParams.hash = hash;

      res.json({
        payuParams,
        payuUrl: `${PAYU_CONFIG.baseUrl}/_payment`,
        txnid
      });
    } catch (error: any) {
      console.error('PayU payment creation error:', error);
      res.status(500).json({ message: "Error creating PayU payment: " + error.message });
    }
  });

  // PayU Success Handler
  app.post("/api/payu/success", async (req, res) => {
    try {
      const { txnid, amount, status, hash, ...otherParams } = req.body;
      
      // Verify hash for security (reverse hash format for success)
      const verifyHashString = `${PAYU_CONFIG.salt}|${status}||||||||||${otherParams.udf5 || ''}|${otherParams.udf4 || ''}|${otherParams.udf3 || ''}|${otherParams.udf2 || ''}|${otherParams.udf1 || ''}|${otherParams.email}|${otherParams.firstname}|${otherParams.productinfo}|${amount}|${txnid}|${PAYU_CONFIG.merchantKey}`;
      const expectedHash = crypto.createHash('sha512').update(verifyHashString).digest('hex');
      
      if (hash !== expectedHash) {
        return res.status(400).json({ message: "Invalid hash verification" });
      }

      if (status === 'success') {
        // Extract customer data from UDF5
        const customerData = JSON.parse(otherParams.udf5);
        
        // Create customer registration with PayU transaction ID
        const submitData = {
          ...customerData,
          paymentIntentId: `payu_${txnid}`,
          isVerified: true
        };

        const customer = await storage.createCustomer(submitData);
        
        // Redirect to success page with voucher code
        res.redirect(`/thank-you?voucherCode=${customer.voucherCode}&paymentMethod=payu`);
      } else {
        res.redirect('/customer-registration?error=payment_failed');
      }
    } catch (error: any) {
      console.error('PayU success handler error:', error);
      res.redirect('/customer-registration?error=processing_error');
    }
  });

  // PayU Failure Handler
  app.post("/api/payu/failure", async (req, res) => {
    try {
      const { txnid, status, error: payuError } = req.body;
      console.log(`PayU payment failed for transaction ${txnid}: ${payuError}`);
      res.redirect('/customer-registration?error=payment_failed&txnid=' + txnid);
    } catch (error: any) {
      console.error('PayU failure handler error:', error);
      res.redirect('/customer-registration?error=processing_error');
    }
  });

  // Customer registration with payment processing (JSON data)
  app.post("/api/customers/register", async (req, res) => {
    try {
      console.log("Customer registration request body:", req.body);

      const customerData = {
        ...req.body,
        invoiceValue: req.body.invoiceValue?.toString() || "0",
        // Handle legacy fields for compatibility
        address: req.body.address || "",
        purchaseDate: req.body.purchaseDate || new Date().toISOString().split('T')[0],
        invoiceNumber: req.body.invoiceNumber || "N/A",
        invoiceFile: "N/A", // No file upload in new flow
        paymentIntentId: req.body.paymentIntentId || null,
        isVerified: true // Auto-verify since OTP was completed during registration
      };

      // Validate seller code if provided
      if (customerData.sellerCode) {
        const distributor = await storage.getDistributorBySellerCode(customerData.sellerCode);
        if (!distributor) {
          return res.status(400).json({ message: "Invalid seller code" });
        }
      }

      const validatedData = insertCustomerSchema.parse(customerData);
      const customer = await storage.createCustomer(validatedData);
      console.log("Customer created with voucher code:", customer.voucherCode);

      res.status(201).json({
        message: "Registration successful! You will receive confirmation shortly.",
        voucherCode: customer.voucherCode,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          voucherCode: customer.voucherCode,
          deviceType: customer.deviceType
        }
      });
    } catch (error: any) {
      console.error('Customer registration error:', error);
      console.error('Error details:', error.issues || error.details);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Get claim value
  app.post("/api/claims/check", async (req, res) => {
    try {
      const { voucherCode } = req.body;
      console.log("Claim check for voucher code:", voucherCode);
      
      const customer = await storage.getCustomerByVoucherCode(voucherCode);
      console.log("Customer found:", customer ? "Yes" : "No");
      if (!customer) {
        return res.status(404).json({ message: "Invalid BBG voucher code" });
      }

      if (!customer.isVerified) {
        return res.status(400).json({ message: "Customer registration not yet verified" });
      }

      // Calculate claim percentage based on device age
      const monthsDiff = Math.floor((Date.now() - customer.createdAt!.getTime()) / (1000 * 60 * 60 * 24 * 30));
      let claimPercentage = 0;
      
      if (monthsDiff >= 6 && monthsDiff <= 12) claimPercentage = 70;
      else if (monthsDiff >= 13 && monthsDiff <= 18) claimPercentage = 60;
      else if (monthsDiff >= 19 && monthsDiff <= 24) claimPercentage = 50;
      else if (monthsDiff >= 25 && monthsDiff <= 30) claimPercentage = 40;
      else if (monthsDiff >= 31 && monthsDiff <= 36) claimPercentage = 30;
      else if (monthsDiff >= 37 && monthsDiff <= 48) claimPercentage = 25;
      else if (monthsDiff >= 49 && monthsDiff <= 60) claimPercentage = 20;

      const claimAmount = (parseFloat(customer.invoiceValue) * claimPercentage) / 100;

      res.json({
        customer: {
          name: customer.name,
          deviceType: customer.deviceType,
          modelName: customer.modelName,
          invoiceValue: customer.invoiceValue
        },
        claimPercentage,
        claimAmount: claimAmount.toFixed(2),
        deviceAge: monthsDiff
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to check claim value" });
    }
  });

  // Submit claim
  app.post("/api/claims/submit", async (req, res) => {
    try {
      const { voucherCode, contact, email } = req.body;
      
      // First get the customer details
      const customer = await storage.getCustomerByVoucherCode(voucherCode);
      if (!customer) {
        return res.status(404).json({ message: "Invalid BBG voucher code" });
      }

      // Check if claim already exists
      const existingClaim = await storage.getClaimByVoucherCode(voucherCode);
      if (existingClaim) {
        return res.status(400).json({ message: "Claim already submitted for this voucher code" });
      }

      // Calculate claim percentage based on device age
      const monthsDiff = Math.floor((Date.now() - customer.createdAt!.getTime()) / (1000 * 60 * 60 * 24 * 30));
      let claimPercentage = 0;
      
      if (monthsDiff >= 6 && monthsDiff <= 12) claimPercentage = 70;
      else if (monthsDiff >= 13 && monthsDiff <= 18) claimPercentage = 60;
      else if (monthsDiff >= 19 && monthsDiff <= 24) claimPercentage = 50;
      else if (monthsDiff >= 25 && monthsDiff <= 30) claimPercentage = 40;
      else if (monthsDiff >= 31 && monthsDiff <= 36) claimPercentage = 30;
      else if (monthsDiff >= 37 && monthsDiff <= 48) claimPercentage = 25;
      else if (monthsDiff >= 49 && monthsDiff <= 60) claimPercentage = 20;

      if (claimPercentage === 0) {
        return res.status(400).json({ message: "Device is not eligible for claim. BBG coverage is valid for 6-60 months." });
      }

      const claimAmount = (customer.invoiceValue * claimPercentage) / 100;

      // Create the claim data with all required fields
      const claimData = {
        customerId: customer.id,
        voucherCode: voucherCode,
        contact: contact,
        email: email,
        deviceAgeMonths: monthsDiff,
        claimPercentage: claimPercentage,
        claimAmount: claimAmount
      };

      const claim = await storage.createClaim(claimData);
      
      res.status(201).json({
        message: "Claim submitted successfully! You will be contacted for device verification.",
        claim: {
          id: claim.id,
          claimAmount: claim.claimAmount,
          claimPercentage: claim.claimPercentage,
          deviceAgeMonths: claim.deviceAgeMonths,
          status: claim.status
        }
      });
    } catch (error: any) {
      console.error('Claim submission error:', error);
      res.status(400).json({ message: error.message || "Claim submission failed" });
    }
  });

  // Verify customer (admin endpoint)
  app.post("/api/customers/:id/verify", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      await storage.updateCustomerVerification(customerId, true);
      res.json({ message: "Customer verified successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Test endpoint to create customer with older date (for testing claims)
  app.post("/api/test/create-old-customer", async (req, res) => {
    try {
      // Create a customer with 8 months old purchase date for testing
      const testDate = new Date();
      testDate.setMonth(testDate.getMonth() - 8);
      
      const customerData = {
        name: "Test Customer 8M",
        contact: "9876543210",
        email: "test8m@example.com",
        pincode: "400001",
        deviceType: "mobile",
        serialNumber: "IMEI987654321098765",
        brand: "iPhone",
        modelName: "iPhone 13",
        invoiceValue: 55000,
        sellerCode: "XTSWN50S0"
      };

      const customer = await storage.createCustomer(customerData);
      
      // Manually update the created_at date in SQL Server
      await db.connectDB();
      const updateQuery = `UPDATE customers SET created_at = @oldDate WHERE id = @customerId`;
      const request = db.pool.request();
      request.input('customerId', sql.Int, customer.id);
      request.input('oldDate', sql.DateTime2, testDate);
      await request.query(updateQuery);
      
      // Verify the customer
      await storage.updateCustomerVerification(customer.id, true);
      
      res.json({
        message: "Test customer created with 8-month old purchase date",
        customer: {
          id: customer.id,
          voucherCode: customer.voucherCode,
          name: customer.name,
          deviceType: customer.deviceType,
          createdDate: testDate
        }
      });
    } catch (error: any) {
      console.error('Test customer creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get distributor stats
  app.get("/api/distributors/:sellerCode/stats", async (req, res) => {
    try {
      const { sellerCode } = req.params;
      
      const distributor = await storage.getDistributorBySellerCode(sellerCode);
      if (!distributor) {
        return res.status(404).json({ message: "Distributor not found" });
      }

      const customers = await storage.getCustomersBySellerCode(sellerCode);
      const totalSales = customers.length;
      const totalCommission = totalSales * 25; // ₹25 per sale

      res.json({
        distributor: {
          name: distributor.name,
          sellerCode: distributor.sellerCode
        },
        stats: {
          totalSales,
          totalCommission,
          pendingVerifications: customers.filter(c => !c.isVerified).length
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get distributor stats" });
    }
  });

  // Test SQL Server database connection
  app.get("/api/test-db", async (req, res) => {
    try {
      await db.connectDB();
      const query = `SELECT COUNT(*) as table_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
      const result = await db.query(query);
      
      res.json({
        status: "connected",
        message: "SQL Server database connection successful",
        server: "103.205.66.184:2499",
        database: "prexoDB",
        tablesCount: result.recordset[0].table_count
      });
    } catch (error: any) {
      console.error('Database test error:', error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
