import { db } from "./db";
import sql from 'mssql';

export interface MessageTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  event: 'customer_registration' | 'referral_partner_welcome' | 'claim_status_update' | 'payout_notification' | 'otp_verification' | 'distributor_bbg_notification' | 'bbg_registration_benefits' | 'bbg_purchase_confirmation' | 'device_registration_confirmation' | 'bbg_purchase_within_6_months' | 'bbg_purchase_over_6_months' | 'device_registration_within_6_months' | 'device_registration_over_6_months';
  deviceType?: 'mobile' | 'laptop'; // For device-specific templates
  subject?: string; // For emails
  content: string;
  variables: string[]; // Available template variables
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  event: 'customer_registration' | 'referral_partner_welcome' | 'claim_status_update' | 'payout_notification' | 'otp_verification' | 'distributor_bbg_notification' | 'bbg_registration_benefits' | 'bbg_purchase_confirmation' | 'device_registration_confirmation' | 'bbg_purchase_within_6_months' | 'bbg_purchase_over_6_months' | 'device_registration_within_6_months' | 'device_registration_over_6_months';
  deviceType?: 'mobile' | 'laptop'; // For device-specific templates
  subject?: string;
  content: string;
  variables: string[];
}

export class TemplateService {
  
  // Initialize template tables
  async initializeTables(): Promise<void> {
    try {
      await db.connectDB();
      
      const createTableQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='message_templates' AND xtype='U')
        CREATE TABLE message_templates (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          type NVARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp')),
          event NVARCHAR(100) NOT NULL CHECK (event IN ('customer_registration', 'referral_partner_welcome', 'claim_status_update', 'payout_notification', 'otp_verification', 'distributor_bbg_notification')),
          subject NVARCHAR(500) NULL,
          content NTEXT NOT NULL,
          variables NTEXT NULL, -- JSON array of variable names
          is_active BIT DEFAULT 1,
          created_at DATETIME2 DEFAULT GETDATE(),
          updated_at DATETIME2 DEFAULT GETDATE(),
          UNIQUE(type, event)
        );
      `;
      
      await db.pool.request().query(createTableQuery);
      console.log('Message templates table initialized');
      
      // Add device_type column for template variants (mobile vs laptop)
      await this.updateTableSchema();
      
      // Update constraint to allow new event types
      await this.updateEventConstraint();
      
      // Insert default templates if none exist
      await this.createDefaultTemplates();
    } catch (error) {
      console.error('Error initializing template tables:', error);
      throw error;
    }
  }

  // Update table schema to support device-specific templates
  async updateTableSchema(): Promise<void> {
    try {
      // Add device_type column for template variants (mobile vs laptop)
      const addDeviceTypeQuery = `
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('message_templates') AND name = 'device_type')
        BEGIN
          ALTER TABLE message_templates ADD device_type NVARCHAR(50) NULL CHECK (device_type IN ('mobile', 'laptop') OR device_type IS NULL);
          PRINT '✅ Added device_type column to message_templates table';
        END
      `;
      
      await db.pool.request().query(addDeviceTypeQuery);
      
      // Update UNIQUE constraint to include device_type for template variants
      try {
        // Drop ALL existing unique constraints
        const dropAllUniqueQuery = `
          DECLARE @sql NVARCHAR(MAX) = ''
          SELECT @sql = @sql + 'ALTER TABLE message_templates DROP CONSTRAINT [' + name + ']; '
          FROM sys.key_constraints 
          WHERE type = 'UQ' AND parent_object_id = OBJECT_ID('message_templates')
          
          IF LEN(@sql) > 0
          BEGIN
            EXEC sp_executesql @sql
            PRINT '✅ Dropped all unique constraints on message_templates'
          END
        `;
        
        await db.pool.request().query(dropAllUniqueQuery);
        
        // Add new unique constraint with device_type
        const addUniqueQuery = `
          IF NOT EXISTS (SELECT * FROM sys.key_constraints WHERE type = 'UQ' AND parent_object_id = OBJECT_ID('message_templates') AND name = 'UQ_message_templates_type_event_device')
          BEGIN
            ALTER TABLE message_templates ADD CONSTRAINT UQ_message_templates_type_event_device UNIQUE (type, event, device_type);
            PRINT '✅ Added new unique constraint (type, event, device_type) to message_templates';
          END
        `;
        
        await db.pool.request().query(addUniqueQuery);
      } catch (constraintError: any) {
        console.log('⚠️ Unique constraint update skipped (may already be correct):', constraintError.message);
      }
      
      console.log('✅ Table schema updated for device-specific templates');
    } catch (error: any) {
      console.log('⚠️ Table schema update failed (may already be correct):', error.message);
      // Don't throw error as this is a migration that might not be needed
    }
  }

  // Update event constraint to allow new event types
  async updateEventConstraint(): Promise<void> {
    try {
      // Drop ALL existing event-related CHECK constraints
      const dropConstraintQuery = `
        DECLARE @sql NVARCHAR(MAX) = ''
        SELECT @sql = @sql + 'ALTER TABLE message_templates DROP CONSTRAINT [' + cc.name + ']; '
        FROM sys.check_constraints cc
        INNER JOIN sys.columns c ON cc.parent_object_id = c.object_id
        WHERE cc.parent_object_id = OBJECT_ID('message_templates') 
        AND (cc.name LIKE '%event%' OR c.name = 'event')
        
        IF LEN(@sql) > 0
        BEGIN
          EXEC sp_executesql @sql
          PRINT '✅ Dropped all event CHECK constraints on message_templates'
        END
      `;
      
      await db.pool.request().query(dropConstraintQuery);
      
      // Add new constraint with updated event types
      const addConstraintQuery = `
        ALTER TABLE message_templates 
        ADD CONSTRAINT CHK_message_templates_event 
        CHECK (event IN ('customer_registration', 'referral_partner_welcome', 'claim_status_update', 'payout_notification', 'otp_verification', 'distributor_bbg_notification', 'bbg_registration_benefits', 'bbg_purchase_confirmation', 'device_registration_confirmation', 'bbg_purchase_within_6_months', 'bbg_purchase_over_6_months', 'device_registration_within_6_months', 'device_registration_over_6_months'))
      `;
      
      await db.pool.request().query(addConstraintQuery);
      console.log('✅ Updated event constraint to include distributor_bbg_notification and bbg_registration_benefits');
    } catch (error: any) {
      console.log('⚠️ Event constraint update failed (may already be correct):', error.message);
      // Don't throw error as this is a migration that might not be needed
    }
  }

  // Create default templates
  async createDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = [
        // Referral Partner Welcome Email
        {
          name: 'Referral Partner Welcome - Email',
          type: 'email',
          event: 'referral_partner_welcome',
          subject: 'Welcome to XtraCover BBG Referral Program!',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Welcome to Our Referral Program!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Welcome to the XtraCover BBG Referral Program! You're now part of our partner network.</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>Your Referral Code: {{sellerCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
      <li><strong>Commission:</strong> ₹25 per successful registration</li>
    </ul>
  </div>
  
  <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
    <p style="margin: 0; color: #065f46;"><strong>Next Steps:</strong> Share your referral code with customers to start earning commissions!</p>
  </div>
</div>
          `,
          variables: ['name', 'sellerCode', 'contact', 'email', 'businessName']
        },
        // Referral Partner Welcome SMS
        {
          name: 'Referral Partner Welcome - SMS',
          type: 'sms',
          event: 'referral_partner_welcome',
          content: 'Welcome to XtraCover BBG Referral Program! Your referral code: {{sellerCode}}. Earn ₹25 per successful registration. Start sharing! - XtraCover',
          variables: ['name', 'sellerCode']
        },
        // Referral Partner Welcome WhatsApp
        {
          name: 'Referral Partner Welcome - WhatsApp',
          type: 'whatsapp',
          event: 'referral_partner_welcome',
          content: '🎉 Welcome {{name}}!\n\nYou\'re now a XtraCover BBG Referral Partner!\n\n🔑 Your Referral Code: *{{sellerCode}}*\n💰 Earn ₹25 per successful registration\n\n📢 Start sharing your code with customers to earn commissions!\n\nWelcome to the team! 🤝',
          variables: ['name', 'sellerCode', 'businessName']
        },
        // Claim Status Update Email
        {
          name: 'Claim Status Update - Email',
          type: 'email',
          event: 'claim_status_update',
          subject: 'BBG Claim Update - {{status}} - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Claim Status Update</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Your BBG claim status has been updated:</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <p><strong>Voucher Code:</strong> {{voucherCode}}</p>
      <p><strong>Claim Amount:</strong> Upto ₹{{claimAmount}}</p>
      <p><strong>Status:</strong> {{status}}</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
</div>
          `,
          variables: ['name', 'email', 'contact', 'voucherCode', 'claimAmount', 'status']
        },
        // Payout Notification Email
        {
          name: 'Payout Notification - Email',
          type: 'email',
          event: 'payout_notification',
          subject: 'Payout Update - {{status}} - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Payout Update</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Your commission payout has been updated:</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <p><strong>Amount:</strong> ₹{{amount}}</p>
      <p><strong>Status:</strong> {{status}}</p>
      <p><strong>Reference:</strong> {{paymentReference}}</p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for being our valued partner!</p>
  </div>
</div>
          `,
          variables: ['name', 'email', 'contact', 'amount', 'status', 'paymentReference']
        },
        // OTP Verification SMS
        {
          name: 'OTP Verification - SMS',
          type: 'sms',
          event: 'otp_verification',
          content: 'Your XtraCover BBG OTP is {{otp}}. Valid for 10 minutes. Do not share this code with anyone. - XtraCover',
          variables: ['otp']
        },
        // Distributor BBG Notification - Email
        {
          name: 'Distributor BBG Notification - Email',
          type: 'email',
          event: 'distributor_bbg_notification',
          subject: 'New BBG Purchase Through Your Referral Code {{sellerCode}} - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #254696;">XtraCover BBG</h1>
    <h2 style="color: #374151;">New BBG Purchase Notification</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{distributorName}},</h3>
    <p>Great news! A new BBG has been purchased through your referral code.</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #254696;">
      <h4 style="color: #254696; margin: 0 0 10px 0;">Purchase Details:</h4>
      <p style="margin: 5px 0;"><strong>Customer:</strong> {{customerName}}</p>
      <p style="margin: 5px 0;"><strong>Contact:</strong> {{customerContact}}</p>
      <p style="margin: 5px 0;"><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</p>
      <p style="margin: 5px 0;"><strong>BBG Voucher Code:</strong> {{voucherCode}}</p>
      <p style="margin: 5px 0;"><strong>Your Referral Code:</strong> {{sellerCode}}</p>
    </div>
    
    <div style="background: #dcfce7; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a;">
      <p style="margin: 0; color: #166534;"><strong>Commission Earned:</strong> You'll receive your commission once the customer's BBG registration is verified. Check your dashboard for payout details.</p>
    </div>
    
    <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
      <h4 style="color: #1e40af; margin: 0 0 10px 0;">Your Commission Summary:</h4>
      <p style="margin: 5px 0; color: #1e3a8a;"><strong>Total Monthly Commission Earned as on Date:</strong> ₹{{monthlyCommissionTotal}}</p>
      <p style="margin: 5px 0; color: #1e3a8a;"><strong>Your Next Payout:</strong> {{nextPayoutDate}} (Last Day of the Month)</p>
    </div>
  </div>
  
  <div style="text-align: center; margin: 30px 0 20px 0;">
    <a href="{{referralPartnerLoginUrl}}" style="display: inline-block; background-color: #254696; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">
      🔑 Referral Partner Login
    </a>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for being our valued partner!</p>
    <p style="color: #6b7280; font-size: 14px;">XtraCover BBG Team</p>
  </div>
</div>
          `,
          variables: ['distributorName', 'distributorEmail', 'distributorContact', 'customerName', 'customerContact', 'sellerCode', 'voucherCode', 'deviceType', 'brand', 'modelName', 'monthlyCommissionTotal', 'nextPayoutDate', 'referralPartnerLoginUrl']
        },
        // Distributor BBG Notification - SMS
        {
          name: 'Distributor BBG Notification - SMS',
          type: 'sms',
          event: 'distributor_bbg_notification',
          content: 'New BBG purchased through your code {{sellerCode}}! Customer: {{customerName}} ({{customerContact}}). Device: {{brand}} {{modelName}}. BBG Code: {{voucherCode}}. Commission earned! - XtraCover',
          variables: ['distributorName', 'customerName', 'customerContact', 'sellerCode', 'voucherCode', 'brand', 'modelName']
        },
        // Distributor BBG Notification - WhatsApp
        {
          name: 'Distributor BBG Notification - WhatsApp',
          type: 'whatsapp',
          event: 'distributor_bbg_notification',
          content: '🎉 New BBG Purchase Alert!\n\nHi {{distributorName}}, great news!\n\nCustomer: {{customerName}}\nContact: {{customerContact}}\nDevice: {{brand}} {{modelName}}\nBBG Code: {{voucherCode}}\nYour Code: {{sellerCode}}\n\n💰 Commission earned! Check your dashboard for details.\n\nThank you for being our partner!\n- XtraCover BBG',
          variables: ['distributorName', 'customerName', 'customerContact', 'sellerCode', 'voucherCode', 'brand', 'modelName']
        },
        // BBG Registration Benefits - Mobile Email (for auction/repair flow)
        {
          name: 'BBG Registration Benefits - Mobile Email',
          type: 'email',
          event: 'bbg_registration_benefits',
          deviceType: 'mobile',
          subject: 'BBG Registration Successful - Your Mobile Benefits - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Registration Successful!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Your BBG registration has been completed successfully. Here are your details:</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>BBG Voucher Code: {{voucherCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</li>
      <li><strong>IMEI / Serial No.:</strong> {{serialNumber}}</li>
      <li><strong>Device Purchase Date:</strong> {{devicePurchaseDate}}</li>
      <li><strong>BBG Purchase Date:</strong> {{bbgPurchaseDate}}</li>
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #0277bd; margin-top: 0;">🎯 Your BBG Benefits Package</h3>
    <p style="color: #424242; margin-bottom: 15px;">Since your device was purchased more than 6 months ago, you receive these comprehensive benefits:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #16a34a; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</div>
        <div>
          <h4 style="margin: 0; color: #16a34a;">Auction Service Benefit</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Professional device auction service</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #16a34a; font-size: 18px;">₹599</div>
      </div>
      
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #2563eb; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</div>
        <div>
          <h4 style="margin: 0; color: #2563eb;">Repair Service Benefit</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Professional device repair services</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #2563eb; font-size: 18px;">₹599</div>
      </div>
      
      <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; color: #374151;">Total Benefit Value</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Auction + Repair Services</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">₹1,198</div>
            <div style="color: #16a34a; font-size: 14px; font-weight: bold;">for just ₹499</div>
          </div>
        </div>
      </div>
    </div>
    
    <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 15px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>Note:</strong> These benefits are locked in at registration and can be used when needed for your mobile device.</p>
    </div>
  </div>

  <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
    <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Save your voucher code safely. You'll need it to access your BBG benefits.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      <a href="{{termsAndConditionsUrl}}" style="color: #2563eb; text-decoration: none;">Terms & Conditions</a> | 
      For support, contact us at contactus@xtracover.com
    </p>
  </div>
</div>
          `,
          variables: ['name', 'email', 'contact', 'voucherCode', 'brand', 'modelName', 'deviceType', 'serialNumber', 'devicePurchaseDate', 'bbgPurchaseDate', 'termsAndConditionsUrl']
        },
        // BBG Registration Benefits - Laptop Email (for auction/repair flow)
        {
          name: 'BBG Registration Benefits - Laptop Email',
          type: 'email',
          event: 'bbg_registration_benefits',
          deviceType: 'laptop',
          subject: 'BBG Registration Successful - Your Laptop Benefits - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Registration Successful!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Your BBG registration has been completed successfully. Here are your details:</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>BBG Voucher Code: {{voucherCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</li>
      <li><strong>IMEI / Serial No.:</strong> {{serialNumber}}</li>
      <li><strong>Device Purchase Date:</strong> {{devicePurchaseDate}}</li>
      <li><strong>BBG Purchase Date:</strong> {{bbgPurchaseDate}}</li>
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #0277bd; margin-top: 0;">💻 Your BBG Benefits Package</h3>
    <p style="color: #424242; margin-bottom: 15px;">Since your device was purchased more than 6 months ago, you receive these comprehensive benefits:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #16a34a; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</div>
        <div>
          <h4 style="margin: 0; color: #16a34a;">Auction Service Benefit</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Professional device auction service</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #16a34a; font-size: 18px;">₹799</div>
      </div>
      
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #2563eb; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</div>
        <div>
          <h4 style="margin: 0; color: #2563eb;">Repair Service Benefit</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Professional device repair services</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #2563eb; font-size: 18px;">₹799</div>
      </div>
      
      <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; color: #374151;">Total Benefit Value</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Auction + Repair Services</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">₹1,598</div>
            <div style="color: #16a34a; font-size: 14px; font-weight: bold;">for just ₹799</div>
          </div>
        </div>
      </div>
    </div>
    
    <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 15px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>Note:</strong> These benefits are locked in at registration and can be used when needed for your laptop device.</p>
    </div>
  </div>

  <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
    <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Save your voucher code safely. You'll need it to access your BBG benefits.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      <a href="{{termsAndConditionsUrl}}" style="color: #2563eb; text-decoration: none;">Terms & Conditions</a> | 
      For support, contact us at contactus@xtracover.com
    </p>
  </div>
</div>
          `,
          variables: ['name', 'email', 'contact', 'voucherCode', 'brand', 'modelName', 'deviceType', 'serialNumber', 'devicePurchaseDate', 'bbgPurchaseDate', 'termsAndConditionsUrl']
        },
        // BBG Purchase Confirmation - Within 6 Months (Claim Slabs)
        {
          name: 'BBG Purchase Confirmation - Within 6 Months',
          type: 'email',
          event: 'bbg_purchase_within_6_months',
          subject: 'BBG Purchase Successful - Your Protection Plan - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Purchase Successful!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Thank you for purchasing XtraCover BBG protection! Your BBG plan has been successfully activated.</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>BBG Voucher Code: {{voucherCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</li>
      <li><strong>BBG Purchase Date:</strong> {{bbgPurchaseDate}}</li>
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #0277bd; margin-top: 0;">📱 Your BBG Protection Plan</h3>
    <p style="color: #424242; margin-bottom: 15px;">Your device qualifies for our Claim Slabs benefit plan. Here's what you'll get when you claim:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <h4 style="color: #16a34a; margin-top: 0;">Claim Value Slabs</h4>
      <p style="color: #6b7280; margin-bottom: 15px;">Based on your device age at the time of claim, you can receive up to 70% of your device's current market value.</p>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px;">
        <p style="margin: 0; color: #374151; font-weight: bold;">Your Claim Value Slabs</p>
        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Based on your device age at the time of claim, you can receive the following percentages of your device's current market value:</p>
        <ul style="color: #6b7280; margin: 10px 0; list-style: none; padding: 0;">
          <li style="margin: 5px 0;"><strong>4-6 months old:</strong> 70%</li>
          <li style="margin: 5px 0;"><strong>7-9 months old:</strong> 60%</li>
          <li style="margin: 5px 0;"><strong>10-12 months old:</strong> 50%</li>
          <li style="margin: 5px 0;"><strong>13-15 months old:</strong> 40%</li>
          <li style="margin: 5px 0;"><strong>16-18 months old:</strong> 30%</li>
        </ul>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 13px; font-style: italic;"><strong>Note:</strong> These rates are locked in at registration and won't change even if our rates are updated later.</p>
      </div>
    </div>
    
    <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 15px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>Next Step:</strong> Complete your device registration with IMEI/Serial number to activate your protection.</p>
    </div>
  </div>

  <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
    <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Save your voucher code safely. You'll need it to register your device and file claims.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      <a href="{{termsAndConditionsUrl}}" style="color: #2563eb; text-decoration: none;">Terms & Conditions</a> | 
      For support, contact us at contactus@xtracover.com
    </p>
  </div>
</div>
          `,
          variables: ['name', 'email', 'contact', 'voucherCode', 'brand', 'modelName', 'deviceType', 'bbgPurchaseDate', 'termsAndConditionsUrl']
        },
        // BBG Purchase Confirmation - Over 6 Months (Auction + Repair)
        {
          name: 'BBG Purchase Confirmation - Over 6 Months',
          type: 'email',
          event: 'bbg_purchase_over_6_months',
          subject: 'BBG Purchase Successful - Your Comprehensive Benefits - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Purchase Successful!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Thank you for purchasing XtraCover BBG protection! Your comprehensive benefits package has been activated.</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>BBG Voucher Code: {{voucherCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</li>
      <li><strong>BBG Purchase Date:</strong> {{bbgPurchaseDate}}</li>
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #0277bd; margin-top: 0;">🎯 Your Comprehensive Benefits Package</h3>
    <p style="color: #424242; margin-bottom: 15px;">Since your device was purchased more than 6 months ago, you receive our premium benefits package:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #16a34a; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</div>
        <div>
          <h4 style="margin: 0; color: #16a34a;">Professional Auction Service</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Get maximum value through our professional auction platform</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #16a34a; font-size: 18px;">₹599+</div>
      </div>
      
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #2563eb; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</div>
        <div>
          <h4 style="margin: 0; color: #2563eb;">Professional Repair Service</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Expert repair services for your device</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #2563eb; font-size: 18px;">₹599+</div>
      </div>
    </div>
    
    <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 15px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>Next Step:</strong> Complete your device registration with IMEI/Serial number to activate your benefits.</p>
    </div>
  </div>

  <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
    <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Save your voucher code safely. You'll need it to register your device and access your benefits.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      <a href="{{termsAndConditionsUrl}}" style="color: #2563eb; text-decoration: none;">Terms & Conditions</a> | 
      For support, contact us at contactus@xtracover.com
    </p>
  </div>
</div>
          `,
          variables: ['name', 'email', 'contact', 'voucherCode', 'brand', 'modelName', 'deviceType', 'bbgPurchaseDate', 'termsAndConditionsUrl']
        },
        // Device Registration Confirmation - Within 6 Months (Claim Slabs)
        {
          name: 'Device Registration Confirmation - Within 6 Months',
          type: 'email',
          event: 'device_registration_within_6_months', 
          subject: 'Device Registration Complete - Your Claim Slabs - XtraCover',
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Device Registration Complete!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Your device has been successfully registered and your BBG protection is now fully active!</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>BBG Voucher Code: {{voucherCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</li>
      <li><strong>IMEI / Serial No.:</strong> {{serialNumber}}</li>
      <li><strong>Device Purchase Date:</strong> {{devicePurchaseDate}}</li>
      <li><strong>BBG Purchase Date:</strong> {{bbgPurchaseDate}}</li>
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #0277bd; margin-top: 0;">Your Active Claim Value Slabs</h3>
    <p style="color: #424242; margin-bottom: 15px;">Based on your device age at the time of claim, you can receive the following percentages of your device's current market value:</p>
    
    {{claimValueSlabsHtml}}
    
    <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 15px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>Note:</strong> These rates are locked in at registration and won't change even if our rates are updated later.</p>
    </div>
  </div>

  <div style="background: #dcfce7; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a;">
    <p style="margin: 0; color: #166534;"><strong>Protection Active:</strong> You can now file a claim using your voucher code when needed.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      <a href="{{termsAndConditionsUrl}}" style="color: #2563eb; text-decoration: none;">Terms & Conditions</a> | 
      For support, contact us at contactus@xtracover.com
    </p>
  </div>
</div>
          `,
          variables: ['name', 'voucherCode', 'brand', 'modelName', 'deviceType', 'serialNumber', 'devicePurchaseDate', 'bbgPurchaseDate', 'contact', 'email', 'claimValueSlabsHtml', 'termsAndConditionsUrl']
        },
        // Device Registration Confirmation - Over 6 Months (Auction + Repair)
        {
          name: 'Device Registration Confirmation - Over 6 Months',
          type: 'email',
          event: 'device_registration_over_6_months',
          subject: 'Device Registration Complete - Your Benefits Active - XtraCover', 
          content: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #dc2626;">XtraCover BBG</h1>
    <h2 style="color: #374151;">Device Registration Complete!</h2>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #374151; margin-top: 0;">Hi {{name}},</h3>
    <p>Your device has been successfully registered and your comprehensive BBG benefits are now fully active!</p>
    
    <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <strong>BBG Voucher Code: {{voucherCode}}</strong>
    </div>
    
    <ul style="color: #6b7280;">
      <li><strong>Device:</strong> {{brand}} {{modelName}} ({{deviceType}})</li>
      <li><strong>IMEI / Serial No.:</strong> {{serialNumber}}</li>
      <li><strong>Device Purchase Date:</strong> {{devicePurchaseDate}}</li>
      <li><strong>BBG Purchase Date:</strong> {{bbgPurchaseDate}}</li>
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="color: #0277bd; margin-top: 0;">🎯 Your Active Benefits Package</h3>
    <p style="color: #424242; margin-bottom: 15px;">Your comprehensive benefits are now ready to use whenever you need them:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #16a34a; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">✓</div>
        <div>
          <h4 style="margin: 0; color: #16a34a;">Professional Auction Service</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Get maximum value through our professional auction platform</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #16a34a; font-size: 18px;">Active</div>
      </div>
      
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: #2563eb; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">✓</div>
        <div>
          <h4 style="margin: 0; color: #2563eb;">Professional Repair Service</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Expert repair services for your device</p>
        </div>
        <div style="margin-left: auto; font-weight: bold; color: #2563eb; font-size: 18px;">Active</div>
      </div>
    </div>
    
    <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-top: 15px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>Note:</strong> These benefits are locked in at registration and can be accessed using your voucher code.</p>
    </div>
  </div>

  <div style="background: #dcfce7; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a;">
    <p style="margin: 0; color: #166534;"><strong>Benefits Active:</strong> You can now access your auction and repair services using your voucher code when needed.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #9ca3af; font-size: 14px;">
      <a href="{{termsAndConditionsUrl}}" style="color: #2563eb; text-decoration: none;">Terms & Conditions</a> | 
      For support, contact us at contactus@xtracover.com
    </p>
  </div>
</div>
          `,
          variables: ['name', 'voucherCode', 'brand', 'modelName', 'deviceType', 'serialNumber', 'devicePurchaseDate', 'bbgPurchaseDate', 'contact', 'email', 'termsAndConditionsUrl']
        }
      ];

      for (const template of defaultTemplates) {
        try {
          // Check if template already exists by (type, event, device_type)
          const existing = await this.getTemplateByTypeEventAndDevice(
            template.type as string, 
            template.event as string, 
            template.deviceType as string | undefined
          );
          
          if (!existing) {
            await this.createTemplate(template as CreateTemplateData);
            console.log(`✅ Created default template: ${template.name}`);
          } else {
            // Update existing template if content has changed
            if (existing.content !== template.content || 
                JSON.stringify(existing.variables) !== JSON.stringify(template.variables)) {
              console.log(`🔧 Updating existing template: ${template.name}`);
              await this.updateTemplate(existing.id, {
                content: template.content,
                variables: template.variables,
                subject: template.subject
              });
              console.log(`✅ Updated template: ${template.name}`);
            } else {
              console.log(`Template already exists and is up to date: ${template.name}`);
            }
          }
        } catch (error: any) {
          console.error('❌ Error with default template:', template.name, error.message);
          // Continue with other templates instead of failing entirely
        }
      }
      
      console.log('Default templates created/verified');
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  }

  // Get all templates
  async getAllTemplates(): Promise<MessageTemplate[]> {
    try {
      await db.connectDB();
      const query = `
        SELECT id, name, type, event, subject, content, variables, is_active, created_at, updated_at 
        FROM message_templates 
        ORDER BY event, type
      `;
      
      const result = await db.pool.request().query(query);
      
      return result.recordset.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        event: row.event,
        subject: row.subject,
        content: row.content,
        variables: row.variables ? JSON.parse(row.variables) : [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Get template by type and event (for checking existence) - backwards compatibility
  async getTemplateByTypeAndEvent(type: string, event: string): Promise<MessageTemplate | null> {
    try {
      await db.connectDB();
      const query = `
        SELECT id, name, type, event, device_type, subject, content, variables, is_active, created_at, updated_at 
        FROM message_templates 
        WHERE type = @type AND event = @event AND device_type IS NULL
      `;
      
      const request = db.pool.request();
      request.input('type', sql.VarChar, type);
      request.input('event', sql.VarChar, event);
      
      const result = await request.query(query);
      
      if (result.recordset.length === 0) return null;
      
      const row = result.recordset[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        event: row.event,
        deviceType: row.device_type,
        subject: row.subject,
        content: row.content,
        variables: row.variables ? JSON.parse(row.variables) : [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error checking template existence:', error);
      return null;
    }
  }

  // Get template by type, event, and device type (for device-specific templates)
  async getTemplateByTypeEventAndDevice(type: string, event: string, deviceType?: string): Promise<MessageTemplate | null> {
    try {
      await db.connectDB();
      let query = `
        SELECT id, name, type, event, device_type, subject, content, variables, is_active, created_at, updated_at 
        FROM message_templates 
        WHERE type = @type AND event = @event
      `;
      
      // Add device type condition
      if (deviceType) {
        query += ` AND device_type = @deviceType`;
      } else {
        query += ` AND device_type IS NULL`;
      }
      
      const request = db.pool.request();
      request.input('type', sql.VarChar, type);
      request.input('event', sql.VarChar, event);
      if (deviceType) {
        request.input('deviceType', sql.VarChar, deviceType);
      }
      
      const result = await request.query(query);
      
      if (result.recordset.length === 0) {
        // If no device-specific template found, try to fallback to generic template
        if (deviceType) {
          console.log(`🔍 No ${deviceType} template found for ${event}, trying generic fallback...`);
          return this.getTemplateByTypeAndEvent(type, event);
        }
        return null;
      }
      
      const row = result.recordset[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        event: row.event,
        deviceType: row.device_type,
        subject: row.subject,
        content: row.content,
        variables: row.variables ? JSON.parse(row.variables) : [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error fetching device-specific template:', error);
      return null;
    }
  }

  // Get template by type and event
  async getTemplate(type: string, event: string): Promise<MessageTemplate | null> {
    try {
      await db.connectDB();
      const query = `
        SELECT id, name, type, event, subject, content, variables, is_active, created_at, updated_at 
        FROM message_templates 
        WHERE type = @type AND event = @event AND is_active = 1
      `;
      
      const request = db.pool.request();
      request.input('type', sql.VarChar, type);
      request.input('event', sql.VarChar, event);
      
      const result = await request.query(query);
      
      if (result.recordset.length === 0) return null;
      
      const row = result.recordset[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        event: row.event,
        subject: row.subject,
        content: row.content,
        variables: row.variables ? JSON.parse(row.variables) : [],
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  // Create new template
  async createTemplate(templateData: CreateTemplateData): Promise<MessageTemplate> {
    try {
      await db.connectDB();
      const query = `
        INSERT INTO message_templates (name, type, event, device_type, subject, content, variables)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.type, INSERTED.event, INSERTED.device_type, INSERTED.subject, 
               INSERTED.content, INSERTED.variables, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at
        VALUES (@name, @type, @event, @deviceType, @subject, @content, @variables)
      `;
      
      const request = db.pool.request();
      request.input('name', sql.NVarChar, templateData.name);
      request.input('type', sql.VarChar, templateData.type);
      request.input('event', sql.VarChar, templateData.event);
      request.input('deviceType', sql.VarChar, templateData.deviceType || null);
      request.input('subject', sql.NVarChar, templateData.subject || null);
      request.input('content', sql.NText, templateData.content);
      request.input('variables', sql.NText, JSON.stringify(templateData.variables));
      
      const result = await request.query(query);
      const row = result.recordset[0];
      
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        event: row.event,
        deviceType: row.device_type,
        subject: row.subject,
        content: row.content,
        variables: JSON.parse(row.variables),
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  // Update template
  async updateTemplate(id: number, updates: Partial<CreateTemplateData>): Promise<void> {
    try {
      await db.connectDB();
      
      const setParts = [];
      const request = db.pool.request();
      request.input('id', sql.Int, id);
      
      if (updates.name !== undefined) {
        setParts.push('name = @name');
        request.input('name', sql.NVarChar, updates.name);
      }
      
      if (updates.subject !== undefined) {
        setParts.push('subject = @subject');
        request.input('subject', sql.NVarChar, updates.subject);
      }
      
      if (updates.content !== undefined) {
        setParts.push('content = @content');
        request.input('content', sql.NText, updates.content);
      }
      
      if (updates.variables !== undefined) {
        setParts.push('variables = @variables');
        request.input('variables', sql.NText, JSON.stringify(updates.variables));
      }
      
      setParts.push('updated_at = GETDATE()');
      
      const query = `UPDATE message_templates SET ${setParts.join(', ')} WHERE id = @id`;
      await request.query(query);
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(id: number): Promise<void> {
    try {
      await db.connectDB();
      const query = `DELETE FROM message_templates WHERE id = @id`;
      
      const request = db.pool.request();
      request.input('id', sql.Int, id);
      
      await request.query(query);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  // Toggle template active status
  async toggleTemplateStatus(id: number): Promise<void> {
    try {
      await db.connectDB();
      const query = `
        UPDATE message_templates 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id
      `;
      
      const request = db.pool.request();
      request.input('id', sql.Int, id);
      
      await request.query(query);
    } catch (error) {
      console.error('Error toggling template status:', error);
      throw error;
    }
  }

  // Render template with variables
  renderTemplate(content: string, variables: Record<string, any>): string {
    let rendered = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    });
    
    return rendered;
  }

  // Get available template variables by event
  getAvailableVariables(event: string): string[] {
    const variableMap: Record<string, string[]> = {
      'customer_registration': ['name', 'email', 'contact', 'voucherCode', 'deviceType', 'brand', 'modelName', 'claimValueSlabsHtml'],
      'referral_partner_welcome': ['name', 'email', 'contact', 'sellerCode', 'businessName'],
      'claim_status_update': ['name', 'email', 'contact', 'voucherCode', 'claimAmount', 'status'],
      'payout_notification': ['name', 'email', 'contact', 'amount', 'status', 'paymentReference'],
      'otp_verification': ['otp', 'name', 'contact']
    };
    
    return variableMap[event] || [];
  }
}

export const templateService = new TemplateService();