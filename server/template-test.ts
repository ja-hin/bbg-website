import { communicationService } from './communication-service';

export async function testAllTemplates(testContact: {
  name: string;
  email: string;
  phone: string;
}) {
  console.log(`\n🧪 Starting comprehensive template testing for ${testContact.name}`);
  console.log(`📧 Email: ${testContact.email}`);
  console.log(`📱 WhatsApp/SMS: ${testContact.phone}\n`);

  const results = {
    customerRegistration: null as any,
    referralPartnerWelcome: null as any,
    claimStatusUpdate: null as any,
    payoutNotification: null as any
  };

  try {
    // Test 1: Customer Registration Confirmation
    console.log('🔄 Testing Customer Registration Templates...');
    results.customerRegistration = await communicationService.sendRegistrationConfirmation({
      name: testContact.name,
      email: testContact.email,
      contact: testContact.phone,
      voucherCode: 'BBG123TEST',
      deviceType: 'mobile',
      brand: 'Samsung',
      modelName: 'Galaxy S21'
    });
    console.log('✅ Customer registration templates tested');

    // Test 2: Referral Partner Welcome
    console.log('🔄 Testing Referral Partner Welcome Templates...');
    results.referralPartnerWelcome = await communicationService.sendReferralPartnerWelcome({
      name: testContact.name,
      email: testContact.email,
      contact: testContact.phone,
      sellerCode: 'REF123TEST',
      businessName: 'Test Electronics Store'
    });
    console.log('✅ Referral partner welcome templates tested');

    // Test 3: Claim Status Update (Approved)
    console.log('🔄 Testing Claim Status Update Templates...');
    results.claimStatusUpdate = await communicationService.sendClaimStatusUpdate({
      name: testContact.name,
      email: testContact.email,
      contact: testContact.phone,
      voucherCode: 'BBG123TEST',
      claimAmount: 18500,
      status: 'approved'
    });
    console.log('✅ Claim status update templates tested');

    // Test 4: Payout Notification (Paid)
    console.log('🔄 Testing Payout Notification Templates...');
    results.payoutNotification = await communicationService.sendPayoutNotification({
      name: testContact.name,
      email: testContact.email,
      contact: testContact.phone,
      amount: 625,
      status: 'paid',
      paymentReference: 'TXN789TEST'
    });
    console.log('✅ Payout notification templates tested');

    console.log('\n🎉 All template tests completed successfully!');
    
    // Summarize results
    console.log('\n📊 Test Results Summary:');
    Object.entries(results).forEach(([key, result]) => {
      console.log(`\n${key.replace(/([A-Z])/g, ' $1').toUpperCase()}:`);
      if (result) {
        console.log(`  📧 Email: ${result.email ? 'Sent' : 'Failed'}`);
        console.log(`  📱 SMS: ${result.sms ? 'Sent' : 'Failed'}`);
        console.log(`  💬 WhatsApp: ${result.whatsapp ? 'Sent' : 'Failed'}`);
      }
    });

    return {
      success: true,
      message: 'All templates tested successfully',
      results
    };

  } catch (error: any) {
    console.error('❌ Template testing failed:', error);
    return {
      success: false,
      message: 'Template testing failed',
      error: error.message,
      results
    };
  }
}