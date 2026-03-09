// Note: We're using SQL Server but keeping these type definitions for compatibility
// The actual database operations are handled by SqlServerStorage with raw SQL
import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for dual-flow BBG system
export const PurchaseTimingCategory = {
  WITHIN_6_MONTHS: 'within_6_months',
  OVER_6_MONTHS: 'over_6_months'
} as const;

export const BenefitType = {
  CLAIM_SLABS: 'claim_slabs',
  AUCTION_REPAIR: 'auction_repair'
} as const;

export type PurchaseTimingCategoryType = typeof PurchaseTimingCategory[keyof typeof PurchaseTimingCategory];
export type BenefitTypeType = typeof BenefitType[keyof typeof BenefitType];

// Benefits structure for auction/repair flow
export interface AuctionRepairBenefits {
  auctionService: {
    value: number; // e.g., 599 for mobile, 799 for laptop
    description: string;
  };
  repairService: {
    value: number; // e.g., 599 for mobile, 799 for laptop
    description: string;
  };
  totalValue: number;
  actualPrice: number;
}

// Benefits structure for claim slabs flow
export interface ClaimSlabsBenefits {
  maxClaimPercentage: number; // e.g., 70
  slabStructure: any[]; // Complete slab structure at time of registration
}

export type BenefitsStructure = AuctionRepairBenefits | ClaimSlabsBenefits;

export const distributors = pgTable("distributors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessName: text("business_name"),
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
  commissionEarned: decimal("commission_earned", { precision: 10, scale: 2 }).default("0.00"),
  totalCustomers: integer("total_customers").default(0),
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
  serialNumber: text("serial_number"), // Device Serial Number (optional for regular BBG, required for Acer)
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
  claimValueSlabId: integer("claim_value_slab_id"), // Reference to active slab when registered (legacy)
  // Store complete slab configuration from registration time (preserves entire rate structure)
  registrationSlabData: text("registration_slab_data"), // JSON string of complete slab structure at time of registration
  // Dual-flow BBG system fields
  purchaseTimingCategory: text("purchase_timing_category"), // 'within_6_months' | 'over_6_months'
  benefitType: text("benefit_type"), // 'claim_slabs' | 'auction_repair'
  planPrice: decimal("plan_price", { precision: 10, scale: 2 }), // Price paid for BBG plan
  benefitsJson: text("benefits_json"), // JSON string of benefits structure
  emailTemplateKey: text("email_template_key"), // Template key for email notifications
  createdAt: timestamp("created_at").defaultNow(),
});

// Claim Value Slabs table for managing depreciation percentages
export const claimValueSlabs = pgTable("claim_value_slabs", {
  id: serial("id").primaryKey(),
  deviceType: text("device_type").notNull(), // 'mobile' or 'laptop'
  brand: text("brand"), // Brand name (HP, Dell, Lenovo, etc.) - optional for mobile
  minMonths: integer("min_months").notNull(),
  maxMonths: integer("max_months").notNull(),
  percentage: integer("percentage").notNull(), // Percentage value (0-100)
  registrationSource: text("registration_source").default("regular"), // 'regular' or 'acer_bbg' to distinguish between standard and Acer BBG slabs
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
  address: text("address").notNull(),
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
  serialNumber: text("serial_number"), // Optional for regular BBG flow, required for Acer
  brand: text("brand").notNull(),
  modelName: text("model_name").notNull(),
  invoiceValue: decimal("invoice_value", { precision: 10, scale: 2 }).notNull(),
  // Payment Details
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  transactionId: text("transaction_id"), // PayU transaction ID
  sellerCode: text("seller_code"),
  // Dual-flow BBG system fields
  purchaseTimingCategory: text("purchase_timing_category"), // 'within_6_months' | 'over_6_months'
  benefitType: text("benefit_type"), // 'claim_slabs' | 'auction_repair'
  planPrice: decimal("plan_price", { precision: 10, scale: 2 }), // Price for BBG plan
  benefitsJson: text("benefits_json"), // JSON string of benefits structure
  emailTemplateKey: text("email_template_key"), // Template key for email notifications
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

// Homepage Banners table for slider management
export const homepageBanners = pgTable("homepage_banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  desktopImageUrl: text("desktop_image_url").notNull(),
  mobileImageUrl: text("mobile_image_url").notNull(),
  linkUrl: text("link_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const specialCodes = pgTable("special_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  mobilePlanPrice: decimal("mobile_plan_price", { precision: 10, scale: 2 }).notNull(),
  laptopPlanPrice: decimal("laptop_plan_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDistributorSchema = createInsertSchema(distributors).omit({
  id: true,
  sellerCode: true,
  isActive: true,
  createdAt: true,
});

// Zod schemas for dual-flow BBG validation
export const purchaseTimingCategorySchema = z.enum(['within_6_months', 'over_6_months']);
export const benefitTypeSchema = z.enum(['claim_slabs', 'auction_repair']);

export const auctionRepairBenefitsSchema = z.object({
  auctionService: z.object({
    value: z.number(),
    description: z.string(),
  }),
  repairService: z.object({
    value: z.number(),
    description: z.string(),
  }),
  totalValue: z.number(),
  actualPrice: z.number(),
});

export const claimSlabsBenefitsSchema = z.object({
  maxClaimPercentage: z.number(),
  slabStructure: z.array(z.any()),
});

export const benefitsStructureSchema = z.union([auctionRepairBenefitsSchema, claimSlabsBenefitsSchema]);

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  voucherCode: true,
  isVerified: true,
  createdAt: true,
}).extend({
  purchaseTimingCategory: purchaseTimingCategorySchema.optional(),
  benefitType: benefitTypeSchema.optional(),
  planPrice: z.number().optional(),
  benefitsJson: z.string().optional(), // JSON string
  emailTemplateKey: z.string().optional(),
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
}).extend({
  purchaseTimingCategory: purchaseTimingCategorySchema.optional(),
  benefitType: benefitTypeSchema.optional(),
  planPrice: z.number().optional(),
  benefitsJson: z.string().optional(), // JSON string
  emailTemplateKey: z.string().optional(),
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

export const insertHomepageBannerSchema = createInsertSchema(homepageBanners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpecialCodeSchema = createInsertSchema(specialCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  mobilePlanPrice: z.string().or(z.number()).transform(val => String(val)),
  laptopPlanPrice: z.string().or(z.number()).transform(val => String(val)),
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
export type HomepageBanner = typeof homepageBanners.$inferSelect;
export type SpecialCode = typeof specialCodes.$inferSelect;

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
export type InsertHomepageBanner = z.infer<typeof insertHomepageBannerSchema>;
export type InsertSpecialCode = z.infer<typeof insertSpecialCodeSchema>;

// Theme settings table for admin theme management
export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  primaryColor: text("primary_color").notNull().default("#254696"), // hex color code
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertThemeSettingsSchema = createInsertSchema(themeSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Claim Value Slabs types
export type InsertClaimValueSlab = z.infer<typeof insertClaimValueSlabSchema>;
export type ClaimValueSlab = typeof claimValueSlabs.$inferSelect;

// Theme Settings types
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type InsertThemeSettings = z.infer<typeof insertThemeSettingsSchema>;

// SMTP Settings table
export const smtpSettings = pgTable("smtp_settings", {
  id: serial("id").primaryKey(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull().default(587),
  smtpUsername: text("smtp_username").notNull(),
  smtpPassword: text("smtp_password").notNull(),
  fromAddress: text("from_address").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSmtpSettingsSchema = createInsertSchema(smtpSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// SMTP Settings types
export type SmtpSettings = typeof smtpSettings.$inferSelect;
export type InsertSmtpSettings = z.infer<typeof insertSmtpSettingsSchema>;

// BBG Price Settings table for admin price management
export const bbgPriceSettings = pgTable("bbg_price_settings", {
  id: serial("id").primaryKey(),
  laptopPrice: decimal("laptop_price", { precision: 10, scale: 2 }).notNull().default("299.00"),
  mobilePrice: decimal("mobile_price", { precision: 10, scale: 2 }).notNull().default("99.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBbgPriceSettingsSchema = createInsertSchema(bbgPriceSettings).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

// BBG Price Settings types
export type BbgPriceSettings = typeof bbgPriceSettings.$inferSelect;
export type InsertBbgPriceSettings = z.infer<typeof insertBbgPriceSettingsSchema>;

// Referral Discount Settings table
export const referralDiscountSettings = pgTable("referral_discount_settings", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").default(false),
  discountType: varchar("discount_type", { length: 20 }).notNull().default("percentage"), // 'percentage' or 'flat'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull().default("0.00"), // Percentage or flat amount
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReferralDiscountSettingsSchema = createInsertSchema(referralDiscountSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Referral Discount Settings types
export type ReferralDiscountSettings = typeof referralDiscountSettings.$inferSelect;
export type InsertReferralDiscountSettings = z.infer<typeof insertReferralDiscountSettingsSchema>;

// Partner Commission Settings table
export const partnerCommissionSettings = pgTable("partner_commission_settings", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").default(false),
  mobileAmount: decimal("mobile_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  laptopAmount: decimal("laptop_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPartnerCommissionSettingsSchema = createInsertSchema(partnerCommissionSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PartnerCommissionSettings = typeof partnerCommissionSettings.$inferSelect;
export type InsertPartnerCommissionSettings = z.infer<typeof insertPartnerCommissionSettingsSchema>;

// Post-Purchase Device Registrations table
export const deviceRegistrations = pgTable("device_registrations", {
  id: serial("id").primaryKey(),
  // Purchase Information
  purchaseType: text("purchase_type").notNull(), // 'acer_estore' or 'website'
  // Device Details
  deviceType: text("device_type").notNull(), // 'laptop' or 'mobile'
  imeiSerial: text("imei_serial").notNull(), // Device IMEI/Serial Number
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  purchasePrice: text("purchase_price").notNull(),
  purchaseDate: text("purchase_date").notNull(),
  // Customer Details
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  pincode: text("pincode").notNull(),
  // System fields
  registrationId: text("registration_id").notNull().unique(),
  voucherCode: text("voucher_code").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  registrationSource: text("registration_source").default("post_purchase"), // 'post_purchase'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeviceRegistrationSchema = createInsertSchema(deviceRegistrations).omit({
  id: true,
  registrationId: true,
  voucherCode: true,
  isVerified: true,
  registrationSource: true,
  createdAt: true,
});

// Device Registration types
export type DeviceRegistration = typeof deviceRegistrations.$inferSelect;
export type InsertDeviceRegistration = z.infer<typeof insertDeviceRegistrationSchema>;

// Dual-flow BBG system types
export type PurchaseTimingCategoryValidation = z.infer<typeof purchaseTimingCategorySchema>;
export type BenefitTypeValidation = z.infer<typeof benefitTypeSchema>;
export type AuctionRepairBenefitsValidation = z.infer<typeof auctionRepairBenefitsSchema>;
export type ClaimSlabsBenefitsValidation = z.infer<typeof claimSlabsBenefitsSchema>;
export type BenefitsStructureValidation = z.infer<typeof benefitsStructureSchema>;

// Plans table for managing BBG and Extend+ plans
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  planName: text("plan_name").notNull().unique(),
  planPrice: decimal("plan_price", { precision: 10, scale: 2 }).notNull(),
  deviceType: text("device_type").notNull(), // 'mobile' or 'laptop'
  planType: text("plan_type").notNull(), // 'bbg' or 'extend_plus'
  coverage: text("coverage"), // coverage identifier for mapping (e.g., '6_months', '12_months')
  emailTemplateId: integer("email_template_id"), // Reference to message_templates table
  whatsappTemplateId: integer("whatsapp_template_id"), // Reference to message_templates table
  smsTemplateId: integer("sms_template_id"), // Reference to message_templates table
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  planPrice: z.string().or(z.number()).transform(val => String(val)),
  coverage: z.string().optional().nullable(),
  emailTemplateId: z.number().optional().nullable(),
  whatsappTemplateId: z.number().optional().nullable(),
  smsTemplateId: z.number().optional().nullable(),
});

// Plans types
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
