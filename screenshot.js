const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

async function takeScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: path.join(process.env.HOME, '.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Screenshot 1: Homepage
  console.log('Taking screenshot 1: Homepage');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-homepage.png'),
    fullPage: true,
  });

  // Screenshot 2: Homepage with file uploaded
  console.log('Taking screenshot 2: File uploaded');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(path.join(__dirname, 'public/sample/sales.csv'));
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-file-uploaded.png'),
      fullPage: true,
    });
  }

  // Screenshot 3: Click "开始分析" to go to analysis page
  console.log('Taking screenshot 3: Analysis page');
  const startBtn = await page.$('button:has-text("开始分析")');
  if (startBtn) {
    await startBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-analysis-page.png'),
      fullPage: true,
    });
  }

  // Screenshot 4: Analysis page with data preview
  console.log('Taking screenshot 4: Data preview');
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '04-data-preview.png'),
    fullPage: true,
  });

  // Screenshot 5: Mobile view
  console.log('Taking screenshot 5: Mobile view');
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });
  await mobilePage.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, '05-mobile-homepage.png'),
    fullPage: true,
  });

  await browser.close();
  console.log('Screenshots saved to:', SCREENSHOT_DIR);
}

takeScreenshots().catch(console.error);
