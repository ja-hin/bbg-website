# XtraCover BBG Application

## Overview
This full-stack web application is designed for XtraCover's BuyBack Guarantee (BBG) system. It facilitates device registration for BBG protection, enables customers to claim buyback guarantees, and allows distributors to register and earn commissions. The project aims to streamline the BBG process, provide a user-friendly experience with real-time feedback, and offer robust administrative tools for comprehensive system management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, Wouter for routing, TanStack Query for state management.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **Form Handling**: React Hook Form with Zod validation.
- **Build Tool**: Vite.
- **UI/UX Decisions**: Focus on a streamlined, single-page customer registration flow with real-time validation, smart focus-based message display, and smooth animations. The design utilizes a dual-color theme (primary #254696, secondary #E72829) with a dynamic theme system for real-time customization, ensuring a professional and consistent look across all interfaces.

### Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules).
- **Database ORM**: Drizzle ORM (planned, currently raw SQL).
- **File Handling**: Multer for uploads, integrated with AWS S3 for cloud storage with local fallback.
- **Admin Panel**: Secure session-based authentication with bcrypt hashing, offering comprehensive management of partners, customers, claims, communication templates, and IMEI data. Features a customizable drag-and-drop menu ordering system.

### Database Design
- **Primary Database**: Microsoft SQL Server.
- **Core Tables**: `referral_partners`, `customers`, `claims`, `otp_verifications`, `admin_users`, `message_templates`, `acer_imei_validation`, `claim_value_slabs`.
- **Key Technical Implementations**:
    - **Authentication**: OTP-based for customer/partner registration; session-based with password hashing for admin.
    - **Business Logic**: Dynamic commission calculation, device age-based claim eligibility, BBG voucher code generation, and brand-specific claim value slab configurations. Includes a 3-month waiting period for regular BBG claims (Acer BBG registrations exempt) and a 1-year device age limit for regular BBG coverage.
    - **File Management**: Secure uploads (invoices, payment proofs) to AWS S3 (up to 5MB, JPEG, PNG, PDF) with signed URLs.
    - **Data Validation**: Comprehensive Zod schemas for all data.
    - **Communication System**: Multi-channel notifications via Email (SMTP), SMS (Kaleyra), and WhatsApp (Gupshup), with an admin-managed Template Management System.
    - **Acer IMEI Validation**: System for uploading and validating Acer IMEI data to prevent duplicate registrations, specifically handling Acer BBG customers with an 80% slab system.

### Deployment Strategy
- **Target Platform**: AWS Cloud Infrastructure (EC2 instances with Application Load Balancer).
- **Database**: Existing Microsoft SQL Server.
- **Storage**: AWS S3.

## External Dependencies

- **Database**: Microsoft SQL Server
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS, Lucide Icons
- **Payment Gateway**: PayU
- **SMS Service**: Kaleyra.io SMS API
- **WhatsApp Business API**: Gupshup WhatsApp Business API
- **Cloud Storage**: AWS S3
- **Email Service**: Nodemailer
- **Utilities**: Multer, bcryptjs, Zod, XLSX