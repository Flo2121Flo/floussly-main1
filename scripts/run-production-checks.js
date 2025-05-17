const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const REPORTS_DIR = path.join(__dirname, '../reports');
const FINAL_REPORT_PATH = path.join(REPORTS_DIR, 'production-readiness-report.md');

async function runTests() {
  console.log('Starting production readiness checks...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  };

  // Run unit tests
  try {
    console.log('Running unit tests...');
    execSync('npm test', { stdio: 'inherit' });
    results.tests.unit = { status: 'passed' };
    results.summary.passed++;
  } catch (error) {
    results.tests.unit = { status: 'failed', error: error.message };
    results.summary.failed++;
  }
  results.summary.total++;

  // Run accessibility tests
  try {
    console.log('\nRunning accessibility tests...');
    execSync('node scripts/accessibility-test.js', { stdio: 'inherit' });
    results.tests.accessibility = { status: 'passed' };
    results.summary.passed++;
  } catch (error) {
    results.tests.accessibility = { status: 'failed', error: error.message };
    results.summary.failed++;
  }
  results.summary.total++;

  // Run security tests
  try {
    console.log('\nRunning security tests...');
    execSync('node scripts/security-test.js', { stdio: 'inherit' });
    results.tests.security = { status: 'passed' };
    results.summary.passed++;
  } catch (error) {
    results.tests.security = { status: 'failed', error: error.message };
    results.summary.failed++;
  }
  results.summary.total++;

  // Run load tests
  try {
    console.log('\nRunning load tests...');
    execSync('k6 run scripts/load-test.js', { stdio: 'inherit' });
    results.tests.load = { status: 'passed' };
    results.summary.passed++;
  } catch (error) {
    results.tests.load = { status: 'failed', error: error.message };
    results.summary.failed++;
  }
  results.summary.total++;

  // Generate app store assets
  try {
    console.log('\nGenerating app store assets...');
    execSync('node scripts/generate-app-store-assets.js', { stdio: 'inherit' });
    results.tests.appStoreAssets = { status: 'passed' };
    results.summary.passed++;
  } catch (error) {
    results.tests.appStoreAssets = { status: 'failed', error: error.message };
    results.summary.failed++;
  }
  results.summary.total++;

  return results;
}

function generateReport(results) {
  const report = `# Production Readiness Report
Generated: ${new Date().toLocaleString()}

## Test Results Summary
- Total Tests: ${results.summary.total}
- Passed: ${results.summary.passed}
- Failed: ${results.summary.failed}
- Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%

## Detailed Results

### Unit Tests
Status: ${results.tests.unit.status}
${results.tests.unit.error ? `Error: ${results.tests.unit.error}\n` : ''}

### Accessibility Tests
Status: ${results.tests.accessibility.status}
${results.tests.accessibility.error ? `Error: ${results.tests.accessibility.error}\n` : ''}

### Security Tests
Status: ${results.tests.security.status}
${results.tests.security.error ? `Error: ${results.tests.security.error}\n` : ''}

### Load Tests
Status: ${results.tests.load.status}
${results.tests.load.error ? `Error: ${results.tests.load.error}\n` : ''}

### App Store Assets
Status: ${results.tests.appStoreAssets.status}
${results.tests.appStoreAssets.error ? `Error: ${results.tests.appStoreAssets.error}\n` : ''}

## Manual Validation Required
1. Security audit results review
2. Penetration testing report review
3. Legal compliance verification
4. App store submission review
5. Production environment verification
6. Backup and recovery testing
7. Incident response plan review

## Next Steps
${results.summary.failed > 0 ? '❌ Fix failed tests before proceeding with deployment\n' : '✅ All automated tests passed\n'}
1. Review manual validation items
2. Schedule security review
3. Prepare deployment package
4. Plan launch date
5. Train support team

## Notes
- All automated tests must pass before deployment
- Security audit must be reviewed by security team
- Legal team must approve privacy policy and terms
- App store submission must be reviewed by marketing team
- Production environment must be verified by DevOps team
- Backup and recovery must be tested by operations team
- Incident response plan must be reviewed by management
`;

  return report;
}

async function main() {
  try {
    // Create reports directory if it doesn't exist
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    // Run all tests
    const results = await runTests();

    // Generate and save report
    const report = generateReport(results);
    fs.writeFileSync(FINAL_REPORT_PATH, report);

    console.log(`\nProduction readiness report generated: ${FINAL_REPORT_PATH}`);
    console.log('\nSummary:');
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`Passed: ${results.summary.passed}`);
    console.log(`Failed: ${results.summary.failed}`);
    console.log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

    // Exit with error if any tests failed
    if (results.summary.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running production checks:', error);
    process.exit(1);
  }
}

main(); 