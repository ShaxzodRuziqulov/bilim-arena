import { memo } from 'react';
import { islandPath } from '../lib/race-track.js';

// Xazina poygasi taxtasining manzarasi: dengiz to'lqinlari, orol, qumli yo'l va bezaklar.
// Hammasi kod ichidagi SVG — internet, rasm fayli va litsenziya kerak emas.
// Orol va yo'l sahnaga cho'ziladi (telefonda sahna 16:9 emas), bezaklar esa alohida — ular cho'zilmaydi.

const ISLAND = islandPath();
const GRASS = islandPath(0.93, 0.86);

// Bezaklar qatorlar orasiga qo'yiladi (yo'lni to'smasligi uchun); y — bezak tagining o'rni.
const DECOR = {
  2: [
    ['palm', 22, 56], ['mountain', 48, 56], ['palm', 63, 55, 0.8], ['volcano', 78, 56],
  ],
  3: [
    ['palm', 20, 45, 0.9], ['mountain', 45, 45], ['palm', 76, 44],
    ['rocks', 28, 67], ['volcano', 56, 67], ['palm', 84, 67, 0.8],
  ],
};

function Palm() {
  return (
    <svg viewBox="-60 -110 120 120">
      <ellipse cx="6" cy="2" rx="30" ry="7" fill="#0003" />
      <path d="M0 0 q8 -42 -6 -80" stroke="#8a5a2b" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M-2 -18 h6 M0 -36 h6 M-2 -54 h6" stroke="#6b4220" strokeWidth="3" strokeLinecap="round" />
      <g className="rb-fronds" transform="translate(-6 -80)">
        {['M0 0 q-30 -14 -52 8', 'M0 0 q-14 -30 -40 -34', 'M0 0 q18 -30 42 -28', 'M0 0 q32 -6 50 18', 'M0 0 q-6 18 -28 30', 'M0 0 q12 14 28 32'].map((d) => (
          <path key={d} d={d} stroke="#1f9d55" strokeWidth="12" fill="none" strokeLinecap="round" />
        ))}
        <circle cx="-3" cy="6" r="5.5" fill="#6b3f1d" />
        <circle cx="6" cy="5" r="5.5" fill="#6b3f1d" />
      </g>
    </svg>
  );
}

function Mountain() {
  return (
    <svg viewBox="-110 -125 220 130">
      <ellipse cx="0" cy="0" rx="105" ry="8" fill="#0003" />
      <path d="M-100 0 L-24 -108 L6 -78 L40 -120 L104 0 Z" fill="#5e8473" />
      <path d="M40 -120 L104 0 L46 0 L56 -62 Z M-24 -108 L-4 0 L-40 0 Z" fill="#0002" />
      <path d="M-24 -108 L-42 -80 L-26 -86 L-12 -76 L6 -78 Z M40 -120 L26 -96 L38 -100 L52 -88 Z" fill="#eef6f3" />
    </svg>
  );
}

function Volcano() {
  return (
    <svg viewBox="-90 -150 180 155">
      <ellipse cx="0" cy="0" rx="86" ry="8" fill="#0003" />
      <g className="rb-smoke">
        <circle cx="-4" cy="-100" r="10" fill="#d9d4cf" />
        <circle cx="6" cy="-100" r="8" fill="#e6e1dc" />
        <circle cx="0" cy="-100" r="9" fill="#cfc9c3" />
      </g>
      <path d="M-82 0 L-24 -88 L24 -88 L82 0 Z" fill="#7a5a4a" />
      <path d="M24 -88 L82 0 L30 0 Z" fill="#0002" />
      <ellipse cx="0" cy="-88" rx="25" ry="7" fill="#ff6b2b" />
      <path className="rb-lava" d="M-10 -88 q-6 30 -22 52 q16 -8 20 -30 q4 18 14 26 q-6 -26 -2 -48 z" fill="#ff8a3d" />
    </svg>
  );
}

function Rocks() {
  return (
    <svg viewBox="-70 -50 140 55">
      <ellipse cx="0" cy="0" rx="64" ry="7" fill="#0003" />
      <path d="M-60 0 q4 -34 30 -38 q24 2 26 38 z" fill="#8b9a94" />
      <path d="M-8 0 q6 -24 24 -26 q20 4 22 26 z" fill="#a3b0aa" />
      <path d="M30 0 q4 -14 14 -14 q12 2 14 14 z" fill="#7c8a85" />
      <path d="M-44 -26 q8 -8 18 -6" stroke="#fff6" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Ship() {
  return (
    <svg viewBox="-60 -90 120 100">
      <path d="M-50 -14 h100 l-14 22 h-72 z" fill="#7a4a24" />
      <path d="M-50 -14 h100" stroke="#5a3418" strokeWidth="4" />
      <path d="M-2 -14 v-70" stroke="#5a3418" strokeWidth="5" />
      <path d="M2 -82 q34 22 0 60 z" fill="#fff4d6" />
      <path d="M-6 -76 q-30 20 0 54 z" fill="#f3e2b8" />
      <path d="M-2 -84 l18 6 l-18 6 z" fill="#ff5c7a" />
    </svg>
  );
}

const ART = { palm: Palm, mountain: Mountain, volcano: Volcano, rocks: Rocks };

function RaceScenery({ track }) {
  const decor = DECOR[track.rows] ?? DECOR[3];
  return (
    <>
      <svg className="board-svg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="rb-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6dea0" />
            <stop offset="1" stopColor="#e2bf72" />
          </linearGradient>
          <radialGradient id="rb-grass" cx="0.5" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#4fae78" />
            <stop offset="1" stopColor="#2a7a58" />
          </radialGradient>
          <pattern id="rb-waves" width="140" height="46" patternUnits="userSpaceOnUse">
            <path d="M0 23 q35 -14 70 0 t70 0" stroke="#ffffff1c" strokeWidth="4" fill="none" />
          </pattern>
        </defs>
        {/* Dengiz to'lqinlari sekin suzadi */}
        <g className="rb-sea">
          <rect x="-140" y="0" width="1880" height="900" fill="url(#rb-waves)" />
        </g>
        {/* Orol: soya, sayozlik, ko'pik, qum va o'tloq */}
        <path d={ISLAND} fill="#06293a" opacity=".55" transform="translate(0 18)" />
        <path d={ISLAND} fill="none" stroke="#7fd6e0" strokeWidth="46" opacity=".28" />
        <path className="rb-foam" d={ISLAND} fill="none" stroke="#ffffff" strokeWidth="5" strokeDasharray="22 16" opacity=".55" />
        <path d={ISLAND} fill="url(#rb-sand)" />
        <path d={GRASS} fill="url(#rb-grass)" />
        {/* Yo'l: soya, chekka, qum va o'rtadagi izlar */}
        <path d={track.path} fill="none" stroke="#0003" strokeWidth="66" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 9)" />
        <path d={track.path} fill="none" stroke="#8a6630" strokeWidth="64" strokeLinecap="round" strokeLinejoin="round" />
        <path d={track.path} fill="none" stroke="#ecca82" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />
        <path d={track.path} fill="none" stroke="#c59c52" strokeWidth="7" strokeDasharray="1 26" strokeLinecap="round" />
      </svg>

      {decor.map(([kind, x, y, s = 1]) => {
        const Art = ART[kind];
        return (
          <span key={`${kind}-${x}`} className={`deco deco-${kind}`} style={{ left: `${x}%`, top: `${y}%`, '--s': s }}>
            <Art />
          </span>
        );
      })}
      <span className="deco deco-ship sea" style={{ left: '93%', top: '95%' }}>
        <Ship />
      </span>
      <span className="deco deco-rocks sea" style={{ left: '5%', top: '95%', '--s': 0.7 }}>
        <Rocks />
      </span>
    </>
  );
}

export default memo(RaceScenery);
