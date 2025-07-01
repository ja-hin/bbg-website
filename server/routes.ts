import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";
import { storage } from "./storage";
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

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
}) : null;

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

  // Create payment intent for BBG purchase
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Payment processing not configured" });
      }

      const { deviceType } = req.body;
      const amount = deviceType === 'laptop' ? 125 : 99; // ₹125 for laptop, ₹99 for mobile

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to paise
        currency: "inr",
        metadata: {
          deviceType: deviceType
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: amount
      });
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Customer registration with payment processing (file upload optional)
  app.post("/api/customers/register", upload.single('invoiceFile'), async (req, res) => {
    try {
      const file = req.file;

      const customerData = {
        ...req.body,
        invoiceValue: req.body.invoiceValue?.toString() || "0",
        // Handle legacy fields for compatibility
        address: req.body.address || "",
        purchaseDate: req.body.purchaseDate || new Date().toISOString().split('T')[0],
        invoiceNumber: req.body.invoiceNumber || "N/A",
        invoiceFile: file?.filename || "N/A",
        paymentIntentId: req.body.paymentIntentId || null
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
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Get claim value
  app.post("/api/claims/check", async (req, res) => {
    try {
      const { voucherCode } = req.body;
      
      const customer = await storage.getCustomerByVoucherCode(voucherCode);
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
      const validatedData = insertClaimSchema.parse(req.body);
      
      // Check if claim already exists
      const existingClaim = await storage.getClaimByVoucherCode(validatedData.voucherCode);
      if (existingClaim) {
        return res.status(400).json({ message: "Claim already submitted for this voucher code" });
      }

      const claim = await storage.createClaim(validatedData);
      
      res.status(201).json({
        message: "Claim submitted successfully! You will be contacted for device verification.",
        claim: {
          id: claim.id,
          claimAmount: claim.claimAmount,
          claimPercentage: claim.claimPercentage,
          status: claim.status
        }
      });
    } catch (error: any) {
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

  const httpServer = createServer(app);
  return httpServer;
}
