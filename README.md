# Bilim Arena

Sensorli elektron doska uchun jamoaviy ta'limiy o'yin (birinchi fan — Informatika, 5–11-sinflar).

## Hozir nimalar bor (1–2-bosqich)

- **Dars studiyasi** — birinchi ochilishdan parolsiz ishlaydi. Ixtiyoriy “Sinf himoyasi” va qo‘lda qulflash bor. Himoya yoqilganda o‘yin boshqaruviga qaytish uchun PIN kerak; pauza va davom etish PINsiz.
- **Savol muharriri** — besh xil savol turi:
  - variantli (2–4 ta javob),
  - to‘g‘ri / noto‘g‘ri,
  - javob yozish (doskada raqamlar, A–F yoki matnli harf klaviaturasi),
  - tartiblash (kartochkalarni to‘g‘ri ketma-ketlikda bosish),
  - moslashtirish (chap va o‘ng ustunni juftlash).
  Har bir savolga rasm, rangli kod parchasi (Python / Pascal / C++) va izoh qo‘shish mumkin.
- **Excel** — “📄 Excel shablon” tugmasi namunali fayl beradi; to‘ldirib “Excel’dan import” qilinadi.
  To‘plamni Excel’ga eksport ham qilish mumkin (rasmlar faqat JSON eksportda saqlanadi).
- **Avtomatik yangilanish** — o‘rnatilgan dastur GitHub Releases’dan yangi versiyani fonda yuklab oladi
  va dastur yopilganda o‘rnatadi (Sozlamalar → Yangilanishlar).
- **Xazina poygasi** — 2–4 jamoa navbat bilan doskaga chiqib javob beradi. To‘g‘ri javob — 1 qadam oldinga,
  ⭐ bonus katak (+1), 🌀 girdob (−1). Bir jamoa xazinaga yetgach, davra oxirigacha navbatlar tenglashtiriladi. Qadamlar, keyin to‘g‘ri javoblar soni solishtiriladi; teng natija — durang.
- **Robot dasturlash** (O‘qituvchi paneli → 🤖) — savol to‘plami kerak emas:
  - *Robo Kod* (5–7-sinf) — tugmalar bilan buyruqlar, P funksiyasi va rekursiya, 10 ta daraja;
  - *Java Robot* (8–11-sinf) — haqiqiy Java kodi (metod, int, for, while, if), 6 ta dars,
    xatolar o‘zbekcha va qator raqami bilan; doskada yozish uchun tayyor bo‘laklar va ekran tugmalari.
  Jamoaviy rejimda har daraja — raund, jamoalar navbat bilan yechib yulduz yig‘adi; mashq rejimida daraja erkin tanlanadi.
  Ikkalasida ham qadam-baqadam bajarish va tezlikni tanlash bor.
- **Natijalar** — reyting, aniqlik foizi, ko‘p xato qilingan savollar; o‘yinlar tarixi saqlanadi.
- To‘plamlarni `.json` fayl sifatida eksport / import qilish.
- **To‘liq zaxira va tiklash** — Sozlamalar → Zaxira va tiklash. Avtomatik oldingi nusxa va saqlash xatosidan keyin qayta urinish mavjud.
- **Xato savollarni takrorlash** — yangi o‘yin natijasidagi eng ko‘p xato qilingan 10 tagacha savol, vaqt cheklovisiz va asosiy natijani o‘zgartirmasdan.

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
O‘rnatilgan dastur kattalashtirilgan oddiy oynada ochiladi. O‘yin ichidagi ⛶ tugmasi to‘liq ekranga o‘tkazadi. PIN faqat ixtiyoriy himoya yoki qo‘lda qulflashda so‘raladi.

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
Avtomatik oldingi nusxa: data.json.bak. PIN unutilsa savollar faylini o‘chirmang; PINni alohida tiklash kerak. Sozlamalardagi to‘liq zaxira fayli savollar va tarixni saqlash uchun ishlatiladi.

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

## Ishlar va qoidalar

Maqsad, amaldagi qoidalar va o‘zgarishlar: [ISHLAR_VA_QOIDALAR.md](ISHLAR_VA_QOIDALAR.md).

Dizayn qarorlari, PIN tartibi va kelajakdagi pullik mahsulot rejasi: [MAHSULOT_QARORLARI.md](MAHSULOT_QARORLARI.md).

Tekshiruvlar: npm test va npm run build. Haqiqiy dars ssenariysi: [SINF_SINOVI.md](SINF_SINOVI.md).
