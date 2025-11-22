# XtraCover BBG System - Exhaustive Project Breakdown

**Document Version:** 2.0  
**Last Updated:** November 22, 2025  
**System Type:** Full-Stack Web Application (Device Protection/Buyback Guarantee)  
**Primary Language:** TypeScript (Node.js + React)  
**Database:** Microsoft SQL Server  
**Architecture:** Express.js Backend + React Frontend + Integrated Services

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Complete Feature List](#3-complete-feature-list)
4. [Database Architecture](#4-database-architecture)
5. [System Architecture](#5-system-architecture)
6. [Visual Flow Diagrams](#6-visual-flow-diagrams)
7. [User Workflows](#7-user-workflows)
8. [End-to-End Process Flows](#8-end-to-end-process-flows)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [Data Lifecycle Management](#10-data-lifecycle-management)
11. [Integration Details](#11-integration-details)
12. [Error Handling & Validation](#12-error-handling--validation)
13. [Security & Compliance](#13-security--compliance)
14. [Limitations & Future Improvements](#14-limitations--future-improvements)

---

## 1. EXECUTIVE SUMMARY

### Project Purpose
XtraCover BBG is a comprehensive device protection and buyback guarantee system enabling:
- **Customers** to purchase protection plans for devices and file claims
- **Referral Partners (Distributors)** to register devices, earn commissions, and manage customer relationships
- **Admin Staff** to manage pricing, templates, communications, and system configuration
- **Multiple Registration Channels**: Regular website, Acer partnership, Amazon license codes, and post-purchase device registration

### Core Value Propositions
- **Dual-Flow BBG System**: Supports both claim-based (within 6 months) and auction/repair-based (7-36 months) benefit structures
- **Dynamic Pricing**: Admin-configurable BBG prices, referral discounts, and partner commissions
- **Multi-Channel Communication**: Email (SMTP), SMS (Kaleyra), WhatsApp (Gupshup) with customizable templates
- **Commission Management**: Automated calculation (flat or percentage-based) with payout tracking
- **Device Age Validation**: Prevents invalid registrations based on device purchase date
- **Acer BBG Integration**: Special handling for Acer devices with dedicated claim value slabs (80% vs standard 70%)

### Target Users
1. **Customers**: Individuals registering devices for protection
2. **Referral Partners (Distributors)**: B2B partners earning commissions
3. **Admin Users**: System administrators managing operations
4. **Acer Partners**: Special channel for Acer device registrations
5. **Amazon Sellers**: Special channel for Amazon license codes

---

## 2. SYSTEM OVERVIEW

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | User interfaces for all user types |
| **Routing** | Wouter | Client-side navigation |
| **State Management** | TanStack Query v5 | Data fetching and caching |
| **Styling** | Tailwind CSS + shadcn/ui | Design system and components |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **Backend** | Express.js (Node.js) | REST API server |
| **Database** | Microsoft SQL Server | Primary data store |
| **File Storage** | AWS S3 | File uploads (invoices, certificates) |
| **Payment Gateway** | PayU | Payment processing |
| **SMS Service** | Kaleyra | SMS notifications |
| **WhatsApp API** | Gupshup | WhatsApp messaging |
| **Email Service** | Nodemailer + SMTP | Email communications |
| **Build Tool** | Vite | Frontend bundling |
| **ORM** | Raw SQL (SqlServerStorage) | Database access layer |

### Key Architectural Patterns
- **Service-Oriented Architecture**: Separate services for communications, templates, plans, S3 uploads
- **Storage Abstraction Layer**: `IStorage` interface with SQL Server implementation
- **Template-Driven Communications**: Centralized email/SMS templates with dynamic variables
- **Session-Based Authentication**: Admin and distributor authentication with encrypted sessions
- **Middleware Authentication**: Protected routes with `isAdminAuthenticated` and `isDistributorAuthenticated` middleware

---

## 3. COMPLETE FEATURE LIST

### A. CUSTOMER FEATURES

#### Registration & Device Management
- **Customer Registration**: Full form with OTP verification (SMS + email)
- **Device Details**: Capture device type, brand, model, serial number, purchase date, invoice
- **Multiple Registration Channels**:
  - Regular website registration
  - Acer BBG special program registration
  - Amazon license code registration
  - Post-purchase device registration
- **BBG Purchase**: Dual-flow system with age-based benefits
  - Within 6 months: Claim-based coverage (0-100% based on device age)
  - 7-36 months: Auction + repair benefits
- **Referral Code Application**: Apply distributor codes for discounts
- **Voucher Code Generation**: Unique voucher codes per registration for claims

#### Claim Management
- **Claim Filing**: Submit device claims with documentation
- **Waiting Period Validation**: 3-month waiting period (Acer BBG exempt)
- **Device Age Validation**: Cannot claim if device older than max threshold
- **Claim Status Tracking**: View pending/approved/rejected claims
- **Claim Amount Calculation**: Based on device age and claim value slabs

#### Account Management
- **Customer Login**: Email-based authentication with OTP
- **Profile View**: Access to registered devices and BBG details
- **Claim History**: View all filed claims and their status

### B. DISTRIBUTOR/REFERRAL PARTNER FEATURES

#### Registration & Onboarding
- **Distributor Registration**: Simplified 3-field form (Name, Contact, Email)
- **Business Declarations**: Accuracy, TDS understanding, GST invoice agreement
- **Tax Documentation**:
  - PAN card and copy upload
  - GSTIN (optional) with certificate
  - MSME registration (optional) with certificate
- **Bank Details**: Account number, IFSC, UPI, cancelled cheque
- **Seller Code Generation**: Personalized codes (initials + mobile digits)
- **Welcome Email**: Automatic confirmation with seller code

#### Commission Management
- **Commission Tracking**: View commissions earned per customer registration
- **Commission Breakdown**: Details by customer and device type
- **Payout Status**: Track payment status (pending/processing/paid)
- **Export Capabilities**: CSV export of commission history

#### Partner Dashboard
- **Customers Registered**: View all customers brought through referral code
- **Performance Metrics**: Commission earned, payment status
- **Commission Settings**: View flat or percentage commission rates
- **Profile Management**: Update contact information and bank details

### C. ADMIN FEATURES

#### Configuration Management
- **BBG Price Settings**: Set laptop and mobile BBG prices
- **Claim Value Slabs**: Configure device age-based claim percentages
- **Plan Configurations**: Define "Within 6 Months" and "Over 6 Months" plans
- **Waiting Period Settings**: Configure claim waiting period
- **Partner Commission Settings**: Set commission type (flat/percentage) and amount
- **Referral Discount Settings**: Configure referral discount rates

#### Master Data Management
- **Brands Master**: Add/edit/delete device brands
- **Device Models**: Manage models for each brand
- **User Roles**: Define roles with permissions (super_admin, admin, moderator, viewer)
- **Acer IMEI Validation**: Upload and validate Acer IMEIs
- **Amazon License Codes**: Manage license code inventory

#### Communication Management
- **Email Template Management**: Create/edit email templates with variables
- **SMS Template Management**: Create/edit SMS templates
- **WhatsApp Template Management**: Create/edit WhatsApp templates
- **Template Preview**: Test templates before sending
- **Dynamic Variables**: Support for personalized content (customer name, voucher code, etc.)

#### Data Management
- **Customer Registrations**: View all registered customers with filtering/export
- **Distributor Management**: View/edit/deactivate distributors
- **Claims Management**: View/approve/reject claims
- **Transaction History**: Audit log of all system transactions
- **Cart Abandonments**: Track incomplete registrations
- **Data Export**: CSV export for customers, distributors, claims

#### System Configuration
- **SMTP Settings**: Configure email server details
- **WhatsApp Business API**: Configure Gupshup credentials
- **Theme Customization**: Set primary color for branding
- **Menu Customization**: Drag-and-drop menu ordering
- **Homepage Banners**: Manage slider images and links

#### Admin Users
- **User Management**: Create/edit/deactivate admin accounts
- **Role Assignment**: Assign user roles with specific permissions
- **Access Control**: Granular permission management

---

## 4. DATABASE ARCHITECTURE

### A. DATABASE OVERVIEW
- **Database Type**: Microsoft SQL Server
- **Primary Key Strategy**: Auto-incrementing integers (`serial`)
- **Timestamps**: UTC timestamps for all records
- **Soft Deletes**: Not implemented (records deleted on demand)
- **Data Integrity**: Foreign key constraints for relationships

### B. TABLE STRUCTURES

#### 1. CUSTOMERS Table
```sql
CREATE TABLE customers (
  id INT PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  deviceType VARCHAR(20) NOT NULL,  -- 'laptop' | 'mobile'
  serialNumber VARCHAR(255),        -- Device serial (optional for regular, required for Acer)
  brand VARCHAR(100) NOT NULL,
  modelName VARCHAR(255) NOT NULL,
  invoiceValue DECIMAL(10,2) NOT NULL,
  dateOfPurchase TEXT NOT NULL,     -- ISO date string
  sellerCode VARCHAR(20),           -- Distributor code if referred
  voucherCode VARCHAR(50) UNIQUE NOT NULL,  -- Generated BBG voucher
  isVerified BIT DEFAULT 0,
  registrationSource VARCHAR(50) DEFAULT 'regular',  -- 'regular' | 'acer_bbg' | 'amazon_bbg' | 'website'
  registrationSlabData TEXT,        -- JSON: Complete claim slab at registration time
  purchaseTimingCategory VARCHAR(50),  -- 'within_6_months' | 'over_6_months'
  benefitType VARCHAR(50),          -- 'claim_slabs' | 'auction_repair'
  planPrice DECIMAL(10,2),
  benefitsJson TEXT,                -- JSON: Benefits structure
  emailTemplateKey VARCHAR(255),
  createdAt DATETIME2 DEFAULT GETDATE()
);
```

**Key Fields**:
- `voucherCode`: Unique identifier for claim filing
- `registrationSlabData`: Stores complete slab structure at registration (protects against rate changes)
- `registrationSource`: Determines which email template to use
- `purchaseTimingCategory`: Controls benefit type allocation

---

#### 2. DISTRIBUTORS Table
```sql
CREATE TABLE distributors (
  id INT PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  preferredMode VARCHAR(50),  -- 'in-store' | 'online' | 'both'
  
  -- Tax & Compliance
  panNumber VARCHAR(50) NOT NULL,
  panCopyFile VARCHAR(512),
  isGstRegistered BIT DEFAULT 0,
  gstin VARCHAR(50),
  gstCertificateFile VARCHAR(512),
  isMsmeRegistered BIT DEFAULT 0,
  msmeCertificateFile VARCHAR(512),
  
  -- Banking
  accountHolderName VARCHAR(255) NOT NULL,
  bankAccount VARCHAR(50) NOT NULL,
  bankAccountConfirm VARCHAR(50) NOT NULL,
  ifscCode VARCHAR(20) NOT NULL,
  upiId VARCHAR(50),
  cancelledChequeFile VARCHAR(512),
  
  -- Declarations
  infoDeclaration BIT DEFAULT 0,
  tdsUnderstanding BIT DEFAULT 0,
  gstInvoiceAgreement BIT DEFAULT 0,
  termsAgreement BIT DEFAULT 0,
  
  sellerCode VARCHAR(20) UNIQUE NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE()
);
```

**Key Fields**:
- `sellerCode`: Unique identifier for commission tracking (e.g., "JS426")
- Banking fields: Enable commission payouts
- Tax fields: Support GST invoicing and TDS compliance

---

#### 3. CLAIMS Table
```sql
CREATE TABLE claims (
  id INT PRIMARY KEY IDENTITY(1,1),
  customerId INT NOT NULL,
  voucherCode VARCHAR(50) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  serialNumber VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  pickupDate TEXT NOT NULL,
  pickupTimeSlot VARCHAR(50) NOT NULL,
  deviceAgeMonths INT NOT NULL,
  claimPercentage INT NOT NULL,  -- e.g., 70 for 70%
  claimAmount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  createdAt DATETIME2 DEFAULT GETDATE()
);
```

**Business Rules**:
- Claim filing requires voucher code from customer registration
- Device age determines claim percentage
- 3-month waiting period enforced before claim filing

---

#### 4. CLAIM_VALUE_SLABS Table
```sql
CREATE TABLE claim_value_slabs (
  id INT PRIMARY KEY IDENTITY(1,1),
  deviceType VARCHAR(50) NOT NULL,  -- 'mobile' | 'laptop'
  brand VARCHAR(100),               -- Brand name (optional for mobile)
  minMonths INT NOT NULL,           -- Min device age
  maxMonths INT NOT NULL,           -- Max device age
  percentage INT NOT NULL,          -- Claim percentage (0-100)
  registrationSource VARCHAR(50) DEFAULT 'regular',  -- 'regular' | 'acer_bbg'
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Sample Data**:
```
Mobile Regular - 0-3 months: 100%
Mobile Regular - 3-6 months: 80%
Mobile Regular - 6-12 months: 60%
Mobile Acer BBG - 0-3 months: 100%
Mobile Acer BBG - 3-6 months: 90%
Mobile Acer BBG - 6-12 months: 80%
```

---

#### 5. PLAN_CONFIGURATIONS Table
```sql
CREATE TABLE plan_configurations (
  id INT PRIMARY KEY IDENTITY(1,1),
  label VARCHAR(255) NOT NULL,      -- "Within 6 Months" | "Over 6 Months"
  description TEXT,
  maxMonths INT NOT NULL,            -- Max device age for this plan (6 or 36)
  templateIdentifier VARCHAR(255) NOT NULL,  -- 'within_6_months' | 'over_6_months'
  isActive BIT DEFAULT 1,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Default Data**:
- "Within 6 Months" (maxMonths: 6) → Claim-based benefits
- "Over 6 Months" (maxMonths: 36) → Auction + repair benefits

---

#### 6. MESSAGE_TEMPLATES Table
```sql
CREATE TABLE message_templates (
  id INT PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(255) NOT NULL,
  eventType VARCHAR(255) NOT NULL,  -- 'customer_registration', 'claim_status_update', etc.
  templateType VARCHAR(50) NOT NULL, -- 'email' | 'sms' | 'whatsapp'
  deviceType VARCHAR(50),            -- 'mobile' | 'laptop' | NULL for universal
  subject VARCHAR(255),              -- For email templates
  body TEXT NOT NULL,
  variables TEXT,                    -- JSON list of variables used
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Key Template Event Types**:
- `customer_registration` - Registration confirmation
- `bbg_purchase_within_6_months` - Claim coverage confirmation
- `bbg_purchase_over_6_months` - Auction/repair benefits confirmation
- `acer_registration_within_6_months` - Acer specific (6 months)
- `acer_registration_over_6_months` - Acer specific (7-36 months)
- `device_registration_within_6_months` - Post-purchase (6 months)
- `device_registration_over_6_months` - Post-purchase (7-36 months)
- `amazon_bbg_registration` - Amazon license code registration
- `claim_status_update` - Claim status notifications
- `payout_notification` - Commission payout notifications

**Template Variables**:
- `{{customerName}}` - Customer's full name
- `{{voucherCode}}` - BBG voucher code
- `{{deviceBrand}}` - Device brand
- `{{deviceModel}}` - Device model
- `{{claimValueSlabsHtml}}` - Complete claim slab table
- `{{maxClaimPercentage}}` - Maximum claim percentage
- `{{sellerCode}}` - Distributor seller code
- `{{planLabel}}` - "Within 6 Months" or "Over 6 Months"
- `{{planDescription}}` - Plan benefits description

---

#### 7. ADMIN_USERS Table
```sql
CREATE TABLE admin_users (
  id INT PRIMARY KEY IDENTITY(1,1),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,  -- bcrypt hash
  roleId INT NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',    -- Legacy field
  isActive BIT DEFAULT 1,
  lastLoginAt DATETIME2,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 8. USER_ROLES Table
```sql
CREATE TABLE user_roles (
  id INT PRIMARY KEY IDENTITY(1,1),
  roleName VARCHAR(100) UNIQUE NOT NULL,  -- 'super_admin' | 'admin' | 'moderator' | 'viewer'
  description TEXT NOT NULL,
  permissions TEXT NOT NULL,              -- JSON: List of permissions
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Example Role - Super Admin**:
```json
{
  "permissions": [
    "manage_users",
    "manage_pricing",
    "manage_templates",
    "view_reports",
    "manage_distributors",
    "manage_claims",
    "export_data"
  ]
}
```

---

#### 9. BBG_PRICE_SETTINGS Table
```sql
CREATE TABLE bbg_price_settings (
  id INT PRIMARY KEY IDENTITY(1,1),
  laptopPrice DECIMAL(10,2) NOT NULL DEFAULT 299.00,
  mobilePrice DECIMAL(10,2) NOT NULL DEFAULT 99.00,
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 10. PARTNER_COMMISSION_SETTINGS Table
```sql
CREATE TABLE partner_commission_settings (
  id INT PRIMARY KEY IDENTITY(1,1),
  isActive BIT DEFAULT 1,
  commissionType VARCHAR(50) NOT NULL,  -- 'flat' | 'percentage'
  commissionValue DECIMAL(10,2) NOT NULL,
  deviceType VARCHAR(50),               -- 'mobile' | 'laptop' | NULL for all
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Examples**:
- Flat ₹25 per customer registration
- 5% of invoice value
- Device-specific: ₹50 for laptop, ₹15 for mobile

---

#### 11. WAITING_PERIOD_SETTINGS Table
```sql
CREATE TABLE waiting_period_settings (
  id INT PRIMARY KEY IDENTITY(1,1),
  enabled BIT DEFAULT 1,
  months INT DEFAULT 3,  -- Days to wait before claim eligible
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 12. TRANSACTION_HISTORY Table
```sql
CREATE TABLE transaction_history (
  id INT PRIMARY KEY IDENTITY(1,1),
  eventType VARCHAR(255) NOT NULL,
  entityType VARCHAR(100),      -- 'customer' | 'distributor' | 'claim'
  entityId INT,
  userId INT,                   -- Admin user who made change
  description TEXT,
  metadata TEXT,                -- JSON: Additional details
  createdAt DATETIME2 DEFAULT GETDATE()
);
```

**Event Types**:
- `customer_registered`
- `bbg_purchased`
- `claim_filed`
- `claim_approved`
- `claim_rejected`
- `distributor_registered`
- `commission_calculated`
- `payout_processed`
- `template_updated`
- `setting_changed`

---

#### 13. DEVICE_REGISTRATIONS Table
```sql
CREATE TABLE device_registrations (
  id INT PRIMARY KEY IDENTITY(1,1),
  purchaseType VARCHAR(50) NOT NULL,  -- 'acer_estore' | 'website'
  deviceType VARCHAR(50) NOT NULL,    -- 'mobile' | 'laptop'
  imeiSerial VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(255) NOT NULL,
  purchasePrice VARCHAR(50) NOT NULL,
  purchaseDate TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  registrationId VARCHAR(255) UNIQUE NOT NULL,
  voucherCode VARCHAR(50) UNIQUE NOT NULL,
  isVerified BIT DEFAULT 0,
  registrationSource VARCHAR(50) DEFAULT 'post_purchase',
  createdAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 14. COMMISSION_PAYOUTS Table
```sql
CREATE TABLE commission_payouts (
  id INT PRIMARY KEY IDENTITY(1,1),
  distributorId INT NOT NULL,
  customerId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'processing' | 'paid' | 'failed'
  paymentReference VARCHAR(255),
  paidAt DATETIME2,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 15. BRANDS Table
```sql
CREATE TABLE brands (
  id INT PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(255) UNIQUE NOT NULL,
  deviceType VARCHAR(50) NOT NULL,  -- 'mobile' | 'laptop' | 'both'
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE()
);
```

**Examples**: Apple, Samsung, Dell, HP, Lenovo, OnePlus, etc.

---

#### 16. THEME_SETTINGS Table
```sql
CREATE TABLE theme_settings (
  id INT PRIMARY KEY IDENTITY(1,1),
  primaryColor VARCHAR(7) NOT NULL DEFAULT '#254696',
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 17. SMTP_SETTINGS Table
```sql
CREATE TABLE smtp_settings (
  id INT PRIMARY KEY IDENTITY(1,1),
  smtpHost VARCHAR(255) NOT NULL,
  smtpPort INT DEFAULT 587,
  smtpUsername VARCHAR(255) NOT NULL,
  smtpPassword VARCHAR(255) NOT NULL,
  fromAddress VARCHAR(255) NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

#### 18. REFERRAL_DISCOUNT_SETTINGS Table
```sql
CREATE TABLE referral_discount_settings (
  id INT PRIMARY KEY IDENTITY(1,1),
  isActive BIT DEFAULT 0,
  discountType VARCHAR(20) NOT NULL,  -- 'percentage' | 'flat'
  discountValue DECIMAL(10,2) NOT NULL,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Examples**:
- 10% discount on BBG price
- Flat ₹50 discount

---

#### 19. CART_ABANDONMENTS Table
```sql
CREATE TABLE cart_abandonments (
  id INT PRIMARY KEY IDENTITY(1,1),
  name VARCHAR(255),
  contact VARCHAR(20),
  email VARCHAR(255),
  pincode VARCHAR(6),
  deviceType VARCHAR(50),
  serialNumber VARCHAR(255),
  brand VARCHAR(100),
  modelName VARCHAR(255),
  invoiceValue DECIMAL(10,2),
  sellerCode VARCHAR(20),
  sessionId VARCHAR(255) NOT NULL,
  stage VARCHAR(100) DEFAULT 'form_started',  -- form_started | details_entered | otp_verified | payment_pending
  lastActivity DATETIME2 DEFAULT GETDATE(),
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

**Use Case**: Identify and re-engage users who started registration but didn't complete

---

#### 20. HOMEPAGE_BANNERS Table
```sql
CREATE TABLE homepage_banners (
  id INT PRIMARY KEY IDENTITY(1,1),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  desktopImageUrl VARCHAR(512) NOT NULL,
  mobileImageUrl VARCHAR(512) NOT NULL,
  linkUrl VARCHAR(512),
  isActive BIT DEFAULT 1,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
);
```

---

### C. TABLE RELATIONSHIPS

```
customers
├── (1-to-many) → claims
├── (FK: seller_code) → distributors
├── (FK: claim_value_slab_id) → claim_value_slabs
└── (has) registrationSlabData (JSON snapshot)

distributors
├── (1-to-many) → commission_payouts
├── (1-to-many) → customers (via sellerCode)
└── (1-to-many) → distributor_sessions

claims
├── (FK: customer_id) → customers
├── (FK: voucher_code) → customers
└── (based on age) → claim_value_slabs

claim_value_slabs
├── (filters by) device_type
├── (filters by) registration_source
└── (filters by) brand

admin_users
└── (FK: role_id) → user_roles

message_templates
├── (grouped by) event_type
├── (grouped by) template_type (email/sms/whatsapp)
└── (optional filter) device_type
```

---

## 5. SYSTEM ARCHITECTURE

### A. BACKEND ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│           Express.js Application                    │
│  (server/index.ts - 10,309 lines)                   │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  Route Handlers          │  │  Middleware              │
│  (server/routes.ts)      │  │  - Auth middleware       │
│  - Auth routes           │  │  - Admin routes          │
│  - Customer routes       │  │  - Session handling      │
│  - Distributor routes    │  │  - Error handling        │
│  - Admin routes          │  │                          │
│  - Payment routes        │  │                          │
│  - Claims routes         │  │                          │
│  - API endpoints         │  │                          │
└──────────────────────────┘  └──────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│            Storage Layer                            │
│  (server/sql-storage.ts)                            │
│  ├── getAllCustomers()                              │
│  ├── createCustomer()                               │
│  ├── getClaimValueSlabs()                           │
│  ├── getAdminUsers()                                │
│  ├── getDistributors()                              │
│  ├── getPlanConfigurations()                        │
│  ├── getMessageTemplates()                          │
│  └── ... 50+ methods                                │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│       Service Layer                                 │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │  Communication Service                           │ │
│ │  (server/communication-service.ts)               │ │
│ │  ├── sendCustomerRegistrationEmail()             │ │
│ │  ├── sendClaim StatusUpdate()                    │ │
│ │  ├── sendDistributorPayoutNotification()         │ │
│ │  ├── calculateDeviceAge()                        │ │
│ │  ├── selectTemplate()                            │ │
│ │  └── replaceTemplateVariables()                  │ │
│ └──────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │  Template Service                                │ │
│ │  (server/template-service.ts)                    │ │
│ │  ├── getTemplateByType()                         │ │
│ │  ├── createTemplate()                            │ │
│ │  ├── updateTemplate()                            │ │
│ │  ├── renderTemplate()                            │ │
│ │  └── getTemplateVariables()                      │ │
│ └──────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │  S3 Service                                      │ │
│ │  (server/s3-service.ts)                          │ │
│ │  ├── uploadFile()                                │ │
│ │  ├── generateSignedUrl()                         │ │
│ │  ├── deleteFile()                                │ │
│ │  └── getFileUrl()                                │ │
│ └──────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │  Plan Service                                    │ │
│ │  (server/plan-service.ts)                        │ │
│ │  ├── getPlanForDeviceAge()                       │ │
│ │  ├── getDefaultPlans()                           │ │
│ │  └── calculateBenefits()                         │ │
│ └──────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │  External Services                               │ │
│ │  ├── Kaleyra SMS (kaleyra-service.ts)           │ │
│ │  ├── Gupshup WhatsApp (gupshup-service.ts)      │ │
│ │  ├── PayU Integration (routes.ts)               │ │
│ │  └── Nodemailer SMTP (communication-service.ts) │ │
│ └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         Microsoft SQL Server Database               │
│  (SQL Server 2019+)                                 │
│  ├── 20+ tables                                     │
│  ├── Transactions support                          │
│  ├── Constraints & indexes                         │
│  └── Full-text search indexes                      │
└─────────────────────────────────────────────────────┘
```

### B. FRONTEND ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│              React 18 Application                   │
│         (client/src/App.tsx)                        │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│           Routing Layer (Wouter)                    │
├──────────────────────────────────────────────────────┤
│ Public Routes:                   Protected Routes:   │
│ ├── /                           ├── /admin/*        │
│ ├── /customer-registration      ├── /distributor/*  │
│ ├── /acer-bbg                   └── /customer/*     │
│ ├── /amazon-bbg                                     │
│ ├── /register                                       │
│ ├── /claim-bbg                                      │
│ └── /customer-login                                 │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         Page Components (client/src/pages/)         │
├──────────────────────────────────────────────────────┤
│ Customer Pages:                                     │
│ ├── home.tsx                                        │
│ ├── customer-registration.tsx                       │
│ ├── acer-bbg.tsx                                    │
│ ├── amazon-bbg.tsx                                  │
│ ├── claim-bbg.tsx                                   │
│ ├── customer-dashboard.tsx                          │
│ ├── thank-you.tsx                                   │
│                                                     │
│ Distributor Pages:                                  │
│ ├── distributor-registration.tsx                    │
│ ├── distributor-login.tsx                           │
│ ├── distributor-dashboard.tsx                       │
│                                                     │
│ Admin Pages:                                        │
│ ├── admin-dashboard.tsx                             │
│ ├── admin-distributors.tsx                          │
│ ├── admin-claim-value-slabs.tsx                     │
│ ├── admin-bbg-settings.tsx                          │
│ ├── admin-plan-configurations.tsx                   │
│ ├── admin-partner-commission-settings.tsx           │
│ ├── admin-templates.tsx                             │
│ ├── admin-admin-users.tsx                           │
│ └── 20+ more admin pages                            │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│         State Management (TanStack Query)            │
├──────────────────────────────────────────────────────┤
│ ├── Query Hooks (useQuery)                          │
│ │   ├── Fetch customers                            │
│ │   ├── Fetch claim slabs                          │
│ │   ├── Fetch settings                             │
│ │   └── Fetch templates                            │
│ ├── Mutation Hooks (useMutation)                    │
│ │   ├── Register customer                          │
│ │   ├── File claim                                 │
│ │   ├── Update settings                            │
│ │   └── Create template                            │
│ └── Query Client (Cache management)                │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│        Form Handling (React Hook Form + Zod)        │
├──────────────────────────────────────────────────────┤
│ ├── useForm() hooks                                │
│ ├── Zod validation schemas                         │
│ ├── zodResolver integration                        │
│ ├── Real-time field validation                     │
│ └── Error display                                  │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│     UI Components (shadcn/ui + Tailwind CSS)       │
├──────────────────────────────────────────────────────┤
│ ├── Input, Button, Select                          │
│ ├── Dialog, Alert, Toast                           │
│ ├── Table, Card, Form                              │
│ ├── Tabs, Accordion                                │
│ └── Custom components                              │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│    Styling (Tailwind CSS + Custom CSS)              │
│    Colors: Primary #254696, Secondary #E72829       │
│    Dark mode support with CSS variables             │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│        API Layer (lib/queryClient.ts)               │
├──────────────────────────────────────────────────────┤
│ ├── apiRequest() - Generic fetch function          │
│ ├── Query key management                           │
│ ├── Error handling                                 │
│ ├── Cache invalidation                             │
│ └── Loading states                                 │
└─────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────┐
│     Express Backend (0.0.0.0:5000)                  │
│     All API requests go here                        │
└─────────────────────────────────────────────────────┘
```

### C. Key Service Classes

#### Communication Service
**Purpose**: Orchestrates all outbound communications (email, SMS, WhatsApp)

**Key Methods**:
```typescript
- sendCustomerRegistrationEmail(customerData)
- sendDistributorWelcomeEmail(distributorData)
- sendClaimStatusUpdate(claimData, status)
- sendDistributorPayoutNotification(payoutData)
- calculateDeviceAgeInMonths(purchaseDate)
- selectEmailTemplate(registrationSource, deviceAge)
```

**Logic Flow**:
1. Calculate device age in months
2. Fetch plan configuration from database
3. Select appropriate template based on:
   - Registration source (regular/acer/amazon/website)
   - Device age category (within 6 months / over 6 months)
4. Fetch template from database
5. Replace variables in template
6. Send via appropriate channel (SMTP/SMS/WhatsApp)

#### Template Service
**Purpose**: Manages message templates with dynamic variable replacement

**Key Methods**:
```typescript
- getTemplateByTypeEventAndDevice(type, eventType, deviceType)
- createTemplate(templateData)
- updateTemplate(id, templateData)
- deleteTemplate(id)
- renderTemplate(template, variables)
- ensureDefaultTemplates()
```

#### Plan Service
**Purpose**: Determines plan configuration based on device age

**Key Methods**:
```typescript
- getPlanForDeviceAge(ageInMonths)
- getDefaultPlans()
- calculateBenefits(plan, invoiceValue)
```

#### S3 Service
**Purpose**: Manages file uploads to AWS S3 with signed URLs

**Key Methods**:
```typescript
- uploadFile(file, destination)
- generateSignedUrl(fileKey)
- deleteFile(fileKey)
- getFileUrl(fileKey)
```

---

## 6. VISUAL FLOW DIAGRAMS

### A. DATABASE FLOW ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      MICROSOFT SQL SERVER DATABASE                         │
│                                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐│
│  │   CORE TABLES       │  │  CONFIGURATION      │  │  OPERATIONAL        ││
│  │                     │  │  TABLES             │  │  TABLES             ││
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤│
│  │ • customers         │  │ • bbg_price_        │  │ • claims            ││
│  │ • distributors      │  │   settings          │  │ • otp_               ││
│  │ • claims            │  │ • claim_value_      │  │   verifications     ││
│  │ • commission_       │  │   slabs             │  │ • transaction_      ││
│  │   payouts           │  │ • plan_             │  │   history           ││
│  │ • customers         │  │   configurations    │  │ • commission_       ││
│  │ • device_           │  │ • partner_          │  │   payouts           ││
│  │   registrations     │  │   commission_       │  │ • pending_          ││
│  │                     │  │   settings          │  │   payments          ││
│  │                     │  │ • referral_         │  │ • cart_             ││
│  │                     │  │   discount_         │  │   abandonments      ││
│  │                     │  │   settings          │  │                     ││
│  │                     │  │ • waiting_period_   │  │                     ││
│  │                     │  │   settings          │  │                     ││
│  │                     │  │ • theme_settings    │  │                     ││
│  │                     │  │ • smtp_settings     │  │                     ││
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘│
│          ↓                        ↓                         ↓              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │              RELATIONSHIP CONNECTIONS                               │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ customers.sellerCode ──→ distributors.sellerCode                    │  │
│  │ claims.customerId ──→ customers.id                                  │  │
│  │ claims.voucherCode ──→ customers.voucherCode                        │  │
│  │ commission_payouts.customerId ──→ customers.id                      │  │
│  │ commission_payouts.distributorId ──→ distributors.id                │  │
│  │ admin_users.roleId ──→ user_roles.id                                │  │
│  │ device_registrations.voucherCode ──→ customers.voucherCode (optional)│  │
│  │ customers.registrationSlabData ←→ claim_value_slabs (JSON snapshot) │  │
│  │ customers.emailTemplateKey ←→ message_templates.eventType           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│          ↓                        ↓                         ↓              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐ │
│  │   MASTER TABLES      │  │  COMMUNICATION       │  │  SECURITY        │ │
│  │                      │  │  TABLES              │  │  TABLES          │ │
│  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────┤ │
│  │ • brands             │  │ • message_templates  │  │ • admin_users    │ │
│  │ • device_models      │  │ • transaction_       │  │ • user_roles     │ │
│  │ • user_roles         │  │   history            │  │ • distributor_   │ │
│  │ • homepage_banners   │  │ • acer_imei_         │  │   sessions       │ │
│  │                      │  │   validation         │  │                  │ │
│  │                      │  │                      │  │                  │ │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘ │
│          ↓                        ↓                         ↓              │
└─────────────────────────────────────────────────────────────────────────────┘
         ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
         ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
┌────────────────────────────────────────────────────────────────────────────┐
│                      DATA FLOW WITHIN DATABASE                             │
│                                                                            │
│  CUSTOMER REGISTRATION FLOW:                                               │
│  ┌──────────────┐    ┌─────────────┐    ┌──────────────┐                  │
│  │ customers    │───→│ commission_ │───→│ transaction_ │                  │
│  │ (insert)     │    │ payouts     │    │ history      │                  │
│  │              │    │ (insert)    │    │ (insert)     │                  │
│  └──────────────┘    └─────────────┘    └──────────────┘                  │
│                            ↓                                               │
│  CLAIM FILING FLOW:        ↓                                               │
│  ┌──────────────┐    ┌─────────────┐    ┌──────────────┐                  │
│  │ claims       │───→│ message_    │───→│ transaction_ │                  │
│  │ (insert)     │    │ templates   │    │ history      │                  │
│  │              │    │ (select)    │    │ (insert)     │                  │
│  └──────────────┘    └─────────────┘    └──────────────┘                  │
│                                                                            │
│  PRICE UPDATE FLOW:                                                        │
│  ┌─────────────────────┐                                                   │
│  │ admin_users         │                                                   │
│  │ (authenticated)     │                                                   │
│  └──────────┬──────────┘                                                   │
│             ↓                                                              │
│  ┌──────────────────────────────┐    ┌──────────────┐                     │
│  │ bbg_price_settings           │───→│ transaction_ │                     │
│  │ (update)                     │    │ history      │                     │
│  └──────────────────────────────┘    │ (insert)     │                     │
│                                       └──────────────┘                     │
│                                                                            │
│  TEMPLATE MANAGEMENT FLOW:                                                 │
│  ┌──────────────┐    ┌─────────────────────┐    ┌──────────────┐         │
│  │ admin_users  │───→│ message_templates   │───→│ transaction_ │         │
│  │ (auth)       │    │ (create/update)     │    │ history      │         │
│  └──────────────┘    └─────────────────────┘    └──────────────┘         │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Data Flows**:
- **Registration Flow**: customers → commission_payouts → transaction_history
- **Claim Flow**: claims → message_templates → transaction_history
- **Admin Updates**: admin action → target table (bbg_prices, templates, etc.) → transaction_history
- **Real-time Sync**: claim_value_slabs snapshot stored in customers.registrationSlabData

---

### B. FRONTEND FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND (0.0.0.0:5000)                    │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        ROUTING LAYER (Wouter)                          │ │
│  │                                                                        │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │ │
│  │  │ PUBLIC ROUTES    │  │ CUSTOMER ROUTES  │  │ ADMIN ROUTES     │    │ │
│  │  │                  │  │                  │  │                  │    │ │
│  │  │ • /              │  │ • /customer-     │  │ • /admin/*       │    │ │
│  │  │ • /register      │  │   registration   │  │ • /admin/bbg-    │    │ │
│  │  │ • /acer-bbg      │  │ • /customer-     │  │   settings       │    │ │
│  │  │ • /amazon-bbg    │  │   login          │  │ • /admin/claim-  │    │ │
│  │  │ • /claim-bbg     │  │ • /customer-     │  │   slabs          │    │ │
│  │  │ • /terms         │  │   dashboard      │  │ • /admin/        │    │ │
│  │  │                  │  │ • /thank-you     │  │   templates      │    │ │
│  │  │                  │  │                  │  │ • /admin/users   │    │ │
│  │  │                  │  │ DISTRIBUTOR:     │  │ • /admin/        │    │ │
│  │  │                  │  │ • /distributor-  │  │   plan-config    │    │ │
│  │  │                  │  │   registration   │  │ • 20+ more pages │    │ │
│  │  │                  │  │ • /distributor-  │  │                  │    │ │
│  │  │                  │  │   login          │  │                  │    │ │
│  │  │                  │  │ • /distributor-  │  │                  │    │ │
│  │  │                  │  │   dashboard      │  │                  │    │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   ↓↓↓                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              PAGE COMPONENT TREE (client/src/pages)                   │ │
│  │                                                                        │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │ │
│  │  │  FORM PAGES      │  │  DATA VIEW PAGES │  │  ADMIN PAGES     │    │ │
│  │  │                  │  │                  │  │                  │    │ │
│  │  │ • customer-      │  │ • customer-      │  │ • admin-         │    │ │
│  │  │   registration   │  │   dashboard      │  │   dashboard      │    │ │
│  │  │ • acer-bbg       │  │ • distributor-   │  │ • admin-         │    │ │
│  │  │ • amazon-bbg     │  │   dashboard      │  │   distributors   │    │ │
│  │  │ • claim-bbg      │  │ • thank-you      │  │ • admin-claims   │    │ │
│  │  │ • distributor-   │  │                  │  │ • admin-         │    │ │
│  │  │   registration   │  │                  │  │   customers      │    │ │
│  │  │                  │  │                  │  │ • admin-         │    │ │
│  │  │                  │  │                  │  │   templates      │    │ │
│  │  │                  │  │                  │  │ • admin-plan-    │    │ │
│  │  │                  │  │                  │  │   config         │    │ │
│  │  │                  │  │                  │  │ • 20+ more       │    │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   ↓↓↓                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │           COMPONENT LAYER (client/src/components)                     │ │
│  │                                                                        │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │ │
│  │  │ UI COMPONENTS    │  │ FORM COMPONENTS  │  │ LAYOUT COMPONENTS│    │ │
│  │  │ (shadcn/ui)      │  │ (React Hook Form)│  │                  │    │ │
│  │  │                  │  │                  │  │                  │    │ │
│  │  │ • Button         │  │ • Form           │  │ • AdminLayout    │    │ │
│  │  │ • Input          │  │ • FormField      │  │ • AdminSidebar   │    │ │
│  │  │ • Select         │  │ • useForm        │  │ • Navbar         │    │ │
│  │  │ • Dialog         │  │ • zodResolver    │  │ • Footer         │    │ │
│  │  │ • Alert          │  │                  │  │                  │    │ │
│  │  │ • Table          │  │                  │  │                  │    │ │
│  │  │ • Card           │  │                  │  │                  │    │ │
│  │  │ • Tabs           │  │                  │  │                  │    │ │
│  │  │ • Toast          │  │                  │  │                  │    │ │
│  │  │ • 50+ more       │  │                  │  │                  │    │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   ↓↓↓                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │        STATE MANAGEMENT (TanStack Query + Local State)                │ │
│  │                                                                        │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                          │ │
│  │  │ QUERIES          │  │ MUTATIONS        │                          │ │
│  │  │ (useQuery)       │  │ (useMutation)    │                          │ │
│  │  │                  │  │                  │                          │ │
│  │  │ • Fetch customers│  │ • Register       │                          │ │
│  │  │ • Fetch claims   │  │ • File claim     │                          │ │
│  │  │ • Fetch settings │  │ • Update profile │                          │ │
│  │  │ • Fetch templates│  │ • Create template│                          │ │
│  │  │ • Fetch slabs    │  │ • Update prices  │                          │ │
│  │  │                  │  │ • Login          │                          │ │
│  │  │                  │  │ • Logout         │                          │ │
│  │  │                  │  │                  │                          │ │
│  │  └──────────────────┘  └──────────────────┘                          │ │
│  │           ↓                     ↓                                     │ │
│  │  ┌─────────────────────────────────────┐                             │ │
│  │  │    QUERY CLIENT (Cache Manager)     │                             │ │
│  │  │  • invalidateQueries()              │                             │ │
│  │  │  • refetchQueries()                 │                             │ │
│  │  │  • setQueryData()                   │                             │ │
│  │  └─────────────────────────────────────┘                             │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   ↓↓↓                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              API LAYER (lib/queryClient.ts)                           │ │
│  │                                                                        │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                          │ │
│  │  │ HTTP Methods     │  │ Error Handling   │                          │ │
│  │  │                  │  │                  │                          │ │
│  │  │ • GET            │  │ • Network errors │                          │ │
│  │  │ • POST           │  │ • Validation     │                          │ │
│  │  │ • PUT            │  │ • Auth errors    │                          │ │
│  │  │ • DELETE         │  │ • Server errors  │                          │ │
│  │  │                  │  │ • Toast messages │                          │ │
│  │  └──────────────────┘  └──────────────────┘                          │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   ↓↓↓                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │              STYLING (Tailwind CSS + Custom CSS)                      │ │
│  │                                                                        │ │
│  │  • Design system: Primary #254696, Secondary #E72829                 │ │
│  │  • Dark mode support with CSS variables                              │ │
│  │  • Responsive design (mobile, tablet, desktop)                       │ │
│  │  • Animation & transitions (Framer Motion)                           │ │
│  │  • Custom properties in index.css                                    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   ↓↓↓                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓↓↓
                          (HTTP REST API Calls)
                                    ↓↓↓
                    EXPRESS BACKEND (Port 5000)
```

**Frontend Data Flow**:
1. User interacts with component → Event handler triggered
2. Component calls useQuery/useMutation → API Layer makes HTTP request
3. Backend processes → Returns JSON response
4. Query client caches → Component re-renders with new data
5. User sees updated UI with toast notifications

---

### C. BACKEND FLOW ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND (server/index.ts)                      │
│                            Port: 0.0.0.0:5000                                │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                      MIDDLEWARE CHAIN                                  │  │
│  │                                                                        │  │
│  │  1. Body Parser (JSON)                                                 │  │
│  │  ↓                                                                     │  │
│  │  2. CORS & Security Headers                                            │  │
│  │  ↓                                                                     │  │
│  │  3. Request Logging                                                    │  │
│  │  ↓                                                                     │  │
│  │  4. Session Middleware                                                 │  │
│  │  ↓                                                                     │  │
│  │  5. Static File Serving                                                │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                   ↓                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │              ROUTE HANDLERS (server/routes.ts)                        │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │  │
│  │  │ AUTH ROUTES      │  │ CUSTOMER ROUTES  │  │ ADMIN ROUTES     │    │  │
│  │  │                  │  │                  │  │                  │    │  │
│  │  │ • /api/send-otp  │  │ • /api/          │  │ • /api/admin/    │    │  │
│  │  │ • /api/verify-otp│  │   customers/     │  │   bbg-settings   │    │  │
│  │  │ • /api/customer/ │  │   register       │  │ • /api/admin/    │    │  │
│  │  │   login          │  │ • /api/          │  │   claim-slabs    │    │  │
│  │  │ • /api/          │  │   claims/check   │  │ • /api/admin/    │    │  │
│  │  │   distributor/   │  │ • /api/claims/   │  │   templates      │    │  │
│  │  │   login          │  │   file           │  │ • /api/admin/    │    │  │
│  │  │                  │  │ • /api/          │  │   customers      │    │  │
│  │  │                  │  │   validate-      │  │ • /api/admin/    │    │  │
│  │  │                  │  │   voucher        │  │   distributors   │    │  │
│  │  │                  │  │ • /api/verify-   │  │ • /api/admin/    │    │  │
│  │  │                  │  │   voucher        │  │   export/*       │    │  │
│  │  │                  │  │                  │  │ • 50+ more       │    │  │
│  │  │ PAYMENT ROUTES:  │  │                  │  │                  │    │  │
│  │  │ • /api/create-   │  │ DISTRIBUTOR:     │  │                  │    │  │
│  │  │   payu-payment   │  │ • /api/          │  │                  │    │  │
│  │  │ • /api/payu/     │  │   distributor/   │  │                  │    │  │
│  │  │   success        │  │   register       │  │                  │    │  │
│  │  │ • /api/payu/     │  │ • /api/          │  │                  │    │  │
│  │  │   failure        │  │   distributor/   │  │                  │    │  │
│  │  │                  │  │   customers      │  │                  │    │  │
│  │  │                  │  │ • /api/          │  │                  │    │  │
│  │  │                  │  │   distributor/   │  │                  │    │  │
│  │  │                  │  │   commissions    │  │                  │    │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                   ↓                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │           REQUEST PROCESSING PER ROUTE                                │  │
│  │                                                                        │  │
│  │  1. Authentication Check (isAdminAuthenticated, isDistAuthent...)     │  │
│  │  ↓                                                                    │  │
│  │  2. Input Validation (Zod schemas)                                    │  │
│  │  ↓                                                                    │  │
│  │  3. Business Logic Execution                                          │  │
│  │  ↓                                                                    │  │
│  │  4. Storage Layer Call                                                │  │
│  │  ↓                                                                    │  │
│  │  5. Service Layer Call (if needed)                                    │  │
│  │  ↓                                                                    │  │
│  │  6. Response Formatting & Sending                                     │  │
│  │  ↓                                                                    │  │
│  │  7. Error Handling & Logging                                          │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                   ↓                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │         SERVICE LAYER (Business Logic)                                │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │  │
│  │  │ Communication    │  │ Template Service │  │ Plan Service     │    │  │
│  │  │ Service          │  │                  │  │                  │    │  │
│  │  │                  │  │ • getTemplate    │  │ • getPlanFor     │    │  │
│  │  │ • sendEmail()    │  │ • renderTemplate │  │   DeviceAge()    │    │  │
│  │  │ • sendSMS()      │  │ • replaceVars()  │  │ • calculateBe    │    │  │
│  │  │ • sendWhatsApp() │  │ • ensureDefaults │  │   nefits()       │    │  │
│  │  │ • calcDeviceAge()│  │ • createTemplate │  │                  │    │  │
│  │  │ • selectTemplate │  │ • updateTemplate │  │                  │    │  │
│  │  │   ByAge()        │  │ • deleteTemplate │  │                  │    │  │
│  │  │                  │  │                  │  │                  │    │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                          │  │
│  │  │ S3 Service       │  │ External Services│                          │  │
│  │  │                  │  │                  │                          │  │
│  │  │ • uploadFile()   │  │ • Kaleyra SMS    │                          │  │
│  │  │ • deleteFile()   │  │ • Gupshup        │                          │  │
│  │  │ • generateURL()  │  │   WhatsApp       │                          │  │
│  │  │                  │  │ • PayU Gateway   │                          │  │
│  │  │                  │  │ • Nodemailer     │                          │  │
│  │  │                  │  │   SMTP           │                          │  │
│  │  └──────────────────┘  └──────────────────┘                          │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                   ↓                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │      STORAGE LAYER (server/sql-storage.ts)                            │  │
│  │             IStorage Interface Implementation                          │  │
│  │                                                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────┐   │  │
│  │  │  Core Methods (CRUD Operations)                                │   │  │
│  │  ├────────────────────────────────────────────────────────────────┤   │  │
│  │  │  getCustomers()         → SELECT * FROM customers             │   │  │
│  │  │  getCustomerById()      → SELECT * FROM customers WHERE id=?  │   │  │
│  │  │  createCustomer()       → INSERT INTO customers               │   │  │
│  │  │  updateCustomer()       → UPDATE customers SET...             │   │  │
│  │  │                                                                │   │  │
│  │  │  getClaims()            → SELECT * FROM claims                │   │  │
│  │  │  getClaimById()         → SELECT * FROM claims WHERE id=?     │   │  │
│  │  │  createClaim()          → INSERT INTO claims                  │   │  │
│  │  │  updateClaimStatus()    → UPDATE claims SET status=?          │   │  │
│  │  │                                                                │   │  │
│  │  │  getDistributors()      → SELECT * FROM distributors          │   │  │
│  │  │  getDistributorById()   → SELECT * FROM distributors WHERE id │   │  │
│  │  │  createDistributor()    → INSERT INTO distributors            │   │  │
│  │  │  updateDistributor()    → UPDATE distributors SET...          │   │  │
│  │  │                                                                │   │  │
│  │  │  getClaimValueSlabs()   → SELECT * FROM claim_value_slabs     │   │  │
│  │  │  createClaimSlab()      → INSERT INTO claim_value_slabs       │   │  │
│  │  │  updateClaimSlab()      → UPDATE claim_value_slabs SET...     │   │  │
│  │  │                                                                │   │  │
│  │  │  getPlanConfigurations()→ SELECT * FROM plan_configurations   │   │  │
│  │  │  createPlanConfig()     → INSERT INTO plan_configurations     │   │  │
│  │  │  updatePlanConfig()     → UPDATE plan_configurations SET...   │   │  │
│  │  │                                                                │   │  │
│  │  │  getMessageTemplates()  → SELECT * FROM message_templates     │   │  │
│  │  │  createTemplate()       → INSERT INTO message_templates       │   │  │
│  │  │  updateTemplate()       → UPDATE message_templates SET...     │   │  │
│  │  │                                                                │   │  │
│  │  │  getAdminUsers()        → SELECT * FROM admin_users           │   │  │
│  │  │  createAdminUser()      → INSERT INTO admin_users             │   │  │
│  │  │                                                                │   │  │
│  │  │  getBBGPrices()         → SELECT * FROM bbg_price_settings    │   │  │
│  │  │  updateBBGPrices()      → UPDATE bbg_price_settings SET...    │   │  │
│  │  │                                                                │   │  │
│  │  │  + 50+ more methods                                            │   │  │
│  │  │                                                                │   │  │
│  │  └────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                        │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                   ↓↓↓                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                   ↓↓↓
                          SQL QUERY EXECUTION
                                   ↓↓↓
┌──────────────────────────────────────────────────────────────────────────────┐
│                    MICROSOFT SQL SERVER DATABASE                             │
│                                                                              │
│  SQL Query Types:                                                            │
│  • SELECT queries (READ)     → fetch data                                   │
│  • INSERT queries (CREATE)   → add new records                              │
│  • UPDATE queries (UPDATE)   → modify existing records                      │
│  • DELETE queries (DELETE)   → soft delete via isActive flag                │
│  • JOINs                     → combine data from multiple tables            │
│  • Transactions              → ensure data consistency                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Backend Request Processing Flow**:
```
Incoming HTTP Request
        ↓
Route Handler Identification
        ↓
Middleware Execution (Auth, Validation)
        ↓
Business Logic Execution
        ↓
Storage Layer (CRUD)
        ↓
Service Layer (Communications, etc.)
        ↓
External APIs (PayU, SMS, Email)
        ↓
Response Formatting
        ↓
HTTP Response Sent
        ↓
Request Logging
```

---

### D. COMPLETE SYSTEM INTEGRATION FLOW

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    COMPLETE XTRACOVER BBG SYSTEM ARCHITECTURE                ║
║                                                                              ║
║           FRONTEND (React)        →        BACKEND (Express)        →        ║
║        client/src/*                      server/                          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║     USER BROWSER (0.0.0.0:5000)                                             ║
║     ┌─────────────────────────────┐                                         ║
║     │  React Application          │                                         ║
║     │                             │                                         ║
║     │  ┌─────────────────────────┐│                                         ║
║     │  │ Page Components         ││  ──HTTP GET/POST──→  API Endpoints     ║
║     │  │ (45+ pages)             ││                      (50+ routes)       ║
║     │  └─────────────────────────┘│                                         ║
║     │           ↓                  │                                         ║
║     │  ┌─────────────────────────┐│                                         ║
║     │  │ UI Components           ││                                         ║
║     │  │ (shadcn/ui)             ││                                         ║
║     │  └─────────────────────────┘│                                         ║
║     │           ↓                  │                                         ║
║     │  ┌─────────────────────────┐│                                         ║
║     │  │ State Management        ││                                         ║
║     │  │ (TanStack Query)        ││                                         ║
║     │  │ useQuery/useMutation    ││                                         ║
║     │  └─────────────────────────┘│                                         ║
║     │           ↓                  │                                         ║
║     │  ┌─────────────────────────┐│                                         ║
║     │  │ API Layer               ││  ←─JSON Response─── Route Handler      ║
║     │  │ (lib/queryClient)       ││                      Executes Logic    ║
║     │  └─────────────────────────┘│                                         ║
║     └─────────────────────────────┘                                         ║
║                                                                              ║
║     BACKEND PROCESSING (0.0.0.0:5000)                                       ║
║     ┌───────────────────────────────────────────────────────────────────┐   ║
║     │ Express Application (server/index.ts)                            │   ║
║     │                                                                   │   ║
║     │ ┌─────────────────────────────────────────────────────────────┐  │   ║
║     │ │ Middleware Stack                                            │  │   ║
║     │ │ ├─ Body Parser (JSON)                                       │  │   ║
║     │ │ ├─ Authentication Middleware                                │  │   ║
║     │ │ ├─ Session Management                                       │  │   ║
║     │ │ └─ Error Handling                                           │  │   ║
║     │ └─────────────────────────────────────────────────────────────┘  │   ║
║     │              ↓                                                    │   ║
║     │ ┌─────────────────────────────────────────────────────────────┐  │   ║
║     │ │ Route Handlers (server/routes.ts)                           │  │   ║
║     │ │ ├─ POST /api/customers/register                            │  │   ║
║     │ │ ├─ POST /api/create-payu-payment                           │  │   ║
║     │ │ ├─ POST /api/payu/success                                  │  │   ║
║     │ │ ├─ POST /api/claims/file                                   │  │   ║
║     │ │ ├─ GET /api/admin/claim-value-slabs                        │  │   ║
║     │ │ ├─ POST /api/admin/bbg-settings                            │  │   ║
║     │ │ ├─ GET /api/admin/plan-configurations                      │  │   ║
║     │ │ └─ 45+ more routes                                         │  │   ║
║     │ └─────────────────────────────────────────────────────────────┘  │   ║
║     │              ↓                                                    │   ║
║     │ ┌─────────────────────────────────────────────────────────────┐  │   ║
║     │ │ Business Logic & Validation                                 │  │   ║
║     │ │ ├─ Price calculation (server-side)                          │  │   ║
║     │ │ ├─ Commission calculation                                   │  │   ║
║     │ │ ├─ Device age validation                                    │  │   ║
║     │ │ ├─ Waiting period checks                                    │  │   ║
║     │ │ ├─ Slab selection logic                                     │  │   ║
║     │ │ └─ Hash verification (PayU)                                 │  │   ║
║     │ └─────────────────────────────────────────────────────────────┘  │   ║
║     │              ↓                                                    │   ║
║     │ ┌─────────────────────────────────────────────────────────────┐  │   ║
║     │ │ Service Layer                                               │  │   ║
║     │ │ ┌─────────────────────────────────────────────────────────┐ │  │   ║
║     │ │ │ Communication Service                                   │ │  │   ║
║     │ │ │ ├─ Select email template                                │ │  │   ║
║     │ │ │ ├─ Replace template variables                           │ │  │   ║
║     │ │ │ ├─ Send via SMTP/SMS/WhatsApp                           │ │  │   ║
║     │ │ │ └─ Log email/SMS delivery                               │ │  │   ║
║     │ │ └─────────────────────────────────────────────────────────┘ │  │   ║
║     │ │ ┌─────────────────────────────────────────────────────────┐ │  │   ║
║     │ │ │ Template Service                                        │ │  │   ║
║     │ │ │ ├─ Fetch templates from database                        │ │  │   ║
║     │ │ │ ├─ Render with variables                                │ │  │   ║
║     │ │ │ ├─ Create/update templates                              │ │  │   ║
║     │ │ │ └─ Live preview generation                              │ │  │   ║
║     │ │ └─────────────────────────────────────────────────────────┘ │  │   ║
║     │ │ ┌─────────────────────────────────────────────────────────┐ │  │   ║
║     │ │ │ S3 Service                                              │ │  │   ║
║     │ │ │ ├─ Upload files to AWS S3                               │ │  │   ║
║     │ │ │ ├─ Generate signed URLs                                 │ │  │   ║
║     │ │ │ └─ Handle file deletions                                │ │  │   ║
║     │ │ └─────────────────────────────────────────────────────────┘ │  │   ║
║     │ │ ┌─────────────────────────────────────────────────────────┐ │  │   ║
║     │ │ │ External Services                                       │ │  │   ║
║     │ │ │ ├─ PayU Payment Gateway                                 │ │  │   ║
║     │ │ │ ├─ Kaleyra SMS                                          │ │  │   ║
║     │ │ │ ├─ Gupshup WhatsApp                                     │ │  │   ║
║     │ │ │ └─ Nodemailer SMTP                                      │ │  │   ║
║     │ │ └─────────────────────────────────────────────────────────┘ │  │   ║
║     │ └─────────────────────────────────────────────────────────────┘  │   ║
║     │              ↓                                                    │   ║
║     │ ┌─────────────────────────────────────────────────────────────┐  │   ║
║     │ │ Storage Layer (SQL Server Interface)                        │  │   ║
║     │ │ ├─ CRUD operations for all tables                          │  │   ║
║     │ │ ├─ Query construction & execution                          │  │   ║
║     │ │ ├─ Error handling & retries                                │  │   ║
║     │ │ ├─ Connection pooling                                      │  │   ║
║     │ │ └─ Transaction management                                  │  │   ║
║     │ └─────────────────────────────────────────────────────────────┘  │   ║
║     └───────────────────────────────────────────────────────────────────┘   ║
║                                                                              ║
║                                   ↓↓↓                                       ║
║                         SQL QUERY EXECUTION                                 ║
║                                   ↓↓↓                                       ║
║                                                                              ║
║     DATABASE LAYER (Microsoft SQL Server)                                   ║
║     ┌─────────────────────────────────────────────────────────────────┐   ║
║     │                                                                 │   ║
║     │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │   ║
║     │  │ Core Tables    │  │ Config Tables  │  │ Ops Tables     │   │   ║
║     │  ├────────────────┤  ├────────────────┤  ├────────────────┤   │   ║
║     │  │ • customers    │  │ • bbg_price_   │  │ • claims       │   │   ║
║     │  │ • distributors │  │   settings     │  │ • transaction_ │   │   ║
║     │  │ • claims       │  │ • claim_value_ │  │   history      │   │   ║
║     │  │ • commission_  │  │   slabs        │  │ • commission_  │   │   ║
║     │  │   payouts      │  │ • plan_        │  │   payouts      │   │   ║
║     │  │                │  │   configurations│ │ • pending_     │   │   ║
║     │  │                │  │ • partner_     │  │   payments     │   │   ║
║     │  │                │  │   commission_  │  │                │   │   ║
║     │  │                │  │   settings     │  │                │   │   ║
║     │  │                │  │ • referral_    │  │                │   │   ║
║     │  │                │  │   discount_    │  │                │   │   ║
║     │  │                │  │   settings     │  │                │   │   ║
║     │  │                │  │ • message_     │  │                │   │   ║
║     │  │                │  │   templates    │  │                │   │   ║
║     │  │                │  │ • admin_users  │  │                │   │   ║
║     │  │                │  │ • theme_       │  │                │   │   ║
║     │  │                │  │   settings     │  │                │   │   ║
║     │  │                │  │ • smtp_settings│  │                │   │   ║
║     │  └────────────────┘  └────────────────┘  └────────────────┘   │   ║
║     │                                                                 │   ║
║     │  All tables interconnected via relationships:                   │   ║
║     │  • Foreign Keys enforce referential integrity                   │   ║
║     │  • Indexes optimize query performance                           │   ║
║     │  • Constraints ensure data validity                             │   ║
║     │  • Transactions maintain ACID properties                        │   ║
║     │                                                                 │   ║
║     └─────────────────────────────────────────────────────────────────┘   ║
║                                   ↑↑↑                                       ║
║                       SQL Response Returns to Backend                       ║
║                                   ↑↑↑                                       ║
║                                                                              ║
║     EXTERNAL INTEGRATIONS (Parallel Execution)                              ║
║     ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      ║
║     │ PAYU GATEWAY     │  │ COMMUNICATION    │  │ FILE STORAGE     │      ║
║     │                  │  │ SERVICES         │  │                  │      ║
║     │ ├─ Payment Hash  │  │ ├─ Kaleyra SMS   │  │ ├─ AWS S3        │      ║
║     │ │   Verification │  │ │ ├─ HTTP POST   │  │ │ ├─ Upload Files│      ║
║     │ ├─ Amount        │  │ │ │   API Call   │  │ │ ├─ Signed URLs │      ║
║     │ │   Validation   │  │ ├─ Gupshup      │  │ │ └─ Delete Files│      ║
║     │ ├─ Payment       │  │ │   WhatsApp     │  │ └─ AWS S3 Bucket│      ║
║     │ │   Processing   │  │ │ ├─ HTTP POST   │  │    (bbg-assets) │      ║
║     │ │   (Card/UPI)   │  │ │ │   API Call   │  │                 │      ║
║     │ └─ Success/      │  │ ├─ Nodemailer   │  │                 │      ║
║     │   Failure        │  │ │   (SMTP)       │  │                 │      ║
║     │   Callback       │  │ │ ├─ DB Config   │  │                 │      ║
║     │                  │  │ │ ├─ Template    │  │                 │      ║
║     │                  │  │ │ │   Rendering │  │                 │      ║
║     │                  │  │ │ └─ Send via    │  │                 │      ║
║     │                  │  │ │   SMTP Server │  │                 │      ║
║     │                  │  │ └─ Delivery     │  │                 │      ║
║     │                  │  │    Logging      │  │                 │      ║
║     └──────────────────┘  └──────────────────┘  └──────────────────┘      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝


DATA FLOW TIMELINE EXAMPLE - CUSTOMER REGISTRATION:

┌──────────┐
│ BROWSER  │
└────┬─────┘
     │ 1. User fills form & clicks "Register"
     │
     ├───HTTP POST /api/customers/register──→ ┌──────────────────┐
     │   {customerData}                       │ ROUTE HANDLER    │
     │                                        │ (Authentication) │
     │                                        └────────┬─────────┘
     │                                                 │
     │                                                 │ 2. Validate input
     │                                                 │    (Zod schema)
     │                                                 ↓
     │                                        ┌──────────────────┐
     │                                        │ BUSINESS LOGIC   │
     │                                        │ • Calc device age│
     │                                        │ • Verify BBG age │
     │                                        │ • Select plan    │
     │                                        │ • Calc commission│
     │                                        └────────┬─────────┘
     │                                                 │
     │                                                 │ 3. Fetch data
     │                                                 ↓
     │                                        ┌──────────────────┐
     │                                        │ STORAGE LAYER    │
     │                                        │ → bbg_price_     │
     │                                        │   settings       │
     │                                        │ → claim_value_   │
     │                                        │   slabs          │
     │                                        │ → insert customer│
     │                                        │ → insert         │
     │                                        │   commission_    │
     │                                        │   payout         │
     │                                        └────────┬─────────┘
     │                                                 │
     │                                                 │ 4. Execute SQL
     │                                                 ↓
     │                                        ┌──────────────────┐
     │                                        │ SQL SERVER       │
     │                                        │ (Database)       │
     │                                        │ ✓ Records        │
     │                                        │   created        │
     │                                        └────────┬─────────┘
     │                                                 │
     │                                                 │ 5. Call services
     │                                                 ↓
     │     ┌─────────────────────────────────┌──────────────────┐
     │     │                                 │ SERVICE LAYER    │
     │     ↓                                 │ (Parallel calls) │
     │  ┌──────────────┐   ┌──────────────┐ │                  │
     │  │ NODEMAILER   │   │ KALEYRA      │ │ • Send Email     │
     │  │ SMTP Service │   │ SMS Service  │ │ • Send SMS       │
     │  │              │   │              │ │ • Log to DB      │
     │  │ GET SMTP     │   │ Call SMS     │ │                  │
     │  │ Settings     │   │ API          │ └──────────┬───────┘
     │  │ Render       │   │ Delivery     │           │
     │  │ Template     │   │ Confirmation │           │ 6. Return response
     │  │ Send Email   │   │              │           │
     │  │ to customer  │   │              │           │
     │  └──────────────┘   └──────────────┘           │
     │                                                 │
     │ 7. JSON Response──────────────────────────────←┘
     │    {voucherCode, customerId, message}
     │
     ↓
  ┌─────────────────┐
  │ FRONTEND        │
  │ ├─ Parse JSON   │
  │ ├─ Store voucher│
  │ ├─ Invalidate   │
  │ │  TanStack     │
  │ │  Query cache  │
  │ ├─ Show success │
  │ │  toast        │
  │ └─ Redirect to  │
  │    thank-you    │
  │    page         │
  └─────────────────┘
```

---

### E. REQUEST-RESPONSE CYCLE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│              HTTP REQUEST-RESPONSE CYCLE                        │
└─────────────────────────────────────────────────────────────────┘

FRONTEND                          BACKEND                  DATABASE
┌─────────────┐                ┌────────────┐            ┌────────┐
│   BROWSER   │                │  EXPRESS   │            │ SQL    │
└─────┬───────┘                └────────────┘            │ SERVER │
      │                                                  └────────┘
      │ 1. User Action
      │    (Click Button)
      │
      ├─→ useState update
      │
      ├─→ Form validation
      │    (Zod schema)
      │
      ├─→ API Layer Call
      │    (TanStack Query)
      │
      ├─→ HTTP REQUEST
      │   ├─ Method: POST
      │   ├─ URL: /api/customers/register
      │   ├─ Headers: Content-Type: application/json
      │   ├─ Body: {customerData}
      │   └─ Timestamp: [ISO 8601]
      │
      ├──────────────────────→ Router Match
      │                       │
      │                       ├─→ Route Handler: /api/customers/register
      │                       │
      │                       ├─→ Middleware
      │                       │   ├─ Body Parser (✓)
      │                       │   ├─ CORS Check (✓)
      │                       │   └─ Logging (✓)
      │                       │
      │                       ├─→ Authentication
      │                       │   └─ Optional (public route)
      │                       │
      │                       ├─→ Input Validation
      │                       │   ├─ Zod.parse(body)
      │                       │   └─ If invalid:
      │                       │      └─ Return 400 error
      │                       │
      │                       ├─→ Business Logic
      │                       │   ├─ Calculate device age
      │                       │   ├─ Verify constraints
      │                       │   ├─ Fetch settings
      │                       │   └─ Prepare data
      │                       │
      │                       ├─→ Storage Layer
      │                       │   ├─ connection.request()
      │                       │   ├─ .input('name', name)
      │                       │   ├─ .query(sql)
      │                       │   └─ Returns result
      │                       │
      │                       ├─────────────────→ SQL Query:
      │                       │                  INSERT INTO
      │                       │                  customers (...)
      │                       │                  VALUES (...)
      │                       │
      │                       │ ←─────────────── ✓ 1 row affected
      │                       │
      │                       ├─→ Service Layer
      │                       │   ├─ Communication
      │                       │   │  └─ Send Email/SMS
      │                       │   ├─ Template Render
      │                       │   └─ External APIs
      │                       │      (Parallel)
      │                       │
      │                       ├─→ Response Prep
      │                       │   ├─ {
      │                       │   │   "success": true,
      │                       │   │   "voucherCode": "ABC123",
      │                       │   │   "customerId": 42
      │                       │   │ }
      │                       │   └─ Status: 201 Created
      │                       │
      │                       └─→ Error Handling
      │                          (if any step fails)
      │
      │ HTTP RESPONSE
      │ ├─ Status: 201 / 400 / 500
      │ ├─ Headers: Content-Type: application/json
      │ ├─ Body: JSON response
      │ └─ Timestamp: [ISO 8601]
      │
      ←──────────────────────┘
      │
      ├─→ Parse Response
      │
      ├─→ Update TanStack Query
      │   ├─ Set query data
      │   └─ Update cache
      │
      ├─→ State Update
      │
      ├─→ Show Toast
      │   └─ Success message
      │
      ├─→ Component Re-render
      │
      └─→ Redirect to
         Thank You Page

END OF REQUEST-RESPONSE CYCLE
```

---



### A. CUSTOMER WORKFLOWS

#### Workflow 1: Regular BBG Purchase (Website)

```
START
  ↓
[Enter customer details]
  - Name, contact, email, pincode
  - Send OTP via SMS/email
  ↓
[Verify OTP]
  - Enter OTP received
  - Validate OTP (10-min expiry)
  ↓
[Enter device details]
  - Device type (laptop/mobile)
  - Brand, model
  - Invoice value
  - Date of purchase
  - Optional: Apply referral code
  ↓
[Device age validation]
  - If device > 1 year: Show error "Device too old"
  - If device ≤ 1 year: Continue
  ↓
[Select BBG plan]
  - Within 6 months: Claim-based (show slabs)
  - 7-36 months: Auction + repair
  ↓
[Payment via PayU]
  - Server calculates final price
  - Apply referral discount if applicable
  - Customer completes payment
  ↓
[Success]
  - Generate voucher code
  - Store in customers table
  - Send confirmation email with:
    * Voucher code
    * BBG coverage details
    * Claim value slabs
  - Store registration slab data (JSON snapshot)
  ↓
[Thank you page]
  - Display voucher code
  - Show claim process instructions
  - Option to download PDF
  ↓
END
```

**Key Validations**:
- Phone number: 10 digits, Indian format
- Email: Valid email format
- Pincode: 6 digits
- Invoice value: > 0
- Date of purchase: Cannot be in future
- Device age: ≤ 1 year for regular BBG

**Business Rules**:
- Voucher code format: Random 10-char alphanumeric
- Storage location: `customers` table
- Email sent via SMTP using template
- Slab data captured at registration time (immutable)

---

#### Workflow 2: Acer BBG Registration

```
START
  ↓
[Enter customer details]
  - Name, contact, email, pincode
  - Send OTP
  ↓
[Verify OTP]
  ↓
[Enter Acer device details]
  - REQUIRED: Serial number (IMEI)
  - Brand (auto-filled: Acer)
  - Model
  - Invoice value
  - Purchase date
  ↓
[IMEI validation against Acer database]
  - Check acer_imei_validation table
  - If not found: Allow registration
  - If found & already registered: Show error
  ↓
[Skip device age validation]
  - Acer BBG allows any device age
  ↓
[Select Acer BBG plan]
  - Within 6 months: Acer 80% claim slabs
  - 7-36 months: Acer 80% claim slabs
  ↓
[Payment]
  - PayU payment processing
  ↓
[Success]
  - Generate voucher code
  - Mark registrationSource: 'acer_bbg'
  - Store Acer-specific slabs
  - Send Acer confirmation email
  - Record in transaction_history
  ↓
[Thank you page - Acer variant]
  - Show Acer-specific messaging
  - Display 80% claim rates
  ↓
END
```

**Key Differences from Regular BBG**:
- IMEI validation required
- No device age limit
- Higher claim percentages (80% vs 70%)
- Dedicated email templates
- Exempted from waiting period

---

#### Workflow 3: Claim Filing

```
START
  ↓
[Customer login]
  - Enter email and get OTP
  - Verify OTP
  ↓
[View registered BBGs]
  - Fetch from customers table
  - Display active BBGs only
  ↓
[Select BBG to claim]
  - Choose from list
  - View plan details
  ↓
[Check claim eligibility]
  - Device age ≤ max threshold?
  - Within waiting period?
    * If regular: 3 months required
    * If Acer: Exempt from waiting period
  - If ineligible: Show error with countdown
  - If eligible: Continue
  ↓
[Enter claim details]
  - Device serial number (pre-filled)
  - Pickup date (date picker)
  - Pickup time slot
  - Address
  ↓
[Calculate claim amount]
  - Get registered slab data
  - Calculate device age at claim time
  - Find applicable percentage
  - claimAmount = invoiceValue × (percentage/100)
  ↓
[Submit claim]
  - Store in claims table with status='pending'
  - Record in transaction_history
  ↓
[Confirmation]
  - Display claim ID
  - Show expected timeline
  - Provide claim tracking link
  ↓
[Admin notification]
  - Admin gets claim alert
  - Email: claim_status_update template
  ↓
END
```

**Key Validations**:
- Claim only for active registrations
- Device age check
- Waiting period check (except Acer)
- Required fields validation

**Claim Calculation Logic**:
```
deviceAgeMonths = Math.floor(daysFromPurchase / 30.44)
claimPercentage = registrationSlabData[age_bracket]
claimAmount = invoiceValue × (claimPercentage / 100)
```

---

### B. DISTRIBUTOR WORKFLOWS

#### Workflow 1: Distributor Registration & Onboarding

```
START
  ↓
[Simplified 3-field registration]
  - Name
  - Contact (phone)
  - Email
  - 3 business declarations (checkboxes)
  ↓
[Send OTP]
  - SMS to phone number
  ↓
[Verify OTP]
  ↓
[Generate seller code]
  - Format: 2-letter initials + last 3 mobile digits
  - Example: "TU426" for Test User, mobile ending in 426
  - Ensure unique in database
  ↓
[Send welcome email]
  - To: distributorEmail
  - Template: 'referral_partner_welcome'
  - Include: Seller code, next steps
  ↓
[Success]
  - Store in distributors table (marked active)
  - Create initial entry for commissions
  - Record in transaction_history
  ↓
[Redirect to login]
  - Distributor can now login
  - View dashboard
  ↓
END
```

**Seller Code Generation Logic**:
```typescript
const initials = name.split(' ')
  .map(word => word[0].toUpperCase())
  .join('')
  .slice(0, 2);
const lastThreeDigits = contact.slice(-3);
const sellerCode = initials + lastThreeDigits;
```

---

#### Workflow 2: Distributor Dashboard

```
START (authenticated)
  ↓
[View seller code]
  - Display personalized seller code
  - Show how to share with customers
  ↓
[Customer list]
  - Show all customers registered with this code
  - Display device type, status
  - Search and filter options
  ↓
[Commission tracking]
  - Total commissions earned
  - Commission per customer
  - Payment status (pending/paid)
  ↓
[Export commission history]
  - Generate CSV file
  - Include: Customer, amount, status, date
  ↓
[Update profile]
  - Edit contact information
  - Update bank details
  - Upload documents (if needed)
  ↓
[Logout]
  - Clear session
  - Redirect to login
  ↓
END
```

---

### C. ADMIN WORKFLOWS

#### Workflow 1: BBG Price Configuration

```
START (admin authenticated)
  ↓
[Navigate to /admin/bbg-settings]
  ↓
[View current prices]
  - Laptop BBG: ₹299
  - Mobile BBG: ₹99
  ↓
[Edit prices]
  - Input new price for laptop
  - Input new price for mobile
  ↓
[Save]
  - Update bbg_price_settings table
  - Update 'updatedAt' timestamp
  - Record change in transaction_history
  ↓
[Confirm]
  - Show success message
  - Prices effective immediately
  - Reflects on homepage and registration forms
  ↓
END
```

---

#### Workflow 2: Claim Value Slab Management

```
START (admin authenticated)
  ↓
[Navigate to /admin/claim-value-slabs]
  ↓
[View existing slabs]
  - Filter by device type (laptop/mobile)
  - Filter by registration source (regular/acer)
  - Display: min months, max months, %
  ↓
[Create new slab]
  - Device type selection
  - Brand (optional for mobile, required for laptop)
  - Min months, max months
  - Percentage (0-100)
  - Registration source
  ↓
[Validation]
  - Check min < max
  - Check percentage in range
  - No overlapping ranges
  ↓
[Save]
  - Insert into claim_value_slabs
  - Mark isActive=true
  ↓
[Edit existing]
  - Update values
  - Cannot change past registrations (protected by registrationSlabData)
  ↓
[Delete]
  - Soft delete (mark isActive=false)
  ↓
END
```

**Business Rule**: When customer registers, the complete slab structure is stored in `registrationSlabData` (JSON). Future slab changes don't affect existing registrations.

---

#### Workflow 3: Plan Configuration Management

```
START (admin authenticated)
  ↓
[Navigate to /admin/plan-configurations]
  ↓
[View default plans]
  - "Within 6 Months" (max 6 months)
  - "Over 6 Months" (max 36 months)
  ↓
[Create/edit plan]
  - Label: "Within 6 Months"
  - Max months: 6
  - Template identifier: "within_6_months"
  - Description: Benefits description
  ↓
[Save]
  - Insert/update plan_configurations
  - Immediately affects communication logic
  ↓
[Delete plan]
  - Cannot delete active plans with registrations
  - Soft delete via isActive flag
  ↓
END
```

---

#### Workflow 4: Commission Settings

```
START (admin authenticated)
  ↓
[Navigate to /admin/partner-commission-settings]
  ↓
[View current settings]
  - Commission type (flat/percentage)
  - Commission value
  - Device-specific (optional)
  ↓
[Edit]
  - Select type: Flat amount or Percentage
  - Enter value
  - Optional: Device-specific rules
  ↓
[Examples]
  - Flat: ₹25 per registration
  - Percentage: 5% of invoice value
  - Device-specific: ₹50 (laptop) vs ₹15 (mobile)
  ↓
[Save]
  - Update partner_commission_settings
  - Effective for future registrations
  ↓
[Calculate commissions]
  - Backend calculates on customer registration
  - Amount = invoiceValue × (percentage/100) OR flatAmount
  - Stored in commission_payouts
  ↓
END
```

---

#### Workflow 5: Message Template Management

```
START (admin authenticated)
  ↓
[Navigate to /admin/templates]
  ↓
[View templates]
  - Filter by event type
  - Filter by channel (email/SMS/WhatsApp)
  - Filter by device type
  ↓
[Create/edit template]
  - Name: e.g., "BBG Purchase - Within 6 Months"
  - Event type: "bbg_purchase_within_6_months"
  - Channel: "email"
  - Device type: "mobile" (optional)
  - Subject: Email subject
  - Body: Template content with {{variables}}
  ↓
[Available variables]
  - {{customerName}}
  - {{voucherCode}}
  - {{deviceBrand}}
  - {{deviceModel}}
  - {{maxClaimPercentage}}
  - {{claimValueSlabsHtml}}
  - {{sellerCode}}
  - {{planLabel}}
  ↓
[Live preview]
  - System shows template with sample values
  - Shows which variables are missing
  ↓
[Save]
  - Insert/update message_templates
  ↓
[Test send]
  - Send test email/SMS to admin
  - Verify rendering
  ↓
END
```

---

#### Workflow 6: Admin User Management

```
START (super admin authenticated)
  ↓
[Navigate to /admin/admin-users]
  ↓
[Create new admin user]
  - Username (unique)
  - Email (unique)
  - Password (auto-generated, shown once)
  - Select role from user_roles
  ↓
[Role assignment]
  - Super Admin: All permissions
  - Admin: Most permissions except user management
  - Moderator: Limited permissions
  - Viewer: Read-only access
  ↓
[Permissions model]
  - Each role has JSON list of permissions
  - Examples: "manage_users", "manage_pricing", "view_reports"
  ↓
[Save]
  - Insert into admin_users
  - Generate bcrypt password hash
  ↓
[Edit existing user]
  - Change role
  - Reset password
  - Activate/deactivate
  ↓
[Delete user]
  - Soft delete (mark isActive=false)
  - User cannot login anymore
  ↓
END
```

---

## 7. END-TO-END PROCESS FLOWS

### A. COMPLETE CUSTOMER REGISTRATION FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER INITIATES REGISTRATION                          │
│    User opens /customer-registration                        │
│    Sees form: Name, Contact, Email, Pincode                │
│    Selects "Proceeding Registration"                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. OTP REQUEST                                              │
│    Frontend sends: POST /api/send-otp                       │
│    Payload: { contact, email }                             │
│    Backend:                                                 │
│    ├── Generate 6-digit OTP                                │
│    ├── Insert into otp_verifications                       │
│    ├── Send SMS via Kaleyra                                │
│    └── Send Email via SMTP                                 │
│    Response: { success: true }                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. OTP VERIFICATION                                         │
│    User enters OTP from SMS/email                          │
│    Frontend sends: POST /api/verify-otp                    │
│    Payload: { contact, otp }                               │
│    Backend:                                                 │
│    ├── Find OTP record in database                         │
│    ├── Check expiry (10 minutes)                           │
│    ├── Validate OTP matches                                │
│    ├── Mark as verified                                    │
│    └── Continue to device details                          │
│    Response: { success: true }                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DEVICE DETAILS COLLECTION                                │
│    User fills device information:                          │
│    ├── Device type: laptop/mobile                          │
│    ├── Brand (dropdown from brands table)                  │
│    ├── Model (dropdown from device_models)                 │
│    ├── Serial number (optional for regular)               │
│    ├── Invoice value                                       │
│    ├── Date of purchase                                    │
│    └── Optional: Referral code                             │
│    Frontend validates with Zod schema                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. DEVICE AGE & PLAN SELECTION                              │
│    Backend calculates: deviceAge = (now - purchaseDate)     │
│    Queries plan_configurations table                       │
│    ├── If deviceAge <= 6 months:                           │
│    │   Plan = "Within 6 Months"                            │
│    │   Benefit = Claim-based coverage                      │
│    │   Show claim value slabs                              │
│    └── Else if deviceAge <= 36 months:                     │
│        Plan = "Over 6 Months"                              │
│        Benefit = Auction + repair                          │
│        max claim % = 80%                                   │
│    ├── Else:                                               │
│        Error: Device too old (> 3 years)                   │
│        Cannot register                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PRICING CALCULATION (Server-side Security)               │
│    Backend calculates final price:                         │
│    1. Get BBG price from bbg_price_settings                │
│       basePrice = laptop: ₹299 | mobile: ₹99               │
│    2. Check for referral discount                          │
│       IF sellerCode provided:                              │
│       ├── Fetch referral_discount_settings                 │
│       ├── Apply discount (% or flat)                       │
│       └── Store commission for distributor                 │
│    3. Calculate commission payout                          │
│       commission = invoiceValue × (% / 100) OR flatAmount  │
│       Insert into commission_payouts (status='pending')    │
│    4. Final price = basePrice - discount                   │
│    Response: { amount, details }                           │
│    Security: Client price NEVER trusted                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. PAYU PAYMENT INITIATION                                  │
│    Frontend sends: POST /api/create-payu-payment            │
│    Backend:                                                 │
│    ├── Re-validate all data                                │
│    ├── Re-calculate price server-side                      │
│    ├── Generate txnid (unique transaction ID)              │
│    ├── Create PayU payment request:                         │
│    │   key = merchantId                                    │
│    │   txnid = generated ID                                │
│    │   amount = calculated price                           │
│    │   productinfo = "BBG-{deviceType}"                    │
│    │   firstname = customerName                            │
│    │   email = customerEmail                               │
│    │   phone = customerPhone                               │
│    │   surl = PayU success callback URL                    │
│    │   furl = PayU failure callback URL                    │
│    │   hash = SHA512(salt|txnid|amount|info|email|...)     │
│    ├── Store pending payment in pending_payments table     │
│    │   status = 'pending'                                  │
│    │   expiresAt = now + 30 minutes                        │
│    └── Return PayU form HTML to frontend                   │
│    Response: { form_html, txnid, amount }                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. PAYU PAYMENT GATEWAY (External)                          │
│    User redirected to PayU gateway                         │
│    ├── Enter payment details (card/UPI/etc)               │
│    ├── PayU processes payment                              │
│    │   ├── If successful: Generates hash                   │
│    │   └── If failed: Generates failure response           │
│    └── PayU redirects to backend callback URL              │
│    (Outside our control - user sees PayU interface)        │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    ┌─────────────────────────┐
                    │ Payment Success/Failure?│
                    └─────────────────────────┘
                           ↙          ↘
              ┌──────────────┐      ┌──────────────┐
              │   SUCCESS    │      │   FAILURE    │
              └──────────────┘      └──────────────┘
                       ↓                     ↓
        ┌─────────────────────┐  ┌──────────────────┐
        │ 9A. SUCCESS PATH    │  │ 9B. FAILURE PATH │
        └─────────────────────┘  └──────────────────┘
                ↓
    POST /api/payu/success
    Payload: {
      txnid, status='success',
      amount, email, phone,
      ...other PayU fields,
      hash (verified)
    }
    Backend:
    ├── Verify hash signature
    │   if (hash !== calculated_hash)
    │     REJECT - Payment fraud attempt
    ├── Check payment not already processed
    │   if (exists in customers with same txnid)
    │     REJECT - Duplicate payment
    ├── Validate amount matches
    ├── Mark pending_payment as 'completed'
    ├── GENERATE VOUCHER CODE
    │   format: generateRandomCode(10)
    │   ensure unique in database
    ├── CREATE CUSTOMER RECORD
    │   Insert into customers table:
    │   ├── name, contact, email, pincode
    │   ├── deviceType, brand, model
    │   ├── serialNumber, invoiceValue
    │   ├── dateOfPurchase
    │   ├── voucherCode (generated)
    │   ├── sellerCode (if referral)
    │   ├── purchaseTimingCategory (based on plan)
    │   ├── benefitType ('claim_slabs' or 'auction_repair')
    │   ├── planPrice (final amount paid)
    │   ├── registrationSlabData (JSON snapshot of current slabs)
    │   ├── registrationSource ('regular', 'acer_bbg', etc.)
    │   └── isVerified = true
    │
    ├── STORE SLAB SNAPSHOT
    │   Fetch claim_value_slabs matching:
    │   ├── deviceType
    │   ├── brand (if laptop)
    │   └── registrationSource
    │   Store as JSON in registrationSlabData
    │   Purpose: Preserve rates from registration time
    │
    ├── CALCULATE COMMISSION
    │   IF sellerCode exists:
    │   ├── Fetch partner_commission_settings
    │   ├── Calculate: 
    │   │   if commissionType = 'flat':
    │   │     commission = commissionValue
    │   │   else if commissionType = 'percentage':
    │   │     commission = invoiceValue × (commissionValue/100)
    │   ├── Insert into commission_payouts:
    │   │   distributorId, customerId, amount,
    │   │   status='pending'
    │   └── Record in transaction_history
    │
    ├── SEND CONFIRMATION EMAIL
    │   call communicationService.sendCustomerRegistrationEmail()
    │   Logic:
    │   ├── Calculate deviceAgeInMonths
    │   ├── Fetch plan_configurations
    │   ├── Select template based on:
    │   │   registrationSource + deviceAgeCategory
    │   ├── Render template with variables:
    │   │   {{customerName}}, {{voucherCode}},
    │   │   {{deviceBrand}}, {{maxClaimPercentage}},
    │   │   {{claimValueSlabsHtml}} (formatted table)
    │   ├── Send via SMTP using stored credentials
    │   └── Log send status
    │
    ├── SEND SMS NOTIFICATION
    │   if contact provided:
    │   ├── Create SMS message with voucher code
    │   ├── Send via Kaleyra API
    │   └── Log delivery
    │
    ├── RECORD IN TRANSACTION_HISTORY
    │   Log: {
    │     eventType: 'customer_registered',
    │     entityType: 'customer',
    │     entityId: customer.id,
    │     description: 'Customer registered via BBG',
    │     metadata: {
    │       registrationSource,
    │       deviceType,
    │       amount,
    │       sellerCode
    │     }
    │   }
    │
    ├── REDIRECT TO THANK YOU PAGE
    │   /registration-thank-you?voucher={voucherCode}
    │   Frontend displays:
    │   ├── Success message
    │   ├── Voucher code (prominent)
    │   ├── BBG details and coverage
    │   ├── How to file claim
    │   ├── Download BBG certificate
    │   └── Share referral code option
    │
    └── RESPONSE: { success: true, voucherCode }
                               ↓
                    Thank You Page Displayed
                    Registration COMPLETE ✓

                              FAILURE PATH:
                     POST /api/payu/failure
                     Payload: { txnid, status='failure', ... }
                     Backend:
                     ├── Verify signature
                     ├── Mark pending_payment as 'abandoned'
                     ├── Store in transaction_history
                     └── Return failure page
                     Frontend:
                     ├── Display error message
                     ├── Show retry option
                     ├── Save partial data for recovery
                     └── Enable "Try another payment method"
```

---

### B. PAYMENT CALCULATION FLOW (Security-Critical)

```
CLIENT INITIATES:
User clicks "Proceed to Payment"
Sends data including prices from form

BACKEND RECEIVES:
POST /api/create-payu-payment
{
  customerData: {...},
  proposedAmount: 299  // CLIENT SUGGESTED - NOT TRUSTED
}

BACKEND SECURITY STEPS:
┌─────────────────────────────────────────────────┐
│ STEP 1: VALIDATION                              │
│ ├── Re-validate all customer data              │
│ │   (phone, email, pincode, device details)    │
│ ├── Check against Zod schema                   │
│ ├── Ensure device age is valid                 │
│ └── Verify device type exists in database      │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: PRICING CALCULATION (Fresh)             │
│ ├── FETCH current BBG_PRICE_SETTINGS            │
│ │   SELECT laptopPrice, mobilePrice             │
│ │   FROM bbg_price_settings                     │
│ │   WHERE isActive = 1                          │
│ ├── basePrice = (deviceType='laptop' ?          │
│ │               laptopPrice : mobilePrice)      │
│ │                                               │
│ │   Example: basePrice = ₹299 for laptop        │
│ └── basePrice is NEVER what client sent        │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: DISCOUNT CALCULATION                    │
│ ├── IF sellerCode provided:                    │
│ │   ├── FETCH REFERRAL_DISCOUNT_SETTINGS       │
│ │   │   SELECT discountType, discountValue      │
│ │   │   WHERE isActive = 1                      │
│ │   ├── IF discountType = 'percentage':         │
│ │   │   discountAmount = basePrice × (value/100)│
│ │   ├── ELSE (flat):                            │
│ │   │   discountAmount = discountValue          │
│ │   └── Example: 10% of ₹299 = ₹30              │
│ └── ELSE:                                       │
│     discountAmount = 0                          │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ STEP 4: FINAL AMOUNT CALCULATION                │
│ ├── finalAmount = basePrice - discountAmount   │
│ ├── Ensure finalAmount > 0                      │
│ ├── Example: ₹299 - ₹30 = ₹269                  │
│ └── Compare with client suggestion:            │
│     if (clientProposed != calculated) {        │
│       Log warning: "Price mismatch detected"   │
│       // Still proceed with calculated price   │
│     }                                           │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ STEP 5: COMMISSION CALCULATION                  │
│ ├── IF sellerCode provided:                    │
│ │   ├── FETCH PARTNER_COMMISSION_SETTINGS      │
│ │   │   SELECT commissionType, commissionValue │
│ │   │   WHERE isActive = 1                      │
│ │   │   AND (deviceType IS NULL OR             │
│ │   │        deviceType = current_deviceType)   │
│ │   ├── IF commissionType = 'flat':             │
│ │   │   commission = commissionValue            │
│ │   │   Example: ₹25                            │
│ │   ├── ELSE IF commissionType = 'percentage':  │
│ │   │   commission = invoiceValue ×             │
│ │   │               (commissionValue / 100)     │
│ │   │   Example: ₹50,000 × (5% / 100) = ₹2,500 │
│ │   └── RECORD in commission_payouts:          │
│ │       INSERT WITH status='pending'            │
│ └── ELSE: commission = 0                       │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ STEP 6: PAYMENT REQUEST TO PAYU                 │
│ ├── Generate unique txnid                       │
│ ├── Create hash (security):                     │
│ │   hash = SHA512(                              │
│ │     salt|txnid|finalAmount|productinfo|      │
│ │     firstname|email|...                       │
│ │   )                                           │
│ ├── Send to PayU with CALCULATED amount         │
│ │   NOT client-suggested amount                 │
│ ├── Example PayU request:                       │
│ │   {                                           │
│ │     txnid: "ABC123XYZ",                       │
│ │     amount: 269.00,  // CALCULATED            │
│ │     productinfo: "BBG-laptop",                │
│ │     email: "customer@email.com",              │
│ │     phone: "9876543210",                      │
│ │     hash: "..."                               │
│ │   }                                           │
│ └── Store pending_payment record                │
└─────────────────────────────────────────────────┘
                       ↓
         CUSTOMER SENT TO PAYU GATEWAY
              (They pay ₹269)
         ↓ (PayU processes payment)
      PAYU REDIRECTS BACK
              ↓
┌─────────────────────────────────────────────────┐
│ STEP 7: PAYMENT CALLBACK VERIFICATION           │
│ ├── IF success callback received:               │
│ │   ├── Verify hash in callback:                │
│ │   │   if (hash != calculated_hash) {         │
│ │   │     FRAUD - Reject immediately            │
│ │   │     return { error: "Invalid hash" }     │
│ │   │   }                                       │
│ │   ├── Verify amount matches:                  │
│ │   │   if (callback.amount != ₹269) {         │
│ │   │     REJECT - Amount mismatch              │
│ │   │   }                                       │
│ │   ├── Check transaction not already processed │
│ │   │   if (txnid exists in customers) {       │
│ │   │     REJECT - Duplicate payment            │
│ │   │   }                                       │
│ │   ├── Mark pending_payment as completed      │
│ │   ├── Create customer record                 │
│ │   └── Proceed to success path                │
│ └── ELSE (failure):                             │
│     Mark pending_payment as abandoned           │
└─────────────────────────────────────────────────┘

SUMMARY OF SECURITY MEASURES:
✓ Client price NEVER trusted
✓ All prices recalculated server-side from settings
✓ Hash signature verification prevents tampering
✓ Amount validation before processing
✓ Duplicate payment detection
✓ Transaction audit trail
```

---

## 8. API ENDPOINTS REFERENCE

### A. AUTHENTICATION ENDPOINTS

```
POST /api/send-otp
├─ Purpose: Send OTP to customer phone/email
├─ Body: { contact, email }
├─ Response: { success: true, message: "OTP sent" }
└─ Error: Invalid phone/email format

POST /api/verify-otp
├─ Purpose: Verify OTP entered by user
├─ Body: { contact, otp }
├─ Response: { success: true, verified: true }
└─ Error: Invalid/expired OTP

POST /api/customer/login
├─ Purpose: Customer login with email/OTP
├─ Body: { email, otp }
├─ Response: { success: true, customer: {...} }
└─ Error: Invalid credentials

POST /api/distributor/login
├─ Purpose: Distributor login
├─ Body: { contact, otp }
├─ Response: { success: true, sessionToken: "...", distributor: {...} }
└─ Error: Invalid credentials
```

### B. CUSTOMER REGISTRATION ENDPOINTS

```
POST /api/customers/register
├─ Purpose: Register new customer
├─ Auth: None (public)
├─ Body: {
│   name, contact, email, pincode,
│   deviceType, brand, modelName,
│   serialNumber, invoiceValue, dateOfPurchase,
│   sellerCode (optional)
│ }
├─ Response: { voucherCode, customerId }
└─ Side Effects:
    ├─ Creates customer record
    ├─ Generates voucher code
    ├─ Calculates commission
    ├─ Sends confirmation email
    └─ Records transaction

POST /api/create-payu-payment
├─ Purpose: Initialize PayU payment
├─ Auth: None
├─ Body: { customerData, amount }
├─ Response: { txnid, amount, payuFormHtml }
└─ Security: Recalculates price server-side

POST /api/payu/success
├─ Purpose: PayU success callback
├─ Auth: None (PayU sends)
├─ Body: PayU response with hash
├─ Response: { success: true, voucherCode }
├─ Side Effects:
│  ├─ Verifies payment
│  ├─ Creates customer
│  ├─ Sends emails
│  └─ Records transaction
└─ Security: Hash verification

POST /api/payu/failure
├─ Purpose: PayU failure callback
├─ Auth: None
├─ Response: { success: false, message }
└─ Side Effects: Mark pending_payment as abandoned
```

### C. CLAIM ENDPOINTS

```
POST /api/verify-voucher
├─ Purpose: Verify voucher before filing claim
├─ Body: { voucherCode }
├─ Response: { valid: true, customer: {...} }
└─ Error: Invalid voucher code

POST /api/claims/check
├─ Purpose: Check claim eligibility
├─ Body: { voucherCode }
├─ Response: {
│   eligible: true/false,
│   reason: "Waiting period not met",
│   registrationDate: "...",
│   eligibleDate: "..."
│ }
└─ Rules:
    ├─ 3-month waiting period (except Acer)
    ├─ Device age must be within max
    └─ Can only claim once

POST /api/claims/file
├─ Purpose: File a new claim
├─ Body: {
│   voucherCode, contact, email, serialNumber,
│   address, pickupDate, pickupTimeSlot
│ }
├─ Response: { claimId, status: 'pending' }
└─ Side Effects:
    ├─ Creates claim record
    ├─ Calculates claim amount
    ├─ Sends notification email
    └─ Records transaction

GET /api/claims/:customerId
├─ Purpose: Get all claims for customer
├─ Auth: Customer
├─ Response: [{ claimId, status, amount, ... }]
└─ Filter: By customer ID
```

### D. BBG PRICING ENDPOINTS

```
GET /api/bbg-prices
├─ Purpose: Get current BBG prices
├─ Auth: None (public)
├─ Response: {
│   laptop: 299,
│   mobile: 99,
│   discountApplied: false
│ }
└─ Cache: Heavy caching at frontend

GET /api/claim-value-slabs/active/:deviceType/:registrationSource
├─ Purpose: Get claim slabs for specific device
├─ Auth: None
├─ Params: deviceType (laptop/mobile), registrationSource (regular/acer_bbg)
├─ Response: [{ minMonths, maxMonths, percentage, ... }]
└─ Filter: By deviceType and registrationSource

POST /api/admin/bbg-settings (Admin)
├─ Purpose: Update BBG prices
├─ Auth: Admin required
├─ Body: { laptopPrice, mobilePrice }
├─ Response: { message: "Updated", settings: {...} }
└─ Side Effects:
    ├─ Updates database
    ├─ Clears frontend cache
    └─ Affects all future registrations
```

### E. ADMIN MANAGEMENT ENDPOINTS

```
GET /api/admin/claim-value-slabs
├─ Purpose: Get all claim slabs
├─ Auth: Admin required
├─ Query: ?deviceType=laptop&registrationSource=regular
└─ Response: [{ id, deviceType, brand, minMonths, maxMonths, percentage }]

POST /api/admin/claim-value-slabs
├─ Purpose: Create claim slab
├─ Auth: Admin required
├─ Body: { deviceType, brand, minMonths, maxMonths, percentage, registrationSource }
└─ Response: { id, createdSlab }

PUT /api/admin/claim-value-slabs/:id
├─ Purpose: Update claim slab
├─ Auth: Admin required
├─ Body: { minMonths, maxMonths, percentage }
└─ Side Effects: Only affects future registrations

DELETE /api/admin/claim-value-slabs/:id
├─ Purpose: Delete claim slab
├─ Auth: Admin required
└─ Side Effects: Soft delete (isActive = false)

GET /api/admin/plan-configurations
├─ Purpose: Get all plan configs
├─ Auth: Admin
└─ Response: [{ id, label, maxMonths, templateIdentifier }]

POST /api/admin/plan-configurations
├─ Purpose: Create plan
├─ Auth: Admin
├─ Body: { label, maxMonths, templateIdentifier, description }
└─ Response: { id, createdPlan }

GET /api/admin/bbg-prices
├─ Purpose: Get current prices
├─ Auth: Admin
└─ Response: { laptopPrice, mobilePrice }

GET /api/admin/message-templates
├─ Purpose: Get all templates
├─ Auth: Admin
├─ Query: ?eventType=customer_registration&type=email
└─ Response: [{ id, name, subject, body, variables }]

POST /api/admin/message-templates
├─ Purpose: Create template
├─ Auth: Admin
├─ Body: { name, eventType, templateType, deviceType, subject, body }
└─ Response: { id, createdTemplate }

GET /api/admin/customers
├─ Purpose: List all customers
├─ Auth: Admin
├─ Query: ?page=1&limit=50&registrationSource=regular
├─ Response: { data: [...], total, page }
└─ Filter: By registration source, device type, date range

GET /api/admin/distributors
├─ Purpose: List all distributors
├─ Auth: Admin
├─ Query: ?page=1&limit=50&isActive=true
├─ Response: { data: [...], total, page }
└─ Include: Commission summary, customer count

GET /api/admin/claims
├─ Purpose: List all claims
├─ Auth: Admin
├─ Query: ?status=pending&page=1
├─ Response: { data: [...], total, page }
└─ Filter: By status, date range, customer

PUT /api/admin/claims/:id
├─ Purpose: Update claim status
├─ Auth: Admin
├─ Body: { status: 'approved'|'rejected', notes: "..." }
├─ Response: { message: "Updated", claim }
└─ Side Effects: Send customer notification email

GET /api/admin/transaction-history
├─ Purpose: Get all transactions
├─ Auth: Admin
├─ Query: ?entityType=customer&eventType=customer_registered
├─ Response: [{ id, eventType, entityType, description, timestamp }]
└─ Use: Audit trail, compliance
```

### F. DISTRIBUTOR ENDPOINTS

```
POST /api/distributor/register
├─ Purpose: Register new distributor
├─ Auth: None (public)
├─ Body: {
│   name, contact, email, pincode,
│   businessDeclaration1, businessDeclaration2, businessDeclaration3
│ }
├─ Response: { message: "Welcome", sellerCode: "JS426" }
└─ Side Effects:
    ├─ Creates distributor record
    ├─ Generates seller code
    ├─ Sends welcome email
    └─ Records transaction

GET /api/distributor/dashboard
├─ Purpose: Get distributor stats
├─ Auth: Distributor (session token required)
├─ Response: {
│   sellerCode, customersCount, totalCommission,
│   pendingCommission, paidCommission
│ }
└─ Security: Seller code from session

GET /api/distributor/customers
├─ Purpose: Get customers referred by this distributor
├─ Auth: Distributor
├─ Response: [{ customerId, name, device, amount, commission }]
└─ Filter: By this distributor's sellerCode

GET /api/distributor/commissions
├─ Purpose: Get commission history
├─ Auth: Distributor
├─ Query: ?status=pending&page=1
├─ Response: [{ customerId, amount, status, paidAt }]
└─ Export: CSV support

POST /api/distributor/profile
├─ Purpose: Update distributor profile
├─ Auth: Distributor
├─ Body: { contact, email, bankAccount, ifsc, upiId }
├─ Response: { message: "Updated" }
└─ Side Effects: Update distributors table
```

### G. EXPORT ENDPOINTS

```
GET /api/admin/export/customers
├─ Purpose: Export all customers to CSV
├─ Auth: Admin
├─ Query: ?format=csv&registrationSource=regular
├─ Response: CSV file download
├─ Columns: ID, Name, Contact, Email, Device, Brand, Amount, SellerCode
└─ Include: All timestamps and status fields

GET /api/admin/export/distributors
├─ Purpose: Export all distributors to CSV
├─ Auth: Admin
├─ Response: CSV file download
├─ Columns: ID, Name, Email, Contact, SellerCode, CustomersCount, TotalCommission
└─ Format: Finance-ready

GET /api/admin/export/commissions
├─ Purpose: Export commission payouts to CSV
├─ Auth: Admin
├─ Response: CSV file download
├─ Columns: ID, Distributor, Customer, Amount, Status, PaidAt
└─ Use: Accounting reconciliation

GET /api/admin/export/claims
├─ Purpose: Export claims to CSV
├─ Auth: Admin
├─ Response: CSV file download
├─ Columns: ID, VoucherCode, Status, Amount, FiledDate, ResolvedDate
└─ Format: Compliance-ready
```

---

## 9. DATA LIFECYCLE MANAGEMENT

### A. CUSTOMER DATA LIFECYCLE

```
Stage 1: PROSPECT (Partial Registration)
├─ Data stored in: cart_abandonments (temporary)
├─ Fields: name, contact, email, deviceType, brand, amount
├─ Duration: Until payment or 30-min timeout
├─ Purpose: Cart recovery, user re-engagement
├─ Deletion: Auto-purge old records > 90 days

Stage 2: PENDING PAYMENT
├─ Data stored in: pending_payments
├─ Status: 'pending'
├─ Expiry: 30 minutes after creation
├─ Purpose: Track payment attempts, fraud detection
├─ Auto-clean: After 24 hours mark as 'abandoned'

Stage 3: ACTIVE CUSTOMER
├─ Data stored in: customers (primary)
├─ Status: isVerified = true
├─ Key fields: voucherCode, registrationSlabData
├─ Duration: Indefinite (active until claim or deletion)
├─ Purpose: BBG coverage, claim filing
├─ Backup: registrationSlabData preserves slab rates

Stage 4: CLAIMED
├─ Claim record: claims table
├─ Status: 'pending' → 'approved'/'rejected'
├─ Duration: Until claim resolution (30-90 days)
├─ Purpose: Claim tracking, payout processing

Stage 5: ARCHIVED
├─ Data stored in: customers (soft delete)
├─ Action: isActive = false or delete timestamp
├─ Retention: Minimum 7 years (tax compliance)
├─ Purpose: Historical records, compliance
├─ Access: Read-only, restricted to super admin

Example Timeline:
Day 1: User registers → customers table
Day 1-90: Claims can be filed using voucherCode
Day 90+: No new claims allowed (outside waiting period)
Day 365+: Can be archived if no pending claims
Year 7+: Safe to delete (if no compliance requirement)
```

---

### B. DISTRIBUTOR DATA LIFECYCLE

```
Stage 1: REGISTRATION
├─ Data stored in: distributors table
├─ Status: isActive = true
├─ Key field: sellerCode (unique, immutable)
├─ Duration: From registration until account deletion

Stage 2: ACTIVE DISTRIBUTOR
├─ Customers tracked in: customers.sellerCode (FK)
├─ Commissions tracked in: commission_payouts
├─ Session tokens in: distributor_sessions
├─ Dashboard access: Via login

Stage 3: COMMISSION ACCUMULATION
├─ For each customer registered with sellerCode:
│  ├─ Insert into commission_payouts (status='pending')
│  ├─ Amount calculated from settings
│  └─ Updated at: transaction_history
│
├─ Payout process:
│  ├─ Manual/automated payout creation
│  ├─ Status changes: pending → processing → paid
│  └─ Payment reference stored

Stage 4: INACTIVE DISTRIBUTOR
├─ Action: isActive = false
├─ Purpose: Soft delete, prevent new registrations
├─ Data retained: All historical records
├─ Access: None (login blocked)

Stage 5: ARCHIVAL
├─ Retention: Minimum 7 years for tax
├─ Deletion: After retention period expires
├─ Backup: Export to long-term storage

Timeline Example:
Day 1: Distributor registers → sellerCode "JS426"
Day 1-365: Customers registered via "JS426"
Day 1-365+: Commission payouts processed
Year 5+: Can mark as inactive
Year 7+: Safe to archive
Year 8+: Safe to delete
```

---

### C. CLAIM DATA LIFECYCLE

```
Stage 1: CLAIMED (Filed)
├─ Data stored in: claims table
├─ Status: 'pending'
├─ Created by: Customer via claim form
├─ Duration: Until admin action
├─ Tracking: claim_id unique identifier

Stage 2: UNDER REVIEW
├─ Status: 'pending' (no change yet)
├─ Admin checks:
│  ├─ Eligibility validation
│  ├─ Device age verification
│  ├─ Slab rate lookup
│  ├─ Claim amount calculation
│  └─ Documentation review

Stage 3: APPROVED or REJECTED
├─ Status: 'approved' OR 'rejected'
├─ Notes: Admin adds comments
├─ Notification: Email sent to customer
├─ Amount: Finalized for approved claims

Stage 4: PAYOUT PROCESSING
├─ For approved claims only:
│  ├─ Insert into commission_payouts
│  ├─ Amount = calculated claimAmount
│  ├─ Status: 'pending' → 'processing' → 'paid'
│  └─ Reference: Payment proof stored

Stage 5: ARCHIVED
├─ Retention: 7 years (compliance)
├─ Read-only access: Audit trail
├─ Deletion: After retention period

Timeline Example:
Day 1: Customer files claim
Day 1-7: Admin reviews
Day 7: Admin approves/rejects
Day 7-30: Payout processed (if approved)
Day 30+: Status finalized
Year 7+: Can be archived
```

---

### D. SLAB/PRICING DATA LIFECYCLE

```
Stage 1: INITIAL DATA
├─ Default claim value slabs created
├─ Default prices set: Laptop ₹299, Mobile ₹99
├─ Stored in: claim_value_slabs, bbg_price_settings

Stage 2: ADMIN UPDATES
├─ Admin modifies slabs/prices via dashboard
├─ Changes apply to NEW registrations only
├─ Old registrations protected by registrationSlabData

Stage 3: REGISTRATION SNAPSHOT
├─ When customer registers:
│  ├─ Current slabs fetched
│  ├─ Stored as JSON in registrationSlabData
│  ├─ This becomes IMMUTABLE for that customer
│  └─ Future slab changes don't affect them

Stage 4: CLAIM PROCESSING
├─ Claim uses registrationSlabData, not current rates
├─ Protects customer from rate decreases
├─ Ensures claim amount matches registration promises

Stage 5: ARCHIVAL
├─ Old slab records marked isActive = false
├─ Retained in database for historical reference
├─ Compliance: 7-year retention

Immutability Guarantee:
- Customer registers with 70% maximum claim
- Admin changes rate to 60% next day
- Customer's claim still uses 70% from registration
- This is stored in registrationSlabData
```

---

## 10. INTEGRATION DETAILS

### A. PayU Payment Gateway Integration

**Purpose**: Process BBG purchase payments

**Configuration**:
```env
PAYU_MERCHANT_ID=your_merchant_id
PAYU_MERCHANT_KEY=your_key
PAYU_SALT=your_salt
PAYU_CLIENT_ID=your_client_id
PAYU_CLIENT_SECRET=your_secret
PAYU_BASE_URL=https://test.payu.in (sandbox) or https://secure.payu.in (production)
```

**Payment Flow**:

1. **Payment Request Generation** (`POST /api/create-payu-payment`)
   ```typescript
   // Backend calculates
   basePrice = bbgPrice (₹299 or ₹99)
   discount = referralDiscount (if applicable)
   finalAmount = basePrice - discount
   
   // Create PayU form
   hash = SHA512(salt|txnid|finalAmount|productinfo|email|...merchant_key)
   
   // Send to PayU
   return PayU form HTML to frontend
   ```

2. **Payment Processing** (External at PayU)
   - Customer enters payment details
   - PayU validates and processes
   - Generates success/failure response

3. **Payment Callback** (`POST /api/payu/success` or `/api/payu/failure`)
   ```typescript
   // Verify hash
   receivedHash = payload.hash
   expectedHash = SHA512(salt|txnid|amount|productinfo|...)
   if (receivedHash != expectedHash) {
     // FRAUD DETECTED
     reject();
   }
   
   // Verify amount
   if (payload.amount != expectedAmount) {
     // AMOUNT MISMATCH
     reject();
   }
   
   // Process payment
   if (payload.status == 'success') {
     createCustomer();
     sendConfirmation();
   }
   ```

4. **Security Measures**:
   - ✓ Hash signature verification
   - ✓ Amount validation
   - ✓ Duplicate detection (txnid)
   - ✓ Server-side price recalculation
   - ✓ SSL/HTTPS enforced

**Error Handling**:
- Payment timeout: Mark as abandoned
- Network error: Retry with idempotency check
- Fraud detection: Log and reject immediately

---

### B. Email Service (SMTP/Nodemailer)

**Purpose**: Send all email notifications

**Configuration** (Database-stored):
```sql
SELECT * FROM smtp_settings
├─ smtpHost: smtp.gmail.com (or custom)
├─ smtpPort: 587 (TLS) or 465 (SSL)
├─ smtpUsername: sender@example.com
├─ smtpPassword: encrypted_password
├─ fromAddress: noreply@xtracover.com
└─ isActive: true/false
```

**Email Types**:

| Event | Template | Recipient | Variables |
|-------|----------|-----------|-----------|
| Customer Registration | bbg_purchase_within_6_months | customer | {{voucherCode}}, {{deviceBrand}}, {{claimValueSlabsHtml}} |
| Acer Registration | acer_registration_within_6_months | customer | {{voucherCode}}, {{maxClaimPercentage}} |
| Distributor Welcome | referral_partner_welcome | distributor | {{sellerCode}}, {{name}} |
| Claim Status Update | claim_status_update | customer | {{claimId}}, {{status}}, {{amount}} |
| Payout Notification | payout_notification | distributor | {{amount}}, {{status}}, {{date}} |

**HTML Table Generation** (for claim slabs):
```typescript
claimValueSlabsHtml = `
  <table>
    <thead>
      <tr><th>Device Age</th><th>Claim %</th></tr>
    </thead>
    <tbody>
      <tr><td>0-3 months</td><td>100%</td></tr>
      <tr><td>3-6 months</td><td>80%</td></tr>
      ...
    </tbody>
  </table>
`;
```

**Sending Logic**:
```typescript
1. Fetch SMTP settings from database
2. Create nodemailer transporter
3. Render template with variables
4. Send email
5. Log result in database
6. Error handling: Retry up to 3 times
```

---

### C. SMS Service (Kaleyra)

**Purpose**: Send OTP and notifications via SMS

**Configuration**:
```env
KALEYRA_API_KEY=your_api_key
KALEYRA_API_URL=https://api.kaleyra.io/v1
KALEYRA_ACCOUNT_SID=your_sid
```

**SMS Types**:
1. **OTP SMS**: `Your XtraCover OTP is: 123456`
2. **Confirmation**: `BBG Registered! Code: {{voucherCode}}`
3. **Claim Status**: `Your claim has been {{status}}`

**Failure Handling**:
- Retry: 3 automatic retries
- Fallback: Email notification if SMS fails
- Logging: All SMS attempts logged

---

### D. WhatsApp Business (Gupshup)

**Purpose**: Send notifications via WhatsApp

**Configuration**:
```env
GUPSHUP_API_KEY=your_api_key
GUPSHUP_PHONE_ID=your_phone_id
```

**Templates** (Pre-approved by WhatsApp):
- Welcome message with seller code
- Claim status updates
- Commission payout notifications

**Rate Limiting**: 
- 1000 messages/hour
- Queue management for bulk sends

---

### E. AWS S3 Integration

**Purpose**: Store uploaded files (invoices, certificates, proofs)

**Configuration**:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1 (or your region)
S3_BUCKET_NAME=bbg-assets
```

**Directory Structure**:
```
bbg-assets/
├── customers/
│   ├── {customerId}/
│   │   ├── invoice_{timestamp}.pdf
│   │   └── payment_proof_{timestamp}.png
├── distributors/
│   ├── {distributorId}/
│   │   ├── pan_copy.pdf
│   │   ├── gst_certificate.pdf
│   │   └── cancelled_cheque.png
└── acer/
    └── imei_validations/
        └── acer_imei_list.xlsx
```

**File Upload Flow**:
```typescript
1. Receive file from client (multipart/form-data)
2. Validate: type, size, format
3. Generate unique key: `customers/123/invoice_1699123456.pdf`
4. Upload to S3
5. Generate signed URL (24-hour expiry)
6. Store URL in database
7. Return signed URL to client
```

**Security**:
- ✓ Signed URLs (time-limited)
- ✓ Private bucket (no public access)
- ✓ File type validation
- ✓ Virus scanning (optional)
- ✓ 5MB file size limit

---

## 11. ERROR HANDLING & VALIDATION

### A. Input Validation

**Customer Registration**:
```typescript
const customerSchema = z.object({
  name: z.string().min(2).max(100),
  contact: z.string()
    .regex(/^[0-9]{10}$/, "Must be 10-digit phone"),
  email: z.string().email(),
  pincode: z.string().regex(/^[0-9]{6}$/, "Must be 6-digit pincode"),
  deviceType: z.enum(['laptop', 'mobile']),
  brand: z.string().min(1),
  modelName: z.string().min(1),
  invoiceValue: z.number().positive().max(999999),
  dateOfPurchase: z.string().datetime(),
  serialNumber: z.string().optional(),
});
```

**Error Responses**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "contact": "Must be 10-digit phone number",
    "pincode": "Must be 6 digits"
  }
}
```

---

### B. Business Logic Validation

| Rule | Check | Action |
|------|-------|--------|
| Device age > 1 year | At registration | Show error, prevent registration |
| Device age > 36 months (non-Acer) | At claim filing | Show error, prevent claim |
| Waiting period (3 months) | At claim filing | Show countdown, prevent claim |
| Duplicate BBG | At registration | Allow multiple (per device) |
| Claim amount > invoice | In calculation | Cap at invoice value |
| Duplicate payment | At callback | Reject silently |
| Hash mismatch | At payment callback | Reject as fraud |

---

### C. Global Error Handler

```typescript
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.details
    });
  }
  
  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      message: 'Database error occurred'
    });
  }
  
  // Generic error
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred'
  });
});
```

---

## 12. SECURITY & COMPLIANCE

### A. Authentication & Authorization

**Admin Users**:
- Username + password (bcrypt hashed)
- Session-based authentication
- Role-based access control (RBAC)
- Permissions matrix in user_roles table

**Customers**:
- Phone-based OTP authentication
- 10-minute OTP expiry
- Email verification optional

**Distributors**:
- Phone-based OTP authentication
- Session tokens (24-hour expiry)
- Logged out on new login

### B. Data Protection

**Sensitive Fields**:
- Passwords: bcrypt hashing (10 rounds)
- Bank accounts: Encrypted at rest
- PAN/GSTIN: Encrypted field
- SMTP credentials: Encrypted in database

**HTTPS Enforcement**:
- All API calls over HTTPS
- PayU redirects forced HTTPS
- HSTS headers enabled

### C. Compliance

**Data Retention**:
- Active customers: Indefinite
- Archived customers: 7 years minimum
- Transactions: 7 years minimum
- SMTP/SMS logs: 90 days

**Privacy**:
- No personal data shared externally
- Customer emails private
- Seller codes unique to distributors
- Commission data confidential

**Financial**:
- All payment amounts logged
- Commission amounts auditable
- Transaction history permanent
- Bank transfer proof stored

---

## 13. LIMITATIONS & FUTURE IMPROVEMENTS

### A. Current Limitations

1. **Database**:
   - SQL Server only (no multi-DB support)
   - No read replicas (scalability limited)
   - No auto-backup automation

2. **Payment**:
   - PayU only (no alternative gateways)
   - No installment/subscription support
   - No refund automation

3. **Communications**:
   - No WhatsApp template pre-approval automation
   - SMS character limit issues
   - Email attachments not supported

4. **Reporting**:
   - Limited analytics (CSV exports only)
   - No real-time dashboards
   - No predictive analytics

5. **Scalability**:
   - Single-server architecture
   - No API rate limiting
   - No request queuing

6. **Integrations**:
   - No Shopify/WooCommerce integration
   - No CRM integration
   - No accounting system integration

---

### B. Recommended Improvements

**Phase 1: Stability** (Next 3 months)
- [ ] Add request rate limiting (100 req/min)
- [ ] Implement API key authentication for partners
- [ ] Add comprehensive error logging (Sentry)
- [ ] Database backup automation
- [ ] Load testing to 1000 concurrent users

**Phase 2: Features** (3-6 months)
- [ ] Subscription plans (auto-renew BBG)
- [ ] Multiple payment gateways (Razorpay, Stripe)
- [ ] Customer mobile app (iOS/Android)
- [ ] Distributor portal enhancements
- [ ] Real-time claim status tracking

**Phase 3: Scaling** (6-12 months)
- [ ] Multi-region deployment (AWS)
- [ ] Database read replicas
- [ ] CDN for static assets
- [ ] Message queue (RabbitMQ) for async tasks
- [ ] Search engine integration (Elasticsearch)

**Phase 4: Intelligence** (12+ months)
- [ ] AI-based claim fraud detection
- [ ] Predictive claim analytics
- [ ] Recommendation engine for upsells
- [ ] Automated customer segmentation
- [ ] Natural language support

---

## APPENDIX

### A. Database Statistics
- **Tables**: 20+
- **Columns**: 150+
- **Indexes**: 30+
- **Stored Procedures**: 0 (using raw SQL)
- **Triggers**: 0 (using application logic)

### B. File Structure
```
├── server/
│   ├── index.ts (10,309 lines - Main server)
│   ├── routes.ts (10,309 lines - API endpoints)
│   ├── sql-storage.ts (Storage layer)
│   ├── communication-service.ts (Email/SMS/WhatsApp)
│   ├── template-service.ts (Template management)
│   ├── plan-service.ts (Plan logic)
│   ├── s3-service.ts (File uploads)
│   ├── kaleyra-service.ts (SMS)
│   ├── gupshup-service.ts (WhatsApp)
│   └── config-service.ts (Settings)
├── client/
│   └── src/
│       ├── pages/ (45+ page components)
│       ├── components/ (50+ reusable components)
│       ├── hooks/ (Custom hooks)
│       ├── lib/ (Utilities)
│       └── App.tsx (Main routing)
├── shared/
│   └── schema.ts (Data types & Zod schemas)
└── public/
    └── assets/
```

### C. Key Metrics

| Metric | Value |
|--------|-------|
| Typical Payment Processing Time | 2-5 minutes |
| Email Delivery Success Rate | 99%+ (SMTP) |
| SMS Delivery Success Rate | 95%+ (Kaleyra) |
| Database Query Time (avg) | < 100ms |
| API Response Time (avg) | < 200ms |
| File Upload Limit | 5MB |
| Session Duration | 24 hours |
| OTP Validity | 10 minutes |
| Waiting Period | 3 months (regular) |
| Device Age Limit | 1 year (regular), unlimited (Acer) |
| Max Claim Percentage | 100% (first 3 months) |
| Commission Calculation | Flat/Percentage |
| Referral Discount | Configurable |

---

## FINAL NOTES

This document provides a comprehensive overview of the XtraCover BBG system as of November 22, 2025. The system is production-ready with:

✅ **Core Features**: Customer registration, BBG purchase, claim filing, distributor management
✅ **Security**: HTTPS, password hashing, payment verification, RBAC
✅ **Scalability**: Modular architecture, service-oriented design
✅ **Compliance**: Data retention, audit trails, transaction logging
✅ **Integrations**: PayU, Kaleyra, Gupshup, AWS S3

The system handles multiple registration channels (regular, Acer, Amazon) with specialized logic for each, ensuring flexibility while maintaining security and compliance.

For questions or updates, refer to the `replit.md` file for the latest project state and recent changes.

---

**Document Generated**: November 22, 2025  
**Reviewed By**: Project Architecture Team  
**Version**: 2.0 (Comprehensive)
