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
import { kaleyraSMSService } from "./kaleyra-service";
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

// PayU Configuration - Using environment variables with test fallback for debugging
const PAYU_CONFIG = {
  merchantId: process.env.PAYU_MERCHANT_ID,  // PayU merchant ID (MID) - from secrets
  merchantKey: process.env.PAYU_MERCHANT_KEY,  // PayU merchant key - from secrets
  salt: process.env.PAYU_SALT,  // PayU salt - from secrets
  clientId: process.env.PAYU_CLIENT_ID,  // PayU client ID - from secrets
  clientSecret: process.env.PAYU_CLIENT_SECRET,  // PayU client secret - from secrets
  baseUrl: process.env.PAYU_BASE_URL || "https://test.payu.in"  // Default to test environment
};

// Validate PayU configuration - all secrets must be present
const requiredPayUSecrets = ['merchantId', 'merchantKey', 'salt', 'clientId', 'clientSecret'];
const missingSecrets = requiredPayUSecrets.filter(key => !PAYU_CONFIG[key as keyof typeof PAYU_CONFIG]);

if (missingSecrets.length > 0) {
  console.error('Missing PayU secrets:', missingSecrets);
  console.error('PayU payment gateway will not work without all required secrets');
} else {
  console.log('PayU Config: All secrets loaded successfully');
}

console.log('PayU Config:', {
  merchantId: PAYU_CONFIG.merchantId ? 'loaded' : 'missing',
  merchantKey: PAYU_CONFIG.merchantKey ? 'loaded' : 'missing',
  salt: PAYU_CONFIG.salt ? 'loaded' : 'missing',
  clientId: PAYU_CONFIG.clientId ? 'loaded' : 'missing',
  clientSecret: PAYU_CONFIG.clientSecret ? 'loaded' : 'missing',
  baseUrl: PAYU_CONFIG.baseUrl
});

// Helper function to generate PayU hash
function generatePayUHash(params: any, salt: string): string {
  // PayU hash format: key|txnid|amount|productinfo|firstname|email|||||||||||salt
  // Note: This is the BASIC format without UDF fields - let's try this first
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;
  
  console.log('PayU Basic Hash String:', hashString);
  console.log('Parameters:', JSON.stringify(params, null, 2));
  
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  console.log('Generated Basic Hash:', hash);
  
  return hash;
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

      // Validate phone number format
      if (!kaleyraSMSService.isValidPhoneNumber(contact)) {
        return res.status(400).json({ message: "Please enter a valid Indian mobile number" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await storage.createOtp({
        contact,
        otp,
        expiresAt
      });

      // Send OTP via Kaleyra SMS service
      const smsResult = await kaleyraSMSService.sendOTP(contact, otp);
      
      if (smsResult.success) {
        console.log(`OTP sent via Kaleyra to ${contact}: ${otp} (Message ID: ${smsResult.messageId})`);
        res.json({ 
          message: "OTP sent successfully",
          messageId: smsResult.messageId 
        });
      } else {
        console.error(`Failed to send OTP via Kaleyra to ${contact}:`, smsResult.error);
        // Fallback: log OTP for development/testing
        console.log(`FALLBACK - OTP for ${contact}: ${otp}`);
        res.json({ 
          message: "OTP sent successfully", 
          warning: "SMS service temporarily unavailable, please check console for OTP" 
        });
      }
    } catch (error: any) {
      console.error("OTP sending error:", error);
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

      // Validate phone number format
      if (!kaleyraSMSService.isValidPhoneNumber(contact)) {
        return res.status(400).json({ message: "Please enter a valid Indian mobile number" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await storage.createOtp({
        contact,
        otp,
        expiresAt
      });

      // Send OTP via Kaleyra SMS service
      const smsResult = await kaleyraSMSService.sendOTP(contact, otp);
      
      if (smsResult.success) {
        console.log(`OTP sent via Kaleyra to ${contact}: ${otp} (Message ID: ${smsResult.messageId})`);
        res.json({ 
          message: "OTP sent successfully",
          messageId: smsResult.messageId 
        });
      } else {
        console.error(`Failed to send OTP via Kaleyra to ${contact}:`, smsResult.error);
        // Fallback: log OTP for development/testing
        console.log(`FALLBACK - OTP for ${contact}: ${otp}`);
        res.json({ 
          message: "OTP sent successfully", 
          warning: "SMS service temporarily unavailable, please check console for OTP" 
        });
      }
    } catch (error: any) {
      console.error("OTP sending error:", error);
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

  // Distributor Authentication Routes
  // Distributor login with mobile and OTP
  app.post("/api/distributor/login", async (req, res) => {
    try {
      const { contact, otp } = req.body;
      
      if (!contact || !otp) {
        return res.status(400).json({ message: "Contact number and OTP are required" });
      }

      // Verify OTP first
      const isOtpValid = await storage.verifyOtp(contact, otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Find distributor by contact
      const distributor = await storage.getDistributorByContact(contact);
      if (!distributor) {
        return res.status(404).json({ message: "Distributor not found. Please register first." });
      }

      // Create session token
      const sessionToken = await storage.createDistributorSession(distributor.id, contact);
      
      res.json({
        message: "Login successful",
        distributor: {
          id: distributor.id,
          name: distributor.name,
          businessName: distributor.businessName,
          contact: distributor.contact,
          email: distributor.email,
          sellerCode: distributor.sellerCode
        },
        sessionToken
      });
    } catch (error: any) {
      console.error("Distributor login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Distributor logout
  app.post("/api/distributor/logout", async (req, res) => {
    try {
      const { sessionToken } = req.body;
      
      if (!sessionToken) {
        return res.status(400).json({ message: "Session token required" });
      }

      await storage.deleteDistributorSession(sessionToken);
      res.json({ message: "Logout successful" });
    } catch (error: any) {
      console.error("Distributor logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Verify distributor session
  app.get("/api/distributor/me", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const distributor = await storage.verifyDistributorSession(sessionToken);
      if (!distributor) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      res.json({
        distributor: {
          id: distributor.id,
          name: distributor.name,
          businessName: distributor.businessName,
          contact: distributor.contact,
          email: distributor.email,
          sellerCode: distributor.sellerCode
        }
      });
    } catch (error: any) {
      console.error("Session verification error:", error);
      res.status(500).json({ message: "Session verification failed" });
    }
  });

  // Get distributor dashboard stats
  app.get("/api/distributor/stats", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const distributor = await storage.verifyDistributorSession(sessionToken);
      if (!distributor) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      const stats = await storage.getDistributorStats(distributor.id);
      res.json(stats);
    } catch (error: any) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get distributor customers
  app.get("/api/distributor/customers", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const distributor = await storage.verifyDistributorSession(sessionToken);
      if (!distributor) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      const customers = await storage.getDistributorCustomers(distributor.id);
      res.json(customers);
    } catch (error: any) {
      console.error("Distributor customers error:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Get distributor payouts
  app.get("/api/distributor/payouts", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const distributor = await storage.verifyDistributorSession(sessionToken);
      if (!distributor) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      const payouts = await storage.getDistributorPayouts(distributor.id);
      res.json(payouts);
    } catch (error: any) {
      console.error("Distributor payouts error:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
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

  // Rate limiting for PayU payments (simple in-memory tracker)
  const payuRateLimit = new Map();

  // Create PayU payment
  app.post("/api/create-payu-payment", async (req, res) => {
    try {
      // Validate PayU configuration before processing payment
      if (!PAYU_CONFIG.merchantId || !PAYU_CONFIG.merchantKey || !PAYU_CONFIG.salt || !PAYU_CONFIG.clientId || !PAYU_CONFIG.clientSecret) {
        return res.status(500).json({ 
          message: "PayU payment gateway is not properly configured. Please contact support.",
          error: "Missing PayU credentials"
        });
      }

      const { customerData } = req.body;
      const deviceType = customerData.deviceType;
      const amount = deviceType === 'laptop' ? 125 : 99;
      
      // Check rate limiting for this IP
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const lastRequest = payuRateLimit.get(clientIP) || 0;
      
      // Enforce 60-second delay between requests per IP
      if (now - lastRequest < 60000) {
        const waitTime = Math.ceil((60000 - (now - lastRequest)) / 1000);
        return res.status(429).json({ 
          message: `Too many payment requests. Please wait ${waitTime} seconds before trying again.`,
          waitTime,
          retryAfter: waitTime
        });
      }
      
      // Update last request time
      payuRateLimit.set(clientIP, now);
      
      // Generate unique transaction ID
      const txnid = `BBG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store customer data in temporary storage for success handler
      // Using a simple in-memory map with transaction ID as key
      const tempStorage = app.locals.tempCustomerData || new Map();
      tempStorage.set(txnid, customerData);
      app.locals.tempCustomerData = tempStorage;
      
      // Create basic PayU parameters without UDF fields first
      const payuParams = {
        key: PAYU_CONFIG.merchantKey,
        txnid,
        amount: amount.toString(),
        productinfo: `BBG Registration`,
        firstname: customerData.name,
        email: customerData.email,
        phone: customerData.contact,
        surl: `${req.protocol}://${req.get('host')}/api/payu/success`,
        furl: `${req.protocol}://${req.get('host')}/api/payu/failure`
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
      const verifyHashString = `${PAYU_CONFIG.salt}|${status}||||||${otherParams.udf5 || ''}|${otherParams.udf4 || ''}|${otherParams.udf3 || ''}|${otherParams.udf2 || ''}|${otherParams.udf1 || ''}|${otherParams.email}|${otherParams.firstname}|${otherParams.productinfo}|${amount}|${txnid}|${PAYU_CONFIG.merchantKey}`;
      console.log('PayU Success Verify Hash String:', verifyHashString);
      const expectedHash = crypto.createHash('sha512').update(verifyHashString).digest('hex');
      
      if (hash !== expectedHash) {
        return res.status(400).json({ message: "Invalid hash verification" });
      }

      if (status === 'success') {
        // Get customer data from temporary storage
        const tempStorage = app.locals.tempCustomerData || new Map();
        const customerData = tempStorage.get(txnid);
        
        if (!customerData) {
          console.error('Customer data not found for transaction:', txnid);
          return res.redirect('/customer-registration?error=data_not_found');
        }
        
        // Create customer registration with PayU transaction ID
        const submitData = {
          ...customerData,
          paymentIntentId: `payu_${txnid}`,
          isVerified: true
        };

        const customer = await storage.createCustomer(submitData);
        
        // Clean up temporary storage
        tempStorage.delete(txnid);
        
        // Store success data in session for thank you page
        req.session.thankYouData = {
          type: 'customer',
          voucherCode: customer.voucherCode,
          paymentMethod: 'payu',
          customerName: customer.name,
          deviceType: customer.deviceType
        };
        
        // Redirect to success page without query parameters
        res.redirect('/thank-you');
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
      console.log("Customer data:", customer);
      if (!customer) {
        return res.status(404).json({ message: "Invalid BBG voucher code" });
      }

      if (!customer.isVerified) {
        return res.status(400).json({ message: "Customer registration not yet verified" });
      }

      // Calculate claim percentage based on device age
      const currentDate = new Date();
      const createdDate = new Date(customer.createdAt!);
      
      // More accurate month calculation
      let monthsDiff = (currentDate.getFullYear() - createdDate.getFullYear()) * 12;
      monthsDiff += currentDate.getMonth() - createdDate.getMonth();
      
      // Adjust if current day is before the creation day in the month
      if (currentDate.getDate() < createdDate.getDate()) {
        monthsDiff--;
      }
      
      console.log("Date calculation:", {
        currentDate: currentDate.toISOString(),
        createdDate: createdDate.toISOString(),
        monthsDiff
      });
      
      let claimPercentage = 0;
      
      if (monthsDiff >= 6 && monthsDiff <= 12) claimPercentage = 70;
      else if (monthsDiff >= 13 && monthsDiff <= 18) claimPercentage = 60;
      else if (monthsDiff >= 19 && monthsDiff <= 24) claimPercentage = 50;
      else if (monthsDiff >= 25 && monthsDiff <= 30) claimPercentage = 40;
      else if (monthsDiff >= 31 && monthsDiff <= 36) claimPercentage = 30;
      else if (monthsDiff >= 37 && monthsDiff <= 48) claimPercentage = 25;
      else if (monthsDiff >= 49 && monthsDiff <= 60) claimPercentage = 20;

      // Check if device is eligible for claim
      if (claimPercentage === 0) {
        if (monthsDiff < 6) {
          return res.status(400).json({ 
            message: `Device is not yet eligible for BBG claim. Your device is only ${monthsDiff} months old. BBG claims are valid from 6 months after purchase.`,
            eligible: false,
            deviceAge: monthsDiff,
            minimumAge: 6
          });
        } else if (monthsDiff > 60) {
          return res.status(400).json({ 
            message: `Device BBG coverage has expired. Your device is ${monthsDiff} months old. BBG coverage is valid for up to 60 months only.`,
            eligible: false,
            deviceAge: monthsDiff,
            maximumAge: 60
          });
        }
      }

      const claimAmount = (parseFloat(customer.invoiceValue) * claimPercentage) / 100;

      res.json({
        customer: {
          name: customer.name,
          deviceType: customer.deviceType,
          modelName: customer.modelName,
          invoiceValue: customer.invoiceValue,
          contact: customer.contact,
          serialNumber: customer.serialNumber
        },
        claimPercentage,
        claimAmount: claimAmount.toFixed(2),
        deviceAge: monthsDiff,
        eligible: true
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to check claim value" });
    }
  });

  // Submit claim
  app.post("/api/claims/submit", async (req, res) => {
    try {
      const { voucherCode, contact, email, serialNumber, pickupDate, pickupTimeSlot } = req.body;
      
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
        serialNumber: serialNumber,
        pickupDate: pickupDate,
        pickupTimeSlot: pickupTimeSlot,
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

  // Get thank you page data from session
  app.get("/api/thank-you-data", async (req, res) => {
    try {
      const thankYouData = req.session.thankYouData;
      if (thankYouData) {
        // Clear the session data after reading it
        delete req.session.thankYouData;
        res.json(thankYouData);
      } else {
        res.status(404).json({ message: "No thank you data found" });
      }
    } catch (error: any) {
      console.error('Thank you data fetch error:', error);
      res.status(500).json({ message: "Error retrieving thank you data" });
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

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const admin = await storage.verifyAdminPassword(username, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session or token (simplified - using session)
      req.session = req.session || {};
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role;

      // Save session explicitly
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });

      res.json({
        message: "Login successful",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLoginAt: admin.lastLoginAt
        }
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req: any, res) => {
    console.log('=== LOGOUT ENDPOINT HIT ===');
    console.log('Session before logout:', req.session?.adminId);
    console.log('Full session object:', req.session);
    
    // Force clear session data immediately
    if (req.session) {
      req.session.adminId = undefined;
      req.session.adminUsername = undefined;
      req.session.adminRole = undefined;
      
      // Regenerate session to completely clear it
      req.session.regenerate((err: any) => {
        if (err) {
          console.log('Session regenerate failed, clearing manually');
        }
        
        // Clear the session cookie aggressively
        res.clearCookie('connect.sid', { 
          path: '/',
          httpOnly: true,
          secure: false 
        });
        
        console.log('=== LOGOUT COMPLETED ===');
        res.json({ message: "Logout successful" });
      });
    } else {
      console.log('No session found');
      res.clearCookie('connect.sid', { path: '/' });
      res.json({ message: "Logout successful" });
    }
  });

  // Admin middleware to check authentication
  const isAdminAuthenticated = (req: any, res: any, next: any) => {
    console.log('Auth check - Session ID:', req.session?.adminId);
    console.log('Auth check - Session object:', req.session);
    
    if (!req.session?.adminId || req.session.adminId === undefined) {
      console.log('Authentication failed - no valid session');
      return res.status(401).json({ message: "Admin authentication required" });
    }
    next();
  };

  // Get current admin info
  app.get("/api/admin/me", async (req: any, res) => {
    // Add no-cache headers to prevent stale authentication responses
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    console.log('/api/admin/me called - Session ID:', req.session?.adminId);
    console.log('/api/admin/me called - Session username:', req.session?.adminUsername);
    
    // Check authentication inline with better error handling
    if (!req.session?.adminId || req.session.adminId === undefined) {
      console.log('Admin /me endpoint - Authentication failed');
      return res.status(401).json({ message: "Admin authentication required" });
    }

    try {
      const admin = await storage.getAdminByUsername(req.session.adminUsername);
      if (!admin) {
        console.log('Admin not found in database for username:', req.session.adminUsername);
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt
      });
    } catch (error: any) {
      console.error('Get admin info error:', error);
      res.status(500).json({ message: "Failed to get admin info" });
    }
  });

  // Admin Dashboard Data
  app.get("/api/admin/dashboard", isAdminAuthenticated, async (req, res) => {
    try {
      const [distributors, customers, claims] = await Promise.all([
        storage.getAllDistributors(),
        storage.getAllCustomers(),
        storage.getAllClaims()
      ]);

      // Calculate more accurate revenue based on device types
      const totalRevenue = customers.reduce((total, customer) => {
        const deviceTypeRevenue = customer.deviceType === 'laptop' ? 125 : 99;
        return total + deviceTypeRevenue;
      }, 0);

      const pendingClaims = claims.filter(c => c.status === 'pending').length;

      console.log('Dashboard stats:', {
        distributors: distributors.length,
        customers: customers.length,
        claims: claims.length,
        pendingClaims,
        totalRevenue
      });

      res.json({
        stats: {
          totalDistributors: distributors.length || 0,
          totalCustomers: customers.length || 0,
          totalClaims: claims.length || 0,
          pendingClaims: pendingClaims || 0,
          totalRevenue: totalRevenue || 0,
          recentCustomers: customers.slice(0, 10),
          recentClaims: claims.slice(0, 10)
        }
      });
    } catch (error: any) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Admin - Get all distributors
  app.get("/api/admin/distributors", isAdminAuthenticated, async (req, res) => {
    try {
      const distributors = await storage.getAllDistributors();
      res.json(distributors);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get distributors" });
    }
  });

  // Admin - Get all customers
  app.get("/api/admin/customers", isAdminAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get customers" });
    }
  });

  // Admin - Get all claims
  app.get("/api/admin/claims", isAdminAuthenticated, async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      res.json(claims);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get claims" });
    }
  });

  // Admin - Get all pending payments
  app.get("/api/admin/pending-payments", isAdminAuthenticated, async (req, res) => {
    try {
      const pendingPayments = await storage.getAllPendingPayments();
      res.json(pendingPayments);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get pending payments" });
    }
  });

  // Admin - Update pending payment status
  app.put("/api/admin/pending-payments/:id/status", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updatePendingPaymentStatus(parseInt(id), status);
      res.json({ message: "Payment status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Admin - Update claim status
  app.patch("/api/admin/claims/:id/status", isAdminAuthenticated, async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await storage.updateClaimStatus(claimId, status);
      res.json({ message: "Claim status updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update claim status" });
    }
  });

  // Brand management routes
  app.get("/api/brands", async (req, res) => {
    try {
      await db.connectDB();
      const deviceType = req.query.deviceType as string;
      
      let query = "SELECT * FROM brands WHERE is_active = 1";
      const request = db.pool.request();
      
      if (deviceType) {
        query += " AND device_type = @deviceType";
        request.input('deviceType', sql.VarChar, deviceType);
      }
      
      query += " ORDER BY name";
      const result = await request.query(query);
      
      const brands = result.recordset.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        deviceType: brand.device_type,
        isActive: brand.is_active
      }));
      
      res.json(brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      res.status(500).json({ message: 'Failed to fetch brands' });
    }
  });

  // Model management routes
  app.get("/api/models", async (req, res) => {
    try {
      await db.connectDB();
      const brandId = req.query.brandId as string;
      
      if (!brandId) {
        return res.json([]);
      }
      
      const request = db.pool.request();
      request.input('brandId', sql.Int, parseInt(brandId));
      
      const result = await request.query(`
        SELECT * FROM models 
        WHERE brand_id = @brandId AND is_active = 1
        ORDER BY name
      `);
      
      const models = result.recordset.map((model: any) => ({
        id: model.id,
        name: model.name,
        brandId: model.brand_id,
        isActive: model.is_active
      }));
      
      res.json(models);
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ message: 'Failed to fetch models' });
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

  // Debug admin user endpoint
  app.get("/api/admin/debug-user", async (req, res) => {
    try {
      const admin = await storage.getAdminByUsername('admin');
      res.json({
        exists: !!admin,
        admin: admin ? {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          hasPassword: !!admin.passwordHash,
          passwordLength: admin.passwordHash?.length || 0
        } : null
      });
    } catch (error: any) {
      console.error('Debug admin user error:', error);
      res.status(500).json({ message: "Failed to debug admin user", error: error.message });
    }
  });

  // Create default admin user if none exists
  app.post("/api/admin/create-default", async (req, res) => {
    try {
      // Check if any admin user exists
      const existingAdmin = await storage.getAdminByUsername('admin');
      if (existingAdmin) {
        return res.status(400).json({ message: "Default admin user already exists" });
      }

      // Create default admin user
      const defaultAdmin = await storage.createAdminUser({
        username: 'admin',
        email: 'admin@xtracover.com',
        passwordHash: 'admin123', // This will be hashed by the storage layer
        roleId: 1, // Default admin role
        role: 'admin'
      });

      res.json({
        message: "Default admin user created successfully",
        admin: {
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          email: defaultAdmin.email,
          role: defaultAdmin.role
        }
      });
    } catch (error: any) {
      console.error('Default admin creation error:', error);
      res.status(500).json({ message: "Failed to create default admin user" });
    }
  });

  // Test Kaleyra SMS service endpoint
  app.post("/api/test-kaleyra-sms", async (req, res) => {
    try {
      const { phoneNumber, testMessage } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Validate phone number format
      if (!kaleyraSMSService.isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ message: "Please enter a valid Indian mobile number" });
      }

      const testOTP = '123456';
      const customMessage = testMessage || `BBG Test SMS: Your test OTP is ${testOTP}. This is a test message from BBG application.`;
      
      // Test SMS sending via Kaleyra
      const smsResult = await kaleyraSMSService.sendOTP(phoneNumber, testOTP, customMessage);
      
      if (smsResult.success) {
        res.json({
          success: true,
          message: "Test SMS sent successfully via Kaleyra",
          messageId: smsResult.messageId,
          phoneNumber: phoneNumber,
          serviceName: "Kaleyra SMS"
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send test SMS via Kaleyra",
          error: smsResult.error,
          phoneNumber: phoneNumber,
          serviceName: "Kaleyra SMS"
        });
      }
    } catch (error: any) {
      console.error('Kaleyra SMS test error:', error);
      res.status(500).json({ 
        success: false,
        message: "Test SMS sending failed", 
        error: error.message 
      });
    }
  });

  // ===== MASTER MANAGEMENT ROUTES =====

  // User Roles Master Management
  app.get("/api/admin/user-roles", isAdminAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getAllUserRoles();
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get user roles" });
    }
  });

  app.post("/api/admin/user-roles", isAdminAuthenticated, async (req, res) => {
    try {
      const { roleName, description, permissions } = req.body;
      
      if (!roleName || !description || !permissions) {
        return res.status(400).json({ message: "Role name, description and permissions are required" });
      }

      const role = await storage.createUserRole({
        roleName,
        description,
        permissions: JSON.stringify(permissions)
      });

      res.status(201).json({
        message: "User role created successfully",
        role
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create user role" });
    }
  });

  app.put("/api/admin/user-roles/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const updates = req.body;

      if (updates.permissions && typeof updates.permissions === 'object') {
        updates.permissions = JSON.stringify(updates.permissions);
      }

      await storage.updateUserRole(roleId, updates);
      res.json({ message: "User role updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/user-roles/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      await storage.deleteUserRole(roleId);
      res.json({ message: "User role deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete user role" });
    }
  });

  // Admin Users Master Management
  app.get("/api/admin/admins", isAdminAuthenticated, async (req, res) => {
    try {
      const admins = await storage.getAllAdminUsers();
      // Remove password hash from response
      const sanitizedAdmins = admins.map(admin => ({
        ...admin,
        passwordHash: undefined
      }));
      res.json(sanitizedAdmins);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get admin users" });
    }
  });

  app.post("/api/admin/admins", isAdminAuthenticated, async (req, res) => {
    try {
      const { username, email, password, roleId, role } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
      }

      const admin = await storage.createAdminUser({
        username,
        email,
        passwordHash: password, // Will be hashed by storage
        roleId: roleId || 1,
        role: role || 'admin'
      });

      res.status(201).json({
        message: "Admin user created successfully",
        admin: {
          ...admin,
          passwordHash: undefined
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  app.put("/api/admin/admins/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      const updates = req.body;

      // Hash password if provided
      if (updates.password) {
        updates.passwordHash = updates.password;
        delete updates.password;
      }

      await storage.updateAdminUser(adminId, updates);
      res.json({ message: "Admin user updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update admin user" });
    }
  });

  app.delete("/api/admin/admins/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      await storage.deleteAdminUser(adminId);
      res.json({ message: "Admin user deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete admin user" });
    }
  });

  // Distributors Master Management (Enhanced with CRUD)
  app.post("/api/admin/distributors", isAdminAuthenticated, async (req, res) => {
    try {
      const distributorData = req.body;
      const distributor = await storage.createDistributor(distributorData);
      res.status(201).json({
        message: "Distributor created successfully",
        distributor
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create distributor" });
    }
  });

  app.put("/api/admin/distributors/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const distributorId = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateDistributor(distributorId, updates);
      res.json({ message: "Distributor updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update distributor" });
    }
  });

  app.delete("/api/admin/distributors/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const distributorId = parseInt(req.params.id);
      await storage.deleteDistributor(distributorId);
      res.json({ message: "Distributor deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete distributor" });
    }
  });

  // Customers Master Management (Enhanced with CRUD)
  app.post("/api/admin/customers", isAdminAuthenticated, async (req, res) => {
    try {
      const customerData = req.body;
      const customer = await storage.createCustomer(customerData);
      res.status(201).json({
        message: "Customer created successfully",
        customer
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/admin/customers/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateCustomer(customerId, updates);
      res.json({ message: "Customer updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/admin/customers/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      await storage.deleteCustomer(customerId);
      res.json({ message: "Customer deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // ===== BRAND MANAGEMENT ROUTES =====
  app.get("/api/brands", async (req, res) => {
    try {
      const deviceType = req.query.deviceType as string;
      let brands;
      
      if (deviceType) {
        brands = await storage.getBrandsByDeviceType(deviceType);
      } else {
        brands = await storage.getAllBrands();
      }
      
      res.json(brands);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get brands" });
    }
  });

  // Get brands with their models for admin management
  app.get("/api/brands-with-models", async (req, res) => {
    try {
      await db.connectDB();
      
      // Get all brands
      const brandsResult = await db.query(`
        SELECT * FROM brands WHERE is_active = 1 ORDER BY name
      `);
      
      const brands = [];
      for (const brand of brandsResult.recordset) {
        // Get models for each brand
        const modelsResult = await db.query(`
          SELECT * FROM models 
          WHERE brand_id = ${brand.id} AND is_active = 1 
          ORDER BY name
        `);
        
        brands.push({
          id: brand.id,
          name: brand.name,
          device_type: brand.device_type,
          is_active: brand.is_active,
          created_at: brand.created_at,
          updated_at: brand.updated_at,
          models: modelsResult.recordset.map((model: any) => ({
            id: model.id,
            name: model.name,
            brand_id: model.brand_id,
            is_active: model.is_active,
            created_at: model.created_at,
            updated_at: model.updated_at
          }))
        });
      }
      
      res.json(brands);
    } catch (error: any) {
      console.error('Error fetching brands with models:', error);
      res.status(500).json({ message: "Failed to get brands with models" });
    }
  });

  app.get("/api/admin/brands", isAdminAuthenticated, async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get brands" });
    }
  });

  // Create brand
  app.post("/api/brands", async (req, res) => {
    try {
      await db.connectDB();
      const { name, device_type, is_active = true } = req.body;
      
      if (!name || !device_type) {
        return res.status(400).json({ message: "Brand name and device type are required" });
      }

      const request = db.pool.request();
      request.input('name', sql.VarChar, name);
      request.input('device_type', sql.VarChar, device_type);
      request.input('is_active', sql.Bit, is_active);
      
      const result = await request.query(`
        INSERT INTO brands (name, device_type, is_active) 
        OUTPUT INSERTED.* 
        VALUES (@name, @device_type, @is_active)
      `);
      
      res.status(201).json({
        message: "Brand created successfully",
        brand: result.recordset[0]
      });
    } catch (error: any) {
      console.error('Error creating brand:', error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.post("/api/admin/brands", isAdminAuthenticated, async (req, res) => {
    try {
      const { name, deviceType } = req.body;
      
      if (!name || !deviceType) {
        return res.status(400).json({ message: "Brand name and device type are required" });
      }

      const brand = await storage.createBrand({
        name,
        deviceType
      });

      res.status(201).json({
        message: "Brand created successfully",
        brand
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  // Update brand
  app.put("/api/brands/:id", async (req, res) => {
    try {
      await db.connectDB();
      const brandId = parseInt(req.params.id);
      const { name, device_type } = req.body;
      
      const request = db.pool.request();
      request.input('id', sql.Int, brandId);
      request.input('name', sql.VarChar, name);
      request.input('device_type', sql.VarChar, device_type);
      request.input('updated_at', sql.DateTime2, new Date());
      
      const result = await request.query(`
        UPDATE brands 
        SET name = @name, device_type = @device_type, updated_at = @updated_at
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Brand not found" });
      }
      
      res.json({ 
        message: "Brand updated successfully",
        brand: result.recordset[0]
      });
    } catch (error: any) {
      console.error('Error updating brand:', error);
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  // Delete brand
  app.delete("/api/brands/:id", async (req, res) => {
    try {
      await db.connectDB();
      const brandId = parseInt(req.params.id);
      
      const request = db.pool.request();
      request.input('id', sql.Int, brandId);
      
      // First delete associated models
      await request.query(`DELETE FROM models WHERE brand_id = @id`);
      
      // Then delete the brand
      const result = await request.query(`DELETE FROM brands WHERE id = @id`);
      
      res.json({ message: "Brand deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  app.put("/api/admin/brands/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateBrand(brandId, updates);
      res.json({ message: "Brand updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete("/api/admin/brands/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      await storage.deleteBrand(brandId);
      res.json({ message: "Brand deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  // ===== DEVICE MODEL MANAGEMENT ROUTES =====
  app.get("/api/models", async (req, res) => {
    try {
      const brandId = req.query.brandId as string;
      let models;
      
      if (brandId) {
        models = await storage.getModelsByBrandId(parseInt(brandId));
      } else {
        models = await storage.getAllDeviceModels();
      }
      
      res.json(models);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get device models" });
    }
  });

  // Create model
  app.post("/api/models", async (req, res) => {
    try {
      await db.connectDB();
      const { name, brand_id, is_active = true } = req.body;
      
      if (!name || !brand_id) {
        return res.status(400).json({ message: "Model name and brand ID are required" });
      }

      const request = db.pool.request();
      request.input('name', sql.VarChar, name);
      request.input('brand_id', sql.Int, brand_id);
      request.input('is_active', sql.Bit, is_active);
      
      const result = await request.query(`
        INSERT INTO models (name, brand_id, is_active) 
        OUTPUT INSERTED.* 
        VALUES (@name, @brand_id, @is_active)
      `);
      
      res.status(201).json({
        message: "Model created successfully",
        model: result.recordset[0]
      });
    } catch (error: any) {
      console.error('Error creating model:', error);
      res.status(500).json({ message: "Failed to create model" });
    }
  });

  // Update model
  app.put("/api/models/:id", async (req, res) => {
    try {
      await db.connectDB();
      const modelId = parseInt(req.params.id);
      const { name } = req.body;
      
      const request = db.pool.request();
      request.input('id', sql.Int, modelId);
      request.input('name', sql.VarChar, name);
      request.input('updated_at', sql.DateTime2, new Date());
      
      const result = await request.query(`
        UPDATE models 
        SET name = @name, updated_at = @updated_at
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      res.json({ 
        message: "Model updated successfully",
        model: result.recordset[0]
      });
    } catch (error: any) {
      console.error('Error updating model:', error);
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  // Delete model
  app.delete("/api/models/:id", async (req, res) => {
    try {
      await db.connectDB();
      const modelId = parseInt(req.params.id);
      
      const request = db.pool.request();
      request.input('id', sql.Int, modelId);
      
      const result = await request.query(`DELETE FROM models WHERE id = @id`);
      
      res.json({ message: "Model deleted successfully" });
    } catch (error: any) {
      console.error('Error deleting model:', error);
      res.status(500).json({ message: "Failed to delete model" });
    }
  });

  app.get("/api/admin/models", isAdminAuthenticated, async (req, res) => {
    try {
      const models = await storage.getAllDeviceModels();
      res.json(models);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get device models" });
    }
  });

  app.post("/api/admin/models", isAdminAuthenticated, async (req, res) => {
    try {
      const { brandId, modelName, deviceType } = req.body;
      
      if (!brandId || !modelName || !deviceType) {
        return res.status(400).json({ message: "Brand ID, model name, and device type are required" });
      }

      const model = await storage.createDeviceModel({
        brandId,
        modelName,
        deviceType
      });

      res.status(201).json({
        message: "Device model created successfully",
        model
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create device model" });
    }
  });

  app.put("/api/admin/models/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateDeviceModel(modelId, updates);
      res.json({ message: "Device model updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update device model" });
    }
  });

  app.delete("/api/admin/models/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      await storage.deleteDeviceModel(modelId);
      res.json({ message: "Device model deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete device model" });
    }
  });

  // Temporary endpoint to create test distributor for login testing
  app.post("/api/admin/create-test-distributor", async (req, res) => {
    try {
      const testDistributor = {
        name: "Test Distributor",
        businessName: "Test Business",
        contact: "9769340476",
        email: "test@example.com",
        pincode: "400001",
        location: "Mumbai",
        preferredMode: "both"
      };
      
      const distributor = await storage.createDistributor(testDistributor);
      res.json({ 
        message: "Test distributor created successfully", 
        distributor 
      });
    } catch (error: any) {
      console.error("Error creating test distributor:", error);
      res.status(500).json({ message: "Failed to create test distributor: " + error.message });
    }
  });

  // Temporary endpoint to create missing distributor_sessions table
  app.post("/api/admin/create-missing-tables", async (req, res) => {
    try {
      await db.connectDB();
      
      // Create distributor_sessions table if it doesn't exist
      await db.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='distributor_sessions' AND xtype='U')
        CREATE TABLE distributor_sessions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          distributor_id INT NOT NULL,
          session_token NVARCHAR(255) NOT NULL UNIQUE,
          expires_at DATETIME2 NOT NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
        )
      `);
      
      // Create commission_payouts table if it doesn't exist
      await db.pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='commission_payouts' AND xtype='U')
        CREATE TABLE commission_payouts (
          id INT IDENTITY(1,1) PRIMARY KEY,
          distributor_id INT NOT NULL,
          customer_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status NVARCHAR(50) DEFAULT 'pending',
          payment_reference NVARCHAR(255),
          paid_at DATETIME2,
          created_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (distributor_id) REFERENCES distributors(id),
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
      `);
      
      res.json({ message: "Missing tables created successfully" });
    } catch (error: any) {
      console.error("Error creating missing tables:", error);
      res.status(500).json({ message: "Failed to create missing tables: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
