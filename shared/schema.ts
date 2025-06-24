import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const distributors = pgTable("distributors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  upiId: text("upi_id").notNull(),
  bankAccount: text("bank_account").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  sellerCode: text("seller_code").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  pincode: text("pincode").notNull(),
  serialNumber: text("serial_number").notNull(),
  modelName: text("model_name").notNull(),
  invoiceValue: decimal("invoice_value", { precision: 10, scale: 2 }).notNull(),
  deviceType: text("device_type").notNull(), // 'laptop' or 'mobile'
  invoiceFile: text("invoice_file").notNull(),
  paymentScreenshot: text("payment_screenshot").notNull(),
  sellerCode: text("seller_code"),
  bbgVoucherCode: text("bbg_voucher_code").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  bbgVoucherCode: text("bbg_voucher_code").notNull(),
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

export const insertDistributorSchema = createInsertSchema(distributors).omit({
  id: true,
  sellerCode: true,
  isActive: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  bbgVoucherCode: true,
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

export type Distributor = typeof distributors.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type OtpVerification = typeof otpVerifications.$inferSelect;

export type InsertDistributor = z.infer<typeof insertDistributorSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
