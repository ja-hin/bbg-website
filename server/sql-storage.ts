import { 
  type UserRole,
  type Distributor, 
  type Customer, 
  type Claim, 
  type OtpVerification,
  type AdminUser,
  type PendingPayment,
  type Brand,
  type DeviceModel,
  type InsertUserRole,
  type InsertDistributor, 
  type InsertCustomer, 
  type InsertClaim, 
  type InsertOtp,
  type InsertAdminUser,
  type InsertPendingPayment,
  type InsertBrand,
  type InsertDeviceModel,
  type InsertClaimValueSlab,
  type ClaimValueSlab,
  type ThemeSettings,
  type InsertThemeSettings,
  type SmtpSettings,
  type InsertSmtpSettings,
  type HomepageBanner,
  type InsertHomepageBanner
} from "@shared/schema";
import { db } from "./db";
import sql from 'mssql';
import bcrypt from 'bcryptjs';

export interface IStorage {
  // User Role operations (Master)
  createUserRole(role: InsertUserRole): Promise<UserRole>;
  getAllUserRoles(): Promise<UserRole[]>;
  getUserRoleById(id: number): Promise<UserRole | undefined>;
  updateUserRole(id: number, updates: Partial<InsertUserRole>): Promise<void>;
  deleteUserRole(id: number): Promise<void>;
  
  // Distributor operations (Master)
  createDistributor(distributor: InsertDistributor): Promise<Distributor>;
  getDistributorById(id: number): Promise<Distributor | undefined>;
  getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined>;
  getDistributorByEmail(email: string): Promise<Distributor | undefined>;
  getDistributorByContact(contact: string): Promise<Distributor | undefined>;
  getAllDistributors(): Promise<Distributor[]>;
  updateDistributor(id: number, updates: Partial<InsertDistributor>): Promise<void>;
  deleteDistributor(id: number): Promise<void>;
  
  // Distributor Authentication
  createDistributorSession(distributorId: number, contact: string): Promise<string>;
  verifyDistributorSession(token: string): Promise<Distributor | null>;
  deleteDistributorSession(token: string): Promise<void>;
  
  // Distributor Dashboard
  getDistributorStats(distributorId: number): Promise<{
    totalCustomers: number;
    totalEarnings: number;
    pendingPayouts: number;
    completedPayouts: number;
  }>;
  getDistributorCustomers(distributorId: number): Promise<Customer[]>;
  getDistributorPayouts(distributorId: number): Promise<any[]>;
  
  // Customer operations (Master)
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined>;
  getCustomersBySellerCode(sellerCode: string): Promise<Customer[]>;
  getCustomersByContact(contact: string): Promise<Customer[]>;
  getAllCustomers(): Promise<Customer[]>;
  getCustomersByRegistrationSource(registrationSource: string): Promise<Customer[]>;
  updateCustomerVerification(id: number, isVerified: boolean): Promise<void>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<void>;
  deleteCustomer(id: number): Promise<void>;
  
  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaimById(id: number): Promise<Claim | undefined>;
  getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined>;
  getAllClaims(): Promise<Claim[]>;
  updateClaimStatus(id: number, status: string): Promise<void>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<OtpVerification>;
  getOtpByContact(contact: string): Promise<OtpVerification | undefined>;
  verifyOtp(contact: string, otp: string): Promise<boolean>;
  
  // Admin operations (Master)
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  updateAdminUser(id: number, updates: Partial<InsertAdminUser>): Promise<void>;
  deleteAdminUser(id: number): Promise<void>;
  updateAdminLastLogin(id: number): Promise<void>;
  verifyAdminPassword(username: string, password: string): Promise<AdminUser | null>;

  // Pending Payment operations
  createPendingPayment(payment: InsertPendingPayment): Promise<PendingPayment>;
  getAllPendingPayments(): Promise<PendingPayment[]>;
  getPendingPaymentById(id: number): Promise<PendingPayment | undefined>;
  updatePendingPaymentStatus(id: number, status: string): Promise<void>;
  deletePendingPayment(id: number): Promise<void>;

  // Brand operations
  createBrand(brand: InsertBrand): Promise<Brand>;
  getAllBrands(): Promise<Brand[]>;
  getBrandsByDeviceType(deviceType: string): Promise<Brand[]>;
  updateBrand(id: number, updates: Partial<InsertBrand>): Promise<void>;
  deleteBrand(id: number): Promise<void>;

  // Device Model operations
  createDeviceModel(model: InsertDeviceModel): Promise<DeviceModel>;
  getAllDeviceModels(): Promise<DeviceModel[]>;
  getModelsByBrandId(brandId: number): Promise<DeviceModel[]>;
  updateDeviceModel(id: number, updates: Partial<InsertDeviceModel>): Promise<void>;
  deleteDeviceModel(id: number): Promise<void>;

  // Claim Value Slabs operations
  createClaimValueSlab(slab: InsertClaimValueSlab): Promise<ClaimValueSlab>;
  getAllClaimValueSlabs(): Promise<ClaimValueSlab[]>;
  getActiveClaimValueSlabs(): Promise<ClaimValueSlab[]>;
  getActiveClaimValueSlabsByDeviceType(deviceType: string): Promise<ClaimValueSlab[]>;
  getActiveClaimValueSlabsByDeviceTypeAndSource(deviceType: string, registrationSource: string): Promise<ClaimValueSlab[]>;
  getClaimValueSlabsByRegistrationSource(registrationSource: string): Promise<ClaimValueSlab[]>;
  getClaimValueSlabsByTypeAndBrand(deviceType: string, brand: string, registrationSource: string): Promise<ClaimValueSlab[]>;
  updateClaimValueSlab(id: number, updates: Partial<InsertClaimValueSlab>): Promise<void>;
  deleteClaimValueSlab(id: number): Promise<void>;
  getClaimValueSlabById(id: number): Promise<ClaimValueSlab | undefined>;

  // Theme Settings operations
  getCurrentThemeSettings(): Promise<ThemeSettings | undefined>;
  updateThemeSettings(settings: InsertThemeSettings): Promise<ThemeSettings>;
  
  // SMTP Settings operations
  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  updateSmtpSettings(settings: InsertSmtpSettings): Promise<SmtpSettings>;
  
  // Referral Discount Settings operations
  getReferralDiscountSettings(): Promise<ReferralDiscountSettings | undefined>;
  updateReferralDiscountSettings(settings: InsertReferralDiscountSettings): Promise<ReferralDiscountSettings>;
  
  // Homepage Banner operations
  getAllHomepageBanners(): Promise<HomepageBanner[]>;
  getActiveHomepageBanners(): Promise<HomepageBanner[]>;
  createHomepageBanner(banner: InsertHomepageBanner): Promise<HomepageBanner>;
  updateHomepageBanner(id: number, updates: Partial<InsertHomepageBanner>): Promise<void>;
  deleteHomepageBanner(id: number): Promise<void>;
  getHomepageBannerById(id: number): Promise<HomepageBanner | undefined>;
  
  // WhatsApp Configuration operations
  getWhatsAppConfig(): Promise<any>;
  updateWhatsAppConfig(config: { userId: string; password: string; baseUrl: string; isEnabled: boolean }): Promise<any>;
  getWhatsAppTemplates(): Promise<any[]>;
}

export class SqlServerStorage implements IStorage {
  
  constructor() {
    this.initializeDatabase();
  }

  // Force refresh SQL connection to clear schema cache
  async refreshConnection(): Promise<void> {
    try {
      if (db.pool && db.pool.connected) {
        await db.pool.close();
        console.log('Closed existing SQL Server connection for refresh');
      }
      await db.connectDB();
      console.log('Refreshed SQL Server connection');
    } catch (error) {
      console.error('Error refreshing SQL connection:', error);
    }
  }

  private async initializeDatabase() {
    try {
      await db.connectDB();
      
      // HIGHEST PRIORITY: Create theme_settings table FIRST
      await this.createThemeSettingsTableAtAnyCost();
      
      // Create homepage_banners table as well
      await this.createHomepageBannersTableAtAnyCost();
      
      await this.createTablesIfNotExist();
      await this.ensureDefaultBrandsExist();
      console.log('SQL Server database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQL Server database:', error);
    }
  }
  
  private async createThemeSettingsTableAtAnyCost() {
    try {
      console.log('🔥 ENSURING THEME_SETTINGS TABLE EXISTS IN DATABASE...');
      const themeTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'theme_settings')
        BEGIN
          CREATE TABLE theme_settings (
            id INT IDENTITY(1,1) PRIMARY KEY,
            primary_color NVARCHAR(7) NOT NULL DEFAULT '#254696',
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          );
          
          INSERT INTO theme_settings (primary_color) VALUES ('#254696');
          PRINT 'Theme settings table created with default color';
        END
        ELSE
        BEGIN
          PRINT 'Theme settings table already exists, preserving current data';
        END
      `;
      
      const themeRequest = db.pool.request();
      await themeRequest.query(themeTableQuery);
      console.log('✅ THEME_SETTINGS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
      // Create SMTP settings table as well
      console.log('🔥 ENSURING SMTP_SETTINGS TABLE EXISTS IN DATABASE...');
      const smtpTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'smtp_settings')
        BEGIN
          CREATE TABLE smtp_settings (
            id INT IDENTITY(1,1) PRIMARY KEY,
            smtp_host NVARCHAR(255) NOT NULL,
            smtp_port INT NOT NULL DEFAULT 587,
            smtp_username NVARCHAR(255) NOT NULL,
            smtp_password NVARCHAR(500) NOT NULL,
            from_address NVARCHAR(255) NOT NULL,
            is_active BIT DEFAULT 1,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          );
          PRINT 'SMTP settings table created';
        END
        ELSE
        BEGIN
          PRINT 'SMTP settings table already exists, preserving current data';
        END
      `;
      
      const smtpRequest = db.pool.request();
      await smtpRequest.query(smtpTableQuery);
      console.log('✅ SMTP_SETTINGS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
      // Create BBG Price settings table as well
      console.log('🔥 ENSURING BBG_PRICE_SETTINGS TABLE EXISTS IN DATABASE...');
      const bbgPriceTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bbg_price_settings')
        BEGIN
          CREATE TABLE bbg_price_settings (
            id INT IDENTITY(1,1) PRIMARY KEY,
            laptop_price DECIMAL(10,2) NOT NULL DEFAULT 299.00,
            mobile_price DECIMAL(10,2) NOT NULL DEFAULT 99.00,
            is_active BIT DEFAULT 1,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          );
          
          INSERT INTO bbg_price_settings (laptop_price, mobile_price) VALUES (299.00, 99.00);
          PRINT 'BBG price settings table created with default prices';
        END
        ELSE
        BEGIN
          PRINT 'BBG price settings table already exists, preserving current data';
        END
      `;
      
      const bbgPriceRequest = db.pool.request();
      await bbgPriceRequest.query(bbgPriceTableQuery);
      console.log('✅ BBG_PRICE_SETTINGS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
      // Create REFERRAL_DISCOUNT_SETTINGS table as well
      console.log('🔥 ENSURING REFERRAL_DISCOUNT_SETTINGS TABLE EXISTS IN DATABASE...');
      const referralDiscountTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referral_discount_settings')
        BEGIN
          CREATE TABLE referral_discount_settings (
            id INT IDENTITY(1,1) PRIMARY KEY,
            is_active BIT DEFAULT 0,
            discount_type NVARCHAR(20) NOT NULL DEFAULT 'percentage',
            discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          );
          
          INSERT INTO referral_discount_settings (is_active, discount_type, discount_value) 
          VALUES (0, 'percentage', 10.00);
          PRINT 'Referral discount settings table created with default 10% discount (inactive)';
        END
        ELSE
        BEGIN
          PRINT 'Referral discount settings table already exists, preserving current data';
        END
      `;
      
      const referralDiscountRequest = db.pool.request();
      await referralDiscountRequest.query(referralDiscountTableQuery);
      console.log('✅ REFERRAL_DISCOUNT_SETTINGS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
      // Create transaction_history table
      console.log('🔥 ENSURING TRANSACTION_HISTORY TABLE EXISTS IN DATABASE...');
      const transactionHistoryQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'transaction_history')
        BEGIN
          CREATE TABLE transaction_history (
            id NVARCHAR(100) PRIMARY KEY DEFAULT NEWID(),
            customer_id NVARCHAR(50),
            customer_name NVARCHAR(255) NOT NULL,
            customer_email NVARCHAR(255),
            customer_contact NVARCHAR(20),
            transaction_id NVARCHAR(255) NOT NULL,
            payment_method NVARCHAR(50) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency NVARCHAR(10) DEFAULT 'INR',
            status NVARCHAR(50) DEFAULT 'pending',
            device_type NVARCHAR(50),
            device_brand NVARCHAR(100),
            referral_code NVARCHAR(20),
            discount_applied DECIMAL(10,2) DEFAULT 0,
            original_amount DECIMAL(10,2),
            registration_source NVARCHAR(50) DEFAULT 'regular',
            metadata NVARCHAR(MAX),
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          );
        END
      `;
      const transactionHistoryRequest = db.pool.request();
      await transactionHistoryRequest.query(transactionHistoryQuery);
      console.log('✅ TRANSACTION_HISTORY TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
      // Create WAITING_PERIOD_SETTINGS table as well
      console.log('🔥 ENSURING WAITING_PERIOD_SETTINGS TABLE EXISTS IN DATABASE...');
      const waitingPeriodTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'waiting_period_settings')
        BEGIN
          CREATE TABLE waiting_period_settings (
            id INT IDENTITY(1,1) PRIMARY KEY,
            setting_name NVARCHAR(50) NOT NULL,
            enabled BIT NOT NULL DEFAULT 1,
            months INT NOT NULL DEFAULT 3,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            UNIQUE(setting_name)
          );
          
          INSERT INTO waiting_period_settings (setting_name, enabled, months) 
          VALUES ('claim_waiting_period', 1, 3);
          PRINT 'Waiting period settings table created with default 3-month setting';
        END
        ELSE
        BEGIN
          PRINT 'Waiting period settings table already exists, preserving current data';
        END
      `;
      
      const waitingPeriodRequest = db.pool.request();
      await waitingPeriodRequest.query(waitingPeriodTableQuery);
      console.log('✅ WAITING_PERIOD_SETTINGS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
      // Create DEVICE_REGISTRATIONS table for post-purchase registrations
      console.log('🔥 ENSURING DEVICE_REGISTRATIONS TABLE EXISTS IN DATABASE...');
      const deviceRegistrationsTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'device_registrations')
        BEGIN
          CREATE TABLE device_registrations (
            id INT IDENTITY(1,1) PRIMARY KEY,
            purchase_type NVARCHAR(50) NOT NULL,
            device_type NVARCHAR(50) NOT NULL,
            imei_serial NVARCHAR(100) NOT NULL,
            brand NVARCHAR(100) NOT NULL,
            model NVARCHAR(255) NOT NULL,
            purchase_price NVARCHAR(50) NOT NULL,
            purchase_date NVARCHAR(50) NOT NULL,
            name NVARCHAR(255) NOT NULL,
            phone NVARCHAR(20) NOT NULL,
            email NVARCHAR(255) NOT NULL,
            pincode NVARCHAR(10) NOT NULL,
            registration_id NVARCHAR(100) NOT NULL UNIQUE,
            voucher_code NVARCHAR(100) NOT NULL UNIQUE,
            is_verified BIT DEFAULT 1,
            registration_source NVARCHAR(50) DEFAULT 'post_purchase',
            created_at DATETIME2 DEFAULT GETDATE()
          );
          PRINT 'Device registrations table created for post-purchase registrations';
        END
        ELSE
        BEGIN
          PRINT 'Device registrations table already exists, preserving current data';
        END
      `;
      
      const deviceRegistrationsRequest = db.pool.request();
      await deviceRegistrationsRequest.query(deviceRegistrationsTableQuery);
      console.log('✅ DEVICE_REGISTRATIONS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
    } catch (themeError) {
      console.error('❌ TABLE CREATION FAILED:', themeError);
      throw themeError;
    }
  }

  private async createTablesIfNotExist() {
    const createTablesScript = `
      -- Create user_roles table (Master)
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_roles')
      BEGIN
        CREATE TABLE user_roles (
          id INT IDENTITY(1,1) PRIMARY KEY,
          role_name NVARCHAR(50) NOT NULL UNIQUE,
          description NVARCHAR(500) NOT NULL,
          permissions NVARCHAR(MAX) NOT NULL,
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
        
        -- Insert default roles
        INSERT INTO user_roles (role_name, description, permissions) VALUES
        ('super_admin', 'Full system access with all permissions', '["all"]'),
        ('admin', 'Administrative access with most permissions', '["user_management", "distributor_management", "customer_management", "claims_management", "reports"]'),
        ('moderator', 'Limited admin access for content moderation', '["customer_management", "claims_review", "reports_view"]'),
        ('viewer', 'Read-only access to reports and data', '["reports_view", "data_view"]');
      END

      -- Create distributors table (Master)
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'distributors')
      BEGIN
        CREATE TABLE distributors (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          business_name NVARCHAR(255),
          contact NVARCHAR(10) NOT NULL UNIQUE,
          email NVARCHAR(255) NOT NULL UNIQUE,
          pincode NVARCHAR(6) NOT NULL,
          preferred_mode NVARCHAR(50) NOT NULL,
          pan_number NVARCHAR(10),
          pan_copy_file NVARCHAR(255),
          is_gst_registered BIT DEFAULT 0,
          gstin NVARCHAR(15),
          gst_certificate_file NVARCHAR(255),
          registered_business_address NVARCHAR(500),
          is_msme_registered BIT DEFAULT 0,
          msme_certificate_file NVARCHAR(255),
          account_holder_name NVARCHAR(255),
          bank_account NVARCHAR(50),
          bank_account_confirm NVARCHAR(50),
          ifsc_code NVARCHAR(11),
          upi_id NVARCHAR(100),
          cancelled_cheque_file NVARCHAR(255),
          info_declaration BIT DEFAULT 0,
          tds_understanding BIT DEFAULT 0,
          gst_invoice_agreement BIT DEFAULT 0,
          terms_agreement BIT DEFAULT 0,
          seller_code NVARCHAR(10) NOT NULL UNIQUE,
          commission_earned DECIMAL(10,2) DEFAULT 0,
          total_customers INT DEFAULT 0,
          is_active BIT DEFAULT 1,
          is_verified BIT DEFAULT 0,
          created_at DATETIME2 DEFAULT GETDATE()
        );
      END
      


      -- Create customers table (Master)
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customers')
      BEGIN
        CREATE TABLE customers (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          contact NVARCHAR(10) NOT NULL,
          email NVARCHAR(255) NOT NULL,
          pincode NVARCHAR(6) NOT NULL,
          device_type NVARCHAR(50) NOT NULL,
          serial_number NVARCHAR(255) NOT NULL,
          brand NVARCHAR(100) NOT NULL,
          model_name NVARCHAR(255) NOT NULL,
          invoice_value DECIMAL(10,2) NOT NULL,
          date_of_purchase NVARCHAR(20),
          seller_code NVARCHAR(10),
          voucher_code NVARCHAR(15) NOT NULL UNIQUE,
          payment_intent_id NVARCHAR(255),
          is_verified BIT DEFAULT 0,
          created_at DATETIME2 DEFAULT GETDATE()
        );
      END
      
      -- Add date_of_purchase column to existing customers table if it doesn't exist
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'customers')
      BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'date_of_purchase')
        BEGIN
          ALTER TABLE customers ADD date_of_purchase NVARCHAR(20);
        END
        
        -- Add registration_source column to track source of registration (acer, regular)
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'registration_source')
        BEGIN
          ALTER TABLE customers ADD registration_source NVARCHAR(20) DEFAULT 'regular';
        END
        
        -- Add invoice_file column for Acer registrations that upload files
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'invoice_file')
        BEGIN
          ALTER TABLE customers ADD invoice_file NVARCHAR(500);
        END
        
        -- Add claim_value_slab_id column to track which slab was active during registration
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'claim_value_slab_id')
        BEGIN
          ALTER TABLE customers ADD claim_value_slab_id INT;
        END
        
        -- Add registration_slab_data column to store complete slab structure at registration time
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'registration_slab_data')
        BEGIN
          ALTER TABLE customers ADD registration_slab_data NVARCHAR(MAX);
        END
        
        -- Add dual-flow BBG system columns
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'purchase_timing_category')
        BEGIN
          ALTER TABLE customers ADD purchase_timing_category NVARCHAR(50);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'benefit_type')
        BEGIN
          ALTER TABLE customers ADD benefit_type NVARCHAR(50);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'plan_price')
        BEGIN
          ALTER TABLE customers ADD plan_price DECIMAL(10,2);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'benefits_json')
        BEGIN
          ALTER TABLE customers ADD benefits_json NVARCHAR(MAX);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'email_template_key')
        BEGIN
          ALTER TABLE customers ADD email_template_key NVARCHAR(100);
        END
      END

      -- Create claims table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'claims')
      BEGIN
        CREATE TABLE claims (
          id INT IDENTITY(1,1) PRIMARY KEY,
          customer_id INT NOT NULL,
          voucher_code NVARCHAR(15) NOT NULL,
          contact NVARCHAR(10) NOT NULL,
          email NVARCHAR(255) NOT NULL,
          serial_number NVARCHAR(255) NOT NULL,
          pickup_date NVARCHAR(20) NOT NULL,
          pickup_time_slot NVARCHAR(50) NOT NULL,
          device_age_months INT NOT NULL,
          claim_percentage DECIMAL(5,2) NOT NULL,
          claim_amount DECIMAL(10,2) NOT NULL,
          status NVARCHAR(50) DEFAULT 'pending',
          created_at DATETIME2 DEFAULT GETDATE()
        );
      END

      -- Add new columns to existing claims table if they don't exist
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'claims')
      BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('claims') AND name = 'serial_number')
        BEGIN
          ALTER TABLE claims ADD serial_number NVARCHAR(255) DEFAULT '';
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('claims') AND name = 'pickup_date')
        BEGIN
          ALTER TABLE claims ADD pickup_date NVARCHAR(20) DEFAULT '';
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('claims') AND name = 'pickup_time_slot')
        BEGIN
          ALTER TABLE claims ADD pickup_time_slot NVARCHAR(50) DEFAULT '';
        END
      END

      -- Create claim_value_slabs table for managing depreciation percentages
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'claim_value_slabs')
      BEGIN
        CREATE TABLE claim_value_slabs (
          id INT IDENTITY(1,1) PRIMARY KEY,
          device_type NVARCHAR(50) NOT NULL,
          brand NVARCHAR(100),
          min_months INT NOT NULL,
          max_months INT NOT NULL,
          percentage INT NOT NULL,
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
        
        -- Insert default claim value slabs for mobile
        INSERT INTO claim_value_slabs (device_type, min_months, max_months, percentage, is_active) VALUES
        ('mobile', 6, 12, 70, 1),
        ('mobile', 13, 18, 60, 1),
        ('mobile', 19, 24, 50, 1),
        ('mobile', 25, 30, 40, 1),
        ('mobile', 31, 36, 30, 1),
        ('mobile', 37, 48, 20, 1),
        ('mobile', 49, 60, 10, 1);
        
        -- Insert default claim value slabs for laptop
        INSERT INTO claim_value_slabs (device_type, min_months, max_months, percentage, is_active) VALUES
        ('laptop', 6, 12, 75, 1),
        ('laptop', 13, 18, 65, 1),
        ('laptop', 19, 24, 55, 1),
        ('laptop', 25, 30, 45, 1),
        ('laptop', 31, 36, 35, 1),
        ('laptop', 37, 48, 25, 1),
        ('laptop', 49, 60, 15, 1);
      END
      
      -- Add device_type and brand columns to existing claim_value_slabs table if they don't exist
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'claim_value_slabs')
      BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('claim_value_slabs') AND name = 'device_type')
        BEGIN
          ALTER TABLE claim_value_slabs ADD device_type NVARCHAR(50) DEFAULT 'mobile';
          -- Update existing records to have device types
          UPDATE claim_value_slabs SET device_type = 'mobile' WHERE device_type IS NULL OR device_type = '';
        END

        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('claim_value_slabs') AND name = 'brand')
        BEGIN
          ALTER TABLE claim_value_slabs ADD brand NVARCHAR(100);
          
          -- Clear existing data to prepare for brand-specific slabs
          DELETE FROM claim_value_slabs;
          
          -- Insert brand-specific laptop claim value slabs based on your requirements
          INSERT INTO claim_value_slabs (device_type, brand, min_months, max_months, percentage, is_active, created_at, updated_at) VALUES
          -- 6 to 12 Months
          ('laptop', 'HP', 6, 12, 60, 1, GETDATE(), GETDATE()),
          ('laptop', 'Dell', 6, 12, 60, 1, GETDATE(), GETDATE()),
          ('laptop', 'Lenovo', 6, 12, 60, 1, GETDATE(), GETDATE()),
          ('laptop', 'Acer', 6, 12, 60, 1, GETDATE(), GETDATE()),
          ('laptop', 'Asus', 6, 12, 55, 1, GETDATE(), GETDATE()),
          ('laptop', 'Macbook', 6, 12, 65, 1, GETDATE(), GETDATE()),
          ('laptop', 'Others', 6, 12, 50, 1, GETDATE(), GETDATE()),
          
          -- 13 to 18 Months
          ('laptop', 'HP', 13, 18, 50, 1, GETDATE(), GETDATE()),
          ('laptop', 'Dell', 13, 18, 50, 1, GETDATE(), GETDATE()),
          ('laptop', 'Lenovo', 13, 18, 50, 1, GETDATE(), GETDATE()),
          ('laptop', 'Acer', 13, 18, 50, 1, GETDATE(), GETDATE()),
          ('laptop', 'Asus', 13, 18, 45, 1, GETDATE(), GETDATE()),
          ('laptop', 'Macbook', 13, 18, 55, 1, GETDATE(), GETDATE()),
          ('laptop', 'Others', 13, 18, 40, 1, GETDATE(), GETDATE()),
          
          -- 19 to 24 Months
          ('laptop', 'HP', 19, 24, 40, 1, GETDATE(), GETDATE()),
          ('laptop', 'Dell', 19, 24, 40, 1, GETDATE(), GETDATE()),
          ('laptop', 'Lenovo', 19, 24, 40, 1, GETDATE(), GETDATE()),
          ('laptop', 'Acer', 19, 24, 40, 1, GETDATE(), GETDATE()),
          ('laptop', 'Asus', 19, 24, 35, 1, GETDATE(), GETDATE()),
          ('laptop', 'Macbook', 19, 24, 45, 1, GETDATE(), GETDATE()),
          ('laptop', 'Others', 19, 24, 30, 1, GETDATE(), GETDATE()),
          
          -- 25 to 30 Months
          ('laptop', 'HP', 25, 30, 30, 1, GETDATE(), GETDATE()),
          ('laptop', 'Dell', 25, 30, 30, 1, GETDATE(), GETDATE()),
          ('laptop', 'Lenovo', 25, 30, 30, 1, GETDATE(), GETDATE()),
          ('laptop', 'Acer', 25, 30, 30, 1, GETDATE(), GETDATE()),
          ('laptop', 'Asus', 25, 30, 25, 1, GETDATE(), GETDATE()),
          ('laptop', 'Macbook', 25, 30, 35, 1, GETDATE(), GETDATE()),
          ('laptop', 'Others', 25, 30, 20, 1, GETDATE(), GETDATE()),
          
          -- 31 to 36 Months
          ('laptop', 'HP', 31, 36, 20, 1, GETDATE(), GETDATE()),
          ('laptop', 'Dell', 31, 36, 20, 1, GETDATE(), GETDATE()),
          ('laptop', 'Lenovo', 31, 36, 20, 1, GETDATE(), GETDATE()),
          ('laptop', 'Acer', 31, 36, 20, 1, GETDATE(), GETDATE()),
          ('laptop', 'Asus', 31, 36, 15, 1, GETDATE(), GETDATE()),
          ('laptop', 'Macbook', 31, 36, 25, 1, GETDATE(), GETDATE()),
          ('laptop', 'Others', 31, 36, 10, 1, GETDATE(), GETDATE()),
          
          -- Add mobile device slabs (generic for all brands for now)
          ('mobile', NULL, 6, 12, 70, 1, GETDATE(), GETDATE()),
          ('mobile', NULL, 13, 18, 60, 1, GETDATE(), GETDATE()),
          ('mobile', NULL, 19, 24, 50, 1, GETDATE(), GETDATE()),
          ('mobile', NULL, 25, 30, 40, 1, GETDATE(), GETDATE()),
          ('mobile', NULL, 31, 36, 30, 1, GETDATE(), GETDATE()),
          ('mobile', NULL, 37, 48, 20, 1, GETDATE(), GETDATE()),
          ('mobile', NULL, 49, 60, 10, 1, GETDATE(), GETDATE());
        END
      END

      -- Create otp_verifications table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'otp_verifications')
      BEGIN
        CREATE TABLE otp_verifications (
          id INT IDENTITY(1,1) PRIMARY KEY,
          contact NVARCHAR(10) NOT NULL,
          otp NVARCHAR(6) NOT NULL,
          expires_at DATETIME2 NOT NULL,
          is_verified BIT DEFAULT 0,
          created_at DATETIME2 DEFAULT GETDATE()
        );
      END

      -- Create admin_users table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'admin_users')
      BEGIN
        CREATE TABLE admin_users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(100) NOT NULL UNIQUE,
          email NVARCHAR(255) NOT NULL UNIQUE,
          password_hash NVARCHAR(255) NOT NULL,
          role NVARCHAR(50) DEFAULT 'admin',
          is_active BIT DEFAULT 1,
          last_login_at DATETIME2,
          created_at DATETIME2 DEFAULT GETDATE()
        );
      END

      -- Create pending_payments table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pending_payments')
      BEGIN
        CREATE TABLE pending_payments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          contact NVARCHAR(10) NOT NULL,
          email NVARCHAR(255) NOT NULL,
          pincode NVARCHAR(6) NOT NULL,
          device_type NVARCHAR(50) NOT NULL,
          serial_number NVARCHAR(255) NOT NULL,
          brand NVARCHAR(255) NOT NULL,
          model_name NVARCHAR(255) NOT NULL,
          invoice_value DECIMAL(10,2) NOT NULL,
          payment_amount DECIMAL(10,2) NOT NULL,
          transaction_id NVARCHAR(255),
          seller_code NVARCHAR(10),
          status NVARCHAR(50) DEFAULT 'pending',
          expires_at DATETIME2 NOT NULL,
          created_at DATETIME2 DEFAULT GETDATE()
        );
      END

      -- Fix serial_number column to allow NULL for regular BBG flow (one-time schema update)
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'pending_payments')
      BEGIN
        IF EXISTS (SELECT * FROM sys.columns 
                   WHERE object_id = OBJECT_ID('pending_payments') 
                   AND name = 'serial_number' 
                   AND is_nullable = 0)
        BEGIN
          ALTER TABLE pending_payments ALTER COLUMN serial_number NVARCHAR(255) NULL;
          PRINT 'Updated pending_payments.serial_number to allow NULL for regular BBG flow';
        END
        
        -- Add dual-flow BBG system columns to pending_payments
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pending_payments') AND name = 'purchase_timing_category')
        BEGIN
          ALTER TABLE pending_payments ADD purchase_timing_category NVARCHAR(50);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pending_payments') AND name = 'benefit_type')
        BEGIN
          ALTER TABLE pending_payments ADD benefit_type NVARCHAR(50);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pending_payments') AND name = 'plan_price')
        BEGIN
          ALTER TABLE pending_payments ADD plan_price DECIMAL(10,2);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pending_payments') AND name = 'benefits_json')
        BEGIN
          ALTER TABLE pending_payments ADD benefits_json NVARCHAR(MAX);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('pending_payments') AND name = 'email_template_key')
        BEGIN
          ALTER TABLE pending_payments ADD email_template_key NVARCHAR(100);
        END
      END

      -- Create brands table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'brands')
      BEGIN
        CREATE TABLE brands (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          device_type NVARCHAR(20) NOT NULL CHECK (device_type IN ('mobile', 'laptop')),
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );

        -- Insert default brands
        INSERT INTO brands (name, device_type) VALUES
        ('Apple', 'mobile'), ('Samsung', 'mobile'), ('Xiaomi', 'mobile'), ('OnePlus', 'mobile'), ('Oppo', 'mobile'),
        ('Vivo', 'mobile'), ('Realme', 'mobile'), ('Motorola', 'mobile'), ('Google', 'mobile'), ('Nokia', 'mobile'),
        ('Huawei', 'mobile'), ('Honor', 'mobile'), ('Nothing', 'mobile'), ('iQOO', 'mobile'), ('Poco', 'mobile'),
        ('Apple', 'laptop'), ('Dell', 'laptop'), ('HP', 'laptop'), ('Lenovo', 'laptop'), ('Asus', 'laptop'),
        ('Acer', 'laptop'), ('MSI', 'laptop'), ('Samsung', 'laptop'), ('Microsoft', 'laptop'), ('LG', 'laptop');
      END

      -- Create models table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'models')
      BEGIN
        CREATE TABLE models (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          brand_id INT NOT NULL,
          device_type NVARCHAR(20) NOT NULL,
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
          UNIQUE(name, brand_id)
        );
      END
      
      -- Add device_type column to existing models table if it doesn't exist
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'models')
      BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('models') AND name = 'device_type')
        BEGIN
          ALTER TABLE models ADD device_type NVARCHAR(20) NOT NULL DEFAULT 'mobile';
        END
      END

      -- Create distributor_sessions table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'distributor_sessions')
      BEGIN
        CREATE TABLE distributor_sessions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          distributor_id INT NOT NULL,
          session_token NVARCHAR(255) NOT NULL UNIQUE,
          expires_at DATETIME2 NOT NULL,
          created_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE
        );
      END

      -- Create commission_payouts table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'commission_payouts')
      BEGIN
        CREATE TABLE commission_payouts (
          id INT IDENTITY(1,1) PRIMARY KEY,
          distributor_id INT NOT NULL,
          customer_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status NVARCHAR(50) DEFAULT 'pending',
          payment_reference NVARCHAR(255),
          paid_at DATETIME2,
          created_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (distributor_id) REFERENCES distributors(id),
          FOREIGN KEY (customer_id) REFERENCES customers(id)
        );
      END

      -- Create cart_abandonments table for tracking incomplete registrations
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cart_abandonments')
      BEGIN
        CREATE TABLE cart_abandonments (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255),
          contact NVARCHAR(15),
          email NVARCHAR(255),
          pincode NVARCHAR(10),
          device_type NVARCHAR(50),
          serial_number NVARCHAR(255),
          brand NVARCHAR(100),
          model_name NVARCHAR(255),
          invoice_value DECIMAL(10,2),
          seller_code NVARCHAR(20),
          session_id NVARCHAR(255) NOT NULL,
          stage NVARCHAR(50) DEFAULT 'form_started',
          last_activity DATETIME2 DEFAULT GETDATE(),
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END

      -- Create acer_imei_validation table for Acer IMEI/Serial validation
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'acer_imei_validation')
      BEGIN
        CREATE TABLE acer_imei_validation (
          id INT IDENTITY(1,1) PRIMARY KEY,
          imei NVARCHAR(255) NOT NULL UNIQUE,
          model NVARCHAR(255) NOT NULL,
          brand NVARCHAR(100) DEFAULT 'Acer',
          uploaded_at DATETIME2 DEFAULT GETDATE(),
          created_at DATETIME2 DEFAULT GETDATE()
        );
        
        -- Create index for faster IMEI lookups
        CREATE INDEX IX_acer_imei_validation_imei ON acer_imei_validation(imei);
      END

      -- Create amazon_license_codes table for Amazon BBG license validation
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'amazon_license_codes')
      BEGIN
        CREATE TABLE amazon_license_codes (
          id INT IDENTITY(1,1) PRIMARY KEY,
          license_code NVARCHAR(255) NOT NULL UNIQUE,
          device_type NVARCHAR(20) NOT NULL,
          is_used BIT DEFAULT 0,
          used_by_customer_id INT NULL,
          uploaded_at DATETIME2 DEFAULT GETDATE(),
          created_at DATETIME2 DEFAULT GETDATE()
        );
        
        -- Create index for faster license code lookups
        CREATE INDEX IX_amazon_license_codes_code ON amazon_license_codes(license_code);
      END
      ELSE
      BEGIN
        -- Add device_type column if table exists but column doesn't
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('amazon_license_codes') AND name = 'device_type')
        BEGIN
          ALTER TABLE amazon_license_codes ADD device_type NVARCHAR(20) DEFAULT 'mobile';
        END
      END



      -- Create claim_value_slabs table for dynamic claim percentage management
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'claim_value_slabs')
      BEGIN
        CREATE TABLE claim_value_slabs (
          id INT IDENTITY(1,1) PRIMARY KEY,
          min_months INT NOT NULL,
          max_months INT NOT NULL,
          percentage INT NOT NULL,
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );

        -- Insert default claim value slabs
        INSERT INTO claim_value_slabs (min_months, max_months, percentage, is_active) VALUES
        (6, 12, 70, 1),
        (13, 18, 60, 1),
        (19, 24, 50, 1),
        (25, 30, 40, 1),
        (31, 36, 30, 1),
        (37, 48, 25, 1),
        (49, 60, 20, 1);
      END

      -- Add claim_value_slab_id column to customers table if it doesn't exist
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'customers')
      BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'claim_value_slab_id')
        BEGIN
          ALTER TABLE customers ADD claim_value_slab_id INT;
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'date_of_purchase')
        BEGIN
          ALTER TABLE customers ADD date_of_purchase NVARCHAR(10);
        END
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('customers') AND name = 'registration_source')
        BEGIN
          ALTER TABLE customers ADD registration_source NVARCHAR(20) DEFAULT 'regular';
        END
      END

      -- Create theme_settings table
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'theme_settings')
      BEGIN
        CREATE TABLE theme_settings (
          id INT IDENTITY(1,1) PRIMARY KEY,
          primary_color NVARCHAR(7) NOT NULL DEFAULT '#254696',
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
        
        -- Insert default theme
        INSERT INTO theme_settings (primary_color) VALUES ('#254696');
      END

      -- Create homepage_banners table for slider management
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'homepage_banners')
      BEGIN
        CREATE TABLE homepage_banners (
          id INT IDENTITY(1,1) PRIMARY KEY,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          desktop_image_url NVARCHAR(500) NOT NULL,
          mobile_image_url NVARCHAR(500) NOT NULL,
          link_url NVARCHAR(500),
          is_active BIT DEFAULT 1,
          sort_order INT DEFAULT 0,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END
    `;

    const request = db.pool.request();
    await request.query(createTablesScript);
    
    console.log("Database tables initialized successfully");
  }

  // Force create homepage_banners table
  private async createHomepageBannersTableAtAnyCost() {
    try {
      await db.connectDB();
      
      console.log('🔥 ENSURING HOMEPAGE_BANNERS TABLE EXISTS IN DATABASE...');
      const homepageBannersTableQuery = `
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'homepage_banners')
        BEGIN
          CREATE TABLE homepage_banners (
            id INT IDENTITY(1,1) PRIMARY KEY,
            title NVARCHAR(255) NOT NULL,
            description NVARCHAR(MAX),
            desktop_image_url NVARCHAR(500) NOT NULL,
            mobile_image_url NVARCHAR(500) NOT NULL,
            link_url NVARCHAR(500),
            is_active BIT DEFAULT 1,
            sort_order INT DEFAULT 0,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
          );
          PRINT 'Homepage banners table created';
        END
        ELSE
        BEGIN
          PRINT 'Homepage banners table already exists, preserving current data';
        END
      `;
      
      const homepageRequest = db.pool.request();
      await homepageRequest.query(homepageBannersTableQuery);
      console.log('✅ HOMEPAGE_BANNERS TABLE CONFIRMED IN SQL SERVER DATABASE!!!');
      
    } catch (error) {
      console.error('❌ HOMEPAGE_BANNERS TABLE CREATION FAILED:', error);
    }
  }

  // Ensure default brands exist in database
  private async ensureDefaultBrandsExist() {
    try {
      await db.connectDB();
      
      // Check if brands table has any records
      const countQuery = 'SELECT COUNT(*) as brand_count FROM brands WHERE is_active = 1';
      const countResult = await db.pool.request().query(countQuery);
      const brandCount = countResult.recordset[0].brand_count;
      
      console.log(`🔍 Found ${brandCount} active brands in database`);
      
      if (brandCount === 0) {
        console.log('🔥 INSERTING DEFAULT BRANDS INTO EMPTY TABLE...');
        
        const insertBrandsQuery = `
          INSERT INTO brands (name, device_type) VALUES
          ('Apple', 'mobile'), ('Samsung', 'mobile'), ('Xiaomi', 'mobile'), ('OnePlus', 'mobile'), ('Oppo', 'mobile'),
          ('Vivo', 'mobile'), ('Realme', 'mobile'), ('Motorola', 'mobile'), ('Google', 'mobile'), ('Nokia', 'mobile'),
          ('Huawei', 'mobile'), ('Honor', 'mobile'), ('Nothing', 'mobile'), ('iQOO', 'mobile'), ('Poco', 'mobile'),
          ('Apple', 'laptop'), ('Dell', 'laptop'), ('HP', 'laptop'), ('Lenovo', 'laptop'), ('Asus', 'laptop'),
          ('Acer', 'laptop'), ('MSI', 'laptop'), ('Samsung', 'laptop'), ('Microsoft', 'laptop'), ('LG', 'laptop');
        `;
        
        await db.pool.request().query(insertBrandsQuery);
        
        // Verify insertion
        const newCountResult = await db.pool.request().query(countQuery);
        const newBrandCount = newCountResult.recordset[0].brand_count;
        console.log(`✅ Successfully inserted ${newBrandCount} default brands!`);
      } else {
        console.log('✅ Default brands already exist in database');
      }
    } catch (error) {
      console.error('❌ Error ensuring default brands exist:', error);
    }
  }

  // Distributor operations
  async createDistributor(insertDistributor: InsertDistributor): Promise<Distributor> {
    await db.connectDB();
    const sellerCode = this.generateSellerCode(insertDistributor.name, insertDistributor.contact);
    
    const query = `
      INSERT INTO distributors (
        name, contact, email, pincode, preferred_mode,
        pan_number, pan_copy_file, is_gst_registered, gstin, gst_certificate_file,
        is_msme_registered, msme_certificate_file,
        account_holder_name, bank_account, bank_account_confirm, ifsc_code, upi_id,
        cancelled_cheque_file, info_declaration, tds_understanding, gst_invoice_agreement,
        terms_agreement, seller_code
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @contact, @email, @pincode, @preferredMode,
        @panNumber, @panCopyFile, @isGstRegistered, @gstin, @gstCertificateFile,
        @isMsmeRegistered, @msmeCertificateFile,
        @accountHolderName, @bankAccount, @bankAccountConfirm, @ifscCode, @upiId,
        @cancelledChequeFile, @infoDeclaration, @tdsUnderstanding, @gstInvoiceAgreement,
        @termsAgreement, @sellerCode
      )
    `;

    const request = db.pool.request();
    // Basic info
    request.input('name', sql.NVarChar, insertDistributor.name);
    request.input('contact', sql.NVarChar, insertDistributor.contact);
    request.input('email', sql.NVarChar, insertDistributor.email);
    request.input('pincode', sql.NVarChar, insertDistributor.pincode || '000000');
    request.input('preferredMode', sql.NVarChar, insertDistributor.preferredMode || 'TBD');
    
    // Tax & Compliance Details - set defaults for missing fields
    request.input('panNumber', sql.NVarChar, insertDistributor.panNumber || null);
    request.input('panCopyFile', sql.NVarChar, insertDistributor.panCopyFile || null);
    request.input('isGstRegistered', sql.Bit, insertDistributor.isGstRegistered || false);
    request.input('gstin', sql.NVarChar, insertDistributor.gstin || null);
    request.input('gstCertificateFile', sql.NVarChar, insertDistributor.gstCertificateFile || null);
    request.input('isMsmeRegistered', sql.Bit, insertDistributor.isMsmeRegistered || false);
    request.input('msmeCertificateFile', sql.NVarChar, insertDistributor.msmeCertificateFile || null);
    
    // Bank Details - set defaults for missing fields
    request.input('accountHolderName', sql.NVarChar, insertDistributor.accountHolderName || null);
    request.input('bankAccount', sql.NVarChar, insertDistributor.bankAccount || null);
    request.input('bankAccountConfirm', sql.NVarChar, insertDistributor.bankAccountConfirm || null);
    request.input('ifscCode', sql.NVarChar, insertDistributor.ifscCode || null);
    request.input('upiId', sql.NVarChar, insertDistributor.upiId || null);
    request.input('cancelledChequeFile', sql.NVarChar, insertDistributor.cancelledChequeFile || null);
    
    // Declarations - map new field names
    request.input('infoDeclaration', sql.Bit, insertDistributor.declarationAccuracy || false);
    request.input('tdsUnderstanding', sql.Bit, insertDistributor.tdsUnderstanding || false);
    request.input('gstInvoiceAgreement', sql.Bit, insertDistributor.gstInvoiceAgreement || false);
    request.input('termsAgreement', sql.Bit, insertDistributor.declarationAccuracy || insertDistributor.tdsUnderstanding || insertDistributor.gstInvoiceAgreement || false);
    
    request.input('sellerCode', sql.NVarChar, sellerCode);

    const result = await request.query(query);
    return this.mapDistributorFromDb(result.recordset[0]);
  }

  async getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM distributors WHERE seller_code = @sellerCode`;
    
    const request = db.pool.request();
    request.input('sellerCode', sql.NVarChar, sellerCode);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapDistributorFromDb(result.recordset[0]) : undefined;
  }

  async getDistributorByEmail(email: string): Promise<Distributor | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM distributors WHERE email = @email`;
    
    const request = db.pool.request();
    request.input('email', sql.NVarChar, email);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapDistributorFromDb(result.recordset[0]) : undefined;
  }

  async getDistributorByContact(contact: string): Promise<Distributor | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM distributors WHERE contact = @contact`;
    
    const request = db.pool.request();
    request.input('contact', sql.NVarChar, contact);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapDistributorFromDb(result.recordset[0]) : undefined;
  }

  async getDistributorById(id: number): Promise<Distributor | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM distributors WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapDistributorFromDb(result.recordset[0]) : undefined;
  }

  // Distributor Authentication
  async createDistributorSession(distributorId: number, contact: string): Promise<string> {
    try {
      await db.connectDB();
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour session

      console.log("🔐 Creating distributor session:", {
        distributorId,
        contact,
        sessionToken,
        expiresAt: expiresAt.toISOString()
      });

      const query = `
        INSERT INTO distributor_sessions (distributor_id, session_token, expires_at)
        VALUES (@distributorId, @sessionToken, @expiresAt)
      `;

      const request = db.pool.request();
      request.input('distributorId', sql.Int, distributorId);
      request.input('sessionToken', sql.NVarChar, sessionToken);
      request.input('expiresAt', sql.DateTime2, expiresAt);

      const result = await request.query(query);
      console.log("✅ Session created successfully:", result.rowsAffected);
      return sessionToken;
    } catch (error) {
      console.error("❌ Session creation failed:", error);
      throw error;
    }
  }

  async verifyDistributorSession(token: string): Promise<Distributor | null> {
    try {
      await db.connectDB();
      console.log("🔍 Verifying distributor session:", token);
      
      const query = `
        SELECT d.*, ds.expires_at 
        FROM distributors d
        INNER JOIN distributor_sessions ds ON d.id = ds.distributor_id
        WHERE ds.session_token = @token AND ds.expires_at > GETDATE()
      `;

      const request = db.pool.request();
      request.input('token', sql.NVarChar, token);

      const result = await request.query(query);
      console.log("🔍 Session verification result:", {
        recordsFound: result.recordset.length,
        currentTime: new Date().toISOString()
      });

      if (result.recordset.length > 0) {
        console.log("✅ Session verified successfully");
        return this.mapDistributorFromDb(result.recordset[0]);
      }
      
      // Check if session exists but expired (simplified)
      const expiredCheckQuery = `
        SELECT expires_at FROM distributor_sessions WHERE session_token = @token
      `;
      const expiredCheck = await db.pool.request()
        .input('token', sql.NVarChar, token)
        .query(expiredCheckQuery);
      
      if (expiredCheck.recordset.length > 0) {
        console.log("⏰ Session found but expired:", expiredCheck.recordset[0]);
      } else {
        console.log("❌ No session found in database");
      }
      
      return null;
    } catch (error) {
      console.error("❌ Session verification failed:", error);
      return null;
    }
  }

  async deleteDistributorSession(token: string): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM distributor_sessions WHERE session_token = @token`;
    
    const request = db.pool.request();
    request.input('token', sql.NVarChar, token);
    
    await request.query(query);
  }

  async deleteDistributorSessionsByDistributorId(distributorId: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM distributor_sessions WHERE distributor_id = @distributorId`;
    
    const request = db.pool.request();
    request.input('distributorId', sql.Int, distributorId);
    
    await request.query(query);
  }

  // Distributor Dashboard
  async getDistributorStats(distributorId: number): Promise<{
    totalCustomers: number;
    totalEarnings: number;
    pendingPayouts: number;
    completedPayouts: number;
  }> {
    await db.connectDB();
    const query = `
      SELECT 
        d.total_customers,
        d.commission_earned as total_earnings,
        ISNULL(pending.pending_amount, 0) as pending_payouts,
        ISNULL(completed.completed_amount, 0) as completed_payouts
      FROM distributors d
      LEFT JOIN (
        SELECT distributor_id, SUM(amount) as pending_amount
        FROM commission_payouts 
        WHERE status IN ('pending', 'processing') 
        GROUP BY distributor_id
      ) pending ON d.id = pending.distributor_id
      LEFT JOIN (
        SELECT distributor_id, SUM(amount) as completed_amount
        FROM commission_payouts 
        WHERE status = 'paid'
        GROUP BY distributor_id
      ) completed ON d.id = completed.distributor_id
      WHERE d.id = @distributorId
    `;

    const request = db.pool.request();
    request.input('distributorId', sql.Int, distributorId);

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      const row = result.recordset[0];
      return {
        totalCustomers: row.total_customers || 0,
        totalEarnings: parseFloat(row.total_earnings) || 0,
        pendingPayouts: parseFloat(row.pending_payouts) || 0,
        completedPayouts: parseFloat(row.completed_payouts) || 0
      };
    }
    
    return {
      totalCustomers: 0,
      totalEarnings: 0,
      pendingPayouts: 0,
      completedPayouts: 0
    };
  }

  async getDistributorMonthlyCommission(distributorId: number, startOfMonth: Date): Promise<number> {
    await db.connectDB();
    const query = `
      SELECT COALESCE(SUM(cp.amount), 0) as monthly_commission
      FROM commission_payouts cp
      INNER JOIN customers c ON cp.customer_id = c.id
      WHERE cp.distributor_id = @distributorId 
      AND c.created_at >= @startOfMonth
      AND c.created_at < DATEADD(month, 1, @startOfMonth)
    `;

    const request = db.pool.request();
    request.input('distributorId', sql.Int, distributorId);
    request.input('startOfMonth', sql.DateTime, startOfMonth);

    const result = await request.query(query);
    return result.recordset[0]?.monthly_commission || 0;
  }

  async getDistributorCustomers(distributorId: number): Promise<Customer[]> {
    await db.connectDB();
    const query = `
      SELECT c.* FROM customers c
      INNER JOIN distributors d ON c.seller_code = d.seller_code
      WHERE d.id = @distributorId
      ORDER BY c.created_at DESC
    `;

    const request = db.pool.request();
    request.input('distributorId', sql.Int, distributorId);

    const result = await request.query(query);
    return result.recordset.map(row => this.mapCustomerFromDb(row));
  }

  async getDistributorPayouts(distributorId: number): Promise<any[]> {
    await db.connectDB();
    const query = `
      SELECT 
        cp.*,
        c.name as customer_name,
        c.contact as customer_contact,
        c.device_type,
        c.brand,
        c.model_name
      FROM commission_payouts cp
      INNER JOIN customers c ON cp.customer_id = c.id
      WHERE cp.distributor_id = @distributorId
      ORDER BY cp.created_at DESC
    `;

    const request = db.pool.request();
    request.input('distributorId', sql.Int, distributorId);

    const result = await request.query(query);
    return result.recordset.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      status: row.status,
      paymentReference: row.payment_reference,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      customer: {
        name: row.customer_name,
        contact: row.customer_contact,
        deviceType: row.device_type,
        brand: row.brand,
        modelName: row.model_name
      }
    }));
  }

  // Admin management methods
  async getAllDistributorsForAdmin(): Promise<any[]> {
    await db.connectDB();
    const query = `
      SELECT 
        d.*,
        d.total_customers,
        d.commission_earned,
        ISNULL(pending.pending_amount, 0) as pending_payouts,
        ISNULL(completed.completed_amount, 0) as completed_payouts
      FROM distributors d
      LEFT JOIN (
        SELECT distributor_id, SUM(amount) as pending_amount
        FROM commission_payouts 
        WHERE status IN ('pending', 'processing') 
        GROUP BY distributor_id
      ) pending ON d.id = pending.distributor_id
      LEFT JOIN (
        SELECT distributor_id, SUM(amount) as completed_amount
        FROM commission_payouts 
        WHERE status = 'paid'
        GROUP BY distributor_id
      ) completed ON d.id = completed.distributor_id
      ORDER BY d.created_at DESC
    `;

    const result = await db.pool.request().query(query);
    return result.recordset.map(row => ({
      id: row.id,
      name: row.name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      preferredMode: row.preferred_mode,
      gstin: row.gstin,
      bankAccount: row.bank_account,
      ifscCode: row.ifsc_code,
      accountHolderName: row.account_holder_name,
      sellerCode: row.seller_code,
      totalCustomers: row.total_customers || 0,
      commissionEarned: parseFloat(row.commission_earned) || 0,
      pendingPayouts: parseFloat(row.pending_payouts) || 0,
      completedPayouts: parseFloat(row.completed_payouts) || 0,
      createdAt: row.created_at
    }));
  }

  async getAllPayoutsForAdmin(): Promise<any[]> {
    await db.connectDB();
    const query = `
      SELECT 
        cp.*,
        d.name as distributor_name,
        d.contact as distributor_contact,
        d.email as distributor_email,
        d.seller_code as distributor_seller_code,
        c.name as customer_name,
        c.contact as customer_contact,
        c.device_type,
        c.brand,
        c.model_name
      FROM commission_payouts cp
      INNER JOIN distributors d ON cp.distributor_id = d.id
      INNER JOIN customers c ON cp.customer_id = c.id
      ORDER BY cp.created_at DESC
    `;

    const result = await db.pool.request().query(query);
    return result.recordset.map(row => ({
      id: row.id,
      amount: parseFloat(row.amount),
      status: row.status,
      paymentReference: row.payment_reference,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      distributor: {
        id: row.distributor_id,
        name: row.distributor_name,
        contact: row.distributor_contact,
        email: row.distributor_email,
        sellerCode: row.distributor_seller_code
      },
      customer: {
        name: row.customer_name,
        contact: row.customer_contact,
        deviceType: row.device_type,
        brand: row.brand,
        modelName: row.model_name
      }
    }));
  }

  async updatePayoutStatus(payoutId: number, status: string, paymentReference?: string): Promise<void> {
    await db.connectDB();
    const query = `
      UPDATE commission_payouts 
      SET status = @status, 
          payment_reference = @paymentReference,
          paid_at = CASE WHEN @status = 'paid' THEN GETDATE() ELSE paid_at END
      WHERE id = @payoutId
    `;

    const request = db.pool.request();
    request.input('payoutId', sql.Int, payoutId);
    request.input('status', sql.VarChar, status);
    request.input('paymentReference', sql.VarChar, paymentReference || null);

    await request.query(query);
  }

  async bulkUploadBrandsAndModels(data: Array<{ device: string; brand: string; model: string }>): Promise<{
    totalRows: number;
    successfulRows: number;
    errors: string[];
    created: { brands: number; models: number; };
  }> {
    await db.connectDB();
    
    const results = {
      totalRows: data.length,
      successfulRows: 0,
      errors: [] as string[],
      created: { brands: 0, models: 0 }
    };

    console.log(`🔄 Processing bulk upload: ${data.length} rows`);
    
    try {
      // Process each row individually for better error tracking
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 1;
        
        try {
          const deviceType = row.device?.toLowerCase().trim();
          const brandName = row.brand?.trim();
          const modelName = row.model?.trim();
          
          // Validate row data
          if (!deviceType || !brandName || !modelName) {
            results.errors.push(`Row ${rowNumber}: Missing required fields (device: '${row.device}', brand: '${row.brand}', model: '${row.model}')`);
            continue;
          }
          
          if (!['mobile', 'laptop'].includes(deviceType)) {
            results.errors.push(`Row ${rowNumber}: Invalid device type '${row.device}'. Must be 'mobile' or 'laptop'.`);
            continue;
          }
          
          // Step 1: Find or create brand
          let brandId: number;
          
          const findBrandRequest = db.pool.request();
          findBrandRequest.input('brandName', sql.VarChar, brandName);
          findBrandRequest.input('deviceType', sql.VarChar, deviceType);
          
          const existingBrand = await findBrandRequest.query(`
            SELECT id FROM brands 
            WHERE LOWER(name) = LOWER(@brandName) AND device_type = @deviceType
          `);
          
          if (existingBrand.recordset.length > 0) {
            brandId = existingBrand.recordset[0].id;
            console.log(`✅ Found existing brand: ${brandName} (${deviceType}) - ID: ${brandId}`);
          } else {
            // Create new brand
            const createBrandRequest = db.pool.request();
            createBrandRequest.input('brandName', sql.VarChar, brandName);
            createBrandRequest.input('deviceType', sql.VarChar, deviceType);
            
            const newBrand = await createBrandRequest.query(`
              INSERT INTO brands (name, device_type, is_active, created_at, updated_at)
              OUTPUT INSERTED.id
              VALUES (@brandName, @deviceType, 1, GETDATE(), GETDATE())
            `);
            
            brandId = newBrand.recordset[0].id;
            results.created.brands++;
            console.log(`✅ Created new brand: ${brandName} (${deviceType}) - ID: ${brandId}`);
          }
          
          // Step 2: Find or create model
          const findModelRequest = db.pool.request();
          findModelRequest.input('modelName', sql.VarChar, modelName);
          findModelRequest.input('brandId', sql.Int, brandId);
          
          const existingModel = await findModelRequest.query(`
            SELECT id FROM models 
            WHERE LOWER(name) = LOWER(@modelName) AND brand_id = @brandId
          `);
          
          if (existingModel.recordset.length === 0) {
            // Create new model
            const createModelRequest = db.pool.request();
            createModelRequest.input('modelName', sql.VarChar, modelName);
            createModelRequest.input('brandId', sql.Int, brandId);
            createModelRequest.input('deviceType', sql.VarChar, deviceType);
            
            await createModelRequest.query(`
              INSERT INTO models (name, brand_id, device_type, is_active, created_at, updated_at)
              VALUES (@modelName, @brandId, @deviceType, 1, GETDATE(), GETDATE())
            `);
            
            results.created.models++;
            console.log(`✅ Created new model: ${modelName} for brand ID ${brandId}`);
          } else {
            console.log(`✅ Found existing model: ${modelName} for brand ID ${brandId}`);
          }
          
          results.successfulRows++;
          
        } catch (error: any) {
          console.error(`❌ Error processing row ${rowNumber}:`, error);
          results.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }
      
      console.log(`✅ Bulk upload completed: ${results.created.brands} brands, ${results.created.models} models created from ${results.successfulRows}/${data.length} successful rows`);
      
    } catch (error: any) {
      console.error('❌ Bulk upload failed:', error);
      results.errors.push(`Upload failed: ${error.message}`);
    }

    return results;
  }

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    await db.connectDB();
    const voucherCode = await this.generateVoucherCode(insertCustomer.deviceType);
    
    // Use the claim value slab ID passed from the registration route
    // This preserves the correct slab for both regular and Acer BBG registrations
    const claimValueSlabId = (insertCustomer as any).claimValueSlabId || null;
    
    const query = `
      INSERT INTO customers (
        name, contact, email, pincode, device_type, serial_number, 
        brand, model_name, invoice_value, date_of_purchase, seller_code, voucher_code, payment_intent_id, is_verified,
        registration_source, invoice_file, claim_value_slab_id, registration_slab_data
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @contact, @email, @pincode, @deviceType, @serialNumber, 
        @brand, @modelName, @invoiceValue, @dateOfPurchase, @sellerCode, @voucherCode, @paymentIntentId, @isVerified,
        @registrationSource, @invoiceFile, @claimValueSlabId, @registrationSlabData
      )
    `;

    const request = db.pool.request();
    request.input('name', sql.NVarChar, insertCustomer.name);
    request.input('contact', sql.NVarChar, insertCustomer.contact);
    request.input('email', sql.NVarChar, insertCustomer.email);
    request.input('pincode', sql.NVarChar, insertCustomer.pincode);
    request.input('deviceType', sql.NVarChar, insertCustomer.deviceType);
    request.input('serialNumber', sql.NVarChar, insertCustomer.serialNumber);
    request.input('brand', sql.NVarChar, insertCustomer.brand);
    request.input('modelName', sql.NVarChar, insertCustomer.modelName);
    request.input('invoiceValue', sql.Decimal(10, 2), insertCustomer.invoiceValue);
    request.input('dateOfPurchase', sql.NVarChar, insertCustomer.dateOfPurchase || null);
    request.input('sellerCode', sql.NVarChar, insertCustomer.sellerCode || null);
    request.input('voucherCode', sql.NVarChar, voucherCode);
    request.input('paymentIntentId', sql.NVarChar, insertCustomer.paymentIntentId || null);
    request.input('isVerified', sql.Bit, insertCustomer.isVerified || false);
    request.input('registrationSource', sql.NVarChar, (insertCustomer as any).registrationSource || 'regular');
    // Handle invoiceFile - ensure it's a valid string or null
    const invoiceFileValue = (insertCustomer as any).invoiceFile;
    const validInvoiceFile = (invoiceFileValue && typeof invoiceFileValue === 'string') ? invoiceFileValue : null;
    request.input('invoiceFile', sql.NVarChar, validInvoiceFile);
    request.input('claimValueSlabId', sql.Int, claimValueSlabId);
    request.input('registrationSlabData', sql.NVarChar, insertCustomer.registrationSlabData || null);

    const result = await request.query(query);

    // Update distributor commission and create payout if seller code provided
    if (insertCustomer.sellerCode) {
      const updateQuery = `
        UPDATE distributors 
        SET total_customers = total_customers + 1, 
            commission_earned = commission_earned + 25 
        WHERE seller_code = @sellerCode
      `;
      const updateRequest = db.pool.request();
      updateRequest.input('sellerCode', sql.NVarChar, insertCustomer.sellerCode);
      await updateRequest.query(updateQuery);

      // Create commission payout record
      const distributor = await this.getDistributorBySellerCode(insertCustomer.sellerCode);
      if (distributor) {
        const payoutQuery = `
          INSERT INTO commission_payouts (distributor_id, customer_id, amount, status)
          VALUES (@distributorId, @customerId, @amount, @status)
        `;
        const payoutRequest = db.pool.request();
        payoutRequest.input('distributorId', sql.Int, distributor.id);
        payoutRequest.input('customerId', sql.Int, result.recordset[0].id);
        payoutRequest.input('amount', sql.Decimal(10, 2), 25.00);
        payoutRequest.input('status', sql.NVarChar, 'pending');
        await payoutRequest.query(payoutQuery);
      }
    }

    return this.mapCustomerFromDb(result.recordset[0]);
  }

  async getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined> {
    console.log(`🔍 DEBUG: Looking up customer with voucher code: "${voucherCode}"`);
    
    try {
      await db.connectDB();
      const query = `SELECT * FROM customers WHERE voucher_code = @voucherCode`;
      
      console.log(`🔍 DEBUG: Executing SQL query: ${query}`);
      console.log(`🔍 DEBUG: Query parameter - voucherCode: "${voucherCode}"`);
      
      const request = db.pool.request();
      request.input('voucherCode', sql.NVarChar, voucherCode);
      
      const result = await request.query(query);
      
      console.log(`🔍 DEBUG: Query result - recordset length: ${result.recordset.length}`);
      
      if (result.recordset.length > 0) {
        console.log(`🔍 DEBUG: Found customer row:`, {
          id: result.recordset[0].id,
          voucher_code: result.recordset[0].voucher_code,
          name: result.recordset[0].name,
          created_at: result.recordset[0].created_at,
          purchase_date: result.recordset[0].purchase_date,
          registration_source: result.recordset[0].registration_source
        });
        
        const mappedCustomer = this.mapCustomerFromDb(result.recordset[0]);
        console.log(`🔍 DEBUG: Mapped customer:`, {
          id: mappedCustomer.id,
          voucherCode: mappedCustomer.voucherCode,
          name: mappedCustomer.name,
          createdAt: mappedCustomer.createdAt,
          dateOfPurchase: mappedCustomer.dateOfPurchase,
          registrationSource: mappedCustomer.registrationSource
        });
        
        return mappedCustomer;
      } else {
        console.log(`🔍 DEBUG: No customer found for voucher code: "${voucherCode}"`);
        
        // Let's also try a case-insensitive search to debug
        const debugQuery = `SELECT voucher_code FROM customers WHERE UPPER(voucher_code) = UPPER(@voucherCode)`;
        const debugRequest = db.pool.request();
        debugRequest.input('voucherCode', sql.NVarChar, voucherCode);
        const debugResult = await debugRequest.query(debugQuery);
        
        console.log(`🔍 DEBUG: Case-insensitive search result:`, debugResult.recordset);
        
        return undefined;
      }
    } catch (error) {
      console.error(`🔍 DEBUG: Error in getCustomerByVoucherCode:`, error);
      throw error;
    }
  }

  async getCustomersBySellerCode(sellerCode: string): Promise<Customer[]> {
    await db.connectDB();
    const query = `SELECT * FROM customers WHERE seller_code = @sellerCode`;
    
    const request = db.pool.request();
    request.input('sellerCode', sql.NVarChar, sellerCode);
    
    const result = await request.query(query);
    return result.recordset.map(row => this.mapCustomerFromDb(row));
  }

  async getCustomersByContact(contact: string): Promise<Customer[]> {
    await db.connectDB();
    const query = `SELECT * FROM customers WHERE contact = @contact ORDER BY created_at DESC`;
    
    const request = db.pool.request();
    request.input('contact', sql.NVarChar, contact);
    
    const result = await request.query(query);
    return result.recordset.map(row => this.mapCustomerFromDb(row));
  }

  async updateCustomerVerification(id: number, isVerified: boolean): Promise<void> {
    await db.connectDB();
    const query = `UPDATE customers SET is_verified = @isVerified WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    request.input('isVerified', sql.Bit, isVerified);
    
    await request.query(query);
  }

  // Claim operations
  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    await db.connectDB();
    
    // First, add address column to claims table if it doesn't exist
    await this.addAddressColumnToClaimsTable();
    
    const query = `
      INSERT INTO claims (
        customer_id, voucher_code, contact, email, serial_number, address, pickup_date, 
        pickup_time_slot, device_age_months, claim_percentage, claim_amount
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @customerId, @voucherCode, @contact, @email, @serialNumber, @address, @pickupDate, 
        @pickupTimeSlot, @deviceAgeMonths, @claimPercentage, @claimAmount
      )
    `;

    const request = db.pool.request();
    request.input('customerId', sql.Int, insertClaim.customerId);
    request.input('voucherCode', sql.NVarChar, insertClaim.voucherCode);
    request.input('contact', sql.NVarChar, insertClaim.contact);
    request.input('email', sql.NVarChar, insertClaim.email);
    request.input('serialNumber', sql.NVarChar, insertClaim.serialNumber);
    request.input('address', sql.NVarChar, insertClaim.address || '');
    request.input('pickupDate', sql.NVarChar, insertClaim.pickupDate);
    request.input('pickupTimeSlot', sql.NVarChar, insertClaim.pickupTimeSlot);
    request.input('deviceAgeMonths', sql.Int, insertClaim.deviceAgeMonths);
    request.input('claimPercentage', sql.Decimal(5, 2), insertClaim.claimPercentage);
    request.input('claimAmount', sql.Decimal(10, 2), insertClaim.claimAmount);

    const result = await request.query(query);
    return this.mapClaimFromDb(result.recordset[0]);
  }

  async getClaimById(id: number): Promise<Claim | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM claims WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapClaimFromDb(result.recordset[0]) : undefined;
  }

  async getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM claims WHERE voucher_code = @voucherCode`;
    
    const request = db.pool.request();
    request.input('voucherCode', sql.NVarChar, voucherCode);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapClaimFromDb(result.recordset[0]) : undefined;
  }

  async updateClaimStatus(id: number, status: string): Promise<void> {
    await db.connectDB();
    const query = `UPDATE claims SET status = @status WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    request.input('status', sql.NVarChar, status);
    
    await request.query(query);
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtp): Promise<OtpVerification> {
    await db.connectDB();
    
    const query = `
      INSERT INTO otp_verifications (contact, otp, expires_at) 
      OUTPUT INSERTED.*
      VALUES (@contact, @otp, @expiresAt)
    `;

    const request = db.pool.request();
    request.input('contact', sql.NVarChar, insertOtp.contact);
    request.input('otp', sql.NVarChar, insertOtp.otp);
    request.input('expiresAt', sql.DateTime2, insertOtp.expiresAt);

    const result = await request.query(query);
    return this.mapOtpFromDb(result.recordset[0]);
  }

  async getOtpByContact(contact: string): Promise<OtpVerification | undefined> {
    await db.connectDB();
    const query = `
      SELECT TOP 1 * FROM otp_verifications 
      WHERE contact = @contact 
      ORDER BY created_at DESC
    `;
    
    const request = db.pool.request();
    request.input('contact', sql.NVarChar, contact);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapOtpFromDb(result.recordset[0]) : undefined;
  }

  async verifyOtp(contact: string, otp: string): Promise<boolean> {
    const otpRecord = await this.getOtpByContact(contact);
    if (!otpRecord) return false;
    
    const isValid = otpRecord.otp === otp && 
                   new Date() < otpRecord.expiresAt && 
                   !otpRecord.isVerified;
    
    if (isValid) {
      await db.connectDB();
      const query = `UPDATE otp_verifications SET is_verified = 1 WHERE id = @id`;
      const request = db.pool.request();
      request.input('id', sql.Int, otpRecord.id);
      await request.query(query);
    }
    
    return isValid;
  }

  // New admin operations
  async getAllDistributors(): Promise<Distributor[]> {
    await db.connectDB();
    const query = `SELECT * FROM distributors ORDER BY created_at DESC`;
    
    const request = db.pool.request();
    const result = await request.query(query);
    return result.recordset.map(row => this.mapDistributorFromDb(row));
  }

  async getAllCustomers(): Promise<Customer[]> {
    await db.connectDB();
    const query = `SELECT * FROM customers ORDER BY created_at DESC`;
    
    const request = db.pool.request();
    const result = await request.query(query);
    return result.recordset.map(row => this.mapCustomerFromDb(row));
  }

  async getCustomersByRegistrationSource(registrationSource: string): Promise<Customer[]> {
    await db.connectDB();
    const query = `SELECT * FROM customers WHERE registration_source = @registrationSource ORDER BY created_at DESC`;
    
    const request = db.pool.request();
    request.input('registrationSource', sql.NVarChar, registrationSource);
    const result = await request.query(query);
    return result.recordset.map(row => this.mapCustomerFromDb(row));
  }

  async getAllClaims(): Promise<Claim[]> {
    await db.connectDB();
    const query = `SELECT * FROM claims ORDER BY created_at DESC`;
    
    const request = db.pool.request();
    const result = await request.query(query);
    return result.recordset.map(row => this.mapClaimFromDb(row));
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    await db.connectDB();
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(insertAdmin.passwordHash, saltRounds);
    
    const query = `
      INSERT INTO admin_users (username, email, password_hash, role) 
      OUTPUT INSERTED.*
      VALUES (@username, @email, @passwordHash, @role)
    `;

    const request = db.pool.request();
    request.input('username', sql.NVarChar, insertAdmin.username);
    request.input('email', sql.NVarChar, insertAdmin.email);
    request.input('passwordHash', sql.NVarChar, passwordHash);
    request.input('role', sql.NVarChar, insertAdmin.role || 'admin');

    const result = await request.query(query);
    return this.mapAdminFromDb(result.recordset[0]);
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM admin_users WHERE username = @username AND is_active = 1`;
    
    const request = db.pool.request();
    request.input('username', sql.NVarChar, username);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapAdminFromDb(result.recordset[0]) : undefined;
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db.connectDB();
    const query = `UPDATE admin_users SET last_login_at = GETDATE() WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  async verifyAdminPassword(username: string, password: string): Promise<AdminUser | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin) return null;
    
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) return null;
    
    // Update last login
    await this.updateAdminLastLogin(admin.id);
    
    return admin;
  }

  // Helper methods to map database rows to TypeScript objects
  private mapDistributorFromDb(row: any): Distributor {
    return {
      id: row.id,
      name: row.name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      preferredMode: row.preferred_mode,
      panNumber: row.pan_number,
      panCopyFile: row.pan_copy_file,
      isGstRegistered: Boolean(row.is_gst_registered),
      gstin: row.gstin,
      gstCertificateFile: row.gst_certificate_file,
      isMsmeRegistered: Boolean(row.is_msme_registered),
      msmeCertificateFile: row.msme_certificate_file,
      accountHolderName: row.account_holder_name,
      bankAccount: row.bank_account,
      bankAccountConfirm: row.bank_account_confirm,
      ifscCode: row.ifsc_code,
      upiId: row.upi_id,
      cancelledChequeFile: row.cancelled_cheque_file,
      infoDeclaration: Boolean(row.info_declaration),
      tdsUnderstanding: Boolean(row.tds_understanding),
      gstInvoiceAgreement: Boolean(row.gst_invoice_agreement),
      termsAgreement: Boolean(row.terms_agreement),
      sellerCode: row.seller_code,
      commissionEarned: parseFloat(row.commission_earned || 0),
      totalCustomers: row.total_customers || 0,
      isVerified: Boolean(row.is_verified),
      createdAt: row.created_at
    };
  }

  private mapCustomerFromDb(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      deviceType: row.device_type,
      serialNumber: row.serial_number,
      brand: row.brand,
      modelName: row.model_name,
      invoiceValue: parseFloat(row.invoice_value),
      dateOfPurchase: row.purchase_date, // Fixed: was row.date_of_purchase, should be row.purchase_date
      sellerCode: row.seller_code,
      voucherCode: row.voucher_code,
      paymentIntentId: row.payment_intent_id,
      isVerified: Boolean(row.is_verified),
      claimValueSlabId: row.claim_value_slab_id || null,
      registrationSlabData: row.registration_slab_data || null,
      registrationSource: row.registration_source || 'regular', // Fixed: missing mapping for registration_source
      createdAt: row.created_at
    };
  }

  private mapClaimFromDb(row: any): Claim {
    return {
      id: row.id,
      customerId: row.customer_id,
      voucherCode: row.voucher_code,
      contact: row.contact,
      email: row.email,
      serialNumber: row.serial_number,
      address: row.address || '',
      pickupDate: row.pickup_date,
      pickupTimeSlot: row.pickup_time_slot,
      deviceAgeMonths: row.device_age_months,
      claimPercentage: parseFloat(row.claim_percentage),
      claimAmount: parseFloat(row.claim_amount),
      status: row.status,
      createdAt: row.created_at
    };
  }

  private mapOtpFromDb(row: any): OtpVerification {
    return {
      id: row.id,
      contact: row.contact,
      otp: row.otp,
      expiresAt: row.expires_at,
      isVerified: Boolean(row.is_verified),
      createdAt: row.created_at
    };
  }

  private generateSellerCode(distributorName?: string, distributorContact?: string): string {
    if (!distributorName || !distributorContact) {
      // Fallback to old method if data not available
      return 'XTS' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Extract initials from name (first letter of each word)
    const initials = distributorName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2); // Max 2 initials
    
    // Extract last 3 digits from mobile number
    const mobileDigits = distributorContact.replace(/\D/g, '').slice(-3);
    
    // Create short referral code: Initials + Mobile digits (4-5 characters)
    const shortCode = initials + mobileDigits;
    
    // Ensure minimum length and add random digit if needed
    if (shortCode.length < 4) {
      return shortCode + Math.floor(Math.random() * 10);
    }
    
    return shortCode;
  }

  private async getNextSerialNumber(deviceType: string): Promise<string> {
    await db.connectDB();
    
    // Get the category prefix
    const category = deviceType === 'mobile' ? 'MOB' : 'LAP';
    
    // Get the highest existing serial number for this device type (new format only)
    const query = `
      SELECT MAX(CASE 
        WHEN voucher_code LIKE @exactPattern 
        AND ISNUMERIC(RIGHT(voucher_code, 2)) = 1
        THEN CAST(RIGHT(voucher_code, 2) AS INT)
        ELSE 0 
      END) as maxSerial
      FROM customers 
      WHERE voucher_code LIKE @exactPattern
    `;
    
    const request = db.pool.request();
    request.input('exactPattern', sql.NVarChar, `BBG${category}__`); // Exact length match with 2 digits
    
    const result = await request.query(query);
    const maxSerial = result.recordset[0]?.maxSerial || 0;
    const nextSerial = maxSerial + 1;
    
    // Format as two-digit number (01, 02, 03, etc.)
    return nextSerial.toString().padStart(2, '0');
  }

  private async generateVoucherCode(deviceType: string): Promise<string> {
    const category = deviceType === 'mobile' ? 'MOB' : 'LAP';
    const serialNumber = await this.getNextSerialNumber(deviceType);
    return `BBG${category}${serialNumber}`;
  }

  private generateSessionToken(): string {
    return 'DST' + Math.random().toString(36).substring(2, 15).toUpperCase() + Date.now().toString(36).toUpperCase();
  }

  private mapAdminFromDb(row: any): AdminUser {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      roleId: row.role_id || 1, // Default to admin role
      role: row.role,
      isActive: Boolean(row.is_active),
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapUserRoleFromDb(row: any): UserRole {
    return {
      id: row.id,
      roleName: row.role_name,
      description: row.description,
      permissions: row.permissions,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // User Role operations (Master)
  async createUserRole(insertRole: InsertUserRole): Promise<UserRole> {
    await db.connectDB();
    const query = `
      INSERT INTO user_roles (role_name, description, permissions)
      OUTPUT INSERTED.*
      VALUES (@roleName, @description, @permissions)
    `;

    const request = db.pool.request();
    request.input('roleName', sql.NVarChar, insertRole.roleName);
    request.input('description', sql.NVarChar, insertRole.description);
    request.input('permissions', sql.NVarChar, insertRole.permissions);

    const result = await request.query(query);
    return this.mapUserRoleFromDb(result.recordset[0]);
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    await db.connectDB();
    const query = `SELECT * FROM user_roles ORDER BY created_at DESC`;
    const request = db.pool.request();
    const result = await request.query(query);
    return result.recordset.map(row => this.mapUserRoleFromDb(row));
  }

  async getUserRoleById(id: number): Promise<UserRole | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM user_roles WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapUserRoleFromDb(result.recordset[0]) : undefined;
  }

  async updateUserRole(id: number, updates: Partial<InsertUserRole>): Promise<void> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    if (updates.roleName !== undefined) {
      setParts.push('role_name = @roleName');
      request.input('roleName', sql.NVarChar, updates.roleName);
    }
    if (updates.description !== undefined) {
      setParts.push('description = @description');
      request.input('description', sql.NVarChar, updates.description);
    }
    if (updates.permissions !== undefined) {
      setParts.push('permissions = @permissions');
      request.input('permissions', sql.NVarChar, updates.permissions);
    }

    setParts.push('updated_at = GETDATE()');

    const query = `UPDATE user_roles SET ${setParts.join(', ')} WHERE id = @id`;
    await request.query(query);
  }

  async deleteUserRole(id: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM user_roles WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  // Additional Master CRUD operations
  async updateDistributor(id: number, updates: Partial<InsertDistributor>): Promise<void> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    // Basic info fields
    if (updates.name !== undefined) {
      setParts.push('name = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.businessName !== undefined) {
      setParts.push('business_name = @businessName');
      request.input('businessName', sql.NVarChar, updates.businessName);
    }
    if (updates.contact !== undefined) {
      setParts.push('contact = @contact');
      request.input('contact', sql.NVarChar, updates.contact);
    }
    if (updates.email !== undefined) {
      setParts.push('email = @email');
      request.input('email', sql.NVarChar, updates.email);
    }
    if (updates.pincode !== undefined) {
      setParts.push('pincode = @pincode');
      request.input('pincode', sql.NVarChar, updates.pincode);
    }
    if (updates.preferredMode !== undefined) {
      setParts.push('preferred_mode = @preferredMode');
      request.input('preferredMode', sql.NVarChar, updates.preferredMode);
    }

    // Tax & Compliance fields
    if (updates.panNumber !== undefined) {
      setParts.push('pan_number = @panNumber');
      request.input('panNumber', sql.NVarChar, updates.panNumber);
    }
    if (updates.panCopyFile !== undefined) {
      setParts.push('pan_copy_file = @panCopyFile');
      request.input('panCopyFile', sql.NVarChar, updates.panCopyFile);
    }
    if (updates.isGstRegistered !== undefined) {
      setParts.push('is_gst_registered = @isGstRegistered');
      request.input('isGstRegistered', sql.Bit, updates.isGstRegistered);
    }
    if (updates.gstin !== undefined) {
      setParts.push('gstin = @gstin');
      request.input('gstin', sql.NVarChar, updates.gstin);
    }
    if (updates.gstCertificateFile !== undefined) {
      setParts.push('gst_certificate_file = @gstCertificateFile');
      request.input('gstCertificateFile', sql.NVarChar, updates.gstCertificateFile);
    }
    if (updates.isMsmeRegistered !== undefined) {
      setParts.push('is_msme_registered = @isMsmeRegistered');
      request.input('isMsmeRegistered', sql.Bit, updates.isMsmeRegistered);
    }
    if (updates.msmeCertificateFile !== undefined) {
      setParts.push('msme_certificate_file = @msmeCertificateFile');
      request.input('msmeCertificateFile', sql.NVarChar, updates.msmeCertificateFile);
    }

    // Bank details fields - with detailed logging
    console.log("🔍 Bank details values being processed:", {
      accountHolderName: updates.accountHolderName,
      bankAccount: updates.bankAccount,
      bankAccountConfirm: updates.bankAccountConfirm,
      ifscCode: updates.ifscCode,
      upiId: updates.upiId
    });

    if (updates.accountHolderName !== undefined) {
      setParts.push('account_holder_name = @accountHolderName');
      request.input('accountHolderName', sql.NVarChar, updates.accountHolderName);
    }
    if (updates.bankAccount !== undefined) {
      setParts.push('bank_account = @bankAccount');
      request.input('bankAccount', sql.NVarChar, updates.bankAccount);
    }
    if (updates.bankAccountConfirm !== undefined) {
      setParts.push('bank_account_confirm = @bankAccountConfirm');
      request.input('bankAccountConfirm', sql.NVarChar, updates.bankAccountConfirm);
    }
    if (updates.ifscCode !== undefined) {
      setParts.push('ifsc_code = @ifscCode');
      request.input('ifscCode', sql.NVarChar, updates.ifscCode);
    }
    if (updates.upiId !== undefined) {
      setParts.push('upi_id = @upiId');
      request.input('upiId', sql.NVarChar, updates.upiId);
    }
    if (updates.cancelledChequeFile !== undefined) {
      setParts.push('cancelled_cheque_file = @cancelledChequeFile');
      request.input('cancelledChequeFile', sql.NVarChar, updates.cancelledChequeFile);
    }

    // Declaration fields
    if (updates.infoDeclaration !== undefined) {
      setParts.push('info_declaration = @infoDeclaration');
      request.input('infoDeclaration', sql.Bit, updates.infoDeclaration);
    }
    if (updates.tdsUnderstanding !== undefined) {
      setParts.push('tds_understanding = @tdsUnderstanding');
      request.input('tdsUnderstanding', sql.Bit, updates.tdsUnderstanding);
    }
    if (updates.gstInvoiceAgreement !== undefined) {
      setParts.push('gst_invoice_agreement = @gstInvoiceAgreement');
      request.input('gstInvoiceAgreement', sql.Bit, updates.gstInvoiceAgreement);
    }
    if (updates.termsAgreement !== undefined) {
      setParts.push('terms_agreement = @termsAgreement');
      request.input('termsAgreement', sql.Bit, updates.termsAgreement);
    }

    if (setParts.length > 0) { // Check if there are fields to update
      const query = `UPDATE distributors SET ${setParts.join(', ')} WHERE id = @id`;
      console.log("📝 Executing update query:", query);
      console.log("📝 SQL Parameters being sent:", {
        id: id,
        accountHolderName: updates.accountHolderName,
        bankAccount: updates.bankAccount,
        bankAccountConfirm: updates.bankAccountConfirm,
        ifscCode: updates.ifscCode,
        upiId: updates.upiId
      });
      
      const result = await request.query(query);
      console.log("✅ Update completed. Rows affected:", result.rowsAffected);
      
      // Immediately verify the update by re-reading the data
      const verifyQuery = `SELECT account_holder_name, bank_account, ifsc_code, upi_id FROM distributors WHERE id = @verifyId`;
      const verifyRequest = db.pool.request();
      verifyRequest.input('verifyId', sql.Int, id);
      const verifyResult = await verifyRequest.query(verifyQuery);
      console.log("🔍 Post-update verification:", verifyResult.recordset[0]);
    } else {
      console.log("⚠️ No fields to update - all values were undefined");
    }
  }

  async deleteDistributor(id: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM distributors WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<void> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    if (updates.name !== undefined) {
      setParts.push('name = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.contact !== undefined) {
      setParts.push('contact = @contact');
      request.input('contact', sql.NVarChar, updates.contact);
    }
    if (updates.email !== undefined) {
      setParts.push('email = @email');
      request.input('email', sql.NVarChar, updates.email);
    }

    if (setParts.length > 0) {
      const query = `UPDATE customers SET ${setParts.join(', ')} WHERE id = @id`;
      await request.query(query);
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM customers WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    await db.connectDB();
    const query = `SELECT * FROM admin_users ORDER BY created_at DESC`;
    const request = db.pool.request();
    const result = await request.query(query);
    return result.recordset.map(row => this.mapAdminFromDb(row));
  }

  async updateAdminUser(id: number, updates: Partial<InsertAdminUser>): Promise<void> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    if (updates.username !== undefined) {
      setParts.push('username = @username');
      request.input('username', sql.NVarChar, updates.username);
    }
    if (updates.email !== undefined) {
      setParts.push('email = @email');
      request.input('email', sql.NVarChar, updates.email);
    }
    if (updates.passwordHash !== undefined) {
      setParts.push('password_hash = @passwordHash');
      request.input('passwordHash', sql.NVarChar, updates.passwordHash);
    }
    if (updates.role !== undefined) {
      setParts.push('role = @role');
      request.input('role', sql.NVarChar, updates.role);
    }

    if (setParts.length > 0) {
      const query = `UPDATE admin_users SET ${setParts.join(', ')} WHERE id = @id`;
      await request.query(query);
    }
  }

  async deleteAdminUser(id: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM admin_users WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  async toggleAdminUserStatus(id: number, isActive: boolean): Promise<void> {
    await db.connectDB();
    const query = `UPDATE admin_users SET is_active = @isActive WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    request.input('isActive', sql.Bit, isActive);
    await request.query(query);
  }

  // Pending Payment operations
  async createPendingPayment(insertPayment: InsertPendingPayment): Promise<PendingPayment> {
    await db.connectDB();
    const query = `
      INSERT INTO pending_payments (
        name, contact, email, pincode, device_type, serial_number, 
        brand, model_name, invoice_value, payment_amount, transaction_id, 
        seller_code, status, expires_at, purchase_timing_category, 
        benefit_type, plan_price, benefits_json, email_template_key
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @contact, @email, @pincode, @deviceType, @serialNumber, 
        @brand, @modelName, @invoiceValue, @paymentAmount, @transactionId, 
        @sellerCode, @status, @expiresAt, @purchaseTimingCategory,
        @benefitType, @planPrice, @benefitsJson, @emailTemplateKey
      )
    `;

    const request = db.pool.request();
    request.input('name', sql.NVarChar, insertPayment.name);
    request.input('contact', sql.NVarChar, insertPayment.contact);
    request.input('email', sql.NVarChar, insertPayment.email);
    request.input('pincode', sql.NVarChar, insertPayment.pincode);
    request.input('deviceType', sql.NVarChar, insertPayment.deviceType);
    request.input('serialNumber', sql.NVarChar, insertPayment.serialNumber);
    request.input('brand', sql.NVarChar, insertPayment.brand);
    request.input('modelName', sql.NVarChar, insertPayment.modelName);
    request.input('invoiceValue', sql.Decimal(10,2), insertPayment.invoiceValue);
    request.input('paymentAmount', sql.Decimal(10,2), insertPayment.paymentAmount);
    request.input('transactionId', sql.NVarChar, insertPayment.transactionId || null);
    request.input('sellerCode', sql.NVarChar, insertPayment.sellerCode || null);
    request.input('status', sql.NVarChar, insertPayment.status || 'pending');
    request.input('expiresAt', sql.DateTime2, insertPayment.expiresAt);
    // New dual-flow BBG columns
    request.input('purchaseTimingCategory', sql.NVarChar, insertPayment.purchaseTimingCategory || null);
    request.input('benefitType', sql.NVarChar, insertPayment.benefitType || null);
    request.input('planPrice', sql.Decimal(10,2), insertPayment.planPrice || null);
    request.input('benefitsJson', sql.NVarChar, insertPayment.benefitsJson || null);
    request.input('emailTemplateKey', sql.NVarChar, insertPayment.emailTemplateKey || null);

    const result = await request.query(query);
    return this.mapPendingPaymentFromDb(result.recordset[0]);
  }

  async getAllPendingPayments(): Promise<PendingPayment[]> {
    await db.connectDB();
    const query = `SELECT * FROM pending_payments WHERE status = 'pending' ORDER BY created_at DESC`;
    const result = await db.pool.request().query(query);
    return result.recordset.map(row => this.mapPendingPaymentFromDb(row));
  }

  async getPendingPaymentById(id: number): Promise<PendingPayment | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM pending_payments WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapPendingPaymentFromDb(result.recordset[0]) : undefined;
  }

  async getPendingPaymentByTransactionId(transactionId: string): Promise<PendingPayment | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM pending_payments WHERE transaction_id = @transactionId`;
    
    const request = db.pool.request();
    request.input('transactionId', sql.NVarChar, transactionId);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapPendingPaymentFromDb(result.recordset[0]) : undefined;
  }

  async updatePendingPaymentStatus(id: number, status: string): Promise<void> {
    await db.connectDB();
    const query = `UPDATE pending_payments SET status = @status WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    request.input('status', sql.NVarChar, status);
    
    await request.query(query);
  }

  async deletePendingPayment(id: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM pending_payments WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  private mapPendingPaymentFromDb(row: any): PendingPayment {
    return {
      id: row.id,
      name: row.name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      deviceType: row.device_type,
      serialNumber: row.serial_number,
      brand: row.brand,
      modelName: row.model_name,
      invoiceValue: row.invoice_value,
      paymentAmount: row.payment_amount,
      transactionId: row.transaction_id,
      sellerCode: row.seller_code,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      // New dual-flow BBG fields
      purchaseTimingCategory: row.purchase_timing_category,
      benefitType: row.benefit_type,
      planPrice: row.plan_price,
      benefitsJson: row.benefits_json,
      emailTemplateKey: row.email_template_key
    };
  }

  async getAllTemplates(): Promise<any[]> {
    try {
      await db.connectDB();
      const query = `
        SELECT * FROM message_templates
        ORDER BY type, event, created_at DESC
      `;
      const result = await db.pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching templates:', error);
      try {
        // Fallback query with just basic structure
        const fallbackQuery = `SELECT COUNT(*) as count FROM message_templates`;
        const fallbackResult = await db.pool.request().query(fallbackQuery);
        const count = fallbackResult.recordset[0]?.count || 0;
        return Array(count).fill({}).map((_, i) => ({ id: i, type: 'email', event: 'unknown' }));
      } catch (fallbackError) {
        return [];
      }
    }
  }

  // Cart Abandonment operations
  async createCartAbandonment(abandonment: any): Promise<any> {
    await db.connectDB();
    
    const query = `
      INSERT INTO cart_abandonments (
        name, contact, email, pincode, device_type, serial_number, 
        brand, model_name, invoice_value, seller_code, session_id, stage, last_activity
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @contact, @email, @pincode, @deviceType, @serialNumber,
        @brand, @modelName, @invoiceValue, @sellerCode, @sessionId, @stage, GETDATE()
      )
    `;

    const request = db.pool.request();
    request.input('name', sql.NVarChar, abandonment.name);
    request.input('contact', sql.NVarChar, abandonment.contact);
    request.input('email', sql.NVarChar, abandonment.email);
    request.input('pincode', sql.NVarChar, abandonment.pincode);
    request.input('deviceType', sql.NVarChar, abandonment.deviceType);
    request.input('serialNumber', sql.NVarChar, abandonment.serialNumber);
    request.input('brand', sql.NVarChar, abandonment.brand);
    request.input('modelName', sql.NVarChar, abandonment.modelName);
    request.input('invoiceValue', sql.Decimal(10, 2), abandonment.invoiceValue);
    request.input('sellerCode', sql.NVarChar, abandonment.sellerCode);
    request.input('sessionId', sql.NVarChar, abandonment.sessionId);
    request.input('stage', sql.NVarChar, abandonment.stage || 'form_started');

    const result = await request.query(query);
    return this.mapCartAbandonmentFromDb(result.recordset[0]);
  }

  async updateCartAbandonment(sessionId: string, updates: any): Promise<void> {
    await db.connectDB();
    
    const updateFields = [];
    const request = db.pool.request();
    request.input('sessionId', sql.NVarChar, sessionId);

    if (updates.name !== undefined) {
      updateFields.push('name = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.contact !== undefined) {
      updateFields.push('contact = @contact');
      request.input('contact', sql.NVarChar, updates.contact);
    }
    if (updates.email !== undefined) {
      updateFields.push('email = @email');
      request.input('email', sql.NVarChar, updates.email);
    }
    if (updates.pincode !== undefined) {
      updateFields.push('pincode = @pincode');
      request.input('pincode', sql.NVarChar, updates.pincode);
    }
    if (updates.deviceType !== undefined) {
      updateFields.push('device_type = @deviceType');
      request.input('deviceType', sql.NVarChar, updates.deviceType);
    }
    if (updates.serialNumber !== undefined) {
      updateFields.push('serial_number = @serialNumber');
      request.input('serialNumber', sql.NVarChar, updates.serialNumber);
    }
    if (updates.brand !== undefined) {
      updateFields.push('brand = @brand');
      request.input('brand', sql.NVarChar, updates.brand);
    }
    if (updates.modelName !== undefined) {
      updateFields.push('model_name = @modelName');
      request.input('modelName', sql.NVarChar, updates.modelName);
    }
    if (updates.invoiceValue !== undefined) {
      updateFields.push('invoice_value = @invoiceValue');
      request.input('invoiceValue', sql.Decimal(10, 2), updates.invoiceValue);
    }
    if (updates.sellerCode !== undefined) {
      updateFields.push('seller_code = @sellerCode');
      request.input('sellerCode', sql.NVarChar, updates.sellerCode);
    }
    if (updates.stage !== undefined) {
      updateFields.push('stage = @stage');
      request.input('stage', sql.NVarChar, updates.stage);
    }

    updateFields.push('last_activity = GETDATE()');
    updateFields.push('updated_at = GETDATE()');

    if (updateFields.length > 0) {
      const query = `UPDATE cart_abandonments SET ${updateFields.join(', ')} WHERE session_id = @sessionId`;
      await request.query(query);
    }
  }

  async getCartAbandonmentBySessionId(sessionId: string): Promise<any | null> {
    await db.connectDB();
    const query = `SELECT * FROM cart_abandonments WHERE session_id = @sessionId`;
    
    const request = db.pool.request();
    request.input('sessionId', sql.NVarChar, sessionId);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapCartAbandonmentFromDb(result.recordset[0]) : null;
  }

  async getAllCartAbandonments(): Promise<any[]> {
    await db.connectDB();
    const query = `
      SELECT * FROM cart_abandonments 
      ORDER BY last_activity DESC, created_at DESC
    `;
    
    const result = await db.pool.request().query(query);
    return result.recordset.map(row => this.mapCartAbandonmentFromDb(row));
  }

  async deleteCartAbandonment(id: number): Promise<void> {
    await db.connectDB();
    const query = `DELETE FROM cart_abandonments WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    await request.query(query);
  }

  async cleanupOldCartAbandonments(daysOld: number): Promise<void> {
    await db.connectDB();
    const query = `
      DELETE FROM cart_abandonments 
      WHERE created_at < DATEADD(day, -@daysOld, GETDATE())
    `;
    
    const request = db.pool.request();
    request.input('daysOld', sql.Int, daysOld);
    
    await request.query(query);
  }

  private mapCartAbandonmentFromDb(row: any): any {
    return {
      id: row.id,
      name: row.name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      deviceType: row.device_type,
      serialNumber: row.serial_number,
      brand: row.brand,
      modelName: row.model_name,
      invoiceValue: row.invoice_value,
      sellerCode: row.seller_code,
      sessionId: row.session_id,
      stage: row.stage,
      lastActivity: row.last_activity,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Brand operations
  async createBrand(brand: InsertBrand): Promise<Brand> {
    await db.connectDB();
    const query = `
      INSERT INTO brands (name, device_type, is_active)
      OUTPUT INSERTED.*
      VALUES (@name, @deviceType, 1)
    `;

    const request = db.pool.request();
    request.input('name', sql.NVarChar, brand.name);
    request.input('deviceType', sql.NVarChar, brand.deviceType);

    const result = await request.query(query);
    return this.mapBrandFromDb(result.recordset[0]);
  }

  async getAllBrands(): Promise<Brand[]> {
    await db.connectDB();
    const query = `SELECT * FROM brands WHERE is_active = 1 ORDER BY name`;
    const request = db.pool.request();
    const result = await request.query(query);
    
    console.log(`🔍 getAllBrands query result: Found ${result.recordset.length} brands`);
    console.log('🔍 Raw records:', result.recordset);
    
    return result.recordset.map(row => this.mapBrandFromDb(row));
  }

  async getBrandsByDeviceType(deviceType: string): Promise<Brand[]> {
    await db.connectDB();
    const query = `SELECT * FROM brands WHERE device_type = @deviceType AND is_active = 1 ORDER BY name`;
    
    const request = db.pool.request();
    request.input('deviceType', sql.NVarChar, deviceType);
    
    const result = await request.query(query);
    return result.recordset.map(row => this.mapBrandFromDb(row));
  }

  async updateBrand(id: number, updates: Partial<InsertBrand>): Promise<void> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    if (updates.name !== undefined) {
      setParts.push('name = @name');
      request.input('name', sql.NVarChar, updates.name);
    }
    if (updates.deviceType !== undefined) {
      setParts.push('device_type = @deviceType');
      request.input('deviceType', sql.NVarChar, updates.deviceType);
    }

    if (setParts.length > 0) {
      const query = `UPDATE brands SET ${setParts.join(', ')} WHERE id = @id`;
      await request.query(query);
    }
  }

  async deleteBrand(id: number): Promise<void> {
    await db.connectDB();
    const query = `UPDATE brands SET is_active = 0 WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  // Device Model operations
  async createDeviceModel(model: InsertDeviceModel): Promise<DeviceModel> {
    await db.connectDB();
    const query = `
      INSERT INTO models (name, brand_id, device_type, is_active)
      OUTPUT INSERTED.*
      VALUES (@name, @brandId, @deviceType, 1)
    `;

    const request = db.pool.request();
    request.input('name', sql.NVarChar, model.modelName);
    request.input('brandId', sql.Int, model.brandId);
    request.input('deviceType', sql.NVarChar, model.deviceType);

    const result = await request.query(query);
    return this.mapModelFromDb(result.recordset[0]);
  }

  async getAllDeviceModels(): Promise<DeviceModel[]> {
    await db.connectDB();
    const query = `
      SELECT m.*, b.name as brand_name 
      FROM models m
      LEFT JOIN brands b ON m.brand_id = b.id
      WHERE m.is_active = 1
      ORDER BY b.name, m.name
    `;
    
    const result = await db.pool.request().query(query);
    return result.recordset.map(row => ({
      ...this.mapModelFromDb(row),
      brandName: row.brand_name || 'Unknown Brand'
    }));
  }

  async getModelsByBrandId(brandId: number): Promise<DeviceModel[]> {
    await db.connectDB();
    const query = `SELECT * FROM models WHERE brand_id = @brandId AND is_active = 1 ORDER BY name`;
    
    const request = db.pool.request();
    request.input('brandId', sql.Int, brandId);
    
    const result = await request.query(query);
    return result.recordset.map(row => this.mapModelFromDb(row));
  }

  async updateDeviceModel(id: number, updates: Partial<InsertDeviceModel>): Promise<void> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    if (updates.modelName !== undefined) {
      setParts.push('name = @modelName');
      request.input('modelName', sql.NVarChar, updates.modelName);
    }
    if (updates.brandId !== undefined) {
      setParts.push('brand_id = @brandId');
      request.input('brandId', sql.Int, updates.brandId);
    }
    if (updates.deviceType !== undefined) {
      setParts.push('device_type = @deviceType');
      request.input('deviceType', sql.NVarChar, updates.deviceType);
    }

    if (setParts.length > 0) {
      const query = `UPDATE models SET ${setParts.join(', ')} WHERE id = @id`;
      await request.query(query);
    }
  }

  async deleteDeviceModel(id: number): Promise<void> {
    await db.connectDB();
    const query = `UPDATE models SET is_active = 0 WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    await request.query(query);
  }

  private mapBrandFromDb(row: any): Brand {
    return {
      id: row.id,
      name: row.name,
      deviceType: row.device_type,
      isActive: row.is_active,
      createdAt: row.created_at
    };
  }

  private mapModelFromDb(row: any): DeviceModel {
    return {
      id: row.id,
      modelName: row.name,
      brandId: row.brand_id,
      deviceType: row.device_type || 'mobile',
      isActive: row.is_active,
      createdAt: row.created_at
    };
  }

  // Claim Value Slabs operations
  async createClaimValueSlab(slab: InsertClaimValueSlab): Promise<ClaimValueSlab> {
    await db.connectDB();
    
    // Try modern query with device_type and brand columns
    try {
      const query = `
        INSERT INTO claim_value_slabs (device_type, brand, min_months, max_months, percentage, is_active)
        OUTPUT INSERTED.*
        VALUES (@deviceType, @brand, @minMonths, @maxMonths, @percentage, @isActive)
      `;

      const request = db.pool.request();
      request.input('deviceType', sql.NVarChar, slab.deviceType || 'mobile');
      request.input('brand', sql.NVarChar, slab.brand || null);
      request.input('minMonths', sql.Int, slab.minMonths);
      request.input('maxMonths', sql.Int, slab.maxMonths);
      request.input('percentage', sql.Int, slab.percentage);
      request.input('isActive', sql.Bit, slab.isActive ?? true);

      const result = await request.query(query);
      return this.mapClaimValueSlabFromDb(result.recordset[0]);
    } catch (error: any) {
      console.log('Modern insert failed, attempting fallback without brand:', error.message);
      
      // Fallback to insert without brand column
      try {
        const fallbackQuery = `
          INSERT INTO claim_value_slabs (device_type, min_months, max_months, percentage, is_active)
          OUTPUT INSERTED.*
          VALUES (@deviceType, @minMonths, @maxMonths, @percentage, @isActive)
        `;

        const fallbackRequest = db.pool.request();
        fallbackRequest.input('deviceType', sql.NVarChar, slab.deviceType || 'mobile');
        fallbackRequest.input('minMonths', sql.Int, slab.minMonths);
        fallbackRequest.input('maxMonths', sql.Int, slab.maxMonths);
        fallbackRequest.input('percentage', sql.Int, slab.percentage);
        fallbackRequest.input('isActive', sql.Bit, slab.isActive ?? true);

        const fallbackResult = await fallbackRequest.query(fallbackQuery);
        return this.mapClaimValueSlabFromDb(fallbackResult.recordset[0]);
      } catch (fallbackError: any) {
        console.log('Fallback failed, using basic insert:', fallbackError.message);
        
        // Final fallback without device_type column
        const basicQuery = `
          INSERT INTO claim_value_slabs (min_months, max_months, percentage, is_active)
          OUTPUT INSERTED.*
          VALUES (@minMonths, @maxMonths, @percentage, @isActive)
        `;

        const basicRequest = db.pool.request();
        basicRequest.input('minMonths', sql.Int, slab.minMonths);
        basicRequest.input('maxMonths', sql.Int, slab.maxMonths);
        basicRequest.input('percentage', sql.Int, slab.percentage);
        basicRequest.input('isActive', sql.Bit, slab.isActive ?? true);

        const basicResult = await basicRequest.query(basicQuery);
        const mappedResult = this.mapClaimValueSlabFromDb(basicResult.recordset[0]);
        // Preserve the original values from the request
        mappedResult.deviceType = slab.deviceType || 'mobile';
        mappedResult.brand = slab.brand || null;
        return mappedResult;
      }
    }
  }

  async getAllClaimValueSlabs(): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    try {
      const query = `SELECT * FROM claim_value_slabs ORDER BY device_type, brand, min_months ASC`;
      const result = await db.pool.request().query(query);
      return result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
    } catch (error: any) {
      console.log('Modern query failed, using fallback without brand ordering:', error.message);
      
      try {
        // Fallback query without brand ordering
        const fallbackQuery = `SELECT * FROM claim_value_slabs ORDER BY device_type, min_months ASC`;
        const fallbackResult = await db.pool.request().query(fallbackQuery);
        return fallbackResult.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      } catch (fallbackError: any) {
        console.log('Fallback failed, using basic query:', fallbackError.message);
        
        // Final fallback without device_type ordering
        const basicQuery = `SELECT *, 'mobile' as device_type FROM claim_value_slabs ORDER BY min_months ASC`;
        const basicResult = await db.pool.request().query(basicQuery);
        return basicResult.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      }
    }
  }

  async getActiveClaimValueSlabs(): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    // First try the modern query with device_type column
    try {
      const query = `SELECT * FROM claim_value_slabs WHERE is_active = 1 ORDER BY device_type, min_months ASC`;
      const result = await db.pool.request().query(query);
      return result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
    } catch (error: any) {
      console.log('Modern query failed, attempting fallback without device_type:', error.message);
      
      // Fallback to basic query without device_type if column doesn't exist yet
      try {
        const fallbackQuery = `SELECT *, 'mobile' as device_type FROM claim_value_slabs WHERE is_active = 1 ORDER BY min_months ASC`;
        const fallbackResult = await db.pool.request().query(fallbackQuery);
        return fallbackResult.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      } catch (fallbackError: any) {
        console.error('Both queries failed:', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  async getActiveClaimValueSlabsByDeviceType(deviceType: string): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    try {
      const query = `SELECT * FROM claim_value_slabs WHERE is_active = 1 AND device_type = @deviceType ORDER BY min_months ASC`;
      const request = db.pool.request();
      request.input('deviceType', sql.NVarChar, deviceType);
      const result = await request.query(query);
      return result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
    } catch (error: any) {
      console.log(`Device-specific query failed for ${deviceType}, using fallback:`, error.message);
      
      // Get all slabs since device_type column doesn't exist yet
      const fallbackQuery = `SELECT * FROM claim_value_slabs WHERE is_active = 1 ORDER BY min_months ASC`;
      const fallbackResult = await db.pool.request().query(fallbackQuery);
      const allSlabs = fallbackResult.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      
      // For fallback mode, manually assign device types based on known IDs
      // Mobile slabs: 1-14 (original), plus any others we know are mobile
      // Laptop slabs: 25-30 (newly created laptop slabs)
      const reassignedSlabs = allSlabs.map((slab) => {
        // Known laptop IDs: 25, 26, 27, 28, 29, 30
        if ([25, 26, 27, 28, 29, 30].includes(slab.id)) {
          return { ...slab, deviceType: 'laptop' };
        }
        return { ...slab, deviceType: 'mobile' };
      });
      
      if (deviceType === 'mobile') {
        return reassignedSlabs.filter(slab => slab.deviceType === 'mobile');
      } else if (deviceType === 'laptop') {
        return reassignedSlabs.filter(slab => slab.deviceType === 'laptop');
      }
      
      return [];
    }
  }

  async getClaimValueSlabsByRegistrationSource(registrationSource: string): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    try {
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
          registration_source
        FROM claim_value_slabs 
        WHERE registration_source = @registrationSource
        AND is_active = 1
        ORDER BY device_type, brand, min_months ASC
      `;
      
      const request = db.pool.request();
      request.input('registrationSource', sql.NVarChar, registrationSource);
      
      const result = await request.query(query);
      const slabs = result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      
      console.log(`✅ Found ${slabs.length} slabs with registration_source = '${registrationSource}'`);
      return slabs;
      
    } catch (error: any) {
      console.error(`Error fetching slabs by registration source '${registrationSource}':`, error.message);
      return [];
    }
  }

  async getActiveClaimValueSlabsByDeviceTypeAndSource(deviceType: string, registrationSource: string): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    try {
      // First try with registration_source column
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
          registration_source
        FROM claim_value_slabs 
        WHERE device_type = @deviceType 
        AND is_active = 1 
        AND registration_source = @registrationSource
        ORDER BY brand, min_months ASC
      `;
      
      const request = db.pool.request();
      request.input('deviceType', sql.NVarChar, deviceType);
      request.input('registrationSource', sql.NVarChar, registrationSource);
      
      const result = await request.query(query);
      const slabs = result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      
      console.log(`✅ Found ${slabs.length} ${registrationSource} ${deviceType} slabs with registration_source filter`);
      return slabs;
      
    } catch (error: any) {
      console.log(`Registration source query failed for ${deviceType}/${registrationSource}, using fallback:`, error.message);
      
      // Fallback to regular device type filtering if registration_source column doesn't exist
      const fallbackSlabs = await this.getActiveClaimValueSlabsByDeviceType(deviceType);
      
      // If asking for 'acer_bbg' but column doesn't exist, return empty array
      // since there won't be separate Acer BBG slabs without the column
      if (registrationSource === 'acer_bbg') {
        console.log(`⚠️  No separate Acer BBG slabs available without registration_source column`);
        return [];
      }
      
      // For 'regular' source, return all slabs
      return fallbackSlabs;
    }
  }

  async getClaimValueSlabsByTypeAndBrand(deviceType: string, brand: string, registrationSource: string): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    try {
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
          registration_source
        FROM claim_value_slabs 
        WHERE device_type = @deviceType 
        AND brand = @brand
        AND registration_source = @registrationSource
        AND is_active = 1
        ORDER BY min_months ASC
      `;
      
      const request = db.pool.request();
      request.input('deviceType', sql.NVarChar, deviceType);
      request.input('brand', sql.NVarChar, brand);
      request.input('registrationSource', sql.NVarChar, registrationSource);
      
      const result = await request.query(query);
      const slabs = result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
      
      console.log(`✅ Found ${slabs.length} ${registrationSource} ${deviceType} ${brand} slabs`);
      return slabs;
      
    } catch (error: any) {
      console.error(`Error fetching slabs by type/brand '${deviceType}/${brand}/${registrationSource}':`, error.message);
      return [];
    }
  }

  async getActiveClaimValueSlabsByDeviceBrand(deviceType: string, brand: string | null): Promise<ClaimValueSlab[]> {
    await db.connectDB();
    
    try {
      const query = brand
        ? `SELECT * FROM claim_value_slabs WHERE is_active = 1 AND device_type = @deviceType AND brand = @brand ORDER BY min_months`
        : `SELECT * FROM claim_value_slabs WHERE is_active = 1 AND device_type = @deviceType AND (brand IS NULL OR brand = '') ORDER BY min_months`;
      
      const request = db.pool.request();
      request.input('deviceType', sql.NVarChar, deviceType);
      if (brand) {
        request.input('brand', sql.NVarChar, brand);
      }
      
      const result = await request.query(query);
      return result.recordset.map(row => this.mapClaimValueSlabFromDb(row));
    } catch (error: any) {
      console.log(`Device+brand query failed for ${deviceType}/${brand}, using fallback:`, error.message);
      
      // Fallback: get all slabs and filter in memory
      const allSlabs = await this.getActiveClaimValueSlabsByDeviceType(deviceType);
      return allSlabs.filter(slab => 
        brand ? slab.brand === brand : (!slab.brand || slab.brand === '')
      );
    }
  }

  async updateClaimValueSlab(id: number, updates: Partial<InsertClaimValueSlab>): Promise<ClaimValueSlab | undefined> {
    await db.connectDB();
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);

    if (updates.deviceType !== undefined) {
      setParts.push('device_type = @deviceType');
      request.input('deviceType', sql.NVarChar, updates.deviceType);
    }
    if (updates.brand !== undefined) {
      setParts.push('brand = @brand');
      request.input('brand', sql.NVarChar, updates.brand);
    }
    if (updates.minMonths !== undefined) {
      setParts.push('min_months = @minMonths');
      request.input('minMonths', sql.Int, updates.minMonths);
    }
    if (updates.maxMonths !== undefined) {
      setParts.push('max_months = @maxMonths');
      request.input('maxMonths', sql.Int, updates.maxMonths);
    }
    if (updates.percentage !== undefined) {
      setParts.push('percentage = @percentage');
      request.input('percentage', sql.Int, updates.percentage);
    }
    if (updates.isActive !== undefined) {
      setParts.push('is_active = @isActive');
      request.input('isActive', sql.Bit, updates.isActive);
    }

    if (setParts.length > 0) {
      try {
        setParts.push('updated_at = GETDATE()');
        const query = `UPDATE claim_value_slabs SET ${setParts.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;
        const result = await request.query(query);
        if (result.recordset.length > 0) {
          return this.mapClaimValueSlabFromDb(result.recordset[0]);
        }
      } catch (error: any) {
        console.log('Modern update failed, attempting fallback without brand:', error.message);
        
        // Fallback update without brand column
        const fallbackParts = [];
        const fallbackRequest = db.pool.request();
        fallbackRequest.input('id', sql.Int, id);

        if (updates.deviceType !== undefined) {
          fallbackParts.push('device_type = @deviceType');
          fallbackRequest.input('deviceType', sql.NVarChar, updates.deviceType);
        }
        if (updates.minMonths !== undefined) {
          fallbackParts.push('min_months = @minMonths');
          fallbackRequest.input('minMonths', sql.Int, updates.minMonths);
        }
        if (updates.maxMonths !== undefined) {
          fallbackParts.push('max_months = @maxMonths');
          fallbackRequest.input('maxMonths', sql.Int, updates.maxMonths);
        }
        if (updates.percentage !== undefined) {
          fallbackParts.push('percentage = @percentage');
          fallbackRequest.input('percentage', sql.Int, updates.percentage);
        }
        if (updates.isActive !== undefined) {
          fallbackParts.push('is_active = @isActive');
          fallbackRequest.input('isActive', sql.Bit, updates.isActive);
        }

        if (fallbackParts.length > 0) {
          try {
            fallbackParts.push('updated_at = GETDATE()');
            const fallbackQuery = `UPDATE claim_value_slabs SET ${fallbackParts.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;
            const fallbackResult = await fallbackRequest.query(fallbackQuery);
            if (fallbackResult.recordset.length > 0) {
              return this.mapClaimValueSlabFromDb(fallbackResult.recordset[0]);
            }
          } catch (fallbackError: any) {
            console.log('Fallback failed, using basic update:', fallbackError.message);
            
            // Final fallback - basic update without OUTPUT
            const basicParts = [];
            const basicRequest = db.pool.request();
            basicRequest.input('id', sql.Int, id);

            if (updates.minMonths !== undefined) {
              basicParts.push('min_months = @minMonths');
              basicRequest.input('minMonths', sql.Int, updates.minMonths);
            }
            if (updates.maxMonths !== undefined) {
              basicParts.push('max_months = @maxMonths');
              basicRequest.input('maxMonths', sql.Int, updates.maxMonths);
            }
            if (updates.percentage !== undefined) {
              basicParts.push('percentage = @percentage');
              basicRequest.input('percentage', sql.Int, updates.percentage);
            }
            if (updates.isActive !== undefined) {
              basicParts.push('is_active = @isActive');
              basicRequest.input('isActive', sql.Bit, updates.isActive);
            }

            if (basicParts.length > 0) {
              const basicQuery = `UPDATE claim_value_slabs SET ${basicParts.join(', ')} WHERE id = @id`;
              await basicRequest.query(basicQuery);
              // Return the updated record by querying again
              return await this.getClaimValueSlabById(id);
            }
          }
        }
      }
    }
    return undefined;
  }

  async deleteClaimValueSlab(id: number): Promise<boolean> {
    await db.connectDB();
    
    try {
      const query = `DELETE FROM claim_value_slabs WHERE id = @id`;
      const request = db.pool.request();
      request.input('id', sql.Int, id);
      const result = await request.query(query);
      
      return result.rowsAffected[0] > 0;
    } catch (error: any) {
      console.error('Error deleting claim value slab:', error);
      return false;
    }
  }

  async getClaimValueSlabById(id: number): Promise<ClaimValueSlab | undefined> {
    await db.connectDB();
    const query = `SELECT * FROM claim_value_slabs WHERE id = @id`;
    
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(query);
    if (result.recordset.length > 0) {
      return this.mapClaimValueSlabFromDb(result.recordset[0]);
    }
    return undefined;
  }

  private mapClaimValueSlabFromDb(row: any): ClaimValueSlab {
    return {
      id: row.id,
      deviceType: row.device_type || row.deviceType || 'mobile', // Preserve existing deviceType from memory
      brand: row.brand || null,
      minMonths: row.min_months,
      maxMonths: row.max_months,
      percentage: row.percentage,
      isActive: row.is_active,
      registrationSource: row.registration_source || 'regular', // Add support for registration_source
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Theme Settings operations
  async getCurrentThemeSettings(): Promise<ThemeSettings | undefined> {
    try {
      await db.connectDB();
      const query = `SELECT TOP 1 * FROM theme_settings ORDER BY created_at DESC`;
      const result = await db.pool.request().query(query);
      
      if (result.recordset.length > 0) {
        return this.mapThemeSettingsFromDb(result.recordset[0]);
      }
    } catch (error) {
      console.log('Database theme settings failed, using in-memory fallback');
    }
    
    // Fallback to in-memory storage
    return {
      id: 1,
      primaryColor: this.themeStorage.primaryColor,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Fallback in-memory theme storage
  private themeStorage: { primaryColor: string } = { 
    primaryColor: '#254696' 
  };

  async updateThemeSettings(settings: InsertThemeSettings): Promise<ThemeSettings> {
    console.log('Updating theme settings:', { 
      primaryColor: settings.primaryColor
    });
    
    try {
      await db.connectDB();
      
      // Check if we have existing settings
      const existing = await this.getCurrentThemeSettings();
      
      if (existing && existing.id && existing.id > 0) {
        // Update existing record
        const setParts = [];
        const request = db.pool.request();
        request.input('id', sql.Int, existing.id);
        
        if (settings.primaryColor !== undefined) {
          setParts.push('primary_color = @primaryColor');
          request.input('primaryColor', sql.NVarChar, settings.primaryColor);
        }
        
        setParts.push('updated_at = GETDATE()');
        
        const query = `
          UPDATE theme_settings 
          SET ${setParts.join(', ')}
          OUTPUT INSERTED.*
          WHERE id = @id
        `;
        
        const result = await request.query(query);
        console.log('Database theme updated successfully');
        return this.mapThemeSettingsFromDb(result.recordset[0]);
      } else {
        // Insert new record
        const query = `
          INSERT INTO theme_settings (primary_color)
          OUTPUT INSERTED.*
          VALUES (@primaryColor)
        `;
        
        const request = db.pool.request();
        request.input('primaryColor', sql.NVarChar, settings.primaryColor || '#254696');
        
        const result = await request.query(query);
        console.log('Database theme inserted successfully');
        return this.mapThemeSettingsFromDb(result.recordset[0]);
      }
    } catch (error) {
      console.error('Database theme update failed:', error);
      
      // Update in-memory storage as fallback
      if (settings.primaryColor !== undefined) {
        this.themeStorage.primaryColor = settings.primaryColor;
      }
      console.log('Using in-memory fallback storage');
      
      return {
        id: 1,
        primaryColor: this.themeStorage.primaryColor,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  private mapThemeSettingsFromDb(row: any): ThemeSettings {
    return {
      id: row.id,
      primaryColor: row.primary_color,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Create theme settings table method for initialization
  private async createThemeSettingsTable(): Promise<void> {
    await db.connectDB();
    
    const createTableQuery = `
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'theme_settings')
      BEGIN
        CREATE TABLE theme_settings (
          id INT IDENTITY(1,1) PRIMARY KEY,
          primary_color NVARCHAR(7) NOT NULL DEFAULT '#254696',
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE()
        );
      END
    `;
    
    await db.pool.request().query(createTableQuery);
  }

  // SMTP Settings operations
  async getSmtpSettings(): Promise<SmtpSettings | undefined> {
    await db.connectDB();
    
    const query = `SELECT TOP 1 * FROM smtp_settings WHERE is_active = 1 ORDER BY id DESC`;
    const request = db.pool.request();
    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
      return undefined;
    }
    
    const row = result.recordset[0];
    return {
      id: row.id,
      smtpHost: row.smtp_host,
      smtpPort: row.smtp_port,
      smtpUsername: row.smtp_username,
      smtpPassword: row.smtp_password,
      fromAddress: row.from_address,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateSmtpSettings(settings: InsertSmtpSettings): Promise<SmtpSettings> {
    await db.connectDB();
    
    // First, deactivate any existing settings
    const deactivateQuery = `UPDATE smtp_settings SET is_active = 0`;
    await db.pool.request().query(deactivateQuery);
    
    // Insert new settings
    const insertQuery = `
      INSERT INTO smtp_settings (smtp_host, smtp_port, smtp_username, smtp_password, from_address, is_active)
      OUTPUT INSERTED.*
      VALUES (@smtpHost, @smtpPort, @smtpUsername, @smtpPassword, @fromAddress, 1)
    `;
    
    const request = db.pool.request();
    request.input('smtpHost', sql.NVarChar, settings.smtpHost);
    request.input('smtpPort', sql.Int, settings.smtpPort || 587);
    request.input('smtpUsername', sql.NVarChar, settings.smtpUsername);
    request.input('smtpPassword', sql.NVarChar, settings.smtpPassword);
    request.input('fromAddress', sql.NVarChar, settings.fromAddress);
    
    const result = await request.query(insertQuery);
    const row = result.recordset[0];
    
    return {
      id: row.id,
      smtpHost: row.smtp_host,
      smtpPort: row.smtp_port,
      smtpUsername: row.smtp_username,
      smtpPassword: row.smtp_password,
      fromAddress: row.from_address,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // BBG Price Settings operations
  async getBbgPriceSettings(): Promise<BbgPriceSettings | undefined> {
    await db.connectDB();
    
    const query = `SELECT TOP 1 * FROM bbg_price_settings WHERE is_active = 1 ORDER BY id DESC`;
    const request = db.pool.request();
    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
      return undefined;
    }
    
    const row = result.recordset[0];
    return {
      id: row.id,
      laptopPrice: parseFloat(row.laptop_price),
      mobilePrice: parseFloat(row.mobile_price),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateBbgPriceSettings(settings: InsertBbgPriceSettings): Promise<BbgPriceSettings> {
    await db.connectDB();
    
    // First, deactivate any existing settings
    const deactivateQuery = `UPDATE bbg_price_settings SET is_active = 0`;
    await db.pool.request().query(deactivateQuery);
    
    // Insert new settings
    const insertQuery = `
      INSERT INTO bbg_price_settings (laptop_price, mobile_price, is_active)
      OUTPUT INSERTED.*
      VALUES (@laptopPrice, @mobilePrice, 1)
    `;
    
    const request = db.pool.request();
    request.input('laptopPrice', sql.Decimal(10, 2), settings.laptopPrice);
    request.input('mobilePrice', sql.Decimal(10, 2), settings.mobilePrice);
    
    const result = await request.query(insertQuery);
    const row = result.recordset[0];
    
    return {
      id: row.id,
      laptopPrice: parseFloat(row.laptop_price),
      mobilePrice: parseFloat(row.mobile_price),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Referral Discount Settings operations
  async getReferralDiscountSettings(): Promise<any> {
    await db.connectDB();
    
    const query = `SELECT TOP 1 * FROM referral_discount_settings ORDER BY id DESC`;
    const request = db.pool.request();
    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
      return undefined;
    }
    
    const row = result.recordset[0];
    return {
      id: row.id,
      isActive: row.is_active,
      discountType: row.discount_type,
      discountValue: parseFloat(row.discount_value),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async updateReferralDiscountSettings(settings: any): Promise<any> {
    await db.connectDB();
    
    // Check if settings exist
    const existingQuery = `SELECT TOP 1 id FROM referral_discount_settings`;
    const existingResult = await db.pool.request().query(existingQuery);
    
    let query: string;
    let request = db.pool.request();
    
    if (existingResult.recordset.length > 0) {
      // Update existing settings
      query = `
        UPDATE referral_discount_settings 
        SET is_active = @isActive, 
            discount_type = @discountType, 
            discount_value = @discountValue,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = (SELECT TOP 1 id FROM referral_discount_settings ORDER BY id DESC)
      `;
    } else {
      // Insert new settings
      query = `
        INSERT INTO referral_discount_settings (is_active, discount_type, discount_value)
        OUTPUT INSERTED.*
        VALUES (@isActive, @discountType, @discountValue)
      `;
    }
    
    request.input('isActive', sql.Bit, settings.isActive);
    request.input('discountType', sql.NVarChar, settings.discountType);
    request.input('discountValue', sql.Decimal(10, 2), settings.discountValue);
    
    const result = await request.query(query);
    const row = result.recordset[0];
    
    return {
      id: row.id,
      isActive: row.is_active,
      discountType: row.discount_type,
      discountValue: parseFloat(row.discount_value),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // WhatsApp Configuration implementations
  async getWhatsAppConfig(): Promise<any> {
    try {
      await db.connectDB();
      const query = `SELECT * FROM whatsapp_config WHERE is_active = 1 ORDER BY created_at DESC`;
      const result = await db.pool.request().query(query);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      const row = result.recordset[0];
      return {
        id: row.id,
        userId: row.user_id,
        password: row.password,
        baseUrl: row.base_url,
        isEnabled: row.is_enabled,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error getting WhatsApp config:', error);
      return null;
    }
  }

  async updateWhatsAppConfig(config: { userId: string; password: string; baseUrl: string; isEnabled: boolean }): Promise<any> {
    try {
      await db.connectDB();
      
      // First, create table if it doesn't exist
      await this.createWhatsAppConfigTableIfNotExists();
      
      // Deactivate existing configs
      const deactivateQuery = `UPDATE whatsapp_config SET is_active = 0`;
      await db.pool.request().query(deactivateQuery);
      
      // Insert new config
      const insertQuery = `
        INSERT INTO whatsapp_config (user_id, password, base_url, is_enabled, is_active)
        OUTPUT INSERTED.*
        VALUES (@userId, @password, @baseUrl, @isEnabled, 1)
      `;
      
      const request = db.pool.request();
      request.input('userId', sql.NVarChar, config.userId);
      request.input('password', sql.NVarChar, config.password);
      request.input('baseUrl', sql.NVarChar, config.baseUrl);
      request.input('isEnabled', sql.Bit, config.isEnabled);
      
      const result = await request.query(insertQuery);
      const row = result.recordset[0];
      
      return {
        id: row.id,
        userId: row.user_id,
        password: row.password,
        baseUrl: row.base_url,
        isEnabled: row.is_enabled,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
      throw error;
    }
  }

  async getWhatsAppTemplates(): Promise<any[]> {
    try {
      await db.connectDB();
      const query = `SELECT * FROM message_templates WHERE channel = 'whatsapp' ORDER BY template_name`;
      const result = await db.pool.request().query(query);
      
      return result.recordset.map(row => ({
        id: row.id,
        templateName: row.template_name,
        subject: row.subject,
        content: row.content,
        variables: row.variables ? JSON.parse(row.variables) : [],
        channel: row.channel,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting WhatsApp templates:', error);
      return [];
    }
  }

  private async createWhatsAppConfigTableIfNotExists(): Promise<void> {
    try {
      await db.connectDB();
      const checkTableQuery = `
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'whatsapp_config'
      `;
      
      const checkResult = await db.pool.request().query(checkTableQuery);
      
      if (checkResult.recordset[0].count === 0) {
        const createTableQuery = `
          CREATE TABLE whatsapp_config (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id NVARCHAR(255) NOT NULL,
            password NVARCHAR(255) NOT NULL,
            base_url NVARCHAR(500) NOT NULL,
            is_enabled BIT DEFAULT 1,
            is_active BIT DEFAULT 1,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
          )
        `;
        
        await db.pool.request().query(createTableQuery);
        console.log('WhatsApp config table created successfully');
      }
    } catch (error) {
      console.error('Error creating WhatsApp config table:', error);
    }
  }

  private async addAddressColumnToClaimsTable(): Promise<void> {
    try {
      await db.connectDB();
      
      // Check if address column exists
      const checkColumnQuery = `
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'claims' AND COLUMN_NAME = 'address'
      `;
      
      const checkResult = await db.pool.request().query(checkColumnQuery);
      
      if (checkResult.recordset[0].count === 0) {
        // Add address column to claims table
        const addColumnQuery = `
          ALTER TABLE claims 
          ADD address NVARCHAR(500) NULL
        `;
        
        await db.pool.request().query(addColumnQuery);
        console.log('Added address column to claims table');
      }
    } catch (error) {
      console.error('Error adding address column to claims table:', error);
    }
  }

  // Waiting Period Settings Management
  async getWaitingPeriodSettings(): Promise<{ enabled: boolean; months: number } | null> {
    await db.connectDB();
    const query = `SELECT enabled, months FROM waiting_period_settings WHERE setting_name = 'claim_waiting_period'`;
    
    const request = db.pool.request();
    const result = await request.query(query);
    
    if (result.recordset.length > 0) {
      const settings = result.recordset[0];
      return {
        enabled: settings.enabled,
        months: settings.months
      };
    }
    
    return null;
  }

  async updateWaitingPeriodSettings(enabled: boolean, months: number): Promise<void> {
    await db.connectDB();
    const updateQuery = `
      UPDATE waiting_period_settings 
      SET enabled = @enabled, months = @months, updated_at = GETDATE()
      WHERE setting_name = 'claim_waiting_period'
    `;
    
    const request = db.pool.request();
    await request
      .input('enabled', sql.Bit, enabled)
      .input('months', sql.Int, months)
      .query(updateQuery);
      
    console.log(`✅ Waiting period settings updated - Enabled: ${enabled}, Months: ${months}`);
  }

  // Homepage Banner operations
  async getAllHomepageBanners(): Promise<HomepageBanner[]> {
    await db.connectDB();
    
    const query = `SELECT * FROM homepage_banners ORDER BY sort_order ASC, id ASC`;
    const request = db.pool.request();
    const result = await request.query(query);
    
    return result.recordset.map(this.mapHomepageBannerFromDb);
  }

  async getActiveHomepageBanners(): Promise<HomepageBanner[]> {
    await db.connectDB();
    
    const query = `SELECT * FROM homepage_banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`;
    const request = db.pool.request();
    const result = await request.query(query);
    
    return result.recordset.map(this.mapHomepageBannerFromDb);
  }

  async createHomepageBanner(banner: InsertHomepageBanner): Promise<HomepageBanner> {
    await db.connectDB();
    
    const query = `
      INSERT INTO homepage_banners (
        title, description, desktop_image_url, mobile_image_url, 
        link_url, is_active, sort_order
      )
      OUTPUT INSERTED.*
      VALUES (
        @title, @description, @desktopImageUrl, @mobileImageUrl,
        @linkUrl, @isActive, @sortOrder
      )
    `;
    
    const request = db.pool.request();
    request.input('title', sql.NVarChar, banner.title);
    request.input('description', sql.NVarChar, banner.description || null);
    request.input('desktopImageUrl', sql.NVarChar, banner.desktopImageUrl);
    request.input('mobileImageUrl', sql.NVarChar, banner.mobileImageUrl);
    request.input('linkUrl', sql.NVarChar, banner.linkUrl || null);
    request.input('isActive', sql.Bit, banner.isActive ?? true);
    request.input('sortOrder', sql.Int, banner.sortOrder || 0);
    
    const result = await request.query(query);
    return this.mapHomepageBannerFromDb(result.recordset[0]);
  }

  async updateHomepageBanner(id: number, updates: Partial<InsertHomepageBanner>): Promise<void> {
    await db.connectDB();
    
    const setParts = [];
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    if (updates.title !== undefined) {
      setParts.push('title = @title');
      request.input('title', sql.NVarChar, updates.title);
    }
    
    if (updates.description !== undefined) {
      setParts.push('description = @description');
      request.input('description', sql.NVarChar, updates.description);
    }
    
    if (updates.desktopImageUrl !== undefined) {
      setParts.push('desktop_image_url = @desktopImageUrl');
      request.input('desktopImageUrl', sql.NVarChar, updates.desktopImageUrl);
    }
    
    if (updates.mobileImageUrl !== undefined) {
      setParts.push('mobile_image_url = @mobileImageUrl');
      request.input('mobileImageUrl', sql.NVarChar, updates.mobileImageUrl);
    }
    
    if (updates.linkUrl !== undefined) {
      setParts.push('link_url = @linkUrl');
      request.input('linkUrl', sql.NVarChar, updates.linkUrl);
    }
    
    if (updates.isActive !== undefined) {
      setParts.push('is_active = @isActive');
      request.input('isActive', sql.Bit, updates.isActive);
    }
    
    if (updates.sortOrder !== undefined) {
      setParts.push('sort_order = @sortOrder');
      request.input('sortOrder', sql.Int, updates.sortOrder);
    }
    
    setParts.push('updated_at = GETDATE()');
    
    const query = `
      UPDATE homepage_banners 
      SET ${setParts.join(', ')}
      WHERE id = @id
    `;
    
    await request.query(query);
  }

  async deleteHomepageBanner(id: number): Promise<void> {
    await db.connectDB();
    
    const query = `DELETE FROM homepage_banners WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    await request.query(query);
  }

  async getHomepageBannerById(id: number): Promise<HomepageBanner | undefined> {
    await db.connectDB();
    
    const query = `SELECT * FROM homepage_banners WHERE id = @id`;
    const request = db.pool.request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(query);
    
    if (result.recordset.length === 0) {
      return undefined;
    }
    
    return this.mapHomepageBannerFromDb(result.recordset[0]);
  }

  private mapHomepageBannerFromDb(row: any): HomepageBanner {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      desktopImageUrl: row.desktop_image_url,
      mobileImageUrl: row.mobile_image_url,
      linkUrl: row.link_url,
      isActive: row.is_active,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // ===== TRANSACTION HISTORY METHODS =====

  async createTransactionHistory(transaction: {
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerContact?: string;
    transactionId: string;
    paymentMethod: string;
    amount: number;
    currency?: string;
    status?: string;
    deviceType?: string;
    deviceBrand?: string;
    referralCode?: string;
    discountApplied?: number;
    originalAmount?: number;
    registrationSource?: string;
    metadata?: string;
  }): Promise<any> {
    await db.connectDB();
    
    const query = `
      INSERT INTO transaction_history (
        customer_id, customer_name, customer_email, customer_contact,
        transaction_id, payment_method, amount, currency, status,
        device_type, device_brand, referral_code, discount_applied,
        original_amount, registration_source, metadata
      )
      OUTPUT INSERTED.*
      VALUES (
        @customerId, @customerName, @customerEmail, @customerContact,
        @transactionId, @paymentMethod, @amount, @currency, @status,
        @deviceType, @deviceBrand, @referralCode, @discountApplied,
        @originalAmount, @registrationSource, @metadata
      )
    `;
    
    const request = db.pool.request();
    request.input('customerId', sql.VarChar, transaction.customerId || null);
    request.input('customerName', sql.VarChar, transaction.customerName);
    request.input('customerEmail', sql.VarChar, transaction.customerEmail || null);
    request.input('customerContact', sql.VarChar, transaction.customerContact || null);
    request.input('transactionId', sql.VarChar, transaction.transactionId);
    request.input('paymentMethod', sql.VarChar, transaction.paymentMethod);
    request.input('amount', sql.Decimal(10, 2), transaction.amount);
    request.input('currency', sql.VarChar, transaction.currency || 'INR');
    request.input('status', sql.VarChar, transaction.status || 'pending');
    request.input('deviceType', sql.VarChar, transaction.deviceType || null);
    request.input('deviceBrand', sql.VarChar, transaction.deviceBrand || null);
    request.input('referralCode', sql.VarChar, transaction.referralCode || null);
    request.input('discountApplied', sql.Decimal(10, 2), transaction.discountApplied || 0);
    request.input('originalAmount', sql.Decimal(10, 2), transaction.originalAmount || null);
    request.input('registrationSource', sql.VarChar, transaction.registrationSource || 'regular');
    request.input('metadata', sql.NVarChar(sql.MAX), transaction.metadata || null);
    
    const result = await request.query(query);
    return result.recordset[0];
  }

  async updateTransactionHistory(transactionId: string, updates: {
    status?: string;
    customerId?: string;
    metadata?: string;
  }): Promise<void> {
    await db.connectDB();
    
    let setParts: string[] = [];
    const request = db.pool.request();
    
    if (updates.status) {
      setParts.push('status = @status');
      request.input('status', sql.VarChar, updates.status);
    }
    if (updates.customerId) {
      setParts.push('customer_id = @customerId');
      request.input('customerId', sql.VarChar, updates.customerId);
    }
    if (updates.metadata !== undefined) {
      setParts.push('metadata = @metadata');
      request.input('metadata', sql.NVarChar(sql.MAX), updates.metadata);
    }
    
    if (setParts.length === 0) return;
    
    setParts.push('updated_at = GETDATE()');
    
    const query = `
      UPDATE transaction_history 
      SET ${setParts.join(', ')}
      WHERE transaction_id = @transactionId
    `;
    
    request.input('transactionId', sql.VarChar, transactionId);
    await request.query(query);
  }

  async getAllTransactionHistory(filters?: {
    status?: string;
    paymentMethod?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<any[]> {
    await db.connectDB();
    
    let query = `
      SELECT *
      FROM transaction_history
      WHERE 1=1
    `;
    
    const request = db.pool.request();
    
    if (filters?.status && filters.status !== 'all') {
      query += ' AND status = @status';
      request.input('status', sql.VarChar, filters.status);
    }
    
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      query += ' AND payment_method = @paymentMethod';
      request.input('paymentMethod', sql.VarChar, filters.paymentMethod);
    }
    
    if (filters?.dateFrom) {
      query += ' AND created_at >= @dateFrom';
      request.input('dateFrom', sql.DateTime2, new Date(filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      query += ' AND created_at <= @dateTo';
      request.input('dateTo', sql.DateTime2, new Date(filters.dateTo + ' 23:59:59'));
    }
    
    if (filters?.search) {
      query += ` AND (
        customer_name LIKE @search OR 
        customer_email LIKE @search OR 
        customer_contact LIKE @search OR
        transaction_id LIKE @search OR
        referral_code LIKE @search
      )`;
      request.input('search', sql.VarChar, `%${filters.search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await request.query(query);
    
    return result.recordset.map((row: any) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerContact: row.customer_contact,
      transactionId: row.transaction_id,
      paymentMethod: row.payment_method,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      deviceType: row.device_type,
      deviceBrand: row.device_brand,
      referralCode: row.referral_code,
      discountApplied: parseFloat(row.discount_applied || 0),
      originalAmount: parseFloat(row.original_amount || 0),
      registrationSource: row.registration_source,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }
}

export const storage = new SqlServerStorage();