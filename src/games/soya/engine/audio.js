// Ovoz effektlari kod ichida sintez qilinadi (WebAudio) — tashqi fayl va litsenziya kerak emas.
// Hammasi bitta "master" zanjiridan o'tadi: kompressor ovozlar ustma-ust tushganda qichqiriq bermaydi.

let ctx = null;
let master = null;
let enabled = true;
const lastPlayed = {}; // tez-tez chaqiriladigan ovozlarni siyraklashtirish uchun

export function setAudioEnabled(on) {
  enabled = on;
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended' && !document.hidden) ctx.resume();
  return ctx;
}

/** Fon musiqasi (music.js) ham shu kontekst va master zanjiridan foydalanadi. */
export function audioOut() {
  const c = audio();
  return c ? { ctx: c, master } : null;
}

if (typeof window !== 'undefined') {
  // Brauzer ovozni faqat foydalanuvchi biror narsa bosgandan keyin ruxsat beradi.
  const unlock = () => {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  // Boshqa varaqqa o'tilganda ovoz to'xtaydi, qaytganda davom etadi.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
}

/** Manba -> (filtr) -> (pan) -> gain -> master. */
function route(c, src, gain, { lp, hp, pan }) {
  let node = src;
  if (lp) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lp;
    node = node.connect(f);
  }
  if (hp) {
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    node = node.connect(f);
  }
  if (pan && c.createStereoPanner) {
    const p = c.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    node = node.connect(p);
  }
  node.connect(gain).connect(master);
}

/** Bitta ton: chastota from -> to, yumshoq boshlanish (attack) va so'nish. */
function tone({ type = 'square', from, to = from, dur = 0.1, vol = 0.1, delay = 0, attack = 0.005, lp, hp, pan }) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  route(c, osc, gain, { lp, hp, pan });
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

let noiseBuffer = null;
/** Shovqin (shitirlash, "vush"). sweep — filtr chastotasi from -> to (havo oqimi effekti). */
function noise({ dur = 0.2, vol = 0.1, delay = 0, attack = 0.005, lp, hp, sweep, pan }) {
  const c = audio();
  if (!c) return;
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  if (sweep) {
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(sweep[0], t0);
    f.frequency.exponentialRampToValueAtTime(sweep[1], t0 + dur);
    route(c, src.connect(f), gain, { lp, hp, pan });
  } else {
    route(c, src, gain, { lp, hp, pan });
  }
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

const rnd = (a, b) => a + Math.random() * (b - a);

/** Har ovoz: (pan) => void. pan — ekrandagi joyiga qarab chap/o'ng (-1…1). */
const SFX = {
  // --- Qahramon ---
  jump: (pan) => {
    tone({ type: 'square', from: 260, to: 520, dur: 0.11, vol: 0.04, lp: 2400, pan });
    noise({ dur: 0.08, vol: 0.03, sweep: [800, 2400], pan });
  },
  land: (pan) => {
    tone({ type: 'sine', from: 150, to: 60, dur: 0.09, vol: 0.12, pan });
    noise({ dur: 0.06, vol: 0.04, lp: 900, pan });
  },
  step: (pan) => noise({ dur: 0.035, vol: 0.025, lp: rnd(900, 1400), hp: 200, pan }),
  death: (pan) => {
    noise({ dur: 0.3, vol: 0.14, sweep: [3000, 300], pan });
    tone({ type: 'sawtooth', from: 420, to: 70, dur: 0.32, vol: 0.05, lp: 1800, pan });
  },
  // Start nuqtasida zarrachalar yig'ilib, qahramon paydo bo'ladi.
  respawn: (pan) => {
    noise({ dur: 0.2, vol: 0.035, sweep: [400, 3000], attack: 0.15, pan });
    tone({ type: 'sine', from: 440, to: 880, dur: 0.16, vol: 0.06, delay: 0.12, pan });
  },

  // --- Soya va yozish ---
  recStart: () => {
    tone({ type: 'sine', from: 880, dur: 0.07, vol: 0.08 });
    tone({ type: 'sine', from: 1320, dur: 0.09, vol: 0.08, delay: 0.08 });
  },
  recStop: () => {
    tone({ type: 'sine', from: 1320, dur: 0.07, vol: 0.08 });
    tone({ type: 'sine', from: 880, dur: 0.09, vol: 0.08, delay: 0.08 });
  },
  // Yozish davomida har soniyada yumshoq "tiq" — lenta aylanayotgandek.
  recTick: () => tone({ type: 'sine', from: 1760, dur: 0.03, vol: 0.025 }),
  // Lentani orqaga o'rash: tushib boruvchi "vzzz" + shitirlash.
  rewind: () => {
    tone({ type: 'sawtooth', from: 900, to: 180, dur: 0.22, vol: 0.035, lp: 1600 });
    noise({ dur: 0.22, vol: 0.04, sweep: [4000, 500] });
  },
  // Yangi soya paydo bo'ladi.
  shadowPop: (pan) => {
    tone({ type: 'sine', from: 300, to: 620, dur: 0.12, vol: 0.07, pan });
    tone({ type: 'triangle', from: 620, dur: 0.1, vol: 0.03, delay: 0.08, pan });
  },
  undo: () => {
    tone({ type: 'triangle', from: 500, to: 250, dur: 0.12, vol: 0.07 });
    noise({ dur: 0.12, vol: 0.03, sweep: [2000, 400] });
  },

  // --- Tugma, sim, eshik ---
  button: (pan) => tone({ type: 'triangle', from: 660, to: 990, dur: 0.07, vol: 0.08, pan }),
  wire: (pan) => tone({ type: 'sine', from: 1200, to: 1800, dur: 0.06, vol: 0.03, pan }),
  doorOpen: (pan) => {
    noise({ dur: 0.18, vol: 0.06, sweep: [300, 1800], pan });
    tone({ type: 'sawtooth', from: 110, to: 220, dur: 0.16, vol: 0.03, lp: 900, pan });
  },
  doorClose: (pan) => {
    tone({ type: 'sine', from: 120, to: 45, dur: 0.16, vol: 0.14, pan });
    noise({ dur: 0.1, vol: 0.06, lp: 700, pan });
  },
  // Vaqtli eshik ochiq turganda soat chiqillashi.
  timerTick: (pan) => tone({ type: 'square', from: 2200, dur: 0.02, vol: 0.02, lp: 4000, pan }),

  // --- Lazer ---
  laserCharge: (pan) => tone({ type: 'sawtooth', from: 180, to: 720, dur: 0.38, vol: 0.022, attack: 0.3, lp: 2000, pan }),
  laserOn: (pan) => noise({ dur: 0.07, vol: 0.03, sweep: [5000, 1500], pan }),

  // --- G'alaba ---
  portal: (pan) => {
    noise({ dur: 0.3, vol: 0.06, sweep: [3000, 300], pan });
    tone({ type: 'sine', from: 900, to: 220, dur: 0.25, vol: 0.05, pan });
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', from: f, dur: 0.2, vol: 0.08, delay: 0.12 + i * 0.09 })),
  star: () => tone({ type: 'sine', from: 1175, to: 1568, dur: 0.14, vol: 0.07 }),

  // --- Interfeys ---
  click: () => tone({ type: 'triangle', from: 520, dur: 0.04, vol: 0.05 }),
  hover: () => tone({ type: 'sine', from: 1400, dur: 0.025, vol: 0.012 }),
};

// Ba'zi ovozlar ko'p manbadan bir vaqtda kelishi mumkin — orasida kamida shuncha ms bo'lsin.
const MIN_GAP = { step: 90, wire: 60, laserOn: 120, laserCharge: 200, timerTick: 80, hover: 40, button: 40 };

/**
 * Ovoz chalish. x — ekrandagi gorizontal joy (0…width) bo'lsa, ovoz chap/o'ngga suriladi.
 */
export function sfx(name, x, width = 960) {
  if (!enabled) return;
  const now = performance.now();
  const gap = MIN_GAP[name];
  if (gap && now - (lastPlayed[name] || 0) < gap) return;
  lastPlayed[name] = now;
  const pan = x === undefined ? 0 : ((x / width) * 2 - 1) * 0.6;
  try {
    SFX[name]?.(pan);
  } catch {
    // Ovoz chiqmasa o'yin to'xtamasin.
  }
}
