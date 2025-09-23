import {
  PurchaseTimingCategory,
  BenefitType,
  type PurchaseTimingCategoryType,
  type BenefitTypeType,
  type AuctionRepairBenefits,
  type ClaimSlabsBenefits,
  type BenefitsStructure
} from "@shared/schema";

export interface PlanCalculationResult {
  purchaseTimingCategory: PurchaseTimingCategoryType;
  benefitType: BenefitTypeType;
  planPrice: number;
  benefitsJson: string; // JSON stringified benefits
  emailTemplateKey: string;
  benefits: BenefitsStructure; // Parsed benefits object for convenience
}

/**
 * Calculate the BBG plan type, pricing, and benefits based on device type and purchase date
 * Core business logic for dual-flow BBG system
 */
export function getPlanFor(deviceType: string, dateOfPurchase: string, priceSettings?: { laptopPrice: number; mobilePrice: number }): PlanCalculationResult {
  // Validate and parse the purchase date
  const purchaseDate = new Date(dateOfPurchase);
  
  // Check for invalid date
  if (isNaN(purchaseDate.getTime())) {
    throw new Error(`Invalid date format: ${dateOfPurchase}`);
  }
  
  const currentDate = new Date();
  
  // Check for future dates
  if (purchaseDate > currentDate) {
    throw new Error(`Purchase date cannot be in the future: ${dateOfPurchase}`);
  }
  
  // Calculate days difference for more accurate boundary logic
  const timeDifference = currentDate.getTime() - purchaseDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
  // 6 months ≈ 183 days (6 * 30.5 days average)
  const sixMonthsInDays = 183;
  
  // Determine purchase timing category
  const purchaseTimingCategory: PurchaseTimingCategoryType = 
    daysDifference <= sixMonthsInDays ? PurchaseTimingCategory.WITHIN_6_MONTHS : PurchaseTimingCategory.OVER_6_MONTHS;
  
  if (purchaseTimingCategory === PurchaseTimingCategory.WITHIN_6_MONTHS) {
    // Standard BBG flow with claim slabs - use provided price settings or defaults
    const planPrice = deviceType === 'laptop' 
      ? (priceSettings?.laptopPrice || 499) 
      : (priceSettings?.mobilePrice || 299);
    
    const benefits: ClaimSlabsBenefits = {
      maxClaimPercentage: 70,
      slabStructure: [] // Will be populated from active slabs during registration
    };
    
    return {
      purchaseTimingCategory,
      benefitType: BenefitType.CLAIM_SLABS,
      planPrice,
      benefitsJson: JSON.stringify(benefits),
      emailTemplateKey: 'bbg_registration_claim',
      benefits
    };
  } else {
    // Auction + Repair benefits flow - use provided price settings or defaults
    const isLaptop = deviceType === 'laptop';
    const auctionValue = isLaptop ? 799 : 599;
    const repairValue = isLaptop ? 799 : 599;
    const totalValue = auctionValue + repairValue;
    const planPrice = isLaptop 
      ? (priceSettings?.laptopPrice || 799) 
      : (priceSettings?.mobilePrice || 499);
    
    const benefits: AuctionRepairBenefits = {
      auctionService: {
        value: auctionValue,
        description: `Free Auction Service at Your Doorstep (worth ₹${auctionValue})`
      },
      repairService: {
        value: repairValue,
        description: `Free Device Repair Benefit (worth ₹${repairValue})`
      },
      totalValue,
      actualPrice: planPrice
    };
    
    return {
      purchaseTimingCategory,
      benefitType: BenefitType.AUCTION_REPAIR,
      planPrice,
      benefitsJson: JSON.stringify(benefits),
      emailTemplateKey: 'bbg_registration_benefits',
      benefits
    };
  }
}

/**
 * Get human-readable description of benefits for a given plan
 */
export function getBenefitsDescription(plan: PlanCalculationResult): string {
  if (plan.benefitType === BenefitType.CLAIM_SLABS) {
    return `Up to ${(plan.benefits as ClaimSlabsBenefits).maxClaimPercentage}% buyback guarantee with depreciation slabs`;
  } else {
    const benefits = plan.benefits as AuctionRepairBenefits;
    return `${benefits.auctionService.description} + ${benefits.repairService.description} - Total value ₹${benefits.totalValue} for just ₹${benefits.actualPrice}`;
  }
}

/**
 * Validate if a device purchase date is eligible for BBG
 */
export function isEligibleForBBG(dateOfPurchase: string): boolean {
  const purchaseDate = new Date(dateOfPurchase);
  
  // Check for invalid date format
  if (isNaN(purchaseDate.getTime())) {
    return false;
  }
  
  const currentDate = new Date();
  
  // Check if purchase date is not in the future
  if (purchaseDate > currentDate) {
    return false;
  }
  
  // Check if purchase date is not too old (e.g., more than 5 years)
  const timeDifference = currentDate.getTime() - purchaseDate.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const fiveYearsInDays = 5 * 365;
  
  if (daysDifference > fiveYearsInDays) {
    return false;
  }
  
  return true;
}