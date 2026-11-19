// O'yinning sof mantig'i: React'ga bog'liq emas, testlarda alohida tekshiriladi.
// Kod — satr (masalan "4271"). cfg = { length, alphabet, repeats }.

/** Taxminni yashirin kod bilan solishtiradi: joyida (buqa) va bor, joyi boshqa (sigir). */
export function score(secret, guess) {
  let bulls = 0;
  const restSecret = {};
  const restGuess = {};
  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) bulls++;
    else {
      restSecret[secret[i]] = (restSecret[secret[i]] || 0) + 1;
      restGuess[guess[i]] = (restGuess[guess[i]] || 0) + 1;
    }
  }
  let cows = 0;
  for (const ch in restGuess) cows += Math.min(restGuess[ch], restSecret[ch] || 0);
  return { bulls, cows };
}

/**
 * Har bir katak uchun belgi: 'bull' — joyida, 'cow' — bor, joyi boshqa, 'miss' — kodda yo'q.
 * Takrorlanuvchi raqamlar score() bilan bir xil sanaladi.
 */
export function tileMarks(secret, guess) {
  const marks = Array(guess.length).fill('miss');
  const left = {};
  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) marks[i] = 'bull';
    else left[secret[i]] = (left[secret[i]] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === 'bull') continue;
    if (left[guess[i]] > 0) {
      marks[i] = 'cow';
      left[guess[i]]--;
    }
  }
  return marks;
}

/** Rangli rejimda har raqam haqida bilingan eng yaxshi ma'lumot: bull > cow > miss. */
export function keyStates(rows) {
  const rank = { miss: 1, cow: 2, bull: 3 };
  const out = {};
  for (const r of rows) {
    r.marks.forEach((m, i) => {
      const ch = r.guess[i];
      if (!out[ch] || rank[m] > rank[out[ch]]) out[ch] = m;
    });
  }
  return out;
}

/** Taxmin qoidalarga mos kelmasa — o'zbekcha sabab, mos kelsa null. */
export function validateGuess(cfg, guess) {
  if (guess.length !== cfg.length) return `Kod ${cfg.length} ta belgidan iborat bo‘lishi kerak`;
  for (const ch of guess) if (!cfg.alphabet.includes(ch)) return `“${ch}” bu darajada ishlatilmaydi`;
  if (!cfg.repeats && new Set(guess).size !== guess.length) return 'Bu darajada belgilar takrorlanmaydi';
  return null;
}

const codeCache = new Map();

/** cfg bo'yicha mumkin bo'lgan barcha kodlar (keshlanadi). Eng kattasi ~33 ming. */
export function allCodes(cfg) {
  const key = `${cfg.length}|${cfg.alphabet}|${cfg.repeats}`;
  if (codeCache.has(key)) return codeCache.get(key);
  const out = [];
  const build = (prefix) => {
    if (prefix.length === cfg.length) {
      out.push(prefix);
      return;
    }
    for (const ch of cfg.alphabet) {
      if (!cfg.repeats && prefix.includes(ch)) continue;
      build(prefix + ch);
    }
  };
  build('');
  codeCache.set(key, out);
  return out;
}

/**
 * Taxminlar ro'yxatini baholaydi. Har qator uchun:
 * - bulls/cows,
 * - contradicts: taxmin oldingi javoblarga zid edi (u kod bo'la olmasdi),
 * - remaining: shu javobdan keyin mos keladigan kodlar soni.
 */
export function evaluate(cfg, secret, guesses) {
  let candidates = allCodes(cfg);
  const colour = cfg.mode === 'color';
  return guesses.map((guess) => {
    const { bulls, cows } = score(secret, guess);
    const marks = tileMarks(secret, guess);
    const key = marks.join();
    const contradicts = !candidates.includes(guess);
    // Rangli rejimda o'yinchi ko'proq ma'lumot oladi, shuning uchun variantlar ham kataklar bo'yicha saralanadi.
    candidates = candidates.filter((code) => {
      if (colour) return tileMarks(code, guess).join() === key;
      const s = score(code, guess);
      return s.bulls === bulls && s.cows === cows;
    });
    return { guess, bulls, cows, marks, contradicts, remaining: candidates.length };
  });
}

/** Maslahat uchun keyingi ochiladigan katak: hali ochilmagan va o'yinchi aniq bilmagan joylardan biri. */
export function pickHintPosition(cfg, secret, revealed, rows) {
  const known = new Set(revealed);
  if (cfg.mode === 'color') rows.forEach((r) => r.marks.forEach((m, i) => m === 'bull' && known.add(i)));
  const free = [];
  for (let i = 0; i < cfg.length; i++) if (!known.has(i)) free.push(i);
  if (!free.length) return null;
  const random = seededRandom(`${secret}-hint-${revealed.length}`);
  return free[Math.floor(random() * free.length)];
}

// --- Takrorlanadigan tasodif: bir xil daraja har doim bir xil kodni beradi ---

export function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeSecret(cfg, random = Math.random) {
  const chars = [...cfg.alphabet];
  let code = '';
  for (let i = 0; i < cfg.length; i++) {
    const idx = Math.floor(random() * chars.length);
    code += chars[idx];
    if (!cfg.repeats) chars.splice(idx, 1);
  }
  return code;
}
