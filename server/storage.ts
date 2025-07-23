import { distributors, customers, claims, otpVerifications, adminUsers, pendingPayments, brands, deviceModels, userRoles, cartAbandonments } from "@shared/schema";
import type { 
  Distributor, Customer, Claim, OtpVerification, AdminUser, PendingPayment, Brand, DeviceModel, UserRole, CartAbandonment,
  InsertDistributor, InsertCustomer, InsertClaim, InsertOtp, InsertAdminUser, InsertPendingPayment, InsertBrand, InsertDeviceModel, InsertUserRole, InsertCartAbandonment
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
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
  updateCartAbandonment(sessionId: string, updates: Partial<InsertCartAbandonment>): Promise<void>;
  getAllCartAbandonments(): Promise<CartAbandonment[]>;
  deleteCartAbandonment(id: number): Promise<void>;
  cleanupOldCartAbandonments(daysOld: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Helper methods for code generation
  private generateSellerCode(): string {
    return "XTRA" + Date.now().toString().slice(-8);
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
    const [createdRole] = await db.insert(userRoles).values(role).returning();
    return createdRole;
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
      sellerCode: this.generateSellerCode(),
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

  async getAllDistributors(): Promise<Distributor[]> {
    return await db.select().from(distributors);
  }

  async updateDistributor(id: number, updates: Partial<InsertDistributor>): Promise<void> {
    await db.update(distributors).set(updates).where(eq(distributors.id, id));
  }

  async deleteDistributor(id: number): Promise<void> {
    await db.update(distributors).set({ isActive: false }).where(eq(distributors.id, id));
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
}

export const storage = new DatabaseStorage();