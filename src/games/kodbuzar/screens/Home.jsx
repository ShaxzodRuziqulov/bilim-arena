import { DAILY, dailyStreak, maxStars, nextLevel, todayKey, totalStars, worldById } from '../game/levels.js';
import { sfx } from '../game/sound.js';
import { Coach } from '../components/Mascot.jsx';
import { tilt } from '../components/Effects.jsx';

export default function Home({ save, onContinue, onLevels, onDaily, onChallenges, onHowTo, onToggleSound, onExit }) {
  const next = nextLevel(save);
  const world = worldById(next.worldId);
  const today = save.daily[todayKey()];
  const streak = dailyStreak(save);
  const stars = totalStars(save);
  const fresh = stars === 0 && Object.keys(save.daily).length === 0;

  const dailyLabel = !today || today.status === 'playing'
    ? today?.guesses.length ? `Davom etish · ${today.guesses.length}/${DAILY.maxAttempts}` : 'Bugungi seyfni oching'
    : today.status === 'won' ? `✓ ${today.guesses.length} ta urinishda ochildi` : 'Bugun ochilmadi — ertaga yangisi';

  const greeting = fresh
    ? 'Salom! Men Kalitjonman. Keling, birinchi seyfni birga ochamiz — juda oson boshlanadi!'
    : stars < 15 ? 'Qaytganingizdan xursandman! Davom etamizmi?' : `Zo‘r natija: ${stars} ta yulduz! Keyingi seyf sizni kutyapti.`;

  const go = (fn) => () => {
    sfx.tap();
    fn();
  };

  return (
    <div className="screen home">
      {onExit && <button className="exit-btn icon-btn" onClick={onExit} aria-label="O‘yinlar zaliga qaytish" title="O‘yinlar zali">←</button>}
      <button className="sound-toggle icon-btn" onClick={onToggleSound} aria-label={save.settings.sound ? 'Ovozni o‘chirish' : 'Ovozni yoqish'}
        aria-pressed={save.settings.sound}>
        {save.settings.sound ? '🔊' : '🔇'}
      </button>

      <header className="home-head">
        <h1 className="title-3d" aria-label="Kodbuzar">
          {[...'KODBUZAR'].map((ch, i) => <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>{ch}</span>)}
        </h1>
        <p className="tagline">Seyflarni mantiq bilan oching</p>
      </header>

      <Coach mood={fresh ? 'happy' : 'idle'} text={greeting} size={92} />

      <main className="home-main">
        <button className="card hero tilt" onClick={go(() => onContinue(next.worldId, next.level))} {...tilt}
          style={{ '--hue': world.hue }}>
          <span className="card-shine" />
          <span className="card-kicker">{fresh ? 'Boshlash' : 'Davom etish'}</span>
          <span className="card-title">{world.icon} {world.name} · {next.level}-seyf</span>
          <span className="card-sub">{world.about}</span>
          <span className="card-cta">O‘ynash ▶</span>
        </button>

        <button className="card tilt" onClick={go(onDaily)} {...tilt}>
          <span className="card-shine" />
          <span className="card-kicker">{DAILY.icon} Kunlik kod</span>
          <span className="card-title">{dailyLabel}</span>
          <span className="card-sub">{streak > 0 ? `🔥 ${streak} kunlik seriya` : 'Har kuni bitta yangi seyf — seriyani boshlang'}</span>
        </button>

        <button className="card tilt challenge-entry" onClick={go(onChallenges)} {...tilt}>
          <span className="card-shine" />
          <span className="card-title">🔎 Mantiq sinovi</span>
          <span className="card-sub">Dalilni tekshiring, foydali taxminni tanlang va xatoni toping</span>
        </button>

        <div className="card-row">
          <button className="card small tilt" onClick={go(onLevels)} {...tilt}>
            <span className="card-shine" />
            <span className="card-title">🗺️ Xarita</span>
            <span className="star-bar"><span style={{ width: `${(stars / maxStars()) * 100}%` }} /></span>
            <span className="card-sub">★ {stars} / {maxStars()}</span>
          </button>
          <button className="card small tilt" onClick={go(onHowTo)} {...tilt}>
            <span className="card-shine" />
            <span className="card-title">❓ Qoidalar</span>
            <span className="card-sub">1 daqiqada o‘rganing</span>
          </button>
        </div>
      </main>
    </div>
  );
}
