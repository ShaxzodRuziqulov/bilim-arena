import { useState } from 'react';
import { playableQuestions, uid } from '../lib/util.js';
import TeamPicker, { freshTeams, pickTeams } from '../components/TeamPicker.jsx';
import { DEFAULT_MECH, MECHANICS, dailySeed, dayKey, questionsFingerprint } from '../lib/race-rules.js';
import { dailyRecord, dailyStorage, dayStreak } from '../lib/race-daily.js';
import '../race-setup.css';

export default function GameSetup({ data, setId, solo = false, go }) {
  const [currentSetId, setCurrentSetId] = useState(setId ?? data.sets[0]?.id);
  const [count, setCount] = useState(solo ? 1 : 2);
  // Yakka o'yinchi uchun standart ism "O‘yinchi" (jamoa nomi emas).
  const [teams, setTeams] = useState(() => freshTeams().map((t, i) => (i === 0 && solo ? { ...t, name: 'O‘yinchi' } : t)));
  const isSolo = count === 1;
  const [time, setTime] = useState(data.settings.time);
  const [trackLength, setTrackLength] = useState(data.settings.trackLength);

  const [theme, setTheme] = useState('adventure');
  // Qo'shimcha qoidalar: standart holatda hammasi yoqilgan, o'qituvchi istaganini o'chiradi.
  const [mech, setMech] = useState(DEFAULT_MECH);
  // Ilib olish — faqat jamoalarda, jonlar — faqat yakka o'yinda.
  const shownMechanics = MECHANICS.filter((m) => (isSolo ? !m.teamsOnly : !m.soloOnly));

  const set = data.sets.find((s) => s.id === currentSetId);
  const questions = set ? playableQuestions(set) : [];

  // Kunlik sarguzasht: bugungi xarita va savollar tartibi sana + to'plamga bog'liq.
  // Rekord to'plam tarkibiga ham bog'liq: savollar o'zgarsa, bugun uchun yangi rekord boshlanadi.
  const today = dayKey();
  const fingerprint = questions.length ? `${questionsFingerprint(questions)}-${trackLength}` : '';
  const todayBest = isSolo && set ? dailyRecord(dailyStorage(), today, set.id, fingerprint) : null;
  const streakDays = isSolo ? dayStreak(dailyStorage(), today) : 0;

  const start = (isDaily = false) =>
    go({
      name: 'play',
      game: 'race',
      key: uid(),
      config: {
        setId: set.id,
        setName: set.name,
        subject: set.subject,
        grade: set.grade,
        theme,
        mech,
        seed: isDaily ? dailySeed(today, set.id) : Math.floor(Math.random() * 2 ** 31),
        ...(isDaily ? { daily: today } : {}),
        questions,
        teams: pickTeams(teams, count),
        time,
        trackLength,
      },
    });

  return (
    <div className="screen admin race-setup">
      {/* Xazina poygasining o'z kirish ekrani: dengiz, orol va oltin sarlavha. */}
      <div className="rs-sea" aria-hidden="true">
        <i /><i /><i />
      </div>
      <header className="topbar">
        <button className="btn" onClick={() => go({ name: 'admin' })} aria-label="O‘yinlar zaliga qaytish">
          ←
        </button>
        <span className="spacer" />
      </header>
      <div className="rs-hero">
        <svg className="rs-island" viewBox="0 0 120 70" aria-hidden="true">
          <ellipse cx="60" cy="58" rx="52" ry="10" fill="#f6d68f" />
          <path d="M52 54 q3 -22 -5 -38" fill="none" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
          <path className="rs-palm" d="M47 16 q-18 -4 -28 6 M47 16 q-4 -16 -20 -18 M47 16 q10 -14 26 -10 M47 16 q16 2 22 15" fill="none" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
          <rect x="66" y="40" width="26" height="16" rx="3" fill="#b45309" />
          <path d="M66 43 q13 -10 26 0 v-1 q-13 -9 -26 0z" fill="#d97706" />
          <rect x="66" y="40" width="26" height="4" rx="2" fill="#d97706" />
          <circle className="rs-coin" cx="79" cy="39" r="4" fill="#fde047" />
          <rect x="77.5" y="45" width="3" height="5" rx="1" fill="#fde047" />
        </svg>
        <h1 className="rs-logo">
          <span>XAZINA</span>
          <small>poygasi</small>
        </h1>
        <p className="rs-tag">{isSolo ? 'Yakka sarguzasht: savollarga javob berib, xazinaga yeting' : 'Jamoalar navbat bilan savol yechib, xazina tomon yuradi'}</p>
      </div>
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
          <label className="mt">Qo‘shimcha qoidalar</label>
          <div className="mech-list">
            {shownMechanics.map((m) => (
              <label key={m.id} className={`mech-item ${mech[m.id] ? 'on' : ''}`}>
                <input type="checkbox" checked={mech[m.id]} onChange={(e) => setMech((x) => ({ ...x, [m.id]: e.target.checked }))} />
                <span>
                  <b>{m.title}</b>
                  <small>{m.text}</small>
                </span>
              </label>
            ))}
          </div>
          {isSolo ? (
            <div className="rules note">
              <b>Yakka o‘yin:</b> savollarga ketma-ket javob berasiz. To‘g‘ri javob — 1 qadam oldinga, xato javobda joyda qolasiz.
              ⭐ katak +1 bonus qadam, 🌀 girdob 1 qadam orqaga. Xazinaga yetganingizda aniqlikka qarab yulduz olasiz:
              xatosiz — ★★★, 75% va undan yuqori — ★★, qolgani — ★.
            </div>
          ) : (
          <div className="rules note">
            <b>Qoidalar:</b> jamoalar navbat bilan doskaga chiqadi. To‘g‘ri javob — 1 qadam oldinga.
            ⭐ katakka tushsangiz +1 bonus qadam, 🌀 girdobga tushsangiz 1 qadam orqaga (har bir maxsus katak
            jamoaga bir marta ta’sir qiladi, kataklar hamma uchun bir joyda). Bir jamoa xazinaga yetgach, davra oxirigacha qolgan jamoalar ham navbatini o‘ynaydi. Avval qadamlar, keyin to‘g‘ri javoblar, keyin tangalar solishtiriladi. Hammasi teng bo‘lsa — durang. Har navbatda boshqa o‘quvchi chiqsin.
          </div>
          )}
        </div>

        <div className="panel">
          <h3>3. Kim o‘ynaydi</h3>
          <TeamPicker count={count} setCount={setCount} teams={teams} setTeams={setTeams} allowSolo />
          {/* Telefonda bu tugma ekran pastiga mahkamlanadi (setup-start) — sozlamalarni surib o'tirish shart emas. */}
          <div className="setup-start">
            <button className="btn primary big full" disabled={questions.length === 0} onClick={() => start(false)}>
              ▶ O‘yinni boshlash
            </button>
          </div>
          {isSolo && (
            <div className="daily-box">
              <button className="btn gold big full" disabled={questions.length === 0} onClick={() => start(true)}>
                🗓 Kunlik sarguzasht
              </button>
              <small>
                Bugungi xarita hamma uchun bir xil, ertaga yangisi.{' '}
                {todayBest ? `Bugungi rekord: ${'★'.repeat(todayBest.stars) || '—'} · ${todayBest.pos}/${trackLength} qadam.` : 'Bugun hali o‘ynalmagan.'}
                {streakDays > 1 && ` 🔥 ${streakDays} kun ketma-ket.`}
              </small>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
