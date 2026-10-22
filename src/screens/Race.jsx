import { useEffect, useMemo, useRef, useState } from 'react';
import { checkInputAnswer, filledItems, filledPairs, shuffle, sleep, uid } from '../lib/util.js';
import { play } from '../lib/sound.js';
import CodeBlock from '../components/CodeBlock.jsx';
import OrderAnswer from '../components/OrderAnswer.jsx';
import MatchAnswer from '../components/MatchAnswer.jsx';

const GEMS = ['◆', '●', '▲', '■'];
const STEP_MS = 550;

// Yo'l "ilon" shaklida: 1-qator chapdan o'ngga, 2-qator o'ngdan chapga va h.k.
// Koordinatalar sahna kengligi/balandligiga nisbatan foizda.
function buildTrack(n) {
  const count = n + 1;
  const rows = count <= 9 ? 2 : 3;
  const perRow = Math.ceil(count / rows);
  const ys = rows === 2 ? [36, 64] : [28, 50, 72];
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const t = perRow === 1 ? 0.5 : col / (perRow - 1);
    return {
      x: 10 + 80 * (row % 2 === 0 ? t : 1 - t),
      y: ys[row] + Math.sin(col * 1.3) * 2.2,
    };
  });
}

function buildSpecials(n) {
  const specials = {};
  for (const [fraction, kind] of [[0.3, 'bonus'], [0.55, 'trap'], [0.8, 'bonus']]) {
    const i = Math.min(n - 1, Math.max(1, Math.round(n * fraction)));
    if (!specials[i]) specials[i] = kind;
  }
  return specials;
}

function prepare(q) {
  if (q.type === 'order') {
    const items = filledItems(q);
    let order = shuffle(items.map((_, i) => i));
    // Aralashtirilgan tartib tasodifan to'g'ri javobning o'zi bo'lib qolmasin.
    for (let t = 0; t < 10 && order.every((v, i) => v === i); t++) order = shuffle(order);
    return { q, items, order };
  }
  if (q.type === 'match') {
    const pairs = filledPairs(q);
    return { q, pairs, rightOrder: shuffle(pairs.map((_, i) => i)) };
  }
  let options = null;
  if (q.type === 'choice') {
    options = shuffle(q.options.map((text, i) => ({ text, correct: i === q.correct })).filter((o) => o.text.trim()));
  } else if (q.type === 'tf') {
    options = [
      { text: '✓ To‘g‘ri', correct: q.correct === 0 },
      { text: '✗ Noto‘g‘ri', correct: q.correct === 1 },
    ];
  }
  return { q, options };
}

export default function Race({ config, askPin, onFinish, onExit }) {
  const N = config.trackLength;
  const track = useMemo(() => buildTrack(N), [N]);
  const specials = useMemo(() => buildSpecials(N), [N]);

  // used — jamoa allaqachon ishlatgan maxsus kataklar. Har bir katak jamoaga bir marta ta'sir qiladi,
  // aks holda girdob oldidagi katakdan qayta-qayta girdobga tushib, jamoa tiqilib qoladi.
  const [teams, setTeamsState] = useState(() => config.teams.map((t) => ({ ...t, pos: 0, correct: 0, wrong: 0, used: [] })));
  // Animatsiya paytida eng so'nggi holatni o'qish uchun ref ham saqlanadi.
  const teamsRef = useRef(teams);
  const setTeams = (fn) => {
    teamsRef.current = fn(teamsRef.current);
    setTeamsState(teamsRef.current);
  };

  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | question | feedback | moving | won
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const deck = useRef({ order: [], i: 0 });
  const mistakes = useRef(new Map());
  const finished = useRef(false);

  const team = teams[turn];

  const drawQuestion = () => {
    const d = deck.current;
    if (d.i >= d.order.length) {
      d.order = shuffle(config.questions.map((_, i) => i));
      d.i = 0;
    }
    return config.questions[d.order[d.i++]];
  };

  const openQuestion = () => {
    if (phase !== 'ready') return;
    play('open');
    setCurrent(prepare(drawQuestion()));
    setResult(null);
    setPhase('question');
  };

  const answer = (correct, extra = {}) => {
    if (phase !== 'question') return;
    setResult({ correct, ...extra });
    setPhase('feedback');
    play(correct ? 'correct' : 'wrong');
    setTeams((ts) =>
      ts.map((t, i) => (i === turn ? { ...t, correct: t.correct + (correct ? 1 : 0), wrong: t.wrong + (correct ? 0 : 1) } : t)),
    );
    if (!correct) {
      const key = current.q.text || current.q.code;
      mistakes.current.set(key, (mistakes.current.get(key) || 0) + 1);
    }
  };

  const step = async (idx, dir) => {
    setTeams((ts) => ts.map((t, i) => (i === idx ? { ...t, pos: Math.max(0, Math.min(N, t.pos + dir)) } : t)));
    play('step');
    await sleep(STEP_MS);
    return teamsRef.current[idx].pos;
  };

  const proceed = async () => {
    if (phase !== 'feedback') return;
    if (result.correct) {
      setPhase('moving');
      let pos = await step(turn, 1);
      const special = specials[pos];
      if (pos < N && special && !teamsRef.current[turn].used.includes(pos)) {
        setTeams((ts) => ts.map((t, i) => (i === turn ? { ...t, used: [...t.used, pos] } : t)));
        setToast(special === 'bonus' ? '⭐ Bonus! Yana +1 qadam' : '🌀 Girdob! 1 qadam orqaga');
        play(special);
        await sleep(1200);
        pos = await step(turn, special === 'bonus' ? 1 : -1);
        setToast(null);
      }
      if (pos >= N) {
        setPhase('won');
        play('win');
        return;
      }
    }
    setTurn((t) => (t + 1) % teamsRef.current.length);
    setPhase('ready');
  };

  const finish = (winnerName) => {
    if (finished.current) return;
    finished.current = true;
    const hard = [...mistakes.current]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([text, wrong]) => ({ text, wrong }));
    onFinish({
      id: uid(),
      date: new Date().toISOString(),
      setName: config.setName,
      trackLength: N,
      winner: winnerName,
      teams: teamsRef.current.map(({ name, color, hero, pos, correct, wrong }) => ({ name, color, hero, pos, correct, wrong })),
      hard,
    });
  };

  const finishEarly = () => {
    const ranked = [...teamsRef.current].sort((a, b) => b.pos - a.pos || b.correct - a.correct);
    const leader = ranked[0];
    const tie = ranked[1] && ranked[1].pos === leader.pos && ranked[1].correct === leader.correct;
    finish(leader.pos > 0 && !tie ? leader.name : null);
  };

  const openMenu = () => {
    setPaused(true);
    askPin('O‘yinni boshqarish', () => setMenu(true), () => setPaused(false));
  };

  const closeMenu = () => {
    setMenu(false);
    setPaused(false);
  };

  const spread = (i) => (i - (teams.length - 1) / 2) * 2.4;

  return (
    <div className="race-wrap">
      <div className="stage">
        <svg className="board-svg" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3f9a72" />
              <stop offset="1" stopColor="#286b58" />
            </linearGradient>
          </defs>
          <rect x="5" y="17.5" width="150" height="62" rx="20" fill="#1a4f4a" transform="translate(0 2.2)" />
          <rect x="5" y="17.5" width="150" height="62" rx="20" fill="#e9d59a" />
          <rect x="7" y="19" width="146" height="58" rx="18" fill="url(#land)" />
          <polyline
            points={track.map((p) => `${p.x * 1.6},${p.y * 0.9}`).join(' ')}
            fill="none"
            stroke="#1d5546"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={track.map((p) => `${p.x * 1.6},${p.y * 0.9}`).join(' ')}
            fill="none"
            stroke="#f5e3a8"
            strokeWidth="1.1"
            strokeDasharray="2 1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Bezaklar qatorlar orasidagi bo'sh joyga va dengizga qo'yiladi, yo'lni to'smasligi uchun. */}
        <span className="deco" style={{ left: '30%', top: N + 1 <= 9 ? '50%' : '39%' }}>⛰️</span>
        <span className="deco small" style={{ left: '52%', top: N + 1 <= 9 ? '50%' : '39%' }}>🌴</span>
        <span className="deco" style={{ left: '68%', top: N + 1 <= 9 ? '50%' : '61%' }}>🌋</span>
        <span className="deco small" style={{ left: '44%', top: N + 1 <= 9 ? '50%' : '61%' }}>🌲</span>
        <span className="deco small sea" style={{ left: '5%', top: '92%' }}>🐬</span>
        <span className="deco sea" style={{ left: '15%', top: '91%' }}>🏝️</span>
        <span className="deco small sea" style={{ left: '86%', top: '91%' }}>⛵</span>
        <span className="deco small sea" style={{ left: '95%', top: '93%' }}>🐙</span>

        {track.map((p, i) => {
          const special = specials[i];
          const isEnd = i === N;
          return (
            <div
              key={i}
              className={`node ${i === 0 ? 'start' : ''} ${isEnd ? 'end' : ''} ${special ?? ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {i === 0 ? '🚩' : isEnd ? '💰' : special === 'bonus' ? '⭐' : special === 'trap' ? '🌀' : i}
            </div>
          );
        })}

        {teams.map((t, i) => {
          const p = track[t.pos];
          return (
            <div
              key={t.id}
              className={`token ${i === turn && phase !== 'won' ? 'active' : ''}`}
              style={{ left: `${p.x + spread(i)}%`, top: `${p.y}%`, '--team': t.color }}
            >
              <span>
                <i>{t.hero}</i>
              </span>
            </div>
          );
        })}

        <div className="hud">
          {teams.map((t, i) => (
            <div key={t.id} className={`score ${i === turn ? 'current' : ''}`} style={{ '--team': t.color }}>
              <span className="score-hero">{t.hero}</span>
              <div>
                <b>{t.name}</b>
                <small>
                  {t.pos}/{N} qadam · ✓{t.correct}
                </small>
              </div>
            </div>
          ))}
          <span className="spacer" />
          <button className="hud-btn" onClick={openMenu} title="O‘yinni boshqarish (PIN)">
            ⏸
          </button>
        </div>

        {(phase === 'ready' || phase === 'moving') && (
          <div className="turn-panel" style={{ '--team': team.color }}>
            <span className="turn-hero">{team.hero}</span>
            <div className="turn-text">
              <b>{team.name} navbati!</b>
              <small>{phase === 'ready' ? 'Bitta o‘quvchi doskaga chiqsin' : 'Qahramon yo‘lda…'}</small>
            </div>
            {phase === 'ready' && (
              <button className="btn primary huge" onClick={openQuestion}>
                Savolni ochish ▶
              </button>
            )}
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}

        {(phase === 'question' || phase === 'feedback') && current && (
          <QuestionCard
            key={current.q.id + turn}
            item={current}
            team={team}
            time={config.time}
            paused={paused}
            phase={phase}
            result={result}
            onAnswer={answer}
            onContinue={proceed}
          />
        )}

        {phase === 'won' && (
          <div className="overlay win-overlay">
            <Confetti />
            <div className="win-card" style={{ '--team': team.color }}>
              <div className="win-hero">{team.hero}</div>
              <h1>{team.name} xazinani topdi!</h1>
              <p>🏆 Tabriklaymiz, g‘oliblar!</p>
              <button className="btn gold huge" onClick={() => finish(team.name)}>
                Natijalarni ko‘rish
              </button>
            </div>
          </div>
        )}

        {menu && (
          <div className="overlay">
            <div className="menu-card">
              <h2>⏸ O‘yin to‘xtatildi</h2>
              <button className="btn primary big full" onClick={closeMenu}>
                ▶ Davom etish
              </button>
              <button className="btn gold big full" onClick={finishEarly}>
                🏁 O‘yinni yakunlash va natijalar
              </button>
              <button className="btn big full" onClick={onExit}>
                ← O‘qituvchi paneliga chiqish (natija saqlanmaydi)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ item, team, time, paused, phase, result, onAnswer, onContinue }) {
  const { q, options } = item;
  const [left, setLeft] = useState(time);
  const [value, setValue] = useState('');
  const answerRef = useRef(onAnswer);
  answerRef.current = onAnswer;

  useEffect(() => {
    if (!time || phase !== 'question' || paused) return;
    if (left <= 0) {
      answerRef.current(false, { timeout: true });
      return;
    }
    const t = setTimeout(() => {
      setLeft((l) => l - 1);
      if (left <= 6) play('tick');
    }, 1000);
    return () => clearTimeout(t);
  }, [left, phase, paused, time]);

  const answered = phase === 'feedback';

  const tileClass = (opt, i) => {
    if (!answered) return '';
    if (opt.correct) return 'right';
    if (result.chosen === i) return 'wrong';
    return 'dim';
  };

  let feedback = null;
  if (answered) {
    if (result.correct) feedback = '✅ To‘g‘ri! Jamoa 1 qadam oldinga yuradi';
    else if (result.timeout) feedback = '⏰ Vaqt tugadi! Navbat keyingi jamoaga o‘tadi';
    else feedback = '❌ Noto‘g‘ri. Navbat keyingi jamoaga o‘tadi';
  }

  return (
    <div className="overlay">
      <div className="question-card" style={{ '--team': team.color }}>
        <div className="q-top">
          <span className="q-team">
            {team.hero} {team.name} javob beryapti
          </span>
          {time > 0 && (
            <span className={`q-timer ${left <= 5 && !answered ? 'urgent' : ''}`}>⏱ {Math.max(0, left)} s</span>
          )}
        </div>
        {time > 0 && (
          <div className="time-track">
            <i style={{ width: `${(Math.max(0, left) / time) * 100}%` }} />
          </div>
        )}

        <div className="q-body">
          <div className="q-main">
            {q.text && <h2 className="q-text">{q.text}</h2>}
            <CodeBlock code={q.code} lang={q.lang} />
          </div>
          {q.image && <img className="q-image" src={q.image} alt="" />}
        </div>

        {options ? (
          <div className={`answers ${options.length <= 2 ? 'two' : ''}`}>
            {options.map((opt, i) => (
              <button
                key={i}
                className={`answer a${i} ${tileClass(opt, i)}`}
                disabled={answered}
                onClick={() => onAnswer(opt.correct, { chosen: i })}
              >
                {q.type === 'choice' && <span className="gem">{GEMS[i]}</span>}
                <span className="answer-text">{opt.text}</span>
              </button>
            ))}
          </div>
        ) : q.type === 'order' ? (
          <OrderAnswer items={item.items} order={item.order} answered={answered} result={result} onAnswer={onAnswer} />
        ) : q.type === 'match' ? (
          <MatchAnswer pairs={item.pairs} rightOrder={item.rightOrder} answered={answered} result={result} onAnswer={onAnswer} />
        ) : (
          <div className="input-answer">
            <div className="input-left">
              <div className={`answer-display ${answered ? (result.correct ? 'right' : 'wrong') : ''}`}>
                {value || <span className="placeholder">Javobingiz…</span>}
              </div>
              {answered && !result.correct && (
                <div className="correct-answer">To‘g‘ri javob: {q.answer.split(';')[0].trim()}</div>
              )}
              {!answered && (
                <button
                  className="btn primary huge"
                  disabled={!value}
                  onClick={() => onAnswer(checkInputAnswer(q, value), { value })}
                >
                  Javob berish ✓
                </button>
              )}
            </div>
            {!answered && <Keypad hex={q.keypad === 'hex'} value={value} onChange={setValue} />}
          </div>
        )}

        {answered && (
          <div className={`feedback ${result.correct ? 'good' : 'bad'}`}>
            <div className="feedback-text">
              <b>{feedback}</b>
              {q.explanation && <span className="explanation">💡 {q.explanation}</span>}
            </div>
            <button className="btn primary huge" onClick={onContinue}>
              Davom etish ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Keypad({ hex, value, onChange }) {
  const type = (key) => {
    play('tap');
    if (value.length < 16) onChange(value + key);
  };
  const keys = [...(hex ? ['A', 'B', 'C', 'D', 'E', 'F'] : []), '7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', '.'];
  return (
    <div className="keypad-wrap">
      <div className={`keypad ${hex ? 'hex' : ''}`}>
        {keys.map((k) => (
          <button key={k} className={`key ${/[A-F]/.test(k) ? 'letter' : ''}`} onClick={() => type(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="keypad-side">
        <button className="key action" onClick={() => (play('tap'), onChange(value.slice(0, -1)))}>
          ⌫
        </button>
        <button className="key action" onClick={() => (play('tap'), onChange(''))}>
          Tozalash
        </button>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 2.5 + Math.random() * 2.5,
        icon: ['🎉', '✨', '💰', '⭐', '🪙', '🎊'][i % 6],
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.id} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}>
          {p.icon}
        </span>
      ))}
    </div>
  );
}
