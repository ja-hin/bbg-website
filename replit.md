# Xtracover BBG Application

## Overview

This is a full-stack web application for Xtracover's BuyBack Guarantee (BBG) system. It enables distributors (referred to as "referral partners") to register and earn commissions, customers to register their devices for BBG protection, and users to claim their buyback guarantees. The project aims to streamline the BBG process, enhance user experience with real-time feedback, and provide robust administrative tools for managing partners, customers, claims, and communications.

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
- **UI/UX Decisions**: Focus on a streamlined, single-page customer registration flow. Features include real-time validation feedback bubbles, smart focus-based display of validation messages, and smooth animations. The design aims for a professional, consistent look across all interfaces (customer, partner, admin).

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM (for potential future use, currently using raw SQL)
- **File Handling**: Multer for file uploads, integrated with AWS S3 for cloud storage with local fallback.
- **Admin Panel**: Secure session-based authentication with bcrypt hashing. Features include comprehensive management of referral partners, customers, claims, communication templates, and IMEI data.

### Database Design
- **Primary Database**: Microsoft SQL Server (103.205.66.184:2499, database: prexoDB).
- **Core Tables**: `distributors` (now `referral_partners`), `customers`, `claims`, `otp_verifications`, `admin_users`, `message_templates`, `acer_imei_validation`.
- **Key Technical Implementations**:
    - **Authentication**: OTP-based verification for customer and referral partner registration. Admin authentication is session-based with secure password hashing.
    - **Business Logic**: Includes dynamic commission calculation for referral partners, device age-based claim eligibility, and BBG voucher code generation.
    - **File Management**: Secure file uploads (invoices, payment proofs) to AWS S3 with signed URLs for access. Supports image (JPEG, PNG) and PDF files up to 5MB.
    - **Data Validation**: Comprehensive Zod schemas for all data, including Indian phone numbers, pincodes, and bank details.
    - **Communication System**: Multi-channel notifications via Email (SMTP), SMS (Kaleyra), and WhatsApp (Gupshup). Features a Template Management System allowing admin CRUD operations for communication templates with dynamic variables and live previews.
    - **Acer IMEI Validation**: Dedicated system for uploading and validating Acer IMEI data against a database, preventing duplicate device registrations.

## External Dependencies

- **Database**:
    - Microsoft SQL Server
    - Neon Database (for Drizzle ORM, though currently raw SQL is used for MS SQL)
- **UI Components**:
    - shadcn/ui (component library based on Radix UI)
    - Radix UI (accessible component primitives)
    - Tailwind CSS (utility-first CSS framework)
    - Lucide Icons (icon library)
- **Payment Gateway**:
    - PayU
- **SMS Service**:
    - Kaleyra.io SMS API
- **WhatsApp Business API**:
    - Gupshup WhatsApp Business API
- **Cloud Storage**:
    - AWS S3
- **Email Service**:
    - Nodemailer (for SMTP-based email)
- **Development Tools**:
    - TypeScript
    - ESLint
    - Vite
    - tsx
- **Utilities**:
    - Multer (file uploads)
    - bcryptjs (password hashing)
    - Zod (schema validation)
    - XLSX (Excel/CSV parsing for bulk uploads)

## Recent Changes

- **August 6, 2025**: ✅ Completed comprehensive dynamic claim value slabs system
  - IMPLEMENTED: Full CRUD operations for claim value slabs with mobile/laptop device type support
  - CREATED: Robust SQL Server database schema with comprehensive fallback query mechanisms
  - BUILT: Advanced admin interface with tabbed display for separate mobile/laptop slab management
  - SOLVED: Critical database connection pooling and schema caching issues with automated fallback queries
  - TESTED: Complete system functionality - CREATE, READ, UPDATE, DELETE operations all working correctly
  - VERIFIED: Admin authentication, API endpoints, and public claim value slab access all functional
  - DEPLOYED: Production-ready claim value slabs system with error handling and connection resilience

- **August 6, 2025**: ✅ Comprehensive UI/UX improvements and text updates across Acer registration journey
  - UPDATED: Header navigation changed "Register BBG" to "Register Acer BBG"
  - ENHANCED: IMEI validation increased from minimum 5 to 7 characters across all forms
  - FIXED: GST text corrections - changed from "without GST" to "inclusive of GST" throughout
  - REMOVED: All Acer logos from registration journey per requirements
  - UPDATED: Thank you page text changed "registration ID" references to "BBG Voucher Code"
  - IMPROVED: Consistent validation messages and user-friendly form labels
  - CONFIRMED: All text updates align with business requirements for cleaner registration experience

- **August 6, 2025**: ✅ Fixed critical Acer IMEI validation system synchronization issue
  - RESOLVED: Missing `/api/check-device-registration` endpoint causing IMEI validation failures
  - IMPLEMENTED: Proper database column mapping (`serial_number` vs `serialNumber`) 
  - ENHANCED: Acer IMEI admin panel with 5-second auto-refresh and manual refresh button
  - FIXED: Cache-control headers to prevent stale IMEI data in admin interface
  - UPDATED: Simplified validation messages to "Valid IMEI" and "IMEI Not Found"
  - CONFIRMED: Complete IMEI validation flow now working - uploaded IMEIs appear valid in Acer registration form
  - FIXED: Added missing `registration_source` column to customers table for proper Acer registration tracking

- **July 30, 2025**: ✅ Fixed template creation unique constraint violations
  - RESOLVED: Database template creation errors causing server startup warnings
  - IMPLEMENTED: Smart template existence checking before insertion
  - IMPROVED: Clean server startup without SQL constraint violation errors
  - ENHANCED: Proper error handling for duplicate template prevention

- **August 7, 2025**: ✅ **Comprehensive dual-color theme implementation (#254696 & #E72829)**
  - IMPLEMENTED: Complete CSS variables system with both primary (#254696) and secondary (#E72829) colors
  - CREATED: Custom utility classes (.text-xtra-primary, .bg-xtra-secondary, etc.) for consistent theming
  - ENHANCED: Gradient backgrounds using both brand colors across key sections
  - UPDATED: All components now use strategic color assignment:
    * Primary (#254696): Laptop devices, trust/security elements, admin interfaces
    * Secondary (#E72829): Mobile devices, CTA buttons, pricing, highlights
  - MODERNIZED: Logo and branding with blue-to-red gradient for visual appeal
  - CONSISTENT: Header, home page, claim forms, admin panels all use the dual-color system
  - IMPROVED: Better visual hierarchy and brand recognition with modern color palette

- **August 8, 2025**: ✅ **COMPLETE THEME SYSTEM SUCCESS: 100% dynamic theming across entire application**
  - FIXED: Footer logo and brand text now use dynamic theme colors (--xtra-primary)
  - UPDATED: Scroll-to-top button uses theme colors instead of hardcoded red
  - CORRECTED: Home page components - table headers, buttons, loading spinners, gradient sections
  - RESOLVED: Claim page step indicators, error messages, and device slab tables
  - IMPLEMENTED: Admin panel sidebar with full dynamic theme integration
  - COMPLETED: All UI components (header, footer, home, claims, admin) use CSS variables
  - VERIFIED: Theme changes apply instantly across all pages and survive server restarts
  - DATABASE: prexoDB.theme_settings table working perfectly with real-time updates

- **July 30, 2025**: ✅ Hidden customer login option from header navigation
  - REMOVED: Customer login button from header navigation (both desktop and mobile versions)
  - MAINTAINED: Direct URL access to /customer/login still functional for existing customer dashboard usage
  - STREAMLINED: Header navigation now only shows referral partner login, reducing user confusion
  - IMPROVED: Cleaner navigation experience focusing on main BBG registration and claim flows