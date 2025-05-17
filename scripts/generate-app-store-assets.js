const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ASSETS_DIR = path.join(__dirname, '../assets');
const OUTPUT_DIR = path.join(__dirname, '../app-store-assets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateAppIcons() {
  console.log('Generating app icons...');
  
  const iconSizes = {
    'ios': [20, 29, 40, 60, 76, 83.5, 1024],
    'android': [48, 72, 96, 144, 192, 512]
  };
  
  const sourceIcon = path.join(ASSETS_DIR, 'icon.png');
  
  for (const platform in iconSizes) {
    const platformDir = path.join(OUTPUT_DIR, platform, 'icons');
    fs.mkdirSync(platformDir, { recursive: true });
    
    for (const size of iconSizes[platform]) {
      const outputPath = path.join(platformDir, `icon-${size}.png`);
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(outputPath);
    }
  }
}

async function generateSplashScreens() {
  console.log('Generating splash screens...');
  
  const splashSizes = {
    'ios': [
      { width: 1242, height: 2688 },
      { width: 1125, height: 2436 },
      { width: 1242, height: 2208 },
      { width: 750, height: 1334 }
    ],
    'android': [
      { width: 1080, height: 1920 },
      { width: 1440, height: 2560 }
    ]
  };
  
  const sourceSplash = path.join(ASSETS_DIR, 'splash.png');
  
  for (const platform in splashSizes) {
    const platformDir = path.join(OUTPUT_DIR, platform, 'splash');
    fs.mkdirSync(platformDir, { recursive: true });
    
    for (const size of splashSizes[platform]) {
      const outputPath = path.join(platformDir, `splash-${size.width}x${size.height}.png`);
      await sharp(sourceSplash)
        .resize(size.width, size.height)
        .toFile(outputPath);
    }
  }
}

async function generateScreenshots() {
  console.log('Generating app store screenshots...');
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for iPhone 12 Pro Max
  await page.setViewport({ width: 428, height: 926 });
  
  // List of pages to screenshot
  const pages = [
    { name: 'dashboard', path: '/dashboard' },
    { name: 'transactions', path: '/transactions' },
    { name: 'profile', path: '/profile' }
  ];
  
  for (const { name, path } of pages) {
    await page.goto(`http://localhost:3000${path}`);
    await page.waitForSelector('main');
    
    const screenshotPath = path.join(OUTPUT_DIR, 'screenshots', `${name}.png`);
    await page.screenshot({ path: screenshotPath });
  }
  
  await browser.close();
}

async function generateAppStoreContent() {
  console.log('Generating app store content...');
  
  const content = {
    name: 'Floussly',
    subtitle: 'Smart Money Management',
    description: `Floussly is your all-in-one financial companion that helps you manage your money smarter.

Key Features:
• Track your spending and income
• Set and achieve financial goals
• Get insights into your spending habits
• Secure and private transactions
• Real-time notifications
• Multi-currency support

Download Floussly today and take control of your finances!`,
    keywords: [
      'finance',
      'money',
      'budget',
      'expense',
      'tracking',
      'wallet',
      'banking',
      'payments',
      'transactions',
      'financial'
    ],
    privacyPolicy: fs.readFileSync(path.join(__dirname, '../client/src/pages/Privacy.tsx'), 'utf8')
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'app-store-content.json'),
    JSON.stringify(content, null, 2)
  );
}

async function main() {
  try {
    await generateAppIcons();
    await generateSplashScreens();
    await generateScreenshots();
    await generateAppStoreContent();
    
    console.log('\nApp store assets generation completed!');
    console.log(`Output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Error generating app store assets:', error);
    process.exit(1);
  }
}

main(); 