const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });

  try {
    console.log(`Navigating to admin...`);
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'screenshot_admin.png', fullPage: false });
    console.log(`Saved screenshot_admin.png`);
  } catch (err) {
    console.log(`Failed: ${err.message}`);
  }

  await browser.close();
})();
