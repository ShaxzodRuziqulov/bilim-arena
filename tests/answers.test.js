import test from 'node:test';
import assert from 'node:assert/strict';
import { checkInputAnswer } from '../src/lib/util.js';
test('matnli javob harf registri va chekka bo‘sh joydan mustaqil',()=>{
  assert.ok(checkInputAnswer({answer:'Toshkent; Tashkent'},' TOSHKENT '));
  assert.ok(checkInputAnswer({answer:'Toshkent; Tashkent'},'tashkent'));
  assert.equal(checkInputAnswer({answer:'Toshkent'},'Samarqand'),false);
});
test('o‘zbekcha apostrof shakllari va o‘nlik vergul qabul qilinadi',()=>{
  assert.ok(checkInputAnswer({answer:'O‘zbekiston'},'O’ZBEKISTON'));
  assert.ok(checkInputAnswer({answer:'0.5'},'0,5'));
});
