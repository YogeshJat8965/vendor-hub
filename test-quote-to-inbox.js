const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function testQuoteToInbox() {
  try {
    console.log('Testing Quote to Inbox Flow...');
    
    // 1. Vendor Signup
    const vendorEmail = `vendor_quote_${Date.now()}@test.com`;
    console.log(`Signing up vendor: ${vendorEmail}`);
    const vendorSignup = await axios.post(`${API_URL}/auth/vendor/signup`, {
      name: 'Quote Test Vendor',
      email: vendorEmail,
      password: 'password123',
      businessName: 'Quote Design Studio',
      storeName: `Quote Design ${Date.now()}`,
      vendorType: 'Interior Designer',
      categoryId: 'interior-design',
      phone: '1234567890',
      address: '123 Quote Street'
    });
    const vendorToken = vendorSignup.data.token;
    
    // Vendor fetches their own details to get the slug
    const vendorProfileRes = await axios.get(`${API_URL}/vendor/profile?email=${vendorEmail}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const vendorSlug = vendorProfileRes.data.slug;
    console.log('Vendor signed up. Slug:', vendorSlug);
    
    // 2. Customer Signup
    const customerEmail = `customer_quote_${Date.now()}@test.com`;
    console.log(`Signing up customer: ${customerEmail}`);
    const customerSignup = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Quote Test Customer',
      email: customerEmail,
      password: 'password123',
      phone: '0987654321'
    });
    const customerToken = customerSignup.data.token;
    console.log('Customer signed up.');
    
    // 3. Customer Requests Quote
    console.log('Requesting quote...');
    const quoteReq = await axios.post(`${API_URL}/quotes/request`, {
      vendorSlug: vendorSlug,
      customerName: 'Quote Test Customer',
      customerEmail: customerEmail,
      customerMobile: '0987654321',
      serviceRequested: 'Kitchen Renovation',
      projectDescription: 'Need a modern kitchen.\nLocation: NY\nTimeline: 1 month',
      budget: 1500,
      status: 'NEW'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('Quote requested successfully. ID:', quoteReq.data.quote.id);
    
    // 4. Check Customer Inbox
    console.log('Fetching customer conversations...');
    const customerInbox = await axios.get(`${API_URL}/conversations/customer/${customerEmail}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    
    if (customerInbox.data.length > 0) {
      console.log('✅ Success: Found conversation in customer inbox!');
      console.log('Customer Inbox Last Message:', customerInbox.data[0].lastMessage);
    } else {
      console.error('❌ Failed: No conversation found in customer inbox.');
      process.exit(1);
    }
    
    // 5. Check Vendor Inbox
    console.log('Fetching vendor conversations...');
    const vendorInbox = await axios.get(`${API_URL}/conversations/vendor/${vendorEmail}`, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    
    if (vendorInbox.data.length > 0) {
      console.log('✅ Success: Found conversation in vendor inbox!');
      console.log('Vendor Inbox Last Message:', vendorInbox.data[0].lastMessage);
    } else {
      console.error('❌ Failed: No conversation found in vendor inbox.');
      process.exit(1);
    }
    
    console.log('\n🎉 Quote to Inbox flow works perfectly!');
    
  } catch (error) {
    console.error('❌ Error during testing:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testQuoteToInbox();
