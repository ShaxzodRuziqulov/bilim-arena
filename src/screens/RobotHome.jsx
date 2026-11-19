import { uid } from '../lib/util.js';
import { play } from '../lib/sound.js';
import { ROBOT_GAMES, ROBOT_LADDER, ROBOT_PARTS, ladderStars } from '../lib/robot/games.js';
import '../robot-home.css';

// Robot dasturlashning o'z bosh ekrani (Kodbuzar va Soya kabi): logotip, maskot Robi, zinapoya xaritasi,
// davom etish kartasi, Bloklar / Java qismlari va jamoaviy o'yin. Uslubi — robot laboratoriyasi.

const MASCOT = (
  <svg viewBox="0 0 40 44" aria-hidden="true">
    <line x1="20" y1="1" x2="20" y2="7" stroke="currentColor" strokeWidth="2" />
    <circle className="rh-bulb" cx="20" cy="2.5" r="2.5" fill="#ffd36b" />
    <rect x="6" y="8" width="28" height="25" rx="8" fill="currentColor" />
    <rect x="10.5" y="13" width="19" height="9" rx="4.5" fill="#0b1a30" />
    <g className="rh-eyes" fill="currentColor">
      <circle cx="16" cy="17.5" r="2.2" />
      <circle cx="24" cy="17.5" r="2.2" />
    </g>
    <path d="M15 26.5q5 3.5 10 0" fill="none" stroke="#0b1a30" strokeWidth="2" strokeLinecap="round" />
    <rect x="11" y="34" width="6" height="8" rx="3" fill="currentColor" />
    <rect x="23" y="34" width="6" height="8" rx="3" fill="currentColor" />
  </svg>
);

const GLYPHS = ['{ }', '↑', '( )', ';', '⟳', '→', 'for', 'if', 'P', '++', '=='];

export default function RobotHome({ robot, go }) {
  const g = ROBOT_LADDER;
  const steps = g.steps;
  const stars = steps.map((_, i) => ladderStars(robot, i));
  const next = stars.findIndex((s) => !s);
  const allDone = next < 0;
  const target = allDone ? stars.findIndex((s) => s < 3) : next;
  const startAt = target < 0 ? 0 : target;
  const step = steps[startAt];

  const practice = (start) => {
    play('tap');
    go({ name: 'play', game: g.id, key: uid(), config: { game: g.id, mode: 'practice', start, from: 'home' } });
  };

  const total = stars.reduce((a, b) => a + b, 0);
  const javaStart = g.partStart('java');
  const say = allDone
    ? target < 0
      ? 'Hamma darajalar uch yulduz bilan! Siz haqiqiy dasturchisiz.'
      : `Hammasi yechildi! ${startAt + 1}-darajani qisqaroq yechib, uch yulduz oling.`
    : next === 0
      ? 'Salom! Men Robiman. Batareyalarni yig‘ishga yordam berasizmi? Birinchi buyruqdan boshlaymiz!'
      : next === javaStart
        ? 'Bloklar tugadi — zo‘r! Endi xuddi shu ishni haqiqiy Java kodida yozamiz.'
        : `Davom etamiz: ${next + 1}-daraja — «${ROBOT_GAMES[step.part].levelName(step.level)}».`;

  return (
    <div className="rh">
      <div className="rh-bg" aria-hidden="true">
        {GLYPHS.map((ch, i) => (
          <span key={i} style={{ '--i': i, left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}>
            {ch}
          </span>
        ))}
      </div>

      <div className="rh-inner">
        <header className="rh-top">
          <button className="rh-icon" onClick={() => go({ name: 'hall' })} aria-label="O‘yinlar zaliga qaytish" title="O‘yinlar zali">
            ←
          </button>
          <span className="rh-total" title="Jami yulduzlar">
            ★ {total} / {steps.length * 3}
          </span>
        </header>

        <h1 className="rh-logo">
          <span>ROBOT</span>
          <small>dasturlash</small>
        </h1>
        <p className="rh-tag">Bloklardan haqiqiy Java kodigacha · 16 daraja</p>

        <div className="rh-mascot">
          <div className="rh-robi">{MASCOT}</div>
          <p className="rh-bubble">{say}</p>
        </div>

        <div className="rh-ladder" role="list" aria-label="Zinapoya: 16 daraja">
          {steps.map((s, i) => (
            <button
              key={i}
              role="listitem"
              className={`rh-node ${s.part} ${stars[i] ? 'done' : ''} ${i === startAt ? 'here' : ''} ${i === javaStart ? 'gate' : ''}`}
              style={{ '--i': i }}
              title={g.levelLabel(i)}
              onClick={() => practice(i)}
            >
              <b>{i + 1}</b>
              {stars[i] > 0 && <i>{'★'.repeat(stars[i])}</i>}
            </button>
          ))}
        </div>

        <button className="rh-cta" onClick={() => practice(startAt)}>
          <span className="rh-cta-eyebrow">{total ? 'Davom etish' : 'Boshlash'}</span>
          <span className="rh-cta-title">
            {ROBOT_GAMES[step.part].icon} {startAt + 1}. {ROBOT_GAMES[step.part].levelName(step.level)}
          </span>
          <span className="rh-cta-sub">
            {ROBOT_GAMES[step.part].part} · {ROBOT_GAMES[step.part].grades}
          </span>
          <span className="rh-cta-go">O‘ynash ▶</span>
        </button>

        <div className="rh-cards">
          {ROBOT_PARTS.map((p) => {
            const from = g.partStart(p);
            const idx = steps.map((s, i) => (s.part === p ? i : -1)).filter((i) => i >= 0);
            const got = idx.reduce((a, i) => a + stars[i], 0);
            const first = idx.find((i) => !stars[i]) ?? from;
            return (
              <button key={p} className={`rh-card ${p}`} onClick={() => practice(first)}>
                <b>
                  {ROBOT_GAMES[p].icon} {ROBOT_GAMES[p].part}
                </b>
                <small>
                  {from + 1}–{from + idx.length}-daraja · {ROBOT_GAMES[p].grades}
                </small>
                <span className="rh-bar">
                  <i style={{ width: `${(got / (idx.length * 3)) * 100}%` }} />
                </span>
                <small>
                  ★ {got} / {idx.length * 3}
                </small>
              </button>
            );
          })}
          <button className="rh-card team" onClick={() => (play('tap'), go({ name: 'setup', game: g.id }))}>
            <b>👥 Jamoa bilan</b>
            <small>2–4 jamoa doskada navbat bilan</small>
            <small className="rh-card-note">Har daraja — bitta raund</small>
          </button>
        </div>
      </div>
    </div>
  );
}
