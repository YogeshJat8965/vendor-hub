const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function testData() {
  try {
    console.log('Testing APIs and populating Atlas DB...');
    
    // 1. Vendor Signup
    const vendorEmail = `vendor_${Date.now()}@test.com`;
    console.log(`Signing up vendor: ${vendorEmail}`);
    const vendorSignup = await axios.post(`${API_URL}/auth/vendor/signup`, {
      name: 'Atlas Test Vendor',
      email: vendorEmail,
      password: 'password123',
      businessName: 'Atlas Design Studio',
      storeName: `Atlas Design ${Date.now()}`,
      vendorType: 'Interior Designer',
      categoryId: 'interior-design',
      phone: '1234567890',
      address: '123 Atlas Street'
    });
    const vendorToken = vendorSignup.data.token;
    console.log('Vendor signed up. Token received.');
    
    // 2. Create Catalogue
    console.log('Creating catalogue...');
    const createCat = await axios.post(`${API_URL}/vendor/catalogues?email=${vendorEmail}`, {
      name: 'Modern Kitchens',
      description: 'Test catalogue for modern kitchens',
      category: 'Kitchen'
    }, {
      headers: { Authorization: `Bearer ${vendorToken}` }
    });
    const catalogueId = createCat.data.id;
    console.log('Catalogue created:', catalogueId);
    
    // 3. Customer Signup
    const customerEmail = `customer_${Date.now()}@test.com`;
    console.log(`Signing up customer: ${customerEmail}`);
    const customerSignup = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Atlas Test Customer',
      email: customerEmail,
      password: 'password123',
      phone: '0987654321'
    });
    const customerToken = customerSignup.data.token;
    console.log('Customer signed up. Token received.');
    
    // 4. Send Message (Create Conversation)
    console.log('Sending message to create conversation...');
    const msgRes = await axios.post(`${API_URL}/conversations/init`, {
      customerId: customerEmail,
      vendorId: vendorEmail,
      quoteRequestId: 'test-quote-id'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('Conversation created:', msgRes.data);
    
    console.log('\n✅ All tests passed! Data should now be visible in MongoDB Atlas.');
    
  } catch (error) {
    console.error('❌ Error during testing:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testData();
