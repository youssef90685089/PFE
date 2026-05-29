#!/usr/bin/env node
/**
 * Direct Backend Login Test
 * Tests the login endpoint by making direct API calls to the backend
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:8080';
const TEST_USER = {
  email: 'admin@sipms.com',
  password: 'Admin@123',
};

async function testLogin() {
  console.log('\n🧪 Testing SIPMS Login Endpoint\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Credentials: ${TEST_USER.email} / ${TEST_USER.password}\n`);

  try {
    // Test 1: Check if backend is alive
    console.log('1️⃣  Checking if backend is alive...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/api/public/health`, { timeout: 5000 });
      console.log('✅ Backend is running\n');
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ Backend is NOT running on 8080');
        console.log('   Start it with: mvn spring-boot:run\n');
        return;
      }
    }

    // Test 2: Attempt login via /api/auth/login
    console.log('2️⃣  Testing /api/auth/login endpoint...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_USER, {
      timeout: 10000,
      validateStatus: () => true, // Accept all status codes
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
      },
    });

    console.log(`Status: ${loginResponse.status}`);
    console.log(`Response:`, JSON.stringify(loginResponse.data, null, 2));

    if (loginResponse.status === 200) {
      if (loginResponse.data.success) {
        console.log('\n✅ LOGIN SUCCESSFUL!\n');
        console.log('Token:', loginResponse.data.data.accessToken.substring(0, 50) + '...');
      } else {
        console.log('\n⚠️  Request succeeded but login failed');
        console.log('Message:', loginResponse.data.message);
      }
    } else if (loginResponse.status === 403) {
      console.log('\n❌ 403 Forbidden - Check:');
      console.log('   - Is the user active in the database?');
      console.log('   - Is the password hash correct?');
      console.log('   - Are there any interceptors blocking the request?');
    } else if (loginResponse.status === 401) {
      console.log('\n⚠️  401 Unauthorized - Invalid credentials or authentication issue');
    }

    // Test 3: Try /api/public/login (alternative endpoint)
    console.log('\n3️⃣  Testing /api/public/login endpoint (alternative)...');
    const publicLoginResponse = await axios.post(`${BACKEND_URL}/api/public/login`, TEST_USER, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
      },
    });

    console.log(`Status: ${publicLoginResponse.status}`);
    if (publicLoginResponse.status === 200 && publicLoginResponse.data.success) {
      console.log('✅ /api/public/login also works!\n');
    }

    // Test 4: Check CORS headers
    console.log('4️⃣  Checking CORS headers...');
    const corsResponse = await axios.options(`${BACKEND_URL}/api/auth/login`, {
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:5173',
      },
      validateStatus: () => true,
    });

    console.log(`CORS Preflight Status: ${corsResponse.status}`);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers'],
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }

  console.log('\n💡 Troubleshooting Tips:');
  console.log('   - If getting 403: Check database for active admin user');
  console.log('   - If getting CORS error: Verify backend CORS config');
  console.log('   - If backend unreachable: Start backend with "mvn spring-boot:run"');
  console.log('   - Try accessing frontend from http://localhost:5173 (with proxy)\n');
}

testLogin();
