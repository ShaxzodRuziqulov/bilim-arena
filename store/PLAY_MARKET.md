# Google Play — joylash qo‘llanmasi (Bilim Arena)

Bu fayl Play Console’ga nimani qayerga kiritishni ko‘rsatadi. Rasmlar: [`store/play/`](play/) (`npm run store-assets` bilan qayta yaratiladi).

## 0. Siz qiladigan ishlar (hisob)
1. https://play.google.com/console → **shaxsiy (Personal)** hisob, bir martalik to‘lov (~$25), shaxsni tasdiqlash (pasport/ID).
2. Ilova bepul — to‘lov profili (merchant) **kerak emas**.
3. Yangi shaxsiy hisoblar uchun: **yopiq sinov (Closed testing) — kamida 12 sinovchi, 14 kun**, keyin “Production”ga ruxsat so‘raladi. (Talab o‘zgarishi mumkin — Console’dagi ko‘rsatmaga qarang.)

## 1. Ilova yaratish
| Maydon | Qiymat |
|---|---|
| App name | **Bilim Arena** |
| Default language | O‘zbek (uz) — mavjud bo‘lmasa: English, keyin “Translations”ga o‘zbekcha |
| App or game | **Game** (kategoriya: *Educational*) |
| Free or paid | **Free** |
| Package name | `uz.bilimarena.app` (ilovaning o‘zida, o‘zgartirib bo‘lmaydi) |

## 2. Fayl (AAB)
- GitHub → Actions → “Release” (yoki “Android”) ishga tushirilgan yig‘ish → **Artifacts → `Bilim-Arena-aab-play-market`** → ichida `Bilim-Arena.aab`.
- **Play App Signing**: “Use Google-generated key” (tavsiya). Bizning doimiy kalitimiz (`_zaxira/bilim-arena-android-kalit`) **yuklash kaliti** bo‘ladi.
- Har yangi versiyada `versionCode` package.json versiyasidan avtomatik oshadi (0.9.1 → 901).

## 3. Do‘kon sahifasi (Main store listing)

### Qisqa tavsif (≤ 80 belgi)
- **uz:** `4 ta bepul ta’limiy o‘yin: mantiq, dasturlash va savollar. Internetsiz.`
- **ru:** `4 бесплатные обучающие игры: логика, программирование, викторина. Офлайн.`
- **en:** `4 free educational games: logic, coding and quizzes. Works offline.`

### To‘liq tavsif (uz)
```
Bilim Arena — o‘quvchilar va o‘qituvchilar uchun bepul ta’limiy o‘yinlar. Internet kerak emas, reklama yo‘q.

🔐 KODBUZAR — yashirin kodni toping. Rangli kataklar maslahat beradi: mantiq va ehtimollar bilan seyflarni oching. Darajalar va har kungi yangi kod.

👤 SOYA — platformer-jumboq. Harakatingizni yozing — soyangiz uni takrorlaydi: tugmani bosib turadi, lazerni to‘sadi, zinapoya bo‘ladi. 15 daraja, 3 dunyo.

🤖 ROBOT DASTURLASH — bloklardan haqiqiy Java kodigacha. 1–10-darajalar: tugmalar bilan buyruqlar, funksiya va rekursiya. 11–16-darajalar: robotni haqiqiy Java kodi bilan boshqarish (for, while, if, o‘zgaruvchilar). Xatolar o‘zbekcha tushuntiriladi.

🏝️ XAZINA POYGASI — o‘z savollaringiz bilan viktorina. Yakka yoki 2–4 jamoa navbat bilan javob berib xazina tomon yuradi: bonus, girdob va sirli kataklar, g‘alaba marosimi va kunlik sarguzasht. Savollarni ilovaning o‘zida yoki Excel orqali qo‘shasiz.

✔ Telefon, planshet, kompyuter va sensorli doska
✔ Hech qanday shaxsiy ma’lumot yig‘ilmaydi — hammasi qurilmaning o‘zida
✔ Zaxira nusxa va Excel eksport
✔ Bepul, reklamasiz

Kompyuter (Windows) versiyasi ham bor: github.com/ShaxzodRuziqulov/bilim-arena
```

### To‘liq tavsif (ru)
```
Bilim Arena — бесплатные обучающие игры для учеников и учителей. Без интернета и без рекламы.

🔐 КОДБУЗАР — найдите секретный код по цветным подсказкам. Уровни и новый код каждый день.
👤 СОЯ (ТЕНЬ) — платформер-головоломка: запишите движение — тень его повторит.
🤖 ПРОГРАММИРОВАНИЕ РОБОТА — от блоков к настоящему коду Java, 16 уровней.
🏝️ ГОНКА ЗА СОКРОВИЩЕМ — викторина с вашими вопросами: один игрок или 2–4 команды.

✔ Телефон, планшет, компьютер и интерактивная доска
✔ Никаких персональных данных — всё хранится на устройстве
✔ Бесплатно, без рекламы
```

### Grafika (`store/play/`)
| Play maydoni | Fayl |
|---|---|
| App icon 512×512 | `belgi-512.png` |
| Feature graphic 1024×500 | `sarlavha-1024x500.png` |
| Phone screenshots (2–8) | `telefon-1…8-*.png` (1080×1920 va 2160×1080) |
| 10-inch tablet screenshots | `planshet-1…3-*.png` (1920×1200) |
| 7-inch tablet | ixtiyoriy — planshet rasmlaridan foydalanish mumkin |
| Video (YouTube havola) | ixtiyoriy — `npm run video` natijasini YouTube’ga yuklab, havolasini qo‘ying |

## 4. App content (so‘rovnomalar) — tavsiya etilgan javoblar
| Bo‘lim | Javob |
|---|---|
| **Privacy policy** | `https://github.com/ShaxzodRuziqulov/bilim-arena/blob/main/PRIVACY.md` |
| **Ads** | No, my app does not contain ads |
| **App access** | All functionality is available without special access (login yo‘q) |
| **Content rating** (IARC) | Kategoriya: *Game*. Zo‘ravonlik, qo‘rqinchli, jinsiy, so‘kinish, giyohvand, qimor — **yo‘q**. Foydalanuvchilar o‘zaro aloqa qilmaydi, joylashuv ulashilmaydi, raqamli xarid yo‘q. Kutilgan natija: **3+ / Everyone** |
| **Target audience** | 6–8, 9–12, 13–15, 16–17 (o‘quvchilar). 13 yoshgacha tanlangani uchun **Families policy** qo‘llanadi — quyida |
| **News app** | No |
| **Data safety** | “Does your app collect or share any of the required user data types?” → **No**. “Is all of the user data collected by your app encrypted in transit?” → so‘ralmaydi (yig‘ilmaydi). “Do you provide a way for users to request that their data is deleted?” → ma’lumot yig‘ilmaydi; ilovani o‘chirish barcha ma’lumotni o‘chiradi |
| **Government app** | No |
| **Financial features** | None |
| **Health** | No |

## 5. Bolalar (Families policy) — tekshiruv ro‘yxati
- [x] Reklama yo‘q, reklama SDK yo‘q
- [x] Analitika/kuzatuv SDK yo‘q, shaxsiy ma’lumot yig‘ilmaydi
- [x] Ilova ichida xarid yo‘q
- [x] Tashqi havolalar o‘yin ichida yo‘q (faqat do‘kon tavsifida)
- [x] Hisob/ro‘yxatdan o‘tish yo‘q
- [x] Ruxsatlar: faqat `INTERNET` (Capacitor standarti; ma’lumot yuborilmaydi). Joylashuv, kamera, mikrofon, kontaktlar — yo‘q
- [x] Mazmun: ta’limiy, zo‘ravonliksiz
- [x] Maxfiylik siyosati bolalar haqida aniq yozilgan (PRIVACY.md)
- [ ] Ixtiyoriy: “Teacher Approved” dasturiga Google o‘zi tanlaydi — ariza shart emas

## 6. Yopiq sinov (Closed testing)
1. Testing → Closed testing → yangi trek → AAB yuklash → “Testers” ga 12+ Gmail manzil (yoki Google Group).
2. Sinovchilarga “Opt-in URL” havolasini yuboring — ular Play’dan o‘rnatadi va 14 kun davomida ilovani ochib turadi.
3. 14 kundan keyin: Dashboard → “Apply for production” — sinov haqida qisqa savollarga javob beriladi.

## 7. Yangi versiya chiqarish
1. Kod `main`da, `package.json` versiyasi oshiriladi, `v*` teg — GitHub Actions Windows o‘rnatuvchisi, APK va AAB yig‘adi.
2. AAB’ni Actions → Artifacts’dan olib, Play Console → Production (yoki sinov treki) → “Create new release”ga yuklang.
