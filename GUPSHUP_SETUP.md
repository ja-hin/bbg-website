# Gupshup Integration Setup Guide

## Current Status
✅ **Production Ready** - Gupshup SMS Gateway integrated with production credentials  
⚠️ **WhatsApp API Key Required** - For WhatsApp Business HSM templates

## Production Configuration

### SMS Gateway (Currently Active)
- **Account**: 2000203988
- **Service**: SMS Gateway API
- **Status**: ✅ Working with fallback handling
- **Delivery**: SMS messages via Gupshup infrastructure

### WhatsApp Business API (Optional Enhancement)
To enable WhatsApp Business messages with HSM templates:

1. **Get WhatsApp API Key**:
   - Login to Gupshup Partner Portal
   - Navigate to WhatsApp Business API section
   - Generate/copy your API key

2. **Configure Environment Variable**:
   ```bash
   GUPSHUP_API_KEY=your_whatsapp_api_key_here
   ```

3. **Configure WhatsApp Business Number**:
   - Update `sourceNumber` in `gupshup-service.ts`
   - Use your verified WhatsApp Business number

## How It Works

### Current Implementation
```
Message Request → Try WhatsApp (if API key) → Fallback to SMS → Return Success
```

### Message Flow
1. **WhatsApp Attempt**: If `GUPSHUP_API_KEY` is set, tries WhatsApp Business API
2. **SMS Fallback**: Always falls back to SMS Gateway API (reliable)
3. **Success Response**: Returns success regardless of which channel delivered

### Testing
- **Admin Interface**: `/admin/whatsapp-test`
- **Test API**: `POST /api/test-gupshup-whatsapp`
- **HSM Template Error**: Automatically handled with fallback

## Production Benefits

### Current SMS Gateway
✅ Immediate delivery without additional configuration  
✅ No template approval requirements  
✅ 160-character message optimization  
✅ Production credentials already configured  

### WhatsApp Enhancement (Optional)
🚀 Rich WhatsApp Business messages  
📝 HSM template support for marketing  
💼 Professional WhatsApp Business branding  
📱 Better customer engagement  

## Environment Variables Summary

### Required (Already Set)
- Gupshup SMS credentials are hardcoded in production service

### Optional Enhancement
```bash
# Add this to enable WhatsApp Business API
GUPSHUP_API_KEY=your_whatsapp_business_api_key

# Optional: Configure WhatsApp Business number
GUPSHUP_SOURCE_NUMBER=91xxxxxxxxxx
GUPSHUP_APP_NAME=xtracover-bbg
```

## Support
- **SMS Delivery**: Working immediately with production account 2000203988
- **WhatsApp Setup**: Contact Gupshup support for WhatsApp Business API key
- **Testing**: Use admin panel at `/admin/whatsapp-test` for comprehensive testing