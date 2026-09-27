import { readdir, readFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Loader } from "astro/loaders";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function projectRelativePath(root: URL, filePath: string): string {
  return relative(fileURLToPath(root), filePath).split(sep).join("/");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function findMarkdownFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    throw new Error(`Unable to read blog content directory "${directory}": ${errorMessage(error)}`);
  }

  const files: string[] = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findMarkdownFiles(filePath));
    } else if (entry.name.endsWith(".md") && (entry.isFile() || entry.isSymbolicLink())) {
      files.push(filePath);
    }
  }

  return files;
}

export const blogLoader = {
  name: "local-blog-markdown",
  async load({ config, store, parseData, renderMarkdown, generateDigest, logger, watcher }) {
    const contentDirectory = fileURLToPath(new URL("content/blog/", config.srcDir));

    const sync = async () => {
      const files = await findMarkdownFiles(contentDirectory);
      if (files.length === 0) {
        logger.warn(`No Markdown files found in "${projectRelativePath(config.root, contentDirectory)}".`);
      }

      const slugs = new Map<string, string>();
      const articles = files.map((filePath) => {
        const articlePath = projectRelativePath(config.root, filePath);
        const slug = basename(filePath, ".md");
        if (!slugPattern.test(slug)) {
          throw new Error(
            `Invalid blog article filename "${articlePath}": the filename must match ${slugPattern}.`,
          );
        }

        const existingPath = slugs.get(slug);
        if (existingPath) {
          throw new Error(
            `Duplicate blog article slug "${slug}": "${existingPath}" and "${articlePath}" both resolve to the same article ID.`,
          );
        }
        slugs.set(slug, articlePath);

        return { filePath, articlePath, slug };
      });

      const entries = [];
      for (const article of articles) {
        let contents: string;
        try {
          contents = await readFile(article.filePath, "utf8");
        } catch (error) {
          throw new Error(`Unable to read blog article "${article.articlePath}": ${errorMessage(error)}`);
        }

        let rendered;
        try {
          rendered = await renderMarkdown(contents, { fileURL: pathToFileURL(article.filePath) });
        } catch (error) {
          throw new Error(`Unable to parse blog article "${article.articlePath}": ${errorMessage(error)}`);
        }

        const data = await parseData({
          id: article.slug,
          data: rendered.metadata?.frontmatter ?? {},
          filePath: article.filePath,
        });

        entries.push({
          id: article.slug,
          data,
          filePath: article.articlePath,
          digest: generateDigest(contents),
          rendered,
        });
      }

      store.clear();
      for (const entry of entries) store.set(entry);
    };

    await sync();

    if (watcher) {
      watcher.add(contentDirectory);
      let reloadQueue = Promise.resolve();
      const reload = (changedPath: string) => {
        const relativePath = relative(resolve(contentDirectory), resolve(changedPath));
        if (relativePath === "" || relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
          return;
        }

        reloadQueue = reloadQueue.then(sync).catch((error) => {
          logger.error(`Unable to reload blog articles after "${changedPath}": ${errorMessage(error)}`);
        });
      };

      watcher.on("add", reload);
      watcher.on("change", reload);
      watcher.on("unlink", reload);
    }
  },
} satisfies Loader;
