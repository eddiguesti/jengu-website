// Test script to send the new email template
const https = require('https');

const testData = {
  date: "2025-11-28",
  time: "14:00",
  timezone: "Europe/London",
  name: "Edd",
  email: "edd.guest@gmail.com",
  company: "Test Company",
  phone: "+44123456789",
  contactMethod: "Zoom",
  extraInfo: "This is a test booking to preview the new email design"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 4321,
  path: '/api/book',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  rejectUnauthorized: false
};

// Use http instead of https for localhost
const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 4321,
  path: '/api/book',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      if (parsed.emailSent) {
        console.log('\n✅ Email sent successfully to edd.guest@gmail.com!');
      } else {
        console.log('\n❌ Email failed:', parsed.emailError);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();

console.log('Sending test booking request...');
