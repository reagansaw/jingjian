// 一次打包、渲多张静帧：node scripts/stills.mjs edit.json 0.6,1.6,6.2 [输出目录=stills]
import path from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [propsFile = 'edit.json', times = '1', outDir = 'stills'] = process.argv.slice(2);
const inputProps = JSON.parse(readFileSync(propsFile, 'utf8'));
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('index.ts'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: 'Edit', inputProps });
for (const t of times.split(',').map(Number)) {
  const out = path.join(outDir, `t${String(t).replace('.', '_')}.jpg`);
  await renderStill({ composition, serveUrl, inputProps, output: out, frame: Math.round(t * 30), imageFormat: 'jpeg', jpegQuality: 85 });
  console.log(out);
}
