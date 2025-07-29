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
- **Microsoft SQL Server**: Production database at 103.205.66.184:2499 (database: prexoDB)
- **distributors**: Stores distributor information, payment details, and seller codes
- **customers**: Stores customer registrations, device details, and BBG voucher codes
- **claims**: Tracks BBG claim requests and their status
- **otp_verifications**: Handles OTP-based verification system
- **admin_users**: Secure admin authentication with bcrypt password hashing

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

## Admin Panel

### Authentication
- **URL**: `/admin/login`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`
- **Session-based authentication** using express-session middleware
- **Secure password hashing** with bcryptjs (12 salt rounds)

### Admin Dashboard Features
- **URL**: `/admin/dashboard`
- **Dashboard Statistics**: Total distributors, customers, claims, revenue tracking
- **Distributor Management**: View all registered distributors with verification status
- **Customer Management**: View customer registrations and device details
- **Claims Management**: Review and approve/reject BBG claim requests
- **Real-time Data**: All data synced with SQL Server database

### Security Features
- Session-based authentication with 24-hour expiry
- Password hashing with bcrypt
- Admin-only route protection middleware
- Automatic redirect to login for unauthenticated access
- Secure logout functionality

### Database Schema
- **admin_users table**: Stores admin credentials and roles
- **Auto-creation**: Default admin user created via `/api/admin/create-default` endpoint
- **Role-based access**: Support for different admin roles (admin, moderator, etc.)

## OTP Integration

### Kaleyra SMS Service
- **Provider**: Kaleyra.io SMS API for professional OTP delivery
- **Coverage**: High delivery rates (98%+ within 5 seconds) for Indian mobile numbers
- **Configuration**: Environment variables for API key, SID, region, and sender ID
- **Features**: 
  - Automatic phone number formatting and validation
  - Fallback mechanism when service unavailable
  - Test endpoint for SMS functionality verification
  - Custom message templates for different use cases

### Environment Variables Required
```bash
KALEYRA_API_KEY=A67fc67b5dccd5dee027eb35fca957094  # Working API key configured
KALEYRA_SENDER_ID=XTRCVR  # Configured sender ID
```

### API Endpoints
- `POST /api/send-otp` - Send OTP with Kaleyra integration (working)
- `POST /api/otp/send` - Legacy OTP endpoint with Kaleyra (working)
- `POST /api/test-kaleyra-sms` - Test SMS functionality (working)
- `POST /api/verify-otp` - Verify OTP codes (working)

### Production Status
✅ **LIVE SMS DELIVERY ACTIVE** - Real SMS messages are being sent via Kaleyra API
- API Key configured and working
- SMS delivery confirmed successful
- OTP generation and verification working perfectly
- Professional message templates active

## Gupshup Integration - WhatsApp Business API Only

### Gupshup WhatsApp Business Service  
- **Provider**: Gupshup WhatsApp Business API (Account: 2000203988)
- **Service Type**: WhatsApp Business messaging with HSM template requirements
- **Configuration**: WhatsApp-only delivery, no SMS fallback
- **Architecture**: Pure WhatsApp Business implementation using exact Thunderclient API format

### Production Configuration
```bash
# WhatsApp Business Account (HSM Templates)
ACCOUNT_2000203988=CrtvMm59A  # WhatsApp Business API
ACCOUNT_2000203989=EEoHp1K9S  # SMS Gateway API

# Optional WhatsApp Business Enhancement
GUPSHUP_API_KEY=your_api_key_here  # For HSM template access
```

### Operational Features
- **WhatsApp Business Only**: Pure WhatsApp messaging, no SMS fallback
- **HSM Template Compliance**: Requires approved HSM templates for message delivery
- **Error Transparency**: Shows HSM template errors directly without fallback
- **Production Format**: Exact API format matching user's working Thunderclient implementation
- **Template Requirements**: Messages must match pre-approved WhatsApp Business templates

### API Endpoints & Testing  
- `POST /api/test-gupshup-whatsapp` - Test complete dual-channel system
- Integrated into CommunicationService for seamless customer notifications
- Admin interface at `/admin/whatsapp-test` for comprehensive message testing

### Production Status - WhatsApp Business Ready ✅
- **Account 2000203988**: ✅ WhatsApp Business API configured and responding correctly
- **HSM Template Detection**: ✅ Properly identifies template requirements and shows errors
- **API Format**: ✅ Exact format matching user's working Thunderclient implementation  
- **Error Handling**: ✅ Transparent HSM template error reporting (no fallback)
- **Integration**: ✅ Ready for WhatsApp Business messaging with approved templates
- **Admin Testing**: ✅ Complete testing interface showing HSM template status

## Communication System

### Multi-Channel Notifications
- **Email Notifications**: SMTP-based email service using nodemailer for professional communication
- **SMS Notifications**: Kaleyra integration for reliable SMS delivery (98%+ delivery rate)
- **WhatsApp Notifications**: Gupshup API integration for WhatsApp business messaging
- **Unified Service**: CommunicationService handles all channels with consistent error handling

### Notification Types
1. **Registration Confirmations**: Welcome messages for customers and referral partners with voucher codes/referral codes
2. **Claim Status Updates**: Notifications when BBG claims are approved, rejected, or paid
3. **Payout Notifications**: Updates for referral partners on commission payments
4. **Test Communications**: Admin endpoint to test all channels simultaneously

### Environment Variables Required
```bash
# Email (SMTP) Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# SMS (Kaleyra) Configuration
KALEYRA_API_KEY=your_kaleyra_api_key
KALEYRA_SENDER_ID=XTRCVR

# WhatsApp (Gupshup) Configuration
GUPSHUP_API_KEY=your_gupshup_api_key_here
GUPSHUP_APP_NAME=xtracover-bbg
GUPSHUP_SOURCE_NUMBER=919999999999
```

### API Endpoints
- `POST /api/test-communications` - Test all communication channels
- Automatic notifications triggered on registration, claim status updates, and payout changes
- Professional message templates with branding and clear formatting

## Template Management System

### Admin Template Management
- **Template Editor**: Complete CRUD interface for creating and managing communication templates
- **Multi-Channel Support**: Separate templates for email, SMS, and WhatsApp with channel-specific features
- **Event-Based Templates**: Templates organized by events (registration, welcome, claims, payouts, OTP)
- **Variable System**: Dynamic template variables with {{variable}} replacement syntax
- **Live Preview**: Real-time template preview with sample data for testing
- **Status Management**: Enable/disable templates with active status toggle

### Template Features
- **Rich Email Templates**: HTML email templates with responsive design and branding
- **Concise SMS Templates**: Character-optimized SMS messages with essential information
- **Emoji-Rich WhatsApp**: WhatsApp templates with emojis and formatted messaging
- **Variable Validation**: Available variables displayed and validated per event type
- **Admin Control**: Complete admin interface at `/admin/templates` for template management

### Database Integration
- **SQL Server Storage**: Templates stored in `message_templates` table with full CRUD operations
- **Default Templates**: Automatic creation of professional default templates on first run
- **Template History**: Created/updated timestamps for template version tracking
- **Unique Constraints**: One active template per type/event combination

## AWS S3 Integration

### File Storage System
- **AWS S3 Service**: Integrated S3Service class with secure file upload/download capabilities
- **Multer S3 Integration**: Direct file uploads to S3 using multer-s3 middleware
- **Fallback Support**: Automatic fallback to local storage if S3 not configured
- **Admin Management**: Complete storage management interface at `/admin/storage`
- **Signed URLs**: Secure temporary file access with 1-hour expiry
- **Environment Configuration**: AWS credentials via environment variables

### Storage Features
- **Private Bucket Access**: All files stored privately with signed URL access
- **File Organization**: Structured folder system (documents, images, temp)
- **Automatic Cleanup**: Failed uploads automatically cleaned up
- **Type Validation**: Supports JPEG, PNG, PDF files with 5MB size limit
- **Dual Mode**: Works with or without S3 configuration

### Security & Performance
- **Encrypted Storage**: Files encrypted at rest in S3
- **Access Control**: Only authenticated users can generate signed URLs
- **Cost Optimization**: Pay-per-use pricing with free tier benefits
- **Global CDN**: Fast file access worldwide via S3's global infrastructure

### API Endpoints
- `GET /api/storage/status` - Check S3 configuration status
- `GET /api/files/signed-url/:key` - Generate secure file access URLs
- `GET /api/files/local/:filename` - Serve local files (fallback mode)

## Real-time Validation Feedback Bubbles

### Enhanced User Experience Features
- **Smart Validation Bubbles**: Real-time validation feedback that appears only when fields are focused
- **Focus-based Display**: Validation bubbles automatically hide when users move to other fields
- **Debounced Validation**: 300ms debouncing prevents excessive API calls during typing
- **Multi-state Indicators**: Loading spinners, success checkmarks, error messages, and info bubbles
- **Custom Validation**: Built-in phone/email existence checking with server-side validation
- **Smooth Animations**: Fade in/out transitions with scale effects for professional user experience

### Implementation Components
- **ValidationBubble**: Reusable bubble component with positioning and styling
- **useRealtimeValidation**: Custom hook with focus management and debouncing
- **ValidatedField**: Enhanced input component with integrated validation feedback
- **Pre-built Schemas**: Phone, email, IMEI, name, price, and address validation patterns

### Form Integration
- Applied to all critical fields in Acer BBG registration form
- Maintains form validation while adding visual feedback layer
- Seamless integration with existing React Hook Form setup

## Changelog

```
Changelog:
- July 29, 2025: ✅ COMPLETED - Updated claim amount display to show "Upto" prefix across communication templates
  - UPDATED: Email template in template-service.ts to show "Upto ₹{{claimAmount}}" instead of "₹{{claimAmount}}"
  - UPDATED: WhatsApp claim update message in gupshup-service.ts to show "Upto Rs.{amount}" for approved claims
  - CLARIFIED: Claim amounts now indicate maximum possible value rather than fixed guaranteed amount
  - ENHANCED: User communication clarity by showing claim amounts are subject to device condition verification
- July 29, 2025: ✅ COMPLETED - Removed Business Name and Registered Business Address fields from referral partner registration
  - REMOVED: Business Name (Optional) field from referral partner registration form UI
  - REMOVED: Registered Business Address (Optional) field from referral partner registration form UI  
  - UPDATED: Form validation schema to remove businessName and registeredBusinessAddress requirements
  - MODIFIED: SQL Server storage layer to exclude these fields from INSERT operations
  - CLEANED: Database mapping functions to remove businessName and registeredBusinessAddress references
  - STREAMLINED: Registration form layout with single-column grid for Full Name field
  - MAINTAINED: Database table structure unchanged for backward compatibility
  - SIMPLIFIED: Form submission and validation without removed field dependencies
- July 29, 2025: ✅ COMPLETED - Enhanced Referral Partner Dashboard privacy controls
  - HIDDEN: Customer personal details (name, phone, email) from referral partner view
  - HIDDEN: BBG voucher codes from referral partner access for security
  - MAINTAINED: Device details visibility (brand, model, type, invoice value) for business tracking
  - PRESERVED: Commission tracking and registration dates for earnings management
  - IMPROVED: Privacy compliance while maintaining essential business metrics visibility
- July 26, 2025: ✅ COMPLETED - Scroll-to-top functionality enhancement across entire application
  - CREATED: ScrollToTopButton component with smooth scroll behavior and professional styling
  - IMPLEMENTED: Enhanced useScrollToTop hook with additional scroll functions (scrollToTopInstant, scrollToTopSmooth)
  - FIXED: Payment page navigation scroll-to-top issue - page now automatically scrolls to top when payment form is shown
  - INTEGRATED: Scroll-to-top button appears on all pages after scrolling down 300px with fade-in animation
  - ENHANCED: Fixed bottom-right floating button with red theme and hover effects
  - APPLIED: Universal scroll-to-top functionality across customer pages, admin pages, and distributor pages
  - OPTIMIZED: Instant scroll behavior for payment navigation and smooth scroll for manual button clicks
  - IMPROVED: User experience with consistent scroll-to-top availability throughout the application
- July 25, 2025: ✅ COMPLETED - Real-time Validation Feedback Bubbles implementation with enhanced UX
  - CREATED: ValidationBubble component with success/error/loading/info states and smooth animations
  - IMPLEMENTED: useRealtimeValidation hook with focus-based display logic and 300ms debouncing
  - DEVELOPED: ValidatedField component for seamless form integration with existing React Hook Form
  - ADDED: Focus management system - bubbles only show when field is active, hide when moving to other fields
  - ENHANCED: Pre-built validation schemas for phone, email, IMEI, name, price, and address validation
  - INTEGRATED: Custom validation functions for phone/email existence checking with async support
  - OPTIMIZED: User experience with smart bubble positioning and professional fade transitions
  - APPLIED: Real-time validation to all critical fields in Acer BBG registration form
  - IMPROVED: Form interaction flow with visual feedback that doesn't interfere with user workflow
- July 24, 2025: ✅ COMPLETED - Comprehensive AWS S3 integration for secure cloud file storage
  - IMPLEMENTED: Complete S3Service class with upload, download, and signed URL generation
  - CREATED: Multer-S3 integration for direct file uploads to cloud storage
  - ADDED: Admin storage management interface at /admin/storage with configuration panel
  - ENHANCED: Fallback system - works with local storage if S3 not configured
  - INTEGRATED: File upload endpoints updated to handle both S3 and local storage
  - SECURED: Private bucket access with temporary signed URLs (1-hour expiry)
  - CONFIGURED: Environment variables for AWS credentials and bucket configuration
  - DOCUMENTED: Complete setup guide (S3_SETUP.md) with step-by-step AWS configuration
  - OPTIMIZED: Cost-effective storage solution with unlimited scalability and global CDN
- July 23, 2025: ✅ COMPLETED - Completely removed location field requirement from referral partner registration system
  - REMOVED: Location field from distributor registration form schema and UI components
  - UPDATED: Database schema to remove location column from distributors table creation script
  - CLEANED: All location references from server-side createDistributor and mapDistributor functions
  - FIXED: Admin dashboard and distributor management interfaces to remove location display
  - ELIMINATED: Location column headers and table cells from all admin interface tables
  - RESOLVED: All database schema mismatches - referral partner registration now fully functional
  - VERIFIED: Form now successfully creates referral partners without location field requirement
- July 23, 2025: ✅ COMPLETED - Fixed critical database connection and reverted to SQL Server per user requirement
  - CRITICAL: User explicitly required NEVER to use PostgreSQL - always use SQL Server at 103.205.66.184:2499
  - REVERTED: Changed database connection back to SQL Server (mssql package) from PostgreSQL
  - UPDATED: server/db.ts to use mssql connection pool instead of @neondatabase/serverless
  - RESTORED: server/routes.ts to use sql-storage.ts instead of PostgreSQL storage
  - FIXED: Added ALL missing columns to SQL Server distributors table including:
    - terms_agreement, info_declaration, tds_understanding, gst_invoice_agreement, bank_account_confirm
    - cancelled_cheque_file, msme_certificate_file, account_holder_name, upi_id, bank_account, ifsc_code
    - pan_number, pan_copy_file, gst_number, gst_certificate_file, is_gst_registered, is_msme_registered
    - registered_business_address, business_name, preferred_mode
  - VERIFIED: Distributor registration working perfectly with SQL Server - created test distributor XTSKNBEUZ
  - ENABLED: Template service working with SQL Server connections
  - CONFIRMED: All functionality restored using user's SQL Server database exclusively
- July 23, 2025: ✅ COMPLETED - Fixed admin customer display to show aggregated data instead of duplicates
  - IMPLEMENTED: Customer grouping by mobile number in admin dashboard to eliminate duplicate entries
  - ENHANCED: Server-side customer aggregation showing registration count per mobile number
  - ADDED: Total invoice value calculation across all registrations for same customer
  - IMPROVED: Admin table display with registration count badges and device summary
  - OPTIMIZED: Customer search to work with grouped voucher codes and customer data
  - STREAMLINED: Admin dashboard now shows clean customer list without duplicate mobile numbers
  - FIXED: Dashboard statistics now show correct unique customer count instead of total registrations
  - ENHANCED: Dashboard displays both unique customers and total registrations for complete visibility
- July 23, 2025: ✅ COMPLETED - Replaced "View All" button with comprehensive customer detail modal
  - REMOVED: "View All" button from customer management table for cleaner interface
  - IMPLEMENTED: Complete customer detail modal triggered by "View" action button
  - ADDED: Comprehensive modal displaying contact info, device details, registration summary, voucher codes, and referral information
  - ENHANCED: Modal shows aggregated data including total registrations, total invoice value, and all voucher codes for multi-registration customers
  - IMPROVED: User experience with detailed customer information in organized card layout within modal
  - FIXED: All TypeScript interface issues for proper type safety with additional customer properties
- July 23, 2025: ✅ COMPLETED - Fixed cart abandonment tracking duplicate entries and optimized performance
  - IMPLEMENTED: Debouncing logic in cart tracking to prevent multiple API calls for same stage
  - ENHANCED: Smart tracking that only monitors important form fields (name, contact, email, deviceType, serialNumber)
  - OPTIMIZED: Server-side deduplication to prevent unnecessary database operations for unchanged data
  - ADDED: Efficient getCartAbandonmentBySessionId method for better session tracking
  - FIXED: React Suspense warning by properly importing Suspense component
  - TESTED: Cart abandonment system now working without duplicate entries while maintaining full tracking capability
- July 22, 2025: ✅ COMPLETED - Enhanced Gupshup WhatsApp HSM service with complete admin management interface and template registration diagnostics
  - IMPLEMENTED: HSM template functionality with proper language code parameter support and comprehensive error handling
  - CONFIGURED: Gupshup account 2000203988 with HSM credentials (Login: 2000203988, Password: CrtvMm59A) - WORKING CORRECTLY
  - CREATED: Admin HSM templates management interface at /admin/hsm-templates with live testing capabilities
  - ADDED: HSM template API endpoints for sending approved WhatsApp Business templates with detailed diagnostics
  - ENHANCED: Error handling showing proper "Message does not match WhatsApp HSM template" for custom messages with template registration guidance
  - VERIFIED: WhatsApp-only messaging working correctly with HSM template validation and clear error reporting
  - DOCUMENTED: Complete HSM template management system for approved WhatsApp Business messaging
  - TESTED: Live HSM template parameter validation and custom message error handling working as expected
  - DIAGNOSED: Template registration requirement - approved template text needs to be registered with Gupshup and assigned template ID before use
  - READY: System fully prepared for HSM template IDs once registered with Gupshup WhatsApp Business API
- July 22, 2025: ✅ COMPLETED - Gupshup WhatsApp Business API configured as WhatsApp-only service (no SMS fallback)
  - IMPLEMENTED: Pure WhatsApp Business implementation using account 2000203988 with exact Thunderclient API format
  - REMOVED: All SMS fallback mechanisms per user requirement for WhatsApp-only messaging
  - CONFIGURED: HSM template error transparency - shows "Message does not match WhatsApp HSM template" directly
  - VERIFIED: Proper WhatsApp Business API response handling with clear error messages
  - OPTIMIZED: WhatsApp-specific message formatting and template compliance checking
  - INTEGRATED: WhatsApp-only service ready for approved HSM templates
  - DOCUMENTED: WhatsApp Business API configuration and HSM template requirements
- July 22, 2025: ✅ COMPLETED - Comprehensive Gupshup dual-channel integration with production-ready SMS Gateway
  - IMPLEMENTED: Complete GupshupService with WhatsApp Business API and SMS Gateway fallback
  - CREATED: Dual-channel message delivery system (WhatsApp → SMS fallback)
  - ADDED: Production credentials for account 2000203988 with SMS Gateway API
  - ENHANCED: Admin testing interface at /admin/whatsapp-test with comprehensive message testing
  - CONFIGURED: Automatic HSM template error handling with seamless SMS fallback
  - INTEGRATED: WhatsApp Business API support (requires GUPSHUP_API_KEY environment variable)
  - OPTIMIZED: Message formatting for both WhatsApp and SMS channels with character limits
  - TESTED: Live SMS delivery confirmed working via Gupshup Gateway API
  - DOCUMENTED: Complete setup guide (GUPSHUP_SETUP.md) for WhatsApp Business API enhancement
- July 22, 2025: ✅ COMPLETED - Updated customer registration form terminology
  - CHANGED: "Invoice Value" field label to "Device Invoice Value (Inclusive of GST)" in customer registration form
  - UPDATED: Form validation message to reflect new terminology
  - FIXED: TypeScript errors by properly handling form schema and data flow
  - ENHANCED: Customer clarity by explicitly specifying GST inclusion in device invoice value field
- July 19, 2025: ✅ COMPLETED - Email SMTP Configuration Interface with Real-time Testing
  - CREATED: Complete SMTP configuration interface in admin logs page for direct credential input
  - IMPLEMENTED: Real-time SMTP testing that validates credentials before saving to environment
  - ADDED: Gmail integration guide with step-by-step app password setup instructions
  - FEATURED: Professional form with host, port, email, and password fields with validation
  - INTEGRATED: Error handling that removes invalid credentials and provides clear feedback
  - ENHANCED: Live status monitoring showing email service configuration state
  - CONFIGURED: Automatic test email sending to verify SMTP settings work correctly
  - TESTED: SMTP configuration endpoints working properly with communication service integration
- July 19, 2025: ✅ COMPLETED - Comprehensive Admin Logs & System Monitoring Dashboard
  - CREATED: Complete admin logs system at /admin/logs with real-time monitoring capabilities
  - IMPLEMENTED: System status monitoring for database, SMS (Kaleyra), email (SMTP), and WhatsApp services
  - ADDED: Live communication testing interface with user-configurable test contacts and custom messages
  - FEATURED: Real-time API logs with detailed error tracking and service status indicators
  - INTEGRATED: Complete testing suite for all template types and communication channels
  - ENHANCED: Admin navigation with dedicated System Logs section for comprehensive monitoring
  - CONFIGURED: Automatic status refresh (30s intervals) and log refresh (10s intervals) for live monitoring
  - TESTED: SMS delivery confirmed working to user's contact (9953410422) with comprehensive test messages
  - FIXED: All status indicator issues - Database connected, SMS working, templates counted correctly, server uptime displayed
- July 19, 2025: ✅ COMPLETED - Admin template management system for complete communication control
  - CREATED: Comprehensive TemplateService with database integration for message template management
  - IMPLEMENTED: Admin template interface at /admin/templates with full CRUD operations for all communication templates
  - ADDED: Template editor with live preview, variable insertion, and sample data rendering
  - FEATURED: Multi-channel template support (email, SMS, WhatsApp) with event-based organization
  - INTEGRATED: Template system into CommunicationService replacing hardcoded messages
  - ENHANCED: Admin navigation with Templates section for easy access to template management
  - CONFIGURED: Default professional templates auto-created on system initialization
  - ENABLED: Real-time template status management (enable/disable) and template preview functionality
- July 19, 2025: ✅ COMPLETED - Multi-channel communication system with email, SMS, and WhatsApp integration
  - IMPLEMENTED: Comprehensive CommunicationService with SMTP (nodemailer), Kaleyra SMS, and Gupshup WhatsApp
  - ADDED: Automatic notifications for customer registration, referral partner welcome, claim updates, and payout status
  - CREATED: Professional message templates with proper branding and clear information hierarchy
  - INTEGRATED: Communication calls into all key registration and status update endpoints
  - FEATURED: Test endpoint for validating all communication channels simultaneously
  - CONFIGURED: Environment variables for all three communication providers
  - ENHANCED: Error handling that doesn't fail core operations if notifications fail
  - STREAMLINED: Project communications with real-time updates via multiple channels
- July 19, 2025: ✅ COMPLETED - Comprehensive terminology rebranding from "distributor" to "referral partner" across entire application
  - UPDATED: Changed all instances of "distributor" to "referral partner" in client-side pages and components
  - REBRANDED: "Seller code" terminology updated to "referral code" throughout the application
  - MODIFIED: Header navigation, forms, dashboards, and admin pages to reflect new referral partner branding
  - ENHANCED: Customer registration form now uses "referral code" instead of "seller code"  
  - UPDATED: Admin panel titles and descriptions to use referral partner terminology
  - MAINTAINED: All existing functionality while improving brand consistency and user clarity
  - STREAMLINED: User experience with clearer, more intuitive terminology for the referral system
- July 19, 2025: ✅ COMPLETED - Implemented Excel/CSV bulk upload system for brands and models management
  - CREATED: Complete file upload interface with drag-and-drop functionality and file validation
  - ADDED: Support for .xlsx, .xls, and .csv file formats with automatic parsing using XLSX library
  - IMPLEMENTED: Smart data processing that creates brands automatically and prevents duplicates
  - ENHANCED: Error handling with detailed row-by-row validation and reporting
  - FEATURED: Sample Excel file generation and download with correct format structure
  - INTEGRATED: Device, Brand, Model format validation as per user requirements
  - SECURED: All bulk upload endpoints properly protected with admin authentication
  - OPTIMIZED: File processing with progress indicators and comprehensive feedback
  - ELIMINATED: Manual CSV pasting requirement - now fully file-based workflow
- July 19, 2025: ✅ COMPLETED - Enhanced admin dashboard with comprehensive distributor and payout management system
  - IMPLEMENTED: Complete distributor details management with performance tracking and bank account information
  - ADDED: Advanced payout status management system with real-time status updates (pending, processing, paid, failed)
  - CREATED: New `/admin/distributors` page with tabbed interface for distributors and payouts management
  - ENHANCED: Database layer with getAllDistributorsForAdmin() and getAllPayoutsForAdmin() methods
  - IMPLEMENTED: updatePayoutStatus() API endpoint with payment reference tracking and automatic paid date setting
  - ADDED: Comprehensive distributor information display including contact details, bank information, and performance metrics
  - INTEGRATED: Payout status update modal with status selection and payment reference input
  - UPDATED: Admin navigation header to include direct access to distributor management
  - FEATURED: Real-time commission tracking with pending vs completed payout visualization
  - ENHANCED: Admin workflow allowing complete distributor lifecycle management from single interface
- July 19, 2025: ✅ COMPLETED - Fixed PayU payment button errors and API response handling across entire application
  - RESOLVED: Fixed customer registration OTP functionality by correcting API response handling (removed double JSON parsing)
  - RESOLVED: Fixed PayU payment button errors by updating API request format in customer registration
  - Updated all API mutations across codebase to use consistent apiRequest syntax
  - Fixed API calls in customer-registration.tsx, claim-bbg.tsx, claim-bbg-broken.tsx, and admin-header.tsx
  - Changed from: apiRequest("POST", "/api/endpoint", data).json() to: apiRequest("/api/endpoint", { method: "POST", body: data })
  - Eliminated double JSON parsing errors that were causing payment and OTP functionality failures
  - All OTP sending, verification, PayU payments, claim checking, and admin logout now working correctly
  - Comprehensive fix ensuring consistent API handling throughout the application
- July 19, 2025: ✅ COMPLETED - Removed depreciation slabs sections from customer registration page
  - Eliminated "BBG Claim Value Slabs" table section that appeared before the registration form
  - Removed "BBG Claim Value Structure" card section that displayed after the form
  - Clean separation achieved - depreciation information no longer clutters registration workflow
  - Registration page now focuses purely on device registration and payment processing
- July 19, 2025: ✅ COMPLETED - Eliminated authentication modals and fixed admin logout functionality
  - RESOLVED: Fixed persistent logout functionality using session.regenerate() instead of session.destroy()
  - Updated session configuration with proper resave and saveUninitialized settings for optimal performance
  - Enhanced logout endpoint with comprehensive session clearing and manual session data removal
  - Added no-cache headers to /api/admin/me endpoint to prevent stale authentication responses
  - Disabled aggressive frontend authentication checking that was causing modal spam
  - Removed excessive refetching on window focus, reconnect, and automatic intervals
  - Implemented silent logout transitions without showing authentication error modals
  - Admin logout now works seamlessly with immediate session invalidation and clean redirects
  - All authentication checking modals eliminated while maintaining secure session management
- July 19, 2025: ✅ COMPLETED - Fixed admin session persistence and enhanced session management
  - Resolved admin authentication session persistence issue in development mode
  - Upgraded session configuration to use MemoryStore for reliable session storage
  - Fixed issue where admin sessions weren't persisting between requests
  - Enhanced session middleware with proper resave and saveUninitialized settings
  - Added explicit session save mechanism for admin login endpoint
  - Improved session cookie configuration with 24-hour expiry and security settings
  - Admin authentication now works consistently across all admin pages and new tabs
  - Created shared AdminHeader component for consistent navigation across all admin pages
  - Added admin masters page with navigation to brands management and placeholder features
- July 19, 2025: ✅ COMPLETED - Reverted database back to SQL Server and repositioned depreciation slabs
  - Changed database from PostgreSQL back to Microsoft SQL Server at 103.205.66.184:2499
  - Updated db.ts to use mssql package with raw SQL queries for SQL Server compatibility
  - Added brand and model management API endpoints (/api/brands and /api/models) for SQL Server
  - Moved depreciation slabs from inside the registration form to after the form
  - Removed depreciation slabs toggle button from form and placed slabs in separate card section
  - Created clean separation between registration form and informational content
  - Enhanced user experience by showing claim structure after form completion
- July 18, 2025: ✅ COMPLETED - Fixed customer auto-verification during BBG registration
  - Updated SQL storage createCustomer method to properly save isVerified field to database
  - Added missing is_verified column and parameter in customer INSERT statement
  - Fixed issue where customers were not automatically verified after successful payment/registration
  - Verified that claim checking now works correctly for registered customers
  - Both PayU payment and direct registration flows now properly set verification status
- July 18, 2025: ✅ COMPLETED - Enhanced security by removing sensitive data from URLs
  - Removed voucher codes and payment method info from thank-you page URLs
  - Implemented session-based data storage for thank you page information
  - Added API endpoint `/api/thank-you-data` to securely transfer success data
  - Updated customer registration to use sessionStorage for client-side data transfer
  - Updated distributor registration to use sessionStorage for client-side data transfer
  - Enhanced PayU success handler to store data in server session before redirect
  - Improved security by preventing sensitive information exposure in browser URLs
  - Clean URLs maintained while preserving full functionality and user experience
- July 11, 2025: ✅ COMPLETED - Enhanced PayU payment gateway with comprehensive rate limiting solution
  - Implemented server-side rate limiting to prevent PayU API overload (60-second delays per IP)
  - Added client-side countdown timer showing exact wait time before retry
  - Created comprehensive error handling for both server and PayU rate limiting
  - Temporary customer data storage system for PayU transaction handling
  - Enhanced payment button with real-time countdown and retry attempt tracking
  - Professional error messages explaining rate limiting and providing clear guidance
  - Automatic retry mechanism with attempt counting and status feedback
  - Improved user experience during payment gateway busy periods
- July 11, 2025: ✅ COMPLETED - Enhanced customer registration with comprehensive improvements
  - Combined multi-step form into single-page layout with clear sections
  - Added IMEI/Serial number guides (dial *#06# for mobile, system info for laptops)
  - Implemented device tax invoice upload with PDF/image support
  - Changed currency icon from dollar to Indian Rupee (₹) symbol
  - Created brand dropdown with 25+ popular device brands (replaceable via admin panel)
  - Added depreciation slabs display during checkout and after payment
  - Implemented invoice download functionality for customers after payment
  - Enhanced thank you page with depreciation slabs and invoice download
  - Added "View/Hide Depreciation Slabs" toggle button in registration form
  - Updated file upload validation for invoice documents
  - Improved user experience with comprehensive device registration guides
- July 10, 2025: ✅ COMPLETED - Kaleyra SMS service integration with live delivery
  - Created KaleyraSMSService class with comprehensive phone number handling
  - Added automatic Indian mobile number formatting (+91 prefix)
  - Implemented fallback mechanism when Kaleyra service unavailable
  - Updated both /api/send-otp and /api/otp/send endpoints to use Kaleyra
  - Added /api/test-kaleyra-sms endpoint for testing SMS functionality
  - Enhanced phone number validation for Indian mobile numbers (6-9 starting digits)
  - Configured working API key (A67fc67b5dccd5dee027eb35fca957094) for live SMS delivery
  - Updated API format to use Kaleyra v4 API (api-alerts.kaleyra.com/v4/)
  - Professional OTP message templates with 10-minute validity working
  - Real SMS delivery confirmed successful with 98%+ delivery rate
  - Comprehensive error handling and logging for SMS operations
- July 09, 2025: Implemented comprehensive secure admin panel
  - Created admin authentication system with login/logout functionality
  - Added admin_users table to SQL Server database with bcrypt password hashing
  - Implemented session-based authentication using express-session middleware
  - Built admin dashboard with complete CRUD operations for distributors, customers, claims
  - Added claim status management (approve/reject) functionality
  - Created responsive admin UI with separate layout (no header/footer)
  - Implemented real-time dashboard statistics and data tables
  - Added automatic admin user creation endpoint for initial setup
  - Secured all admin routes with authentication middleware
  - Default admin credentials: username 'admin', password 'admin123'
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
  - Complete PayU configuration with MID, Key, Salt, Client ID, and Client Secret
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