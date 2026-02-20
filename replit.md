# BBG (Buy Back Guarantee) Application - XtraCover

## Overview

This is a full-stack Buy Back Guarantee (BBG) platform for XtraCover that manages device warranty/buyback registrations for mobile phones and laptops. The system handles customer registrations, distributor/referral partner management, claim processing, payment integration, and multi-channel communication (email, SMS, WhatsApp). It supports multiple registration channels including standard BBG, Acer BBG, and Amazon BBG flows.

The application provides:
- A public-facing customer registration and purchase flow
- A distributor/referral partner portal for tracking registrations and commissions
- A comprehensive admin dashboard for managing all aspects of the business
- Automated communication via email (SMTP), SMS (Kaleyra/Gupshup), and WhatsApp (Gupshup)
- Invoice generation and S3 file storage
- Claim value slab management with device age-based percentage calculations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **UI Components**: Shadcn/ui (Radix UI primitives) with Tailwind CSS, configured in `components.json`
- **Build Tool**: Vite with React plugin, aliases configured for `@/` (client/src), `@shared/` (shared), `@assets/` (attached_assets)
- **Code Splitting**: Lazy loading via `React.lazy()` and `Suspense` for all pages except Home
- **Theming**: Dynamic theme system with CSS variables, admin-configurable primary color
- **Form Handling**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Structure**: `client/src/` contains pages, components, hooks, and lib utilities

### Backend Architecture
- **Framework**: Express.js with TypeScript, running via `tsx` loader
- **Entry Point**: `server/index.ts` - sets up Express, sessions, routes, and Vite dev server
- **API Pattern**: RESTful API under `/api/` prefix, defined in `server/routes.ts`
- **Session Management**: `express-session` with `memorystore` (in-memory session store)
- **Authentication**: Session-based auth for admin users; OTP-based auth for customers; token-based auth for distributors
- **File Uploads**: Multer with S3 storage via `multer-s3`, configured for documents, bulk uploads, and banners
- **Build**: esbuild bundles server code for production (`dist/index.js`)
- **Process Management**: PM2 configured via `ecosystem.config.js` for production deployment

### Data Storage
- **Primary Database**: Microsoft SQL Server (MSSQL) accessed via the `mssql` npm package with raw SQL queries
- **Storage Layer**: `server/sql-storage.ts` implements `IStorage` interface with all CRUD operations using raw SQL against MSSQL
- **Schema Definition**: `shared/schema.ts` defines TypeScript types and Drizzle ORM table definitions (used for type generation only, not for actual queries)
- **Drizzle Config**: `drizzle.config.ts` is configured for PostgreSQL dialect but the actual runtime uses MSSQL. The Drizzle schema serves as type definitions and documentation
- **Connection**: `server/db.ts` manages MSSQL connection pool with configurable host, port, database, user, password
- **Key Tables**: customers, distributors (referral_partners), claims, claim_value_slabs, admin_users, otp_verifications, pending_payments, brands, device_models, message_templates, homepage_banners, plans, acer_imei_validation

### Business Logic
- **Plan Service** (`server/plan-service.ts`): Core business logic determining plan type based on device type and purchase date. Devices purchased within 6 months get "claim slabs" benefits; over 6 months get "auction/repair" benefits
- **Claim Value Slabs**: Percentage-based claim values determined by device brand, type, and age in months
- **Multi-channel Registration**: Standard BBG, Acer BBG (with IMEI validation), Amazon BBG (with license key validation)
- **Commission System**: Distributor/referral partner commission tracking and payout management

### Communication Services
- **Email**: Nodemailer with configurable SMTP settings (`server/communication-service.ts`)
- **SMS**: Kaleyra API v4 for OTP and transactional SMS (`server/kaleyra-service.ts`)
- **WhatsApp**: Gupshup Business API for WhatsApp messages (`server/gupshup-service.ts`, `server/gupshup-whatsapp-service.ts`)
- **Templates**: Database-driven message templates with variable substitution (`server/template-service.ts`)

### Key Design Decisions

1. **MSSQL with raw SQL instead of ORM**: The project uses raw SQL queries against MSSQL despite having Drizzle schema definitions. This was chosen because Drizzle has limited MSSQL support. The Drizzle/PostgreSQL schema in `shared/schema.ts` serves as TypeScript type definitions and documentation.

2. **Monorepo structure with shared types**: `shared/schema.ts` provides type definitions used by both client and server, ensuring type safety across the stack.

3. **S3-only file storage**: All file uploads (documents, invoices, banners) go directly to AWS S3, with no local filesystem storage. This ensures stateless server deployment.

4. **Session-based admin auth with OTP-based customer auth**: Admin users authenticate with username/password stored in the database. Customers authenticate via phone number OTP verification.

5. **Dynamic theming**: Admin can configure the primary brand color, which propagates through CSS custom properties to the entire frontend.

## External Dependencies

### Cloud Services
- **AWS S3**: File storage for documents, invoices, bulk uploads, and banner images. Configured via `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`
- **AWS SDK**: `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` for S3 operations

### Communication APIs
- **Kaleyra SMS API** (v4): For sending OTP and transactional SMS. Configured via `KALEYRA_API_KEY`, `KALEYRA_SENDER_ID`
- **Gupshup WhatsApp API**: For WhatsApp Business messaging. Configured via `GUPSHUP_API_KEY`, `GUPSHUP_APP_ID`, `GUPSHUP_APP_NAME`
- **Gupshup SMS Gateway**: Secondary SMS channel via `media.smsgupshup.com`
- **SMTP Email**: Configurable SMTP server (defaults to Gmail). Configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- **SendGrid**: `@sendgrid/mail` is listed as a dependency (alternative email provider)

### Payment Integration
- **PayU**: Payment gateway integration. Configured via `PAYU_MERCHANT_ID`, `PAYU_MERCHANT_KEY`, `PAYU_SALT`, `PAYU_CLIENT_ID`, `PAYU_CLIENT_SECRET`

### Database
- **Microsoft SQL Server**: Primary database, accessed via `mssql` npm package. Configured via `SQL_SERVER_HOST`, `SQL_SERVER_PORT`, `SQL_SERVER_DATABASE`, `SQL_SERVER_USER`, `SQL_SERVER_PASSWORD`
- **Neon PostgreSQL** (`@neondatabase/serverless`): Listed as dependency for potential Drizzle integration, but MSSQL is the active database

### Document Generation
- **PDFKit**: Server-side PDF generation for invoices (`server/invoice-service.ts`)
- **XLSX**: Excel file parsing for bulk data uploads (claim value slabs, IMEI lists)

### Other Dependencies
- **bcryptjs**: Password hashing for admin users
- **nanoid**: Unique ID generation for file names and voucher codes
- **sharp**: Image processing and WebP conversion (build-time optimization)
- **zod**: Schema validation for API inputs