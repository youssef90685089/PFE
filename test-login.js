#!/usr/bin/env node

/**
 * SIPMS API Login Test Script
 * Run: node test-login.js
 * 
 * This script tests the login endpoint and validates the response
 */

const http = require('http');

const API_URL = 'http://localhost:8080/api/auth/login';

const testAccounts = [
  { email: 'admin@sipms.com', password: 'Admin@123', role: 'ADMIN' },
  { email: 'manager@sipms.com', password: 'Admin@123', role: 'MANAGER' },
  { email: 'receptionist@sipms.com', password: 'Admin@123', role: 'RECEPTIONIST' },
  { email: 'test@candidate.com', password: 'Admin@123', role: 'CANDIDATE' }
];

async function testLogin(email, password, role) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            email,
            role,
            statusCode: res.statusCode,
            success: response.success,
            message: response.message,
            hasToken: !!response.data?.accessToken
          });
        } catch (e) {
          resolve({
            email,
            role,
            statusCode: res.statusCode,
            error: 'Failed to parse response: ' + e.message
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        email,
        role,
        error: 'Request failed: ' + e.message
      });
    });

    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          SIPMS Login API Test Suite                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`Testing endpoint: ${API_URL}\n`);
  console.log('Running tests...\n');

  let passCount = 0;
  let failCount = 0;

  for (const account of testAccounts) {
    const result = await testLogin(account.email, account.password, account.role);

    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const indicator = result.success ? '✓' : '✗';

    console.log(`${status} ${indicator} ${account.role.padEnd(15)} (${account.email})`);
    
    if (result.statusCode) {
      console.log(`      Status: ${result.statusCode}`);
    }
    if (result.message) {
      console.log(`      Message: ${result.message}`);
    }
    if (result.hasToken) {
      console.log(`      Token: Generated ✓`);
    }
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }

    console.log('');

    if (result.success) passCount++;
    else failCount++;
  }

  console.log('─'.repeat(62));
  console.log(`Results: ${passCount} passed, ${failCount} failed\n`);

  if (failCount === 0) {
    console.log('🎉 All tests passed! Login is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check:');
    console.log('   1. Is backend running on http://localhost:8080?');
    console.log('   2. Has database been reloaded with data.sql?');
    console.log('   3. Are password hashes correctly updated?\n');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

runTests();
