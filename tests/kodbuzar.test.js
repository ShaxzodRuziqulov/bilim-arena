import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCodes, evaluate, keyStates, makeSecret, pickHintPosition, score, seededRandom, tileMarks, validateGuess } from '../src/games/kodbuzar/game/logic.js';
import { WORLDS, DAILY, dailyStreak, levelSecret, nextLevel, starsFor, todayKey, worldUnlocked } from '../src/games/kodbuzar/game/levels.js';
import { emptySave } from '../src/games/kodbuzar/game/storage.js';

test('score: joyida va bor, joyi boshqa', () => {
  assert.deepEqual(score('4271', '1234'), { bulls: 1, cows: 2 });
  assert.deepEqual(score('4271', '4271'), { bulls: 4, cows: 0 });
  assert.deepEqual(score('4271', '5689'), { bulls: 0, cows: 0 });
});

test('score: takrorlanuvchi raqamlar ikki marta sanalmaydi', () => {
  assert.deepEqual(score('1123', '1111'), { bulls: 2, cows: 0 });
  assert.deepEqual(score('1223', '2111'), { bulls: 0, cows: 2 });
  assert.deepEqual(score('6655', '5566'), { bulls: 0, cows: 4 });
});

test('validateGuess qoidalarni tekshiradi', () => {
  const cfg = { length: 4, alphabet: '0123456789', repeats: false };
  assert.equal(validateGuess(cfg, '1234'), null);
  assert.match(validateGuess(cfg, '123'), /4 ta/);
  assert.match(validateGuess(cfg, '1123'), /takrorlanmaydi/);
  assert.match(validateGuess({ ...cfg, alphabet: '123456' }, '1237'), /“7”/);
});

test('allCodes soni to‘g‘ri', () => {
  assert.equal(allCodes({ length: 3, alphabet: '123456', repeats: false }).length, 120);
  assert.equal(allCodes({ length: 4, alphabet: '0123456789', repeats: false }).length, 5040);
  assert.equal(allCodes({ length: 4, alphabet: '123456', repeats: true }).length, 1296);
});

test('evaluate: qolgan variantlar va ziddiyat', () => {
  const cfg = { length: 3, alphabet: '123456', repeats: false };
  const rows = evaluate(cfg, '123', ['456', '465', '123']);
  assert.equal(rows[0].contradicts, false);
  assert.equal(rows[0].remaining, 6); // 1,2,3 dan tuzilgan 3! kod
  assert.equal(rows[1].contradicts, true); // 4,5,6 yo'qligi aniq edi
  assert.equal(rows[2].bulls, 3);
  assert.equal(rows[2].remaining, 1);
});

test('maxfiy kod qoidalarga mos va takrorlanadi', () => {
  for (const w of [...WORLDS, DAILY]) {
    for (let n = 1; n <= 20; n++) {
      const code = levelSecret(w, n);
      assert.equal(validateGuess(w, code), null, `${w.id} ${n}: ${code}`);
      assert.equal(code, levelSecret(w, n));
    }
  }
  assert.notEqual(levelSecret(WORLDS[4], 1, 0) + levelSecret(WORLDS[4], 1, 1) + levelSecret(WORLDS[4], 1, 2), levelSecret(WORLDS[4], 1, 0).repeat(3));
  const r = seededRandom('x');
  assert.equal(makeSecret({ length: 6, alphabet: '123456', repeats: false }, r).split('').sort().join(''), '123456');
});

test('yulduzlar va maslahat', () => {
  const w = WORLDS[2];
  assert.equal(starsFor(w, w.par), 3);
  assert.equal(starsFor(w, w.par + 2), 2);
  assert.equal(starsFor(w, w.par + 3), 1);
  assert.equal(starsFor(w, w.par, 1), 2); // maslahat bilan — eng ko'pi 2
  assert.equal(starsFor(w, w.par + 5, 2), 1);
});

test('dunyo ochilishi va keyingi daraja', () => {
  const save = emptySave();
  const first = WORLDS[0];
  assert.deepEqual(nextLevel(save), { worldId: first.id, level: 1 });
  assert.equal(worldUnlocked(save, 1), false);
  save.progress[first.id] = {};
  for (let n = 1; n <= first.unlockNext; n++) save.progress[first.id][n] = 2;
  assert.equal(worldUnlocked(save, 1), true);
  assert.equal(worldUnlocked(save, 2), false);
  assert.deepEqual(nextLevel(save), { worldId: first.id, level: first.unlockNext + 1 });
});

test('qiyinlik asta-sekin oshadi', () => {
  const size = (w) => allCodes(w).length;
  for (let i = 1; i < WORLDS.length; i++) {
    const same = WORLDS[i].mode === WORLDS[i - 1].mode;
    // Takrorlanuvchi raqamlar o'zi yangi qiyinlik — u yerda variantlar soni kamroq bo'lishi mumkin.
    if (WORLDS[i].repeats !== WORLDS[i - 1].repeats) continue;
    // Bir xil rejimda variantlar soni kamaymaydi; rejim almashganda esa kod hajmi o'zgarmaydi.
    if (same) assert.ok(size(WORLDS[i]) >= size(WORLDS[i - 1]), WORLDS[i].id);
    else assert.equal(size(WORLDS[i]), size(WORLDS[i - 1]), WORLDS[i].id);
  }
  assert.equal(size(WORLDS[0]), 12); // birinchi dunyo — atigi 12 ta variant
  assert.equal(WORLDS[0].mode, 'color');
  assert.ok(WORLDS.every((w) => w.unlockNext <= w.levels));
});

test('tileMarks: har katak holati', () => {
  assert.deepEqual(tileMarks('123', '132'), ['bull', 'cow', 'cow']);
  assert.deepEqual(tileMarks('123', '456'), ['miss', 'miss', 'miss']);
  assert.deepEqual(tileMarks('1123', '1111'), ['bull', 'bull', 'miss', 'miss']);
  assert.deepEqual(tileMarks('1223', '2111'), ['cow', 'cow', 'miss', 'miss']);
});

test('rangli rejim: variantlar kataklar bo‘yicha saralanadi', () => {
  const cfg = { length: 2, alphabet: '1234', repeats: false, mode: 'color' };
  const [row] = evaluate(cfg, '12', ['13']);
  assert.deepEqual(row.marks, ['bull', 'miss']);
  assert.equal(row.remaining, 2); // 12 va 14
  assert.deepEqual(keyStates([row]), { 1: 'bull', 3: 'miss' });
});

test('maslahat ochilmagan joyni tanlaydi', () => {
  const cfg = { length: 3, alphabet: '12345', repeats: false, mode: 'color' };
  const rows = evaluate(cfg, '123', ['145']);
  const pos = pickHintPosition(cfg, '123', [], rows);
  assert.ok(pos === 1 || pos === 2); // 0-joy allaqachon yashil
  assert.equal(pickHintPosition(cfg, '123', [1, 2], rows), null);
});

test('kunlik seriya', () => {
  const save = emptySave();
  const today = new Date(2026, 10, 13);
  const day = (offset) => todayKey(new Date(2026, 10, 13 + offset));
  save.daily[day(-1)] = { status: 'won' };
  save.daily[day(-2)] = { status: 'won' };
  save.daily[day(-4)] = { status: 'won' };
  assert.equal(dailyStreak(save, today), 2); // bugun hali o'ynalmagan — seriya saqlanadi
  save.daily[day(0)] = { status: 'won' };
  assert.equal(dailyStreak(save, today), 3);
});
