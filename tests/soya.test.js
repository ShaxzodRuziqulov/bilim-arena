import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLS, LEVELS, ROWS, WORLDS, mergeCells, parseLevel, starsFor } from '../src/games/soya/engine/levels.js';

test('15 ta daraja, 3 dunyo, id takrorlanmaydi', () => {
  assert.equal(WORLDS.length, 3);
  assert.equal(LEVELS.length, 15);
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, 15);
});

test('mergeCells har devor katagini aynan bir marta qoplaydi', () => {
  for (const level of LEVELS) {
    const walls = parseLevel(level.map).walls;
    const covered = [];
    for (const r of mergeCells(walls)) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) covered.push(`${x},${y}`);
    assert.equal(new Set(covered).size, covered.length, `${level.id}: ustma-ust tushgan to‘rtburchak`);
    assert.deepEqual(covered.sort(), walls.map((w) => `${w.x},${w.y}`).sort(), level.id);
  }
});

test('yulduzlar', () => {
  const level = { par: { shadows: 1, seconds: 5 } };
  assert.equal(starsFor(level, { shadows: 1, seconds: 5 }), 3);
  assert.equal(starsFor(level, { shadows: 2, seconds: 5 }), 2);
  assert.equal(starsFor(level, { shadows: 1, seconds: 9 }), 2);
  assert.equal(starsFor(level, { shadows: 2, seconds: 9 }), 1);
});

for (const level of LEVELS) {
  test(`${level.id} ${level.name}: xarita to‘g‘ri tuzilgan`, () => {
    assert.equal(level.map.length, ROWS);
    level.map.forEach((row, i) => assert.equal(row.length, COLS, `${i}-qator uzunligi ${row.length}`));
    const p = parseLevel(level.map);
    assert.ok(p.start, 'P yo‘q');
    assert.ok(p.exit, 'E yo‘q');
    assert.ok(level.par && level.par.shadows <= level.maxShadows && level.par.seconds > 0, 'par noto‘g‘ri');
    for (const door of Object.keys(p.doors)) {
      assert.ok(p.buttons[door.toLowerCase()], `${door} eshigi uchun tugma yo‘q`);
    }
    for (const letter of Object.keys(level.timers || {})) assert.ok(p.buttons[letter], `vaqtli ${letter} tugmasi xaritada yo‘q`);
    for (const pl of level.platforms || []) {
      for (const x of [pl.x, pl.toX ?? pl.x]) assert.ok(x >= 1 && x + pl.w <= COLS - 1, 'platforma xaritadan chiqib ketadi');
      assert.ok(pl.period > 0);
    }
    // Tugmalar polda turishi kerak — tagida devor.
    for (const list of Object.values(p.buttons)) {
      for (const b of list) assert.equal(level.map[b.y + 1][b.x], '#', `tugma (${b.x},${b.y}) havoda`);
    }
  });
}
