import { useMemo } from 'react';

const COLORS = ['#fbbf24', '#22c55e', '#a78bfa', '#ec4899', '#38bdf8', '#f97316'];

/** Yutganda yog'iladigan konfetti. Har bo'lak tasodifiy yo'nalish, rang va aylanish oladi. */
export function Confetti({ count = 90 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        drift: (Math.random() - 0.5) * 40,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.6,
        spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720),
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 6,
        round: Math.random() < 0.3,
      })),
    [count],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.x}%`,
            width: p.w,
            height: p.round ? p.w : p.w * 1.6,
            borderRadius: p.round ? '50%' : 2,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--drift': `${p.drift}vw`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** Orqa fonda sekin suzib yuradigan raqamlar va yorug' dog'lar. */
export function Backdrop() {
  const digits = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        ch: String(Math.floor(Math.random() * 10)),
        x: Math.random() * 100,
        size: 18 + Math.random() * 34,
        dur: 18 + Math.random() * 22,
        delay: -Math.random() * 40,
      })),
    [],
  );
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="glow g1" />
      <span className="glow g2" />
      <span className="glow g3" />
      {digits.map((d) => (
        <span key={d.id} className="float-digit"
          style={{ left: `${d.x}%`, fontSize: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}>
          {d.ch}
        </span>
      ))}
    </div>
  );
}

/** 3D egilish: kursor yoki barmoq qayerda bo'lsa, karta o'sha tomonga og'adi. */
export const tilt = {
  onPointerMove(e) {
    if (e.pointerType === 'touch') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * 14}deg`);
    el.style.setProperty('--rx', `${-y * 14}deg`);
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  },
  onPointerLeave(e) {
    const el = e.currentTarget;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  },
};
