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
    // Zinapoyadagi tartib — osondan qiyinga (KOD_LEVELS dagi indekslar; massiv tartibi saqlangan yulduzlar kaliti,
    // shuning uchun u o'zgartirilmaydi). Tushunchalar: yurish → burilish → orqaga burilish (P ixtiyoriy) →
    // P majburiy → P bilan shakllar → uzun P yo'llari → rekursiya (P o'zini chaqiradi).
    order: [0, 1, 3, 2, 4, 5, 8, 9, 6, 7],
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
    // metod → int → for → while → if → o'zgaruvchini o'zgartirish: allaqachon osondan qiyinga.
    order: JAVA_LESSONS.map((_, i) => i),
    levelName: (l) => l.title,
    scoring: 'Java qismida birinchi urinishda yechilsa — 3 ★.',
    turnTime: 300,
  },
};

export const ROBOT_PARTS = ['kod', 'java'];

// Bitta zinapoya: avval bloklar (Robo Kod), keyin haqiqiy Java kodi, har qism ichida osondan qiyinga.
// Har qadam qaysi qismga va shu qismdagi qaysi darajaga (local — saqlash kaliti) tegishli ekanini biladi.
const STEPS = ROBOT_PARTS.flatMap((part) => ROBOT_GAMES[part].order.map((local) => ({ part, local, level: ROBOT_GAMES[part].levels[local] })));

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
