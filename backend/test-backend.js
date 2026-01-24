#!/usr/bin/env node

import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'https://gestiont2riv.onrender.com';

async function testBackend() {
  console.log('🧪 Testing backend at:', BACKEND_URL);
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing /health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health response:', healthData);
    
    // Test 2: API info
    console.log('\n2️⃣ Testing /api endpoint...');
    const apiResponse = await fetch(`${BACKEND_URL}/api`);
    const apiData = await apiResponse.json();
    console.log('✅ API info response:', apiData);
    
    // Test 3: Auth test endpoint
    console.log('\n3️⃣ Testing /api/auth/test endpoint...');
    const authTestResponse = await fetch(`${BACKEND_URL}/api/auth/test`);
    const authTestData = await authTestResponse.json();
    console.log('✅ Auth test response:', authTestData);
    
    // Test 4: Test login POST
    console.log('\n4️⃣ Testing /api/auth/test-login endpoint...');
    const testLoginResponse = await fetch(`${BACKEND_URL}/api/auth/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    const testLoginData = await testLoginResponse.json();
    console.log('✅ Test login response:', testLoginData);
    
    // Test 5: Real login attempt
    console.log('\n5️⃣ Testing real /api/auth/login endpoint...');
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@creative.dz',
        password: 'admin123'
      })
    });
    
    console.log('📊 Login response status:', loginResponse.status);
    console.log('📊 Login response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginData = await loginResponse.text();
    console.log('📊 Login response raw:', loginData);
    
    try {
      const loginJson = JSON.parse(loginData);
      console.log('✅ Login response JSON:', loginJson);
    } catch (e) {
      console.log('❌ Login response is not valid JSON:', e.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testBackend();
