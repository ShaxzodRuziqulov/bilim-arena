import { useEffect, useMemo, useRef, useState } from 'react';
import { evaluate, keyStates, pickHintPosition, validateGuess } from '../game/logic.js';
import { starsFor } from '../game/levels.js';
import { sfx } from '../game/sound.js';
import Mascot, { Coach } from '../components/Mascot.jsx';
import { Confetti } from '../components/Effects.jsx';

// Qayd belgilari (klassik rejim): 0 — noma'lum, 1 — kodda yo'q, 2 — kodda bor.
const NOTE_NEXT = { 0: 1, 1: 2, 2: 0 };
const FLIP_STEP = 0.14; // har katak ochilishi orasidagi soniya

const emptySlots = (length, locked) => Array.from({ length }, (_, i) => locked[i] || '');

export default function Game({ cfg, title, secret, initialGuesses = [], helper, onToggleHelper, bestStars = 0, daily = false,
  tutorial = false, onBack, onFinish, onGuess, onNext, onRetry }) {
  const colour = cfg.mode === 'color';
  const [guesses, setGuesses] = useState(initialGuesses);
  const [locked, setLocked] = useState({}); // maslahat bilan ochilgan kataklar: { pozitsiya: raqam }
  const [slots, setSlots] = useState(() => emptySlots(cfg.length, {}));
  const [notes, setNotes] = useState({});
  const [noteMode, setNoteMode] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);
  const [hintMsg, setHintMsg] = useState('');
  const listRef = useRef(null);

  const rows = useMemo(() => evaluate(cfg, secret, guesses), [cfg, secret, guesses]);
  const last = rows[rows.length - 1];
  const status = last?.bulls === cfg.length ? 'won' : rows.length >= cfg.maxAttempts ? 'lost' : 'playing';
  const hintsUsed = Object.keys(locked).length;
  const hintsLeft = Math.max(0, (cfg.hints || 0) - hintsUsed);
  const keys = useMemo(() => (colour ? keyStates(rows) : {}), [colour, rows]);
  const input = slots.join('');
  const filled = slots.filter(Boolean).length;

  // Natija oynasi kataklar ochilib bo'lgach chiqadi (avval saqlangan kunlik o'yinda — darhol).
  const [showResult, setShowResult] = useState(status !== 'playing');
  const reported = useRef(status !== 'playing');
  useEffect(() => {
    if (status === 'playing' || reported.current) return;
    reported.current = true;
    onFinish?.(status === 'won', guesses, hintsUsed);
  }, [status, guesses, hintsUsed, onFinish]);
  // Taymer faqat status'ga bog'liq: onFinish har renderda yangilanib, taymerni bekor qilib qo'ymasligi uchun alohida.
  useEffect(() => {
    if (status === 'playing' || showResult) return;
    const t = setTimeout(() => setShowResult(true), cfg.length * FLIP_STEP * 1000 + 650);
    return () => clearTimeout(t);
  }, [status, showResult, cfg.length]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [rows.length]);

  const fail = (msg) => {
    setError(msg);
    setShake((n) => n + 1);
    sfx.error();
  };

  const press = (ch) => {
    if (status !== 'playing') return;
    if (noteMode) {
      setNotes((n) => ({ ...n, [ch]: NOTE_NEXT[n[ch] || 0] }));
      sfx.tap();
      return;
    }
    setError('');
    setHintMsg('');
    setSlots((s) => {
      if (!cfg.repeats && s.includes(ch)) return s;
      const i = s.findIndex((v) => !v);
      if (i < 0) return s;
      sfx.key();
      const next = [...s];
      next[i] = ch;
      return next;
    });
  };

  const erase = () => {
    setError('');
    setSlots((s) => {
      for (let i = s.length - 1; i >= 0; i--) {
        if (s[i] && !locked[i]) {
          sfx.erase();
          const next = [...s];
          next[i] = '';
          return next;
        }
      }
      return s;
    });
  };

  const submit = () => {
    if (status !== 'playing') return;
    if (filled < cfg.length) return fail(`Yana ${cfg.length - filled} ta raqam tanlang`);
    const problem = validateGuess(cfg, input);
    if (problem) return fail(problem);
    if (guesses.includes(input)) return fail('Bu kodni allaqachon tekshirgansiz');
    const next = [...guesses, input];
    const row = evaluate(cfg, secret, next).at(-1);
    const nextStatus = row.bulls === cfg.length ? 'won' : next.length >= cfg.maxAttempts ? 'lost' : 'playing';
    setGuesses(next);
    setSlots(emptySlots(cfg.length, locked));
    setHintMsg('');
    sfx.reveal(colour ? row.marks : pegs(row, cfg.length), FLIP_STEP);
    if (nextStatus === 'won') sfx.win(cfg.length * FLIP_STEP + 0.15);
    if (nextStatus === 'lost') sfx.lose(cfg.length * FLIP_STEP + 0.15);
    onGuess?.(next, nextStatus);
  };

  const takeHint = () => {
    if (status !== 'playing' || hintsLeft <= 0) return;
    const pos = pickHintPosition(cfg, secret, Object.keys(locked).map(Number), rows);
    if (pos === null) {
      setHintMsg('Barcha joylar allaqachon ma’lum — endi o‘zingiz!');
      return;
    }
    const digit = secret[pos];
    const nextLocked = { ...locked, [pos]: digit };
    setLocked(nextLocked);
    setSlots((s) => {
      // Raqam boshqa joyda terilgan bo'lsa (takrorlanmaydigan darajada), o'sha joydan olib tashlanadi.
      const next = s.map((v, i) => (!cfg.repeats && v === digit && !nextLocked[i] ? '' : v));
      next[pos] = digit;
      return next;
    });
    setHintMsg(`💡 ${pos + 1}-o‘rinda ${digit} raqami turibdi! Men uni joyiga qo‘ydim.`);
    setError('');
    sfx.hint();
  };

  // Klaviaturadan ham o'ynash mumkin.
  const keyHandler = useRef();
  keyHandler.current = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || showResult) return;
    if (cfg.alphabet.includes(e.key)) press(e.key);
    else if (e.key === 'Backspace') erase();
    else if (e.key === 'Enter') submit();
    else if (e.key.toLowerCase() === 'q' && !colour) setNoteMode((m) => !m);
    else if (e.key.toLowerCase() === 'h') takeHint();
    else return;
    e.preventDefault();
  };
  useEffect(() => {
    const h = (e) => keyHandler.current(e);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const coach = coachLine({ cfg, rows, last, status, helper, error, hintMsg, filled, tutorial, colour });
  const cols = cfg.alphabet.length === 10 ? 5 : cfg.alphabet.length === 8 ? 4 : cfg.alphabet.length;

  return (
    <div className="screen game" style={{ '--hue': cfg.hue ?? 260 }}>
      <header className="bar">
        <button className="icon-btn" onClick={onBack} aria-label="Orqaga">←</button>
        <div className="bar-title">
          <b>{title}</b>
          <small>{cfg.about}</small>
        </div>
        <Meter used={rows.length} max={cfg.maxAttempts} />
      </header>

      <Coach mood={coach.mood} text={coach.text} size={72} />

      <main className="board">
        <div className="legend">
          {colour ? (
            <>
              <span><i className="sw bull" />joyida</span>
              <span><i className="sw cow" />bor, joyi boshqa</span>
              <span><i className="sw miss" />yo‘q</span>
            </>
          ) : (
            <>
              <span><i className="peg bull" />joyida</span>
              <span><i className="peg cow" />bor, joyi boshqa</span>
            </>
          )}
          <span className="legend-par">★★★ ≤ {cfg.par}</span>
          <button className={`chip ${helper ? 'on' : ''}`} onClick={onToggleHelper} aria-pressed={helper} title="Nechta variant qolganini ko‘rsatadi">🧠</button>
        </div>
        <ol className="rows" ref={listRef}>
          {rows.map((r, i) => (
            <li key={`g${i}`} className={`row ${helper && r.contradicts ? 'contradicts' : ''}`}>
              <span className="idx">{i + 1}</span>
              <span className="tiles">
                {[...r.guess].map((ch, k) => (
                  <span key={k} className={`tile flip ${colour ? `m-${r.marks[k]}` : `filled ${notes[ch] ? `note-${notes[ch]}` : ''}`}`}
                    style={{ animationDelay: `${k * FLIP_STEP}s` }}>
                    {ch}
                  </span>
                ))}
              </span>
              {colour ? <span /> : <Pegs row={r} length={cfg.length} />}
              {helper && <span className="remain" title="Mos keladigan variantlar">{r.contradicts ? '⚠' : r.remaining.toLocaleString('uz')}</span>}
            </li>
          ))}
          {status === 'playing' && (
            <li key="current" className="row current">
              <span className="idx">{rows.length + 1}</span>
              <span className={`tiles ${shake ? 'shake' : ''}`} key={`s${shake}`}>
                {slots.map((ch, i) => (
                  <span key={i} className={`tile ${ch ? 'filled pop' : ''} ${locked[i] ? 'locked' : ''} ${!ch && i === slots.indexOf('') ? 'cursor' : ''}`}>
                    {ch}
                  </span>
                ))}
              </span>
              <span />
              {helper && <span className="remain" />}
            </li>
          )}
        </ol>
      </main>

      <section className={`keypad ${noteMode ? 'note-mode' : ''}`}>
        <div className="keys" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...cfg.alphabet].map((ch) => {
            const used = !cfg.repeats && slots.includes(ch);
            const state = colour ? keys[ch] : null;
            return (
              <button key={ch} className={`key ${state ? `ks-${state}` : `note-${notes[ch] || 0}`} ${used ? 'used' : ''}`}
                onClick={() => press(ch)} disabled={status !== 'playing'}
                aria-label={`${ch}${state === 'miss' || notes[ch] === 1 ? ', kodda yo‘q' : state === 'bull' ? ', joyida bo‘lgan' : state === 'cow' || notes[ch] === 2 ? ', kodda bor' : ''}`}>
                {ch}
              </button>
            );
          })}
        </div>
        <div className={`actions ${colour ? 'no-notes' : ''}`}>
          {!colour && (
            <button className={`btn ${noteMode ? 'note-active' : ''}`} onClick={() => setNoteMode((m) => !m)} aria-pressed={noteMode}
              title="Raqamlarni “yo‘q” yoki “bor” deb belgilash (Q)">✎</button>
          )}
          <button className="btn hint-btn" onClick={takeHint} disabled={!hintsLeft || status !== 'playing'} title="Bitta raqamni ochib beradi (H)">
            💡<span className="badge">{hintsLeft}</span>
          </button>
          <button className="btn" onClick={erase} disabled={!filled || status !== 'playing'} aria-label="O‘chirish">⌫</button>
          <button className={`btn primary ${filled === cfg.length ? 'ready' : ''}`} onClick={submit} disabled={status !== 'playing'}>Tekshirish</button>
        </div>
        {noteMode && <p className="note-help">Qayd: raqamni bosing — <s>yo‘q</s> → <b>bor</b> → belgisiz. Terish uchun ✎ ni o‘chiring.</p>}
      </section>

      {showResult && status !== 'playing' && (
        <Result won={status === 'won'} cfg={cfg} secret={secret} attempts={rows.length} hintsUsed={hintsUsed} bestStars={bestStars}
          daily={daily} onNext={onNext} onRetry={onRetry} onBack={onBack} />
      )}
    </div>
  );
}

/** Klassik rejim javobi: avval yashil (joyida), keyin sariq (bor), qolgani bo'sh. */
function pegs(row, length) {
  return Array.from({ length }, (_, i) => (i < row.bulls ? 'bull' : i < row.bulls + row.cows ? 'cow' : 'miss'));
}

function Pegs({ row, length }) {
  return (
    <span className={`pegs n${length}`} aria-label={`${row.bulls} ta joyida, ${row.cows} ta bor`}>
      {pegs(row, length).map((p, i) => (
        <i key={i} className={`peg ${p}`} style={{ animationDelay: `${i * FLIP_STEP}s` }} />
      ))}
      <b className="peg-count"><span className="c-bull">{row.bulls}</span>·<span className="c-cow">{row.cows}</span></b>
    </span>
  );
}

function Meter({ used, max }) {
  return (
    <span className="meter" title={`Urinishlar: ${used}/${max}`} aria-label={`${max - used} ta urinish qoldi`}>
      <b>{max - used}</b>
      <span className="meter-bar"><span style={{ width: `${((max - used) / max) * 100}%` }} /></span>
    </span>
  );
}

const list = (arr) => arr.map((d) => `«${d}»`).join(', ');

/** Kalitjon nima deydi va qanday kayfiyatda bo'ladi. */
function coachLine({ cfg, rows, last, status, helper, error, hintMsg, filled, tutorial, colour }) {
  const left = cfg.maxAttempts - rows.length;
  if (status === 'won') return { mood: 'party', text: 'Seyf ochildi! Siz haqiqiy kodbuzarsiz! 🎉' };
  if (status === 'lost') return { mood: 'sad', text: 'Eh, urinishlar tugadi… Hechqisi yo‘q, keyingisida albatta topamiz!' };
  if (error) return { mood: 'wow', text: error };
  if (hintMsg) return { mood: 'happy', text: hintMsg };

  if (!last) {
    if (tutorial) {
      if (filled === 0) return { mood: 'happy', text: `Salom! Men Kalitjonman. Bu seyfda ${cfg.length} xonali kod bor, raqamlar 1 dan ${cfg.alphabet.at(-1)} gacha. Pastdagi raqamlarni bosing!` };
      if (filled < cfg.length) return { mood: 'idle', text: 'Zo‘r! Yana bitta raqam tanlang.' };
      return { mood: 'happy', text: 'Endi «Tekshirish» tugmasini bosing — kataklar rangiga qarang!' };
    }
    if (colour) return { mood: 'idle', text: 'Istalgan raqamlar bilan boshlang — ranglar qolganini aytib beradi.' };
    if (cfg.id === 'd3' || tutorial) return { mood: 'think', text: 'Endi ranglar yo‘q! 🟢 — nechta raqam joyida, 🟡 — nechtasi bor, lekin joyi boshqa. Qaysi biri ekanini o‘zingiz topasiz.' };
    return { mood: 'idle', text: 'Har xil raqamlar bilan boshlang — ko‘proq ma’lumot olasiz.' };
  }

  let mood = 'think';
  let text;
  if (helper && last.contradicts) {
    mood = 'wow';
    text = 'Hmm, bu taxmin oldingi javoblarga to‘g‘ri kelmaydi. Har taxminni oldingilari bilan solishtiring.';
  } else if (colour) {
    const bulls = [];
    const cows = [];
    const misses = [];
    last.marks.forEach((m, i) => (m === 'bull' ? bulls : m === 'cow' ? cows : misses).push(last.guess[i]));
    const parts = [];
    if (bulls.length) parts.push(`${list(bulls)} o‘z joyida`);
    if (cows.length) parts.push(`${list(cows)} bor, lekin boshqa joyda`);
    if (misses.length) parts.push(`${list(misses)} kodda yo‘q`);
    text = parts.join('; ') + '.';
    mood = bulls.length ? 'happy' : cows.length ? 'think' : 'wow';
    if (rows.length === 1 && cfg.id === 'd1') text += ' 🟩 yashil — joyida, 🟨 sariq — boshqa joyda, ⬛ kulrang — yo‘q.';
  } else if (last.bulls === 0 && last.cows === 0) {
    mood = 'wow';
    text = 'Ajoyib ma’lumot! Bu raqamlarning birortasi ham kodda yo‘q. ✎ bilan ularni belgilab qo‘ying.';
  } else if (last.bulls + last.cows === cfg.length) {
    mood = 'happy';
    text = 'Hamma raqamlar topildi! Endi faqat joylarini to‘g‘rilash qoldi.';
  } else {
    mood = last.bulls ? 'happy' : 'think';
    text = `${last.bulls} ta joyida, ${last.cows} ta bor. Bitta raqamni almashtirib ko‘ring — javob qanday o‘zgaradi?`;
  }
  if (helper && !last.contradicts) {
    if (last.remaining === 1) {
      mood = 'happy';
      text = 'Faqat bitta variant qoldi — siz uni topa olasiz!';
    } else text += ` (${last.remaining.toLocaleString('uz')} ta variant qoldi)`;
  }
  if (left <= 2) text += ` Diqqat: ${left} ta urinish qoldi!`;
  return { mood, text };
}

function Result({ won, cfg, secret, attempts, hintsUsed, bestStars, daily, onNext, onRetry, onBack }) {
  const stars = won ? starsFor(cfg, attempts, hintsUsed) : 0;
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="result-title">
      {won && <Confetti />}
      <div className={`result ${won ? 'won' : 'lost'}`}>
        <div className="vault">
          <div className="vault-inside">
            <div className="treasure">{[...secret].map((ch, i) => <span key={i} className="tile gold" style={{ animationDelay: `${0.9 + i * 0.1}s` }}>{ch}</span>)}</div>
            {won && <div className="coins" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>}
          </div>
          <div className="vault-door">
            <span className="dial"><span /></span>
            <span className="bolt b1" /><span className="bolt b2" /><span className="bolt b3" /><span className="bolt b4" />
          </div>
        </div>
        <div className="result-mascot"><Mascot mood={won ? 'party' : 'sad'} size={76} /></div>
        {won ? (
          <>
            <h2 id="result-title">Kod buzildi!</h2>
            {!daily && (
              <div className="stars" aria-label={`${stars} yulduz`}>
                {[1, 2, 3].map((n) => <span key={n} className={n <= stars ? 'on' : ''} style={{ animationDelay: `${0.8 + n * 0.25}s` }}>★</span>)}
              </div>
            )}
            <p>{attempts} ta urinishda topdingiz{hintsUsed ? `, ${hintsUsed} ta maslahat bilan` : ''}.</p>
            {!daily && stars < 3 && <p className="muted">3 yulduz uchun: {cfg.par} ta urinishgacha{hintsUsed ? ' va maslahatsiz' : ''}.</p>}
            {!daily && bestStars > stars && <p className="muted">Eng yaxshi natijangiz saqlanib qoladi: {'★'.repeat(bestStars)}</p>}
          </>
        ) : (
          <>
            <h2 id="result-title">Seyf yopiq qoldi</h2>
            <p>Yashirin kod shu edi: <b className="code">{secret}</b></p>
            <p className="muted">Qayta urinsangiz — yangi kod bo‘ladi.</p>
          </>
        )}
        {daily && <p className="muted">Ertaga yangi kunlik kod chiqadi.</p>}
        <div className="result-actions">
          {daily ? (
            <button className="btn primary" onClick={onBack}>Bosh sahifa</button>
          ) : (
            <>
              {won && onNext && <button className="btn primary big" onClick={onNext}>Keyingi seyf →</button>}
              <button className={`btn ${won ? '' : 'primary big'}`} onClick={onRetry}>↻ {won ? 'Yangi kod bilan qayta' : 'Qayta urinish'}</button>
              <button className="btn ghost" onClick={onBack}>Xarita</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
