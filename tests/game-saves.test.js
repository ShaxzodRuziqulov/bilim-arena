import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backupGameSaves, pickGameSaves, readGameSaves, writeGameSaves } from '../shared/game-saves.mjs';
import { makeBackup, parseBackup } from '../shared/data-schema.mjs';

const memory = (init = {}) => {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m };
};
const data = () => ({ version: 1, pinHash: null, settings: {}, sets: [], history: [] });
const kb = JSON.stringify({ progress: { d1: { 1: 3 } } });
const soya = JSON.stringify({ levels: { '1-1': { stars: 2 } } });

test('faqat ma’lum kalitlar va to‘g‘ri JSON olinadi', () => {
  assert.deepEqual(pickGameSaves({ 'kodbuzar-v2': kb, 'soya-save-v1': '{buzuq', boshqa: kb }), { 'kodbuzar-v2': kb });
  assert.deepEqual(pickGameSaves({ 'kodbuzar-v2': '[1,2]' }), {}); // obyekt emas
  assert.deepEqual(pickGameSaves(null), {});
});

test('zaxira o‘yin saqlamalari bilan yaratiladi va o‘qiladi', () => {
  const store = memory({ 'kodbuzar-v2': kb, 'soya-save-v1': soya, 'begona': 'x' });
  const backup = makeBackup(data(), readGameSaves(store));
  assert.deepEqual(backup.games, { 'kodbuzar-v2': kb, 'soya-save-v1': soya });
  const text = JSON.stringify(backup);
  assert.deepEqual(parseBackup(text), parseBackup(JSON.stringify(makeBackup(data())))); // asosiy ma'lumot o'zgarmaydi
  assert.deepEqual(backupGameSaves(text), backup.games);
});

test('o‘yinsiz (eski) zaxira ham ishlaydi, games maydoni qo‘shilmaydi', () => {
  const backup = makeBackup(data());
  assert.equal('games' in backup, false);
  assert.deepEqual(backupGameSaves(backup), {});
  assert.deepEqual(backupGameSaves('{buzuq'), {});
});

test('tiklashda faqat fayldagi o‘yinlar yoziladi', () => {
  const store = memory({ 'soya-save-v1': soya });
  assert.equal(writeGameSaves(store, { 'kodbuzar-v2': kb, 'soya-save-v1': '{buzuq' }), 1);
  assert.equal(store.getItem('kodbuzar-v2'), kb);
  assert.equal(store.getItem('soya-save-v1'), soya); // buzilgan qiymat joriy natijani o'chirmaydi
});
