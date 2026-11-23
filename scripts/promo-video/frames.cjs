// Tayyor videodan berilgan soniyalardagi kadrlarni PNG qilib saqlaydi — videoni ko'rmasdan tekshirish uchun.
// Ishlatish: npx electron scripts/promo-video/frames.cjs <video.mp4> <papka> 5,20,40
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const [video, outDir, times] = process.argv.slice(-3);
app.whenReady().then(async () => {
  const w = new BrowserWindow({ show: false, width: 960, height: 540, webPreferences: { backgroundThrottling: false } });
  await w.loadURL('about:blank');
  await w.webContents.executeJavaScript(`document.body.innerHTML='<video id=v muted></video><canvas id=c width=960 height=540></canvas>'`);
  fs.mkdirSync(outDir, { recursive: true });
  const src = 'data:video/mp4;base64,' + fs.readFileSync(video).toString('base64');
  const dur = await w.webContents.executeJavaScript(`new Promise((r) => { const v = document.getElementById('v'); v.onloadeddata = () => r(v.duration); v.src = ${JSON.stringify(src)}; })`);
  fs.writeFileSync(path.join(outDir, 'davomiylik.txt'), String(dur));
  for (const t of times.split(',').map(Number)) {
    const b64 = await w.webContents.executeJavaScript(`new Promise((r) => { const v = document.getElementById('v'); v.onseeked = () => { const c = document.getElementById('c'); c.getContext('2d').drawImage(v, 0, 0, 960, 540); r(c.toDataURL('image/png').split(',')[1]); }; v.currentTime = ${t}; })`);
    fs.writeFileSync(path.join(outDir, `t${String(t).padStart(3, '0')}.png`), Buffer.from(b64, 'base64'));
  }
  app.quit();
});
