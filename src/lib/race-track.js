// Xazina poygasi taxtasining geometriyasi: silliq "ilon" yo'l, unda teng oraliqdagi kataklar va
// qahramon yo'l bo'ylab yurishi uchun nuqta topish. DOM ishlatilmaydi — testlarda ham ishlaydi.
//
// Koordinatalar sahnaga nisbatan foizda (x, y: 0–100). Sahna 16:9, shuning uchun masofa
// (x·16, y·9) birliklarida o'lchanadi — aks holda kataklar gorizontal yo'lda siyrak, burilishda zich ko'rinardi.

const SX = 16;
const SY = 9;

function waypoints(rows) {
  const ys = rows === 2 ? [38, 64] : [30, 52, 74];
  const xs = [12, 31, 50, 69, 88];
  const wobble = [0, -3, 1, -3, 0];
  const pts = [];
  ys.forEach((y, r) => {
    const line = xs.map((x, i) => [x, y + wobble[i] * (r % 2 ? -1 : 1)]);
    if (r % 2) line.reverse();
    pts.push(...line);
    // Burilish: qator oxiridan keyingi qator boshiga yarim doira bo'ylab.
    if (r < ys.length - 1) pts.push([r % 2 ? 6.5 : 93.5, (y + ys[r + 1]) / 2]);
  });
  return pts;
}

// Catmull-Rom splayni kubik Bezye bo'laklariga aylantirish (yo'l chizig'i va namunalar uchun).
function segments(pts) {
  const get = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [get(i - 1), get(i), get(i + 1), get(i + 2)];
    segs.push([
      p1,
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    ]);
  }
  return segs;
}

function bezier([a, b, c, d], t) {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
}

/**
 * n — xazinagacha qadamlar soni. Natija:
 *  nodes   — n+1 ta katak markazi ({x, y} foizda), 0 — start, n — xazina;
 *  path    — SVG yo'l (viewBox 0 0 1600 900 uchun);
 *  at(s)   — yo'l bo'ylab s masofadagi nuqta; lengths[i] — i-katakning masofasi.
 */
export function buildTrack(n) {
  const rows = n + 1 <= 9 ? 2 : 3;
  const segs = segments(waypoints(rows));
  // Zich namunalar: har bo'lakda 40 nuqta, to'plangan uzunlik bilan.
  const samples = [];
  let total = 0;
  let prev = null;
  for (const seg of segs) {
    for (let k = prev ? 1 : 0; k <= 40; k++) {
      const [x, y] = bezier(seg, k / 40);
      if (prev) total += Math.hypot((x - prev[0]) * SX, (y - prev[1]) * SY);
      samples.push({ x, y, s: total });
      prev = [x, y];
    }
  }

  const at = (s) => {
    const target = Math.max(0, Math.min(total, s));
    let lo = 0;
    let hi = samples.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].s < target) lo = mid;
      else hi = mid;
    }
    const a = samples[lo];
    const b = samples[hi];
    const t = b.s === a.s ? 0 : (target - a.s) / (b.s - a.s);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  };

  const lengths = Array.from({ length: n + 1 }, (_, i) => (total * i) / n);
  const nodes = lengths.map(at);
  const f = (v) => v.toFixed(1);
  const path =
    `M${f(segs[0][0][0] * SX)},${f(segs[0][0][1] * SY)}` +
    segs.map(([, b, c, d]) => ` C${f(b[0] * SX)},${f(b[1] * SY)} ${f(c[0] * SX)},${f(c[1] * SY)} ${f(d[0] * SX)},${f(d[1] * SY)}`).join('');
  return { nodes, lengths, total, at, path, rows };
}

// Orol qirg'og'i: notekis, lekin yo'lni to'liq o'z ichiga oladigan yopiq shakl (viewBox 1600×900).
export function islandPath(scaleX = 1, scaleY = 1) {
  const pts = [];
  for (let k = 0; k < 40; k++) {
    const a = (k / 40) * Math.PI * 2;
    const f = 1 + 0.03 * Math.sin(3 * a + 1) + 0.02 * Math.sin(5 * a + 2) + 0.01 * Math.sin(9 * a);
    pts.push([800 + 785 * scaleX * f * Math.cos(a), 470 + 380 * scaleY * f * Math.sin(a)]);
  }
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

// Ko'prik eng yaxshi burilishda bo'ladi: katak va undan `jump` keyingi katak orasidagi to'g'ri masofa
// eng qisqa joyda (ko'prik burilishni "kesib o'tadi"). Mos joy bo'lmasa — null.
export function bestBridge(nodes, jump = 3) {
  const n = nodes.length - 1;
  let best = null;
  let bestDist = Infinity;
  for (let a = 2; a + jump <= n - 1; a++) {
    const p = nodes[a];
    const q = nodes[a + jump];
    const d = Math.hypot((p.x - q.x) * SX, (p.y - q.y) * SY);
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best;
}
