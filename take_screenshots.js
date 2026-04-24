const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });

  const urls = [
    { name: 'screenshot_home.png', url: 'https://sadbhavnatea.vercel.app/' },
    { name: 'screenshot_products.png', url: 'https://sadbhavnatea.vercel.app/products' },
    { name: 'screenshot_cart.png', url: 'https://sadbhavnatea.vercel.app/cart' },
    { name: 'screenshot_admin.png', url: 'http://localhost:5173/admin' } // Captured locally bypassing auth
  ];

  for (const item of urls) {
    try {
      console.log(`Navigating to ${item.url}...`);
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: item.name, fullPage: false });
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.log(`Failed to screenshot ${item.url}: ${err.message}`);
    }
  }

  await browser.close();
})();
