import test from 'node:test';
import assert from 'node:assert/strict';
import { dailySeed, dayKey, questionsFingerprint, seededRandom, seededShuffle, teamAwards } from '../src/lib/race-rules.js';
import { dailyRecord, dayStreak, saveDaily } from '../src/lib/race-daily.js';
import { validateData } from '../shared/data-schema.mjs';

const team = (o) => ({ correct: 0, wrong: 0, bestRun: 0, coins: 0, rebounds: 0, comeback: 0, ...o });

test('nominatsiyalar: eng yaxshilar oladi, qolganlarga "Jamoa ruhi"', () => {
  const awards = teamAwards([
    team({ correct: 6, wrong: 0, bestRun: 4 }),
    team({ correct: 5, wrong: 3, coins: 3, rebounds: 2 }),
    team({ correct: 2, wrong: 4 }),
  ]);
  assert.deepEqual(awards[0], ['accurate', 'streak']);
  assert.deepEqual(awards[1], ['coins', 'rebound']);
  assert.deepEqual(awards[2], ['spirit']);
});

test('nominatsiyalar: teng natijada ikkalasi oladi, hamma bir xil bo‘lsa — hech kim; yakka o‘yinda yo‘q', () => {
  const tie = teamAwards([team({ correct: 3, wrong: 1, coins: 2 }), team({ correct: 3, wrong: 1, coins: 2 })]);
  assert.deepEqual(tie, [['spirit'], ['spirit']]);
  const two = teamAwards([team({ coins: 2, correct: 1 }), team({ coins: 2, correct: 0, wrong: 1 }), team({ coins: 0 })]);
  assert.ok(two[0].includes('coins') && two[1].includes('coins'));
  assert.deepEqual(teamAwards([team({ correct: 5 })]), [[]]);
});

test('nominatsiyalar: bitta jamoa ko‘pi bilan 2 ta oladi, qolgani keyingi eng yaxshiga o‘tadi', () => {
  const awards = teamAwards([
    team({ correct: 9, wrong: 0, bestRun: 6, coins: 8, rebounds: 3, comeback: 4 }),
    team({ correct: 7, wrong: 2, bestRun: 3, coins: 7, rebounds: 1, comeback: 0 }),
  ]);
  assert.deepEqual(awards[0], ['accurate', 'streak']);
  assert.deepEqual(awards[1], ['coins', 'rebound']);
  // Keyingi jamoaning ko'rsatkichi 0 bo'lsa, nominatsiya hech kimga berilmaydi (ikkinchi jamoa ham limitda).
  assert.ok(!awards.flat().includes('comeback'));
  for (const list of awards) assert.ok(list.length <= 2);
});

test('kunlik urug‘: bir kun va to‘plam — bir xil, boshqa kun yoki to‘plam — boshqa', () => {
  assert.equal(dailySeed('2026-11-20', 'set1'), dailySeed('2026-11-20', 'set1'));
  assert.notEqual(dailySeed('2026-11-20', 'set1'), dailySeed('2026-11-21', 'set1'));
  assert.notEqual(dailySeed('2026-11-20', 'set1'), dailySeed('2026-11-20', 'set2'));
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('savollar tartibi: urug‘ bo‘yicha takrorlanadi va har savol bir marta chiqadi', () => {
  const ids = Array.from({ length: 30 }, (_, i) => i);
  const a = seededShuffle(ids, seededRandom(42));
  assert.deepEqual(a, seededShuffle(ids, seededRandom(42)));
  assert.deepEqual([...a].sort((x, y) => x - y), ids);
});

test('to‘plam izi: savol qo‘shilsa, o‘chirilsa yoki tahrirlansa o‘zgaradi; tartib o‘zgarsa — yo‘q', () => {
  const q = (id, text) => ({ id, type: 'choice', text, options: ['a', 'b'], correct: 0 });
  const base = [q('1', 'A'), q('2', 'B')];
  const fp = questionsFingerprint(base);
  assert.equal(questionsFingerprint([base[1], base[0]]), fp);
  assert.notEqual(questionsFingerprint([...base, q('3', 'C')]), fp);
  assert.notEqual(questionsFingerprint([base[0]]), fp);
  assert.notEqual(questionsFingerprint([q('1', 'A!'), base[1]]), fp);
});

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}

test('kunlik rekord: birinchi natija, yaxshiroq natija rekord, yomonrog‘i almashtirmaydi', () => {
  const s = memoryStorage();
  const base = { day: '2026-11-20', setId: 'set1', fingerprint: 'fp' };
  assert.equal(saveDaily(s, { ...base, stars: 1, pos: 8, correct: 6, wrong: 3 }).first, true);
  assert.equal(saveDaily(s, { ...base, stars: 0, pos: 5, correct: 5, wrong: 3 }).record, false);
  assert.equal(dailyRecord(s, '2026-11-20', 'set1', 'fp').stars, 1);
  assert.equal(saveDaily(s, { ...base, stars: 3, pos: 8, correct: 8, wrong: 0 }).record, true);
  assert.equal(dailyRecord(s, '2026-11-20', 'set1', 'fp').stars, 3);
});

test('kunlik rekord: to‘plam o‘zgarsa yangi rekord boshlanadi, eskisi saqlanadi', () => {
  const s = memoryStorage();
  saveDaily(s, { day: '2026-11-20', setId: 'set1', fingerprint: 'old', stars: 3, pos: 8, correct: 8, wrong: 0 });
  const r = saveDaily(s, { day: '2026-11-20', setId: 'set1', fingerprint: 'new', stars: 1, pos: 8, correct: 5, wrong: 3 });
  assert.equal(r.first, true);
  assert.equal(dailyRecord(s, '2026-11-20', 'set1', 'old').stars, 3);
});

test('ketma-ket kunlar va buzilgan xotira', () => {
  const s = memoryStorage();
  for (const day of ['2026-11-17', '2026-11-18', '2026-11-19']) saveDaily(s, { day, setId: 'x', fingerprint: 'f', stars: 1, pos: 1, correct: 1, wrong: 0 });
  assert.equal(dayStreak(s, '2026-11-20'), 3); // bugun hali o'ynalmagan — kechagacha
  saveDaily(s, { day: '2026-11-20', setId: 'x', fingerprint: 'f', stars: 1, pos: 1, correct: 1, wrong: 0 });
  assert.equal(dayStreak(s, '2026-11-20'), 4);
  assert.equal(dayStreak(s, '2026-11-25'), 0);
  const broken = memoryStorage();
  broken.setItem('bilim-arena-race-daily', '{buzilgan');
  assert.equal(dailyRecord(broken, '2026-11-20', 'x', 'f'), null);
  assert.equal(saveDaily(broken, { day: '2026-11-20', setId: 'x', fingerprint: 'f', stars: 2, pos: 8, correct: 7, wrong: 1 }).first, true);
});

test('natija formati: tangalar va nominatsiyalar saqlanadi, eski natija ham o‘qiladi', () => {
  const data = {
    version: 1,
    pinHash: null,
    settings: {},
    sets: [],
    history: [
      { id: 'a', date: 'd', setName: 's', trackLength: 8, winner: 'A', teams: [{ name: 'A', color: '#f00', hero: 'x', pos: 8, correct: 6, wrong: 1, coins: 2 }], awards: [{ team: 'A', id: 'coins' }], hard: [] },
      { id: 'b', date: 'd', setName: 's', trackLength: 8, winner: null, teams: [{ name: 'B', color: '#0f0', hero: 'y', pos: 3, correct: 3, wrong: 2 }], hard: [] },
    ],
  };
  const v = validateData(data);
  assert.equal(v.history[0].teams[0].coins, 2);
  assert.deepEqual(v.history[0].awards, [{ team: 'A', id: 'coins' }]);
  assert.equal(v.history[1].teams[0].coins, undefined);
  assert.equal(v.history[1].awards, undefined);
});
