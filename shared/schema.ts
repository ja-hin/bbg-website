// Note: We're using SQL Server but keeping these type definitions for compatibility
// The actual database operations are handled by SqlServerStorage with raw SQL
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const distributors = pgTable("distributors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessName: text("business_name"), // optional
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  pincode: text("pincode").notNull(),
  location: text("location").notNull(), // city/location
  preferredMode: text("preferred_mode").notNull(), // 'in-store', 'online', 'both'
  gstin: text("gstin"), // optional
  // Bank details (optional for commission payouts)
  bankAccount: text("bank_account"),
  ifscCode: text("ifsc_code"),
  accountHolderName: text("account_holder_name"),
  sellerCode: text("seller_code").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  // Customer Details
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  pincode: text("pincode").notNull(),
  // Device Details
  deviceType: text("device_type").notNull(), // 'laptop' or 'mobile'
  serialNumber: text("serial_number").notNull(), // Serial No. / IMEI
  brand: text("brand").notNull(),
  modelName: text("model_name").notNull(),
  invoiceValue: decimal("invoice_value", { precision: 10, scale: 2 }).notNull(),
  // Legacy fields (kept for compatibility)
  address: text("address"),
  purchaseDate: text("purchase_date"),
  invoiceNumber: text("invoice_number"),
  invoiceFile: text("invoice_file"),
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  // Seller Details
  sellerCode: text("seller_code"),
  voucherCode: text("voucher_code").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  voucherCode: text("voucher_code").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  claimPercentage: integer("claim_percentage").notNull(),
  claimAmount: decimal("claim_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  contact: text("contact").notNull(),
  otp: text("otp").notNull(),
  isVerified: boolean("is_verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default('admin'), // 'admin', 'super_admin'
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDistributorSchema = createInsertSchema(distributors).omit({
  id: true,
  sellerCode: true,
  isActive: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  voucherCode: true,
  isVerified: true,
  createdAt: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  claimPercentage: true,
  claimAmount: true,
  status: true,
  createdAt: true,
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
});

export type Distributor = typeof distributors.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;

export type InsertDistributor = z.infer<typeof insertDistributorSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
