import { makeSecret, seededRandom } from './logic.js';

// Qiyinlik asta-sekin oshadi:
//  1–2-dunyo: rangli kataklar (har katak o'z holatini ko'rsatadi) — qoidani o'rganish uchun.
//  3-dunyodan: klassik "Buqa va sigir" — faqat nechta joyida / bor ekani aytiladi.
// par — 3 yulduz uchun urinishlar soni. par+2 gacha — 2 yulduz, topilsa — 1 yulduz.
// unlockNext — keyingi dunyo ochilishi uchun shu dunyoda nechta daraja yechilishi kerak.
// hints — har darajada nechta maslahat (💡) bor.
export const WORLDS = [
  { id: 'd1', name: 'Tanishuv', icon: '🐣', hue: 145, length: 2, alphabet: '1234', repeats: false, mode: 'color',
    par: 3, maxAttempts: 8, levels: 5, unlockNext: 3, hints: 3,
    about: '2 ta raqam, 1–4. Har katak rangi nima ekanini aytadi' },
  { id: 'd2', name: 'Ilk qadamlar', icon: '🌱', hue: 165, length: 3, alphabet: '12345', repeats: false, mode: 'color',
    par: 4, maxAttempts: 8, levels: 8, unlockNext: 5, hints: 3,
    about: '3 ta raqam, 1–5. Ranglar hali ham yordam beradi' },
  { id: 'd3', name: 'Sirli javob', icon: '🕵️', hue: 260, length: 3, alphabet: '12345', repeats: false, mode: 'count',
    par: 5, maxAttempts: 10, levels: 10, unlockNext: 6, hints: 2,
    about: 'Ranglar yo‘q! Faqat nechtasi joyida va nechtasi bor ekani aytiladi' },
  { id: 'd4', name: 'Kengayish', icon: '🔓', hue: 285, length: 3, alphabet: '123456', repeats: false, mode: 'count',
    par: 5, maxAttempts: 10, levels: 10, unlockNext: 6, hints: 2,
    about: '3 ta raqam, endi 1–6' },
  { id: 'd5', name: 'Klassik', icon: '🔢', hue: 220, length: 4, alphabet: '0123456789', repeats: false, mode: 'count',
    par: 7, maxAttempts: 12, levels: 12, unlockNext: 8, hints: 1,
    about: '4 ta raqam, 0–9 — haqiqiy “Buqa va sigir”' },
  { id: 'd6', name: 'Egizaklar', icon: '👯', hue: 330, length: 4, alphabet: '123456', repeats: true, mode: 'count',
    par: 7, maxAttempts: 12, levels: 12, unlockNext: 8, hints: 1,
    about: '4 ta raqam, 1–6, raqamlar takrorlanishi mumkin' },
  { id: 'd7', name: 'Usta', icon: '🧠', hue: 25, length: 5, alphabet: '0123456789', repeats: false, mode: 'count',
    par: 8, maxAttempts: 14, levels: 12, unlockNext: 8, hints: 1,
    about: '5 ta raqam, 0–9' },
  { id: 'd8', name: 'Grossmeyster', icon: '👑', hue: 45, length: 5, alphabet: '12345678', repeats: true, mode: 'count',
    par: 9, maxAttempts: 15, levels: 12, unlockNext: 0, hints: 1,
    about: '5 ta raqam, 1–8, takrorlanishi mumkin' },
];

export const DAILY = { id: 'daily', name: 'Kunlik kod', icon: '📅', hue: 200, length: 4, alphabet: '123456', repeats: false, mode: 'count',
  par: 6, maxAttempts: 12, hints: 1,
  about: '4 ta raqam, 1–6. Hamma uchun bir xil kod' };

export const worldById = (id) => WORLDS.find((w) => w.id === id);

export function starsFor(cfg, attempts, hintsUsed = 0) {
  let stars = attempts <= cfg.par ? 3 : attempts <= cfg.par + 2 ? 2 : 1;
  // Maslahat ishlatilsa — eng ko'pi 2 yulduz.
  if (hintsUsed > 0) stars = Math.min(stars, 2);
  return stars;
}

export const levelStars = (save, worldId, level) => save.progress[worldId]?.[level] || 0;

export function solvedCount(save, world) {
  return Object.values(save.progress[world.id] || {}).filter((s) => s > 0).length;
}

export function worldUnlocked(save, index) {
  if (index === 0) return true;
  const prev = WORLDS[index - 1];
  return worldUnlocked(save, index - 1) && solvedCount(save, prev) >= prev.unlockNext;
}

export function levelUnlocked(save, world, level) {
  const index = WORLDS.indexOf(world);
  return worldUnlocked(save, index) && (level === 1 || levelStars(save, world.id, level - 1) > 0);
}

export function totalStars(save) {
  return WORLDS.reduce((sum, w) => sum + Object.values(save.progress[w.id] || {}).reduce((a, b) => a + b, 0), 0);
}

export const maxStars = () => WORLDS.reduce((s, w) => s + w.levels * 3, 0);

/** O'yinchi davom ettirishi kerak bo'lgan birinchi yechilmagan daraja. */
export function nextLevel(save) {
  let last = { worldId: WORLDS[0].id, level: 1 };
  for (let i = 0; i < WORLDS.length; i++) {
    const w = WORLDS[i];
    if (!worldUnlocked(save, i)) break;
    for (let n = 1; n <= w.levels; n++) {
      if (!levelStars(save, w.id, n)) return { worldId: w.id, level: n };
      last = { worldId: w.id, level: n };
    }
  }
  return last;
}

/** Daraja keyingi daraja yoki keyingi dunyoning birinchisi (ochilgan bo'lsa). */
export function levelAfter(save, worldId, level) {
  const i = WORLDS.findIndex((w) => w.id === worldId);
  const w = WORLDS[i];
  if (level < w.levels) return { worldId, level: level + 1 };
  if (i + 1 < WORLDS.length && worldUnlocked(save, i + 1)) return { worldId: WORLDS[i + 1].id, level: 1 };
  return null;
}

/** attempt — qayta o'ynashda yangi kod chiqishi uchun (eslab qolib bo'lmasin). */
export function levelSecret(world, level, attempt = 0) {
  return makeSecret(world, seededRandom(`${world.id}-${level}-${attempt}`));
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const dailySecret = (dateKey) => makeSecret(DAILY, seededRandom(`daily-${dateKey}`));

/** Bugun (yoki bugun hali o'ynalmagan bo'lsa kecha) bilan tugaydigan ketma-ket yutilgan kunlar. */
export function dailyStreak(save, today = new Date()) {
  const day = new Date(today);
  if (save.daily[todayKey(day)]?.status !== 'won') day.setDate(day.getDate() - 1);
  let streak = 0;
  while (save.daily[todayKey(day)]?.status === 'won') {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
