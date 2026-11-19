// Platformaga bog'liq kichik yordamchilar: Electron (Windows), brauzer yoki Android ilova (Capacitor).
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

/** Android ilovasi ichida ishlayaptimi (Capacitor WebView). */
export const isNativeApp = Capacitor.isNativePlatform();

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Faylni foydalanuvchiga beradi. Brauzer va Electron'da — oddiy yuklab olish.
 * Android ilovasida brauzer yuklab olishi ishlamaydi: fayl ilova keshiga yoziladi va
 * "Ulashish" oynasi ochiladi (Fayllar, Drive, Telegram va hokazoga saqlash mumkin).
 */
export async function saveBlob(fileName, blob) {
  if (isNativeApp) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
    const { uri } = await Filesystem.writeFile({ path: fileName, data: await toBase64(blob), directory: Directory.Cache });
    await Share.share({ title: fileName, url: uri, dialogTitle: 'Faylni saqlash yoki yuborish' });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Android "Orqaga" tugmasi. handler true (yoki true beruvchi Promise) qaytarsa — ilova o'zi hal qildi; false — ilovadan chiqiladi.
 * Brauzer va Electron'da hech narsa qilmaydi. Obunani bekor qiluvchi funksiya qaytaradi.
 */
export function onBackButton(handler) {
  if (!isNativeApp) return () => {};
  let remove = null;
  let cancelled = false;
  import('@capacitor/app').then(({ App }) => {
    App.addListener('backButton', async () => {
      if (!(await handler())) App.exitApp();
    }).then((h) => {
      if (cancelled) h.remove();
      else remove = h;
    });
  });
  return () => {
    cancelled = true;
    remove?.remove();
  };
}

/**
 * Android ilovasida o'yin ochiq turganda ekranni yon tomonga (landshaft) qulflaydi, chiqqanda qulfni yechadi.
 * Soya va Xazina poygasi keng ekranda o'ynaladi — foydalanuvchi telefonni o'zi burishi shart emas.
 * Brauzer va Electron'da hech narsa qilmaydi.
 */
export function useLandscape(active = true) {
  useEffect(() => {
    if (!isNativeApp || !active) return undefined;
    let left = false;
    const plugin = import('@capacitor/screen-orientation');
    plugin.then(({ ScreenOrientation }) => {
      if (!left) ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {});
    });
    return () => {
      left = true;
      plugin.then(({ ScreenOrientation }) => ScreenOrientation.unlock().catch(() => {}));
    };
  }, [active]);
}
