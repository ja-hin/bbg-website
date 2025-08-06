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

- **August 6, 2025**: ✅ Fixed critical Acer IMEI validation system synchronization issue
  - RESOLVED: Missing `/api/check-device-registration` endpoint causing IMEI validation failures
  - IMPLEMENTED: Proper database column mapping (`serial_number` vs `serialNumber`) 
  - ENHANCED: Acer IMEI admin panel with 5-second auto-refresh and manual refresh button
  - FIXED: Cache-control headers to prevent stale IMEI data in admin interface
  - CONFIRMED: Complete IMEI validation flow now working - uploaded IMEIs appear valid in Acer registration form

- **July 30, 2025**: ✅ Fixed template creation unique constraint violations
  - RESOLVED: Database template creation errors causing server startup warnings
  - IMPLEMENTED: Smart template existence checking before insertion
  - IMPROVED: Clean server startup without SQL constraint violation errors
  - ENHANCED: Proper error handling for duplicate template prevention

- **July 30, 2025**: ✅ Hidden customer login option from header navigation
  - REMOVED: Customer login button from header navigation (both desktop and mobile versions)
  - MAINTAINED: Direct URL access to /customer/login still functional for existing customer dashboard usage
  - STREAMLINED: Header navigation now only shows referral partner login, reducing user confusion
  - IMPROVED: Cleaner navigation experience focusing on main BBG registration and claim flows