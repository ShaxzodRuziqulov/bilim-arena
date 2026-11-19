import { COLS, ROWS, TILE } from './levels.js';

// Nunito o'yin ichiga qo'shilgan (@fontsource/nunito, OFL litsenziyasi) — internet kerak emas.
export const FONT = 'Nunito, system-ui, sans-serif';
export const MAP_W = COLS * TILE;
export const MAP_H = ROWS * TILE;

/**
 * Keng rejim — telefon (barmoq bilan boshqariladi, ekran nisbati ≥ 1,8). Telefon yon tomonda juda keng va past:
 * HUD yuqori/pastda tursa maydon kichrayib, ikki yonda bo'sh joy qoladi. Shuning uchun keng rejimda HUD
 * ikki yon ustunga o'tadi va maydon ekran balandligini to'liq egallaydi. Nisbat aylanishdan qat'i nazar tekshiriladi
 * (o'yin yuklanayotganda telefon hali tik turgan bo'lishi mumkin).
 */
function wideScreen() {
  if (typeof window === 'undefined') return false;
  const long = Math.max(window.innerWidth, window.innerHeight);
  const short = Math.min(window.innerWidth, window.innerHeight);
  let coarse = false;
  try {
    coarse = window.matchMedia('(pointer: coarse)').matches;
  } catch {
    /* eski brauzer — oddiy rejim */
  }
  return coarse && long / short >= 1.8;
}
export const WIDE = wideScreen();
export const SIDE = WIDE ? 128 : 0;
export const HUD_TOP = WIDE ? 0 : 48;
export const HUD_BOTTOM = WIDE ? 0 : 80;
// Mantiqiy o'lcham: barcha koordinatalar shu o'lchamda yoziladi.
export const GAME_W = MAP_W + 2 * SIDE;
export const GAME_H = MAP_H + HUD_TOP + HUD_BOTTOM;
// Menyu va darajalar oynasi shu o'lchamda chizilgan; keng rejimda ular kamera bilan ekranga sig'diriladi.
export const DESIGN_W = MAP_W;
export const DESIGN_H = MAP_H + 48 + 80;

/**
 * Tiniqlik: canvas ekrandagi haqiqiy piksellar soniga yaqin o'lchamda chiziladi (mantiqiy o'lcham × RES),
 * kamera esa RES marta yaqinlashtiriladi. Aks holda brauzer 960×672 rasmni cho'zib, xira qiladi.
 * Telefonda 2 dan oshmaydi (piksellar ko'payishi bilan GPU yuki ham oshadi).
 */
function resolution() {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
  const touch = navigator.maxTouchPoints > 0;
  const r = Math.round(dpr * Math.max(fit, 1) * 4) / 4; // 0,25 qadam bilan
  return Math.min(touch ? 2 : 3, Math.max(1, r));
}
export const RES = resolution();
/**
 * Kod bilan yaratiladigan teksturalar TEX marta katta chiziladi (butun son — o'lchamlar aniq chiqadi)
 * va INV ko'paytuvchi bilan kichraytirib ko'rsatiladi.
 */
export const TEX = Math.ceil(RES);
export const INV = 1 / TEX;
