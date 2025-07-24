import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { nanoid } from 'nanoid';

// S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'xtracover-bbg-storage';

// S3 Service Class
export class S3Service {
  private bucket: string;
  private client: S3Client;

  constructor() {
    this.bucket = BUCKET_NAME;
    this.client = s3Client;
  }

  // Upload file to S3
  async uploadFile(file: Buffer, fileName: string, mimeType: string, folder = 'uploads'): Promise<string> {
    const key = `${folder}/${nanoid()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ACL: 'private', // Files are private by default
    });

    try {
      await this.client.send(command);
      return key; // Return the S3 key for database storage
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Get signed URL for secure file access
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  // Get file URL (for public files)
  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}

// Multer S3 Configuration for direct uploads
export const createS3Upload = (folder = 'uploads') => {
  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      acl: 'private',
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
      // Allowed file types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
      }
    },
  });
};

// Export singleton instance
export const s3Service = new S3Service();