import { SOLO_GAMES } from '../games/registry.jsx';
import { ROBOT_LADDER, ladderTotal } from '../lib/robot/games.js';
import { playableQuestions } from '../lib/util.js';
import { play } from '../lib/sound.js';
import '../hall.css';

// O'yinlar zali — platformaning bosh ekrani. Barcha o'yinlar bir xil afishada va shu yerning o'zidan ochiladi;
// o'yindan chiqqanda yana shu zalga qaytiladi. Sozlamalar (⚙) — barcha o'yinlar uchun umumiy va har o'yinning o'z sozlamalari.

const LAST_KEY = 'platforma-oxirgi-oyin';
export const rememberLastGame = (id) => {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    /* saqlab bo'lmadi — zal baribir ishlaydi */
  }
};
// Eski versiyalarda Robo Kod va Java Robot alohida o'yin edi — endi ikkalasi ham Robot dasturlash.
const OLD_IDS = { kod: 'robot', java: 'robot' };
const lastGameId = () => {
  try {
    const id = localStorage.getItem(LAST_KEY);
    return OLD_IDS[id] || id;
  } catch {
    return null;
  }
};


/** Zaldagi har bir o'yin: afisha ma'lumoti va uni ochadigan amallar (birinchisi — asosiy). */
function buildGames(data) {
  const readySet = data.sets.find((s) => playableQuestions(s).length);
  const raceGames = data.history.filter((h) => h.kind !== 'robot').length;
  const solo = (g) => {
    const { stars, max } = safeSummary(g);
    return {
      id: g.id, title: g.title, mode: 'Yakka', tagline: g.tagline, about: g.about, stars, max,
      actions: [{ label: stars ? 'Davom etish' : 'Boshlash', next: { name: 'solo', game: g.id } }],
    };
  };
  const robot = () => {
    const g = ROBOT_LADDER;
    const stars = ladderTotal(data.robot);
    return {
      id: g.id, title: g.title, mode: `Yakka yoki jamoa, ${g.grades}`, tagline: 'Bloklardan haqiqiy Java kodigacha', about: g.about,
      stars, max: g.steps.length * 3,
      actions: [
        { label: stars ? 'Davom etish' : 'Boshlash', next: { name: 'setup', game: g.id, home: true } },
        { label: 'Jamoa bilan', next: { name: 'setup', game: g.id } },
      ],
    };
  };
  return [
    solo(SOLO_GAMES.kodbuzar),
    solo(SOLO_GAMES.soya),
    robot(),
    {
      id: 'race', title: 'Xazina poygasi', mode: 'Yakka yoki 2–4 jamoa, 5–11-sinf', tagline: 'Savollarga javob berib, xazinaga yeting',
      about: 'Yakka yoki jamoalar bilan savol yechib xazina tomon yuring: to‘g‘ri javob — bir qadam oldinga. Bonus va girdob kataklari bor.',
      note: raceGames ? `${raceGames} ta o‘yin o‘ynalgan` : 'Hali o‘ynalmagan',
      actions: [
        { label: 'Yakka o‘ynash', next: { name: 'setup', game: 'race', setId: readySet?.id, solo: true }, disabled: !readySet },
        { label: 'Jamoa bilan', next: { name: 'setup', game: 'race', setId: readySet?.id }, disabled: !readySet },
      ],
      warning: readySet ? null : 'Savollarni ⚙ Sozlamalar → O‘yinlar → Xazina poygasida tayyorlang',
    },
  ];
}

export default function Hall({ data, onStart, onStudio, onQuit, soundOn, onToggleSound }) {
  const games = buildGames(data);
  const totalStars = games.reduce((s, g) => s + (g.stars || 0), 0);
  const last = games.find((g) => g.id === lastGameId());

  const start = (next) => {
    play('tap');
    onStart(next);
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
        <button className="hall-icon hall-sound" onClick={onToggleSound} aria-pressed={soundOn}
          aria-label={soundOn ? 'Barcha o‘yinlarda ovozni o‘chirish' : 'Ovozni yoqish'} title={soundOn ? 'Ovoz yoqiq — barcha o‘yinlarda' : 'Ovoz o‘chiq — barcha o‘yinlarda'}>
          {soundOn ? '🔊' : '🔇'}
        </button>
        <button className="hall-icon" onClick={onStudio} aria-label="Sozlamalar" title="Sozlamalar: barcha o‘yinlar, savollar, natijalar">⚙</button>
        {onQuit && <button className="btn" onClick={onQuit}>Chiqish</button>}
      </header>

      {last && !last.actions[0].disabled && (
        <button className="hall-continue" onClick={() => start(last.actions[0].next)}>
          <span className="hall-continue-art" aria-hidden="true"><Art id={last.id} /></span>
          <span>
            <b>{last.title}: {last.actions[0].label.toLowerCase()}</b>
            <small>Oxirgi marta shu o‘yinni o‘ynagansiz</small>
          </span>
          <span className="hall-continue-go" aria-hidden="true">▶</span>
        </button>
      )}

      <section className="hall-section" aria-labelledby="games-title">
        <h2 id="games-title">O‘yinlar</h2>
        <div className="posters">
          {games.map((g) => (
            // Kartaning istalgan joyini bosish asosiy amalni boshlaydi (telefonda qulay); tugmalar o'z ishini qiladi.
            <article key={g.id} className={`poster poster-${g.id}`}
              onClick={(e) => { if (!e.target.closest('button') && !g.actions[0].disabled) start(g.actions[0].next); }}>
              <button className="poster-art-btn" onClick={() => start(g.actions[0].next)} disabled={g.actions[0].disabled}
                aria-label={`${g.title}: ${g.actions[0].label}`}>
                <Art id={g.id} />
              </button>
              <div className="poster-body">
                <span className="poster-mode">{g.mode}</span>
                <h3 className="poster-title">{g.title}</h3>
                <span className="poster-tag">{g.tagline}</span>
                <p className="poster-about">{g.about}</p>
                <div className="poster-foot">
                  {g.max ? (
                    <span className="poster-progress" aria-label={`${g.stars} / ${g.max} yulduz`}>
                      <span className="bar"><span style={{ width: `${(g.stars / g.max) * 100}%` }} /></span>
                      ★ {g.stars}/{g.max}
                    </span>
                  ) : (
                    <span className="poster-note">{g.warning || g.note}</span>
                  )}
                  <span className="poster-actions">
                    {g.actions.map((a, i) => (
                      <button key={a.label} className={i === 0 ? 'poster-play' : 'poster-alt'} disabled={a.disabled} onClick={() => start(a.next)}>
                        {a.label}
                      </button>
                    ))}
                  </span>
                </div>
              </div>
            </article>
          ))}
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

/** Har o'yinning o'z sahnasi — afishaning yuqori qismi. Bitta harakat: kursor ustiga kelganda. */
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
        <rect x="96" y="28" width="128" height="116" rx="18" fill="url(#kb-door)" stroke="#2e2e4d" strokeWidth="4" />
        <g className="kb-dial">
          <circle cx="160" cy="86" r="34" fill="#d4d4e8" stroke="#3b3b5c" strokeWidth="5" />
          <circle cx="160" cy="86" r="12" fill="#6b6b8f" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="160" y1="56" x2="160" y2="62" stroke="#3b3b5c" strokeWidth="3" transform={`rotate(${i * 30} 160 86)`} />
          ))}
        </g>
        {[[108, 40], [212, 40], [108, 132], [212, 132]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="#e4e4f5" />)}
        <rect x="30" y="112" width="34" height="38" rx="8" fill="#22c55e" />
        <text x="47" y="139" textAnchor="middle">4</text>
        <rect x="256" y="30" width="34" height="38" rx="8" fill="#f59e0b" />
        <text x="273" y="57" textAnchor="middle">7</text>
        <rect x="262" y="104" width="34" height="38" rx="8" fill="#475569" />
        <text x="279" y="131" textAnchor="middle">2</text>
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
        <rect className="soya-laser" x="150" y="40" width="4" height="100" fill="#f43f5e" />
        <rect x="40" y="134" width="30" height="6" rx="2" fill="#38bdf8" />
        <rect x="282" y="58" width="16" height="82" rx="3" fill="#38bdf8" opacity="0.7" />
        <g className="soya-ghost" opacity="0.45">
          <rect x="44" y="100" width="22" height="34" rx="7" fill="#7dd3fc" />
          <circle cx="55" cy="92" r="9" fill="#7dd3fc" />
        </g>
        <rect x="206" y="62" width="22" height="34" rx="7" fill="#f8fafc" />
        <circle cx="217" cy="54" r="9" fill="#f8fafc" />
        <circle cx="220" cy="53" r="2" fill="#0b0d17" />
      </svg>
    );
  }
  if (id === 'robot') {
    // Zinapoya: chapda to'rda robot, o'ngda avval buyruq bloklari, pastda xuddi shu harakat Java kodida.
    return (
      <svg className="poster-art" viewBox="0 0 320 170" aria-hidden="true">
        <rect width="320" height="170" fill="#0d2a22" />
        <g opacity="0.35" stroke="#34d399" strokeWidth="1">
          {Array.from({ length: 6 }, (_, i) => <line key={`v${i}`} x1={20 + i * 30} y1="20" x2={20 + i * 30} y2="140" />)}
          {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="20" y1={20 + i * 30} x2="170" y2={20 + i * 30} />)}
        </g>
        <path className="kod-path" d="M65 125 V65 H125" fill="none" stroke="#fbbf24" strokeWidth="4" strokeDasharray="6 6" />
        <rect x="110" y="35" width="30" height="30" rx="6" fill="#fbbf24" opacity="0.9" />
        <text x="125" y="57" textAnchor="middle" className="art-dark">★</text>
        <g className="kod-robot">
          <rect x="52" y="112" width="26" height="24" rx="6" fill="#a7f3d0" />
          <circle cx="60" cy="122" r="3" fill="#064e3b" />
          <circle cx="70" cy="122" r="3" fill="#064e3b" />
          <line x1="65" y1="112" x2="65" y2="104" stroke="#a7f3d0" strokeWidth="3" />
        </g>
        {['↑', '↑', '→'].map((ch, i) => (
          <g key={i} transform={`translate(${186 + i * 42} 20)`}>
            <rect width="36" height="26" rx="7" fill="#10b981" />
            <text x="18" y="19" textAnchor="middle">{ch}</text>
          </g>
        ))}
        <path className="robot-step" d="M247 52 v18 m-6 -6 l6 6 l6 -6" fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" />
        <rect x="184" y="78" width="128" height="72" rx="8" fill="#1c1008" stroke="#7c4a1e" />
        {[
          // O'yindagi haqiqiy buyruqlar (src/lib/robot/java.js).
          ['robot.yur();', '#fde68a'],
          ['robot.yur();', '#fde68a'],
          ['robot.ongga();', '#fb923c'],
        ].map(([line, c], i) => (
          <text key={i} x="194" y={99 + i * 18} className="art-code">
            <tspan fill={c}>{line}</tspan>
          </text>
        ))}
      </svg>
    );
  }
  if (id === 'race') {
    return (
      <svg className="poster-art" viewBox="0 0 320 170" aria-hidden="true">
        <rect width="320" height="170" fill="#0c3b4a" />
        <path d="M0 120 q40 -10 80 0 t80 0 t80 0 t80 0 V170 H0z" fill="#0e5266" opacity="0.8" />
        <ellipse cx="236" cy="112" rx="70" ry="22" fill="#f6d68f" />
        <g className="race-palm">
          <path d="M226 106 q4 -30 -6 -52" fill="none" stroke="#92400e" strokeWidth="6" strokeLinecap="round" />
          <path d="M220 54 q-24 -6 -38 8 M220 54 q-6 -22 -26 -26 M220 54 q14 -18 34 -14 M220 54 q22 2 30 20" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" />
        </g>
        <rect x="252" y="92" width="30" height="20" rx="3" fill="#b45309" />
        <rect x="252" y="88" width="30" height="8" rx="3" fill="#d97706" />
        <circle className="race-gold" cx="267" cy="92" r="4" fill="#fde047" />
        {[30, 62, 94, 126, 158].map((x, i) => (
          <circle key={x} cx={x} cy={140 - i * 6} r="9" fill={i === 2 ? '#fbbf24' : '#e0f2fe'} opacity={i === 2 ? 1 : 0.75} />
        ))}
        <circle className="race-team" cx="62" cy="134" r="7" fill="#f43f5e" />
        <circle className="race-team b" cx="30" cy="140" r="7" fill="#38bdf8" />
      </svg>
    );
  }
  return null;
}
