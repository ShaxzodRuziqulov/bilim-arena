import { useEffect, useMemo, useRef, useState } from 'react';
import { play } from '../lib/sound.js';
import { createWorld, parseGrid, SPEEDS, startRun } from '../lib/robot/world.js';
import { KOD_MAX, KOD_NAMES, kodStars, runKod } from '../lib/robot/kod.js';
import RobotBoard from './RobotBoard.jsx';
import SpeedPicker from './SpeedPicker.jsx';

const ICON = {
  F: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V5M6 11l6-6 6 6" />
    </svg>
  ),
  L: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20v-7a5 5 0 0 0-5-5H5M9 4 5 8l4 4" />
    </svg>
  ),
  R: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20v-7a5 5 0 0 1 5-5h8M15 4l4 4-4 4" />
    </svg>
  ),
  P: 'P',
};
const ROWS = { m: 'Asosiy dastur', p: 'P funksiyasi' };

export default function RoboKodWorkspace({ level, index, locked, practice, onAttempt, onNext }) {
  const map = useMemo(() => parseGrid(level.grid), [level]);
  const world = useRef(null);
  const runner = useRef(null);
  const winTimer = useRef(null);
  const [prog, setProg] = useState({ m: [], p: [] });
  const [active, setActive] = useState('m');
  const [snap, setSnap] = useState(() => createWorld(map, level.dir).snapshot());
  const [instant, setInstant] = useState(true);
  const [running, setRunning] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [now, setNow] = useState(null);
  const [bump, setBump] = useState(0);
  const [win, setWin] = useState(false);
  const [msg, setMsg] = useState(null);
  const [won, setWon] = useState(null);
  const [speed, setSpeed] = useState('normal');
  const ms = SPEEDS[speed];

  useEffect(
    () => () => {
      runner.current?.stop();
      clearTimeout(winTimer.current);
    },
    [],
  );

  const total = prog.m.length + prog.p.length;
  const editable = !running && !locked;

  const resetWorld = () => {
    runner.current?.stop();
    clearTimeout(winTimer.current);
    world.current = createWorld(map, level.dir);
    setSnap(world.current.snapshot());
    setInstant(true);
    setBump(0);
    setWin(false);
    setNow(null);
    setWaiting(false);
  };

  const finish = (ok, text) => {
    setRunning(false);
    setWaiting(false);
    setNow(null);
    setMsg({ text, kind: ok ? 'good' : 'bad' });
    if (!ok) play('wrong');
    const stars = kodStars(level, total);
    if (ok) {
      play('correct');
      setWon({ stars, total });
    }
    onAttempt({ ok, stars });
  };

  const run = (stepMode = false) => {
    if (running) {
      runner.current.setStepMode(stepMode);
      if (stepMode) runner.current.next();
      return;
    }
    if (!prog.m.length || locked) return;
    resetWorld();
    setMsg(null);
    setWon(null);
    setRunning(true);
    const w = world.current;
    runner.current = startRun(runKod(prog, w), {
      stepMode,
      onWait: setWaiting,
      onAction: (a) => {
        setInstant(false);
        setNow({ r: a.r, i: a.i });
        if (a.t === 'call') return ms * 0.45;
        if (a.t === 'move' && !a.ok) {
          setBump((b) => b + 1);
          finish(false, 'Robot yo‘ldan chiqib ketdi! Qaysi buyruq xato ekanini toping.');
          return false;
        }
        setSnap(w.snapshot());
        play(a.t === 'move' ? 'step' : 'tap');
        if (w.left === 0) {
          winTimer.current = setTimeout(() => {
            setWin(true);
            finish(true, 'Barcha batareyalar yig‘ildi!');
          }, ms);
          return false;
        }
        return ms;
      },
      onError: (e) => finish(false, e.message),
      onDone: () => finish(false, `Dastur tugadi, lekin ${w.left} ta batareya qoldi.`),
    });
  };

  const stop = () => {
    resetWorld();
    setRunning(false);
    setMsg(running ? { text: 'To‘xtatildi.', kind: '' } : null);
    setWon(null);
  };

  const add = (c) => {
    if (!editable) return;
    if (prog[active].length >= KOD_MAX[active]) {
      setMsg({ text: `${ROWS[active]} to‘ldi — ${KOD_MAX[active]} ta joy.`, kind: 'bad' });
      return;
    }
    play('tap');
    setProg((p) => ({ ...p, [active]: [...p[active], c] }));
    setMsg(null);
  };
  const removeAt = (r, i) => {
    if (!editable) return;
    setProg((p) => ({ ...p, [r]: p[r].filter((_, j) => j !== i) }));
  };
  const backspace = () => editable && setProg((p) => ({ ...p, [active]: p[active].slice(0, -1) }));
  const clearAll = () => {
    if (!editable) return;
    setProg({ m: [], p: [] });
    stop();
  };

  return (
    <main className="robo-main">
      <section className="robo-left">
        <div className="robo-info">
          <h2>
            {index + 1}. {level.name}
          </h2>
          <p>{level.hint}</p>
        </div>
        <RobotBoard map={map} snap={snap} bump={bump} win={win} speed={ms} instant={instant} />
      </section>

      <section className="robo-right">
        {['m', 'p'].map((r) => (
          <div key={r} className={`kod-row ${active === r ? 'active' : ''}`} onClick={() => editable && setActive(r)}>
            <div className="kod-rowhead">
              <b>{ROWS[r]}</b>
              <small>
                {prog[r].length}/{KOD_MAX[r]}
              </small>
            </div>
            <div className="kod-slots">
              {Array.from({ length: KOD_MAX[r] }, (_, i) => {
                const c = prog[r][i];
                if (!c) return <div key={i} className="kod-slot" />;
                return (
                  <button
                    key={i}
                    className={`kod-cmd ${c} ${now?.r === r && now?.i === i ? 'now' : ''}`}
                    title={`${KOD_NAMES[c]} — o‘chirish`}
                    disabled={!editable}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(r, i);
                    }}
                  >
                    {ICON[c]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="kod-palette">
          {['F', 'L', 'R', 'P'].map((c) => (
            <button key={c} className="kod-pbtn" disabled={!editable} onClick={() => add(c)}>
              <span className={`kod-cmd ${c}`}>{ICON[c]}</span>
              {KOD_NAMES[c]}
            </button>
          ))}
          <button className="kod-pbtn" disabled={!editable || !prog[active].length} onClick={backspace}>
            <span className="kod-cmd back">⌫</span>
            O‘chirish
          </button>
        </div>
        <p className="robo-tip">
          Qatorni bosib tanlang, keyin buyruq qo‘shing. Qo‘yilgan buyruqni bossangiz — o‘chadi. Buyruqlar: <b>{total}</b> · 3 ★
          uchun ≤ <b>{level.par}</b>
        </p>

        <div className="robo-actions">
          <button className="btn primary big" disabled={(running && !waiting) || locked || !prog.m.length} onClick={() => run(false)}>
            ▶ {running ? 'Davom' : 'Ishga tushirish'}
          </button>
          <button className="btn big" disabled={(running && !waiting) || locked || !prog.m.length} onClick={() => run(true)} title="Har bosishda bitta buyruq">
            ⏯ Qadam
          </button>
          <button className="btn big" onClick={stop} disabled={!running && !msg && !won}>
            {running ? '■ To‘xtatish' : '↺ Qayta'}
          </button>
          <button className="btn big" onClick={clearAll} disabled={!editable || !total}>
            🗑
          </button>
          <SpeedPicker value={speed} onChange={setSpeed} />
        </div>

        <p className={`robo-msg ${msg?.kind || ''}`}>{msg?.text}</p>

        {won && practice && (
          <div className="robo-won">
            <span className="stars">
              {'★'.repeat(won.stars)}
              <span className="off">{'★'.repeat(3 - won.stars)}</span>
            </span>
            <p>
              {won.total} ta buyruq bilan yechdingiz.
              {won.stars < 3 ? ` ${level.par} tagacha qisqartirsa bo‘ladi — urinib ko‘ring.` : ' Eng qisqa yechim!'}
            </p>
            {onNext && (
              <button className="btn gold big" onClick={onNext}>
                Keyingi daraja →
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
