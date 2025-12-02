// Test script to verify live booking API is working
const https = require('https');

const testData = {
  name: "Test Booking",
  email: "test@example.com",
  company: "Test Company",
  preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  preferredTime: "10:00",
  timezone: "America/New_York",
  message: "Test booking from API verification"
};

const data = JSON.stringify(testData);

const options = {
  hostname: 'jengu.ai',
  port: 443,
  path: '/api/book',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing live booking API at https://jengu.ai/api/book...\n');
console.log('Request data:', testData, '\n');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Response Headers:', res.headers, '\n');

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', responseData);

    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Booking API is working correctly.');
    } else if (res.statusCode === 503) {
      console.log('\n❌ ERROR: Still getting 503 - Environment variables may not be configured correctly.');
    } else {
      console.log(`\n⚠️ UNEXPECTED: Got status code ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(data);
req.end();
