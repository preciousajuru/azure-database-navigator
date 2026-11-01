import { readFile, readdir } from 'node:fs/promises';
import { sources } from '../src/data/sources.js';

const root = new URL('../', import.meta.url);
const urls = new Set(sources.map((source) => source.url));
async function inspect(folder) {
  for (const item of await readdir(new URL(folder, root), { withFileTypes: true })) {
    const relative = `${folder}${item.name}`;
    if (item.isDirectory()) await inspect(`${relative}/`);
    else if (/\.(md|js|html)$/.test(item.name)) {
      for (const url of (await readFile(new URL(relative, root), 'utf8')).match(/https:\/\/[^\s"'<>`)\]]+/g) || []) urls.add(url);
    }
  }
}
await inspect('docs/');
await inspect('src/');
for (const name of ['index.html', 'README.md', 'CONTRIBUTING.md']) {
  for (const url of (await readFile(new URL(name, root), 'utf8')).match(/https:\/\/[^\s"'<>`)\]]+/g) || []) urls.add(url);
}
const queue = [...urls].sort();
const failures = [];
let checked = 0;
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000) });
      await response.body?.cancel();
      console.log(`${response.status} ${url}${response.url !== url ? ` -> ${response.url}` : ''}`);
      if (response.status !== 200) failures.push(`${response.status} ${url}`);
    } catch (error) {
      console.error(`ERROR ${url}: ${error.message}`);
      failures.push(`${url}: ${error.message}`);
    }
    checked++;
  }
}
await Promise.all(Array.from({ length: 4 }, () => worker()));
console.log(`External liveness: ${checked - failures.length}/${checked} URLs returned HTTP 200 after redirects; ${failures.length} failures.`);
if (failures.length) process.exitCode = 1;
