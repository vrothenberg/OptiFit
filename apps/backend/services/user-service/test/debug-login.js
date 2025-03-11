/**
 * Debug Login Script
 * 
 * This script helps debug login issues by testing the password validation directly.
 * 
 * Usage:
 * node debug-login.js <email> <password>
 */

const axios = require('axios');

async function debugLogin(email, password) {
  try {
    console.log(`Testing login for email: ${email}`);
    
    // First, try the debug endpoint
    console.log('\n1. Testing password validation directly:');
    const debugResponse = await axios.post('http://localhost:3000/auth/debug/check-password', {
      email,
      password
    });
    
    console.log('Debug endpoint response:', debugResponse.data);
    
    // Then try the actual login endpoint
    console.log('\n2. Testing full login flow:');
    try {
      const loginResponse = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      });
      
      console.log('Login successful!');
      console.log('Access token:', loginResponse.data.accessToken ? `${loginResponse.data.accessToken.substring(0, 20)}...` : 'None');
      console.log('Refresh token:', loginResponse.data.refreshToken ? `${loginResponse.data.refreshToken.substring(0, 20)}...` : 'None');
    } catch (loginError) {
      console.error('Login failed:', loginError.response?.status, loginError.response?.data);
    }
    
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node debug-login.js <email> <password>');
  process.exit(1);
}

debugLogin(email, password);
