# PayU Payment Gateway Integration

## Overview
The BBG application uses PayU as the primary and only payment gateway:
- **PayU**: Non-seamless payment with multiple payment options
- **Stripe**: Removed from the application

## PayU Features
- **Payment Methods**: Credit Cards, Debit Cards, Net Banking, UPI, Digital Wallets
- **Security**: SHA512 hash verification for all transactions
- **Environment Support**: Test and Production configurations
- **Redirect Flow**: Customers are redirected to PayU for payment, then back to success/failure pages

## Configuration

### Environment Variables
```env
# PayU Configuration
PAYU_MERCHANT_KEY=your_merchant_key
PAYU_SALT=your_salt_key
PAYU_BASE_URL=https://test.payu.in  # For testing
# PAYU_BASE_URL=https://secure.payu.in  # For production
```

### Current Configuration
The system uses environment variables for PayU credentials:
- Merchant Key: From `PAYU_MERCHANT_KEY` environment variable
- Salt: From `PAYU_SALT` environment variable  
- Base URL: `https://test.payu.in` (hardcoded for test environment)

**For Production**: Change the baseUrl in `server/routes.ts` to `https://secure.payu.in`

## Payment Flow

### 1. Customer Registration
1. Customer fills registration form and selects PayU payment option
2. Frontend calls `/api/create-payu-payment` with customer data and device type
3. Server generates unique transaction ID and payment parameters
4. Server calculates secure hash using PayU algorithm
5. Customer is redirected to PayU payment gateway

### 2. PayU Processing
1. Customer completes payment on PayU's secure platform
2. PayU redirects to success/failure URLs with payment response
3. Server verifies hash signature for security
4. On success: Customer registration is completed with voucher code
5. On failure: Customer is redirected back to registration with error

### 3. Success Handling
- Customer data is saved to SQL Server database
- BBG voucher code is generated
- Customer is redirected to thank-you page with voucher details
- Payment method is tracked for customer support

## API Endpoints

### Create PayU Payment
```
POST /api/create-payu-payment
Content-Type: application/json

{
  "deviceType": "mobile|laptop",
  "customerData": {
    "name": "Customer Name",
    "contact": "9876543210",
    "email": "customer@example.com",
    "pincode": "110001",
    "sellerCode": "OPTIONAL_SELLER_CODE"
  }
}
```

**Response:**
```json
{
  "payuParams": {
    "key": "merchant_key",
    "txnid": "unique_transaction_id",
    "amount": "99",
    "productinfo": "BBG for mobile",
    "firstname": "Customer Name",
    "email": "customer@example.com",
    "phone": "9876543210",
    "surl": "success_url",
    "furl": "failure_url",
    "hash": "calculated_hash"
  },
  "payuUrl": "https://test.payu.in/_payment",
  "txnid": "unique_transaction_id"
}
```

### Success Handler
```
POST /api/payu/success
```
Handles successful payment responses from PayU, verifies hash, and completes customer registration.

### Failure Handler
```
POST /api/payu/failure
```
Handles failed payment responses and redirects customer back to registration form.

## Security Features

### Hash Verification
- All PayU requests include SHA512 hash verification
- Hash algorithm: `key|txnid|amount|productinfo|firstname|email|||||||||||salt`
- Response verification prevents payment tampering

### Data Protection
- Customer data encrypted in UDF fields
- Sensitive information not exposed in payment URLs
- Secure redirect URLs with HTTPS support

## Testing

### Test Payment Flow
1. Use test credentials in environment variables
2. Complete customer registration form
3. Select PayU payment option
4. Use PayU test cards for payment simulation
5. Verify success/failure redirects work correctly

### Test Cards (PayU Test Environment)
- **Success**: 5123456789012346 (Mastercard)
- **Failure**: 4000000000000002 (Visa)
- CVV: Any 3 digits
- Expiry: Any future date

## Production Deployment

### PayU Account Setup
1. Register merchant account with PayU
2. Obtain production merchant key and salt
3. Configure webhook URLs for production domain
4. Update environment variables:
   ```env
   PAYU_BASE_URL=https://secure.payu.in
   PAYU_MERCHANT_KEY=prod_merchant_key
   PAYU_SALT=prod_salt
   ```

### Domain Configuration
- Update success/failure URLs to production domain
- Ensure HTTPS is enabled for all payment flows
- Configure proper SSL certificates

## Troubleshooting

### Common Issues
1. **Hash Mismatch**: Verify merchant key and salt are correct
2. **Payment Failure**: Check PayU test environment and test cards
3. **Redirect Issues**: Ensure success/failure URLs are accessible
4. **Missing Data**: Verify all required fields are being sent to PayU

### Error Handling
- Payment failures redirect to registration form with error message
- Hash verification failures return 400 status with error details
- Missing configuration falls back to demo mode

## Monitoring
- All PayU transactions are logged with transaction IDs
- Payment status tracked in customer registration records
- Success/failure metrics available in server logs