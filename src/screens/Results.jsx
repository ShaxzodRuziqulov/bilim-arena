const MEDALS = ['🥇', '🥈', '🥉', '4'];

export default function Results({ result, onReplay, onAdmin }) {
  const ranked = [...result.teams].sort((a, b) => b.pos - a.pos || b.correct - a.correct);

  return (
    <div className="screen results">
      <h1>🏆 Natijalar</h1>
      <p className="muted">
        {result.setName} · {result.winner ? `G‘olib: ${result.winner}` : 'Durang'}
      </p>
      <div className="podium">
        {ranked.map((t, i) => {
          const total = t.correct + t.wrong;
          // Natijasi teng jamoalar bir xil o'rinni egallaydi.
          const place = ranked.findIndex((o) => o.pos === t.pos && o.correct === t.correct);
          return (
            <div key={t.name} className={`podium-card place-${place + 1}`} style={{ '--team': t.color }}>
              <div className="medal">{MEDALS[place]}</div>
              <div className="podium-hero">{t.hero}</div>
              <h2>{t.name}</h2>
              <div className="podium-stats">
                <div>
                  <b>
                    {t.pos}/{result.trackLength}
                  </b>
                  qadam
                </div>
                <div>
                  <b>{t.correct}</b>to‘g‘ri
                </div>
                <div>
                  <b>{total ? Math.round((t.correct / total) * 100) : 0}%</b>aniqlik
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {result.hard.length > 0 && (
        <div className="panel hard-list">
          <h3>📌 Takrorlash kerak bo‘lgan savollar</h3>
          <ul>
            {result.hard.map((q, i) => (
              <li key={i}>
                {q.text} <span className="muted">— {q.wrong} marta xato</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="row-buttons center">
        <button className="btn primary big" onClick={onReplay}>
          🔁 Yana o‘ynash
        </button>
        <button className="btn big" onClick={onAdmin}>
          🔒 O‘qituvchi paneli
        </button>
      </div>
    </div>
  );
}
