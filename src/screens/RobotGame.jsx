import { useEffect, useRef, useState } from 'react';
import { uid } from '../lib/util.js';
import { play } from '../lib/sound.js';
import { ROBOT_GAMES } from '../lib/robot/games.js';
import RoboKodWorkspace from '../components/RoboKodWorkspace.jsx';
import JavaWorkspace from '../components/JavaWorkspace.jsx';

const WORKSPACES = { kod: RoboKodWorkspace, java: JavaWorkspace };
const END_DELAY = { ok: 1300, fail: 1800 };

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const Stars = ({ n, of = 3 }) => (
  <span className="stars">
    {'★'.repeat(n)}
    <span className="off">{'★'.repeat(Math.max(0, of - n))}</span>
  </span>
);

// Robot o'yinlari qobig'i: mashq rejimi (erkin daraja tanlash) yoki jamoaviy musobaqa (raundlar, navbat, ball).
export default function RobotGame({ config, progress, onProgress, askPin, onFinish, onExit }) {
  const g = ROBOT_GAMES[config.game];
  const Workspace = WORKSPACES[config.game];
  const team = config.mode === 'team';

  // Mashq rejimi
  const firstUnsolved = g.levels.findIndex((_, i) => !progress.stars?.[i]);
  const [practiceIdx, setPracticeIdx] = useState(firstUnsolved < 0 ? 0 : firstUnsolved);
  const [practiceKey, setPracticeKey] = useState(0);

  // Jamoaviy rejim
  const [round, setRound] = useState(0);
  const [turnNo, setTurnNo] = useState(0);
  const [phase, setPhase] = useState(team ? 'ready' : 'play'); // ready | play | ending | turnEnd
  const [runs, setRuns] = useState(0);
  const [left, setLeft] = useState(config.turnTime);
  const [scores, setScores] = useState(() => (config.teams || []).map(() => ({ score: 0, solved: 0 })));
  const [lastTurn, setLastTurn] = useState(null);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const timers = useRef([]);
  const finished = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const n = config.teams?.length || 1;
  const teamIdx = team ? (round + turnNo) % n : 0;
  const current = team ? config.teams[teamIdx] : null;
  const levelIdx = team ? config.levels[round] : practiceIdx;
  const level = g.levels[levelIdx];

  const endTurn = (points, solved, reason) => {
    setScores((s) => s.map((x, i) => (i === teamIdx ? { score: x.score + points, solved: x.solved + (solved ? 1 : 0) } : x)));
    setLastTurn({ team: current, points, solved, reason });
    setPhase('turnEnd');
    play(solved ? 'bonus' : 'trap');
  };

  // Navbat vaqti: faqat jamoa ishlayotganda va menyu ochilmaganda kamayadi.
  useEffect(() => {
    if (!team || !config.turnTime || phase !== 'play' || paused) return;
    if (left <= 0) {
      setPhase('ending');
      later(() => endTurn(0, false, 'time'), 300);
      return;
    }
    const id = setTimeout(() => {
      if (left <= 11) play('tick');
      setLeft((v) => v - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [team, phase, paused, left]);

  const onAttempt = ({ ok, stars }) => {
    if (!team) {
      if (ok && stars > (progress.stars?.[practiceIdx] || 0)) onProgress(practiceIdx, stars);
      return;
    }
    if (phase !== 'play') return;
    const used = runs + 1;
    setRuns(used);
    if (ok) {
      setPhase('ending');
      later(() => endTurn(Math.max(1, stars - (used - 1)), true), END_DELAY.ok);
    } else if (used >= config.attempts) {
      setPhase('ending');
      later(() => endTurn(0, false, 'attempts'), END_DELAY.fail);
    }
  };

  const finish = (finalScores = scores) => {
    if (finished.current) return;
    finished.current = true;
    const list = config.teams.map(({ name, color, hero }, i) => ({ name, color, hero, ...finalScores[i] }));
    const ranked = [...list].sort((a, b) => b.score - a.score || b.solved - a.solved);
    const tie = ranked[1] && ranked[1].score === ranked[0].score && ranked[1].solved === ranked[0].solved;
    onFinish({
      id: uid(),
      kind: 'robot',
      game: config.game,
      date: new Date().toISOString(),
      setName: g.title,
      rounds: round + 1,
      maxScore: (round + 1) * 3,
      winner: ranked[0].score > 0 && !tie ? ranked[0].name : null,
      teams: list,
    });
  };

  const nextTurn = () => {
    const lastOfRound = turnNo === n - 1;
    if (lastOfRound && round === config.levels.length - 1) {
      finish();
      return;
    }
    if (lastOfRound) {
      setRound((r) => r + 1);
      setTurnNo(0);
    } else setTurnNo((t) => t + 1);
    setRuns(0);
    setLeft(config.turnTime);
    setLastTurn(null);
    setPhase('ready');
  };

  // Pauza PINsiz; yakunlash, navbatni o'tkazish va chiqish Sinf himoyasi yoqilgan bo'lsa PIN so'raydi.
  const openMenu = () => {
    setPaused(true);
    setMenu(true);
  };
  const closeMenu = () => {
    setMenu(false);
    setPaused(false);
  };
  const skipTurn = () => {
    closeMenu();
    if (phase === 'play' || phase === 'ready') endTurn(0, false, 'skip');
  };

  const nextLabel =
    turnNo === n - 1 && round === config.levels?.length - 1
      ? '🏆 Natijalarni ko‘rish'
      : turnNo === n - 1
        ? 'Keyingi raund →'
        : `${config.teams?.[(teamIdx + 1) % n].name} navbati →`;

  return (
    <div className="robo-wrap" style={{ '--team': current?.color || 'var(--accent)' }}>
      <header className="robo-hud">
        <div className="robo-title">
          <b>
            {g.icon} {g.title}
          </b>
          <small>{team ? `Raund ${round + 1}/${config.levels.length}` : 'Mashq rejimi'}</small>
        </div>

        {team ? (
          <div className="robo-scores">
            {config.teams.map((t, i) => (
              <div key={i} className={`robo-score ${i === teamIdx ? 'current' : ''}`} style={{ '--team': t.color }}>
                <span>{t.hero}</span>
                <div>
                  <b>{t.name}</b>
                  <small>★ {scores[i].score}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="robo-levels">
            {g.levels.map((l, i) => (
              <button
                key={i}
                className={`robo-lv ${i === practiceIdx ? 'on' : ''}`}
                title={g.levelLabel(l, i)}
                onClick={() => {
                  setPracticeIdx(i);
                  setPracticeKey((k) => k + 1);
                }}
              >
                {i + 1}
                {progress.stars?.[i] > 0 && <i>★</i>}
              </button>
            ))}
          </div>
        )}

        <div className="robo-hud-right">
          {team && (
            <>
              <div className="robo-tries" title="Qolgan urinishlar">
                {Array.from({ length: config.attempts }, (_, i) => (
                  <i key={i} className={i < runs ? 'used' : ''} />
                ))}
              </div>
              {config.turnTime > 0 && <div className={`robo-timer ${left <= 15 && phase === 'play' ? 'urgent' : ''}`}>⏱ {fmtTime(Math.max(0, left))}</div>}
            </>
          )}
          <button className="hud-btn" onClick={openMenu} title="Pauza va o‘yinni boshqarish" aria-label="O‘yinni to‘xtatib turish">
            ⏸
          </button>
        </div>
      </header>

      <Workspace
        key={team ? `${round}-${turnNo}` : `${practiceIdx}-${practiceKey}`}
        level={level}
        index={levelIdx}
        locked={phase !== 'play' || menu}
        practice={!team}
        onAttempt={onAttempt}
        onNext={!team && practiceIdx < g.levels.length - 1 ? () => setPracticeIdx((i) => i + 1) : null}
      />

      {team && phase === 'ready' && (
        <div className="overlay">
          <div className="robo-card" style={{ '--team': current.color }}>
            <div className="robo-card-hero">{current.hero}</div>
            <h1>{current.name} navbati</h1>
            <p>
              {g.levelLabel(level, levelIdx)} · {config.attempts} ta urinish
              {config.turnTime > 0 && ` · ${fmtTime(config.turnTime)}`}
            </p>
            <button
              className="btn primary huge"
              onClick={() => {
                play('open');
                setPhase('play');
              }}
            >
              ▶ Boshladik!
            </button>
          </div>
        </div>
      )}

      {team && phase === 'turnEnd' && lastTurn && (
        <div className="overlay">
          <div className={`robo-card ${lastTurn.solved ? 'good' : 'bad'}`} style={{ '--team': lastTurn.team.color }}>
            <div className="robo-card-hero">{lastTurn.solved ? '🔋' : lastTurn.team.hero}</div>
            <h1>{lastTurn.solved ? `${lastTurn.team.name}: +${lastTurn.points} ★` : `${lastTurn.team.name}: 0 ★`}</h1>
            <p>
              {lastTurn.solved
                ? 'Barcha batareyalar yig‘ildi!'
                : { time: '⏱ Vaqt tugadi.', attempts: 'Urinishlar tugadi.', skip: 'Navbat o‘tkazildi.' }[lastTurn.reason]}
            </p>
            {lastTurn.solved && <Stars n={lastTurn.points} />}
            <button className="btn gold huge" onClick={nextTurn}>
              {nextLabel}
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
            {team && (phase === 'play' || phase === 'ready') && (
              <button className="btn big full" onClick={() => askPin('Navbatni o‘tkazish', skipTurn)}>
                ⏭ Navbatni o‘tkazish (0 ★)
              </button>
            )}
            {team && (
              <button className="btn gold big full" onClick={() => askPin('O‘yinni yakunlash', () => finish())}>
                🏁 O‘yinni yakunlash va natijalar
              </button>
            )}
            <button className="btn big full" onClick={onExit}>
              ← Studiyaga qaytish{team ? ' (natija saqlanmaydi)' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
