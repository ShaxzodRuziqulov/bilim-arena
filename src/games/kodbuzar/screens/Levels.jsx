import { WORLDS, levelStars, levelUnlocked, nextLevel, solvedCount, worldUnlocked } from '../game/levels.js';
import { sfx } from '../game/sound.js';

// Har dunyo — ilon izi bo'ylab joylashgan seyflar yo'li: 1-qator chapdan o'ngga, 2-qator o'ngdan chapga va h.k.
const snake = (k) => {
  const row = Math.floor(k / 3);
  const col = row % 2 === 0 ? k % 3 : 2 - (k % 3);
  return { gridRow: row + 1, gridColumn: col + 1 };
};

export default function Levels({ save, onBack, onOpen }) {
  const current = nextLevel(save);
  return (
    <div className="screen levels">
      <header className="bar">
        <button className="icon-btn" onClick={onBack} aria-label="Orqaga">←</button>
        <div className="bar-title"><b>Xarita</b><small>Har dunyo oldingisidan biroz qiyinroq</small></div>
      </header>
      <main className="worlds">
        {WORLDS.map((w, i) => {
          const open = worldUnlocked(save, i);
          const solved = solvedCount(save, w);
          const prev = WORLDS[i - 1];
          return (
            <section key={w.id} className={`world ${open ? '' : 'locked'}`} style={{ '--hue': w.hue }}>
              <div className="world-head">
                <span className="world-icon">{open ? w.icon : '🔒'}</span>
                <div>
                  <h2>{i + 1}. {w.name}</h2>
                  <p>{w.about}</p>
                </div>
                <span className="pill">{solved}/{w.levels}</span>
              </div>
              {open ? (
                <div className="path">
                  {Array.from({ length: w.levels }, (_, k) => {
                    const n = k + 1;
                    const stars = levelStars(save, w.id, n);
                    const unlocked = levelUnlocked(save, w, n);
                    const here = current.worldId === w.id && current.level === n;
                    return (
                      <div key={n} className="path-step" style={snake(k)}>
                        <button className={`node ${stars ? 'done' : ''} ${here ? 'here' : ''}`} disabled={!unlocked}
                          onClick={() => { sfx.tap(); onOpen(w.id, n); }}
                          aria-label={`${n}-seyf${stars ? `, ${stars} yulduz` : unlocked ? '' : ', yopiq'}`}>
                          <b>{unlocked ? n : '🔒'}</b>
                          <small>{[1, 2, 3].map((s) => <span key={s} className={s <= stars ? 'on' : ''}>★</span>)}</small>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="locked-note">
                  Ochish uchun “{prev.name}” dunyosida {prev.unlockNext} ta seyfni oching ({Math.min(solvedCount(save, prev), prev.unlockNext)}/{prev.unlockNext}).
                </p>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
