import { readSheet } from 'read-excel-file/browser';
import writeExcelFile from 'write-excel-file/browser';
import { filledItems, filledPairs, newQuestion, newSet } from './util.js';

// Ustunlar: o'qituvchi Excel'da shu tartibda to'ldiradi.
const HEADERS = ['Turi', 'Savol', 'Kod tili', 'Kod', 'A', 'B', 'C', 'D', 'E', 'F', 'To‘g‘ri javob', 'Izoh'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const TYPE_NAMES = { choice: 'variant', tf: 'togri-notogri', input: 'javob', order: 'tartib', match: 'moslash' };
const LANG_NAMES = { python: 'python', pascal: 'pascal', cpp: 'c++' };

// "To‘g‘ri", "to'g'ri", "TOGRI" — hammasi bir xil ko'rinishga keltiriladi.
const simplify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[‘’ʻʼ'`´]/g, '')
    .replace(/\s+/g, '')
    .trim();

const TYPE_ALIASES = {
  variant: 'choice', variantli: 'choice', test: 'choice',
  'togri-notogri': 'tf', togrinotogri: 'tf', 'togri/notogri': 'tf', tf: 'tf',
  javob: 'input', yozish: 'input', raqam: 'input',
  tartib: 'order', tartiblash: 'order',
  moslash: 'match', moslashtirish: 'match',
};

const TRUE_WORDS = ['togri', 'ha', 'rost', '1', 'true', 'да'];
const FALSE_WORDS = ['notogri', 'yoq', 'yolgon', '0', 'false', 'нет'];

const cellText = (value) => (value === null || value === undefined ? '' : String(value).trim());

function parseRow(cells, rowNumber) {
  const get = (name) => cellText(cells[HEADERS.indexOf(name)]);
  const type = TYPE_ALIASES[simplify(get('Turi'))];
  if (!type) throw new Error(`${rowNumber}-qator: “Turi” noto‘g‘ri (${get('Turi') || 'bo‘sh'})`);

  const q = newQuestion(type);
  q.text = get('Savol');
  q.code = cellText(cells[HEADERS.indexOf('Kod')]);
  const lang = simplify(get('Kod tili'));
  q.lang = q.code ? Object.keys(LANG_NAMES).find((id) => LANG_NAMES[id] === lang || id === lang) || 'python' : '';
  q.explanation = get('Izoh');
  const letters = LETTERS.map(get);
  const answer = get('To‘g‘ri javob');

  if (type === 'choice') {
    q.options = letters.slice(0, 4);
    const letterIndex = LETTERS.indexOf(answer.toUpperCase());
    q.correct = letterIndex >= 0 ? letterIndex : q.options.findIndex((o) => simplify(o) === simplify(answer));
    if (q.correct < 0 || q.correct > 3) throw new Error(`${rowNumber}-qator: to‘g‘ri javob A, B, C yoki D bo‘lishi kerak`);
  } else if (type === 'tf') {
    const word = simplify(answer);
    if (TRUE_WORDS.includes(word)) q.correct = 0;
    else if (FALSE_WORDS.includes(word)) q.correct = 1;
    else throw new Error(`${rowNumber}-qator: to‘g‘ri javob “to‘g‘ri” yoki “noto‘g‘ri” bo‘lishi kerak`);
  } else if (type === 'input') {
    q.answer = answer;
    if (/^[0-9a-f]+$/i.test(answer) && /[a-f]/i.test(answer)) q.keypad = 'hex';
  } else if (type === 'order') {
    q.items = letters.filter(Boolean);
  } else if (type === 'match') {
    q.pairs = letters.filter(Boolean).map((cell) => {
      const [left, ...rest] = cell.split('=');
      return { left: left.trim(), right: rest.join('=').trim() };
    });
  }
  return q;
}

// Natija: { set, errors } — xato qatorlar o'tkazib yuboriladi, qolganlari import qilinadi.
export async function importSetFromExcel(file) {
  const rows = await readSheet(file);
  const header = (rows[0] || []).map(simplify);
  if (simplify(HEADERS[0]) !== header[0] || !header.includes(simplify('Savol'))) {
    throw new Error('Birinchi qatorda shablondagi ustun nomlari bo‘lishi kerak (Turi, Savol, …). Shablonni yuklab olib, shunga to‘ldiring.');
  }
  // Ustunlar tartibi shablondan farq qilsa ham, nomi bo'yicha topamiz.
  const columnIndex = HEADERS.map((h) => header.indexOf(simplify(h)));
  const questions = [];
  const errors = [];
  rows.slice(1).forEach((row, i) => {
    const cells = columnIndex.map((c) => (c >= 0 ? row[c] : null));
    if (cells.every((c) => cellText(c) === '')) return;
    try {
      questions.push(parseRow(cells, i + 2));
    } catch (error) {
      errors.push(error.message);
    }
  });
  const set = { ...newSet(file.name.replace(/\.xlsx$/i, '')), questions };
  return { set, errors };
}

const headerCell = (value) => ({ value, fontWeight: 'bold', backgroundColor: '#1f6f6a', textColor: '#ffffff' });
const COLUMNS = [12, 50, 10, 30, 22, 22, 22, 22, 18, 18, 16, 40].map((width) => ({ width }));

function questionToRow(q) {
  const letters = Array(6).fill('');
  let answer = '';
  if (q.type === 'choice') {
    q.options.forEach((o, i) => (letters[i] = o));
    answer = LETTERS[q.correct];
  } else if (q.type === 'tf') {
    answer = q.correct === 0 ? 'to‘g‘ri' : 'noto‘g‘ri';
  } else if (q.type === 'input') {
    answer = q.answer;
  } else if (q.type === 'order') {
    filledItems(q).forEach((s, i) => (letters[i] = s));
  } else if (q.type === 'match') {
    filledPairs(q).forEach((p, i) => (letters[i] = `${p.left} = ${p.right}`));
  }
  return [TYPE_NAMES[q.type], q.text, LANG_NAMES[q.lang] || '', q.code, ...letters, answer, q.explanation].map((value) => ({
    value: String(value ?? ''),
    wrap: true,
    alignVertical: 'top',
  }));
}

const INSTRUCTIONS = [
  ['Ustun', 'Nima yoziladi'],
  ['Turi', 'variant · togri-notogri · javob · tartib · moslash'],
  ['Savol', 'Savol matni'],
  ['Kod tili, Kod', 'Ixtiyoriy: python / pascal / c++ va kod parchasi (Alt+Enter — yangi qator)'],
  ['A–D (variant)', 'Javob variantlari (2–4 ta). To‘g‘ri javob ustuniga harfini yozing: A, B, C yoki D'],
  ['togri-notogri', 'To‘g‘ri javob ustuniga: to‘g‘ri yoki noto‘g‘ri'],
  ['javob', 'To‘g‘ri javob ustuniga javobni yozing. Bir nechta bo‘lsa “;” bilan: 0.5; .5'],
  ['A–F (tartib)', 'Qadamlarni TO‘G‘RI tartibda yozing (3–6 ta). O‘yinda aralashtiriladi'],
  ['A–E (moslash)', 'Har bir katakka juftlik: chap = o‘ng   (masalan: Monitor = Chiqarish)'],
  ['Izoh', 'Ixtiyoriy: javobdan keyin ko‘rsatiladigan yechim'],
  ['Rasm', 'Excel orqali rasm qo‘shilmaydi — import qilgandan keyin muharrirda qo‘shing'],
];

async function save(sheets, fileName) {
  const blob = await writeExcelFile(sheets).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const instructionsSheet = () => ({
  sheet: 'Yo‘riqnoma',
  columns: [{ width: 18 }, { width: 90 }],
  data: INSTRUCTIONS.map((row, i) => row.map((value) => (i === 0 ? headerCell(value) : { value, wrap: true }))),
});

export function downloadExcelTemplate() {
  const examples = [
    { ...newQuestion('choice'), text: '1 bayt necha bitga teng?', options: ['8', '2', '10', '1024'], correct: 0 },
    { ...newQuestion('tf'), text: 'Python tilida # belgisi izoh boshlaydi.', correct: 0 },
    { ...newQuestion('input'), text: '1011₂ sonini o‘nlik sanoq sistemasiga o‘tkazing.', answer: '11', explanation: '8 + 2 + 1 = 11' },
    { ...newQuestion('input'), text: 'Dastur nima chiqaradi?', lang: 'python', code: 'x = 5\nprint(x * 2)', answer: '10' },
    { ...newQuestion('order'), text: 'Xotira birliklarini kichigidan kattasiga tartiblang.', items: ['Bit', 'Bayt', 'Kilobayt', 'Megabayt'] },
    {
      ...newQuestion('match'),
      text: 'Qurilmani vazifasi bilan moslang.',
      pairs: [
        { left: 'Klaviatura', right: 'Kiritish' },
        { left: 'Monitor', right: 'Ko‘rsatish' },
        { left: 'Printer', right: 'Chop etish' },
      ],
    },
  ];
  return save(
    [
      { sheet: 'Savollar', columns: COLUMNS, stickyRowsCount: 1, data: [HEADERS.map(headerCell), ...examples.map(questionToRow)] },
      instructionsSheet(),
    ],
    'Bilim Arena — savollar shabloni.xlsx',
  );
}

export function exportSetToExcel(set) {
  return save(
    [
      { sheet: 'Savollar', columns: COLUMNS, stickyRowsCount: 1, data: [HEADERS.map(headerCell), ...set.questions.map(questionToRow)] },
      instructionsSheet(),
    ],
    `${set.name}.xlsx`,
  );
}
