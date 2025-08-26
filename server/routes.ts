import { type Express } from "express";
import { createServer } from "http";
import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { createS3Upload, s3Service } from "./s3-service";
import { storage } from "./storage";
import sql from "mssql";

// Simple authentication middleware for testing
const isAdminAuthenticated = (req: any, res: any, next: any) => {
  // For now, allow all requests - replace with proper auth later
  next();
};

// File upload configuration
const upload = createS3Upload("uploads", false, true); // Allow CSV uploads

export async function registerRoutes(app: Express) {
  console.log("Setting up routes...");

  // Basic health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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