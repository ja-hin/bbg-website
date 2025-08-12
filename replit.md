# XtraCover BBG Application

## Overview
This is a full-stack web application for XtraCover's BuyBack Guarantee (BBG) system. Its primary purpose is to enable distributors (referral partners) to register and earn commissions, customers to register their devices for BBG protection, and users to claim their buyback guarantees. The project streamlines the BBG process, offers a user-friendly experience with real-time feedback, and provides robust administrative tools for managing all aspects of the system.

## Recent Critical Updates
**Date: August 12, 2025**
- **COMPLETE SLAB SYSTEM REDESIGN**: Fixed fundamental flaw in single-value storage approach
- **NEW**: `registrationSlabData` JSON column stores complete age-range structures from registration time
- **FIXED**: Apple iPhone customer incorrectly assigned Lenovo laptop slab ID (critical data integrity bug)
- **ENHANCED**: Claims now use complete slab structure allowing device aging without losing rate table
- **BUSINESS RULE**: Device aging changes over time - customers need access to full age ranges from registration
- **MIGRATION**: Comprehensive validation and correction of all customer slab assignments

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
- **Admin Panel**: Secure session-based authentication with bcrypt hashing. Provides comprehensive management of referral partners, customers, claims, communication templates, and IMEI data.

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