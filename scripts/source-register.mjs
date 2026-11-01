import { sources } from '../src/data/sources.js';

export function sourceRegisterTable() {
  const cell = (text) => String(text).replaceAll('|', '\\|').replaceAll('\n', ' ');
  return '\n\n| ID / official source | Source date | Verified | Evidence summary | Limitations |\n|---|---|---|---|---|\n' +
    sources.map((source) => `| \`${source.id}\` [${cell(source.title)}](${source.url}) | ${cell(source.published)} | ${source.verifiedOn} | ${cell(source.evidence)} | ${cell(source.limitation)} |`).join('\n');
}
