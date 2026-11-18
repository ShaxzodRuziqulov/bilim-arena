// Soya'ni platforma ichidagi berilgan elementga o'rnatadi. Manba — alohida soya loyihasining src/main.js.
// Bu fayl faqat o'yin ochilganda yuklanadi (Phaser ~1 MB), shuning uchun platformaning boshqa qismlari sekinlashmaydi.
import Phaser from 'phaser';
// Shrift o'yin ichida (internetsiz ham ishlaydi). Faqat lotin harflari — o'zbek lotin yozuvi uchun yetarli.
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import { GAME_H, GAME_W, RES } from './engine/layout.js';
import { getSave } from './engine/save.js';
import { setAudioEnabled } from './engine/audio.js';
import { setMusicEnabled, stopMusic } from './engine/music.js';
import BootScene from './engine/scenes/BootScene.js';
import MenuScene from './engine/scenes/MenuScene.js';
import SelectScene from './engine/scenes/SelectScene.js';
import GameScene from './engine/scenes/GameScene.js';

// Phaser matnni canvas'ga bir marta chizadi — shrift yuklanmasdan boshlasak, zaxira shrift qotib qoladi.
async function fontsReady() {
  try {
    await Promise.race([
      Promise.all(['400 20px Nunito', '700 20px Nunito'].map((f) => document.fonts.load(f))),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch {
    // shrift yuklanmadi — tizim shrifti bilan davom etamiz
  }
}

// Har bir matn RES aniqlikda chiziladi. Bir martagina o'rnatiladi (o'yin qayta ochilsa ham).
let textPatched = false;
function patchText() {
  if (textPatched) return;
  textPatched = true;
  const addText = Phaser.GameObjects.GameObjectFactory.prototype.text;
  Phaser.GameObjects.GameObjectFactory.prototype.text = function text(x, y, value, style) {
    return addText.call(this, x, y, value, { resolution: RES, ...style });
  };
}

/**
 * O'yinni boshlaydi va to'xtatish funksiyasini qaytaradi.
 * onPlaying(true|false) — bosh menyudan tashqaridami (daraja va darajalar ekranida chap yuqorida Soyaning o'z tugmasi bor).
 */
export async function startSoya(parent, isCancelled = () => false, onPlaying = () => {}) {
  await fontsReady();
  // Shrift kutilayotganda foydalanuvchi chiqib ketgan bo'lsa — o'yin umuman yaratilmaydi.
  if (isCancelled()) return () => {};
  setAudioEnabled(getSave().sound);
  setMusicEnabled(getSave().music);
  patchText();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: Math.round(GAME_W * RES),
    height: Math.round(GAME_H * RES),
    backgroundColor: '#0b0d17',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 1400 }, fps: 60, debug: false },
    },
    input: { activePointers: 4 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, MenuScene, SelectScene, GameScene],
  });
  if (import.meta.env.DEV) window.__game = game;
  let playing = false;
  const watch = setInterval(() => {
    const now = !(game.scene?.isActive('menu') ?? true);
    if (now !== playing) onPlaying((playing = now));
  }, 250);
  return () => {
    clearInterval(watch);
    stopMusic();
    game.destroy(true);
    if (window.__game === game) delete window.__game;
  };
}
