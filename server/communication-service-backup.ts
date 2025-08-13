import nodemailer from 'nodemailer';
import axios from 'axios';
import { templateService } from './template-service';
import { gupshupService } from './gupshup-service';

// Email Service using SMTP
export class EmailService {
  private createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.log('SMTP credentials not configured, email not sent');
        return { success: false, message: 'SMTP not configured' };
      }

      // Create transporter dynamically to pick up environment variable changes
      const transporter = this.createTransporter();

      const mailOptions = {
        from: `"XtraCover BBG" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: text || '',
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// SMS Service using Kaleyra (already exists, extending it)
export class SMSService {
  private apiKey: string;
  private senderId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.KALEYRA_API_KEY || '';
    this.senderId = process.env.KALEYRA_SENDER_ID || 'XTCOVR';
    this.baseUrl = 'https://api-alerts.kaleyra.com/v4/';
  }

  async sendSMS(to: string, message: string, templateId?: string) {
    try {
      if (!this.apiKey) {
        console.log('Kaleyra API key not configured, SMS not sent');
        return { success: false, message: 'SMS service not configured' };
      }

      // Format phone number to ensure it has +91 prefix
      const formattedNumber = to.startsWith('+91') ? to : `+91${to.replace(/^\+?91?/, '')}`;

      const payload = {
        to: formattedNumber,
        sender: this.senderId,
        body: message,
        ...(templateId && { template_id: templateId })
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.status === 'OK') {
        console.log('SMS sent successfully via Kaleyra:', {
          to: formattedNumber,
          messageId: response.data.data?.[0]?.id || 'sent'
        });
        return { 
          success: true, 
          messageId: response.data.data?.[0]?.id || 'sent',
          to: formattedNumber 
        };
      } else {
        throw new Error(`SMS API error: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('SMS sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// WhatsApp Service using Gupshup (Updated with production credentials)
export class WhatsAppService {
  async sendWhatsAppMessage(to: string, message: string) {
    try {
      console.log('Sending WhatsApp message via Gupshup service');
      await gupshupService.sendMessage({
        to: to,
        message: message,
        type: 'TEXT'
      });
      return { success: true, service: 'gupshup' };
    } catch (error: any) {
      console.error('WhatsApp sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }
} 
          success: true, 
          messageId: response.data.messageId,
          to: formattedNumber 
        };
      } else {
        throw new Error(`WhatsApp API error: ${response.data?.reason || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('WhatsApp message sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTemplateMessage(to: string, templateName: string, params: string[]) {
    return this.sendWhatsAppMessage(to, '', templateName, params);
  }

  // Helper method to check if WhatsApp service is configured
  isConfigured(): boolean {
    return !!this.apiKey && !!this.sourceNumber;
  }

  // Method to get configuration status for admin dashboard
  getServiceStatus() {
    return {
      hasApiKey: !!this.apiKey,
      hasSourceNumber: !!this.sourceNumber,
      accountId: this.accountId,
      sourceNumber: this.sourceNumber,
      appName: this.appName
    };
  }
}

// Unified Communication Service
export class CommunicationService {
  private emailService: EmailService;
  private smsService: SMSService;
  private whatsappService: WhatsAppService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
    this.whatsappService = new WhatsAppService();
  }

  // Send notifications for different events using templates
  async sendRegistrationConfirmation(
    customerData: {
      name: string;
      email: string;
      contact: string;
      voucherCode: string;
      deviceType: string;
      brand: string;
      modelName: string;
    }
  ) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Email confirmation using template
      const emailTemplate = await templateService.getTemplate('email', 'customer_registration');
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, customerData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'BBG Registration Successful', customerData);
        results.email = await this.emailService.sendEmail(customerData.email, emailSubject, emailContent);
      }

      // SMS confirmation using template
      console.log('🔄 Checking SMS template for customer registration...');
      const smsTemplate = await templateService.getTemplate('sms', 'customer_registration');
      if (smsTemplate) {
        console.log('✅ SMS template found, sending SMS...');
        const smsMessage = templateService.renderTemplate(smsTemplate.content, customerData);
        console.log('📱 SMS Message to send:', smsMessage);
        results.sms = await this.smsService.sendSMS(customerData.contact, smsMessage);
        console.log('📱 SMS Result:', results.sms);
      } else {
        console.log('❌ SMS template not found for customer_registration');
        results.sms = { success: false, error: 'Template not found' };
      }

      // WhatsApp confirmation using template
      console.log('🔄 Checking WhatsApp template for customer registration...');
      const whatsappTemplate = await templateService.getTemplate('whatsapp', 'customer_registration');
      if (whatsappTemplate) {
        console.log('✅ WhatsApp template found, sending WhatsApp message...');
        const whatsappMessage = templateService.renderTemplate(whatsappTemplate.content, customerData);
        console.log('💬 WhatsApp Message to send:', whatsappMessage);
        results.whatsapp = await this.whatsappService.sendWhatsAppMessage(customerData.contact, whatsappMessage);
        console.log('💬 WhatsApp Result:', results.whatsapp);
      } else {
        console.log('❌ WhatsApp template not found for customer_registration');
        results.whatsapp = { success: false, error: 'Template not found' };
      }
    } catch (error) {
      console.error('Error sending registration confirmation:', error);
    }

    return results;
  }

  async sendReferralPartnerWelcome(
    partnerData: {
      name: string;
      email: string;
      contact: string;
      sellerCode: string;
      businessName?: string;
    }
  ) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Email welcome using template
      const emailTemplate = await templateService.getTemplate('email', 'referral_partner_welcome');
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, partnerData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'Welcome to Referral Program', partnerData);
        results.email = await this.emailService.sendEmail(partnerData.email, emailSubject, emailContent);
      }

      // SMS welcome using template
      const smsTemplate = await templateService.getTemplate('sms', 'referral_partner_welcome');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, partnerData);
        results.sms = await this.smsService.sendSMS(partnerData.contact, smsMessage);
      }

      // WhatsApp welcome using template
      const whatsappTemplate = await templateService.getTemplate('whatsapp', 'referral_partner_welcome');
      if (whatsappTemplate) {
        const whatsappMessage = templateService.renderTemplate(whatsappTemplate.content, partnerData);
        results.whatsapp = await this.whatsappService.sendWhatsAppMessage(partnerData.contact, whatsappMessage);
      }
    } catch (error) {
      console.error('Error sending referral partner welcome:', error);
    }

    return results;
  }

  async sendClaimStatusUpdate(
    customerData: {
      name: string;
      email: string;
      contact: string;
      voucherCode: string;
      claimAmount: number;
      status: string;
    }
  ) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Email update using template
      const emailTemplate = await templateService.getTemplate('email', 'claim_status_update');
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, customerData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'Claim Status Update', customerData);
        results.email = await this.emailService.sendEmail(customerData.email, emailSubject, emailContent);
      }

      // SMS update using template
      const smsTemplate = await templateService.getTemplate('sms', 'claim_status_update');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, customerData);
        results.sms = await this.smsService.sendSMS(customerData.contact, smsMessage);
      }

      // WhatsApp update using template
      const whatsappTemplate = await templateService.getTemplate('whatsapp', 'claim_status_update');
      if (whatsappTemplate) {
        const whatsappMessage = templateService.renderTemplate(whatsappTemplate.content, customerData);
        results.whatsapp = await this.whatsappService.sendWhatsAppMessage(customerData.contact, whatsappMessage);
      }
    } catch (error) {
      console.error('Error sending claim status update:', error);
    }

    return results;
  }

  async sendPayoutNotification(
    partnerData: {
      name: string;
      email: string;
      contact: string;
      amount: number;
      status: string;
      paymentReference?: string;
    }
  ) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Email notification using template
      const emailTemplate = await templateService.getTemplate('email', 'payout_notification');
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, partnerData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'Payout Update', partnerData);
        results.email = await this.emailService.sendEmail(partnerData.email, emailSubject, emailContent);
      }

      // SMS notification using template
      const smsTemplate = await templateService.getTemplate('sms', 'payout_notification');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, partnerData);
        results.sms = await this.smsService.sendSMS(partnerData.contact, smsMessage);
      }

      // WhatsApp notification using template
      const whatsappTemplate = await templateService.getTemplate('whatsapp', 'payout_notification');
      if (whatsappTemplate) {
        const whatsappMessage = templateService.renderTemplate(whatsappTemplate.content, partnerData);
        results.whatsapp = await this.whatsappService.sendWhatsAppMessage(partnerData.contact, whatsappMessage);
      }
    } catch (error) {
      console.error('Error sending payout notification:', error);
    }

    return results;
  }

  // Test all communication channels
  async testCommunications(testData: {
    email: string;
    contact: string;
    name: string;
  }) {
    console.log('Testing all communication channels...');
    
    const results = {
      email: await this.emailService.sendEmail(
        testData.email,
        'Test Email - XtraCover BBG Communications',
        `<h2>Hello ${testData.name}!</h2><p>This is a test email from XtraCover BBG communication system. If you received this, email notifications are working correctly!</p>`
      ),
      sms: await this.smsService.sendSMS(
        testData.contact,
        `Hi ${testData.name}! This is a test SMS from XtraCover BBG. If you received this, SMS notifications are working! - XtraCover`
      ),
      whatsapp: await this.whatsappService.sendWhatsAppMessage(
        testData.contact,
        `🧪 Hi ${testData.name}!\n\nThis is a test WhatsApp message from XtraCover BBG.\n\nIf you received this, WhatsApp notifications are working correctly! ✅\n\n- XtraCover Team`
      )
    };

    console.log('Communication test results:', results);
    return results;
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();