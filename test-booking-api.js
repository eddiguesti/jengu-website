// Test script to verify the booking API endpoint
// Run with: node test-booking-api.js

const testPayload = {
  date: "2025-11-25",
  time: "14:00",
  timezone: "UTC",
  name: "Edd Guest",
  email: "edd.guest@gmail.com",
  company: "Test Company",
  phone: "+1234567890",
  contactMethod: "Microsoft Teams",
  extraInfo: "This is a test booking to verify email delivery"
};

console.log('Testing booking API endpoint...');
console.log('Payload:', JSON.stringify(testPayload, null, 2));

fetch('http://localhost:4324/api/book', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
  .then(async (response) => {
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\nResponse body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: Calendar event created!');
      console.log('Event ID:', data.eventId);
    } else {
      console.log('\n❌ ERROR: Failed to create calendar event');
      console.log('Error details:', data.error || data);
    }
  })
  .catch((error) => {
    console.error('\n❌ FETCH ERROR:', error.message);
    console.error('Stack:', error.stack);
  });
