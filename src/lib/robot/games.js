import { KOD_LEVELS } from './kod.js';
import { JAVA_LESSONS } from './java.js';

// Robot dasturlash ikki qismdan iborat. Qism ID lari (kod, java) — saqlangan yulduzlar kalitlari (data.robot.kod / .java),
// shuning uchun ular o'zgarmaydi.
export const ROBOT_GAMES = {
  kod: {
    title: 'Robo Kod',
    part: 'Bloklar',
    icon: '🧩',
    grades: '5–7-sinf',
    about: 'Bloklar bilan dasturlash: buyruqlar ketma-ketligi, funksiya (P) va rekursiya. Hammasi tugmalar bilan — doskaga juda qulay.',
    levels: KOD_LEVELS,
    levelName: (l) => l.name,
    scoring: 'Bloklar qismida kam buyruq bilan yechilsa — ko‘proq yulduz (1–3 ★).',
    turnTime: 180,
  },
  java: {
    title: 'Java Robot',
    part: 'Java',
    icon: '☕',
    grades: '8–11-sinf',
    about: 'Haqiqiy Java kodi: metodlar, int, for, while, if. Xatolar o‘zbekcha, qator raqami bilan ko‘rsatiladi.',
    levels: JAVA_LESSONS,
    levelName: (l) => l.title,
    scoring: 'Java qismida birinchi urinishda yechilsa — 3 ★.',
    turnTime: 300,
  },
};

export const ROBOT_PARTS = ['kod', 'java'];

// Bitta zinapoya: avval bloklar (Robo Kod), keyin haqiqiy Java kodi. Har qadam qaysi qismga va
// shu qismdagi qaysi darajaga tegishli ekanini biladi.
const STEPS = ROBOT_PARTS.flatMap((part) => ROBOT_GAMES[part].levels.map((level, local) => ({ part, local, level })));

export const ROBOT_LADDER = {
  id: 'robot',
  title: 'Robot dasturlash',
  icon: '🤖',
  grades: '5–11-sinf',
  about: `Bitta zinapoya: avval bloklar bilan (1–${KOD_LEVELS.length}-daraja), keyin robotni haqiqiy Java kodi bilan boshqarish (${KOD_LEVELS.length + 1}–${STEPS.length}-daraja). Darajani erkin tanlash mumkin.`,
  steps: STEPS,
  levelLabel: (i) => `${i + 1}. ${ROBOT_GAMES[STEPS[i].part].levelName(STEPS[i].level)} (${ROBOT_GAMES[STEPS[i].part].part})`,
  /** Qism qaysi qadamdan boshlanadi (masalan, Java — 11-daraja, indeks 10). */
  partStart: (part) => STEPS.findIndex((s) => s.part === part),
};

/** data.robot dan i-qadamning eng yaxshi yulduzlari (0 — yechilmagan). */
export const ladderStars = (robot, i) => {
  const s = STEPS[i];
  return robot?.[s.part]?.stars?.[s.local] || 0;
};

/** data.robot ga i-qadam uchun yulduz yozadi (saqlash formati o'zgarmaydi). */
export const withLadderStars = (robot, i, stars) => {
  const { part, local } = STEPS[i];
  const p = robot?.[part] || {};
  return { ...robot, [part]: { ...p, stars: { ...p.stars, [local]: stars } } };
};

export const ladderTotal = (robot) => STEPS.reduce((sum, _, i) => sum + ladderStars(robot, i), 0);
export const ladderSolved = (robot) => STEPS.filter((_, i) => ladderStars(robot, i) > 0).length;
