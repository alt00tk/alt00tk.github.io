// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
// Fixtures are removed and the original production build is restored even on failure.
import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
const english = new URL('../src/content/blog/en/', import.meta.url);
const root = new URL('../', import.meta.url);
const fixture = (title) => `---\ntitle: ${title}\ndescription: English searchable overview\npublishedAt: "2026-01-01T00:00:00Z"\n---\nFixture body.\n`;
function build(ok = true, pattern) {
  const result = spawnSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8' });
  const output = result.stdout + result.stderr;
  assert.equal(result.status === 0, ok, output);
  if (pattern) assert.match(output, pattern);
}
const html = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
try { await access(english); throw new Error('This fixture test requires no existing en directory; run in an isolated checkout.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
let server;
try {
  build();
  assert.doesNotMatch(await html('index.html'), /href="\/en\/"/);
  assert.doesNotMatch(await html('en/index.html'), /hreflang=/);
  await mkdir(english);
  const slug = 'ai-and-intuition';
  const names = [slug, ...Array.from({length: 10}, (_, i) => `fixture-${i}`)];
  for (const [i, name] of names.entries()) await writeFile(new URL(`${name}.md`, english), fixture(`English title ${i}`));
  build();
  assert.equal(await html(`en/articles/${slug}.md`), fixture('English title 0'));
  const article = await html(`en/articles/${slug}/index.html`);
  assert.match(article, /lang="en"/);
  assert.match(article, /content="en_US"/);
  assert.match(article, /hreflang="ja" href="https:[^"]*\/articles\/ai-and-intuition\/"/);
  assert.match(article, /This article was translated from Japanese using AI/);
  assert.match(article, /rel="canonical" href="https:[^"]*\/en\/articles\/ai-and-intuition\/"/);
  assert.doesNotMatch(await html('articles/ai-and-intuition/index.html'), /translation-notice/);
  assert.match(await html('en/articles/page/2/index.html'), /href="\/en\/"/);
  for (const path of ['articles/page/2/index.html', 'en/articles/page/2/index.html']) assert.doesNotMatch(await html(path), /hreflang=/);
  assert.match(await html('index.html'), /hreflang="en" href="https:[^"]*\/en\/"/);
  assert.match(await html('en/index.html'), /hreflang="ja" href="https:[^"]*\/"/);
  assert.doesNotMatch(await html('en/articles/fixture-0/index.html'), /hreflang="ja"/);
  assert.doesNotMatch(await html('rss.xml'), /English title/);
  assert.doesNotMatch(await html('llms.txt'), /English title/);
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
  server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4329'], {cwd:root, stdio:'ignore'});
  const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    for(let i=0; i<50; i++) { try { await page.goto('http://127.0.0.1:4329/en/articles/page/2/'); break; } catch { await new Promise(r => setTimeout(r,100)); } }
    await page.locator('#article-search-trigger').click();
    await page.locator('#article-query').fill('English title 0');
    assert.equal(await page.locator('.post:visible').count(), 1);
    assert.equal(await page.locator('.search-status').textContent(), 'Results: 1');
    await page.locator('.post:visible a').click();
    assert.match(page.url(), /\/en\/articles\/ai-and-intuition\/$/);
    await page.locator('.article-nav a').click();
    assert.match(page.url(), /\/en\/articles\/page\/2\/$/);
    assert.equal(await page.locator('#article-query').inputValue(), 'English title 0');
    await page.locator('.header-links a[lang="ja"]').click();
    assert.equal(new URL(page.url()).pathname, '/');
    assert.equal(await page.locator('.article-search').isVisible(), false);
    await page.goto('http://127.0.0.1:4329/articles/ai-and-intuition/');
    await page.locator('.header-links a[lang="en"]').click();
    assert.equal(new URL(page.url()).pathname, '/en/articles/ai-and-intuition/');
    assert.equal(await page.locator('.translation-notice a').getAttribute('href'), '/articles/ai-and-intuition/');
    await page.goto('http://127.0.0.1:4329/en/');
    await page.locator('#article-search-trigger').click();
    await page.locator('#article-query').fill('no-such-article');
    assert.equal(await page.locator('.search-status').textContent(), 'No articles found (0)');
    await page.locator('.search-clear').click();
    assert.equal(await page.locator('.post:visible').count(), 11);
  } finally { await browser.close(); }
  await mkdir(new URL('nested/', english));
  await writeFile(new URL(`nested/${slug}.md`, english), fixture('Duplicate'));
  build(false, /Duplicate blog article slug/);
  await rm(new URL('nested/', english), {recursive:true});
  await writeFile(new URL('Invalid.md', english), fixture('Bad slug'));
  build(false, /Invalid blog article filename/);
  await rm(new URL('Invalid.md', english));
  await writeFile(new URL('invalid-schema.md', english), fixture('Bad schema').replace('English searchable overview','""'));
  build(false, /description must not be empty/);
  console.log('Bilingual build, validation, metadata, Markdown and browser checks passed.');
} finally {
  server?.kill();
  await rm(english, { recursive:true, force:true });
  build();
}
