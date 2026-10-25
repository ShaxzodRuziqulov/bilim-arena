import { SAMPLE_SETS } from './sample-data.js';
import { DEFAULT_SETTINGS, validateData } from '../../shared/data-schema.mjs';
import { browserStorage } from './browser-storage.js';
export { DEFAULT_SETTINGS };
export const isDesktop = typeof window !== 'undefined' && !!window.api;
const backend=()=>isDesktop ? window.api : browserStorage(localStorage);
let status={kind:'saved',message:''};
const listeners=new Set();
const report=(kind,message='')=>{ status={kind,message}; for(const listener of listeners) listener(status); };
export const getSaveStatus=()=>status;
export function subscribeSaveStatus(listener) { listeners.add(listener); return ()=>listeners.delete(listener); }
export async function loadData() {
  const loaded=await backend().load();
  if (loaded.recovered) report('recovered','Asosiy ma’lumot o‘qilmadi. Oxirgi zaxira ochildi; ayrim so‘nggi o‘zgarishlar bo‘lmasligi mumkin.');
  return loaded.data ? validateData(loaded.data) : {version:1,pinHash:null,settings:{...DEFAULT_SETTINGS},sets:SAMPLE_SETS(),history:[]};
}
let timer=null, pending=null, saving=null;
export function saveData(data) {
  pending=data; clearTimeout(timer); report('pending');
  timer=setTimeout(()=>{ void flushData(); },400);
}
export function flushData() {
  clearTimeout(timer);
  if (saving) return saving;
  saving=(async()=>{
    while(pending) {
      const snapshot=pending; pending=null;
      try { await backend().save(validateData(snapshot)); }
      catch(error) {
        if (!pending) pending=snapshot;
        report('error','Saqlab bo‘lmadi. O‘zgarishlar hozircha faqat ochiq oynada. Qayta urinib ko‘ring yoki zaxira faylini yuklab oling.');
        return false;
      }
    }
    if (status.kind !== 'recovered') report('saved');
    return true;
  })().finally(()=>{saving=null;});
  return saving;
}
export async function replaceData(data) {
  const valid=validateData(data);
  if (!(await flushData())) throw new Error('Joriy o‘zgarishlar saqlanmadi. Avval ularni zaxira fayliga chiqarib oling.');
  try { await backend().save(valid); report('saved'); return valid; }
  catch(error) { report('error','Tiklangan ma’lumotni yozib bo‘lmadi. Joriy oynadagi ma’lumot saqlandi.'); throw error; }
}
export function dismissRecovery() { if(status.kind === 'recovered') report('saved'); }
export async function quitApp() { if (await flushData()) { if(isDesktop) window.api.quit(); } }

// Brauzer yopilishida qisqa kechiktirilgan yozishni tugatish; saqlanmagan holatda ogohlantirish.
if (typeof window !== 'undefined' && window.addEventListener && !isDesktop) {
  window.addEventListener('pagehide', () => { void flushData(); });
  window.addEventListener('beforeunload', (event) => {
    if (pending || saving) { void flushData(); event.preventDefault(); event.returnValue=''; }
  });
}
