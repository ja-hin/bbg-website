import nodemailer from 'nodemailer';
import axios from 'axios';
import { templateService } from './template-service';
import { gupshupService } from './gupshup-service';

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
        console.log('SMTP settings incomplete, email not sent');
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
      // Email welcome using template
      const emailTemplate = await templateService.getTemplate('email', 'distributor_welcome');
      if (emailTemplate) {
        const emailContent = templateService.renderTemplate(emailTemplate.content, partnerData);
        const emailSubject = templateService.renderTemplate(emailTemplate.subject || 'Welcome to XtraCover BBG Partnership', partnerData);
        results.email = await this.emailService.sendEmail(partnerData.email, emailSubject, emailContent);
      }

      // SMS welcome using template
      const smsTemplate = await templateService.getTemplate('sms', 'distributor_welcome');
      if (smsTemplate) {
        const smsMessage = templateService.renderTemplate(smsTemplate.content, partnerData);
        results.sms = await this.smsService.sendSMS(partnerData.contact, smsMessage);
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
}

export const communicationService = new CommunicationService();