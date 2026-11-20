import { useEffect, useState } from 'react';
import { gameIdOfResult, gameOfResult } from '../games/registry.jsx';
import { AWARDS, soloStars } from '../lib/race-rules.js';

const MEDALS = ['🥇', '🥈', '🥉', '4'];

// Raqam 0 dan oxirgi qiymatgacha tez sanab chiqadi.
function CountUp({ value, delay = 0 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (document.documentElement.classList.contains('reduce-motion') || !value) {
      setShown(value);
      return;
    }
    let frame;
    const start = performance.now() + delay;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / 900));
      setShown(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, delay]);
  return shown;
}

export default function Results({ result, onReplay, onAdmin, onReview, adminLabel = 'Sozlamalar' }) {
  // Tartib va ko'rsatkichlar o'yin modulidan olinadi (masalan: poygada qadamlar, robotda yulduzlar).
  const game = gameOfResult(result);
  // Tartib maydonlari ketma-ket solishtiriladi (yo'q maydon — 0, masalan eski natijalardagi tangalar).
  // Natijasi teng jamoalar bir xil o'rinda turadi (quyida `place`).
  const ranked = [...result.teams].sort((a, b) => game.ranking.reduce((d, key) => d || (b[key] || 0) - (a[key] || 0), 0));
  // Shohsupada g'olib o'rtada turadi: 2 — 1 — 3 — 4.
  const stage = ranked.length >= 3 ? [ranked[1], ranked[0], ...ranked.slice(2)] : ranked;
  // Yakka Xazina poygasi: shohsupa o'rniga bitta o'yinchi kartasi va yulduzlar.
  const solo = gameIdOfResult(result) === 'race' && result.teams.length === 1;
  const player = result.teams[0];
  const stars = solo ? soloStars(player, result.trackLength) : 0;

  return (
    <div className="screen results">
      <div className="results-glow" aria-hidden="true" />
      <span className="eyebrow">{result.setName}</span>
      {solo ? (
        <>
          <h1>{player.pos >= result.trackLength ? '💰 Xazina topildi!' : '🧭 Xazinagacha oz qoldi'}</h1>
          <p className="muted">
            {player.pos >= result.trackLength
              ? stars === 3 ? 'Birorta ham xatosiz! Zo‘r natija.' : 'Barakalla! Xato savollarni takrorlab, uch yulduzga intiling.'
              : `${result.trackLength - player.pos} qadam qoldi. Yana urinib ko‘ring!`}
          </p>
          <div className="solo-result" style={{ '--team': player.color }}>
            <div className="podium-hero">{player.hero}</div>
            <h2>{player.name}</h2>
            <div className="win-stars big" aria-label={`${stars} yulduz`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < stars ? 'on' : ''} style={{ '--i': i }}>★</span>
              ))}
            </div>
            <div className="podium-stats">
              {game.stats(player, result).map((s) => (
                <div key={s.label}>
                  <b>
                    {s.prefix}
                    <CountUp value={s.value} delay={400} />
                    {s.suffix}
                  </b>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
      <h1>{result.winner ? <>🏆 {result.winner} g‘olib!</> : '🤝 Durang!'}</h1>
      <p className="muted">Ajoyib o‘yin bo‘ldi. Endi xatolar ustida birga ishlaymiz.</p>
      <div className="podium">
        {stage.map((t) => {
          // Natijasi teng jamoalar bir xil o'rinni egallaydi.
          const place = ranked.findIndex((o) => game.ranking.every((key) => (o[key] || 0) === (t[key] || 0)));
          const order = ranked.indexOf(t);
          return (
            <div key={t.name} className={`podium-col place-${place + 1}`} style={{ '--team': t.color, '--delay': `${(ranked.length - order) * 0.18}s` }}>
              <div className="podium-card">
                <div className="medal">{MEDALS[place]}</div>
                <div className="podium-hero">{t.hero}</div>
                <h2>{t.name}</h2>
                <div className="podium-stats">
                  {game.stats(t, result).map((s) => (
                    <div key={s.label}>
                      <b>
                        {s.prefix}
                        <CountUp value={s.value} delay={400} />
                        {s.suffix}
                      </b>
                      {s.label}
                    </div>
                  ))}
                </div>
                {/* Xazina poygasi nominatsiyalari (2026-11-20 dan; eski natijalarda yo'q). */}
                {result.awards?.some((a) => a.team === t.name && AWARDS[a.id]) && (
                  <div className="podium-awards">
                    {result.awards
                      .filter((a) => a.team === t.name && AWARDS[a.id])
                      .map((a) => (
                        <span key={a.id} title={AWARDS[a.id].title}>
                          {AWARDS[a.id].icon} {AWARDS[a.id].title}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="podium-base">{place + 1}</div>
            </div>
          );
        })}
      </div>
        </>
      )}
      {result.hard?.length > 0 && (
        <div className="panel hard-list">
          <h3>📌 Takrorlash kerak bo‘lgan savollar</h3>
          <ul>
            {result.hard.map((q, i) => (
              <li key={i} style={{ '--i': i }}>
                <span>{q.text}</span> <span className="hard-count">{q.wrong} marta xato</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="row-buttons center">
        {result.hard?.some((item) => item.question) && (
          <button className="btn primary big" onClick={onReview}>
            ✦ Xato savollarni takrorlash
          </button>
        )}
        <button className="btn primary big" onClick={onReplay}>
          🔁 Yana o‘ynash
        </button>
        <button className="btn big" onClick={onAdmin}>
          ← {adminLabel}
        </button>
      </div>
    </div>
  );
}
