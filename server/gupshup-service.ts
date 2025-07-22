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
  private readonly baseUrl = 'https://media.smsgupshup.com/GatewayAPI/rest';
  private readonly userId = '2000203988';
  private readonly password = 'CrtvMm59A';

  async sendMessage(message: GupshupMessage): Promise<GupshupResponse> {
    try {
      // Format phone number - ensure it has country code
      let phoneNumber = message.to.replace(/\D/g, '');
      if (phoneNumber.startsWith('91')) {
        phoneNumber = phoneNumber;
      } else if (phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }

      const params = new URLSearchParams({
        userid: this.userId,
        password: this.password,
        send_to: phoneNumber,
        v: '1.1',
        format: 'json',
        msg_type: message.type || 'TEXT',
        method: 'SENDMESSAGE',
        msg: message.message
      });

      console.log('Sending Gupshup WhatsApp message to:', phoneNumber);
      console.log('Message content:', message.message);

      const response = await axios.get(`${this.baseUrl}?${params.toString()}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Gupshup response:', response.data);

      return {
        response: {
          status: response.data.response?.status || 'unknown',
          id: response.data.response?.id || '',
          phone: phoneNumber,
          details: response.data.response?.details || 'Message sent'
        }
      };

    } catch (error: any) {
      console.error('Gupshup WhatsApp error:', error.response?.data || error.message);
      throw new Error(`WhatsApp delivery failed: ${error.response?.data?.response?.details || error.message}`);
    }
  }

  async sendWelcomeMessage(name: string, phone: string, referralCode: string): Promise<void> {
    const message = `🎉 Welcome to Xtracover BBG, ${name}!

Your referral partner registration is successful!

📋 Your Referral Code: *${referralCode}*
💰 Commission: ₹25 per successful customer registration
🔗 Share your code with customers to earn commissions

Start sharing your referral code and begin earning today!

For support: 8860396039
Thanks & Regards,
Xtracover BBG Team`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendCustomerWelcome(name: string, phone: string, voucherCode: string): Promise<void> {
    const message = `🛡️ Welcome to Xtracover BBG, ${name}!

Your device registration is successful!

🎫 Your BBG Voucher: *${voucherCode}*
📱 Device Protection: Active
🔄 Claim Period: 6-60 months from purchase

Keep this voucher code safe for future claims!

For support: 8860396039
Thanks & Regards,
Xtracover BBG Team`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendClaimUpdate(name: string, phone: string, status: string, amount?: number): Promise<void> {
    let message = `📋 BBG Claim Update - ${name}

Status: *${status.toUpperCase()}*`;

    if (status === 'approved' && amount) {
      message += `\n💰 Claim Amount: ₹${amount}
📦 Pickup will be scheduled shortly`;
    } else if (status === 'rejected') {
      message += `\n❌ Unfortunately, your claim cannot be processed
📞 Contact support for details: 8860396039`;
    } else if (status === 'paid' && amount) {
      message += `\n✅ Payment of ₹${amount} has been processed
💳 Check your account for credit`;
    }

    message += `\n\nFor support: 8860396039
Thanks & Regards,
Xtracover BBG Team`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendPayoutUpdate(name: string, phone: string, amount: number, status: string): Promise<void> {
    let message = `💰 Payout Update - ${name}

Amount: ₹${amount}
Status: *${status.toUpperCase()}*`;

    if (status === 'paid') {
      message += `\n✅ Payment has been processed successfully
💳 Please check your registered bank account`;
    } else if (status === 'processing') {
      message += `\n⏳ Payment is being processed
💳 Expected in 2-3 business days`;
    } else if (status === 'failed') {
      message += `\n❌ Payment failed - please update bank details
📞 Contact support: 8860396039`;
    }

    message += `\n\nFor support: 8860396039
Thanks & Regards,
Xtracover BBG Team`;

    await this.sendMessage({
      to: phone,
      message: message,
      type: 'TEXT'
    });
  }

  async sendOTP(phone: string, otp: string): Promise<void> {
    const message = `🔐 Your Xtracover BBG verification code is: *${otp}*

This code is valid for 10 minutes. Do not share with anyone.

For support: 8860396039
Thanks & Regards,
Xtracover BBG Team`;

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