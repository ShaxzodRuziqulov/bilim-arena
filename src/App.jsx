import { Fragment, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { loadData, saveData, quitApp, isDesktop, getSaveStatus, subscribeSaveStatus, flushData, dismissRecovery } from './lib/store.js';
import { setSoundEnabled } from './lib/sound.js';
import { uid } from './lib/util.js';
import PinModal from './components/PinModal.jsx';
import Home from './screens/Home.jsx';
import Admin from './screens/Admin.jsx';
import SetEditor from './screens/SetEditor.jsx';
import Results from './screens/Results.jsx';
import Review from './screens/Review.jsx';
import BackupPanel, { exportBackup } from './components/BackupPanel.jsx';
import { GAMES, SOLO_GAMES } from './games/registry.jsx';
import Hall, { rememberLastGame } from './screens/Hall.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  // Platforma O'yinlar zalidan ochiladi. Sinf himoyasi yoqilgan bo'lsa — avvalgidek sinf ekrani.
  const [screen, setScreen] = useState({ name: 'hall' });
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
    if (next.name === 'home' || ((next.name === 'play' || next.name === 'hall') && data?.settings.classroomLock)) teacherUnlocked.current = false;
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

  const toAdmin = (tab) => askPin('O‘qituvchi studiyasi', () => {
    teacherUnlocked.current = true;
    go({ name: 'admin', tab });
  });
  const game = GAMES[screen.game];
  // O'yin zaldan ochilgan bo'lsa (from: 'hall'), uning barcha "studiyaga" yo'llari zalga buriladi:
  // o'yinchi bitta platformada qoladi. Studiyadan ochilgan o'yinlar avvalgidek studiyaga qaytadi.
  const fromHall = screen.from === 'hall';
  const toHall = () => go({ name: 'hall' });
  const goGame = (next) => {
    if (!fromHall) return go(next);
    if (next.name === 'admin') return toHall();
    return go({ ...next, from: 'hall' });
  };
  const leaveGame = fromHall ? toHall : () => toAdmin(game?.adminTab);
  const leaveLabel = fromHall ? 'O‘yinlar zaliga qaytish' : 'Studiyaga qaytish';
  const finishGame = (result) => {
    update((d) => ({ ...d, history: [result, ...d.history].slice(0, 300) }));
    goGame({ name: 'results', game: screen.game, result, config: screen.config });
  };
  // Zaldan istalgan o'yinni ochish (yakka, robot mashqi yoki jamoaviy tayyorgarlik).
  const startFromHall = (next) => {
    rememberLastGame(next.game);
    go({ ...next, from: 'hall' });
  };
  const findSet = (id) => data.sets.find((s) => s.id === id);

  const quit = isDesktop ? () => askPin('Dasturdan chiqish', quitApp) : null;
  let content;
  switch (screen.name) {
    case 'hall':
      content = (
        <Hall
          data={data}
          onStart={startFromHall}
          onStudio={() => toAdmin()}
          onQuit={quit}
          soundOn={data.settings.sound}
          onToggleSound={() => update((d) => ({ ...d, settings: { ...d.settings, sound: !d.settings.sound } }))}
        />
      );
      break;
    case 'solo': {
      // Yakka o'yin butun oynani egallaydi va faqat shu yerda yuklanadi.
      const Solo = SOLO_GAMES[screen.game]?.Component;
      content = Solo && (
        <Suspense fallback={<div className="loading">Yuklanmoqda…</div>}>
          <Solo onExit={toHall} soundOn={data.settings.sound} />
        </Suspense>
      );
      break;
    }
    case 'admin':
      content = <Admin data={data} update={update} go={go} askPin={askPin} onRestore={restored} tab={screen.tab} />;
      break;
    case 'editor': {
      const set = findSet(screen.setId);
      content = set ? <SetEditor set={set} update={update} go={go} /> : null;
      break;
    }
    // Tayyorgarlik va o'yin ekranlari o'yin modulidan olinadi (src/games/registry.jsx).
    case 'setup':
      content = game?.renderSetup({ data, go: goGame, screen });
      break;
    case 'play':
      // key har yangi o'yinda ekranni noldan boshlaydi (Yana o'ynash ham).
      content = game && (
        <Fragment key={screen.key}>
          {game.renderPlay({
            config: screen.config,
            data,
            update,
            askPin,
            onExit: leaveGame,
            exitLabel: leaveLabel,
            onFinish: finishGame,
          })}
        </Fragment>
      );
      break;
    case 'review':
      content = <Review result={screen.result} onBack={() => goGame({ name: 'results', game: screen.game, result: screen.result, config: screen.config })} />;
      break;
    case 'results':
      content = (
        <Results
          result={screen.result}
          onReplay={() => goGame({ name: 'play', game: screen.game, config: screen.config, key: uid() })}
          onReview={() => goGame({ name: 'review', game: screen.game, result: screen.result, config: screen.config })}
          onAdmin={leaveGame}
          adminLabel={fromHall ? 'O‘yinlar zali' : 'Dars studiyasi'}
        />
      );
      break;
    default:
      content = (
        // Sinf himoyasi yoqilgan ekrandan zalga o'tish ham PIN bilan (aks holda bolalar qulfni chetlab o'tadi).
        <Home onAdmin={toAdmin} onHall={() => askPin('O‘yinlar zali', () => go({ name: 'hall' }))} onQuit={quit} />
      );
  }

  return (
    <>
      <div key={screen.name} className="screen-enter">{content ?? <Home onAdmin={toAdmin} onHall={() => askPin('O‘yinlar zali', () => go({ name: 'hall' }))} />}</div>
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
