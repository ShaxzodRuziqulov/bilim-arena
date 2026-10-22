# Bilim Arena

Sensorli elektron doska uchun jamoaviy ta'limiy o'yin (birinchi fan — Informatika, 5–11-sinflar).

## Hozir nimalar bor (1–2-bosqich)

- **O‘qituvchi (admin) paneli** — PIN kod bilan himoyalangan. O‘quvchilar doskada sozlamalar va savollarni o‘zgartira olmaydi.
- **Savol muharriri** — besh xil savol turi:
  - variantli (2–4 ta javob),
  - to‘g‘ri / noto‘g‘ri,
  - javob yozish (doskada raqamli klaviatura, o‘n oltilik uchun A–F),
  - tartiblash (kartochkalarni to‘g‘ri ketma-ketlikda bosish),
  - moslashtirish (chap va o‘ng ustunni juftlash).
  Har bir savolga rasm, rangli kod parchasi (Python / Pascal / C++) va izoh qo‘shish mumkin.
- **Excel** — “📄 Excel shablon” tugmasi namunali fayl beradi; to‘ldirib “Excel’dan import” qilinadi.
  To‘plamni Excel’ga eksport ham qilish mumkin (rasmlar faqat JSON eksportda saqlanadi).
- **Avtomatik yangilanish** — o‘rnatilgan dastur GitHub Releases’dan yangi versiyani fonda yuklab oladi
  va dastur yopilganda o‘rnatadi (Sozlamalar → Yangilanishlar).
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

## Yangi versiya chiqarish

Bir martalik sozlash: `package.json` ichida `build.publish[0].owner` qiymatini GitHub foydalanuvchi
nomingizga almashtiring va repozitoriy nomi `bilim-arena` bo‘lsin.

Har safar yangi versiya chiqarish:

```bash
npm version patch
```

```bash
git push --follow-tags
```

`npm version patch` versiyani oshiradi (0.1.0 → 0.1.1) va `v0.1.1` tegini yaratadi. Teg GitHub’ga
yetib borgach, GitHub Actions (`.github/workflows/release.yml`) o‘rnatuvchini yig‘ib Release’ga joylaydi.
Maktabdagi dasturlar keyingi ishga tushishida (yoki 4 soatda bir) yangilanishni o‘zi yuklab oladi.

Eslatma: dastur raqamli imzolanmagan, shuning uchun birinchi o‘rnatishda Windows “Noma’lum nashriyotchi”
ogohlantirishini ko‘rsatishi mumkin — “Подробнее / More info → Run anyway” bosiladi.

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

3. Duel rejimi, Boss jangi, yoshga mos mavzular, musiqa.
4. Telefon / kompyuter orqali Wi-Fi multiplayer, boshqa aniq fanlar.
