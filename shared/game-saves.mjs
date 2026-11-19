// Yakka o'yinlar (Kodbuzar, Soya) natijalarini o'z localStorage kalitlarida saqlaydi.
// Platforma zaxira fayliga ular ixtiyoriy `games` maydonida qo'shiladi — asosiy ma'lumot formati o'zgarmaydi,
// eski zaxiralar va eski ilova versiyalari bu maydonni shunchaki e'tiborsiz qoldiradi.

export const GAME_SAVE_KEYS = ['kodbuzar-v2', 'soya-save-v1'];
const MAX_LENGTH = 1_000_000; // bitta o'yin saqlamasi uchun yetarli; buzilgan/katta faylni rad etadi

const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Faqat ma'lum kalitlar va to'g'ri JSON matnlarini qoldiradi. */
export function pickGameSaves(raw) {
  const out = {};
  if (!object(raw)) return out;
  for (const key of GAME_SAVE_KEYS) {
    const value = raw[key];
    if (typeof value !== 'string' || value.length > MAX_LENGTH) continue;
    try {
      if (object(JSON.parse(value))) out[key] = value;
    } catch {
      /* buzilgan saqlama tashlab yuboriladi */
    }
  }
  return out;
}

export function readGameSaves(storage) {
  const raw = {};
  for (const key of GAME_SAVE_KEYS) {
    try {
      const value = storage.getItem(key);
      if (value !== null) raw[key] = value;
    } catch {
      /* xotira yopiq */
    }
  }
  return pickGameSaves(raw);
}

/** Zaxiradagi o'yin saqlamalarini yozadi; zaxirada yo'q o'yinlarning joriy natijasiga tegilmaydi. Yozilganlar sonini qaytaradi. */
export function writeGameSaves(storage, saves) {
  let written = 0;
  for (const [key, value] of Object.entries(pickGameSaves(saves))) {
    storage.setItem(key, value);
    written++;
  }
  return written;
}

/** Zaxira faylidan (matn yoki obyekt) o'yin saqlamalarini oladi. */
export function backupGameSaves(value) {
  try {
    const raw = typeof value === 'string' ? JSON.parse(value) : value;
    return raw?.format === 'bilim-arena-backup' ? pickGameSaves(raw.games) : {};
  } catch {
    return {};
  }
}
