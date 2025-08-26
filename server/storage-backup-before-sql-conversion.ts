import { distributors, customers, claims, otpVerifications, adminUsers, pendingPayments, brands, deviceModels, userRoles, cartAbandonments, distributorSessions, commissionPayouts } from "@shared/schema";
import type { 
  Distributor, Customer, Claim, OtpVerification, AdminUser, PendingPayment, Brand, DeviceModel, UserRole, CartAbandonment, DistributorSession, CommissionPayout,
  InsertDistributor, InsertCustomer, InsertClaim, InsertOtp, InsertAdminUser, InsertPendingPayment, InsertBrand, InsertDeviceModel, InsertUserRole, InsertCartAbandonment
} from "@shared/schema";
import { pool } from "./db";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sql from 'mssql';

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
  deleteDistributorSessionsByDistributorId(distributorId: number): Promise<void>;
  
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

  // Cart Abandonment operations
  createCartAbandonment(abandonment: InsertCartAbandonment): Promise<CartAbandonment>;
  getCartAbandonmentBySessionId(sessionId: string): Promise<CartAbandonment | null>;
  updateCartAbandonment(sessionId: string, updates: Partial<InsertCartAbandonment>): Promise<void>;
  getAllCartAbandonments(): Promise<CartAbandonment[]>;
  deleteCartAbandonment(id: number): Promise<void>;
  cleanupOldCartAbandonments(daysOld: number): Promise<void>;

  // WhatsApp Configuration operations
  getWhatsAppConfig(): Promise<any>;
  updateWhatsAppConfig(config: { userId: string; password: string; baseUrl: string; isEnabled: boolean }): Promise<any>;
  getWhatsAppTemplates(): Promise<any[]>;

  // Claim Value Slab operations
  getAllClaimValueSlabs(): Promise<any[]>;
  getActiveClaimValueSlabs(): Promise<any[]>;
  getActiveClaimValueSlabsByDeviceBrand(deviceType: string, brand: string | null): Promise<any[]>;
  getClaimValueSlabById(id: number): Promise<any | undefined>;
  createClaimValueSlab(slab: any): Promise<any>;
  updateClaimValueSlab(id: number, updates: any): Promise<any | undefined>;
  deleteClaimValueSlab(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Helper methods for code generation
  private generateSellerCode(distributorName?: string, distributorContact?: string): string {
    if (!distributorName || !distributorContact) {
      // Fallback to old method if data not available
      return "XTRA" + Date.now().toString().slice(-8);
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

  private generateVoucherCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "BBG";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // User Role operations
  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    if (!pool.connected) await pool.connect();
    const result = await pool.request()
      .input('name', sql.VarChar, role.name)
      .input('description', sql.VarChar, role.description || '')
      .input('isActive', sql.Bit, role.isActive || true)
      .query(`
        INSERT INTO user_roles (name, description, is_active, created_at)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @isActive, GETDATE())
      `);
    return result.recordset[0];
  }

  async getAllUserRoles(): Promise<UserRole[]> {
    return await db.select().from(userRoles).where(eq(userRoles.isActive, true));
  }

  async getUserRoleById(id: number): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.id, id));
    return role || undefined;
  }

  async updateUserRole(id: number, updates: Partial<InsertUserRole>): Promise<void> {
    await db.update(userRoles).set(updates).where(eq(userRoles.id, id));
  }

  async deleteUserRole(id: number): Promise<void> {
    await db.update(userRoles).set({ isActive: false }).where(eq(userRoles.id, id));
  }

  // Distributor operations
  async createDistributor(distributor: InsertDistributor): Promise<Distributor> {
    const distributorData = {
      ...distributor,
      sellerCode: this.generateSellerCode(distributor.name, distributor.contact),
    };
    const [createdDistributor] = await db.insert(distributors).values(distributorData).returning();
    return createdDistributor;
  }

  async getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined> {
    const [distributor] = await db.select().from(distributors).where(eq(distributors.sellerCode, sellerCode));
    return distributor || undefined;
  }

  async getDistributorByEmail(email: string): Promise<Distributor | undefined> {
    const [distributor] = await db.select().from(distributors).where(eq(distributors.email, email));
    return distributor || undefined;
  }

  async getDistributorByContact(contact: string): Promise<Distributor | undefined> {
    const [distributor] = await db.select().from(distributors).where(eq(distributors.contact, contact));
    return distributor || undefined;
  }

  async getAllDistributors(): Promise<Distributor[]> {
    return await db.select().from(distributors);
  }

  async updateDistributor(id: number, updates: Partial<InsertDistributor>): Promise<void> {
    await db.update(distributors).set(updates).where(eq(distributors.id, id));
  }

  async deleteDistributor(id: number): Promise<void> {
    await db.update(distributors).set({ isActive: false }).where(eq(distributors.id, id));
  }

  // Distributor Authentication methods
  async createDistributorSession(distributorId: number, contact: string): Promise<string> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await db.insert(distributorSessions).values({
      distributorId,
      sessionToken,
      expiresAt,
    });
    
    return sessionToken;
  }

  async verifyDistributorSession(token: string): Promise<Distributor | null> {
    const [session] = await db.select()
      .from(distributorSessions)
      .innerJoin(distributors, eq(distributorSessions.distributorId, distributors.id))
      .where(and(
        eq(distributorSessions.sessionToken, token),
        eq(distributors.isActive, true)
      ));

    if (!session || session.distributor_sessions.expiresAt < new Date()) {
      return null;
    }

    return session.distributors;
  }

  async deleteDistributorSession(token: string): Promise<void> {
    await db.delete(distributorSessions).where(eq(distributorSessions.sessionToken, token));
  }

  async deleteDistributorSessionsByDistributorId(distributorId: number): Promise<void> {
    await db.delete(distributorSessions).where(eq(distributorSessions.distributorId, distributorId));
  }

  // Distributor Dashboard methods
  async getDistributorStats(distributorId: number): Promise<{
    totalCustomers: number;
    totalEarnings: number;
    pendingPayouts: number;
    completedPayouts: number;
  }> {
    const distributor = await db.select().from(distributors).where(eq(distributors.id, distributorId));
    if (!distributor.length) {
      return { totalCustomers: 0, totalEarnings: 0, pendingPayouts: 0, completedPayouts: 0 };
    }

    const sellerCode = distributor[0].sellerCode;
    
    // Get customers registered with this seller code
    const customerCount = await db.select().from(customers).where(eq(customers.sellerCode, sellerCode));
    
    // Get payouts for this distributor
    const allPayouts = await db.select().from(commissionPayouts).where(eq(commissionPayouts.distributorId, distributorId));
    const pendingPayouts = allPayouts.filter(p => p.status === 'pending');
    const completedPayouts = allPayouts.filter(p => p.status === 'paid');
    
    const totalEarnings = completedPayouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
    const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + Number(payout.amount), 0);

    return {
      totalCustomers: customerCount.length,
      totalEarnings,
      pendingPayouts: pendingAmount,
      completedPayouts: completedPayouts.length,
    };
  }

  async getDistributorCustomers(distributorId: number): Promise<Customer[]> {
    const distributor = await db.select().from(distributors).where(eq(distributors.id, distributorId));
    if (!distributor.length) return [];

    const sellerCode = distributor[0].sellerCode;
    return await db.select().from(customers).where(eq(customers.sellerCode, sellerCode));
  }

  async getDistributorPayouts(distributorId: number): Promise<any[]> {
    return await db.select().from(commissionPayouts).where(eq(commissionPayouts.distributorId, distributorId));
  }

  // Additional admin methods needed
  async getAllDistributorsForAdmin(): Promise<Distributor[]> {
    return await db.select().from(distributors);
  }

  async getAllPayoutsForAdmin(): Promise<CommissionPayout[]> {
    return await db.select().from(commissionPayouts);
  }

  async updatePayoutStatus(id: number, status: string, paymentReference?: string): Promise<void> {
    const updateData: any = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
    }
    if (paymentReference) {
      updateData.paymentReference = paymentReference;
    }
    await db.update(commissionPayouts).set(updateData).where(eq(commissionPayouts.id, id));
  }

  async getClaimById(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim || undefined;
  }

  async bulkUploadBrandsAndModels(data: any[]): Promise<{ success: number; errors: string[] }> {
    let success = 0;
    const errors: string[] = [];
    
    for (const item of data) {
      try {
        // Create brand if it doesn't exist
        const existingBrand = await db.select().from(brands)
          .where(and(eq(brands.name, item.brand), eq(brands.deviceType, item.deviceType)));
        
        let brandId: number;
        if (existingBrand.length === 0) {
          const [newBrand] = await db.insert(brands)
            .values({ name: item.brand, deviceType: item.deviceType })
            .returning();
          brandId = newBrand.id;
        } else {
          brandId = existingBrand[0].id;
        }
        
        // Create model
        await db.insert(deviceModels).values({
          brandId,
          modelName: item.model,
          deviceType: item.deviceType,
        });
        
        success++;
      } catch (error) {
        errors.push(`Error processing ${item.brand} ${item.model}: ${error}`);
      }
    }
    
    return { success, errors };
  }

  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Customer operations
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const customerData = {
      ...customer,
      voucherCode: this.generateVoucherCode(),
    };
    const [createdCustomer] = await db.insert(customers).values(customerData).returning();
    return createdCustomer;
  }

  async getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.voucherCode, voucherCode));
    return customer || undefined;
  }

  async getCustomersBySellerCode(sellerCode: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.sellerCode, sellerCode));
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async updateCustomerVerification(id: number, isVerified: boolean): Promise<void> {
    await db.update(customers).set({ isVerified }).where(eq(customers.id, id));
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<void> {
    await db.update(customers).set(updates).where(eq(customers.id, id));
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Claim operations
  async createClaim(claim: InsertClaim): Promise<Claim> {
    const [createdClaim] = await db.insert(claims).values(claim).returning();
    return createdClaim;
  }

  async getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.voucherCode, voucherCode));
    return claim || undefined;
  }

  async getAllClaims(): Promise<Claim[]> {
    return await db.select().from(claims);
  }

  async updateClaimStatus(id: number, status: string): Promise<void> {
    await db.update(claims).set({ status }).where(eq(claims.id, id));
  }

  // OTP operations
  async createOtp(otp: InsertOtp): Promise<OtpVerification> {
    const [createdOtp] = await db.insert(otpVerifications).values(otp).returning();
    return createdOtp;
  }

  async getOtpByContact(contact: string): Promise<OtpVerification | undefined> {
    const [otp] = await db.select().from(otpVerifications)
      .where(eq(otpVerifications.contact, contact))
      .orderBy(otpVerifications.createdAt);
    return otp || undefined;
  }

  async verifyOtp(contact: string, otp: string): Promise<boolean> {
    const [verification] = await db.select().from(otpVerifications)
      .where(and(
        eq(otpVerifications.contact, contact),
        eq(otpVerifications.otp, otp)
      ))
      .orderBy(otpVerifications.createdAt);
    
    if (!verification || verification.expiresAt < new Date()) {
      return false;
    }

    await db.update(otpVerifications)
      .set({ isVerified: true })
      .where(eq(otpVerifications.id, verification.id));
    
    return true;
  }

  // Admin operations
  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(admin.passwordHash, 12);
    const [createdAdmin] = await db.insert(adminUsers)
      .values({ ...admin, passwordHash: hashedPassword })
      .returning();
    return createdAdmin;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).where(eq(adminUsers.isActive, true));
  }

  async updateAdminUser(id: number, updates: Partial<InsertAdminUser>): Promise<void> {
    const updateData = { ...updates };
    if (updates.passwordHash) {
      updateData.passwordHash = await bcrypt.hash(updates.passwordHash, 12);
    }
    await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, id));
  }

  async deleteAdminUser(id: number): Promise<void> {
    await db.update(adminUsers).set({ isActive: false }).where(eq(adminUsers.id, id));
  }

  async updateAdminLastLogin(id: number): Promise<void> {
    await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, id));
  }

  async verifyAdminPassword(username: string, password: string): Promise<AdminUser | null> {
    const admin = await this.getAdminByUsername(username);
    if (!admin || !admin.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return null;
    }

    await this.updateAdminLastLogin(admin.id);
    return admin;
  }

  // Pending Payment operations
  async createPendingPayment(payment: InsertPendingPayment): Promise<PendingPayment> {
    const [createdPayment] = await db.insert(pendingPayments).values(payment).returning();
    return createdPayment;
  }

  async getAllPendingPayments(): Promise<PendingPayment[]> {
    return await db.select().from(pendingPayments);
  }

  async getPendingPaymentById(id: number): Promise<PendingPayment | undefined> {
    const [payment] = await db.select().from(pendingPayments).where(eq(pendingPayments.id, id));
    return payment || undefined;
  }

  async updatePendingPaymentStatus(id: number, status: string): Promise<void> {
    await db.update(pendingPayments).set({ status }).where(eq(pendingPayments.id, id));
  }

  async deletePendingPayment(id: number): Promise<void> {
    await db.delete(pendingPayments).where(eq(pendingPayments.id, id));
  }

  // Brand operations
  async createBrand(brand: InsertBrand): Promise<Brand> {
    const [createdBrand] = await db.insert(brands).values(brand).returning();
    return createdBrand;
  }

  async getAllBrands(): Promise<Brand[]> {
    return await db.select().from(brands).where(eq(brands.isActive, true));
  }

  async getBrandsByDeviceType(deviceType: string): Promise<Brand[]> {
    return await db.select().from(brands)
      .where(and(
        eq(brands.isActive, true),
        eq(brands.deviceType, deviceType)
      ));
  }

  async updateBrand(id: number, updates: Partial<InsertBrand>): Promise<void> {
    await db.update(brands).set(updates).where(eq(brands.id, id));
  }

  async deleteBrand(id: number): Promise<void> {
    await db.update(brands).set({ isActive: false }).where(eq(brands.id, id));
  }

  // Device Model operations
  async createDeviceModel(model: InsertDeviceModel): Promise<DeviceModel> {
    const [createdModel] = await db.insert(deviceModels).values(model).returning();
    return createdModel;
  }

  async getAllDeviceModels(): Promise<DeviceModel[]> {
    return await db.select().from(deviceModels).where(eq(deviceModels.isActive, true));
  }

  async getModelsByBrandId(brandId: number): Promise<DeviceModel[]> {
    return await db.select().from(deviceModels)
      .where(and(
        eq(deviceModels.brandId, brandId),
        eq(deviceModels.isActive, true)
      ));
  }

  async updateDeviceModel(id: number, updates: Partial<InsertDeviceModel>): Promise<void> {
    await db.update(deviceModels).set(updates).where(eq(deviceModels.id, id));
  }

  async deleteDeviceModel(id: number): Promise<void> {
    await db.update(deviceModels).set({ isActive: false }).where(eq(deviceModels.id, id));
  }

  // WhatsApp Configuration operations
  async getWhatsAppConfig(): Promise<any> {
    try {
      const pool = await sql.connect();
      const result = await pool.request().query(`
        SELECT userId, password, baseUrl, isEnabled, createdAt, updatedAt
        FROM whatsapp_config 
        WHERE id = 1
      `);
      return result.recordset[0] || null;
    } catch (error: any) {
      if (error.message.includes("Invalid object name 'whatsapp_config'")) {
        // Create table if it doesn't exist
        await this.createWhatsAppConfigTable();
        return null;
      }
      throw error;
    }
  }

  async updateWhatsAppConfig(config: { userId: string; password: string; baseUrl: string; isEnabled: boolean }): Promise<any> {
    try {
      const pool = await sql.connect();
      
      // Check if record exists
      const checkResult = await pool.request().query(`
        SELECT id FROM whatsapp_config WHERE id = 1
      `);

      if (checkResult.recordset.length > 0) {
        // Update existing record
        await pool.request()
          .input('userId', sql.VarChar, config.userId)
          .input('password', sql.VarChar, config.password)
          .input('baseUrl', sql.VarChar, config.baseUrl)
          .input('isEnabled', sql.Bit, config.isEnabled)
          .query(`
            UPDATE whatsapp_config 
            SET userId = @userId, password = @password, baseUrl = @baseUrl, 
                isEnabled = @isEnabled, updatedAt = GETDATE()
            WHERE id = 1
          `);
      } else {
        // Insert new record
        await pool.request()
          .input('userId', sql.VarChar, config.userId)
          .input('password', sql.VarChar, config.password)
          .input('baseUrl', sql.VarChar, config.baseUrl)
          .input('isEnabled', sql.Bit, config.isEnabled)
          .query(`
            INSERT INTO whatsapp_config (id, userId, password, baseUrl, isEnabled, createdAt, updatedAt)
            VALUES (1, @userId, @password, @baseUrl, @isEnabled, GETDATE(), GETDATE())
          `);
      }

      // Return the updated config
      const result = await pool.request().query(`
        SELECT userId, password, baseUrl, isEnabled, createdAt, updatedAt
        FROM whatsapp_config WHERE id = 1
      `);
      return result.recordset[0];
    } catch (error: any) {
      if (error.message.includes("Invalid object name 'whatsapp_config'")) {
        // Create table if it doesn't exist
        await this.createWhatsAppConfigTable();
        return await this.updateWhatsAppConfig(config);
      }
      throw error;
    }
  }

  async getWhatsAppTemplates(): Promise<any[]> {
    try {
      const pool = await sql.connect();
      const result = await pool.request().query(`
        SELECT id, name, message, isTemplate, isActive, createdAt, updatedAt
        FROM whatsapp_templates 
        WHERE isActive = 1
        ORDER BY name
      `);
      return result.recordset || [];
    } catch (error: any) {
      if (error.message.includes("Invalid object name 'whatsapp_templates'")) {
        // Create table if it doesn't exist
        await this.createWhatsAppTemplatesTable();
        return [];
      }
      throw error;
    }
  }

  private async createWhatsAppConfigTable(): Promise<void> {
    try {
      const pool = await sql.connect();
      await pool.request().query(`
        CREATE TABLE whatsapp_config (
          id INT IDENTITY(1,1) PRIMARY KEY,
          userId NVARCHAR(100) NOT NULL,
          password NVARCHAR(255) NOT NULL,
          baseUrl NVARCHAR(500) NOT NULL DEFAULT 'https://mediaapi.smsgupshup.com/GatewayAPI/rest',
          isEnabled BIT NOT NULL DEFAULT 0,
          createdAt DATETIME2 DEFAULT GETDATE(),
          updatedAt DATETIME2 DEFAULT GETDATE()
        )
      `);
      console.log('Created whatsapp_config table');
    } catch (error: any) {
      console.error('Failed to create whatsapp_config table:', error);
      throw error;
    }
  }

  private async createWhatsAppTemplatesTable(): Promise<void> {
    try {
      const pool = await sql.connect();
      await pool.request().query(`
        CREATE TABLE whatsapp_templates (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          message NTEXT NOT NULL,
          isTemplate BIT NOT NULL DEFAULT 1,
          isActive BIT NOT NULL DEFAULT 1,
          createdAt DATETIME2 DEFAULT GETDATE(),
          updatedAt DATETIME2 DEFAULT GETDATE()
        )
      `);
      console.log('Created whatsapp_templates table');
    } catch (error: any) {
      console.error('Failed to create whatsapp_templates table:', error);
      throw error;
    }
  }

  // Claim Value Slab operations
  async getAllClaimValueSlabs(): Promise<any[]> {
    try {
      const config = {
        server: '103.205.66.184',
        port: 1433,
        database: 'bbgdb',
        user: 'bbg_user',
        password: 'Bbg@2024',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        requestTimeout: 30000,
        connectionTimeout: 30000
      };

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      
      const result = await pool.request().query(`
        SELECT 
          id, 
          device_type, 
          brand, 
          min_months, 
          max_months, 
          percentage, 
          is_active, 
          created_at, 
          updated_at
        FROM claim_value_slabs 
        ORDER BY device_type, ISNULL(brand, ''), min_months ASC
      `);
      
      await pool.close();
      
      return result.recordset.map((row: any) => ({
        id: row.id,
        deviceType: row.device_type,
        brand: row.brand,
        minMonths: row.min_months,
        maxMonths: row.max_months,
        percentage: row.percentage,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error: any) {
      console.error('Error fetching all claim value slabs:', error);
      throw error;
    }
  }

  async getActiveClaimValueSlabs(): Promise<any[]> {
    try {
      const allSlabs = await this.getAllClaimValueSlabs();
      return allSlabs.filter(slab => slab.isActive);
    } catch (error: any) {
      console.error('Error fetching active claim value slabs:', error);
      throw error;
    }
  }

  async getClaimValueSlabById(id: number): Promise<any | undefined> {
    try {
      const config = {
        server: '103.205.66.184',
        port: 1433,
        database: 'bbgdb',
        user: 'bbg_user',
        password: 'Bbg@2024',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        requestTimeout: 30000,
        connectionTimeout: 30000
      };

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      
      const request = pool.request();
      request.input('id', sql.Int, id);
      
      const result = await request.query(`
        SELECT 
          id, 
          device_type, 
          brand, 
          min_months, 
          max_months, 
          percentage, 
          is_active, 
          created_at, 
          updated_at
        FROM claim_value_slabs 
        WHERE id = @id
      `);
      
      await pool.close();
      
      if (result.recordset.length === 0) {
        return undefined;
      }
      
      const row = result.recordset[0];
      return {
        id: row.id,
        deviceType: row.device_type,
        brand: row.brand,
        minMonths: row.min_months,
        maxMonths: row.max_months,
        percentage: row.percentage,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error: any) {
      console.error('Error fetching claim value slab by ID:', error);
      throw error;
    }
  }

  async createClaimValueSlab(slab: any): Promise<any> {
    try {
      const config = {
        server: '103.205.66.184',
        port: 1433,
        database: 'bbgdb',
        user: 'bbg_user',
        password: 'Bbg@2024',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        requestTimeout: 30000,
        connectionTimeout: 30000
      };

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      
      const request = pool.request();
      request.input('deviceType', sql.NVarChar, slab.deviceType);
      request.input('brand', sql.NVarChar, slab.brand || null);
      request.input('minMonths', sql.Int, slab.minMonths);
      request.input('maxMonths', sql.Int, slab.maxMonths);
      request.input('percentage', sql.Int, slab.percentage);
      request.input('isActive', sql.Bit, slab.isActive !== false);
      
      const result = await request.query(`
        INSERT INTO claim_value_slabs (device_type, brand, min_months, max_months, percentage, is_active, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@deviceType, @brand, @minMonths, @maxMonths, @percentage, @isActive, GETDATE(), GETDATE())
      `);
      
      await pool.close();
      
      const row = result.recordset[0];
      return {
        id: row.id,
        deviceType: row.device_type,
        brand: row.brand,
        minMonths: row.min_months,
        maxMonths: row.max_months,
        percentage: row.percentage,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error: any) {
      console.error('Error creating claim value slab:', error);
      throw error;
    }
  }

  async updateClaimValueSlab(id: number, updates: any): Promise<any | undefined> {
    try {
      const config = {
        server: '103.205.66.184',
        port: 1433,
        database: 'bbgdb',
        user: 'bbg_user',
        password: 'Bbg@2024',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        requestTimeout: 30000,
        connectionTimeout: 30000
      };

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      
      // First check if the record exists
      const checkRequest = pool.request();
      checkRequest.input('id', sql.Int, id);
      
      const checkResult = await checkRequest.query(`
        SELECT id FROM claim_value_slabs WHERE id = @id
      `);
      
      if (checkResult.recordset.length === 0) {
        await pool.close();
        return undefined;
      }
      
      // Build update query dynamically
      const updateParts = [];
      const request = pool.request();
      request.input('id', sql.Int, id);
      
      if (updates.deviceType !== undefined) {
        updateParts.push('device_type = @deviceType');
        request.input('deviceType', sql.NVarChar, updates.deviceType);
      }
      if (updates.brand !== undefined) {
        updateParts.push('brand = @brand');
        request.input('brand', sql.NVarChar, updates.brand);
      }
      if (updates.minMonths !== undefined) {
        updateParts.push('min_months = @minMonths');
        request.input('minMonths', sql.Int, updates.minMonths);
      }
      if (updates.maxMonths !== undefined) {
        updateParts.push('max_months = @maxMonths');
        request.input('maxMonths', sql.Int, updates.maxMonths);
      }
      if (updates.percentage !== undefined) {
        updateParts.push('percentage = @percentage');
        request.input('percentage', sql.Int, updates.percentage);
      }
      if (updates.isActive !== undefined) {
        updateParts.push('is_active = @isActive');
        request.input('isActive', sql.Bit, updates.isActive);
      }
      
      // Always update the updated_at field
      updateParts.push('updated_at = GETDATE()');
      
      if (updateParts.length === 1) { // Only updated_at, no actual updates
        await pool.close();
        return await this.getClaimValueSlabById(id);
      }
      
      const updateQuery = `
        UPDATE claim_value_slabs 
        SET ${updateParts.join(', ')}
        WHERE id = @id
      `;
      
      await request.query(updateQuery);
      
      // Fetch and return the updated record
      const fetchRequest = pool.request();
      fetchRequest.input('id', sql.Int, id);
      
      const fetchResult = await fetchRequest.query(`
        SELECT 
          id, 
          device_type, 
          brand, 
          min_months, 
          max_months, 
          percentage, 
          is_active, 
          created_at, 
          updated_at
        FROM claim_value_slabs 
        WHERE id = @id
      `);
      
      await pool.close();
      
      const row = fetchResult.recordset[0];
      return {
        id: row.id,
        deviceType: row.device_type,
        brand: row.brand,
        minMonths: row.min_months,
        maxMonths: row.max_months,
        percentage: row.percentage,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error: any) {
      console.error('Error updating claim value slab:', error);
      throw error;
    }
  }

  async deleteClaimValueSlab(id: number): Promise<void> {
    try {
      const config = {
        server: '103.205.66.184',
        port: 1433,
        database: 'bbgdb',
        user: 'bbg_user',
        password: 'Bbg@2024',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        },
        requestTimeout: 30000,
        connectionTimeout: 30000
      };

      const pool = new sql.ConnectionPool(config);
      await pool.connect();
      
      const request = pool.request();
      request.input('id', sql.Int, id);
      
      await request.query(`
        DELETE FROM claim_value_slabs WHERE id = @id
      `);
      
      await pool.close();
    } catch (error: any) {
      console.error('Error deleting claim value slab:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();