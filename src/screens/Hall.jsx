import { GAMES, SOLO_GAMES } from '../games/registry.jsx';
import { play } from '../lib/sound.js';
import '../hall.css';

// O'yinlar zali — platformaning bosh ekrani. Yakka o'yinlar katta afishalarda, sinf o'yinlari esa
// o'qituvchi studiyasi orqali ochiladi (u yerda jamoalar va savol to'plamlari sozlanadi).

const LAST_KEY = 'platforma-oxirgi-oyin';
export const rememberLastGame = (id) => {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    /* saqlab bo'lmadi — zal baribir ishlaydi */
  }
};
const lastGame = () => {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
};

const CLASS_GAMES = [
  { id: 'race', tab: 'sets', note: '2–4 jamoa, savol to‘plami bilan' },
  { id: 'kod', tab: 'robot', note: 'Bloklar bilan dasturlash' },
  { id: 'java', tab: 'robot', note: 'Haqiqiy Java kodi' },
];

export default function Hall({ onPlay, onClass, onQuit, soundOn, onToggleSound }) {
  const solo = Object.values(SOLO_GAMES).map((g) => ({ ...g, ...safeSummary(g) }));
  const totalStars = solo.reduce((s, g) => s + g.stars, 0);
  const last = SOLO_GAMES[lastGame()];

  const open = (id) => {
    play('tap');
    onPlay(id);
  };

  return (
    <div className="screen hall">
      <header className="hall-top">
        <div className="hall-brand">
          <img src="./icon.svg" alt="" />
          <div>
            <h1>Bilim Arena</h1>
            <p>Bugun nima o‘ynaymiz?</p>
          </div>
        </div>
        <span className="hall-stars" title="Barcha o‘yinlardagi yulduzlar">★ {totalStars}</span>
        <button className="hall-sound" onClick={onToggleSound} aria-pressed={soundOn}
          aria-label={soundOn ? 'Barcha o‘yinlarda ovozni o‘chirish' : 'Ovozni yoqish'} title={soundOn ? 'Ovoz yoqiq — barcha o‘yinlarda' : 'Ovoz o‘chiq — barcha o‘yinlarda'}>
          {soundOn ? '🔊' : '🔇'}
        </button>
        {onQuit && <button className="btn" onClick={onQuit}>Chiqish</button>}
      </header>

      {last && (
        <button className="hall-continue" onClick={() => open(last.id)}>
          <span className="hall-continue-icon" aria-hidden="true">{last.icon}</span>
          <span>
            <b>{last.title}ni davom ettirish</b>
            <small>Oxirgi marta shu o‘yinni o‘ynagansiz</small>
          </span>
          <span className="hall-continue-go" aria-hidden="true">▶</span>
        </button>
      )}

      <section className="hall-section" aria-labelledby="solo-title">
        <h2 id="solo-title">O‘zingiz uchun</h2>
        <div className="posters">
          {solo.map((g) => (
            <button key={g.id} className={`poster poster-${g.id}`} onClick={() => open(g.id)} aria-label={`${g.title}: o‘ynash`}>
              <Art id={g.id} />
              <span className="poster-body">
                <span className="poster-title">{g.title}</span>
                <span className="poster-tag">{g.tagline}</span>
                <span className="poster-about">{g.about}</span>
                <span className="poster-foot">
                  <span className="poster-progress" aria-label={`${g.stars} / ${g.max} yulduz`}>
                    <span className="bar"><span style={{ width: `${g.max ? (g.stars / g.max) * 100 : 0}%` }} /></span>
                    ★ {g.stars}/{g.max}
                  </span>
                  <span className="poster-play">{g.stars ? 'Davom etish' : 'Boshlash'}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="hall-section" aria-labelledby="class-title">
        <h2 id="class-title">Sinf bilan</h2>
        <p className="hall-note">Jamoaviy o‘yinlar o‘qituvchi studiyasida sozlanadi va boshlanadi.</p>
        <div className="class-row">
          {CLASS_GAMES.map(({ id, tab, note }) => {
            const g = GAMES[id];
            return (
              <button key={id} className="class-card" onClick={() => { play('tap'); onClass(tab); }}>
                <span className="class-icon" aria-hidden="true">{g.icon}</span>
                <span>
                  <b>{g.title}</b>
                  <small>{note}, {g.grades}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function safeSummary(g) {
  try {
    return g.summary();
  } catch {
    return { stars: 0, max: 0 };
  }
}

/** Har o'yinning o'z sahnasi — afishaning yuqori qismi. */
function Art({ id }) {
  if (id === 'kodbuzar') {
    return (
      <svg className="poster-art" viewBox="0 0 320 170" aria-hidden="true">
        <defs>
          <radialGradient id="kb-glow" cx="50%" cy="55%" r="60%">
            <stop offset="0" stopColor="#7c3aed" stopOpacity="0.55" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="kb-door" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a1a1c4" />
            <stop offset="1" stopColor="#4b4b6e" />
          </linearGradient>
        </defs>
        <rect width="320" height="170" fill="url(#kb-glow)" />
        <g className="kb-safe">
          <rect x="96" y="28" width="128" height="116" rx="18" fill="url(#kb-door)" stroke="#2e2e4d" strokeWidth="4" />
          <g className="kb-dial">
            <circle cx="160" cy="86" r="34" fill="#d4d4e8" stroke="#3b3b5c" strokeWidth="5" />
            <circle cx="160" cy="86" r="12" fill="#6b6b8f" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="160" y1="56" x2="160" y2="62" stroke="#3b3b5c" strokeWidth="3" transform={`rotate(${i * 30} 160 86)`} />
            ))}
          </g>
          {[[108, 40], [212, 40], [108, 132], [212, 132]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="#e4e4f5" />)}
        </g>
        <g className="kb-tiles">
          <rect x="30" y="112" width="34" height="38" rx="8" fill="#22c55e" />
          <text x="47" y="139" textAnchor="middle">4</text>
          <rect x="256" y="30" width="34" height="38" rx="8" fill="#f59e0b" />
          <text x="273" y="57" textAnchor="middle">7</text>
          <rect x="262" y="104" width="34" height="38" rx="8" fill="#475569" />
          <text x="279" y="131" textAnchor="middle">2</text>
        </g>
      </svg>
    );
  }
  if (id === 'soya') {
    return (
      <svg className="poster-art" viewBox="0 0 320 170" aria-hidden="true">
        <defs>
          <linearGradient id="soya-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f2a3d" />
            <stop offset="1" stopColor="#0b0d17" />
          </linearGradient>
        </defs>
        <rect width="320" height="170" fill="url(#soya-sky)" />
        <rect x="0" y="140" width="320" height="30" fill="#1e293b" />
        <rect x="190" y="96" width="70" height="12" rx="3" fill="#334155" />
        {/* lazer */}
        <rect className="soya-laser" x="150" y="40" width="4" height="100" fill="#f43f5e" />
        {/* tugma va eshik */}
        <rect x="40" y="134" width="30" height="6" rx="2" fill="#38bdf8" />
        <rect x="282" y="58" width="16" height="82" rx="3" fill="#38bdf8" opacity="0.7" />
        {/* soya — qahramonning izi */}
        <g className="soya-ghost" opacity="0.45">
          <rect x="44" y="100" width="22" height="34" rx="7" fill="#7dd3fc" />
          <circle cx="55" cy="92" r="9" fill="#7dd3fc" />
        </g>
        {/* qahramon */}
        <g className="soya-hero">
          <rect x="206" y="62" width="22" height="34" rx="7" fill="#f8fafc" />
          <circle cx="217" cy="54" r="9" fill="#f8fafc" />
          <circle cx="220" cy="53" r="2" fill="#0b0d17" />
        </g>
      </svg>
    );
  }
  return null;
}
