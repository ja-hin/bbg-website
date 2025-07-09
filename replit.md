# Xtracover BBG Application

## Overview

This is a full-stack web application for Xtracover's BuyBack Guarantee (BBG) system. The application allows distributors to register and earn commissions, customers to register their devices for BBG protection, and users to claim their buyback guarantees. Built with a modern tech stack including React, Express.js, TypeScript, and PostgreSQL.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **File Handling**: Multer for file uploads
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Database Design
- **distributors**: Stores distributor information, payment details, and seller codes
- **customers**: Stores customer registrations, device details, and BBG voucher codes
- **claims**: Tracks BBG claim requests and their status
- **otpVerifications**: Handles OTP-based verification system

## Key Components

### Authentication & Verification
- OTP-based verification system for customer registration
- No traditional user authentication - uses contact-based verification
- File upload verification for invoices and payment screenshots

### Business Logic
- Distributor commission system (₹25 per successful customer registration)
- Dynamic claim percentage calculation based on device age and type
- BBG voucher code generation and validation
- Device age-based claim eligibility

### File Management
- Local file storage in `uploads/` directory
- Support for images (JPEG, PNG) and PDF files
- 5MB file size limit with proper validation

### Data Validation
- Comprehensive Zod schemas for all data types
- Indian phone number validation (10 digits starting with 6-9)
- Indian pincode validation (6 digits)
- Bank details validation including IFSC codes

## Data Flow

### Distributor Registration Flow
1. Distributor fills registration form with business and banking details
2. System generates unique seller code
3. Distributor can share seller code with customers for commission tracking

### Customer Registration Flow
1. Customer initiates registration with device and personal details
2. OTP verification via contact number
3. File uploads for invoice and payment proof
4. System generates unique BBG voucher code
5. Optional seller code entry for distributor commission

### Claim Process Flow
1. Customer enters BBG voucher code and contact details
2. System validates voucher and calculates claim amount based on device age
3. Claim request submitted for approval
4. Status tracking through claim management system

## External Dependencies

### Database
- **Microsoft SQL Server**: Production database at 103.205.66.184:2499
- **Raw SQL Queries**: Direct SQL Server operations via mssql package
- **SqlServerStorage**: Custom storage layer with parameterized queries

### UI Components
- **shadcn/ui**: Complete component library based on Radix UI
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements

### Development Tools
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **Vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Port**: 5000 (configured in .replit)
- **Hot Reload**: Enabled through Vite middleware
- **Database**: Microsoft SQL Server connection

### Production Build
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Output**: Static files in `dist/public`, server bundle in `dist/`
- **Deployment Target**: Replit Autoscale

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **SQL Server**: Direct connection configured in server/db.ts
- **Replit Integration**: Cartographer plugin for development analytics

### File Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── lib/          # Utilities and query client
│   │   └── hooks/        # Custom React hooks
├── server/               # Express backend
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Database abstraction layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared TypeScript types and schemas
│   └── schema.ts         # Drizzle schema and Zod validation
└── uploads/              # File upload storage
```

## Changelog

```
Changelog:
- July 08, 2025: Moved all credentials to environment variables
  - Updated SQL Server configuration to use environment variables (SQL_SERVER_HOST, SQL_SERVER_PORT, SQL_SERVER_DATABASE, SQL_SERVER_USER, SQL_SERVER_PASSWORD)
  - Updated PayU configuration to use PAYU_BASE_URL from environment variables
  - Removed hardcoded database and PayU credentials from source code
  - Updated .env.example to reflect all required environment variables
  - Maintained fallback values for development compatibility
- July 08, 2025: Removed Stripe payment gateway, using PayU only with test credentials
  - Removed all Stripe-related code, components, and dependencies (@stripe/stripe-js, @stripe/react-stripe-js, stripe)
  - Simplified payment flow to use only PayU gateway with hardcoded test credentials
  - Updated PaymentMethodSelector to directly show PayU payment form without method selection
  - Removed Elements wrapper and Stripe imports from customer registration
  - Updated .env.example and PAYU_INTEGRATION.md to reflect PayU-only configuration
  - PayU credentials now loaded from environment variables (PAYU_MERCHANT_KEY, PAYU_SALT)
  - Using test environment baseUrl="https://test.payu.in" (change to secure.payu.in for production)
- July 08, 2025: Added PayU payment gateway integration
  - Integrated PayU payment gateway as alternative to Stripe for non-seamless payments
  - Created PaymentMethodSelector component with dual payment options (Stripe + PayU)
  - Added PayU payment creation, success/failure handlers with hash verification
  - Support for multiple payment methods: Credit/Debit Cards, Net Banking, UPI, Wallets
  - PayU configuration with test/production environment support
  - Secure hash generation and verification for payment security
  - Customer registration flow now supports both Stripe and PayU payment methods
- July 08, 2025: Migrated to Microsoft SQL Server database
  - Replaced PostgreSQL/Neon Database with Microsoft SQL Server (103.205.66.184:2499)
  - Created SqlServerStorage class using raw SQL queries for full compatibility
  - Implemented automatic table creation with proper SQL Server schema
  - Updated database connection layer to use mssql package instead of Drizzle ORM
  - All CRUD operations now use parameterized SQL queries for security
  - Database tables: distributors, customers, claims, otp_verifications with proper indexes
- July 08, 2025: Enhanced responsive design and architecture cleanup
  - Centralized Header and Footer components in App.tsx for consistent layout
  - Improved mobile responsiveness across all pages with optimized breakpoints
  - Updated button styles, card layouts, and typography for better mobile experience
  - Fixed navigation and component architecture for cleaner codebase
- July 08, 2025: Integrated PostgreSQL database to replace in-memory storage
  - Created database connection layer using Drizzle ORM with Neon Database
  - Implemented DatabaseStorage class with full CRUD operations for all entities
  - Updated storage layer to use real PostgreSQL instead of in-memory maps
  - Maintained backward compatibility with existing IStorage interface
  - All data now persisted in database tables: distributors, customers, claims, otp_verifications
- July 01, 2025: Updated forms based on user journey requirements
  - Enhanced Distributor Registration with new fields: Name, Business Name (optional), Mobile with OTP verification, Email, Pincode, Location/City, Preferred Mode (In-store/Online/Both), GSTIN (optional), Bank Details (optional)
  - Updated Customer Registration with simplified flow: Customer Details (Name, Contact with OTP, Email, Pincode), Device Details (Type with auto-pricing, Serial/IMEI, Brand, Model, Invoice Value), Seller Details (optional Seller Code)
  - Removed file upload requirements from customer registration for streamlined process
  - Added comprehensive OTP verification system for both distributor and customer registration
  - Updated database schema to support new fields including serialNumber, businessName, location, preferredMode, gstin
  - Maintained backward compatibility with existing customer data structure
- June 25, 2025: Completed payment gateway integration removing payment screenshots
  - Removed payment screenshot upload option entirely from registration
  - Direct payment processing during registration using Stripe payment gateway
  - Updated database schema to store payment intent IDs instead of screenshots
  - Streamlined registration flow: Device Info → Personal Info → Verification → Payment
  - Payment amounts: ₹125 for laptops, ₹99 for mobiles with secure card processing
- June 25, 2025: Integrated payment gateway with customer registration
  - Added Stripe payment processing for seamless buy + register flow
  - Created 4-step registration process: Device Info → Personal Info → Verification → Payment
  - Graceful fallback when Stripe keys not configured (demo mode)
  - Updated "Register Now" to "Buy and Register" across the platform
- June 25, 2025: Updated BBG pricing slabs to match official brochure
  - Maximum claim value reduced to 70% (from 80%)
  - Coverage period extended to 60 months (from 24 months)
  - Added comprehensive 7-tier claim structure (6-60 months)
  - Updated footer with complete company information
  - Removed specific commission amounts from customer-facing pages
- June 24, 2025: Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```