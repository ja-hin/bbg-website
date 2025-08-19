import { KaleyraSMSService } from './kaleyra-service';
import { GupshupService } from './gupshup-service';

// Configuration state
let isInitialized = false;
let kaleyraSMSService: KaleyraSMSService | null = null;
let gupshupService: GupshupService | null = null;
let payuConfig: any = null;

// Initialize all environment-dependent services
export async function initializeServices(): Promise<void> {
  if (isInitialized) {
    return;
  }

  console.log('🔧 Initializing services with environment variables...');

  // Initialize Kaleyra SMS Service
  const kalestraApiKey = process.env.KALEYRA_API_KEY;
  if (kalestraApiKey) {
    kaleyraSMSService = new KaleyraSMSService({
      apiKey: kalestraApiKey,
      senderId: process.env.KALEYRA_SENDER_ID || 'XTCOVR'
    });
    console.log('✅ Kaleyra SMS service initialized');
  } else {
    console.warn('⚠️  Kaleyra SMS service not configured - missing KALEYRA_API_KEY');
  }

  // Initialize Gupshup Service
  const gupshupApiKey = process.env.GUPSHUP_API_KEY;
  const gupshupAppId = process.env.GUPSHUP_APP_ID;
  if (gupshupApiKey && gupshupAppId) {
    gupshupService = new GupshupService({
      apiKey: gupshupApiKey,
      appId: gupshupAppId,
      appName: process.env.GUPSHUP_APP_NAME || 'XtraCover'
    });
    console.log('✅ Gupshup WhatsApp service initialized');
  } else {
    console.warn('⚠️  Gupshup WhatsApp service not configured - missing API credentials');
  }

  // Initialize PayU Configuration
  payuConfig = {
    merchantId: process.env.PAYU_MERCHANT_ID,
    merchantKey: process.env.PAYU_MERCHANT_KEY,
    salt: process.env.PAYU_SALT,
    clientId: process.env.PAYU_CLIENT_ID,
    clientSecret: process.env.PAYU_CLIENT_SECRET,
    baseUrl: process.env.PAYU_BASE_URL || "https://test.payu.in"
  };

  // Validate PayU configuration
  const requiredPayUSecrets = ['merchantId', 'merchantKey', 'salt', 'clientId', 'clientSecret'];
  const missingSecrets = requiredPayUSecrets.filter(key => !payuConfig[key]);
  
  if (missingSecrets.length > 0) {
    console.error('⚠️  Missing PayU secrets:', missingSecrets);
    console.error('PayU payment gateway will not work without all required secrets');
  } else {
    console.log('✅ PayU configuration loaded successfully');
  }

  console.log('PayU Config Status:', {
    merchantId: payuConfig.merchantId ? 'loaded' : 'missing',
    merchantKey: payuConfig.merchantKey ? 'loaded' : 'missing',
    salt: payuConfig.salt ? 'loaded' : 'missing',
    clientId: payuConfig.clientId ? 'loaded' : 'missing',
    clientSecret: payuConfig.clientSecret ? 'loaded' : 'missing',
    baseUrl: payuConfig.baseUrl
  });

  isInitialized = true;
  console.log('✅ All services initialized successfully');
}

// Service getters that ensure initialization
export function getKaleyraSMSService(): KaleyraSMSService {
  if (!isInitialized) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  
  if (!kaleyraSMSService) {
    throw new Error('Kaleyra SMS service not configured. Please add KALEYRA_API_KEY to environment variables.');
  }
  
  return kaleyraSMSService;
}

export function getGupshupService(): GupshupService {
  if (!isInitialized) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  
  if (!gupshupService) {
    throw new Error('Gupshup service not configured. Please add GUPSHUP_API_KEY and GUPSHUP_APP_ID to environment variables.');
  }
  
  return gupshupService;
}

export function getPayUConfig(): any {
  if (!isInitialized) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  
  const requiredSecrets = ['merchantId', 'merchantKey', 'salt', 'clientId', 'clientSecret'];
  const missingSecrets = requiredSecrets.filter(key => !payuConfig[key]);
  
  if (missingSecrets.length > 0) {
    throw new Error(`PayU not configured. Missing secrets: ${missingSecrets.join(', ')}`);
  }
  
  return payuConfig;
}

// Safe getters that return null if not configured
export function getSafeKaleyraSMSService(): KaleyraSMSService | null {
  if (!isInitialized) {
    return null;
  }
  return kaleyraSMSService;
}

export function getSafeGupshupService(): GupshupService | null {
  if (!isInitialized) {
    return null;
  }
  return gupshupService;
}

export function getSafePayUConfig(): any | null {
  if (!isInitialized) {
    return null;
  }
  
  const requiredSecrets = ['merchantId', 'merchantKey', 'salt', 'clientId', 'clientSecret'];
  const missingSecrets = requiredSecrets.filter(key => !payuConfig[key]);
  
  if (missingSecrets.length > 0) {
    return null;
  }
  
  return payuConfig;
}