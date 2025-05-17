import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

interface LoadTestConfig {
  vus: number; // Virtual Users
  duration: string;
  target: string;
  scenarios: {
    name: string;
    weight: number;
    exec: string;
  }[];
}

interface LoadTestResult {
  timestamp: string;
  metrics: {
    http_req_duration: {
      p95: number;
      p99: number;
      avg: number;
    };
    http_reqs: {
      total: number;
      failed: number;
    };
    ws_connections: {
      total: number;
      failed: number;
      avg_latency: number;
    };
    memory: {
      heap_used: number;
      heap_total: number;
    };
    cpu: {
      usage: number;
    };
  };
  errors: string[];
  warnings: string[];
}

interface LoadTestOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  concurrency: number;
  duration: number;
  payload?: Record<string, any>;
}

interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  throughput: number;
}

export class LoadTest {
  private readonly K6_SCRIPT_DIR = path.join(process.cwd(), 'load-tests');
  private readonly RESULTS_DIR = path.join(process.cwd(), 'load-test-results');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.K6_SCRIPT_DIR, this.RESULTS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runFullScaleTest(): Promise<LoadTestResult> {
    try {
      // Generate k6 test script
      await this.generateK6Script();

      // Run the load test
      const result = await this.executeLoadTest();

      // Analyze results
      const analysis = this.analyzeResults(result);

      // Save results
      await this.saveResults(analysis);

      return analysis;
    } catch (error) {
      logger.error('Load test failed:', error);
      throw error;
    }
  }

  private async generateK6Script(): Promise<void> {
    const script = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import ws from 'k6/ws';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    login: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100000 },
        { duration: '5m', target: 100000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'login',
    },
    transactions: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100000 },
        { duration: '5m', target: 100000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'transactions',
    },
    websocket: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100000 },
        { duration: '5m', target: 100000 },
        { duration: '2m', target: 0 },
      ],
      exec: 'websocket',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200'],
    errors: ['rate<0.1'],
    ws_connections: ['p(95)<1000'],
  },
};

export function login() {
  const res = http.post('${process.env.API_URL}/auth/login', {
    email: 'test@example.com',
    password: 'password123',
  });

  check(res, {
    'login successful': (r) => r.status === 200,
  });

  sleep(1);
}

export function transactions() {
  const res = http.post('${process.env.API_URL}/transactions', {
    amount: 100,
    type: 'transfer',
    recipientId: '123',
  });

  check(res, {
    'transaction successful': (r) => r.status === 200,
  });

  sleep(1);
}

export function websocket() {
  const url = '${process.env.WS_URL}';
  const params = { tags: { type: 'websocket' } };

  ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.on('message', (data) => {
      check(data, {
        'message received': (d) => d !== null,
      });
    });

    socket.on('close', () => {
      console.log('WebSocket connection closed');
    });

    socket.on('error', (e) => {
      console.error('WebSocket error:', e);
      errorRate.add(1);
    });

    socket.setTimeout(function () {
      socket.close();
    }, 10000);
  });
}
    `;

    const scriptPath = path.join(this.K6_SCRIPT_DIR, 'load-test.js');
    await fs.promises.writeFile(scriptPath, script);
  }

  private async executeLoadTest(): Promise<any> {
    const scriptPath = path.join(this.K6_SCRIPT_DIR, 'load-test.js');
    const { stdout } = await execAsync(`k6 run ${scriptPath} --out json=results.json`);
    return JSON.parse(stdout);
  }

  private analyzeResults(results: any): LoadTestResult {
    const metrics = results.metrics;
    const errors = results.errors || [];
    const warnings = results.warnings || [];

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        http_req_duration: {
          p95: metrics.http_req_duration.values.p95,
          p99: metrics.http_req_duration.values.p99,
          avg: metrics.http_req_duration.values.avg,
        },
        http_reqs: {
          total: metrics.http_reqs.count,
          failed: metrics.http_req_failed.count,
        },
        ws_connections: {
          total: metrics.ws_connections.count,
          failed: metrics.ws_connection_failed.count,
          avg_latency: metrics.ws_latency.values.avg,
        },
        memory: {
          heap_used: metrics.vus_max.value,
          heap_total: metrics.vus.value,
        },
        cpu: {
          usage: metrics.cpu_usage.value,
        },
      },
      errors,
      warnings,
    };
  }

  private async saveResults(results: LoadTestResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.RESULTS_DIR, `load-test-${timestamp}.json`);
    await fs.promises.writeFile(filePath, JSON.stringify(results, null, 2));
  }

  async generateLoadTestReport(): Promise<string> {
    const results = await this.runFullScaleTest();
    const { metrics, errors, warnings } = results;

    return `
# Load Test Report

## Test Configuration
- Virtual Users: 100,000
- Duration: 9 minutes
- Scenarios: Login, Transactions, WebSocket

## Performance Metrics

### HTTP Requests
- Total Requests: ${metrics.http_reqs.total}
- Failed Requests: ${metrics.http_reqs.failed}
- Error Rate: ${((metrics.http_reqs.failed / metrics.http_reqs.total) * 100).toFixed(2)}%

### Response Times
- P95: ${metrics.http_req_duration.p95.toFixed(2)}ms
- P99: ${metrics.http_req_duration.p99.toFixed(2)}ms
- Average: ${metrics.http_req_duration.avg.toFixed(2)}ms

### WebSocket Performance
- Total Connections: ${metrics.ws_connections.total}
- Failed Connections: ${metrics.ws_connections.failed}
- Average Latency: ${metrics.ws_connections.avg_latency.toFixed(2)}ms

### Resource Usage
- Memory Usage: ${(metrics.memory.heap_used / 1024 / 1024).toFixed(2)}MB
- CPU Usage: ${metrics.cpu.usage.toFixed(2)}%

## Issues
${errors.length > 0 ? errors.map(e => `- ${e}`).join('\n') : 'No errors found'}

## Warnings
${warnings.length > 0 ? warnings.map(w => `- ${w}`).join('\n') : 'No warnings found'}

## Recommendations
${this.generateRecommendations(metrics)}
    `;
  }

  private generateRecommendations(metrics: any): string {
    const recommendations: string[] = [];

    if (metrics.http_req_duration.p95 > 200) {
      recommendations.push('- Optimize slow endpoints to meet P95 < 200ms target');
    }

    if (metrics.http_reqs.failed / metrics.http_reqs.total > 0.001) {
      recommendations.push('- Investigate and fix failed requests');
    }

    if (metrics.ws_connections.failed > 0) {
      recommendations.push('- Improve WebSocket connection stability');
    }

    if (metrics.memory.heap_used > 1024 * 1024 * 1024) { // 1GB
      recommendations.push('- Optimize memory usage');
    }

    if (metrics.cpu.usage > 80) {
      recommendations.push('- Consider horizontal scaling to reduce CPU load');
    }

    return recommendations.join('\n');
  }

  async runLoadTest(options: LoadTestOptions): Promise<LoadTestMetrics> {
    try {
      const script = this.generateLoadTestScript(options);
      const scriptPath = path.join(this.K6_SCRIPT_DIR, 'load-test.js');
      await fs.promises.writeFile(scriptPath, script);

      const { stdout } = await execAsync(`k6 run ${scriptPath} --out json=results.json`);
      const results = JSON.parse(stdout);

      return {
        totalRequests: results.metrics.http_reqs.count,
        successfulRequests: results.metrics.http_reqs.count - results.metrics.http_req_failed.count,
        failedRequests: results.metrics.http_req_failed.count,
        averageResponseTime: results.metrics.http_req_duration.values.avg,
        throughput: results.metrics.http_reqs.count / (results.metrics.duration / 1000)
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Load test failed:', { error: err.message });
      throw err;
    }
  }

  private generateLoadTestScript(options: LoadTestOptions): string {
    return `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: ${options.concurrency} },
        { duration: '${options.duration}s', target: ${options.concurrency} },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200'],
    errors: ['rate<0.1'],
  },
};

export default function() {
  const url = '${options.endpoint}';
  const payload = ${JSON.stringify(options.payload || {})};
  
  const response = http.${options.method.toLowerCase()}(url, payload);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  if (response.status !== 200) {
    errorRate.add(1);
  }

  sleep(1);
}
    `;
  }
} 