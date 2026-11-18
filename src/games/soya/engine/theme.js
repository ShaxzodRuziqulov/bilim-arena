// Barcha ranglar shu yerda (YAXSHILASH.md, 4-qoida). Sahnalarda yangi hex qiymat yozilmaydi.

/**
 * Har dunyoning foni va devorlari. Mexanika ranglari (C) dunyoga qarab o'zgarmaydi (6-qoida).
 * accent — dunyo nomi va belgilar uchun.
 */
export const WORLD_THEME = [
  { // Uyg'onish — sovuq ko'k
    top: 0x161c42, bottom: 0x0b0d17, star: 0xc7d2fe, fog: 0x6366f1,
    wall: 0x2a3160, wallTop: 0x6b78c8, wallEdge: 0x363f78, accent: 0x7dd3fc,
  },
  { // Nur va vaqt — oltin, to'q sariq
    top: 0x2a1a14, bottom: 0x0f0b08, star: 0xfde68a, fog: 0xf59e0b,
    wall: 0x4a3526, wallTop: 0xd9a066, wallEdge: 0x5c4431, accent: 0xfacc15,
  },
  { // Harakat — yashil, firuza
    top: 0x0f2a28, bottom: 0x07120f, star: 0xa7f3d0, fog: 0x14b8a6,
    wall: 0x1f4542, wallTop: 0x5fd3b5, wallEdge: 0x2a5754, accent: 0x34d399,
  },
];

/** Menyu va darajalar ekrani foni. */
export const BG = WORLD_THEME[0];

/** O'yin elementlari. Har mexanika o'z rangiga ega (6-qoida). */
export const C = {
  grid: 0xc7d2fe,
  player: 0x7dd3fc, record: 0xef4444, rewind: 0xa78bfa, dust: 0x94a3b8,
  door: 0xf97316, doorEdge: 0xfdba74, button: 0xf97316, buttonOn: 0xfde68a, timer: 0xfacc15,
  spike: 0xef4444, exit: 0x22c55e, laser: 0xf43f5e, platform: 0x94a3b8,
};

export const SHADOW_COLORS = [0xa78bfa, 0xf472b6, 0x34d399];

/** Interfeys: tugmalar, panellar, matn. */
export const UI = {
  primary: 0x6366f1, primaryHover: 0x818cf8, primaryEdge: 0xa5b4fc,
  button: 0x1c2140, buttonHover: 0x283058, buttonEdge: 0x363d63,
  panel: 0x151a3a, bar: 0x0b0d17, keycap: 0x1f2440, keycapEdge: 0x3b4374,
  text: '#f8fafc', textSoft: '#cbd5e1', textMuted: '#94a3b8', ok: '#86efac', gold: '#fde047',
};

/** 0xrrggbb -> '#rrggbb' (Phaser matni uchun). */
export const css = (n) => `#${n.toString(16).padStart(6, '0')}`;

/** Foydalanuvchi tizimda "harakatni kamaytirish"ni yoqqanmi (9-qoida). */
export function reducedMotion() {
  try {
    // Platformada "Animatsiyalar" o'chirilgan bo'lsa (html.reduce-motion) — u ham hisobga olinadi.
    if (document.documentElement.classList.contains('reduce-motion')) return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
