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
    ['valid Markdown', '[heading](#section)\n[query](?q=1)\n[empty]()\n[normal](/articles/b/?x=1#heading)\n[reference][b]\n\n[b]: /articles/b/\n\n`[code](/articles/missing/)`\n\n```md\n[code](/articles/missing/)\n```\n\n[external](https://example.com/articles/missing/)\n[other](/about/)\n[page](/articles/page/2/)\n![image](/articles/missing/)'],
    ['missing English', '', 'missing language counterpart', 'en'],
    ['missing Japanese', '', 'missing language counterpart', 'ja'],
    ['date mismatch', '', 'publishedAt mismatch', 'date'],
    ['broken', '[x](/articles/missing/?a=1#h)', 'article target does not exist'],
    ['wrong language', '[x](/en/articles/b/#h)', 'article language mismatch'],
    ['reference broken', '[x][b]\n\n[b]: /articles/missing/', 'article target does not exist'],
    ['source relative', '[x](b.md)', 'invalid article link format'],
    ['source directory', '[x](./b/)', 'invalid article link format'],
    ['source missing', '[x](missing.md)', 'article target does not exist'],
    ['relative', '[x](../b/?q=1#h)', 'invalid article link format'],
    ['absolute URL', '[x](https://alt00tk.github.io/articles/b/#h)', 'invalid article link format'],
    ['protocol relative', '[x](//alt00tk.github.io/articles/b/)', 'invalid article link format'],
    ['missing slash', '[x](/articles/b)', 'invalid article link format'],
    ['Markdown URL', '[x](/articles/b.md)', 'invalid article link format'],
    ['encoded', '[x](/articles/%62/)', 'invalid article link format'],
    ['HTML anchor', '<a href="/articles/missing/">x</a>', 'article target does not exist'],
    ['English valid', '', undefined, 'english-valid'],
    ['English wrong language', '', 'article language mismatch', 'english-wrong'],
  ];
  for (const [name, body, error, mode] of cases) {
    await rm(join(root, 'src/content/blog'), { recursive: true, force: true });
    await mkdir(join(root, 'src/content/blog/en'), { recursive: true });
    for (const lang of ['ja', 'en']) for (const slug of ['a', 'b']) {
      if (slug === 'a' && mode === lang) continue;
      const content = lang === 'ja' && slug === 'a' ? body : lang === 'en' && slug === 'a' && mode?.startsWith('english-') ? `[x](${mode === 'english-valid' ? '/en' : ''}/articles/b/?q=1#h)` : '';
      await writeFile(join(root, 'src/content/blog', lang === 'en' ? 'en' : '', `${slug}.md`), article(content, mode === 'date' && lang === 'en' ? '2026-01-02T00:00:00Z' : undefined));
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
