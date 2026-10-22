import { newQuestion, uid } from './util.js';

const q = (fields) => ({ ...newQuestion(fields.type), ...fields });

// Birinchi ishga tushirishda o'qituvchi darhol sinab ko'rishi uchun namunaviy to'plam.
export const SAMPLE_SETS = () => [
  {
    id: uid(),
    name: 'Informatika — namuna to‘plam',
    subject: 'Informatika',
    grade: '7',
    questions: [
      q({
        type: 'choice',
        text: 'Kompyuterning «miyasi» deb qaysi qurilma ataladi?',
        options: ['Protsessor (CPU)', 'Monitor', 'Sichqoncha', 'Printer'],
        correct: 0,
        explanation: 'Protsessor barcha hisob-kitob va buyruqlarni bajaradi.',
      }),
      q({
        type: 'choice',
        text: '1 bayt necha bitga teng?',
        options: ['8', '2', '10', '1024'],
        correct: 0,
      }),
      q({
        type: 'input',
        text: '1011₂ sonini o‘nlik sanoq sistemasiga o‘tkazing.',
        answer: '11',
        explanation: '1·8 + 0·4 + 1·2 + 1·1 = 11',
      }),
      q({
        type: 'input',
        text: '25₁₀ sonini ikkilik sanoq sistemasida yozing.',
        answer: '11001',
        explanation: '25 = 16 + 8 + 1 → 11001₂',
      }),
      q({
        type: 'choice',
        text: 'Dastur ekranga nima chiqaradi?',
        code: 'print(3 * "ab")',
        lang: 'python',
        options: ['ababab', '3ab', 'ab3', 'Xatolik'],
        correct: 0,
        explanation: 'Satrni songa ko‘paytirish uni shuncha marta takrorlaydi.',
      }),
      q({
        type: 'input',
        text: 'Dastur ekranga qaysi sonni chiqaradi?',
        code: 'x = 5\nx = x + 3\nprint(x * 2)',
        lang: 'python',
        answer: '16',
        explanation: 'x = 5 + 3 = 8, keyin 8 · 2 = 16',
      }),
      q({
        type: 'tf',
        text: 'RAM — doimiy xotira: kompyuter o‘chganda ham undagi maʼlumot saqlanib qoladi.',
        correct: 1,
        explanation: 'RAM — tezkor xotira, kompyuter o‘chganda tozalanadi.',
      }),
      q({
        type: 'choice',
        text: 'Quyidagilardan qaysi biri kiritish qurilmasi?',
        options: ['Klaviatura', 'Monitor', 'Karnay', 'Printer'],
        correct: 0,
      }),
      q({
        type: 'input',
        text: '1 KB (kilobayt) necha baytga teng?',
        answer: '1024',
      }),
      q({
        type: 'tf',
        text: 'Python tilida # belgisi izoh (komment) boshlaydi.',
        correct: 0,
      }),
      q({
        type: 'choice',
        text: 'Ekranga qaysi sonlar chiqadi?',
        code: 'for i in range(3):\n    print(i)',
        lang: 'python',
        options: ['0 1 2', '1 2 3', '0 1 2 3', '3'],
        correct: 0,
        explanation: 'range(3) — 0 dan boshlanib 3 gacha (3 kirmaydi).',
      }),
      q({
        type: 'input',
        text: '15₁₀ sonini o‘n oltilik sanoq sistemasida yozing.',
        answer: 'F',
        keypad: 'hex',
        explanation: '10 → A, 11 → B, … 15 → F',
      }),
      q({
        type: 'choice',
        text: 'Ekranga nima chiqadi?',
        code: 'var a, b: integer;\nbegin\n  a := 7;\n  b := a mod 3;\n  writeln(b);\nend.',
        lang: 'pascal',
        options: ['1', '2', '3', '0'],
        correct: 0,
        explanation: 'mod — bo‘linmaning qoldig‘i: 7 = 2·3 + 1',
      }),
      q({
        type: 'choice',
        text: '.xlsx kengaytmali fayl qaysi dasturga tegishli?',
        options: ['MS Excel', 'MS Word', 'PowerPoint', 'Paint'],
        correct: 0,
      }),
      q({
        type: 'tf',
        text: 'Internet va World Wide Web (WWW) — bir xil narsa.',
        correct: 1,
        explanation: 'WWW — Internet orqali ishlaydigan xizmatlardan biri, xolos.',
      }),
      q({
        type: 'choice',
        text: 'Mantiqiy ifodaning qiymatini toping: 1 AND 0 OR 1',
        options: ['1 (rost)', '0 (yolg‘on)'],
        correct: 0,
        explanation: 'Avval AND: 1 AND 0 = 0, keyin 0 OR 1 = 1',
      }),
      q({
        type: 'choice',
        text: 'Algoritmning har bir qadami aniq va bir maʼnoli bo‘lishi — bu qaysi xossa?',
        options: ['Aniqlik', 'Diskretlik', 'Ommaviylik', 'Natijaviylik'],
        correct: 0,
      }),
      q({
        type: 'order',
        text: 'Kompyuterni to‘g‘ri o‘chirish qadamlarini tartib bilan bosing.',
        items: ['Ishni saqlash', 'Dasturlarni yopish', 'Start (Pusk) → O‘chirish', 'Monitorni o‘chirish'],
        explanation: 'Avval maʼlumotni saqlaymiz, keyin dasturlarni yopib, tizimni o‘chiramiz.',
      }),
      q({
        type: 'order',
        text: 'Xotira birliklarini kichigidan kattasiga qarab tartiblang.',
        items: ['Bit', 'Bayt', 'Kilobayt', 'Megabayt', 'Gigabayt'],
      }),
      q({
        type: 'match',
        text: 'Qurilmani uning vazifasi bilan moslang.',
        pairs: [
          { left: 'Klaviatura', right: 'Matn kiritish' },
          { left: 'Monitor', right: 'Tasvirni ko‘rsatish' },
          { left: 'Printer', right: 'Qog‘ozga chiqarish' },
          { left: 'Mikrofon', right: 'Ovoz yozish' },
        ],
      }),
      q({
        type: 'match',
        text: 'Fayl kengaytmasini dastur bilan moslang.',
        pairs: [
          { left: '.docx', right: 'Word' },
          { left: '.xlsx', right: 'Excel' },
          { left: '.pptx', right: 'PowerPoint' },
          { left: '.py', right: 'Python' },
        ],
      }),
      q({
        type: 'input',
        text: '111₂ + 1₂ = ? (javobni ikkilik sanoq sistemasida yozing)',
        answer: '1000',
        explanation: '7 + 1 = 8 = 1000₂',
      }),
    ],
  },
];
