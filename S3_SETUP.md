# AWS S3 Integration Setup Guide

## Overview
This guide explains how to set up AWS S3 for secure cloud storage of documents and images in the Xtracover BBG application.

## Benefits of S3 Storage
- **Unlimited Scalability**: Store unlimited files without server storage constraints
- **Enhanced Security**: Private file access with signed URLs and encryption
- **Global CDN**: Fast file access from anywhere in the world
- **Cost Effective**: Pay only for storage used, with automatic backups
- **Reliability**: 99.999999999% (11 9's) durability guarantee

## AWS Setup Instructions

### Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com) and create an account
2. Complete the billing setup (S3 has a generous free tier)

### Step 2: Create S3 Bucket
1. Navigate to S3 service in AWS Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `xtracover-bbg-storage-yourname`)
4. Select region (recommended: `us-east-1` for cost optimization)
5. Keep default settings for security (private bucket)
6. Click "Create bucket"

### Step 3: Create IAM User
1. Go to IAM service in AWS Console
2. Click "Users" → "Create user"
3. Enter username (e.g., `xtracover-s3-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"

### Step 4: Set Permissions
1. Click "Attach existing policies directly"
2. Search for and select `AmazonS3FullAccess`
3. Click "Next: Tags" (skip this step)
4. Click "Next: Review"
5. Click "Create user"
6. **IMPORTANT**: Copy the Access Key ID and Secret Access Key immediately

### Step 5: Configure Application
1. Go to Admin Panel → Storage Management
2. Enter your AWS credentials:
   - **Access Key ID**: From Step 4
   - **Secret Access Key**: From Step 4
   - **Bucket Name**: From Step 2
   - **Region**: From Step 2
3. Click "Update Configuration"
4. Restart the application for changes to take effect

## Environment Variables
Add these to your environment variables or `.env` file:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=xtracover-bbg-storage
AWS_REGION=us-east-1
```

## File Organization
Files are organized in the S3 bucket as follows:
```
xtracover-bbg-storage/
├── documents/
│   ├── pan-copies/
│   ├── gst-certificates/
│   ├── msme-certificates/
│   ├── cancelled-cheques/
│   └── invoices/
└── temp/
    └── bulk-uploads/
```

## Security Features
- **Private Bucket**: All files are private by default
- **Signed URLs**: Temporary URLs for secure file access (1 hour expiry)
- **Encryption**: Files encrypted at rest using AWS S3 encryption
- **Access Control**: Only authenticated admin users can access files

## Cost Estimation
AWS S3 pricing (as of 2024):
- **Storage**: $0.023 per GB per month
- **Requests**: $0.0004 per 1,000 PUT requests
- **Data Transfer**: First 1 GB out free per month

**Example**: 1,000 documents (5MB each) = 5GB storage
- Monthly cost: ~$0.12
- Annual cost: ~$1.44

## Troubleshooting

### Common Issues
1. **Access Denied**: Check IAM permissions and bucket policies
2. **Bucket Not Found**: Verify bucket name and region
3. **Invalid Credentials**: Regenerate access keys in IAM
4. **Region Mismatch**: Ensure bucket and client use same region

### Testing S3 Configuration
1. Go to Admin Panel → Storage Management
2. Check the "Current Storage Configuration" section
3. Status should show "S3 Configured: ✅"
4. Upload a test file to verify functionality

## Migration from Local Storage
If you're currently using local storage:
1. Set up S3 as described above
2. All new uploads will go to S3 automatically
3. Existing local files remain accessible
4. Optionally migrate existing files manually

## Backup and Recovery
- **Automatic Backups**: S3 provides automatic redundancy
- **Cross-Region Replication**: Available for additional protection
- **Version Control**: Enable versioning for file history
- **Disaster Recovery**: Files accessible even if main server fails

## Security Best Practices
1. **Never commit AWS credentials to code**
2. **Use IAM roles in production** (not individual users)
3. **Enable CloudTrail** for access logging
4. **Regular key rotation** (every 90 days)
5. **Monitor usage** with AWS Cost Explorer

## Support
For technical support with AWS S3 integration:
1. Check AWS documentation
2. Review application logs
3. Contact system administrator
4. Submit support ticket with error details

---

**Note**: This integration provides enterprise-grade file storage with minimal operational overhead and excellent scalability for growing businesses.