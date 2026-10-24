// 出片前检查：node scripts/check-edit.mjs edit.json
// 挡住最常见的错：忘了关安全区红框、版式 id 写错、视频 / 音效文件不存在、时间超出片长、durationSec 和视频实际时长对不上。
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const file = process.argv[2] ?? 'edit.json';
const fail = []; const warn = [];
let e;
try { e = JSON.parse(readFileSync(file, 'utf8')); } catch (err) { console.error(`✗ 读不了 ${file}：${err.message}`); process.exit(1); }

const regBlock = readFileSync('Edit.tsx', 'utf8').match(/const REG[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? '';
const kinds = [...regBlock.matchAll(/'?([a-z][a-z-]*)'?\s*:\s*[A-Z]/g)].map((m) => m[1]);
if (e.guides) fail.push('guides 还是 true：成片会带着安全区红框。改成 false 再出片（检查静帧时才开）。');
if (!e.durationSec) fail.push('缺 durationSec。');
for (const [i, b] of (e.beats ?? []).entries()) {
  if (!kinds.includes(b.kind)) fail.push(`beats[${i}].kind "${b.kind}" 不存在。可用：${kinds.join(', ')}`);
  const u = b.props?.until, a = b.props?.at;
  if (typeof u === 'number' && e.durationSec && u > e.durationSec + 0.3) warn.push(`beats[${i}] (${b.kind}) 的 until=${u} 超过片长 ${e.durationSec}`);
  if (typeof a === 'number' && typeof u === 'number' && u <= a) fail.push(`beats[${i}] (${b.kind}) 的 until(${u}) 不晚于 at(${a})，字一个都不会出现。`);
}
const wid = (t) => [...t].reduce((a, c) => a + (c === ' ' ? 0.3 : /[A-Za-z0-9%&@.\-+/]/.test(c) ? 0.55 : 1), 0);
for (const [i, c] of (e.captions ?? []).entries()) {
  if (!(c.to > c.from)) fail.push(`captions[${i}] 的 to(${c.to}) 不晚于 from(${c.from})`);
  if (e.durationSec && c.to > e.durationSec + 0.3) warn.push(`captions[${i}] 的 to=${c.to} 超过片长 ${e.durationSec}`);
  if (wid(c.text) > 12.5) fail.push(`captions[${i}] "${c.text}" 宽度 ${wid(c.text).toFixed(1)} > 12（字幕每行最多 12 字宽，见 SKILL.md §2）`);
  const nx = (e.captions ?? [])[i + 1];
  if (nx && nx.from < c.to - 0.01) warn.push(`captions[${i}] 和下一条时间重叠（${c.to} > ${nx.from}）`);
}
if (e.src) {
  const p = `public/${e.src}`;
  if (!existsSync(p)) fail.push(`找不到视频 ${p}`);
  else {
    try {
      const d = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).toString());
      if (Math.abs(d - e.durationSec) > 0.5) warn.push(`durationSec=${e.durationSec} 但视频实际 ${d.toFixed(2)} 秒`);
    } catch { warn.push('没有 ffprobe，没核对视频时长。'); }
  }
}
for (const s of e.sfx ?? []) if (!existsSync(`public/sfx/${s.file}`)) fail.push(`找不到音效 public/sfx/${s.file}`);

warn.forEach((w) => console.log(`! ${w}`));
if (fail.length) { fail.forEach((f) => console.error(`✗ ${f}`)); process.exit(1); }
console.log(`✓ ${file} 检查通过（${(e.beats ?? []).length} 个版式，${e.durationSec} 秒）`);
