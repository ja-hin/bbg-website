import { db } from "./db";
import sql from 'mssql';

export interface MessageTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  event: 'customer_registration' | 'referral_partner_welcome' | 'claim_status_update' | 'payout_notification' | 'otp_verification';
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
  event: 'customer_registration' | 'referral_partner_welcome' | 'claim_status_update' | 'payout_notification' | 'otp_verification' | 'distributor_bbg_notification';
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
      
      // Update constraint to allow new event types
      await this.updateEventConstraint();
      
      // Insert default templates if none exist
      await this.createDefaultTemplates();
    } catch (error) {
      console.error('Error initializing template tables:', error);
      throw error;
    }
  }

  // Update event constraint to allow new event types
  async updateEventConstraint(): Promise<void> {
    try {
      // Drop existing constraint if it exists
      const dropConstraintQuery = `
        IF EXISTS (SELECT * FROM sys.check_constraints WHERE name LIKE '%event%' AND parent_object_id = OBJECT_ID('message_templates'))
        BEGIN
          DECLARE @constraint_name NVARCHAR(255)
          SELECT @constraint_name = name FROM sys.check_constraints 
          WHERE name LIKE '%event%' AND parent_object_id = OBJECT_ID('message_templates')
          
          IF @constraint_name IS NOT NULL
          BEGIN
            DECLARE @sql NVARCHAR(MAX) = 'ALTER TABLE message_templates DROP CONSTRAINT ' + @constraint_name
            EXEC sp_executesql @sql
          END
        END
      `;
      
      await db.pool.request().query(dropConstraintQuery);
      
      // Add new constraint with updated event types
      const addConstraintQuery = `
        ALTER TABLE message_templates 
        ADD CONSTRAINT CHK_message_templates_event 
        CHECK (event IN ('customer_registration', 'referral_partner_welcome', 'claim_status_update', 'payout_notification', 'otp_verification', 'distributor_bbg_notification'))
      `;
      
      await db.pool.request().query(addConstraintQuery);
      console.log('✅ Updated event constraint to include distributor_bbg_notification');
    } catch (error) {
      console.log('⚠️ Event constraint update failed (may already be correct):', error.message);
      // Don't throw error as this is a migration that might not be needed
    }
  }

  // Create default templates
  async createDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = [
        // Customer Registration Email
        {
          name: 'Customer Registration Confirmation - Email',
          type: 'email',
          event: 'customer_registration',
          subject: 'BBG Registration Successful - XtraCover',
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
      <li><strong>Contact:</strong> {{contact}}</li>
      <li><strong>Email:</strong> {{email}}</li>
    </ul>
  </div>
  
  <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
    <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Save your voucher code safely. You'll need it to claim your BBG.</p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for choosing XtraCover BBG!</p>
  </div>
</div>
          `,
          variables: ['name', 'voucherCode', 'brand', 'modelName', 'deviceType', 'contact', 'email']
        },
        // Customer Registration SMS
        {
          name: 'Customer Registration Confirmation - SMS',
          type: 'sms',
          event: 'customer_registration',
          content: 'Hi {{name}}, your BBG registration is successful! Your voucher code: {{voucherCode}}. Keep it safe for claiming your BBG. - XtraCover',
          variables: ['name', 'voucherCode']
        },
        // Customer Registration WhatsApp
        {
          name: 'Customer Registration Confirmation - WhatsApp',
          type: 'whatsapp',
          event: 'customer_registration',
          content: '🎉 Hi {{name}}!\n\nYour BBG registration is successful!\n\n📱 Device: {{brand}} {{modelName}}\n🎟️ Voucher Code: *{{voucherCode}}*\n\n⚠️ Keep your voucher code safe for claiming BBG.\n\nThank you for choosing XtraCover BBG! 🛡️',
          variables: ['name', 'brand', 'modelName', 'voucherCode']
        },
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
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #6b7280;">Thank you for being our valued partner!</p>
    <p style="color: #6b7280; font-size: 14px;">XtraCover BBG Team</p>
  </div>
</div>
          `,
          variables: ['distributorName', 'distributorEmail', 'distributorContact', 'customerName', 'customerContact', 'sellerCode', 'voucherCode', 'deviceType', 'brand', 'modelName']
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
        }
      ];

      for (const template of defaultTemplates) {
        try {
          // Check if template already exists
          const existing = await this.getTemplateByTypeAndEvent(template.type as string, template.event as string);
          if (!existing) {
            await this.createTemplate(template as CreateTemplateData);
            console.log(`Created default template: ${template.name}`);
          } else {
            console.log(`Template already exists, skipping: ${template.name}`);
          }
        } catch (error: any) {
          console.error('Error with default template:', template.name, error);
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

  // Get template by type and event (for checking existence)
  async getTemplateByTypeAndEvent(type: string, event: string): Promise<MessageTemplate | null> {
    try {
      await db.connectDB();
      const query = `
        SELECT id, name, type, event, subject, content, variables, is_active, created_at, updated_at 
        FROM message_templates 
        WHERE type = @type AND event = @event
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
      console.error('Error checking template existence:', error);
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
        INSERT INTO message_templates (name, type, event, subject, content, variables)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.type, INSERTED.event, INSERTED.subject, 
               INSERTED.content, INSERTED.variables, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at
        VALUES (@name, @type, @event, @subject, @content, @variables)
      `;
      
      const request = db.pool.request();
      request.input('name', sql.NVarChar, templateData.name);
      request.input('type', sql.VarChar, templateData.type);
      request.input('event', sql.VarChar, templateData.event);
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
      'customer_registration': ['name', 'email', 'contact', 'voucherCode', 'deviceType', 'brand', 'modelName'],
      'referral_partner_welcome': ['name', 'email', 'contact', 'sellerCode', 'businessName'],
      'claim_status_update': ['name', 'email', 'contact', 'voucherCode', 'claimAmount', 'status'],
      'payout_notification': ['name', 'email', 'contact', 'amount', 'status', 'paymentReference'],
      'otp_verification': ['otp', 'name', 'contact']
    };
    
    return variableMap[event] || [];
  }
}

export const templateService = new TemplateService();