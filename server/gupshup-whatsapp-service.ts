import axios from 'axios';

export interface WhatsAppMessage {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: string[];
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export class GupshupWhatsAppService {
  // Gupshup WhatsApp Business API endpoint
  private readonly baseUrl = 'https://api.gupshup.io/sm/api/v1';
  private readonly apiKey = process.env.GUPSHUP_API_KEY || '';
  private readonly appName = 'xtracover-bbg';
  private readonly sourceNumber = '919999999999'; // WhatsApp Business number

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'WhatsApp API key not configured'
        };
      }

      // Format phone number
      let phoneNumber = message.to.replace(/\D/g, '');
      if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }

      // For WhatsApp Business API, we need to use templates or opt-in conversations
      // Since templates need pre-approval, let's create a fallback to SMS
      const payload = new URLSearchParams({
        channel: 'whatsapp',
        source: this.sourceNumber,
        destination: phoneNumber,
        'src.name': this.appName
      });

      if (message.templateName && message.templateParams) {
        // Template message
        payload.append('template', JSON.stringify({
          id: message.templateName,
          params: message.templateParams
        }));
      } else {
        // Free-form text message (requires opt-in or 24h window)
        payload.append('message', JSON.stringify({
          type: 'text',
          text: message.message
        }));
      }

      const response = await axios.post(`${this.baseUrl}/msg`, payload, {
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      console.log('Gupshup WhatsApp response:', response.data);

      if (response.data?.status === 'submitted') {
        return {
          success: true,
          messageId: response.data.messageId,
          details: response.data
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'Message failed to send',
          details: response.data
        };
      }

    } catch (error: any) {
      console.error('Gupshup WhatsApp error:', error.response?.data || error.message);
      return {
        success: false,
        error: `WhatsApp delivery failed: ${error.response?.data?.message || error.message}`,
        details: error.response?.data
      };
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured(),
      service: 'Gupshup WhatsApp Business API',
      sourceNumber: this.sourceNumber,
      appName: this.appName
    };
  }
}

export const gupshupWhatsAppService = new GupshupWhatsAppService();