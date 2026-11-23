import Phaser from 'phaser';
import { COLS, LEVELS, ROWS, TILE, mergeCells, parseLevel, starsFor } from '../levels.js';
import { FONT, GAME_H, GAME_W, HUD_TOP, INV, MAP_H, MAP_W, SIDE, TEX, WIDE } from '../layout.js';
import { backdrop, bake, button, go, keycap, roundedTexture, setupCamera } from '../ui.js';
import { getSave, recordResult, setMusic } from '../save.js';
import { sfx } from '../audio.js';
import { isTouchMode, onTouchModeChange } from '../inputMode.js';
import { duckMusic, playMusic, setMusicEnabled, setMusicMuffled } from '../music.js';
import { C, SHADOW_COLORS, UI, WORLD_THEME, css, reducedMotion } from '../theme.js';

const STEPS_PER_SEC = 60;
const MAX_RECORD = 8 * STEPS_PER_SEC; // bitta soya — 8 soniya
const SPEED = 220;
const JUMP = 640; // ~4,5 katak: poldan 5 katakka yetmaydi, soya boshidan (+1 katak) yetadi
const LASER_TIMING = { on: 2, off: 1.2, stagger: 0.8 }; // soniya; lazerlar navbat bilan yonib-o'chadi

const GHOST_LIFE = 300; // ms — soya ortidagi arvoh iz qancha turadi
const GHOST_ALPHA = 0.28;
const LASER_DIR = { v: [0, 1], '>': [1, 0], '<': [-1, 0] };

const hit = (a, b) => Phaser.Geom.Intersects.RectangleToRectangle(a, b);

/** Matn rangini faqat o'zgarganda yangilaydi (setColor har chaqirilganda matnni qayta chizadi). */
const paint = (t, color) => (t.style.color === color ? t : t.setColor(color));

/** Uzuq-uzuq chiziq (Graphics'da tayyor dash yo'q). */
function dashLine(g, x1, y1, x2, y2, dash = 6, gap = 6) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  for (let d = 0; d < len; d += dash + gap) {
    const e = Math.min(d + dash, len);
    g.lineBetween(x1 + ux * d, y1 + uy * d, x1 + ux * e, y1 + uy * e);
  }
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game');
  }

  init(data) {
    this.levelIndex = data.index ?? 0;
  }

  create() {
    this.level = LEVELS[this.levelIndex];
    const map = parseLevel(this.level.map);
    this.won = false;
    this.t = 0;
    this.shadows = []; // { frames: [{x,y}], body (ko'rinmas jism), sprite (ko'rinish), halo, trail }
    this.trailRT = null; // sahna qayta ishga tushganda eski (o'chirilgan) tekstura qolmasin
    // Yo'l Graphics'lari sahna ro'yxatida emas — sahna yopilganda o'zimiz o'chiramiz.
    this.events.once('shutdown', () => this.shadows.forEach((s) => s.trail.destroy()));
    this.rec = null; // { frames } — yozilayotgan harakat
    this.touch = { left: false, right: false, jump: false };
    this.facing = 1;
    this.grounded = true;

    // Xarita HUD ostida (keng rejimda — ikki yon ustun orasida): kamera suriladi, HUD ekranga mahkamlanadi.
    this.cameras.main.setScroll(-SIDE, -HUD_TOP);
    setupCamera(this);
    playMusic(this.level.worldIndex); // har dunyoning o'z kuyi
    setMusicMuffled(false);
    this.physics.world.setBounds(0, 0, MAP_W, MAP_H);
    this.theme = WORLD_THEME[this.level.worldIndex] || WORLD_THEME[0];
    backdrop(this, MAP_W, MAP_H, this.levelIndex + 1, this.theme);

    const center = (t) => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE / 2 });
    this.solid = new Set(map.walls.map((t) => `${t.x},${t.y}`));
    this.drawWalls(map.walls);

    // --- Eshiklar va tugmalar ---
    this.doorGroup = this.physics.add.staticGroup();
    this.doors = {};
    this.doorAt = new Map(); // "x,y" -> eshik (lazer to'sig'i uchun)
    for (const [letter, tiles] of Object.entries(map.doors)) {
      const door = { rects: [], visuals: [], open: false, timerPie: null };
      // Bir eshikning qo'shni kataklari bitta jism bo'ladi.
      // Fizik jism ko'rinmas va joyidan qimirlamaydi; ko'rinadigan nusxa ochilganda yuqoriga yig'iladi.
      for (const m of mergeCells(tiles)) {
        const w = m.w * TILE - 8;
        const h = m.h * TILE;
        const r = this.add.rectangle((m.x + m.w / 2) * TILE, (m.y + m.h / 2) * TILE, w, h).setVisible(false);
        this.doorGroup.add(r);
        door.rects.push(r);
        door.visuals.push(this.add.rectangle(r.x, m.y * TILE, w, h, C.door).setOrigin(0.5, 0).setStrokeStyle(2, C.doorEdge));
      }
      for (const t of tiles) this.doorAt.set(`${t.x},${t.y}`, door);
      const top = door.rects[0];
      door.label = this.add.text(top.x, top.y - top.height / 2 + 14, letter, { fontFamily: FONT, fontSize: 14, color: '#431407', fontStyle: 'bold' }).setOrigin(0.5);
      this.doors[letter] = door;
    }

    const timers = this.level.timers || {};
    this.buttons = {};
    for (const [letter, tiles] of Object.entries(map.buttons)) {
      const seconds = timers[letter] || 0;
      this.buttons[letter] = tiles.map((t) => {
        const plate = this.add.rectangle(t.x * TILE + TILE / 2, (t.y + 1) * TILE - 4, TILE - 6, 8, seconds ? C.timer : C.button);
        const label = seconds ? `${letter.toUpperCase()} ⏱${seconds}` : letter.toUpperCase();
        this.add.text(t.x * TILE + TILE / 2, (t.y + 1) * TILE - 20, label, { fontFamily: FONT, fontSize: 13, color: seconds ? '#fde047' : '#fdba74' }).setOrigin(0.5);
        return { plate, seconds, zone: new Phaser.Geom.Rectangle(t.x * TILE + 3, (t.y + 1) * TILE - 16, TILE - 6, 16), pressed: false, down: false, was: false, until: 0 };
      });
    }
    // Tugmadan eshikkacha xira "sim" — qaysi tugma qaysi eshikni ochishi harfsiz ham ko'rinadi.
    const wires = this.add.graphics().setDepth(1);
    for (const [letter, door] of Object.entries(this.doors)) {
      const target = door.rects[0];
      for (const b of this.buttons[letter.toLowerCase()] || []) {
        b.wire = { x1: b.plate.x, y1: b.plate.y, x2: target.x, y2: target.y };
        wires.lineStyle(2, b.seconds ? C.timer : C.door, 0.18);
        dashLine(wires, b.wire.x1, b.wire.y1, b.wire.x2, b.wire.y2);
      }
      if ((this.buttons[letter.toLowerCase()] || []).some((b) => b.seconds)) {
        // Vaqtli eshik ustida qolgan vaqtni ko'rsatuvchi doira.
        door.timerPie = this.add.graphics().setDepth(6);
        door.pieAt = { x: target.x, y: target.y - target.height / 2 - 12 };
      }
    }
    bake(this, wires, MAP_W, MAP_H);
    this.btnSparks = this.add.particles(0, 0, 'dot', {
      speed: { min: 40, max: 140 }, angle: { min: 200, max: 340 }, lifespan: 300,
      scale: { start: 0.45, end: 0 }, tint: C.buttonOn, emitting: false,
    }).setDepth(6);

    // --- Tikanlar, lazerlar, chiqish ---
    this.spikeZones = map.spikes.map((t) => {
      const x = t.x * TILE;
      const y = (t.y + 1) * TILE;
      this.add.triangle(0, 0, x + 2, y, x + TILE / 2, y - 18, x + TILE - 2, y, C.spike).setOrigin(0, 0);
      return new Phaser.Geom.Rectangle(x + 5, y - 14, TILE - 10, 14);
    });

    const timing = { ...LASER_TIMING, ...this.level.laser };
    this.lasers = map.lasers.map((l, i) => {
      const { x, y } = center(l);
      const [dx, dy] = LASER_DIR[l.dir];
      this.add.rectangle(x - dx * 10, y - dy * 10, dy ? 22 : 12, dy ? 12 : 22, 0x4b5563).setStrokeStyle(2, C.laser);
      return {
        ...l, dx, dy, ox: x + dx * 6, oy: y + dy * 6,
        lens: this.add.circle(x + dx * 2, y + dy * 2, 4, C.laser).setDepth(3),
        on: timing.on * STEPS_PER_SEC,
        cycle: (timing.on + timing.off) * STEPS_PER_SEC,
        offset: Math.round(i * timing.stagger * STEPS_PER_SEC),
      };
    });
    this.laserGfx = this.add.graphics();
    this.sparks = this.add.particles(0, 0, 'dot', {
      speed: { min: 40, max: 160 }, angle: { min: 0, max: 360 }, lifespan: 250,
      scale: { start: 0.45, end: 0 }, tint: C.laser, blendMode: 'ADD', emitting: false,
    }).setDepth(6);

    const ex = center(map.exit);
    // Portal: porlash + ikki oval (ichkisi "aylanayotgandek" torayib-kengayadi) + ichkariga so'riluvchi zarrachalar.
    this.portal = { x: ex.x, y: ex.y - TILE / 2 };
    const { x: px, y: py } = this.portal;
    const halo = this.add.image(px, py, 'glow').setTint(C.exit).setAlpha(0.3).setScale(0.9, 1.4);
    const outer = this.add.ellipse(px, py, TILE + 4, TILE * 2, C.exit, 0.12).setStrokeStyle(2, C.exit);
    const inner = this.add.ellipse(px, py, TILE - 8, TILE * 2 - 14, C.exit, 0.2).setStrokeStyle(1, C.exit, 0.6);
    this.tweens.add({ targets: halo, alpha: { from: 0.2, to: 0.45 }, duration: 1100, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: outer, alpha: { from: 0.7, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: inner, scaleX: { from: 1, to: 0.5 }, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // Emitter (0,0) da — zona va moveTo dunyo koordinatalarida beriladi.
    this.add.particles(0, 0, 'dot', {
      emitZone: { type: 'random', source: new Phaser.Geom.Ellipse(px, py, TILE * 2.4, TILE * 3.2) },
      moveToX: px, moveToY: py, lifespan: 900,
      scale: { start: 0.5, end: 0.1 }, alpha: { start: 0, end: 0.9 }, tint: C.exit, frequency: 80,
    });
    if (this.level.worldIndex === 0) {
      this.add.text(px, py - TILE - 12, 'CHIQISH', { fontFamily: FONT, fontSize: 11, color: '#86efac' }).setOrigin(0.5);
    }
    this.exitZone = new Phaser.Geom.Rectangle(ex.x - 10, ex.y - TILE, 20, TILE * 2);

    // --- O'yinchi: ko'rinmas fizik jism + uni kuzatuvchi qahramon rasmi ---
    this.startPos = { x: center(map.start).x, y: (map.start.y + 1) * TILE - 16 };
    this.player = this.add.rectangle(this.startPos.x, this.startPos.y, 22, 30).setVisible(false);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.doorGroup);
    this.recGlow = this.add.ellipse(0, 0, 40, 46, C.record, 0.25).setVisible(false);
    this.tweens.add({ targets: this.recGlow, scale: { from: 0.9, to: 1.15 }, duration: 400, yoyo: true, repeat: -1 });
    this.hero = this.add.image(this.startPos.x, this.startPos.y + 15, 'hero').setOrigin(0.5, 1).setTint(C.player).setDepth(5).setScale(INV);
    // Faqat ko'rinish holati (fizikaga ta'sir qilmaydi): siqilish, pirpiratish, chang vaqti.
    this.sq = { x: 1, y: 1 };
    this.blinkAt = 1500;
    this.blinkUntil = 0;
    this.dustAt = 0;
    this.dust = this.add.particles(0, 0, 'dot', {
      speedX: { min: -30, max: 30 }, speedY: { min: -40, max: -10 }, lifespan: 260,
      scale: { start: 0.5, end: 0 }, alpha: { start: 0.5, end: 0 }, tint: C.dust, emitting: false,
    }).setDepth(4);
    // Soya ortidagi "arvoh" izlar — tayyor obyektlar havzasidan olinadi.
    // Tween ishlatilmaydi: har izga yangi tween ko'p axlat (GC) va kadr sakrashlarini beradi.
    this.ghosts = Array.from({ length: 24 }, () => ({
      img: this.add.image(0, 0, 'shadow').setOrigin(0.5, 1).setScale(INV).setDepth(3).setVisible(false),
      life: 0,
    }));

    // Yozish rejimi: ekran chetlari qizaradi, burchakda REC; qayta boshlashda "orqaga o'rash".
    this.vignette = this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setScrollFactor(0).setDepth(19).setAlpha(0);
    this.rewindVeil = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, C.rewind, 0).setScrollFactor(0).setDepth(18);
    this.recBadge = this.add.text(SIDE + 14, HUD_TOP + 10, '● REC', { fontFamily: FONT, fontSize: 16, color: '#f87171', fontStyle: 'bold' })
      .setScrollFactor(0).setDepth(19).setVisible(false);
    this.tweens.add({ targets: this.recBadge, alpha: { from: 1, to: 0.25 }, duration: 500, yoyo: true, repeat: -1 });

    // --- Harakatlanuvchi platformalar (vaqtga bog'liq — har urinishda bir xil) ---
    this.platforms = (this.level.platforms || []).map((cfg) => {
      const rect = this.add.rectangle(0, 0, cfg.w * TILE, 14, C.platform).setStrokeStyle(2, 0xcbd5e1);
      this.makeKinematic(rect);
      return { cfg, rect };
    });

    this.burst = this.add.particles(0, 0, 'dot', {
      speed: { min: 80, max: 280 }, angle: { min: 0, max: 360 }, lifespan: 550,
      scale: { start: 0.9, end: 0 }, emitting: false,
    }).setDepth(6);

    this.createHud();
    this.createInput();
    this.createTouch();
    // Barmoq tegsa — ekran tugmalari chiqadi, klaviatura bosilsa — yashirinadi (inputMode.js).
    this.applyTouchMode(isTouchMode());
    const off = onTouchModeChange((on) => this.applyTouchMode(on));
    this.events.once('shutdown', off);
    this.resetRun();

    // Yozish va takrorlash fizika qadamiga bog'langan — ekran chastotasidan qat'i nazar bir xil natija.
    // Sahna yopilganda this.physics.world allaqachon null bo'ladi — shuning uchun havola saqlab qo'yiladi.
    const world = this.physics.world;
    const onStep = () => this.step();
    world.on('worldstep', onStep);
    this.events.once('shutdown', () => world.off('worldstep', onStep));
  }

  drawWalls(walls) {
    // Ko'rinish — xira to'r + har katak alohida (ochiq tomonlari yorqin, ostiga soya tushadi).
    // Bir marta RenderTexture'ga chiziladi, har kadrda qayta chizilmaydi.
    // Fizika — birlashtirilgan katta to'rtburchaklar.
    const g = this.add.graphics();
    g.lineStyle(1, C.grid, 0.05);
    for (let x = TILE; x < MAP_W; x += TILE) g.lineBetween(x, 0, x, MAP_H);
    for (let y = TILE; y < MAP_H; y += TILE) g.lineBetween(0, y, MAP_W, y);

    const air = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !this.solid.has(`${x},${y}`);
    for (const t of walls) {
      const x = t.x * TILE;
      const y = t.y * TILE;
      g.fillStyle(this.theme.wall).fillRect(x, y, TILE, TILE);
      g.lineStyle(1, this.theme.wallEdge).strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      if (air(t.x - 1, t.y)) g.fillStyle(this.theme.wallTop, 0.35).fillRect(x, y, 2, TILE);
      if (air(t.x + 1, t.y)) g.fillStyle(this.theme.wallTop, 0.35).fillRect(x + TILE - 2, y, 2, TILE);
      if (air(t.x, t.y - 1)) {
        g.fillStyle(this.theme.wallTop).fillRect(x, y, TILE, 4);
        g.fillStyle(0xffffff, 0.1).fillRect(x, y + 4, TILE, 2);
      }
      if (air(t.x, t.y + 1)) {
        g.fillStyle(0x000000, 0.3).fillRect(x, y + TILE, TILE, 4);
        g.fillStyle(0x000000, 0.14).fillRect(x, y + TILE + 4, TILE, 5);
      }
    }
    bake(this, g, MAP_W, MAP_H);
    this.walls = this.physics.add.staticGroup();
    for (const r of mergeCells(walls)) {
      this.walls.add(this.add.rectangle((r.x + r.w / 2) * TILE, (r.y + r.h / 2) * TILE, r.w * TILE, r.h * TILE).setVisible(false));
    }
  }

  /** Soya va platforma: tortishishsiz, itarilmaydi, faqat ustidan turish mumkin. */
  makeKinematic(obj) {
    this.physics.add.existing(obj);
    const b = obj.body;
    b.setAllowGravity(false);
    b.setImmovable(true);
    b.checkCollision.down = false;
    b.checkCollision.left = false;
    b.checkCollision.right = false;
    this.physics.add.collider(this.player, obj, null, this.landsOnTop, this);
  }

  // Bir tomonlama to'qnashuv: o'yinchi faqat yuqoridan tushganda ushlanadi.
  // Aks holda boshlanishda bir joyda turgan soya o'yinchini yuqoriga otib yuboradi.
  landsOnTop(player, obj) {
    const p = player.body;
    const o = obj.body;
    return p.velocity.y >= o.velocity.y - 1 && p.prev.y + p.height <= o.prev.y + 6;
  }

  platformPos(cfg, t) {
    const period = cfg.period * STEPS_PER_SEC;
    const u = (1 - Math.cos(((t % period) / period) * Math.PI * 2)) / 2;
    const tx = cfg.x + ((cfg.toX ?? cfg.x) - cfg.x) * u;
    const ty = cfg.y + ((cfg.toY ?? cfg.y) - cfg.y) * u;
    return { x: (tx + cfg.w / 2) * TILE, y: ty * TILE + 7 };
  }

  /** Kinematik jismlarni keyingi qadamdagi joyiga tezlik bilan yo'naltiradi (ustidagi o'yinchini olib yuradi). */
  driveKinematics(teleport = false) {
    const drive = (body, now, next) => {
      if (teleport) body.reset(now.x, now.y);
      body.setVelocity((next.x - body.center.x) * STEPS_PER_SEC, (next.y - body.center.y) * STEPS_PER_SEC);
    };
    for (const s of this.shadows) {
      const f = (i) => s.frames[Math.min(i, s.frames.length - 1)];
      drive(s.body.body, f(this.t), f(this.t + 1));
    }
    for (const p of this.platforms) drive(p.rect.body, this.platformPos(p.cfg, this.t), this.platformPos(p.cfg, this.t + 1));
  }

  // --- HUD va boshqaruv ---

  createHud() {
    if (WIDE) return this.createSideHud();
    const s = (o) => o.setScrollFactor(0).setDepth(20);
    this.recBarW = 240;
    s(this.add.rectangle(0, 0, GAME_W, HUD_TOP, UI.bar).setOrigin(0));
    button(this, 30, 24, 40, 36, '☰', () => go(this, 'select'), { fixed: true, depth: 21, fontSize: 18 });
    button(this, 76, 24, 40, 36, '↻', () => this.restartLevel(), { fixed: true, depth: 21, fontSize: 18 });
    // Daraja raqami dunyo rangida.
    const idText = s(this.add.text(108, 12, this.level.id, { fontFamily: FONT, fontSize: 20, color: css(this.theme.accent), fontStyle: 'bold' }));
    s(this.add.text(108 + idText.width + 8, 12, `· ${this.level.name}`, { fontFamily: FONT, fontSize: 20, color: UI.text, fontStyle: 'bold' }));
    this.statText = s(this.add.text(GAME_W - 16, 15, '', { fontFamily: FONT, fontSize: 15, color: '#c4b5fd' }).setOrigin(1, 0));
    this.recText = s(this.add.text(GAME_W / 2 + 60, 14, '', { fontFamily: FONT, fontSize: 16, color: '#fca5a5', fontStyle: 'bold' }).setOrigin(0.5, 0));
    this.recBarBg = s(this.add.rectangle(GAME_W / 2 - 60, 40, 240, 4, 0x374151).setOrigin(0, 0.5));
    this.recBar = s(this.add.rectangle(GAME_W / 2 - 60, 40, 240, 4, C.record).setOrigin(0, 0.5));

    const by = HUD_TOP + MAP_H;
    s(this.add.rectangle(0, by, GAME_W, GAME_H - by, UI.bar).setOrigin(0));
    // Joyi applyTouchMode'da: sensorli rejimda pastki tugmalar HUD'ga 22px kirib turadi.
    this.hintText = s(this.add.text(16, by + 8, this.level.hint, { fontFamily: FONT, fontSize: 14, color: UI.textSoft, wordWrap: { width: GAME_W - 32 } }));

    // Yulduz shartlari: hozircha bajarilayotgani yashil, boy berilgani kulrang (updateHud yangilaydi).
    const p = this.level.par;
    const row = by + 62;
    let x = 16;
    this.starGoals = [`★ o‘tish`, `★ ≤ ${p.shadows} soya`, `★ ≤ ${p.seconds} s`].map((label) => {
      const t = s(this.add.text(x, row, label, { fontFamily: FONT, fontSize: 13, color: UI.ok, fontStyle: 'bold' }).setOrigin(0, 0.5));
      x += t.width + 14;
      return t;
    });
    // Boshqaruv — klaviatura tugmasi ko'rinishida (sensorli rejimda yashirinadi — u yerda ekran tugmalari bor).
    this.keycapParts = [];
    x = Math.max(x + 24, 300);
    for (const [key, label] of [['← →', 'yurish'], ['↑', 'sakrash'], ['Q', 'yozish'], ['Z', 'bekor'], ['R', 'qayta'], ['M', 'musiqa'], ['Esc', 'menyu']]) {
      x = keycap(this, x, row, key, label, { depth: 20, fixed: true, parts: this.keycapParts });
    }

    this.flashText = s(this.add.text(GAME_W / 2, HUD_TOP + 40, '', { fontFamily: FONT, fontSize: 18, color: '#fef3c7', backgroundColor: '#78350f', padding: { x: 12, y: 6 } }).setOrigin(0.5).setAlpha(0));
  }

  /** Keng rejim (telefon yon tomonda): HUD ikki yon ustunda, maydon ekran balandligini to'liq egallaydi. */
  createSideHud() {
    const s = (o) => o.setScrollFactor(0).setDepth(20);
    const right = GAME_W - SIDE;
    s(this.add.rectangle(0, 0, SIDE, GAME_H, UI.bar).setOrigin(0));
    s(this.add.rectangle(right, 0, SIDE, GAME_H, UI.bar).setOrigin(0));
    // Chap ustun: menyu, qayta boshlash, daraja nomi, holat va yo'riqnoma.
    button(this, 34, 30, 48, 44, '☰', () => go(this, 'select'), { fixed: true, depth: 21, fontSize: 20 });
    button(this, 94, 30, 48, 44, '↻', () => this.restartLevel(), { fixed: true, depth: 21, fontSize: 20 });
    s(this.add.text(12, 64, this.level.id, { fontFamily: FONT, fontSize: 20, color: css(this.theme.accent), fontStyle: 'bold' }));
    s(this.add.text(12, 88, this.level.name, { fontFamily: FONT, fontSize: 17, color: UI.text, fontStyle: 'bold', wordWrap: { width: SIDE - 20 } }));
    this.statText = s(this.add.text(12, 136, '', { fontFamily: FONT, fontSize: 16, color: '#c4b5fd', lineSpacing: 2 }));
    this.hintText = s(this.add.text(12, 190, this.level.hint, { fontFamily: FONT, fontSize: 14, color: UI.textSoft, wordWrap: { width: SIDE - 16 }, lineSpacing: 0 }));
    // O'ng ustun: yozish holati va yulduz shartlari.
    this.recText = s(this.add.text(right + SIDE / 2, 14, '', { fontFamily: FONT, fontSize: 15, color: '#fca5a5', fontStyle: 'bold', align: 'center', wordWrap: { width: SIDE - 12 } }).setOrigin(0.5, 0));
    this.recBarW = SIDE - 24;
    this.recBarBg = s(this.add.rectangle(right + 12, 66, this.recBarW, 4, 0x374151).setOrigin(0, 0.5));
    this.recBar = s(this.add.rectangle(right + 12, 66, this.recBarW, 4, C.record).setOrigin(0, 0.5));
    const p = this.level.par;
    this.starGoals = [`★ o‘tish`, `★ ≤ ${p.shadows} soya`, `★ ≤ ${p.seconds} s`].map((label, i) =>
      s(this.add.text(right + 12, 92 + i * 26, label, { fontFamily: FONT, fontSize: 16, color: UI.ok, fontStyle: 'bold' }).setOrigin(0, 0.5)),
    );
    this.keycapParts = []; // keng rejim faqat sensorli qurilmada
    this.flashText = s(this.add.text(GAME_W / 2, 40, '', { fontFamily: FONT, fontSize: 18, color: '#fef3c7', backgroundColor: '#78350f', padding: { x: 12, y: 6 } }).setOrigin(0.5).setAlpha(0));
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,Q,Z,R,M,ENTER,N,ESC');
    this.keys.M.on('down', () => {
      setMusic(!getSave().music);
      setMusicEnabled(getSave().music);
      if (getSave().music) playMusic(this.level.worldIndex);
      this.flash(getSave().music ? 'Musiqa: yoniq (M)' : 'Musiqa: o‘chiq (M)');
    });
    this.keys.Q.on('down', () => this.toggleRecording());
    this.keys.Z.on('down', () => this.removeLastShadow());
    this.keys.R.on('down', () => this.restartLevel());
    this.keys.ESC.on('down', () => go(this, 'select'));
    const next = () => this.won && this.nextLevel();
    this.keys.ENTER.on('down', next);
    this.keys.N.on('down', next);
  }

  /** Sensorli rejim: ekran tugmalari ko'rinadi, klaviatura belgilari yashirinadi (va aksincha). */
  applyTouchMode(on) {
    this.touchMode = on;
    for (const o of this.touchParts) o.setVisible(on);
    for (const o of this.keycapParts) o.setVisible(!on);
    if (!WIDE) this.hintText.y = HUD_TOP + MAP_H + (on ? 26 : 8);
    this.hintText.setText(on ? (this.level.touchHint ?? this.level.hint) : this.level.hint);
    if (!on) Object.assign(this.touch, { left: false, right: false, jump: false });
  }

  /** Telefon/planshet uchun ekran tugmalari (ko'p barmoqli bosish). Ko'rinishi — applyTouchMode. */
  createTouch() {
    this.input.addPointer(3);
    this.touchParts = [];
    // Tugmalar pastki pol devori ustida — o'yin maydonini deyarli to'smaydi.
    const y = HUD_TOP + MAP_H - 22;
    const pad = (x, label, key, r = 44, py = y) => {
      const c = this.add.circle(x, py, r, 0xffffff, 0.1).setStrokeStyle(2, 0xffffff, 0.3).setScrollFactor(0).setDepth(30).setInteractive();
      const t = this.add.text(x, py, label, { fontFamily: FONT, fontSize: 30, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(31).setAlpha(0.8);
      this.touchParts.push(c, t);
      const set = (v) => {
        this.touch[key] = v;
        c.setFillStyle(0xffffff, v ? 0.28 : 0.1);
      };
      c.on('pointerdown', () => set(true));
      c.on('pointerup', () => set(false));
      c.on('pointerout', () => set(false));
    };
    const tap = (x, label, fn, color = 0xffffff, py = y) => {
      const c = this.add.circle(x, py, 44, color, 0.14).setStrokeStyle(2, color, 0.45).setScrollFactor(0).setDepth(30).setInteractive();
      const t = this.add.text(x, py, label, { fontFamily: FONT, fontSize: 28, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(31).setAlpha(0.85);
      this.touchParts.push(c, t);
      c.on('pointerdown', fn);
    };
    if (WIDE) {
      // Keng rejim: chap bosh barmoq — ◀ ▶ (chap ustun pastida), o'ng bosh barmoq — ▲ ● ↶ (o'ng ustun pastida).
      const by = GAME_H - 58;
      pad(56, '◀', 'left', 44, by);
      pad(152, '▶', 'right', 44, by);
      pad(GAME_W - 56, '▲', 'jump', 44, by);
      tap(GAME_W - 56, '●', () => this.toggleRecording(), C.record, by - 112);
      tap(GAME_W - 56, '↶', () => this.removeLastShadow(), 0xffffff, by - 208);
      return;
    }
    pad(72, '◀', 'left');
    pad(190, '▶', 'right');
    pad(GAME_W - 72, '▲', 'jump');
    tap(GAME_W - 188, '●', () => this.toggleRecording(), C.record);
    tap(GAME_W - 284, '↶', () => this.removeLastShadow());
  }

  // --- Soya mexanikasi ---

  step() {
    if (this.won) return;
    this.t++;
    if (this.rec) {
      const b = this.player.body.center;
      this.rec.frames.push({ x: b.x, y: b.y });
      if (this.rec.frames.length % STEPS_PER_SEC === 0) sfx('recTick');
      if (this.rec.frames.length > MAX_RECORD) this.stopRecording();
    }
    this.driveKinematics();
  }

  resetRun() {
    this.t = 0;
    this.player.body.reset(this.startPos.x, this.startPos.y);
    this.grounded = true;
    for (const list of Object.values(this.buttons)) for (const b of list) Object.assign(b, { was: false, until: 0, down: false });
    this.driveKinematics(true);
    if (this.rec) this.rec.frames = [{ ...this.startPos }];
  }

  restartLevel() {
    this.scene.restart({ index: this.levelIndex });
  }

  toggleRecording() {
    if (this.won) return;
    if (this.rec) {
      this.stopRecording();
      return;
    }
    if (this.shadows.length >= this.level.maxShadows) {
      this.flash(`Bu darajada ${this.level.maxShadows} ta soya. Z — oxirgisini o‘chirish`);
      return;
    }
    this.rec = { frames: [] };
    sfx('recStart');
    this.setRecFx(true);
    this.rewindFx();
    this.resetRun();
  }

  stopRecording() {
    const frames = this.rec.frames;
    this.rec = null;
    if (frames.length < 15) {
      this.flash('Yozuv juda qisqa — bekor qilindi');
      sfx('undo');
      this.setRecFx(false);
      this.rewindFx();
      this.resetRun();
      return;
    }
    sfx('recStop');
    const color = SHADOW_COLORS[this.shadows.length % SHADOW_COLORS.length];
    // Yo'l — uzuq-uzuq chiziq, oxirida halqa: soya qayerda to'xtashi ko'rinadi.
    // Ko'rsatilmaydigan Graphics — barcha soyalarning yo'li bitta umumiy teksturaga chiziladi (redrawTrails).
    const trail = this.make.graphics({ x: 0, y: 0, add: false });
    trail.lineStyle(2, color, 0.3);
    for (let i = 0; i + 6 < frames.length; i += 12) trail.lineBetween(frames[i].x, frames[i].y, frames[i + 6].x, frames[i + 6].y);
    const end = frames[frames.length - 1];
    trail.lineStyle(2, color, 0.55).strokeCircle(end.x, end.y, 6);
    const body = this.add.rectangle(frames[0].x, frames[0].y, 22, 30).setVisible(false);
    this.makeKinematic(body);
    // Porlash — soya ortidagi yumshoq dog'. (preFX glow har kadrda qo'shimcha GPU o'tishi talab qiladi — telefonda og'ir.)
    const halo = this.add.image(frames[0].x, frames[0].y, 'glow').setTint(color).setAlpha(0.35).setScale(0.42, 0.52).setDepth(3);
    const sprite = this.add.image(frames[0].x, frames[0].y + 15, 'shadow').setOrigin(0.5, 1).setTint(color).setAlpha(0.92).setScale(INV).setDepth(4);
    this.tweens.add({ targets: sprite, scaleX: { from: 0.3 * INV, to: INV }, scaleY: { from: 0.3 * INV, to: INV }, duration: 220, ease: 'Back.Out' });
    this.shadows.push({ frames, body, sprite, halo, trail, color, phase: this.shadows.length * 1.7, ghostAt: 0 });
    this.redrawTrails();
    // Soya start nuqtasida paydo bo'ladi — rewind'dan keyin "pop".
    this.time.delayedCall(180, () => sfx('shadowPop', frames[0].x, MAP_W));
    this.setRecFx(false);
    this.rewindFx();
    this.resetRun();
  }

  /** Barcha soya yo'llarini bitta teksturaga qayta chizadi (soya qo'shilganda yoki o'chirilganda). */
  redrawTrails() {
    if (!this.trailRT) this.trailRT = this.add.renderTexture(0, 0, MAP_W * TEX, MAP_H * TEX).setOrigin(0).setScale(INV).setDepth(2);
    this.trailRT.clear();
    for (const s of this.shadows) this.trailRT.draw(s.trail.setScale(TEX));
  }

  removeLastShadow() {
    if (this.won) return;
    if (this.rec) {
      this.rec = null;
      this.setRecFx(false);
    } else {
      const s = this.shadows.pop();
      if (!s) return;
      s.body.destroy();
      s.sprite.destroy();
      s.halo.destroy();
      s.trail.destroy();
      this.redrawTrails();
    }
    sfx('undo');
    this.rewindFx();
    this.resetRun();
  }

  die(reason) {
    this.burst.setParticleTint(C.player);
    this.burst.explode(26, this.player.x, this.player.y);
    if (!reducedMotion()) this.cameras.main.shake(140, 0.007);
    sfx('death', this.player.x, MAP_W);
    this.flash(this.rec ? `${reason} Yozuv qaytadan boshlandi` : reason);
    this.resetRun(); // mexanika darhol qaytadi — kechikish faqat ko'rinishda
    this.respawnFx();
  }

  /** Start nuqtasida zarrachalar yig'iladi va qahramon kattalashib paydo bo'ladi (~300 ms). */
  respawnFx() {
    const { x, y } = this.startPos;
    sfx('respawn', x, MAP_W);
    this.tweens.killTweensOf(this.sq);
    this.sq.x = 0;
    this.sq.y = 0;
    this.tweens.add({ targets: this.sq, x: 1, y: 1, delay: 120, duration: 180, ease: 'Back.Out' });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const d = this.add.image(x + Math.cos(a) * 34, y + Math.sin(a) * 34, 'dot').setTint(C.player).setScale(0.6).setAlpha(0).setDepth(6);
      this.tweens.add({ targets: d, x, y, alpha: { from: 0.9, to: 0.2 }, scale: 0.2, delay: 40, duration: 220, ease: 'Cubic.In', onComplete: () => d.destroy() });
    }
  }

  // --- Har kadr ---

  update() {
    if (this.won) return;
    const body = this.player.body;
    const left = this.cursors.left.isDown || this.keys.A.isDown || this.touch.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.touch.right;
    body.setVelocityX(left === right ? 0 : left ? -SPEED : SPEED);
    if (left !== right) this.facing = left ? -1 : 1;

    const grounded = body.blocked.down || body.touching.down;
    const jump = this.cursors.up.isDown || this.cursors.space.isDown || this.keys.W.isDown || this.touch.jump;
    if (jump && grounded) {
      body.setVelocityY(-JUMP);
      sfx('jump', this.player.x, MAP_W);
      this.squash(0.78, 1.22);
    } else if (grounded && !this.grounded && body.velocity.y >= 0) {
      sfx('land', this.player.x, MAP_W);
      this.squash(1.2, 0.8);
    }
    this.grounded = grounded;

    const pb = this.player.getBounds();
    const shadowBounds = this.shadows.map((s) => s.body.getBounds());
    this.updateButtonsAndDoors(pb, [pb, ...shadowBounds]);

    if (this.spikeZones.some((z) => hit(pb, z))) return this.die('Tikan!');
    if (this.updateLasers(pb, shadowBounds)) return this.die('Lazer!');
    if (hit(pb, this.exitZone)) return this.win();
    this.syncSprites();
    this.updateHud();
  }

  squash(sx, sy) {
    this.tweens.killTweensOf(this.sq);
    this.sq.x = sx;
    this.sq.y = sy;
    this.tweens.add({ targets: this.sq, x: 1, y: 1, duration: 160, ease: 'Back.Out' });
  }

  /** Rasmlarni fizik jismlarga ergashtiradi va animatsiya qiladi. Hitbox va mexanika o'zgarmaydi. */
  syncSprites() {
    const now = this.time.now;
    this.fadeGhosts(this.game.loop.delta);
    const body = this.player.body;
    let sx = 1;
    let sy = 1;
    let angle = 0;
    let bob = 0;
    if (!this.grounded) {
      // Havoda: tushayotganda cho'ziladi, ko'tarilayotganda biroz qisqaradi.
      sy = Phaser.Math.Clamp(1 + body.velocity.y / 3000, 0.9, 1.15);
      sx = 2 - sy;
    } else if (Math.abs(body.velocity.x) > 1) {
      // Yurish: chayqalish, sakrab-sakrab qadam va oyoq ostida chang.
      const w = Math.sin(now / 60);
      angle = w * 6;
      bob = -Math.abs(w) * 2;
      if (now >= this.dustAt) {
        this.dust.explode(2, this.player.x - this.facing * 8, this.player.y + 15);
        this.dustAt = now + 200;
        sfx('step', this.player.x, MAP_W);
      }
    } else {
      sy = 1 + Math.sin(now / 300) * 0.03; // turganda "nafas"
    }
    if (now >= this.blinkAt) {
      this.blinkUntil = now + 110;
      this.blinkAt = now + 2000 + Math.random() * 3000;
    }
    this.hero
      .setTexture(now < this.blinkUntil ? 'hero_blink' : 'hero')
      .setPosition(this.player.x, this.player.y + 15 + bob)
      .setScale(sx * this.sq.x * INV, sy * this.sq.y * INV)
      .setAngle(angle)
      .setFlipX(this.facing < 0);
    this.recGlow.setVisible(!!this.rec).setPosition(this.player.x, this.player.y);

    for (const s of this.shadows) {
      const { velocity } = s.body.body;
      const prev = s.sprite.x;
      const walking = Math.abs(velocity.x) > 1 && Math.abs(velocity.y) < 1;
      const w = Math.sin(now / 60 + s.phase);
      s.sprite.setPosition(s.body.x, s.body.y + 15 + (walking ? -Math.abs(w) * 2 : 0)).setAngle(walking ? w * 6 : 0)
        .setTint(now < (s.glintUntil || 0) ? 0xffffff : s.color);
      if (Math.abs(s.body.x - prev) > 0.5) s.sprite.setFlipX(s.body.x < prev);
      s.halo.setPosition(s.sprite.x, s.sprite.y - 15).setScale(0.42 * s.sprite.scaleX * TEX, 0.52 * s.sprite.scaleY * TEX);
      if ((Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 1) && now >= s.ghostAt) {
        this.spawnGhost(s);
        s.ghostAt = now + 90;
      }
    }
  }

  /** Tugma bosilganda sim bo'ylab eshikkacha yorug' nuqta yuguradi. */
  wirePulse(btn) {
    if (!btn.wire) return;
    const { x1, y1, x2, y2 } = btn.wire;
    const dot = this.add.image(x1, y1, 'dot').setTint(btn.seconds ? C.timer : C.buttonOn).setScale(0.8).setDepth(2);
    const duration = Phaser.Math.Clamp(Math.hypot(x2 - x1, y2 - y1) * 1.1, 150, 500);
    this.tweens.add({ targets: dot, x: x2, y: y2, duration, ease: 'Sine.In', onComplete: () => {
      dot.destroy();
      sfx('wire', x2, MAP_W);
    } });
  }

  spawnGhost(s) {
    const g = this.ghosts.find((x) => x.life <= 0);
    if (!g) return;
    g.life = GHOST_LIFE;
    g.img.setPosition(s.sprite.x, s.sprite.y).setTint(s.color).setAlpha(GHOST_ALPHA)
      .setAngle(s.sprite.angle).setFlipX(s.sprite.flipX).setVisible(true);
  }

  /** Arvoh izlarni so'ndiradi (tweensiz). */
  fadeGhosts(dt) {
    for (const g of this.ghosts) {
      if (g.life <= 0) continue;
      g.life -= dt;
      if (g.life <= 0) g.img.setVisible(false);
      else g.img.setAlpha((GHOST_ALPHA * g.life) / GHOST_LIFE);
    }
  }

  /** Yozish rejimi vinyetkasi. */
  setRecFx(on) {
    setMusicMuffled(on);
    this.tweens.killTweensOf(this.vignette);
    this.tweens.add({ targets: this.vignette, alpha: on ? 1 : 0, duration: 200 });
  }

  /** Urinish qaytadan boshlanganda qisqa "lentani orqaga o'rash" effekti. */
  rewindFx() {
    sfx('rewind');
    if (reducedMotion()) return;
    this.tweens.killTweensOf(this.rewindVeil);
    this.rewindVeil.setFillStyle(C.rewind, 0.22);
    this.tweens.add({ targets: this.rewindVeil, fillAlpha: 0, duration: 200 });
    const cam = this.cameras.main;
    if (this.sys.game.renderer.type === Phaser.WEBGL && cam.postFX) {
      const fx = cam.postFX.addColorMatrix();
      fx.grayscale(0.7);
      this.time.delayedCall(150, () => cam.postFX.remove(fx));
    }
  }

  updateButtonsAndDoors(pb, pressers) {
    for (const list of Object.values(this.buttons)) {
      for (const btn of list) {
        const down = pressers.some((r) => hit(r, btn.zone));
        if (down && !btn.down) {
          sfx('button', btn.plate.x, MAP_W);
          this.btnSparks.explode(6, btn.plate.x, btn.plate.y - 4);
          this.wirePulse(btn);
        }
        btn.down = down;
        if (btn.seconds) {
          // Vaqtli tugma bosilgan paytda ishga tushadi; ushlab turish muddatni uzaytirmaydi.
          if (down && !btn.was) btn.until = this.t + btn.seconds * STEPS_PER_SEC;
          btn.was = down;
          btn.pressed = this.t < btn.until;
        } else {
          btn.pressed = down;
        }
        btn.plate.setFillStyle(btn.pressed ? C.buttonOn : btn.seconds ? C.timer : C.button);
        btn.plate.setScale(1, down ? 0.5 : 1);
      }
    }
    for (const [letter, door] of Object.entries(this.doors)) {
      const btns = this.buttons[letter.toLowerCase()] || [];
      let open = btns.some((b) => b.pressed);
      // Eshik o'yinchi ichida turganda yopilmaydi — aks holda devor ichida qolib ketadi.
      if (!open && door.open && door.rects.some((r) => hit(pb, r.getBounds()))) open = true;
      if (open !== door.open) {
        door.open = open;
        sfx(open ? 'doorOpen' : 'doorClose', door.rects[0].x, MAP_W);
        for (const r of door.rects) r.body.enable = !open;
        // Ochilganda yuqoriga yig'iladi, yopilganda sakrab tushadi va chang chiqaradi.
        for (const v of door.visuals) {
          this.tweens.killTweensOf(v);
          this.tweens.add({ targets: v, scaleY: open ? 0.08 : 1, alpha: open ? 0.5 : 1, duration: open ? 180 : 240, ease: open ? 'Cubic.Out' : 'Bounce.Out' });
          if (!open) this.dust.explode(6, v.x, v.y + v.height);
        }
        door.label.setAlpha(open ? 0.3 : 1);
      }
      if (door.timerPie) {
        const left = Math.min(1, Math.max(0, ...btns.filter((b) => b.seconds).map((b) => (b.until - this.t) / (b.seconds * STEPS_PER_SEC))));
        const { x, y } = door.pieAt;
        const g = door.timerPie.clear();
        if (left > 0) {
          if (this.t % 30 === 0) sfx('timerTick', x, MAP_W); // har 0,5 soniyada chiqillaydi
          g.fillStyle(0x000000, 0.45).fillCircle(x, y, 8);
          g.fillStyle(C.timer).slice(x, y, 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left, false).fillPath();
        }
      }
    }
  }

  /** Nurlarni chizadi; o'yinchiga tegsa true. Nur devor, yopiq eshik yoki soyada to'xtaydi. */
  updateLasers(pb, shadowBounds) {
    const g = this.laserGfx.clear();
    let touched = false;
    for (const l of this.lasers) {
      let cx = l.x + l.dx;
      let cy = l.y + l.dy;
      while (cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS) {
        const key = `${cx},${cy}`;
        if (this.solid.has(key) || (this.doorAt.has(key) && !this.doorAt.get(key).open)) break;
        cx += l.dx;
        cy += l.dy;
      }
      // Nur to'xtagan katakning chekkasi.
      let end = l.dy ? cy * TILE : l.dx > 0 ? cx * TILE : (cx + 1) * TILE;
      let blocker = -1; // nurni to'sgan soya (faqat ko'rinish uchun)
      shadowBounds.forEach((s, i) => {
        const before = end;
        // -2: soya yonida turgan o'yinchiga nur uchi tegib ketmasin.
        if (l.dy && s.left <= l.ox && l.ox <= s.right && s.top > l.oy) end = Math.min(end, s.top - 2);
        if (l.dx > 0 && s.top <= l.oy && l.oy <= s.bottom && s.left > l.ox) end = Math.min(end, s.left);
        if (l.dx < 0 && s.top <= l.oy && l.oy <= s.bottom && s.right < l.ox) end = Math.max(end, s.right);
        if (end !== before) blocker = i;
      });
      const beam = l.dy
        ? new Phaser.Geom.Rectangle(l.ox - 2, l.oy, 4, end - l.oy)
        : new Phaser.Geom.Rectangle(Math.min(l.ox, end), l.oy - 2, Math.abs(end - l.ox), 4);
      // Vaqt urinish boshidan hisoblanadi — har urinishda lazerlar bir xil yonib-o'chadi.
      const phase = (this.t + l.offset) % l.cycle;
      if (phase < l.on) {
        const flicker = 0.75 + 0.25 * Math.sin(this.time.now / 60);
        g.fillStyle(C.laser, 0.25 * flicker).fillRect(beam.x - 3, beam.y - 3, beam.width + 6, beam.height + 6);
        g.fillStyle(C.laser, flicker).fillRect(beam.x, beam.y, beam.width, beam.height);
        if (hit(pb, beam)) touched = true;
        l.lens.setAlpha(1).setScale(1 + 0.15 * flicker);
        // Nur to'xtagan joyda uchqun; soya to'sgan bo'lsa, u bir lahza yaltiraydi.
        if (this.t % 3 === 0) this.sparks.emitParticleAt(l.dy ? l.ox : end, l.dy ? end : l.oy, 1);
        if (blocker >= 0) this.shadows[blocker].glintUntil = this.time.now + 70;
        if (l.state !== 'on') sfx('laserOn', l.ox, MAP_W);
        l.state = 'on';
      } else {
        // O'chiq: xira chiziq; yonishiga 0,4 soniya qolganda ogohlantirish miltillaydi, linza zaryad yig'adi.
        const charge = 1 - (l.cycle - phase) / (0.4 * STEPS_PER_SEC);
        const warn = charge > 0 && Math.floor(this.t / 4) % 2 === 0;
        g.fillStyle(C.laser, warn ? 0.6 : 0.12).fillRect(beam.x + 1, beam.y, Math.max(1, beam.width - 2), beam.height);
        l.lens.setAlpha(charge > 0 ? 0.6 + 0.4 * charge : 0.3).setScale(charge > 0 ? 1 + 0.8 * charge : 1);
        const state = charge > 0 ? 'charge' : 'off';
        if (state === 'charge' && l.state !== 'charge') sfx('laserCharge', l.ox, MAP_W);
        l.state = state;
      }
    }
    return touched;
  }

  updateHud() {
    const seconds = (this.t / STEPS_PER_SEC).toFixed(1);
    this.statText.setText(`Soya ${this.shadows.length}/${this.level.maxShadows}${WIDE ? '\n' : '    '}⏱ ${seconds} s`);
    this.recBadge.setVisible(!!this.rec);
    const p = this.level.par;
    const goal = (t, ok) => paint(t, ok ? UI.ok : UI.textMuted).setAlpha(ok ? 1 : 0.5);
    goal(this.starGoals[1], this.shadows.length <= p.shadows);
    goal(this.starGoals[2], this.t / STEPS_PER_SEC <= p.seconds);
    if (this.rec) {
      const left = Math.max(0, (MAX_RECORD - this.rec.frames.length) / STEPS_PER_SEC);
      paint(this.recText.setText(`● YOZILMOQDA  ${left.toFixed(1)} s`), '#fca5a5');
      this.recBar.setVisible(true).width = this.recBarW * (1 - this.rec.frames.length / MAX_RECORD);
      this.recBarBg.setVisible(true);
    } else {
      const canRecord = this.shadows.length < this.level.maxShadows;
      paint(this.recText.setText(canRecord ? (this.touchMode ? '● — soyani yozish' : 'Q — soyani yozish') : ''), '#9ca3af');
      this.recBar.setVisible(false);
      this.recBarBg.setVisible(false);
    }
  }

  flash(text) {
    this.flashText.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.flashText);
    this.tweens.add({ targets: this.flashText, alpha: 0, delay: 1400, duration: 400 });
  }

  // --- G'alaba ---

  win() {
    this.won = true;
    this.physics.pause();
    this.rec = null;
    this.syncSprites();
    this.recGlow.setVisible(false);
    this.recBadge.setVisible(false);
    this.setRecFx(false);
    sfx('portal', this.portal.x, MAP_W);
    duckMusic(2.2);
    sfx('win');

    const seconds = Math.round((this.t / STEPS_PER_SEC) * 10) / 10;
    const shadows = this.shadows.length;
    const stars = starsFor(this.level, { shadows, seconds });
    const { improved } = recordResult(this.level.id, { stars, seconds, shadows });
    this.burst.setParticleTint(C.exit);
    this.burst.explode(40, this.portal.x, this.portal.y);
    // Qahramon portalga so'riladi, keyin natija oynasi chiqadi.
    this.tweens.add({ targets: this.hero, x: this.portal.x, y: this.portal.y + 15, scaleX: 0, scaleY: 0, angle: 180, duration: 220, ease: 'Cubic.In' });
    this.time.delayedCall(260, () => this.showWinPanel({ stars, seconds, shadows, improved }));
  }

  showWinPanel({ stars, seconds, shadows, improved }) {
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;
    const s = (o) => o.setScrollFactor(0).setDepth(40);
    const dim = s(this.add.rectangle(cx, cy, GAME_W, GAME_H, 0x000000, 0.62));
    const first = this.children.list.length; // shundan keyingilari — panel (pastdan sakrab chiqadi)
    s(this.add.image(cx, cy, roundedTexture(this, 460, 330, UI.panel, this.theme.accent, { radius: 16, edgeAlpha: 0.6, shade: 0 })).setScale(INV));
    s(this.add.text(cx, cy - 128, 'Daraja o‘tildi!', { fontFamily: FONT, fontSize: 34, color: UI.ok, fontStyle: 'bold' }).setOrigin(0.5));
    for (let i = 0; i < 3; i++) {
      const on = i < stars;
      const star = s(this.add.text(cx + (i - 1) * 64, cy - 66, '★', { fontFamily: FONT, fontSize: 56, color: on ? '#fde047' : '#374151' }).setOrigin(0.5).setScale(0));
      this.tweens.add({ targets: star, scale: 1, duration: 260, delay: 250 + i * 220, ease: 'Back.Out', onStart: () => on && sfx('star') });
    }
    const p = this.level.par;
    const mark = (ok) => (ok ? '✓' : '✗');
    s(this.add.text(cx, cy - 4, `${mark(shadows <= p.shadows)} Soyalar: ${shadows}  (★ ≤ ${p.shadows})`, { fontFamily: FONT, fontSize: 18, color: shadows <= p.shadows ? '#e5e7eb' : '#9ca3af' }).setOrigin(0.5));
    s(this.add.text(cx, cy + 26, `${mark(seconds <= p.seconds)} Vaqt: ${seconds.toFixed(1)} s  (★ ≤ ${p.seconds} s)`, { fontFamily: FONT, fontSize: 18, color: seconds <= p.seconds ? '#e5e7eb' : '#9ca3af' }).setOrigin(0.5));
    if (improved) s(this.add.text(cx, cy + 56, 'Yangi rekord!', { fontFamily: FONT, fontSize: 15, color: '#fde047' }).setOrigin(0.5));

    const last = this.levelIndex === LEVELS.length - 1;
    button(this, cx - 150, cy + 112, 130, 48, '☰ Darajalar', () => go(this, 'select'), { fixed: true, depth: 41, fontSize: 16 });
    button(this, cx, cy + 112, 130, 48, '↻ Qayta', () => this.restartLevel(), { fixed: true, depth: 41, fontSize: 16 });
    button(this, cx + 150, cy + 112, 130, 48, last ? 'Yakun ★' : 'Keyingi ▶', () => this.nextLevel(), { fixed: true, depth: 41, fontSize: 16, primary: true });

    // Kirish animatsiyasi: fon qorayadi, panel pastdan sakrab chiqadi.
    const items = this.children.list.slice(first);
    this.tweens.add({ targets: dim, alpha: { from: 0, to: 1 }, duration: 200 });
    if (!reducedMotion()) {
      for (const o of items) o.y += 40;
      this.tweens.add({ targets: items, y: '-=40', duration: 320, ease: 'Back.Out' });
    }
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) this.scene.restart({ index: this.levelIndex + 1 });
    else go(this, 'select');
  }
}
