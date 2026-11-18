// Electron smoke: haqiqiy main.cjs + dist/ (file://), vaqtinchalik profil (o'qituvchi ma'lumotiga tegilmaydi), CDP orqali boshqaruv.
// Zal -> Kodbuzar (o'yin, g'alaba, saqlash) -> Soya (menyu, daraja, chiqish) -> studiya.
// Ishlatish: npm run build && npm run smoke:electron   (natija va skrinshotlar: OS vaqtinchalik papkasida)
// Ishonchli natija uchun oynani ko'rsatish tavsiya etiladi: BILIM_ARENA_TEST_SHOW=1 (yashirin oynada Phaser sekinlashadi).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.argv[3] || path.join(os.tmpdir(), 'bilim-arena-smoke');
console.log(`Natijalar: ${outDir}`);
fs.mkdirSync(outDir, { recursive: true });
const profile = path.join(outDir, 'profile');
fs.rmSync(profile, { recursive: true, force: true });
const PORT = 9333;
const exe = path.join(project, 'node_modules', 'electron', 'dist', process.platform === 'win32' ? 'electron.exe' : 'electron');
const child = spawn(exe, ['.', `--remote-debugging-port=${PORT}`, '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'], {
  cwd: project,
  env: { ...process.env, BILIM_ARENA_TEST_DATA_DIR: profile },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', (d) => (logs += d));
child.stderr.on('data', (d) => (logs += d));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
};

async function pageTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page' && t.url.startsWith('file:'));
      if (page) return page;
    } catch {
      /* hali tayyor emas */
    }
    await sleep(500);
  }
  throw new Error('Electron sahifasi topilmadi');
}

let ws;
let seq = 0;
const pending = new Map();
const consoleErrors = [];
function cdp(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    setTimeout(() => pending.has(id) && (pending.delete(id), reject(new Error(`${method} vaqti tugadi`))), 15000);
  });
}
async function js(expr) {
  const r = await cdp('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function until(expr, ms = 10000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await js(`return !!(${expr})`)) return true;
    await sleep(200);
  }
  return false;
}
async function shot(name) {
  try {
    const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(data, 'base64'));
  } catch (e) {
    console.log(`(skrinshot olinmadi: ${name}: ${e.message})`);
  }
}

try {
  const target = await pageTarget();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') consoleErrors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
    else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') consoleErrors.push(`${msg.params.entry.text} ${msg.params.entry.url || ''}`);
  };
  await cdp('Runtime.enable');
  await cdp('Log.enable');
  await cdp('Page.enable');
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.setWebLifecycleState', { state: 'active' });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.reload');
  await sleep(2500);

  const hall = await js(`return { hall: !!document.querySelector('.hall'), posters: document.querySelectorAll('.poster').length, desktop: !!window.api, url: location.protocol }`);
  check('Zal ochildi (file://, window.api bor)', hall.hall && hall.posters === 5 && hall.desktop && hall.url === 'file:', JSON.stringify(hall));
  await shot('1-zal');

  await js(`document.querySelector('.poster-kodbuzar .poster-play').click()`);
  await sleep(2500);
  const kb = await js(`const s=document.querySelector('.kb-host')?.shadowRoot; return { shadow: !!s, styled: !!s?.querySelector('style')?.textContent.includes('.kb'), title: s?.querySelector('.title-3d')?.getAttribute('aria-label'), font: s ? getComputedStyle(s.querySelector('.kb')).fontFamily : '' }`);
  check('Kodbuzar Shadow DOM ichida, stillar bilan', kb.shadow && kb.styled && kb.title === 'Kodbuzar', JSON.stringify(kb));
  await js(`document.querySelector('.kb-host').shadowRoot.querySelector('.card.hero').click()`);
  await sleep(1200);
  for (const key of ['1', '2', 'Enter']) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key === 'Enter' ? 'Enter' : `Digit${key}`, windowsVirtualKeyCode: key === 'Enter' ? 13 : key.charCodeAt(0), text: key === 'Enter' ? '\r' : key });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key === 'Enter' ? 'Enter' : `Digit${key}`, windowsVirtualKeyCode: key === 'Enter' ? 13 : key.charCodeAt(0) });
    await sleep(150);
  }
  await sleep(1500);
  const row = await js(`const s=document.querySelector('.kb-host').shadowRoot; return [...s.querySelectorAll('.rows li .tile')].slice(0,2).map(t=>t.className)`);
  check('Kodbuzar: klaviatura bilan taxmin kiritildi va baholandi', row.length === 2 && row.every((c) => /m-(bull|cow|miss)/.test(c)), JSON.stringify(row));
  await shot('2-kodbuzar');
  for (const key of ['1', '4', 'Enter']) {
    await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key === 'Enter' ? 'Enter' : `Digit${key}`, windowsVirtualKeyCode: key === 'Enter' ? 13 : key.charCodeAt(0), text: key === 'Enter' ? String.fromCharCode(13) : key });
    await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key === 'Enter' ? 'Enter' : `Digit${key}`, windowsVirtualKeyCode: key === 'Enter' ? 13 : key.charCodeAt(0) });
    await sleep(150);
  }
  const won = await until(`document.querySelector('.kb-host').shadowRoot.querySelector('.result.won')`, 6000);
  await shot('2b-kodbuzar-galaba');
  const stars = await js(`return JSON.parse(localStorage.getItem('kodbuzar-v2')||'{}').progress?.d1?.[1] || 0`);
  check('Kodbuzar: seyf ochildi va natija Electron localStorage’ida saqlandi', won && stars > 0, `yulduz: ${stars}`);
  await js(`document.querySelector('.kb-host').shadowRoot.querySelector('.result .btn.ghost').click()`);
  await sleep(500);
  await js(`const s=()=>document.querySelector('.kb-host').shadowRoot; s().querySelector('.bar .icon-btn').click(); await new Promise(r=>setTimeout(r,500)); s().querySelector('.exit-btn').click();`);
  await sleep(1000);
  check('Kodbuzardan zalga qaytildi', await js(`return !!document.querySelector('.hall') && !document.querySelector('.kb-host')`));

  await js(`document.querySelector('.poster-soya .poster-play').click()`);
  await until(`document.querySelector('.soya-exit')`, 15000);
  await sleep(1500);
  const soya = await js(`return { canvas: document.querySelectorAll('.soya-canvas canvas').length, exit: !!document.querySelector('.soya-exit'), error: !!document.querySelector('.soya-status[role=alert]') }`);
  const frames = await js(`const f=window.__game?.loop.frame||0; await new Promise(r=>setTimeout(r,500)); return [f, window.__game?.loop.frame||0, await Promise.race([new Promise(r=>requestAnimationFrame(()=>r(true))), new Promise(r=>setTimeout(()=>r(false),800))])]`);
  check('Soya (Phaser bo‘lagi) file:// orqali yuklandi', soya.canvas === 1 && soya.exit && !soya.error, JSON.stringify({ ...soya, frames }));
  await shot('3-soya-menyu');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  check('Soya: daraja boshlandi, zal tugmasi yashirindi', await until(`!document.querySelector('.soya-exit') && window.__game?.scene.isActive('game')`, 8000) || await js(`return !document.querySelector('.soya-exit')`));
  await sleep(1500);
  await shot('4-soya-daraja');
  // Daraja -> darajalar ekrani -> bosh menyu (har bir sahna almashishini kutamiz)
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await until(`window.__game?.scene.isActive('select')`, 8000);
  await sleep(600);
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await until(`document.querySelector('.soya-exit')`, 8000);
  const back = await js(`const b=document.querySelector('.soya-exit'); if(!b) return {menu:false}; b.click(); await new Promise(r=>setTimeout(r,1000)); return { menu:true, hall: !!document.querySelector('.hall'), canvases: document.querySelectorAll('canvas').length }`);
  check('Soya menyusidan zalga qaytildi, canvas tozalandi', back.menu && back.hall && back.canvases === 0, JSON.stringify(back));

  const hall2 = await js(`return { cont: document.querySelector('.hall-continue b')?.textContent }`);
  check('Zal oxirgi o‘yinni eslab qoldi', /^Soya:/.test(hall2.cont || ''), JSON.stringify(hall2));
  await js(`document.querySelector('.hall').scrollTo(0, 0)`);
  await shot('5-zal');

  // Robo Kod mashqi zaldan ochiladi va zalga qaytadi (studiyaga emas).
  const kod = await js(`const w=(ms)=>new Promise(r=>setTimeout(r,ms)); const btn=(re)=>[...document.querySelectorAll('button')].find(b=>re.test(b.textContent));
    document.querySelector('.poster-kod .poster-play').click(); await w(1000); const opened=!document.querySelector('.hall');
    btn(/^⏸$/)?.click(); await w(400); btn(/O‘yinlar zaliga qaytish/)?.click(); await w(800);
    return { opened, back: !!document.querySelector('.hall') }`);
  check('Robo Kod mashqi zaldan ochildi va zalga qaytdi', kod.opened && kod.back, JSON.stringify(kod));

  await js(`[...document.querySelectorAll('.hall-top .btn')].find(b=>b.textContent.includes('Studiya')).click()`);
  await sleep(1200);
  check('Studiya tugmasi studiyani ochdi', await js(`return !!document.querySelector('.topbar')`));
  await shot('6-studiya');

  check('Konsolda xato yo‘q', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
} catch (e) {
  check('Haydovchi', false, e.message);
} finally {
  try { ws?.close(); } catch {}
  child.kill();
  await sleep(800);
  fs.writeFileSync(path.join(outDir, 'electron.log'), logs);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} tekshiruv o‘tdi`);
  process.exit(failed ? 1 : 0);
}
