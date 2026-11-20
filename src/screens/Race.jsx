import { useEffect, useMemo, useRef, useState } from 'react';
import { checkInputAnswer, filledItems, filledPairs, shuffle, sleep, uid } from '../lib/util.js';
import { play } from '../lib/sound.js';
import CodeBlock from '../components/CodeBlock.jsx';
import OrderAnswer from '../components/OrderAnswer.jsx';
import MatchAnswer from '../components/MatchAnswer.jsx';

import {
  BRIDGE_JUMP,
  AWARDS,
  CLASSIC_MECH,
  MAX_HEARTS,
  POWER_TIME,
  STREAK_BONUS_AT,
  answerSteps,
  buildSpecials,
  canRebound,
  fiftyFifty,
  isFastAnswer,
  isSolo,
  placeOf,
  questionTime,
  raceWinner,
  roundFinished,
  questionsFingerprint,
  seededRandom,
  seededShuffle,
  soloStars,
  teamAwards,
} from '../lib/race-rules.js';
import { dailyStorage, saveDaily } from '../lib/race-daily.js';
import { useLandscape } from '../lib/platform.js';
import { bestBridge, buildTrack } from '../lib/race-track.js';
import { setRaceMusicLevel, startRaceMusic, stopRaceMusic } from '../lib/race-music.js';
import RaceScenery from '../components/RaceScenery.jsx';
import '../race-board.css';

const GEMS = ['◆', '●', '▲', '■'];
const STEP_MS = 550;
const MUSIC_KEY = 'bilim-arena-race-music';

const reducedMotion = () =>
  document.documentElement.classList.contains('reduce-motion') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function readMusicPref() {
  try {
    return localStorage.getItem(MUSIC_KEY) !== 'off';
  } catch {
    return true;
  }
}

// Maxsus kataklar belgilari va xabarlari.
const CELL_ICON = { bonus: '⭐', trap: '🌀', chest: '🎁', lightning: '⚡', bridge: '🌉' };

// Xazina sandig'i: kimdir yetib kelganda qopqog'i ochilib, tangalar sochiladi.
function Chest({ open }) {
  return (
    <svg className={`chest ${open ? 'open' : ''}`} viewBox="-30 -34 60 56" aria-hidden="true">
      <ellipse cx="0" cy="18" rx="24" ry="4" fill="#0004" />
      <g className="chest-coins">
        {[-12, -4, 4, 12].map((x, i) => (
          <circle key={x} cx={x} cy="-6" r="4.5" fill="#ffd84d" stroke="#b7791f" strokeWidth="1.5" style={{ '--i': i }} />
        ))}
      </g>
      <rect x="-22" y="-6" width="44" height="22" rx="3" fill="#a0581d" stroke="#5a2e0c" strokeWidth="2" />
      <rect x="-22" y="1" width="44" height="4" fill="#d4a04a" />
      <g className="chest-lid">
        <path d="M-22 -6 q22 -22 44 0 z" fill="#c26b25" stroke="#5a2e0c" strokeWidth="2" />
        <path d="M-4 -12 h8 v8 h-8z" fill="#ffd84d" stroke="#8a5a00" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// G'alaba marosimi: taxta ustida shohsupa (qahramonlar 3 → 2 → 1 tartibida sakrab chiqadi), keyin nominatsiyalar.
// Har jamoa kamida bitta nominatsiya oladi — sinfda hech kim "bo'sh qo'l" qolmaydi.
function Ceremony({ teams, onDone }) {
  const ranked = teams.map((t, i) => ({ ...t, i, place: placeOf(teams, t) })).sort((a, b) => a.place - b.place || a.i - b.i);
  const top = ranked.filter((t) => t.place <= 3);
  // Shohsupada 1-o'rin o'rtada: 2 — 1 — 3 (teng o'rinlilar yonma-yon).
  const stage = top.length >= 3 ? [top[1], top[0], ...top.slice(2)] : top;
  const rest = ranked.filter((t) => t.place > 3);
  const awards = teamAwards(teams);
  const winner = raceWinner(teams);
  // Qahramonlar pastki o'rindan boshlab chiqadi; nominatsiyalar shohsupadan keyin.
  const dropDelay = (t) => 0.3 + (Math.max(...top.map((x) => x.place)) - t.place) * 0.55;
  const awardsDelay = 0.3 + top.length * 0.55 + 0.3;
  return (
    <div className="overlay win-overlay ceremony">
      <div className="win-rays" aria-hidden="true" />
      <Confetti />
      <div className="ceremony-card">
        <h1>{winner ? `🏆 ${winner} g‘olib!` : '🤝 Durang!'}</h1>
        <div className="ceremony-podium">
          {stage.map((t) => (
            <div key={t.id} className={`cp-col place-${t.place}`} style={{ '--team': t.color, '--d': `${dropDelay(t)}s` }}>
              <div className="cp-hero">
                {t.place === 1 && <em className="cp-crown">👑</em>}
                <span>{t.hero}</span>
              </div>
              <b className="cp-name">{t.name}</b>
              <small className="cp-stats">{t.pos} qadam · ✓{t.correct}{t.coins ? ` · 🪙${t.coins}` : ''}</small>
              <div className="cp-block">{t.place}</div>
            </div>
          ))}
        </div>
        {rest.length > 0 && (
          <p className="cp-rest">
            {rest.map((t) => `${t.place}. ${t.hero} ${t.name}`).join(' · ')}
          </p>
        )}
        <div className="cp-awards">
          {teams.map((t, i) =>
            awards[i].map((id, k) => (
              <div key={`${t.id}-${id}`} className="cp-award" style={{ '--team': t.color, '--d': `${awardsDelay + (i * 2 + k) * 0.18}s` }}>
                <span>{AWARDS[id].icon}</span>
                <div>
                  <b>{AWARDS[id].title}</b>
                  <small>{t.hero} {t.name}</small>
                </div>
              </div>
            )),
          )}
        </div>
        <button className="btn gold huge cp-done" style={{ '--d': `${awardsDelay + 0.6}s` }} onClick={onDone}>
          Natijalarni ko‘rish
        </button>
      </div>
    </div>
  );
}

// Kunlik sarguzasht natijasi: rekord va ketma-ket kunlar.
function DailyNote({ daily }) {
  if (!daily) return null;
  return (
    <p className={`daily-note ${daily.record ? 'record' : ''}`}>
      🗓 {daily.first ? 'Bugungi birinchi natija saqlandi' : daily.record ? 'Bugungi rekord!' : `Bugungi rekord: ${'★'.repeat(daily.best.stars) || '—'} · ${daily.best.pos} qadam`}
      {daily.streak > 1 && <> · 🔥 {daily.streak} kun ketma-ket</>}
    </p>
  );
}

// Nominatsiyalar ro'yxati natijaga yozish uchun: [{ team, id }].
const awardsList = (teams) => teamAwards(teams).flatMap((ids, i) => ids.map((id) => ({ team: teams[i].name, id })));

// Hisob panelidagi holat belgilari: tangalar, seriya, qalqon, chaqmoq va qolgan kuchaytirgichlar.
function ScoreChips({ team, mech }) {
  const chips = [];
  if (team.hearts != null) {
    chips.push(
      <span key="hp" className="chip-hearts" title={`${team.hearts} ta jon`}>
        {Array.from({ length: MAX_HEARTS }, (_, i) => (i < team.hearts ? '❤️' : '🖤')).join('')}
      </span>,
    );
  }
  if (mech.rebound || team.coins > 0) chips.push(<span key="c" title="Tangalar">🪙{team.coins}</span>);
  if (mech.streak && team.streak > 0) chips.push(<span key="s" className="chip-streak" title="Ketma-ket to‘g‘ri javoblar">🔥{team.streak}</span>);
  if (team.shield) chips.push(<span key="h" title="Qalqon: keyingi girdob ta’sir qilmaydi">🛡</span>);
  if (team.lightning) chips.push(<span key="l" title="Keyingi savol — chaqmoq">⚡</span>);
  if (mech.powers) {
    chips.push(<span key="f" className={team.powers.fifty ? '' : 'used'} title="50/50">½</span>);
    if (team.powers.time !== undefined) chips.push(<span key="t" className={team.powers.time ? '' : 'used'} title="+15 soniya">⏱</span>);
  }
  return chips.length ? <span className="score-chips">{chips}</span> : null;
}

// Ko'prik: ikki katak orasida arqonli taxta yo'lak (sahna bilan birga cho'ziladi).
function Bridge({ from, to }) {
  const [x1, y1, x2, y2] = [from.x * 16, from.y * 9, to.x * 16, to.y * 9];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const planks = [];
  for (let d = 34; d < len - 30; d += 20) planks.push(d);
  return (
    <svg className="board-svg bridge-svg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
      <g transform={`translate(${x1} ${y1}) rotate(${angle})`}>
        <rect x="24" y="-20" width={len - 48} height="40" fill="#0003" transform="translate(0 8)" />
        {planks.map((d) => (
          <rect key={d} x={d} y="-17" width="13" height="34" rx="2" fill="#a8743f" stroke="#5d3b1c" strokeWidth="2" />
        ))}
        <path d={`M24 -19 Q${len / 2} -8 ${len - 24} -19 M24 19 Q${len / 2} 30 ${len - 24} 19`} stroke="#5d3b1c" strokeWidth="4" fill="none" />
      </g>
    </svg>
  );
}

export function prepare(q) {
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

export default function Race({ config, askPin, onFinish, onExit, exitLabel = 'Sozlamalarga qaytish' }) {
  // Android ilovasida taxta va savollar keng ekranda: ekran o'zi yon tomonga o'tadi.
  useLandscape();
  const N = config.trackLength;
  // Yakka rejim: bitta o'yinchi savollarga ketma-ket javob beradi, xazinaga yetganda aniqlik bo'yicha yulduz oladi.
  const solo = isSolo(config.teams);
  const board = useMemo(() => buildTrack(N), [N]);
  const track = board.nodes;
  // Qo'shimcha qoidalar (tayyorgarlikda tanlanadi). Eski sozlamalarda yo'q — klassik poyga.
  // Ilib olish faqat jamoalarda, jonlar faqat yakka o'yinda.
  const mech = useMemo(() => ({ ...CLASSIC_MECH, ...(config.mech || {}), ...(solo ? { rebound: false } : { lives: false }) }), [config.mech, solo]);
  const lives = solo && mech.lives;
  // Kunlik sarguzashtda savollar tartibi ham sanaga bog'liq (bugun hamma uchun bir xil).
  const deckRandom = useMemo(() => (config.daily ? seededRandom((config.seed ?? 0) + 1) : Math.random), [config.daily, config.seed]);
  // Kataklar joyi o'yin boshida bir marta aralashtiriladi va hamma jamoa uchun bir xil.
  const specials = useMemo(
    () => buildSpecials(N, { cells: mech.cells, random: seededRandom(config.seed ?? Date.now()), bridgeFrom: bestBridge(board.nodes, BRIDGE_JUMP) }),
    [N, mech.cells, board],
  );
  const bridgeAt = Object.keys(specials).find((k) => specials[k] === 'bridge');
  const tokenEls = useRef([]);
  const [burst, setBurst] = useState(null); // ishga tushgan maxsus katak: { pos, kind, key }
  const [musicOn, setMusicOn] = useState(readMusicPref);

  // used — jamoa allaqachon ishlatgan maxsus kataklar. Har bir katak jamoaga bir marta ta'sir qiladi,
  // aks holda girdob oldidagi katakdan qayta-qayta girdobga tushib, jamoa tiqilib qoladi.
  // streak — ketma-ket to'g'ri javoblar; shield — 🎁 dan olingan qalqon; lightning — keyingi savol chaqmoq;
  // powers — hali ishlatilmagan kuchaytirgichlar; coins — 🪙 (teng natijada g'olibni aniqlaydi).
  const [teams, setTeamsState] = useState(() =>
    config.teams.map((t) => ({
      ...t,
      pos: 0,
      correct: 0,
      wrong: 0,
      used: [],
      coins: 0,
      streak: 0,
      shield: false,
      lightning: false,
      // Vaqt cheklanmagan o'yinda "+15 soniya" bo'lmaydi.
      powers: { fifty: mech.powers, ...(config.time > 0 ? { time: mech.powers } : {}) },
      // Yakka rejim jonlari (o'chirilgan bo'lsa — null).
      hearts: lives ? MAX_HEARTS : null,
      // Nominatsiyalar uchun: eng uzun seriya, ilib olishlar, girdobdan keyingi qadamlar.
      run: 0,
      bestRun: 0,
      rebounds: 0,
      trapped: false,
      comeback: 0,
    })),
  );
  // Animatsiya paytida eng so'nggi holatni o'qish uchun ref ham saqlanadi.
  const teamsRef = useRef(teams);
  const setTeams = (fn) => {
    teamsRef.current = fn(teamsRef.current);
    setTeamsState(teamsRef.current);
  };

  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState('ready'); // ready | question | rebound | feedback | moving | won | lost
  const [ceremony, setCeremony] = useState(0); // g'alaba marosimi: 0 — xazinaga yaqinlashish, 1 — shohsupa
  const [daily, setDaily] = useState(null); // kunlik sarguzasht natijasi: { record, first, best, streak }
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const deck = useRef({ order: [], i: 0 });
  const mistakes = useRef(new Map());
  const finished = useRef(false);
  const proceeding = useRef(false);
  const questionNumber = useRef(0);
  // Bir savolga javob (va ilib olish) faqat bir marta qabul qilinadi: tugma juda tez ikki marta bosilsa,
  // React holati yangilanmasdan ikkinchi bosish ham o'tib, javob ikki marta hisoblanib qolardi.
  const answerTaken = useRef(false);
  const reboundTaken = useRef(false);

  const team = teams[turn];

  const drawQuestion = () => {
    const d = deck.current;
    if (d.i >= d.order.length) {
      d.order = seededShuffle(config.questions.map((_, i) => i), deckRandom);
      d.i = 0;
    }
    return config.questions[d.order[d.i++]];
  };

  const updateTeam = (idx, fn) => setTeams((ts) => ts.map((t, i) => (i === idx ? { ...t, ...fn(t) } : t)));

  const openQuestion = () => {
    if (phase !== 'ready') return;
    play('open');
    questionNumber.current += 1;
    // ⚡ katakdan keyingi savol — chaqmoq: vaqt qisqa, to'g'ri bo'lsa +2 qadam.
    const lightning = teamsRef.current[turn].lightning;
    if (lightning) updateTeam(turn, () => ({ lightning: false }));
    setCurrent({ ...prepare(drawQuestion()), lightning, time: questionTime(config.time, lightning), hidden: [], bonusTime: 0 });
    answerTaken.current = false;
    reboundTaken.current = false;
    setResult(null);
    setPhase('question');
  };

  const answer = (correct, extra = {}) => {
    if (phase !== 'question' || answerTaken.current) return;
    answerTaken.current = true;
    const fast = correct && mech.rebound && isFastAnswer(extra.left ?? 0, current.time + current.bonusTime);
    const t = teamsRef.current[turn];
    const streak = correct ? t.streak + 1 : 0;
    const streakBonus = mech.streak && streak >= STREAK_BONUS_AT;
    updateTeam(turn, (tm) => ({
      correct: tm.correct + (correct ? 1 : 0),
      wrong: tm.wrong + (correct ? 0 : 1),
      coins: tm.coins + (fast ? 1 : 0),
      streak: streakBonus ? 0 : streak,
      run: correct ? tm.run + 1 : 0,
      bestRun: Math.max(tm.bestRun, correct ? tm.run + 1 : 0),
      hearts: tm.hearts != null && !correct ? Math.max(0, tm.hearts - 1) : tm.hearts,
    }));
    // Ilib olish: xato (yoki vaqt tugashi) dan keyin keyingi jamoa shu savolga javob beradi.
    const left = current.options ? current.options.length - current.hidden.length - (extra.chosen != null ? 1 : 0) : 0;
    const rebound = !correct && mech.rebound && canRebound(current.q, teams.length, left);
    setResult({ correct, fast, streakBonus, heartLost: lives && !correct, ...extra, ...(rebound ? { rebound: { team: (turn + 1) % teams.length } } : {}) });
    setPhase(rebound ? 'rebound' : 'feedback');
    play(correct ? 'correct' : 'wrong');
    if (!correct) {
      const key = current.q.id;
      const previous = mistakes.current.get(key);
      mistakes.current.set(key, { text: current.q.text || current.q.code || 'Rasmli savol', wrong: (previous?.wrong || 0) + 1, question: structuredClone(current.q) });
    }
  };

  // Ilib olishga urinish: to'g'ri bo'lsa — keyingi jamoaga 🪙. Statistikaga (✓/✗) ta'sir qilmaydi.
  const reboundAnswer = (i) => {
    if (phase !== 'rebound' || reboundTaken.current) return;
    reboundTaken.current = true;
    const ok = current.options[i].correct;
    const rt = result.rebound.team;
    if (ok) updateTeam(rt, (tm) => ({ coins: tm.coins + 1, rebounds: tm.rebounds + 1 }));
    setResult((r) => ({ ...r, rebound: { ...r.rebound, chosen: i, ok } }));
    setPhase('feedback');
    play(ok ? 'coin' : 'wrong');
  };

  const skipRebound = () => {
    if (phase !== 'rebound' || reboundTaken.current) return;
    reboundTaken.current = true;
    setResult((r) => ({ ...r, rebound: { ...r.rebound, skipped: true } }));
    setPhase('feedback');
  };

  // Kuchaytirgichlar: har jamoaga o'yinda bir martadan.
  const usePower = (kind) => {
    if (phase !== 'question' || !teamsRef.current[turn].powers[kind]) return;
    if (kind === 'fifty') {
      const hidden = fiftyFifty(current.options);
      if (!hidden.length) return;
      setCurrent((c) => ({ ...c, hidden }));
    } else {
      setCurrent((c) => ({ ...c, bonusTime: c.bonusTime + POWER_TIME }));
    }
    updateTeam(turn, (tm) => ({ powers: { ...tm.powers, [kind]: false } }));
    play('bonus');
  };

  // Fon musiqasi: o'yin davomida chaladi, savolda pasayadi, pauzada jim, g'alaba yoki "kema cho'kdi"da to'xtaydi.
  const gameOver = phase === 'won' || phase === 'lost';
  useEffect(() => {
    if (!musicOn || gameOver) {
      stopRaceMusic();
      return undefined;
    }
    startRaceMusic();
    return undefined;
  }, [musicOn, gameOver]);
  useEffect(() => {
    setRaceMusicLevel(paused ? 0 : phase === 'question' || phase === 'rebound' || phase === 'feedback' ? 0.35 : 1);
  }, [phase, paused, musicOn]);
  useEffect(() => () => stopRaceMusic(), []);

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    try {
      localStorage.setItem(MUSIC_KEY, next ? 'on' : 'off');
    } catch {
      // Brauzer xotirasi yopiq bo'lsa, tanlov faqat shu o'yinda amal qiladi.
    }
  };

  // Qahramon yo'l bo'ylab (katakdan katakka to'g'ri chiziq emas) sakrab yuradi. DOMni to'g'ridan-to'g'ri
  // o'zgartiramiz — har kadrda React qayta chizmasin. Oxirida holat yangilanib, xuddi shu joyni qayd etadi.
  const walk = (idx, from, to) =>
    new Promise((resolve) => {
      const el = tokenEls.current[idx];
      if (!el || reducedMotion() || from === to) {
        resolve(false);
        return;
      }
      const body = el.querySelector('.token-jump');
      const off = spread(idx);
      const la = board.lengths[from];
      const lb = board.lengths[to];
      const t0 = performance.now();
      const frame = (now) => {
        const k = Math.min(1, (now - t0) / STEP_MS);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        const p = board.at(la + (lb - la) * e);
        const h = Math.sin(Math.PI * k);
        el.style.left = `${p.x + off}%`;
        el.style.top = `${p.y}%`;
        if (body) body.style.transform = `translateY(${-h * 2.4}cqw) scale(${1 + h * 0.06}, ${1 - h * 0.04})`;
        if (k < 1) requestAnimationFrame(frame);
        else {
          if (body) body.style.transform = '';
          resolve(true);
        }
      };
      requestAnimationFrame(frame);
    });

  const step = async (idx, dir) => {
    const from = teamsRef.current[idx].pos;
    const to = Math.max(0, Math.min(N, from + dir));
    play('step');
    const el = tokenEls.current[idx];
    if (dir < 0) el?.classList.add('swirl');
    const animated = await walk(idx, from, to);
    // Girdobdan keyingi har oldinga qadam — "qaytish" nominatsiyasi uchun.
    setTeams((ts) => ts.map((t, i) => (i === idx ? { ...t, pos: to, comeback: t.comeback + (t.trapped && dir > 0 ? 1 : 0) } : t)));
    el?.classList.remove('swirl');
    // Animatsiyasiz rejimda ham qadamlar bir-biridan ajralib ko'rinsin.
    await sleep(animated ? 180 : STEP_MS);
    return to;
  };

  // 🌉 Ko'prik: yo'l bo'ylab emas, to'g'ridan-to'g'ri yoy bo'ylab sakrash.
  const jump = async (idx, to) => {
    const el = tokenEls.current[idx];
    const from = track[teamsRef.current[idx].pos];
    const dest = track[to];
    if (el && !reducedMotion()) {
      const body = el.querySelector('.token-jump');
      const off = spread(idx);
      await new Promise((resolve) => {
        const t0 = performance.now();
        const frame = (now) => {
          const k = Math.min(1, (now - t0) / 900);
          const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
          el.style.left = `${from.x + (dest.x - from.x) * e + off}%`;
          el.style.top = `${from.y + (dest.y - from.y) * e}%`;
          if (body) body.style.transform = `translateY(${-Math.sin(Math.PI * k) * 7}cqw)`;
          if (k < 1) requestAnimationFrame(frame);
          else {
            if (body) body.style.transform = '';
            resolve();
          }
        };
        requestAnimationFrame(frame);
      });
    }
    // X-8: girdobdan keyin ko'prik bilan oldinga o'tilgan kataklar ham "Eng katta qaytish"ga qo'shiladi.
    updateTeam(idx, (t) => ({ pos: to, comeback: t.comeback + (t.trapped && to > t.pos ? to - t.pos : 0) }));
    await sleep(reducedMotion() ? STEP_MS : 200);
  };

  const showToast = async (kind, text, pos, ms = 1300) => {
    setToast({ kind, text });
    if (pos != null) setBurst({ pos, kind, key: Date.now() });
    await sleep(ms);
  };

  // Qo'nilgan katakning ta'siri. Maxsus katak keltirgan harakat yana katakni ishga tushirmaydi.
  const landOn = async (idx) => {
    const t = teamsRef.current[idx];
    const pos = t.pos;
    const kind = specials[pos];
    if (pos >= N || !kind || t.used.includes(pos)) return;
    updateTeam(idx, (tm) => ({ used: [...tm.used, pos] }));
    if (kind === 'bonus') {
      play('bonus');
      await showToast('bonus', '⭐ Bonus! Yana +1 qadam', pos);
      await step(idx, 1);
    } else if (kind === 'trap') {
      if (teamsRef.current[idx].shield) {
        updateTeam(idx, () => ({ shield: false }));
        play('bonus');
        await showToast('shield', '🛡 Qalqon girdobdan saqlab qoldi!', pos);
      } else {
        play('trap');
        await showToast('trap', '🌀 Girdob! 1 qadam orqaga', pos);
        updateTeam(idx, () => ({ trapped: true }));
        await step(idx, -1);
      }
    } else if (kind === 'chest') {
      play('coin');
      // Jonlar yoqilgan yakka o'yinda sandiq jon qaytaradi, aks holda qalqon beradi.
      if (lives) {
        updateTeam(idx, (tm) => ({ hearts: Math.min(MAX_HEARTS, tm.hearts + 1) }));
        await showToast('chest', teamsRef.current[idx].hearts >= MAX_HEARTS ? '🎁 Sandiq: ❤️ jonlar to‘liq!' : '🎁 Sandiq: +1 ❤️', pos, 1500);
      } else {
        updateTeam(idx, () => ({ shield: true }));
        await showToast('chest', '🎁 Sandiq: 🛡 qalqon! Keyingi girdob ta’sir qilmaydi', pos, 1600);
      }
    } else if (kind === 'lightning') {
      updateTeam(idx, () => ({ lightning: true }));
      play('bonus');
      await showToast('zap', '⚡ Keyingi savol — chaqmoq: vaqt qisqa, to‘g‘ri javob +2 qadam', pos, 1700);
    } else if (kind === 'bridge') {
      play('bonus');
      await showToast('bridge', `🌉 Ko‘prik! ${BRIDGE_JUMP} katak oldinga`, pos, 1000);
      await jump(idx, Math.min(N, pos + BRIDGE_JUMP));
    }
    setToast(null);
    setBurst(null);
  };

  const proceed = async () => {
    if (phase !== 'feedback' || proceeding.current) return;
    proceeding.current = true;
    if (result.correct) {
      setPhase('moving');
      if (result.fast) {
        play('coin');
        await showToast('coin', '🪙 Tez javob: +1 tanga', null, 900);
        setToast(null);
      }
      for (let k = 0; k < answerSteps(current.lightning) && teamsRef.current[turn].pos < N; k++) await step(turn, 1);
      await landOn(turn);
      if (result.streakBonus && teamsRef.current[turn].pos < N) {
        play('bonus');
        await showToast('streak', `🔥 ${STREAK_BONUS_AT} ta ketma-ket to‘g‘ri! +1 qadam`, null, 1200);
        setToast(null);
        await step(turn, 1);
      }
    }
    if (roundFinished(teamsRef.current, turn, N)) {
      setPhase('won');
      play('win');
      setTimeout(() => play('coin'), 700);
      return;
    }
    // Yakka o'yinda jonlar tugasa — "kema cho'kdi", o'yin tugaydi (natija saqlanadi).
    if (lives && teamsRef.current[turn].hearts <= 0) {
      setPhase('lost');
      play('trap');
      return;
    }
    proceeding.current = false;
    setTurn((t) => (t + 1) % teamsRef.current.length);
    setPhase('ready');
    play('turn');
  };

  const finish = (winnerName) => {
    if (finished.current) return;
    finished.current = true;
    const hard = [...mistakes.current.values()]
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 10);
    onFinish({
      id: uid(),
      date: new Date().toISOString(),
      setName: config.setName,
      trackLength: N,
      winner: winnerName,
      teams: teamsRef.current.map(({ name, color, hero, pos, correct, wrong, coins }) => ({ name, color, hero, pos, correct, wrong, coins })),
      // Nominatsiyalar faqat jamoaviy o'yin to'liq tugaganda (muddatidan oldin yakunlansa — yo'q).
      ...(phase === 'won' && !solo ? { awards: awardsList(teamsRef.current) } : {}),
      hard,
    });
  };

  // G'alaba marosimi: avval xazinaga yaqinlashish, keyin shohsupa va nominatsiyalar.
  useEffect(() => {
    if (phase !== 'won') return undefined;
    const t = setTimeout(() => setCeremony(1), reducedMotion() ? 0 : 1600);
    return () => clearTimeout(t);
  }, [phase]);

  // Kunlik sarguzasht: natija shu qurilmada saqlanadi, rekord bo'lsa ko'rsatiladi.
  useEffect(() => {
    if (!config.daily || !solo || (phase !== 'won' && phase !== 'lost') || daily) return;
    const p = teamsRef.current[0];
    setDaily(
      saveDaily(dailyStorage(), {
        day: config.daily,
        setId: config.setId ?? config.setName,
        // Rekord yo'l uzunligiga ham bog'liq: 8 qadamli natija 16 qadamli bilan solishtirilmaydi.
        fingerprint: `${questionsFingerprint(config.questions)}-${N}`,
        stars: soloStars(p, N),
        pos: p.pos,
        correct: p.correct,
        wrong: p.wrong,
      }),
    );
  }, [phase]);

  const finishEarly = () => {
    finish(raceWinner(teamsRef.current));
  };

  const openMenu = () => {
    setPaused(true);
    setMenu(true);
  };

  const closeMenu = () => {
    setMenu(false);
    setPaused(false);
  };

  const spread = (i) => (i - (teams.length - 1) / 2) * 2.4;

  return (
    <div className={`race-wrap theme-${config.theme || 'adventure'}`}>
      <div className="stage">
        {/* Taxta qatlami: g'alabada xazinaga "kamera" yaqinlashadi. */}
        <div
          className={`board-layer ${phase === 'won' ? 'zoom' : ''}`}
          style={{ transformOrigin: `${track[N].x}% ${track[N].y}%` }}
        >
        <RaceScenery track={board} />
        {bridgeAt != null && <Bridge from={track[bridgeAt]} to={track[Math.min(N, Number(bridgeAt) + BRIDGE_JUMP)]} />}

        {track.map((p, i) => {
          const special = specials[i];
          const isEnd = i === N;
          return (
            <div
              key={i}
              className={`node ${i === 0 ? 'start' : ''} ${isEnd ? 'end' : ''} ${special ?? ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {i === 0 ? '🚩' : isEnd ? <Chest open={teams.some((t) => t.pos >= N)} /> : special === 'trap' ? <span className="swirl-icon">🌀</span> : special ? CELL_ICON[special] : i}
              {burst?.pos === i && <b key={burst.key} className={`node-burst ${burst.kind}`} aria-hidden="true" />}
            </div>
          );
        })}

        {teams.map((t, i) => {
          const p = track[t.pos];
          const leader = !solo && t.pos > 0 && placeOf(teams, t) === 1 && teams.filter((o) => placeOf(teams, o) === 1).length === 1;
          return (
            <div
              key={t.id}
              ref={(el) => (tokenEls.current[i] = el)}
              className={`token ${i === turn && phase !== 'won' ? 'active' : ''}`}
              style={{ left: `${p.x + spread(i)}%`, top: `${p.y}%`, '--team': t.color }}
            >
              <b className="token-shadow" aria-hidden="true" />
              {/* key=pos: har qo'nishda element yangilanib, "cho'kish" animatsiyasi qayta ishlaydi. */}
              <div key={t.pos} className={`token-jump ${t.pos > 0 ? 'moved' : ''}`}>
                {leader && <em className="token-crown" aria-label="Peshqadam">👑</em>}
                <span>
                  <i>{t.hero}</i>
                </span>
              </div>
              {t.pos > 0 && <b key={'dust' + t.pos} className="land-dust" aria-hidden="true"><i /><i /><i /><i /></b>}
            </div>
          );
        })}
        </div>

        <div className="hud">
          {teams.map((t, i) => {
            const place = placeOf(teams, t);
            return (
              <div key={t.id} className={`score ${i === turn ? 'current' : ''}`} style={{ '--team': t.color }}>
                {!solo && teams.some((o) => o.pos > 0) && (
                  <b key={place} className={`score-place p${place}`} title={`${place}-o‘rin`}>
                    {place}
                  </b>
                )}
                <span className="score-hero">{t.hero}</span>
                <div className="score-info">
                  <b>{t.name}</b>
                  <small key={t.pos + '-' + t.correct} className="score-num">
                    {t.pos}/{N} qadam · ✓{t.correct}
                  </small>
                  <span className="score-bar"><i style={{ width: `${(t.pos / N) * 100}%` }} /></span>
                  <ScoreChips team={t} mech={mech} />
                </div>
              </div>
            );
          })}
          <span className="spacer" />
          <button className={`hud-btn ${musicOn ? '' : 'off'}`} title={musicOn ? 'Musiqani o‘chirish' : 'Musiqani yoqish'} aria-label={musicOn ? 'Musiqani o‘chirish' : 'Musiqani yoqish'} aria-pressed={musicOn} onClick={toggleMusic}>🎵</button>
          <button className="hud-btn" title="To‘liq ekran" aria-label="To‘liq ekran" onClick={() => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else document.documentElement.requestFullscreen?.().catch(() => {}); }}>⛶</button>
          <button className="hud-btn" disabled={phase === 'moving'} onClick={openMenu} title="Pauza va o‘yinni boshqarish" aria-label="O‘yinni to‘xtatib turish">
            ⏸
          </button>
        </div>

        {phase === 'ready' && (
          <div key={`banner-${turn}-${questionNumber.current}`} className="turn-banner" style={{ '--team': team.color }} aria-hidden="true">
            <span>{team.hero}</span>
            <b>{solo ? `${questionNumber.current + 1}-savol` : team.name}</b>
            <small>{solo ? team.name : 'navbati'}</small>
          </div>
        )}

        {(phase === 'ready' || phase === 'moving') && (
          <div className="turn-panel" style={{ '--team': team.color }}>
            <span className="turn-hero">{team.hero}</span>
            <div className="turn-text">
              <b>{solo ? `${team.name}, ${questionNumber.current + 1}-savol` : `${team.name} navbati!`}</b>
              <small>{phase === 'ready' ? (solo ? 'Tayyor bo‘lsangiz, savolni oching' : 'Jamoaning keyingi o‘quvchisi doskaga chiqsin') : 'Qahramon yo‘lda…'}</small>
            </div>
            {phase === 'ready' && (
              <button className="btn primary huge" onClick={openQuestion}>
                Savolni ochish ▶
              </button>
            )}
          </div>
        )}

        {toast && <div className={`toast ${toast.kind}`}>{toast.text}</div>}

        {(phase === 'question' || phase === 'rebound' || phase === 'feedback') && current && (
          <QuestionCard
            key={questionNumber.current}
            item={current}
            team={team}
            solo={solo}
            time={current.time}
            paused={paused}
            phase={phase}
            result={result}
            onAnswer={answer}
            onContinue={proceed}
            powers={mech.powers ? team.powers : null}
            onPower={usePower}
            reboundTeam={result?.rebound ? teams[result.rebound.team] : null}
            onRebound={reboundAnswer}
            onSkipRebound={skipRebound}
          />
        )}

        {phase === 'won' && solo && (
          <div className="overlay win-overlay">
            <div className="win-rays" aria-hidden="true" />
            <Confetti />
            <div className="win-card" style={{ '--team': team.color }}>
              <div className="win-hero">💰</div>
              <h1>Xazina topildi!</h1>
              <div className="win-stars" aria-label={`${soloStars(team, N)} yulduz`}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < soloStars(team, N) ? 'on' : ''} style={{ '--i': i }}>★</span>
                ))}
              </div>
              <p>
                {team.correct} ta to‘g‘ri, {team.wrong} ta xato · aniqlik{' '}
                {Math.round((team.correct / Math.max(1, team.correct + team.wrong)) * 100)}%
                {team.hearts != null && <> · {team.hearts} ❤️ qoldi</>}
              </p>
              <DailyNote daily={daily} />
              <button className="btn gold huge" onClick={() => finish(raceWinner(teamsRef.current))}>
                Natijalarni ko‘rish
              </button>
            </div>
          </div>
        )}

        {phase === 'won' && !solo && ceremony === 1 && (
          <Ceremony teams={teams} onDone={() => finish(raceWinner(teamsRef.current))} />
        )}

        {phase === 'lost' && (
          <div className="overlay win-overlay lost-overlay">
            <div className="win-card lost-card" style={{ '--team': team.color }}>
              <div className="win-hero sink">🚢</div>
              <h1>Kema cho‘kdi!</h1>
              <p>
                Jonlar tugadi. Xazinagacha {N - team.pos} qadam qoldi · {team.correct} ta to‘g‘ri, {team.wrong} ta xato
              </p>
              <p className="lost-tip">Xato savollarni natijalar ekranida takrorlab, qayta urinib ko‘ring.</p>
              <DailyNote daily={daily} />
              <button className="btn gold huge" onClick={() => finish(null)}>
                Natijalarni ko‘rish
              </button>
            </div>
          </div>
        )}

        {/* Telefon tik turganda taxta va savollar juda mayda — yon tomonga burishni so'raymiz (Soyadagidek). */}
        <div className="race-rotate" role="alert">
          <div className="phone" aria-hidden="true" />
          <b>Telefonni yon tomonga burang</b>
          <small>Xazina poygasi keng ekranda o‘ynaladi</small>
          <button className="btn" onClick={onExit}>← {exitLabel}</button>
        </div>

        {menu && (
          <div className="overlay">
            <div className="menu-card">
              <h2>⏸ O‘yin to‘xtatildi</h2>
              <button className="btn primary big full" onClick={closeMenu}>
                ▶ Davom etish
              </button>
              <button className="btn gold big full" onClick={() => askPin('O‘yinni yakunlash', finishEarly)}>
                🏁 O‘yinni yakunlash va natijalar
              </button>
              <button className="btn big full" onClick={() => askPin(exitLabel, onExit)}>
                ← {exitLabel} (natija saqlanmaydi)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuestionCard({
  item,
  team,
  solo = false,
  time,
  paused,
  phase,
  result,
  onAnswer,
  onContinue,
  review = false,
  powers = null,
  onPower,
  reboundTeam = null,
  onRebound,
  onSkipRebound,
}) {
  const { q, options } = item;
  const hidden = item.hidden || [];
  const bonusTime = item.bonusTime || 0;
  const total = time + bonusTime;
  const [left, setLeft] = useState(time);
  const [value, setValue] = useState('');
  const leftRef = useRef(left);
  leftRef.current = left;
  // Javob bilan birga qolgan vaqt ham yuboriladi (tez javob tangasi uchun).
  const submit = (correct, extra = {}) => onAnswer(correct, { ...extra, left: leftRef.current });
  const answerRef = useRef(submit);
  answerRef.current = submit;

  // "+15 soniya" kuchaytirgichi: qo'shilgan vaqt taymerga darhol qo'shiladi.
  const addedTime = useRef(0);
  useEffect(() => {
    if (bonusTime > addedTime.current) {
      setLeft((l) => l + bonusTime - addedTime.current);
      addedTime.current = bonusTime;
    }
  }, [bonusTime]);

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
  const rebounding = phase === 'rebound';
  const rebound = result?.rebound;

  const tileClass = (opt, i) => {
    if (hidden.includes(i)) return 'gone';
    if (rebounding) return result.chosen === i ? 'wrong' : '';
    if (!answered) return '';
    if (opt.correct) return 'right';
    if (result.chosen === i || rebound?.chosen === i) return 'wrong';
    return 'dim';
  };

  let feedback = null;
  if (answered) {
    const steps = item.lightning ? '⚡ +2 qadam' : solo ? '1 qadam oldinga' : 'Jamoa 1 qadam oldinga yuradi';
    if (result.correct) feedback = review ? '✅ To‘g‘ri! Bilimingiz mustahkamlandi.' : `✅ To‘g‘ri! ${steps}`;
    else if (result.timeout) feedback = solo ? '⏰ Vaqt tugadi! Joyingizda qolasiz' : '⏰ Vaqt tugadi! Navbat keyingi jamoaga o‘tadi';
    else feedback = review ? '💡 Yechimni ko‘rib chiqing va keyingi savolga o‘ting.' : solo ? '❌ Noto‘g‘ri. Joyingizda qolasiz — keyingi savol' : '❌ Noto‘g‘ri. Navbat keyingi jamoaga o‘tadi';
  }
  const extras = [];
  if (answered && result.fast) extras.push('🪙 Tez javob: +1 tanga');
  if (answered && result.streakBonus) extras.push('🔥 Seriya: yana +1 qadam');
  if (answered && result.heartLost) extras.push('💔 −1 jon');
  if (answered && rebound && reboundTeam && !rebound.skipped) {
    extras.push(rebound.ok ? `${reboundTeam.hero} ${reboundTeam.name} ilib oldi: +1 🪙` : `${reboundTeam.hero} ${reboundTeam.name}: ilib olish ham xato`);
  }

  const canFifty = powers?.fifty && options && q.type === 'choice' && options.length >= 3 && !hidden.length;
  const canTime = powers?.time && time > 0;

  return (
    <div className="overlay question-overlay">
      <div className={`question-card ${item.lightning ? 'lightning' : ''}`} style={{ '--team': (rebounding && reboundTeam ? reboundTeam : team).color }}>
        <div className="q-top">
          <span className="q-team">
            {rebounding && reboundTeam
              ? `${reboundTeam.hero} ${reboundTeam.name}: ilib olasizmi? To‘g‘ri javob — +1 🪙`
              : `${team.hero} ${solo ? team.name : `${team.name} javob beryapti`}`}
          </span>
          {item.lightning && !rebounding && <span className="q-badge zap">⚡ Chaqmoq savol: +2 qadam</span>}
          {phase === 'question' && !review && (canFifty || canTime) && (
            <span className="q-powers">
              {canFifty && (
                <button className="power" onClick={() => onPower('fifty')} title="Ikkita xato javobni olib tashlaydi">
                  ½ 50/50
                </button>
              )}
              {canTime && (
                <button className="power" onClick={() => onPower('time')} title="Taymerga 15 soniya qo‘shadi">
                  ⏱ +15 s
                </button>
              )}
            </span>
          )}
          {time > 0 && !rebounding && <TimerRing left={Math.max(0, left)} total={total} urgent={left <= 5 && !answered} />}
        </div>

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
                style={{ '--i': i }}
                disabled={answered || hidden.includes(i) || (rebounding && result.chosen === i)}
                onClick={() => (rebounding ? onRebound(i) : submit(opt.correct, { chosen: i }))}
              >
                {q.type === 'choice' && <span className="gem">{GEMS[i]}</span>}
                <span className="answer-text">{opt.text}</span>
                {answered && opt.correct && <span className="answer-mark">✓</span>}
              </button>
            ))}
          </div>
        ) : q.type === 'order' ? (
          <OrderAnswer items={item.items} order={item.order} answered={answered} result={result} onAnswer={submit} />
        ) : q.type === 'match' ? (
          <MatchAnswer pairs={item.pairs} rightOrder={item.rightOrder} answered={answered} result={result} onAnswer={submit} />
        ) : (
          <div className={`input-answer ${q.keypad === 'text' ? 'text-answer' : ''}`}>
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
                  onClick={() => submit(checkInputAnswer(q, value), { value })}
                >
                  Javob berish ✓
                </button>
              )}
            </div>
            {!answered && (q.keypad === 'text' ? <TextKeypad value={value} onChange={setValue} /> : <Keypad hex={q.keypad === 'hex'} value={value} onChange={setValue} />)}
          </div>
        )}

        {answered && (result.correct || rebound?.ok) && <Sparkles />}
        {rebounding && (
          <div className="feedback bad rebound-bar">
            <div className="feedback-text">
              <b>{result.timeout ? '⏰ Vaqt tugadi!' : '❌ Noto‘g‘ri.'} Ilib olish: {reboundTeam?.name} javob beradi</b>
              <span className="explanation">Variantlardan birini bosing yoki o‘tkazib yuboring</span>
            </div>
            <button className="btn huge" onClick={onSkipRebound}>
              O‘tkazib yuborish
            </button>
          </div>
        )}
        {answered && (
          <div className={`feedback ${result.correct ? 'good' : 'bad'}`}>
            <div className="feedback-text">
              <b>{feedback}</b>
              {extras.length > 0 && <span className="feedback-extras">{extras.join(' · ')}</span>}
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
        icon: i % 3 === 0 ? ['🪙', '⭐', '✨'][i % 9 / 3] : null,
        color: ['#ffcf4a', '#ff5c7a', '#4da3ff', '#3fe0a0', '#b98cff'][i % 5],
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={p.icon ? '' : 'paper'}
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`, '--c': p.color }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
}

function TextKeypad({ value, onChange }) {
  const keys = [...'QWERTYUIOPASDFGHJKLZXCVBNM', 'O‘', 'G‘', '’', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return <div className="text-keypad-wrap">
    <input aria-label="Matnli javob" placeholder="Javobni yozing yoki harflarni bosing" value={value} maxLength={100} onChange={(e) => onChange(e.target.value)} />
    <div className="text-keypad">{keys.map((key) => <button className="key" key={key} onClick={() => { play('tap'); onChange((value + key).slice(0, 100)); }}>{key}</button>)}</div>
    <div className="text-keypad-actions"><button className="key" onClick={() => onChange(value + ' ')}>Bo‘sh joy</button><button className="key" aria-label="Oxirgi harfni o‘chirish" onClick={() => onChange(value.endsWith('‘') ? value.slice(0, -2) : value.slice(0, -1))}>⌫</button><button className="key" onClick={() => onChange('')}>Tozalash</button></div>
  </div>;
}

function TimerRing({ left, total, urgent }) {
  const r = 22;
  const length = 2 * Math.PI * r;
  return (
    <span className={`timer-ring ${urgent ? 'urgent' : ''}`} role="timer" aria-label={`${left} soniya qoldi`}>
      <svg viewBox="0 0 50 50" aria-hidden="true">
        <circle className="timer-bg" cx="25" cy="25" r={r} />
        <circle className="timer-fg" cx="25" cy="25" r={r} strokeDasharray={length} strokeDashoffset={length * (1 - left / total)} />
      </svg>
      <b>{left}</b>
    </span>
  );
}

// To'g'ri javobdan keyin kartaning markazidan uchqunlar sochiladi.
function Sparkles() {
  const dots = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ id: i, angle: (360 / 14) * i + Math.random() * 12, dist: 18 + Math.random() * 14 })), []);
  return (
    <div className="sparkles" aria-hidden="true">
      {dots.map((d) => (
        <i key={d.id} style={{ '--a': `${d.angle}deg`, '--d': `${d.dist}cqw` }} />
      ))}
    </div>
  );
}
