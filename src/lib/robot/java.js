// Java Robot — Java tilining kichik qismi uchun lekser, parser va interpretator.
// Xatolar o'zbekcha va qator raqami bilan beriladi.

export const JAVA_LESSONS = [
  {
    topic: '1-dars · Metodni chaqirish',
    title: 'Birinchi buyruq',
    theory: [
      'Java’da obyektga buyruq berish uchun uning **metodini chaqiramiz**: `obyekt.metod();`. Bu yerda `robot` — obyekt, `yur` — uning metodi.',
      'Har bir buyruq `;` bilan tugaydi. Java katta-kichik harfni farqlaydi — `robot.Yur()` ishlamaydi. Buyruqlar yuqoridan pastga bajariladi.',
    ],
    example: 'robot.yur();     // 1 katak oldinga\nrobot.ongga();   // o‘ngga buriladi (yurmaydi)\nrobot.chapga();  // chapga buriladi',
    task: 'Robotni batareyagacha olib boring.',
    grid: ['S...', '###.', '###*'],
    dir: 1,
    start: '// Robot o‘ngga qarab turibdi\nrobot.yur();\n',
  },
  {
    topic: '2-dars · O‘zgaruvchilar',
    title: 'int — sonni saqlash',
    theory: [
      '**O‘zgaruvchi** — nomi bor quti. `int qadam = 4;` — butun son saqlaydigan `qadam` nomli quti ochildi va ichiga 4 solindi.',
      '`robot.yur()` ichiga son bersangiz, robot shuncha katak yuradi. Masofa o‘zgarsa, kodni bitta joyda tuzatasiz. `System.out.println()` qiymatni konsolga chiqaradi.',
    ],
    example: 'int qadam = 2;\nrobot.yur(qadam);            // 2 katak yuradi\nSystem.out.println(qadam);   // konsolda: 2',
    task: 'int o‘zgaruvchi e’lon qiling va u bilan robotni batareyagacha olib boring.',
    grid: ['S....', '####.', '####.', '####.', '*....'],
    dir: 1,
    need: 'int',
    start: '// qadam o‘zgaruvchisiga to‘g‘ri sonni bering\nint qadam = 1;\nrobot.yur(qadam);\n',
  },
  {
    topic: '3-dars · for sikli',
    title: 'Takrorlash — for',
    theory: [
      'Bir xil buyruqlarni ko‘p yozish o‘rniga **for sikli** ishlatiladi. Qavs ichida uch qism bor:',
      '`int i = 0` — hisoblagich 0 dan boshlanadi; `i < 3` — shart rost bo‘lsa sikl davom etadi; `i++` — har aylanishdan keyin `i` bittaga oshadi. `{ }` ichidagi kod 3 marta bajariladi.',
    ],
    example: 'for (int i = 0; i < 3; i++) {\n    robot.yur();\n    System.out.println("aylanish: " + i);\n}',
    task: 'Zinapoyadan for sikli yordamida chiqing. Har bir zina qanday buyruqlardan iborat?',
    grid: ['S.####', '#..###', '##..##', '###..#', '####.*'],
    dir: 1,
    need: 'for',
    start: 'for (int i = 0; i < 1; i++) {\n    robot.yur();\n}\n',
  },
  {
    topic: '4-dars · while sikli',
    title: 'Devorgacha yur — while',
    theory: [
      '**while** sikli shart rost bo‘lgan paytgacha takrorlanadi. Necha marta aylanishini oldindan bilish shart emas.',
      '`robot.oldindaDevor()` — robot oldida yo‘l bo‘lmasa `true`, bo‘lsa `false` qaytaradi. `!` belgisi qiymatni teskarisiga aylantiradi: `!robot.oldindaDevor()` — «oldinda devor yo‘q».',
    ],
    example: 'while (!robot.oldindaDevor()) {\n    robot.yur();\n}\n// bu yerda robot devorga yetib keldi',
    task: 'Yo‘laklar uzunligini sanamang — while bilan devorgacha yuring.',
    grid: ['S.......', '#######.', '#######.', '#######.', '#######*'],
    dir: 1,
    need: 'while',
    start: 'while (!robot.oldindaDevor()) {\n    robot.yur();\n}\n',
  },
  {
    topic: '5-dars · if sharti',
    title: 'Qaror qabul qilish — if',
    theory: [
      '**if** shart rost bo‘lsa, `{ }` ichidagi kodni bajaradi. Yolg‘on bo‘lsa — o‘tkazib yuboradi (yoki `else` qismini bajaradi).',
      'Sikl ichida if qo‘ysangiz, robot har qadamda o‘zi qaror qiladi: oldinda devor bo‘lsa buriladi, bo‘lmasa yuradi.',
    ],
    example: 'if (robot.oldindaDevor()) {\n    robot.ongga();\n} else {\n    robot.yur();\n}',
    task: 'Spiral bo‘ylab yuring: robot har safar devorga yetganda o‘ngga burilsin. Siklda if ishlating.',
    grid: ['S....', '####.', '..*#.', '.###.', '.....'],
    dir: 1,
    need: 'if',
    start: 'for (int i = 0; i < 20; i++) {\n    robot.yur();\n}\n',
  },
  {
    topic: '6-dars · O‘zgaruvchini o‘zgartirish',
    title: 'Kichrayuvchi spiral',
    theory: [
      'O‘zgaruvchi qiymati dastur davomida o‘zgarishi mumkin: `n--` — bittaga kamaytiradi, `n = n - 2` — ikkiga.',
      'Har aylanishda masofa kamayib borsa, sikl va o‘zgaruvchini birga ishlating: `while (n > 0)` — n musbat bo‘lguncha.',
    ],
    example: 'int n = 3;\nwhile (n > 0) {\n    System.out.println(n);  // 3, 2, 1\n    n--;\n}',
    task: 'Har tomon oldingisidan 1 katak qisqa: 5, 4, 3, 2, 1. Bitta sikl va o‘zgaruvchi bilan yeching.',
    grid: ['S.....', '#####.', '##.*#.', '##.##.', '##....'],
    dir: 1,
    need: 'while',
    start: 'int n = 5;\n',
  },
];

const API = 'robot.yur(), robot.yur(n), robot.chapga(), robot.ongga(), robot.oldindaDevor(), System.out.println()';
const KNOWN = ['robot.yur', 'robot.chapga', 'robot.ongga', 'robot.oldindaDevor', 'System.out.println', 'System.out.print'];

export class JErr extends Error {
  constructor(line, msg) {
    super(msg);
    this.line = line;
  }
}
const err = (line, msg) => new JErr(line, msg);

/* ---------- Lekser ---------- */
const TWO = ['++', '--', '+=', '-=', '*=', '/=', '==', '!=', '<=', '>=', '&&', '||'];

export function lex(src) {
  const T = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') {
      line++;
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const startLine = line;
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') line++;
        i++;
      }
      if (i >= src.length) throw err(startLine, 'Izoh /* ochilgan, lekin */ bilan yopilmagan.');
      i += 2;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      if (/[A-Za-z_]/.test(src[j] || '')) throw err(line, 'O‘zgaruvchi nomi raqam bilan boshlanmaydi.');
      T.push({ t: 'num', v: Number(src.slice(i, j)), line });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      T.push({ t: 'id', v: src.slice(i, j), line });
      i = j;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let s = '';
      while (j < src.length && src[j] !== '"' && src[j] !== '\n') s += src[j++];
      if (src[j] !== '"') throw err(line, 'Matn qo‘shtirnoq (") bilan yopilmagan.');
      T.push({ t: 'str', v: s, line });
      i = j + 1;
      continue;
    }
    if ('“”«»'.includes(c)) throw err(line, `${c} o‘rniga oddiy qo‘shtirnoq (") yozing.`);
    if ("'‘’`".includes(c)) throw err(line, 'Matn uchun qo‘shtirnoq (") ishlatiladi, apostrof emas.');
    const d = src.slice(i, i + 2);
    if (TWO.includes(d)) {
      T.push({ t: 'op', v: d, line });
      i += 2;
      continue;
    }
    if ('+-*/%<>=!(){};,.'.includes(c)) {
      T.push({ t: 'op', v: c, line });
      i++;
      continue;
    }
    throw err(line, `Noma’lum belgi: ${c}`);
  }
  T.push({ t: 'eof', v: '', line });
  return T;
}

/* ---------- Parser ---------- */
const TYPES = ['int', 'boolean', 'String'];
const SEMI = 'Qator oxirida ‘;’ yetishmayapti.';
const LV = [['||'], ['&&'], ['==', '!='], ['<', '>', '<=', '>='], ['+', '-'], ['*', '/', '%']];

export function parse(T) {
  let p = 0;
  const next = () => T[p++];
  const is = (v) => T[p].t !== 'str' && T[p].v === v;
  const prevLine = () => (p > 0 ? T[p - 1].line : T[p].line);
  const expect = (v, msg, usePrev) => {
    if (!is(v)) throw err(usePrev ? prevLine() : T[p].line, msg || `‘${v}’ kutilgan edi.`);
    return next();
  };

  function stmt() {
    const tk = T[p];
    if (is('{')) {
      next();
      const b = [];
      while (!is('}')) {
        if (T[p].t === 'eof') throw err(tk.line, '‘{’ ochilgan, lekin ‘}’ bilan yopilmagan.');
        b.push(stmt());
      }
      next();
      return { k: 'block', b, line: tk.line };
    }
    if (is('}')) throw err(tk.line, 'Ortiqcha ‘}’ — unga mos ‘{’ yo‘q.');
    if (is(';')) {
      next();
      return { k: 'block', b: [], line: tk.line };
    }
    if (tk.t === 'id' && TYPES.includes(tk.v)) {
      const s = decl();
      expect(';', SEMI, true);
      return s;
    }
    if (is('for')) {
      next();
      expect('(', 'for dan keyin ‘(’ kerak.');
      let init = null;
      if (!is(';')) init = T[p].t === 'id' && TYPES.includes(T[p].v) ? decl() : simple();
      expect(';', 'for qavsi ichida qismlar ‘;’ bilan ajratiladi.');
      const cond = is(';') ? null : expr();
      expect(';', 'for qavsi ichida qismlar ‘;’ bilan ajratiladi.');
      const upd = is(')') ? null : simple();
      expect(')', 'for qavsi ‘)’ bilan yopilmagan.');
      return { k: 'for', init, cond, upd, body: body('for'), line: tk.line };
    }
    if (is('while')) {
      next();
      expect('(', 'while dan keyin ‘(’ kerak.');
      const cond = expr();
      expect(')', 'Shart qavsi ‘)’ bilan yopilmagan.');
      return { k: 'while', cond, body: body('while'), line: tk.line };
    }
    if (is('if')) {
      next();
      expect('(', 'if dan keyin ‘(’ kerak.');
      const cond = expr();
      expect(')', 'Shart qavsi ‘)’ bilan yopilmagan.');
      const th = body('if');
      let el = null;
      if (is('else')) {
        next();
        el = body('else');
      }
      return { k: 'if', cond, th, el, line: tk.line };
    }
    if (is('else')) throw err(tk.line, 'else faqat if dan keyin keladi.');
    const s = simple();
    expect(';', SEMI, true);
    return s;
  }
  // `while (...);` — Java'da xato emas, lekin sikl bo'sh qoladi va cheksiz aylanadi.
  function body(word) {
    if (is(';')) throw err(T[p].line, `${word} qavsidan keyin ‘;’ qo‘yilmaydi — aks holda ${word} bo‘sh qoladi.`);
    return stmt();
  }
  function decl() {
    const ty = next().v;
    const nm = next();
    if (nm.t !== 'id') throw err(nm.line, `${ty} dan keyin o‘zgaruvchi nomi kerak.`);
    let init = null;
    if (is('=')) {
      next();
      init = expr();
    }
    return { k: 'decl', ty, name: nm.v, init, line: nm.line };
  }
  function simple() {
    const tk = T[p];
    if (tk.t === 'id' && T[p + 1].t === 'op' && ['++', '--', '=', '+=', '-=', '*=', '/='].includes(T[p + 1].v)) {
      next();
      const op = next().v;
      if (op === '++' || op === '--') return { k: 'assign', name: tk.v, op, line: tk.line };
      return { k: 'assign', name: tk.v, op, val: expr(), line: tk.line };
    }
    const e = expr();
    if (e.k !== 'call') throw err(tk.line, 'Bu qator hech narsa qilmaydi. Metod chaqiring yoki o‘zgaruvchiga qiymat bering.');
    return { k: 'exprstmt', e, line: tk.line };
  }
  const expr = () => bin(0);
  function bin(l) {
    if (l === LV.length) return unary();
    let a = bin(l + 1);
    while (T[p].t === 'op' && LV[l].includes(T[p].v)) {
      const op = next();
      a = { k: 'bin', op: op.v, a, b: bin(l + 1), line: op.line };
    }
    return a;
  }
  function unary() {
    if (T[p].t === 'op' && (is('!') || is('-'))) {
      const op = next();
      return { k: 'un', op: op.v, a: unary(), line: op.line };
    }
    return primary();
  }
  function primary() {
    const tk = next();
    if (tk.t === 'num' || tk.t === 'str') return { k: 'lit', v: tk.v };
    if (tk.t === 'op' && tk.v === '(') {
      const e = expr();
      expect(')', 'Qavs ‘)’ bilan yopilmagan.');
      return e;
    }
    if (tk.t === 'id') {
      if (tk.v === 'true' || tk.v === 'false') return { k: 'lit', v: tk.v === 'true' };
      const path = [tk.v];
      while (is('.')) {
        next();
        const n = next();
        if (n.t !== 'id') throw err(n.line, 'Nuqtadan keyin metod nomi kerak.');
        path.push(n.v);
      }
      if (is('(')) {
        next();
        const args = [];
        if (!is(')')) {
          args.push(expr());
          while (is(',')) {
            next();
            args.push(expr());
          }
        }
        expect(')', 'Metod qavsi ‘)’ bilan yopilmagan.');
        return { k: 'call', path, args, line: tk.line };
      }
      if (path.length > 1) throw err(tk.line, `${path.join('.')} — metodni chaqirish uchun oxiriga () qo‘ying.`);
      return { k: 'var', name: tk.v, line: tk.line };
    }
    throw err(tk.line, tk.t === 'eof' ? 'Kod kutilmaganda tugadi.' : `Bu yerda ‘${tk.v}’ kutilmagan edi.`);
  }

  const b = [];
  while (T[p].t !== 'eof') b.push(stmt());
  return b;
}

/* ---------- Interpretator ---------- */
const TN = { int: 'int (butun son)', boolean: 'boolean (true/false)', String: 'String (matn)' };
const tyOf = (v) => (typeof v === 'number' ? 'int' : typeof v === 'boolean' ? 'boolean' : 'String');

// Amallar: { t: 'move', ok } | { t: 'turn' } | { t: 'print', text, nl } — hammasida line bor.
export function* interpret(prog, R) {
  let ops = 0;
  const scopes = [new Map()];
  const find = (n, line) => {
    for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(n)) return scopes[i].get(n);
    throw err(line, `‘${n}’ degan o‘zgaruvchi e’lon qilinmagan. Avval masalan: int ${n} = 0;`);
  };
  const tick = (line) => {
    if (++ops > 4000) throw err(line, 'Dastur juda uzoq ishladi — ehtimol sikl hech tugamayapti (cheksiz sikl).');
  };

  function ev(e) {
    switch (e.k) {
      case 'lit':
        return e.v;
      case 'var': {
        const c = find(e.name, e.line);
        if (c.v === undefined) throw err(e.line, `‘${e.name}’ ga hali qiymat berilmagan.`);
        return c.v;
      }
      case 'un': {
        const a = ev(e.a);
        if (e.op === '!') {
          if (typeof a !== 'boolean') throw err(e.line, '‘!’ faqat boolean bilan ishlaydi.');
          return !a;
        }
        if (typeof a !== 'number') throw err(e.line, '‘-’ faqat son bilan ishlaydi.');
        return -a;
      }
      case 'bin': {
        if (e.op === '&&' || e.op === '||') {
          const a = ev(e.a);
          if (typeof a !== 'boolean') throw err(e.line, `‘${e.op}’ faqat boolean qiymatlar bilan ishlaydi.`);
          if (e.op === '&&' && !a) return false;
          if (e.op === '||' && a) return true;
          const b = ev(e.b);
          if (typeof b !== 'boolean') throw err(e.line, `‘${e.op}’ faqat boolean qiymatlar bilan ishlaydi.`);
          return b;
        }
        const a = ev(e.a);
        const b = ev(e.b);
        if (e.op === '+' && (typeof a === 'string' || typeof b === 'string')) return String(a) + String(b);
        if (e.op === '==' || e.op === '!=') {
          if (tyOf(a) !== tyOf(b)) throw err(e.line, `${TN[tyOf(a)]} va ${TN[tyOf(b)]} ni solishtirib bo‘lmaydi.`);
          return e.op === '==' ? a === b : a !== b;
        }
        if (typeof a !== 'number' || typeof b !== 'number') throw err(e.line, `‘${e.op}’ amali faqat sonlar bilan ishlaydi.`);
        switch (e.op) {
          case '+':
            return (a + b) | 0;
          case '-':
            return (a - b) | 0;
          case '*':
            return Math.imul(a, b);
          case '/':
            if (b === 0) throw err(e.line, 'Nolga bo‘lib bo‘lmaydi (ArithmeticException).');
            return Math.trunc(a / b);
          case '%':
            if (b === 0) throw err(e.line, 'Nolga bo‘lib bo‘lmaydi (ArithmeticException).');
            return a % b;
          case '<':
            return a < b;
          case '>':
            return a > b;
          case '<=':
            return a <= b;
          case '>=':
            return a >= b;
        }
        break;
      }
      case 'call': {
        const k = e.path.join('.');
        if (k === 'robot.oldindaDevor') {
          argc(e, 0);
          tick(e.line);
          return R.wallAhead();
        }
        if (KNOWN.includes(k)) throw err(e.line, `${k}() qiymat qaytarmaydi — uni alohida qatorda yozing.`);
        throw unknown(e);
      }
    }
    throw err(e.line, 'Ifodani tushunib bo‘lmadi.');
  }
  function argc(e, n) {
    if (e.args.length !== n)
      throw err(e.line, `${e.path.join('.')}() ${n ? n + ' ta qiymat' : 'hech qanday qiymat'} qabul qiladi, siz ${e.args.length} ta berdingiz.`);
  }
  function unknown(e) {
    const k = e.path.join('.');
    const near = KNOWN.find((x) => x.toLowerCase() === k.toLowerCase());
    return err(e.line, near ? `${k}() yo‘q. Java katta-kichik harfni farqlaydi: ${near}() deb yozing.` : `${k}() degan metod yo‘q. Mavjudlari: ${API}.`);
  }
  function cond(e, line, w) {
    const v = ev(e);
    if (typeof v !== 'boolean') throw err(line, `${w} sharti true yoki false bo‘lishi kerak.`);
    return v;
  }
  function* ex(s) {
    tick(s.line);
    switch (s.k) {
      case 'block':
        scopes.push(new Map());
        try {
          for (const x of s.b) yield* ex(x);
        } finally {
          scopes.pop();
        }
        return;
      case 'decl': {
        const sc = scopes[scopes.length - 1];
        if (sc.has(s.name))
          throw err(s.line, `‘${s.name}’ allaqachon e’lon qilingan. Qayta ishlatish uchun oldidagi turini (${s.ty}) olib tashlang.`);
        let v;
        if (s.init) {
          v = ev(s.init);
          if (tyOf(v) !== s.ty) throw err(s.line, `${s.name} — ${TN[s.ty]} turida, unga ${TN[tyOf(v)]} berib bo‘lmaydi.`);
        }
        sc.set(s.name, { ty: s.ty, v });
        return;
      }
      case 'assign': {
        const c = find(s.name, s.line);
        if (s.op !== '=' && c.v === undefined) throw err(s.line, `‘${s.name}’ ga hali qiymat berilmagan.`);
        let v;
        if (s.op === '++' || s.op === '--') {
          if (c.ty !== 'int') throw err(s.line, `${s.op} faqat int bilan ishlaydi.`);
          v = c.v + (s.op === '++' ? 1 : -1);
        } else if (s.op === '=') v = ev(s.val);
        else v = ev({ k: 'bin', op: s.op[0], a: { k: 'lit', v: c.v }, b: s.val, line: s.line });
        if (tyOf(v) !== c.ty) throw err(s.line, `${s.name} — ${TN[c.ty]} turida, unga ${TN[tyOf(v)]} berib bo‘lmaydi.`);
        c.v = v;
        return;
      }
      case 'if':
        if (cond(s.cond, s.line, 'if')) yield* ex(s.th);
        else if (s.el) yield* ex(s.el);
        return;
      case 'while':
        while (cond(s.cond, s.line, 'while')) {
          tick(s.line);
          yield* ex(s.body);
        }
        return;
      case 'for':
        scopes.push(new Map());
        try {
          if (s.init) yield* ex(s.init);
          while (!s.cond || cond(s.cond, s.line, 'for')) {
            tick(s.line);
            yield* ex(s.body);
            if (s.upd) yield* ex(s.upd);
          }
        } finally {
          scopes.pop();
        }
        return;
      case 'exprstmt':
        yield* call(s.e);
        return;
    }
  }
  function* call(e) {
    const k = e.path.join('.');
    if (k === 'System.out.println' || k === 'System.out.print') {
      if (e.args.length > 1) throw err(e.line, `${k}() bitta qiymat qabul qiladi. Bir nechtasini + bilan ulang.`);
      yield { t: 'print', text: e.args.length ? String(ev(e.args[0])) : '', nl: k.endsWith('ln'), line: e.line, visible: false };
      return;
    }
    if (k === 'robot.yur') {
      let n = 1;
      if (e.args.length === 1) {
        n = ev(e.args[0]);
        if (typeof n !== 'number') throw err(e.line, 'robot.yur() ichiga butun son berilishi kerak.');
        if (n < 0) throw err(e.line, 'Robot orqaga yura olmaydi — son manfiy bo‘lmasin.');
      } else if (e.args.length > 1) throw err(e.line, 'robot.yur() ko‘pi bilan bitta son qabul qiladi.');
      for (let i = 0; i < n; i++) {
        tick(e.line);
        yield { t: 'move', ok: R.step(), line: e.line, visible: true };
      }
      return;
    }
    if (k === 'robot.chapga' || k === 'robot.ongga') {
      argc(e, 0);
      R.turn(k === 'robot.ongga' ? 1 : -1);
      yield { t: 'turn', line: e.line, visible: true };
      return;
    }
    if (k === 'robot.oldindaDevor') {
      argc(e, 0);
      return;
    }
    throw unknown(e);
  }
  for (const s of prog) yield* ex(s);
}

// Vazifa sharti: kodda kerakli kalit so'z (matn va izohdan tashqarida) bormi.
export const usesKeyword = (tokens, word) => tokens.some((k) => k.t !== 'str' && k.v === word);
