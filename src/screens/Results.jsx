import { useEffect, useState } from 'react';

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

export default function Results({ result, onReplay, onAdmin, onReview }) {
  const robot = result.kind === 'robot';
  // Robot o'yinlarida tartib yulduzlar bo'yicha, poygada — qadamlar bo'yicha.
  const main = robot ? 'score' : 'pos';
  const second = robot ? 'solved' : 'correct';
  const ranked = [...result.teams].sort((a, b) => b[main] - a[main] || b[second] - a[second]);
  // Shohsupada g'olib o'rtada turadi: 2 — 1 — 3 — 4.
  const stage = ranked.length >= 3 ? [ranked[1], ranked[0], ...ranked.slice(2)] : ranked;

  return (
    <div className="screen results">
      <div className="results-glow" aria-hidden="true" />
      <span className="eyebrow">{result.setName}</span>
      <h1>{result.winner ? <>🏆 {result.winner} g‘olib!</> : '🤝 Durang!'}</h1>
      <p className="muted">Ajoyib o‘yin bo‘ldi. Endi xatolar ustida birga ishlaymiz.</p>
      <div className="podium">
        {stage.map((t) => {
          const total = t.correct + t.wrong;
          // Natijasi teng jamoalar bir xil o'rinni egallaydi.
          const place = ranked.findIndex((o) => o[main] === t[main] && o[second] === t[second]);
          const order = ranked.indexOf(t);
          return (
            <div key={t.name} className={`podium-col place-${place + 1}`} style={{ '--team': t.color, '--delay': `${(ranked.length - order) * 0.18}s` }}>
              <div className="podium-card">
                <div className="medal">{MEDALS[place]}</div>
                <div className="podium-hero">{t.hero}</div>
                <h2>{t.name}</h2>
                {robot ? (
                  <div className="podium-stats">
                    <div>
                      <b>
                        ★ <CountUp value={t.score} delay={400} />
                      </b>
                      {result.maxScore} dan
                    </div>
                    <div>
                      <b>
                        <CountUp value={t.solved} delay={400} />/{result.rounds}
                      </b>
                      daraja
                    </div>
                    <div>
                      <b>
                        <CountUp value={result.rounds ? Math.round((t.solved / result.rounds) * 100) : 0} delay={400} />%
                      </b>
                      yechildi
                    </div>
                  </div>
                ) : (
                  <div className="podium-stats">
                    <div>
                      <b>
                        <CountUp value={t.pos} delay={400} />/{result.trackLength}
                      </b>
                      qadam
                    </div>
                    <div>
                      <b>
                        <CountUp value={t.correct} delay={400} />
                      </b>
                      to‘g‘ri
                    </div>
                    <div>
                      <b>
                        <CountUp value={total ? Math.round((t.correct / total) * 100) : 0} delay={400} />%
                      </b>
                      aniqlik
                    </div>
                  </div>
                )}
              </div>
              <div className="podium-base">{place + 1}</div>
            </div>
          );
        })}
      </div>
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
          ← Dars studiyasi
        </button>
      </div>
    </div>
  );
}
