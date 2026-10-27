// Robo Kod — bloklar bilan dasturlash: asosiy dastur (m) va P funksiyasi (p).
export const KOD_LEVELS = [
  { name: 'Birinchi qadam', grid: ['S..*'], dir: 1, par: 3, hint: 'Robot o‘ngga qarab turibdi. Uni batareyagacha yurgizing.' },
  {
    name: 'Burilish',
    grid: ['S..#', '##.#', '##.*'],
    dir: 1,
    par: 7,
    hint: 'Burilish robotni yurgizmaydi — faqat qaragan tomonini o‘zgartiradi.',
  },
  {
    name: 'Zinapoya',
    grid: ['S.####', '#..###', '##..##', '###..#', '####.*'],
    dir: 1,
    par: 9,
    hint: 'Bir xil harakat takrorlanyapti. Uni P ga yozing va Asosiy dasturdan bir necha marta chaqiring.',
  },
  {
    name: 'Orqaga qaytish',
    grid: ['*..S..*'],
    dir: 1,
    par: 8,
    hint: 'Orqaga qarash uchun ikki marta buriling. Uch qadamlik yurishni P ga yozsa bo‘ladi.',
  },
  {
    name: 'Kvadrat',
    grid: ['*...*', '.###.', '.###.', '.###.', 'S...*'],
    dir: 0,
    par: 8,
    hint: 'Uchta batareya, uchta bir xil tomon. Har tomon nimadan iborat?',
  },
  {
    name: 'Katta kvadrat',
    grid: ['*.....*', '.#####.', '.#####.', '.#####.', '.#####.', '.#####.', 'S.....*'],
    dir: 0,
    par: 11,
    hint: 'Bir tomon P ga sig‘maydi (6 ta joy). Tomonni teng ikki bo‘lakka bo‘ling.',
  },
  {
    name: 'Cheksiz yo‘l',
    grid: ['S.........*'],
    dir: 1,
    par: 3,
    hint: 'P o‘zini o‘zi chaqira oladi. Robot oxirgi batareyani olishi bilan to‘xtaydi.',
  },
  {
    name: 'Tog‘ga chiqish',
    grid: ['####*', '###..', '##..#', '#..##', 'S.###'],
    dir: 1,
    par: 6,
    hint: 'Zinapoyani eslang, lekin endi yuqoriga. P oxirida o‘zini chaqirsa-chi?',
  },
  {
    name: 'Ilon',
    grid: ['S....', '####.', '.....', '.####', '....*'],
    dir: 1,
    par: 15,
    hint: 'Uzun to‘g‘ri yo‘llar bir xil uzunlikda. Ularni P ga ajrating.',
  },
  {
    name: 'Spiral',
    grid: ['S....', '####.', '..*#.', '.###.', '.....'],
    dir: 1,
    par: 13,
    hint: 'Uchta tomon bir xil: yurish va burilish. Oxirgi qisqa bo‘laklarni qo‘lda yozing.',
  },
];

export const KOD_MAX = { m: 12, p: 6 };
export const KOD_NAMES = { F: 'Oldinga', L: 'Chapga buril', R: 'O‘ngga buril', P: 'P ni chaqir' };

export function kodStars(level, total) {
  return total <= level.par ? 3 : total <= level.par + 3 ? 2 : 1;
}

export class KodError extends Error {}

// Dasturni qadam-baqadam bajaradi; har bir buyruq world ga darhol qo'llanadi.
// Amal: { t: 'call'|'move'|'turn', r, i, ok?, visible }
export function* runKod(prog, world) {
  let steps = 0;
  function* exec(r, depth) {
    const list = prog[r];
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (c === 'P') {
        if (depth > 80) throw new KodError('P o‘zini juda ko‘p chaqirdi va robot adashib qoldi.');
        yield { t: 'call', r, i, visible: false };
        yield* exec('p', depth + 1);
        continue;
      }
      if (++steps > 400) throw new KodError('Robot juda uzoq yurdi. Dasturni qisqartiring.');
      if (c === 'F') yield { t: 'move', r, i, ok: world.step(), visible: true };
      else {
        world.turn(c === 'R' ? 1 : -1);
        yield { t: 'turn', r, i, visible: true };
      }
    }
  }
  yield* exec('m', 0);
}
