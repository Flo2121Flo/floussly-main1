const axios = require('axios');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const OUTPUT_DIR = path.join(__dirname, '../reports/security');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function testRateLimiter() {
  console.log('Testing rate limiter...');
  
  const requests = Array(1000).fill().map(() => 
    axios.get(`${API_URL}/transactions`, {
      validateStatus: () => true
    })
  );
  
  const start = performance.now();
  const responses = await Promise.all(requests);
  const end = performance.now();
  
  const results = {
    totalRequests: requests.length,
    duration: end - start,
    statusCodes: responses.reduce((acc, res) => {
      acc[res.status] = (acc[res.status] || 0) + 1;
      return acc;
    }, {}),
    blockedRequests: responses.filter(res => res.status === 429).length
  };
  
  return results;
}

async function testTokenExpiration() {
  console.log('Testing token expiration...');
  
  const results = {
    validToken: false,
    expiredToken: false,
    invalidToken: false
  };
  
  // Test with valid token
  try {
    const validResponse = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: 'Bearer valid-token' }
    });
    results.validToken = validResponse.status === 200;
  } catch (error) {
    results.validToken = false;
  }
  
  // Test with expired token
  try {
    await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: 'Bearer expired-token' }
    });
    results.expiredToken = false;
  } catch (error) {
    results.expiredToken = error.response?.status === 401;
  }
  
  // Test with invalid token
  try {
    await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    results.invalidToken = false;
  } catch (error) {
    results.invalidToken = error.response?.status === 401;
  }
  
  return results;
}

async function testCORS() {
  console.log('Testing CORS configuration...');
  
  const origins = [
    'http://localhost:3000',
    'https://floussly.com',
    'https://malicious-site.com'
  ];
  
  const results = {};
  
  for (const origin of origins) {
    try {
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: { Origin: origin },
        validateStatus: () => true
      });
      
      results[origin] = {
        allowed: response.headers['access-control-allow-origin'] === origin,
        methods: response.headers['access-control-allow-methods'],
        headers: response.headers['access-control-allow-headers']
      };
    } catch (error) {
      results[origin] = {
        allowed: false,
        error: error.message
      };
    }
  }
  
  return results;
}

async function testXSS() {
  console.log('Testing XSS protection...');
  
  const payloads = [
    '<script>alert("xss")</script>',
    '"><script>alert("xss")</script>',
    '"><img src=x onerror=alert("xss")>',
    '"><svg/onload=alert("xss")>'
  ];
  
  const results = {};
  
  for (const payload of payloads) {
    try {
      const response = await axios.post(`${API_URL}/transactions`, {
        description: payload
      }, {
        validateStatus: () => true
      });
      
      results[payload] = {
        sanitized: !response.data.description?.includes(payload),
        status: response.status
      };
    } catch (error) {
      results[payload] = {
        sanitized: true,
        error: error.message
      };
    }
  }
  
  return results;
}

async function main() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      rateLimiter: await testRateLimiter(),
      tokenExpiration: await testTokenExpiration(),
      cors: await testCORS(),
      xss: await testXSS()
    };
    
    // Save results
    const reportPath = path.join(OUTPUT_DIR, `security-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    // Print summary
    console.log('\nSecurity Test Results:');
    console.log('=====================');
    console.log(`Rate Limiter: ${results.rateLimiter.blockedRequests} requests blocked`);
    console.log(`Token Expiration: ${Object.values(results.tokenExpiration).filter(Boolean).length}/3 tests passed`);
    console.log(`CORS: ${Object.values(results.cors).filter(r => r.allowed).length}/${Object.keys(results.cors).length} origins allowed`);
    console.log(`XSS: ${Object.values(results.xss).filter(r => r.sanitized).length}/${Object.keys(results.xss).length} payloads sanitized`);
    
    console.log(`\nFull report saved to: ${reportPath}`);
  } catch (error) {
    console.error('Error running security tests:', error);
    process.exit(1);
  }
}

main(); 