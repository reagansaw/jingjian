// 只打包一次、渲多个版式库预览：node scripts/render-previews.mjs <输出目录> id1,id2,...     （id 不带 Craft- 前缀）
// 机器忙的话前面加 nice -n 19，CONCURRENCY=1。
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';

const [outDir, ids] = process.argv.slice(2);
if (!outDir || !ids) { console.error('用法: node scripts/render-previews.mjs <输出目录> id1,id2,...'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('index.ts'), publicDir: path.resolve('public') });
for (const id of ids.split(',')) {
  const composition = await selectComposition({ serveUrl, id: `Craft-${id}` });
  await renderMedia({ composition, serveUrl, codec: 'h264', crf: 16, concurrency: Number(process.env.CONCURRENCY ?? 1), outputLocation: path.join(outDir, `${id}.mp4`) });
  console.log('done', id);
}
