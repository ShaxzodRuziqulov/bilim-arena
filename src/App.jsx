import { useCallback, useEffect, useRef, useState } from 'react';
import { loadData, saveData, quitApp, isDesktop, getSaveStatus, subscribeSaveStatus, flushData, dismissRecovery } from './lib/store.js';
import { setSoundEnabled } from './lib/sound.js';
import { uid } from './lib/util.js';
import PinModal from './components/PinModal.jsx';
import Home from './screens/Home.jsx';
import Admin from './screens/Admin.jsx';
import SetEditor from './screens/SetEditor.jsx';
import GameSetup from './screens/GameSetup.jsx';
import Race from './screens/Race.jsx';
import Results from './screens/Results.jsx';
import Review from './screens/Review.jsx';
import BackupPanel, { exportBackup } from './components/BackupPanel.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const [screen, setScreen] = useState({ name: 'admin' });
  const [loadError,setLoadError] = useState('');
  const [saveStatus,setSaveStatus] = useState(getSaveStatus);
  useEffect(()=>subscribeSaveStatus(setSaveStatus),[]);
  const teacherUnlocked = useRef(true);
  // {title, onSuccess} — PIN so'ralayotgan amal
  const [pinRequest, setPinRequest] = useState(null);

  useEffect(() => {
    loadData().then((loaded) => {
      setData(loaded);
      teacherUnlocked.current = !loaded.settings.classroomLock;
      if (loaded.settings.classroomLock && loaded.pinHash) setScreen({ name: 'home' });
    }).catch(error=>setLoadError(error.message));
  }, []);

  useEffect(() => {
    if (data) setSoundEnabled(data.settings.sound);
  }, [data?.settings.sound]);

  // Sekin doskalarda animatsiyalarni o'chirish uchun butun sahifaga sinf qo'yiladi.
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', data?.settings.animations === false);
  }, [data?.settings.animations]);

  const update = useCallback((fn) => {
    const next = fn(dataRef.current);
    dataRef.current = next;
    setData(next);
    saveData(next);
  }, []);

  const askPin = useCallback((title, onSuccess, onCancel, force = false) => {
    if (!data?.pinHash || (!force && teacherUnlocked.current)) {
      onSuccess();
      return;
    }
    setPinRequest({ title, onSuccess, onCancel });
  }, [data?.pinHash]);
  const go = useCallback((next) => {
    if (next.name === 'home' || (next.name === 'race' && data?.settings.classroomLock)) teacherUnlocked.current = false;
    setScreen(next);
  }, [data?.settings.classroomLock]);

  useEffect(() => {
    if (!isDesktop) return;
    return window.api.onCloseRequested(() => askPin('Dasturdan chiqish', quitApp));
  }, [askPin]);

  const restored = (next) => {
    setData(next); setLoadError(''); teacherUnlocked.current = true;
    setScreen({ name: 'admin', tab: 'settings' });
  };
  if (loadError) return <div className="screen admin"><main className="recovery-screen"><span className="eyebrow">BILIM ARENA</span><h1>Ma’lumotni ochib bo‘lmadi</h1><p role="alert">{loadError}</p><p>Asl ma’lumotlar o‘chirilmadi. Muammoni bartaraf etib qayta oching yoki oldindan olingan zaxira faylini tanlang.</p><button className="btn" onClick={()=>window.location.reload()}>Qayta ochish</button><BackupPanel onRestore={restored}/></main></div>;
  if (!data) return <div className="loading">Yuklanmoqda…</div>;

  const toAdmin = () => askPin('O‘qituvchi studiyasi', () => {
    teacherUnlocked.current = true;
    go({ name: 'admin' });
  });
  const findSet = (id) => data.sets.find((s) => s.id === id);

  let content;
  switch (screen.name) {
    case 'admin':
      content = <Admin data={data} update={update} go={go} askPin={askPin} onRestore={restored} tab={screen.tab} />;
      break;
    case 'editor': {
      const set = findSet(screen.setId);
      content = set ? <SetEditor set={set} update={update} go={go} /> : null;
      break;
    }
    case 'setup':
      content = <GameSetup data={data} setId={screen.setId} go={go} />;
      break;
    case 'race':
      content = (
        <Race
          key={screen.key}
          config={screen.config}
          askPin={askPin}
          onExit={toAdmin}
          onFinish={(result) => {
            update((d) => ({ ...d, history: [result, ...d.history].slice(0, 300) }));
            go({ name: 'results', result, config: screen.config });
          }}
        />
      );
      break;
    case 'review':
      content = <Review result={screen.result} onBack={() => go({ name: 'results', result: screen.result, config: screen.config })} />;
      break;
    case 'results':
      content = (
        <Results
          result={screen.result}
          onReplay={() => go({ name: 'race', config: screen.config, key: uid() })}
          onReview={() => go({ name: 'review', result: screen.result, config: screen.config })}
          onAdmin={toAdmin}
        />
      );
      break;
    default:
      content = (
        <Home onAdmin={toAdmin} onQuit={isDesktop ? () => askPin('Dasturdan chiqish', quitApp) : null} />
      );
  }

  return (
    <>
      <div key={screen.name} className="screen-enter">{content ?? <Home onAdmin={toAdmin} />}</div>
      {saveStatus.kind === 'error' && <div className="save-banner" role="alert"><span>{saveStatus.message}</span><button className="btn" onClick={()=>flushData()}>Qayta saqlash</button><button className="btn" onClick={()=>exportBackup(data)}>Zaxira olish</button></div>}
      {saveStatus.kind === 'recovered' && <div className="save-banner recovered" role="status"><span>{saveStatus.message}</span><button className="btn" onClick={dismissRecovery}>Tushunarli</button></div>}
      {saveStatus.kind === 'pending' && <div className="saving-indicator" role="status">Saqlanmoqda…</div>}
      {pinRequest && (
        <PinModal
          title={pinRequest.title}
          pinHash={data.pinHash}
          onCancel={() => {
            setPinRequest(null);
            pinRequest.onCancel?.();
          }}
          onSuccess={() => {
            const { onSuccess } = pinRequest;
            setPinRequest(null);
            teacherUnlocked.current = true;
            onSuccess();
          }}
        />
      )}
    </>
  );
}
