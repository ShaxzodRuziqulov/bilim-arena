import RaceHero from './RaceHero.jsx';
import { uniqueTeamNames } from '../lib/teams.js';

export const TEAM_PRESETS = [
  { name: 'Qizillar', color: '#ff5c7a', hero: '🦊' },
  { name: 'Ko‘klar', color: '#4da3ff', hero: '🧑‍🚀' },
  { name: 'Yashillar', color: '#3fe0a0', hero: '🐢' },
  { name: 'Sariqlar', color: '#ffc94d', hero: '🦁' },
];
const HEROES = ['🦊', '🧑‍🚀', '🐢', '🦁', '🥷', '🧙', '🤖', '🐼', '🐉', '🦉', '🐬', '🦄'];

export const freshTeams = () => TEAM_PRESETS.map((t) => ({ ...t }));

// O'yinga tayyor jamoalar ro'yxati: bo'sh nom standart nom bilan almashtiriladi.
export const pickTeams = (teams, count) => {
  const list = teams.slice(0, count);
  const names = uniqueTeamNames(list.map((t) => t.name), TEAM_PRESETS.map((t) => t.name));
  return list.map((t, i) => ({ ...t, id: i, name: names[i] }));
};

// allowSolo — "Yakka" (bitta o'yinchi) tanlovi ham ko'rsatiladi (Xazina poygasi).
export default function TeamPicker({ count, setCount, teams, setTeams, allowSolo = false }) {
  const editTeam = (i, patch) => setTeams((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const nextHero = (i) => editTeam(i, { hero: HEROES[(HEROES.indexOf(teams[i].hero) + 1) % HEROES.length] });

  return (
    <>
      <div className="segmented">
        {[...(allowSolo ? [1] : []), 2, 3, 4].map((n) => (
          <button key={n} className={count === n ? 'active' : ''} onClick={() => setCount(n)}>
            {n === 1 ? '👤 Yakka' : `${n} jamoa`}
          </button>
        ))}
      </div>
      <div className="team-edit-list">
        {teams.slice(0, count).map((t, i) => (
          <div key={i} className="team-edit" style={{ borderColor: t.color }}>
            <button className="hero-pick" style={{ background: t.color + '33' }} onClick={() => nextHero(i)} title="Qahramonni almashtirish">
              {allowSolo ? <RaceHero hero={t.hero} /> : t.hero}
            </button>
            <input value={t.name} onChange={(e) => editTeam(i, { name: e.target.value })} />
          </div>
        ))}
      </div>
      <p className="note small">{count === 1 ? 'Ismingizni yozing va qahramoningizni tanlang (ustiga bosing).' : 'Qahramonni almashtirish uchun uning ustiga bosing.'}</p>
      {count > 1 && new Set(teams.slice(0, count).map((t) => t.name.trim().toLowerCase())).size < count && (
        <p className="note small">ℹ Bir xil nomlar o‘yinda avtomatik farqlanadi (masalan, “A” va “A 2”).</p>
      )}
    </>
  );
}
