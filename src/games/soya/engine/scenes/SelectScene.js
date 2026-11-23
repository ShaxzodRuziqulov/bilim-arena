import Phaser from 'phaser';
import { LEVELS, WORLDS } from '../levels.js';
import { FONT, GAME_H, GAME_W, INV } from '../layout.js';
import { backdrop, button, go, roundedTexture, setupCamera } from '../ui.js';
import { isUnlocked, levelResult, totalStars } from '../save.js';
import { sfx } from '../audio.js';
import { playMusic } from '../music.js';
import { UI, WORLD_THEME, css, reducedMotion } from '../theme.js';

const TILE_W = 120;
const TILE_H = 96;

export default class SelectScene extends Phaser.Scene {
  constructor() {
    super('select');
  }

  create() {
    setupCamera(this);
    playMusic('menu');
    backdrop(this, GAME_W, GAME_H, 3);
    button(this, 90, 40, 140, 44, '← Menyu', () => go(this, 'menu'));
    this.add.text(GAME_W / 2, 40, 'Darajalar', { fontFamily: FONT, fontSize: 30, color: '#e0e7ff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(GAME_W - 40, 40, `★ ${totalStars()} / ${LEVELS.length * 3}`, { fontFamily: FONT, fontSize: 20, color: UI.gold, fontStyle: 'bold' }).setOrigin(1, 0.5);

    let order = 0; // kartochkalar ketma-ket chiqishi uchun
    WORLDS.forEach((world, wi) => {
      const top = 104 + wi * 186;
      const theme = WORLD_THEME[wi] || WORLD_THEME[0];
      if (wi > 0) this.add.rectangle(GAME_W / 2, top - 14, GAME_W - 120, 1, theme.accent, 0.18);
      // Dunyo belgisi: shu dunyo rangidagi kichik doira.
      this.add.circle(68, top + 13, 6, theme.accent);
      this.add.text(82, top, `${wi + 1}. ${world.name}`, { fontFamily: FONT, fontSize: 22, color: css(theme.accent), fontStyle: 'bold' });
      this.add.text(60, top + 30, world.about, { fontFamily: FONT, fontSize: 14, color: UI.textMuted });
      world.levels.forEach((_, li) => {
        const index = LEVELS.findIndex((l) => l.worldIndex === wi && l.id === `${wi + 1}-${li + 1}`);
        this.levelTile(index, 60 + TILE_W / 2 + li * (TILE_W + 22), top + 62 + TILE_H / 2, theme, order++);
      });
    });

    this.input.keyboard.on('keydown-ESC', () => go(this, 'menu'));
  }

  levelTile(index, x, y, theme, order) {
    const level = LEVELS[index];
    const open = isUnlocked(index);
    const result = levelResult(level.id);
    // Kartochka konteynerda: hover'da birga kattalashadi va birga chiqadi.
    const card = this.add.container(x, y);
    const edge = result ? theme.accent : open ? UI.buttonEdge : 0x1f2440;
    const tex = (fill) => roundedTexture(this, TILE_W, TILE_H, fill, edge, { radius: 12, edgeAlpha: result ? 0.8 : 1, shade: 0 });
    const bg = this.add.image(0, 0, tex(open ? UI.button : 0x121528)).setScale(INV);
    const draw = (fill) => bg.setTexture(tex(fill));
    card.add(bg);
    card.add(this.add.text(0, -22, open ? level.id : '🔒', { fontFamily: FONT, fontSize: 24, color: open ? UI.text : '#4b5563', fontStyle: 'bold' }).setOrigin(0.5));
    if (open) {
      card.add(this.add.text(0, 4, level.name, { fontFamily: FONT, fontSize: 12, color: UI.textMuted, align: 'center', wordWrap: { width: TILE_W - 12 } }).setOrigin(0.5, 0));
      const stars = result?.stars || 0;
      card.add(this.add.text(0, 34, '★★★'.slice(0, stars) + '☆☆☆'.slice(stars), { fontFamily: FONT, fontSize: 18, color: stars ? UI.gold : '#4b5563' }).setOrigin(0.5));
      card.setSize(TILE_W, TILE_H).setInteractive({ useHandCursor: true });
      card.on('pointerover', () => {
        draw(UI.buttonHover);
        sfx('hover');
        this.tweens.add({ targets: card, scale: 1.05, duration: 120 });
      });
      card.on('pointerout', () => {
        draw(UI.button);
        this.tweens.add({ targets: card, scale: 1, duration: 120 });
      });
      card.on('pointerup', () => {
        sfx('click');
        go(this, 'game', { index });
      });
    }
    if (!reducedMotion()) {
      card.setAlpha(0).y += 12;
      this.tweens.add({ targets: card, alpha: 1, y, delay: order * 30, duration: 220, ease: 'Cubic.Out' });
    }
  }
}
