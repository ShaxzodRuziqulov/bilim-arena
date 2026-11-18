// O'yinchi natijalari brauzerning localStorage'ida saqlanadi.
// Xotira yopiq bo'lsa (maxfiy oyna va h.k.) o'yin baribir ishlaydi, faqat natija saqlanmaydi.
import { LEVELS } from './levels.js';

const KEY = 'soya-save-v1';
let cache = null;

export function getSave() {
  if (!cache) {
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(KEY));
    } catch {
      stored = null;
    }
    cache = { levels: {}, sound: true, music: true, ...(stored && typeof stored === 'object' ? stored : {}) };
    if (!cache.levels || typeof cache.levels !== 'object') cache.levels = {};
  }
  return cache;
}

/** Platforma zaxiradan tiklaganda: keyingi o'qish localStorage'dan yangidan bo'ladi. */
export function reloadSave() {
  cache = null;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Saqlab bo'lmadi — o'yin davom etadi.
  }
}

/** Natijani yozadi; har ko'rsatkichning eng yaxshisi saqlanadi. */
export function recordResult(id, { stars, seconds, shadows }) {
  const save = getSave();
  const prev = save.levels[id] || {};
  save.levels[id] = {
    stars: Math.max(prev.stars || 0, stars),
    seconds: Math.min(prev.seconds ?? Infinity, seconds),
    shadows: Math.min(prev.shadows ?? Infinity, shadows),
  };
  persist();
  return { improved: stars > (prev.stars || 0), first: !prev.stars };
}

export const levelResult = (id) => getSave().levels[id] || null;
// unlockAll — faqat ishlab chiqishda (?ochiq=1); o'yinchilar versiyasida e'tiborga olinmaydi.
const DEV = Boolean(import.meta.env?.DEV);
export const isUnlocked = (index) => (DEV && getSave().unlockAll) || index === 0 || !!levelResult(LEVELS[index - 1].id)?.stars;

/** Barcha darajalarni ochadi (sinov uchun) — shu brauzerda saqlanib qoladi. */
export function setUnlockAll(on) {
  getSave().unlockAll = on;
  persist();
}
export const totalStars = () => LEVELS.reduce((sum, l) => sum + (levelResult(l.id)?.stars || 0), 0);

/** Birinchi o'tilmagan daraja (hammasi o'tilgan bo'lsa — oxirgisi). */
export function nextLevelIndex() {
  const i = LEVELS.findIndex((l) => !levelResult(l.id)?.stars);
  return i === -1 ? LEVELS.length - 1 : i;
}

export function setSound(on) {
  getSave().sound = on;
  persist();
}

export function setMusic(on) {
  getSave().music = on;
  persist();
}
