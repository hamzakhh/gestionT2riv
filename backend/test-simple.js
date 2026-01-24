import fetch from 'node-fetch';

async function testSimple() {
  console.log('🧪 Testing simple connection...');
  
  try {
    const response = await fetch('https://gestiont2riv.onrender.com/health');
    console.log('📊 Status:', response.status);
    console.log('📊 Status text:', response.statusText);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📊 Raw response:', text);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testSimple();
