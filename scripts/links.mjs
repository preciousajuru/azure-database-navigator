import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const attributes = (html, name) => [...html.matchAll(new RegExp(`\\b${name}=["']([^"']*)["']`, 'gi'))].map((match) => match[1]);
const decode = (value) => value.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

export async function validateLocalLinks(root) {
  const pages = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name.endsWith('.html')) pages.push(file);
    }
  }
  await walk(root);
  const errors = [];
  const pageIds = new Map();
  for (const file of pages) {
    const html = await readFile(file, 'utf8');
    const ids = attributes(html, 'id');
    if (ids.length !== new Set(ids).size) errors.push(`${path.relative(root, file)} has duplicate anchors.`);
    pageIds.set(file, new Set(ids));
  }
  for (const file of pages) {
    const html = await readFile(file, 'utf8');
    for (const attribute of ['href', 'src']) {
      for (const reference of attributes(html, attribute).map(decode)) {
        if (/^(https?:|mailto:|data:)/i.test(reference)) continue;
        if (/^[a-z][a-z0-9+.-]*:/i.test(reference)) {
          errors.push(`${path.relative(root, file)} uses an unexpected URL scheme: ${reference}`);
          continue;
        }
        const url = new URL(reference, `https://local.invalid/${path.relative(root, file).split(path.sep).join('/')}`);
        let target = path.join(root, decodeURIComponent(url.pathname));
        if (url.pathname.endsWith('/')) target = path.join(target, 'index.html');
        try {
          if (!(await stat(target)).isFile()) throw new Error('Not a file');
          if (url.hash && !pageIds.get(target)?.has(decodeURIComponent(url.hash.slice(1)))) {
            errors.push(`${path.relative(root, file)} has a missing anchor: ${reference}`);
          }
          if (target.endsWith('.md') && !url.pathname.startsWith('/publication/')) {
            errors.push(`${path.relative(root, file)} links to raw Markdown: ${reference}`);
          }
        } catch {
          errors.push(`${path.relative(root, file)} has a missing local ${attribute}: ${reference}`);
        }
      }
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return pages.length;
}
