import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRIDGE_JUMP,
  answerSteps,
  buildSpecials,
  canRebound,
  fiftyFifty,
  isFastAnswer,
  placeOf,
  questionTime,
  raceWinner,
  seededRandom,
} from '../src/lib/race-rules.js';
import { bestBridge, buildTrack } from '../src/lib/race-track.js';

test('klassik kataklar avvalgidek: ⭐ 30%, 🌀 55%, ⭐ 80%', () => {
  assert.deepEqual(buildSpecials(16), { 5: 'bonus', 9: 'trap', 13: 'bonus' });
  assert.deepEqual(buildSpecials(8), { 2: 'bonus', 4: 'trap', 6: 'bonus' });
});

test('yangi kataklar: start/xazinada yo‘q, yonma-yon emas, ko‘prik qo‘nishi oddiy katak', () => {
  const kindsSeen = [];
  for (const n of [8, 10, 12, 16, 20]) {
    for (let seed = 1; seed <= 40; seed++) {
      const bridgeFrom = bestBridge(buildTrack(n).nodes, BRIDGE_JUMP);
      const s = buildSpecials(n, { cells: true, random: seededRandom(seed), bridgeFrom });
      const cells = Object.keys(s).map(Number).sort((a, b) => a - b);
      assert.ok(cells.every((i) => i > 0 && i < n), `n=${n} seed=${seed}`);
      for (let k = 1; k < cells.length; k++) assert.ok(cells[k] - cells[k - 1] >= 2, `yonma-yon: ${cells}`);
      const bridge = cells.find((i) => s[i] === 'bridge');
      if (bridge != null) {
        assert.equal(s[bridge + BRIDGE_JUMP], undefined);
        assert.ok(bridge + BRIDGE_JUMP < n);
      }
      for (const kind of ['bonus', 'trap']) assert.ok(Object.values(s).includes(kind), `n=${n} seed=${seed} ${kind}`);
      if (n < 10) assert.equal(bridge, undefined);
      // Girdob dastlabki 3 katakda turmaydi.
      for (const i of cells) if (s[i] === 'trap') assert.ok(i >= 4, `girdob ${i}-katakda (n=${n} seed=${seed})`);
      kindsSeen.push(...Object.values(s));
    }
  }
  for (const kind of ['chest', 'lightning', 'bridge']) assert.ok(kindsSeen.includes(kind), kind);
});

test('bir xil urug‘ — bir xil joylashuv (hamma jamoa uchun bitta xarita)', () => {
  const a = buildSpecials(16, { cells: true, random: seededRandom(7), bridgeFrom: 4 });
  const b = buildSpecials(16, { cells: true, random: seededRandom(7), bridgeFrom: 4 });
  assert.deepEqual(a, b);
});

test('ko‘prik burilishda: ikki katak orasidagi to‘g‘ri masofa yo‘ldan qisqa', () => {
  const t = buildTrack(12);
  const a = bestBridge(t.nodes, BRIDGE_JUMP);
  const p = t.nodes[a];
  const q = t.nodes[a + BRIDGE_JUMP];
  assert.ok(Math.hypot((p.x - q.x) * 16, (p.y - q.y) * 9) < (t.lengths[a + BRIDGE_JUMP] - t.lengths[a]) * 0.8);
});

test('chaqmoq savol: vaqt yarmi (kamida 10 s), cheklanmagan vaqt o‘zgarmaydi, +2 qadam', () => {
  assert.equal(questionTime(30, true), 15);
  assert.equal(questionTime(15, true), 10);
  assert.equal(questionTime(45, false), 45);
  assert.equal(questionTime(0, true), 0);
  assert.equal(answerSteps(true), 2);
  assert.equal(answerSteps(false), 1);
});

test('tez javob — vaqtning birinchi uchdan birida', () => {
  assert.equal(isFastAnswer(20, 30), true);
  assert.equal(isFastAnswer(19, 30), false);
  assert.equal(isFastAnswer(5, 0), false);
});

test('ilib olish: faqat variantli savol, 2+ jamoa va kamida 2 variant qolsa', () => {
  assert.equal(canRebound({ type: 'choice' }, 2, 3), true);
  assert.equal(canRebound({ type: 'choice' }, 2, 1), false);
  assert.equal(canRebound({ type: 'choice' }, 1, 3), false);
  assert.equal(canRebound({ type: 'tf' }, 3, 2), false);
  assert.equal(canRebound({ type: 'input' }, 3, 0), false);
});

test('50/50: to‘g‘ri javob va bitta xato qoladi', () => {
  const opts = [{ correct: false }, { correct: true }, { correct: false }, { correct: false }];
  for (let seed = 1; seed < 20; seed++) {
    const hidden = fiftyFifty(opts, seededRandom(seed));
    assert.equal(hidden.length, 2);
    assert.ok(!hidden.includes(1));
  }
  assert.equal(fiftyFifty([{ correct: true }, { correct: false }]).length, 0);
  assert.equal(fiftyFifty([{ correct: false }, { correct: true }, { correct: false }], () => 0).length, 1);
});

test('tangalar faqat qadam va to‘g‘ri javoblar teng bo‘lganda g‘olibni aniqlaydi', () => {
  const t = (name, pos, correct, coins) => ({ name, pos, correct, coins });
  assert.equal(raceWinner([t('A', 8, 6, 0), t('B', 8, 6, 2)]), 'B');
  assert.equal(raceWinner([t('A', 8, 7, 0), t('B', 8, 6, 5)]), 'A');
  assert.equal(raceWinner([t('A', 8, 6, 2), t('B', 8, 6, 2)]), null);
  // Eski natijalarda tanga yo'q — 0 deb olinadi.
  assert.equal(raceWinner([{ name: 'A', pos: 8, correct: 6 }, { name: 'B', pos: 8, correct: 6 }]), null);
  const teams = [t('A', 5, 3, 1), t('B', 5, 3, 1), t('C', 2, 1, 0)];
  assert.deepEqual(teams.map((x) => placeOf(teams, x)), [1, 1, 3]);
});
