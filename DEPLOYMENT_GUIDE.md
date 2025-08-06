# BBG Project Deployment Guide

## Project Overview
This document provides complete deployment instructions for the Xtracover BBG (Buy Back Guarantee) system.

## Current Project Structure
```
├── client/          # React frontend (TypeScript, Vite)
├── server/          # Node.js backend (Express, TypeScript)
├── shared/          # Shared schemas and types
├── uploads/         # Local file storage (development)
└── package.json     # Dependencies and scripts
```

## Environment Variables Required

### Database Configuration (SQL Server)
```env
DB_HOST=103.205.66.184
DB_PORT=2499
DB_NAME=prexoDB
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_ENCRYPT=true
```

### AWS S3 Configuration
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
```

### PayU Payment Gateway
```env
PAYU_MERCHANT_ID=your_merchant_id
PAYU_MERCHANT_KEY=your_merchant_key
PAYU_SALT=your_salt_key
PAYU_CLIENT_ID=your_client_id
PAYU_CLIENT_SECRET=your_client_secret
```

### SMS Service (Kaleyra)
```env
KALEYRA_API_KEY=your_kaleyra_api_key
KALEYRA_SENDER_ID=XTCOVR
```

### WhatsApp Business API (Gupshup)
```env
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_APP_NAME=your_app_name
```

### Email Configuration (SMTP)
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email_username
SMTP_PASS=your_email_password
SMTP_FROM_EMAIL=noreply@xtracover.com
SMTP_FROM_NAME=Xtracover BBG
```

### Session & Security
```env
SESSION_SECRET=your_secure_session_secret
NODE_ENV=production
```

## Database Setup

### Required Tables
The application will automatically create all required tables on first run:
- customers
- distributors
- claims
- admin_users
- brands
- models
- otp_verifications
- message_templates
- commission_payouts
- cart_abandonments
- acer_imei_validation
- sessions

### Default Admin Account
- Username: `admin`
- Password: `admin123`
- **Change this immediately in production**

## File Upload Configuration

### AWS S3 Setup
1. Create an S3 bucket
2. Configure bucket policy for public read access on uploaded files
3. Set up IAM user with S3 permissions
4. Configure CORS for your domain

### Local Fallback
If S3 is not configured, files are stored in the `uploads/` directory.

## Deployment Steps

### 1. Server Requirements
- Node.js 18+ 
- PM2 (for process management)
- Nginx (reverse proxy)
- SSL certificate

### 2. Application Deployment
```bash
# Clone/upload project files
npm install
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Key Features Implemented

### Customer Registration
- D2C purchase registration with PayU payment
- Acer BBG registration with IMEI validation
- OTP verification via SMS
- File uploads for invoices
- Universal BBG voucher code system

### Referral Partner System
- Partner registration with KYC details
- Commission tracking and payouts
- Dashboard for performance monitoring

### Admin Panel
- Customer management with CSV export
- Referral partner management with CSV export
- Claims processing
- Template management for communications
- Comprehensive logging and monitoring

### Communication System
- Multi-channel notifications (Email, SMS, WhatsApp)
- Template-based messaging
- HSM WhatsApp templates for production

## Security Features
- Admin session-based authentication
- OTP verification for customer registration
- SQL injection protection
- File upload validation
- CORS configuration

## Monitoring & Logs
- Application logs via console
- Admin logs dashboard
- Cart abandonment tracking
- Performance monitoring

## Support & Maintenance
- Regular database backups recommended
- Monitor S3 storage usage
- Update dependencies regularly
- Review admin access logs

## Contact Information
For technical support during deployment, refer to the development team or system administrator.