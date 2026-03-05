import { db } from "./db";
import sql from 'mssql';

export interface MessageTemplate {
  id: number;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  event: 'customer_registration' | 'referral_partner_welcome' | 'claim_status_update' | 'payout_notification' | 'otp_verification' | 'distributor_bbg_notification' | 'bbg_registration_benefits' | 'bbg_purchase_confirmation' | 'device_registration_confirmation' | 'bbg_purchase_within_6_months' | 'bbg_purchase_over_6_months' | 'device_registration_within_6_months' | 'device_registration_over_6_months' | 'acer_registration_within_6_months' | 'acer_registration_over_6_months' | 'amazon_bbg_registration' | 'plan_purchase';
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
  event: 'customer_registration' | 'referral_partner_welcome' | 'claim_status_update' | 'payout_notification' | 'otp_verification' | 'distributor_bbg_notification' | 'bbg_registration_benefits' | 'bbg_purchase_confirmation' | 'device_registration_confirmation' | 'bbg_purchase_within_6_months' | 'bbg_purchase_over_6_months' | 'device_registration_within_6_months' | 'device_registration_over_6_months' | 'acer_registration_within_6_months' | 'acer_registration_over_6_months' | 'amazon_bbg_registration' | 'plan_purchase';
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
      // Drop ALL existing event-related CHECK constraints to allow flexible event types
      const dropConstraintQuery = `
        DECLARE @sql NVARCHAR(MAX) = ''
        SELECT @sql = @sql + 'ALTER TABLE message_templates DROP CONSTRAINT [' + cc.name + ']; '
        FROM sys.check_constraints cc
        WHERE cc.parent_object_id = OBJECT_ID('message_templates') 
        AND cc.name LIKE '%event%'
        
        IF LEN(@sql) > 0
        BEGIN
          EXEC sp_executesql @sql
          PRINT '✅ Dropped all event CHECK constraints on message_templates'
        END
      `;
      
      await db.pool.request().query(dropConstraintQuery);
      
      // No longer adding a constraint - event types are now flexible to support plan-specific templates
      console.log('✅ Event constraint dropped - flexible event types enabled for plan-specific templates');
    } catch (error: any) {
      console.log('⚠️ Event constraint update failed (may already be correct):', error.message);
      // Don't throw error as this is a migration that might not be needed
    }
  }


  // Get template by ID
  async getTemplateById(id: number): Promise<MessageTemplate | null> {
    try {
      await db.connectDB();
      const query = `
        SELECT id, name, type, event, device_type, subject, content, variables, is_active, created_at, updated_at 
        FROM message_templates 
        WHERE id = @id
      `;
      
      const request = db.pool.request();
      request.input('id', sql.Int, id);
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
      console.error('Error fetching template by ID:', error);
      return null;
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