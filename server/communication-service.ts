import nodemailer from 'nodemailer';
import axios from 'axios';
import { templateService } from './template-service';
import { gupshupService } from './gupshup-service';
import { storage } from './sql-storage';

// Email Service using SMTP
export class EmailService {
  private createTransporter(smtpSettings?: any) {
    const settings = smtpSettings || {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      fromAddress: process.env.SMTP_USER
    };

    return nodemailer.createTransport({
      host: settings.host || settings.smtpHost,
      port: settings.port || settings.smtpPort || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: settings.user || settings.smtpUsername,
        pass: settings.password || settings.smtpPassword,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.log('SMTP credentials not configured, email not sent');
        return { success: false, message: 'SMTP not configured' };
      }

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

  async sendEmailWithSmtpSettings(to: string, subject: string, html: string, smtpSettings: any, text?: string) {
    try {
      if (!smtpSettings || !smtpSettings.smtpHost || !smtpSettings.smtpUsername || !smtpSettings.smtpPassword) {
        return { success: false, message: 'SMTP settings incomplete' };
      }

      const transporter = this.createTransporter(smtpSettings);

      const mailOptions = {
        from: `"XtraCover BBG" <${smtpSettings.fromAddress}>`,
        to,
        subject,
        text: text || '',
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully with custom SMTP:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('Email sending failed with custom SMTP:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// SMS Service using Kaleyra
export class SMSService {
  private apiKey: string;
  private senderId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.KALEYRA_API_KEY || '';
    this.senderId = process.env.KALEYRA_SENDER_ID || 'XTCOVR';
    this.baseUrl = 'https://api-alerts.kaleyra.com/v4/?method=sms';
  }

  async sendSMS(to: string, message: string, templateId?: string) {
    try {
      if (!this.apiKey) {
        console.log('Kaleyra API key not configured, SMS not sent');
        return { success: false, message: 'SMS service not configured' };
      }

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

// WhatsApp Service using Gupshup
export class WhatsAppService {
  async sendWhatsAppMessage(to: string, message: string) {
    try {
      console.log('Attempting WhatsApp message via Gupshup service');
      await gupshupService.sendMessage({
        to: to,
        message: message,
        type: 'TEXT'
      });
      return { success: true, service: 'gupshup' };
    } catch (error: any) {
      console.error('WhatsApp/Gupshup failed, falling back to Kaleyra SMS:', error.message);
      
      // Fallback to Kaleyra SMS
      try {
        const smsService = new SMSService();
        const smsResult = await smsService.sendSMS(to, message);
        if (smsResult.success) {
          return { success: true, service: 'kaleyra-sms-fallback' };
        } else {
          throw new Error('SMS fallback also failed');
        }
      } catch (smsError: any) {
        return { success: false, error: `Gupshup and Kaleyra both failed: ${error.message}, ${smsError.message}` };
      }
    }
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

  private async getSmtpSettings() {
    try {
      return await storage.getSmtpSettings();
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
      return null;
    }
  }

  async sendRegistrationConfirmation(
    customerData: {
      name: string;
      email: string;
      contact: string;
      voucherCode: string;
      deviceType: string;
      brand: string;
      modelName: string;
      registrationSource?: string;
      serialNumber?: string;
      devicePurchaseDate?: string;
      bbgPurchaseDate?: string;
      termsAndConditionsUrl?: string;
      emailTemplateKey?: string; // For auction/repair vs claim_slabs flow
    }
  ) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Fetch claim value slabs for this device brand/type
      let claimValueSlabs: any[] = [];
      try {
        const registrationSource = customerData.registrationSource || 'regular';
        console.log(`📊 Fetching claim value slabs for: ${customerData.deviceType}/${customerData.brand}/${registrationSource}`);
        claimValueSlabs = await storage.getClaimValueSlabsByTypeAndBrand(
          customerData.deviceType, 
          customerData.brand, 
          registrationSource
        );
        console.log(`📊 Fetched ${claimValueSlabs.length} claim value slabs for email`);
      } catch (error) {
        console.error('❌ Error fetching claim value slabs for email:', error);
        // Continue without slabs if fetch fails
      }

      // Generate HTML for claim value slabs
      let claimValueSlabsHtml = '';
      if (claimValueSlabs.length > 0) {
        console.log(`📋 Generating HTML for ${claimValueSlabs.length} claim value slabs`);
        claimValueSlabsHtml = claimValueSlabs.map(slab => 
          `<div style="background: white; padding: 10px 15px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #0277bd;">
            <span style="font-weight: bold; color: #1976d2;">${slab.minMonths}-${slab.maxMonths} months old:</span>
            <span style="color: #2e7d32; font-weight: bold; float: right;">${slab.percentage}%</span>
          </div>`
        ).join('');
        console.log(`📋 Generated claimValueSlabsHtml (${claimValueSlabsHtml.length} chars):`, claimValueSlabsHtml.substring(0, 200) + '...');
      } else {
        console.log('📋 No claim value slabs found, using fallback message');
        claimValueSlabsHtml = '<div style="background: white; padding: 15px; border-radius: 6px; text-align: center; color: #666;">Claim value slabs will be available based on your device specifications.</div>';
      }

      // Prepare extended customer data with claim value slabs HTML
      const emailData = {
        ...customerData,
        claimValueSlabsHtml: claimValueSlabsHtml
      };

      // Email confirmation using template with SMTP settings from database
      // Use device-specific template for auction/repair flow, regular template otherwise
      let emailTemplate;
      if (customerData.emailTemplateKey === 'bbg_registration_benefits') {
        console.log(`📧 Using device-specific BBG benefits template for ${customerData.deviceType} device`);
        emailTemplate = await templateService.getTemplateByTypeEventAndDevice('email', 'bbg_registration_benefits', customerData.deviceType);
      } else {
        console.log('📧 Using regular customer registration template');
        emailTemplate = await templateService.getTemplate('email', 'customer_registration');
      }
      
      if (emailTemplate) {
        console.log('📧 Rendering email template with variables:', {
          ...emailData,
          claimValueSlabsHtml: emailData.claimValueSlabsHtml?.length > 0 ? `${emailData.claimValueSlabsHtml.substring(0, 100)}...` : 'EMPTY OR MISSING'
        });
        const emailContent = templateService.renderTemplate(emailTemplate.content, emailData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'BBG Registration Successful', emailData);
        console.log('📧 Final email content length:', emailContent.length, 'chars');
        
        // Fetch SMTP settings from database
        const smtpSettings = await this.getSmtpSettings();
        if (smtpSettings) {
          results.email = await this.emailService.sendEmailWithSmtpSettings(customerData.email, emailSubject, emailContent, smtpSettings);
        } else {
          results.email = await this.emailService.sendEmail(customerData.email, emailSubject, emailContent);
        }
      }

      // SMS confirmation using template
      const smsTemplate = await templateService.getTemplate('sms', 'customer_registration');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, customerData);
        results.sms = await this.smsService.sendSMS(customerData.contact, smsMessage);
      }

      // WhatsApp confirmation using template
      const whatsappTemplate = await templateService.getTemplate('whatsapp', 'customer_registration');
      if (whatsappTemplate) {
        const whatsappMessage = templateService.renderTemplate(whatsappTemplate.content, customerData);
        results.whatsapp = await this.whatsappService.sendWhatsAppMessage(customerData.contact, whatsappMessage);
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
      console.log('🔔 Starting referral partner welcome notifications for:', partnerData.email);
      
      // Email welcome using template
      const emailTemplate = await templateService.getTemplate('email', 'referral_partner_welcome');
      console.log('📧 Email template found:', emailTemplate ? 'Yes' : 'No');
      
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, partnerData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'Welcome to XtraCover BBG Partnership', partnerData);
        
        console.log('📧 Attempting to send welcome email to:', partnerData.email);
        console.log('📧 Email subject:', emailSubject);
        
        // Try to get SMTP settings from database first
        let smtpSettings = null;
        try {
          smtpSettings = await storage.getSmtpSettings();
          console.log('📧 Database SMTP settings found:', smtpSettings ? 'Yes' : 'No');
        } catch (error) {
          console.log('📧 No database SMTP settings found, using env variables');
        }
        
        // Use database SMTP settings if available, otherwise fallback to env
        if (smtpSettings && smtpSettings.smtpHost) {
          results.email = await this.emailService.sendEmailWithSmtpSettings(partnerData.email, emailSubject, emailContent, smtpSettings);
        } else {
          results.email = await this.emailService.sendEmail(partnerData.email, emailSubject, emailContent);
        }
        console.log('📧 Email send result:', results.email);
      } else {
        console.log('❌ No email template found for referral_partner_welcome');
        results.email = { success: false, error: 'Template not found' };
      }

      // SMS welcome using template
      const smsTemplate = await templateService.getTemplate('sms', 'referral_partner_welcome');
      console.log('📱 SMS template found:', smsTemplate ? 'Yes' : 'No');
      
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, partnerData);
        console.log('📱 Attempting to send SMS to:', partnerData.contact);
        console.log('📱 SMS message:', smsMessage);
        
        results.sms = await this.smsService.sendSMS(partnerData.contact, smsMessage);
        console.log('📱 SMS send result:', results.sms);
      } else {
        console.log('❌ No SMS template found for referral_partner_welcome');
        results.sms = { success: false, error: 'Template not found' };
      }

      // WhatsApp welcome using Gupshup service
      try {
        await gupshupService.sendWelcomeMessage(partnerData.name, partnerData.contact, partnerData.sellerCode);
        results.whatsapp = { success: true, service: 'gupshup' };
      } catch (error: any) {
        results.whatsapp = { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Error sending referral partner welcome:', error);
    }

    return results;
  }

  async sendClaimStatusUpdate(
    claimData: {
      name: string;
      email: string;
      contact: string;
      voucherCode: string;
      status: string;
      claimAmount?: number;
    }
  ) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Email notification using template
      const emailTemplate = await templateService.getTemplate('email', 'claim_status_update');
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, claimData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || `BBG Claim Status: ${claimData.status}`, claimData);
        results.email = await this.emailService.sendEmail(claimData.email, emailSubject, emailContent);
      }

      // SMS notification using template
      const smsTemplate = await templateService.getTemplate('sms', 'claim_status_update');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, claimData);
        results.sms = await this.smsService.sendSMS(claimData.contact, smsMessage);
      }

      // WhatsApp notification using Gupshup service
      try {
        await gupshupService.sendClaimUpdate(claimData.name, claimData.contact, claimData.status, claimData.claimAmount);
        results.whatsapp = { success: true, service: 'gupshup' };
      } catch (error: any) {
        results.whatsapp = { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Error sending claim status update:', error);
    }

    return results;
  }

  async sendPayoutNotification(
    payoutData: {
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
        const emailContent = templateService.renderTemplate(emailTemplate.content, payoutData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || `Payout Update: ₹${payoutData.amount}`, payoutData);
        results.email = await this.emailService.sendEmail(payoutData.email, emailSubject, emailContent);
      }

      // SMS notification using template
      const smsTemplate = await templateService.getTemplate('sms', 'payout_notification');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, payoutData);
        results.sms = await this.smsService.sendSMS(payoutData.contact, smsMessage);
      }

      // WhatsApp notification using Gupshup service
      try {
        await gupshupService.sendPayoutUpdate(payoutData.name, payoutData.contact, payoutData.amount, payoutData.status);
        results.whatsapp = { success: true, service: 'gupshup' };
      } catch (error: any) {
        results.whatsapp = { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Error sending payout notification:', error);
    }

    return results;
  }

  // Test all communication channels
  async testAllChannels(testData: {
    email: string;
    phone: string;
    name: string;
    message: string;
  }) {
    const results = {
      email: null as any,
      sms: null as any,
      whatsapp: null as any
    };

    try {
      // Test email
      results.email = await this.emailService.sendEmail(
        testData.email,
        'XtraCover BBG - Test Email',
        `<h2>Test Email</h2><p>Hello ${testData.name},</p><p>${testData.message}</p>`,
        `Test Email - Hello ${testData.name}, ${testData.message}`
      );

      // Test SMS
      results.sms = await this.smsService.sendSMS(
        testData.phone,
        `Test SMS - Hello ${testData.name}, ${testData.message}`
      );

      // Test WhatsApp using Gupshup service
      try {
        await gupshupService.testConnection(testData.phone, `Test WhatsApp - Hello ${testData.name}, ${testData.message}`);
        results.whatsapp = { success: true, service: 'gupshup' };
      } catch (error: any) {
        results.whatsapp = { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Error testing communication channels:', error);
    }

    return results;
  }

  // Get service status for admin dashboard
  getServiceStatus() {
    return {
      email: {
        configured: !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD),
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        user: process.env.SMTP_USER ? '***configured***' : 'not configured'
      },
      sms: {
        configured: !!process.env.KALEYRA_API_KEY,
        service: 'Kaleyra',
        senderId: process.env.KALEYRA_SENDER_ID || 'XTCOVR'
      },
      whatsapp: {
        configured: true, // Gupshup service has hardcoded credentials
        service: 'Gupshup',
        account: '2000203988'
      }
    };
  }

  // Expose the SMTP test method
  async sendEmailWithSmtpSettings(to: string, subject: string, html: string, smtpSettings: any, text?: string) {
    return await this.emailService.sendEmailWithSmtpSettings(to, subject, html, smtpSettings, text);
  }

  async sendDistributorBBGNotification(
    notificationData: {
      distributorName: string;
      distributorEmail: string;
      distributorContact: string;
      customerName: string;
      customerContact: string;
      sellerCode: string;
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
      console.log('🔔 Attempting to send distributor BBG notification email to:', notificationData.distributorEmail);
      
      // Email notification using template
      const emailTemplate = await templateService.getTemplate('email', 'distributor_bbg_notification');
      if (emailTemplate) {
        console.log('✅ Found distributor BBG email template');
        const emailContent = templateService.renderTemplate(emailTemplate.content, notificationData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'New BBG Purchase Through Your Referral', notificationData);
        
        console.log('📧 Email details:', {
          to: notificationData.distributorEmail,
          subject: emailSubject,
          contentPreview: emailContent.substring(0, 100) + '...'
        });
        
        // Fetch SMTP settings from database
        const smtpSettings = await this.getSmtpSettings();
        if (smtpSettings) {
          console.log('📧 Using database SMTP settings for distributor notification');
          results.email = await this.emailService.sendEmailWithSmtpSettings(notificationData.distributorEmail, emailSubject, emailContent, smtpSettings);
        } else {
          console.log('📧 Using default SMTP settings for distributor notification');
          results.email = await this.emailService.sendEmail(notificationData.distributorEmail, emailSubject, emailContent);
        }
        
        console.log('📧 Distributor email send result:', results.email);
      } else {
        console.log('❌ No distributor BBG email template found');
      }

      // SMS notification using template
      const smsTemplate = await templateService.getTemplate('sms', 'distributor_bbg_notification');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, notificationData);
        results.sms = await this.smsService.sendSMS(notificationData.distributorContact, smsMessage);
      }

      // WhatsApp notification using template
      const whatsappTemplate = await templateService.getTemplate('whatsapp', 'distributor_bbg_notification');
      if (whatsappTemplate) {
        const whatsappMessage = templateService.renderTemplate(whatsappTemplate.content, notificationData);
        results.whatsapp = await this.whatsappService.sendWhatsAppMessage(notificationData.distributorContact, whatsappMessage);
      }
    } catch (error) {
      console.error('Error sending distributor BBG notification:', error);
    }

    return results;
  }
}

export const communicationService = new CommunicationService();