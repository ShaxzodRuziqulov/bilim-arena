import { COLS, ROWS, TILE } from './levels.js';

// Nunito o'yin ichiga qo'shilgan (@fontsource/nunito, OFL litsenziyasi) — internet kerak emas.
export const FONT = 'Nunito, system-ui, sans-serif';
export const MAP_W = COLS * TILE;
export const MAP_H = ROWS * TILE;
export const HUD_TOP = 48;
export const HUD_BOTTOM = 80;
// Mantiqiy o'lcham: barcha koordinatalar shu o'lchamda yoziladi.
export const GAME_W = MAP_W;
export const GAME_H = MAP_H + HUD_TOP + HUD_BOTTOM;

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
