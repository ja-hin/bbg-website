import axios from 'axios';

export interface GupshupMessage {
  to: string;
  message: string;
  type?: 'TEXT' | 'IMAGE' | 'DOCUMENT';
}

export interface GupshupResponse {
  response: {
    status: string;
    id: string;
    phone: string;
    details: string;
  };
}

export class GupshupService {
  // WhatsApp Business API endpoint for HSM templates
  private readonly whatsappBaseUrl = 'https://api.gupshup.io/sm/api/v1';
  // HSM Gateway API endpoint 
  private readonly hsmBaseUrl = 'https://media.smsgupshup.com/GatewayAPI/rest';
  
  private readonly hsmLogin = '2000203988';
  private readonly hsmPassword = 'CrtvMm59A';
  private readonly verificationCode = 'PMTW';
  private readonly apiKey = process.env.GUPSHUP_API_KEY || '';
  private readonly sourceNumber = '919999999999';
  
  // Track delivery status
  private deliveryEnabled = true;

  async sendMessage(message: GupshupMessage): Promise<GupshupResponse> {
    if (!this.deliveryEnabled) {
      // Return mock success for testing
      return {
        response: {
          status: 'success',
          id: 'mock-' + Date.now(),
          phone: message.to,
          details: 'Message sent (test mode)'
        }
      };
    }

    // Format phone number - ensure it has country code
    let phoneNumber = message.to.replace(/\D/g, '');
    if (phoneNumber.startsWith('91')) {
      phoneNumber = phoneNumber;
    } else if (phoneNumber.length === 10) {
      phoneNumber = '91' + phoneNumber;
    }

    // Try WhatsApp Business API first if API key is available
    if (this.apiKey) {
      try {
        const whatsappResult = await this.sendWhatsAppMessage(phoneNumber, message.message);
        return whatsappResult;
      } catch (error) {
        console.log('WhatsApp Business API failed:', error);
        throw error; // Don't fallback, just show the error
      }
    }

    // Use HSM account 2000203988 for WhatsApp messages (HSM template-based)
    try {
      const hsmResult = await this.sendHSMMessage(phoneNumber, message.message);
      return hsmResult;
    } catch (error: any) {
      console.log('HSM WhatsApp failed:', error);
      // Don't fallback - just throw the HSM template error
      throw new Error(`WhatsApp HSM template error: ${error.message}`);
    }
  }

  private async sendWhatsAppMessage(phoneNumber: string, messageText: string): Promise<GupshupResponse> {
    // Create WhatsApp message payload
    const payload = new URLSearchParams({
      channel: 'whatsapp',
      source: this.sourceNumber,
      destination: phoneNumber,
      'src.name': 'xtracover-bbg',
      message: JSON.stringify({
        type: 'text',
        text: messageText
      })
    });

    console.log('Sending WhatsApp Business message to:', phoneNumber);
    console.log('Message content:', messageText);

    const response = await axios.post(`${this.whatsappBaseUrl}/msg`, payload, {
      headers: {
        'apikey': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    console.log('WhatsApp Business API response:', response.data);

    if (response.data?.status === 'submitted') {
      return {
        response: {
          status: 'success',
          id: response.data.messageId || 'whatsapp-' + Date.now(),
          phone: phoneNumber,
          details: 'WhatsApp message sent successfully'
        }
      };
    } else {
      throw new Error('WhatsApp message failed: ' + (response.data?.message || 'Unknown error'));
    }
  }

  // HSM Account 2000203988 - WhatsApp Business HSM (your Thunderclient format)
  private async sendHSMMessage(phoneNumber: string, messageText: string): Promise<GupshupResponse> {
    return this.sendHSMMessageWithTemplate(phoneNumber, messageText);
  }

  // Send HSM message with template (exact Thunderclient format)
  private async sendHSMMessageWithTemplate(phoneNumber: string, messageText: string): Promise<GupshupResponse> {
    
    // Clean up message for SMS
    let formattedMessage = messageText.replace(/[🎉🛡️📱🔄📋💰📦❌✅💳⏳📞💬🔐]/g, '').trim();
    
    // Ensure message is not too long for SMS
    if (formattedMessage.length > 160) {
      formattedMessage = formattedMessage.substring(0, 157) + '...';
    }

    // Build the EXACT URL format from your working Thunderclient example
    const params = new URLSearchParams({
      userid: this.hsmLogin,
      password: this.hsmPassword,
      send_to: phoneNumber,
      v: '1.1',
      format: 'json',
      msg_type: 'TEXT',
      method: 'SENDMESSAGE',
      msg: formattedMessage
    });

    const fullUrl = `${this.hsmBaseUrl}?${params.toString()}`;
    
    console.log(`Sending HSM WhatsApp message via Gupshup account ${this.hsmLogin} (exact Thunderclient format) to:`, phoneNumber);
    console.log('Full URL:', fullUrl);
    console.log('WhatsApp message content:', formattedMessage);

    try {
      // Use GET request exactly like your working Thunderclient example
      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });

      console.log('WhatsApp response:', response.data);

      // Check for success response
      if (response.data && (response.data.status === 'success' || response.data.response?.status === 'success')) {
        return {
          response: {
            status: 'success',
            id: response.data.id || response.data.response?.id || 'gupshup-' + Date.now(),
            phone: phoneNumber,
            details: 'WhatsApp message sent via Gupshup account 2000203988'
          }
        };
      } else {
        // Show HSM template error directly - no fallback
        const errorMessage = response.data?.message || response.data?.response?.details || 'Unknown WhatsApp error';
        throw new Error(`WhatsApp HSM template error: ${errorMessage}`);
      }
    } catch (error: any) {
      console.log('WhatsApp delivery failed:', error.message);
      console.log('Error response:', error.response?.data);
      throw new Error(`WhatsApp delivery failed: ${error.message}`);
    }
  }



  // Method to disable/enable actual delivery for testing
  setDeliveryEnabled(enabled: boolean) {
    this.deliveryEnabled = enabled;
    console.log(`Gupshup delivery ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Send HSM approved template message (using exact approved template text)
  async sendHSMTemplate(phone: string, templateText?: string, parameters: string[] = []): Promise<GupshupResponse> {
    const phoneNumber = phone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber;

    // Use the exact approved HSM template text provided by user
    const approvedTemplate = templateText || `Dear Customer,

Thank you for completing your product registration, Your Protection Plan is auto-activated and registered with us.

Please share your purchasing experience with us on the given link below.

Share Your Experience and Rating 

Best Regards
Team XtraCover`;

    // Try different HSM approaches
    let params;
    
    // First try: HSM with template ID approach (common for approved templates)
    if (templateText && templateText.includes('template_id:')) {
      const templateId = templateText.split('template_id:')[1].trim();
      params = new URLSearchParams({
        userid: this.hsmLogin,
        password: this.hsmPassword,
        send_to: formattedPhone,
        v: '1.1',
        format: 'json',
        msg_type: 'HSM',
        method: 'SENDMESSAGE',
        template_id: templateId,
        msg: approvedTemplate
      });
    } else {
      // Second try: Direct HSM template text sending
      params = new URLSearchParams({
        userid: this.hsmLogin,
        password: this.hsmPassword,
        send_to: formattedPhone,
        v: '1.1',
        format: 'json',
        msg_type: 'HSM',
        method: 'SENDMESSAGE',
        msg: approvedTemplate
      });
    }

    const fullUrl = `${this.hsmBaseUrl}?${params.toString()}`;

    console.log(`Sending HSM approved template to ${formattedPhone}`);
    console.log('Full template content:');
    console.log(approvedTemplate);
    console.log('Full HSM URL:', fullUrl);

    try {
      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });

      console.log('HSM template response:', response.data);

      if (response.data?.response?.status === 'success') {
        return {
          response: {
            status: 'success',
            id: response.data.response.id,
            phone: formattedPhone,
            details: `HSM approved template sent successfully`
          }
        };
      } else {
        const errorMessage = response.data?.response?.details || 'HSM template failed';
        console.log('HSM template failed response:', response.data);
        console.log('IMPORTANT: This error suggests the HSM template needs to be registered with Gupshup first');
        console.log('The approved template text must be submitted to Gupshup for HSM approval and assigned a template ID');
        
        // Return detailed response instead of throwing error
        return {
          success: false,
          response: {
            status: 'hsm_template_error',
            id: response.data?.response?.id || 'unknown',
            phone: formattedPhone,
            details: `HSM Template Error: ${errorMessage}. This template needs to be registered with Gupshup first.`
          }
        };
      }
    } catch (error: any) {
      console.log('HSM template delivery failed:', error);
      console.log('IMPORTANT: The HSM template needs to be registered with Gupshup and assigned a template ID/name');
      
      // Check if it's the template mismatch error
      if (error.message && error.message.includes('Message does not match WhatsApp HSM template')) {
        return {
          success: false,
          response: {
            status: 'hsm_registration_required',
            id: 'template_not_registered',
            phone: formattedPhone,
            details: 'HSM Template Registration Required: The approved template text needs to be registered with Gupshup and assigned a template ID/name before it can be used.'
          }
        };
      }
      
      throw new Error(`HSM template delivery failed: ${error.message}`);
    }
  }

  // WhatsApp Business API template method
  private async sendWhatsAppTemplate(phoneNumber: string, templateName: string, parameters: string[]): Promise<GupshupResponse> {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': this.apiKey
    };

    const templateData = {
      channel: 'whatsapp',
      source: this.sourceNumber,
      destination: phoneNumber,
      'template': JSON.stringify({
        id: templateName,
        params: parameters
      })
    };

    try {
      const response = await axios.post(`${this.whatsappBaseUrl}/template/msg`, templateData, { headers });
      
      console.log('WhatsApp template response:', response.data);

      if (response.data?.status === 'submitted') {
        return {
          response: {
            status: 'success',
            id: response.data.messageId || 'template-' + Date.now(),
            phone: phoneNumber,
            details: `WhatsApp template "${templateName}" sent successfully`
          }
        };
      } else {
        throw new Error('WhatsApp template failed: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error: any) {
      throw new Error('WhatsApp template API error: ' + error.message);
    }
  }

  async sendWelcomeMessage(name: string, phone: string, referralCode: string): Promise<void> {
    const message = `Welcome to Xtracover BBG, ${name}! Your referral code: ${referralCode}. Commission: Rs.25 per registration. For support: 8860396039`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendCustomerWelcome(name: string, phone: string, voucherCode: string): Promise<void> {
    const message = `Welcome to Xtracover BBG, ${name}! Your BBG voucher: ${voucherCode}. Device protection active. For support: 8860396039`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendClaimUpdate(name: string, phone: string, status: string, amount?: number): Promise<void> {
    let message = `BBG Claim Update for ${name}. Status: ${status.toUpperCase()}.`;
    
    if (status === 'approved' && amount) {
      message += ` Amount: Upto Rs.${amount}. Pickup will be scheduled.`;
    } else if (status === 'rejected') {
      message += ` Contact support: 8860396039`;
    } else if (status === 'paid' && amount) {
      message += ` Payment of Rs.${amount} processed. Check your account.`;
    }
    
    message += ` Support: 8860396039`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendPayoutUpdate(name: string, phone: string, amount: number, status: string): Promise<void> {
    let message = `Payout Update for ${name}. Amount: Rs.${amount}. Status: ${status.toUpperCase()}.`;
    
    if (status === 'paid') {
      message += ` Payment processed. Check your bank account.`;
    } else if (status === 'processing') {
      message += ` Processing. Expected in 2-3 days.`;
    } else if (status === 'failed') {
      message += ` Payment failed. Update bank details.`;
    }
    
    message += ` Support: 8860396039`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendOTP(phone: string, otp: string): Promise<void> {
    const message = `Your Xtracover BBG verification code: ${otp}. Valid for 10 minutes. Do not share. Support: 8860396039`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async testConnection(testPhone: string, testMessage: string): Promise<GupshupResponse> {
    return await this.sendMessage({
      to: testPhone,
      message: testMessage,
      type: 'TEXT'
    });
  }
}

export const gupshupService = new GupshupService();