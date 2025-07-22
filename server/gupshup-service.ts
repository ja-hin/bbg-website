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
  // Pure SMS Gateway API endpoint (not WhatsApp)
  private readonly smsBaseUrl = 'https://media.smsgupshup.com/GatewayAPI/rest';
  
  private readonly userId = '2000203988';
  private readonly password = 'CrtvMm59A';
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

    // Use account 2000203988 for WhatsApp messages (HSM template-based)
    try {
      const whatsappHSMResult = await this.sendWhatsAppHSMMessage(phoneNumber, message.message);
      return whatsappHSMResult;
    } catch (error: any) {
      console.log('WhatsApp HSM failed:', error);
      // Don't fallback - just throw the HSM template error
      throw new Error(`WhatsApp message failed: ${error.message}`);
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

  // Account 2000203988 - WhatsApp Business HSM (your Thunderclient format)
  private async sendWhatsAppHSMMessage(phoneNumber: string, messageText: string): Promise<GupshupResponse> {
    // Use the exact API format that works in Thunderclient
    const userId = '2000203988';  // Your working account from Thunderclient
    const password = 'CrtvMm59A';  // Your working password from Thunderclient
    
    // Clean up message for SMS
    let formattedMessage = messageText.replace(/[🎉🛡️📱🔄📋💰📦❌✅💳⏳📞💬🔐]/g, '').trim();
    
    // Ensure message is not too long for SMS
    if (formattedMessage.length > 160) {
      formattedMessage = formattedMessage.substring(0, 157) + '...';
    }

    // Build the EXACT URL format from your working Thunderclient example
    const baseUrl = 'https://media.smsgupshup.com/GatewayAPI/rest';
    const params = new URLSearchParams({
      userid: userId,
      password: password,
      send_to: phoneNumber,
      v: '1.1',
      format: 'json',
      msg_type: 'TEXT',
      method: 'SENDMESSAGE',
      msg: formattedMessage
    });

    const fullUrl = `${baseUrl}?${params.toString()}`;
    
    console.log('Sending WhatsApp message via Gupshup account 2000203988 (exact Thunderclient format) to:', phoneNumber);
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
      message += ` Amount: Rs.${amount}. Pickup will be scheduled.`;
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