const http = require('http');

const endpoints = [
  { name: 'API Gateway', url: 'http://localhost:12000' },
  { name: 'Auth Service', url: 'http://localhost:12001' },
  { name: 'Ride Service', url: 'http://localhost:12002' },
  { name: 'Flight Inventory', url: 'http://localhost:12003' },
  { name: 'Flight Booking', url: 'http://localhost:12004' },
  { name: 'Shipping Service', url: 'http://localhost:12006' },
  { name: 'AI OS', url: 'http://localhost:12010' }
];

console.log('Testing backend connectivity...\n');

endpoints.forEach(endpoint => {
  const req = http.request(endpoint.url, { method: 'GET', timeout: 5000 }, (res) => {
    console.log(`${endpoint.name}: ✅ ${res.statusCode} ${res.statusMessage}`);
  });
  
  req.on('error', (err) => {
    console.log(`${endpoint.name}: ❌ ${err.code || err.message}`);
  });
  
  req.on('timeout', () => {
    console.log(`${endpoint.name}: ⏱️ Timeout`);
    req.destroy();
  });
  
  req.end();
});