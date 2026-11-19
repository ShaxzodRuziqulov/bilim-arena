// Dasturga kiradigan uchinchi tomon kutubxonalari va ularning litsenziya matnlari ro'yxatini yaratadi.
// Ishga tushirish: node scripts/third-party-licenses.mjs  →  THIRD_PARTY_LICENSES.md
// Yangi kutubxona qo'shilganda qayta ishga tushiring (ildizlar ro'yxati — ROOTS).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Dastur ichiga (Vite bo'lagi yoki Electron) kiradigan ildiz paketlar. Faqat yig'ish vositalari (vite, electron-builder) kiritilmaydi.
const ROOTS = ['react', 'react-dom', 'phaser', '@fontsource-variable/nunito', '@fontsource/nunito', 'read-excel-file', 'write-excel-file', 'electron-updater', 'electron'];

const seen = new Map();
const visit = (name) => {
  if (seen.has(name)) return;
  const dir = join('node_modules', name);
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  const licenseFile = readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f));
  seen.set(name, {
    name,
    version: pkg.version,
    license: typeof pkg.license === 'string' ? pkg.license : pkg.license?.type || 'noma’lum',
    url: (typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url || pkg.homepage || '').replace(/^git\+/, ''),
    text: licenseFile ? readFileSync(join(dir, licenseFile), 'utf8').trim() : '',
  });
  for (const dep of Object.keys(pkg.dependencies || {})) visit(dep);
};
ROOTS.forEach(visit);

const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
const out = [
  '# Uchinchi tomon kutubxonalari',
  '',
  'Bilim Arena quyidagi ochiq litsenziyali kutubxonalardan foydalanadi. Ularning mualliflariga rahmat.',
  'Electron tarkibidagi Chromium litsenziyalari o‘rnatilgan dastur papkasidagi `LICENSES.chromium.html` faylida.',
  '',
  '| Kutubxona | Versiya | Litsenziya |',
  '| --- | --- | --- |',
  ...list.map((p) => `| ${p.name} | ${p.version} | ${p.license} |`),
  '',
  ...list.flatMap((p) => [`## ${p.name} ${p.version} — ${p.license}`, p.url ? `Manba: ${p.url}` : '', '', '```', p.text || `${p.license} litsenziyasi (paketda alohida matn yo‘q)`, '```', '']),
].join('\n');
writeFileSync('THIRD_PARTY_LICENSES.md', out);
console.log(`${list.length} ta kutubxona → THIRD_PARTY_LICENSES.md`);
