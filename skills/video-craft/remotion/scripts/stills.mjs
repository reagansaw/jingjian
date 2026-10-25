// 一次打包、渲多张静帧。
//   Edit 的多个时间点：  node scripts/stills.mjs edit.json 0.6,1.8,6.2 [输出目录=stills]
//   版式库里的合成：      node scripts/stills.mjs - '[["Craft-camera-punch",0.6],["Craft-stamp",1.5]]' [输出目录]
import path from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const [propsFile = 'edit.json', times = '1', outDir = 'stills'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('index.ts'), publicDir: path.resolve('public') });
const shots = times.startsWith('[') ? JSON.parse(times) : times.split(',').map((t) => ['Edit', Number(t)]);
const inputProps = propsFile !== '-' ? JSON.parse(readFileSync(propsFile, 'utf8')) : undefined;
const comps = {};
for (const [id, t] of shots) {
  const props = id === 'Edit' ? inputProps : undefined;
  comps[id] ??= await selectComposition({ serveUrl, id, inputProps: props });
  const out = path.join(outDir, `${id === 'Edit' ? '' : id + '_'}t${String(t).replace('.', '_')}.jpg`);
  await renderStill({ composition: comps[id], serveUrl, inputProps: props, output: out, frame: Math.round(t * 30), imageFormat: 'jpeg', jpegQuality: 85 });
  console.log(out);
}
