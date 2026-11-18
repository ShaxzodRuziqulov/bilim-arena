import Phaser from 'phaser';
import { LEVELS } from '../levels.js';
import { setUnlockAll } from '../save.js';
import { GAME_H, GAME_W, TEX } from '../layout.js';

/** Grafikani kod bilan yaratadi (tashqi rasm kerak emas) va menyuga o'tadi. */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    // Qahramon va soya TEX marta katta chiziladi (tiniqlik) — sahnalarda INV bilan kichraytiriladi.
    const g = this.make.graphics({ x: 0, y: 0, add: false }).setScale(TEX);

    // Qahramon: oq tana (rang tint bilan beriladi), o'ngga qaragan ko'zlar.
    g.fillStyle(0xffffff).fillRoundedRect(0, 0, 22, 30, 7);
    g.fillStyle(0x0b0d17).fillCircle(13, 11, 2.6).fillCircle(18.5, 11, 2.6);
    g.fillStyle(0xffffff).fillCircle(13.8, 10.2, 0.9).fillCircle(19.3, 10.2, 0.9);
    g.generateTexture('hero', 22 * TEX, 30 * TEX);
    g.clear();

    // Ko'z yumgan qahramon (pirpiratish uchun).
    g.fillStyle(0xffffff).fillRoundedRect(0, 0, 22, 30, 7);
    g.fillStyle(0x0b0d17).fillRect(10.5, 10.4, 5, 1.6).fillRect(16, 10.4, 5, 1.6);
    g.generateTexture('hero_blink', 22 * TEX, 30 * TEX);
    g.clear();

    // Soya: oq chet (tint bilan soya rangiga bo'yaladi), to'q tana, porlovchi ko'zlar.
    g.fillStyle(0xffffff).fillRoundedRect(0, 0, 22, 30, 7);
    g.fillStyle(0x2b2840).fillRoundedRect(2, 2, 18, 26, 5);
    g.fillStyle(0xffffff).fillCircle(13, 11, 2.2).fillCircle(18.5, 11, 2.2);
    g.generateTexture('shadow', 22 * TEX, 30 * TEX);
    g.clear();

    // Zarracha nuqtasi — yumshoq bo'lgani yaxshi, oddiy o'lchamda qoladi.
    g.setScale(1);
    g.fillStyle(0xffffff).fillCircle(4, 4, 4);
    g.generateTexture('dot', 8, 8);
    g.destroy();

    // Yumshoq dog' (tuman, porlash) va yozish rejimining qizil vinyetkasi.
    this.radial('glow', 128, 128, 0, 64, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]);
    this.radial('vignette', GAME_W, GAME_H, GAME_W * 0.32, GAME_W * 0.72, [[0, 'rgba(239,68,68,0)'], [1, 'rgba(239,68,68,0.42)']]);

    // Sinov buyruqlari faqat ishlab chiqishda (npm run dev) ishlaydi — o'yinchilar versiyasida yo'q.
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(location.search);
      // ?ochiq=1 — barcha darajalarni ochadi, ?ochiq=0 — odatiy tartibga qaytaradi.
      if (params.has('ochiq')) setUnlockAll(params.get('ochiq') !== '0');
      // ?level=2-3 — to'g'ridan-to'g'ri darajani ochadi.
      const index = LEVELS.findIndex((l) => l.id === params.get('level'));
      if (index >= 0) {
        this.scene.start('game', { index });
        return;
      }
    }
    this.scene.start('menu');
  }

  /** Markazdan chetga radial gradientli tekstura. */
  radial(key, w, h, r0, r1, stops) {
    if (this.textures.exists(key)) return;
    const tex = this.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    const grad = ctx.createRadialGradient(w / 2, h / 2, r0, w / 2, h / 2, r1);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    tex.refresh();
  }
}
