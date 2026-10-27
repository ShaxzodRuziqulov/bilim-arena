export const TEAM_PRESETS = [
  { name: 'Qizillar', color: '#ff5c7a', hero: '🦊' },
  { name: 'Ko‘klar', color: '#4da3ff', hero: '🧑‍🚀' },
  { name: 'Yashillar', color: '#3fe0a0', hero: '🐢' },
  { name: 'Sariqlar', color: '#ffc94d', hero: '🦁' },
];
const HEROES = ['🦊', '🧑‍🚀', '🐢', '🦁', '🥷', '🧙', '🤖', '🐼', '🐉', '🦉', '🐬', '🦄'];

export const freshTeams = () => TEAM_PRESETS.map((t) => ({ ...t }));

// O'yinga tayyor jamoalar ro'yxati: bo'sh nom standart nom bilan almashtiriladi.
export const pickTeams = (teams, count) =>
  teams.slice(0, count).map((t, i) => ({ ...t, id: i, name: t.name.trim() || TEAM_PRESETS[i].name }));

export default function TeamPicker({ count, setCount, teams, setTeams }) {
  const editTeam = (i, patch) => setTeams((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const nextHero = (i) => editTeam(i, { hero: HEROES[(HEROES.indexOf(teams[i].hero) + 1) % HEROES.length] });

  return (
    <>
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
    </>
  );
}
