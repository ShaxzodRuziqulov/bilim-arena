import { KOD_LEVELS } from './kod.js';
import { JAVA_LESSONS } from './java.js';

export const ROBOT_GAMES = {
  kod: {
    title: 'Robo Kod',
    icon: '🧩',
    grades: '5–7-sinf',
    about: 'Bloklar bilan dasturlash: buyruqlar ketma-ketligi, funksiya (P) va rekursiya. Hammasi tugmalar bilan — doskaga juda qulay.',
    levels: KOD_LEVELS,
    levelLabel: (l, i) => `${i + 1}. ${l.name}`,
    scoring: 'Kam buyruq bilan yechilsa — ko‘proq yulduz (1–3 ★).',
  },
  java: {
    title: 'Java Robot',
    icon: '☕',
    grades: '8–11-sinf',
    about: 'Haqiqiy Java kodi: metodlar, int, for, while, if. Xatolar o‘zbekcha, qator raqami bilan ko‘rsatiladi.',
    levels: JAVA_LESSONS,
    levelLabel: (l, i) => `${i + 1}. ${l.title}`,
    scoring: 'Birinchi urinishda yechilsa — 3 ★.',
  },
};
