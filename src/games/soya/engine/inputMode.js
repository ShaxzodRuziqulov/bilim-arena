// Boshqaruv rejimi: sensorli (ekran tugmalari) yoki klaviatura.
//
// Qurilma "sensorli ekranim bor" deyishiga ishonmaymiz: Google Play Games (Windows) va ba'zi noutbuklar
// o'zini sensorli ko'rsatadi, lekin o'yinchi klaviaturada o'ynaydi. Shuning uchun:
//  - boshlanishda: asosiy ko'rsatkich qo'pol (barmoq) bo'lsa — sensorli, aks holda — klaviatura;
//  - ekranga barmoq tegsa — sensorli rejimga, klaviatura bosilsa — klaviatura rejimiga o'tiladi.

const listeners = new Set();

function initial() {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).has('touch')) return true;
  try {
    return window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

let touchMode = initial();

export const isTouchMode = () => touchMode;

function setTouchMode(on) {
  if (on === touchMode) return;
  touchMode = on;
  for (const fn of listeners) fn(on);
}

/** Rejim o'zgarganda chaqiriladi. Qaytgan funksiya obunani bekor qiladi. */
export function onTouchModeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', () => setTouchMode(true), { capture: true, passive: true });
  window.addEventListener('keydown', () => setTouchMode(false), { capture: true });
}
