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
  type InsertDeviceModel
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
  getAllCustomers(): Promise<Customer[]>;
  updateCustomerVerification(id: number, isVerified: boolean): Promise<void>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<void>;
  deleteCustomer(id: number): Promise<void>;
  
  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
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
}

export class SqlServerStorage implements IStorage {
  
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await db.connectDB();
      await this.createTablesIfNotExist();
      console.log('SQL Server database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQL Server database:', error);
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
          name NVARCHAR(100) NOT NULL,
          brand_id INT NOT NULL,
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE(),
          FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
        );
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
    `;

    const request = db.pool.request();
    await request.query(createTablesScript);
  }

  // Distributor operations
  async createDistributor(insertDistributor: InsertDistributor): Promise<Distributor> {
    await db.connectDB();
    const sellerCode = this.generateSellerCode();
    
    const query = `
      INSERT INTO distributors (
        name, business_name, contact, email, pincode, location, preferred_mode,
        pan_number, pan_copy_file, is_gst_registered, gstin, gst_certificate_file,
        registered_business_address, is_msme_registered, msme_certificate_file,
        account_holder_name, bank_account, bank_account_confirm, ifsc_code, upi_id,
        cancelled_cheque_file, info_declaration, tds_understanding, gst_invoice_agreement,
        terms_agreement, seller_code
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @businessName, @contact, @email, @pincode, @location, @preferredMode,
        @panNumber, @panCopyFile, @isGstRegistered, @gstin, @gstCertificateFile,
        @registeredBusinessAddress, @isMsmeRegistered, @msmeCertificateFile,
        @accountHolderName, @bankAccount, @bankAccountConfirm, @ifscCode, @upiId,
        @cancelledChequeFile, @infoDeclaration, @tdsUnderstanding, @gstInvoiceAgreement,
        @termsAgreement, @sellerCode
      )
    `;

    const request = db.pool.request();
    // Basic info
    request.input('name', sql.NVarChar, insertDistributor.name);
    request.input('businessName', sql.NVarChar, insertDistributor.businessName || null);
    request.input('contact', sql.NVarChar, insertDistributor.contact);
    request.input('email', sql.NVarChar, insertDistributor.email);
    request.input('pincode', sql.NVarChar, insertDistributor.pincode);
    request.input('location', sql.NVarChar, insertDistributor.location);
    request.input('preferredMode', sql.NVarChar, insertDistributor.preferredMode);
    
    // Tax & Compliance Details
    request.input('panNumber', sql.NVarChar, insertDistributor.panNumber);
    request.input('panCopyFile', sql.NVarChar, insertDistributor.panCopyFile || null);
    request.input('isGstRegistered', sql.Bit, insertDistributor.isGstRegistered || false);
    request.input('gstin', sql.NVarChar, insertDistributor.gstin || null);
    request.input('gstCertificateFile', sql.NVarChar, insertDistributor.gstCertificateFile || null);
    request.input('registeredBusinessAddress', sql.NVarChar, insertDistributor.registeredBusinessAddress || null);
    request.input('isMsmeRegistered', sql.Bit, insertDistributor.isMsmeRegistered || false);
    request.input('msmeCertificateFile', sql.NVarChar, insertDistributor.msmeCertificateFile || null);
    
    // Bank Details
    request.input('accountHolderName', sql.NVarChar, insertDistributor.accountHolderName);
    request.input('bankAccount', sql.NVarChar, insertDistributor.bankAccount);
    request.input('bankAccountConfirm', sql.NVarChar, insertDistributor.bankAccountConfirm);
    request.input('ifscCode', sql.NVarChar, insertDistributor.ifscCode);
    request.input('upiId', sql.NVarChar, insertDistributor.upiId || null);
    request.input('cancelledChequeFile', sql.NVarChar, insertDistributor.cancelledChequeFile);
    
    // Declarations
    request.input('infoDeclaration', sql.Bit, insertDistributor.infoDeclaration || false);
    request.input('tdsUnderstanding', sql.Bit, insertDistributor.tdsUnderstanding || false);
    request.input('gstInvoiceAgreement', sql.Bit, insertDistributor.gstInvoiceAgreement || false);
    request.input('termsAgreement', sql.Bit, insertDistributor.termsAgreement || false);
    
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

  // Distributor Authentication
  async createDistributorSession(distributorId: number, contact: string): Promise<string> {
    await db.connectDB();
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour session

    const query = `
      INSERT INTO distributor_sessions (distributor_id, session_token, expires_at)
      VALUES (@distributorId, @sessionToken, @expiresAt)
    `;

    const request = db.pool.request();
    request.input('distributorId', sql.Int, distributorId);
    request.input('sessionToken', sql.NVarChar, sessionToken);
    request.input('expiresAt', sql.DateTime2, expiresAt);

    await request.query(query);
    return sessionToken;
  }

  async verifyDistributorSession(token: string): Promise<Distributor | null> {
    await db.connectDB();
    const query = `
      SELECT d.*, ds.expires_at 
      FROM distributors d
      INNER JOIN distributor_sessions ds ON d.id = ds.distributor_id
      WHERE ds.session_token = @token AND ds.expires_at > GETDATE()
    `;

    const request = db.pool.request();
    request.input('token', sql.NVarChar, token);

    const result = await request.query(query);
    if (result.recordset.length > 0) {
      return this.mapDistributorFromDb(result.recordset[0]);
    }
    return null;
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
      businessName: row.business_name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      location: row.location,
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
  }> {
    await db.connectDB();
    
    const results = {
      totalRows: data.length,
      successfulRows: 0,
      errors: [] as string[]
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Normalize device type
        const deviceType = row.device.toLowerCase().trim();
        const brandName = row.brand.trim();
        const modelName = row.model.trim();

        if (!['mobile', 'laptop'].includes(deviceType)) {
          results.errors.push(`Row ${i + 1}: Invalid device type '${row.device}'. Must be 'mobile' or 'laptop'.`);
          continue;
        }

        // Check if brand exists
        let brandQuery = `
          SELECT id FROM brands 
          WHERE LOWER(name) = LOWER(@brandName) AND device_type = @deviceType
        `;
        
        let brandRequest = db.pool.request();
        brandRequest.input('brandName', sql.VarChar, brandName);
        brandRequest.input('deviceType', sql.VarChar, deviceType);
        
        let brandResult = await brandRequest.query(brandQuery);
        let brandId: number;

        if (brandResult.recordset.length === 0) {
          // Create new brand
          const createBrandQuery = `
            INSERT INTO brands (name, device_type)
            OUTPUT INSERTED.id
            VALUES (@brandName, @deviceType)
          `;
          
          const createBrandRequest = db.pool.request();
          createBrandRequest.input('brandName', sql.VarChar, brandName);
          createBrandRequest.input('deviceType', sql.VarChar, deviceType);
          
          const createBrandResult = await createBrandRequest.query(createBrandQuery);
          brandId = createBrandResult.recordset[0].id;
        } else {
          brandId = brandResult.recordset[0].id;
        }

        // Check if model exists
        const modelQuery = `
          SELECT id FROM models 
          WHERE LOWER(name) = LOWER(@modelName) AND brand_id = @brandId
        `;
        
        const modelRequest = db.pool.request();
        modelRequest.input('modelName', sql.VarChar, modelName);
        modelRequest.input('brandId', sql.Int, brandId);
        
        const modelResult = await modelRequest.query(modelQuery);

        if (modelResult.recordset.length === 0) {
          // Create new model
          const createModelQuery = `
            INSERT INTO models (name, brand_id, is_active)
            VALUES (@modelName, @brandId, 1)
          `;
          
          const createModelRequest = db.pool.request();
          createModelRequest.input('modelName', sql.VarChar, modelName);
          createModelRequest.input('brandId', sql.Int, brandId);
          
          await createModelRequest.query(createModelQuery);
        }

        results.successfulRows++;
      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return results;
  }

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    await db.connectDB();
    const voucherCode = this.generateVoucherCode();
    
    const query = `
      INSERT INTO customers (
        name, contact, email, pincode, device_type, serial_number, 
        brand, model_name, invoice_value, date_of_purchase, seller_code, voucher_code, payment_intent_id, is_verified
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @contact, @email, @pincode, @deviceType, @serialNumber, 
        @brand, @modelName, @invoiceValue, @dateOfPurchase, @sellerCode, @voucherCode, @paymentIntentId, @isVerified
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
    await db.connectDB();
    const query = `SELECT * FROM customers WHERE voucher_code = @voucherCode`;
    
    const request = db.pool.request();
    request.input('voucherCode', sql.NVarChar, voucherCode);
    
    const result = await request.query(query);
    return result.recordset.length > 0 ? this.mapCustomerFromDb(result.recordset[0]) : undefined;
  }

  async getCustomersBySellerCode(sellerCode: string): Promise<Customer[]> {
    await db.connectDB();
    const query = `SELECT * FROM customers WHERE seller_code = @sellerCode`;
    
    const request = db.pool.request();
    request.input('sellerCode', sql.NVarChar, sellerCode);
    
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
    
    const query = `
      INSERT INTO claims (
        customer_id, voucher_code, contact, email, serial_number, pickup_date, 
        pickup_time_slot, device_age_months, claim_percentage, claim_amount
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @customerId, @voucherCode, @contact, @email, @serialNumber, @pickupDate, 
        @pickupTimeSlot, @deviceAgeMonths, @claimPercentage, @claimAmount
      )
    `;

    const request = db.pool.request();
    request.input('customerId', sql.Int, insertClaim.customerId);
    request.input('voucherCode', sql.NVarChar, insertClaim.voucherCode);
    request.input('contact', sql.NVarChar, insertClaim.contact);
    request.input('email', sql.NVarChar, insertClaim.email);
    request.input('serialNumber', sql.NVarChar, insertClaim.serialNumber);
    request.input('pickupDate', sql.NVarChar, insertClaim.pickupDate);
    request.input('pickupTimeSlot', sql.NVarChar, insertClaim.pickupTimeSlot);
    request.input('deviceAgeMonths', sql.Int, insertClaim.deviceAgeMonths);
    request.input('claimPercentage', sql.Decimal(5, 2), insertClaim.claimPercentage);
    request.input('claimAmount', sql.Decimal(10, 2), insertClaim.claimAmount);

    const result = await request.query(query);
    return this.mapClaimFromDb(result.recordset[0]);
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
      businessName: row.business_name,
      contact: row.contact,
      email: row.email,
      pincode: row.pincode,
      preferredMode: row.preferred_mode,
      panNumber: row.pan_number,
      panCopyFile: row.pan_copy_file,
      isGstRegistered: Boolean(row.is_gst_registered),
      gstin: row.gstin,
      gstCertificateFile: row.gst_certificate_file,
      registeredBusinessAddress: row.registered_business_address,
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
      dateOfPurchase: row.date_of_purchase,
      sellerCode: row.seller_code,
      voucherCode: row.voucher_code,
      paymentIntentId: row.payment_intent_id,
      isVerified: Boolean(row.is_verified),
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

  private generateSellerCode(): string {
    return 'XTS' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateVoucherCode(): string {
    return 'BBG' + Math.random().toString(36).substring(2, 12).toUpperCase();
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
    if (updates.location !== undefined) {
      setParts.push('location = @location');
      request.input('location', sql.NVarChar, updates.location);
    }

    if (setParts.length > 0) {
      const query = `UPDATE distributors SET ${setParts.join(', ')} WHERE id = @id`;
      await request.query(query);
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

  // Pending Payment operations
  async createPendingPayment(insertPayment: InsertPendingPayment): Promise<PendingPayment> {
    await db.connectDB();
    const query = `
      INSERT INTO pending_payments (
        name, contact, email, pincode, device_type, serial_number, 
        brand, model_name, invoice_value, payment_amount, transaction_id, 
        seller_code, status, expires_at
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @name, @contact, @email, @pincode, @deviceType, @serialNumber, 
        @brand, @modelName, @invoiceValue, @paymentAmount, @transactionId, 
        @sellerCode, @status, @expiresAt
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
      createdAt: row.created_at
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
}

export const storage = new SqlServerStorage();