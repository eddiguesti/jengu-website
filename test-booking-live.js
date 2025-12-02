// Test the live booking API endpoint
const testBooking = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const payload = {
    date: dateStr,
    time: "14:00",
    timezone: "Europe/London",
    name: "Test User",
    email: "test@example.com",
    company: "Test Company",
    phone: "+44 1234 567890",
    contactMethod: "Microsoft Teams",
    extraInfo: "This is a test booking from automated test"
  };

  console.log('Testing booking API with payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\nSending request to http://localhost:4321/api/book...\n');

  try {
    const response = await fetch('http://localhost:4321/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('\nResponse body:');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log('\n✅ SUCCESS! Booking created with event ID:', data.eventId);
      console.log('Check your Outlook calendar for the event.');
    } else {
      console.log('\n❌ FAILED! Error:', data.error);
      if (data.details) {
        console.log('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('\n❌ FAILED! Network or parsing error:');
    console.error(error);
  }
};

testBooking();
