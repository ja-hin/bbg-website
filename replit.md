# XtraCover BBG Application

## Overview
This is a full-stack web application for XtraCover's BuyBack Guarantee (BBG) system. Its primary purpose is to enable distributors (referral partners) to register and earn commissions, customers to register their devices for BBG protection, and users to claim their buyback guarantees. The project streamlines the BBG process, offers a user-friendly experience with real-time feedback, and provides robust administrative tools for managing all aspects of the system.

## Recent Critical Updates
**Date: August 18, 2025**
- **✅ BULLETPROOF ACER BBG DETECTION SYSTEM**: Implemented comprehensive multi-layer detection system with absolute failsafe protection
- **✅ TRIPLE-REDUNDANCY PROTECTION**: Primary, secondary, and backup detection methods ensure Acer BBG customers are never subjected to waiting periods
- **✅ ENHANCED DEBUGGING CAPABILITIES**: Added comprehensive logging for detection methods, configuration tracking, and clear exemption confirmation messages
- **✅ ABSOLUTE FAILSAFE IMPLEMENTATION**: Final validation layer prevents any configuration changes from affecting Acer BBG waiting period exemptions
- **✅ ROBUST ERROR HANDLING**: System maintains proper behavior even during database errors or configuration failures
- **✅ TEXT CONTENT UPDATED**: Changed mobile BBG payout text from "Up to 70%" to "Up to 60%" as requested on homepage

**Date: August 17, 2025**
- **✅ COMPREHENSIVE FINANCE DATA EXPORT SYSTEM IMPLEMENTED**: Complete CSV export functionality for customers, referral partners, and commission payouts with finance-ready formatting
- **✅ CUSTOMER DATA EXPORT**: Full customer records with BBG voucher codes, purchase details, payment references, registration source tracking, and referral partner associations
- **✅ REFERRAL PARTNER EXPORT**: Complete distributor details with banking information, performance metrics, commission summaries, and customer breakdown by device type
- **✅ COMMISSION PAYOUT EXPORT**: Detailed payout records with status tracking, payment references, associated customer and partner information for financial reconciliation
- **✅ DATABASE SCHEMA CORRECTIONS**: Fixed all export endpoints to use correct table names (distributors vs referral_partners) and column names for proper data retrieval
- **✅ PROFESSIONAL CSV FORMATTING**: Finance-friendly column headers, proper data escaping, automatic filename generation with dates, and comprehensive audit trail fields
- **✅ ADMIN PANEL INTEGRATION**: One-click export buttons in admin dashboard with proper authentication and error handling
- **✅ 3-MONTH WAITING PERIOD IMPLEMENTED**: Regular BBG customers must wait 3 months from purchase date before filing claims (Acer BBG registrations exempt)
- **✅ BACKEND VALIDATION ADDED**: New business rule in /api/claims/check endpoint validates registration date vs current date
- **✅ FRONTEND ERROR HANDLING**: Enhanced claim form displays detailed waiting period information with countdown and registration details
- **✅ REGISTRATION SOURCE TRACKING**: System differentiates between 'regular' and 'acer_bbg' registrations for proper validation rules
- **✅ COMPREHENSIVE USER FEEDBACK**: Clear error messages show registration date, months waited, and exact eligibility date
- **✅ DYNAMIC BBG PRICING SYSTEM IMPLEMENTED**: Complete integration of admin-configurable BBG prices with database table structure
- **✅ ADMIN BBG SETTINGS PAGE**: Created table-format admin interface for managing laptop and mobile BBG pricing
- **✅ UNIFIED PRICE FETCHING**: All frontend pages (homepage, customer registration, thank-you pages) now use dynamic prices from /api/bbg-prices endpoint
- **✅ REAL-TIME PRICE UPDATES**: Changes made in admin dashboard immediately reflected across all customer-facing pages
- **✅ FALLBACK PRICING**: System maintains default prices (laptop: ₹299, mobile: ₹99) if database unavailable
- **✅ DEVICE AGE VALIDATION ADDED**: Devices older than 1 year from purchase date cannot buy regular BBG coverage (Acer BBG registrations exempt)
- **✅ DUAL VALIDATION SYSTEM**: Both frontend (Zod schema) and backend (API routes) validate device age with proper error messages
- **✅ ACER BBG EXEMPTION**: Acer registrations bypass age validation, allowing any device age with valid IMEI
- **✅ SHORTENED REFERRAL CODES**: Updated referral code generation to use 4-5 digit format with distributor initials + mobile digits
- **✅ DUAL STORAGE SYSTEM UPDATED**: Modified both storage.ts and sql-storage.ts to generate personalized codes (e.g., "JS123" for John Smith with mobile ending in 123)
- **✅ BACKWARDS COMPATIBILITY**: Maintains fallback to legacy format if distributor data unavailable
- **✅ PAYU SECURITY FIX**: Forced HTTPS redirect URLs to eliminate browser security warnings during payment flow

**Date: August 15, 2025**
- **✅ ADMIN MENU CUSTOMIZATION IMPLEMENTED**: Complete menu reordering system with drag-and-drop functionality
- **✅ DYNAMIC SIDEBAR INTEGRATION**: Admin sidebar now fetches menu order from backend API and updates in real-time
- **✅ MENU SETTINGS PAGE CREATED**: New admin page allows full customization of menu order with save/reset functionality
- **✅ BACKEND API ENDPOINTS**: Added `/api/admin/menu-order` GET/POST and `/api/admin/menu-order/reset` for menu management
- **✅ MASTERS AND BRANDS PRIORITIZED**: Menu now shows Masters and Brands at top of navigation as requested

**Date: August 13, 2025**
- **✅ EMAIL NOTIFICATION SYSTEM FIXED**: Acer BBG registration now sends email confirmations successfully to both ritwik123tiwary@gmail.com and jatin.singh@xtracover.com
- **✅ SMTP INTEGRATION RESTORED**: Fixed ES module compatibility and properly integrated database SMTP settings with AWS SES configuration
- **✅ COMMUNICATION SERVICE ENHANCED**: Resolved import issues and enabled email delivery using stored SMTP credentials from database

**Date: August 12, 2025**
- **✅ ACER BBG SLAB SYSTEM FULLY IMPLEMENTED**: Complete Acer BBG flow now uses dedicated 80% slabs instead of regular 70% Acer rates
- **✅ BACKEND API ENHANCED**: New `/api/claim-value-slabs/active/:deviceType/:registrationSource` endpoint serves Acer BBG-specific slabs
- **✅ REGISTRATION SOURCE TRACKING**: Acer BBG registrations properly marked with `registrationSource: 'acer_bbg'` for database integrity
- **✅ FRONTEND UPDATES COMPLETED**: Acer BBG registration and thank you pages show correct "Up to 80%" maximum claim rate
- **✅ COMPLETE SLAB PRESERVATION**: Acer BBG customers' `registrationSlabData` stores higher-rate slab structure from registration time
- **✅ CLAIM SYSTEM VERIFIED**: Claims process correctly uses preserved Acer BBG rates, protecting customers against future rate changes

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **UI/UX Decisions**: Focus on a streamlined, single-page customer registration flow with real-time validation, smart focus-based message display, and smooth animations. The design aims for a professional, consistent look across customer, partner, and admin interfaces, incorporating a dual-color theme with primary (#254696) and secondary (#E72829) colors. A dynamic theme system allows for real-time color customization.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM (for potential future use, currently raw SQL)
- **File Handling**: Multer for file uploads, integrated with AWS S3 for cloud storage with local fallback.
- **Admin Panel**: Secure session-based authentication with bcrypt hashing. Provides comprehensive management of referral partners, customers, claims, communication templates, and IMEI data. Features customizable menu ordering system with drag-and-drop interface for admin navigation management.

### Database Design
- **Primary Database**: Microsoft SQL Server.
- **Core Tables**: `referral_partners`, `customers`, `claims`, `otp_verifications`, `admin_users`, `message_templates`, `acer_imei_validation`, `claim_value_slabs`.
- **Key Technical Implementations**:
    - **Authentication**: OTP-based verification for customer and referral partner registration; session-based with secure password hashing for admin.
    - **Business Logic**: Dynamic commission calculation, device age-based claim eligibility, and BBG voucher code generation. Includes brand-specific claim value slab configurations.
    - **File Management**: Secure uploads (invoices, payment proofs) to AWS S3 with signed URLs. Supports image (JPEG, PNG) and PDF files up to 5MB.
    - **Data Validation**: Comprehensive Zod schemas for all data, including Indian phone numbers, pincodes, and bank details.
    - **Communication System**: Multi-channel notifications via Email (SMTP), SMS (Kaleyra), and WhatsApp (Gupshup). Features a Template Management System for admin CRUD operations with dynamic variables and live previews.
    - **Acer IMEI Validation**: System for uploading and validating Acer IMEI data to prevent duplicate device registrations.

### Deployment Strategy
- **Target Platform**: AWS Cloud Infrastructure
- **Architecture**: Auto-scaling EC2 instances with Application Load Balancer.
- **Database**: Continues using existing Microsoft SQL Server.
- **Storage**: Maintains AWS S3 integration.

## External Dependencies

- **Database**: Microsoft SQL Server
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS, Lucide Icons
- **Payment Gateway**: PayU
- **SMS Service**: Kaleyra.io SMS API
- **WhatsApp Business API**: Gupshup WhatsApp Business API
- **Cloud Storage**: AWS S3
- **Email Service**: Nodemailer
- **Utilities**: Multer, bcryptjs, Zod, XLSX