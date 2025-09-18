import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
// Stripe import removed - using PayU only
import crypto from "crypto";
import { storage, SqlServerStorage } from "./sql-storage";
import { db } from "./db";
import sql from "mssql";
import XLSX from "xlsx";
import { communicationService } from "./communication-service";
import {
  initializeServices,
  getSafeKaleyraSMSService,
  getSafeGupshupService,
  getSafePayUConfig,
} from "./config-service";
import { templateService } from "./template-service";
import { testAllTemplates } from "./template-test";
import { registerTestRoutes } from "./test-services";
import { s3Service, createS3Upload } from "./s3-service";
import AWS from "aws-sdk";
import bcrypt from "bcryptjs";
// Removed nodemailer import - using communicationService instead
import {
  insertDistributorSchema,
  insertCustomerSchema,
  insertClaimSchema,
  insertOtpSchema,
  insertDeviceRegistrationSchema,
} from "@shared/schema";
// Using SQL Server for all database operations

// Configure S3-only file uploads
console.log("🔧 S3 Configuration: Using S3-only upload for all file storage");

// S3-only upload configuration for documents (invoices, payment proofs)
const upload = createS3Upload("documents");

// S3-only upload configuration for bulk data uploads (Excel/CSV) - stored temporarily for processing
const bulkUpload = createS3Upload("bulk-uploads");

// S3-only upload configuration for public banner images
const bannerUpload = createS3Upload("documents", true);

// Stripe removed - using PayU only

// PayU Configuration will be initialized in registerRoutes using config service

// Helper function to generate PayU hash
function generatePayUHash(params: any, salt: string): string {
  // PayU hash format: key|txnid|amount|productinfo|firstname|email|||||||||||salt
  // Note: This is the BASIC format without UDF fields - let's try this first
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;

  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  return hash;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize all services with environment variables
  await initializeServices();

  // Initialize template service
  await templateService.initializeTables();

  // Distributor registration with file uploads
  app.post(
    "/api/distributors/register",
    upload.fields([
      { name: "panCopyFile", maxCount: 1 },
      { name: "gstCertificateFile", maxCount: 1 },
      { name: "msmeCertificateFile", maxCount: 1 },
      { name: "cancelledChequeFile", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        console.log("Distributor registration request received");
        console.log("Request body keys:", Object.keys(req.body));
        console.log(
          "Request files:",
          req.files ? Object.keys(req.files) : "No files",
        );

        // Process form data
        const formData = { ...req.body };

        // Convert boolean strings to actual booleans
        if (formData.isGstRegistered)
          formData.isGstRegistered = formData.isGstRegistered === "true";
        if (formData.isMsmeRegistered)
          formData.isMsmeRegistered = formData.isMsmeRegistered === "true";
        if (formData.declarationAccuracy)
          formData.declarationAccuracy =
            formData.declarationAccuracy === "true";
        if (formData.tdsUnderstanding)
          formData.tdsUnderstanding = formData.tdsUnderstanding === "true";
        if (formData.gstInvoiceAgreement)
          formData.gstInvoiceAgreement =
            formData.gstInvoiceAgreement === "true";
        if (formData.termsAgreement)
          formData.termsAgreement = formData.termsAgreement === "true";

        // Handle S3 file uploads
        const files =
          (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};
        console.log("Files object:", files);

        if (files && files.panCopyFile && files.panCopyFile[0]) {
          formData.panCopyFile =
            (files.panCopyFile[0] as any).key ||
            (files.panCopyFile[0] as any).location;
          console.log("✅ PAN copy file uploaded to S3:", formData.panCopyFile);
        }
        if (files && files.gstCertificateFile && files.gstCertificateFile[0]) {
          formData.gstCertificateFile = (
            files.gstCertificateFile[0] as any
          ).key;
          console.log(
            "✅ GST certificate file uploaded to S3:",
            formData.gstCertificateFile,
          );
        }
        if (
          files &&
          files.msmeCertificateFile &&
          files.msmeCertificateFile[0]
        ) {
          formData.msmeCertificateFile = (
            files.msmeCertificateFile[0] as any
          ).key;
          console.log(
            "✅ MSME certificate file uploaded to S3:",
            formData.msmeCertificateFile,
          );
        }
        if (
          files &&
          files.cancelledChequeFile &&
          files.cancelledChequeFile[0]
        ) {
          formData.cancelledChequeFile = (
            files.cancelledChequeFile[0] as any
          ).key;
          console.log(
            "✅ Cancelled cheque file uploaded to S3:",
            formData.cancelledChequeFile,
          );
        }

        // Remove bankAccountConfirm as it's not stored in database
        const { bankAccountConfirm, ...distributorData } = formData;

        // Validate data (skip file validation since we handle files separately)
        const validatedData = distributorData;

        // Check if email already exists
        const existingDistributor = await storage.getDistributorByEmail(
          validatedData.email,
        );
        if (existingDistributor) {
          return res.status(400).json({ message: "Email already registered" });
        }

        const distributor = await storage.createDistributor(validatedData);

        // Send welcome notifications
        try {
          const notificationResults =
            await communicationService.sendReferralPartnerWelcome({
              name: distributor.name,
              email: distributor.email,
              contact: distributor.contact,
              sellerCode: distributor.sellerCode,
              businessName: distributor.businessName,
            });
          console.log(
            "Referral partner welcome notifications sent:",
            notificationResults,
          );
        } catch (notifyError: any) {
          console.error("Failed to send notifications:", notifyError.message);
          // Don't fail the registration if notifications fail
        }

        // Store success data in session for thank you page
        req.session.thankYouData = {
          type: "distributor",
          sellerCode: distributor.sellerCode,
          distributorName: distributor.name,
        };

        res.status(201).json({
          message: "Distributor registered successfully",
          sellerCode: distributor.sellerCode,
          distributor: {
            id: distributor.id,
            name: distributor.name,
            email: distributor.email,
            sellerCode: distributor.sellerCode,
          },
        });
      } catch (error: any) {
        console.error("Distributor registration error:", error);
        res
          .status(400)
          .json({ message: error.message || "Registration failed" });
      }
    },
  );

  // Send OTP (for both customer and distributor registration)
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { contact, phone } = req.body;
      const phoneNumber = contact || phone; // Support both field names

      if (!phoneNumber || phoneNumber.length !== 10) {
        return res
          .status(400)
          .json({ message: "Valid 10-digit contact number required" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await storage.createOtp({
        contact: phoneNumber,
        otp,
        expiresAt,
      });

      // Send OTP via Kaleyra SMS service (using safe getter)
      const kaleyraSMS = getSafeKaleyraSMSService();
      let smsResult;

      if (kaleyraSMS) {
        // Validate phone number format if service is available
        if (!kaleyraSMS.isValidPhoneNumber(phoneNumber)) {
          return res
            .status(400)
            .json({ message: "Please enter a valid Indian mobile number" });
        }
        smsResult = await kaleyraSMS.sendOTP(phoneNumber, otp);
      } else {
        // Service not configured
        smsResult = { success: false, error: "SMS service not configured" };
      }

      if (smsResult.success) {
        console.log(
          `OTP sent via Kaleyra to ${phoneNumber}: ${otp} (Message ID: ${smsResult.messageId})`,
        );
        res.json({
          message: "OTP sent successfully",
          messageId: smsResult.messageId,
        });
      } else {
        console.error(
          `Failed to send OTP via Kaleyra to ${phoneNumber}:`,
          smsResult.error,
        );
        // Fallback: log OTP for development/testing
        console.log(`FALLBACK - OTP for ${phoneNumber}: ${otp}`);
        res.json({
          message: "OTP sent successfully",
          warning:
            "SMS service temporarily unavailable, please check console for OTP",
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
        return res
          .status(400)
          .json({ message: "Valid 10-digit contact number required" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await storage.createOtp({
        contact,
        otp,
        expiresAt,
      });

      // Send OTP via Kaleyra SMS service (using safe getter)
      const kaleyraSMS = getSafeKaleyraSMSService();
      let smsResult;

      if (kaleyraSMS) {
        // Validate phone number format if service is available
        if (!kaleyraSMS.isValidPhoneNumber(contact)) {
          return res
            .status(400)
            .json({ message: "Please enter a valid Indian mobile number" });
        }
        smsResult = await kaleyraSMS.sendOTP(contact, otp);
      } else {
        // Service not configured
        smsResult = { success: false, error: "SMS service not configured" };
      }

      if (smsResult.success) {
        console.log(
          `OTP sent via Kaleyra to ${contact}: ${otp} (Message ID: ${smsResult.messageId})`,
        );
        res.json({
          message: "OTP sent successfully",
          messageId: smsResult.messageId,
        });
      } else {
        console.error(
          `Failed to send OTP via Kaleyra to ${contact}:`,
          smsResult.error,
        );
        // Fallback: log OTP for development/testing
        console.log(`FALLBACK - OTP for ${contact}: ${otp}`);
        res.json({
          message: "OTP sent successfully",
          warning:
            "SMS service temporarily unavailable, please check console for OTP",
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
      const { contact, phone, otp } = req.body;
      const phoneNumber = contact || phone; // Support both field names
      const isValid = await storage.verifyOtp(phoneNumber, otp);

      if (isValid) {
        res.json({ message: "OTP verified successfully", verified: true });
      } else {
        res
          .status(400)
          .json({ message: "Invalid or expired OTP", verified: false });
      }
    } catch (error: any) {
      res.status(500).json({ message: "OTP verification failed" });
    }
  });

  // Customer Authentication Routes
  // Customer login with mobile and OTP
  app.post("/api/customer/login", async (req, res) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res
          .status(400)
          .json({ message: "Phone number and OTP are required" });
      }

      // Verify OTP first
      const isOtpValid = await storage.verifyOtp(phone, otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Find customer by phone number
      const customers = await storage.getCustomersByContact(phone);
      if (!customers || customers.length === 0) {
        return res
          .status(404)
          .json({ message: "Customer not found. Please register first." });
      }

      // Return customer information
      res.json({
        message: "Login successful",
        customer: {
          phone: phone,
          registrations: customers.length,
        },
      });
    } catch (error: any) {
      console.error("Customer login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Distributor Authentication Routes
  // Distributor login with mobile and OTP
  app.post("/api/distributor/login", async (req, res) => {
    try {
      const { contact, otp } = req.body;

      if (!contact || !otp) {
        return res
          .status(400)
          .json({ message: "Contact number and OTP are required" });
      }

      // Verify OTP first
      const isOtpValid = await storage.verifyOtp(contact, otp);
      if (!isOtpValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Find distributor by contact
      const distributor = await storage.getDistributorByContact(contact);
      if (!distributor) {
        return res
          .status(404)
          .json({ message: "Distributor not found. Please register first." });
      }

      // Clean up any existing sessions for this distributor (security measure)
      await storage.deleteDistributorSessionsByDistributorId(distributor.id);

      // Create new session token
      const sessionToken = await storage.createDistributorSession(
        distributor.id,
        contact,
      );

      res.json({
        message: "Login successful",
        distributor: {
          id: distributor.id,
          name: distributor.name,
          businessName: distributor.businessName,
          contact: distributor.contact,
          email: distributor.email,
          sellerCode: distributor.sellerCode,
        },
        sessionToken,
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
      const sessionToken = req.headers.authorization?.replace("Bearer ", "");

      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const distributor = await storage.verifyDistributorSession(sessionToken);
      if (!distributor) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      // Return complete distributor object for progress calculation
      res.json({
        distributor: distributor, // Return full object with all fields
      });
    } catch (error: any) {
      console.error("Session verification error:", error);
      res.status(500).json({ message: "Session verification failed" });
    }
  });

  // Update distributor profile (with file upload support)
  app.put("/api/distributor/profile", 
  upload.fields([
    { name: 'panCopyFile', maxCount: 1 },
    { name: 'gstCertificateFile', maxCount: 1 },
    { name: 'msmeCertificateFile', maxCount: 1 },
    { name: 'cancelledChequeFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace("Bearer ", "");

      if (!sessionToken) {
        return res.status(401).json({ message: "No session token provided" });
      }

      const distributor = await storage.verifyDistributorSession(sessionToken);
      if (!distributor) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      console.log("📝 Updating distributor profile for ID:", distributor.id);
      console.log("📝 Profile update data:", req.body);
      console.log("📝 Uploaded files:", req.files ? Object.keys(req.files) : "No files");

      // Process form data
      const updateData = { ...req.body };

      // Convert boolean strings to actual booleans
      if (updateData.isGstRegistered) updateData.isGstRegistered = updateData.isGstRegistered === "true";
      if (updateData.isMsmeRegistered) updateData.isMsmeRegistered = updateData.isMsmeRegistered === "true";
      if (updateData.infoDeclaration) updateData.infoDeclaration = updateData.infoDeclaration === "true";
      if (updateData.tdsUnderstanding) updateData.tdsUnderstanding = updateData.tdsUnderstanding === "true";
      if (updateData.gstInvoiceAgreement) updateData.gstInvoiceAgreement = updateData.gstInvoiceAgreement === "true";
      if (updateData.termsAgreement) updateData.termsAgreement = updateData.termsAgreement === "true";

      // Process uploaded files
      if (req.files && typeof req.files === "object") {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (files.panCopyFile && files.panCopyFile[0]) {
          updateData.panCopyFile = files.panCopyFile[0].location;
          console.log("📄 PAN copy uploaded to S3:", updateData.panCopyFile);
        }
        if (files.gstCertificateFile && files.gstCertificateFile[0]) {
          updateData.gstCertificateFile = files.gstCertificateFile[0].location;
          console.log("📄 GST certificate uploaded to S3:", updateData.gstCertificateFile);
        }
        if (files.msmeCertificateFile && files.msmeCertificateFile[0]) {
          updateData.msmeCertificateFile = files.msmeCertificateFile[0].location;
          console.log("📄 MSME certificate uploaded to S3:", updateData.msmeCertificateFile);
        }
        if (files.cancelledChequeFile && files.cancelledChequeFile[0]) {
          updateData.cancelledChequeFile = files.cancelledChequeFile[0].location;
          console.log("📄 Cancelled cheque uploaded to S3:", updateData.cancelledChequeFile);
        }
      }

      await storage.updateDistributor(distributor.id, updateData);
      
      // Force fresh data by getting distributor again
      const updatedDistributor = await storage.getDistributorById(distributor.id);
      console.log("🔄 Returning updated distributor data:", {
        accountHolderName: updatedDistributor?.accountHolderName,
        bankAccount: updatedDistributor?.bankAccount,
        ifscCode: updatedDistributor?.ifscCode
      });
      
      // Set no-cache headers to force fresh data
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      });
      
      res.json({
        message: "Profile updated successfully",
        distributor: updatedDistributor,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("❌ Profile update failed:", error);
      res.status(500).json({ 
        message: "Profile update failed", 
        error: error.message 
      });
    }
  });

  // Get distributor dashboard stats
  app.get("/api/distributor/stats", async (req, res) => {
    try {
      const sessionToken = req.headers.authorization?.replace("Bearer ", "");

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
      const sessionToken = req.headers.authorization?.replace("Bearer ", "");

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
      const sessionToken = req.headers.authorization?.replace("Bearer ", "");

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
        res
          .status(400)
          .json({ message: "Invalid or expired OTP", verified: false });
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
      // Get PayU configuration using config service
      const payuConfig = getSafePayUConfig();
      if (!payuConfig) {
        return res.status(500).json({
          message:
            "PayU payment gateway is not properly configured. Please contact support.",
          error: "Missing PayU credentials",
        });
      }

      const { customerData, amount, referralCode } = req.body;
      const deviceType = customerData.deviceType;

      let finalAmount = amount;

      // If amount not provided from frontend, calculate with discounts
      if (!finalAmount) {
        const priceSettings = await storage.getBbgPriceSettings();
        const prices = priceSettings || {
          laptopPrice: 499,
          mobilePrice: 299,
        };

        let basePrice = deviceType === 'laptop' ? prices.laptopPrice : prices.mobilePrice;

        // Apply referral discount if code provided
        if (referralCode) {
          try {
            const referralPartner = await storage.getDistributorBySellerCode(referralCode);
            if (referralPartner) {
              const discountSettings = await storage.getReferralDiscountSettings();
              
              if (discountSettings && discountSettings.isActive && discountSettings.discountValue > 0) {
                let discount = 0;
                if (discountSettings.discountType === 'percentage') {
                  discount = (basePrice * discountSettings.discountValue) / 100;
                } else if (discountSettings.discountType === 'flat') {
                  discount = Math.min(discountSettings.discountValue, basePrice);
                }
                basePrice = Math.max(0, basePrice - discount);
              }
            }
          } catch (discountError) {
            console.error("Error applying referral discount in PayU:", discountError);
          }
        }
        
        finalAmount = Math.round(basePrice);
      }


      // Check rate limiting for this IP
      const clientIP = req.ip || req.connection.remoteAddress || "unknown";
      const now = Date.now();
      const lastRequest = payuRateLimit.get(clientIP) || 0;

      // Enforce 60-second delay between requests per IP
      if (now - lastRequest < 60000) {
        const waitTime = Math.ceil((60000 - (now - lastRequest)) / 1000);
        return res.status(429).json({
          message: `Too many payment requests. Please wait ${waitTime} seconds before trying again.`,
          waitTime,
          retryAfter: waitTime,
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
      // Force HTTPS for PayU redirect URLs to avoid security warnings
      const host = req.get("host");
      const baseUrl =
        process.env.PAYU_REDIRECT_BASE_URL ||
        (process.env.NODE_ENV === "production"
          ? `https://${host}`
          : `https://${host}`); // Always use HTTPS for PayU redirects

      const payuParams = {
        key: payuConfig.merchantKey,
        txnid,
        amount: finalAmount.toString(),
        productinfo: `BBG Registration`,
        firstname: customerData.name,
        email: customerData.email,
        phone: customerData.contact,
        surl: `${baseUrl}/api/payu/success`,
        furl: `${baseUrl}/api/payu/failure`,
      };

      // Generate hash
      const hash = generatePayUHash(payuParams, payuConfig.salt);
      payuParams.hash = hash;

      res.json({
        payuParams,
        payuUrl: `${payuConfig.baseUrl}/_payment`,
        txnid,
      });
    } catch (error: any) {
      console.error("PayU payment creation error:", error);
      res
        .status(500)
        .json({ message: "Error creating PayU payment: " + error.message });
    }
  });

  // PayU Success Handler
  app.post("/api/payu/success", async (req, res) => {
    try {
      const { txnid, amount, status, hash, ...otherParams } = req.body;

      console.log('📝 PayU SUCCESS - Recording transaction history:', {
        txnid,
        amount,
        status,
        customerData: otherParams
      });

      // Get PayU config for hash verification
      const payuConfig = getSafePayUConfig();
      if (!payuConfig) {
        return res
          .status(500)
          .json({ message: "PayU configuration not available" });
      }

      // Verify hash for security (reverse hash format for success)
      const verifyHashString = `${payuConfig.salt}|${status}||||||${otherParams.udf5 || ""}|${otherParams.udf4 || ""}|${otherParams.udf3 || ""}|${otherParams.udf2 || ""}|${otherParams.udf1 || ""}|${otherParams.email}|${otherParams.firstname}|${otherParams.productinfo}|${amount}|${txnid}|${payuConfig.merchantKey}`;
      console.log("PayU Success Verify Hash String:", verifyHashString);
      const expectedHash = crypto
        .createHash("sha512")
        .update(verifyHashString)
        .digest("hex");

      if (hash !== expectedHash) {
        return res.status(400).json({ message: "Invalid hash verification" });
      }

      if (status === "success") {
        // Get customer data from temporary storage
        const tempStorage = app.locals.tempCustomerData || new Map();
        const customerData = tempStorage.get(txnid);

        if (!customerData) {
          console.error("Customer data not found for transaction:", txnid);
          req.session.thankYouData = {
            type: "customer",
            status: "failed",
            paymentMethod: "payu",
            txnid: txnid,
            error: "invalid_transaction",
            errorMessage: "Customer data not found for this transaction",
          };
          return res.redirect("/thank-you");
        }

        // Create customer registration with PayU transaction ID
        // Clean up file data for SQL insertion - PayU payments don't include files
        const { invoiceFile, ...cleanCustomerData } = customerData;

        // Get active claim value slab at time of registration
        let activeClaimValueSlab = null;
        try {
          const purchaseDate = new Date(
            cleanCustomerData.dateOfPurchase + "T00:00:00.000Z",
          );
          const currentDate = new Date();
          const monthsDiff =
            (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
            (currentDate.getMonth() - purchaseDate.getMonth());

          console.log("PayU Registration: Date calculation:", {
            currentDate: currentDate.toISOString(),
            purchaseDate: purchaseDate.toISOString(),
            monthsDiff,
          });

          const activeSlabs = await storage.getActiveClaimValueSlabs();

          // Find brand-specific slab first
          activeClaimValueSlab = activeSlabs.find(
            (slab) =>
              slab.deviceType === cleanCustomerData.deviceType &&
              slab.brand === cleanCustomerData.brand &&
              monthsDiff >= slab.minMonths &&
              monthsDiff <= slab.maxMonths,
          );

          // If no brand-specific slab, try generic slab
          if (!activeClaimValueSlab) {
            activeClaimValueSlab = activeSlabs.find(
              (slab) =>
                slab.deviceType === cleanCustomerData.deviceType &&
                !slab.brand &&
                monthsDiff >= slab.minMonths &&
                monthsDiff <= slab.maxMonths,
            );
          }

          console.log(
            "PayU Registration: Selected claim value slab:",
            activeClaimValueSlab,
          );
        } catch (error) {
          console.log(
            "Warning: Could not fetch active claim value slab for PayU:",
            error,
          );
          activeClaimValueSlab = null;
        }

        // Build complete slab data structure for PayU customer registration
        let completeSlabData = null;
        if (activeClaimValueSlab) {
          try {
            const brandSpecificSlabs =
              await storage.getActiveClaimValueSlabsByDeviceBrand(
                activeClaimValueSlab.deviceType,
                activeClaimValueSlab.brand || null,
              );
            completeSlabData = JSON.stringify({
              deviceType: activeClaimValueSlab.deviceType,
              brand: activeClaimValueSlab.brand,
              registrationAge: monthsDiff,
              registrationDate: new Date().toISOString(),
              slabs: brandSpecificSlabs,
              applicableSlabId: activeClaimValueSlab.id,
            });

            console.log(
              "✅ PayU Complete slab data structure created for customer registration:",
              {
                deviceType: activeClaimValueSlab.deviceType,
                brand: activeClaimValueSlab.brand,
                totalSlabs: brandSpecificSlabs.length,
                registrationAge: monthsDiff,
              },
            );
          } catch (slabError) {
            console.error(
              "❌ PayU Error building complete slab structure for registration:",
              slabError,
            );
            completeSlabData = null;
          }
        }

        const submitData = {
          ...cleanCustomerData,
          // Generate placeholder serialNumber if not provided (for regular BBG flow)
          serialNumber: cleanCustomerData.serialNumber || `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentIntentId: `payu_${txnid}`,
          isVerified: true,
          claimValueSlabId: activeClaimValueSlab?.id || null,
          // Store complete slab structure from registration time (preserves entire rate structure)
          registrationSlabData: completeSlabData,
          // Remove invoiceFile completely for PayU payments
        };

        const customer = await storage.createCustomer(submitData);

        // Track successful payment completion for cart abandonment analysis
        try {
          await db.connectDB();
          const cartRequest = db.pool.request();
          cartRequest.input("name", sql.VarChar, customer.name);
          cartRequest.input("contact", sql.VarChar, customer.contact);
          cartRequest.input("email", sql.VarChar, customer.email);
          cartRequest.input("device_type", sql.VarChar, customer.deviceType);
          cartRequest.input("stage", sql.VarChar, "payment_completed");
          cartRequest.input("session_id", sql.VarChar, `payu_${txnid}`); // Use txnid as session identifier
          cartRequest.input(
            "metadata",
            sql.NVarChar,
            JSON.stringify({
              amount: amount,
              paymentMethod: "payu",
              transactionId: txnid,
              voucherCode: customer.voucherCode,
            }),
          );

          await cartRequest.query(`
            INSERT INTO cart_abandonments (name, contact, email, device_type, stage, session_id, metadata, created_at)
            VALUES (@name, @contact, @email, @device_type, @stage, @session_id, @metadata, GETDATE())
          `);

          console.log(
            "✅ Cart abandonment completion tracked for:",
            customer.contact,
          );
        } catch (trackingError) {
          console.warn("❌ Failed to track payment completion:", trackingError);
          // Don't fail the registration if tracking fails
        }

        // Send welcome notifications
        try {
          console.log(
            "🔔 Starting PayU customer registration notifications...",
          );
          console.log("📧 Customer contact details:", {
            name: customer.name,
            email: customer.email,
            contact: customer.contact,
          });

          const notificationResults =
            await communicationService.sendRegistrationConfirmation({
              name: customer.name,
              email: customer.email,
              contact: customer.contact,
              voucherCode: customer.voucherCode,
              deviceType: customer.deviceType,
              brand: customer.brand,
              modelName: customer.modelName,
              registrationSource: "regular",
              serialNumber: customer.serialNumber,
              devicePurchaseDate: customer.dateOfPurchase,
              bbgPurchaseDate: customer.createdAt?.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) || new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              termsAndConditionsUrl: `${req.protocol}://${req.get('host')}/terms-and-conditions`,
            });

          console.log("🔔 PayU customer registration notifications complete:", {
            email: notificationResults.email?.success
              ? "✅ Sent"
              : `❌ Failed: ${notificationResults.email?.error}`,
            sms: notificationResults.sms?.success
              ? "✅ Sent"
              : `❌ Failed: ${notificationResults.sms?.error}`,
            whatsapp: notificationResults.whatsapp?.success
              ? "✅ Sent"
              : `❌ Failed: ${notificationResults.whatsapp?.error}`,
          });

          // Send notification to distributor if registration was through referral code
          if (customer.sellerCode) {
            try {
              console.log(
                "🔔 Sending BBG purchase notification to distributor with seller code:",
                customer.sellerCode,
              );
              const distributor = await storage.getDistributorBySellerCode(
                customer.sellerCode,
              );

              if (distributor) {
                // Calculate monthly commission total
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const monthlyCommissionTotal = await storage.getDistributorMonthlyCommission(distributor.id, startOfMonth);
                
                // Calculate next payout date (last day of current month)
                const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                const nextPayoutDate = nextMonth.toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
                
                // Set referral partner login URL
                const referralPartnerLoginUrl = `${req.protocol}://${req.get('host')}/referral-partner-login`;

                const distributorNotificationResults =
                  await communicationService.sendDistributorBBGNotification({
                    distributorName: distributor.name,
                    distributorEmail: distributor.email,
                    distributorContact: distributor.contact,
                    customerName: customer.name,
                    customerContact: customer.contact,
                    sellerCode: customer.sellerCode,
                    voucherCode: customer.voucherCode,
                    deviceType: customer.deviceType,
                    brand: customer.brand,
                    modelName: customer.modelName,
                    monthlyCommissionTotal: monthlyCommissionTotal?.toString() || '0',
                    nextPayoutDate: nextPayoutDate,
                    referralPartnerLoginUrl: referralPartnerLoginUrl,
                  });

                console.log("🔔 PayU Distributor BBG notification sent:", {
                  email: distributorNotificationResults.email?.success
                    ? "✅ Sent"
                    : `❌ Failed: ${distributorNotificationResults.email?.error}`,
                  sms: distributorNotificationResults.sms?.success
                    ? "✅ Sent"
                    : `❌ Failed: ${distributorNotificationResults.sms?.error}`,
                  whatsapp: distributorNotificationResults.whatsapp?.success
                    ? "✅ Sent"
                    : `❌ Failed: ${distributorNotificationResults.whatsapp?.error}`,
                });
              } else {
                console.log(
                  "❌ Distributor not found for seller code:",
                  customer.sellerCode,
                );
              }
            } catch (distributorNotifyError: any) {
              console.error(
                "❌ Failed to send PayU distributor notification:",
                distributorNotifyError.message,
              );
              // Don't fail the registration if notifications fail
            }
          }
        } catch (notifyError: any) {
          console.error(
            "❌ Failed to send PayU notifications:",
            notifyError.message,
          );
          console.error("❌ PayU notification error details:", notifyError);
          // Don't fail the registration if notifications fail
        }

        // Clean up temporary storage
        tempStorage.delete(txnid);

        // Store success data in session for thank you page
        req.session.thankYouData = {
          type: "customer",
          status: "success",
          voucherCode: customer.voucherCode,
          paymentMethod: "payu",
          customerName: customer.name,
          email: customer.email,
          contact: customer.contact,
          pincode: customer.pincode,
          deviceType: customer.deviceType,
          brand: customer.brand,
          modelName: customer.modelName,
          registrationSlabData: customer.registrationSlabData,
          txnid: txnid,
          amount: amount, // Store actual charged amount (includes any referral discounts)
        };

        // Redirect to success page without query parameters
        res.redirect("/thank-you");
      } else {
        req.session.thankYouData = {
          type: "customer",
          status: "failed",
          paymentMethod: "payu",
          txnid: txnid,
          error: "payment_failed",
          errorMessage: "Payment was not successful",
        };
        res.redirect("/thank-you");
      }
    } catch (error: any) {
      console.error("PayU success handler error:", error);
      req.session.thankYouData = {
        type: "customer",
        status: "failed",
        paymentMethod: "payu",
        error: "processing_error",
        errorMessage: "Error processing successful payment",
      };
      res.redirect("/thank-you");
    }
  });

  // PayU Failure Handler
  app.post("/api/payu/failure", async (req, res) => {
    try {
      const {
        txnid,
        status,
        error: payuError,
        error_Message: errorMessage,
      } = req.body;
      console.log(`PayU payment failed for transaction ${txnid}: ${payuError}`);

      // Clean up temporary customer data
      const tempStorage = app.locals.tempCustomerData || new Map();
      tempStorage.delete(txnid);

      // Store failure data in session for thank you page
      req.session.thankYouData = {
        type: "customer",
        status: "failed",
        paymentMethod: "payu",
        txnid: txnid || "unknown",
        error: "payment_failed",
        errorMessage:
          errorMessage || payuError || "Payment could not be processed",
      };

      res.redirect("/thank-you");
    } catch (error: any) {
      console.error("PayU failure handler error:", error);
      req.session.thankYouData = {
        type: "customer",
        status: "failed",
        paymentMethod: "payu",
        error: "processing_error",
        errorMessage: "System error occurred during payment processing",
      };
      res.redirect("/thank-you");
    }
  });

  // Customer registration with payment processing (JSON data)
  app.post("/api/customers/register", async (req, res) => {
    try {
      console.log("Customer registration request body:", req.body);

      const customerData = {
        ...req.body,
        invoiceValue: req.body.invoiceValue?.toString() || "0",
        dateOfPurchase:
          req.body.dateOfPurchase || new Date().toISOString().split("T")[0],
        // Generate placeholder serialNumber if not provided (for regular BBG flow)
        serialNumber: req.body.serialNumber || `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        // Handle legacy fields for compatibility
        address: req.body.address || "",
        purchaseDate:
          req.body.purchaseDate ||
          req.body.dateOfPurchase ||
          new Date().toISOString().split("T")[0],
        invoiceNumber: req.body.invoiceNumber || "N/A",
        invoiceFile: "N/A", // No file upload in new flow
        paymentIntentId: req.body.paymentIntentId || null,
        isVerified: true, // Auto-verify since OTP was completed during registration
      };

      // Validate seller code if provided
      if (customerData.sellerCode) {
        const distributor = await storage.getDistributorBySellerCode(
          customerData.sellerCode,
        );
        if (!distributor) {
          return res.status(400).json({ message: "Invalid seller code" });
        }
      }


      // Find the appropriate claim value slab based on device age at purchase
      let activeClaimValueSlab;
      const purchaseDate = new Date(customerData.dateOfPurchase);
      const monthsDiff = Math.floor(
        (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );

      try {
        console.log("Finding claim value slab for REGULAR registration:", {
          deviceType: customerData.deviceType,
          brand: customerData.brand,
          purchaseDate: purchaseDate.toISOString(),
          currentAge: monthsDiff,
        });

        // Get only REGULAR slabs for regular customer registration
        const activeSlabs =
          await storage.getActiveClaimValueSlabsByDeviceTypeAndSource(
            customerData.deviceType,
            "regular",
          );

        // Find brand-specific slab first (from regular slabs only)
        activeClaimValueSlab = activeSlabs.find(
          (slab) =>
            slab.brand === customerData.brand &&
            monthsDiff >= slab.minMonths &&
            monthsDiff <= slab.maxMonths,
        );

        // If no brand-specific slab, try generic slab (from regular slabs only)
        if (!activeClaimValueSlab) {
          activeClaimValueSlab = activeSlabs.find(
            (slab) =>
              !slab.brand &&
              monthsDiff >= slab.minMonths &&
              monthsDiff <= slab.maxMonths,
          );
        }

        console.log(
          "Selected REGULAR claim value slab for registration:",
          activeClaimValueSlab,
        );
      } catch (error) {
        console.log("Warning: Could not fetch active claim value slab:", error);
        activeClaimValueSlab = null;
      }

      // Build complete slab data structure for REGULAR customer registration
      let completeSlabData = null;
      if (activeClaimValueSlab) {
        try {
          // Get only REGULAR slabs for the device type to preserve in registrationSlabData
          const regularSlabsForDevice =
            await storage.getActiveClaimValueSlabsByDeviceTypeAndSource(
              activeClaimValueSlab.deviceType,
              "regular",
            );

          // Filter to brand-specific slabs if applicable
          const brandSpecificSlabs = activeClaimValueSlab.brand
            ? regularSlabsForDevice.filter(
                (slab) => slab.brand === activeClaimValueSlab.brand,
              )
            : regularSlabsForDevice.filter((slab) => !slab.brand);

          completeSlabData = JSON.stringify({
            deviceType: activeClaimValueSlab.deviceType,
            brand: activeClaimValueSlab.brand,
            registrationAge: monthsDiff,
            registrationDate: new Date().toISOString(),
            registrationSource: "regular",
            slabs: brandSpecificSlabs,
          });

          console.log(
            "✅ Complete REGULAR slab data structure created for customer registration:",
            {
              deviceType: activeClaimValueSlab.deviceType,
              brand: activeClaimValueSlab.brand,
              registrationSource: "regular",
              totalSlabs: brandSpecificSlabs.length,
              registrationAge: monthsDiff,
            },
          );
        } catch (slabError) {
          console.error(
            "❌ Error building complete REGULAR slab structure for registration:",
            slabError,
          );
          completeSlabData = null;
        }
      }

      const validatedData = insertCustomerSchema.parse({
        ...customerData,
        claimValueSlabId: activeClaimValueSlab?.id || null,
        // Store complete slab structure from registration time (preserves entire rate structure)
        registrationSlabData: completeSlabData,
      });
      const customer = await storage.createCustomer(validatedData);
      console.log(
        "Customer created with voucher code:",
        customer.voucherCode,
        "and claim slab ID:",
        activeClaimValueSlab?.id,
      );

      // Send welcome notifications
      try {
        console.log("🔔 Starting customer registration notifications...");
        console.log("📧 Customer contact details:", {
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
        });

        const notificationResults =
          await communicationService.sendRegistrationConfirmation({
            name: customer.name,
            email: customer.email,
            contact: customer.contact,
            voucherCode: customer.voucherCode,
            deviceType: customer.deviceType,
            brand: customer.brand,
            modelName: customer.modelName,
            registrationSource: "regular",
            serialNumber: customer.serialNumber,
            devicePurchaseDate: customer.dateOfPurchase,
            bbgPurchaseDate: customer.createdAt?.toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) || new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            termsAndConditionsUrl: `${req.protocol}://${req.get('host')}/terms-and-conditions`,
          });

        console.log("🔔 Customer registration notifications complete:", {
          email: notificationResults.email?.success
            ? "✅ Sent"
            : `❌ Failed: ${notificationResults.email?.error}`,
          sms: notificationResults.sms?.success
            ? "✅ Sent"
            : `❌ Failed: ${notificationResults.sms?.error}`,
          whatsapp: notificationResults.whatsapp?.success
            ? "✅ Sent"
            : `❌ Failed: ${notificationResults.whatsapp?.error}`,
        });

        // Send notification to distributor if registration was through referral code
        if (customer.sellerCode) {
          try {
            console.log(
              "🔔 Sending BBG purchase notification to distributor with seller code:",
              customer.sellerCode,
            );
            const distributor = await storage.getDistributorBySellerCode(
              customer.sellerCode,
            );

            if (distributor) {
              // Calculate monthly commission total
              const currentDate = new Date();
              const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const monthlyCommissionTotal = await storage.getDistributorMonthlyCommission(distributor.id, startOfMonth);
              
              // Calculate next payout date (last day of current month)
              const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
              const nextPayoutDate = nextMonth.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
              
              // Set referral partner login URL
              const referralPartnerLoginUrl = `${req.protocol}://${req.get('host')}/referral-partner-login`;

              const distributorNotificationResults =
                await communicationService.sendDistributorBBGNotification({
                  distributorName: distributor.name,
                  distributorEmail: distributor.email,
                  distributorContact: distributor.contact,
                  customerName: customer.name,
                  customerContact: customer.contact,
                  sellerCode: customer.sellerCode,
                  voucherCode: customer.voucherCode,
                  deviceType: customer.deviceType,
                  brand: customer.brand,
                  modelName: customer.modelName,
                  monthlyCommissionTotal: monthlyCommissionTotal?.toString() || '0',
                  nextPayoutDate: nextPayoutDate,
                  referralPartnerLoginUrl: referralPartnerLoginUrl,
                });

              console.log("🔔 Distributor BBG notification sent:", {
                email: distributorNotificationResults.email?.success
                  ? "✅ Sent"
                  : `❌ Failed: ${distributorNotificationResults.email?.error}`,
                sms: distributorNotificationResults.sms?.success
                  ? "✅ Sent"
                  : `❌ Failed: ${distributorNotificationResults.sms?.error}`,
                whatsapp: distributorNotificationResults.whatsapp?.success
                  ? "✅ Sent"
                  : `❌ Failed: ${distributorNotificationResults.whatsapp?.error}`,
              });
            } else {
              console.log(
                "❌ Distributor not found for seller code:",
                customer.sellerCode,
              );
            }
          } catch (distributorNotifyError: any) {
            console.error(
              "❌ Failed to send distributor notification:",
              distributorNotifyError.message,
            );
            // Don't fail the registration if notifications fail
          }
        }
      } catch (notifyError: any) {
        console.error("❌ Failed to send notifications:", notifyError.message);
        console.error("❌ Notification error details:", notifyError);
        // Don't fail the registration if notifications fail
      }

      // Store success data in session for thank you page
      req.session.thankYouData = {
        type: "customer",
        voucherCode: customer.voucherCode,
        paymentMethod: "direct",
        customerName: customer.name,
        email: customer.email,
        contact: customer.contact,
        pincode: customer.pincode,
        deviceType: customer.deviceType,
        brand: customer.brand,
        modelName: customer.modelName,
        registrationSlabData: customer.registrationSlabData,
      };

      // Record transaction history for successful registration
      try {
        const transactionHistoryData = {
          customerId: customer.id.toString(),
          customerName: customer.name,
          customerEmail: customer.email,
          customerContact: customer.contact,
          transactionId: `direct_${Date.now()}_${customer.id}`,
          paymentMethod: finalAmount === 0 ? 'free' : 'direct',
          amount: finalAmount,
          currency: 'INR',
          status: 'success',
          deviceType: customerData.deviceType,
          deviceBrand: customerData.brand,
          referralCode: customerData.sellerCode || null,
          discountApplied: discount,
          originalAmount: originalPrice,
          registrationSource: customerData.registrationSource || 'regular',
          metadata: JSON.stringify({
            voucherCode: customer.voucherCode,
            serialNumber: customerData.serialNumber,
            modelName: customerData.modelName,
            invoiceValue: customerData.invoiceValue,
            dateOfPurchase: customerData.dateOfPurchase,
            referralDiscountApplied: discount > 0
          })
        };
        
        console.log('📝 Creating transaction history for direct registration:', transactionHistoryData);
        await storage.createTransactionHistory(transactionHistoryData);
        console.log('✅ Transaction history recorded successfully');
      } catch (historyError) {
        console.error('❌ Failed to record transaction history:', historyError);
        // Don't fail the registration if transaction history fails
      }

      res.status(201).json({
        message:
          "Registration successful! You will receive confirmation shortly.",
        voucherCode: customer.voucherCode,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          voucherCode: customer.voucherCode,
          deviceType: customer.deviceType,
        },
      });
    } catch (error: any) {
      console.error("Customer registration error:", error);
      console.error("Error details:", error.issues || error.details);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  // Post-Purchase Device Registration (FormData)
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Post-purchase device registration request received");
      console.log("Request body keys:", Object.keys(req.body));

      // Process form data - convert from string values
      const formData = { ...req.body };

      // Validate required fields for simplified registration
      const requiredFields = ['voucherCode', 'imeiSerial'];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          return res.status(400).json({ 
            message: `Missing required field: ${field}` 
          });
        }
      }

      // Generate unique registration ID
      const registrationId = `REG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create device registration record with simplified data
      const deviceRegistrationData = {
        registrationId,
        voucherCode: formData.voucherCode,
        imeiSerial: formData.imeiSerial,
        isVerified: true,
        registrationSource: 'website'
      };

      // Save to device registrations table (new table for post-purchase registrations)
      try {
        // Since we don't have storage method for device registrations yet, 
        // let's save it directly to the database using raw SQL
        await db.connectDB();
        
        const result = await db.pool.request()
          .input('imeiSerial', formData.imeiSerial)
          .input('registrationId', registrationId)
          .input('voucherCode', formData.voucherCode)
          .input('isVerified', true)
          .input('registrationSource', 'website')
          .input('purchaseType', 'website') // Default value for required field
          .input('deviceType', 'unknown') // Default value for required field
          .input('brand', 'unknown') // Default value for required field
          .input('model', 'unknown') // Default value for required field
          .input('purchasePrice', 0) // Default value for required field
          .input('purchaseDate', new Date()) // Default value for required field
          .input('name', 'N/A') // Default value for required field
          .input('phone', 'N/A') // Default value for required field
          .input('email', 'N/A') // Default value for required field
          .input('pincode', '000000') // Default value for required field
          .query(`
            INSERT INTO device_registrations (
              imei_serial, registration_id, voucher_code, is_verified, registration_source, 
              purchase_type, device_type, brand, model, purchase_price, purchase_date,
              name, phone, email, pincode, created_at
            ) VALUES (
              @imeiSerial, @registrationId, @voucherCode, @isVerified, @registrationSource,
              @purchaseType, @deviceType, @brand, @model, @purchasePrice, @purchaseDate,
              @name, @phone, @email, @pincode, GETDATE()
            )
          `);

        console.log("✅ Device registration saved successfully:", {
          registrationId,
          voucherCode: formData.voucherCode,
          imeiSerial: formData.imeiSerial
        });

      } catch (dbError) {
        console.error("❌ Database error saving device registration:", dbError);
        return res.status(500).json({ 
          message: "Failed to save device registration" 
        });
      }

      // For simplified registration, skip email notifications since we don't have user contact details
      console.log("✅ Website device registration completed successfully");

      res.status(201).json({
        message: "Device registration successful!",
        voucherCode: formData.voucherCode,
        registration: {
          voucherCode: formData.voucherCode,
          imeiSerial: formData.imeiSerial,
          registrationSource: 'website'
        },
      });

    } catch (error: any) {
      console.error("Device registration error:", error);
      res.status(400).json({ 
        message: error.message || "Device registration failed" 
      });
    }
  });

  // Get customer details by BBG voucher code
  app.get("/api/customer-details/:voucherCode", async (req, res) => {
    try {
      const { voucherCode } = req.params;
      
      if (!voucherCode) {
        return res.status(400).json({ message: "Voucher code is required" });
      }

      // Connect to database and lookup customer details
      await db.connectDB();
      
      // First, let's check what columns actually exist
      const schemaResult = await db.pool.request()
        .query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'customers'
        `);
      
      console.log("Available columns in customers table:", schemaResult.recordset.map(row => row.COLUMN_NAME));

      const result = await db.pool.request()
        .input('voucherCode', voucherCode)
        .query(`
          SELECT 
            name, email, contact, device_type, brand, model_name, voucher_code
          FROM customers 
          WHERE voucher_code = @voucherCode
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: "Customer not found with this voucher code" });
      }

      const customer = result.recordset[0];
      
      res.json({
        name: customer.name,
        email: customer.email,
        phone: customer.contact,
        deviceType: customer.device_type,
        brand: customer.brand,
        model: customer.model_name,
        purchasePrice: 0, // Default value for now
        purchaseDate: new Date().toISOString(), // Default value for now
        voucherCode: customer.voucher_code
      });

    } catch (error: any) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ message: "Failed to fetch customer details" });
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
        return res
          .status(400)
          .json({ message: "Customer registration not yet verified" });
      }

      // DYNAMIC WAITING PERIOD: Check admin-configurable waiting period settings
      // (Acer BBG registrations are exempt from this restriction)
      let registrationSource = customer.registrationSource || "regular";

      // Enhanced Acer BBG detection: multiple detection methods for maximum reliability
      let isAcerBBG = registrationSource === "acer_bbg";
      let detectionMethod = "registrationSource_field";

      // Method 1: Check registrationSlabData for Acer BBG source
      if (!isAcerBBG && customer.registrationSlabData) {
        try {
          const slabData = JSON.parse(customer.registrationSlabData);
          if (slabData.registrationSource === "acer_bbg") {
            isAcerBBG = true;
            registrationSource = "acer_bbg";
            detectionMethod = "registrationSlabData";
            console.log(
              "🔧 Detected Acer BBG from registrationSlabData for voucher:",
              voucherCode,
            );
          }
        } catch (error) {
          console.error(
            "Error parsing registrationSlabData for voucher",
            voucherCode,
            ":",
            error,
          );
        }
      }

      // Method 2: Check if customer has Acer BBG specific claim value slab (backup detection)
      if (!isAcerBBG && customer.claimValueSlabId) {
        try {
          const slabDetails = await storage.getClaimValueSlabById(
            customer.claimValueSlabId,
          );
          if (slabDetails && slabDetails.registrationSource === "acer_bbg") {
            isAcerBBG = true;
            registrationSource = "acer_bbg";
            detectionMethod = "claimValueSlab";
            console.log(
              "🔧 Detected Acer BBG from claim value slab for voucher:",
              voucherCode,
            );
          }
        } catch (error) {
          console.error(
            "Error checking claim value slab for voucher",
            voucherCode,
            ":",
            error,
          );
        }
      }

      console.log("🔍 Registration source check:", {
        voucherCode,
        customerRegistrationSource: customer.registrationSource,
        detectedRegistrationSource: registrationSource,
        isAcerBBG,
        detectionMethod,
        hasSlabData: !!customer.registrationSlabData,
        brand: customer.brand,
        isAcerDevice: customer.brand === "Acer",
        claimValueSlabId: customer.claimValueSlabId,
      });

      // FINAL VALIDATION: Ensure Acer BBG exemption is absolutely enforced
      if (isAcerBBG) {
        console.log(
          "✅ CONFIRMED: Acer BBG customer detected - waiting period exemption will be applied",
        );
      } else if (customer.brand === "Acer") {
        console.log(
          "⚠️  DETECTED: Regular Acer customer - waiting period rules apply normally",
        );
      }

      // Get waiting period settings from database
      let waitingPeriodEnabled = true;
      let waitingPeriodMonths = 3;

      try {
        const waitingPeriodSettings = await storage.getWaitingPeriodSettings();
        if (waitingPeriodSettings) {
          waitingPeriodEnabled = waitingPeriodSettings.enabled;
          waitingPeriodMonths = waitingPeriodSettings.months;
          console.log("⚙️  Loaded waiting period settings:", {
            enabled: waitingPeriodEnabled,
            months: waitingPeriodMonths,
          });
        } else {
          console.log("⚙️  No waiting period settings found, using defaults:", {
            enabled: waitingPeriodEnabled,
            months: waitingPeriodMonths,
          });
        }
      } catch (error) {
        console.error(
          "⚠️  Error fetching waiting period settings, using defaults:",
          error,
        );
        // Use defaults if database fails - but Acer BBG customers are still exempt
        waitingPeriodEnabled = true;
        waitingPeriodMonths = 3;
      }

      // Calculate time since BBG registration (not device purchase)
      const registrationDate = new Date(customer.createdAt!);
      const currentDate = new Date();

      let monthsSinceRegistration =
        (currentDate.getFullYear() - registrationDate.getFullYear()) * 12;
      monthsSinceRegistration +=
        currentDate.getMonth() - registrationDate.getMonth();

      // Adjust if current day is before the registration day in the month
      if (currentDate.getDate() < registrationDate.getDate()) {
        monthsSinceRegistration--;
      }

      // Check dynamic waiting period for regular BBG only (if enabled)
      console.log("⏰ Waiting period evaluation:", {
        isAcerBBG,
        waitingPeriodEnabled,
        monthsSinceRegistration,
        waitingPeriodMonths,
        shouldCheckWaitingPeriod: !isAcerBBG && waitingPeriodEnabled,
        meetsWaitingPeriod: monthsSinceRegistration >= waitingPeriodMonths,
      });

      // ABSOLUTE FAILSAFE: Double-check Acer BBG exemption before applying waiting period
      const absoluteAcerBBGCheck =
        registrationSource === "acer_bbg" ||
        (customer.registrationSlabData &&
          customer.registrationSlabData.includes(
            '"registrationSource":"acer_bbg"',
          )) ||
        (customer.claimValueSlabId &&
          (await storage
            .getClaimValueSlabById(customer.claimValueSlabId)
            ?.then((slab) => slab?.registrationSource === "acer_bbg")
            .catch(() => false)));

      if (
        !isAcerBBG &&
        !absoluteAcerBBGCheck &&
        waitingPeriodEnabled &&
        monthsSinceRegistration < waitingPeriodMonths
      ) {
        console.log(
          "🚫 APPLYING WAITING PERIOD: Not an Acer BBG customer, waiting period restriction enforced",
        );
      } else if (isAcerBBG || absoluteAcerBBGCheck) {
        console.log(
          "✅ BYPASSING WAITING PERIOD: Acer BBG customer confirmed, exemption applied",
        );
      }

      if (
        !isAcerBBG &&
        !absoluteAcerBBGCheck &&
        waitingPeriodEnabled &&
        monthsSinceRegistration < waitingPeriodMonths
      ) {
        const remainingMonths = waitingPeriodMonths - monthsSinceRegistration;
        const eligibleDate = new Date(registrationDate);
        eligibleDate.setMonth(eligibleDate.getMonth() + waitingPeriodMonths);

        return res.status(400).json({
          message: `BBG claims require a ${waitingPeriodMonths}-month waiting period. You purchased BBG coverage on ${registrationDate.toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            },
          )}. You can file a claim starting ${eligibleDate.toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            },
          )}.`,
          eligible: false,
          registrationDate: registrationDate.toISOString(),
          monthsSinceRegistration: monthsSinceRegistration,
          minimumWaitMonths: waitingPeriodMonths,
          registrationSource: registrationSource,
          eligibleDate: eligibleDate.toISOString(),
          remainingMonths: remainingMonths,
        });
      }

      console.log("BBG Registration eligibility check:", {
        registrationSource,
        isAcerBBG,
        registrationDate: registrationDate.toISOString(),
        monthsSinceRegistration,
        eligible: isAcerBBG || monthsSinceRegistration >= 3,
      });

      // Calculate claim percentage based on device age (using purchase date, not registration date)
      const purchaseDate = new Date(
        customer.dateOfPurchase || customer.createdAt!,
      );

      // More accurate month calculation
      let monthsDiff =
        (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12;
      monthsDiff += currentDate.getMonth() - purchaseDate.getMonth();

      // Adjust if current day is before the purchase day in the month
      if (currentDate.getDate() < purchaseDate.getDate()) {
        monthsDiff--;
      }

      console.log("Date calculation:", {
        currentDate: currentDate.toISOString(),
        purchaseDate: purchaseDate.toISOString(),
        monthsDiff,
      });

      // Use the complete slab structure stored at time of registration (preserves entire rate table)
      let claimPercentage = 0;
      let applicableSlab = null;

      try {
        // PRIORITY 1: Use complete slab data structure from registration time
        console.log(
          "Customer registrationSlabData field:",
          customer.registrationSlabData ? "EXISTS" : "MISSING",
        );
        if (customer.registrationSlabData) {
          const slabData = JSON.parse(customer.registrationSlabData);
          console.log("Using complete slab data from registration time:", {
            deviceType: slabData.deviceType,
            brand: slabData.brand,
            totalSlabs: slabData.slabs?.length,
            registrationAge: slabData.registrationAge,
            currentAge: monthsDiff,
          });

          // Find the appropriate slab for current device age using registration-time rates
          const currentApplicableSlab = slabData.slabs?.find(
            (slab) =>
              monthsDiff >= slab.minMonths && monthsDiff <= slab.maxMonths,
          );

          if (currentApplicableSlab) {
            claimPercentage = currentApplicableSlab.percentage;
            applicableSlab = {
              percentage: currentApplicableSlab.percentage,
              range: `${currentApplicableSlab.minMonths}-${currentApplicableSlab.maxMonths}`,
              registrationTimeRates: true,
            };

            console.log(
              "✅ Using registration-time slab rates for current age:",
              {
                currentAge: monthsDiff,
                applicableRange: `${currentApplicableSlab.minMonths}-${currentApplicableSlab.maxMonths}`,
                percentage: currentApplicableSlab.percentage,
                slabId: currentApplicableSlab.id,
              },
            );
          } else {
            console.log(
              "⚠️ No slab found in registration data for current age:",
              monthsDiff,
            );
          }
        }
        // FALLBACK: Legacy approach for customers without complete slab data
        else if (customer.claimValueSlabId) {
          applicableSlab = await storage.getClaimValueSlabById(
            customer.claimValueSlabId,
          );
          if (
            applicableSlab &&
            monthsDiff >= applicableSlab.minMonths &&
            monthsDiff <= applicableSlab.maxMonths
          ) {
            claimPercentage = applicableSlab.percentage;
            console.log("Using legacy single slab lookup:", {
              id: applicableSlab.id,
              range: `${applicableSlab.minMonths}-${applicableSlab.maxMonths}`,
              percentage: applicableSlab.percentage,
            });
          }
        } else {
          console.log(
            "No claim value slab data stored for customer:",
            customer.id,
          );
        }
      } catch (slabError) {
        console.error("Error fetching claim value slabs:", slabError);
        // Fallback to hardcoded values for mobile devices
        if (customer.deviceType === "mobile") {
          if (monthsDiff >= 6 && monthsDiff <= 12) claimPercentage = 70;
          else if (monthsDiff >= 13 && monthsDiff <= 18) claimPercentage = 60;
          else if (monthsDiff >= 19 && monthsDiff <= 24) claimPercentage = 50;
          else if (monthsDiff >= 25 && monthsDiff <= 30) claimPercentage = 40;
          else if (monthsDiff >= 31 && monthsDiff <= 36) claimPercentage = 30;
          else if (monthsDiff >= 37 && monthsDiff <= 48) claimPercentage = 20;
          else if (monthsDiff >= 49 && monthsDiff <= 60) claimPercentage = 10;
        } else if (customer.deviceType === "laptop") {
          // Fallback values for laptops
          if (monthsDiff >= 6 && monthsDiff <= 12) claimPercentage = 75;
          else if (monthsDiff >= 13 && monthsDiff <= 18) claimPercentage = 65;
          else if (monthsDiff >= 19 && monthsDiff <= 24) claimPercentage = 55;
          else if (monthsDiff >= 25 && monthsDiff <= 30) claimPercentage = 45;
          else if (monthsDiff >= 31 && monthsDiff <= 36) claimPercentage = 35;
          else if (monthsDiff >= 37 && monthsDiff <= 48) claimPercentage = 25;
          else if (monthsDiff >= 49 && monthsDiff <= 60) claimPercentage = 15;
        }
      }

      // Check if device is eligible for claim
      if (claimPercentage === 0) {
        if (monthsDiff < 6) {
          return res.status(400).json({
            message: `Device is not yet eligible for BBG claim. Your device is only ${monthsDiff} months old. BBG claims are valid from 6 months after purchase.`,
            eligible: false,
            deviceAge: monthsDiff,
            minimumAge: 6,
          });
        } else if (monthsDiff > 60) {
          return res.status(400).json({
            message: `Device BBG coverage has expired. Your device is ${monthsDiff} months old. BBG coverage is valid for up to 60 months only.`,
            eligible: false,
            deviceAge: monthsDiff,
            maximumAge: 60,
          });
        }
      }

      const claimAmount =
        (parseFloat(customer.invoiceValue) * claimPercentage) / 100;

      // Prepare registration slab data for frontend display
      let registrationSlabDataForResponse = null;
      if (customer.registrationSlabData) {
        try {
          const slabData = JSON.parse(customer.registrationSlabData);
          registrationSlabDataForResponse = {
            deviceType: slabData.deviceType,
            brand: slabData.brand,
            registrationAge: slabData.registrationAge,
            registrationDate: slabData.registrationDate,
            slabs: slabData.slabs || [],
          };
        } catch (parseError) {
          console.error(
            "Error parsing registrationSlabData for response:",
            parseError,
          );
        }
      }

      res.json({
        customer: {
          name: customer.name,
          deviceType: customer.deviceType,
          modelName: customer.modelName,
          invoiceValue: customer.invoiceValue,
          contact: customer.contact,
          serialNumber: customer.serialNumber,
          brand: customer.brand,
        },
        claimPercentage,
        claimAmount: claimAmount.toFixed(2),
        deviceAge: monthsDiff,
        eligible: true,
        registrationSlabData: registrationSlabDataForResponse,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to check claim value" });
    }
  });

  // Submit claim
  app.post("/api/claims/submit", async (req, res) => {
    try {
      const {
        voucherCode,
        contact,
        email,
        serialNumber,
        address,
        pickupDate,
        pickupTimeSlot,
      } = req.body;

      // First get the customer details
      const customer = await storage.getCustomerByVoucherCode(voucherCode);
      if (!customer) {
        return res.status(404).json({ message: "Invalid BBG voucher code" });
      }

      // Check if claim already exists
      const existingClaim = await storage.getClaimByVoucherCode(voucherCode);
      if (existingClaim) {
        return res
          .status(400)
          .json({ message: "Claim already submitted for this voucher code" });
      }

      // Calculate claim percentage based on device age (using purchase date, not registration date)
      const purchaseDate = new Date(
        customer.dateOfPurchase || customer.createdAt!,
      );
      const monthsDiff = Math.floor(
        (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
      );

      console.log("Date calculation:", {
        currentDate: new Date().toISOString(),
        purchaseDate: purchaseDate.toISOString(),
        monthsDiff,
      });

      // Use the claim value slab that was stored at time of registration
      let claimPercentage = 0;
      let applicableSlab = null;

      try {
        // First try to use the stored slab values from registration time (new approach)
        if (
          customer.registrationSlabPercentage &&
          customer.registrationSlabRange
        ) {
          claimPercentage = customer.registrationSlabPercentage;
          applicableSlab = {
            percentage: customer.registrationSlabPercentage,
            range: customer.registrationSlabRange,
          };

          console.log(
            "Using stored claim slab for submission (from time of purchase):",
            {
              deviceType: customer.deviceType,
              brand: customer.brand,
              range: customer.registrationSlabRange,
              percentage: customer.registrationSlabPercentage,
            },
          );
        }
        // Fallback to legacy approach for older customers who don't have stored slab values
        else if (customer.claimValueSlabId) {
          // Use the slab that was active when customer registered
          applicableSlab = await storage.getClaimValueSlabById(
            customer.claimValueSlabId,
          );
          if (applicableSlab) {
            // Check if current device age falls within the slab's range
            if (
              monthsDiff >= applicableSlab.minMonths &&
              monthsDiff <= applicableSlab.maxMonths
            ) {
              claimPercentage = applicableSlab.percentage;
              console.log(
                "Using legacy claim slab lookup for submission (time of purchase):",
                applicableSlab,
              );
            } else {
              console.log("Device age no longer within original slab range:", {
                currentAge: monthsDiff,
                slabRange: `${applicableSlab.minMonths}-${applicableSlab.maxMonths}`,
                originalPercentage: applicableSlab.percentage,
              });
            }
          }
        } else {
          console.log(
            "No claim value slab data stored for customer:",
            customer.id,
          );
          return res.status(400).json({
            message:
              "Claim value information not found. This might be an older registration that needs to be updated.",
            deviceAgeMonths: monthsDiff,
            eligibilityNote: "Please contact support for assistance.",
          });
        }
      } catch (slabError) {
        console.error("Error fetching claim value slab:", slabError);
        return res.status(500).json({
          message: "Unable to retrieve claim information",
          error: "Database error while fetching claim slab",
        });
      }

      if (claimPercentage === 0) {
        return res.status(400).json({
          message:
            "Device is not yet eligible for claim or claim period has expired.",
          deviceAgeMonths: monthsDiff,
          eligibilityNote:
            "BBG coverage is typically valid from 6 months after purchase.",
        });
      }

      const claimAmount = (customer.invoiceValue * claimPercentage) / 100;

      // Create the claim data with all required fields
      const claimData = {
        customerId: customer.id,
        voucherCode: voucherCode,
        contact: contact,
        email: email,
        serialNumber: serialNumber,
        address: address,
        pickupDate: pickupDate,
        pickupTimeSlot: pickupTimeSlot,
        deviceAgeMonths: monthsDiff,
        claimPercentage: claimPercentage,
        claimAmount: claimAmount,
      };

      const claim = await storage.createClaim(claimData);

      res.status(201).json({
        message:
          "Claim submitted successfully! You will be contacted for device verification.",
        claim: {
          id: claim.id,
          claimAmount: claim.claimAmount,
          claimPercentage: claim.claimPercentage,
          deviceAgeMonths: claim.deviceAgeMonths,
          status: claim.status,
        },
      });
    } catch (error: any) {
      console.error("Claim submission error:", error);
      res
        .status(400)
        .json({ message: error.message || "Claim submission failed" });
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
        serialNumber: "SN987654321098765",
        brand: "iPhone",
        modelName: "iPhone 13",
        invoiceValue: 55000,
        sellerCode: "XTSWN50S0",
      };

      const customer = await storage.createCustomer(customerData);

      // Manually update the created_at date in SQL Server
      await db.connectDB();
      const updateQuery = `UPDATE customers SET created_at = @oldDate WHERE id = @customerId`;
      const request = db.pool.request();
      request.input("customerId", sql.Int, customer.id);
      request.input("oldDate", sql.DateTime2, testDate);
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
          createdDate: testDate,
        },
      });
    } catch (error: any) {
      console.error("Test customer creation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get thank you page data from session
  app.get("/api/thank-you-data", async (req, res) => {
    try {
      const thankYouData = req.session.thankYouData;
      if (thankYouData) {
        // Don't clear session data immediately - let it expire naturally
        // This allows the thank you page to work on refresh
        res.json(thankYouData);
      } else {
        res.status(404).json({ message: "No thank you data found" });
      }
    } catch (error: any) {
      console.error("Thank you data fetch error:", error);
      res.status(500).json({ message: "Error retrieving thank you data" });
    }
  });

  // Validate referral code endpoint
  app.get("/api/validate-referral-code/:code", async (req, res) => {
    try {
      const { code } = req.params;

      if (!code || code.trim() === "") {
        return res
          .status(400)
          .json({ valid: false, message: "Referral code is required" });
      }

      const distributor = await storage.getDistributorBySellerCode(code);

      if (distributor) {
        res.json({
          valid: true,
          message: `Valid referral code for ${distributor.name}`,
          distributorName: distributor.name,
        });
      } else {
        res.json({
          valid: false,
          message: "Invalid referral code",
        });
      }
    } catch (error) {
      console.error("Error validating referral code:", error);
      res
        .status(500)
        .json({ valid: false, message: "Error validating referral code" });
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
          sellerCode: distributor.sellerCode,
        },
        stats: {
          totalSales,
          totalCommission,
          pendingVerifications: customers.filter((c) => !c.isVerified).length,
        },
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
        return res
          .status(400)
          .json({ message: "Username and password are required" });
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
          console.error("Session save error:", err);
        }
      });

      res.json({
        message: "Login successful",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLoginAt: admin.lastLoginAt,
        },
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req: any, res) => {
    console.log("=== LOGOUT ENDPOINT HIT ===");
    console.log("Session before logout:", req.session?.adminId);
    console.log("Full session object:", req.session);

    // Force clear session data immediately
    if (req.session) {
      req.session.adminId = undefined;
      req.session.adminUsername = undefined;
      req.session.adminRole = undefined;

      // Regenerate session to completely clear it
      req.session.regenerate((err: any) => {
        if (err) {
          console.log("Session regenerate failed, clearing manually");
        }

        // Clear the session cookie aggressively
        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true,
          secure: false,
        });

        console.log("=== LOGOUT COMPLETED ===");
        res.json({ message: "Logout successful" });
      });
    } else {
      console.log("No session found");
      res.clearCookie("connect.sid", { path: "/" });
      res.json({ message: "Logout successful" });
    }
  });

  // Admin middleware to check authentication
  const isAdminAuthenticated = (req: any, res: any, next: any) => {
    console.log("Auth check - Session ID:", req.session?.adminId);
    console.log("Auth check - Session object:", req.session);

    if (!req.session?.adminId || req.session.adminId === undefined) {
      console.log("Authentication failed - no valid session");
      return res.status(401).json({ message: "Admin authentication required" });
    }
    next();
  };

  // Get current admin info
  app.get("/api/admin/me", async (req: any, res) => {
    // Add no-cache headers to prevent stale authentication responses
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    console.log("/api/admin/me called - Session ID:", req.session?.adminId);
    console.log(
      "/api/admin/me called - Session username:",
      req.session?.adminUsername,
    );

    // Check authentication inline with better error handling
    if (!req.session?.adminId || req.session.adminId === undefined) {
      console.log("Admin /me endpoint - Authentication failed");
      return res.status(401).json({ message: "Admin authentication required" });
    }

    try {
      const admin = await storage.getAdminByUsername(req.session.adminUsername);
      if (!admin) {
        console.log(
          "Admin not found in database for username:",
          req.session.adminUsername,
        );
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
      });
    } catch (error: any) {
      console.error("Get admin info error:", error);
      res.status(500).json({ message: "Failed to get admin info" });
    }
  });

  // Admin Dashboard Data
  app.get("/api/admin/dashboard", isAdminAuthenticated, async (req, res) => {
    try {
      const [distributors, allCustomers, claims] = await Promise.all([
        storage.getAllDistributors(),
        storage.getAllCustomers(),
        storage.getAllClaims(),
      ]);

      // Group customers by contact number to get unique customer count
      const uniqueCustomers = allCustomers.reduce(
        (groups: any, customer: any) => {
          const contact = customer.contact;
          if (!groups[contact]) {
            groups[contact] = {
              ...customer,
              registrationCount: 1,
              totalInvoiceValue: parseFloat(customer.invoiceValue || 0),
            };
          } else {
            groups[contact].registrationCount += 1;
            groups[contact].totalInvoiceValue += parseFloat(
              customer.invoiceValue || 0,
            );
          }
          return groups;
        },
        {},
      );

      const uniqueCustomersArray = Object.values(uniqueCustomers);

      // Calculate more accurate revenue based on device types (total registrations)
      let bbgPrices;
      try {
        const settings = await storage.getBbgPriceSettings();
        bbgPrices = settings
          ? { laptop: settings.laptopPrice, mobile: settings.mobilePrice }
          : { laptop: 299, mobile: 99 };
      } catch (error) {
        console.error(
          "Error fetching BBG prices for dashboard, using defaults:",
          error,
        );
        bbgPrices = { laptop: 299, mobile: 99 };
      }

      const totalRevenue = allCustomers.reduce((total, customer) => {
        const deviceTypeRevenue =
          customer.deviceType === "laptop"
            ? bbgPrices.laptop
            : bbgPrices.mobile;
        return total + deviceTypeRevenue;
      }, 0);

      const pendingClaims = claims.filter((c) => c.status === "pending").length;

      console.log("Dashboard stats:", {
        distributors: distributors.length,
        customers: uniqueCustomersArray.length, // unique customers
        totalRegistrations: allCustomers.length, // total registrations
        claims: claims.length,
        pendingClaims,
        totalRevenue,
      });

      res.json({
        stats: {
          totalDistributors: distributors.length || 0,
          totalCustomers: uniqueCustomersArray.length || 0, // unique customers
          totalRegistrations: allCustomers.length || 0, // total registrations
          totalClaims: claims.length || 0,
          pendingClaims: pendingClaims || 0,
          totalRevenue: totalRevenue || 0,
          recentCustomers: uniqueCustomersArray.slice(0, 10),
          recentClaims: claims.slice(0, 10),
        },
      });
    } catch (error: any) {
      console.error("Admin dashboard error:", error);
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

  // Admin - Get all customers (grouped by contact number)
  app.get("/api/admin/customers", isAdminAuthenticated, async (req, res) => {
    try {
      const allCustomers = await storage.getAllCustomers();

      // Group customers by contact number
      const groupedCustomers = allCustomers.reduce(
        (groups: any, customer: any) => {
          const contact = customer.contact;
          if (!groups[contact]) {
            groups[contact] = {
              ...customer, // Use the first customer's data as base
              registrationCount: 1,
              totalInvoiceValue: parseFloat(customer.invoiceValue || 0),
              allVoucherCodes: [customer.voucherCode],
              devices: [
                {
                  deviceType: customer.deviceType,
                  brand: customer.brand,
                  modelName: customer.modelName,
                  serialNumber: customer.serialNumber,
                  voucherCode: customer.voucherCode,
                },
              ],
            };
          } else {
            groups[contact].registrationCount += 1;
            groups[contact].totalInvoiceValue += parseFloat(
              customer.invoiceValue || 0,
            );
            groups[contact].allVoucherCodes.push(customer.voucherCode);
            groups[contact].devices.push({
              deviceType: customer.deviceType,
              brand: customer.brand,
              modelName: customer.modelName,
              serialNumber: customer.serialNumber,
              voucherCode: customer.voucherCode,
            });
          }
          return groups;
        },
        {},
      );

      // Convert grouped data back to array
      const groupedCustomersArray = Object.values(groupedCustomers);

      res.json(groupedCustomersArray);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get customers" });
    }
  });

  // Admin - Get regular registrations
  app.get(
    "/api/admin/regular-registrations",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const allCustomers =
          await storage.getCustomersByRegistrationSource("regular");

        // Group customers by contact number (same logic as above)
        const groupedCustomers = allCustomers.reduce(
          (groups: any, customer: any) => {
            const contact = customer.contact;
            if (!groups[contact]) {
              groups[contact] = {
                ...customer,
                registrationCount: 1,
                totalInvoiceValue: parseFloat(customer.invoiceValue || 0),
                allVoucherCodes: [customer.voucherCode],
                devices: [
                  {
                    deviceType: customer.deviceType,
                    brand: customer.brand,
                    modelName: customer.modelName,
                    serialNumber: customer.serialNumber,
                    voucherCode: customer.voucherCode,
                    registrationSource: customer.registrationSource,
                  },
                ],
              };
            } else {
              groups[contact].registrationCount += 1;
              groups[contact].totalInvoiceValue += parseFloat(
                customer.invoiceValue || 0,
              );
              groups[contact].allVoucherCodes.push(customer.voucherCode);
              groups[contact].devices.push({
                deviceType: customer.deviceType,
                brand: customer.brand,
                modelName: customer.modelName,
                serialNumber: customer.serialNumber,
                voucherCode: customer.voucherCode,
                registrationSource: customer.registrationSource,
              });
            }
            return groups;
          },
          {},
        );

        const groupedCustomersArray = Object.values(groupedCustomers);
        res.json(groupedCustomersArray);
      } catch (error: any) {
        console.error("Regular registrations error:", error);
        res
          .status(500)
          .json({ message: "Failed to get regular registrations" });
      }
    },
  );

  // Admin - Get Acer BBG registrations
  app.get(
    "/api/admin/acer-registrations",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const acerCustomers =
          await storage.getCustomersByRegistrationSource("acer_bbg");

        // Group Acer customers by contact number
        const groupedCustomers = acerCustomers.reduce(
          (groups: any, customer: any) => {
            const contact = customer.contact;
            if (!groups[contact]) {
              groups[contact] = {
                ...customer,
                registrationCount: 1,
                totalInvoiceValue: parseFloat(customer.invoiceValue || 0),
                allVoucherCodes: [customer.voucherCode],
                devices: [
                  {
                    deviceType: customer.deviceType,
                    brand: customer.brand,
                    modelName: customer.modelName,
                    serialNumber: customer.serialNumber,
                    voucherCode: customer.voucherCode,
                    registrationSource: customer.registrationSource,
                  },
                ],
              };
            } else {
              groups[contact].registrationCount += 1;
              groups[contact].totalInvoiceValue += parseFloat(
                customer.invoiceValue || 0,
              );
              groups[contact].allVoucherCodes.push(customer.voucherCode);
              groups[contact].devices.push({
                deviceType: customer.deviceType,
                brand: customer.brand,
                modelName: customer.modelName,
                serialNumber: customer.serialNumber,
                voucherCode: customer.voucherCode,
                registrationSource: customer.registrationSource,
              });
            }
            return groups;
          },
          {},
        );

        const groupedCustomersArray = Object.values(groupedCustomers);
        res.json(groupedCustomersArray);
      } catch (error: any) {
        console.error("Acer registrations error:", error);
        res.status(500).json({ message: "Failed to get Acer registrations" });
      }
    },
  );

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
  app.get(
    "/api/admin/pending-payments",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const pendingPayments = await storage.getAllPendingPayments();
        res.json(pendingPayments);
      } catch (error: any) {
        res.status(500).json({ message: "Failed to get pending payments" });
      }
    },
  );

  // Admin - Update pending payment status
  app.put(
    "/api/admin/pending-payments/:id/status",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        await storage.updatePendingPaymentStatus(parseInt(id), status);
        res.json({ message: "Payment status updated successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to update payment status" });
      }
    },
  );

  // Admin - Update claim status
  app.patch(
    "/api/admin/claims/:id/status",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const claimId = parseInt(req.params.id);
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        await storage.updateClaimStatus(claimId, status);

        // Send claim status notification if status is final
        if (["approved", "rejected", "paid"].includes(status)) {
          try {
            // Get claim details for notification
            const claim = await storage.getClaimById(claimId);
            if (claim && claim.customer) {
              const notificationResults =
                await communicationService.sendClaimStatusUpdate({
                  name: claim.customer.name,
                  email: claim.customer.email,
                  contact: claim.customer.contact,
                  voucherCode: claim.customer.voucherCode,
                  claimAmount: claim.claimAmount,
                  status: status,
                });
              console.log(
                "Claim status update notifications sent:",
                notificationResults,
              );
            }
          } catch (notifyError: any) {
            console.error(
              "Failed to send claim status notifications:",
              notifyError.message,
            );
            // Don't fail the status update if notifications fail
          }
        }

        res.json({ message: "Claim status updated successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to update claim status" });
      }
    },
  );

  // Brand management routes
  app.get("/api/brands", async (req, res) => {
    try {
      await db.connectDB();
      const deviceType = req.query.deviceType as string;

      let query = "SELECT * FROM brands WHERE is_active = 1";
      const request = db.pool.request();

      if (deviceType) {
        query += " AND device_type = @deviceType";
        request.input("deviceType", sql.VarChar, deviceType);
      }

      query += " ORDER BY name";
      const result = await request.query(query);

      const brands = result.recordset.map((brand: any) => ({
        id: brand.id,
        name: brand.name,
        deviceType: brand.device_type,
        isActive: brand.is_active,
      }));

      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
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
      request.input("brandId", sql.Int, parseInt(brandId));

      const result = await request.query(`
        SELECT * FROM models 
        WHERE brand_id = @brandId AND is_active = 1
        ORDER BY name
      `);

      const models = result.recordset.map((model: any) => ({
        id: model.id,
        name: model.name,
        brandId: model.brand_id,
        isActive: model.is_active,
      }));

      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
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
        tablesCount: result.recordset[0].table_count,
      });
    } catch (error: any) {
      console.error("Database test error:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
      });
    }
  });

  // Debug admin user endpoint
  app.get("/api/admin/debug-user", async (req, res) => {
    try {
      const admin = await storage.getAdminByUsername("admin");
      res.json({
        exists: !!admin,
        admin: admin
          ? {
              id: admin.id,
              username: admin.username,
              email: admin.email,
              role: admin.role,
              hasPassword: !!admin.passwordHash,
              passwordLength: admin.passwordHash?.length || 0,
            }
          : null,
      });
    } catch (error: any) {
      console.error("Debug admin user error:", error);
      res
        .status(500)
        .json({ message: "Failed to debug admin user", error: error.message });
    }
  });

  // Create default admin user if none exists
  app.post("/api/admin/create-default", async (req, res) => {
    try {
      // Check if any admin user exists
      const existingAdmin = await storage.getAdminByUsername("admin");
      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "Default admin user already exists" });
      }

      // Create default admin user
      const defaultAdmin = await storage.createAdminUser({
        username: "admin",
        email: "admin@xtracover.com",
        passwordHash: "XtraCover2025!#SecureAdmin", // This will be hashed by the storage layer
        roleId: 1, // Default admin role
        role: "admin",
      });

      res.json({
        message: "Default admin user created successfully",
        admin: {
          id: defaultAdmin.id,
          username: defaultAdmin.username,
          email: defaultAdmin.email,
          role: defaultAdmin.role,
        },
      });
    } catch (error: any) {
      console.error("Default admin creation error:", error);
      res.status(500).json({ message: "Failed to create default admin user" });
    }
  });

  // Test all templates with real data
  app.post("/api/test-templates", async (req, res) => {
    try {
      const { name, email, contact } = req.body;

      if (!name || !email || !contact) {
        return res
          .status(400)
          .json({ message: "Name, email, and contact number are required" });
      }

      console.log(`Testing all templates for: ${name} (${email}, ${contact})`);

      const testResults = await testAllTemplates({
        name,
        email,
        phone: contact,
      });

      res.json(testResults);
    } catch (error: any) {
      console.error("Template test error:", error);
      res.status(500).json({
        success: false,
        message: "Template test failed",
        error: error.message,
      });
    }
  });

  // Create Acer BBG slabs with higher percentages
  app.post(
    "/api/admin/create-acer-bbg-slabs",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        console.log("🚀 Creating Acer BBG slabs with higher rates...");

        // Check if Acer BBG slabs already exist
        const existingAcerBbgSlabs =
          await storage.getClaimValueSlabsByRegistrationSource("acer_bbg");

        if (existingAcerBbgSlabs.length > 0) {
          return res.json({
            success: true,
            message: `Acer BBG slabs already exist (${existingAcerBbgSlabs.length} slabs)`,
            created: 0,
            existing: existingAcerBbgSlabs.length,
          });
        }

        // Get all regular Acer laptop slabs
        const allSlabs = await storage.getAllClaimValueSlabs();
        const regularAcerSlabs = allSlabs.filter(
          (s) =>
            s.deviceType === "laptop" &&
            s.brand === "Acer" &&
            (s.registrationSource === "regular" ||
              s.registrationSource === null ||
              s.registrationSource === undefined),
        );

        console.log(
          `Found ${regularAcerSlabs.length} regular Acer laptop slabs to duplicate`,
        );

        let createdCount = 0;
        for (const slab of regularAcerSlabs) {
          // Create Acer BBG version with higher percentage (add 10% points, cap at 80%)
          const bbgPercentage = Math.min(slab.percentage + 10, 80);

          const newSlab = await storage.createClaimValueSlab({
            deviceType: "laptop",
            brand: "Acer",
            minMonths: slab.minMonths,
            maxMonths: slab.maxMonths,
            percentage: bbgPercentage,
            isActive: true,
            registrationSource: "acer_bbg",
          });

          console.log(
            `✅ Created Acer BBG slab: ${slab.minMonths}-${slab.maxMonths} months, ${bbgPercentage}%`,
          );
          createdCount++;
        }

        console.log(`🎉 Created ${createdCount} Acer BBG slabs successfully!`);

        res.json({
          success: true,
          message: `Successfully created ${createdCount} Acer BBG slabs`,
          created: createdCount,
          existing: 0,
        });
      } catch (error) {
        console.error("Error creating Acer BBG slabs:", error);
        res.status(500).json({ error: "Failed to create Acer BBG slabs" });
      }
    },
  );

  // Fix Acer registration sources (one-time admin utility)
  app.post(
    "/api/admin/fix-acer-registration-sources",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        await db.connectDB();

        // First check current state
        console.log("Checking current Acer customer records...");
        const checkQuery = `
        SELECT id, name, brand, registration_source, registration_slab_data 
        FROM customers 
        WHERE brand = 'Acer' OR registration_slab_data LIKE '%acer_bbg%'
        ORDER BY id DESC
      `;

        const checkResult = await db.query(checkQuery);
        console.log("Found records before fix:", checkResult.recordset);

        // Update customers where brand is 'Acer' and registration_slab_data contains 'acer_bbg'
        const updateQuery = `
        UPDATE customers 
        SET registration_source = 'acer_bbg' 
        WHERE (brand = 'Acer' AND registration_slab_data LIKE '%acer_bbg%') 
           OR (registration_slab_data LIKE '%"registrationSource":"acer_bbg"%')
      `;

        console.log("Updating Acer customer registration sources...");
        const updateResult = await db.query(updateQuery);
        console.log(`Updated ${updateResult.rowsAffected[0]} records`);

        // Verify the update
        const verifyResult = await db.query(checkQuery);
        console.log("Records after fix:", verifyResult.recordset);

        res.json({
          success: true,
          message: `Fixed ${updateResult.rowsAffected[0]} Acer registration records`,
          recordsUpdated: updateResult.rowsAffected[0],
          beforeFix: checkResult.recordset,
          afterFix: verifyResult.recordset,
        });
      } catch (error: any) {
        console.error("Error fixing Acer registration sources:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fix Acer registration sources",
          error: error.message,
        });
      }
    },
  );

  // Test Communication Services endpoint (basic test)
  app.post("/api/test-communications", async (req, res) => {
    try {
      const { name, email, contact, message } = req.body;

      if (!name || !email || !contact || !message) {
        return res
          .status(400)
          .json({ message: "Name, email, contact, and message are required" });
      }

      // Test all communication channels
      const results = await communicationService.testAllChannels({
        name,
        email,
        phone: contact,
        message,
      });

      res.json({
        success: true,
        message: "Communication test completed",
        results: {
          email: {
            success: results.email?.success || false,
            message: results.email?.success
              ? "Email sent successfully"
              : results.email?.error || "Failed",
          },
          sms: {
            success: results.sms?.success || false,
            message: results.sms?.success
              ? "SMS sent successfully"
              : results.sms?.error || "Failed",
          },
          whatsapp: {
            success: results.whatsapp?.success || false,
            message: results.whatsapp?.success
              ? "WhatsApp message sent successfully"
              : results.whatsapp?.error || "Failed",
          },
        },
      });
    } catch (error: any) {
      console.error("Communication test error:", error);
      res.status(500).json({
        success: false,
        message: "Communication test failed",
        error: error.message,
      });
    }
  });

  // Test Gupshup WhatsApp specifically
  app.post("/api/test-gupshup-whatsapp", async (req, res) => {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          message: "Phone and message are required",
        });
      }

      const result = await gupshupService.testConnection(phone, message);

      res.json({
        success: true,
        result,
        message: "Gupshup WhatsApp test completed",
      });
    } catch (error: any) {
      console.error("Gupshup WhatsApp test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to test Gupshup WhatsApp",
        error: error.message,
      });
    }
  });

  // Test HSM template functionality
  app.post("/api/test-hsm-template", async (req: any, res) => {
    try {
      const { phone, templateText, params = [] } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required",
        });
      }

      const result = await gupshupService.sendHSMTemplate(
        phone,
        templateText,
        params,
      );

      // Handle both successful and template registration required responses
      if (result.success === false) {
        return res.json({
          success: false,
          result: result,
          message: result.response.details,
        });
      }

      res.json({
        success: true,
        result: result,
        message: "HSM template sent successfully",
      });
    } catch (error: any) {
      console.log("HSM template test error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send HSM template",
        error: error.message,
      });
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
        return res
          .status(400)
          .json({ message: "Please enter a valid Indian mobile number" });
      }

      const testOTP = "123456";
      const customMessage =
        testMessage ||
        `BBG Test SMS: Your test OTP is ${testOTP}. This is a test message from BBG application.`;

      // Test SMS sending via Kaleyra
      const smsResult = await kaleyraSMSService.sendOTP(
        phoneNumber,
        testOTP,
        customMessage,
      );

      if (smsResult.success) {
        res.json({
          success: true,
          message: "Test SMS sent successfully via Kaleyra",
          messageId: smsResult.messageId,
          phoneNumber: phoneNumber,
          serviceName: "Kaleyra SMS",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send test SMS via Kaleyra",
          error: smsResult.error,
          phoneNumber: phoneNumber,
          serviceName: "Kaleyra SMS",
        });
      }
    } catch (error: any) {
      console.error("Kaleyra SMS test error:", error);
      res.status(500).json({
        success: false,
        message: "Test SMS sending failed",
        error: error.message,
      });
    }
  });

  // ===== TEMPLATE MANAGEMENT ROUTES =====

  // Get all message templates
  app.get("/api/admin/templates", isAdminAuthenticated, async (req, res) => {
    try {
      const templates = await templateService.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Failed to fetch templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get template by ID
  app.get(
    "/api/admin/templates/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const templateId = parseInt(req.params.id);
        const templates = await templateService.getAllTemplates();
        const template = templates.find((t) => t.id === templateId);

        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }

        res.json(template);
      } catch (error: any) {
        console.error("Failed to fetch template:", error);
        res.status(500).json({ message: "Failed to fetch template" });
      }
    },
  );

  // Create new template
  app.post("/api/admin/templates", isAdminAuthenticated, async (req, res) => {
    try {
      const templateData = req.body;
      const template = await templateService.createTemplate(templateData);
      res.status(201).json({
        message: "Template created successfully",
        template,
      });
    } catch (error: any) {
      console.error("Failed to create template:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to create template" });
    }
  });

  // Update template
  app.put(
    "/api/admin/templates/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const templateId = parseInt(req.params.id);
        const updates = req.body;
        await templateService.updateTemplate(templateId, updates);
        res.json({ message: "Template updated successfully" });
      } catch (error: any) {
        console.error("Failed to update template:", error);
        res.status(500).json({ message: "Failed to update template" });
      }
    },
  );

  // Delete template
  app.delete(
    "/api/admin/templates/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const templateId = parseInt(req.params.id);
        await templateService.deleteTemplate(templateId);
        res.json({ message: "Template deleted successfully" });
      } catch (error: any) {
        console.error("Failed to delete template:", error);
        res.status(500).json({ message: "Failed to delete template" });
      }
    },
  );

  // Toggle template active status
  app.patch(
    "/api/admin/templates/:id/toggle",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const templateId = parseInt(req.params.id);
        await templateService.toggleTemplateStatus(templateId);
        res.json({ message: "Template status updated successfully" });
      } catch (error: any) {
        console.error("Failed to toggle template status:", error);
        res.status(500).json({ message: "Failed to toggle template status" });
      }
    },
  );

  // Get available variables for an event
  app.get(
    "/api/admin/templates/variables/:event",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const event = req.params.event;
        const variables = templateService.getAvailableVariables(event);
        res.json({ variables });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to get available variables" });
      }
    },
  );

  // Preview template with sample data
  app.post(
    "/api/admin/templates/preview",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { content, variables } = req.body;
        const rendered = templateService.renderTemplate(content, variables);
        res.json({ rendered });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to preview template" });
      }
    },
  );

  // ===== THEME MANAGEMENT ROUTES =====

  // Get current theme settings (public endpoint)
  app.get("/api/theme/current", async (req, res) => {
    try {
      const themeSettings = await storage.getCurrentThemeSettings();
      if (themeSettings) {
        res.json(themeSettings);
      } else {
        // Return default theme if none found
        res.json({ primaryColor: "#254696" });
      }
    } catch (error: any) {
      console.error("Failed to get theme settings:", error);
      res.json({ primaryColor: "#254696" }); // Default fallback
    }
  });

  // Get current theme settings (admin endpoint)
  app.get(
    "/api/admin/theme/current",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const themeSettings = await storage.getCurrentThemeSettings();
        if (themeSettings) {
          res.json(themeSettings);
        } else {
          // Return default theme if none found
          res.json({ primaryColor: "#254696" });
        }
      } catch (error: any) {
        console.error("Failed to get theme settings:", error);
        res.status(500).json({ message: "Failed to get theme settings" });
      }
    },
  );

  // Update theme settings (admin only)
  app.post(
    "/api/admin/theme/update",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { primaryColor } = req.body;

        if (!primaryColor || !/^#[0-9A-F]{6}$/i.test(primaryColor)) {
          return res
            .status(400)
            .json({ message: "Valid hex color code required" });
        }

        const updatedTheme = await storage.updateThemeSettings({
          primaryColor,
        });
        res.json({
          message: "Theme updated successfully",
          theme: updatedTheme,
        });
      } catch (error: any) {
        console.error("Failed to update theme settings:", error);
        res.status(500).json({ message: "Failed to update theme settings" });
      }
    },
  );

  // Get current SMTP settings (admin endpoint)
  app.get("/api/admin/smtp/current", isAdminAuthenticated, async (req, res) => {
    try {
      const smtpSettings = await storage.getSmtpSettings();
      if (smtpSettings) {
        // Don't return the password in the response for security
        const { smtpPassword, ...safeSettings } = smtpSettings;
        res.json({ ...safeSettings, hasPassword: !!smtpPassword });
      } else {
        res.json(null);
      }
    } catch (error: any) {
      console.error("Failed to get SMTP settings:", error);
      res.status(500).json({ message: "Failed to get SMTP settings" });
    }
  });

  // Update SMTP settings (admin only)
  app.post("/api/admin/smtp/update", isAdminAuthenticated, async (req, res) => {
    try {
      console.log("Raw request body:", req.body);
      console.log("Request body type:", typeof req.body);
      console.log("Request headers:", req.headers);

      const { smtpHost, smtpPort, smtpUsername, smtpPassword, fromAddress } =
        req.body;

      console.log("Parsed SMTP data:", {
        smtpHost,
        smtpPort,
        smtpUsername,
        fromAddress,
        hasPassword: !!smtpPassword,
      });

      if (!smtpHost || !smtpUsername || !smtpPassword || !fromAddress) {
        return res
          .status(400)
          .json({ message: "All SMTP fields are required" });
      }

      const updatedSmtp = await storage.updateSmtpSettings({
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpUsername,
        smtpPassword,
        fromAddress,
      });

      console.log("SMTP settings updated successfully");

      // Don't return the password in the response
      const { smtpPassword: _, ...safeSettings } = updatedSmtp;
      res.json({
        message: "SMTP settings updated successfully",
        smtp: { ...safeSettings, hasPassword: true },
      });
    } catch (error: any) {
      console.error("Failed to update SMTP settings:", error);
      res
        .status(500)
        .json({
          message: "Failed to update SMTP settings",
          error: error.message,
        });
    }
  });

  // Test SMTP settings (admin only)
  app.post("/api/admin/smtp/test", isAdminAuthenticated, async (req, res) => {
    try {
      const { testEmail } = req.body;

      if (!testEmail) {
        return res
          .status(400)
          .json({ message: "Test email address is required" });
      }

      // Get current SMTP settings
      const smtpSettings = await storage.getSmtpSettings();
      if (!smtpSettings) {
        return res
          .status(400)
          .json({ message: "SMTP settings not configured" });
      }

      // Create test email content
      const testSubject = "SMTP Configuration Test - XtraCover BBG";
      const testHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6b46c1; margin-bottom: 20px;">SMTP Test Successful! 🎉</h2>
          <p>This is a test email from your XtraCover BBG application to verify SMTP configuration.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Configuration Details:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>SMTP Host:</strong> ${smtpSettings.smtpHost}</li>
              <li><strong>Port:</strong> ${smtpSettings.smtpPort}</li>
              <li><strong>From Address:</strong> ${smtpSettings.fromAddress}</li>
              <li><strong>Test Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p style="color: #666;">If you received this email, your SMTP configuration is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            This email was sent from the XtraCover BBG Admin Panel as part of SMTP configuration testing.
          </p>
        </div>
      `;

      // Use communication service to send test email
      const result = await communicationService.sendEmailWithSmtpSettings(
        testEmail,
        testSubject,
        testHtml,
        smtpSettings,
      );

      if (result.success) {
        res.json({
          message: "Test email sent successfully",
          messageId: result.messageId,
        });
      } else {
        res.status(500).json({
          message: "Failed to send test email",
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Failed to send test email:", error);
      res.status(500).json({
        message: "Failed to send test email",
        error: error.message,
      });
    }
  });

  // ===== WHATSAPP CONFIGURATION ROUTES =====

  // Get WhatsApp configuration (admin endpoint)
  app.get(
    "/api/admin/whatsapp/config",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const whatsappConfig = await storage.getWhatsAppConfig();
        if (whatsappConfig) {
          // Don't return the password in the response for security
          const { password, ...safeConfig } = whatsappConfig;
          res.json({ ...safeConfig, hasPassword: !!password });
        } else {
          res.json({
            userId: "",
            baseUrl: "https://mediaapi.smsgupshup.com/GatewayAPI/rest",
            isEnabled: false,
            hasPassword: false,
          });
        }
      } catch (error: any) {
        console.error("Failed to get WhatsApp config:", error);
        res
          .status(500)
          .json({ message: "Failed to get WhatsApp configuration" });
      }
    },
  );

  // Update WhatsApp configuration (admin only)
  app.post(
    "/api/admin/whatsapp/config",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { userId, password, baseUrl, isEnabled } = req.body;

        if (!userId || !password || !baseUrl) {
          return res
            .status(400)
            .json({ message: "User ID, password, and base URL are required" });
        }

        const updatedConfig = await storage.updateWhatsAppConfig({
          userId,
          password,
          baseUrl,
          isEnabled: !!isEnabled,
        });

        // Don't return the password in the response
        const { password: _, ...safeConfig } = updatedConfig;
        res.json({
          message: "WhatsApp configuration updated successfully",
          config: { ...safeConfig, hasPassword: true },
        });
      } catch (error: any) {
        console.error("Failed to update WhatsApp config:", error);
        res
          .status(500)
          .json({ message: "Failed to update WhatsApp configuration" });
      }
    },
  );

  // Test WhatsApp message (admin only)
  app.post(
    "/api/admin/whatsapp/test",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { phone, message } = req.body;

        if (!phone || !message) {
          return res
            .status(400)
            .json({ message: "Phone number and message are required" });
        }

        // Get current WhatsApp configuration
        const whatsappConfig = await storage.getWhatsAppConfig();
        if (!whatsappConfig || !whatsappConfig.isEnabled) {
          return res
            .status(400)
            .json({ message: "WhatsApp is not configured or disabled" });
        }

        // Prepare the API call using the same format as your working example
        const encodedMessage = encodeURIComponent(message);
        const apiUrl = `${whatsappConfig.baseUrl}?userid=${whatsappConfig.userId}&password=${whatsappConfig.password}&send_to=${phone}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=${encodedMessage}&isTemplate=true`;

        console.log("Testing WhatsApp API with URL:", apiUrl);

        // Make the API call
        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log("WhatsApp test response:", result);

        if (result.status === "success" || result.status === "OK") {
          res.json({
            message: "Test message sent successfully",
            status: result.status,
            response: result,
          });
        } else {
          res.status(500).json({
            message: "Failed to send test message",
            error: result.details || result.message || "Unknown error",
            response: result,
          });
        }
      } catch (error: any) {
        console.error("Failed to send test WhatsApp message:", error);
        res.status(500).json({
          message: "Failed to send test message",
          error: error.message,
        });
      }
    },
  );

  // Get WhatsApp message templates (admin endpoint)
  app.get(
    "/api/admin/whatsapp/templates",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const templates = await storage.getWhatsAppTemplates();
        res.json(templates || []);
      } catch (error: any) {
        console.error("Failed to get WhatsApp templates:", error);
        res.status(500).json({ message: "Failed to get WhatsApp templates" });
      }
    },
  );

  // ===== MASTER MANAGEMENT ROUTES =====

  // BBG Price Settings Management API routes
  // Get current BBG price settings (admin endpoint)
  app.get(
    "/api/admin/bbg-prices/current",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const priceSettings = await storage.getBbgPriceSettings();
        res.json(priceSettings);
      } catch (error: any) {
        console.error("Failed to get BBG price settings:", error);
        res.status(500).json({ message: "Failed to get BBG price settings" });
      }
    },
  );

  // Update BBG price settings (admin only)
  app.post(
    "/api/admin/bbg-prices/update",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        console.log("Updating BBG price settings:", req.body);

        const { laptopPrice, mobilePrice } = req.body;

        if (!laptopPrice || !mobilePrice) {
          return res
            .status(400)
            .json({ message: "Both laptop and mobile prices are required" });
        }

        // Validate price values
        const laptopPriceNum = parseFloat(laptopPrice);
        const mobilePriceNum = parseFloat(mobilePrice);

        if (
          isNaN(laptopPriceNum) ||
          isNaN(mobilePriceNum) ||
          laptopPriceNum <= 0 ||
          mobilePriceNum <= 0
        ) {
          return res
            .status(400)
            .json({
              message: "Invalid price values. Prices must be positive numbers.",
            });
        }

        const updatedPrices = await storage.updateBbgPriceSettings({
          laptopPrice: laptopPriceNum,
          mobilePrice: mobilePriceNum,
        });

        console.log("BBG price settings updated successfully");

        res.json({
          message: "BBG price settings updated successfully",
          prices: updatedPrices,
        });
      } catch (error: any) {
        console.error("Failed to update BBG price settings:", error);
        res
          .status(500)
          .json({
            message: "Failed to update BBG price settings",
            error: error.message,
          });
      }
    },
  );

  // Referral Discount Settings Management API routes
  // Get current referral discount settings (admin endpoint)
  app.get(
    "/api/admin/referral-discount/current",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const discountSettings = await storage.getReferralDiscountSettings();
        res.json(discountSettings || {
          isActive: false,
          discountType: 'percentage',
          discountValue: 0
        });
      } catch (error: any) {
        console.error("Failed to get referral discount settings:", error);
        res.status(500).json({ message: "Failed to get referral discount settings" });
      }
    },
  );

  // Update referral discount settings (admin only)
  app.post(
    "/api/admin/referral-discount/update",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        console.log("Updating referral discount settings:", req.body);

        const { isActive, discountType, discountValue } = req.body;

        // Validate required fields
        if (typeof isActive !== 'boolean') {
          return res
            .status(400)
            .json({ message: "isActive field is required and must be boolean" });
        }

        if (!discountType || !['percentage', 'flat'].includes(discountType)) {
          return res
            .status(400)
            .json({ message: "discountType must be either 'percentage' or 'flat'" });
        }

        // Validate discount value
        const discountNum = parseFloat(discountValue);
        if (isNaN(discountNum) || discountNum < 0) {
          return res
            .status(400)
            .json({
              message: "Invalid discount value. Must be a non-negative number.",
            });
        }

        // Additional validation for percentage
        if (discountType === 'percentage' && discountNum > 100) {
          return res
            .status(400)
            .json({
              message: "Percentage discount cannot exceed 100%.",
            });
        }

        const updatedSettings = await storage.updateReferralDiscountSettings({
          isActive,
          discountType,
          discountValue: discountNum,
        });

        console.log("Referral discount settings updated successfully");

        res.json({
          message: "Referral discount settings updated successfully",
          settings: updatedSettings,
        });
      } catch (error: any) {
        console.error("Failed to update referral discount settings:", error);
        res
          .status(500)
          .json({
            message: "Failed to update referral discount settings",
            error: error.message,
          });
      }
    },
  );

  // Waiting Period Settings Routes (admin only)
  app.get(
    "/api/admin/waiting-period/current",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const settings = await storage.getWaitingPeriodSettings();
        if (settings) {
          res.json(settings);
        } else {
          // Return defaults if none found
          res.json({ enabled: true, months: 3 });
        }
      } catch (error: any) {
        console.error("Failed to get waiting period settings:", error);
        res
          .status(500)
          .json({ message: "Failed to get waiting period settings" });
      }
    },
  );

  app.post(
    "/api/admin/waiting-period/update",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        console.log("🔥 Raw req.body:", req.body);
        console.log("🔥 req.body type:", typeof req.body);
        console.log(
          '🔥 req.headers["content-type"]:',
          req.headers["content-type"],
        );

        const { enabled, months } = req.body;

        if (typeof enabled !== "boolean" || !months) {
          return res
            .status(400)
            .json({
              message: "Enabled (boolean) and months (number) are required",
            });
        }

        const monthsNum = parseInt(months);

        if (isNaN(monthsNum) || monthsNum < 0 || monthsNum > 12) {
          return res
            .status(400)
            .json({ message: "Months must be a number between 0 and 12" });
        }

        await storage.updateWaitingPeriodSettings(enabled, monthsNum);

        console.log("Waiting period settings updated successfully");

        res.json({
          message: "Waiting period settings updated successfully",
          settings: { enabled, months: monthsNum },
        });
      } catch (error: any) {
        console.error("Failed to update waiting period settings:", error);
        res
          .status(500)
          .json({
            message: "Failed to update waiting period settings",
            error: error.message,
          });
      }
    },
  );

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
        return res
          .status(400)
          .json({
            message: "Role name, description and permissions are required",
          });
      }

      const role = await storage.createUserRole({
        roleName,
        description,
        permissions: JSON.stringify(permissions),
      });

      res.status(201).json({
        message: "User role created successfully",
        role,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create user role" });
    }
  });

  app.put(
    "/api/admin/user-roles/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const roleId = parseInt(req.params.id);
        const updates = req.body;

        if (updates.permissions && typeof updates.permissions === "object") {
          updates.permissions = JSON.stringify(updates.permissions);
        }

        await storage.updateUserRole(roleId, updates);
        res.json({ message: "User role updated successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to update user role" });
      }
    },
  );

  app.delete(
    "/api/admin/user-roles/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const roleId = parseInt(req.params.id);
        await storage.deleteUserRole(roleId);
        res.json({ message: "User role deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete user role" });
      }
    },
  );

  // Admin Users Master Management
  app.get("/api/admin/admins", isAdminAuthenticated, async (req, res) => {
    try {
      const admins = await storage.getAllAdminUsers();
      // Remove password hash from response
      const sanitizedAdmins = admins.map((admin) => ({
        ...admin,
        passwordHash: undefined,
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
        return res
          .status(400)
          .json({ message: "Username, email and password are required" });
      }

      const admin = await storage.createAdminUser({
        username,
        email,
        passwordHash: password, // Will be hashed by storage
        roleId: roleId || 1,
        role: role || "admin",
      });

      res.status(201).json({
        message: "Admin user created successfully",
        admin: {
          ...admin,
          passwordHash: undefined,
        },
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
        updates.passwordHash = await bcrypt.hash(updates.password, 12);
        delete updates.password;
      }

      await storage.updateAdminUser(adminId, updates);
      res.json({ message: "Admin user updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update admin user" });
    }
  });

  // Reset admin password (direct database update)
  app.post("/api/admin/reset-password", async (req, res) => {
    try {
      // Get the admin user
      const admin = await storage.getAdminByUsername("admin");
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      // Hash the new strong password
      const newPassword = "XtraCover2025!#SecureAdmin";
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update the admin user's password
      await storage.updateAdminUser(admin.id, { passwordHash: hashedPassword });

      res.json({ 
        message: "Admin password reset successfully to strong password",
        username: admin.username
      });
    } catch (error: any) {
      console.error("Reset admin password error:", error);
      res
        .status(500)
        .json({ message: "Failed to reset admin password", error: error.message });
    }
  });

  app.delete(
    "/api/admin/admins/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const adminId = parseInt(req.params.id);
        await storage.deleteAdminUser(adminId);
        res.json({ message: "Admin user deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete admin user" });
      }
    },
  );

  app.post(
    "/api/admin/admins/:id/toggle",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const adminId = parseInt(req.params.id);
        const { isActive } = req.body;

        await storage.toggleAdminUserStatus(adminId, isActive);
        res.json({ message: "Admin user status updated successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to update admin user status" });
      }
    },
  );

  // Get all distributors for admin
  app.get("/api/admin/distributors", isAdminAuthenticated, async (req, res) => {
    try {
      const distributors = await storage.getAllDistributorsForAdmin();
      res.json(distributors);
    } catch (error: any) {
      console.error("Failed to fetch distributors:", error);
      res.status(500).json({ message: "Failed to fetch distributors" });
    }
  });

  // Get all payouts for admin
  app.get("/api/admin/payouts", isAdminAuthenticated, async (req, res) => {
    try {
      const payouts = await storage.getAllPayoutsForAdmin();
      res.json(payouts);
    } catch (error: any) {
      console.error("Failed to fetch payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Update payout status
  app.patch(
    "/api/admin/payouts/:id/status",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const payoutId = parseInt(req.params.id);
        const { status, paymentReference } = req.body;

        if (!["pending", "processing", "paid", "failed"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        await storage.updatePayoutStatus(payoutId, status, paymentReference);

        // Send payout notification if status is final
        if (["processing", "paid", "failed"].includes(status)) {
          try {
            // Get payout details for notification
            const payouts = await storage.getAllPayoutsForAdmin();
            const payout = payouts.find((p) => p.id === payoutId);
            if (payout && payout.distributor) {
              const notificationResults =
                await communicationService.sendPayoutNotification({
                  name: payout.distributor.name,
                  email: payout.distributor.email,
                  contact: payout.distributor.contact,
                  amount: payout.amount,
                  status: status,
                  paymentReference: paymentReference,
                });
              console.log(
                "Payout status update notifications sent:",
                notificationResults,
              );
            }
          } catch (notifyError: any) {
            console.error(
              "Failed to send payout notifications:",
              notifyError.message,
            );
            // Don't fail the status update if notifications fail
          }
        }

        res.json({ message: "Payout status updated successfully" });
      } catch (error: any) {
        console.error("Failed to update payout status:", error);
        res.status(500).json({ message: "Failed to update payout status" });
      }
    },
  );

  // Sample Excel file download endpoint
  app.get(
    "/api/admin/brands/sample-excel",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const XLSX = require('xlsx');
        
        // Create sample data with exact column names expected by the upload processor
        const sampleData = [
          { "Device Type": "mobile", "Brand": "Apple", "Model": "iPhone 15" },
          { "Device Type": "mobile", "Brand": "Samsung", "Model": "Galaxy S24" },
          { "Device Type": "laptop", "Brand": "Dell", "Model": "XPS 13" },
          { "Device Type": "laptop", "Brand": "HP", "Model": "Pavilion" }
        ];

        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Create worksheet from JSON data
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        
        // Set column widths for better visibility
        const columnWidths = [
          { wch: 15 }, // Device Type
          { wch: 12 }, // Brand
          { wch: 20 }  // Model
        ];
        worksheet['!cols'] = columnWidths;

        // Append worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Brands & Models");

        // Write workbook to buffer with proper options
        const buffer = XLSX.write(workbook, { 
          bookType: 'xlsx', 
          type: 'buffer',
          compression: true
        });

        // Set proper headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="brands-models-sample.xlsx"');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Send the buffer directly
        res.end(buffer);

      } catch (error: any) {
        console.error("Sample Excel file generation error:", error);
        res.status(500).json({ message: "Failed to generate sample Excel file" });
      }
    }
  );

  // Bulk upload brands and models
  app.post(
    "/api/admin/brands/bulk-upload",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { data } = req.body; // Array of { device, brand, model }

        if (!Array.isArray(data) || data.length === 0) {
          return res
            .status(400)
            .json({
              message: "Invalid data format. Expected array of objects.",
            });
        }

        // Validate data format
        for (const item of data) {
          if (!item.device || !item.brand || !item.model) {
            return res.status(400).json({
              message:
                "Invalid data format. Each row must have Device, Brand, and Model.",
            });
          }
        }

        const results = await storage.bulkUploadBrandsAndModels(data);
        res.json({
          message: "Bulk upload completed successfully",
          results,
        });
      } catch (error: any) {
        console.error("Bulk upload error:", error);
        res
          .status(500)
          .json({
            message: error.message || "Failed to upload brands and models",
          });
      }
    },
  );

  // Bulk upload brands and models with file upload
  app.post(
    "/api/admin/bulk-upload-brands",
    isAdminAuthenticated,
    bulkUpload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Download and read the Excel file from S3
        const s3Key = (req.file as any).key;
        const signedUrl = await s3Service.getSignedUrl(s3Key);

        // Download file content
        const response = await fetch(signedUrl);
        const buffer = await response.arrayBuffer();

        // Read the Excel file from buffer
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!Array.isArray(data) || data.length === 0) {
          return res
            .status(400)
            .json({ message: "File is empty or invalid format" });
        }

        // Normalize column names and validate
        const normalizedData = data.map((row: any, index: number) => {
          const keys = Object.keys(row);
          const deviceKey = keys.find(
            (k) =>
              k.toLowerCase().includes("device") ||
              k.toLowerCase().includes("type"),
          );
          const brandKey = keys.find((k) => k.toLowerCase().includes("brand"));
          const modelKey = keys.find((k) => k.toLowerCase().includes("model"));

          if (!deviceKey || !brandKey || !modelKey) {
            throw new Error(
              `Row ${index + 1}: Missing required columns (Device Type, Brand, Model)`,
            );
          }

          return {
            device: row[deviceKey]?.toString().trim().toLowerCase(),
            brand: row[brandKey]?.toString().trim(),
            model: row[modelKey]?.toString().trim(),
          };
        });

        // Validate data
        let successfulRows = 0;
        const errors: string[] = [];

        for (let i = 0; i < normalizedData.length; i++) {
          const item = normalizedData[i];
          if (!item.device || !item.brand || !item.model) {
            errors.push(`Row ${i + 1}: Missing required data`);
            continue;
          }
          if (!["mobile", "laptop"].includes(item.device)) {
            errors.push(
              `Row ${i + 1}: Device type must be 'mobile' or 'laptop'`,
            );
            continue;
          }
          successfulRows++;
        }

        if (successfulRows === 0) {
          return res.status(400).json({
            message: "No valid rows found",
            errors,
          });
        }

        // Process valid data
        const results = await storage.bulkUploadBrandsAndModels(
          normalizedData.filter(
            (item) =>
              item.device &&
              item.brand &&
              item.model &&
              ["mobile", "laptop"].includes(item.device),
          ),
        );

        // S3 files are automatically managed, no cleanup needed

        res.json({
          message: "Bulk upload completed",
          totalRows: normalizedData.length,
          successfulRows: results.successfulRows,
          errors: results.errors,
          created: results.created,
        });
      } catch (error: any) {
        console.error("Bulk upload error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to process file" });
      }
    },
  );

  // Bulk upload brands text endpoint
  app.post(
    "/api/admin/bulk-upload-text",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { data } = req.body;

        if (!data || typeof data !== "string") {
          return res.status(400).json({
            success: false,
            message: "Invalid data format. Expected CSV text data.",
          });
        }

        // Parse CSV data
        const lines = data.split("\n").filter((line) => line.trim());

        if (lines.length <= 1) {
          return res.status(400).json({
            success: false,
            message:
              "CSV data must contain at least a header row and one data row.",
          });
        }

        // Process the header
        const header = lines[0].split(",").map((col) => col.trim());
        const expectedColumns = ["Device Type", "Brand", "Model"];

        if (!expectedColumns.every((col) => header.includes(col))) {
          return res.status(400).json({
            success: false,
            message: `CSV must contain columns: ${expectedColumns.join(", ")}`,
          });
        }

        const deviceTypeIndex = header.indexOf("Device Type");
        const brandIndex = header.indexOf("Brand");
        const modelIndex = header.indexOf("Model");

        const errors: string[] = [];
        const processedData: any[] = [];

        // Process data rows
        const dataRows = lines.slice(1);

        for (const [rowIndex, line] of dataRows.entries()) {
          const actualRowNumber = rowIndex + 2; // +2 for header and 0-based index
          const values = line.split(",").map((val) => val.trim());

          if (
            values.length <
            Math.max(deviceTypeIndex, brandIndex, modelIndex) + 1
          ) {
            errors.push(`Row ${actualRowNumber}: Insufficient columns`);
            continue;
          }

          const deviceType = values[deviceTypeIndex]?.toLowerCase();
          const brandName = values[brandIndex];
          const modelName = values[modelIndex];

          if (!deviceType || !brandName || !modelName) {
            errors.push(`Row ${actualRowNumber}: Missing required fields`);
            continue;
          }

          if (!["mobile", "laptop"].includes(deviceType)) {
            errors.push(
              `Row ${actualRowNumber}: Device Type must be 'mobile' or 'laptop'`,
            );
            continue;
          }

          processedData.push({
            device: deviceType,
            brand: brandName,
            model: modelName,
          });
        }

        if (processedData.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid rows found",
            errors,
          });
        }

        // Use existing bulk upload method
        const results = await storage.bulkUploadBrandsAndModels(processedData);

        console.log(
          `Bulk text upload completed: ${results.created.brands} brands, ${results.created.models} models created`,
        );

        res.json({
          success: true,
          message: "Bulk upload completed successfully",
          totalRows: dataRows.length,
          successfulRows: results.successfulRows,
          errors: [...errors, ...results.errors],
          created: results.created,
        });
      } catch (error: any) {
        console.error("Bulk text upload error:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error during bulk upload",
        });
      }
    },
  );

  // Add dummy data endpoint for quick setup using direct inserts
  app.post(
    "/api/admin/add-dummy-data",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const dummyData = [
          // Mobile brands and models
          { device: "mobile", brand: "Apple", model: "iPhone 15" },
          { device: "mobile", brand: "Apple", model: "iPhone 14" },
          { device: "mobile", brand: "Apple", model: "iPhone 13" },
          { device: "mobile", brand: "Samsung", model: "Galaxy S24" },
          { device: "mobile", brand: "Samsung", model: "Galaxy S23" },
          { device: "mobile", brand: "Samsung", model: "Galaxy A54" },
          { device: "mobile", brand: "OnePlus", model: "OnePlus 12" },
          { device: "mobile", brand: "OnePlus", model: "OnePlus 11" },
          { device: "mobile", brand: "Xiaomi", model: "Mi 14" },
          { device: "mobile", brand: "Xiaomi", model: "Redmi Note 13" },
          { device: "mobile", brand: "Vivo", model: "V30" },
          { device: "mobile", brand: "Vivo", model: "Y28" },
          { device: "mobile", brand: "Oppo", model: "Find X7" },
          { device: "mobile", brand: "Oppo", model: "A78" },
          { device: "mobile", brand: "Realme", model: "GT 6" },
          { device: "mobile", brand: "Realme", model: "Narzo 70" },
          { device: "mobile", brand: "Google", model: "Pixel 8" },
          { device: "mobile", brand: "Google", model: "Pixel 7a" },
          { device: "mobile", brand: "Nothing", model: "Phone 2" },
          { device: "mobile", brand: "Motorola", model: "Edge 50" },

          // Laptop brands and models
          { device: "laptop", brand: "Apple", model: "MacBook Air M3" },
          { device: "laptop", brand: "Apple", model: "MacBook Pro 14" },
          { device: "laptop", brand: "Dell", model: "XPS 13" },
          { device: "laptop", brand: "Dell", model: "Inspiron 15" },
          { device: "laptop", brand: "HP", model: "Pavilion 15" },
          { device: "laptop", brand: "HP", model: "Spectre x360" },
          { device: "laptop", brand: "Lenovo", model: "ThinkPad X1" },
          { device: "laptop", brand: "Lenovo", model: "IdeaPad 3" },
          { device: "laptop", brand: "Asus", model: "ZenBook 14" },
          { device: "laptop", brand: "Asus", model: "VivoBook 15" },
          { device: "laptop", brand: "Acer", model: "Swift 3" },
          { device: "laptop", brand: "Acer", model: "Aspire 5" },
          { device: "laptop", brand: "MSI", model: "Modern 14" },
          { device: "laptop", brand: "MSI", model: "Gaming GF63" },
          { device: "laptop", brand: "Surface", model: "Laptop 5" },
          { device: "laptop", brand: "Surface", model: "Pro 9" },
        ];

        let brandsCreated = 0;
        let modelsCreated = 0;
        const brandMap = new Map<string, number>();

        // Step 1: Create unique brands first
        const uniqueBrands = new Set<string>();
        dummyData.forEach((item) => {
          uniqueBrands.add(`${item.brand}|${item.device}`);
        });

        for (const brandKey of uniqueBrands) {
          const [brandName, deviceType] = brandKey.split("|");
          try {
            // Check if brand already exists
            const brands = await storage.getBrandsByDeviceType(deviceType);
            const existingBrand = brands.find(
              (b) => b.name.toLowerCase() === brandName.toLowerCase(),
            );

            if (!existingBrand) {
              const newBrand = await storage.createBrand({
                name: brandName,
                deviceType: deviceType,
                isActive: true,
              });
              brandMap.set(brandKey, newBrand.id);
              brandsCreated++;
            } else {
              brandMap.set(brandKey, existingBrand.id);
            }
          } catch (error) {
            console.error(`Error creating brand ${brandName}:`, error);
          }
        }

        // Step 2: Create models
        for (const item of dummyData) {
          const brandKey = `${item.brand}|${item.device}`;
          const brandId = brandMap.get(brandKey);

          if (brandId) {
            try {
              // Check if model already exists
              const existingModels = await storage.getModelsByBrandId(brandId);
              const modelExists = existingModels.find(
                (m) => m.modelName.toLowerCase() === item.model.toLowerCase(),
              );

              if (!modelExists) {
                await storage.createDeviceModel({
                  brandId: brandId,
                  modelName: item.model,
                  deviceType: item.device,
                  isActive: true,
                });
                modelsCreated++;
              }
            } catch (error) {
              console.error(`Error creating model ${item.model}:`, error);
            }
          }
        }

        console.log(
          `Dummy data added: ${brandsCreated} brands, ${modelsCreated} models created`,
        );

        res.json({
          success: true,
          message: "Dummy data added successfully",
          created: { brands: brandsCreated, models: modelsCreated },
          totalProcessed: dummyData.length,
        });
      } catch (error: any) {
        console.error("Error adding dummy data:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add dummy data: " + error.message,
        });
      }
    },
  );

  // Distributors Master Management (Enhanced with CRUD)
  app.post(
    "/api/admin/distributors",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const distributorData = req.body;
        const distributor = await storage.createDistributor(distributorData);
        res.status(201).json({
          message: "Distributor created successfully",
          distributor,
        });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to create distributor" });
      }
    },
  );

  app.put(
    "/api/admin/distributors/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const distributorId = parseInt(req.params.id);
        const updates = req.body;
        await storage.updateDistributor(distributorId, updates);
        res.json({ message: "Distributor updated successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to update distributor" });
      }
    },
  );

  app.delete(
    "/api/admin/distributors/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const distributorId = parseInt(req.params.id);
        await storage.deleteDistributor(distributorId);
        res.json({ message: "Distributor deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete distributor" });
      }
    },
  );

  // Customers Master Management (Enhanced with CRUD)
  app.post("/api/admin/customers", isAdminAuthenticated, async (req, res) => {
    try {
      const customerData = req.body;
      const customer = await storage.createCustomer(customerData);
      res.status(201).json({
        message: "Customer created successfully",
        customer,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put(
    "/api/admin/customers/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const customerId = parseInt(req.params.id);
        const updates = req.body;
        await storage.updateCustomer(customerId, updates);
        res.json({ message: "Customer updated successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to update customer" });
      }
    },
  );

  app.delete(
    "/api/admin/customers/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const customerId = parseInt(req.params.id);
        await storage.deleteCustomer(customerId);
        res.json({ message: "Customer deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete customer" });
      }
    },
  );

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
            updated_at: model.updated_at,
          })),
        });
      }

      res.json(brands);
    } catch (error: any) {
      console.error("Error fetching brands with models:", error);
      res.status(500).json({ message: "Failed to get brands with models" });
    }
  });

  app.get("/api/admin/brands", isAdminAuthenticated, async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error: any) {
      console.error("Error in /api/admin/brands:", error);
      res.status(500).json({ message: "Failed to get brands" });
    }
  });

  // Brands with models API endpoint for admin brands page
  app.get("/api/brands-with-models", isAdminAuthenticated, async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      const brandsWithModels = await Promise.all(
        brands.map(async (brand) => {
          const models = await storage.getModelsByBrandId(brand.id);
          return {
            ...brand,
            models,
          };
        }),
      );

      res.json(brandsWithModels);
    } catch (error: any) {
      console.error("Error in /api/brands-with-models:", error);
      res.status(500).json({ message: "Failed to get brands with models" });
    }
  });

  // Create brand
  app.post("/api/brands", async (req, res) => {
    try {
      await db.connectDB();
      const { name, device_type, is_active = true } = req.body;

      if (!name || !device_type) {
        return res
          .status(400)
          .json({ message: "Brand name and device type are required" });
      }

      const request = db.pool.request();
      request.input("name", sql.VarChar, name);
      request.input("device_type", sql.VarChar, device_type);
      request.input("is_active", sql.Bit, is_active);

      const result = await request.query(`
        INSERT INTO brands (name, device_type, is_active) 
        OUTPUT INSERTED.* 
        VALUES (@name, @device_type, @is_active)
      `);

      res.status(201).json({
        message: "Brand created successfully",
        brand: result.recordset[0],
      });
    } catch (error: any) {
      console.error("Error creating brand:", error);
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.post("/api/admin/brands", isAdminAuthenticated, async (req, res) => {
    try {
      const { name, deviceType } = req.body;

      if (!name || !deviceType) {
        return res
          .status(400)
          .json({ message: "Brand name and device type are required" });
      }

      const brand = await storage.createBrand({
        name,
        deviceType,
      });

      res.status(201).json({
        message: "Brand created successfully",
        brand,
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
      request.input("id", sql.Int, brandId);
      request.input("name", sql.VarChar, name);
      request.input("device_type", sql.VarChar, device_type);
      request.input("updated_at", sql.DateTime2, new Date());

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
        brand: result.recordset[0],
      });
    } catch (error: any) {
      console.error("Error updating brand:", error);
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  // Delete brand
  app.delete("/api/brands/:id", async (req, res) => {
    try {
      await db.connectDB();
      const brandId = parseInt(req.params.id);

      const request = db.pool.request();
      request.input("id", sql.Int, brandId);

      // First delete associated models
      await request.query(`DELETE FROM models WHERE brand_id = @id`);

      // Then delete the brand
      const result = await request.query(`DELETE FROM brands WHERE id = @id`);

      res.json({ message: "Brand deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting brand:", error);
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

  app.patch("/api/admin/brands/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const brandId = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateBrand(brandId, updates);
      res.json({ message: "Brand updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete(
    "/api/admin/brands/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const brandId = parseInt(req.params.id);
        await storage.deleteBrand(brandId);
        res.json({ message: "Brand deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete brand" });
      }
    },
  );

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
        return res
          .status(400)
          .json({ message: "Model name and brand ID are required" });
      }

      const request = db.pool.request();
      request.input("name", sql.VarChar, name);
      request.input("brand_id", sql.Int, brand_id);
      request.input("is_active", sql.Bit, is_active);

      const result = await request.query(`
        INSERT INTO models (name, brand_id, is_active) 
        OUTPUT INSERTED.* 
        VALUES (@name, @brand_id, @is_active)
      `);

      res.status(201).json({
        message: "Model created successfully",
        model: result.recordset[0],
      });
    } catch (error: any) {
      console.error("Error creating model:", error);
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
      request.input("id", sql.Int, modelId);
      request.input("name", sql.VarChar, name);
      request.input("updated_at", sql.DateTime2, new Date());

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
        model: result.recordset[0],
      });
    } catch (error: any) {
      console.error("Error updating model:", error);
      res.status(500).json({ message: "Failed to update model" });
    }
  });

  // Delete model
  app.delete("/api/models/:id", async (req, res) => {
    try {
      await db.connectDB();
      const modelId = parseInt(req.params.id);

      const request = db.pool.request();
      request.input("id", sql.Int, modelId);

      const result = await request.query(`DELETE FROM models WHERE id = @id`);

      res.json({ message: "Model deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting model:", error);
      res.status(500).json({ message: "Failed to delete model" });
    }
  });

  app.get("/api/admin/models", isAdminAuthenticated, async (req, res) => {
    try {
      const models = await storage.getAllDeviceModels();
      res.json(models);
    } catch (error: any) {
      console.error("Error in /api/admin/models:", error);
      res.status(500).json({ message: "Failed to get device models" });
    }
  });

  app.post("/api/admin/models", isAdminAuthenticated, async (req, res) => {
    try {
      const { brandId, modelName, deviceType } = req.body;

      if (!brandId || !modelName || !deviceType) {
        return res
          .status(400)
          .json({
            message: "Brand ID, model name, and device type are required",
          });
      }

      const model = await storage.createDeviceModel({
        brandId,
        modelName,
        deviceType,
      });

      res.status(201).json({
        message: "Device model created successfully",
        model,
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

  app.patch("/api/admin/models/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const modelId = parseInt(req.params.id);
      const updates = req.body;
      await storage.updateDeviceModel(modelId, updates);
      res.json({ message: "Device model updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update device model" });
    }
  });

  app.delete(
    "/api/admin/models/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const modelId = parseInt(req.params.id);
        await storage.deleteDeviceModel(modelId);
        res.json({ message: "Device model deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ message: "Failed to delete device model" });
      }
    },
  );

  // Clear all models - admin only
  app.delete("/api/admin/models", isAdminAuthenticated, async (req, res) => {
    try {
      await db.connectDB();
      const query = `DELETE FROM models`;
      const request = db.pool.request();
      const result = await request.query(query);
      res.json({
        message: "All models cleared successfully",
        deletedCount: result.rowsAffected[0],
      });
    } catch (error: any) {
      console.error("Failed to clear all models:", error);
      res.status(500).json({ message: "Failed to clear all models" });
    }
  });

  // System status endpoint for admin monitoring
  app.get("/api/admin/system-status", async (req, res) => {
    // Simple auth check instead of middleware
    if (!req.session?.adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    try {
      // Check database connection with proper error handling
      let dbStatus;
      try {
        await storage.getAllCustomers(); // Simple test query
        dbStatus = {
          service: "SQL Server Database",
          status: "connected",
          message: "Database connection active",
          host: process.env.SQL_SERVER_HOST || "103.205.66.184",
          database: process.env.SQL_SERVER_DATABASE || "prexoDB",
        };
      } catch (dbError) {
        dbStatus = {
          service: "SQL Server Database",
          status: "disconnected",
          message: "Database connection failed",
          error: dbError.message,
        };
      }

      // Check Kaleyra SMS status with environment variable validation
      const hasKaleyraKey = !!(
        process.env.KALEYRA_API_KEY && process.env.KALEYRA_API_KEY.length > 10
      );
      const smsStatus = {
        service: "Kaleyra SMS",
        status: hasKaleyraKey ? "connected" : "disconnected",
        message: hasKaleyraKey
          ? "API key configured and active"
          : "API key missing or invalid",
        senderId: process.env.KALEYRA_SENDER_ID || "Not configured",
      };

      // Check email SMTP status with proper validation
      const hasEmailConfig = !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
      );
      const emailStatus = {
        service: "Email SMTP",
        status: hasEmailConfig ? "connected" : "disconnected",
        message: hasEmailConfig
          ? "SMTP fully configured"
          : "SMTP configuration incomplete",
        host: process.env.SMTP_HOST || "Not configured",
        user: process.env.SMTP_USER ? "Configured" : "Not configured",
      };

      // Check WhatsApp status with proper validation
      const hasWhatsAppConfig = !!(
        process.env.GUPSHUP_API_KEY && process.env.GUPSHUP_SOURCE_NUMBER
      );
      const whatsappStatus = {
        service: "WhatsApp Gupshup",
        status: hasWhatsAppConfig ? "connected" : "disconnected",
        message: hasWhatsAppConfig
          ? "Gupshup API configured and ready"
          : "API key needed - Login to https://www.gupshup.io/whatsapp/dashboard with Account ID: 2000203987",
        appName: process.env.GUPSHUP_APP_NAME || "xtracover-bbg",
        sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER || "919311816849",
        accountId: process.env.GUPSHUP_ACCOUNT_ID || "2000203987",
      };

      // Check template count with error handling
      let templateStatus;
      try {
        const templates = await storage.getAllTemplates();
        templateStatus = {
          service: "Template System",
          status: templates.length > 0 ? "connected" : "disconnected",
          count: templates.length,
          message: `${templates.length} templates configured`,
        };
      } catch (templateError) {
        console.error("Template error:", templateError);
        // Fallback - try to manually check templates table
        try {
          await db.connectDB();
          const result = await db.pool
            .request()
            .query("SELECT COUNT(*) as count FROM message_templates");
          const count = result.recordset[0]?.count || 0;
          templateStatus = {
            service: "Template System",
            status: count > 0 ? "connected" : "disconnected",
            count: count,
            message: `${count} templates configured (manual count)`,
          };
        } catch (fallbackError) {
          templateStatus = {
            service: "Template System",
            status: "disconnected",
            count: 0,
            message: "Template system error",
            error: templateError.message,
          };
        }
      }

      // System uptime with proper formatting
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      const uptimeSeconds = Math.floor(uptime % 60);

      res.json({
        status: "success",
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          sms: smsStatus,
          email: emailStatus,
          whatsapp: whatsappStatus,
          templates: templateStatus,
        },
        system: {
          uptime: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
          nodeVersion: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV || "development",
        },
      });
    } catch (error: any) {
      console.error("System status error:", error);
      res.status(500).json({
        message: "Failed to get system status",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // System logs endpoint for admin monitoring
  app.get("/api/admin/logs", async (req, res) => {
    // Simple auth check instead of middleware
    if (!req.session?.adminId) {
      return res.status(401).json({ message: "Admin authentication required" });
    }
    try {
      // In a real app, you'd fetch from a log store
      // For now, return recent activity logs
      const recentLogs = [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          service: "System",
          message: "Admin logs endpoint accessed",
          details: { endpoint: "/api/admin/logs", user: "admin" },
        },
      ];

      res.json(recentLogs);
    } catch (error: any) {
      console.error("Logs fetch error:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Email SMTP configuration endpoint
  app.post(
    "/api/admin/configure-smtp",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { host, port, user, password } = req.body;

        if (!host || !port || !user || !password) {
          return res
            .status(400)
            .json({ message: "All SMTP fields are required" });
        }

        // Store in environment first
        process.env.SMTP_HOST = host;
        process.env.SMTP_PORT = port.toString();
        process.env.SMTP_USER = user;
        process.env.SMTP_PASSWORD = password;

        // Test the configuration by attempting to send a test email
        try {
          const testResult = await communicationService.emailService.sendEmail(
            user,
            "SMTP Configuration Test - XtraCover BBG",
            "<h2>SMTP Configuration Successful!</h2><p>Your SMTP settings are working correctly. Email notifications are now enabled for XtraCover BBG.</p><p>You will receive automatic notifications for customer registrations, claim updates, and referral partner payouts.</p>",
            "SMTP Configuration Successful! Your email settings are working correctly. Email notifications are now enabled for XtraCover BBG.",
          );

          if (!testResult.success) {
            // Remove the credentials if test fails
            delete process.env.SMTP_HOST;
            delete process.env.SMTP_PORT;
            delete process.env.SMTP_USER;
            delete process.env.SMTP_PASSWORD;
            throw new Error(testResult.error || "SMTP authentication failed");
          }
        } catch (error: any) {
          // Remove the credentials if test fails
          delete process.env.SMTP_HOST;
          delete process.env.SMTP_PORT;
          delete process.env.SMTP_USER;
          delete process.env.SMTP_PASSWORD;
          throw error;
        }

        res.json({
          success: true,
          message: "SMTP configuration saved and verified successfully",
          config: {
            host,
            port,
            user: user.replace(/(.{3}).*(@.*)/, "$1***$2"),
          },
        });
      } catch (error: any) {
        console.error("SMTP configuration error:", error);
        res.status(500).json({
          success: false,
          message: "SMTP configuration failed",
          error: error.message,
        });
      }
    },
  );

  // Get current SMTP configuration status
  app.get("/api/admin/smtp-status", isAdminAuthenticated, async (req, res) => {
    try {
      const configured = !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
      );

      res.json({
        configured,
        config: configured
          ? {
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT || "587",
              user: process.env.SMTP_USER?.replace(/(.{3}).*(@.*)/, "$1***$2"),
              hasPassword: !!process.env.SMTP_PASSWORD,
            }
          : null,
        instructions: !configured
          ? `
📧 EMAIL SMTP SETUP REQUIRED

To enable email notifications for:
- Customer registration confirmations
- Claim status updates
- Referral partner payout notifications

Common SMTP settings:
• Gmail: smtp.gmail.com, port 587 (requires app password)
• Outlook: smtp-mail.outlook.com, port 587
• Custom: Your hosting provider's SMTP settings

For Gmail:
1. Enable 2-factor authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Generate an app password for "Mail"
4. Use your Gmail address and the app password below
        `
          : "SMTP is configured and ready",
      });
    } catch (error: any) {
      console.error("SMTP status error:", error);
      res.status(500).json({ message: "Failed to get SMTP status" });
    }
  });

  // WhatsApp setup helper endpoint
  app.get(
    "/api/admin/whatsapp-setup",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const currentConfig = {
          hasApiKey: !!process.env.GUPSHUP_API_KEY,
          accountId: process.env.GUPSHUP_ACCOUNT_ID || "2000203987",
          sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER || "919311816849",
          appName: process.env.GUPSHUP_APP_NAME || "xtracover-bbg",
        };

        const instructions = `
🔧 WHATSAPP SETUP REQUIRED

Your Gupshup account details:
- Account ID: 2000203987
- Password: VqFvY7Ypd  
- WhatsApp Number: +91 93118 16849

📋 To complete setup:
1. Visit: https://www.gupshup.io/whatsapp/dashboard
2. Login with Account ID: 2000203987
3. Use Password: VqFvY7Ypd
4. Go to "Settings" tab 
5. Copy your API Key
6. Provide the API Key to complete WhatsApp integration

Current Status: ${currentConfig.hasApiKey ? "✅ API Key Configured" : "❌ API Key Missing"}
Required: GUPSHUP_API_KEY environment variable
      `;

        res.json({
          configured: currentConfig.hasApiKey,
          missing: currentConfig.hasApiKey ? [] : ["GUPSHUP_API_KEY"],
          instructions,
          currentConfig,
        });
      } catch (error: any) {
        console.error("WhatsApp setup error:", error);
        res
          .status(500)
          .json({
            message: "Failed to get WhatsApp setup info",
            error: error.message,
          });
      }
    },
  );

  // Acer IMEI Validation API Endpoints
  // Admin endpoint to upload Acer IMEI data for validation
  // Create S3 upload config that allows CSV files for IMEI data
  const acerImeiUpload = createS3Upload('bulk-uploads', false, true);
  
  app.post(
    "/api/admin/acer-imei/upload",
    isAdminAuthenticated,
    acerImeiUpload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Download and read the Excel/CSV file from S3
        const s3Key = (req.file as any).key;
        const signedUrl = await s3Service.getSignedUrl(s3Key);

        // Download file content
        const response = await fetch(signedUrl);
        const buffer = await response.arrayBuffer();

        // Read the Excel file from buffer
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!Array.isArray(data) || data.length === 0) {
          return res
            .status(400)
            .json({ message: "File is empty or invalid format" });
        }

        // Normalize IMEI data from Acer file
        const normalizedData = data.map((row: any, index: number) => {
          const keys = Object.keys(row);
          const serialKey = keys.find(
            (k) =>
              k.toLowerCase().includes("serial") ||
              k.toLowerCase().includes("imei") ||
              k.toLowerCase().includes("number"),
          );
          const invoiceDateKey = keys.find((k) =>
            k.toLowerCase().includes("invoice") ||
            k.toLowerCase().includes("date"),
          );

          if (!serialKey) {
            throw new Error(`Row ${index + 1}: Missing Serial Number column`);
          }

          const serialNumber = row[serialKey]?.toString().trim();
          const invoiceDate = row[invoiceDateKey]?.toString().trim() || null;

          return {
            imei: serialNumber,
            model: "Acer Device", // Generic model for Acer devices
            brand: "Acer",
            invoiceDate: invoiceDate,
            uploadedAt: new Date(),
          };
        });

        // Insert IMEI data into database
        await db.connectDB();
        let successfulRows = 0;
        const errors: string[] = [];

        for (let i = 0; i < normalizedData.length; i++) {
          const item = normalizedData[i];
          if (!item.imei) {
            errors.push(`Row ${i + 1}: Missing IMEI/Serial number`);
            continue;
          }

          try {
            const request = db.pool.request();
            request.input("imei", sql.VarChar, item.imei);
            request.input("model", sql.VarChar, item.model);
            request.input("brand", sql.VarChar, item.brand);
            request.input("uploaded_at", sql.DateTime2, item.uploadedAt);

            await request.query(`
            IF NOT EXISTS (SELECT 1 FROM acer_imei_validation WHERE imei = @imei)
            INSERT INTO acer_imei_validation (imei, model, brand, uploaded_at) 
            VALUES (@imei, @model, @brand, @uploaded_at)
          `);
            successfulRows++;
          } catch (dbError: any) {
            errors.push(`Row ${i + 1}: Database error - ${dbError.message}`);
          }
        }

        // S3 files are automatically managed, no cleanup needed

        res.json({
          message: "Acer IMEI data uploaded successfully",
          totalRows: normalizedData.length,
          successfulRows,
          errors,
        });
      } catch (error: any) {
        console.error("Acer IMEI upload error:", error);
        res
          .status(500)
          .json({
            message: error.message || "Failed to upload Acer IMEI data",
          });
      }
    },
  );

  // API endpoint to check if device is already registered
  app.post("/api/check-device-registration", async (req, res) => {
    try {
      const { serialNumber } = req.body;

      if (!serialNumber) {
        return res.status(400).json({ message: "Serial number is required" });
      }

      await db.connectDB();
      const request = db.pool.request();
      request.input("serialNumber", sql.VarChar, serialNumber);

      const result = await request.query(`
        SELECT COUNT(*) as count 
        FROM customers 
        WHERE serial_number = @serialNumber
      `);

      const exists = result.recordset[0].count > 0;
      res.json({ exists });
    } catch (error: any) {
      console.error("Device registration check error:", error);
      res.status(500).json({ message: "Failed to check device registration" });
    }
  });

  // API endpoint to validate IMEI for Acer registrations
  app.post("/api/validate-acer-imei", async (req, res) => {
    try {
      const { imei } = req.body;

      if (!imei) {
        return res.status(400).json({ message: "IMEI is required" });
      }

      await db.connectDB();
      const request = db.pool.request();
      request.input("imei", sql.VarChar, imei);

      const result = await request.query(`
        SELECT imei, model, brand, uploaded_at 
        FROM acer_imei_validation 
        WHERE imei = @imei
      `);

      if (result.recordset.length === 0) {
        return res.json({
          valid: false,
          message: "IMEI Not Found",
        });
      }

      const imeiData = result.recordset[0];
      res.json({
        valid: true,
        message: "Valid IMEI",
        data: {
          imei: imeiData.imei,
          model: imeiData.model,
          brand: imeiData.brand,
        },
      });
    } catch (error: any) {
      console.error("IMEI validation error:", error);
      res.status(500).json({ message: "Failed to validate IMEI" });
    }
  });

  // Admin endpoint to view uploaded Acer IMEI data
  app.get("/api/admin/acer-imei", isAdminAuthenticated, async (req, res) => {
    try {
      await db.connectDB();
      const result = await db.pool.request().query(`
        SELECT imei, model, brand, uploaded_at,
               ROW_NUMBER() OVER (ORDER BY uploaded_at DESC) as row_num
        FROM acer_imei_validation 
        ORDER BY uploaded_at DESC
      `);

      // Prevent caching to ensure fresh data
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });

      res.json({
        data: result.recordset,
        total: result.recordset.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error fetching Acer IMEI data:", error);
      res.status(500).json({ message: "Failed to fetch Acer IMEI data" });
    }
  });

  // Admin endpoint to view Acer BBG registrations
  app.get(
    "/api/admin/acer-registrations",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        await db.connectDB();
        const result = await db.pool.request().query(`
        SELECT 
          id,
          name,
          contact,
          email,
          pincode,
          device_type as deviceType,
          serial_number as serialNumber,
          brand,
          model_name as modelName,
          invoice_value as invoiceValue,
          date_of_purchase as dateOfPurchase,
          seller_code as sellerCode,
          voucher_code as voucherCode,
          payment_intent_id as paymentIntentId,
          is_verified as isVerified,
          registration_source as registrationSource,
          created_at as createdAt
        FROM customers 
        WHERE registration_source = 'acer'
        ORDER BY created_at DESC
      `);

        res.json(result.recordset);
      } catch (error: any) {
        console.error("Error fetching Acer registrations:", error);
        res.status(500).json({ message: "Failed to fetch Acer registrations" });
      }
    },
  );

  // Register test routes for individual service testing
  // File management API endpoints for S3
  app.get("/api/files/signed-url/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const signedUrl = await s3Service.getSignedUrl(key);

      res.json({ signedUrl });
    } catch (error: any) {
      console.error("Error generating signed URL:", error);
      res.status(500).json({ message: "Failed to generate file access URL" });
    }
  });

  registerTestRoutes(app);

  // Cart Abandonment tracking endpoints
  app.post("/api/cart-abandonment", async (req, res) => {
    try {
      const { sessionId, stage, ...data } = req.body;

      // Check if session already exists using more efficient query
      const existingAbandonment =
        await storage.getCartAbandonmentBySessionId(sessionId);

      if (existingAbandonment) {
        // Only update if stage has changed or data is significantly different
        if (
          existingAbandonment.stage !== stage ||
          JSON.stringify(existingAbandonment.name) !== JSON.stringify(data.name)
        ) {
          await storage.updateCartAbandonment(sessionId, { ...data, stage });
          res.json({ message: "Cart abandonment updated" });
        } else {
          res.json({ message: "No changes needed" });
        }
      } else {
        // Create new abandonment tracking
        const abandonment = await storage.createCartAbandonment({
          ...data,
          sessionId,
          stage: stage || "form_started",
        });
        res.json({ message: "Cart abandonment tracked", id: abandonment.id });
      }
    } catch (error: any) {
      console.error("Cart abandonment tracking error:", error);
      res.status(500).json({ message: "Failed to track cart abandonment" });
    }
  });

  // Admin endpoint to get all cart abandonments
  app.get("/api/admin/cart-abandonments", async (req, res) => {
    try {
      const abandonments = await storage.getAllCartAbandonments();
      res.json(abandonments);
    } catch (error: any) {
      console.error("Error fetching cart abandonments:", error);
      res.status(500).json({ message: "Failed to fetch cart abandonments" });
    }
  });

  // Admin endpoint to delete cart abandonment
  app.delete("/api/admin/cart-abandonments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCartAbandonment(id);
      res.json({ message: "Cart abandonment deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting cart abandonment:", error);
      res.status(500).json({ message: "Failed to delete cart abandonment" });
    }
  });

  // Admin endpoint to cleanup old cart abandonments (older than 30 days)
  app.post("/api/admin/cart-abandonments/cleanup", async (req, res) => {
    try {
      const daysOld = req.body.daysOld || 30;
      await storage.cleanupOldCartAbandonments(daysOld);
      res.json({
        message: `Cart abandonments older than ${daysOld} days cleaned up`,
      });
    } catch (error: any) {
      console.error("Error cleaning up cart abandonments:", error);
      res.status(500).json({ message: "Failed to cleanup cart abandonments" });
    }
  });

  // Acer BBG Registration endpoints - using unified customer system
  app.post(
    "/api/acer-bbg/register",
    upload.single("invoice"),
    async (req, res) => {
      try {
        console.log("Acer BBG registration request received:");
        console.log("Body:", req.body);
        console.log("File:", req.file);
        console.log("Headers:", req.headers);

        const {
          deviceType,
          imeiSerial,
          brand,
          name,
          model,
          email,
          phone,
          pincode,
          purchasePrice,
          purchaseDate,
        } = req.body;

        // Validate required fields (address no longer required)
        if (
          !deviceType ||
          !imeiSerial ||
          !brand ||
          !name ||
          !model ||
          !email ||
          !phone ||
          !pincode ||
          !purchasePrice ||
          !purchaseDate
        ) {
          return res.status(400).json({
            success: false,
            message: "All required fields must be provided",
          });
        }

        // Validate phone number format
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid 10-digit Indian mobile number",
          });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid email address",
          });
        }

        // Validate pincode format
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(pincode)) {
          return res.status(400).json({
            success: false,
            message:
              "Please provide a valid 6-digit pincode that cannot start with 0",
          });
        }

        // Handle S3 file upload path
        let invoiceFilePath = null;
        if (req.file) {
          invoiceFilePath = (req.file as any).location || (req.file as any).key;
        }

        // Validate IMEI against Acer database
        try {
          await db.connectDB();
          const imeiRequest = db.pool.request();
          imeiRequest.input("imei", sql.VarChar, imeiSerial);

          // Production: Use actual IMEI validation
          const isTestIMEI = false;

          if (!isTestIMEI) {
            const imeiResult = await imeiRequest.query(`
            SELECT imei, model, brand FROM acer_imei_validation 
            WHERE imei = @imei
          `);

            if (imeiResult.recordset.length === 0) {
              return res.status(400).json({
                success: false,
                message:
                  "IMEI/Serial number not found in Acer database. Please verify your device IMEI.",
              });
            }
          } else {
            console.log("🧪 Using test IMEI for testing:", imeiSerial);
          }

          // Check if IMEI is already registered in customers table
          const customerImeiRequest = db.pool.request();
          customerImeiRequest.input("serialNumber", sql.VarChar, imeiSerial);

          const customerImeiResult = await customerImeiRequest.query(`
          SELECT id FROM customers WHERE serial_number = @serialNumber
        `);

          if (customerImeiResult.recordset.length > 0) {
            return res.status(400).json({
              success: false,
              message:
                "This device has already been registered. Each device can only be registered once.",
            });
          }

          console.log("✅ IMEI validation passed for:", imeiSerial);
        } catch (imeiError) {
          console.error("IMEI validation error:", imeiError);
          return res.status(500).json({
            success: false,
            message: "Unable to validate IMEI. Please try again later.",
          });
        }

        // Use the model name directly
        const finalModelName = model;

        // Find the appropriate claim value slab based on device age at purchase
        let activeClaimValueSlab;
        try {
          const purchaseDateObj = new Date(purchaseDate);
          const monthsDiff = Math.floor(
            (Date.now() - purchaseDateObj.getTime()) /
              (1000 * 60 * 60 * 24 * 30),
          );

          console.log("Finding claim value slab for Acer BBG registration:", {
            deviceType: deviceType.toLowerCase(),
            brand,
            purchaseDate: purchaseDateObj.toISOString(),
            currentAge: monthsDiff,
            registrationSource: "acer_bbg",
          });

          // 🎯 CRITICAL: Use Acer BBG-specific slabs instead of regular slabs
          const activeSlabs =
            await storage.getActiveClaimValueSlabsByDeviceTypeAndSource(
              deviceType.toLowerCase(),
              "acer_bbg",
            );

          // 🎯 Find Acer BBG-specific slab based on device age
          // Note: activeSlabs already contains only Acer BBG slabs from the new query above
          activeClaimValueSlab = activeSlabs.find(
            (slab) =>
              slab.deviceType === deviceType.toLowerCase() &&
              slab.brand === brand &&
              slab.registrationSource === "acer_bbg" &&
              monthsDiff >= slab.minMonths &&
              monthsDiff <= slab.maxMonths,
          );

          // Log the result for debugging
          if (activeClaimValueSlab) {
            console.log("✅ Found matching Acer BBG slab:", {
              id: activeClaimValueSlab.id,
              percentage: activeClaimValueSlab.percentage,
              ageRange: `${activeClaimValueSlab.minMonths}-${activeClaimValueSlab.maxMonths} months`,
              registrationSource: activeClaimValueSlab.registrationSource,
            });
          } else {
            console.log(
              "⚠️ No matching Acer BBG slab found for device age:",
              monthsDiff,
              "months",
            );
          }

          console.log(
            "Selected claim value slab for Acer registration:",
            activeClaimValueSlab,
          );
        } catch (error) {
          console.log(
            "Warning: Could not fetch active claim value slab:",
            error,
          );
          activeClaimValueSlab = null;
        }

        // Create unified customer data structure for Acer registration
        // Note: purchasePrice is already GST-excluded as per form requirement
        const customerData = {
          name,
          contact: phone,
          email,
          pincode,
          deviceType: deviceType.toLowerCase(), // Ensure lowercase for consistency
          serialNumber: imeiSerial,
          brand,
          modelName: finalModelName,
          invoiceValue: purchasePrice.toString(), // Convert to string as expected by storage
          dateOfPurchase: purchaseDate,
          sellerCode: null, // No seller code for direct Acer registrations
          isVerified: true, // Auto-verify Acer registrations
          invoiceFile: invoiceFilePath,
          registrationSource: "acer_bbg", // 🎯 CRITICAL: Mark as Acer BBG registration
          claimValueSlabId: activeClaimValueSlab?.id || null, // Track which slab was active during registration
          // Store complete slab structure from registration time (preserves entire rate structure)
          registrationSlabData: activeClaimValueSlab
            ? JSON.stringify({
                deviceType: activeClaimValueSlab.deviceType,
                brand: activeClaimValueSlab.brand,
                registrationSource: "acer_bbg",
                // 🎯 CRITICAL: Store complete Acer BBG slab structure (higher rates than regular)
                slabs:
                  await storage.getActiveClaimValueSlabsByDeviceTypeAndSource(
                    activeClaimValueSlab.deviceType,
                    "acer_bbg",
                  ),
              })
            : null,
        };

        // Use existing storage system to create customer with unified voucher code
        const customer = await storage.createCustomer(customerData);

        console.log(
          "Acer BBG customer created successfully with voucher code:",
          customer.voucherCode,
        );

        // Mark IMEI as used in Acer database
        try {
          const updateImeiRequest = db.pool.request();
          updateImeiRequest.input("imei", sql.VarChar, imeiSerial);
          updateImeiRequest.input("customerId", sql.Int, customer.id);

          await updateImeiRequest.query(`
          UPDATE acer_imei_validation 
          SET status = 'used', 
              customer_id = @customerId,
              used_at = GETDATE()
          WHERE imei = @imei
        `);

          console.log("✅ IMEI marked as used in Acer database:", imeiSerial);
        } catch (updateError) {
          console.error("Warning: Failed to update IMEI status:", updateError);
          // Don't fail registration if IMEI update fails
        }

        // Send welcome notification using unified voucher code
        try {
          console.log("🔔 Starting Acer BBG registration notifications...");
          console.log("📧 Customer contact details:", {
            name: customer.name,
            email: customer.email,
            contact: customer.contact,
          });

          const notificationResults =
            await communicationService.sendRegistrationConfirmation({
              name: customer.name,
              email: customer.email,
              contact: customer.contact,
              voucherCode: customer.voucherCode,
              deviceType: customer.deviceType,
              brand: customer.brand,
              modelName: customer.modelName,
              registrationSource: "acer_bbg",
              serialNumber: customer.serialNumber,
              devicePurchaseDate: customer.dateOfPurchase,
              bbgPurchaseDate: customer.createdAt?.toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) || new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              termsAndConditionsUrl: `${req.protocol}://${req.get('host')}/terms-and-conditions`,
            });

          console.log("🔔 Acer BBG registration notifications complete:", {
            email: notificationResults.email?.success
              ? "✅ Sent"
              : `❌ Failed: ${notificationResults.email?.error}`,
            sms: notificationResults.sms?.success
              ? "✅ Sent"
              : `❌ Failed: ${notificationResults.sms?.error}`,
            whatsapp: notificationResults.whatsapp?.success
              ? "✅ Sent"
              : `❌ Failed: ${notificationResults.whatsapp?.error}`,
          });
        } catch (notificationError) {
          console.error(
            "❌ Failed to send Acer BBG notifications:",
            notificationError.message,
          );
          console.error(
            "❌ Acer BBG notification error details:",
            notificationError,
          );
          // Don't fail the registration if notification fails
        }

        res.json({
          success: true,
          message: "Acer BBG registration completed successfully",
          registrationId: customer.voucherCode, // Return voucher code as registration ID
          voucherCode: customer.voucherCode, // Also provide as voucher code
          name,
          deviceType,
          brand,
          model: finalModelName,
          gstInclusivePrice: parseFloat(purchasePrice), // Confirm GST-inclusive price stored
        });
      } catch (error) {
        console.error("Acer BBG registration error:", error);
        res.status(500).json({
          success: false,
          message: "Registration failed. Please try again.",
          error: error.message,
        });
      }
    },
  );

  // Database Migration: Add registration_source column and create Acer BBG slabs
  app.post("/api/admin/setup-acer-bbg-slabs", async (req, res) => {
    try {
      await db.connectDB();

      // First, add registration_source column if it doesn't exist
      const checkColumnQuery = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'claim_value_slabs' 
        AND COLUMN_NAME = 'registration_source'
      `;

      const columnCheck = await db.pool.request().query(checkColumnQuery);

      if (columnCheck.recordset.length === 0) {
        const alterQuery = `
          ALTER TABLE claim_value_slabs 
          ADD registration_source NVARCHAR(50) DEFAULT 'regular'
        `;

        await db.pool.request().query(alterQuery);
        console.log("✅ registration_source column added to claim_value_slabs");
      }

      // Update all existing slabs to have 'regular' as registration_source
      const updateExistingQuery = `
        UPDATE claim_value_slabs 
        SET registration_source = 'regular'
        WHERE registration_source IS NULL
      `;

      await db.pool.request().query(updateExistingQuery);

      // Check if Acer BBG slabs already exist
      const checkAcerBBGQuery = `
        SELECT COUNT(*) as count 
        FROM claim_value_slabs 
        WHERE brand = 'Acer' AND registration_source = 'acer_bbg'
      `;

      const acerBBGCheck = await db.pool.request().query(checkAcerBBGQuery);

      if (acerBBGCheck.recordset[0].count === 0) {
        // Create Acer BBG-specific laptop slabs with different rates
        const acerBBGSlabs = [
          { minMonths: 6, maxMonths: 12, percentage: 80 }, // Higher than regular Acer (70%)
          { minMonths: 13, maxMonths: 18, percentage: 68 }, // Higher than regular Acer (58%)
          { minMonths: 19, maxMonths: 24, percentage: 58 }, // Higher than regular Acer (48%)
          { minMonths: 25, maxMonths: 30, percentage: 48 }, // Higher than regular Acer (38%)
          { minMonths: 31, maxMonths: 36, percentage: 38 }, // Higher than regular Acer (28%)
          { minMonths: 37, maxMonths: 48, percentage: 33 }, // Higher than regular Acer (23%)
          { minMonths: 49, maxMonths: 60, percentage: 28 }, // Higher than regular Acer (18%)
        ];

        for (const slab of acerBBGSlabs) {
          const insertQuery = `
            INSERT INTO claim_value_slabs 
            (device_type, brand, min_months, max_months, percentage, registration_source, is_active)
            VALUES ('laptop', 'Acer', @minMonths, @maxMonths, @percentage, 'acer_bbg', 1)
          `;

          const request = db.pool.request();
          request.input("minMonths", sql.Int, slab.minMonths);
          request.input("maxMonths", sql.Int, slab.maxMonths);
          request.input("percentage", sql.Int, slab.percentage);

          await request.query(insertQuery);
        }

        console.log("✅ Created 7 Acer BBG-specific laptop claim value slabs");
      }

      res.json({
        success: true,
        message: "Acer BBG slab system setup completed",
        details: {
          columnAdded: columnCheck.recordset.length === 0,
          acerBBGSlabsCreated: acerBBGCheck.recordset[0].count === 0,
        },
      });
    } catch (error) {
      console.error("Error setting up Acer BBG slabs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to setup Acer BBG slab system",
        error: error.message,
      });
    }
  });

  // Note: Acer BBG registrations now use the unified customer system
  // Admin can view all Acer registrations through the main customer endpoint
  // Filter by registrationSource: 'acer' to identify Acer-specific registrations

  // Document serving routes
  app.get("/api/documents/terms-and-conditions.pdf", (req, res) => {
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "documents",
        "terms-and-conditions.pdf",
      );

      if (!fs.existsSync(filePath)) {
        return res
          .status(404)
          .json({ message: "Terms and conditions document not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="XtraCover-Terms-and-Conditions.pdf"',
      );
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving terms and conditions PDF:", error);
      res.status(500).json({ message: "Error serving document" });
    }
  });

  // Customer Dashboard Routes
  app.get("/api/customer/registrations/:phone", async (req, res) => {
    try {
      const phone = req.params.phone;

      // Validate phone number format
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      await db.connectDB();
      const request = db.pool.request();
      request.input("phone", sql.VarChar, phone);

      const result = await request.query(`
        SELECT 
          id,
          voucher_code as voucherCode,
          name,
          contact,
          email,
          pincode,
          device_type as deviceType,
          serial_number as serialNumber,
          brand,
          model_name as modelName,
          invoice_value as invoiceValue,
          date_of_purchase as dateOfPurchase,
          registration_date as registrationDate,
          seller_code as sellerCode,
          registration_source as registrationSource,
          is_verified as isVerified,
          invoice_file as invoiceFile
        FROM customers 
        WHERE contact = @phone 
        ORDER BY registration_date DESC
      `);

      res.json(result.recordset);
    } catch (error) {
      console.error("Error fetching customer registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Customer Dashboard Route - Alternative endpoint for React Query
  app.get("/api/customer/registrations", async (req, res) => {
    try {
      const phone = req.query.phone as string;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Validate phone number format
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }

      await db.connectDB();
      const request = db.pool.request();
      request.input("phone", sql.VarChar, phone);

      const result = await request.query(`
        SELECT 
          id,
          voucher_code as voucherCode,
          name,
          contact,
          email,
          pincode,
          device_type as deviceType,
          serial_number as serialNumber,
          brand,
          model_name as modelName,
          invoice_value as invoiceValue,
          date_of_purchase as dateOfPurchase,
          registration_date as registrationDate,
          seller_code as sellerCode,
          registration_source as registrationSource,
          is_verified as isVerified,
          invoice_file as invoiceFile
        FROM customers 
        WHERE contact = @phone 
        ORDER BY registration_date DESC
      `);

      res.json(result.recordset);
    } catch (error) {
      console.error("Error fetching customer registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // ===== ADMIN EXPORT ROUTES =====

  // Export customers data with all details including BBG voucher codes
  app.get(
    "/api/admin/export/customers",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        await db.connectDB();
        const request = db.pool.request();

        // First test with basic columns to isolate the issue
        const result = await request.query(`
        SELECT 
          c.id,
          c.voucher_code as 'BBG Voucher Code',
          c.name as 'Customer Name',
          c.contact as 'Phone Number',
          c.email as 'Email',
          c.pincode as 'Pincode',
          c.device_type as 'Device Type',
          c.serial_number as 'Serial Number',
          c.brand as 'Brand',
          c.model_name as 'Model',
          c.invoice_value as 'Purchase Price',
          c.date_of_purchase as 'Purchase Date',
          CONVERT(varchar, c.created_at, 120) as 'Registration Date',
          c.seller_code as 'Referral Code',
          c.registration_source as 'Registration Source',
          CASE WHEN c.is_verified = 1 THEN 'Yes' ELSE 'No' END as 'Verified',
          c.payment_intent_id as 'Payment Reference',
          ISNULL(d.business_name, 'N/A') as 'Referral Partner Company',
          ISNULL(d.name, 'N/A') as 'Referral Partner Contact'
        FROM customers c
        LEFT JOIN distributors d ON c.seller_code = d.seller_code
        ORDER BY c.created_at DESC
      `);

        // Set headers for CSV download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="customers_export.csv"',
        );

        // Convert to CSV
        const customers = result.recordset;
        if (customers.length === 0) {
          return res.send("No customer data available");
        }

        const headers = Object.keys(customers[0]).filter((key) => key !== "id");
        const csvContent = [
          headers.join(","),
          ...customers.map((customer) =>
            headers
              .map((header) => {
                const value = customer[header];
                // Handle null/undefined values and escape commas
                if (value === null || value === undefined) return "";
                const stringValue = String(value);
                // Escape quotes and wrap in quotes if contains comma
                if (stringValue.includes(",") || stringValue.includes('"')) {
                  return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
              })
              .join(","),
          ),
        ].join("\n");

        res.send(csvContent);
      } catch (error: any) {
        console.error("Customer export error:", error);
        res.status(500).json({ message: "Failed to export customer data" });
      }
    },
  );

  // Export referral partners data with all details including commissions and payouts
  app.get(
    "/api/admin/export/referral-partners",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        await db.connectDB();
        const request = db.pool.request();

        const result = await request.query(`
        SELECT 
          d.id,
          d.seller_code as 'Referral Code',
          d.name as 'Partner Name',
          d.business_name as 'Business Name',
          d.contact as 'Contact Number',
          d.email as 'Email Address',
          d.pincode as 'Area Pincode',
          d.preferred_mode as 'Preferred Contact',
          d.gstin as 'GST Number',
          d.bank_account as 'Bank Account',
          d.ifsc_code as 'IFSC Code',
          d.account_holder_name as 'Account Holder',
          d.created_at as 'Registration Date',
          d.location as 'Location',
          d.pan_number as 'PAN Number',
          d.is_gst_registered as 'GST Registered',
          d.is_msme_registered as 'MSME Registered',
          d.upi_id as 'UPI ID',
          -- Customer statistics
          COALESCE(customer_stats.total_customers, 0) as 'Total Referrals',
          COALESCE(customer_stats.laptop_customers, 0) as 'Laptop Referrals',
          COALESCE(customer_stats.mobile_customers, 0) as 'Mobile Referrals',
          COALESCE(customer_stats.acer_customers, 0) as 'Acer BBG Referrals',
          -- Financial data
          COALESCE(customer_stats.total_commission, 0) as 'Total Commission Earned (₹)',
          COALESCE(customer_stats.total_invoice_value, 0) as 'Total Customer Invoice Value (₹)',
          -- Performance metrics
          CASE 
            WHEN customer_stats.total_customers > 0 
            THEN ROUND(CAST(customer_stats.total_commission as DECIMAL(10,2)) / customer_stats.total_customers, 2) 
            ELSE 0 
          END as 'Avg Commission per Customer (₹)',
          -- Recent activity
          customer_stats.latest_registration as 'Latest Customer Registration'
        FROM distributors d
        LEFT JOIN (
          SELECT 
            seller_code,
            COUNT(*) as total_customers,
            COUNT(CASE WHEN device_type = 'laptop' THEN 1 END) as laptop_customers,
            COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_customers,
            COUNT(CASE WHEN registration_source = 'acer_bbg' THEN 1 END) as acer_customers,
            SUM(CASE WHEN device_type = 'laptop' THEN 299 * 0.05 ELSE 99 * 0.05 END) as total_commission,
            SUM(CAST(invoice_value as DECIMAL(10,2))) as total_invoice_value,
            MAX(created_at) as latest_registration
          FROM customers 
          WHERE seller_code IS NOT NULL AND seller_code != ''
          GROUP BY seller_code
        ) customer_stats ON d.seller_code = customer_stats.seller_code
        ORDER BY customer_stats.total_customers DESC, d.created_at DESC
      `);

        // Set headers for CSV download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="referral_partners_comprehensive_export.csv"',
        );

        // Convert to CSV
        const partners = result.recordset;
        if (partners.length === 0) {
          return res.send("No referral partner data available");
        }

        const headers = Object.keys(partners[0]).filter((key) => key !== "id");
        const csvContent = [
          headers.join(","),
          ...partners.map((partner) =>
            headers
              .map((header) => {
                const value = partner[header];
                // Handle null/undefined values and escape commas
                if (value === null || value === undefined) return "";
                const stringValue = String(value);
                // Escape quotes and wrap in quotes if contains comma
                if (stringValue.includes(",") || stringValue.includes('"')) {
                  return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
              })
              .join(","),
          ),
        ].join("\n");

        res.send(csvContent);
      } catch (error: any) {
        console.error("Referral partner export error:", error);
        res
          .status(500)
          .json({ message: "Failed to export referral partner data" });
      }
    },
  );

  // Export commission payouts with detailed information
  app.get(
    "/api/admin/export/payouts",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        await db.connectDB();
        const request = db.pool.request();

        const result = await request.query(`
        SELECT 
          cp.id as 'Payout ID',
          cp.amount as 'Payout Amount (₹)',
          cp.status as 'Status',
          cp.payment_reference as 'Payment Reference',
          cp.created_at as 'Created Date',
          cp.paid_at as 'Paid Date',
          -- Distributor information
          d.name as 'Partner Name',
          d.contact as 'Partner Contact',
          d.email as 'Partner Email',
          d.seller_code as 'Seller Code',
          d.bank_account as 'Bank Account',
          d.ifsc_code as 'IFSC Code',
          d.account_holder_name as 'Account Holder',
          -- Customer information
          c.name as 'Customer Name',
          c.contact as 'Customer Contact',
          c.email as 'Customer Email',
          c.voucher_code as 'BBG Voucher Code',
          c.device_type as 'Device Type',
          c.brand as 'Brand',
          c.model_name as 'Model',
          c.invoice_value as 'Device Value (₹)',
          c.created_at as 'Registration Date'
        FROM commission_payouts cp
        JOIN distributors d ON cp.distributor_id = d.id
        JOIN customers c ON cp.customer_id = c.id
        ORDER BY cp.created_at DESC
      `);

        // Set headers for CSV download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="commission_payouts_export.csv"',
        );

        // Convert to CSV
        const payouts = result.recordset;
        if (payouts.length === 0) {
          return res.send("No payout data available");
        }

        const headers = Object.keys(payouts[0]);
        const csvContent = [
          headers.join(","),
          ...payouts.map((payout) =>
            headers
              .map((header) => {
                const value = payout[header];
                // Handle null/undefined values and escape commas
                if (value === null || value === undefined) return "";
                const stringValue = String(value);
                // Escape quotes and wrap in quotes if contains comma or quotes
                if (
                  stringValue.includes(",") ||
                  stringValue.includes('"') ||
                  stringValue.includes("\n")
                ) {
                  return '"' + stringValue.replace(/"/g, '""') + '"';
                }
                return stringValue;
              })
              .join(","),
          ),
        ].join("\n");

        res.send(csvContent);
      } catch (error: any) {
        console.error("Payouts export error:", error);
        res.status(500).json({ message: "Failed to export payout data" });
      }
    },
  );

  // ==============================
  // CLAIM VALUE SLABS ENDPOINTS
  // ==============================

  // Get all claim value slabs (for admin) - Using direct SQL Server connection
  app.get(
    "/api/admin/claim-value-slabs",
    isAdminAuthenticated,
    async (req, res) => {
      const { default: sql } = await import("mssql");

      // Use bbgdb database consistently
      const config = {
        server: "103.205.66.184",
        port: 2499,
        database: "bbgdb",
        user: "qo8yhe",
        password: "tFbs89!0Ryyx1^90",
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      };

      let pool: any = null;

      try {
        console.log(
          "=== Fetching claim value slabs from SQL Server (Direct Connection) ===",
        );

        pool = new sql.ConnectionPool(config);
        await pool.connect();

        const query = `
        SELECT 
          id, 
          device_type, 
          brand, 
          min_months, 
          max_months, 
          percentage, 
          is_active, 
          created_at, 
          updated_at,
          ISNULL(registration_source, 'regular') as registration_source
        FROM claim_value_slabs 
        WHERE is_active = 1
        ORDER BY device_type, ISNULL(brand, ''), min_months ASC
      `;

        const result = await pool.request().query(query);
        console.log(
          `Query successful: ${result.recordset.length} records found`,
        );

        // Map the data to match expected format
        const slabs = result.recordset.map((row: any) => ({
          id: row.id,
          deviceType: row.device_type || "mobile",
          brand: row.brand || null,
          minMonths: row.min_months,
          maxMonths: row.max_months,
          percentage: row.percentage,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at || row.created_at,
          registrationSource: row.registration_source || "regular",
        }));

        // Log summary for debugging
        const brandedSlabs = slabs.filter((s) => s.brand);
        const mobileSlabs = slabs.filter((s) => s.deviceType === "mobile");
        const laptopSlabs = slabs.filter((s) => s.deviceType === "laptop");
        const acerBbgSlabs = slabs.filter(
          (s) => s.registrationSource === "acer_bbg",
        );
        const regularSlabs = slabs.filter(
          (s) => s.registrationSource === "regular" || !s.registrationSource,
        );

        console.log(
          `✅ Successfully fetched ${slabs.length} claim value slabs:`,
        );
        console.log(`   - ${mobileSlabs.length} mobile slabs`);
        console.log(
          `   - ${laptopSlabs.length} laptop slabs (${brandedSlabs.length} brand-specific)`,
        );
        console.log(`   - ${regularSlabs.length} regular slabs`);
        console.log(`   - ${acerBbgSlabs.length} Acer BBG slabs`);

        if (brandedSlabs.length > 0) {
          const brands = [...new Set(brandedSlabs.map((s) => s.brand))];
          console.log(`   - Brands: ${brands.join(", ")}`);
        }

        // Show registration source breakdown
        const registrationSources = [
          ...new Set(slabs.map((s) => s.registrationSource)),
        ];
        console.log(
          `   - Registration sources: ${registrationSources.join(", ")}`,
        );

        if (acerBbgSlabs.length > 0) {
          console.log(
            `   - Sample Acer BBG slabs: ${acerBbgSlabs
              .slice(0, 3)
              .map(
                (s) =>
                  `${s.brand} ${s.minMonths}-${s.maxMonths}mo ${s.percentage}%`,
              )
              .join(", ")}`,
          );
        }

        res.json(slabs);
      } catch (error: any) {
        console.error("❌ SQL Server query failed:", error.message);
        res.status(500).json({
          message: "Failed to fetch claim value slabs",
          error: error.message,
          details: "SQL Server database query failed",
        });
      } finally {
        if (pool) {
          try {
            await pool.close();
            console.log("Database connection closed");
          } catch (closeError) {
            console.error("Error closing database connection:", closeError);
          }
        }
      }
    },
  );

  // Get active claim value slabs (for public use, e.g., claims form)
  app.get("/api/claim-value-slabs/active", async (req, res) => {
    try {
      const slabs = await storage.getActiveClaimValueSlabs();
      res.json(slabs);
    } catch (error: any) {
      console.error("Error fetching active claim value slabs:", error);
      res
        .status(500)
        .json({
          message: "Failed to fetch active claim value slabs",
          error: error.message,
        });
    }
  });

  // Get active claim value slabs by device type and registration source (for Acer BBG flow)
  // NOTE: This route MUST come before the deviceType-only route to avoid route conflicts
  app.get(
    "/api/claim-value-slabs/active/:deviceType/:registrationSource",
    async (req, res) => {
      try {
        const { deviceType, registrationSource } = req.params;

        // Validate device type
        if (!["mobile", "laptop"].includes(deviceType)) {
          return res
            .status(400)
            .json({
              message: "Invalid device type. Must be 'mobile' or 'laptop'",
            });
        }

        // Validate registration source
        if (!["regular", "acer_bbg"].includes(registrationSource)) {
          return res
            .status(400)
            .json({
              message:
                "Invalid registration source. Must be 'regular' or 'acer_bbg'",
            });
        }

        console.log(
          `🎯 Fetching ${registrationSource} ${deviceType} claim value slabs`,
        );
        const slabs =
          await storage.getActiveClaimValueSlabsByDeviceTypeAndSource(
            deviceType,
            registrationSource,
          );

        res.json(slabs);
      } catch (error: any) {
        console.error(
          `❌ Error fetching ${req.params.registrationSource} ${req.params.deviceType} claim value slabs:`,
          error.message,
        );
        res.status(500).json({
          message: "Failed to fetch claim value slabs",
          error: error.message,
        });
      }
    },
  );

  // Get active claim value slabs by device type (for tabbed interface) - Direct SQL query with brand data
  app.get("/api/claim-value-slabs/active/:deviceType", async (req, res) => {
    const { default: sql } = await import("mssql");

    // Direct database connection with credentials - using bbgdb
    const config = {
      server: "103.205.66.184",
      port: 2499,
      database: "bbgdb",
      user: "qo8yhe",
      password: "tFbs89!0Ryyx1^90",
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    let pool: any = null;

    try {
      const { deviceType } = req.params;

      // Validate device type
      if (!["mobile", "laptop"].includes(deviceType)) {
        return res
          .status(400)
          .json({
            message: "Invalid device type. Must be 'mobile' or 'laptop'",
          });
      }

      console.log(
        `=== Connecting to SQL Server for ${deviceType} claim value slabs ===`,
      );
      pool = new sql.ConnectionPool(config);
      await pool.connect();

      const query = `
        SELECT 
          id, 
          device_type, 
          brand, 
          min_months, 
          max_months, 
          percentage, 
          is_active, 
          registration_source,
          created_at, 
          updated_at
        FROM claim_value_slabs 
        WHERE device_type = @deviceType AND is_active = 1
        ORDER BY brand, registration_source, min_months ASC
      `;

      console.log(`Executing ${deviceType} query:`, query);
      const request = pool.request();
      request.input("deviceType", sql.NVarChar, deviceType);
      const result = await request.query(query);
      console.log(
        `Query successful: ${result.recordset.length} ${deviceType} records found`,
      );

      // Map the data to match expected format
      const slabs = result.recordset.map((row: any) => ({
        id: row.id,
        deviceType: row.device_type || deviceType,
        brand: row.brand || null,
        minMonths: row.min_months,
        maxMonths: row.max_months,
        percentage: row.percentage,
        isActive: row.is_active,
        registrationSource: row.registration_source || "regular",
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at,
      }));

      // Log summary for debugging
      const brandedSlabs = slabs.filter((s) => s.brand);
      console.log(
        `✅ Successfully fetched ${slabs.length} ${deviceType} claim value slabs (${brandedSlabs.length} brand-specific)`,
      );

      if (brandedSlabs.length > 0) {
        const brands = [...new Set(brandedSlabs.map((s) => s.brand))];
        console.log(`   - Brands: ${brands.join(", ")}`);
      }

      res.json(slabs);
    } catch (error: any) {
      console.error(
        `❌ Error fetching ${req.params.deviceType} claim value slabs:`,
        error.message,
      );
      res
        .status(500)
        .json({
          message: "Failed to fetch active claim value slabs",
          error: error.message,
        });
    } finally {
      if (pool) {
        try {
          await pool.close();
        } catch (closeError) {
          console.error("Error closing database connection:", closeError);
        }
      }
    }
  });

  // Create new claim value slab
  app.post(
    "/api/admin/claim-value-slabs",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const {
          deviceType,
          brand,
          minMonths,
          maxMonths,
          percentage,
          isActive,
        } = req.body;

        // Validate required fields
        if (!deviceType || !minMonths || !maxMonths || !percentage) {
          return res
            .status(400)
            .json({
              message:
                "Missing required fields: deviceType, minMonths, maxMonths, percentage",
            });
        }

        // Validate device type
        if (!["mobile", "laptop"].includes(deviceType)) {
          return res
            .status(400)
            .json({
              message: "Invalid device type. Must be 'mobile' or 'laptop'",
            });
        }

        // Validate ranges
        if (minMonths >= maxMonths) {
          return res
            .status(400)
            .json({ message: "minMonths must be less than maxMonths" });
        }

        if (percentage < 0 || percentage > 100) {
          return res
            .status(400)
            .json({ message: "Percentage must be between 0 and 100" });
        }

        const slab = await storage.createClaimValueSlab({
          deviceType,
          brand: brand || null,
          minMonths: parseInt(minMonths),
          maxMonths: parseInt(maxMonths),
          percentage: parseInt(percentage),
          isActive: isActive !== false, // Default to true if not specified
        });

        res.json(slab);
      } catch (error: any) {
        console.error("Error creating claim value slab:", error);
        res
          .status(500)
          .json({
            message: "Failed to create claim value slab",
            error: error.message,
          });
      }
    },
  );

  // Update claim value slab
  app.patch(
    "/api/admin/claim-value-slabs/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);

        const {
          deviceType,
          brand,
          minMonths,
          maxMonths,
          percentage,
          isActive,
        } = req.body;

        const updates: any = {};

        if (deviceType !== undefined) {
          if (!["mobile", "laptop"].includes(deviceType)) {
            return res
              .status(400)
              .json({
                message: "Invalid device type. Must be 'mobile' or 'laptop'",
              });
          }
          updates.deviceType = deviceType;
        }
        if (brand !== undefined) {
          updates.brand = brand || null;
        }
        if (minMonths !== undefined) updates.minMonths = parseInt(minMonths);
        if (maxMonths !== undefined) updates.maxMonths = parseInt(maxMonths);
        if (percentage !== undefined) {
          if (percentage < 0 || percentage > 100) {
            return res
              .status(400)
              .json({ message: "Percentage must be between 0 and 100" });
          }
          updates.percentage = parseInt(percentage);
        }
        if (isActive !== undefined) updates.isActive = isActive;

        // Validate ranges if both are being updated
        if (
          updates.minMonths &&
          updates.maxMonths &&
          updates.minMonths >= updates.maxMonths
        ) {
          return res
            .status(400)
            .json({ message: "minMonths must be less than maxMonths" });
        }

        const updatedSlab = await storage.updateClaimValueSlab(id, updates);
        if (!updatedSlab) {
          return res
            .status(404)
            .json({ message: "Claim value slab not found" });
        }
        res.json(updatedSlab);
      } catch (error: any) {
        console.error("Error updating claim value slab:", error);
        res
          .status(500)
          .json({
            message: "Failed to update claim value slab",
            error: error.message,
          });
      }
    },
  );

  // Update claim value slab (PUT method for frontend compatibility)
  app.put(
    "/api/admin/claim-value-slabs/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        console.log(`=== PUT request to update claim value slab ID: ${id} ===`);
        console.log("Request body:", req.body);

        const {
          deviceType,
          brand,
          minMonths,
          maxMonths,
          percentage,
          isActive,
        } = req.body;

        const updates: any = {};

        if (deviceType !== undefined) {
          if (!["mobile", "laptop"].includes(deviceType)) {
            return res
              .status(400)
              .json({
                message: "Invalid device type. Must be 'mobile' or 'laptop'",
              });
          }
          updates.deviceType = deviceType;
        }
        if (brand !== undefined) {
          updates.brand = brand || null;
        }
        if (minMonths !== undefined) updates.minMonths = parseInt(minMonths);
        if (maxMonths !== undefined) updates.maxMonths = parseInt(maxMonths);
        if (percentage !== undefined) {
          if (percentage < 0 || percentage > 100) {
            return res
              .status(400)
              .json({ message: "Percentage must be between 0 and 100" });
          }
          updates.percentage = parseInt(percentage);
        }
        if (isActive !== undefined) updates.isActive = isActive;

        // Validate ranges if both are being updated
        if (
          updates.minMonths &&
          updates.maxMonths &&
          updates.minMonths >= updates.maxMonths
        ) {
          return res
            .status(400)
            .json({ message: "minMonths must be less than maxMonths" });
        }

        console.log("Updates to apply:", updates);
        const updatedSlab = await storage.updateClaimValueSlab(id, updates);
        if (!updatedSlab) {
          return res
            .status(404)
            .json({ message: "Claim value slab not found" });
        }

        console.log("✅ Successfully updated claim value slab:", updatedSlab);
        res.json(updatedSlab);
      } catch (error: any) {
        console.error("❌ Error updating claim value slab:", error);
        res
          .status(500)
          .json({
            message: "Failed to update claim value slab",
            error: error.message,
          });
      }
    },
  );

  // Excel Template Download
  app.get(
    "/api/admin/claim-value-slabs/excel-template",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        // Get all current slabs for the template
        const slabs = await storage.getAllClaimValueSlabs();

        // Create worksheet data with proper headers
        const worksheetData = [
          [
            "ID",
            "Device Type",
            "Brand",
            "Min Months",
            "Max Months",
            "Percentage",
            "Is Active",
            "Instructions",
          ],
          [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "Leave ID empty for new records. Existing records (with ID) will be updated.",
          ],
          ["", "laptop", "HP", "6", "12", "60", "TRUE", ""],
          ["", "laptop", "Lenovo", "6", "12", "65", "TRUE", ""],
          ["", "mobile", "Samsung", "6", "12", "70", "TRUE", ""],
          [
            "",
            "mobile",
            "",
            "6",
            "12",
            "50",
            "TRUE",
            "Generic slab (no brand specified)",
          ],
        ];

        // Add existing data to template
        slabs.forEach((slab) => {
          worksheetData.push([
            slab.id.toString(),
            slab.deviceType,
            slab.brand || "",
            slab.minMonths.toString(),
            slab.maxMonths.toString(),
            slab.percentage.toString(),
            slab.isActive ? "TRUE" : "FALSE",
            "Existing record",
          ]);
        });

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        worksheet["!cols"] = [
          { wch: 8 }, // ID
          { wch: 12 }, // Device Type
          { wch: 12 }, // Brand
          { wch: 12 }, // Min Months
          { wch: 12 }, // Max Months
          { wch: 12 }, // Percentage
          { wch: 10 }, // Is Active
          { wch: 25 }, // Instructions
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Claim Value Slabs");

        // Generate buffer
        const buffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

        res.setHeader(
          "Content-Disposition",
          'attachment; filename="claim-value-slabs-template.xlsx"',
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.send(buffer);
      } catch (error: any) {
        console.error("Error generating Excel template:", error);
        res
          .status(500)
          .json({
            message: "Failed to generate Excel template",
            error: error.message,
          });
      }
    },
  );

  // Excel Upload and Process
  app.post(
    "/api/admin/claim-value-slabs/excel-upload",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const excelUpload = createS3Upload("bulk-uploads");

        // Handle file upload
        excelUpload.single("excel")(req, res, async (err: any) => {
          if (err) {
            return res
              .status(400)
              .json({ message: "File upload failed", error: err.message });
          }

          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }

          try {
            // Download and read the Excel file from S3
            const s3Key = (req.file as any).key;
            const signedUrl = await s3Service.getSignedUrl(s3Key);

            // Download file content
            const response = await fetch(signedUrl);
            const buffer = await response.arrayBuffer();

            // Read the Excel file from buffer
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON (skip first 2 rows as they are headers and examples)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: 2,
            });

            let totalProcessed = 0;
            let created = 0;
            let updated = 0;
            let errors = 0;
            let skipped = 0;
            const errorMessages: string[] = [];

            // Process each row
            for (let i = 0; i < jsonData.length; i++) {
              const row = jsonData[i] as any[];
              if (!row || row.length < 5) {
                skipped++;
                continue;
              }

              const [
                id,
                deviceType,
                brand,
                minMonths,
                maxMonths,
                percentage,
                isActive,
              ] = row;

              // Skip empty rows
              if (!deviceType || !minMonths || !maxMonths || !percentage) {
                skipped++;
                continue;
              }

              try {
                // Validate data
                if (!["laptop", "mobile"].includes(deviceType?.toLowerCase())) {
                  errors++;
                  errorMessages.push(
                    `Row ${i + 3}: Invalid device type '${deviceType}'. Must be 'laptop' or 'mobile'.`,
                  );
                  continue;
                }

                const minMonthsNum = parseInt(minMonths);
                const maxMonthsNum = parseInt(maxMonths);
                const percentageNum = parseInt(percentage);

                if (
                  isNaN(minMonthsNum) ||
                  isNaN(maxMonthsNum) ||
                  isNaN(percentageNum)
                ) {
                  errors++;
                  errorMessages.push(
                    `Row ${i + 3}: Invalid numeric values for months or percentage.`,
                  );
                  continue;
                }

                if (minMonthsNum >= maxMonthsNum) {
                  errors++;
                  errorMessages.push(
                    `Row ${i + 3}: Min months must be less than max months.`,
                  );
                  continue;
                }

                if (percentageNum < 0 || percentageNum > 100) {
                  errors++;
                  errorMessages.push(
                    `Row ${i + 3}: Percentage must be between 0 and 100.`,
                  );
                  continue;
                }

                const slabData = {
                  deviceType: deviceType.toLowerCase(),
                  brand: brand?.trim() || null,
                  minMonths: minMonthsNum,
                  maxMonths: maxMonthsNum,
                  percentage: percentageNum,
                  isActive: isActive?.toString().toUpperCase() === "TRUE",
                };

                // Check if this is an update (has ID) or create (no ID)
                if (id && !isNaN(parseInt(id))) {
                  // Update existing record
                  const existingSlab = await storage.getClaimValueSlabById(
                    parseInt(id),
                  );
                  if (existingSlab) {
                    await storage.updateClaimValueSlab(parseInt(id), slabData);
                    updated++;
                  } else {
                    // ID provided but record doesn't exist - create new
                    await storage.createClaimValueSlab(slabData);
                    created++;
                  }
                } else {
                  // Create new record
                  await storage.createClaimValueSlab(slabData);
                  created++;
                }

                totalProcessed++;
              } catch (rowError: any) {
                errors++;
                errorMessages.push(`Row ${i + 3}: ${rowError.message}`);
              }
            }

            // S3 files are automatically managed, no cleanup needed

            res.json({
              totalProcessed,
              created,
              updated,
              errors,
              skipped,
              errorMessages: errorMessages.slice(0, 10), // Limit to first 10 errors
            });
          } catch (fileError: any) {
            // S3 files are automatically managed, no cleanup needed

            console.error("Error processing Excel file:", fileError);
            res.status(400).json({
              message: "Failed to process Excel file",
              error: fileError.message,
            });
          }
        });
      } catch (error: any) {
        console.error("Error in Excel upload endpoint:", error);
        res
          .status(500)
          .json({ message: "Excel upload failed", error: error.message });
      }
    },
  );

  // Delete claim value slab (soft delete - set isActive to false)
  app.delete(
    "/api/admin/claim-value-slabs/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const deleted = await storage.deleteClaimValueSlab(id);
        if (!deleted) {
          return res
            .status(404)
            .json({ message: "Claim value slab not found" });
        }
        res.json({ message: "Claim value slab deleted successfully" });
      } catch (error: any) {
        console.error("Error deleting claim value slab:", error);
        res
          .status(500)
          .json({
            message: "Failed to delete claim value slab",
            error: error.message,
          });
      }
    },
  );

  // Fix existing customers with incorrect claimValueSlabId
  app.post(
    "/api/admin/fix-customer-slabs",
    isAdminAuthenticated,
    async (req, res) => {
      const { default: sql } = await import("mssql");

      try {
        const config = {
          server: "103.205.66.184",
          port: 1433,
          database: "bbgdb",
          user: "bbg_user",
          password: "Bbg@2024",
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
          },
          requestTimeout: 30000,
          connectionTimeout: 30000,
        };

        const pool = new sql.ConnectionPool(config);
        await pool.connect();

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
        console.log(
          `Found ${customers.length} customers with missing/invalid slab IDs`,
        );

        // Get all active claim value slabs
        const slabsRequest = pool.request();
        const slabsResult = await slabsRequest.query(`
        SELECT id, device_type, brand, min_months, max_months, percentage
        FROM claim_value_slabs 
        WHERE is_active = 1
        ORDER BY brand, min_months ASC
      `);

        const activeSlabs = slabsResult.recordset;
        const updatedCustomers = [];
        const failedUpdates = [];

        for (const customer of customers) {
          try {
            const purchaseDate = new Date(customer.date_of_purchase);
            const monthsDiff = Math.floor(
              (Date.now() - purchaseDate.getTime()) /
                (1000 * 60 * 60 * 24 * 30),
            );

            // Find brand-specific slab first
            let matchingSlab = activeSlabs.find(
              (slab) =>
                slab.device_type === customer.device_type &&
                slab.brand === customer.brand &&
                monthsDiff >= slab.min_months &&
                monthsDiff <= slab.max_months,
            );

            // If no brand-specific slab, try generic slab
            if (!matchingSlab) {
              matchingSlab = activeSlabs.find(
                (slab) =>
                  slab.device_type === customer.device_type &&
                  !slab.brand &&
                  monthsDiff >= slab.min_months &&
                  monthsDiff <= slab.max_months,
              );
            }

            if (matchingSlab) {
              // Update customer with correct slab ID
              const updateRequest = pool.request();
              updateRequest.input("slabId", sql.Int, matchingSlab.id);
              updateRequest.input("customerId", sql.Int, customer.id);

              await updateRequest.query(`
              UPDATE customers 
              SET claim_value_slab_id = @slabId, updated_at = GETDATE()
              WHERE id = @customerId
            `);

              updatedCustomers.push({
                customerId: customer.id,
                voucherCode: customer.voucher_code,
                brand: customer.brand,
                deviceType: customer.device_type,
                monthsOld: monthsDiff,
                oldSlabId: customer.claim_value_slab_id,
                newSlabId: matchingSlab.id,
                percentage: matchingSlab.percentage,
              });

              console.log(
                `✅ Updated customer ${customer.voucher_code} (${customer.brand} ${customer.device_type}, ${monthsDiff}mo) with slab ID ${matchingSlab.id} (${matchingSlab.percentage}%)`,
              );
            } else {
              failedUpdates.push({
                customerId: customer.id,
                voucherCode: customer.voucher_code,
                brand: customer.brand,
                deviceType: customer.device_type,
                monthsOld: monthsDiff,
                reason: "No matching slab found",
              });

              console.log(
                `❌ No matching slab found for customer ${customer.voucher_code} (${customer.brand} ${customer.device_type}, ${monthsDiff}mo)`,
              );
            }
          } catch (customerError) {
            console.error(
              `Error processing customer ${customer.id}:`,
              customerError,
            );
            failedUpdates.push({
              customerId: customer.id,
              voucherCode: customer.voucher_code,
              reason: customerError.message,
            });
          }
        }

        await pool.close();

        res.json({
          success: true,
          message: `Customer slab IDs updated successfully`,
          summary: {
            totalCustomers: customers.length,
            updated: updatedCustomers.length,
            failed: failedUpdates.length,
          },
          updatedCustomers,
          failedUpdates,
        });
      } catch (error: any) {
        console.error("Error fixing customer slabs:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fix customer slabs",
          error: error.message,
        });
      }
    },
  );

  // Quick utility to update a specific customer's slab ID (for testing)
  app.post(
    "/api/admin/update-customer-slab",
    isAdminAuthenticated,
    async (req, res) => {
      const { default: sql } = await import("mssql");

      try {
        const { customerId, newSlabId } = req.body;

        if (!customerId || !newSlabId) {
          return res
            .status(400)
            .json({ message: "customerId and newSlabId are required" });
        }

        const config = {
          server: "103.205.66.184",
          port: 1433,
          database: "bbgdb",
          user: "bbg_user",
          password: "Bbg@2024",
          options: {
            encrypt: false,
            trustServerCertificate: true,
          },
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
          },
          requestTimeout: 30000,
          connectionTimeout: 30000,
        };

        const pool = new sql.ConnectionPool(config);
        await pool.connect();

        // Update the customer's slab ID
        const updateRequest = pool.request();
        updateRequest.input("slabId", sql.Int, newSlabId);
        updateRequest.input("customerId", sql.Int, customerId);

        await updateRequest.query(`
        UPDATE customers 
        SET claim_value_slab_id = @slabId, updated_at = GETDATE()
        WHERE id = @customerId
      `);

        await pool.close();

        res.json({
          success: true,
          message: `Customer ${customerId} updated with slab ID ${newSlabId}`,
        });
      } catch (error: any) {
        console.error("Error updating customer slab:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update customer slab",
          error: error.message,
        });
      }
    },
  );

  // Get claim percentage for specific device age or date of purchase
  app.post("/api/claims/calculate-percentage", async (req, res) => {
    try {
      let {
        deviceAgeMonths,
        dateOfPurchase,
        deviceType = "mobile",
        brandName = null,
      } = req.body;

      // If dateOfPurchase is provided but deviceAgeMonths is not, calculate age
      if (dateOfPurchase && !deviceAgeMonths) {
        const purchaseDate = new Date(dateOfPurchase);
        const currentDate = new Date();
        deviceAgeMonths = Math.floor(
          (currentDate.getTime() - purchaseDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30.44),
        );
      }

      if (!deviceAgeMonths || deviceAgeMonths < 0) {
        return res
          .status(400)
          .json({ message: "Invalid device age or date of purchase" });
      }

      // Get brand-aware claim percentage from database
      const activeSlabs = await storage.getActiveClaimValueSlabs();
      let applicableSlab = null;

      // First try to find brand-specific slab for laptops
      if (brandName && deviceType === "laptop") {
        applicableSlab = activeSlabs.find(
          (slab) =>
            slab.deviceType === deviceType &&
            slab.brand === brandName &&
            deviceAgeMonths >= slab.minMonths &&
            deviceAgeMonths <= slab.maxMonths,
        );
      }

      // If no brand-specific slab found, fall back to generic slab
      if (!applicableSlab) {
        applicableSlab = activeSlabs.find(
          (slab) =>
            slab.deviceType === deviceType &&
            !slab.brand && // Generic slab (no brand)
            deviceAgeMonths >= slab.minMonths &&
            deviceAgeMonths <= slab.maxMonths,
        );
      }

      if (!applicableSlab) {
        return res.status(400).json({
          message: "Device too old for BBG claim. Maximum age is 5 years.",
          deviceAgeMonths,
        });
      }

      res.json({
        deviceAgeMonths,
        percentage: applicableSlab.percentage,
        slab: applicableSlab,
        usedBrandSpecific: !!applicableSlab.brand,
      });
    } catch (error: any) {
      console.error("Error calculating claim percentage:", error);
      res
        .status(500)
        .json({
          message: "Failed to calculate claim percentage",
          error: error.message,
        });
    }
  });

  // Add registration slab columns to customers table
  app.post(
    "/api/admin/add-registration-slab-columns",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        await db.connectDB();

        // Check and add registration_slab_data column (new approach - complete slab structure)
        const checkSlabDataResult = await db.pool.request().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'registration_slab_data'
      `);

        if (checkSlabDataResult.recordset.length === 0) {
          await db.pool.request().query(`
          ALTER TABLE customers ADD registration_slab_data NVARCHAR(MAX) NULL
        `);
          console.log("✅ Added registration_slab_data column");
        } else {
          console.log("ℹ️ registration_slab_data column already exists");
        }

        // Backfill existing customers with their slab values
        console.log(
          "📋 Backfilling existing customers with their slab values...",
        );

        // First, let's see what customers we have (all customers)
        const allCustomersResult = await db.pool.request().query(`
        SELECT id, name, voucher_code, device_type, brand, date_of_purchase, claim_value_slab_id, registration_slab_data
        FROM customers 
        ORDER BY created_at DESC
      `);

        console.log("All customers:", allCustomersResult.recordset.length);

        // Check which customers have slab IDs
        const customersWithSlabId = allCustomersResult.recordset.filter(
          (c) => c.claim_value_slab_id,
        );
        console.log(
          "Customers with claim_value_slab_id:",
          customersWithSlabId.length,
        );

        // For ALL customers, create complete slab data structure from registration time
        let processedCustomers = 0;
        const sqlStorage = new SqlServerStorage();

        for (const customer of allCustomersResult.recordset) {
          if (
            customer.device_type &&
            customer.brand &&
            customer.date_of_purchase
          ) {
            try {
              // Calculate device age at registration time (not current time)
              const purchaseDate = new Date(customer.date_of_purchase);
              const currentDate = new Date();
              let monthsDiff =
                (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12;
              monthsDiff += currentDate.getMonth() - purchaseDate.getMonth();
              if (currentDate.getDate() < purchaseDate.getDate()) {
                monthsDiff--;
              }

              // Find what the correct slab should be for this customer
              const correctSlabResult = await db.pool.request().query(`
              SELECT id, percentage, min_months, max_months, device_type, brand
              FROM claim_value_slabs 
              WHERE device_type = '${customer.device_type}' 
                AND brand = '${customer.brand}' 
                AND is_active = 1
                AND ${monthsDiff} >= min_months 
                AND ${monthsDiff} <= max_months
              ORDER BY min_months ASC
            `);

              if (correctSlabResult.recordset.length > 0) {
                const correctSlab = correctSlabResult.recordset[0];

                // Get ALL slab structures for this device type and brand (complete structure)
                const allSlabsForDevice =
                  await sqlStorage.getActiveClaimValueSlabsByDeviceBrand(
                    customer.device_type,
                    customer.brand,
                  );

                // Create complete slab structure that preserves the entire age range system
                const completeSlabData = {
                  deviceType: customer.device_type,
                  brand: customer.brand,
                  slabs: allSlabsForDevice.map((slab) => ({
                    id: slab.id,
                    minMonths: slab.minMonths,
                    maxMonths: slab.maxMonths,
                    percentage: slab.percentage,
                  })),
                  registrationAge: Math.floor(
                    (Date.now() -
                      new Date(customer.date_of_purchase).getTime()) /
                      (1000 * 60 * 60 * 24 * 30),
                  ), // Age at time of registration
                  applicableSlabId: correctSlab.id, // Which slab applied at registration
                };

                // Check if customer needs correction or complete slab data
                let needsUpdate = false;
                let updateReason = "";

                if (!customer.claim_value_slab_id) {
                  needsUpdate = true;
                  updateReason = "no slab assigned";
                } else if (customer.claim_value_slab_id !== correctSlab.id) {
                  // Verify current assignment is wrong
                  const currentSlabResult = await db.pool.request().query(`
                  SELECT device_type, brand FROM claim_value_slabs WHERE id = ${customer.claim_value_slab_id}
                `);

                  if (currentSlabResult.recordset.length === 0) {
                    needsUpdate = true;
                    updateReason = "assigned slab does not exist";
                  } else {
                    const currentSlab = currentSlabResult.recordset[0];
                    if (
                      currentSlab.device_type !== customer.device_type ||
                      currentSlab.brand !== customer.brand
                    ) {
                      needsUpdate = true;
                      updateReason = `wrong device/brand assignment (assigned: ${currentSlab.device_type} ${currentSlab.brand}, should be: ${customer.device_type} ${customer.brand})`;
                    }
                  }
                } else if (!customer.registration_slab_data) {
                  needsUpdate = true;
                  updateReason = "missing complete slab data structure";
                }

                if (needsUpdate) {
                  // Update customer with complete slab data structure
                  const updateRequest = db.pool.request();
                  updateRequest.input(
                    "slabData",
                    sql.NVarChar,
                    JSON.stringify(completeSlabData),
                  );
                  updateRequest.input("customerId", sql.Int, customer.id);
                  updateRequest.input("slabId", sql.Int, correctSlab.id);

                  await updateRequest.query(`
                  UPDATE customers 
                  SET 
                    claim_value_slab_id = @slabId,
                    registration_slab_data = @slabData
                  WHERE id = @customerId
                `);

                  console.log(
                    `🔧 FIXED customer ${customer.name} (${customer.device_type} ${customer.brand}): ${updateReason} → complete slab structure with ${allSlabsForDevice.length} age ranges`,
                  );
                  processedCustomers++;
                }
              } else {
                console.log(
                  `⚠️ No matching slab found for customer ${customer.name} (${customer.device_type} ${customer.brand}, ${monthsDiff} months old)`,
                );
              }
            } catch (error) {
              console.log(
                `❌ Could not process customer ${customer.name}:`,
                error.message,
              );
            }
          }
        }

        console.log(
          `✅ Processed ${processedCustomers} customers with complete slab data structures`,
        );

        const backfillResult = await db.pool.request().query(`
        UPDATE customers 
        SET 
          registration_slab_percentage = claim_value_slabs.percentage,
          registration_slab_range = CONCAT(claim_value_slabs.min_months, '-', claim_value_slabs.max_months, ' months')
        FROM customers 
        INNER JOIN claim_value_slabs ON customers.claim_value_slab_id = claim_value_slabs.id
        WHERE customers.claim_value_slab_id IS NOT NULL 
          AND (customers.registration_slab_percentage IS NULL OR customers.registration_slab_range IS NULL)
      `);

        console.log(
          `✅ Backfilled ${backfillResult.rowsAffected[0]} customers with slab values`,
        );

        res.json({
          success: true,
          message:
            "Registration slab columns added and backfilled successfully",
          backfilledCustomers: backfillResult.rowsAffected[0],
        });
      } catch (error: any) {
        console.error("Error adding registration slab columns:", error);
        res.status(500).json({
          success: false,
          message: "Failed to add registration slab columns",
          error: error.message,
        });
      }
    },
  );

  // ===== ADMIN MENU ORDER MANAGEMENT ROUTES =====

  // Initialize menu_settings table
  async function initializeMenuSettingsTable() {
    try {
      console.log("🔥 ENSURING MENU_SETTINGS TABLE EXISTS IN DATABASE...");

      await db.connectDB(); // Ensure connection

      // Check if menu_settings table exists
      const tableCheck = await db.pool.request().query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'menu_settings'
      `);

      if (tableCheck.recordset[0].count === 0) {
        // Create menu_settings table
        await db.pool.request().query(`
          CREATE TABLE menu_settings (
            id INT IDENTITY(1,1) PRIMARY KEY,
            menu_data NVARCHAR(MAX) NOT NULL,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          )
        `);
        console.log("✅ MENU_SETTINGS TABLE CREATED SUCCESSFULLY");
      } else {
        console.log("✅ MENU_SETTINGS TABLE ALREADY EXISTS");
      }
    } catch (error) {
      console.error("❌ Error initializing menu_settings table:", error);
    }
  }

  // Initialize the table
  await initializeMenuSettingsTable();

  // Get admin menu order
  app.get("/api/admin/menu-order", isAdminAuthenticated, async (req, res) => {
    try {
      // Default menu order
      const defaultMenuOrder = [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: "BarChart3",
          order: 1,
          type: "item",
          parentId: null,
        },
        {
          id: "customer-registrations",
          label: "Customer Registrations",
          href: "/admin/customer-registrations",
          icon: "Users",
          order: 2,
          type: "item",
          parentId: null,
        },
        {
          id: "masters",
          label: "Masters",
          href: "/admin/masters",
          icon: "Database",
          order: 2,
          type: "item",
          parentId: null,
        },
        {
          id: "brands",
          label: "Brands",
          href: "/admin/brands",
          icon: "Tags",
          order: 3,
          type: "item",
          parentId: null,
        },
        {
          id: "distributors",
          label: "Referral Partners",
          href: "/admin/distributors",
          icon: "Users",
          order: 4,
          type: "item",
          parentId: null,
        },
        {
          id: "cart",
          label: "Cart Tracking",
          href: "/admin/cart-abandonments",
          icon: "ShoppingCart",
          order: 5,
          type: "item",
          parentId: null,
        },
        {
          id: "acer-reg",
          label: "Acer Registrations",
          href: "/admin/acer-registrations",
          icon: "Laptop",
          order: 6,
          type: "item",
          parentId: null,
        },
        {
          id: "acer-imei",
          label: "Acer IMEI Management",
          href: "/admin/acer-imei",
          icon: "Shield",
          order: 7,
          type: "item",
          parentId: null,
        },
        {
          id: "claim-slabs",
          label: "Claim Value Slabs",
          href: "/admin/claim-value-slabs",
          icon: "Calculator",
          order: 8,
          type: "item",
          parentId: null,
        },
        {
          id: "bbg-settings",
          label: "BBG Price Settings",
          href: "/admin/bbg-settings",
          icon: "Settings",
          order: 9,
          type: "item",
          parentId: null,
        },
        {
          id: "referral-discount-settings",
          label: "Referral Discount Settings",
          href: "/admin/referral-discount-settings",
          icon: "Percent",
          order: 9.5,
          type: "item",
          parentId: null,
        },
        {
          id: "waiting-period",
          label: "Waiting Period Settings",
          href: "/admin/waiting-period-settings",
          icon: "Clock",
          order: 10,
          type: "item",
          parentId: null,
        },
        {
          id: "smtp",
          label: "SMTP Settings",
          href: "/admin/smtp-settings",
          icon: "Mail",
          order: 11,
          type: "item",
          parentId: null,
        },
        {
          id: "whatsapp",
          label: "WhatsApp Settings",
          href: "/admin/whatsapp-settings",
          icon: "MessageCircle",
          order: 12,
          type: "item",
          parentId: null,
        },
        {
          id: "communication",
          label: "Communication",
          href: "/admin/templates",
          icon: "MessageSquare",
          order: 13,
          type: "item",
          parentId: null,
        },
        {
          id: "menu-settings",
          label: "Menu Settings",
          href: "/admin/menu-settings",
          icon: "Settings",
          order: 14,
          type: "item",
          parentId: null,
        },
        {
          id: "logs",
          label: "System Logs",
          href: "/admin/logs",
          icon: "Activity",
          order: 15,
          type: "item",
          parentId: null,
        },
        {
          id: "whatsapp-test",
          label: "WhatsApp Test",
          href: "/admin/whatsapp-test",
          icon: "MessageCircle",
          order: 16,
          type: "item",
          parentId: null,
        },
        {
          id: "homepage-banners",
          label: "Homepage Banners",
          href: "/admin/homepage-banners",
          icon: "Monitor",
          order: 17,
          type: "item",
          parentId: null,
        },
        {
          id: "transaction-history",
          label: "Transaction History",
          href: "/admin/transaction-history",
          icon: "Receipt",
          order: 18,
          type: "item",
          parentId: null,
        },
      ];

      // Try to get saved menu order from database
      const savedMenuResult = await db.pool.request().query(`
        SELECT TOP 1 menu_data 
        FROM menu_settings 
        ORDER BY id DESC
      `);

      let menuToReturn = defaultMenuOrder;

      // TEMPORARILY FORCE DEFAULT MENU - ignore saved menu for now
      console.log("🔄 FORCING DEFAULT MENU ORDER - including Referral Discount Settings and Transaction History");
      menuToReturn = defaultMenuOrder;

      console.log(
        "Returning menu order:",
        menuToReturn.map((item: any) => `${item.order}. ${item.label}`),
      );

      res.json({ menuItems: menuToReturn });
    } catch (error: any) {
      console.error("Error fetching menu order:", error);
      res.status(500).json({ message: "Failed to fetch menu order" });
    }
  });

  // Save admin menu order
  app.post("/api/admin/menu-order", isAdminAuthenticated, async (req, res) => {
    try {
      const { menuItems } = req.body;

      if (!menuItems || !Array.isArray(menuItems)) {
        return res.status(400).json({ message: "Invalid menu items data" });
      }

      // Save to database
      await db.pool
        .request()
        .input("menuData", sql.NVarChar(sql.MAX), JSON.stringify(menuItems))
        .query(`
          INSERT INTO menu_settings (menu_data) 
          VALUES (@menuData)
        `);

      console.log(
        "💾 Menu order saved to database:",
        menuItems.map((item: any) => `${item.order}. ${item.label}`),
      );

      res.json({
        success: true,
        message: "Menu order saved successfully",
        menuItems,
      });
    } catch (error: any) {
      console.error("Error saving menu order:", error);
      res.status(500).json({ message: "Failed to save menu order" });
    }
  });

  // Reset admin menu order to default
  app.post(
    "/api/admin/menu-order/reset",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        // Clear all saved menu order data from database
        await db.pool.request().query(`DELETE FROM menu_settings`);

        console.log("🔄 Menu order reset to default - database cleared");

        res.json({
          success: true,
          message: "Menu order reset to default successfully",
        });
      } catch (error: any) {
        console.error("Error resetting menu order:", error);
        res.status(500).json({ message: "Failed to reset menu order" });
      }
    },
  );

  // ===== PUBLIC API ROUTES =====

  // Public endpoint for frontend registration form data
  app.get("/api/data", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      const activeBrands = brands.filter((brand) => brand.isActive);

      res.json({
        brands: activeBrands,
        message: "Form data loaded successfully",
      });
    } catch (error: any) {
      console.error("Error fetching form data:", error);
      res.status(500).json({
        message: "Failed to load form data",
        error: error.message,
      });
    }
  });

  // Public endpoint for BBG prices (used in customer registration)
  app.get("/api/bbg-prices", async (req, res) => {
    try {
      const referralCode = req.query.referralCode as string;
      const priceSettings = await storage.getBbgPriceSettings();

      // Return default prices if no settings found
      const prices = priceSettings || {
        laptopPrice: 299,
        mobilePrice: 99,
      };

      let laptopPrice = prices.laptopPrice;
      let mobilePrice = prices.mobilePrice;
      let discountApplied = false;
      let discountDetails = null;

      // Check for referral discount if code is provided
      if (referralCode) {
        try {
          // Validate referral code exists
          const referralPartner = await storage.getDistributorBySellerCode(referralCode);
          if (referralPartner) {
            // Get discount settings
            const discountSettings = await storage.getReferralDiscountSettings();
            
            if (discountSettings && discountSettings.isActive && discountSettings.discountValue > 0) {
              let laptopDiscount = 0;
              let mobileDiscount = 0;

              if (discountSettings.discountType === 'percentage') {
                laptopDiscount = (laptopPrice * discountSettings.discountValue) / 100;
                mobileDiscount = (mobilePrice * discountSettings.discountValue) / 100;
              } else if (discountSettings.discountType === 'flat') {
                laptopDiscount = Math.min(discountSettings.discountValue, laptopPrice);
                mobileDiscount = Math.min(discountSettings.discountValue, mobilePrice);
              }

              // Apply discounts (ensure prices don't go below 0)
              laptopPrice = Math.max(0, laptopPrice - laptopDiscount);
              mobilePrice = Math.max(0, mobilePrice - mobileDiscount);
              
              discountApplied = true;
              discountDetails = {
                type: discountSettings.discountType,
                value: discountSettings.discountValue,
                laptopDiscount: Math.round(laptopDiscount),
                mobileDiscount: Math.round(mobileDiscount),
                originalLaptopPrice: prices.laptopPrice,
                originalMobilePrice: prices.mobilePrice,
                discountedLaptopPrice: Math.round(laptopPrice),
                discountedMobilePrice: Math.round(mobilePrice)
              };
            }
          }
        } catch (discountError) {
          console.error("Error applying referral discount:", discountError);
          // Continue with original prices if discount calculation fails
        }
      }

      res.json({
        laptop: Math.round(laptopPrice),
        mobile: Math.round(mobilePrice),
        discountApplied,
        discountDetails,
        success: true,
      });
    } catch (error: any) {
      console.error("Error fetching BBG prices:", error);
      // Return default prices even on error to ensure frontend works
      res.json({
        laptop: 299,
        mobile: 99,
        discountApplied: false,
        success: false,
        error: "Using default prices",
      });
    }
  });

  // ===== CUSTOMER REGISTRATIONS ADMIN ROUTES =====

  // Admin endpoint - Get customer registrations with filtering and payout calculations
  app.get(
    "/api/admin/customer-registrations",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const { dateFrom, dateTo, deviceType, status, search } = req.query;

        let query = `
        SELECT 
          c.*,
          cl.id as claim_id,
          cl.status as claim_status,
          cl.claim_amount,
          cl.claim_percentage,
          cl.device_age_months
        FROM customers c
        LEFT JOIN claims cl ON c.voucher_code = cl.voucher_code
        WHERE 1=1
      `;

        const request = db.pool.request();

        // Note: dateFrom and dateTo are only used for payout calculation reference date, not for filtering customers

        // Apply device type filter
        if (deviceType && deviceType !== "all") {
          query += ` AND c.device_type = @deviceType`;
          request.input("deviceType", sql.VarChar, deviceType);
        }

        // Apply search filter
        if (search) {
          query += ` AND (
          c.name LIKE @search OR 
          c.email LIKE @search OR 
          c.voucher_code LIKE @search OR
          c.contact LIKE @search OR
          c.brand LIKE @search OR
          c.model_name LIKE @search
        )`;
          request.input("search", sql.VarChar, `%${search}%`);
        }

        query += ` ORDER BY c.created_at DESC`;

        await db.connectDB();
        const result = await request.query(query);

        // Calculate payout for each customer
        const customersWithPayout = await Promise.all(
          result.recordset.map(async (customer: any) => {
            // Calculate device age based on reference date (if provided) or current date
            const referenceDate = dateTo
              ? new Date(dateTo as string)
              : new Date();
            const purchaseDate = new Date(customer.date_of_purchase);
            const deviceAgeMonths = Math.floor(
              (referenceDate.getTime() - purchaseDate.getTime()) /
                (1000 * 60 * 60 * 24 * 30.44),
            );

            console.log(
              `🎯 Customer ${customer.name}: Purchase: ${customer.date_of_purchase}, Reference: ${referenceDate.toISOString().split("T")[0]}, Age: ${deviceAgeMonths} months`,
            );

            // Parse registration slab data to get the slab structure
            let estimatedPayout = 0;
            let claimPercentage = 0;

            if (customer.registration_slab_data) {
              try {
                const slabData = JSON.parse(customer.registration_slab_data);
                console.log(
                  `🎯 Using saved slab data for ${customer.name}:`,
                  slabData.length,
                  "slabs",
                );

                // Find appropriate slab based on device age
                const applicableSlab = slabData.find(
                  (slab: any) =>
                    deviceAgeMonths >= slab.minMonths &&
                    deviceAgeMonths <= slab.maxMonths,
                );

                if (applicableSlab) {
                  claimPercentage = applicableSlab.percentage;
                  estimatedPayout =
                    (parseFloat(customer.invoice_value) * claimPercentage) /
                    100;
                  console.log(
                    `✅ Found applicable slab: ${claimPercentage}% for ${deviceAgeMonths} months, payout: ₹${estimatedPayout}`,
                  );
                } else {
                  console.log(
                    `❌ No applicable slab found for ${deviceAgeMonths} months in saved data`,
                  );
                }
              } catch (error) {
                console.error(
                  "Error parsing slab data for customer:",
                  customer.id,
                  error,
                );
              }
            }

            // If no slab data, fallback to current active slabs
            if (estimatedPayout === 0) {
              try {
                console.log(
                  `🔄 Fallback slab lookup for ${customer.name}: ${customer.device_type}, ${customer.brand}, age: ${deviceAgeMonths}`,
                );

                const fallbackRequest = db.pool.request();
                fallbackRequest.input(
                  "deviceType",
                  sql.VarChar,
                  customer.device_type,
                );
                fallbackRequest.input("deviceAge", sql.Int, deviceAgeMonths);
                fallbackRequest.input("brand", sql.VarChar, customer.brand);
                fallbackRequest.input(
                  "registrationSource",
                  sql.VarChar,
                  customer.registration_source || "regular",
                );

                const slabQuery = `
              SELECT TOP 1 percentage FROM claim_value_slabs 
              WHERE device_type = @deviceType 
              AND @deviceAge >= min_months 
              AND @deviceAge <= max_months 
              AND is_active = 1
              AND (brand = @brand OR brand IS NULL)
              AND (registration_source = @registrationSource OR registration_source IS NULL)
              ORDER BY 
                CASE WHEN brand = @brand THEN 1 ELSE 2 END,
                CASE WHEN registration_source = @registrationSource THEN 1 ELSE 2 END,
                percentage DESC
            `;

                const slabResult = await fallbackRequest.query(slabQuery);
                console.log(
                  `🎯 Fallback slab query returned:`,
                  slabResult.recordset.length,
                  "results",
                );

                if (slabResult.recordset.length > 0) {
                  claimPercentage = slabResult.recordset[0].percentage;
                  estimatedPayout =
                    (parseFloat(customer.invoice_value) * claimPercentage) /
                    100;
                  console.log(
                    `✅ Fallback slab found: ${claimPercentage}% for ${deviceAgeMonths} months, payout: ₹${estimatedPayout}`,
                  );
                } else {
                  console.log(
                    `❌ No fallback slab found for device age ${deviceAgeMonths} months`,
                  );
                }
              } catch (error) {
                console.error(
                  "Error fetching fallback slab for customer:",
                  customer.id,
                  error,
                );
              }
            }

            return {
              id: customer.id,
              name: customer.name,
              contact: customer.contact,
              email: customer.email,
              pincode: customer.pincode,
              deviceType: customer.device_type,
              serialNumber: customer.serial_number,
              brand: customer.brand,
              modelName: customer.model_name,
              invoiceValue: parseFloat(customer.invoice_value),
              dateOfPurchase: customer.date_of_purchase,
              sellerCode: customer.seller_code,
              voucherCode: customer.voucher_code,
              paymentIntentId: customer.payment_intent_id,
              isVerified: customer.is_verified,
              registrationSource: customer.registration_source || "regular",
              registrationSlabData: customer.registration_slab_data,
              createdAt: customer.created_at,
              claimStatus: customer.claim_status,
              claimId: customer.claim_id,
              deviceAge: deviceAgeMonths,
              estimatedPayout: Math.round(estimatedPayout),
              claimPercentage: claimPercentage,
            };
          }),
        );

        // Apply status filter after processing (since it's related to calculated claim status)
        let filteredCustomers = customersWithPayout;
        if (status && status !== "all") {
          filteredCustomers = customersWithPayout.filter((customer) => {
            if (status === "claimed") return customer.claimStatus !== null;
            if (status === "unclaimed") return customer.claimStatus === null;
            return customer.claimStatus === status;
          });
        }

        res.json(filteredCustomers);
      } catch (error: any) {
        console.error("Error fetching customer registrations:", error);
        res
          .status(500)
          .json({
            message: "Failed to fetch customer registrations",
            error: error.message,
          });
      }
    },
  );

  // ===== HOMEPAGE BANNER MANAGEMENT ROUTES =====

  // Public endpoint - Get active homepage banners (for frontend display)
  app.get("/api/homepage-banners", async (req, res) => {
    try {
      const banners = await storage.getActiveHomepageBanners();
      res.json(banners);
    } catch (error: any) {
      console.error("Error fetching homepage banners:", error);
      res.status(500).json({ message: "Failed to get homepage banners" });
    }
  });

  // Public endpoint - Redirect to S3 for images (S3-only implementation)
  app.get("/uploads/:filename", async (req, res) => {
    const filename = req.params.filename;

    try {
      // Generate signed URL for S3 file access
      const signedUrl = await s3Service.getSignedUrl(`documents/${filename}`);

      // Redirect to S3 signed URL
      res.redirect(signedUrl);
    } catch (error) {
      console.error("Error accessing S3 file:", error);
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Admin endpoint - Get all homepage banners (including inactive ones)
  app.get(
    "/api/admin/homepage-banners",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const banners = await storage.getAllHomepageBanners();
        res.json(banners);
      } catch (error: any) {
        console.error("Error fetching all homepage banners:", error);
        res.status(500).json({ message: "Failed to get homepage banners" });
      }
    },
  );

  // Admin endpoint - Create homepage banner
  app.post(
    "/api/admin/homepage-banners",
    isAdminAuthenticated,
    bannerUpload.fields([
      { name: "desktopImage", maxCount: 1 },
      { name: "mobileImage", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { title, description, linkUrl, isActive, sortOrder, desktopImageUrl, mobileImageUrl } = req.body;
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (!title) {
          return res.status(400).json({ message: "Title is required" });
        }

        // Determine image URLs - use uploaded files or provided URLs
        let finalDesktopImageUrl = desktopImageUrl;
        let finalMobileImageUrl = mobileImageUrl;

        if (files?.desktopImage) {
          finalDesktopImageUrl = (files.desktopImage[0] as any).location;
        }
        if (files?.mobileImage) {
          finalMobileImageUrl = (files.mobileImage[0] as any).location;
        }

        // Check if we have both desktop and mobile images (either files or URLs)
        if (!finalDesktopImageUrl || !finalMobileImageUrl) {
          return res
            .status(400)
            .json({ message: "Both desktop and mobile images (files or URLs) are required" });
        }

        const banner = await storage.createHomepageBanner({
          title,
          description,
          desktopImageUrl: finalDesktopImageUrl,
          mobileImageUrl: finalMobileImageUrl,
          linkUrl,
          isActive: isActive === "true",
          sortOrder: parseInt(sortOrder) || 0,
        });

        res.status(201).json({
          message: "Homepage banner created successfully",
          banner,
        });
      } catch (error: any) {
        console.error("Error creating homepage banner:", error);
        res.status(500).json({ message: "Failed to create homepage banner" });
      }
    },
  );

  // Admin endpoint - Update homepage banner
  app.put(
    "/api/admin/homepage-banners/:id",
    isAdminAuthenticated,
    bannerUpload.fields([
      { name: "desktopImage", maxCount: 1 },
      { name: "mobileImage", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const bannerId = parseInt(req.params.id);
        const { title, description, linkUrl, isActive, sortOrder, desktopImageUrl, mobileImageUrl } = req.body;
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (isNaN(bannerId)) {
          return res.status(400).json({ message: "Invalid banner ID" });
        }

        const updates: any = {};

        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (linkUrl !== undefined) updates.linkUrl = linkUrl;
        if (isActive !== undefined) updates.isActive = isActive === "true";
        if (sortOrder !== undefined) updates.sortOrder = parseInt(sortOrder);

        // Handle image URL updates - prioritize uploaded files over URL fields
        if (files?.desktopImage) {
          updates.desktopImageUrl = (files.desktopImage[0] as any).location;
        } else if (desktopImageUrl !== undefined && desktopImageUrl !== null && desktopImageUrl.trim() !== '') {
          updates.desktopImageUrl = desktopImageUrl.trim();
        }

        if (files?.mobileImage) {
          updates.mobileImageUrl = (files.mobileImage[0] as any).location;
        } else if (mobileImageUrl !== undefined && mobileImageUrl !== null && mobileImageUrl.trim() !== '') {
          updates.mobileImageUrl = mobileImageUrl.trim();
        }

        await storage.updateHomepageBanner(bannerId, updates);

        res.json({ message: "Homepage banner updated successfully" });
      } catch (error: any) {
        console.error("Error updating homepage banner:", error);
        res.status(500).json({ message: "Failed to update homepage banner" });
      }
    },
  );

  // Admin endpoint - Delete homepage banner
  app.delete(
    "/api/admin/homepage-banners/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const bannerId = parseInt(req.params.id);

        if (isNaN(bannerId)) {
          return res.status(400).json({ message: "Invalid banner ID" });
        }

        await storage.deleteHomepageBanner(bannerId);

        res.json({ message: "Homepage banner deleted successfully" });
      } catch (error: any) {
        console.error("Error deleting homepage banner:", error);
        res.status(500).json({ message: "Failed to delete homepage banner" });
      }
    },
  );

  // Admin endpoint - Get single homepage banner by ID
  app.get(
    "/api/admin/homepage-banners/:id",
    isAdminAuthenticated,
    async (req, res) => {
      try {
        const bannerId = parseInt(req.params.id);

        if (isNaN(bannerId)) {
          return res.status(400).json({ message: "Invalid banner ID" });
        }

        const banner = await storage.getHomepageBannerById(bannerId);

        if (!banner) {
          return res.status(404).json({ message: "Homepage banner not found" });
        }

        res.json(banner);
      } catch (error: any) {
        console.error("Error fetching homepage banner:", error);
        res.status(500).json({ message: "Failed to get homepage banner" });
      }
    },
  );

  // ===== TRANSACTION HISTORY API ROUTES =====

  // Admin transaction history routes
  app.get('/api/admin/transaction-history', isAdminAuthenticated, async (req, res) => {
    try {
      console.log('🔍 Fetching transaction history with filters:', req.query);
      
      const filters = {
        status: req.query.status as string,
        paymentMethod: req.query.paymentMethod as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        search: req.query.search as string,
      };

      const transactions = await storage.getAllTransactionHistory(filters);
      console.log(`✅ Found ${transactions.length} transaction history records`);
      res.json(transactions);
    } catch (error) {
      console.error('❌ Error fetching transaction history:', error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  });

  app.post('/api/admin/transaction-history', isAdminAuthenticated, async (req, res) => {
    try {
      console.log('📝 Creating new transaction history entry:', req.body);
      
      const transaction = await storage.createTransactionHistory(req.body);
      console.log('✅ Transaction history created successfully:', transaction.id);
      res.json(transaction);
    } catch (error) {
      console.error('❌ Error creating transaction history:', error);
      res.status(500).json({ error: 'Failed to create transaction history' });
    }
  });

  app.put('/api/admin/transaction-history/:transactionId', isAdminAuthenticated, async (req, res) => {
    try {
      const transactionId = req.params.transactionId;
      console.log(`📝 Updating transaction history ${transactionId}:`, req.body);
      
      await storage.updateTransactionHistory(transactionId, req.body);
      console.log(`✅ Transaction history ${transactionId} updated successfully`);
      res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
      console.error('❌ Error updating transaction history:', error);
      res.status(500).json({ error: 'Failed to update transaction history' });
    }
  });

  // Export transaction history to CSV
  app.get('/api/admin/export/transaction-history', isAdminAuthenticated, async (req, res) => {
    try {
      console.log('📋 Exporting transaction history to CSV...');
      
      const filters = {
        status: req.query.status as string,
        paymentMethod: req.query.paymentMethod as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        search: req.query.search as string,
      };

      const transactions = await storage.getAllTransactionHistory(filters);
      
      // Create CSV content
      const csvHeader = [
        'Transaction ID',
        'Customer Name',
        'Customer Email', 
        'Customer Contact',
        'Payment Method',
        'Amount (₹)',
        'Currency',
        'Status',
        'Device Type',
        'Device Brand',
        'Referral Code',
        'Discount Applied (₹)',
        'Original Amount (₹)',
        'Registration Source',
        'Created At',
        'Updated At'
      ].join(',');
      
      const csvRows = transactions.map(transaction => [
        `"${transaction.transactionId}"`,
        `"${transaction.customerName}"`,
        `"${transaction.customerEmail || ''}"`,
        `"${transaction.customerContact || ''}"`,
        `"${transaction.paymentMethod}"`,
        transaction.amount,
        `"${transaction.currency}"`,
        `"${transaction.status}"`,
        `"${transaction.deviceType || ''}"`,
        `"${transaction.deviceBrand || ''}"`,
        `"${transaction.referralCode || ''}"`,
        transaction.discountApplied,
        transaction.originalAmount,
        `"${transaction.registrationSource}"`,
        `"${new Date(transaction.createdAt).toLocaleString()}"`,
        `"${new Date(transaction.updatedAt).toLocaleString()}"`
      ].join(','));
      
      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `transaction_history_${currentDate}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
      
      console.log(`✅ Transaction history CSV exported successfully: ${filename}`);
    } catch (error) {
      console.error('❌ Error exporting transaction history:', error);
      res.status(500).json({ error: 'Failed to export transaction history' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;

  // Helper function to check database connection
  async function checkDatabaseConnection() {
    try {
      await sql.connect(config);
      return {
        status: "connected",
        host: config.server,
        database: config.database,
      };
    } catch (error) {
      return {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
