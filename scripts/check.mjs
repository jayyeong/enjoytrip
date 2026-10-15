import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
function files(dir) {
  return readdirSync(resolve(root, dir), {withFileTypes:true}).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? files(path) : [path];
  });
}
const sources = [...files('js'), ...files('01_api/js'), ...files('scripts')].filter(p => /\.(js|mjs)$/.test(p) && !p.endsWith('/keys.js'));
for (const path of sources) {
  const result = spawnSync(process.execPath, ['--check', resolve(root,path)], {encoding:'utf8'});
  if (result.status !== 0) throw Error(`Syntax error in ${path}: ${result.error?.message || result.stderr}`);
  const text = readFileSync(resolve(root,path),'utf8');
  for (const match of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    const target = resolve(dirname(resolve(root,path)),match[1]);
    if (!target.endsWith('/keys.js') && !target.endsWith('\\keys.js') && !existsSync(target)) throw Error(`Missing module: ${path} -> ${match[1]}`);
  }
}
const html = readFileSync(resolve(root,'index.html'),'utf8');
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const url = match[1];
  if (/^(https?:|\/\/|#)/.test(url)) continue;
  if (!existsSync(resolve(root,url))) throw Error(`Missing asset: ${url}`);
}
console.log(`Passed: ${sources.length} JavaScript files and HTML asset references.`);

