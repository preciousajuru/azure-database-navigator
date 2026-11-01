import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Marked } from 'marked';
import { validateLocalLinks } from './links.mjs';
import { evidenceLinkIssues } from './validation.mjs';
import { sources } from '../src/data/sources.js';
import { publicDocs } from './publication.mjs';
import { sourceRegisterTable } from './source-register.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const preview = process.argv.includes('--preview');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'styles.css', 'src', ...(preview ? [] : ['screenshots'])]) {
  await cp(path.join(root, name), path.join(output, name), { recursive: true, force: true });
}
const escape = (text) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function renderMarkdown(markdown) {
  const ids = new Map();
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const base = text.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
        const count = ids.get(base) || 0;
        ids.set(base, count + 1);
        return `<h${depth} id="${base}${count ? `-${count}` : ''}">${text}</h${depth}>\n`;
      }
    }
  });
  const html = marked.parse(markdown).replace(/href="([^"]+)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
  const title = /^# (.+)$/m.exec(markdown)?.[1];
  if (!title) throw new Error('Published Markdown must have an H1 title.');
  return { html, title };
}

function page(title, content, stylesheet = '../styles.css', extra = '') {
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Azure Database Navigator</title>${stylesheet ? `<link rel="stylesheet" href="${stylesheet}">` : ''}${extra}</head>
<body><script>try { document.documentElement.dataset.theme = localStorage.getItem('azure-database-navigator-theme') === 'dark' ? 'dark' : 'light'; } catch {}</script><a class="skip-link" href="#main">Skip to content</a><main id="main" class="article-shell" tabindex="-1">
<a class="back-link" href="${stylesheet ? '../' : 'https://github.com/preciousajuru/azure-database-navigator'}">Azure Database Navigator</a><article class="article-content">${content}</article>
</main></body></html>`;
}

await mkdir(path.join(output, 'docs'));
for (const name of publicDocs) {
  if (preview && name === 'article.md') continue;
  const markdown = await readFile(path.join(root, 'docs', name), 'utf8') + (name === 'sources.md' ? sourceRegisterTable() : '');
  const issues = evidenceLinkIssues(markdown, sources);
  if (issues.length) throw new Error(`${name}: ${issues.join('\n')}`);
  const { html, title } = renderMarkdown(markdown);
  const articleMeta = name === 'article.md' ? `<p class="eyebrow">DATABASE DECISIONS · ${Math.ceil(markdown.split(/\s+/).length / 230)} MIN READ</p>` : '';
  await writeFile(path.join(output, 'docs', name.replace(/\.md$/, '.html')), page(title, articleMeta + html));
}

if (preview) {
  console.log('Preview-only app build for screenshot capture; article/publication validation is deferred to the full build.');
  process.exit(0);
}
await mkdir(path.join(output, 'publication'));
const article = await readFile(path.join(root, 'docs', 'article.md'), 'utf8');
const evidenceIssues = evidenceLinkIssues(article, sources);
if (evidenceIssues.length) throw new Error(evidenceIssues.join('\n'));
await writeFile(path.join(output, 'publication', 'article.md'), article);
const { html: articleHtml, title } = renderMarkdown(article);
const portable = await Promise.all([...articleHtml.matchAll(/src="(\.\.\/screenshots\/[^"]+)"/g)].map(async ([, reference]) => {
  const bytes = await readFile(path.join(output, 'publication', reference));
  return [reference, `data:image/png;base64,${bytes.toString('base64')}`];
}));
let portableHtml = articleHtml;
for (const [reference, encoded] of portable) portableHtml = portableHtml.replaceAll(reference, encoded);
const css = await readFile(path.join(root, 'styles.css'), 'utf8');
await writeFile(path.join(output, 'publication', 'article.html'), page(title, portableHtml, null, `<style>${css}</style>`));
const count = await validateLocalLinks(output);
console.log(`Built static site, rendered documentation and portable article; validated local links/anchors in ${count} HTML pages.`);
