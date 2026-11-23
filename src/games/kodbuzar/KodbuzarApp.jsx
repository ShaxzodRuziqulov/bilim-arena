// Kodbuzar platforma ichida: manba — alohida kodbuzar loyihasi. KodbuzarHost uni Shadow DOM ichiga o'rnatadi,
// stillari (kodbuzar.css) ham o'sha yerga qo'yiladi.
import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSave, writeSave } from './game/storage.js';
import { DAILY, dailySecret, levelAfter, levelSecret, starsFor, todayKey, worldById } from './game/levels.js';
import { setSoundEnabled } from './game/sound.js';
import { Backdrop } from './components/Effects.jsx';
import Home from './screens/Home.jsx';
import Levels from './screens/Levels.jsx';
import HowTo from './screens/HowTo.jsx';
import Game from './screens/Game.jsx';
import Challenges from './screens/Challenges.jsx';

// soundOn — platformaning umumiy ovoz sozlamasi: o'chiq bo'lsa, Kodbuzarning o'z sozlamasidan qat'i nazar jim.
// reduceMotion — platformadagi "Animatsiyalar" o'chirilgan bo'lsa, Kodbuzar animatsiyalari ham o'chadi.
export default function KodbuzarApp({ onExit, soundOn = true, reduceMotion = false }) {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState({ name: 'home' });
  const rootRef = useRef(null);

  const update = useCallback((fn) => {
    setSave((prev) => {
      const next = fn(prev);
      writeSave(next);
      return next;
    });
  }, []);

  useEffect(() => {
    setSoundEnabled(save.settings.sound && soundOn);
  }, [save.settings.sound, soundOn]);
  useEffect(() => {
    rootRef.current?.scrollTo(0, 0);
  }, [screen]);

  // attempt ekran ochilgan paytda olinadi: yakunda save.attempts oshganda o'yin qayta yaratilib, natija oynasi yo'qolmasin.
  const openLevel = (worldId, level) => setScreen({ name: 'level', worldId, level, attempt: save.attempts[`${worldId}-${level}`] || 0 });
  const toggleHelper = () => update((s) => ({ ...s, settings: { ...s.settings, helper: !s.settings.helper } }));
  const toggleSound = () => update((s) => ({ ...s, settings: { ...s.settings, sound: !s.settings.sound } }));

  let view;
  if (screen.name === 'levels') {
    view = <Levels save={save} onBack={() => setScreen({ name: 'home' })} onOpen={openLevel} />;
  } else if (screen.name === 'howto') {
    view = <HowTo onBack={() => setScreen({ name: 'home' })} />;
  } else if (screen.name === 'challenges') {
    view = <Challenges onBack={() => setScreen({ name: 'home' })} />;
  } else if (screen.name === 'level') {
    const world = worldById(screen.worldId);
    const key = `${world.id}-${screen.level}`;
    const { attempt } = screen;
    view = (
      <Game
        key={`${key}-${attempt}`}
        cfg={world}
        title={`${world.icon} ${world.name} · ${screen.level}-seyf`}
        secret={levelSecret(world, screen.level, attempt)}
        helper={save.settings.helper}
        onToggleHelper={toggleHelper}
        bestStars={save.progress[world.id]?.[screen.level] || 0}
        tutorial={world.id === 'd1' && screen.level === 1 && !save.progress.d1?.[1]}
        onBack={() => setScreen({ name: 'levels' })}
        onFinish={(won, guesses, hintsUsed) =>
          update((s) => {
            // Keyingi safar shu daraja yangi kod bilan ochiladi.
            const next = { ...s, attempts: { ...s.attempts, [key]: attempt + 1 } };
            if (!won) return next;
            const stars = starsFor(world, guesses.length, hintsUsed);
            const prev = s.progress[world.id]?.[screen.level] || 0;
            return { ...next, progress: { ...s.progress, [world.id]: { ...s.progress[world.id], [screen.level]: Math.max(prev, stars) } } };
          })
        }
        onNext={() => {
          const n = levelAfter(save, world.id, screen.level);
          if (n) openLevel(n.worldId, n.level);
          else setScreen({ name: 'levels' });
        }}
        onRetry={() => openLevel(world.id, screen.level)}
      />
    );
  } else if (screen.name === 'daily') {
    const date = todayKey();
    const record = save.daily[date] || { guesses: [], status: 'playing' };
    view = (
      <Game
        key={`daily-${date}`}
        cfg={DAILY}
        title={`${DAILY.icon} Kunlik kod · ${date}`}
        secret={dailySecret(date)}
        initialGuesses={record.guesses}
        helper={save.settings.helper}
        onToggleHelper={toggleHelper}
        daily
        onBack={() => setScreen({ name: 'home' })}
        onGuess={(guesses, status) => update((s) => ({ ...s, daily: { ...s.daily, [date]: { guesses, status } } }))}
      />
    );
  } else {
    view = (
      <Home
        save={save}
        onContinue={openLevel}
        onLevels={() => setScreen({ name: 'levels' })}
        onDaily={() => setScreen({ name: 'daily' })}
        onChallenges={() => setScreen({ name: 'challenges' })}
        onHowTo={() => setScreen({ name: 'howto' })}
        onToggleSound={toggleSound}
        onExit={onExit}
      />
    );
  }

  return (
    <div className={`kb ${reduceMotion ? 'reduce' : ''}`} ref={rootRef}>
      <Backdrop />
      <div className="screen-wrap" key={screen.name === 'level' ? `${screen.worldId}-${screen.level}-${screen.attempt}` : screen.name}>{view}</div>
    </div>
  );
}
