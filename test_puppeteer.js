const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/test-cropper');
  await page.waitForTimeout(2000); // Wait for rendering
  await page.screenshot({ path: 'puppeteer-screenshot.png' });
  await browser.close();
  console.log('Screenshot saved as puppeteer-screenshot.png');
})();
