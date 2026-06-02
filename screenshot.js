const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/test-cropper');
  await page.waitForTimeout(2000); // Wait for image to load and cropper to render
  await page.screenshot({ path: 'cropper-screenshot.png' });
  await browser.close();
  console.log('Screenshot saved as cropper-screenshot.png');
})();
