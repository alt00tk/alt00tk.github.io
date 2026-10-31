import { mkdtemp, cp, symlink, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = await mkdtemp(join(tmpdir(), 'publication-contract-'));
const article = (body = '', date = '2026-01-01T00:00:00Z') => `---\ntitle: Test\ndescription: Test\npublishedAt: "${date}"\n---\n${body}\n`;
try {
  for (const file of ['src', 'astro.config.mjs', 'package.json', 'tsconfig.json']) {
    await cp(file, join(root, file), { recursive: true });
  }
  await symlink(resolve('node_modules'), join(root, 'node_modules'), 'dir');
  const cases = [
    { name: 'valid Markdown', bodies: { 'ja/a': '[heading](#section)\n[query](?q=1)\n[empty]()\n[normal](/articles/b/?x=1#heading)\n[reference][b]\n\n[b]: /articles/b/\n\n`[code](/articles/missing/)`\n\n```md\n[code](/articles/missing/)\n```\n\n[external](https://example.com/articles/missing/)\n[other](/about/)\n[page](/articles/page/2/)\n![image](/articles/missing/)' } },
    { name: 'missing English', error: 'missing language counterpart', missing: ['en/a'] },
    { name: 'missing Japanese', error: 'missing language counterpart', missing: ['ja/a'] },
    { name: 'date mismatch', error: 'publishedAt mismatch', dates: { 'en/a': '2026-01-02T00:00:00Z', 'en/b': '2026-01-02T00:00:00Z' } },
    { name: 'broken', bodies: { 'ja/a': '[x](/articles/missing/?a=1#h)' }, error: 'article target does not exist' },
    { name: 'wrong language', bodies: { 'ja/a': '[x](/en/articles/b/#h)' }, error: 'article language mismatch' },
    { name: 'reference broken', bodies: { 'ja/a': '[x][b]\n\n[b]: /articles/missing/' }, error: 'article target does not exist' },
    { name: 'source relative', bodies: { 'ja/a': '[x](b.md)' }, error: 'invalid article link format' },
    { name: 'source directory', bodies: { 'ja/a': '[x](./b/)' }, error: 'invalid article link format' },
    { name: 'source missing', bodies: { 'ja/a': '[x](missing.md)' }, error: 'article target does not exist' },
    { name: 'relative', bodies: { 'ja/a': '[x](../b/?q=1#h)' }, error: 'invalid article link format' },
    { name: 'absolute URL', bodies: { 'ja/a': '[x](https://alt00tk.github.io/articles/b/#h)' }, error: 'invalid article link format' },
    { name: 'protocol relative', bodies: { 'ja/a': '[x](//alt00tk.github.io/articles/b/)' }, error: 'invalid article link format' },
    { name: 'missing slash', bodies: { 'ja/a': '[x](/articles/b)' }, error: 'invalid article link format' },
    { name: 'Markdown URL', bodies: { 'ja/a': '[x](/articles/b.md)' }, error: 'invalid article link format' },
    { name: 'encoded', bodies: { 'ja/a': '[x](/articles/%62/)' }, error: 'invalid article link format' },
    { name: 'HTML anchor', bodies: { 'ja/a': '<a href="/articles/missing/">x</a>' }, error: 'article target does not exist' },
    { name: 'English valid', bodies: { 'en/a': '[x](/en/articles/b/?q=1#h)' } },
    { name: 'English wrong language', error: 'article language mismatch', bodies: { 'en/a': '[x](/articles/b/?q=1#h)' } },
  ];
  for (const { name, bodies = {}, dates = {}, missing = [], error } of cases) {
    await rm(join(root, 'src/content/blog'), { recursive: true, force: true });
    await mkdir(join(root, 'src/content/blog/en'), { recursive: true });
    for (const lang of ['ja', 'en']) for (const slug of ['a', 'b']) {
      const id = `${lang}/${slug}`;
      if (missing.includes(id)) continue;
      await writeFile(join(root, 'src/content/blog', lang === 'en' ? 'en' : '', `${slug}.md`), article(bodies[id], dates[id]));
    }
    const result = spawnSync(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], { cwd: root, encoding: 'utf8' });
    const output = result.stdout + result.stderr;
    assert.ifError(result.error);
    assert.equal(result.signal, null, JSON.stringify(result));
    assert.equal(result.status === 0, !error, `${name}: ${output}`);
    if (error) {
      assert.ok(output.includes(error), `${name}: ${JSON.stringify(result)}`);
      assert.match(output, /src\/content\/blog\/(?:en\/)?a\.md/);
    }
    console.log(`PASS ${name}`);
  }
} finally { await rm(root, { recursive: true, force: true }); }
