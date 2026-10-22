// Tovush fayllarisiz, WebAudio orqali yaratiladigan oddiy effektlar.
let ctx = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = value;
}

function tone(freq, start, duration, type = 'sine', volume = 0.18) {
  ctx ??= new AudioContext();
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

const effects = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.1),
  open: () => [440, 554, 659].forEach((f, i) => tone(f, i * 0.07, 0.18, 'triangle')),
  correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle')),
  wrong: () => [220, 165].forEach((f, i) => tone(f, i * 0.18, 0.3, 'sawtooth', 0.12)),
  step: () => tone(880, 0, 0.09, 'square', 0.06),
  bonus: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, 'sine')),
  trap: () => [392, 311, 262].forEach((f, i) => tone(f, i * 0.12, 0.25, 'square', 0.08)),
  tick: () => tone(1200, 0, 0.05, 'square', 0.05),
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
