import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrack, islandPath } from '../src/lib/race-track.js';

test('har bir qadamlar soni uchun n+1 katak, hammasi sahna ichida', () => {
  for (const n of [8, 10, 12, 16, 20]) {
    const t = buildTrack(n);
    assert.equal(t.nodes.length, n + 1);
    assert.equal(t.lengths.length, n + 1);
    assert.equal(t.rows, n + 1 <= 9 ? 2 : 3);
    for (const p of t.nodes) {
      assert.ok(p.x > 4 && p.x < 96, `x=${p.x}`);
      assert.ok(p.y > 20 && p.y < 82, `y=${p.y}`);
    }
  }
});

test('kataklar yo‘l bo‘ylab teng oraliqda va ustma-ust tushmaydi', () => {
  const t = buildTrack(16);
  const gaps = t.nodes.slice(1).map((p, i) => Math.hypot((p.x - t.nodes[i].x) * 16, (p.y - t.nodes[i].y) * 9));
  // To'g'ri chiziqli masofa yo'l bo'ylab masofadan biroz qisqa bo'lishi mumkin (burilishda), lekin katakdan katta.
  for (const g of gaps) assert.ok(g > 120, `oraliq juda kichik: ${g}`);
  assert.ok(Math.abs(t.lengths[1] - t.total / 16) < 1e-9);
});

test('at(): start, oxir va chegaradan tashqari qiymatlar', () => {
  const t = buildTrack(12);
  assert.deepEqual(t.at(0), t.nodes[0]);
  const end = t.at(t.total);
  assert.ok(Math.abs(end.x - t.nodes[12].x) < 1e-6 && Math.abs(end.y - t.nodes[12].y) < 1e-6);
  assert.deepEqual(t.at(-5), t.at(0));
  assert.deepEqual(t.at(t.total + 50), t.at(t.total));
});

test('SVG yo‘llar to‘g‘ri tuzilgan', () => {
  assert.match(buildTrack(8).path, /^M[\d.]+,[\d.]+( C[\d.,\s-]+)+$/);
  assert.match(islandPath(), /^M.+Z$/);
});
