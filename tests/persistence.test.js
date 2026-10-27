import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { validateData, parseBackup, makeBackup } from '../shared/data-schema.mjs';
import { browserStorage, DATA_KEY, BACKUP_KEY } from '../src/lib/browser-storage.js';
const {createDataStore}=createRequire(import.meta.url)('../electron/data-store.cjs');
const data=(name='A')=>({version:1,pinHash:null,settings:{time:30,trackLength:8,sound:false,classroomLock:false},sets:[{id:'s',name,subject:'Geografiya',grade:'6',questions:[{id:'q',type:'input',text:'Poytaxt?',answer:'Toshkent',keypad:'text'}]}],history:[]});
function memory() {const values=new Map();return {values,getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
function disk(t) {const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bilim-arena-test-'));t.after(()=>{if(!dir.startsWith(path.join(os.tmpdir(),'bilim-arena-test-')))throw Error('Invalid cleanup target');fs.rmSync(dir,{recursive:true,force:true});});const file=path.join(dir,'data.json');return {file,store:createDataStore(file,validateData)};}
test('zaxira eksport/importi va eski to‘liq format mosligi',()=>{
  assert.deepEqual(parseBackup(JSON.stringify(makeBackup(data()))),validateData(data()));
  assert.deepEqual(parseBackup(data()),validateData(data()));
  assert.throws(()=>parseBackup({format:'bilim-arena-backup',backupVersion:2,data:data()}));
});
test('buzilgan fayl, takroriy ID va noto‘g‘ri savol turi rad etiladi',()=>{
  assert.throws(()=>parseBackup('{bad'));
  assert.throws(()=>validateData({...data(),sets:[data().sets[0],data().sets[0]]}));
  const invalid=data();invalid.sets[0].questions[0].type='bad';assert.throws(()=>validateData(invalid));
  assert.throws(()=>validateData({...data(),version:2}));
});
test('qoralama savol va eski natijalar saqlanadi',()=>{
  const raw=data();raw.sets[0].questions=[{id:'draft',type:'choice',options:['','','',''],correct:0}];
  raw.history=[{id:'h',date:'2026-10-25',setName:'Test',trackLength:8,winner:null,teams:[],hard:[{text:'Eski savol',wrong:2}]}];
  assert.equal(validateData(raw).sets[0].questions[0].text,'');
  assert.equal(validateData(raw).history[0].hard[0].wrong,2);
});
test('brauzer oldingi nusxani saqlaydi va buzilgan asosiy nusxadan tiklanadi',async()=>{
  const mem=memory(),store=browserStorage(mem);await store.save(data('A'));await store.save(data('B'));
  mem.values.set(DATA_KEY,'{bad');const loaded=await store.load();assert.equal(loaded.recovered,true);assert.equal(loaded.data.sets[0].name,'A');
  await store.save(data('C'));assert.equal(JSON.parse(mem.values.get(BACKUP_KEY)).sets[0].name,'A');
});
test('ikkala nusxa buzilsa brauzer ularni o‘zgartirmaydi',async()=>{
  const mem=memory();mem.values.set(DATA_KEY,'bad1');mem.values.set(BACKUP_KEY,'bad2');
  await assert.rejects(()=>browserStorage(mem).load());assert.equal(mem.values.get(DATA_KEY),'bad1');assert.equal(mem.values.get(BACKUP_KEY),'bad2');
});
test('brauzer kvotasi tugasa saqlash xatosi uzatiladi',async()=>{
  const mem=memory();const store=browserStorage(mem);await store.save(data('A'));
  const set=mem.setItem;mem.setItem=(k,v)=>{if(k===DATA_KEY)throw Error('QuotaExceededError');set(k,v);};
  await assert.rejects(()=>store.save(data('B')));assert.equal(JSON.parse(mem.values.get(DATA_KEY)).sets[0].name,'A');
});
test('Electron oldingi nusxani tiklaydi va buzilgan asl fayl bilan almashtirmaydi',t=>{
  const {file,store}=disk(t);store.save(data('A'));store.save(data('B'));fs.writeFileSync(file,'{bad');
  assert.equal(store.load().data.sets[0].name,'A');assert.equal(store.load().recovered,true);
  store.save(data('C'));assert.equal(JSON.parse(fs.readFileSync(file+'.bak')).sets[0].name,'A');
});
test('Electron yozish xatosida asl ma’lumot va zaxira qoladi',t=>{
  const {file,store}=disk(t);store.save(data('A'));fs.mkdirSync(file+'.tmp');
  assert.throws(()=>store.save(data('B')));assert.equal(JSON.parse(fs.readFileSync(file)).sets[0].name,'A');assert.equal(JSON.parse(fs.readFileSync(file+'.bak')).sets[0].name,'A');
});
test('Electron ikkala nusxa buzilganda jim boshlang‘ich holatga qaytmaydi',t=>{
  const {file,store}=disk(t);fs.writeFileSync(file,'bad1');fs.writeFileSync(file+'.bak','bad2');
  assert.throws(()=>store.load());assert.equal(fs.readFileSync(file,'utf8'),'bad1');
});
test('saqlash xatosidan so‘ng qayta urinish eng so‘nggi ma’lumotni saqlaydi',async()=>{
  let fail=true;const saved=[];globalThis.window={api:{save:async value=>{if(fail)throw Error('disk full');saved.push(value);}}};
  const store=await import('../src/lib/store.js?retry');store.saveData(data('A'));assert.equal(await store.flushData(),false);assert.equal(store.getSaveStatus().kind,'error');
  store.saveData(data('B'));fail=false;assert.equal(await store.flushData(),true);assert.equal(saved.at(-1).sets[0].name,'B');assert.equal(store.getSaveStatus().kind,'saved');delete globalThis.window;
});
test('ketma-ket yozish parallel ketmaydi, yangilanish yo‘qolmaydi',async()=>{
  let release;const saved=[];globalThis.window={api:{save:async value=>{saved.push(value.sets[0].name);if(saved.length===1)await new Promise(resolve=>release=resolve);}}};
  const store=await import('../src/lib/store.js?queue');store.saveData(data('A'));const flushed=store.flushData();store.saveData(data('B'));assert.deepEqual(saved,['A']);release();assert.equal(await flushed,true);assert.deepEqual(saved,['A','B']);delete globalThis.window;
});
test('animatsiya sozlamasi: eski ma’lumotda yoqilgan, noto‘g‘ri tur rad etiladi', () => {
  assert.equal(validateData(data()).settings.animations, true);
  assert.equal(validateData({...data(),settings:{...data().settings,animations:false}}).settings.animations, false);
  assert.throws(() => validateData({...data(),settings:{...data().settings,animations:'ha'}}));
});
test('robot natijalari va mashq yulduzlari saqlanadi, noto‘g‘ri qiymat rad etiladi', () => {
  const result = {id:'r',kind:'robot',game:'java',date:'2026-10-27',setName:'Java Robot',rounds:2,maxScore:6,winner:'Ko‘klar',teams:[{name:'Ko‘klar',color:'#4da3ff',hero:'🧑‍🚀',score:5,solved:2}]};
  const valid = validateData({...data(),history:[result],robot:{kod:{stars:{0:3,4:1}}}});
  assert.deepEqual(valid.history[0], result);
  assert.deepEqual(valid.robot, {kod:{stars:{0:3,4:1}}});
  assert.deepEqual(validateData(data()).robot, {});
  assert.throws(() => validateData({...data(),robot:{kod:{stars:{0:5}}}}));
  assert.throws(() => validateData({...data(),history:[{...result,game:'chess'}]}));
});
