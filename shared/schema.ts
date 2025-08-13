import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Distributors table - for distributor management
export const distributors = pgTable("distributors", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  contact: varchar("contact", { length: 20 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  registrationDate: timestamp("registration_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  token: varchar("token", { length: 500 }),
  passwordHash: varchar("password_hash", { length: 255 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default('5.00'),
  totalCommissionEarned: decimal("total_commission_earned", { precision: 12, scale: 2 }).default('0.00'),
});

// Customers table - for customer registration and claims
export const customers = pgTable("customers", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  contact: varchar("contact", { length: 20 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  deviceType: varchar("device_type", { length: 50 }).notNull(), // 'mobile' or 'laptop'
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  imei: varchar("imei", { length: 20 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  invoiceDate: date("invoice_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  dealerName: varchar("dealer_name", { length: 255 }),
  registrationDate: timestamp("registration_date").defaultNow(),
  distributorId: integer("distributor_id"),
  registrationSource: varchar("registration_source", { length: 50 }).default('regular'), // 'regular' or 'acer_bbg'
  bbgExpiryDate: date("bbg_expiry_date"), // BBG coverage expiry
});

// Claims table - for BBG claims processing
export const claims = pgTable("claims", {
  id: integer("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  claimNumber: varchar("claim_number", { length: 100 }).unique().notNull(),
  claimDate: timestamp("claim_date").defaultNow(),
  deviceCondition: varchar("device_condition", { length: 100 }),
  claimedValue: decimal("claimed_value", { precision: 10, scale: 2 }),
  approvedValue: decimal("approved_value", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default('pending'), // pending, approved, rejected, paid
  qcNotes: text("qc_notes"),
  rejectionReason: text("rejection_reason"),
  paymentStatus: varchar("payment_status", { length: 50 }).default('pending'),
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  bankAccountNumber: varchar("bank_account_number", { length: 50 }),
  ifscCode: varchar("ifsc_code", { length: 20 }),
  upiId: varchar("upi_id", { length: 100 }),
  documentsSubmitted: boolean("documents_submitted").default(false),
  qcCompleted: boolean("qc_completed").default(false),
});

// Admin users table - for admin panel access
export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  roleId: integer("role_id").notNull(),
  role: varchar("role", { length: 50 }).notNull(), // 'admin', 'super_admin', 'qc_officer'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Claim value slabs - for calculating BBG percentages
export const claimValueSlabs = pgTable("claim_value_slabs", {
  id: integer("id").primaryKey(),
  deviceType: varchar("device_type", { length: 50 }).notNull(), // 'mobile' or 'laptop'
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 255 }),
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }),
  monthsAfterPurchase: integer("months_after_purchase").notNull(),
  claimPercentage: decimal("claim_percentage", { precision: 5, scale: 2 }).notNull(),
  registrationSource: varchar("registration_source", { length: 50 }).default('regular'), // 'regular' or 'acer_bbg'
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Brands table - for managing supported brands
export const brands = pgTable("brands", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  deviceType: varchar("device_type", { length: 50 }).notNull(), // 'mobile', 'laptop', or 'both'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Device models table - for managing supported models
export const deviceModels = pgTable("device_models", {
  id: integer("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  deviceType: varchar("device_type", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// OTP verification table - for OTP-based authentication
export const otpVerifications = pgTable("otp_verifications", {
  id: integer("id").primaryKey(),
  contact: varchar("contact", { length: 20 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiryTime: timestamp("expiry_time").notNull(),
  isUsed: boolean("is_used").default(false),
  purpose: varchar("purpose", { length: 50 }).notNull(), // 'registration', 'claim', 'login'
  createdAt: timestamp("created_at").defaultNow(),
});

// Message templates table - for dynamic communication templates
export const messageTemplates = pgTable("message_templates", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'sms', 'email', 'whatsapp'
  subject: varchar("subject", { length: 500 }), // For email templates
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart abandonment tracking - for marketing insights
export const cartAbandonments = pgTable("cart_abandonments", {
  id: integer("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  contact: varchar("contact", { length: 20 }),
  deviceType: varchar("device_type", { length: 50 }),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 255 }),
  stage: varchar("stage", { length: 50 }).notNull(), // form_started, personal_info, device_info, abandoned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas using drizzle-zod
export const insertDistributorSchema = createInsertSchema(distributors).omit({
  id: true,
  registrationDate: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  registrationDate: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  claimDate: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertClaimValueSlabSchema = createInsertSchema(claimValueSlabs).omit({
  id: true,
  createdAt: true,
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertCartAbandonmentSchema = createInsertSchema(cartAbandonments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define TypeScript types
export type Distributor = typeof distributors.$inferSelect;
export type InsertDistributor = z.infer<typeof insertDistributorSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type ClaimValueSlab = typeof claimValueSlabs.$inferSelect;
export type InsertClaimValueSlab = z.infer<typeof insertClaimValueSlabSchema>;

export type Brand = typeof brands.$inferSelect;
export type DeviceModel = typeof deviceModels.$inferSelect;

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;

export type CartAbandonment = typeof cartAbandonments.$inferSelect;
export type InsertCartAbandonment = z.infer<typeof insertCartAbandonmentSchema>;