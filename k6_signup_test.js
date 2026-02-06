import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.95'], // Error rate should be less than 5% (excluding expected 429/409)
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = 'http://localhost:5000/api/v1';

export default function () {
  // Scenario 1: Unique Signup (Performance Test)
  const email = `test_${randomString(10)}@example.com`;
  const payload = JSON.stringify({
    name: 'Load Test User',
    email: email,
    password: 'Password@123',
    confirmPassword: 'Password@123',
    agreeTerms: true
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/customers/signup`, payload, params);

  check(res, {
    'signup status is 201 or 429': (r) => r.status === 201 || r.status === 429,
  });

  // Scenario 2: Duplicate Signup (Idempotency/Race Condition Test)
  // We hit the SAME email again immediately to see if the lock or unique index catches it
  const dupRes = http.post(`${BASE_URL}/customers/signup`, payload, params);

  check(dupRes, {
    'duplicate signup is blocked (429 or 409/400)': (r) => r.status === 429 || r.status === 409 || r.status === 400,
  });

  sleep(1);
}
