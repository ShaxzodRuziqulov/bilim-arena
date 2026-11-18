// Fon musiqasi — kod ichida, real vaqtda sintez qilinadi (tashqi fayl yo'q).
//
// Maqsad: diqqatni jamlaydigan va tinchlantiradigan fon. Shuning uchun:
//  - sekin temp (54–66 bpm), urma cholg'u yo'q, keskin ovoz yo'q;
//  - akkordlar har 2 taktda almashadi (maj7/9 — "orzuli", qorong'i bo'lmagan ohanglar);
//  - kuy asosan qo'shni notalarga yuradi (oldindan sezsa bo'ladigan, chalg'itmaydigan);
//  - katta "zal" aks-sadosi (reverb) va sekin "nafas oluvchi" filtr.
// Har dunyoning o'z tonalligi, cholg'usi va harakat uslubi bor.
//
// Zanjir: notalar -> bus (+ reverb, echo) -> muffle (lowpass) -> musicGain -> master (audio.js).

import { audioOut } from './audio.js';

const VOLUME = 0.15;
// Soniya — shuncha oldindan notalar rejalashtiriladi. Brauzer taymerlarni sekinlashtirsa ham uzilish bo'lmasin.
const LOOKAHEAD = 0.3;
const TICK_MS = 25;

/**
 * Uslublar.
 *  root    — MIDI raqami (kuy shu atrofda); chords — root'ga nisbatan yarim tonlar, har biri 2 takt.
 *  scale   — kuy notalari (root'ga nisbatan), lead — kuy cholg'usi.
 *  melody  — har 1/8 qadamda kuy notasi chalinish ehtimoli (8 ta qiymat — bir takt).
 *  flow    — Harakat dunyosi: akkord tovushlari bo'ylab uzluksiz, tinch arpedjio.
 *  pulse   — Nur va vaqt dunyosi: 1- va 3-zarbada past, iliq akkord "urishi" (soatdek, lekin ohangli).
 *  padCut  — pad filtri chastotasi (past = yumshoqroq).
 */
const STYLES = {
  // Menyu: do major, eng sokin — uzun akkordlar va kamdan-kam qo'ng'iroqcha.
  menu: {
    bpm: 54, root: 72, lead: 'bell', padCut: 900,
    scale: [0, 2, 4, 7, 9],
    chords: [[0, 4, 7, 11, 14], [-3, 0, 4, 7, 11], [-7, -3, 0, 4], [-5, -3, 2, 7]],
    melody: [0.35, 0, 0, 0, 0.2, 0, 0, 0],
  },
  // 1-dunyo "Uyg'onish": fa lidiy — tong otishidek yorug', musiqa qutichasi ohangi.
  0: {
    bpm: 56, root: 65, lead: 'bell', padCut: 1000,
    scale: [0, 2, 4, 6, 7, 9, 11],
    chords: [[0, 4, 7, 11], [2, 6, 9, 16], [4, 7, 11, 14], [-5, -1, 2, 9]],
    melody: [0.5, 0, 0.25, 0, 0.4, 0, 0.25, 0],
  },
  // 2-dunyo "Nur va vaqt": re major, iliq elektro-pianino; sekin, bir maromdagi akkord urishi.
  1: {
    bpm: 60, root: 62, lead: 'epiano', padCut: 800, pulse: true,
    scale: [0, 2, 4, 7, 9, 11],
    chords: [[0, 4, 7, 11, 14], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, 0, 2, 7]],
    melody: [0.3, 0, 0.15, 0.1, 0.3, 0, 0.15, 0.1],
  },
  // 3-dunyo "Harakat": lya doriy — oqayotgan suvdek uzluksiz, yumshoq arpedjio.
  2: {
    bpm: 66, root: 57, lead: 'pluck', padCut: 1200, flow: true,
    scale: [0, 2, 3, 5, 7, 9, 10],
    chords: [[0, 3, 7, 10, 14], [-7, -3, 0, 3, 7], [3, 7, 10, 14], [-2, 2, 5, 7]],
    melody: [0.2, 0, 0, 0, 0.2, 0, 0, 0],
  },
};

const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);

let out = null;
let style = null;
let styleKey = null;
let enabled = true;
let timer = null;
let nextTime = 0;
let step = 0; // 1/8 nota hisoblagichi; takt = 8 qadam, akkord = 16 qadam
let melodyIdx = 7; // kuy: scale bo'ylab indeks (bir necha oktava)

/** Katta zal aks-sadosi: so'nib boruvchi shovqindan yasalgan impuls (stereo). */
function impulse(ctx, seconds = 3.2) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  return ir;
}

function setup() {
  if (out) return out;
  const a = audioOut();
  if (!a) return null;
  const { ctx } = a;

  const bus = ctx.createGain();
  const muffle = ctx.createBiquadFilter();
  muffle.type = 'lowpass';
  muffle.frequency.value = 18000;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  bus.connect(muffle).connect(gain).connect(a.master);

  // Reverb (zal) — hamma ovozlar biroz yuboradi.
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx);
  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0.55;
  reverb.connect(reverbWet).connect(bus);

  // Echo — faqat kuy notalari uchun (nuqtali 1/8).
  const echo = ctx.createDelay(2);
  const feedback = ctx.createGain();
  const echoWet = ctx.createGain();
  feedback.gain.value = 0.3;
  echoWet.gain.value = 0.25;
  echo.connect(feedback).connect(echo);
  echo.connect(echoWet).connect(bus);
  echoWet.connect(reverb);

  // Pad: alohida filtr, juda sekin LFO bilan "nafas oladi" (~20 soniyada bir marta).
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.4;
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoDepth.gain.value = 350;
  lfo.connect(lfoDepth).connect(padFilter.frequency);
  lfo.start();
  const padBus = ctx.createGain();
  padBus.connect(padFilter);
  padFilter.connect(bus);
  padFilter.connect(reverb);

  out = { ctx, bus, muffle, gain, reverb, echo, padBus, padFilter };
  return out;
}

/** Bitta osc + konvert. dest — qayerga ulanadi; send — reverb/echo'ga qancha yuboriladi. */
function osc({ type, freq, t, attack, hold, release, vol, detune = 0, cutoff, cutoffEnd, dest, reverb = 0.4, echo = false }) {
  const { ctx } = out;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  const env = ctx.createGain();
  const end = t + attack + hold + release;
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vol, t + attack);
  env.gain.setValueAtTime(vol, t + attack + hold);
  env.gain.exponentialRampToValueAtTime(0.0001, end);
  let node = o;
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(cutoff, t);
    if (cutoffEnd) f.frequency.exponentialRampToValueAtTime(cutoffEnd, t + attack + hold + release * 0.6);
    node = node.connect(f);
  }
  node.connect(env);
  env.connect(dest || out.bus);
  if (reverb) {
    const send = ctx.createGain();
    send.gain.value = reverb;
    env.connect(send).connect(out.reverb);
  }
  if (echo) env.connect(out.echo);
  o.start(t);
  o.stop(end + 0.05);
}

/** Kuy cholg'ulari. */
const LEAD = {
  // Musiqa qutichasi: asosiy ton + yumshoq yuqori obertoni.
  bell: (f, t, v) => {
    osc({ type: 'sine', freq: f, t, attack: 0.01, hold: 0.02, release: 1.8, vol: 0.045 * v, reverb: 0.6, echo: true });
    osc({ type: 'sine', freq: f * 3, t, attack: 0.005, hold: 0, release: 0.4, vol: 0.008 * v, reverb: 0.5 });
  },
  // Elektro-pianino: iliq asos + tez so'nadigan "tiniqlik".
  epiano: (f, t, v) => {
    osc({ type: 'sine', freq: f, t, attack: 0.015, hold: 0.05, release: 1.6, vol: 0.05 * v, reverb: 0.5, echo: true });
    osc({ type: 'triangle', freq: f * 2, t, attack: 0.005, hold: 0, release: 0.35, vol: 0.012 * v, cutoff: 2200, reverb: 0.3 });
  },
  // Yumshoq "chertish": filtr tez yopiladi — tovush yumaloq.
  pluck: (f, t, v) => {
    osc({ type: 'triangle', freq: f, t, attack: 0.01, hold: 0, release: 0.9, vol: 0.04 * v, cutoff: 2400, cutoffEnd: 400, reverb: 0.55, echo: true });
  },
};

/** Kuy: scale bo'ylab asosan qo'shni notaga yuradi; diapazon ichida qoladi. */
function nextMelodyNote(s, chord, strong) {
  const n = s.scale.length;
  const lo = n; // 2-oktava boshi
  const hi = n * 3 - 1;
  const moves = [-2, -1, -1, 0, 1, 1, 2];
  melodyIdx += moves[Math.floor(Math.random() * moves.length)];
  if (melodyIdx < lo) melodyIdx = lo + 1;
  if (melodyIdx > hi) melodyIdx = hi - 1;
  let semis = s.scale[melodyIdx % n] + 12 * Math.floor(melodyIdx / n) - 12;
  if (strong) {
    // Kuchli zarbada akkord tovushiga yaqinlashtiriladi — quloqqa "o'tirgan" eshitiladi.
    const tones = chord.map((c) => ((c % 12) + 12) % 12);
    const pc = ((semis % 12) + 12) % 12;
    let best = 0;
    for (let d = 0; d <= 2 && !best; d++) {
      if (tones.includes((pc + d) % 12)) best = d;
      else if (tones.includes((pc - d + 12) % 12)) best = -d;
    }
    semis += best;
  }
  return s.root + semis;
}

/** Bitta 1/8 qadamni rejalashtiradi. */
function schedule(i, t) {
  const s = style;
  const beat = 60 / s.bpm;
  const pos = i % 8;
  const chordLen = 16; // 2 takt
  const chord = s.chords[Math.floor(i / chordLen) % s.chords.length];
  const human = () => t + rnd(0, 0.018); // jonli eshitilishi uchun mayda kechikish

  if (i % chordLen === 0) {
    // Pad: akkord tovushlari, bir oktava pastda; sekin kirib, keyingisi bilan ustma-ust so'nadi.
    const len = beat * 8;
    for (const n of chord) {
      osc({ type: 'sine', freq: midi(s.root - 12 + n), t, attack: 2.2, hold: len - 2.2, release: 3, vol: 0.02, dest: out.padBus, reverb: 0 });
      osc({ type: 'triangle', freq: midi(s.root - 12 + n), t, attack: 2.6, hold: len - 2.6, release: 3, vol: 0.012, detune: rnd(-9, 9), dest: out.padBus, reverb: 0 });
    }
    // Bas: juda yumshoq, uzun.
    osc({ type: 'sine', freq: midi(s.root - 24 + chord[0]), t, attack: 0.6, hold: len - 1, release: 2, vol: 0.055, reverb: 0.15 });
  }

  // Nur va vaqt: 1- va 3-zarbada past, iliq akkord "urishi".
  if (s.pulse && (pos === 0 || pos === 4)) {
    for (const n of chord.slice(0, 3)) LEAD.epiano(midi(s.root - 12 + n), human(), 0.35);
  }

  // Harakat: akkord bo'ylab yuqoriga-pastga uzluksiz arpedjio — oqim, ritm emas.
  if (s.flow) {
    const tones = chord.map((n) => n + 12);
    const cycle = tones.concat(tones.slice(1, -1).reverse());
    const n = cycle[i % cycle.length];
    LEAD.pluck(midi(s.root + n - 12), human(), 0.55 + (pos === 0 ? 0.2 : 0));
  }

  // Kuy: kamdan-kam, qo'shni notalar bo'ylab.
  if (Math.random() < s.melody[pos]) {
    const note = nextMelodyNote(s, chord, pos === 0 || pos === 4);
    LEAD[s.lead](midi(note), human(), rnd(0.75, 1));
  }
}

function tick() {
  const { ctx } = out;
  // Kontekst to'xtagan bo'lsa — eskirgan notalarni to'plab chalmaslik.
  if (nextTime < ctx.currentTime - 0.1) nextTime = ctx.currentTime + 0.05;
  const half = 60 / style.bpm / 2;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    schedule(step, nextTime);
    nextTime += half;
    step++;
  }
}

function fadeTo(value, seconds) {
  const g = out.gain.gain;
  const now = out.ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(value, now + seconds);
}

function start() {
  if (timer || !enabled || !style || !setup()) return;
  nextTime = out.ctx.currentTime + 0.1;
  step = 0;
  melodyIdx = style.scale.length + Math.floor(style.scale.length / 2);
  out.padFilter.frequency.setTargetAtTime(style.padCut, out.ctx.currentTime, 0.5);
  out.echo.delayTime.setValueAtTime((60 / style.bpm) * 0.75, out.ctx.currentTime); // nuqtali 1/8
  fadeTo(VOLUME, 3);
  timer = setInterval(tick, TICK_MS);
}

function stop(fade = 1.2) {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  if (out) fadeTo(0, fade);
}

/** Sahna uslubini tanlaydi: 'menu' yoki dunyo raqami (0, 1, 2). Bir xil uslubda musiqa uzilmaydi. */
export function playMusic(key) {
  const k = STYLES[key] ? String(key) : 'menu';
  if (k === styleKey && timer) return;
  styleKey = k;
  if (timer) {
    // Uslubni almashtirish: sekin so'nish, keyin yangi kuy (pad va reverb dumlari tabiiy so'nadi).
    stop(1);
    setTimeout(() => {
      style = STYLES[styleKey];
      start();
    }, 1000);
  } else {
    style = STYLES[k];
    start();
  }
}

export function setMusicEnabled(on) {
  enabled = on;
  if (on) start();
  else stop();
}

/** Platformada o'yindan chiqilganda: musiqa so'nadi, keyingi ochilishda boshidan boshlanadi. */
export function stopMusic() {
  stop(0.4);
  styleKey = null;
}

/** Yozish rejimida musiqa "bo'g'iq" eshitiladi — vaqt boshqacha oqayotgandek. */
export function setMusicMuffled(on) {
  if (!out) return;
  out.muffle.frequency.setTargetAtTime(on ? 600 : 18000, out.ctx.currentTime, 0.15);
}

/** Muhim ovoz (g'alaba) uchun musiqani vaqtincha pasaytiradi. */
export function duckMusic(seconds = 1.6) {
  if (!out || !timer) return;
  const g = out.gain.gain;
  const now = out.ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(VOLUME * 0.3, now + 0.15);
  g.linearRampToValueAtTime(VOLUME, now + seconds);
}
