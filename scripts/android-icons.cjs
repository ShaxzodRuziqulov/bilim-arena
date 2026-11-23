// Android ilova belgilarini build/icon.png dan yaratadi (qo'shimcha kutubxonasiz — Electron nativeImage orqali).
// Ishga tushirish: npx electron scripts/android-icons.cjs
// - ic_launcher.png / ic_launcher_round.png — eski Android (7.x) uchun to'liq belgi;
// - ic_launcher_foreground.png — Android 8+ moslashuvchan belgi qatlami: yumaloq burchaklarsiz ichki qism,
//   fon rangi values/ic_launcher_background.xml da.
const { app, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

app.whenReady().then(() => {
  const src = nativeImage.createFromPath(path.join(__dirname, '..', 'build', 'icon.png'));
  const { width } = src.getSize();
  // Yumaloq burchakli ramkaning ichki to'liq kvadrati (512 px belgida 40 px chekka).
  const inset = Math.round(width * (40 / 512));
  const inner = src.crop({ x: inset, y: inset, width: width - 2 * inset, height: width - 2 * inset });
  for (const [name, k] of Object.entries(DENSITIES)) {
    const dir = path.join(RES, `mipmap-${name}`);
    const legacy = src.resize({ width: Math.round(48 * k), quality: 'best' }).toPNG();
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), legacy);
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), legacy);
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), inner.resize({ width: Math.round(108 * k), quality: 'best' }).toPNG());
  }
  console.log('Android belgilari yaratildi');
  app.quit();
});
