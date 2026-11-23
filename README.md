# Bilim Arena

Ta'limiy o'yinlar platformasi: sensorli elektron doskada jamoaviy o'yinlar va yakka o'yinlar (birinchi fan — Informatika, 5–11-sinflar).

## Yuklab olish (bepul, Windows)

⬇ **[Bilim-Arena-Setup.exe](https://github.com/ShaxzodRuziqulov/bilim-arena/releases/latest/download/Bilim-Arena-Setup.exe)** — har doim eng yangi versiya.

Windows “Windows protected your PC” deb ogohlantirsa: **More info → Run anyway** (dastur hali raqamli imzolanmagan). Keyingi versiyalar o‘zi yangilanadi.

Dastur bepul; rasmiy faylni o‘zgartirmasdan ulashish mumkin, sotish mumkin emas — [LICENSE.md](LICENSE.md). Kutubxonalar: [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Hozir nimalar bor

- **O‘yinlar zali** — dastur har doim shu yerdan ochiladi. To‘rtala o‘yin bir xil afishada: Kodbuzar, Soya (yakka), Robot dasturlash (yakka yoki jamoa), Xazina poygasi (yakka yoki 2–4 jamoa). Har o‘yindan chiqqanda zalga qaytiladi; oxirgi o‘ynalgan o‘yinni davom ettirish qatori bor.
- **Kodbuzar** — 2 xonali rangli seyflardagi kodni topish (“Buqa va sigir” mantig‘i), darajalar va kunlik kod.
  **Mantiq sinovi** uchta qisqa vazifani beradi. Dalildan kodni toping, eng foydali taxminni tanlang va noto‘g‘ri izohni aniqlang.
- **Soya** — platformer-jumboq: harakatlaringizni yozing, soyangiz ularni takrorlaydi. 15 daraja, 3 dunyo.
- **Sozlamalar** (zaldagi ⚙) — ikki bo‘lim: **Umumiy** (ovoz va musiqa, animatsiyalar, PIN, yangilanishlar, zaxira — barcha o‘yinlar uchun) va **O‘yinlar** (har o‘yinning o‘z sozlamalari, natijalari; Xazina poygasining savol to‘plamlari).
- **PIN (ixtiyoriy)** — o‘rnatilsa, Sozlamalarni ochish va dasturdan chiqishda so‘raladi, dastur ochiq turgan vaqtda bir marta. O‘yinlar, pauza va natijalar PINsiz.
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
- **Robot dasturlash** — bitta zinapoya, 16 daraja, savol to‘plami kerak emas:
  - *1–10: Bloklar* (5–7-sinf) — tugmalar bilan buyruqlar, P funksiyasi va rekursiya; kam buyruq bilan yechilsa ko‘proq yulduz;
  - *11–16: Java* (8–11-sinf) — haqiqiy Java kodi (metod, int, for, while, if), xatolar o‘zbekcha va qator raqami bilan;
    doskada yozish uchun tayyor bo‘laklar va ekran tugmalari; birinchi urinishda yechilsa 3 yulduz.
  Mashq rejimida daraja erkin tanlanadi (yuqoridagi 1–16 tugmalari, Java qismi ☕ belgisi bilan ajratilgan).
  Jamoaviy rejimda har daraja — raund; tayyorgarlikda “Bloklar”, “Java” yoki “Butun zinapoya” tez tanlanadi, istalgan oraliqni ham olish mumkin.
  Qadam-baqadam bajarish va tezlikni tanlash bor.
- **Natijalar** — reyting, aniqlik foizi, ko‘p xato qilingan savollar; o‘yinlar tarixi saqlanadi.
- To‘plamlarni `.json` fayl sifatida eksport / import qilish.
- **To‘liq zaxira va tiklash** — Sozlamalar → Zaxira va tiklash. Avtomatik oldingi nusxa va saqlash xatosidan keyin qayta urinish mavjud.
  JSON fayl tanlanganda savol va natijalar soni ko‘rinadi. Tasdiqlasangiz, zaxira joriy to‘plamlar va tarixni almashtiradi. 25 MB dan katta fayllar ham qabul qilinadi. Tiklash uchun qurilmada yetarli bo‘sh joy kerak.
- **Animatsiyalar** — Sozlamalar → Umumiy. Xazina poygasida savol tugmasi darhol ochiladi. Soya’da animatsiyalar o‘chirilganda menyu harakati va sahna qorayishi to‘xtaydi, yozilgan soya esa o‘yinda harakatini takrorlaydi.
- **Xazina poygasi kichik ekranda** — tik holatda javoblar bir ustunda, yon holatda maydon keng ko‘rinishda chiqadi. Uzun savol yoki javoblar bo‘lsa, savol kartasini pastga siljiting.
- **Soya telefonda** — o‘ynash uchun telefonni yon tomonga buring. Tik holatdagi ekrandan zalga qaytish mumkin. Sensorli boshqaruvda ● tugmasi soya yozishni boshlaydi va tugatadi.
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
O‘rnatilgan dastur kattalashtirilgan oddiy oynada ochiladi. O‘yin ichidagi ⛶ tugmasi to‘liq ekranga o‘tkazadi. PIN (agar o‘rnatilgan bo‘lsa) faqat Sozlamalar va dasturdan chiqishda so‘raladi.

Windows PowerShell `npm` skriptini bloklasa, `npm.cmd run dev` deb yozing.

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
src/components/  PIN oynasi, kod ko‘rinishi, tasdiqlash tugmasi, zaxira paneli
src/screens/     O‘yinlar zali, Sozlamalar, muharrir, o‘yin sozlash, poyga, robot o‘yini, natijalar
src/games/       O‘yinlar reyestri (registry.jsx), Kodbuzar va Soya
shared/          Ma'lumot sxemasi, o‘yin ID lari, yakka o‘yinlar zaxirasi
```

## Keyingi bosqichlar

3. Duel rejimi, Boss jangi, yoshga mos mavzular, musiqa.
4. Telefon / kompyuter orqali Wi-Fi multiplayer, boshqa aniq fanlar.

## Ishlar va qoidalar

Maqsad, amaldagi qoidalar va o‘zgarishlar: [ISHLAR_VA_QOIDALAR.md](ISHLAR_VA_QOIDALAR.md).

Dizayn qarorlari, PIN tartibi va kelajakdagi pullik mahsulot rejasi: [MAHSULOT_QARORLARI.md](MAHSULOT_QARORLARI.md).

Tekshiruvlar: `npm test`, `npm run build` va Electron sinovi `npm run smoke:electron` (oynani ko‘rsatish uchun `BILIM_ARENA_TEST_SHOW=1`). Haqiqiy dars ssenariysi: [SINF_SINOVI.md](SINF_SINOVI.md).
