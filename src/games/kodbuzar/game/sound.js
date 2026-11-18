// Kichik ovoz effektlari: fayl yuklanmaydi, hammasi Web Audio orqali kodda sintez qilinadi (internet kerak emas).

let ctx = null;
let enabled = true;

export const setSoundEnabled = (on) => {
  enabled = on;
};

function audio() {
  if (!enabled) return null;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, { at = 0, dur = 0.12, type = 'sine', vol = 0.12, slide = 0 } = {}) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const buzz = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* tebranish yo'q */
  }
};

export const sfx = {
  key: () => tone(520 + Math.random() * 60, { dur: 0.05, type: 'triangle', vol: 0.06 }),
  erase: () => tone(300, { dur: 0.06, type: 'triangle', vol: 0.05, slide: 0.7 }),
  error: () => {
    tone(180, { dur: 0.14, type: 'square', vol: 0.05 });
    buzz(40);
  },
  // Har katak ochilganda: joyida — baland, bor — o'rta, yo'q — past.
  reveal: (marks, step = 0.14) => {
    marks.forEach((m, i) => {
      const f = m === 'bull' ? 880 : m === 'cow' ? 620 : 330;
      tone(f, { at: i * step, dur: 0.09, type: m === 'miss' ? 'triangle' : 'sine', vol: 0.08 });
    });
  },
  hint: () => [988, 1319, 1760].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.18, vol: 0.06 })),
  win: (delay = 0) => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { at: delay + i * 0.1, dur: 0.25, type: 'triangle', vol: 0.1 }));
    tone(1568, { at: delay + 0.55, dur: 0.5, vol: 0.07 });
    setTimeout(() => buzz([30, 40, 60]), delay * 1000);
  },
  lose: (delay = 0) => [392, 330, 262, 196].forEach((f, i) => tone(f, { at: delay + i * 0.16, dur: 0.22, type: 'triangle', vol: 0.09 })),
  tap: () => tone(700, { dur: 0.04, type: 'sine', vol: 0.04 }),
};
