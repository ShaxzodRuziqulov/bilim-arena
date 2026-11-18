// O'yinchi natijalari brauzerning localStorage'ida saqlanadi.
// Xotira yopiq bo'lsa (maxfiy oyna va h.k.) o'yin baribir ishlaydi, faqat natija saqlanmaydi.
// v2: dunyolar qayta tuzildi (asta-sekin qiyinlashadigan 8 dunyo), shuning uchun eski v1 natijalari ishlatilmaydi.

const KEY = 'kodbuzar-v2';

export const emptySave = () => ({
  progress: {}, // { [worldId]: { [level]: stars } }
  attempts: {}, // { 'd1-3': qayta o'ynashlar soni } — har safar yangi kod
  daily: {}, // { '2026-11-13': { guesses: [], status: 'playing' | 'won' | 'lost' } }
  settings: { helper: true, sound: true },
  seenIntro: false,
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptySave();
    const parsed = JSON.parse(raw);
    const base = emptySave();
    return {
      progress: parsed.progress || base.progress,
      attempts: parsed.attempts || base.attempts,
      daily: parsed.daily || base.daily,
      settings: { ...base.settings, ...parsed.settings },
      seenIntro: Boolean(parsed.seenIntro),
    };
  } catch {
    return emptySave();
  }
}

export function writeSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Saqlab bo'lmadi — o'yin davom etadi.
  }
}
