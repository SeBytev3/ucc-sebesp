import crypto from 'crypto';

const API_URL = 'http://localhost:4000/api';
const UNIQUE_ID = crypto.randomUUID().substring(0, 8);

async function run() {
  console.log(`🚀 Starting edge case tests (Run ID: ${UNIQUE_ID})...`);

  const customerData = {
    email: `customer_${UNIQUE_ID}@test.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'CUSTOMER'
  };

  const providerData = {
    email: `provider_${UNIQUE_ID}@test.com`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'Provider',
    role: 'PROVIDER'
  };

  const adminLogin = {
    email: 'admin@marketplace.com',
    password: 'Admin123!'
  };

  // Helper to extract cookie
  const getCookie = (res: Response) => {
    const cookies = res.headers.get('set-cookie');
    if (!cookies) return '';
    return cookies.split(';')[0];
  };

  try {
    // 1. Admin Login
    console.log('🔑 Logging in as admin...');
    const adminRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminLogin)
    });
    if (!adminRes.ok) throw new Error('Admin login failed: ' + await adminRes.text());
    const adminCookie = getCookie(adminRes);

    // 2. Register Customer
    console.log('👤 Registering customer...');
    const custRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    const custCookie = getCookie(custRes);

    // 3. Register Provider User
    console.log('👷 Registering provider...');
    const provRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providerData)
    });
    const provCookie = getCookie(provRes);

    // 4. Get categories
    const catRes = await fetch(`${API_URL}/categories`);
    const { categories } = await catRes.json();
    const categoryId = categories[0].id;

    // 5. Create provider profile
    console.log('📝 Creating provider profile...');
    const profileRes = await fetch(`${API_URL}/providers/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': provCookie 
      },
      body: JSON.stringify({
        serviceCategoryId: categoryId,
        bio: 'Great test provider',
        locationCity: 'TestCity'
      })
    });
    const profileData = await profileRes.json();
    const profileId = profileData.profile.id;

    // 6. Admin approves provider
    console.log('✅ Admin approving provider...');
    await fetch(`${API_URL}/admin/providers/${profileId}/approve`, {
      method: 'PATCH',
      headers: { 'Cookie': adminCookie }
    });

    // 7. Admin deactivates provider
    console.log('🛑 Admin deactivating provider (Edge Case setup)...');
    await fetch(`${API_URL}/admin/providers/${profileId}/deactivate`, {
      method: 'PATCH',
      headers: { 'Cookie': adminCookie }
    });

    // EDGE CASE 1: Deactivated provider receives request
    console.log('🧪 Edge Case 1: Customer sends request to deactivated provider...');
    const requestFailRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': custCookie 
      },
      body: JSON.stringify({
        providerId: profileId,
        categoryId: categoryId,
        description: 'I need help!'
      })
    });
    const failData = await requestFailRes.json();
    if (requestFailRes.status === 400 && failData.error.includes('Cannot send requests')) {
      console.log('  🟢 Passed: Request correctly blocked.');
    } else {
      console.error('  🔴 Failed:', failData);
    }

    // 8. Admin re-approves provider
    console.log('✅ Admin re-approving provider for next tests...');
    await fetch(`${API_URL}/admin/providers/${profileId}/approve`, {
      method: 'PATCH',
      headers: { 'Cookie': adminCookie }
    });

    // 9. Customer creates request successfully
    console.log('✉️ Customer creating request...');
    const reqRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': custCookie 
      },
      body: JSON.stringify({
        providerId: profileId,
        categoryId: categoryId,
        description: 'I need help!'
      })
    });
    const reqData = await reqRes.json();
    const requestId = reqData.request.id;

    // 10. Provider accepts
    console.log('🤝 Provider accepting request...');
    await fetch(`${API_URL}/requests/${requestId}/respond`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': provCookie 
      },
      body: JSON.stringify({ action: 'accept' })
    });

    // 11. Provider completes
    console.log('🏁 Provider completing request...');
    await fetch(`${API_URL}/requests/${requestId}/complete`, {
      method: 'PATCH',
      headers: { 'Cookie': provCookie }
    });

    // 12. Customer leaves a review
    console.log('⭐ Customer submitting first review...');
    const reviewRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': custCookie 
      },
      body: JSON.stringify({
        requestId: requestId,
        rating: 5,
        comment: 'Great job!'
      })
    });
    if (!reviewRes.ok) throw new Error('First review failed');

    // EDGE CASE 2: Duplicate review submission
    console.log('🧪 Edge Case 2: Customer submits duplicate review...');
    const duplicateRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': custCookie 
      },
      body: JSON.stringify({
        requestId: requestId,
        rating: 1,
        comment: 'Trying to review again'
      })
    });
    const duplicateData = await duplicateRes.json();
    if (duplicateRes.status === 400 && duplicateData.error.includes('Review already exists')) {
      console.log('  🟢 Passed: Duplicate review blocked.');
    } else {
      console.error('  🔴 Failed:', duplicateData);
    }

    // EDGE CASE 3: Oversized file upload
    console.log('🧪 Edge Case 3: Provider uploads oversized file...');
    // Create a 6MB dummy buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'a');
    const formData = new FormData();
    formData.append('image', new Blob([largeBuffer]), 'large.jpg');

    const uploadRes = await fetch(`${API_URL}/providers/${profileId}/portfolio`, {
      method: 'POST',
      headers: { 'Cookie': provCookie },
      body: formData
    });
    const uploadData = await uploadRes.json();
    
    // Express Multer usually throws a generic error format when limits are hit
    if (uploadRes.status === 400 || uploadRes.status === 500) {
      console.log('  🟢 Passed: Oversized upload blocked.', uploadData);
    } else {
      console.error('  🔴 Failed (Allowed unexpectedly?):', uploadRes.status, uploadData);
    }

    console.log('🎉 All edge case manual tests completed!');

  } catch (error) {
    console.error('💥 Fatal error in manual tests:', error);
  }
}

run();
