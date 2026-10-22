import { useCallback, useEffect, useState } from 'react';
import { loadData, saveData, quitApp, isDesktop } from './lib/store.js';
import { setSoundEnabled } from './lib/sound.js';
import { uid } from './lib/util.js';
import PinModal from './components/PinModal.jsx';
import Home from './screens/Home.jsx';
import Admin from './screens/Admin.jsx';
import SetEditor from './screens/SetEditor.jsx';
import GameSetup from './screens/GameSetup.jsx';
import Race from './screens/Race.jsx';
import Results from './screens/Results.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState({ name: 'home' });
  // {title, onSuccess} — PIN so'ralayotgan amal
  const [pinRequest, setPinRequest] = useState(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  useEffect(() => {
    if (data) setSoundEnabled(data.settings.sound);
  }, [data?.settings.sound]);

  const update = useCallback((fn) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const askPin = useCallback((title, onSuccess, onCancel) => setPinRequest({ title, onSuccess, onCancel }), []);
  const go = useCallback((next) => setScreen(next), []);

  useEffect(() => {
    if (!isDesktop) return;
    return window.api.onCloseRequested(() => askPin('Dasturdan chiqish', quitApp));
  }, [askPin]);

  if (!data) return <div className="loading">Yuklanmoqda…</div>;

  if (!data.pinHash) {
    return (
      <PinModal
        title="👋 Xush kelibsiz!"
        note="Avval o‘qituvchi uchun PIN kod o‘rnating. Savollar, sozlamalar va o‘yinni boshqarish faqat shu PIN bilan ochiladi."
        mode="set"
        onSuccess={(hash) => update((d) => ({ ...d, pinHash: hash }))}
      />
    );
  }

  const toAdmin = () => askPin('O‘qituvchi paneli', () => go({ name: 'admin' }));
  const findSet = (id) => data.sets.find((s) => s.id === id);

  let content;
  switch (screen.name) {
    case 'admin':
      content = <Admin data={data} update={update} go={go} askPin={askPin} tab={screen.tab} />;
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
          onExit={() => go({ name: 'admin' })}
          onFinish={(result) => {
            update((d) => ({ ...d, history: [result, ...d.history].slice(0, 300) }));
            go({ name: 'results', result, config: screen.config });
          }}
        />
      );
      break;
    case 'results':
      content = (
        <Results
          result={screen.result}
          onReplay={() => go({ name: 'race', config: screen.config, key: uid() })}
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
      {content ?? <Home onAdmin={toAdmin} />}
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
