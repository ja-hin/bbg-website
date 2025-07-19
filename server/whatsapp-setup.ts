// WhatsApp Setup Helper for Gupshup API Key Retrieval
import axios from 'axios';

/**
 * Helper instructions for getting Gupshup API Key
 * 
 * Based on your credentials:
 * - Login: 2000203987
 * - Password: VqFvY7Ypd
 * - Phone Number: +91 93118 16849
 * 
 * Steps to get API Key:
 * 1. Login to https://www.gupshup.io/whatsapp/dashboard
 * 2. Use Account ID: 2000203987 and Password: VqFvY7Ypd
 * 3. Go to Settings tab and copy the API Key
 * 4. Add it to environment variables as GUPSHUP_API_KEY
 */

export interface GupshupConfig {
  accountId: string;
  password: string;
  apiKey?: string;
  sourceNumber: string;
  appName: string;
}

export class GupshupSetupHelper {
  static getSetupInstructions(): string {
    return `
🔧 WHATSAPP SETUP REQUIRED

Your Gupshup account details:
- Account ID: 2000203987
- Password: VqFvY7Ypd  
- WhatsApp Number: +91 93118 16849

📋 To complete setup:
1. Visit: https://www.gupshup.io/whatsapp/dashboard
2. Login with Account ID: 2000203987
3. Use Password: VqFvY7Ypd
4. Go to "Settings" tab 
5. Copy your API Key
6. Provide the API Key to complete WhatsApp integration

Current Status: ❌ API Key Missing
Required: GUPSHUP_API_KEY environment variable
    `;
  }

  static validateConfig(config: Partial<GupshupConfig>): boolean {
    return !!(config.apiKey && config.sourceNumber && config.accountId);
  }

  static getConfigStatus(): { configured: boolean; missing: string[] } {
    const required = ['GUPSHUP_API_KEY', 'GUPSHUP_SOURCE_NUMBER', 'GUPSHUP_ACCOUNT_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    return {
      configured: missing.length === 0,
      missing
    };
  }
}

// Test function to verify WhatsApp configuration
export async function testWhatsAppConfig(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const config = GupshupSetupHelper.getConfigStatus();
    
    if (!config.configured) {
      return {
        success: false,
        message: `Missing configuration: ${config.missing.join(', ')}`,
        details: GupshupSetupHelper.getSetupInstructions()
      };
    }

    // If configured, test the API
    const response = await axios.get('https://api.gupshup.io/sm/api/v1/users', {
      headers: {
        'apikey': process.env.GUPSHUP_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    return {
      success: true,
      message: 'WhatsApp configuration verified successfully',
      details: {
        accountId: process.env.GUPSHUP_ACCOUNT_ID,
        sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER,
        appName: process.env.GUPSHUP_APP_NAME
      }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `WhatsApp configuration test failed: ${error.message}`,
      details: GupshupSetupHelper.getSetupInstructions()
    };
  }
}