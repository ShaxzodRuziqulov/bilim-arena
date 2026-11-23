// Bilim Arena — foydalanuvchilar uchun tanishtiruv videosi (~1:20, 1920×1080).
// Ishga tushirish:  npm run video   (avval dist/ yig'iladi)  →  release/video/bilim-arena-tanishuv.mp4
//
// Qanday ishlaydi: alohida Electron oynasi yig'ilgan ilovani (dist/index.html) vaqtinchalik profilda ochadi —
// o'qituvchining ma'lumotlariga tegilmaydi. O'yinlar avtomatik o'ynatiladi, yozuvlar va kirish/yakuniy ekranlar
// sahifa ustiga qatlam (overlay.js) sifatida qo'yiladi, oyna Chromium'ning MediaRecorder'i bilan yoziladi.
// Uzun, zerikarli qismlarda (masalan, Xazina poygasining o'rtasi) yozuv pauza qilinadi.
const { app, BrowserWindow, screen, session } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'release', 'video');
const W = 1920;
const H = 1080;
const PROFILE = path.join(os.tmpdir(), 'bilim-arena-video-profile');

fs.rmSync(PROFILE, { recursive: true, force: true });
app.setPath('userData', PROFILE);
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => fs.appendFileSync(path.join(OUT_DIR, 'video-log.txt'), a.join(' ') + '\n');
let win;
const run = (code) => win.webContents.executeJavaScript(`(async()=>{${code}})()`, true);

/** Haqiqiy klaviatura bosishi (Phaser va Kodbuzar haqiqiy hodisalarni kutadi). */
async function key(keyCode, holdMs = 60) {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode });
  if (keyCode.length === 1) win.webContents.sendInputEvent({ type: 'char', keyCode });
  await sleep(holdMs);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode });
}

// Sahifadagi yordamchilar: tugmani matni bo'yicha bosish va Xazina savoliga to'g'ri javob berish.
const HELPERS = `
window.__h = {
  w: (ms) => new Promise((r) => setTimeout(r, ms)),
  btn(re, root = document) { return [...root.querySelectorAll('button')].find((b) => re.test(b.textContent.trim()) && !b.disabled); },
  click(re, root) { const b = this.btn(re, root); if (b) b.click(); return !!b; },
  item() {
    const el = document.querySelector('.question-card'); if (!el) return null;
    const k = Object.keys(el).find((k) => k.startsWith('__reactFiber')); let f = el[k];
    while (f && !(f.memoizedProps && f.memoizedProps.item)) f = f.return;
    return f && f.memoizedProps.item;
  },
  async answerRight() {
    const it = this.item(); const card = document.querySelector('.question-card'); if (!it || !card) return false;
    const byText = (t) => [...card.querySelectorAll('button')].find((b) => b.textContent.trim() === String(t).trim() && !b.disabled);
    if (it.options) { [...card.querySelectorAll('.answers .answer')][it.options.findIndex((o) => o.correct)]?.click(); return true; }
    if (it.q.type === 'input') {
      const a = it.q.answer.split(';')[0].trim(); const inp = card.querySelector('.text-keypad-wrap input');
      if (inp) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, a); inp.dispatchEvent(new Event('input', { bubbles: true })); }
      else for (const ch of a) { [...card.querySelectorAll('.keypad .key')].find((k) => k.textContent === ch)?.click(); await this.w(90); }
    } else if (it.q.type === 'order') { for (const t of it.items) { byText(t)?.click(); await this.w(160); } }
    else if (it.q.type === 'match') { for (const p of it.pairs) { byText(p.left)?.click(); await this.w(120); byText(p.right)?.click(); await this.w(160); } }
    await this.w(250); this.click(/Javob berish/, card); return true;
  },
  async answerWrong() {
    const it = this.item(); const card = document.querySelector('.question-card'); if (!it || !card) return false;
    if (it.options) { [...card.querySelectorAll('.answers .answer')][it.options.findIndex((o) => !o.correct)]?.click(); return true; }
    const inp = card.querySelector('.text-keypad-wrap input');
    if (inp) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, 'xyz'); inp.dispatchEvent(new Event('input', { bubbles: true })); }
    else { const k = [...card.querySelectorAll('.keypad .key')].find((x) => x.textContent === '9'); for (let i = 0; i < 4; i++) { k?.click(); await this.w(60); } }
    if (it.q.type === 'order') for (const t of [...it.items].reverse()) { [...card.querySelectorAll('button')].find((b) => b.textContent.trim() === t)?.click(); await this.w(120); }
    await this.w(250); this.click(/Javob berish/, card); return true;
  },
  q: 0,
  wrongAt: 0,
  /** Xazina: bitta qadam — savolni ochish, javob (wrongAt-savolda xato), davom etish. */
  async raceStep(pace = 1) {
    if (document.querySelector('.ceremony-card, .win-card')) return 'won';
    // "Ilib olish": xato javobdan keyin savol boshqa jamoaga o'tadi — videoda o'tkazib yuboriladi.
    if (this.click(/tkazib yuborish/)) { await this.w(900 * pace); return 'otkazildi'; }
    // Ochiq, javob berilmagan savol (masalan, "ilib olish" — boshqa jamoaga o'tgan savol): to'g'ri javob.
    if (document.querySelector('.question-card') && !document.querySelector('.question-card .feedback') && !this.btn(/Davom etish ▶/)) {
      await this.answerRight(); await this.w(1200 * pace); return 'qayta';
    }
    if (this.click(/Davom etish ▶/)) { await this.w(500 * pace); return 'davom'; }
    if (this.click(/Savolni ochish/)) { this.q += 1; await this.w(900 * pace); if (this.q === this.wrongAt) await this.answerWrong(); else await this.answerRight(); await this.w(1300 * pace); return 'savol'; }
    await this.w(300); return 'kutish';
  },
};`;

async function startRecording() {
  return run(`
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30, width: ${W}, height: ${H} }, audio: false });
    const type = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 10000000 });
    window.__rec = { rec, type, chunks: [], stream };
    rec.ondataavailable = (e) => e.data.size && window.__rec.chunks.push(e.data);
    rec.start(1000);
    const s = stream.getVideoTracks()[0].getSettings();
    return type + ' ' + s.width + 'x' + s.height;`);
}
const pause = () => run(`window.__rec.rec.pause()`);
const resume = () => run(`window.__rec.rec.resume()`);

async function stopRecording(file) {
  const type = await run(`
    const r = window.__rec; await new Promise((res) => { r.rec.onstop = res; r.rec.stop(); });
    r.stream.getTracks().forEach((t) => t.stop()); return r.type;`);
  const n = await run(`return window.__rec.chunks.length`);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const b64 = await run(`const b = window.__rec.chunks[${i}]; return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(b); });`);
    parts.push(Buffer.from(b64, 'base64'));
  }
  const ext = type.startsWith('video/mp4') ? 'mp4' : 'webm';
  const out = file.replace(/\.\w+$/, '.' + ext);
  fs.writeFileSync(out, Buffer.concat(parts));
  return out;
}

const cap = (title, sub, color, pos) => run(`await __ov.caption(${JSON.stringify(title)}, ${JSON.stringify(sub || '')}, ${JSON.stringify(color || '')}, ${JSON.stringify(pos || '')})`);
const uncap = () => run(`await __ov.uncaption()`);

// ---------- Sahnalar ----------
async function intro() {
  await run(`window.__intro = await __ov.card(\`<img src="./icon.svg" alt=""><h1>Bilim Arena</h1><h2>Bepul ta'limiy o'yinlar</h2>
    <div class="chips"><i>🎮 4 ta o'yin</i><i>📶 Internet kerak emas</i><i>📱 Telefon · 💻 Kompyuter</i></div>\`)`);
  await sleep(5200);
  await run(`await __ov.close(window.__intro)`);
}

async function hall() {
  await cap("O'yinlar zali", "To'rtta o'yin — bitta platformada", '#ffd36b');
  await run(`document.querySelector('.hall')?.scrollTo?.(0, 0)`);
  await sleep(3500);
  await run(`const h = document.querySelector('.hall'); h && h.scrollBy({ top: 420, behavior: 'smooth' })`);
  await sleep(2600);
  await uncap();
  await run(`document.querySelector('.hall')?.scrollTo({ top: 0 })`);
}

async function kodbuzar() {
  await run(`document.querySelector('.poster-kodbuzar .poster-play').click()`);
  await sleep(1800);
  await cap('🔐 Kodbuzar', "Yashirin kodni toping — rangli kataklar yo'l ko'rsatadi", '#fcd34d', 'right');
  await sleep(1600);
  await run(`document.querySelector('.kb-host').shadowRoot.querySelector('.card.hero').click()`);
  await sleep(1600);
  for (const k of ['1', '2']) await key(k), await sleep(380);
  await key('Return');
  await sleep(2200);
  for (const k of ['1', '4']) await key(k), await sleep(380);
  await key('Return');
  await sleep(3400);
  await uncap();
  await pause();
  await run(`const s = () => document.querySelector('.kb-host').shadowRoot; s().querySelector('.result .btn.ghost')?.click(); await __h.w(400);
    s().querySelector('.bar .icon-btn')?.click(); await __h.w(400); s().querySelector('.exit-btn')?.click();`);
  await sleep(900);
  await resume();
}

async function soya() {
  await run(`document.querySelector('.poster-soya .poster-play').click()`);
  await sleep(3200);
  await cap('👤 Soya', "Harakatingizni yozing — soyangiz uni takrorlaydi", '#7dd3fc');
  await key('Return'); // menyuda "Boshlash"
  await sleep(2600);
  await key('Q'); // yozish boshlandi
  await sleep(300);
  await key('Right', 1180); // tugmagacha
  await sleep(250);
  await key('Q'); // yozish tugadi — soya tugmani bosib turadi
  await sleep(1400);
  await key('Right', 3700); // eshikdan o'tib chiqishga
  await sleep(2600);
  await uncap();
  await pause();
  // Daraja → ro'yxat → menyu: zal tugmasi faqat Soya menyusida ko'rinadi.
  for (let i = 0; i < 8; i++) {
    if (await run(`const b = document.querySelector('.soya-exit'); if (b) b.click(); return !!b;`)) break;
    await key('Escape');
    await sleep(900);
  }
  await sleep(1200);
  await resume();
}

async function robot() {
  await run(`document.querySelector('.poster-robot .poster-play').click()`);
  await sleep(1400);
  await cap('🤖 Robot dasturlash', "Bloklardan haqiqiy Java kodigacha · 16 daraja", '#58edb0');
  await sleep(2600);
  await run(`document.querySelectorAll('.rh-node')[0].click()`);
  await sleep(1500);
  for (let i = 0; i < 3; i++) await run(`__h.click(/^.?Oldinga/, document.querySelector('.robo-wrap'))`), await sleep(350);
  await run(`__h.click(/Ishga tushirish/)`);
  await sleep(3300);
  await cap('☕ Endi — haqiqiy Java', "Robotga kod bilan buyruq bering", '#fb923c');
  await run(`document.querySelector('.robo-lv-part').click()`);
  await sleep(1600);
  await run(`const ta = document.querySelector('.robo-wrap textarea'); ta.focus();
    const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    const code = 'robot.yur(3);\\nrobot.ongga();\\nrobot.yur(2);\\n';
    for (let i = 1; i <= code.length; i++) { set.call(ta, code.slice(0, i)); ta.dispatchEvent(new Event('input', { bubbles: true })); await __h.w(45); }`);
  await sleep(600);
  await run(`__h.click(/Ishga tushirish/)`);
  await sleep(3800);
  await uncap();
  await pause();
  await run(`__h.click(/^⏸$/); await __h.w(300); __h.click(/Robot menyusiga/); await __h.w(600); document.querySelector('.rh-icon')?.click();`);
  await sleep(900);
  await resume();
}

async function race() {
  await run(`[...document.querySelectorAll('.poster-race button')].find((b) => /Jamoa bilan/.test(b.textContent))?.click()`);
  await sleep(1300);
  await cap('🏝️ Xazina poygasi', "O'z savollaringiz bilan · yakka yoki 2–4 jamoa", '#ffcf4a');
  await sleep(2400);
  // Qadamlar sonini eng kamiga (8) o'rnatish — marosimga tezroq yetish uchun.
  await run(`const sel = [...document.querySelectorAll('select')].find((s) => [...s.options].some((o) => /qadam/.test(o.text)));
    if (sel) { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, '8'); sel.dispatchEvent(new Event('change', { bubbles: true })); }
    await __h.w(200); __h.click(/O‘yinni boshlash/);`);
  await sleep(2200);
  await cap('🏝️ Orol xaritasi', "Bonus, girdob va yangi sirli kataklar", '#ffcf4a');
  await run(`__h.q = 0; __h.wrongAt = 4;`);
  for (let i = 0; i < 4; i++) await run(`return await __h.raceStep(1)`);
  await uncap();
  // O'rtasini yozmaymiz: xazinaga yetguncha o'ynatamiz.
  await pause();
  for (let i = 0; i < 160; i++) {
    const r = await run(`return await __h.raceStep(0.3)`);
    if (r === 'won') break;
  }
  await sleep(600);
  await resume();
  await cap('🏆 G‘alaba marosimi', "Shohsupa va nominatsiyalar", '#ffcf4a');
  await sleep(5500);
  await uncap();
  await pause();
  await run(`__h.click(/Natijalarni ko/); await __h.w(1200); __h.click(/O‘yinlar zali/);`);
  await sleep(1500);
  await resume();
}

async function devices() {
  await run(`window.__dev = await __ov.card(\`
    <div class="ov-board"><iframe src="./index.html"></iframe><small>Sensorli doska va kompyuter</small></div>
    <div class="ov-phone"><iframe src="./index.html"></iframe><small>Telefon</small></div>\`, 'ov-devices')`);
  await sleep(1200);
  await cap("Doskada, kompyuterda va telefonda", "Ma'lumotlar qurilmaning o'zida saqlanadi", '#8ff7cf');
  await sleep(5200);
  await uncap();
  await run(`await __ov.close(window.__dev)`);
}

async function outro() {
  await run(`window.__out = await __ov.card(\`<h1 style="font-size:96px">Yuklab oling — bepul</h1>
    <div class="ov-dl">
      <div><b>📱 Android</b><span>Telefon va planshet</span><code>Bilim-Arena.apk</code></div>
      <div><b>💻 Windows</b><span>Kompyuter va sensorli doska</span><code>Bilim-Arena-Setup.exe</code></div>
    </div>
    <div class="ov-link">github.com/ShaxzodRuziqulov/bilim-arena/releases</div>
    <h2 style="font-size:34px">Ulashing — dastur bepul. Yangilanishlar o'zi keladi.</h2>\`)`);
  await sleep(7500);
}

app.whenReady().then(async () => {
  fs.mkdirSync(path.join(OUT_DIR, 'frames'), { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'video-log.txt'), '');
  session.defaultSession.setDisplayMediaRequestHandler((req, cb) => cb({ video: req.frame }));
  const d = screen.getPrimaryDisplay();
  log('ekran', `${d.size.width}x${d.size.height}`, 'masshtab', d.scaleFactor);
  // O'lcham qotiriladi: yozish paytida o'zgarsa, MP4 kodlovchisi buzilgan kadrlar beradi.
  win = new BrowserWindow({ width: W, height: H, useContentSize: true, frame: false, show: true, x: 0, y: 0, resizable: false, movable: false, maximizable: false, fullscreenable: false, alwaysOnTop: true, enableLargerThanScreen: true, backgroundColor: '#070d21', webPreferences: { backgroundThrottling: false } });
  win.setContentSize(W, H);
  try {
    await win.loadFile(path.join(ROOT, 'dist', 'index.html'));
    await sleep(2500);
    await run(fs.readFileSync(path.join(__dirname, 'overlay.js'), 'utf8'));
    await run(HELPERS);
    win.setContentSize(W, H);
    await sleep(300);
    const size = await run(`return innerWidth + 'x' + innerHeight`);
    log('oyna', size);
    if (size !== `${W}x${H}`) throw new Error(`Oyna o'lchami ${size} — ${W}x${H} bo'lishi kerak (ekran kichik yoki masshtab boshqa).`);
    log('yozish', await startRecording());
    for (const [name, scene] of Object.entries({ intro, hall, kodbuzar, soya, robot, race, devices, outro })) {
      const t = Date.now();
      try {
        await scene();
      } finally {
        const img = await win.webContents.capturePage();
        fs.writeFileSync(path.join(OUT_DIR, 'frames', `${name}.png`), img.resize({ width: 960 }).toPNG());
      }
      log(name, ((Date.now() - t) / 1000).toFixed(1) + ' s', await run(`return innerWidth + 'x' + innerHeight`));
    }
  } catch (e) {
    log('XATO', e.stack || e.message);
  }
  try {
    const file = await stopRecording(path.join(OUT_DIR, 'bilim-arena-tanishuv.mp4'));
    log('tayyor', file, (fs.statSync(file).size / 1e6).toFixed(1) + ' MB');
  } catch (e) {
    log('SAQLASH XATOSI', e.message);
  }
  app.quit();
});
