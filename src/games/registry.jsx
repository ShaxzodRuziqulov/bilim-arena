// O'yinlar reyestri: har bir o'yin bitta modul sifatida ulanadi.
// Yangi o'yin qo'shish uchun App.jsx, Admin yoki Results'ni tahrirlash shart emas —
// shu yerga modul qo'shiladi (va kerak bo'lsa ID shared/game-ids.mjs ga yoziladi).
//
// Modul maydonlari:
//   id, title, icon, grades, about   — kartochka va sarlavhalar uchun
//   family                           — 'quiz' (savol to'plami bilan) yoki 'robot' (o'z darajalari bilan)
//   adminTab                         — Sozlamalardagi o'yin bo'limi (games)
//   levels                           — (robot) zinapoya qadamlari: { part, local, level }
//   renderSetup({ data, go, screen })                                    — tayyorgarlik ekrani
//   renderPlay({ config, data, update, askPin, onExit, onFinish })       — o'yin ekrani
//   ranking: [asosiy, qo'shimcha]    — natija jadvalidagi tartib maydonlari
//   stats(team, result)              — shohsupadagi ko'rsatkichlar: [{ value, prefix?, suffix?, label }]
//   historyLine(team, result)        — natijalar tarixidagi qisqa yozuv
import GameSetup from '../screens/GameSetup.jsx';
import Race from '../screens/Race.jsx';
import RobotSetup from '../screens/RobotSetup.jsx';
import RobotHome from '../screens/RobotHome.jsx';
import RobotGame from '../screens/RobotGame.jsx';
import { ROBOT_LADDER, withLadderStars } from '../lib/robot/games.js';

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

const race = {
  id: 'race',
  family: 'quiz',
  title: 'Xazina poygasi',
  icon: '🏝️',
  grades: '5–11-sinf',
  about: 'Jamoalar navbat bilan savollarga javob berib, xazina tomon yuradi.',
  adminTab: undefined,
  renderSetup: ({ data, go, screen }) => <GameSetup data={data} setId={screen.setId} solo={screen.solo} go={go} />,
  renderPlay: ({ config, askPin, onExit, onFinish, exitLabel }) => (
    <Race config={config} askPin={askPin} onExit={onExit} onFinish={onFinish} exitLabel={exitLabel} />
  ),
  ranking: ['pos', 'correct'],
  stats: (t, result) => [
    { value: t.pos, suffix: `/${result.trackLength}`, label: 'qadam' },
    { value: t.correct, label: 'to‘g‘ri' },
    { value: percent(t.correct, t.correct + t.wrong), suffix: '%', label: 'aniqlik' },
  ],
  historyLine: (t, h) => `${t.pos}/${h.trackLength} qadam · ✓${t.correct} ✗${t.wrong}`,
};

// Robot dasturlash — bitta zinapoya: Robo Kod (bloklar) darajalari, keyin Java Robot darslari.
const robot = {
  id: ROBOT_LADDER.id,
  family: 'robot',
  title: ROBOT_LADDER.title,
  icon: ROBOT_LADDER.icon,
  grades: ROBOT_LADDER.grades,
  about: ROBOT_LADDER.about,
  levels: ROBOT_LADDER.steps,
  adminTab: 'games',
  // screen.home — o'yinning o'z bosh ekrani (zaldan kirish shu yerga); aks holda jamoaviy tayyorgarlik.
  renderSetup: ({ data, go, screen }) => (screen.home ? <RobotHome robot={data.robot || {}} go={go} /> : <RobotSetup go={go} />),
  renderPlay: ({ config, data, update, askPin, go, onExit, onFinish, exitLabel }) => {
    // Bosh ekrandan ochilgan mashqdan chiqqanda yana Robot bosh ekraniga qaytiladi.
    const toHome = config.from === 'home' && go;
    return (
    <RobotGame
      config={config}
      robot={data.robot || {}}
      onProgress={(step, stars) => update((d) => ({ ...d, robot: withLadderStars(d.robot, step, stars) }))}
      askPin={askPin}
      onExit={toHome ? () => go({ name: 'setup', game: ROBOT_LADDER.id, home: true }) : onExit}
      onFinish={onFinish}
      exitLabel={toHome ? 'Robot menyusiga qaytish' : exitLabel}
    />
    );
  },
  ranking: ['score', 'solved'],
  stats: (t, result) => [
    { value: t.score, prefix: '★ ', label: `${result.maxScore} dan` },
    { value: t.solved, suffix: `/${result.rounds}`, label: 'daraja' },
    { value: percent(t.solved, result.rounds), suffix: '%', label: 'yechildi' },
  ],
  historyLine: (t, h) => `★ ${t.score} · ${t.solved}/${h.rounds} daraja`,
};

export const GAMES = Object.fromEntries([race, robot].map((g) => [g.id, g]));

// --- Yakka o'yinlar (shaxsiy platforma) ---
// Har biri o'z ekranini butunlay egallaydi va faqat ochilganda yuklanadi (React.lazy).
// Maydonlar: id, title, icon, tagline, about, Component ({ onExit }), summary() → { stars, max } (zal kartasi uchun).
import { lazy } from 'react';
import { loadSave as kodbuzarSave } from './kodbuzar/game/storage.js';
import { maxStars as kodbuzarMax, totalStars as kodbuzarStars } from './kodbuzar/game/levels.js';
import { totalStars as soyaStars } from './soya/engine/save.js';
import { LEVELS as SOYA_LEVELS } from './soya/engine/levels.js';

export const SOLO_GAMES = {
  kodbuzar: {
    id: 'kodbuzar',
    title: 'Kodbuzar',
    icon: '🔐',
    tagline: 'Seyflarni mantiq bilan oching',
    about: 'Yashirin kodni toping: 2 xonali rangli seyflardan haqiqiy “Buqa va sigir”gacha. Kalitjon yo‘l ko‘rsatadi.',
    Component: lazy(() => import('./kodbuzar/KodbuzarHost.jsx')),
    summary: () => ({ stars: kodbuzarStars(kodbuzarSave()), max: kodbuzarMax() }),
  },
  soya: {
    id: 'soya',
    title: 'Soya',
    icon: '👤',
    tagline: 'Harakatingizni yozing, soyangiz takrorlaydi',
    about: 'Platformer-jumboq: soya tugmani bosib turadi, lazerni to‘sadi, zinapoya bo‘ladi. 15 daraja, 3 dunyo.',
    Component: lazy(() => import('./soya/SoyaGame.jsx')),
    summary: () => ({ stars: soyaStars(), max: SOYA_LEVELS.length * 3 }),
  },
};

export const gamesOfFamily = (family) => Object.values(GAMES).filter((g) => g.family === family);

// Saqlangan natija qaysi o'yinga tegishli. Eski poyga natijalarida `kind` yo'q — ular Xazina poygasi.
// Eski alohida Robo Kod / Java Robot natijalari (game: 'kod' | 'java') ham yagona Robot dasturlashga tegishli.
export const gameIdOfResult = (result) => (result.kind === 'robot' ? 'robot' : 'race');
export const gameOfResult = (result) => GAMES[gameIdOfResult(result)];
