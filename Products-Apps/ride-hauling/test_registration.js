const fetch = require('node-fetch');

async function testRegistration() {
  console.log('Testing registration flow...');
  
  const testEmail = `testuser${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    userType: 'user'
  };

  try {
    console.log(`Registering user: ${testEmail}`);
    
    const response = await fetch('http://localhost:12000/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 201 || response.status === 200) {
      console.log('✓ Registration successful!');
      console.log('Check auth service logs for email sending...');
    } else {
      console.log('✗ Registration failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Also test with the provided emails
async function testWithRealEmails() {
  const emails = [
    'juwavictor@gmail.com',
    'jeremyvictor788@gmail.com', 
    'lizyqueen2@gmail.com'
  ];

  console.log('\nTesting with real emails (will fail if already registered):');
  
  for (const email of emails) {
    const testData = {
      email: email,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      userType: 'user'
    };

    try {
      console.log(`\nTrying email: ${email}`);
      
      const response = await fetch('http://localhost:12000/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      console.log('Response status:', response.status);
      console.log('Response message:', result.message || 'No message');
      
      if (response.status === 201 || response.status === 200) {
        console.log('✓ Registration successful! Email should be sent.');
      } else if (response.status === 400 && result.message?.includes('already exists')) {
        console.log('ℹ User already exists - testing login instead...');
        await testLogin(email, 'TestPassword123!');
      }
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

async function testLogin(email, password) {
  try {
    console.log(`Testing login for: ${email}`);
    
    const response = await fetch('http://localhost:12000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    
    console.log('Login response status:', response.status);
    console.log('Login response:', JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log('✓ Login successful!');
      return result.token;
    }
    
  } catch (error) {
    console.error('Login error:', error.message);
  }
  return null;
}

// Run tests
(async () => {
  await testRegistration();
  await testWithRealEmails();
})();