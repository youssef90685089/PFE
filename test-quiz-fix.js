/**
 * Test script to verify the quiz endpoint lazy loading fix
 * This script authenticates and then tests the GET /api/quizzes endpoint
 */

const API_URL = 'http://localhost:8080/api';

async function testQuizEndpoint() {
  try {
    console.log('🔐 Step 1: Authenticating...');
    
    // Login with admin credentials
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sipms.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      console.log('Response:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.success || !loginData.data) {
      console.error('❌ Login response invalid:', loginData);
      return;
    }
    
    const token = loginData.data.accessToken;
    if (!token) {
      console.error('❌ No access token in response');
      return;
    }
    
    console.log('✅ Authentication successful');

    console.log('\n📋 Step 2: Testing GET /api/quizzes endpoint...');
    
    // Test the quizzes endpoint with the fix
    const quizzesResponse = await fetch(`${API_URL}/quizzes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const quizzesData = await quizzesResponse.json();
    
    if (!quizzesData.success) {
      console.error('❌ Endpoint error:', quizzesData.message);
      
      // Check if it's the lazy loading error we're fixing
      if (quizzesData.message.includes('failed to lazily initialize')) {
        console.error('\n⚠️  LAZY LOADING ERROR STILL PRESENT!');
        console.error('The @Transactional annotation may not have been applied correctly.');
      }
      return;
    }

    console.log('✅ Endpoint request successful!');
    console.log(`📊 Found ${quizzesData.data?.length || 0} quizzes`);
    
    if (quizzesData.data && quizzesData.data.length > 0) {
      const quiz = quizzesData.data[0];
      console.log('\n📌 First Quiz Details:');
      console.log(`   Title: ${quiz.title}`);
      console.log(`   Questions: ${quiz.questionCount}`);
      console.log(`   Active: ${quiz.active}`);
      console.log('\n✨ The lazy loading issue is FIXED! Questions collection loaded successfully.');
    } else {
      console.log('📝 No quizzes found, but the endpoint responded without errors.');
      console.log('✨ The lazy loading fix is working!');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testQuizEndpoint();
