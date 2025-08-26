import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { nanoid } from 'nanoid';

// Validate AWS credentials at startup
function validateAWSCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION;
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  const missing = [];
  if (!accessKeyId || accessKeyId.trim() === '') missing.push('AWS_ACCESS_KEY_ID');
  if (!secretAccessKey || secretAccessKey.trim() === '') missing.push('AWS_SECRET_ACCESS_KEY');
  if (!region || region.trim() === '') missing.push('AWS_REGION');
  if (!bucketName || bucketName.trim() === '') missing.push('AWS_S3_BUCKET_NAME');

  if (missing.length > 0) {
    console.error('❌ Missing or empty AWS credentials:', missing.join(', '));
    console.error('🔧 Please configure the following environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    return false;
  }

  console.log('✅ AWS S3 credentials validated successfully');
  console.log(`🪣 Using S3 bucket: ${bucketName} in region: ${region}`);
  return true;
}

// Validate credentials
const credentialsValid = validateAWSCredentials();

// S3 Client Configuration - only if credentials are valid
let s3Client: S3Client;
let BUCKET_NAME: string;

if (credentialsValid) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
} else {
  // Create a dummy client that will throw errors
  BUCKET_NAME = 'unconfigured-bucket';
}

// S3 Service Class
export class S3Service {
  private bucket: string;
  private client: S3Client | null;
  private credentialsValid: boolean;

  constructor() {
    this.bucket = BUCKET_NAME;
    this.client = credentialsValid ? s3Client : null;
    this.credentialsValid = credentialsValid;
  }

  private validateCredentials() {
    if (!this.credentialsValid || !this.client) {
      throw new Error(
        'AWS S3 credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME environment variables.'
      );
    }
  }

  // Upload file to S3
  async uploadFile(file: Buffer, fileName: string, mimeType: string, folder = 'uploads', isPublic = false): Promise<string> {
    this.validateCredentials();
    
    const key = `${folder}/${nanoid()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ACL: isPublic ? 'public-read' : 'private', // Make public if specified
    });

    try {
      await this.client!.send(command);
      return key; // Return the S3 key for database storage
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get signed URL for secure file access
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    this.validateCredentials();
    
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.client!, command, { expiresIn });
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    this.validateCredentials();
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.client!.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get file URL (for public files)
  getPublicUrl(key: string): string {
    const region = process.env.AWS_REGION || 'ap-south-1';
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}

// Multer S3 Configuration for direct uploads
export const createS3Upload = (folder = 'uploads', isPublic = false, allowCSV = false) => {
  if (!credentialsValid) {
    // Return a multer instance that immediately throws an error
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 1 },
      fileFilter: (req, file, cb) => {
        cb(new Error('AWS S3 credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME environment variables.'));
      },
    });
  }

  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      acl: isPublic ? 'public-read' : 'private',
      key: function (req: any, file: any, cb: any) {
        const uniqueId = nanoid();
        const extension = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${Date.now()}-${uniqueId}${extension}`;
        cb(null, `${folder}/${fileName}`);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Base allowed file types
      let allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      
      // Add CSV and Excel types for bulk uploads
      if (allowCSV) {
        allowedTypes = allowedTypes.concat([
          'text/csv',
          'application/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]);
      }
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const fileTypes = allowCSV ? 'JPEG, PNG, PDF, CSV, and Excel' : 'JPEG, PNG, and PDF';
        cb(new Error(`Invalid file type. Only ${fileTypes} files are allowed.`));
      }
    },
  });
};

// Export singleton instance
export const s3Service = new S3Service();