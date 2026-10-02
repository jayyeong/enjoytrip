import { mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const root = resolve(import.meta.dirname,'..');
const output = resolve(root,'dist');
// Only explicitly listed public files are included; local keys, PDFs and screenshots stay out.
const publicFiles = ['index.html','css/style.css','js/main.js','js/select.js','js/api.js','js/data.js','01_api/js/kakao.js','resources/coast.svg','resources/marker.png'];
for (const file of publicFiles) {
  const target = resolve(output,file);
  mkdirSync(dirname(target),{recursive:true});
  copyFileSync(resolve(root,file),target);
}
const keys = {
  DATA_GO_KR_API_KEY: process.env.DATA_GO_KR_API_KEY || '',
  KAKAO_MAP_KEY: process.env.KAKAO_MAP_KEY || ''
};
writeFileSync(resolve(output,'01_api/js/keys.js'),Object.entries(keys).map(([name,value])=>`export const ${name} = ${JSON.stringify(value)};`).join('\n')+'\n');
writeFileSync(resolve(output,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log('Built dist/ (API key values are not logged). Missing keys use the labelled sample mode.');
