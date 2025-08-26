# XtraCover BBG - Local Development Setup Guide

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

### Required Software
1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

### Database Setup
The project uses Microsoft SQL Server. You have two options:

#### Option 1: Use Existing Production Database (Recommended)
- The project is configured to use the existing SQL Server at `103.205.66.184:2499`
- Database: `prexoDB`
- No additional setup needed if you have access credentials

#### Option 2: Local SQL Server Setup
- Install SQL Server Express or Developer Edition
- Create a new database named `prexoDB`
- Update connection string in environment variables

## Step-by-Step Local Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd xtracover-bbg
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=103.205.66.184
DB_PORT=2499
DB_NAME=prexoDB
DB_USER=your_database_username
DB_PASSWORD=your_database_password

# Admin Authentication
ADMIN_SESSION_SECRET=your_secure_session_secret_here

# Communication Services
# Kaleyra SMS Configuration
KALEYRA_API_KEY=your_kaleyra_api_key
KALEYRA_SID=your_kaleyra_sid
KALEYRA_SENDER_ID=your_sender_id

# Gupshup WhatsApp Configuration
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_APP_NAME=your_gupshup_app_name
GUPSHUP_SOURCE_PHONE=your_whatsapp_business_number

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name

# PayU Payment Gateway (optional for testing)
PAYU_MERCHANT_KEY=your_payu_merchant_key
PAYU_MERCHANT_SALT=your_payu_merchant_salt
PAYU_MERCHANT_ID=your_payu_merchant_id

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=your_from_email_address
```

### 4. Start the Development Server
```bash
npm run dev
```

The application will start on:
- Frontend: http://localhost:5000 (served by Express)
- Backend API: http://localhost:5000/api

### 5. Access the Application

#### Public Pages:
- **Homepage**: http://localhost:5000
- **BBG Registration**: http://localhost:5000/register
- **Acer Registration**: http://localhost:5000/acer/register
- **Submit Claim**: http://localhost:5000/claim
- **Referral Partner Registration**: http://localhost:5000/distributor/register

#### Admin Panel:
- **Admin Login**: http://localhost:5000/admin/login
- **Default Credentials**: 
  - Username: `admin`
  - Password: `XtraCover2025!#SecureAdmin`

#### Admin Dashboard Sections:
- Dashboard Overview
- Customer Management
- Claims Management
- Referral Partners Management
- Brand & Model Management
- Claim Value Slabs
- Communication Templates
- SMTP Settings
- WhatsApp Configuration
- Theme Settings
- System Logs

## Development Workflow

### Available NPM Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build the application for production
npm run start        # Start production server
npm run type-check   # Run TypeScript type checking
```

### Project Structure
```
xtracover-bbg/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Node.js backend
│   ├── routes.ts          # API route definitions
│   ├── sql-storage.ts     # Database operations
│   ├── communication-service.ts  # SMS/Email/WhatsApp services
│   └── index.ts           # Express server setup
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schema and types
└── uploads/               # File upload directory (local fallback)
```

## Testing the Application

### 1. Test Customer Registration
1. Go to http://localhost:5000/register
2. Fill in customer details
3. Upload invoice and payment proof
4. Verify OTP functionality (requires SMS service setup)

### 2. Test Claim Submission
1. Go to http://localhost:5000/claim
2. Enter BBG voucher code
3. Fill claim details with address
4. Select pickup time slot

### 3. Test Admin Features
1. Login to admin panel
2. View and manage customers/claims
3. Test communication templates
4. Configure theme settings

### 4. Test Referral Partner Flow
1. Go to http://localhost:5000/distributor/register
2. Register as referral partner
3. Login via http://localhost:5000/distributor/login
4. View dashboard and commission tracking

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Verify database credentials in `.env`
- Ensure SQL Server is accessible from your network
- Check if port 2499 is open

#### File Upload Issues
- Ensure `uploads/` directory exists and is writable
- For S3 uploads, verify AWS credentials
- Check file size limits (default: 5MB)

#### SMS/Email Not Working
- Verify API keys in `.env`
- Check Kaleyra/Gupshup service status
- Test SMTP settings with a simple email client

#### Payment Gateway Issues
- PayU requires specific configuration for testing/production
- Ensure correct merchant keys are used
- Test with PayU sandbox environment first

### Development Tips

1. **Hot Reload**: Changes to frontend files auto-reload, backend changes require restart
2. **Database Changes**: Use SQL management tools to modify database schema
3. **Logging**: Check console output for detailed error messages
4. **API Testing**: Use tools like Postman to test backend endpoints

### Environment-Specific Notes

#### Development Environment
- Uses `NODE_ENV=development`
- Detailed error logging enabled
- File uploads go to local `uploads/` directory
- CORS enabled for frontend development

#### Production Considerations
- Set `NODE_ENV=production`
- Use environment variables for all secrets
- Configure reverse proxy (nginx recommended)
- Set up SSL certificates
- Use cloud storage (S3) for file uploads
- Configure proper database backup strategy

## Next Steps

After successful local setup:
1. Test all features thoroughly
2. Configure production environment variables
3. Set up deployment pipeline
4. Configure monitoring and logging
5. Implement backup procedures

For deployment to AWS server, refer to the AWS deployment guide.