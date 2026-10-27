import { useEffect, useRef, useState } from 'react';
import { isDesktop, quitApp } from '../lib/store.js';
import { downloadJson, formatDate, newSet, normalizeQuestion, playableQuestions, uid } from '../lib/util.js';
import { downloadExcelTemplate, exportSetToExcel, importSetFromExcel } from '../lib/excel.js';
import { checkUpdate, installUpdate, useUpdateStatus } from '../lib/updates.js';
import ConfirmButton from '../components/ConfirmButton.jsx';
import PinModal from '../components/PinModal.jsx';
import BackupPanel from '../components/BackupPanel.jsx';
import { validateQuestion } from '../../shared/data-schema.mjs';
import { ROBOT_GAMES } from '../lib/robot/games.js';

const TABS = [
  ['sets', '📚 Savol to‘plamlari'],
  ['robot', '🤖 Robot dasturlash'],
  ['history', '🏆 Natijalar tarixi'],
  ['settings', '⚙️ Sozlamalar'],
];

export default function Admin({ data, update, go, askPin, onRestore, tab: initialTab = 'sets' }) {
  const [tab, setTab] = useState(initialTab);
  const updateStatus = useUpdateStatus();

  return (
    <div className="screen admin">
      <header className="topbar">
        <strong>🏝️ Bilim Arena</strong>
        <small>Dars studiyasi</small>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        {updateStatus.status === 'ready' && (
          <button className="btn update-badge" onClick={() => setTab('settings')}>
            ⬆ Yangi versiya tayyor
          </button>
        )}
        <button className="btn" disabled={!data.pinHash} title={data.pinHash ? 'Doskani bolalarga topshirish' : 'Qulflash uchun sozlamalarda PIN yarating'} onClick={() => go({ name: 'home' })}>
          🔒 Qulflash
        </button>
      </header>
      <main className="admin-main">
        {tab === 'sets' && <SetsTab data={data} update={update} go={go} />}
        {tab === 'robot' && <RobotTab data={data} update={update} go={go} />}
        {tab === 'history' && <HistoryTab data={data} update={update} />}
        {tab === 'settings' && <SettingsTab data={data} update={update} askPin={askPin} onRestore={onRestore} updateStatus={updateStatus} />}
      </main>
    </div>
  );
}

function SetsTab({ data, update, go }) {
  const fileRef = useRef(null);
  const excelRef = useRef(null);
  const [message, setMessage] = useState('');
  const [importErrors, setImportErrors] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const subjects = [...new Set(data.sets.map((set) => set.subject))];
  const filtered = data.sets.filter((set) => (!subject || set.subject === subject) && (!grade || set.grade === grade) && (set.name + ' ' + set.subject).toLocaleLowerCase('uz').includes(search.toLocaleLowerCase('uz')));
  const readySet = data.sets.find((set) => playableQuestions(set).length > 0);

  const importExcel = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    setImportErrors([]);
    try {
      const { set, errors } = await importSetFromExcel(file);
      setImportErrors(errors);
      if (set.questions.length === 0) {
        setMessage('❌ Fayldan birorta ham savol o‘qilmadi');
        return;
      }
      update((d) => ({ ...d, sets: [...d.sets, set] }));
      setMessage(
        `✅ “${set.name}” import qilindi: ${set.questions.length} ta savol` + (errors.length ? `, ${errors.length} ta qator o‘tkazib yuborildi` : ''),
      );
    } catch (error) {
      setMessage('❌ ' + (error.message || 'Excel faylni o‘qib bo‘lmadi'));
    }
  };

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
        questions: parsed.questions.map((q) => validateQuestion(normalizeQuestion({ ...q, id: uid() }))),
      };
      update((d) => ({ ...d, sets: [...d.sets, set] }));
      setMessage(`✅ “${set.name}” import qilindi (${set.questions.length} ta savol)`);
    } catch {
      setMessage('❌ Bu fayl savol to‘plami emas yoki buzilgan');
    }
  };

  return (
    <>
      <section className="studio-hero">
        <div className="studio-copy">
          <span className="eyebrow">BILIM ARENA / DARS STUDIYASI</span>
          <h1>Bugungi darsni<br /><em>sarguzashtga aylantiring.</em></h1>
          <p>To‘plam tanlang, jamoalarni tuzing va butun sinfni bilim poygasiga qo‘shing.</p>
          <div className="row-buttons">
            <button className="btn primary big" disabled={!readySet} onClick={() => go({ name: 'setup', setId: readySet.id })}>Darsni boshlash ↗</button>
            <button className="btn big" onClick={addSet}>＋ To‘plam yaratish</button>
          </div>
          <div className="studio-facts"><span><b>{data.sets.length}</b> to‘plam</span><span><b>{subjects.length}</b> fan</span><span><b>{data.history.length}</b> o‘yin</span></div>
        </div>
        <div className="quest-preview" aria-hidden="true"><span className="preview-label">01 / XAZINA POYGASI</span><div className="preview-orbit" /><div className="preview-island"><span>🌴</span></div><i className="preview-step p1">1</i><i className="preview-step p2">2</i><i className="preview-step p3">★</i><span className="preview-hero">🦊</span><span className="preview-treasure">💰</span><div className="preview-caption">Har javob — yangi qadam.<small>2–4 jamoa · 5 xil savol · Internet talab qilmaydi</small></div></div>
      </section>
      <div className="section-head library-heading">
        <div><span className="eyebrow">SIZNING KUTUBXONANGIZ</span><h2>Savol to‘plamlari</h2></div>
        <div className="row-buttons">
          <button className="btn" onClick={downloadExcelTemplate}>
            📄 Excel shablon
          </button>
          <button className="btn" onClick={() => excelRef.current.click()}>
            ⤒ Excel’dan import
          </button>
          <button className="btn" onClick={() => fileRef.current.click()}>
            ⤒ JSON import
          </button>
          <button className="btn primary" onClick={addSet}>
            ＋ Yangi to‘plam
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importFile} />
        <input ref={excelRef} type="file" accept=".xlsx" hidden onChange={importExcel} />
      </div>
      {message && <p className="note">{message}</p>}
      {importErrors.length > 0 && (
        <details className="import-errors">
          <summary>O‘tkazib yuborilgan qatorlar ({importErrors.length})</summary>
          <ul>
            {importErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </details>
      )}
      {data.sets.length === 0 && <p className="muted">Hali to‘plam yo‘q. “Yangi to‘plam” tugmasini bosing.</p>}
      <div className="library-filters">
        <label>Qidirish<input type="search" placeholder="To‘plam yoki fan nomi…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
        <label>Fan<select value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Barcha fanlar</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Sinf<select value={grade} onChange={(e) => setGrade(e.target.value)}><option value="">Barcha sinflar</option>{['5','6','7','8','9','10','11','Aralash'].map((item) => <option key={item} value={item}>{item === 'Aralash' ? item : item + '-sinf'}</option>)}</select></label>
        <span className="muted">{filtered.length} ta to‘plam</span>
      </div>
      {data.sets.length > 0 && filtered.length === 0 && <div className="panel empty-state"><h3>To‘plam topilmadi</h3><p>Qidiruvni o‘zgartiring yoki filtrlarni tozalang.</p><button className="btn" onClick={() => { setSearch(''); setSubject(''); setGrade(''); }}>Filtrlarni tozalash</button></div>}
      <div className="set-grid">
        {filtered.map((set) => {
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
                <button className="btn" onClick={() => exportSetToExcel(set)} title="Excel faylga (rasmlarsiz)">
                  ⤓ Excel
                </button>
                <button
                  className="btn"
                  title="To‘liq nusxa (rasmlar bilan)"
                  onClick={() => downloadJson(`${set.name}.json`, { name: set.name, subject: set.subject, grade: set.grade, questions: set.questions })}
                >
                  ⤓ JSON
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

function RobotTab({ data, update, go }) {
  return (
    <>
      <div className="section-head">
        <h2>Robot dasturlash</h2>
      </div>
      <p className="note">
        Savol to‘plami kerak emas — darajalar o‘yin ichida tayyor. <b>Jamoaviy o‘yin</b>da jamoalar navbat bilan doskaga chiqib bitta
        darajani yechadi va yulduz yig‘adi. <b>Mashq rejimi</b>da darajani erkin tanlash mumkin (masalan, mavzuni tushuntirish uchun).
      </p>
      <div className="set-grid">
        {Object.entries(ROBOT_GAMES).map(([id, g]) => {
          const stars = data.robot?.[id]?.stars || {};
          const solved = Object.keys(stars).length;
          return (
            <div key={id} className="set-card robot-card">
              <div className="set-card-top">
                <span className="chip">Informatika</span>
                <span className="chip">{g.grades}</span>
              </div>
              <h3>
                {g.icon} {g.title}
              </h3>
              <p className="muted">{g.about}</p>
              <p className="muted small">
                {g.levels.length} ta daraja · mashqda yechilgan: {solved}/{g.levels.length}
              </p>
              <div className="set-card-actions">
                <button className="btn primary" onClick={() => go({ name: 'robotSetup', game: id })}>
                  ▶ Jamoaviy o‘yin
                </button>
                <button className="btn" onClick={() => go({ name: 'robot', key: uid(), config: { game: id, mode: 'practice' } })}>
                  🎯 Mashq rejimi
                </button>
                {solved > 0 && (
                  <ConfirmButton onConfirm={() => update((d) => ({ ...d, robot: { ...d.robot, [id]: {} } }))}>↺ Mashqni tozalash</ConfirmButton>
                )}
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
                  {t.hero} {t.name}:{' '}
                  {h.kind === 'robot' ? `★ ${t.score} · ${t.solved}/${h.rounds} daraja` : `${t.pos}/${h.trackLength} qadam · ✓${t.correct} ✗${t.wrong}`}
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

function UpdatePanel({ state, version }) {
  const { status } = state;
  const text = {
    web: 'Brauzer rejimida yangilanish yo‘q — bu faqat o‘rnatilgan dasturda ishlaydi.',
    dev: 'Ishlab chiqish rejimida yangilanish tekshirilmaydi.',
    idle: 'Hali tekshirilmadi.',
    checking: 'Tekshirilmoqda…',
    latest: '✅ Sizda eng so‘nggi versiya.',
    downloading: `⬇ ${state.version} versiya yuklab olinmoqda…`,
    ready: `✅ ${state.version} versiya yuklab olindi. Dastur yopilganda avtomatik o‘rnatiladi.`,
    error: '⚠ Tekshirib bo‘lmadi (internet yo‘qmi?). O‘yin bunga bog‘liq emas.',
  }[status];

  return (
    <div className="update-box">
      <p className="note">
        Joriy versiya: <b>{version || '—'}</b>
        <br />
        {text}
      </p>
      {status === 'downloading' && (
        <div className="progress">
          <i style={{ width: `${state.percent || 0}%` }} />
        </div>
      )}
      {['idle', 'latest', 'error'].includes(status) && (
        <button className="btn" onClick={checkUpdate}>
          🔄 Yangilanishni tekshirish
        </button>
      )}
      {status === 'ready' && (
        <button className="btn primary" onClick={installUpdate}>
          ⬆ Hozir o‘rnatish (dastur qayta ochiladi)
        </button>
      )}
    </div>
  );
}

function SettingsTab({ data, update, askPin, onRestore, updateStatus }) {
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
          <label className="check">
            <input type="checkbox" checked={s.animations} onChange={(e) => set({ animations: e.target.checked })} /> Animatsiyalar
          </label>
          <p className="note">Kompyuter yoki doska sekin ishlasa, animatsiyalarni o‘chiring.</p>
        </div>
        <div className="panel">
          <h3>Xavfsizlik</h3>
          <p className="note">Oddiy rejimda darsni parolsiz boshqaring. Sinf himoyasi yoqilsa, o‘yin boshlanganidan keyin boshqaruv uchun bir marta PIN so‘raladi. Pauza va davom etish erkin.</p>
          <label className="check"><input type="checkbox" disabled={!data.pinHash} checked={!!s.classroomLock} onChange={(e) => set({ classroomLock: e.target.checked })} /> Sinf himoyasi</label>
          {!data.pinHash && <p className="note">Himoyani yoqish uchun avval PIN yarating.</p>}
          <button className="btn" onClick={() => askPin('Joriy PINni tasdiqlang', () => setChangingPin(true), undefined, true)}>
            🔑 {data.pinHash ? 'PINni almashtirish' : 'PIN yaratish'}
          </button>
          {saved && <p className="note">✅ Yangi PIN saqlandi</p>}
          {isDesktop && (
            <>
              <h3 className="mt">Dastur</h3>
              <button className="btn danger" onClick={quitApp}>
                ⏻ Dasturni yopish
              </button>
            </>
          )}
        </div>
        <div className="panel">
          <h3>Yangilanishlar</h3>
          <UpdatePanel state={updateStatus} version={version} />
        </div>
      </div>
      <BackupPanel data={data} onRestore={onRestore} askPin={askPin} />
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
