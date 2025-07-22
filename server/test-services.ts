// Separate testing endpoints for each communication service
import { kaleyraSMSService } from './kaleyra-service';
import { gupshupService } from './gupshup-service';
import type { Express } from 'express';
import nodemailer from 'nodemailer';

export function registerTestRoutes(app: Express) {
  
  // Test Kaleyra SMS Service
  app.post('/api/test-kaleyra-sms', async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      console.log('Testing Kaleyra SMS service with phone:', phone);
      console.log('Testing Kaleyra SMS service with message:', message);
      const result = await kaleyraSMSService.sendOTP(phone, '123456', message);
      
      res.json({
        success: result.success,
        service: 'Kaleyra SMS',
        messageId: result.messageId,
        error: result.error,
        phone: phone
      });
    } catch (error: any) {
      console.error('Kaleyra SMS test error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        service: 'Kaleyra SMS'
      });
    }
  });

  // Test Gupshup WhatsApp Service  
  app.post('/api/test-gupshup-whatsapp', async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      console.log('Testing Gupshup WhatsApp service...');
      const result = await gupshupService.sendMessage({
        to: phone,
        message: message,
        type: 'TEXT'
      });
      
      res.json({
        success: true,
        service: 'Gupshup WhatsApp',
        result: result,
        message: 'Gupshup WhatsApp test completed'
      });
    } catch (error: any) {
      console.error('Gupshup WhatsApp test error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        service: 'Gupshup WhatsApp'
      });
    }
  });

  // Test Email SMTP Service
  app.post('/api/test-email-smtp', async (req, res) => {
    try {
      const { email, subject, message } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
      }
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      console.log('Testing Email SMTP service...');
      
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        return res.json({
          success: false,
          service: 'Email SMTP',
          error: 'SMTP credentials not configured',
          configured: false
        });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Xtracover BBG Test" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject || 'Xtracover BBG - Email Test',
        html: `<h3>Email Service Test</h3><p>${message}</p><p>If you received this, SMTP is working correctly.</p>`,
        text: message
      };

      const result = await transporter.sendMail(mailOptions);
      
      res.json({
        success: true,
        service: 'Email SMTP',
        messageId: result.messageId,
        to: email,
        configured: true
      });
    } catch (error: any) {
      console.error('Email SMTP test error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        service: 'Email SMTP',
        configured: !!process.env.SMTP_USER
      });
    }
  });

  // Test all services together
  app.post('/api/test-all-communications', async (req, res) => {
    try {
      const { phone, email, message } = req.body;
      
      const results = {
        sms: null as any,
        whatsapp: null as any,
        email: null as any
      };

      // Test SMS (Kaleyra)
      if (phone) {
        try {
          const smsResult = await kaleyraSMSService.sendOTP(phone, '123456', message || 'Test SMS from Xtracover BBG system');
          results.sms = {
            success: smsResult.success,
            service: 'Kaleyra SMS',
            messageId: smsResult.messageId,
            error: smsResult.error
          };
        } catch (error: any) {
          results.sms = {
            success: false,
            service: 'Kaleyra SMS',
            error: error.message
          };
        }
      }

      // Test WhatsApp (Gupshup)
      if (phone) {
        try {
          const whatsappResult = await gupshupService.sendMessage({
            to: phone,
            message: message || 'Test WhatsApp message from Xtracover BBG system',
            type: 'TEXT'
          });
          results.whatsapp = {
            success: true,
            service: 'Gupshup WhatsApp',
            result: whatsappResult
          };
        } catch (error: any) {
          results.whatsapp = {
            success: false,
            service: 'Gupshup WhatsApp',
            error: error.message
          };
        }
      }

      // Test Email (SMTP)
      if (email) {
        try {
          if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port: parseInt(process.env.SMTP_PORT || '587'),
              secure: false,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              },
            });

            const emailResult = await transporter.sendMail({
              from: `"Xtracover BBG Test" <${process.env.SMTP_USER}>`,
              to: email,
              subject: 'Xtracover BBG - Communication Test',
              html: `<h3>All Communication Services Test</h3><p>${message || 'Test email from Xtracover BBG system'}</p>`,
              text: message || 'Test email from Xtracover BBG system'
            });

            results.email = {
              success: true,
              service: 'Email SMTP',
              messageId: emailResult.messageId
            };
          } else {
            results.email = {
              success: false,
              service: 'Email SMTP',
              error: 'SMTP not configured'
            };
          }
        } catch (error: any) {
          results.email = {
            success: false,
            service: 'Email SMTP',
            error: error.message
          };
        }
      }

      res.json({
        success: true,
        message: 'Communication services tested',
        results: results,
        tested_services: Object.keys(results).filter(key => results[key as keyof typeof results] !== null)
      });
    } catch (error: any) {
      console.error('All communications test error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}