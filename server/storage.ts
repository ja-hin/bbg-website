import { 
  distributors, 
  customers, 
  claims, 
  otpVerifications,
  type Distributor, 
  type Customer, 
  type Claim, 
  type OtpVerification,
  type InsertDistributor, 
  type InsertCustomer, 
  type InsertClaim, 
  type InsertOtp 
} from "@shared/schema";

export interface IStorage {
  // Distributor operations
  createDistributor(distributor: InsertDistributor): Promise<Distributor>;
  getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined>;
  getDistributorByEmail(email: string): Promise<Distributor | undefined>;
  
  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined>;
  getCustomersBySellerCode(sellerCode: string): Promise<Customer[]>;
  updateCustomerVerification(id: number, isVerified: boolean): Promise<void>;
  
  // Claim operations
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined>;
  updateClaimStatus(id: number, status: string): Promise<void>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<OtpVerification>;
  getOtpByContact(contact: string): Promise<OtpVerification | undefined>;
  verifyOtp(contact: string, otp: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private distributors: Map<number, Distributor> = new Map();
  private customers: Map<number, Customer> = new Map();
  private claims: Map<number, Claim> = new Map();
  private otpVerifications: Map<number, OtpVerification> = new Map();
  
  private distributorIdCounter = 1;
  private customerIdCounter = 1;
  private claimIdCounter = 1;
  private otpIdCounter = 1;

  // Distributor operations
  async createDistributor(insertDistributor: InsertDistributor): Promise<Distributor> {
    const id = this.distributorIdCounter++;
    const sellerCode = this.generateSellerCode();
    const distributor: Distributor = {
      ...insertDistributor,
      id,
      sellerCode,
      isActive: true,
      createdAt: new Date(),
    };
    this.distributors.set(id, distributor);
    return distributor;
  }

  async getDistributorBySellerCode(sellerCode: string): Promise<Distributor | undefined> {
    return Array.from(this.distributors.values()).find(d => d.sellerCode === sellerCode);
  }

  async getDistributorByEmail(email: string): Promise<Distributor | undefined> {
    return Array.from(this.distributors.values()).find(d => d.email === email);
  }

  // Customer operations
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const bbgVoucherCode = this.generateVoucherCode();
    const customer: Customer = {
      ...insertCustomer,
      id,
      bbgVoucherCode,
      isVerified: false,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async getCustomerByVoucherCode(voucherCode: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.bbgVoucherCode === voucherCode);
  }

  async getCustomersBySellerCode(sellerCode: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(c => c.sellerCode === sellerCode);
  }

  async updateCustomerVerification(id: number, isVerified: boolean): Promise<void> {
    const customer = this.customers.get(id);
    if (customer) {
      customer.isVerified = isVerified;
      this.customers.set(id, customer);
    }
  }

  // Claim operations
  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.claimIdCounter++;
    
    // Get customer to calculate claim amount
    const customer = await this.getCustomerByVoucherCode(insertClaim.bbgVoucherCode);
    if (!customer) {
      throw new Error("Invalid voucher code");
    }

    const claimPercentage = this.calculateClaimPercentage(customer.createdAt!);
    const claimAmount = (parseFloat(customer.invoiceValue) * claimPercentage) / 100;

    const claim: Claim = {
      ...insertClaim,
      id,
      claimPercentage,
      claimAmount: claimAmount.toString(),
      status: 'pending',
      createdAt: new Date(),
    };
    this.claims.set(id, claim);
    return claim;
  }

  async getClaimByVoucherCode(voucherCode: string): Promise<Claim | undefined> {
    return Array.from(this.claims.values()).find(c => c.bbgVoucherCode === voucherCode);
  }

  async updateClaimStatus(id: number, status: string): Promise<void> {
    const claim = this.claims.get(id);
    if (claim) {
      claim.status = status;
      this.claims.set(id, claim);
    }
  }

  // OTP operations
  async createOtp(insertOtp: InsertOtp): Promise<OtpVerification> {
    const id = this.otpIdCounter++;
    const otp: OtpVerification = {
      ...insertOtp,
      id,
      isVerified: false,
      createdAt: new Date(),
    };
    this.otpVerifications.set(id, otp);
    return otp;
  }

  async getOtpByContact(contact: string): Promise<OtpVerification | undefined> {
    return Array.from(this.otpVerifications.values())
      .filter(o => o.contact === contact && !o.isVerified && o.expiresAt > new Date())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())[0];
  }

  async verifyOtp(contact: string, otp: string): Promise<boolean> {
    const otpRecord = await this.getOtpByContact(contact);
    if (otpRecord && otpRecord.otp === otp) {
      otpRecord.isVerified = true;
      this.otpVerifications.set(otpRecord.id, otpRecord);
      return true;
    }
    return false;
  }

  // Helper methods
  private generateSellerCode(): string {
    return 'XTC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }

  private generateVoucherCode(): string {
    return 'BBG' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private calculateClaimPercentage(purchaseDate: Date): number {
    const now = new Date();
    const monthsDiff = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());
    
    if (monthsDiff >= 6 && monthsDiff <= 12) return 70;
    if (monthsDiff >= 13 && monthsDiff <= 18) return 60;
    if (monthsDiff >= 19 && monthsDiff <= 24) return 50;
    if (monthsDiff >= 25 && monthsDiff <= 30) return 40;
    if (monthsDiff >= 31 && monthsDiff <= 36) return 30;
    if (monthsDiff >= 37 && monthsDiff <= 48) return 25;
    if (monthsDiff >= 49 && monthsDiff <= 60) return 20;
    return 0; // Outside coverage period
  }
}

export const storage = new MemStorage();
