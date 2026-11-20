import { Fragment, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { loadData, saveData, quitApp, isDesktop, getSaveStatus, subscribeSaveStatus, flushData, dismissRecovery } from './lib/store.js';
import { setSoundEnabled } from './lib/sound.js';
import { onBackButton } from './lib/platform.js';
import { uid } from './lib/util.js';
import PinModal from './components/PinModal.jsx';
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
  // Platforma har doim O'yinlar zalidan ochiladi.
  const [screen, setScreen] = useState({ name: 'hall' });
  const [loadError,setLoadError] = useState('');
  const [saveStatus,setSaveStatus] = useState(getSaveStatus);
  useEffect(()=>subscribeSaveStatus(setSaveStatus),[]);
  // PIN o'rnatilgan bo'lsa, Sozlamalarni ochish va dasturdan chiqishda sessiyada bir marta so'raladi.
  const pinUnlocked = useRef(false);
  // {title, onSuccess, onCancel} — PIN so'ralayotgan amal
  const [pinRequest, setPinRequest] = useState(null);

  useEffect(() => {
    loadData().then((loaded) => {
      setData(loaded);
      pinUnlocked.current = !loaded.pinHash;
    }).catch(error=>setLoadError(error.message));
  }, []);

  useEffect(() => {
    if (data) setSoundEnabled(data.settings.sound);
  }, [data?.settings.sound]);

  // Sekin kompyuterlarda animatsiyalarni o'chirish uchun butun sahifaga sinf qo'yiladi.
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', data?.settings.animations === false);
  }, [data?.settings.animations]);

  const update = useCallback((fn) => {
    const next = fn(dataRef.current);
    dataRef.current = next;
    setData(next);
    saveData(next);
  }, []);

  // O'yinlar ichidagi askPin chaqiruvlari PINsiz o'tadi; faqat force (PINni almashtirish, zaxiradan tiklash) so'raydi.
  const askPin = useCallback((title, onSuccess, onCancel, force = false) => {
    if (!data?.pinHash || !force) {
      onSuccess();
      return;
    }
    setPinRequest({ title, onSuccess, onCancel });
  }, [data?.pinHash]);
  // Sozlamalar va chiqish: PIN sessiyada bir marta.
  const guard = useCallback((title, onSuccess) => {
    if (!data?.pinHash || pinUnlocked.current) {
      onSuccess();
      return;
    }
    setPinRequest({ title, onSuccess: () => { pinUnlocked.current = true; onSuccess(); } });
  }, [data?.pinHash]);
  const go = useCallback((next) => {
    // O'yin qayerdan boshlanmasin (zal yoki Sozlamalardagi "O'ynash"), undan chiqqanda har doim zalga qaytiladi.
    if (['setup', 'play', 'results', 'review'].includes(next.name)) next = { ...next, from: 'hall' };
    setScreen(next);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    return window.api.onCloseRequested(() => guard('Dasturdan chiqish', quitApp));
  }, [guard]);

  // Android "Orqaga" tugmasi: zalda — saqlab chiqish; o'yin ichida — e'tiborsiz (tasodifan bosilsa o'yin yo'qolmasin,
  // har o'yinning o'z ⏸ / ← tugmasi bor); boshqa ekranlarda — zalga qaytish.
  const screenRef = useRef(screen);
  screenRef.current = screen;
  useEffect(
    () =>
      onBackButton(() => {
        const s = screenRef.current;
        if (s.name === 'hall') return flushData().then(() => false);
        if (s.name === 'play' || s.name === 'solo') return true;
        setScreen({ name: 'hall' });
        return true;
      }),
    [],
  );

  const restored = (next) => {
    setData(next); setLoadError(''); pinUnlocked.current = true;
    setScreen({ name: 'admin', tab: 'general' });
  };
  if (loadError) return <div className="screen admin"><main className="recovery-screen"><span className="eyebrow">BILIM ARENA</span><h1>Ma’lumotni ochib bo‘lmadi</h1><p role="alert">{loadError}</p><p>Asl ma’lumotlar o‘chirilmadi. Muammoni bartaraf etib qayta oching yoki oldindan olingan zaxira faylini tanlang.</p><button className="btn" onClick={()=>window.location.reload()}>Qayta ochish</button><BackupPanel onRestore={restored}/></main></div>;
  if (!data) return <div className="loading">Yuklanmoqda…</div>;

  const toAdmin = (tab) => guard('Sozlamalar', () => go({ name: 'admin', tab }));
  const game = GAMES[screen.game];
  const toHall = () => go({ name: 'hall' });
  // Tayyorgarlikdagi "Orqaga" (go admin) ham zalga olib boradi.
  const goGame = (next) => (next.name === 'admin' ? toHall() : go(next));
  const finishGame = (result) => {
    update((d) => ({ ...d, history: [result, ...d.history].slice(0, 300) }));
    goGame({ name: 'results', game: screen.game, result, config: screen.config });
  };
  // Zaldan istalgan o'yinni ochish (yakka, robot mashqi yoki jamoaviy tayyorgarlik).
  const startFromHall = (next) => {
    rememberLastGame(next.game);
    go(next);
  };
  const findSet = (id) => data.sets.find((s) => s.id === id);

  const quit = isDesktop ? () => guard('Dasturdan chiqish', quitApp) : null;
  const hall = (
    <Hall
      data={data}
      onStart={startFromHall}
      onStudio={() => toAdmin()}
      onQuit={quit}
      soundOn={data.settings.sound}
      onToggleSound={() => update((d) => ({ ...d, settings: { ...d.settings, sound: !d.settings.sound } }))}
    />
  );
  let content;
  switch (screen.name) {
    case 'solo': {
      // Yakka o'yin butun oynani egallaydi va faqat shu yerda yuklanadi.
      const Solo = SOLO_GAMES[screen.game]?.Component;
      content = Solo && (
        <Suspense fallback={<div className="loading">Yuklanmoqda…</div>}>
          <Solo onExit={toHall} soundOn={data.settings.sound} reduceMotion={data.settings.animations === false} />
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
            go: goGame,
            onExit: toHall,
            exitLabel: 'O‘yinlar zaliga qaytish',
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
          // Yana o'ynash: oddiy o'yinda kataklar qayta aralashadi, kunlik sarguzashtda bugungi xarita saqlanadi.
          onReplay={() => goGame({ name: 'play', game: screen.game, config: { ...screen.config, seed: screen.config.daily ? screen.config.seed : Math.floor(Math.random() * 2 ** 31) }, key: uid() })}
          onReview={() => goGame({ name: 'review', game: screen.game, result: screen.result, config: screen.config })}
          onAdmin={toHall}
          adminLabel="O‘yinlar zali"
        />
      );
      break;
    default:
      content = hall;
  }

  return (
    <>
      <div key={screen.name} className="screen-enter">{content ?? hall}</div>
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
            onSuccess();
          }}
        />
      )}
    </>
  );
}
