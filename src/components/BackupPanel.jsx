import { useRef, useState } from 'react';
import { parseBackup, makeBackup } from '../../shared/data-schema.mjs';
import { backupGameSaves, readGameSaves, writeGameSaves } from '../../shared/game-saves.mjs';
import { reloadSave as reloadSoyaSave } from '../games/soya/engine/save.js';
import { downloadJson } from '../lib/util.js';
import { replaceData } from '../lib/store.js';

const GAME_NAMES = { 'kodbuzar-v2': 'Kodbuzar', 'soya-save-v1': 'Soya' };
const browserStore = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

// Zaxiraga yakka o'yinlar (Kodbuzar, Soya) natijalari ham qo'shiladi.
export function exportBackup(data) {
  const store = browserStore();
  downloadJson('bilim-arena-zaxira-' + new Date().toISOString().slice(0, 10) + '.json', makeBackup(data, store ? readGameSaves(store) : {}));
}

export default function BackupPanel({ data, onRestore, askPin }) {
  const fileRef=useRef(null);
  const [candidate,setCandidate]=useState(null), [games,setGames]=useState({}), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const select=async(event)=>{
    const file=event.target.files[0]; event.target.value=''; setError(''); setCandidate(null); setGames({});
    if(!file)return;
    try {
      const backup = JSON.parse(await file.text());
      setCandidate(parseBackup(backup));
      setGames(backupGameSaves(backup));
    }
    catch(e) { setError('Fayl qabul qilinmadi: '+e.message); }
  };
  const restore=async()=>{
    setBusy(true); setError('');
    try {
      // Ishlayotgan qurilmaning PINi saqlanadi.
      const next=data ? {...candidate,pinHash:data.pinHash} : candidate;
      const saved=await replaceData(next);
      // Asosiy ma'lumot yozilgandan keyingina o'yin natijalari tiklanadi. Ular yozilmasa ham onRestore chaqiriladi —
      // aks holda ilova eski ma'lumotda qolib, keyingi avtosaqlash tiklangan nusxaning ustiga yozib yuborardi.
      let gamesFailed=false;
      try {
        const store=browserStore();
        if (store && writeGameSaves(store, games)) reloadSoyaSave();
      } catch { gamesFailed=true; }
      setCandidate(null); setGames({}); onRestore(saved);
      if (gamesFailed) setError('Asosiy ma’lumot tiklandi, lekin yakka o‘yinlar natijalarini yozib bo‘lmadi (brauzer xotirasi to‘la yoki yopiq).');
    } catch(e) {setError(e.message);} finally {setBusy(false);}
  };
  const gameList=Object.keys(games).map((k)=>GAME_NAMES[k]).join(', ');
  return <div className="panel backup-panel"><span className="eyebrow">MA’LUMOTLAR XAVFSIZLIGI</span><h3>Zaxira va tiklash</h3>
    <p className="note">Barcha savollar, rasmlar, sozlamalar, natijalar va yakka o‘yinlar (Kodbuzar, Soya) yutuqlari bitta JSON faylda. Avtomatik zaxira shu qurilmada; alohida yuklangan nusxani boshqa joyda ham saqlang.</p>
    <div className="row-buttons">{data && <button className="btn primary" onClick={()=>exportBackup(data)}>⤓ To‘liq zaxira olish</button>}<button className="btn" disabled={busy} onClick={()=>fileRef.current.click()}>⤒ Zaxiradan tiklash</button></div>
    <input aria-label="Zaxira fayli" type="file" accept=".json,application/json" hidden ref={fileRef} onChange={select}/>
    {busy && <div className="overlay pin-overlay" role="status"><div className="pin-card"><h2>Tiklanmoqda…</h2><p>Ma’lumotlar yozib bo‘linguncha kuting.</p></div></div>}
    {error && <p className="backup-error" role="alert">{error}</p>}
    {candidate && <div className="restore-preview"><h4>Tiklanadigan nusxa</h4><p>{candidate.sets.length} ta to‘plam · {candidate.sets.reduce((sum,s)=>sum+s.questions.length,0)} ta savol · {candidate.history.length} ta natija{gameList ? ` · o‘yinlar: ${gameList}` : ''}</p>
    <p className="note">Bu amal joriy to‘plamlar, sozlamalar va tarixni almashtiradi.{gameList ? ` ${gameList} natijalari ham fayldagisi bilan almashtiriladi; faylda yo‘q o‘yinlarning natijasiga tegilmaydi.` : ''} {data ? 'Joriy PIN saqlanadi; almashtirish oldidan mavjud ma’lumot avtomatik zaxiraga yoziladi.' : 'Fayldagi PIN ham tiklanadi.'}</p>
    <div className="row-buttons"><button className="btn primary" disabled={busy} onClick={()=>askPin ? askPin('Ma’lumotlarni tiklash',restore,undefined,true) : restore()}>{busy?'Tiklanmoqda…':'Tasdiqlash va tiklash'}</button><button className="btn" disabled={busy} onClick={()=>{setCandidate(null);setGames({});}}>Bekor qilish</button></div></div>}
  </div>;
}
