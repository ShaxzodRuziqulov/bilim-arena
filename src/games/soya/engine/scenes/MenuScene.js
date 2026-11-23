import Phaser from 'phaser';
import { LEVELS } from '../levels.js';
import { DESIGN_H as GAME_H, DESIGN_W as GAME_W, FONT, INV } from '../layout.js';
import { backdrop, button, go, fitDesign, setupCamera } from '../ui.js';
import { getSave, nextLevelIndex, setMusic, setSound, totalStars } from '../save.js';
import { setAudioEnabled } from '../audio.js';
import { playMusic, setMusicEnabled } from '../music.js';
import { SHADOW_COLORS, UI, reducedMotion } from '../theme.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    this.still = reducedMotion();
    fitDesign(setupCamera(this, 300));
    backdrop(this, GAME_W, GAME_H, 7);

    // Sarlavhaning "soyasi" — o'yin g'oyasiga ishora.
    const echo = this.add.text(GAME_W / 2 + 10, 168, 'SOYA', { fontFamily: FONT, fontSize: 128, color: '#8b5cf6', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0.35);
    // Sarlavha soyasi sekin u yoqdan bu yoqqa suriladi.
    if (!reducedMotion()) this.tweens.add({ targets: echo, x: GAME_W / 2 - 10, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(GAME_W / 2, 160, 'SOYA', { fontFamily: FONT, fontSize: 128, color: '#e0e7ff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 248, 'Harakatingizni yozing. Soyangiz uni takrorlaydi.', { fontFamily: FONT, fontSize: 20, color: '#a5b4fc' }).setOrigin(0.5);

    const next = nextLevelIndex();
    const started = totalStars() > 0;
    const play = button(this, GAME_W / 2, 330, 340, 64, started ? `▶  Davom etish · ${LEVELS[next].id}` : '▶  Boshlash', () => this.go('game', { index: next }), { primary: true, fontSize: 24 });
    const levels = button(this, GAME_W / 2, 408, 340, 56, '☰  Darajalar', () => this.go('select'));
    // Ovoz effektlari va fon musiqasi alohida yoqib-o'chiriladi.
    const sound = button(this, GAME_W / 2 - 87, 476, 166, 56, '', () => {
      setSound(!getSave().sound);
      setAudioEnabled(getSave().sound);
      sound.setLabel(this.soundLabel());
    }, { fontSize: 18 });
    sound.setLabel(this.soundLabel());
    const music = button(this, GAME_W / 2 + 87, 476, 166, 56, '', () => {
      setMusic(!getSave().music);
      setMusicEnabled(getSave().music);
      if (getSave().music) playMusic('menu');
      music.setLabel(this.musicLabel());
    }, { fontSize: 18 });
    music.setLabel(this.musicLabel());
    playMusic('menu');

    const stars = this.add.text(GAME_W / 2, 536, `★ ${totalStars()} / ${LEVELS.length * 3}`, { fontFamily: FONT, fontSize: 20, color: UI.gold, fontStyle: 'bold' }).setOrigin(0.5);
    if (!reducedMotion()) {
      // Tugmalar va yulduzlar soni pastdan qatorma-qator chiqadi (bir tugmaning qismlari birga).
      [play.parts, levels.parts, [...sound.parts, ...music.parts], [stars]].forEach((row, i) => {
        for (const o of row) {
          o.alpha = 0; // Zone'da setAlpha yo'q, lekin xususiyat zarar qilmaydi
          o.y += 16;
        }
        this.tweens.add({ targets: row, alpha: 1, y: '-=16', delay: 120 + i * 70, duration: 240, ease: 'Cubic.Out' });
      });
    }
    this.add.text(GAME_W / 2, GAME_H - 24, 'Klaviatura: ← → yurish · ↑ sakrash · Q yozish · Z bekor qilish · R qaytadan · M musiqa · Esc menyu', { fontFamily: FONT, fontSize: 13, color: UI.textMuted }).setOrigin(0.5);

    this.createParade();
    this.input.keyboard.once('keydown-ENTER', () => this.go('game', { index: next }));
  }

  soundLabel() {
    return getSave().sound ? '🔊  Ovoz' : '🔇  Ovoz o‘chiq';
  }

  musicLabel() {
    return getSave().music ? '♫  Musiqa' : '♫  Musiqa o‘chiq';
  }

  /** Pastda qahramon yuradi, soyasi esa uning yo'lini kechikib takrorlaydi. */
  createParade() {
    const y = GAME_H - 64;
    this.add.rectangle(GAME_W / 2, y + 2, GAME_W - 120, 2, 0x363d63);
    this.parade = {
      y,
      shadow: this.add.image(120, y, 'shadow').setOrigin(0.5, 1).setTint(SHADOW_COLORS[0]).setAlpha(0.9).setScale(INV),
      hero: this.add.image(this.still ? 164 : 120, y, 'hero').setOrigin(0.5, 1).setTint(0x7dd3fc).setScale(INV),
      trail: [],
      dir: 1,
      clock: 0,
    };
  }

  update(_time, dt) {
    if (this.still) return;
    const p = this.parade;
    p.hero.x += p.dir * dt * 0.12;
    if (p.hero.x > GAME_W - 120 || p.hero.x < 120) p.dir *= -1;
    p.clock += dt;
    const phase = p.clock % 1400;
    p.hero.y = p.y - (phase < 400 ? Math.sin((phase / 400) * Math.PI) * 40 : 0);
    p.hero.setFlipX(p.dir < 0);
    p.trail.push({ x: p.hero.x, y: p.hero.y, f: p.dir < 0 });
    if (p.trail.length > 45) {
      const old = p.trail.shift();
      p.shadow.setPosition(old.x, old.y).setFlipX(old.f);
    }
  }

  go(key, data) {
    go(this, key, data);
  }
}
