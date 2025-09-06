import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { s3Service, createS3Upload } from "./s3-service";
import { storage } from "./sql-storage";
import { communicationService } from "./communication-service";
import { createHash } from "crypto";
import {
  getKaleyraSMSService,
  getSafeGupshupService,
  getSafePayUConfig,
} from "./config-service";
import { templateService } from "./template-service";
import { testAllTemplates } from "./template-test";
import { registerTestRoutes } from "./test-services";
import sql from "mssql";
import { insertCustomerSchema, insertDistributorSchema, insertClaimSchema, insertOtpSchema } from "@shared/schema";
import AWS from "aws-sdk";
import bcrypt from "bcryptjs";

// SQL Server storage is imported as storage from sql-storage

// Create upload instances
const upload = createS3Upload("documents");
const bulkUpload = createS3Upload("bulk-uploads");
const bannerUpload = createS3Upload("documents", true);

// PayU Configuration will be initialized in registerRoutes using config service
function generatePayUHash(params: any, salt: string): string {
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${salt}`;
  return createHash("sha512").update(hashString).digest("hex");
}

// Admin authentication middleware
function isAdminAuthenticated(req: Request, res: Response, next: any) {
  const session = req.session as any;
  
  console.log("Auth check - Session ID:", session?.adminId);
  console.log("Auth check - Session object:", session);
  
  if (session?.adminId && session?.adminUsername) {
    return next();
  }
  
  console.log("Admin authentication failed");
  return res.status(401).json({ message: "Admin authentication required" });
}

export async function registerRoutes(app: express.Application): Promise<Server> {
  // Admin endpoint - Get all homepage banners
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
        const { title, description, linkUrl, isActive, sortOrder } = req.body;
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (!title) {
          return res.status(400).json({ message: "Title is required" });
        }

        if (!files?.desktopImage || !files?.mobileImage) {
          return res
            .status(400)
            .json({ message: "Both desktop and mobile images are required" });
        }

        // Get S3 image URLs
        const desktopImageUrl = (files.desktopImage[0] as any).location;
        const mobileImageUrl = (files.mobileImage[0] as any).location;

        const banner = await storage.createHomepageBanner({
          title,
          description,
          desktopImageUrl,
          mobileImageUrl,
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
        const { title, description, linkUrl, isActive, sortOrder } = req.body;
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

        // Update S3 image URLs if new files are provided
        if (files?.desktopImage) {
          updates.desktopImageUrl = (files.desktopImage[0] as any).location;
        }

        if (files?.mobileImage) {
          updates.mobileImageUrl = (files.mobileImage[0] as any).location;
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
      const config = {
        server: process.env.SQL_SERVER || "localhost",
        database: process.env.SQL_DATABASE || "bbg_db",
        user: process.env.SQL_USER || "",
        password: process.env.SQL_PASSWORD || "",
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      };
      
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
