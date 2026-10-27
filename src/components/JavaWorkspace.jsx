import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { play } from '../lib/sound.js';
import { createWorld, parseGrid, SPEEDS, startRun } from '../lib/robot/world.js';
import { interpret, JErr, lex, parse, usesKeyword } from '../lib/robot/java.js';
import RobotBoard from './RobotBoard.jsx';
import SpeedPicker from './SpeedPicker.jsx';

const SNIPPETS = [
  ['robot.yur();', 'robot.yur();'],
  ['robot.yur(n);', 'robot.yur(2);'],
  ['chapga();', 'robot.chapga();'],
  ['ongga();', 'robot.ongga();'],
  ['oldindaDevor()', 'robot.oldindaDevor()', true],
  ['int x = 0;', 'int x = 0;'],
  ['for', 'for (int i = 0; i < 3; i++) {\n    \n}'],
  ['while', 'while (!robot.oldindaDevor()) {\n    \n}'],
  ['if', 'if (robot.oldindaDevor()) {\n    \n}'],
  ['if … else', 'if (robot.oldindaDevor()) {\n    \n} else {\n    \n}'],
  ['println', 'System.out.println();'],
];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ';', '(', ')', '{', '}', '<', '>', '=', '+', '-', '!', '"', 'i', 'n', '++', '--'];
const INDENT = '    ';

// **qalin** va `kod` belgilarini React elementlariga aylantiradi.
function rich(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) => {
    if (part.startsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function JavaWorkspace({ level, index, locked, practice, onAttempt, onNext }) {
  const map = useMemo(() => parseGrid(level.grid), [level]);
  const world = useRef(null);
  const runner = useRef(null);
  const winTimer = useRef(null);
  const taRef = useRef(null);
  const caret = useRef(null);
  const history = useRef([]);
  const lastPush = useRef(0);
  const printOpen = useRef(false);

  const [code, setCode] = useState(level.start);
  const [scroll, setScroll] = useState(0);
  const [snap, setSnap] = useState(() => createWorld(map, level.dir).snapshot());
  const [instant, setInstant] = useState(true);
  const [running, setRunning] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [mark, setMark] = useState(null); // { line, kind: 'act' | 'err' }
  const [bump, setBump] = useState(0);
  const [win, setWin] = useState(false);
  const [lines, setLines] = useState([{ text: 'Kodni yozing va «Ishga tushirish»ni bosing.', cls: 'h' }]);
  const [won, setWon] = useState(null);
  const [speed, setSpeed] = useState('normal');
  const [keypad, setKeypad] = useState(true);
  const [theoryOpen, setTheoryOpen] = useState(true);
  const consoleRef = useRef(null);
  const ms = SPEEDS[speed];
  const editable = !running && !locked;

  useEffect(
    () => () => {
      runner.current?.stop();
      clearTimeout(winTimer.current);
    },
    [],
  );
  useLayoutEffect(() => {
    if (caret.current == null) return;
    const ta = taRef.current;
    ta.focus();
    ta.selectionStart = ta.selectionEnd = caret.current;
    caret.current = null;
  }, [code]);
  useEffect(() => {
    consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [lines]);

  /* ---------- muharrir ---------- */
  const remember = (force) => {
    const now = Date.now();
    if (!force && now - lastPush.current < 800) return;
    lastPush.current = now;
    history.current = [...history.current.slice(-80), code];
  };
  const apply = (value, pos) => {
    remember(true);
    caret.current = pos;
    setCode(value);
  };
  const sel = () => {
    const ta = taRef.current;
    return [ta.selectionStart, ta.selectionEnd];
  };
  const lineIndent = (before) => (before.slice(before.lastIndexOf('\n') + 1).match(/^\s*/) || [''])[0];

  const insert = (txt) => {
    if (!editable) return;
    const [s, e] = sel();
    apply(code.slice(0, s) + txt + code.slice(e), s + txt.length);
  };
  const newline = () => {
    const [s, e] = sel();
    const before = code.slice(0, s);
    let ind = lineIndent(before);
    if (before.trimEnd().endsWith('{')) ind += INDENT;
    apply(before + '\n' + ind + code.slice(e), s + 1 + ind.length);
  };
  // "}" bo'sh qatorga yozilsa, chekinish bir pog'ona kamayadi.
  const closeBrace = () => {
    const [s, e] = sel();
    const before = code.slice(0, s);
    const lineStart = before.lastIndexOf('\n') + 1;
    const head = before.slice(lineStart);
    if (head.trim() === '' && head.length >= INDENT.length) {
      const nb = before.slice(0, lineStart) + head.slice(INDENT.length) + '}';
      apply(nb + code.slice(e), nb.length);
    } else insert('}');
  };
  const backspace = () => {
    if (!editable) return;
    const [s, e] = sel();
    if (s !== e) apply(code.slice(0, s) + code.slice(e), s);
    else if (s > 0) {
      const n = code.slice(0, s).endsWith(INDENT) ? INDENT.length : 1;
      apply(code.slice(0, s - n) + code.slice(s), s - n);
    }
  };
  const moveCaret = (d) => {
    const ta = taRef.current;
    const p = Math.max(0, Math.min(code.length, ta.selectionStart + d));
    ta.focus();
    ta.selectionStart = ta.selectionEnd = p;
  };
  const snippet = (txt, inline) => {
    if (!editable) return;
    const [s, e] = sel();
    const before = code.slice(0, s);
    const after = code.slice(e);
    if (inline) {
      apply(before + txt + after, s + txt.length);
      return;
    }
    const ind = lineIndent(before);
    const atLineStart = before.slice(before.lastIndexOf('\n') + 1).trim() === '';
    const body = txt.replace(/\n/g, '\n' + ind);
    const prefix = atLineStart ? '' : '\n' + ind;
    const suffix = after === '' || after.startsWith('\n') ? '' : '\n' + ind;
    // Kursor blok ichidagi bo'sh qatorga yoki println qavsi ichiga qo'yiladi.
    const blank = body.indexOf('\n' + ind + INDENT + '\n');
    const inner = blank >= 0 ? blank + 1 + ind.length + INDENT.length : body.endsWith('println();') ? body.length - 2 : body.length;
    apply(before + prefix + body + suffix + after, s + prefix.length + inner);
  };
  const undo = () => {
    if (!editable || !history.current.length) return;
    const prev = history.current.pop();
    caret.current = prev.length;
    setCode(prev);
  };
  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insert(INDENT);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      newline();
    } else if (e.key === '}') {
      e.preventDefault();
      closeBrace();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      undo();
    }
  };
  // Ekran tugmalari bosilganda textarea fokusni yo'qotmasin.
  const keep = (e) => e.preventDefault();

  /* ---------- ishga tushirish ---------- */
  const resetWorld = () => {
    runner.current?.stop();
    clearTimeout(winTimer.current);
    world.current = createWorld(map, level.dir);
    setSnap(world.current.snapshot());
    setInstant(true);
    setBump(0);
    setWin(false);
    setWaiting(false);
  };

  const log = (text, cls) => setLines((ls) => [...ls, { text, cls }]);
  // print() qatorni yopmaydi — keyingi chiqish shu qatorga qo'shiladi.
  const print = (text, nl) => {
    const append = printOpen.current;
    setLines((ls) => (append && ls.length ? [...ls.slice(0, -1), { ...ls[ls.length - 1], text: ls[ls.length - 1].text + text }] : [...ls, { text, cls: '' }]));
    printOpen.current = !nl;
  };

  const fail = (text, line) => {
    setRunning(false);
    setWaiting(false);
    log(text, 'e');
    setMark(line ? { line, kind: 'err' } : null);
    play('wrong');
    onAttempt({ ok: false });
  };

  const run = (stepMode = false) => {
    if (running) {
      runner.current.setStepMode(stepMode);
      if (stepMode) runner.current.next();
      return;
    }
    if (locked) return;
    resetWorld();
    setWon(null);
    setLines([]);
    let tokens;
    let prog;
    try {
      tokens = lex(code);
      prog = parse(tokens);
    } catch (e) {
      setLines([{ text: 'Kompilyatsiya xatosi:', cls: 'h' }]);
      fail(`✖ ${e.line}-qator: ${e.message}`, e.line);
      return;
    }
    setLines([{ text: '▶ Main.java ishga tushdi', cls: 'h' }]);
    setRunning(true);
    const w = world.current;
    printOpen.current = false;
    runner.current = startRun(interpret(prog, w), {
      stepMode,
      onWait: setWaiting,
      onAction: (a) => {
        setInstant(false);
        setMark({ line: a.line, kind: 'act' });
        if (a.t === 'print') {
          print(a.text, a.nl);
          return speed === 'fast' ? 40 : 120;
        }
        if (a.t === 'move' && !a.ok) {
          setBump((b) => b + 1);
          printOpen.current = false;
          fail(`✖ ${a.line}-qator: robot yo‘ldan chiqib ketdi. Bu qatorgacha robot qaysi tomonga qarab turganini tekshiring.`, a.line);
          return false;
        }
        setSnap(w.snapshot());
        play(a.t === 'move' ? 'step' : 'tap');
        if (w.left === 0) {
          winTimer.current = setTimeout(() => {
            printOpen.current = false;
            if (level.need && !usesKeyword(tokens, level.need)) {
              fail(`Batareya olindi, lekin vazifa sharti bajarilmadi: kodda «${level.need}» ishlatilishi kerak.`);
              return;
            }
            setWin(true);
            setRunning(false);
            setMark(null);
            const count = code.split('\n').filter((s) => s.trim() && !s.trim().startsWith('//')).length;
            log(`✔ Vazifa bajarildi! Kod: ${count} qator.`, 's');
            play('correct');
            setWon(true);
            onAttempt({ ok: true, stars: 3 });
          }, ms);
          return false;
        }
        return ms;
      },
      onError: (e) => {
        if (e instanceof JErr) fail(`✖ ${e.line}-qator: ${e.message}`, e.line);
        else {
          console.error(e);
          fail('✖ Kutilmagan xato: ' + e.message);
        }
      },
      onDone: () => fail(`Dastur tugadi, lekin ${w.left} ta batareya qoldi. Robot qayerda to‘xtaganiga qarang.`),
    });
  };

  const stop = () => {
    const wasRunning = running;
    resetWorld();
    setRunning(false);
    setMark(null);
    setWon(null);
    log(wasRunning ? '■ To‘xtatildi.' : 'Robot boshlang‘ich joyiga qaytdi.', 'h');
  };

  const lineCount = code.split('\n').length;

  return (
    <main className="robo-main java">
      <section className="robo-left">
        <div className={`robo-info jv-theory ${theoryOpen ? '' : 'closed'}`}>
          <div className="jv-topic" onClick={() => setTheoryOpen((v) => !v)}>
            <span>{level.topic}</span>
            <button className="btn small-btn">{theoryOpen ? '▲ Yig‘ish' : '▼ Nazariya'}</button>
          </div>
          <h2>{level.title}</h2>
          {theoryOpen && (
            <>
              {level.theory.map((p, i) => (
                <p key={i}>{rich(p)}</p>
              ))}
              <pre className="jv-example">{level.example}</pre>
            </>
          )}
          <p className="jv-task">Vazifa: {level.task}</p>
        </div>
        <RobotBoard map={map} snap={snap} bump={bump} win={win} speed={ms} instant={instant} />
      </section>

      <section className="robo-right">
        <div className="jv-edhead">
          <span className="jv-file">Main.java</span>
          <div className="row-buttons">
            <button className="btn small-btn" onClick={undo} disabled={!editable}>
              ↶ Bekor qilish
            </button>
            <button
              className="btn small-btn"
              disabled={!editable}
              onClick={() => {
                apply(level.start, level.start.length);
                resetWorld();
              }}
            >
              ⟲ Boshlang‘ich kod
            </button>
            <button className={`btn small-btn ${keypad ? 'on' : ''}`} onClick={() => setKeypad((v) => !v)}>
              ⌨ Tugmalar
            </button>
          </div>
        </div>

        <div className="jv-editor">
          <div className="jv-gutter">
            <div style={{ transform: `translateY(${-scroll}px)` }}>
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className={mark?.line === i + 1 ? mark.kind : ''}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="jv-code">
            {mark && <div className={`jv-hl ${mark.kind}`} style={{ top: `calc(${mark.line - 1} * var(--lh) + .6em - ${scroll}px)` }} />}
            <textarea
              ref={taRef}
              value={code}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              inputMode={keypad ? 'none' : 'text'}
              readOnly={!editable}
              onKeyDown={onKeyDown}
              onScroll={(e) => setScroll(e.target.scrollTop)}
              onChange={(e) => {
                remember(false);
                setCode(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="jv-snips">
          {SNIPPETS.map(([label, txt, inline]) => (
            <button key={label} className="jv-snip" onPointerDown={keep} onClick={() => snippet(txt, inline)} disabled={!editable} title={txt}>
              {label}
            </button>
          ))}
        </div>
        {keypad && (
          <div className="jv-keys">
            {KEYS.map((k) => (
              <button key={k} className="jv-key" onPointerDown={keep} disabled={!editable} onClick={() => (k === '}' ? closeBrace() : insert(k))}>
                {k}
              </button>
            ))}
            <button className="jv-key wide" onPointerDown={keep} disabled={!editable} onClick={() => insert(' ')}>
              ␣
            </button>
            <button className="jv-key" onPointerDown={keep} onClick={() => moveCaret(-1)}>
              ←
            </button>
            <button className="jv-key" onPointerDown={keep} onClick={() => moveCaret(1)}>
              →
            </button>
            <button className="jv-key wide" onPointerDown={keep} disabled={!editable} onClick={backspace}>
              ⌫
            </button>
            <button className="jv-key wide" onPointerDown={keep} disabled={!editable} onClick={() => editable && newline()}>
              ↵
            </button>
          </div>
        )}

        <div className="robo-actions">
          <button className="btn primary big" disabled={(running && !waiting) || locked} onClick={() => run(false)}>
            ▶ {running ? 'Davom' : 'Ishga tushirish'}
          </button>
          <button className="btn big" disabled={(running && !waiting) || locked} onClick={() => run(true)} title="Har bosishda bitta qadam">
            ⏯ Qadam
          </button>
          <button className="btn big" onClick={stop}>
            {running ? '■ To‘xtatish' : '↺ Qayta'}
          </button>
          <SpeedPicker value={speed} onChange={setSpeed} />
        </div>

        <div className="jv-console" ref={consoleRef}>
          {lines.map((l, i) => (
            <div key={i} className={l.cls}>
              {l.text}
            </div>
          ))}
        </div>

        {won && practice && (
          <div className="robo-won">
            <span>
              <b>Barakalla!</b> {level.topic.split('·')[1].trim()} mavzusi o‘tildi.
            </span>
            {onNext ? (
              <button className="btn gold big" onClick={onNext}>
                Keyingi dars →
              </button>
            ) : (
              <span>🎓 Barcha darslar tugadi!</span>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
