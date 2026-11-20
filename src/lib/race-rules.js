export function roundFinished(teams, turn, trackLength) {
  return turn === teams.length - 1 && teams.some((team) => team.pos >= trackLength);
}

// Tartib: avval qadamlar, keyin to'g'ri javoblar, keyin tangalar (eski natijalarda tanga yo'q — 0).
export function compareTeams(a, b) {
  return b.pos - a.pos || b.correct - a.correct || (b.coins || 0) - (a.coins || 0);
}

export function raceWinner(teams) {
  const ranked = [...teams].sort(compareTeams);
  const first = ranked[0];
  if (!first || first.pos <= 0) return null;
  const second = ranked[1];
  return second && compareTeams(first, second) === 0 ? null : first.name;
}

// Reytingdagi o'rin (teng natijali jamoalar bir xil o'rinda).
export const placeOf = (teams, team) => 1 + teams.filter((o) => compareTeams(o, team) < 0).length;

// Yakka rejim (bitta o'yinchi): xazinaga yetgan bo'lsa aniqlik bo'yicha 1–3 yulduz, yetmagan bo'lsa 0.
export const isSolo = (teams) => teams.length === 1;
export function soloStars(player, trackLength) {
  if (!player || player.pos < trackLength) return 0;
  const answered = player.correct + player.wrong;
  const accuracy = answered ? player.correct / answered : 0;
  return player.wrong === 0 ? 3 : accuracy >= 0.75 ? 2 : 1;
}

// ---------- Qo'shimcha qoidalar (2-faza) ----------
// O'qituvchi tayyorgarlikda yoqadi/o'chiradi. Eski sozlamalarda `mech` yo'q — klassik poyga.
export const MECHANICS = [
  { id: 'cells', title: 'Yangi kataklar', text: '🎁 sandiq — 🛡 qalqon, ⚡ chaqmoq savol (+2 qadam), 🌉 ko‘prik (3 katak oldinga)' },
  { id: 'streak', title: 'Seriya 🔥', text: 'Ketma-ket 3 ta to‘g‘ri javob — +1 bonus qadam' },
  { id: 'powers', title: 'Kuchaytirgichlar', text: 'Har jamoaga bir martadan 50/50 va +15 soniya' },
  { id: 'rebound', title: 'Ilib olish va tangalar', text: 'Xato javobni keyingi jamoa ilib olsa 🪙; tez javob ham 🪙. Tanga teng natijada g‘olibni aniqlaydi', teamsOnly: true },
  { id: 'lives', title: 'Jonlar ❤️', text: '3 ta jon: har xato bitta jonni oladi, 🎁 sandiq jon qaytaradi. Jon tugasa o‘yin tugaydi', soloOnly: true },
];
export const DEFAULT_MECH = Object.fromEntries(MECHANICS.map((m) => [m.id, true]));
export const CLASSIC_MECH = Object.fromEntries(MECHANICS.map((m) => [m.id, false]));

export const STREAK_BONUS_AT = 3;
export const TRAP_FROM = 4; // girdob eng erta 4-katakda
export const BRIDGE_JUMP = 3;
export const POWER_TIME = 15;

// Takrorlanadigan tasodif: bir o'yin ichida kataklar joyi o'zgarmaydi.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Maxsus kataklar: { [katak]: 'bonus' | 'trap' | 'chest' | 'lightning' | 'bridge' }.
 *  cells=false — klassik: ⭐ 30%, 🌀 55%, ⭐ 80%.
 *  cells=true  — ko'prik bridgeFrom katakda (u yerdan BRIDGE_JUMP oldinga), qolganlari tasodifiy,
 *                lekin hamma jamoa uchun bir xil va ikki maxsus katak yonma-yon turmaydi.
 */
export function buildSpecials(n, { cells = false, random = Math.random, bridgeFrom = null } = {}) {
  const specials = {};
  if (!cells) {
    for (const [fraction, kind] of [[0.3, 'bonus'], [0.55, 'trap'], [0.8, 'bonus']]) {
      const i = Math.min(n - 1, Math.max(1, Math.round(n * fraction)));
      if (!specials[i]) specials[i] = kind;
    }
    return specials;
  }
  // Tartib muhim: ⭐ va 🌀 har doim joylashadi, qolganlari joy bo'lsa (kataklar yonma-yon turmaydi).
  const kinds = ['bonus', 'trap', 'chest', 'lightning'];
  if (n >= 12) kinds.push('trap', 'bonus');
  if (n >= 16) kinds.push('lightning');
  // Qisqa yo'lda (8 qadam) ko'prik bo'lmaydi — aks holda yarmini sakrab o'tib ketardi.
  const bridge = n >= 10 && bridgeFrom != null && bridgeFrom >= 1 && bridgeFrom + BRIDGE_JUMP <= n - 1;

  const attempt = () => {
    const out = {};
    const blocked = new Set([0, n]);
    const take = (i, kind) => {
      out[i] = kind;
      for (const j of [i - 1, i, i + 1]) blocked.add(j);
    };
    if (bridge) {
      take(bridgeFrom, 'bridge');
      blocked.add(bridgeFrom + BRIDGE_JUMP); // ko'prik qo'nadigan katak oddiy bo'lsin
    }
    for (const kind of kinds) {
      const free = [];
      // Girdob boshida turmaydi: birinchi to'g'ri javob jamoani startga qaytarmasin.
      const from = kind === 'trap' ? TRAP_FROM : 1;
      for (let i = from; i < n; i++) if (!blocked.has(i)) free.push(i);
      if (!free.length) break;
      take(free[Math.floor(random() * free.length)], kind);
    }
    return out;
  };
  // Bir necha tasodifiy joylashuvdan eng ko'p katak sig'ganini olamiz (qisqa yo'lda ham hammasi chiqsin).
  let best = attempt();
  for (let k = 0; k < 24 && Object.keys(best).length < kinds.length + (bridge ? 1 : 0); k++) {
    const next = attempt();
    if (Object.keys(next).length > Object.keys(best).length) best = next;
  }
  return best;
}

// Savol vaqti: chaqmoq savolda yarmi (kamida 10 soniya); cheklanmagan vaqt (0) o'zgarmaydi.
export const questionTime = (time, lightning) => (lightning && time > 0 ? Math.max(10, Math.ceil(time / 2)) : time);

// To'g'ri javobdan keyingi qadamlar soni (maxsus kataklardan oldin).
export const answerSteps = (lightning) => (lightning ? 2 : 1);

// Tez javob: vaqtning birinchi uchdan birida berilgan to'g'ri javob (vaqt cheklangan bo'lsa).
export const isFastAnswer = (left, total) => total > 0 && left >= (total * 2) / 3;

// Ilib olish faqat variantli savolda va 2+ jamoada; xato tanlangandan keyin kamida 2 variant qolishi kerak
// (aks holda javob o'z-o'zidan ma'lum bo'lib qoladi).
export function canRebound(question, teamCount, optionsLeft) {
  return teamCount > 1 && question.type === 'choice' && optionsLeft >= 2;
}

// 50/50: to'g'ri javob va bitta xato qoladi (variantlar 3+ bo'lsa).
export function fiftyFifty(options, random = Math.random) {
  const wrong = options.map((o, i) => (o.correct ? -1 : i)).filter((i) => i >= 0);
  if (options.length < 3 || !wrong.length) return [];
  const keep = wrong[Math.floor(random() * wrong.length)];
  return wrong.filter((i) => i !== keep);
}

// ---------- 3-faza: yakka rejim jonlari ----------
export const MAX_HEARTS = 3;

// ---------- 3-faza: final nominatsiyalari ----------
// Har jamoa kamida bitta nominatsiya oladi: hech narsa olmaganlarga — "Jamoa ruhi".
// Kerakli maydonlar: correct, wrong, bestRun (eng uzun ketma-ket to'g'ri), coins, rebounds, comeback.
export const AWARDS = {
  accurate: { icon: '🎯', title: 'Eng aniq' },
  streak: { icon: '🔥', title: 'Eng uzun seriya' },
  coins: { icon: '🪙', title: 'Eng ko‘p tanga' },
  rebound: { icon: '🦅', title: 'Eng ko‘p ilib olgan' },
  comeback: { icon: '💪', title: 'Eng katta qaytish' },
  spirit: { icon: '🤝', title: 'Jamoa ruhi' },
};

const AWARD_VALUE = {
  accurate: (t) => (t.correct + t.wrong ? t.correct / (t.correct + t.wrong) : 0),
  streak: (t) => ((t.bestRun || 0) >= 2 ? t.bestRun : 0),
  coins: (t) => t.coins || 0,
  rebound: (t) => t.rebounds || 0,
  comeback: (t) => t.comeback || 0,
};

// Bitta jamoa nominatsiyalarni "yig'ib olmasin": ko'pi bilan shuncha. Ortiqchasi shu ko'rsatkich
// bo'yicha keyingi eng yaxshi jamoaga o'tadi (agar uning ko'rsatkichi noldan katta bo'lsa).
export const MAX_AWARDS_PER_TEAM = 2;

/** teams → har jamoa uchun nominatsiya ID'lari ro'yxati (indekslar bo'yicha). Yakka o'yinda — bo'sh. */
export function teamAwards(teams) {
  const result = teams.map(() => []);
  if (teams.length < 2) return result;
  for (const [id, value] of Object.entries(AWARD_VALUE)) {
    const values = teams.map(value);
    const best = Math.max(...values);
    // Hamma bir xil bo'lsa, nominatsiya hech kimni ajratmaydi.
    if (best <= 0 || values.every((v) => v === best)) continue;
    // Eng yaxshidan boshlab: limitga yetmagan (teng natijali) jamoalar oladi.
    const levels = [...new Set(values.filter((v) => v > 0))].sort((a, b) => b - a);
    for (const level of levels) {
      const winners = values.map((v, i) => (v === level && result[i].length < MAX_AWARDS_PER_TEAM ? i : -1)).filter((i) => i >= 0);
      if (winners.length) {
        winners.forEach((i) => result[i].push(id));
        break;
      }
    }
  }
  return result.map((list) => (list.length ? list : ['spirit']));
}

// ---------- 3-faza: kunlik xarita ----------
// Mahalliy sana (YYYY-MM-DD): kun yarim tunda almashadi.
export function dayKey(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

// To'plam tarkibining izi: savol qo'shilsa, o'chirilsa yoki tahrirlansa — o'zgaradi.
// Kunlik rekord shu izga bog'lanadi, boshqa savollar bilan qo'yilgan natija solishtirilmaydi.
export function questionsFingerprint(questions) {
  const parts = questions.map((q) => JSON.stringify([q.id, q.type, q.text, q.code, q.options, q.correct, q.answer, q.items, q.pairs]));
  return hashString(parts.sort().join('|')).toString(36);
}

// Kunlik o'yin urug'i: sana + to'plam (bugun shu to'plamni kim o'ynasa ham xarita bir xil).
export const dailySeed = (day, setId) => hashString(`${day}|${setId}`);

export function seededShuffle(list, random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
