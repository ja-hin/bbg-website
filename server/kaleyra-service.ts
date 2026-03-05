import axios from 'axios';

interface KaleyraSMSConfig {
  apiKey: string;
  sid?: string; // Not used in v4 API
  region?: 'global' | 'india';
  senderId?: string;
}

interface OTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface KaleyraSMSResponse {
  id?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

export class KaleyraSMSService {
  private apiKey: string;
  private sid: string;
  private baseURL: string;
  private senderId: string;

  constructor(config: KaleyraSMSConfig) {
    this.apiKey = config.apiKey;
    this.sid = config.sid || ''; // Not used in v4 API
    this.senderId = config.senderId || 'XTCOVR';
    this.baseURL = 'https://api-alerts.kaleyra.com/v4/';
  }

  /**
   * Send OTP SMS using Kaleyra API
   * @param phoneNumber - Phone number with country code (e.g., +919876543210)
   * @param otpCode - The OTP code to send
   * @param customMessage - Optional custom message template
   * @returns Promise<OTPResponse>
   */
  async sendOTP(phoneNumber: string, otpCode: string, customMessage?: string): Promise<OTPResponse> {
    // Check if service is properly configured (only API key needed for v4)
    if (!this.apiKey) {
      console.warn('Kaleyra SMS service not configured - API key missing');
      return {
        success: false,
        error: 'SMS service not configured. Please add KALEYRA_API_KEY to environment variables.'
      };
    }

    try {
      // Ensure phone number has country code
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Default OTP message template
      const message = customMessage || `Your OTP is ${otpCode}. Do not share your OTP with anyone. Team XtraCover. - XtraCover`;
      
      // Use the working Kaleyra API format
      const url = this.baseURL;
      const params = new URLSearchParams({
        api_key: this.apiKey,
        method: 'sms',
        message: message,
        to: formattedPhone,
        sender: this.senderId
      });

      const fullUrl = `${url}?${params.toString()}`;

      console.log('Sending OTP via Kaleyra:', {
        to: formattedPhone,
        sender: this.senderId,
        url: url,
        hasApiKey: !!this.apiKey
      });

      const response = await axios.get(fullUrl, {
        timeout: 30000 // 30 second timeout
      });

      console.log('Kaleyra OTP sent successfully:', {
        status: response.status,
        data: response.data,
        to: formattedPhone
      });

      return {
        success: true,
        messageId: response.data?.id || 'sent'
      };

    } catch (error: any) {
      console.error('Kaleyra OTP sending failed:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        url: error.config?.url
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send OTP'
      };
    }
  }

  /**
   * Format phone number to ensure proper country code
   * @param phoneNumber - Raw phone number
   * @returns Formatted phone number with country code
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or special characters
    let cleaned = phoneNumber.replace(/[^\d]/g, '');
    
    // If it's a 12-digit number starting with 91, it's an Indian number with country code
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // If it's a 10-digit number, assume Indian mobile and add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // If it already has a plus, just return it (after cleaning other chars)
    if (phoneNumber.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Validate if phone number is in correct format
   * @param phoneNumber - Phone number to validate
   * @returns boolean
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Validation for Indian mobile numbers (+91 followed by 10 digits starting with 6-9)
    // or just allow any 10-12 digit number for now to be safe
    return /^\+91[6-9]\d{9}$/.test(formatted) || /^\+\d{10,12}$/.test(formatted);
  }
}

// Initialize Kaleyra service with environment variables
function createKaleyraSMSService(): KaleyraSMSService {
  const apiKey = process.env.KALEYRA_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  Kaleyra SMS service not configured. Missing KALEYRA_API_KEY environment variable.');
    console.log('📝 To enable SMS functionality, add this to your environment:');
    console.log('   KALEYRA_API_KEY=your_api_key');
    console.log('   KALEYRA_SENDER_ID=XTCOVR (optional, defaults to XTCOVR)');
  }

  return new KaleyraSMSService({
    apiKey: apiKey || '',
    senderId: process.env.KALEYRA_SENDER_ID || 'XTCOVR'
  });
}

export const kaleyraSMSService = createKaleyraSMSService();