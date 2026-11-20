// Tovush fayllarisiz, WebAudio orqali yaratiladigan oddiy effektlar.
let ctx = null;
let enabled = true;
let stepCount = 0;

export function setSoundEnabled(value) {
  enabled = value;
}

export const isSoundEnabled = () => enabled;

// Umumiy ovoz konteksti (Xazina poygasining fon musiqasi ham shundan foydalanadi).
export function audioContext() {
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, start, duration, type = 'sine', volume = 0.18, endFreq = null) {
  const c = audioContext();
  const t = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

const effects = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.1),
  open: () => [440, 554, 659].forEach((f, i) => tone(f, i * 0.07, 0.18, 'triangle')),
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle')),
  wrong: () => [220, 165].forEach((f, i) => tone(f, i * 0.18, 0.3, 'sawtooth', 0.12)),
  // Qadam: ikki xil balandlik navbatma-navbat — oyoq tovushidek.
  step: () => {
    stepCount += 1;
    tone(stepCount % 2 ? 520 : 440, 0, 0.07, 'triangle', 0.09, 300);
    tone(1400, 0.2, 0.04, 'square', 0.025);
  },
  bonus: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, 'sine')),
  trap: () => {
    tone(700, 0, 0.6, 'sawtooth', 0.05, 140);
    [392, 311, 262].forEach((f, i) => tone(f, 0.1 + i * 0.12, 0.25, 'square', 0.07));
  },
  turn: () => [587, 784].forEach((f, i) => tone(f, i * 0.08, 0.16, 'sine', 0.08)),
  tick: () => tone(1200, 0, 0.05, 'square', 0.05),
  coin: () => [1319, 1760, 1568, 2093].forEach((f, i) => tone(f, i * 0.07, 0.12, 'square', 0.04)),
  win: () =>
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle', 0.2)),
};

export function play(name) {
  if (!enabled) return;
  try {
    effects[name]?.();
  } catch {
    // Tovush ishlamasa ham o'yin davom etaveradi.
  }
}
