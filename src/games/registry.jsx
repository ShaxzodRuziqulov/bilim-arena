// O'yinlar reyestri: har bir o'yin bitta modul sifatida ulanadi.
// Yangi o'yin qo'shish uchun App.jsx, Admin yoki Results'ni tahrirlash shart emas —
// shu yerga modul qo'shiladi (va kerak bo'lsa ID shared/game-ids.mjs ga yoziladi).
//
// Modul maydonlari:
//   id, title, icon, grades, about   — kartochka va sarlavhalar uchun
//   family                           — 'quiz' (savol to'plami bilan) yoki 'robot' (o'z darajalari bilan)
//   adminTab                         — o'yindan chiqqanda qaytiladigan studiya bo'limi
//   renderSetup({ data, go, screen })                                    — tayyorgarlik ekrani
//   renderPlay({ config, data, update, askPin, onExit, onFinish })       — o'yin ekrani
//   ranking: [asosiy, qo'shimcha]    — natija jadvalidagi tartib maydonlari
//   stats(team, result)              — shohsupadagi ko'rsatkichlar: [{ value, prefix?, suffix?, label }]
//   historyLine(team, result)        — natijalar tarixidagi qisqa yozuv
import GameSetup from '../screens/GameSetup.jsx';
import Race from '../screens/Race.jsx';
import RobotSetup from '../screens/RobotSetup.jsx';
import RobotGame from '../screens/RobotGame.jsx';
import { ROBOT_GAMES } from '../lib/robot/games.js';
import { ROBOT_GAME_IDS } from '../../shared/game-ids.mjs';

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

const race = {
  id: 'race',
  family: 'quiz',
  title: 'Xazina poygasi',
  icon: '🏝️',
  grades: '5–11-sinf',
  about: 'Jamoalar navbat bilan savollarga javob berib, xazina tomon yuradi.',
  adminTab: undefined,
  renderSetup: ({ data, go, screen }) => <GameSetup data={data} setId={screen.setId} go={go} />,
  renderPlay: ({ config, askPin, onExit, onFinish }) => (
    <Race config={config} askPin={askPin} onExit={onExit} onFinish={onFinish} />
  ),
  ranking: ['pos', 'correct'],
  stats: (t, result) => [
    { value: t.pos, suffix: `/${result.trackLength}`, label: 'qadam' },
    { value: t.correct, label: 'to‘g‘ri' },
    { value: percent(t.correct, t.correct + t.wrong), suffix: '%', label: 'aniqlik' },
  ],
  historyLine: (t, h) => `${t.pos}/${h.trackLength} qadam · ✓${t.correct} ✗${t.wrong}`,
};

const robotModule = (id) => {
  const g = ROBOT_GAMES[id];
  return {
    id,
    family: 'robot',
    title: g.title,
    icon: g.icon,
    grades: g.grades,
    about: g.about,
    levels: g.levels,
    adminTab: 'robot',
    renderSetup: ({ go }) => <RobotSetup game={id} go={go} />,
    renderPlay: ({ config, data, update, askPin, onExit, onFinish }) => (
      <RobotGame
        config={config}
        progress={data.robot?.[id] || {}}
        onProgress={(level, stars) =>
          update((d) => {
            const p = d.robot?.[id] || {};
            return { ...d, robot: { ...d.robot, [id]: { ...p, stars: { ...p.stars, [level]: stars } } } };
          })
        }
        askPin={askPin}
        onExit={onExit}
        onFinish={onFinish}
      />
    ),
    ranking: ['score', 'solved'],
    stats: (t, result) => [
      { value: t.score, prefix: '★ ', label: `${result.maxScore} dan` },
      { value: t.solved, suffix: `/${result.rounds}`, label: 'daraja' },
      { value: percent(t.solved, result.rounds), suffix: '%', label: 'yechildi' },
    ],
    historyLine: (t, h) => `★ ${t.score} · ${t.solved}/${h.rounds} daraja`,
  };
};

export const GAMES = Object.fromEntries([race, ...ROBOT_GAME_IDS.map(robotModule)].map((g) => [g.id, g]));

export const gamesOfFamily = (family) => Object.values(GAMES).filter((g) => g.family === family);

// Saqlangan natija qaysi o'yinga tegishli. Eski poyga natijalarida `kind` yo'q — ular Xazina poygasi.
export const gameIdOfResult = (result) => (result.kind === 'robot' ? result.game : 'race');
export const gameOfResult = (result) => GAMES[gameIdOfResult(result)];
