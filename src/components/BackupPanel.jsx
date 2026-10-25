import { useRef, useState } from 'react';
import { parseBackup, makeBackup } from '../../shared/data-schema.mjs';
import { downloadJson } from '../lib/util.js';
import { replaceData } from '../lib/store.js';
export function exportBackup(data) { downloadJson('bilim-arena-zaxira-'+new Date().toISOString().slice(0,10)+'.json',makeBackup(data)); }
export default function BackupPanel({ data, onRestore, askPin }) {
  const fileRef=useRef(null);
  const [candidate,setCandidate]=useState(null), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const select=async(event)=>{
    const file=event.target.files[0]; event.target.value=''; setError(''); setCandidate(null);
    if(!file)return;
    try { if(file.size>25*1024*1024)throw new Error('Zaxira fayli 25 MB dan katta.'); setCandidate(parseBackup(await file.text())); }
    catch(e) { setError('Fayl qabul qilinmadi: '+e.message); }
  };
  const restore=async()=>{
    setBusy(true); setError('');
    try {
      // Ishlayotgan qurilmaning PINi va himoya tanlovi saqlanadi.
      const next=data ? {...candidate,pinHash:data.pinHash,settings:{...candidate.settings,classroomLock:data.settings.classroomLock}} : candidate;
      const saved=await replaceData(next); setCandidate(null); onRestore(saved);
    } catch(e) {setError(e.message);} finally {setBusy(false);}
  };
  return <div className="panel backup-panel"><span className="eyebrow">MA’LUMOTLAR XAVFSIZLIGI</span><h3>Zaxira va tiklash</h3>
    <p className="note">Barcha savollar, rasmlar, sozlamalar va natijalar bitta JSON faylda. Avtomatik zaxira shu qurilmada; alohida yuklangan nusxani boshqa joyda ham saqlang.</p>
    <div className="row-buttons">{data && <button className="btn primary" onClick={()=>exportBackup(data)}>⤓ To‘liq zaxira olish</button>}<button className="btn" disabled={busy} onClick={()=>fileRef.current.click()}>⤒ Zaxiradan tiklash</button></div>
    <input aria-label="Zaxira fayli" type="file" accept=".json,application/json" hidden ref={fileRef} onChange={select}/>
    {busy && <div className="overlay pin-overlay" role="status"><div className="pin-card"><h2>Tiklanmoqda…</h2><p>Ma’lumotlar yozib bo‘linguncha kuting.</p></div></div>}
    {error && <p className="backup-error" role="alert">{error}</p>}
    {candidate && <div className="restore-preview"><h4>Tiklanadigan nusxa</h4><p>{candidate.sets.length} ta to‘plam · {candidate.sets.reduce((sum,s)=>sum+s.questions.length,0)} ta savol · {candidate.history.length} ta natija</p>
    <p className="note">Bu amal joriy to‘plamlar, sozlamalar va tarixni almashtiradi. {data ? 'Joriy PIN va sinf himoyasi saqlanadi; almashtirish oldidan mavjud ma’lumot avtomatik zaxiraga yoziladi.' : 'Fayldagi PIN va himoya sozlamalari ham tiklanadi.'}</p>
    <div className="row-buttons"><button className="btn primary" disabled={busy} onClick={()=>askPin ? askPin('Ma’lumotlarni tiklash',restore,undefined,true) : restore()}>{busy?'Tiklanmoqda…':'Tasdiqlash va tiklash'}</button><button className="btn" disabled={busy} onClick={()=>setCandidate(null)}>Bekor qilish</button></div></div>}
  </div>;
}
