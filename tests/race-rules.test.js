import test from 'node:test';
import assert from 'node:assert/strict';
import { raceWinner, roundFinished } from '../src/lib/race-rules.js';
const team = (name, pos, correct) => ({ name, pos, correct });
test('2–4 jamoada xazinadan keyin qolgan navbatlar beriladi', () => {
  for (let count = 2; count <= 4; count++) {
    const teams = Array.from({length: count}, (_, i) => team(String(i), i === 0 ? 8 : 7, 7));
    for (let turn = 0; turn < count; turn++) assert.equal(roundFinished(teams, turn, 8), turn === count - 1);
  }
});
test('xazinaga yetilmagan davra o‘yinni tugatmaydi', () => {
  assert.equal(roundFinished([team('A',7,7), team('B',6,6)],1,8),false);
});
test('qadamlar, keyin to‘g‘ri javoblar solishtiriladi', () => {
  assert.equal(raceWinner([team('A',8,6),team('B',7,9)]),'A');
  assert.equal(raceWinner([team('A',8,6),team('B',8,7)]),'B');
});
test('teng natija yoki harakatsiz o‘yin durang', () => {
  assert.equal(raceWinner([team('A',8,7),team('B',8,7)]),null);
  assert.equal(raceWinner([team('A',0,0),team('B',0,0)]),null);
});
test('yakka rejim: xazinaga yetmasa 0, xatosiz 3, 75% dan yuqori 2, qolgani 1 yulduz', async () => {
  const { soloStars, isSolo } = await import('../src/lib/race-rules.js');
  const p = (pos, correct, wrong) => ({ pos, correct, wrong });
  assert.equal(isSolo([p(0, 0, 0)]), true);
  assert.equal(isSolo([p(0, 0, 0), p(0, 0, 0)]), false);
  assert.equal(soloStars(p(7, 7, 0), 8), 0);
  assert.equal(soloStars(p(8, 6, 0), 8), 3);
  assert.equal(soloStars(p(8, 6, 2), 8), 2);
  assert.equal(soloStars(p(8, 6, 4), 8), 1);
  // Yakka o'yinda davra bitta navbatdan iborat: xazinaga yetishi bilan tugaydi.
  assert.equal(roundFinished([p(8, 6, 0)], 0, 8), true);
  assert.equal(raceWinner([{ name: 'Ali', pos: 8, correct: 6 }]), 'Ali');
});
