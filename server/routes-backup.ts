import { type Express } from "express";
import { createServer } from "http";
import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { createS3Upload, s3Service } from "./s3-service";
import { storage, isAdminAuthenticated, isCustomerAuthenticated } from "./storage";
import sql from "mssql";
import { sqlServerConfig as config } from "./storage";
import { generateUniqueId } from "./utils";
import { CommunicationService } from "./communication-service";
import crypto from "crypto";

// File upload configuration
const upload = createS3Upload("uploads", false, true); // Allow CSV uploads

export async function registerRoutes(app: Express) {
  console.log("Setting up routes...");

  // Basic test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "Server is running" });
  });

  // Add your remaining route content here...
  // (This is just the header restoration)

  const httpServer = createServer(app);
  return httpServer;
}