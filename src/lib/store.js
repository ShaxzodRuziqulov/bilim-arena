import { SAMPLE_SETS } from './sample-data.js';

// Electron ichida ma'lumot userData/data.json faylida saqlanadi.
// Oddiy brauzerda (ishlab chiqish va sinov uchun) localStorage ishlatiladi.
const KEY = 'bilim-arena-data';
export const isDesktop = typeof window !== 'undefined' && !!window.api;

export const DEFAULT_SETTINGS = { time: 30, trackLength: 12, sound: true };

function initialData() {
  return { version: 1, pinHash: null, settings: { ...DEFAULT_SETTINGS }, sets: SAMPLE_SETS(), history: [] };
}

function migrate(raw) {
  if (!raw || raw.version !== 1) return initialData();
  return { ...initialData(), ...raw, settings: { ...DEFAULT_SETTINGS, ...raw.settings } };
}

export async function loadData() {
  let raw = null;
  try {
    raw = isDesktop ? await window.api.load() : JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    raw = null;
  }
  return migrate(raw);
}

let timer = null;
let pending = null;

export function saveData(data) {
  pending = data;
  clearTimeout(timer);
  timer = setTimeout(flushData, 400);
}

export async function flushData() {
  clearTimeout(timer);
  if (!pending) return;
  const data = pending;
  pending = null;
  try {
    if (isDesktop) await window.api.save(data);
    else localStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Ma‘lumotni saqlab bo‘lmadi', error);
  }
}

export async function quitApp() {
  await flushData();
  if (isDesktop) window.api.quit();
}
