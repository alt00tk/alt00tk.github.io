// Build and start preview first. PLAYWRIGHT_MODULE may point to an existing installation.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
const base = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4329';
try {
  for (const width of [1000, 375, 320]) {
    let previous;
    for (const path of ['/', '/articles/ai-and-intuition/']) {
      const measurements = [];
      for (const enabled of [false, true]) {
        const context = await browser.newContext({javaScriptEnabled:enabled, viewport:{width,height:700}});
        const page = await context.newPage();
        await page.route('https://fonts.**/*', route => route.abort());
        await page.goto(base + path);
        if (enabled) await page.locator('.theme-picker:not([hidden])').waitFor();
        const rect = await page.locator('.language-switch').boundingBox();
        measurements.push(rect);
        await context.close();
      }
      if (previous) assert.deepEqual(measurements[1], previous, 'Language control moves between list and article');
      previous = measurements[1];
      console.log(width, path, JSON.stringify(measurements));
      assert.deepEqual(measurements[0], measurements[1], 'Language control moves when header scripts initialize');
    }
  }
  console.log('Header layout stable before and after JavaScript initialization.');
} finally { await browser.close(); }
