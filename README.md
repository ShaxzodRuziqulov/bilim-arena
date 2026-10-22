# Bilim Arena

Sensorli elektron doska uchun jamoaviy ta'limiy o'yin (birinchi fan — Informatika, 5–11-sinflar).

## Hozir nimalar bor (1-bosqich)

- **O‘qituvchi (admin) paneli** — PIN kod bilan himoyalangan. O‘quvchilar doskada sozlamalar va savollarni o‘zgartira olmaydi.
- **Savol muharriri** — uch xil savol turi:
  - variantli (2–4 ta javob),
  - to‘g‘ri / noto‘g‘ri,
  - javob yozish (doskada raqamli klaviatura, o‘n oltilik uchun A–F).
  Har bir savolga rasm, rangli kod parchasi (Python / Pascal / C++) va izoh qo‘shish mumkin.
- **Xazina poygasi** — 2–4 jamoa navbat bilan doskaga chiqib javob beradi. To‘g‘ri javob — 1 qadam oldinga,
  ⭐ bonus katak (+1), 🌀 girdob (−1). Xazinaga birinchi yetgan jamoa g‘olib.
- **Natijalar** — reyting, aniqlik foizi, ko‘p xato qilingan savollar; o‘yinlar tarixi saqlanadi.
- To‘plamlarni `.json` fayl sifatida eksport / import qilish.

## Ishga tushirish

Kerak: [Node.js](https://nodejs.org) 20 yoki undan yangi.

```bash
npm install
```

```bash
npm run dev
```

`npm run dev` — dasturni ishlab chiqish rejimida ochadi (oyna, to‘liq ekran emas).

`npm run web` — faqat brauzerda ochish (http://localhost:5173), tez sinash uchun.

`npm run dist` — Windows o‘rnatuvchi (`release/` papkasida `.exe`) yig‘adi.
O‘rnatilgan dastur to‘liq ekranda (kiosk) ochiladi; chiqish faqat PIN bilan.

## Ma'lumotlar qayerda saqlanadi

Dastur: `%APPDATA%\Bilim Arena\data.json` (savollar, sozlamalar, natijalar).
PIN unutilsa — shu faylni o‘chirsangiz dastur boshidan sozlanadi (savollarni oldindan eksport qilib qo‘ying).

## Tuzilishi

```
electron/        Electron asosiy jarayoni (oyna, fayl saqlash, chiqishni qulflash)
src/lib/         Ma'lumotlar, PIN, tovush, yordamchi funksiyalar, namunaviy savollar
src/components/  PIN oynasi, kod ko‘rinishi, tasdiqlash tugmasi
src/screens/     Bosh ekran, admin, muharrir, o‘yin sozlash, poyga, natijalar
```

## Keyingi bosqichlar

2. GitHub Releases orqali avtomatik yangilanish, Excel’dan savol import, tartiblash / moslashtirish savollari.
3. Duel rejimi, Boss jangi, yoshga mos mavzular, musiqa.
4. Telefon / kompyuter orqali Wi-Fi multiplayer, boshqa aniq fanlar.
