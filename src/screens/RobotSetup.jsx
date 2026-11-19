import { useState } from 'react';
import { uid } from '../lib/util.js';
import { ROBOT_GAMES, ROBOT_LADDER, ROBOT_PARTS } from '../lib/robot/games.js';
import TeamPicker, { freshTeams, pickTeams } from '../components/TeamPicker.jsx';

const ATTEMPTS = [2, 3, 5];
const TURN_TIMES = [0, 120, 180, 300, 600];

export default function RobotSetup({ go }) {
  const g = ROBOT_LADDER;
  const game = g.id;
  const last = g.steps.length - 1;
  const [count, setCount] = useState(2);
  const [teams, setTeams] = useState(freshTeams);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.min(last, 4));
  const [attempts, setAttempts] = useState(3);
  // Vaqt tanlanmaguncha: oraliqda Java darsi bo'lsa 5 daqiqa, faqat bloklar bo'lsa 3 daqiqa.
  const [chosenTime, setTurnTime] = useState(null);

  const levels = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const parts = ROBOT_PARTS.filter((p) => levels.some((i) => g.steps[i].part === p));
  const turnTime = chosenTime ?? Math.max(...parts.map((p) => ROBOT_GAMES[p].turnTime));
  // Tez tanlash: butun qism yoki butun zinapoya.
  const ranges = [
    ...ROBOT_PARTS.map((p) => {
      const a = g.partStart(p);
      return { label: `${ROBOT_GAMES[p].icon} ${ROBOT_GAMES[p].part} (${ROBOT_GAMES[p].grades})`, from: a, to: a + ROBOT_GAMES[p].levels.length - 1 };
    }),
    { label: '🤖 Butun zinapoya', from: 0, to: last },
  ];

  const start = () =>
    go({
      name: 'play',
      game,
      key: uid(),
      config: { game, mode: 'team', teams: pickTeams(teams, count), levels, attempts, turnTime },
    });

  return (
    <div className="screen admin">
      <header className="topbar">
        <button className="btn" onClick={() => go({ name: 'setup', game, home: true })}>
          ← Orqaga
        </button>
        <strong>
          {g.icon} {g.title} — jamoaviy o‘yin
        </strong>
      </header>
      <main className="admin-main setup">
        <div className="panel">
          <h3>1. Darajalar</h3>
          <div className="row-buttons">
            {ranges.map((r) => (
              <button key={r.label} className={`btn ${from === r.from && to === r.to ? 'primary' : ''}`} onClick={() => { setFrom(r.from); setTo(r.to); }}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="two-col">
            <div>
              <label>Qaysi darajadan</label>
              <select
                value={from}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFrom(v);
                  if (to < v) setTo(v);
                }}
              >
                {g.steps.map((_, i) => (
                  <option key={i} value={i}>
                    {g.levelLabel(i)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Qaysi darajagacha</label>
              <select value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {g.steps.map((_, i) => (
                  <option key={i} value={i} disabled={i < from}>
                    {g.levelLabel(i)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="mt">2. Sozlamalar</h3>
          <div className="two-col">
            <div>
              <label>Har navbatda urinishlar</label>
              <select value={attempts} onChange={(e) => setAttempts(Number(e.target.value))}>
                {ATTEMPTS.map((n) => (
                  <option key={n} value={n}>
                    {n} ta urinish
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Navbat uchun vaqt</label>
              <select value={turnTime} onChange={(e) => setTurnTime(Number(e.target.value))}>
                {TURN_TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t ? `${t / 60} daqiqa` : 'Cheklanmagan'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rules note">
            <b>Qoidalar:</b> har bir daraja — bitta raund. Raundda jamoalar navbat bilan doskaga chiqib, o‘sha darajani
            yechadi (har raundda birinchi bo‘lib boshqa jamoa chiqadi). {parts.map((p) => ROBOT_GAMES[p].scoring).join(' ')} Har bir xato urinish 1 yulduzni
            kamaytiradi (yechilsa kamida 1 ★). Urinishlar yoki vaqt tugasa — 0 ★. Eng ko‘p yulduz yiqqan jamoa g‘olib!
            <br />
            Jami: <b>{levels.length}</b> raund × <b>{count}</b> jamoa.
          </div>
        </div>

        <div className="panel">
          <h3>3. Jamoalar</h3>
          <TeamPicker count={count} setCount={setCount} teams={teams} setTeams={setTeams} />
          <button className="btn primary big full" onClick={start}>
            ▶ O‘yinni boshlash
          </button>
        </div>
      </main>
    </div>
  );
}
