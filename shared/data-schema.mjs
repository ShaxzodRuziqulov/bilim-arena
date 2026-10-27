export const DEFAULT_SETTINGS = { time: 30, trackLength: 12, sound: true, classroomLock: false, animations: true };
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const fail = (message) => { throw new Error(message); };
const text = (v, fallback = '') => v === undefined ? fallback : typeof v === 'string' ? v : fail('Matn maydoni noto‘g‘ri');
const list = (v, fallback = []) => v === undefined ? fallback : Array.isArray(v) ? v : fail('Ro‘yxat formati noto‘g‘ri');
const number = (v, fallback = 0) => v === undefined ? fallback : Number.isFinite(v) && v >= 0 ? v : fail('Son maydoni noto‘g‘ri');
function unique(items) { if (new Set(items.map(v => v.id)).size !== items.length) fail('Takroriy ID topildi'); return items; }
// Robot dasturlash: mashqdagi eng yaxshi yulduzlar (daraja raqami -> 1..3).
const ROBOT_GAMES = ['kod', 'java'];
function validateRobot(r) {
  if (r === undefined) return {};
  if (!object(r)) fail('Robot ma’lumoti formati noto‘g‘ri');
  const out = {};
  for (const game of ROBOT_GAMES) {
    if (r[game] === undefined) continue;
    const stars = r[game]?.stars ?? {};
    if (!object(r[game]) || !object(stars)) fail('Robot ma’lumoti formati noto‘g‘ri');
    for (const [level, value] of Object.entries(stars)) if (!/^\d+$/.test(level) || ![1, 2, 3].includes(value)) fail('Robot yulduzlari noto‘g‘ri');
    out[game] = { stars: { ...stars } };
  }
  return out;
}
function validateRobotResult(h) {
  if (!ROBOT_GAMES.includes(h.game)) fail('Robot o‘yini noma’lum');
  return {id:h.id,kind:'robot',game:h.game,date:text(h.date),setName:text(h.setName),rounds:number(h.rounds),maxScore:number(h.maxScore),winner:h.winner == null ? null : text(h.winner),teams:h.teams.map(t=>{
    if (!object(t)) fail('Jamoa formati noto‘g‘ri');
    return {name:text(t.name),color:text(t.color),hero:text(t.hero),score:number(t.score),solved:number(t.solved)};
  })};
}
export function validateQuestion(q) {
  if (!object(q) || !q.id || typeof q.id !== 'string') fail('Savol ID yoki formati noto‘g‘ri');
  if (!['choice','tf','input','order','match'].includes(q.type)) fail('Noma’lum savol turi');
  const options=list(q.options).map(v=>text(v));
  if (q.type === 'choice' && (options.length < 2 || options.length > 4)) fail('Variantlar formati noto‘g‘ri');
  const correct=number(q.correct);
  if (!Number.isInteger(correct) || correct > (q.type === 'tf' ? 1 : 3)) fail('Javob indeksi noto‘g‘ri');
  return {id:q.id,type:q.type,text:text(q.text),code:text(q.code),lang:text(q.lang),image:text(q.image),options,correct,answer:text(q.answer),keypad:['number','hex','text'].includes(q.keypad) ? q.keypad : 'number',items:list(q.items).map(v=>text(v)),pairs:list(q.pairs).map(p=>object(p)?{left:text(p.left),right:text(p.right)}:fail('Juftlik formati noto‘g‘ri')),explanation:text(q.explanation)};
}
export function validateData(raw) {
  if (!object(raw) || raw.version !== 1 || !Array.isArray(raw.sets) || !Array.isArray(raw.history)) fail('Qo‘llab-quvvatlanmaydigan ma’lumot formati');
  if (raw.pinHash != null && !/^[a-f0-9]{64}$/i.test(raw.pinHash)) fail('PIN xeshi noto‘g‘ri');
  const s=raw.settings ?? {}; if (!object(s)) fail('Sozlamalar formati noto‘g‘ri');
  const time=s.time ?? 30, trackLength=s.trackLength ?? 12;
  if (![0,15,20,30,45,60,90].includes(time) || ![8,10,12,16,20].includes(trackLength)) fail('O‘yin sozlamalari noto‘g‘ri');
  if ((s.sound !== undefined && typeof s.sound !== 'boolean') || (s.classroomLock !== undefined && typeof s.classroomLock !== 'boolean') || (s.animations !== undefined && typeof s.animations !== 'boolean')) fail('Sozlamalar turi noto‘g‘ri');
  return {version:1,pinHash:raw.pinHash ?? null,settings:{time,trackLength,sound:s.sound ?? true,classroomLock:!!raw.pinHash && !!s.classroomLock,animations:s.animations ?? true},sets:unique(raw.sets.map(set=>{
    if (!object(set) || !set.id || typeof set.id !== 'string') fail('To‘plam formati noto‘g‘ri');
    return {id:set.id,name:text(set.name,'Nomsiz to‘plam'),subject:text(set.subject,'Umumiy'),grade:text(set.grade,'Aralash'),questions:unique(list(set.questions).map(validateQuestion))};
  })),history:raw.history.slice(0,300).map(h=>{
    if (!object(h) || typeof h.id !== 'string' || !Array.isArray(h.teams)) fail('Natija formati noto‘g‘ri');
    if (h.kind === 'robot') return validateRobotResult(h);
    return {id:h.id,date:text(h.date),setName:text(h.setName),trackLength:number(h.trackLength),winner:h.winner == null ? null : text(h.winner),teams:h.teams.map(t=>{
      if (!object(t)) fail('Jamoa formati noto‘g‘ri');
      return {name:text(t.name),color:text(t.color),hero:text(t.hero),pos:number(t.pos),correct:number(t.correct),wrong:number(t.wrong)};
    }),hard:list(h.hard).map(q=>({text:text(q.text),wrong:number(q.wrong),...(q.question ? {question:validateQuestion(q.question)} : {})}))};
  }),robot:validateRobot(raw.robot)};
}
export function parseBackup(value) {
  const raw=typeof value === 'string' ? JSON.parse(value) : value;
  if (raw?.format === 'bilim-arena-backup') {
    if (raw.backupVersion !== 1) fail('Zaxira versiyasi qo‘llab-quvvatlanmaydi');
    return validateData(raw.data);
  }
  return validateData(raw);
}
export function makeBackup(data) { return {format:'bilim-arena-backup',backupVersion:1,createdAt:new Date().toISOString(),data:validateData(data)}; }
