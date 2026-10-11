const http = require('http');

console.log('Testing API Gateway connectivity...\n');

// Test with your IP address
const testUrl = 'http://10.112.148.175:12000';

const req = http.request(testUrl, { method: 'GET', timeout: 5000 }, (res) => {
  console.log(`✅ API Gateway is accessible at ${testUrl}`);
  console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`   Response: ${data.substring(0, 200)}...`);
    console.log('\n🎉 Mobile apps should now be able to connect!');
    console.log('\nTo test mobile app:');
    console.log('1. Restart the mobile app');
    console.log('2. Try to login');
    console.log('3. Should work now!');
  });
});

req.on('error', (err) => {
  console.log(`❌ API Gateway NOT accessible at ${testUrl}`);
  console.log(`   Error: ${err.code || err.message}`);
  console.log('\nPossible issues:');
  console.log('1. Docker containers not running');
  console.log('2. Firewall blocking port 12000');
  console.log('3. Wrong IP address');
  console.log('\nCheck with: docker-compose ps');
});

req.on('timeout', () => {
  console.log(`⏱️ Timeout connecting to ${testUrl}`);
  req.destroy();
});

req.end();