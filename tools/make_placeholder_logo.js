// Renders assets/logo-placeholder.png: a plain stand-in wordmark used only until the real
// APRÓBETŰ logo is dropped into assets/ (see README). It is not the brand logo.
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2400, height: 600 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8">
    <style>
      html,body{margin:0;background:transparent}
      span{display:inline-block;padding:40px 60px;font:900 300px/1 'Inter Display','Inter',sans-serif;
           letter-spacing:0.01em;color:#fff;white-space:nowrap}
    </style><span id="w">APRÓBETŰ</span>`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#w').screenshot({
    path: path.join(__dirname, '..', 'assets', 'logo-placeholder.png'),
    omitBackground: true,
  });
  await browser.close();
})();
