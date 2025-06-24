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
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database queries and migrations
- Environment variable `DATABASE_URL` required

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
- **Database**: Requires PostgreSQL connection

### Production Build
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Output**: Static files in `dist/public`, server bundle in `dist/`
- **Deployment Target**: Replit Autoscale

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
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
- June 24, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```