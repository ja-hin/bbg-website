# XtraCover BBG Insurance Platform

## Overview

XtraCover BBG is a comprehensive insurance platform that enables customers to purchase Buyback Guarantee (BBG) protection for mobile phones and laptops. The platform features a multi-tenant architecture supporting customers, referral partners (distributors), and administrators. Key features include device registration, claim processing, referral programs, payment processing, and comprehensive administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Theme System**: Dynamic theming with CSS custom properties, allowing runtime color customization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: Microsoft SQL Server with raw SQL queries (connection pooling via mssql package)
- **Session Management**: Express sessions with in-memory store for admin authentication
- **File Uploads**: Multer with AWS S3 integration for document storage
- **Real-time Features**: Server-sent events for live updates and cross-tab communication

### Authentication & Authorization
- **Admin Authentication**: Session-based authentication with bcrypt password hashing
- **Distributor Authentication**: Token-based authentication with OTP verification
- **Customer Authentication**: OTP-based verification for device registration and claims
- **Multi-role Support**: Separate authentication flows for customers, distributors, and administrators

### Database Design
- **Primary Database**: Microsoft SQL Server with custom connection pooling
- **Schema Management**: TypeScript interfaces matching SQL Server tables
- **Data Access**: Raw SQL queries with parameterized statements for security
- **Key Entities**: Users, Distributors, Customers, Claims, Devices, Brands, Models, Templates

### Communication Services
- **Email**: Nodemailer with SMTP configuration (Gmail/custom SMTP servers)
- **SMS**: Kaleyra SMS service integration for OTP delivery
- **WhatsApp**: Gupshup WhatsApp Business API for rich messaging
- **Template System**: Dynamic message templates with variable substitution

### Payment Processing
- **Payment Gateway**: PayU integration for secure payment processing
- **Multi-device Pricing**: Dynamic pricing based on device type (laptop/mobile)
- **Commission Tracking**: Automated referral commission calculations

## External Dependencies

### Third-party Services
- **AWS S3**: Document storage and file management with signed URLs
- **Kaleyra SMS**: SMS delivery service for OTP and notifications
- **Gupshup WhatsApp**: WhatsApp Business messaging platform
- **PayU Payment Gateway**: Secure payment processing and transaction management

### Communication APIs
- **SMTP Services**: Gmail SMTP and custom SMTP server support
- **Template Engine**: Custom template service with variable interpolation
- **Multi-channel Messaging**: Unified messaging across email, SMS, and WhatsApp

### Development Tools
- **Replit Integration**: Development environment with hot reload and error overlays
- **Vite Plugins**: Runtime error modal and development cartographer
- **TypeScript**: Full type safety across frontend and backend

### Database & Storage
- **Microsoft SQL Server**: Primary database with connection pooling
- **AWS S3**: Cloud storage for uploaded documents and files
- **Session Storage**: In-memory session management for admin users

### Monitoring & Logging
- **Custom Logging**: Application-level logging with service status tracking
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Real-time Updates**: Live data refresh and cross-tab synchronization