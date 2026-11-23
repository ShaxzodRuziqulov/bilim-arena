// Darajalar xaritasi: 30 × 17 katak, har katak 32 px.
//  #  devor            P  o'yinchi boshlanishi     E  chiqish
//  a b  tugma (pol)    A B  eshik — mos tugma bosilganda ochiladi
//  ^  tikan            v < >  lazer (pastga / chapga / o'ngga otadi)
// Qo'shimcha sozlamalar:
//  timers: { a: 3 }  — a tugmasi vaqtli: bosilganda eshik 3 soniya ochiq turadi
//  platforms: [{ x, y, w, toX, toY, period }] — harakatlanuvchi platforma (katakda, period soniyada)
//  par: { shadows, seconds } — 2- va 3-yulduz shartlari

export const TILE = 32;
export const COLS = 30;
export const ROWS = 17;

const FULL = '#'.repeat(COLS);
const EMPTY = '#' + ' '.repeat(COLS - 2) + '#';
const rows = (line, n) => Array(n).fill(line);

export const WORLDS = [
  {
    name: 'Uyg‘onish',
    about: 'Tugmalar, eshiklar va tikanlar. Soya — sizning yordamchingiz.',
    levels: [
      {
        name: 'Birinchi soya',
        maxShadows: 2,
        par: { shadows: 1, seconds: 5 },
        hint: 'Eshik tugma bosilganda ochiladi. Q — yozishni boshlang, tugma ustiga boring va Q ni yana bosing. Soya tugmani ushlab turadi.',
        touchHint: '● ni bosib yozishni boshlang. Pol tugmasiga yuring va ● ni yana bosing. Soya tugmani ushlab turadi.',
        map: [
          FULL,
          ...rows('#                   #        #', 10),
          ...rows('#                   A        #', 3),
          '#  P       a        A     E  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Tikanlar',
        maxShadows: 2,
        par: { shadows: 1, seconds: 4 },
        hint: 'Tugma tikanlar ortida. Xavfli yo‘lni bir marta yaxshilab bosib o‘ting — keyin soya qiladi, siz esa eshikdan xotirjam o‘tasiz.',
        map: [
          FULL,
          ...rows('#     #                      #', 10),
          '#     A                      #',
          '#     A          ##  ##      #',
          '#     A                      #',
          '#  E  A    P   ^^^^^^^^^   a #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Ikki soya',
        maxShadows: 3,
        par: { shadows: 2, seconds: 5 },
        hint: 'Ikki eshik, ikki tugma. Ikkinchi tugmaga yetish uchun birinchi eshik ochiq bo‘lishi kerak. Kim qaysi tugmani ushlab turadi?',
        map: [
          FULL,
          ...rows('#         #         #        #', 10),
          ...rows('#         A         B        #', 3),
          '#  P  a   A    b    B     E  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Zinapoya',
        maxShadows: 2,
        par: { shadows: 1, seconds: 5 },
        hint: 'Soya qattiq — uning boshiga chiqish mumkin. Chiqish juda baland: soyani devor yoniga olib boring va undan sakrang.',
        map: [
          FULL,
          ...rows(EMPTY, 8),
          '#                         E  #',
          ...rows('#                   ##########', 4),
          '#  P                ##########',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Ikki qavat',
        maxShadows: 3,
        par: { shadows: 2, seconds: 6 },
        hint: 'Bitta soya yetmaydi. Ikkinchi soya birinchisining boshiga chiqib tursin — ikki qavatli zinapoya bo‘ladi.',
        map: [
          FULL,
          ...rows(EMPTY, 7),
          '#                         E  #',
          ...rows('#                   ##########', 5),
          '#  P                ##########',
          FULL,
          FULL,
        ],
      },
    ],
  },
  {
    name: 'Nur va vaqt',
    about: 'Lazerlar va vaqtli tugmalar. Hammasi soniyalar bilan o‘lchanadi.',
    levels: [
      {
        name: 'Lazerlar',
        maxShadows: 3,
        par: { shadows: 2, seconds: 7 },
        hint: 'Lazer o‘ldiradi, lekin vaqti-vaqti bilan o‘chadi, soya esa nurni to‘sadi. Lazer o‘chganda ostiga boring va Q bosing — soya nurni to‘sib turadi.',
        touchHint: 'Lazer o‘chganda uning ostiga boring va yozuvni ● bilan tugating. Soya nurni to‘sib turadi.',
        map: [
          FULL,
          '#           v       v        #',
          ...rows(EMPTY, 12),
          '#  P                      E  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Vaqtli eshik',
        maxShadows: 2,
        par: { shadows: 1, seconds: 4 },
        timers: { a: 3 },
        hint: '⏱ tugma eshikni faqat 3 soniyaga ochadi. Yolg‘iz ulgurmaysiz — soya to‘g‘ri paytda bossin, siz esa eshik oldida tayyor turing.',
        map: [
          FULL,
          ...rows('#                         #  #', 10),
          ...rows('#                         A  #', 3),
          '#a           P            A E#',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Nur ortidagi tugma',
        maxShadows: 2,
        par: { shadows: 1, seconds: 5 },
        hint: 'Tugma lazer ortida, eshik esa teskari tomonda. Lazer o‘chgan paytni kutib o‘ting.',
        map: [
          FULL,
          '#    #            v          #',
          ...rows('#    #                       #', 9),
          ...rows('#    A                       #', 3),
          '# E  A       P            a  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Ikki taymer',
        maxShadows: 3,
        par: { shadows: 2, seconds: 4 },
        timers: { a: 2, b: 2 },
        hint: 'Ikki eshik, har biri 2 soniya ochiq. B tugmasi tokchada. Soyalar tugmalarni shunday bossinki, siz to‘xtamasdan ikkalasidan o‘ting.',
        map: [
          FULL,
          ...rows('#                #     #     #', 9),
          '#   b            #     #     #',
          '#  ###           A     B     #',
          ...rows('#                A     B     #', 2),
          '#a       P       A     B   E #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Nurli zinapoya',
        maxShadows: 3,
        par: { shadows: 2, seconds: 8 },
        laser: { on: 1.6, off: 1.6 },
        hint: 'Zinapoya kerak bo‘lgan joyda lazer bor. Soyani u yerga lazer o‘chganda qo‘ying, o‘zingiz ham keyingi o‘chishda chiqing. Birinchi lazerni esa ikkinchi soya to‘ssin.',
        map: [
          FULL,
          '#         v       v          #',
          ...rows(EMPTY, 7),
          '#                         E  #',
          ...rows('#                  ###########', 4),
          '#  P               ###########',
          FULL,
          FULL,
        ],
      },
    ],
  },
  {
    name: 'Harakat',
    about: 'Harakatlanuvchi platformalar va havoda qotgan soyalar.',
    levels: [
      {
        name: 'Platforma',
        maxShadows: 2,
        par: { shadows: 1, seconds: 10 },
        platforms: [{ x: 7, y: 12, w: 3, toX: 18, period: 5 }],
        hint: 'Platforma har urinishda bir xil harakatlanadi — vaqtni hisoblang. Tugma tikanlarning bu tomonida.',
        map: [
          FULL,
          ...rows('#                       #    #', 10),
          ...rows('#                       A    #', 3),
          '#P  a  ^^^^^^^^^^^^^^   A  E #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Lift',
        maxShadows: 2,
        par: { shadows: 1, seconds: 6 },
        platforms: [{ x: 8, y: 13, w: 3, toY: 5, period: 6 }],
        hint: 'Tugma yuqori tokchada. Lift bilan chiqing — yoki buni soyaga topshiring.',
        map: [
          FULL,
          ...rows('#                     #      #', 4),
          '#              a      #      #',
          '#          #######    #      #',
          ...rows('#                     #      #', 4),
          ...rows('#                     A      #', 3),
          '#  P                  A   E  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Taymer va platforma',
        maxShadows: 2,
        par: { shadows: 1, seconds: 6 },
        timers: { a: 3 },
        platforms: [{ x: 11, y: 12, w: 3, toX: 20, period: 5 }],
        hint: '⏱ tugma tikanlar ortida, eshik esa sizning yoningizda. Soya platformada o‘tib, siz eshik oldida turganingizda bossin.',
        map: [
          FULL,
          ...rows('#    #                       #', 10),
          ...rows('#    A                       #', 3),
          '# E  A   P ^^^^^^^^^^^^   a  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Havodagi pog‘ona',
        maxShadows: 2,
        par: { shadows: 1, seconds: 6 },
        hint: 'Yozuvni havoda to‘xtatsangiz, soya o‘sha joyda qotib qoladi. Tikanlar ustida sakrab, tushayotganda Q ni bosing — pog‘ona tayyor.',
        touchHint: 'Tikanlar ustidan sakrang va tushayotganda ● ni bosing. Soya havoda pog‘ona bo‘lib qoladi.',
        map: [
          FULL,
          ...rows(EMPTY, 13),
          '#  P   ^^^^^^^^^          E  #',
          FULL,
          FULL,
        ],
      },
      {
        name: 'Hammasi birga',
        maxShadows: 3,
        par: { shadows: 2, seconds: 10 },
        platforms: [{ x: 11, y: 12, w: 3, toX: 18, period: 5 }],
        hint: 'Tugma, lazer va platforma. Kim qayerda turishini oldindan rejalashtiring. Diqqat: lazer ustunida turib sakrasangiz, nurga kirasiz.',
        map: [
          FULL,
          '#        v              #    #',
          ...rows('#                       #    #', 9),
          ...rows('#                       A    #', 3),
          '# P  a     ^^^^^^^^^^   A  E #',
          FULL,
          FULL,
        ],
      },
    ],
  },
];

/** Barcha darajalar ketma-ket: id "1-3", dunyo va raqam bilan. */
export const LEVELS = WORLDS.flatMap((world, wi) =>
  world.levels.map((level, li) => ({ ...level, id: `${wi + 1}-${li + 1}`, worldIndex: wi, worldName: world.name })),
);

/** 1 yulduz — o'tildi; +1 — soyalar par'dan ko'p emas; +1 — vaqt par'dan ko'p emas. */
export function starsFor(level, { shadows, seconds }) {
  return 1 + (shadows <= level.par.shadows ? 1 : 0) + (seconds <= level.par.seconds ? 1 : 0);
}

/**
 * Devor kataklarini katta to'rtburchaklarga birlashtiradi (ochko'z usul: avval eniga, keyin bo'yiga).
 * Alohida kataklar orasidagi "choklar"da o'yinchi sakrayotganda ilinib qoladi — birlashtirish buni yo'qotadi.
 */
export function mergeCells(cells) {
  const has = new Set(cells.map((c) => `${c.x},${c.y}`));
  const used = new Set();
  const free = (x, y) => has.has(`${x},${y}`) && !used.has(`${x},${y}`);
  const rects = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!free(x, y)) continue;
      let w = 1;
      while (free(x + w, y)) w++;
      let h = 1;
      while (Array.from({ length: w }, (_, i) => free(x + i, y + h)).every(Boolean)) h++;
      for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) used.add(`${x + dx},${y + dy}`);
      rects.push({ x, y, w, h });
    }
  }
  return rects;
}

/** Xaritani o'yin ob'ektlariga ajratadi (katak koordinatalarida). */
export function parseLevel(map) {
  const out = { walls: [], spikes: [], lasers: [], doors: {}, buttons: {}, start: null, exit: null };
  map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '#') out.walls.push({ x, y });
      else if (ch === '^') out.spikes.push({ x, y });
      else if (ch === 'v' || ch === '<' || ch === '>') out.lasers.push({ x, y, dir: ch });
      else if (ch === 'P') out.start = { x, y };
      else if (ch === 'E') out.exit = { x, y };
      else if (ch >= 'A' && ch <= 'Z') (out.doors[ch] ||= []).push({ x, y });
      else if (ch >= 'a' && ch <= 'z') (out.buttons[ch] ||= []).push({ x, y });
    });
  });
  return out;
}
