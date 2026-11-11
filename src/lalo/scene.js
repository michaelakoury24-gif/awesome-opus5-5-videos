// Lalo vs Gus — 2:00 vertical video essay.
// Dark cinematic essay style: Cormorant Garamond display type, Bebas labels,
// slow pushes, hard cuts, hairline rules, film grain. 1080x1920.
const W = 1080;
const H = 1920;
const DURATION = 120;

const C = {
  bg: '#07080A',
  paper: '#F1EADA',
  muted: '#9C9486',
  faint: '#6B655B',
  hair: 'rgba(241,234,218,0.13)',
  steel: '#A9C6C0',
  steelDeep: '#3C6A64',
  amber: '#E9B44C',
  rust: '#B4472F',
  ink: '#040506'
};

const F = {
  light: 'CormorantLight',
  reg: 'Cormorant',
  med: 'CormorantMed',
  bold: 'CormorantBold',
  label: 'Bebas'
};

// ---------------------------------------------------------------- helpers
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const outCubic = (p) => 1 - Math.pow(1 - p, 3);
const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const ease = (t, start, dur = 0.6) => outCubic(clamp((t - start) / dur));

// fade in at `a`, out at `b` (0 = instant edge)
function win(t, a, b, dur = 0.5) {
  let v = 1;
  if (a > 0) v *= ease(t, a, dur);
  if (b < 99) v *= 1 - ease(t, b, dur);
  return clamp(v);
}
const rise = (p, dist = 22) => (1 - p) * dist;

function prime(ctx, txt, size, family, style = 'normal', spacing = 0) {
  ctx.font = `${style} ${size}px ${family}`;
  if (!spacing) return ctx.measureText(txt).width;
  let w = 0;
  for (const ch of txt) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

// rich single-line text: runs = [{t, c, family, style, size}]
function rich(ctx, runs, o = {}) {
  const {
    x = W / 2, y = H / 2, size = 90, family = F.reg, style = 'normal',
    align = 'center', alpha = 1, spacing = 0, scale = 1, shadow = 0, maxW = W - 168
  } = o;
  if (alpha <= 0.002) return 0;
  const fs = size * scale;
  const widths = runs.map((r) => prime(ctx, r.t, r.size ? r.size * scale : fs, r.family || family, r.style || style, spacing));
  let total = widths.reduce((a, b) => a + b, 0);
  const fit = total > maxW ? maxW / total : 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.textBaseline = 'alphabetic';
  if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = shadow; }
  let cx = align === 'center' ? x - (total * fit) / 2 : align === 'right' ? x - total * fit : x;
  runs.forEach((r, i) => {
    const s = (r.size ? r.size * scale : fs) * fit;
    ctx.font = `${r.style || style} ${s}px ${r.family || family}`;
    ctx.fillStyle = r.c || o.color || C.paper;
    if (spacing) {
      let cc = cx;
      const sp = spacing * fit;
      for (const ch of r.t) { ctx.fillText(ch, cc, y); cc += ctx.measureText(ch).width + sp; }
    } else {
      ctx.fillText(r.t, cx, y);
    }
    cx += widths[i] * fit;
  });
  ctx.restore();
  return total * fit;
}

function rule(ctx, x1, x2, y, alpha = 1, color = C.hair) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(x1, Math.round(y) + 0.5);
  ctx.lineTo(x2, Math.round(y) + 0.5);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- textures
let grainTile = null;
function makeGrain() {
  const s = 256;
  const g = require('@napi-rs/canvas').createCanvas(s, s);
  const gx = g.getContext('2d');
  const img = gx.createImageData(s, s);
  let seed = 991;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rnd() - 0.5) * 190;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  gx.putImageData(img, 0, 0);
  return g;
}

function grain(ctx, t, amount = 0.045) {
  if (!grainTile) grainTile = makeGrain();
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  const ox = (t * 137) % 256;
  const oy = (t * 91) % 256;
  for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) ctx.drawImage(grainTile, x, y);
  ctx.restore();
}

let vignette = null;
function vig(ctx) {
  if (!vignette) {
    const g = require('@napi-rs/canvas').createCanvas(W, H);
    const gx = g.getContext('2d');
    const grd = gx.createRadialGradient(W / 2, H * 0.46, H * 0.16, W / 2, H * 0.5, H * 0.78);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.62, 'rgba(0,0,0,0.24)');
    grd.addColorStop(1, 'rgba(0,0,0,0.72)');
    gx.fillStyle = grd;
    gx.fillRect(0, 0, W, H);
    vignette = g;
  }
  ctx.drawImage(vignette, 0, 0);
}

function wash(ctx, color, alpha, cx = W / 2, cy = H * 0.42, r = 900) {
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grd.addColorStop(0, color);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------------------------------------------------------------- motifs
function chessKing(ctx, x, y, h, color, alpha, sway = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.translate(x + Math.sin(sway) * 6, y);
  const s = h / 320;
  ctx.scale(s, s);
  // cross
  ctx.beginPath(); ctx.moveTo(0, -320); ctx.lineTo(0, -262); ctx.moveTo(-22, -292); ctx.lineTo(22, -292); ctx.stroke();
  // crown
  ctx.beginPath();
  ctx.moveTo(-78, -232); ctx.lineTo(78, -232); ctx.lineTo(58, -170); ctx.lineTo(-58, -170); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-78, -232); ctx.lineTo(-96, -262); ctx.moveTo(78, -232); ctx.lineTo(96, -262); ctx.stroke();
  // neck
  ctx.beginPath(); ctx.moveTo(-30, -170); ctx.lineTo(-38, -96); ctx.moveTo(30, -170); ctx.lineTo(38, -96); ctx.stroke();
  // shoulders + body
  ctx.beginPath();
  ctx.moveTo(-38, -96); ctx.bezierCurveTo(-96, -60, -104, 20, -86, 62);
  ctx.lineTo(86, 62); ctx.bezierCurveTo(104, 20, 96, -60, 38, -96); ctx.closePath(); ctx.stroke();
  // base
  ctx.beginPath(); ctx.moveTo(-104, 62); ctx.lineTo(104, 62); ctx.lineTo(114, 92); ctx.lineTo(-114, 92); ctx.closePath(); ctx.stroke();
  ctx.restore();
}

function clockFace(ctx, cx, cy, r, t, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.22;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const big = i % 5 === 0;
    const r1 = r * (big ? 0.86 : 0.92);
    ctx.globalAlpha = big ? 0.55 : 0.2;
    ctx.lineWidth = big ? 2.4 : 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * (r * 0.98), cy + Math.sin(a) * (r * 0.98));
    ctx.stroke();
  }
  // hands: slow, relentless
  const ha = (t / 24) * Math.PI * 2 - Math.PI / 2;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * r * 0.62, cy + Math.sin(ha) * r * 0.62); ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  const mb = ha * 12;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(mb) * r * 0.82, cy + Math.sin(mb) * r * 0.82); ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

function doorway(ctx, cx, cy, w, h, open, color) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.save();
  // light spill
  const grd = ctx.createRadialGradient(cx, cy + h * 0.1, 8, cx, cy + h * 0.1, w * (1.1 + open * 1.5));
  grd.addColorStop(0, 'rgba(233,180,76,0.55)');
  grd.addColorStop(0.45, 'rgba(180,71,47,0.18)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.35 + open * 0.5;
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  // frame
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  // open door leaf, swinging inward
  const ang = open * 1.05;
  const leafW = w * 0.9;
  const farX = x + 6 + Math.cos(ang) * leafW;
  const squash = Math.sin(ang) * leafW * 0.22;
  ctx.globalAlpha = 0.34;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 8);
  ctx.lineTo(farX, y + 8 + squash);
  ctx.lineTo(farX, y + h - 8 - squash);
  ctx.lineTo(x + 6, y + h - 8);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function bricks(ctx, x, y, w, h, color, alpha, crack = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  const rows = 7;
  const bh = h / rows;
  for (let r = 0; r < rows; r++) {
    ctx.beginPath(); ctx.moveTo(x, y + r * bh); ctx.lineTo(x + w, y + r * bh); ctx.stroke();
    const cols = r % 2 ? 4 : 5;
    const off = r % 2 ? w / 8 : 0;
    for (let c = 0; c <= cols; c++) {
      const bx = x + off + (c * w) / cols;
      if (bx <= x + 1 || bx >= x + w - 1) continue;
      ctx.beginPath(); ctx.moveTo(bx, y + r * bh); ctx.lineTo(bx, y + (r + 1) * bh); ctx.stroke();
    }
  }
  ctx.strokeRect(x, y, w, h);
  if (crack > 0) {
    ctx.globalAlpha = alpha * crack * 1.5;
    ctx.strokeStyle = C.paper;
    ctx.lineWidth = 1.6;
    const endY = y + h * crack;
    let px = x + w * 0.54;
    let py = y + 2;
    let flip = 1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    while (py < endY) {
      py += 22 + (flip > 0 ? 12 : 4);
      px += flip * (5 + (py % 3) * 4);
      flip *= -1;
      ctx.lineTo(px, Math.min(py, endY));
    }
    ctx.stroke();
    // hairline branches
    ctx.globalAlpha = alpha * crack * 0.7;
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const by = y + (h * crack * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.54, by);
      ctx.lineTo(x + w * 0.54 + (i % 2 ? 46 : -46), by + 34);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function planGrid(ctx, t, shatter, cx, cy, size, color) {
  const n = 6;
  const step = size / (n - 1);
  const pts = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dx = (i - (n - 1) / 2) * step;
      const dy = (j - (n - 1) / 2) * step;
      const k = Math.max(0, shatter - (Math.abs(i - j) * 0.03) - 0.1) * 0.72;
      const wob = Math.sin(i * 3.1 + j * 1.7 + t * 6) * k * 70;
      const wob2 = Math.cos(i * 1.3 + j * 2.9 + t * 5) * k * 70;
      pts.push({ x: cx + dx + wob, y: cy + dy + wob2, k, i, j });
    }
  }
  ctx.save();
  for (const p of pts) {
    for (const q of pts) {
      if ((q.i === p.i && q.j === p.j + 1) || (q.j === p.j && q.i === p.i + 1)) {
        const broken = Math.max(p.k, q.k) / 1.44;
        ctx.globalAlpha = (0.30 + (1 - broken) * 0.26) * (1 - broken * 0.72);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
  }
  for (const p of pts) {
    ctx.globalAlpha = 0.8 - p.k * 0.45;
    ctx.fillStyle = p.k > 0.3 ? C.amber : color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4 - p.k * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function phone(ctx, cx, cy, s, phase, color) {
  ctx.save();
  ctx.translate(cx, cy);
  const shake = Math.sin(phase * 42) * 5 * Math.min(1, phase);
  ctx.rotate(-0.06 + shake * 0.006);
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  const w = s * 0.52;
  const h = s;
  // rounded rect phone
  const r = 18;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r);
  ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r);
  ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r);
  ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r);
  ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.16, -h * 0.44); ctx.lineTo(w * 0.16, -h * 0.44); ctx.stroke();
  // ring waves
  for (let i = 0; i < 3; i++) {
    const p = ((phase * 0.9 + i / 3) % 1);
    ctx.globalAlpha = (1 - p) * 0.5;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, w * 0.62 + p * s * 0.75, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function smile(ctx, cx, cy, r, p, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  const a0 = Math.PI * 0.18;
  const a1 = Math.PI * 0.82;
  const a = a0 + (a1 - a0) * clamp(p);
  ctx.globalAlpha = 0.9;
  ctx.beginPath(); ctx.arc(cx, cy, r, a0, a); ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx - r * 0.42, cy - r * 0.42, 4, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.42, cy - r * 0.42, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- beats
const BEATS = [
  { t0: 0, roman: 'I', title: 'THE HOOK', accent: C.amber },
  { t0: 12, roman: 'II', title: 'THE CASE FOR GUS', accent: C.steel },
  { t0: 24, roman: 'III', title: 'PROCEDURAL MENACE', accent: C.steel },
  { t0: 36, roman: 'IV', title: 'THE ENTRANCE', accent: C.amber },
  { t0: 48, roman: 'V', title: 'CAMOUFLAGE', accent: C.amber },
  { t0: 60, roman: 'VI', title: 'IMPROVISATION', accent: C.amber },
  { t0: 72, roman: 'VII', title: 'THE AUDIENCE PROBLEM', accent: C.rust },
  { t0: 84, roman: 'VIII', title: 'WALL & DOOR', accent: C.amber },
  { t0: 96, roman: 'IX', title: 'THE THREAT', accent: C.amber },
  { t0: 108, roman: 'X', title: 'THE VERDICT', accent: C.amber }
];

const CAPTIONS = [
  [0.7, 4.2, 'GUS FRING IS THE GREATEST VILLAIN ON TELEVISION'],
  [4.4, 7.6, "HE'S ALSO THE MOST PREDICTABLE MAN IN IT"],
  [7.8, 11.8, 'THE BETTER ANTAGONIST IS THE ONE WHO SMILES'],
  [12.4, 16.0, 'GIVE GUS HIS DUE: PATIENT. SURGICAL.'],
  [16.2, 19.8, 'HE WINS BECAUSE HE NEVER IMPROVISES'],
  [20.0, 23.8, "EVERY SCENE IS A CHESS GAME HE'S ALREADY SOLVED"],
  [24.4, 28.2, 'A VILLAIN YOU CAN SET YOUR WATCH BY'],
  [28.4, 31.6, 'STOPS BEING SCARY AND STARTS BEING WEATHER'],
  [31.8, 35.8, "YOU DON'T FEAR GUS. YOU SCHEDULE AROUND HIM"],
  [36.5, 39.2, 'THEN LALO WALKS INTO A KITCHEN'],
  [39.4, 42.4, 'EATS YOUR FOOD. TELLS YOU A STORY.'],
  [42.6, 47.6, 'THE MOST DANGEROUS MAN IN THE ROOM IS THE ONE LAUGHING'],
  [48.4, 51.4, 'CHARM IS HIS CAMOUFLAGE'],
  [51.6, 55.2, 'GUS HIDES BEHIND A BUSINESS. LALO HIDES BEHIND A SMILE'],
  [60.4, 63.8, "AND TRAPS DON'T FOLLOW PLANS"],
  [64.0, 66.8, 'GUS BUILDS A MACHINE'],
  [67.0, 71.6, 'LALO KICKS THE DOOR IN. THE MACHINE EATS ITSELF.'],
  [72.4, 75.8, "THAT'S WHY YOU LIKE HIM. YOU SHOULDN'T."],
  [76.0, 79.4, "HE'S MONSTROUS. HE'S ALSO ALIVE IN EVERY FRAME."],
  [79.6, 83.6, "THE SHOW KNOWS YOU'RE ROOTING FOR THE WOLF"],
  [84.4, 87.6, 'GUS IS A WALL. YOU BREAK AGAINST HIM.'],
  [87.8, 91.4, 'LALO IS A DOOR. HE OPENS POLITELY.'],
  [91.6, 95.6, 'AND CLOSES BEHIND YOU'],
  [96.4, 100.0, 'GUS THREATENS YOUR PLAN. LALO THREATENS YOU.'],
  [100.2, 102.8, 'ONE MAKES YOU CAREFUL'],
  [103.0, 107.6, 'THE OTHER MAKES YOU AFRAID TO ANSWER'],
  [108.4, 111.4, 'BETTER VILLAIN: GUS FRING'],
  [111.6, 114.8, 'BETTER ANTAGONIST: LALO SALAMANCA'],
  [115.0, 119.6, "YOU CAN'T OUT-SMILE A MAN WHO HAS ALREADY DECIDED"]
];

function drawCaptions(ctx, t) {
  for (const [a, b, text] of CAPTIONS) {
    if (t < a || t > b) continue;
    const p = Math.min(ease(t, a, 0.28), 1 - ease(t, b, 0.22));
    if (p <= 0.01) continue;
    // wrap into at most two lines
    const maxW = W - 190;
    const size = 40;
    const words = text.split(' ');
    const lines = [''];
    for (const w of words) {
      const cand = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w;
      if (prime(ctx, cand, size, F.label, 'normal', 2.4) > maxW && lines[lines.length - 1]) lines.push(w);
      else lines[lines.length - 1] = cand;
    }
    const baseY = lines.length > 1 ? 1682 : 1706;
    lines.forEach((ln, i) => {
      ctx.save();
      ctx.globalAlpha = p;
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 14;
      rich(ctx, [{ t: ln, c: C.paper }], {
        y: baseY + i * 52, size, family: F.label, spacing: 2.4, alpha: 1, shadow: 10
      });
      ctx.restore();
    });
  }
}

function drawChrome(ctx, t) {
  // chapter marker
  const beat = BEATS.reduce((a, b) => (t >= b.t0 ? b : a), BEATS[0]);
  const k = win(t, 0.4, 99, 0.6);
  if (k > 0.01) {
    ctx.save();
    ctx.globalAlpha = k * 0.55;
    rich(ctx, [{ t: beat.roman, c: C.paper }], { x: 84, y: 148, size: 26, family: F.label, align: 'left', spacing: 4 });
    rich(ctx, [{ t: beat.title, c: C.muted }], { x: 84, y: 186, size: 19, family: F.label, align: 'left', spacing: 3.4, alpha: 0.9 });
    ctx.restore();
  }
  // segment progress
  const segW = (W - 168 - 9 * 10) / 10;
  for (let i = 0; i < 10; i++) {
    const x = 84 + i * (segW + 10);
    const b = BEATS[i];
    const next = i < 9 ? BEATS[i + 1].t0 : DURATION;
    const p = clamp((t - b.t0) / (next - b.t0));
    ctx.save();
    ctx.fillStyle = 'rgba(241,234,218,0.16)';
    ctx.fillRect(x, 1846, segW, 2);
    ctx.fillStyle = b.accent;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x, 1846, segW * p, 2);
    ctx.restore();
  }
}

function beat1(ctx, t) {
  const a1 = Math.min(win(t, 0.9, 4.9, 0.7), 1);
  rich(ctx, [{ t: 'A VIDEO ESSAY IN TEN PARTS', c: C.muted }], { y: 700, size: 24, family: F.label, spacing: 7, alpha: win(t, 0.3, 11.4, 0.8) });
  rich(ctx, [{ t: 'Gus Fring is the greatest', c: C.paper }], { y: 900, size: 108, family: F.med, alpha: a1, scale: 1 + (1 - a1) * 0.02 });
  rich(ctx, [{ t: 'villain television', c: C.paper }], { y: 1018, size: 108, family: F.med, alpha: a1 });
  rich(ctx, [{ t: 'has ever produced.', c: C.paper }], { y: 1136, size: 108, family: F.med, alpha: a1 });
  rule(ctx, W / 2 - 120, W / 2 + 120, 1206, a1 * 0.8);

  const a2 = win(t, 5.4, 9.0, 0.6);
  rich(ctx, [
    { t: 'He is also the most ', c: C.muted },
    { t: 'predictable', c: C.steel },
    { t: ' man in it.', c: C.muted }
  ], { y: 980, size: 92, family: F.light, alpha: a2 });

  const a3 = win(t, 9.3, 99, 0.7);
  rich(ctx, [{ t: 'which is why the better antagonist', c: C.muted }], { y: 930, size: 54, family: F.light, alpha: a3 });
  rich(ctx, [{ t: 'is the one who ', c: C.paper }, { t: 'smiles.', c: C.amber }], { y: 1090, size: 138, family: F.med, alpha: a3 });
}

function beat2(ctx, t) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = C.steel;
  ctx.font = '760px Glyph';
  ctx.textAlign = 'center';
  ctx.fillText('\u265A', 828 + Math.sin(t * 0.5) * 5, 1350);
  ctx.restore();
  const items = [['PATIENT.', 0.5], ['SURGICAL.', 1.9], ['FIVE MOVES AHEAD.', 3.3]];
  items.forEach(([txt, at], i) => {
    const p = ease(t, 12 + at, 0.6);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(0, rise(p, 26));
    rich(ctx, [{ t: txt, c: C.paper }], { x: 84, y: 668 + i * 166, size: 104, family: F.label, align: 'left', spacing: 2 });
    ctx.restore();
    rule(ctx, 84, 470, 700 + i * 166, p * 0.9);
  });
  const p2 = ease(t, 18.4, 0.8);
  rich(ctx, [{ t: 'He wins because he', c: C.muted }], { x: 84, y: 1290, size: 54, family: F.light, align: 'left', alpha: p2 });
  rich(ctx, [{ t: 'never improvises.', c: C.steel }], { x: 84, y: 1352, size: 54, family: F.light, align: 'left', alpha: p2 });
  const p3 = ease(t, 21.2, 0.8);
  rich(ctx, [{ t: "Every scene is a chess game", c: C.faint }], { x: 84, y: 1462, size: 38, family: F.light, align: 'left', alpha: p3 });
  rich(ctx, [{ t: "he's already solved.", c: C.faint }], { x: 84, y: 1510, size: 38, family: F.light, align: 'left', alpha: p3 });
}

function beat3(ctx, t) {
  clockFace(ctx, W / 2, 900, 300, t - 24, C.steel);
  rich(ctx, [{ t: 'A VILLAIN YOU CAN SET YOUR WATCH BY', c: C.muted }], { y: 470, size: 30, family: F.label, spacing: 5, alpha: win(t, 24.4, 99, 0.7) });
  const p1 = ease(t, 27.6, 0.7);
  rich(ctx, [{ t: 'stops being scary', c: C.paper }], { y: 1360, size: 88, family: F.light, alpha: p1 });
  const p2 = ease(t, 29.4, 0.7);
  rich(ctx, [{ t: 'and starts being ', c: C.paper }, { t: 'weather.', c: C.steel }], { y: 1452, size: 88, family: F.light, alpha: p2 });
  const p3 = ease(t, 32.0, 0.8);
  rich(ctx, [{ t: "You don't fear Gus.", c: C.muted }], { y: 1548, size: 44, family: F.light, alpha: p3 });
  rich(ctx, [{ t: 'You schedule around him.', c: C.amber }], { y: 1604, size: 44, family: F.light, alpha: p3 });
}

function beat4(ctx, t) {
  const open = clamp((t - 36) / 9);
  doorway(ctx, W / 2, 800, 440, 700, open, C.amber);
  const seq = [
    ['HE WALKS IN.', 36.3, 39.0],
    ['HE EATS YOUR FOOD.', 39.2, 42.0],
    ['HE TELLS A STORY.', 42.2, 44.9]
  ];
  seq.forEach(([txt, a, b]) => {
    const p = win(t, a, b, 0.35);
    if (p <= 0.01) return;
    rich(ctx, [{ t: txt, c: C.paper }], { y: 1300, size: 82, family: F.label, spacing: 1.5, alpha: p });
  });
  const p4 = ease(t, 45.2, 0.6);
  rich(ctx, [{ t: 'AND THE MOST DANGEROUS MAN IN THE ROOM', c: C.muted }], { y: 1290, size: 26, family: F.label, spacing: 4, alpha: p4 });
  const p5 = ease(t, 46.3, 0.7);
  rich(ctx, [{ t: 'is the one ', c: C.paper }, { t: 'laughing.', c: C.amber }], { y: 1400, size: 108, family: F.med, alpha: p5 });
}

function beat5(ctx, t) {
  // split panels
  ctx.save();
  const g1 = ctx.createLinearGradient(0, 0, W / 2, 0);
  g1.addColorStop(0, 'rgba(169,198,192,0.11)');
  g1.addColorStop(1, 'rgba(169,198,192,0.01)');
  const g2 = ctx.createLinearGradient(W, 0, W / 2, 0);
  g2.addColorStop(0, 'rgba(233,180,76,0.13)');
  g2.addColorStop(1, 'rgba(233,180,76,0.01)');
  for (const [g, x0] of [[g1, 0], [g2, W / 2]]) {
    ctx.fillStyle = g;
    ctx.fillRect(x0, 400, W / 2, 1180);
    // fade the panel into the caption band
    const fade = ctx.createLinearGradient(0, 1320, 0, 1580);
    fade.addColorStop(0, 'rgba(7,8,10,0)');
    fade.addColorStop(1, 'rgba(7,8,10,0.96)');
    ctx.fillStyle = fade;
    ctx.fillRect(x0, 1320, W / 2, 260);
  }
  ctx.restore();
  rule(ctx, W / 2, W / 2, 0, 1);
  ctx.save();
  ctx.strokeStyle = 'rgba(241,234,218,0.18)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(W / 2 + 0.5, 420); ctx.lineTo(W / 2 + 0.5, 1520); ctx.stroke();
  ctx.restore();

  const a = ease(t, 48.3, 0.7);
  rich(ctx, [{ t: 'GUS', c: C.steel }], { x: 270, y: 620, size: 78, family: F.label, spacing: 8, alpha: a });
  rich(ctx, [{ t: 'hides behind a business.', c: C.muted }], { x: 270, y: 690, size: 30, family: F.light, alpha: a });
  // cup
  ctx.save();
  ctx.globalAlpha = a * 0.7;
  ctx.strokeStyle = C.steel;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(210, 800); ctx.lineTo(330, 800); ctx.lineTo(318, 980); ctx.lineTo(222, 980); ctx.closePath();
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(210, 800); ctx.lineTo(270, 760); ctx.lineTo(330, 800); ctx.stroke();
  ctx.beginPath(); ctx.arc(270, 880, 34, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  const b = ease(t, 49.1, 0.7);
  rich(ctx, [{ t: 'LALO', c: C.amber }], { x: 810, y: 620, size: 78, family: F.label, spacing: 8, alpha: b });
  rich(ctx, [{ t: 'hides behind a smile.', c: C.muted }], { x: 810, y: 690, size: 30, family: F.light, alpha: b });
  smile(ctx, 810, 880, 76, (t - 49) * 1.2, C.amber);

  const p = ease(t, 53.4, 0.7);
  rule(ctx, 340, 740, 1352, p * 0.8);
  const p2 = ease(t, 54.0, 0.7);
  rich(ctx, [{ t: 'ONE IS A COSTUME.', c: C.paper }], { y: 1430, size: 58, family: F.light, alpha: p2 });
  const p3 = ease(t, 55.6, 0.7);
  rich(ctx, [{ t: 'THE OTHER IS A ', c: C.paper }, { t: 'TRAP.', c: C.rust }], { y: 1508, size: 58, family: F.light, alpha: p3 });
}

function beat6(ctx, t) {
  const shatter = clamp((t - 64.2) / 1.6);
  planGrid(ctx, t, shatter, W / 2, 990, 620, C.steel);
  const p1 = ease(t, 60.5, 0.7);
  rich(ctx, [{ t: 'GUS BUILDS A MACHINE.', c: C.steel }], { y: 520, size: 44, family: F.label, spacing: 5, alpha: p1 });
  const p2 = ease(t, 64.4, 0.6);
  rich(ctx, [{ t: 'LALO KICKS THE DOOR IN.', c: C.amber }], { y: 592, size: 44, family: F.label, spacing: 5, alpha: p2 });
  // amber slash
  const sp = clamp((t - 64.2) / 0.9);
  if (sp > 0) {
    ctx.save();
    ctx.globalAlpha = 0.75 * (1 - clamp((t - 66.5) / 1.5));
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(210, 1290);
    ctx.lineTo(210 + 660 * sp, 1290 - 660 * sp);
    ctx.stroke();
    ctx.restore();
  }
  const p3 = ease(t, 68.4, 0.7);
  rich(ctx, [{ t: 'AND THE MACHINE', c: C.paper }], { y: 1452, size: 64, family: F.light, alpha: p3 });
  rich(ctx, [{ t: 'EATS ITSELF.', c: C.paper }], { y: 1524, size: 64, family: F.light, alpha: p3 });
}

function beat7(ctx, t) {
  // rising hearts
  for (let i = 0; i < 26; i++) {
    const seed = i * 37.1;
    const y0 = 1500 - ((t - 72) * (40 + (i % 5) * 26) + seed * 7) % 1200;
    const x = 140 + ((seed * 53) % 800) + Math.sin(t * 0.7 + i) * 26;
    ctx.save();
    ctx.globalAlpha = 0.20 + (i % 4) * 0.09;
    ctx.fillStyle = i % 3 ? C.amber : C.rust;
    ctx.beginPath(); ctx.arc(x, y0, 5 + (i % 3) * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  const p = ease(t, 72.5, 0.7);
  rich(ctx, [{ t: 'YOU LIKE HIM.', c: C.paper }], { y: 900, size: 124, family: F.label, spacing: 2, alpha: p });
  const p2 = ease(t, 73.2, 0.6);
  rich(ctx, [{ t: '180,510', c: C.amber }], { x: W / 2, y: 985, size: 30, family: F.label, spacing: 4, alpha: p2 * 0.9 });
  const p3 = ease(t, 75.8, 0.6);
  rich(ctx, [{ t: "YOU SHOULDN'T.", c: C.rust }], { y: 1105, size: 62, family: F.label, spacing: 3, alpha: p3 });
  const p4 = ease(t, 78.4, 0.7);
  rich(ctx, [{ t: "He's monstrous.", c: C.muted }], { y: 1265, size: 46, family: F.light, alpha: p4 });
  rich(ctx, [{ t: "He's also alive in every frame.", c: C.muted }], { y: 1322, size: 46, family: F.light, alpha: p4 });
  const p5 = ease(t, 81.0, 0.7);
  rich(ctx, [{ t: "THE SHOW KNOWS YOU'RE ROOTING FOR THE WOLF", c: C.amber }], { y: 1450, size: 28, family: F.label, spacing: 4, alpha: p5 });
}

function beat8(ctx, t) {
  bricks(ctx, 128, 690, 380, 520, C.steel, 0.55, clamp((t - 87) / 3));
  const open = clamp((t - 86) / 6);
  doorway(ctx, 794, 950, 316, 520, open * 0.8, C.amber);

  const p = ease(t, 84.4, 0.7);
  rich(ctx, [{ t: 'GUS IS A WALL.', c: C.steel }], { y: 1300, size: 56, family: F.label, spacing: 4, alpha: p });
  rich(ctx, [{ t: 'you break against him', c: C.faint }], { y: 1352, size: 26, family: F.label, spacing: 3, alpha: p * 0.9 });
  const p2 = ease(t, 87.8, 0.7);
  rich(ctx, [{ t: 'LALO IS A DOOR.', c: C.amber }], { y: 1440, size: 56, family: F.label, spacing: 4, alpha: p2 });
  const p3 = ease(t, 90.8, 0.8);
  rich(ctx, [{ t: 'He opens politely, invites you in,', c: C.paper }], { y: 1520, size: 42, family: F.light, alpha: p3 });
  const p4 = ease(t, 92.4, 0.7);
  rich(ctx, [{ t: 'and closes behind you.', c: C.paper }], { y: 1576, size: 42, family: F.light, alpha: p4 });
}

function beat9(ctx, t) {
  phone(ctx, W / 2, 830, 230, clamp((t - 96) / 10), C.amber);
  const p = ease(t, 96.6, 0.6);
  rich(ctx, [{ t: 'GUS THREATENS YOUR PLAN.', c: C.steel }], { y: 1240, size: 44, family: F.label, spacing: 4, alpha: p });
  const p2 = ease(t, 100.2, 0.6);
  rich(ctx, [{ t: 'LALO THREATENS YOU.', c: C.amber }], { y: 1330, size: 44, family: F.label, spacing: 4, alpha: p2 });
  const p3 = ease(t, 103.0, 0.7);
  rich(ctx, [{ t: 'One makes you careful.', c: C.muted }], { y: 1450, size: 46, family: F.light, alpha: p3 });
  const p4 = ease(t, 104.6, 0.7);
  rich(ctx, [{ t: 'The other makes you', c: C.paper }], { y: 1530, size: 50, family: F.light, alpha: p4 });
  rich(ctx, [{ t: 'afraid to answer.', c: C.amber }], { y: 1590, size: 50, family: F.light, alpha: p4 });
}

function beat10(ctx, t) {
  const p = ease(t, 108.4, 0.7);
  rich(ctx, [{ t: 'BETTER VILLAIN', c: C.muted }], { x: 84, y: 470, size: 24, family: F.label, spacing: 6, align: 'left', alpha: p });
  const p1 = ease(t, 108.8, 0.7);
  rich(ctx, [{ t: 'GUS FRING', c: C.steel }], { x: 84, y: 560, size: 82, family: F.label, spacing: 3, align: 'left', alpha: p1 });
  rule(ctx, 84, W - 84, 600, p1 * 0.8);

  const p2 = ease(t, 111.6, 0.7);
  rich(ctx, [{ t: 'BETTER ANTAGONIST', c: C.muted }], { x: 84, y: 700, size: 24, family: F.label, spacing: 6, align: 'left', alpha: p2 });
  const p3 = ease(t, 112.0, 0.7);
  rich(ctx, [{ t: 'LALO SALAMANCA', c: C.amber }], { x: 84, y: 800, size: 96, family: F.label, spacing: 3, align: 'left', alpha: p3 });
  rule(ctx, 84, W - 84, 846, p3 * 0.8);

  // verdict meter
  const mp = ease(t, 109.2, 1.1);
  const y = 900;
  const w = W - 168;
  ctx.save();
  ctx.globalAlpha = mp;
  ctx.fillStyle = 'rgba(241,234,218,0.10)';
  ctx.fillRect(84, y, w, 6);
  ctx.fillStyle = C.steel;
  ctx.fillRect(84, y, w * 0.3 * mp, 6);
  ctx.fillStyle = C.amber;
  ctx.fillRect(84 + w * 0.3, y, w * 0.7 * mp, 6);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = mp * 0.7;
  rich(ctx, [{ t: '30%', c: C.steel }], { x: 84, y: y + 46, size: 22, family: F.label, spacing: 3, align: 'left' });
  rich(ctx, [{ t: '70%', c: C.amber }], { x: W - 84, y: y + 46, size: 22, family: F.label, spacing: 3, align: 'right' });
  ctx.restore();

  const p4 = ease(t, 115.0, 0.8);
  rich(ctx, [{ t: 'You can out-think a chess player.', c: C.muted }], { y: 1080, size: 44, family: F.light, alpha: p4 });
  const p5 = ease(t, 116.2, 0.8);
  rich(ctx, [{ t: "You can't out-smile a man", c: C.paper }], { y: 1180, size: 60, family: F.med, alpha: p5 });
  rich(ctx, [{ t: "who has already decided.", c: C.paper }], { y: 1252, size: 60, family: F.med, alpha: p5 });

  const p6 = ease(t, 118.4, 0.8);
  rule(ctx, W / 2 - 60, W / 2 + 60, 1360, p6 * 0.8);
  rich(ctx, [{ t: 'FIN', c: C.muted }], { y: 1420, size: 30, family: F.label, spacing: 10, alpha: p6 });
}

const DRAW = [beat1, beat2, beat3, beat4, beat5, beat6, beat7, beat8, beat9, beat10];

function draw(ctx, t) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const idx = BEATS.reduce((a, b, i) => (t >= b.t0 ? i : a), 0);
  const b = BEATS[idx];
  const accent = b.accent === C.steel ? 'rgba(60,106,100,0.22)' : 'rgba(180,71,47,0.20)';
  wash(ctx, accent, 0.55, W / 2, H * 0.36, 1000);

  // slow push on the whole frame
  const entry = 1 - ease(t - b.t0, 0, 0.55);
  const push = 1 + 0.012 * Math.sin((t / 12) * Math.PI) + 0.045 * entry;
  ctx.translate(W / 2, H / 2);
  ctx.scale(push, push);
  ctx.translate(-W / 2, -H / 2);

  DRAW[idx](ctx, t);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  vig(ctx);
  grain(ctx, t);
  drawChrome(ctx, t);
  drawCaptions(ctx, t);
  // cut flash at every beat boundary
  for (const beat of BEATS) {
    const d = t - beat.t0;
    if (d >= 0 && d < 0.12) {
      ctx.save();
      ctx.globalAlpha = (1 - d / 0.12) * 0.22;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
  ctx.restore();
}

module.exports = { W, H, DURATION, draw, C, F, BEATS, CAPTIONS };
