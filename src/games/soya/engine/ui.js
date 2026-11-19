import { DESIGN_H, DESIGN_W, FONT, GAME_H, GAME_W, INV, RES, TEX, WIDE } from './layout.js';
import { sfx } from './audio.js';
import { BG, UI, reducedMotion } from './theme.js';

const RADIUS = 10;
const SHADE = 3; // tugma ostidagi soya balandligi

// Muhim (ishlash tezligi, 8-qoida): WebGL'da Graphics har kadrda qaytadan chiziladi, yumaloq burchaklar esa
// yuzlab buyruq bo'ladi. Shuning uchun o'zgarmaydigan shakllar bir marta teksturaga "pishiriladi".

/**
 * Yumaloq to'rtburchak teksturasi (bir xil o'lcham va rang uchun bir marta yaratiladi).
 * Tekstura balandligi h + shade: pastida shade px soya.
 */
export function roundedTexture(scene, w, h, fill, edge, { radius = RADIUS, edgeWidth = 2, edgeAlpha = 1, shade = SHADE } = {}) {
  const key = `rr-${w}x${h}-${radius}-${fill}-${edge}-${edgeWidth}-${edgeAlpha}-${shade}`;
  if (!scene.textures.exists(key)) {
    // TEX marta katta chiziladi (tiniqlik) — rasm INV bilan kichraytiriladi.
    const g = scene.make.graphics({ x: 0, y: 0, add: false }).setScale(TEX);
    if (shade) g.fillStyle(0x000000, 0.3).fillRoundedRect(0, shade, w, h, radius);
    g.fillStyle(fill).fillRoundedRect(0, 0, w, h, radius);
    const half = edgeWidth / 2;
    g.lineStyle(edgeWidth, edge, edgeAlpha).strokeRoundedRect(half, half, w - edgeWidth, h - edgeWidth, radius);
    g.generateTexture(key, w * TEX, (h + shade) * TEX);
    g.destroy();
  }
  return key;
}

/**
 * Sahna kamerasi: canvas GAME_W×RES o'lchamda, kamera RES marta yaqinlashtiriladi —
 * sahna kodi mantiqiy GAME_W×GAME_H koordinatalarda qoladi. Har sahna create() boshida chaqiradi.
 */
export function setupCamera(scene) {
  return scene.cameras.main.setOrigin(0, 0).setZoom(RES);
}

/**
 * Menyu va darajalar oynasi DESIGN_W × DESIGN_H da chizilgan. Keng rejimda (telefon) o'yin oynasi pastroq va kengroq —
 * shu sahnalarni kichraytirib, markazga qo'yamiz. Oddiy rejimda hech narsa o'zgarmaydi.
 */
export function fitDesign(camera) {
  if (!WIDE) return camera;
  const k = Math.min(GAME_H / DESIGN_H, GAME_W / DESIGN_W);
  return camera.setZoom(RES * k).setScroll(DESIGN_W / 2 - GAME_W / k / 2, DESIGN_H / 2 - GAME_H / k / 2);
}

/** Statik Graphics'ni RenderTexture'ga ko'chiradi va Graphics'ni o'chiradi. */
export function bake(scene, g, w, h) {
  // TEX marta katta tekstura (tiniqlik), INV bilan kichraytirib ko'rsatiladi.
  g.setScale(TEX);
  const rt = scene.add.renderTexture(0, 0, w * TEX, h * TEX).setOrigin(0).setScale(INV)
    .setDepth(g.depth).setScrollFactor(g.scrollFactorX).draw(g);
  g.destroy();
  return rt;
}

/**
 * Bosiladigan yumaloq tugma (sichqoncha va sensor). fixed — kamera surilsa ham joyida turadi.
 * Ko'rinish — tayyor tekstura, bosish maydoni — ko'rinmas Zone. Bosilganda 2px pastga "botadi".
 */
export function button(scene, x, y, w, h, label, onClick, { primary = false, fontSize = 20, fixed = false, depth = 0 } = {}) {
  const edge = primary ? UI.primaryEdge : UI.buttonEdge;
  const base = roundedTexture(scene, w, h, primary ? UI.primary : UI.button, edge);
  const hover = roundedTexture(scene, w, h, primary ? UI.primaryHover : UI.buttonHover, edge);
  const img = scene.add.image(x, y, base).setOrigin(0.5, h / 2 / (h + SHADE)).setScale(INV).setDepth(depth);
  const text = scene.add.text(x, y, label, { fontFamily: FONT, fontSize, color: UI.text, fontStyle: 'bold' }).setOrigin(0.5).setDepth(depth);
  const hit = scene.add.zone(x, y, w, h).setInteractive({ useHandCursor: true }).setDepth(depth);

  const press = (d) => {
    img.y = y + d;
    text.y = y + d;
  };
  hit.on('pointerover', () => {
    img.setTexture(hover);
    sfx('hover');
  });
  hit.on('pointerout', () => {
    img.setTexture(base);
    press(0);
  });
  hit.on('pointerdown', () => press(2));
  hit.on('pointerup', () => {
    press(0);
    sfx('click');
    onClick();
  });
  const parts = [img, text, hit];
  if (fixed) for (const p of parts) p.setScrollFactor(0);
  return { parts, text, setLabel: (l) => text.setText(l) };
}

/** Klaviatura tugmasi ko'rinishidagi belgi + izoh. Keyingi elementning x koordinatasini qaytaradi. */
export function keycap(scene, x, y, key, label, { depth = 0, fixed = false, parts = null } = {}) {
  const k = scene.add.text(0, y, key, { fontFamily: FONT, fontSize: 12, color: UI.text, fontStyle: 'bold' }).setOrigin(0.5).setDepth(depth + 1);
  const w = Math.ceil(Math.max(22, k.width + 12));
  k.x = x + w / 2;
  const cap = scene.add.image(x, y - 11, roundedTexture(scene, w, 22, UI.keycap, UI.keycapEdge, { radius: 5, edgeWidth: 1, shade: 0 }))
    .setOrigin(0).setScale(INV).setDepth(depth);
  const t = scene.add.text(x + w + 6, y, label, { fontFamily: FONT, fontSize: 13, color: UI.textMuted }).setOrigin(0, 0.5).setDepth(depth);
  if (fixed) for (const p of [k, cap, t]) p.setScrollFactor(0);
  if (parts) parts.push(k, cap, t); // chaqiruvchi ularni birga yashirishi/ko'rsatishi uchun
  return x + w + 6 + t.width + 16;
}

/** Sahnadan sahnaga bir xil o'tish: qorayib ketish, keyin yangi sahna. Ikki marta bosilsa ham bir marta ishlaydi. */
export function go(scene, key, data) {
  if (scene._leaving) return;
  scene._leaving = true;
  scene.cameras.main.fadeOut(200, 11, 13, 23);
  scene.cameras.main.once('camerafadeoutcomplete', () => {
    scene._leaving = false;
    scene.scene.start(key, data);
  });
}

/** Fon: yuqoridan pastga gradient, xira "yulduzlar" va sekin suzuvchi tuman. theme — WORLD_THEME elementi. */
export function backdrop(scene, w, h, seed = 1, theme = BG) {
  const g = scene.add.graphics();
  g.fillGradientStyle(theme.top, theme.top, theme.bottom, theme.bottom, 1);
  g.fillRect(0, 0, w, h);
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 60; i++) g.fillStyle(theme.star, 0.05 + rnd() * 0.12).fillCircle(rnd() * w, rnd() * h, 0.6 + rnd() * 1.4);
  const rt = bake(scene, g, w, h);

  // Tuman dog'lari — ekran qimirlamasa ham sahna "nafas oladi". Faqat ko'rinish, mexanikaga ta'siri yo'q.
  const still = reducedMotion();
  for (let i = 0; i < 4; i++) {
    const fog = scene.add.image(rnd() * w, rnd() * h, 'glow').setTint(theme.fog).setAlpha(0.08).setScale(3 + rnd() * 3);
    if (!still) {
      scene.tweens.add({
        targets: fog, x: fog.x + (rnd() - 0.5) * 180, y: fog.y + (rnd() - 0.5) * 60,
        duration: 9000 + rnd() * 6000, yoyo: true, repeat: -1, ease: 'Sine.InOut',
      });
    }
  }
  return rt;
}
