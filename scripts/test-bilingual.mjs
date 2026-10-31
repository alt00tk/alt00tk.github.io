// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
// All fixtures and build output stay in a temporary directory.
import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile, rm, access, mkdtemp, cp, symlink } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = pathToFileURL((await mkdtemp(join(tmpdir(), 'bilingual-'))) + '/');
const english = new URL('src/content/blog/en/', root);
const fixture = (title) => `---\ntitle: ${title}\ndescription: English searchable overview\npublishedAt: "2026-01-01T00:00:00Z"\n---\nFixture body.\n`;
function build(ok = true, pattern) {
  const result = spawnSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8' });
  const output = result.stdout + result.stderr;
  assert.equal(result.status === 0, ok, output);
  if (pattern) assert.match(output, pattern);
}
const html = (path) => readFile(new URL(`dist/${path}`, root), 'utf8');
async function checkDiscovery(expectedEnglish) {
  const englishRss = await html('en/rss.xml');
  assert.match(englishRss, /<language>en<\/language>/);
  assert.match(englishRss, /Thoughts on technology, design, and AI/);
  assert.equal((englishRss.match(/<item>/g) ?? []).length, expectedEnglish);
  const japaneseRss = await html('rss.xml');
  assert.match(japaneseRss, /<language>ja<\/language>/);
  assert.doesNotMatch(japaneseRss, /\/en\/articles\//);
  const index = await html('llms.txt');
  const [japanese, english] = index.split('## English articles (en)');
  assert.ok(english !== undefined);
  assert.doesNotMatch(japanese, /\/en\/articles\//);
  assert.equal((english.match(/^- /gm) ?? []).length, expectedEnglish);
  for (const match of index.matchAll(/\]\((https:[^)]+)\)/g)) {
    const path = new URL(match[1]).pathname.slice(1);
    await access(new URL(`dist/${path}`, root));
    await access(new URL(`dist/${path.replace(/\.md$/, '/index.html')}`, root));
  }
  for (const [path, feed] of [['index.html', '/rss.xml'], ['en/index.html', '/en/rss.xml'],
    ...(expectedEnglish ? [['en/articles/ai-and-intuition/index.html', '/en/rss.xml'], ['articles/ai-and-intuition/index.html', '/rss.xml']] : [])]) {
    const page = await html(path);
    assert.match(page, new RegExp(`rel="alternate" type="application/rss\\+xml" title="notes RSS" href="https:[^"]*${feed}"`));
    assert.ok(page.includes(`href="${feed}"`));
    assert.ok(page.includes('href="/llms.txt"'));
  }
  for (const match of englishRss.matchAll(/<item>.*?<link>(.*?)<\/link>.*?<\/item>/g)) {
    assert.ok(new URL(match[1]).pathname.startsWith('/en/articles/'));
    await access(new URL(`dist/${new URL(match[1]).pathname.slice(1)}index.html`, root));
  }
}
let server;
try {
  for (const file of ['src', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
    await cp(new URL(`../${file}`, import.meta.url), new URL(file, root), { recursive: true });
  }
  await symlink(resolve('node_modules'), new URL('node_modules', root), 'dir');
  await rm(new URL('src/content/blog/', root), { recursive: true });
  await mkdir(english, { recursive: true });
  const slug = 'ai-and-intuition';
  const names = [slug, ...Array.from({length: 10}, (_, i) => `fixture-${i}`)];
  for (const [i, name] of names.entries()) {
    await writeFile(new URL(`${name}.md`, english), fixture(`English title ${i}`));
    await writeFile(new URL(`src/content/blog/${name}.md`, root), fixture(`Japanese title ${i}`));
  }
  build();
  await checkDiscovery(11);
  assert.match(await html('en/rss.xml'), /English title 0/);
  assert.match(await html('en/rss.xml'), /English searchable overview/);
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
  assert.match(await html('en/articles/fixture-0/index.html'), /hreflang="ja"/);
  assert.doesNotMatch(await html('rss.xml'), /English title/);
  assert.match(await html('llms.txt'), /English title/);
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
  server = spawn(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'preview', '--host', '127.0.0.1', '--port', '0'], {cwd:root, stdio:['ignore', 'pipe', 'pipe']});
  const base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview startup timed out')), 10000);
    let output = '';
    const inspect = (chunk) => {
      output += chunk;
      const address = output.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (address) { clearTimeout(timeout); resolve(address[0]); }
    };
    server.stdout.on('data', inspect);
    server.stderr.on('data', inspect);
    server.once('error', error => { clearTimeout(timeout); reject(error); });
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Preview exited (${code}): ${output}`)); });
  });
  const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/en/articles/page/2/`);
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
    await page.goto(`${base}/articles/ai-and-intuition/`);
    await page.locator('.header-links a[lang="en"]').click();
    assert.equal(new URL(page.url()).pathname, '/en/articles/ai-and-intuition/');
    assert.equal(await page.locator('.translation-notice a').getAttribute('href'), '/articles/ai-and-intuition/');
    await page.goto(`${base}/en/`);
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
  await rm(root, { recursive:true, force:true });
}
