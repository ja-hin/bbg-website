import nodemailer from 'nodemailer';
import axios from 'axios';

// Email Service using SMTP
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
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

      const mailOptions = {
        from: `"Xtracover BBG" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: text || '',
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
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
    this.senderId = process.env.KALEYRA_SENDER_ID || 'XTRCVR';
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

// WhatsApp Service using Gupshup
export class WhatsAppService {
  private apiKey: string;
  private appName: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GUPSHUP_API_KEY || '';
    this.appName = process.env.GUPSHUP_APP_NAME || 'xtracover-bbg';
    this.baseUrl = 'https://api.gupshup.io/sm/api/v1';
  }

  async sendWhatsAppMessage(to: string, message: string, templateName?: string, templateParams?: any[]) {
    try {
      if (!this.apiKey) {
        console.log('Gupshup API key not configured, WhatsApp message not sent');
        return { success: false, message: 'WhatsApp service not configured' };
      }

      // Format phone number to ensure it has 91 prefix (no + for Gupshup)
      const formattedNumber = to.replace(/^\+?91?/, '91');

      let payload: any = {
        channel: 'whatsapp',
        source: process.env.GUPSHUP_SOURCE_NUMBER || '919999999999',
        destination: formattedNumber,
        'src.name': this.appName,
      };

      if (templateName && templateParams) {
        // Template message
        payload.template = JSON.stringify({
          id: templateName,
          params: templateParams
        });
      } else {
        // Simple text message
        payload.message = JSON.stringify({
          type: 'text',
          text: message
        });
      }

      const response = await axios.post(`${this.baseUrl}/msg`, new URLSearchParams(payload), {
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      if (response.data && response.data.status === 'submitted') {
        console.log('WhatsApp message sent successfully via Gupshup:', {
          to: formattedNumber,
          messageId: response.data.messageId
        });
        return { 
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

  // Send notifications for different events
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

    // Email confirmation
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626;">Xtracover BBG</h1>
          <h2 style="color: #374151;">Registration Successful!</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Hi ${customerData.name},</h3>
          <p>Your BBG registration has been completed successfully. Here are your details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong>BBG Voucher Code: ${customerData.voucherCode}</strong>
          </div>
          
          <ul style="color: #6b7280;">
            <li><strong>Device:</strong> ${customerData.brand} ${customerData.modelName} (${customerData.deviceType})</li>
            <li><strong>Contact:</strong> ${customerData.contact}</li>
            <li><strong>Email:</strong> ${customerData.email}</li>
          </ul>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Save your voucher code safely. You'll need it to claim your BBG.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Thank you for choosing Xtracover BBG!</p>
        </div>
      </div>
    `;

    results.email = await this.emailService.sendEmail(
      customerData.email,
      'BBG Registration Successful - Xtracover',
      emailHtml
    );

    // SMS confirmation
    const smsMessage = `Hi ${customerData.name}, your BBG registration is successful! Your voucher code: ${customerData.voucherCode}. Keep it safe for claiming your BBG. - Xtracover`;
    results.sms = await this.smsService.sendSMS(customerData.contact, smsMessage);

    // WhatsApp confirmation
    const whatsappMessage = `🎉 Hi ${customerData.name}!\n\nYour BBG registration is successful!\n\n📱 Device: ${customerData.brand} ${customerData.modelName}\n🎟️ Voucher Code: *${customerData.voucherCode}*\n\n⚠️ Keep your voucher code safe for claiming BBG.\n\nThank you for choosing Xtracover BBG! 🛡️`;
    results.whatsapp = await this.whatsappService.sendWhatsAppMessage(customerData.contact, whatsappMessage);

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

    // Email welcome
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626;">Xtracover BBG</h1>
          <h2 style="color: #374151;">Welcome to Our Referral Program!</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Hi ${partnerData.name},</h3>
          <p>Welcome to the Xtracover BBG Referral Program! You're now part of our partner network.</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong>Your Referral Code: ${partnerData.sellerCode}</strong>
          </div>
          
          <ul style="color: #6b7280;">
            ${partnerData.businessName ? `<li><strong>Business:</strong> ${partnerData.businessName}</li>` : ''}
            <li><strong>Contact:</strong> ${partnerData.contact}</li>
            <li><strong>Email:</strong> ${partnerData.email}</li>
            <li><strong>Commission:</strong> ₹25 per successful registration</li>
          </ul>
        </div>
        
        <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #065f46;"><strong>Next Steps:</strong> Share your referral code with customers to start earning commissions!</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Thank you for partnering with Xtracover BBG!</p>
        </div>
      </div>
    `;

    results.email = await this.emailService.sendEmail(
      partnerData.email,
      'Welcome to Xtracover BBG Referral Program!',
      emailHtml
    );

    // SMS welcome
    const smsMessage = `Welcome to Xtracover BBG Referral Program! Your referral code: ${partnerData.sellerCode}. Earn ₹25 per successful registration. Start sharing! - Xtracover`;
    results.sms = await this.smsService.sendSMS(partnerData.contact, smsMessage);

    // WhatsApp welcome
    const whatsappMessage = `🎉 Welcome ${partnerData.name}!\n\nYou're now a Xtracover BBG Referral Partner!\n\n🔑 Your Referral Code: *${partnerData.sellerCode}*\n💰 Earn ₹25 per successful registration\n\n📢 Start sharing your code with customers to earn commissions!\n\nWelcome to the team! 🤝`;
    results.whatsapp = await this.whatsappService.sendWhatsAppMessage(partnerData.contact, whatsappMessage);

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

    const statusText = {
      'approved': 'Approved ✅',
      'rejected': 'Rejected ❌',
      'processing': 'Under Review 🔍',
      'paid': 'Payment Completed 💰'
    }[customerData.status] || customerData.status;

    // Email update
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626;">Xtracover BBG</h1>
          <h2 style="color: #374151;">Claim Status Update</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Hi ${customerData.name},</h3>
          <p>Your BBG claim status has been updated:</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Voucher Code:</strong> ${customerData.voucherCode}</p>
            <p><strong>Claim Amount:</strong> ₹${customerData.claimAmount}</p>
            <p><strong>Status:</strong> <span style="color: ${customerData.status === 'approved' || customerData.status === 'paid' ? '#10b981' : customerData.status === 'rejected' ? '#ef4444' : '#f59e0b'};">${statusText}</span></p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Thank you for choosing Xtracover BBG!</p>
        </div>
      </div>
    `;

    results.email = await this.emailService.sendEmail(
      customerData.email,
      `BBG Claim Update - ${statusText} - Xtracover`,
      emailHtml
    );

    // SMS update
    const smsMessage = `Hi ${customerData.name}, your BBG claim (${customerData.voucherCode}) status: ${statusText}. Amount: ₹${customerData.claimAmount}. - Xtracover`;
    results.sms = await this.smsService.sendSMS(customerData.contact, smsMessage);

    // WhatsApp update
    const whatsappMessage = `📋 Hi ${customerData.name}!\n\nYour BBG claim status has been updated:\n\n🎟️ Voucher: ${customerData.voucherCode}\n💰 Amount: ₹${customerData.claimAmount}\n📊 Status: ${statusText}\n\nThank you for choosing Xtracover BBG! 🛡️`;
    results.whatsapp = await this.whatsappService.sendWhatsAppMessage(customerData.contact, whatsappMessage);

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

    const statusText = {
      'processing': 'Being Processed 🔄',
      'paid': 'Completed ✅',
      'failed': 'Failed ❌'
    }[partnerData.status] || partnerData.status;

    // Email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626;">Xtracover BBG</h1>
          <h2 style="color: #374151;">Payout Update</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Hi ${partnerData.name},</h3>
          <p>Your commission payout has been updated:</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Amount:</strong> ₹${partnerData.amount}</p>
            <p><strong>Status:</strong> <span style="color: ${partnerData.status === 'paid' ? '#10b981' : partnerData.status === 'failed' ? '#ef4444' : '#f59e0b'};">${statusText}</span></p>
            ${partnerData.paymentReference ? `<p><strong>Reference:</strong> ${partnerData.paymentReference}</p>` : ''}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Thank you for being our valued partner!</p>
        </div>
      </div>
    `;

    results.email = await this.emailService.sendEmail(
      partnerData.email,
      `Payout Update - ${statusText} - Xtracover`,
      emailHtml
    );

    // SMS notification
    const smsMessage = `Hi ${partnerData.name}, your commission payout of ₹${partnerData.amount} status: ${statusText}. ${partnerData.paymentReference ? `Ref: ${partnerData.paymentReference}` : ''} - Xtracover`;
    results.sms = await this.smsService.sendSMS(partnerData.contact, smsMessage);

    // WhatsApp notification
    const whatsappMessage = `💰 Hi ${partnerData.name}!\n\nYour commission payout update:\n\n💸 Amount: ₹${partnerData.amount}\n📊 Status: ${statusText}\n${partnerData.paymentReference ? `📋 Reference: ${partnerData.paymentReference}\n` : ''}\nThank you for being our valued partner! 🤝`;
    results.whatsapp = await this.whatsappService.sendWhatsAppMessage(partnerData.contact, whatsappMessage);

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
        'Test Email - Xtracover BBG Communications',
        `<h2>Hello ${testData.name}!</h2><p>This is a test email from Xtracover BBG communication system. If you received this, email notifications are working correctly!</p>`
      ),
      sms: await this.smsService.sendSMS(
        testData.contact,
        `Hi ${testData.name}! This is a test SMS from Xtracover BBG. If you received this, SMS notifications are working! - Xtracover`
      ),
      whatsapp: await this.whatsappService.sendWhatsAppMessage(
        testData.contact,
        `🧪 Hi ${testData.name}!\n\nThis is a test WhatsApp message from Xtracover BBG.\n\nIf you received this, WhatsApp notifications are working correctly! ✅\n\n- Xtracover Team`
      )
    };

    console.log('Communication test results:', results);
    return results;
  }
}

// Export singleton instance
export const communicationService = new CommunicationService();