# XtraCover BBG - FileZilla AWS Deployment Guide

## Overview

This guide will help you deploy the XtraCover BBG application to your AWS server using FileZilla FTP client.

## Prerequisites

### Required Information
Before starting, gather the following from your AWS setup:

1. **AWS EC2 Instance Details**:
   - Public IP address (e.g., `54.123.45.67`)
   - SSH Key Pair (.pem file)
   - Security Group configured for ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Server Access Credentials**:
   - Username: typically `ubuntu` for Ubuntu instances or `ec2-user` for Amazon Linux
   - Private key file (.pem format)

3. **FileZilla Software**:
   - Download from: https://filezilla-project.org/
   - Install FileZilla Client (not Server)

## Step 1: Prepare Your Local Project

### 1.1 Build the Application
```bash
# In your local project directory
npm run build
```

### 1.2 Create Production Environment File
Create `.env.production` with your production values:
```env
# Production Database
DB_HOST=103.205.66.184
DB_PORT=2499
DB_NAME=prexoDB
DB_USER=production_db_user
DB_PASSWORD=production_db_password

# Production Admin Session
ADMIN_SESSION_SECRET=super_secure_production_secret_here

# Production Communication Services
KALEYRA_API_KEY=production_kaleyra_key
KALEYRA_SID=production_sid
KALEYRA_SENDER_ID=XTRACVR

# Production AWS S3
AWS_ACCESS_KEY_ID=production_access_key
AWS_SECRET_ACCESS_KEY=production_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=xtracover-bbg-production

# Production PayU
PAYU_MERCHANT_KEY=production_merchant_key
PAYU_MERCHANT_SALT=production_salt
PAYU_MERCHANT_ID=production_merchant_id

# Production Email
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=production_smtp_user
SMTP_PASSWORD=production_smtp_password
FROM_EMAIL=noreply@xtracover.com

NODE_ENV=production
PORT=3000
```

### 1.3 Prepare Files for Upload
Create a deployment folder with these files:
```
deployment-package/
├── server/                    # Backend files
├── client/dist/              # Built frontend (after npm run build)
├── shared/                   # Shared types
├── node_modules/             # Dependencies (or install on server)
├── package.json
├── package-lock.json
├── .env.production          # Rename to .env on server
├── ecosystem.config.js      # PM2 configuration
└── uploads/                 # Create empty directory
```

## Step 2: Configure FileZilla for AWS Connection

### 2.1 Convert PEM to PPK (if needed)
If your AWS key is in .pem format, you may need to convert it:

#### Using PuTTYgen (Windows):
1. Download PuTTYgen from: https://www.putty.org/
2. Load your .pem file
3. Save as .ppk format

#### Using OpenSSH (Mac/Linux):
```bash
# Convert if needed (usually not required for FileZilla)
ssh-keygen -p -m PEM -f your-key.pem
```

### 2.2 Configure FileZilla Connection
1. Open FileZilla
2. Go to **File > Site Manager**
3. Click **New Site** and name it "AWS XtraCover Server"
4. Configure as follows:

#### General Tab:
- **Protocol**: SFTP - SSH File Transfer Protocol
- **Host**: Your AWS EC2 public IP (e.g., `54.123.45.67`)
- **Port**: 22
- **Logon Type**: Key file
- **User**: `ubuntu` (or `ec2-user` for Amazon Linux)
- **Key file**: Browse and select your .pem file

#### Advanced Tab (Optional):
- **Server Type**: Unix
- **Default remote directory**: `/home/ubuntu/`

5. Click **Connect**

## Step 3: Server Preparation

### 3.1 Connect via SSH (Alternative to FileZilla for setup)
```bash
# Connect to your AWS instance
ssh -i "your-key.pem" ubuntu@your-aws-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo apt install -y nginx

# Create application directory
sudo mkdir -p /var/www/xtracover-bbg
sudo chown ubuntu:ubuntu /var/www/xtracover-bbg
```

### 3.2 Create PM2 Ecosystem File
Create `ecosystem.config.js` locally:
```javascript
module.exports = {
  apps: [{
    name: 'xtracover-bbg',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/xtracover-bbg-error.log',
    out_file: '/var/log/pm2/xtracover-bbg-out.log',
    log_file: '/var/log/pm2/xtracover-bbg-combined.log',
    time: true
  }]
};
```

## Step 4: Upload Files via FileZilla

### 4.1 Upload Application Files
1. In FileZilla, navigate to `/var/www/xtracover-bbg` on the remote side
2. On local side, navigate to your deployment-package folder
3. Select all files and drag to upload
4. This may take several minutes depending on file size

### 4.2 Upload Structure
Ensure your remote directory looks like:
```
/var/www/xtracover-bbg/
├── server/
├── client/
├── shared/
├── node_modules/ (or install via SSH)
├── package.json
├── .env (renamed from .env.production)
├── ecosystem.config.js
└── uploads/
```

## Step 5: Complete Server Setup

### 5.1 Install Dependencies (if not uploaded)
```bash
# SSH into your server
ssh -i "your-key.pem" ubuntu@your-aws-ip

# Navigate to application directory
cd /var/www/xtracover-bbg

# Install dependencies
npm install --production

# Set proper permissions
sudo chown -R ubuntu:ubuntu /var/www/xtracover-bbg
chmod -R 755 /var/www/xtracover-bbg
```

### 5.2 Start the Application
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5.3 Configure Nginx Reverse Proxy
Create nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/xtracover-bbg
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/xtracover-bbg/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/xtracover-bbg /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: SSL Configuration (Recommended)

### 6.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 7: Monitoring and Maintenance

### 7.1 Check Application Status
```bash
# PM2 status
pm2 status

# View logs
pm2 logs xtracover-bbg

# Restart application
pm2 restart xtracover-bbg
```

### 7.2 Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

## Step 8: Future Updates

### 8.1 Update Process via FileZilla
1. Build locally: `npm run build`
2. Stop application: `pm2 stop xtracover-bbg`
3. Upload changed files via FileZilla
4. Install new dependencies if needed: `npm install --production`
5. Restart application: `pm2 restart xtracover-bbg`

### 8.2 Database Backups
```bash
# Create backup script
nano /home/ubuntu/backup-database.sh
```

Add backup script content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Database backup (adjust for your SQL Server setup)
# This is a template - adjust based on your SQL Server access
echo "Database backup completed: $DATE"
```

## Security Considerations

### 8.1 Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 8.2 File Permissions
```bash
# Ensure proper permissions
sudo chown -R www-data:www-data /var/www/xtracover-bbg/uploads
chmod -R 755 /var/www/xtracover-bbg
chmod 600 /var/www/xtracover-bbg/.env
```

## Troubleshooting

### Common Issues:

1. **FileZilla Connection Failed**
   - Check AWS Security Group allows port 22
   - Verify .pem file permissions: `chmod 400 your-key.pem`
   - Ensure correct username (ubuntu/ec2-user)

2. **Application Won't Start**
   - Check logs: `pm2 logs xtracover-bbg`
   - Verify .env file configuration
   - Check database connectivity

3. **502 Bad Gateway**
   - Application not running: `pm2 restart xtracover-bbg`
   - Check nginx configuration: `sudo nginx -t`
   - Verify port 3000 is available

4. **File Upload Issues**
   - Check uploads directory permissions
   - Verify S3 credentials if using AWS S3
   - Check disk space: `df -h`

## Support

For additional help:
1. Check application logs: `pm2 logs`
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Monitor system resources: `htop`

Your XtraCover BBG application should now be running on your AWS server!