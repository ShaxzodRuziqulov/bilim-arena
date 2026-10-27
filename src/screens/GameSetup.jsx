import { useState } from 'react';
import { playableQuestions, uid } from '../lib/util.js';
import TeamPicker, { freshTeams, pickTeams } from '../components/TeamPicker.jsx';

export default function GameSetup({ data, setId, go }) {
  const [currentSetId, setCurrentSetId] = useState(setId ?? data.sets[0]?.id);
  const [count, setCount] = useState(2);
  const [teams, setTeams] = useState(freshTeams);
  const [time, setTime] = useState(data.settings.time);
  const [trackLength, setTrackLength] = useState(data.settings.trackLength);

  const [theme, setTheme] = useState('adventure');

  const set = data.sets.find((s) => s.id === currentSetId);
  const questions = set ? playableQuestions(set) : [];

  const start = () =>
    go({
      name: 'race',
      key: uid(),
      config: {
        setName: set.name,
        subject: set.subject,
        grade: set.grade,
        theme,
        questions,
        teams: pickTeams(teams, count),
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
          <label>O‘yin muhiti</label>
          <div className="theme-picker"><button className={theme === 'adventure' ? 'selected' : ''} onClick={() => setTheme('adventure')}><span>🏝️</span><b>Sarguzasht</b><small>Rangli orol va xazina</small></button><button className={theme === 'arena' ? 'selected' : ''} onClick={() => setTheme('arena')}><span>◆</span><b>Bilim maydoni</b><small>Sokin ranglar va aniq yo‘l</small></button></div>
          <div className="rules note">
            <b>Qoidalar:</b> jamoalar navbat bilan doskaga chiqadi. To‘g‘ri javob — 1 qadam oldinga.
            ⭐ katakka tushsangiz +1 bonus qadam, 🌀 girdobga tushsangiz 1 qadam orqaga (har bir katak
            jamoaga bir marta ta’sir qiladi). Bir jamoa xazinaga yetgach, davra oxirigacha qolgan jamoalar ham navbatini o‘ynaydi. Avval qadamlar, keyin to‘g‘ri javoblar soni solishtiriladi. Ikkalasi teng bo‘lsa — durang. Har navbatda boshqa o‘quvchi chiqsin.
          </div>
        </div>

        <div className="panel">
          <h3>3. Jamoalar</h3>
          <TeamPicker count={count} setCount={setCount} teams={teams} setTeams={setTeams} />
          <button className="btn primary big full" disabled={questions.length === 0} onClick={start}>
            ▶ O‘yinni boshlash
          </button>
        </div>
      </main>
    </div>
  );
}
