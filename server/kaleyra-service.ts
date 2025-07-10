import axios from 'axios';

interface KaleyraSMSConfig {
  apiKey: string;
  sid: string;
  region?: 'global' | 'india';
  senderId?: string;
}

interface OTPResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface KaleyraSMSResponse {
  id: string;
  account_sid: string;
  to: string;
  from: string;
  type: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class KaleyraSMSService {
  private apiKey: string;
  private sid: string;
  private baseURL: string;
  private senderId: string;

  constructor(config: KaleyraSMSConfig) {
    this.apiKey = config.apiKey;
    this.sid = config.sid;
    this.senderId = config.senderId || 'KLRHXA';
    this.baseURL = config.region === 'india' 
      ? 'https://api.in.kaleyra.io/v1/' 
      : 'https://api.kaleyra.io/v1/';
  }

  /**
   * Send OTP SMS using Kaleyra API
   * @param phoneNumber - Phone number with country code (e.g., +919876543210)
   * @param otpCode - The OTP code to send
   * @param customMessage - Optional custom message template
   * @returns Promise<OTPResponse>
   */
  async sendOTP(phoneNumber: string, otpCode: string, customMessage?: string): Promise<OTPResponse> {
    // Check if service is properly configured
    if (!this.apiKey || !this.sid) {
      console.warn('Kaleyra SMS service not configured - API key or SID missing');
      return {
        success: false,
        error: 'SMS service not configured. Please add KALEYRA_API_KEY and KALEYRA_SID to environment variables.'
      };
    }

    try {
      // Ensure phone number has country code
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const url = `${this.baseURL}${this.sid}/messages`;
      
      // Default OTP message template
      const message = customMessage || `Your BBG verification code is ${otpCode}. Please do not share this with anyone. Valid for 10 minutes.`;
      
      const data = new URLSearchParams({
        to: formattedPhone,
        type: 'OTP',
        sender: this.senderId,
        body: message
      });

      console.log('Sending OTP via Kaleyra:', {
        to: formattedPhone,
        sender: this.senderId,
        url: url,
        hasApiKey: !!this.apiKey
      });

      const response = await axios.post<KaleyraSMSResponse>(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'api-key': this.apiKey
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('Kaleyra OTP sent successfully:', {
        messageId: response.data.id,
        to: response.data.to,
        status: response.data.status
      });

      return {
        success: true,
        messageId: response.data.id
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
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If number starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // If number starts with 91 (India country code)
    if (cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // If number starts with 0, remove it and add +91 (Indian mobile)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If it's a 10-digit number, assume Indian mobile and add +91
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    
    // If it's already formatted correctly for India
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    // Default: assume it needs +91 prefix for Indian numbers
    return `+91${cleaned}`;
  }

  /**
   * Validate if phone number is in correct format
   * @param phoneNumber - Phone number to validate
   * @returns boolean
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Basic validation for Indian mobile numbers
    return /^\+91[6-9]\d{9}$/.test(formatted);
  }
}

// Initialize Kaleyra service with environment variables
function createKaleyraSMSService(): KaleyraSMSService {
  const apiKey = process.env.KALEYRA_API_KEY;
  const sid = process.env.KALEYRA_SID;
  
  if (!apiKey || !sid) {
    console.warn('⚠️  Kaleyra SMS service not configured. Missing KALEYRA_API_KEY or KALEYRA_SID environment variables.');
    console.log('📝 To enable SMS functionality, add these to your environment:');
    console.log('   KALEYRA_API_KEY=your_api_key');
    console.log('   KALEYRA_SID=your_sid');
    console.log('   KALEYRA_REGION=india (optional, defaults to india)');
    console.log('   KALEYRA_SENDER_ID=BBGAPP (optional, defaults to BBGAPP)');
  }

  return new KaleyraSMSService({
    apiKey: apiKey || '',
    sid: sid || '',
    region: (process.env.KALEYRA_REGION as 'global' | 'india') || 'india',
    senderId: process.env.KALEYRA_SENDER_ID || 'BBGAPP'
  });
}

export const kaleyraSMSService = createKaleyraSMSService();