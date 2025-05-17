const { AxePuppeteer } = require('@axe-core/puppeteer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../reports/accessibility');

async function runAccessibilityTest() {
  console.log('Starting accessibility test...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Navigate to the site
  await page.goto(SITE_URL);
  
  // Run axe-core analysis
  const results = await new AxePuppeteer(page).analyze();
  
  // Generate report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(OUTPUT_DIR, `accessibility-report-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\nAccessibility Test Results:');
  console.log('==========================');
  console.log(`Total violations: ${results.violations.length}`);
  console.log(`Total passes: ${results.passes.length}`);
  console.log(`Total incomplete: ${results.incomplete.length}`);
  
  if (results.violations.length > 0) {
    console.log('\nViolations:');
    results.violations.forEach(violation => {
      console.log(`\n${violation.impact.toUpperCase()}: ${violation.description}`);
      console.log(`Help: ${violation.help}`);
      console.log(`Affected elements: ${violation.nodes.length}`);
    });
  }
  
  console.log(`\nFull report saved to: ${reportPath}`);
  
  await browser.close();
}

runAccessibilityTest().catch(console.error); 