import http from 'k6/http';
import { check, sleep } from 'k6';
const API_URL = __ENV.API_URL || 'http://localhost:8091';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 5 },
    { duration: '5s', target: 0 },
  ],
};

export default function () {
  const res = http.get(`${API_URL}/products`, {
    headers: { Accept: 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has products': (r) => r.json('data').length > 0,
  });

  sleep(1);
}
