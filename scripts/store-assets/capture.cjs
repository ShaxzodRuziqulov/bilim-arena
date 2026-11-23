// Google Play do'koni uchun rasmlar: telefon (tik/yon) va planshet skrinshotlari, sarlavha rasmi (1024×500), belgi (512×512).
// Ishga tushirish: npm run store-assets   (avval dist/ yig'iladi)  →  store/play/
// Ilova vaqtinchalik profilda ochiladi; telefon taqlidida sensorli rejim yoqiladi (Soya keng rejimda chiqadi).
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'store', 'play');
const PROFILE = path.join(os.tmpdir(), 'bilim-arena-store-profile');
fs.rmSync(PROFILE, { recursive: true, force: true });
app.setPath('userData', PROFILE);
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('disable-background-timer-throttling');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => fs.appendFileSync(path.join(OUT, 'capture-log.txt'), a.join(' ') + '\n');

const HELPERS = `window.__h = {
  w: (ms) => new Promise((r) => setTimeout(r, ms)),
  click(re, root = document) { const b = [...root.querySelectorAll('button')].find((b) => re.test(b.textContent.trim()) && !b.disabled); if (b) b.click(); return !!b; },
};`;

/** Telefon/planshet taqlidi bilan oyna: CSS o'lchami w×h, piksel zichligi dpr, touch — sensorli. */
async function device(w, h, dpr, touch) {
  const win = new BrowserWindow({ width: w, height: h, useContentSize: true, show: true, frame: false, enableLargerThanScreen: true, webPreferences: { backgroundThrottling: false } });
  await win.loadFile(path.join(ROOT, 'dist', 'index.html'));
  const dbg = win.webContents.debugger;
  dbg.attach('1.3');
  log('qurilma', w, h, dpr);
  await dbg.sendCommand('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: touch });
  if (touch) await dbg.sendCommand('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  // Emulyatsiya yoqilgach qayta yuklash: sensorli rejim va o'lcham ilova ishga tushishidanoq ko'rinsin.
  await new Promise((r) => { win.webContents.once('did-finish-load', r); win.webContents.reload(); });
  log('yuklandi');
  await sleep(1800);
  const run = (code) => win.webContents.executeJavaScript(`(async()=>{${code}})()`, true);
  await run(HELPERS);
  const shot = async (name) => {
    await sleep(700);
    const { data } = await dbg.sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(data, 'base64'));
    log(name, `${w * dpr}x${h * dpr}`);
  };
  return { win, run, shot, key: (keyCode, ms = 60) => press(win, keyCode, ms) };
}
async function press(win, keyCode, ms) {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode });
  await sleep(ms);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode });
}

// ---------- Telefon, tik (1080×1920) ----------
async function phonePortrait() {
  const d = await device(360, 640, 3, true);
  await d.shot('telefon-1-zal');
  await d.run(`document.querySelector('.poster-kodbuzar .poster-play').click()`);
  await sleep(1600);
  await d.run(`document.querySelector('.kb-host').shadowRoot.querySelector('.card.hero').click()`);
  await sleep(1200);
  for (const k of ['1', '2']) await d.key(k), await sleep(250);
  await d.key('Return');
  await sleep(1500);
  await d.shot('telefon-2-kodbuzar');
  await new Promise((r) => { d.win.webContents.once('did-finish-load', r); d.win.webContents.reload(); });
  await sleep(2200);
  await d.run(HELPERS);
  await d.run(`document.querySelector('.poster-robot .poster-play').click()`);
  await sleep(1400);
  await d.shot('telefon-3-robot-menyu');
  await d.run(`document.querySelectorAll('.rh-node')[0].click()`);
  await sleep(1400);
  for (let i = 0; i < 2; i++) await d.run(`__h.click(/^.?Oldinga/, document.querySelector('.robo-wrap'))`), await sleep(250);
  await d.shot('telefon-4-robot-bloklar');
  await new Promise((r) => { d.win.webContents.once('did-finish-load', r); d.win.webContents.reload(); });
  await sleep(2200);
  await d.run(HELPERS);
  await d.run(`[...document.querySelectorAll('.poster-race button')].find((b) => /Yakka/.test(b.textContent))?.click()`);
  await sleep(1400);
  await d.shot('telefon-5-xazina-tayyorgarlik');
  d.win.destroy();
}

// ---------- Telefon, yon tomonda (2160×1080) ----------
async function phoneLandscape() {
  // 720×360 (2:1) — zamonaviy telefon nisbati; Soya shunda telefondagi kabi keng rejimda chiqadi.
  const d = await device(720, 360, 3, true);
  await d.run(`document.querySelector('.poster-soya .poster-play').click()`);
  await sleep(5000);
  // Keng rejimda menyu kichraytirilgan: "Boshlash" tugmasi ekranning o'rtasida, yuqoridan ~49% balandlikda.
  for (const type of ['mouseDown', 'mouseUp']) d.win.webContents.sendInputEvent({ type, x: 360, y: 177, button: 'left', clickCount: 1 });
  // Klaviatura bosilmaydi: aks holda o'yin klaviatura rejimiga o'tib, ekrandagi tugmalarni yashiradi.
  await sleep(3200);
  await d.shot('telefon-6-soya');
  await new Promise((r) => { d.win.webContents.once('did-finish-load', r); d.win.webContents.reload(); });
  await sleep(2200);
  await d.run(HELPERS);
  await d.run(`[...document.querySelectorAll('.poster-race button')].find((b) => /Jamoa bilan/.test(b.textContent))?.click()`);
  await sleep(1200);
  await d.run(`__h.click(/O‘yinni boshlash/)`);
  await sleep(1800);
  await d.shot('telefon-7-xazina-xarita');
  await d.run(`__h.click(/Savolni ochish/)`);
  await sleep(1400);
  await d.shot('telefon-8-xazina-savol');
  d.win.destroy();
}

// ---------- Planshet 10" (1920×1200) ----------
async function tablet() {
  const d = await device(1280, 800, 1.5, true);
  await d.shot('planshet-1-zal');
  await d.run(`document.querySelector('.poster-robot .poster-play').click()`);
  await sleep(1300);
  await d.run(`document.querySelectorAll('.rh-node')[10].click()`);
  await sleep(1500);
  await d.shot('planshet-2-java-robot');
  await new Promise((r) => { d.win.webContents.once('did-finish-load', r); d.win.webContents.reload(); });
  await sleep(2200);
  await d.run(HELPERS);
  await d.run(`[...document.querySelectorAll('.poster-race button')].find((b) => /Jamoa bilan/.test(b.textContent))?.click()`);
  await sleep(1200);
  await d.run(`__h.click(/O‘yinni boshlash/)`);
  await sleep(1800);
  await d.shot('planshet-3-xazina');
  d.win.destroy();
}

// ---------- Sarlavha rasmi (1024×500) va belgi (512×512) ----------
async function graphics() {
  const icon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(ROOT, 'public', 'icon.svg')).toString('base64');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; width: 1024px; height: 500px; overflow: hidden; font-family: 'Segoe UI', system-ui, sans-serif; color: #fff;
      background: radial-gradient(ellipse at 22% 30%, #1d4a7a 0, #0b1630 55%, #050a18 100%); display: flex; align-items: center; gap: 48px; padding: 0 64px; box-sizing: border-box; }
    img { width: 230px; height: 230px; border-radius: 52px; box-shadow: 0 24px 60px #000c, 0 0 70px #ffd36b44; }
    h1 { margin: 0; font-size: 92px; font-weight: 900; line-height: 1; background: linear-gradient(180deg, #fff6d0, #ffd36b 55%, #f0a417); -webkit-background-clip: text; color: transparent; }
    p { margin: 14px 0 22px; font-size: 32px; font-weight: 700; color: #d8e8ff; }
    .chips { display: flex; flex-wrap: wrap; gap: 10px; max-width: 600px; }
    .chips span { font-size: 22px; font-weight: 800; padding: 8px 16px; border-radius: 99px; background: #ffffff14; border: 1px solid #ffffff2a; }
  </style><img src="${icon}"><div><h1>Bilim Arena</h1><p>Bepul ta'limiy o'yinlar · internetsiz</p>
  <div class="chips"><span>🔐 Kodbuzar</span><span>👤 Soya</span><span>🤖 Robot dasturlash</span><span>🏝️ Xazina poygasi</span></div></div>`;
  const win = new BrowserWindow({ width: 1024, height: 500, useContentSize: true, show: false });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await sleep(800);
  fs.writeFileSync(path.join(OUT, 'sarlavha-1024x500.png'), (await win.webContents.capturePage()).toPNG());
  win.destroy();
  fs.copyFileSync(path.join(ROOT, 'build', 'icon.png'), path.join(OUT, 'belgi-512.png'));
  log('sarlavha-1024x500', 'belgi-512');
}

// Oynalar navbat bilan yopiladi — oxirgisi yopilganda Electron o'zi chiqib ketmasin.
app.on('window-all-closed', () => {});

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'capture-log.txt'), '');
  for (const [name, step] of Object.entries({ graphics, phonePortrait, phoneLandscape, tablet })) {
    try {
      await step();
    } catch (e) {
      log('XATO', name, e.stack || e.message);
    }
  }
  app.quit();
});
