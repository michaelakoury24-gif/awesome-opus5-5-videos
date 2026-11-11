// Node renderer for the Lalo vs Gus essay.  usage:
//   node src/lalo/render.mjs stills 3,15,30,44,58,70,80,92,102,116
//   node src/lalo/render.mjs video
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'renders/lalo');
fs.mkdirSync(OUT, { recursive: true });

const fonts = [
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2', 'CormorantLight'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2', 'Cormorant'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2', 'CormorantMed'],
  ['@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2', 'CormorantBold'],
  ['@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2', 'Bebas'],
  ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'Glyph']
];
for (const [rel, name] of fonts) {
  const p = rel.startsWith('/') ? rel : path.join(ROOT, 'node_modules', rel);
  if (fs.existsSync(p)) GlobalFonts.registerFromPath(p, name);
  else console.warn('missing font', p);
}

const scene = require(path.join(ROOT, 'src/lalo/scene.js'));
const canvas = createCanvas(scene.W, scene.H);
const ctx = canvas.getContext('2d');

const mode = process.argv[2] || 'stills';
const times = (process.argv[3] || '3,15,30,44,58,70,80,92,102,116').split(',').map(Number);

if (mode === 'stills') {
  for (const t of times) {
    scene.draw(ctx, t);
    const file = path.join(OUT, `still-${String(t).replace('.', '_')}.png`);
    fs.writeFileSync(file, canvas.toBuffer('image/png'));
    console.log('wrote', file);
  }
}

if (mode === 'video') {
  const fps = 30;
  const frames = Math.round(scene.DURATION * fps);
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const out = path.join(OUT, 'lalo-vs-gus-silent.mp4');
  const args = ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${scene.W}x${scene.H}`,
    '-r', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out];
  const ff = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    scene.draw(ctx, f / fps);
    const buf = ctx.getImageData(0, 0, scene.W, scene.H).data;
    if (!ff.stdin.write(Buffer.from(buf))) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out);
}
