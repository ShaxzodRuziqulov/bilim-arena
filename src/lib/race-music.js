// Xazina poygasining fon musiqasi: kod ichida sintez qilinadi (fayl va litsenziya kerak emas).
// Quvnoq, lekin sokin "orol" kuyi: sol major, I–V–vi–IV, marimbaga o'xshash arpedjio, yumshoq bas va shaqildoq.
// Savol paytida ovoz pasayadi (o'quvchi savolga e'tibor bersin), pauzada esa jim bo'ladi.

import { audioContext, isSoundEnabled } from './sound.js';

const VOLUME = 0.32;
const BPM = 100;
const STEP = 60 / BPM / 2; // 1/8 nota
const LOOKAHEAD = 0.25;
const ROOT = 55; // G3
const CHORDS = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]];
const ARP = [0, 1, 2, 1, 0, 2, 1, 2];
const PENTA = [0, 2, 4, 7, 9];

const midi = (m) => 440 * 2 ** ((m - 69) / 12);

let out = null;
let timer = null;
let nextTime = 0;
let step = 0;
let noise = null;

function note(c, freq, t, duration, type, volume) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function shaker(c, t, volume) {
  if (!noise) {
    noise = c.createBuffer(1, Math.floor(c.sampleRate * 0.08), c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
  }
  const src = c.createBufferSource();
  src.buffer = noise;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  const gain = c.createGain();
  gain.gain.value = volume;
  src.connect(hp).connect(gain).connect(out);
  src.start(t);
}

function schedule() {
  const c = audioContext();
  if (!isSoundEnabled()) {
    nextTime = c.currentTime + 0.05;
    return;
  }
  while (nextTime < c.currentTime + LOOKAHEAD) {
    const t = nextTime;
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
    const beat = step % 8;
    if (beat === 0 || beat === 4) note(c, midi(ROOT - 12 + chord[0]), t, 0.32, 'triangle', 0.16);
    if (beat === 6) note(c, midi(ROOT - 12 + chord[2] - 12), t, 0.18, 'triangle', 0.1);
    if (Math.random() < 0.85) note(c, midi(ROOT + 12 + chord[ARP[beat]]), t, 0.2, 'sine', 0.07);
    if (beat % 2) shaker(c, t, 0.05);
    // Kamdan-kam qo'ng'iroqcha kuy — har safar biroz boshqacha eshitiladi.
    if ((beat === 0 || beat === 3) && Math.random() < 0.3) {
      note(c, midi(ROOT + 24 + PENTA[Math.floor(Math.random() * PENTA.length)]), t, 0.45, 'sine', 0.045);
    }
    step += 1;
    nextTime += STEP;
  }
}

export function startRaceMusic() {
  if (timer) return;
  try {
    const c = audioContext();
    if (!out) {
      out = c.createGain();
      out.connect(c.destination);
    }
    out.gain.cancelScheduledValues(c.currentTime);
    out.gain.setValueAtTime(0.0001, c.currentTime);
    out.gain.exponentialRampToValueAtTime(VOLUME, c.currentTime + 1.2);
    nextTime = c.currentTime + 0.1;
    step = 0;
    timer = setInterval(schedule, 40);
  } catch {
    // Ovoz ishlamasa ham o'yin davom etadi.
  }
}

export function stopRaceMusic() {
  clearInterval(timer);
  timer = null;
  if (out) {
    try {
      const c = audioContext();
      out.gain.cancelScheduledValues(c.currentTime);
      out.gain.setTargetAtTime(0.0001, c.currentTime, 0.15);
    } catch {
      // e'tiborsiz
    }
  }
}

// level: 1 — odatiy, 0.35 — savol paytida, 0 — pauza.
export function setRaceMusicLevel(level) {
  if (!out || !timer) return;
  try {
    const c = audioContext();
    out.gain.cancelScheduledValues(c.currentTime);
    out.gain.setTargetAtTime(Math.max(0.0001, VOLUME * level), c.currentTime, 0.25);
  } catch {
    // e'tiborsiz
  }
}
