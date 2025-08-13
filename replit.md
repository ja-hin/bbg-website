# XtraCover BBG - Buyback Guarantee Platform

## Overview

XtraCover BBG is a comprehensive buyback guarantee platform that provides assured resale value for mobile phones and laptops. The system handles customer registrations, distributor referral programs, claim processing, payment handling, and administrative management. The platform includes specialized flows for brand partnerships (like Acer) and supports multiple communication channels for customer engagement.

## Recent Updates (January 2025)

- **✅ Acer BBG Admin Panel Completed**: Successfully implemented complete admin panel with tabbed interface showing Regular Laptop (45 slabs), Regular Mobile (31 slabs), and Acer BBG (7 slabs) sections
- **✅ Database Integration Fixed**: Resolved critical authentication issues and properly integrated registration_source field in SQL queries
- **✅ Higher Rate Structure**: Acer BBG slabs now feature 10% higher claim percentages (68%-80% vs 58%-70% regular) for premium device protection
- **✅ Project Cleanup**: Removed unnecessary files, keeping only essential BBG system components for optimal performance

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing with dedicated admin and customer flows
- **State Management**: React Query (TanStack Query) for server state with optimistic updates
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Real-time Features**: Custom hooks for real-time validation and theme management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: SQL Server with raw SQL queries (legacy system integration)
- **ORM**: Drizzle ORM configuration present but using SQL Server adapter with raw queries
- **File Storage**: Hybrid approach - AWS S3 for production with local storage fallback
- **Session Management**: Express sessions with MemoryStore for admin authentication

### Database Design
- **Primary Database**: SQL Server with connection pooling
- **Key Tables**: distributors, customers, claims, admin_users, brands, device_models, message_templates
- **Authentication**: JWT tokens for distributors, session-based for admin users
- **Data Validation**: Zod schemas for type safety and validation

### Payment Integration
- **Primary Gateway**: PayU payment processing
- **Features**: Payment verification, transaction logging, automated invoice generation
- **Security**: Hash verification for payment callbacks and secure webhook handling

### Communication System
- **SMS Provider**: Kaleyra SMS service with OTP functionality
- **Email Service**: SMTP with nodemailer supporting dynamic configuration
- **WhatsApp**: Gupshup WhatsApp Business API integration
- **Templates**: Dynamic message template system supporting email, SMS, and WhatsApp
- **Fallbacks**: Multiple service fallbacks for reliable message delivery

### File Management
- **Cloud Storage**: AWS S3 with presigned URLs for secure file access
- **Local Fallback**: Local file storage when S3 is not configured
- **File Types**: Support for documents, images, and Excel files
- **Upload Security**: File type validation, size limits, and secure naming

### Authentication & Authorization
- **Admin Users**: Session-based authentication with role-based access control
- **Distributors**: JWT token authentication with session management
- **Customers**: OTP-based verification system with secure claim processes
- **Security**: CORS protection, input validation, and secure cookie handling

### Business Logic Components
- **Registration Flow**: Multi-step customer and distributor onboarding
- **BBG Claims**: Automated claim processing with QC verification
- **Commission System**: Distributor payout tracking and management
- **Brand Integration**: Specialized flows for manufacturer partnerships
- **Depreciation Engine**: Time-based device value calculation system

## External Dependencies

### Core Infrastructure
- **Database**: SQL Server hosted at 103.205.66.184:2499
- **File Storage**: AWS S3 bucket for document storage with IAM credentials
- **Email Service**: SMTP configuration (Gmail/custom) for transactional emails

### Payment & Financial Services
- **PayU Payment Gateway**: Primary payment processor with merchant key integration
- **Banking Integration**: Support for UPI, bank transfers, and digital payments

### Communication Services
- **Kaleyra SMS**: Primary SMS service provider with OTP delivery
- **Gupshup WhatsApp**: Business API for WhatsApp messaging
- **SMTP Email**: Configurable email service with template support

### Development & Monitoring
- **Replit Integration**: Development environment with hot reload
- **Error Tracking**: Runtime error overlay for development
- **File Processing**: Excel/CSV parsing with XLSX library
- **Security**: bcrypt for password hashing, crypto for secure token generation

### Third-party Libraries
- **Frontend**: React Query, Wouter, Tailwind CSS, Radix UI, Lucide React
- **Backend**: Express.js, Multer, Nodemailer, Axios, Zod
- **Database**: mssql driver, Drizzle Kit for migrations
- **Utilities**: date-fns for date handling, nanoid for unique ID generation