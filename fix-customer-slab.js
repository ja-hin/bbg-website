import { SqlServerStorage } from './server/sql-storage.js';
import './server/db.js';

async function fixCustomerSlab() {
  const storage = new SqlServerStorage();
  
  try {
    console.log('Checking customer with voucher BBGTOZ73M48Q2...');
    
    // Get the customer
    const customer = await storage.getCustomerByVoucherCode('BBGTOZ73M48Q2');
    if (!customer) {
      console.log('Customer not found');
      return;
    }
    
    console.log('Customer details:', {
      name: customer.name,
      deviceType: customer.deviceType,
      brand: customer.brand,
      dateOfPurchase: customer.dateOfPurchase,
      claimValueSlabId: customer.claimValueSlabId
    });
    
    // Check what slab ID 60 actually is
    if (customer.claimValueSlabId) {
      const currentSlab = await storage.getClaimValueSlabById(customer.claimValueSlabId);
      console.log('Current assigned slab:', currentSlab);
    }
    
    // Find correct slab for Apple mobile device
    const purchaseDate = new Date(customer.dateOfPurchase);
    const currentDate = new Date();
    let monthsDiff = (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12;
    monthsDiff += currentDate.getMonth() - purchaseDate.getMonth();
    if (currentDate.getDate() < purchaseDate.getDate()) {
      monthsDiff--;
    }
    
    console.log('Device age:', monthsDiff, 'months');
    
    // Get all active slabs to find the correct one
    const allSlabs = await storage.getActiveClaimValueSlabs();
    
    // Find correct Apple mobile slab
    const correctSlab = allSlabs.find(slab => 
      slab.deviceType === 'mobile' &&
      slab.brand === 'Apple' &&
      monthsDiff >= slab.minMonths && 
      monthsDiff <= slab.maxMonths
    );
    
    console.log('Correct slab should be:', correctSlab);
    
    if (correctSlab && correctSlab.id !== customer.claimValueSlabId) {
      console.log('FIXING: Need to update customer slab from', customer.claimValueSlabId, 'to', correctSlab.id);
      
      // Update the customer record (you'll need to add this method to storage)
      // For now, we'll log what needs to be fixed
      console.log('SQL to fix:', `
        UPDATE customers 
        SET 
          claim_value_slab_id = ${correctSlab.id},
          registration_slab_percentage = ${correctSlab.percentage},
          registration_slab_range = '${correctSlab.minMonths}-${correctSlab.maxMonths} months'
        WHERE voucher_code = 'BBGTOZ73M48Q2'
      `);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCustomerSlab();