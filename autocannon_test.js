import autocannon from 'autocannon';
import { randomBytes } from 'crypto';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTest() {
  console.log('🚀 Starting Load Test with 20 parallel connections for 30s...');

  const instance = autocannon({
    url: `${BASE_URL}/customers/signup`,
    connections: 20,
    duration: 30,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    setupRequest: (request) => {
      // Generate unique email for each request to test performance
      // AND duplicate state if requested multiple times
      const email = `test_${randomBytes(4).toString('hex')}@example.com`;
      request.body = JSON.stringify({
        name: 'Load Test User',
        email: email,
        password: 'Password@123',
        confirmPassword: 'Password@123',
        agreeTerms: true
      });
      return request;
    }
  }, (err, result) => {
    if (err) console.error(err);
    console.log('✅ Test Completed!');
  });

  autocannon.track(instance, { renderProgressBar: true });
}

runTest();
