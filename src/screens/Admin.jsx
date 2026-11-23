import { isNativeApp } from '../lib/platform.js';
import AndroidUpdatePanel from '../components/AndroidUpdatePanel.jsx';
import { useEffect, useRef, useState } from 'react';
import { isDesktop, quitApp } from '../lib/store.js';
import { downloadJson, formatDate, newSet, normalizeQuestion, playableQuestions, uid } from '../lib/util.js';
import { downloadExcelTemplate, exportSetToExcel, importSetFromExcel } from '../lib/excel.js';
import { checkUpdate, installUpdate, useUpdateStatus } from '../lib/updates.js';
import ConfirmButton from '../components/ConfirmButton.jsx';
import PinModal from '../components/PinModal.jsx';
import BackupPanel from '../components/BackupPanel.jsx';
import { validateQuestion } from '../../shared/data-schema.mjs';
import { ROBOT_GAMES, ROBOT_PARTS, ladderSolved, ladderStars } from '../lib/robot/games.js';
import { GAMES, gameIdOfResult, gameOfResult, gamesOfFamily, SOLO_GAMES } from '../games/registry.jsx';
import { reloadSave as reloadSoyaSave } from '../games/soya/engine/save.js';

// Sozlamalar sahifasi (zaldagi ⚙). Umumiy — barcha o'yinlarga tegishli; O'yinlar — har o'yinning o'zi uchun.
// Savollar va natijalar alohida o'yinlarga tegishli, shuning uchun ular o'sha o'yinning panelidan ochiladi.
const TABS = [
  ['general', 'Umumiy'],
  ['games', 'O‘yinlar'],
];

export default function Admin({ data, update, go, askPin, onRestore, tab: initialTab = 'general' }) {
  const [tab, setTab] = useState(initialTab);
  const [historyGame, setHistoryGame] = useState(null);
  const updateStatus = useUpdateStatus();
  // Savollar va natijalar — "O'yinlar" ichidagi sahifalar: yuqorida "O'yinlar" belgilangan qoladi.
  const activeTab = tab === 'sets' || tab === 'history' ? 'games' : tab;
  const backToGames = (
    <button className="btn sub-back" onClick={() => setTab('games')}>← O‘yinlar</button>
  );

  return (
    <div className="screen admin">
      <header className="topbar">
        <button className="admin-back" onClick={() => go({ name: 'hall' })} aria-label="O‘yinlar zaliga qaytish" title="O‘yinlar zali">←</button>
        <strong>Sozlamalar</strong>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={`tab ${activeTab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        {updateStatus.status === 'ready' && (
          <button className="btn update-badge" onClick={() => setTab('general')}>
            ⬆ Yangi versiya tayyor
          </button>
        )}
      </header>
      <main className="admin-main">
        {tab === 'general' && <GeneralTab data={data} update={update} askPin={askPin} onRestore={onRestore} updateStatus={updateStatus} />}
        {tab === 'games' && (
          <GamesTab data={data} update={update} goSets={() => setTab('sets')} goHistory={(id) => { setHistoryGame(id); setTab('history'); }} />
        )}
        {tab === 'sets' && <>{backToGames}<SetsTab data={data} update={update} go={go} /></>}
        {tab === 'history' && <>{backToGames}<HistoryTab data={data} update={update} game={historyGame} /></>}
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
                <button className="btn primary" disabled={ready === 0} onClick={() => go({ name: 'setup', game: 'race', setId: set.id })}>
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

// Yakka o'yinlar natijalari o'z localStorage kalitlarida. Tozalashda faqat natijalar o'chadi, o'yinning o'z sozlamalari qoladi.
function clearSoloProgress(key, keep) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '{}');
    const next = Object.fromEntries(Object.entries(raw).filter(([k]) => keep.includes(k)));
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* xotira yopiq yoki buzilgan — tozalanadigan narsa yo'q */
  }
}
const safeSummary = (g) => {
  try {
    return g.summary();
  } catch {
    return { stars: 0, max: 0 };
  }
};

/** Har bir o'yinning o'z sozlamalari va natijalari. Ovoz va animatsiyalar — "Umumiy"da, barcha o'yinlar uchun. */
function GamesTab({ data, update, goSets, goHistory }) {
  const [, refresh] = useState(0);
  const played = (id) => data.history.filter((h) => gameIdOfResult(h) === id).length;
  const s = data.settings;
  const set = (patch) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const kb = safeSummary(SOLO_GAMES.kodbuzar);
  const soya = safeSummary(SOLO_GAMES.soya);
  const readySets = data.sets.filter((x) => playableQuestions(x).length).length;

  return (
    <>
      <h2>O‘yinlar</h2>
      <p className="note">Har bir o‘yinning o‘z sozlamalari va natijalari. Ovoz va animatsiyalar “Umumiy” bo‘limida — barcha o‘yinlar uchun.</p>
      <div className="settings-grid">
        <div className="panel">
          <h3>Kodbuzar</h3>
          <p className="note">★ {kb.stars} / {kb.max} yulduz. Darajalar va kunlik kod seriyasi shu qurilmada saqlanadi.</p>
          {kb.stars > 0 && (
            <ConfirmButton onConfirm={() => { clearSoloProgress('kodbuzar-v2', ['settings', 'seenIntro']); refresh((n) => n + 1); }}>↺ Natijalarni tozalash</ConfirmButton>
          )}
        </div>
        <div className="panel">
          <h3>Soya</h3>
          <p className="note">★ {soya.stars} / {soya.max} yulduz. Har daraja uchun eng yaxshi vaqt va soyalar soni saqlanadi.</p>
          {soya.stars > 0 && (
            <ConfirmButton onConfirm={() => { clearSoloProgress('soya-save-v1', ['sound', 'music']); reloadSoyaSave(); refresh((n) => n + 1); }}>↺ Natijalarni tozalash</ConfirmButton>
          )}
        </div>
        {gamesOfFamily('robot').map(({ id, ...g }) => {
          const solved = ladderSolved(data.robot);
          const part = (p) => g.levels.filter((st, i) => st.part === p && ladderStars(data.robot, i)).length;
          return (
            <div key={id} className="panel">
              <h3>{g.title}</h3>
              <p className="note">
                Mashqda yechilgan: {solved} / {g.levels.length} daraja ({ROBOT_PARTS.map((p) => `${ROBOT_GAMES[p].part}: ${part(p)}/${ROBOT_GAMES[p].levels.length}`).join(', ')}).
                Jamoaviy o‘yin sozlamalari o‘yin boshlanishida tanlanadi.
              </p>
              <div className="row-buttons">
                <button className="btn" onClick={() => goHistory(id)}>Natijalar ({played(id)})</button>
                {solved > 0 && (
                  <ConfirmButton onConfirm={() => update((d) => ({ ...d, robot: {} }))}>↺ Mashqni tozalash</ConfirmButton>
                )}
              </div>
            </div>
          );
        })}
        <div className="panel">
          <h3>Xazina poygasi</h3>
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
          <p className="note">{readySets} ta tayyor savol to‘plami.</p>
          <div className="row-buttons">
            <button className="btn primary" onClick={goSets}>Savollar</button>
            <button className="btn" onClick={() => goHistory('race')}>Natijalar ({played('race')})</button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Bitta o'yinning jamoaviy o'yinlar tarixi (game — o'yin ID si). Tozalash ham faqat shu o'yinniki. */
function HistoryTab({ data, update, game }) {
  const mine = (h) => !game || gameIdOfResult(h) === game;
  const list = data.history.filter(mine);
  return (
    <>
      <div className="section-head">
        <h2>{game ? `${GAMES[game]?.title}: natijalar` : 'Natijalar'}</h2>
        {list.length > 0 && (
          <ConfirmButton onConfirm={() => update((d) => ({ ...d, history: d.history.filter((h) => !mine(h)) }))}>🗑 Tarixni tozalash</ConfirmButton>
        )}
      </div>
      {list.length === 0 && <p className="muted">Hali jamoaviy o‘yin o‘ynalmagan.</p>}
      <div className="history-list">
        {list.map((h) => (
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
                  {gameOfResult(h)?.historyLine(t, h)}
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

/** Barcha o'yinlarga tegishli sozlamalar: ovoz, animatsiyalar, xavfsizlik, yangilanish va zaxira. */
function GeneralTab({ data, update, askPin, onRestore, updateStatus }) {
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
      <h2>Umumiy</h2>
      <div className="settings-grid">
        <div className="panel">
          <h3>Barcha o‘yinlar uchun</h3>
          <label className="check">
            <input type="checkbox" checked={s.sound} onChange={(e) => set({ sound: e.target.checked })} /> Ovoz va musiqa
          </label>
          <label className="check">
            <input type="checkbox" checked={s.animations} onChange={(e) => set({ animations: e.target.checked })} /> Animatsiyalar
          </label>
          <p className="note">Kodbuzar, Soya, Robot dasturlash va Xazina poygasiga birdek ta’sir qiladi. Kompyuter yoki doska sekin ishlasa, animatsiyalarni o‘chiring.</p>
        </div>
        <div className="panel">
          <h3>PIN</h3>
          <p className="note">
            {data.pinHash
              ? 'PIN o‘rnatilgan: Sozlamalarni ochish va dasturdan chiqishda har safar ishga tushirilganda bir marta so‘raladi. O‘yinlar PINsiz o‘ynaladi.'
              : 'PIN yo‘q: Sozlamalar hammaga ochiq. PIN yaratsangiz, Sozlamalar va dasturdan chiqish himoyalanadi.'}
          </p>
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
          {isNativeApp ? <AndroidUpdatePanel /> : <UpdatePanel state={updateStatus} version={version} />}
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
