import { 
  type Distributor, 
  type Customer, 
  type Claim, 
  type OtpVerification,
  type AdminUser,
  type InsertDistributor, 
  type InsertCustomer, 
  type InsertClaim, 
  type InsertOtp,
  type InsertAdminUser
} from "@shared/schema";
import { db } from "./db";
import sql from 'mssql';

export interface IStorage {
  // Distributor operations
  createDistributor(distributor: InsertDistributor): Promise<Distributor>;
  getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined>;
  getDistributorByEmail(email: string): Promise<Distributor | undefined>;
  getAllDistributors(): Promise<Distributor[]>;
  
  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined>;
  getCustomersBySellerCode(sellerCode: string): Promise<Customer[]>;
  getAllCustomers(): Promise<Customer[]>;
  updateCustomerVerification(id: number, isVerified: boolean): Promise<void>;
  
  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined>;
  getAllClaims(): Promise<Claim[]>;
  updateClaimStatus(id: number, status: string): Promise<void>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<OtpVerification>;
  getOtpByContact(contact: string): Promise<OtpVerification | undefined>;
  verifyOtp(contact: string, otp: string): Promise<boolean>;
  
  // Admin operations
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  updateAdminLastLogin(id: number): Promise<void>;
  verifyAdminPassword(username: string, password: string): Promise<AdminUser | null>;
}

export class DatabaseStorage implements IStorage {
  // Distributor operations
  async createDistributor(insertDistributor: InsertDistributor): Promise<Distributor> {
    const distributorData = {
      ...insertDistributor,
      businessName: insertDistributor.businessName ?? null,
      gstin: insertDistributor.gstin ?? null,
      bankAccount: insertDistributor.bankAccount ?? null,
      ifscCode: insertDistributor.ifscCode ?? null,
      sellerCode: this.generateSellerCode(),
      isActive: true,
      createdAt: new Date()
    };

    const [distributor] = await db
      .insert(distributors)
      .values(distributorData)
      .returning();
    
    return distributor;
  }

  async getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined> {
    const [distributor] = await db
      .select()
      .from(distributors)
      .where(eq(distributors.sellerCode, sellerCode));
    
    return distributor || undefined;
  }

  async getDistributorByEmail(email: string): Promise<Distributor | undefined> {
    const [distributor] = await db
      .select()
      .from(distributors)
      .where(eq(distributors.email, email));
    
    return distributor || undefined;
  }

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customerData = {
      ...insertCustomer,
      sellerCode: insertCustomer.sellerCode ?? null,
      paymentIntentId: insertCustomer.paymentIntentId ?? null,
      voucherCode: this.generateVoucherCode(),
      isVerified: false,
      createdAt: new Date()
    };

    const [customer] = await db
      .insert(customers)
      .values(customerData)
      .returning();
    
    return customer;
  }

  async getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.voucherCode, voucherCode));
    
    return customer || undefined;
  }

  async getCustomersBySellerCode(sellerCode: string): Promise<Customer[]> {
    const customerList = await db
      .select()
      .from(customers)
      .where(eq(customers.sellerCode, sellerCode));
    
    return customerList;
  }

  async updateCustomerVerification(id: number, isVerified: boolean): Promise<void> {
    await db
      .update(customers)
      .set({ isVerified })
      .where(eq(customers.id, id));
  }

  // Claim operations
  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    // Note: insertClaim only contains contact, email, voucherCode
    // claimPercentage and claimAmount should be calculated in the route handler
    const claimData = {
      ...insertClaim,
      claimPercentage: 0, // Will be updated by route handler
      claimAmount: "0", // Will be updated by route handler  
      status: "pending"
    };

    const [claim] = await db
      .insert(claims)
      .values(claimData)
      .returning();
    
    return claim;
  }

  async getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined> {
    const [claim] = await db
      .select()
      .from(claims)
      .where(eq(claims.voucherCode, voucherCode));
    
    return claim || undefined;
  }

  async updateClaimStatus(id: number, status: string): Promise<void> {
    await db
      .update(claims)
      .set({ status })
      .where(eq(claims.id, id));
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtp): Promise<OtpVerification> {
    const otpData = {
      ...insertOtp,
      isVerified: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    };

    const [otp] = await db
      .insert(otpVerifications)
      .values(otpData)
      .returning();
    
    return otp;
  }

  async getOtpByContact(contact: string): Promise<OtpVerification | undefined> {
    const [otp] = await db
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.contact, contact));
    
    return otp || undefined;
  }

  async verifyOtp(contact: string, otp: string): Promise<boolean> {
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.contact, contact));

    if (!otpRecord || otpRecord.otp !== otp) {
      return false;
    }

    if (otpRecord.expiresAt && new Date() > otpRecord.expiresAt) {
      return false;
    }

    await db
      .update(otpVerifications)
      .set({ isVerified: true })
      .where(eq(otpVerifications.contact, contact));

    return true;
  }

  // Helper methods
  private generateSellerCode(): string {
    return `XTR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  private generateVoucherCode(): string {
    return `BBG${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
}

export const storage = new DatabaseStorage();