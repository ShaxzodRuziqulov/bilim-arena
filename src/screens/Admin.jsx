import { useEffect, useRef, useState } from 'react';
import { isDesktop, quitApp } from '../lib/store.js';
import { downloadJson, formatDate, newSet, playableQuestions, uid } from '../lib/util.js';
import ConfirmButton from '../components/ConfirmButton.jsx';
import PinModal from '../components/PinModal.jsx';

const TABS = [
  ['sets', '📚 Savol to‘plamlari'],
  ['history', '🏆 Natijalar tarixi'],
  ['settings', '⚙️ Sozlamalar'],
];

export default function Admin({ data, update, go, askPin, tab: initialTab = 'sets' }) {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="screen admin">
      <header className="topbar">
        <strong>🏝️ Bilim Arena</strong>
        <small>O‘qituvchi paneli</small>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="btn gold" onClick={() => go({ name: 'home' })}>
          🔒 Qulflash
        </button>
      </header>
      <main className="admin-main">
        {tab === 'sets' && <SetsTab data={data} update={update} go={go} />}
        {tab === 'history' && <HistoryTab data={data} update={update} />}
        {tab === 'settings' && <SettingsTab data={data} update={update} askPin={askPin} />}
      </main>
    </div>
  );
}

function SetsTab({ data, update, go }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');

  const addSet = () => {
    const set = newSet();
    update((d) => ({ ...d, sets: [...d.sets, set] }));
    go({ name: 'editor', setId: set.id });
  };

  const importFile = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.questions)) throw new Error('questions yo‘q');
      const set = {
        ...newSet(parsed.name || file.name.replace(/\.json$/i, '')),
        subject: parsed.subject || 'Informatika',
        grade: parsed.grade || '7',
        questions: parsed.questions.map((q) => ({ ...q, id: uid() })),
      };
      update((d) => ({ ...d, sets: [...d.sets, set] }));
      setMessage(`✅ “${set.name}” import qilindi (${set.questions.length} ta savol)`);
    } catch {
      setMessage('❌ Bu fayl savol to‘plami emas yoki buzilgan');
    }
  };

  return (
    <>
      <div className="section-head">
        <h2>Savol to‘plamlari</h2>
        <div className="row-buttons">
          <button className="btn" onClick={() => fileRef.current.click()}>
            ⤒ Import (.json)
          </button>
          <button className="btn primary" onClick={addSet}>
            ＋ Yangi to‘plam
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importFile} />
      </div>
      {message && <p className="note">{message}</p>}
      {data.sets.length === 0 && <p className="muted">Hali to‘plam yo‘q. “Yangi to‘plam” tugmasini bosing.</p>}
      <div className="set-grid">
        {data.sets.map((set) => {
          const ready = playableQuestions(set).length;
          return (
            <div key={set.id} className="set-card">
              <div className="set-card-top">
                <span className="chip">{set.subject}</span>
                <span className="chip">{set.grade}-sinf</span>
              </div>
              <h3>{set.name}</h3>
              <p className="muted">
                {set.questions.length} ta savol
                {ready < set.questions.length && ` · ⚠ ${set.questions.length - ready} tasi to‘liq emas`}
              </p>
              <div className="set-card-actions">
                <button className="btn primary" disabled={ready === 0} onClick={() => go({ name: 'setup', setId: set.id })}>
                  ▶ O‘ynash
                </button>
                <button className="btn" onClick={() => go({ name: 'editor', setId: set.id })}>
                  ✎ Tahrirlash
                </button>
                <button
                  className="btn"
                  onClick={() => downloadJson(`${set.name}.json`, { name: set.name, subject: set.subject, grade: set.grade, questions: set.questions })}
                >
                  ⤓ Eksport
                </button>
                <ConfirmButton onConfirm={() => update((d) => ({ ...d, sets: d.sets.filter((s) => s.id !== set.id) }))}>
                  🗑
                </ConfirmButton>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function HistoryTab({ data, update }) {
  return (
    <>
      <div className="section-head">
        <h2>Natijalar tarixi</h2>
        {data.history.length > 0 && (
          <ConfirmButton onConfirm={() => update((d) => ({ ...d, history: [] }))}>🗑 Tarixni tozalash</ConfirmButton>
        )}
      </div>
      {data.history.length === 0 && <p className="muted">Hali o‘yin o‘ynalmagan.</p>}
      <div className="history-list">
        {data.history.map((h) => (
          <div key={h.id} className="history-item">
            <div className="history-meta">
              <b>{h.setName}</b>
              <span className="muted">{formatDate(h.date)}</span>
            </div>
            <div className="history-teams">
              {h.teams.map((t) => (
                <span key={t.name} className="chip" style={{ borderColor: t.color }}>
                  {h.winner === t.name && '👑 '}
                  {t.hero} {t.name}: {t.pos}/{h.trackLength} qadam · ✓{t.correct} ✗{t.wrong}
                </span>
              ))}
            </div>
            {h.hard?.length > 0 && (
              <details>
                <summary>Ko‘p xato qilingan savollar ({h.hard.length})</summary>
                <ul>
                  {h.hard.map((q, i) => (
                    <li key={i}>
                      {q.text} — <b>{q.wrong}</b> marta xato
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsTab({ data, update, askPin }) {
  const [changingPin, setChangingPin] = useState(false);
  const [saved, setSaved] = useState(false);
  const [version, setVersion] = useState('');
  const s = data.settings;
  const set = (patch) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  useEffect(() => {
    if (isDesktop) window.api.version().then(setVersion);
  }, []);

  return (
    <>
      <h2>Sozlamalar</h2>
      <div className="settings-grid">
        <div className="panel">
          <h3>O‘yin (standart qiymatlar)</h3>
          <label>Har bir savol uchun vaqt</label>
          <select value={s.time} onChange={(e) => set({ time: Number(e.target.value) })}>
            {[15, 20, 30, 45, 60, 90, 0].map((t) => (
              <option key={t} value={t}>
                {t ? `${t} soniya` : 'Cheklanmagan'}
              </option>
            ))}
          </select>
          <label>Xazinagacha qadamlar soni</label>
          <select value={s.trackLength} onChange={(e) => set({ trackLength: Number(e.target.value) })}>
            {[8, 10, 12, 16, 20].map((n) => (
              <option key={n} value={n}>
                {n} qadam
              </option>
            ))}
          </select>
          <label className="check">
            <input type="checkbox" checked={s.sound} onChange={(e) => set({ sound: e.target.checked })} /> Tovush effektlari
          </label>
        </div>
        <div className="panel">
          <h3>Xavfsizlik</h3>
          <p className="note">PIN kod o‘qituvchi paneliga, o‘yinni to‘xtatishga va dasturdan chiqishga kerak.</p>
          <button className="btn" onClick={() => askPin('Joriy PINni tasdiqlang', () => setChangingPin(true))}>
            🔑 PINni almashtirish
          </button>
          {saved && <p className="note">✅ Yangi PIN saqlandi</p>}
          {isDesktop && (
            <>
              <h3 className="mt">Dastur</h3>
              <p className="note">Versiya: {version}</p>
              <button className="btn danger" onClick={quitApp}>
                ⏻ Dasturni yopish
              </button>
            </>
          )}
        </div>
      </div>
      {changingPin && (
        <PinModal
          title="Yangi PIN"
          mode="set"
          onCancel={() => setChangingPin(false)}
          onSuccess={(hash) => {
            update((d) => ({ ...d, pinHash: hash }));
            setChangingPin(false);
            setSaved(true);
          }}
        />
      )}
    </>
  );
}
