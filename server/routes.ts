import { type Express } from "express";
import { createServer } from "http";
import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { createS3Upload, s3Service } from "./s3-service";
import { storage } from "./storage";
import sql from "mssql";
import { pool } from "./db";

// Admin authentication middleware
const isAdminAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// File upload configuration
const upload = createS3Upload("uploads", false, true); // Allow CSV uploads

export async function registerRoutes(app: Express) {
  console.log("Setting up routes...");

  // Basic health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Direct SQL query for admin authentication using proper pool
      if (!pool.connected) {
        await pool.connect();
      }
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query(`
          SELECT id, username, password_hash, role, is_active, last_login_at 
          FROM admin_users 
          WHERE username = @username AND is_active = 1
        `);

      if (result.recordset.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const admin = result.recordset[0];
      const isValid = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await pool.request()
        .input('id', sql.Int, admin.id)
        .query(`UPDATE admin_users SET last_login_at = GETDATE() WHERE id = @id`);

      // Set session
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;

      res.json({
        success: true,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role
        }
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/me", isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = req.session.adminId;
      
      // Direct SQL query for admin info using proper pool
      if (!pool.connected) {
        await pool.connect();
      }
      const result = await pool.request()
        .input('id', sql.Int, adminId)
        .query(`
          SELECT id, username, role, is_active, last_login_at 
          FROM admin_users 
          WHERE id = @id AND is_active = 1
        `);
      
      if (result.recordset.length === 0) {
        return res.status(401).json({ message: "Admin not found or inactive" });
      }

      const admin = result.recordset[0];
      res.json({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        lastLoginAt: admin.last_login_at
      });
    } catch (error: any) {
      console.error("Admin me error:", error);
      res.status(500).json({ message: "Failed to get admin info" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Admin Data Endpoints
  app.get("/api/admin/dashboard", isAdminAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json({ stats });
    } catch (error: any) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/admin/customers", isAdminAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error: any) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/admin/distributors", isAdminAuthenticated, async (req, res) => {
    try {
      const distributors = await storage.getAllDistributors();
      res.json(distributors);
    } catch (error: any) {
      console.error("Get distributors error:", error);
      res.status(500).json({ message: "Failed to fetch distributors" });
    }
  });

  app.get("/api/admin/claims", isAdminAuthenticated, async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      res.json(claims);
    } catch (error: any) {
      console.error("Get claims error:", error);
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  app.get("/api/admin/menu-order", isAdminAuthenticated, async (req, res) => {
    try {
      // Return default menu order - this can be made configurable later
      const menuOrder = [
        { id: "dashboard", label: "Dashboard", order: 1 },
        { id: "customers", label: "Customers", order: 2 },
        { id: "distributors", label: "Referral Partners", order: 3 },
        { id: "claims", label: "Claims", order: 4 },
        { id: "settings", label: "Settings", order: 5 }
      ];
      res.json(menuOrder);
    } catch (error: any) {
      console.error("Get menu order error:", error);
      res.status(500).json({ message: "Failed to fetch menu order" });
    }
  });

  // S3 Test endpoints for admin
  app.post('/api/admin/s3-test/upload', isAdminAuthenticated, upload.single('pdf'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No PDF file uploaded' 
        });
      }

      // Validate file type
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only PDF files are allowed' 
        });
      }

      const fileName = req.file.originalname;
      const fileSize = req.file.size;

      let s3Key: string;
      
      if (req.file.location) {
        // S3 upload - extract key from location URL
        const url = new URL(req.file.location);
        s3Key = url.pathname.substring(1); // Remove leading slash
      } else if (req.file.key) {
        // S3 upload - use key directly
        s3Key = req.file.key;
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'File upload failed - no S3 key generated' 
        });
      }

      console.log(`📄 S3 Test Upload Success: ${fileName} -> ${s3Key}`);

      res.json({
        success: true,
        message: `PDF file uploaded successfully to S3`,
        s3Key,
        fileName,
        size: fileSize
      });

    } catch (error) {
      console.error('S3 Test Upload Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  });

  app.get('/api/admin/s3-test/download/:s3Key(*)', isAdminAuthenticated, async (req, res) => {
    try {
      const s3Key = decodeURIComponent(req.params.s3Key);
      
      if (!s3Key) {
        return res.status(400).json({ 
          success: false, 
          message: 'S3 key is required' 
        });
      }

      // Generate signed URL for download
      const downloadUrl = await s3Service.getSignedUrl(s3Key, 3600); // 1 hour expiry
      
      console.log(`📄 S3 Test Download URL Generated: ${s3Key}`);

      res.json({
        success: true,
        downloadUrl,
        s3Key
      });

    } catch (error) {
      console.error('S3 Test Download Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to generate download URL' 
      });
    }
  });

  // Basic database health check
  app.get("/api/db-status", async (req, res) => {
    try {
      const pool = await sql.connect();
      res.json({ 
        status: "connected",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        status: "disconnected", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}