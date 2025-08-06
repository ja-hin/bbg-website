// Note: We're using SQL Server but keeping these type definitions for compatibility
// The actual database operations are handled by SqlServerStorage with raw SQL
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const distributors = pgTable("distributors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  pincode: text("pincode").notNull(),

  preferredMode: text("preferred_mode").notNull(), // 'in-store', 'online', 'both'
  // Tax & Compliance Details
  panNumber: text("pan_number").notNull(),
  panCopyFile: text("pan_copy_file").notNull(),
  isGstRegistered: boolean("is_gst_registered").default(false),
  gstin: text("gstin"),
  gstCertificateFile: text("gst_certificate_file"),
  isMsmeRegistered: boolean("is_msme_registered").default(false),
  msmeCertificateFile: text("msme_certificate_file"),
  // Bank Details
  accountHolderName: text("account_holder_name").notNull(),
  bankAccount: text("bank_account").notNull(),
  bankAccountConfirm: text("bank_account_confirm").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  upiId: text("upi_id"),
  cancelledChequeFile: text("cancelled_cheque_file"),
  // Declarations
  infoDeclaration: boolean("info_declaration").default(false),
  tdsUnderstanding: boolean("tds_understanding").default(false),
  gstInvoiceAgreement: boolean("gst_invoice_agreement").default(false),
  termsAgreement: boolean("terms_agreement").default(false),
  // System fields
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
  dateOfPurchase: text("date_of_purchase").notNull(),
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
  registrationSource: text("registration_source").default("regular"), // 'regular' or 'acer'
  claimValueSlabId: integer("claim_value_slab_id"), // Reference to active slab when registered
  createdAt: timestamp("created_at").defaultNow(),
});

// Claim Value Slabs table for managing depreciation percentages
export const claimValueSlabs = pgTable("claim_value_slabs", {
  id: serial("id").primaryKey(),
  minMonths: integer("min_months").notNull(),
  maxMonths: integer("max_months").notNull(),
  percentage: integer("percentage").notNull(), // Percentage value (0-100)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  voucherCode: text("voucher_code").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  serialNumber: text("serial_number").notNull(),
  pickupDate: text("pickup_date").notNull(),
  pickupTimeSlot: text("pickup_time_slot").notNull(),
  deviceAgeMonths: integer("device_age_months").notNull(),
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

// Master data tables for admin management
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  deviceType: text("device_type").notNull(), // 'mobile', 'laptop', or 'both'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deviceModels = pgTable("device_models", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull(),
  modelName: text("model_name").notNull(),
  deviceType: text("device_type").notNull(), // 'mobile', 'laptop'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Roles Master
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  roleName: text("role_name").notNull().unique(), // 'super_admin', 'admin', 'moderator', 'viewer'
  description: text("description").notNull(),
  permissions: text("permissions").notNull(), // JSON string of permissions
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pending Payments tracking
export const pendingPayments = pgTable("pending_payments", {
  id: serial("id").primaryKey(),
  // Customer Details
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  pincode: text("pincode").notNull(),
  // Device Details
  deviceType: text("device_type").notNull(), // 'laptop' or 'mobile'
  serialNumber: text("serial_number").notNull(),
  brand: text("brand").notNull(),
  modelName: text("model_name").notNull(),
  invoiceValue: decimal("invoice_value", { precision: 10, scale: 2 }).notNull(),
  // Payment Details
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: text("transaction_id"), // PayU transaction ID
  sellerCode: text("seller_code"),
  status: text("status").notNull().default('pending'), // 'pending', 'abandoned', 'completed'
  expiresAt: timestamp("expires_at").notNull(), // Payment link expiry
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id").notNull(), // Foreign key to user_roles
  role: text("role").notNull().default('admin'), // kept for compatibility
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Distributor Sessions table for authentication
export const distributorSessions = pgTable("distributor_sessions", {
  id: serial("id").primaryKey(),
  distributorId: integer("distributor_id").notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Commission Payouts table
export const commissionPayouts = pgTable("commission_payouts", {
  id: serial("id").primaryKey(),
  distributorId: integer("distributor_id").notNull(),
  customerId: integer("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'paid', 'failed'
  paymentReference: text("payment_reference"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart Abandonment tracking
export const cartAbandonments = pgTable("cart_abandonments", {
  id: serial("id").primaryKey(),
  name: text("name"),
  contact: text("contact"),
  email: text("email"),
  pincode: text("pincode"),
  deviceType: text("device_type"),
  serialNumber: text("serial_number"),
  brand: text("brand"),
  modelName: text("model_name"),
  invoiceValue: decimal("invoice_value", { precision: 10, scale: 2 }),
  sellerCode: text("seller_code"),
  sessionId: text("session_id").notNull(),
  stage: text("stage").notNull().default("form_started"), // form_started, details_entered, otp_verified, payment_pending
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
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
  status: true,
  createdAt: true,
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPendingPaymentSchema = createInsertSchema(pendingPayments).omit({
  id: true,
  createdAt: true
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertDeviceModelSchema = createInsertSchema(deviceModels).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

export const insertClaimValueSlabSchema = createInsertSchema(claimValueSlabs).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export type UserRole = typeof userRoles.$inferSelect;
export type Distributor = typeof distributors.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type PendingPayment = typeof pendingPayments.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type DeviceModel = typeof deviceModels.$inferSelect;
export type CartAbandonment = typeof cartAbandonments.$inferSelect;
export type DistributorSession = typeof distributorSessions.$inferSelect;
export type CommissionPayout = typeof commissionPayouts.$inferSelect;

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type InsertDistributor = z.infer<typeof insertDistributorSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type InsertPendingPayment = z.infer<typeof insertPendingPaymentSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertDeviceModel = z.infer<typeof insertDeviceModelSchema>;
export type InsertCartAbandonment = typeof cartAbandonments.$inferInsert;

// Claim Value Slabs types
export type InsertClaimValueSlab = z.infer<typeof insertClaimValueSlabSchema>;
export type ClaimValueSlab = typeof claimValueSlabs.$inferSelect;
