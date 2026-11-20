import test from 'node:test';
import assert from 'node:assert/strict';
import { uniqueTeamNames } from '../src/lib/teams.js';

const DEF = ['Qizillar', 'Ko‘klar', 'Yashillar', 'Sariqlar'];

test('X-3: bir xil nomlar farqlanadi (katta-kichik harf farqisiz)', () => {
  assert.deepEqual(uniqueTeamNames(['A', 'A'], DEF), ['A', 'A 2']);
  assert.deepEqual(uniqueTeamNames(['A', 'a', 'A'], DEF), ['A', 'a 2', 'A 3']);
  assert.deepEqual(uniqueTeamNames(['A 2', 'A', 'A'], DEF), ['A 2', 'A', 'A 3']);
});

test('bo‘sh nom standart nom bilan, farqli nomlarga tegilmaydi', () => {
  assert.deepEqual(uniqueTeamNames(['', '  ', 'Burgutlar'], DEF), ['Qizillar', 'Ko‘klar', 'Burgutlar']);
  assert.deepEqual(uniqueTeamNames([' Qizillar ', ''], DEF), ['Qizillar', 'Ko‘klar']);
  assert.deepEqual(uniqueTeamNames(['Ko‘klar', ''], DEF), ['Ko‘klar', 'Ko‘klar 2']);
});
