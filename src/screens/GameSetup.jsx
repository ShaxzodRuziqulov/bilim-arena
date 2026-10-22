import { useState } from 'react';
import { playableQuestions, uid } from '../lib/util.js';

export const TEAM_PRESETS = [
  { name: 'Qizillar', color: '#ff5c7a', hero: '🦊' },
  { name: 'Ko‘klar', color: '#4da3ff', hero: '🧑‍🚀' },
  { name: 'Yashillar', color: '#3fe0a0', hero: '🐢' },
  { name: 'Sariqlar', color: '#ffc94d', hero: '🦁' },
];
const HEROES = ['🦊', '🧑‍🚀', '🐢', '🦁', '🥷', '🧙', '🤖', '🐼', '🐉', '🦉', '🐬', '🦄'];

export default function GameSetup({ data, setId, go }) {
  const [currentSetId, setCurrentSetId] = useState(setId ?? data.sets[0]?.id);
  const [count, setCount] = useState(2);
  const [teams, setTeams] = useState(TEAM_PRESETS.map((t) => ({ ...t })));
  const [time, setTime] = useState(data.settings.time);
  const [trackLength, setTrackLength] = useState(data.settings.trackLength);

  const set = data.sets.find((s) => s.id === currentSetId);
  const questions = set ? playableQuestions(set) : [];

  const editTeam = (i, patch) => setTeams((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const nextHero = (i) => editTeam(i, { hero: HEROES[(HEROES.indexOf(teams[i].hero) + 1) % HEROES.length] });

  const start = () =>
    go({
      name: 'race',
      key: uid(),
      config: {
        setName: set.name,
        questions,
        teams: teams.slice(0, count).map((t, i) => ({ ...t, id: i, name: t.name.trim() || TEAM_PRESETS[i].name })),
        time,
        trackLength,
      },
    });

  return (
    <div className="screen admin">
      <header className="topbar">
        <button className="btn" onClick={() => go({ name: 'admin' })}>
          ← Orqaga
        </button>
        <strong>🏝️ Xazina poygasi — tayyorgarlik</strong>
      </header>
      <main className="admin-main setup">
        <div className="panel">
          <h3>1. Savol to‘plami</h3>
          <select value={currentSetId} onChange={(e) => setCurrentSetId(e.target.value)}>
            {data.sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({playableQuestions(s).length} ta savol)
              </option>
            ))}
          </select>
          {questions.length > 0 && questions.length < trackLength && (
            <p className="note">
              ℹ Savollar soni ({questions.length}) qadamlardan kam — savollar takrorlanishi mumkin.
            </p>
          )}

          <h3 className="mt">2. Sozlamalar</h3>
          <div className="two-col">
            <div>
              <label>Savol uchun vaqt</label>
              <select value={time} onChange={(e) => setTime(Number(e.target.value))}>
                {[15, 20, 30, 45, 60, 90, 0].map((t) => (
                  <option key={t} value={t}>
                    {t ? `${t} soniya` : 'Cheklanmagan'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Xazinagacha qadamlar</label>
              <select value={trackLength} onChange={(e) => setTrackLength(Number(e.target.value))}>
                {[8, 10, 12, 16, 20].map((n) => (
                  <option key={n} value={n}>
                    {n} qadam
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rules note">
            <b>Qoidalar:</b> jamoalar navbat bilan doskaga chiqadi. To‘g‘ri javob — 1 qadam oldinga.
            ⭐ katakka tushsangiz +1 bonus qadam, 🌀 girdobga tushsangiz 1 qadam orqaga (har bir katak
            jamoaga bir marta ta’sir qiladi). Xazinaga birinchi yetgan jamoa g‘olib!
          </div>
        </div>

        <div className="panel">
          <h3>3. Jamoalar</h3>
          <div className="segmented">
            {[2, 3, 4].map((n) => (
              <button key={n} className={count === n ? 'active' : ''} onClick={() => setCount(n)}>
                {n} jamoa
              </button>
            ))}
          </div>
          <div className="team-edit-list">
            {teams.slice(0, count).map((t, i) => (
              <div key={i} className="team-edit" style={{ borderColor: t.color }}>
                <button className="hero-pick" style={{ background: t.color + '33' }} onClick={() => nextHero(i)} title="Qahramonni almashtirish">
                  {t.hero}
                </button>
                <input value={t.name} onChange={(e) => editTeam(i, { name: e.target.value })} />
              </div>
            ))}
          </div>
          <p className="note small">Qahramonni almashtirish uchun uning ustiga bosing.</p>
          <button className="btn primary big full" disabled={questions.length === 0} onClick={start}>
            ▶ O‘yinni boshlash
          </button>
        </div>
      </main>
    </div>
  );
}
