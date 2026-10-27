import { useState } from 'react';
import { uid } from '../lib/util.js';
import { ROBOT_GAMES } from '../lib/robot/games.js';
import TeamPicker, { freshTeams, pickTeams } from '../components/TeamPicker.jsx';

const ATTEMPTS = [2, 3, 5];
const TURN_TIMES = [0, 120, 180, 300, 600];

export default function RobotSetup({ game, go }) {
  const g = ROBOT_GAMES[game];
  const last = g.levels.length - 1;
  const [count, setCount] = useState(2);
  const [teams, setTeams] = useState(freshTeams);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(Math.min(last, 4));
  const [attempts, setAttempts] = useState(3);
  const [turnTime, setTurnTime] = useState(game === 'java' ? 300 : 180);

  const levels = Array.from({ length: to - from + 1 }, (_, i) => from + i);

  const start = () =>
    go({
      name: 'robot',
      key: uid(),
      config: { game, mode: 'team', teams: pickTeams(teams, count), levels, attempts, turnTime },
    });

  return (
    <div className="screen admin">
      <header className="topbar">
        <button className="btn" onClick={() => go({ name: 'admin', tab: 'robot' })}>
          ← Orqaga
        </button>
        <strong>
          {g.icon} {g.title} — jamoaviy o‘yin
        </strong>
      </header>
      <main className="admin-main setup">
        <div className="panel">
          <h3>1. Darajalar</h3>
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
                {g.levels.map((l, i) => (
                  <option key={i} value={i}>
                    {g.levelLabel(l, i)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Qaysi darajagacha</label>
              <select value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {g.levels.map((l, i) => (
                  <option key={i} value={i} disabled={i < from}>
                    {g.levelLabel(l, i)}
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
            yechadi (har raundda birinchi bo‘lib boshqa jamoa chiqadi). {g.scoring} Har bir xato urinish 1 yulduzni
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
