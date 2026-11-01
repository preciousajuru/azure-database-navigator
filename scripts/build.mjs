import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'styles.css', 'src', 'docs']) {
  await cp(path.join(root, name), path.join(output, name), { recursive: true, force: true });
}
console.log(`Static site copied to ${path.relative(root, output)}.`);
