import test from 'node:test';
import assert from 'node:assert/strict';
import { ROBOT_GAMES } from '../src/lib/robot/games.js';
import { GAME_IDS, ROBOT_GAME_IDS } from '../shared/game-ids.mjs';
import { validateData } from '../shared/data-schema.mjs';

test('robot o‘yinlari ro‘yxati schema bilan bir xil', () => {
  assert.deepEqual(Object.keys(ROBOT_GAMES).sort(), [...ROBOT_GAME_IDS].sort());
});

test('o‘yin ID lari takrorlanmaydi', () => {
  assert.equal(new Set(GAME_IDS).size, GAME_IDS.length);
});

test('har bir robot o‘yinining natijasi schema’dan o‘tadi, noma’lumi rad etiladi', () => {
  const result = (game) => ({ id: 'r-' + game, kind: 'robot', game, date: '', setName: 'x', rounds: 1, maxScore: 3, winner: null, teams: [] });
  const data = (history) => ({ version: 1, pinHash: null, settings: {}, sets: [], history });
  for (const id of ROBOT_GAME_IDS) assert.equal(validateData(data([result(id)])).history[0].game, id);
  assert.throws(() => validateData(data([result('yoq')])));
});
