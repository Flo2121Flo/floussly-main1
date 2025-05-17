import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const transactionDuration = new Trend('transaction_duration');
const cacheHitRate = new Rate('cache_hits');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 500 },  // Ramp up to 500 users
    { duration: '3m', target: 500 },  // Stay at 500 users
    { duration: '1m', target: 1000 }, // Ramp up to 1000 users
    { duration: '3m', target: 1000 }, // Stay at 1000 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    'errors': ['rate<0.1'],           // Error rate should be less than 10%
    'transaction_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    'cache_hits': ['rate>0.8'],       // Cache hit rate should be above 80%
  },
};

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'test123'
};

// Helper function to get auth token
function getAuthToken() {
  const loginRes = http.post(`${__ENV.API_URL}/auth/login`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  return loginRes.json('token');
}

// Main test function
export default function() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test transaction list endpoint
  const startTime = new Date();
  const transactionsRes = http.get(`${__ENV.API_URL}/transactions`, { headers });
  const duration = new Date() - startTime;
  
  transactionDuration.add(duration);
  
  check(transactionsRes, {
    'transactions status is 200': (r) => r.status === 200,
    'transactions have data': (r) => r.json().data !== undefined,
  });
  
  // Check cache hit
  const cacheHit = transactionsRes.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(cacheHit);
  
  // Test transaction creation
  const newTransaction = {
    amount: 100,
    description: 'Load test transaction',
    type: 'expense',
    category: 'test'
  };
  
  const createRes = http.post(
    `${__ENV.API_URL}/transactions`,
    JSON.stringify(newTransaction),
    { headers }
  );
  
  check(createRes, {
    'create transaction status is 201': (r) => r.status === 201,
    'transaction created successfully': (r) => r.json().id !== undefined,
  });
  
  // Test transaction details
  if (createRes.status === 201) {
    const transactionId = createRes.json('id');
    const detailsRes = http.get(
      `${__ENV.API_URL}/transactions/${transactionId}`,
      { headers }
    );
    
    check(detailsRes, {
      'transaction details status is 200': (r) => r.status === 200,
      'transaction details match': (r) => r.json().amount === newTransaction.amount,
    });
  }
  
  // Add error to error rate if any request failed
  errorRate.add(
    transactionsRes.status !== 200 ||
    createRes.status !== 201 ||
    (createRes.status === 201 && detailsRes.status !== 200)
  );
  
  sleep(1);
}

// Handle test completion
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'reports/summary.json': JSON.stringify(data),
    'reports/metrics.csv': generateMetricsCSV(data),
  };
}

// Generate CSV report
function generateMetricsCSV(data) {
  const metrics = [
    'vus',
    'iterations',
    'http_req_duration',
    'http_req_failed',
    'errors',
    'transaction_duration',
    'cache_hits'
  ];
  
  let csv = 'timestamp,metric,value\n';
  
  for (const metric of metrics) {
    if (data.metrics[metric]) {
      csv += `${data.state.testRunDuration},${metric},${data.metrics[metric].value}\n`;
    }
  }
  
  return csv;
} 