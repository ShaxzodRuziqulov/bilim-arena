// Xazina poygasining "Kunlik sarguzasht" rekordlari — shu qurilmada (brauzer / Electron localStorage).
// Kalit: sana + to'plam + to'plam tarkibining izi. To'plam o'zgarsa, shu kun uchun yangi rekord boshlanadi,
// eskisi o'chirilmaydi. Juda ko'p yozuv yig'ilmasligi uchun oxirgi 90 tasi saqlanadi.

const KEY = 'bilim-arena-race-daily';
const KEEP = 90;

function read(storage) {
  try {
    const data = JSON.parse(storage.getItem(KEY) || '{}');
    return data && typeof data === 'object' && data.records && typeof data.records === 'object' ? data : { records: {} };
  } catch {
    return { records: {} };
  }
}

const recordKey = (day, setId, fingerprint) => `${day}|${setId}|${fingerprint}`;

// Natijalarni solishtirish: yulduz, keyin qadam, keyin kam xato.
const better = (a, b) => !b || a.stars - b.stars || a.pos - b.pos || b.wrong - a.wrong;

export function dailyRecord(storage, day, setId, fingerprint) {
  return read(storage).records[recordKey(day, setId, fingerprint)] ?? null;
}

/** Natijani yozadi. Qaytaradi: { record: yangi rekordmi, best, streak } */
export function saveDaily(storage, { day, setId, fingerprint, stars, pos, correct, wrong }) {
  const data = read(storage);
  const key = recordKey(day, setId, fingerprint);
  const entry = { day, stars, pos, correct, wrong };
  const previous = data.records[key];
  const cmp = previous ? better(entry, previous) : 1;
  const record = cmp > 0;
  if (record) data.records[key] = entry;
  const keys = Object.keys(data.records);
  if (keys.length > KEEP) {
    keys
      .sort((a, b) => data.records[a].day.localeCompare(data.records[b].day))
      .slice(0, keys.length - KEEP)
      .forEach((k) => delete data.records[k]);
  }
  try {
    storage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Xotira to'lgan yoki yopiq bo'lsa — o'yin davom etadi, faqat rekord saqlanmaydi.
  }
  return { record, first: !previous, best: data.records[key], streak: dayStreak(storage, day) };
}

// Ketma-ket necha kun kunlik sarguzasht o'ynalgan (bugun bilan birga; bugun o'ynalmagan bo'lsa — kechagacha).
export function dayStreak(storage, today) {
  const days = new Set(Object.values(read(storage).records).map((r) => r.day));
  const d = new Date(`${today}T12:00:00`);
  if (!days.has(today)) d.setDate(d.getDate() - 1);
  let count = 0;
  for (;;) {
    const p = (n) => String(n).padStart(2, '0');
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (!days.has(key)) return count;
    count += 1;
    d.setDate(d.getDate() - 1);
  }
}

// Brauzer xotirasi (yopiq bo'lsa — faqat shu sessiya uchun xotira).
const memory = new Map();
export const dailyStorage = () => {
  try {
    const ls = window.localStorage;
    ls.getItem(KEY);
    return ls;
  } catch {
    return { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v) };
  }
};
