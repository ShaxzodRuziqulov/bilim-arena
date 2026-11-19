import test from 'node:test';
import assert from 'node:assert/strict';
import { ROBOT_GAMES, ROBOT_LADDER, ROBOT_PARTS, ladderStars, ladderSolved, ladderTotal, withLadderStars } from '../src/lib/robot/games.js';
import { GAME_IDS, ROBOT_GAME_IDS, ROBOT_PART_IDS } from '../shared/game-ids.mjs';
import { validateData } from '../shared/data-schema.mjs';

const data = (history, robot) => ({ version: 1, pinHash: null, settings: {}, sets: [], history, robot });

test('robot qismlari ro‘yxati schema bilan bir xil', () => {
  assert.deepEqual(Object.keys(ROBOT_GAMES).sort(), [...ROBOT_PART_IDS].sort());
  assert.deepEqual(ROBOT_PARTS, ROBOT_PART_IDS);
});

test('o‘yin ID lari takrorlanmaydi', () => {
  assert.equal(new Set(GAME_IDS).size, GAME_IDS.length);
  assert.ok(GAME_IDS.includes(ROBOT_LADDER.id));
});

test('robot natijasi (yangi va eski ID lar) schema’dan o‘tadi, noma’lumi rad etiladi', () => {
  const result = (game) => ({ id: 'r-' + game, kind: 'robot', game, date: '', setName: 'x', rounds: 1, maxScore: 3, winner: null, teams: [] });
  for (const id of ROBOT_GAME_IDS) assert.equal(validateData(data([result(id)])).history[0].game, id);
  assert.throws(() => validateData(data([result('yoq')])));
});

test('zinapoya: avval bloklar, keyin Java — barcha darajalar bir marta', () => {
  const { steps } = ROBOT_LADDER;
  assert.equal(steps.length, ROBOT_GAMES.kod.levels.length + ROBOT_GAMES.java.levels.length);
  assert.equal(ROBOT_LADDER.partStart('kod'), 0);
  assert.equal(ROBOT_LADDER.partStart('java'), ROBOT_GAMES.kod.levels.length);
  assert.ok(steps.slice(0, ROBOT_GAMES.kod.levels.length).every((s) => s.part === 'kod'));
  assert.ok(steps.slice(ROBOT_GAMES.kod.levels.length).every((s) => s.part === 'java'));
  steps.forEach((s, i) => assert.equal(s.level, ROBOT_GAMES[s.part].levels[s.local], `qadam ${i}`));
});

test('zinapoya yulduzlari eski saqlash formatida (data.robot.kod / .java) o‘qiladi va yoziladi', () => {
  const javaFirst = ROBOT_LADDER.partStart('java');
  const old = { kod: { stars: { 0: 3, 2: 1 } }, java: { stars: { 0: 2 } } };
  assert.equal(ladderStars(old, 0), 3);
  assert.equal(ladderStars(old, 1), 0);
  assert.equal(ladderStars(old, javaFirst), 2);
  assert.equal(ladderTotal(old), 6);
  assert.equal(ladderSolved(old), 3);

  const next = withLadderStars(old, javaFirst + 1, 3);
  assert.deepEqual(next.java.stars, { 0: 2, 1: 3 });
  assert.deepEqual(next.kod, old.kod);
  assert.deepEqual(old.java.stars, { 0: 2 }, 'asl obyekt o‘zgarmaydi');
  assert.deepEqual(validateData(data([], next)).robot, next);
  assert.equal(ladderTotal(undefined), 0);
});
