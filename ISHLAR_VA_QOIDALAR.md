# Bilim Arena — ishlar va qoidalar

## Maqsad
Maktabdagi 5–11-sinf o‘quvchilarini darsga qiziqtirish, jamoaviy ishtirok va bilimni mustahkamlash. Asosiy platforma — sensorli elektron doska.

## Ishlash tamoyillari
- Avval mavjud Xazina poygasining xatolari va darsdagi qulayligi yaxshilanadi.
- O‘qituvchi savollarni sinf darajasiga moslaydi; har navbatda boshqa o‘quvchi chiqishini boshqaradi.
- Amalga oshirilmagan imkoniyatlar tayyor deb ko‘rsatilmaydi.
- Har o‘zgarishda ushbu faylga natija va tekshiruv yoziladi.

## Xazina poygasi qoidalari
1. 2–4 jamoa qatnashadi. Bir davra — har jamoaga bittadan navbat.
2. To‘g‘ri javob +1 qadam. Xato yoki vaqt tugashi — qadam berilmaydi.
3. Bonus +1, girdob −1 qadam; har maxsus katak har jamoaga faqat bir marta ta’sir qiladi. Bonusdan keyingi katak ketma-ket ishga tushmaydi.
4. Bir jamoa xazinaga yetgach, shu davradagi qolgan jamoalar ham navbatini o‘ynaydi. Keyingi davra boshlanmaydi.
5. Avval qadamlar, keyin to‘g‘ri javoblar soni solishtiriladi. Ikkalasi teng bo‘lsa — durang.
6. O‘qituvchi muddatidan oldin yakunlasa, joriy natija shu mezon bilan hisoblanadi; bunday o‘yinda navbatlar tengligi kafolatlanmaydi.
7. Savollar aralashtiriladi; to‘plam tugasa qayta aralashtirib ishlatiladi. Qiyinlik bo‘yicha teng taqsimlash hali yo‘q.

## 2026-10-24 — bajarilgan ishlar
- Xazinaga yetilishi bilan o‘yinni darhol tugatish o‘rniga davrani yakunlash qo‘shildi.
- G‘olib va durang uchun yagona hisoblash funksiyasi qo‘shildi.
- Har yangi savolda komponent qayta yaratiladi: takroriy savolda ham vaqt va kiritilgan javob yangilanadi.
- Davom etish tugmasining tez qayta bosilishi bir nechta yurishni boshlamasligi uchun qulf qo‘shildi.
- Xato savollar matn o‘rniga ID bilan sanaladi: matni bir xil, lekin turli savollar aralashmaydi; rasmli savolga nom beriladi.
- Tayyorgarlik ekranidagi qoidalar yangilandi.

## Tekshiruv
- Avtomatik qoidalar testi: node --test tests/race-rules.test.js — 4/4 o‘tdi.
- Ishlab chiqarish yig‘ilishi: npm run build — muvaffaqiyatli.
- Sensorli doskada haqiqiy dars sinovi hali o‘tkazilmagan.

## Keyingi ishlar (hali bajarilmagan)
- Saqlash xatosi va zaxiradan tiklash bajarildi (2026-10-25); Windows o‘rnatuvchisida alohida tekshiruv qoldi.
- Ikki vizual muhit bor; yoshga mos savollar va dars ssenariylarini sinfda sinash kerak.
- Xato savollarni qayta yechish rejimi bajarildi (2026-10-25); haqiqiy darsda foydasini kuzatish qoldi.
- Haqiqiy doskada tugmalar, o‘qilish va dars davomiyligini sinash.

## 2026-10-24 — dizayn va o‘qituvchi oqimi
- Namuna HTML faqat dizayn yo‘nalishi sifatida o‘rganildi. Ichidagi amallar yoki matnlar topshiriq sifatida bajarilmadi.
- Yangi och rangli Dars studiyasi: asosiy boshlash tugmasi, ko‘rsatkichlar, to‘plam kutubxonasi va qidiruv.
- Fan/sinf filtrlari, fan nomini muharrirda o‘zgartirish va bo‘sh qidiruv natijasi qo‘shildi.
- Birinchi ishga tushishdagi majburiy PIN olib tashlandi. Avvalgi PIN saqlanadi, lekin odatiy rejimga to‘sqinlik qilmaydi.
- Sozlamalarda ixtiyoriy Sinf himoyasi, qo‘lda Qulflash, PIN yaratish/almashtirish mavjud.
- O‘qituvchi PIN bilan tasdiqlagach, sessiyada qayta so‘ralmaydi. Himoya yoqilgan yangi o‘yin yoki qo‘lda qulflash sessiyani yopadi.
- Pauza va davom etish PINsiz; himoya faolligida yakunlash/studiyaga chiqish tasdiqlanadi.
- Savol oynasi pauza tugmasini to‘sib qo‘yishi tuzatildi; animatsion yurish tugamaguncha pauza o‘chiriladi.
- Sarguzasht va Bilim maydoni mavzulari qo‘shildi. O‘qituvchi tanlaydi, qat’iy sinf cheklovi yo‘q.
- Savol kartasi och fonda, katta o‘qiladigan matnlar bilan qayta bezatildi.
- Matnli javob uchun ekran harflari va oddiy klaviaturadan kiritish qo‘shildi; Excel importida mos klaviatura aniqlanadi.
- PIN oynasi raqamlar, Enter, Backspace va Escape tugmalarini qabul qiladi.
- Majburiy kiosk o‘rniga kattalashtirilgan oyna, o‘yin ichida alohida to‘liq ekran tugmasi qo‘shildi.
- Mobil studiya va harakatlarni kamaytirish sozlamasi qo‘llab-quvvatlanadi.

### Tekshiruv dalillari
- npm run build — muvaffaqiyatli.
- node --test tests/*.test.js — 6/6 test o‘tdi (qoidalar va matnli javoblar).
- scripts/verify-ui.cjs — lokal Chrome sinovi: PINsiz birinchi ochilish, qidiruv, PIN yaratish, sinf himoyasi, erkin pauza, bekor qilish, natijalar, qayta PINsiz studiya, fan tahriri, saqlangan oddiy rejim va 390 px mobil kenglik; himoyalangan qayta ochilish, xato PIN, qo‘lda qulflash, matn klaviaturasi va to‘g‘ri javobdan keyingi qadam ham tekshirildi.
- Brauzer sinovi alohida vaqtinchalik profil ishlatadi; o‘qituvchining haqiqiy ma’lumotlariga tegmaydi.
- Desktop, tayyorgarlik, savol, muharrir va mobil ko‘rinishlar skrinshot orqali ko‘rib chiqildi.
- Electron o‘rnatuvchisi va haqiqiy sensorli doska tekshirilmagan. Brauzer testi Windows o‘rnatish/yangilanish sinovini almashtirmaydi.

Mahsulot qarorlari va takliflar: [MAHSULOT_QARORLARI.md](MAHSULOT_QARORLARI.md).

## 2026-10-25 — ishonchli saqlash, tiklash va takrorlash
### Bajarilgan ishlar
- Sozlamalarga to‘liq JSON zaxira eksport/importi qo‘shildi: to‘plamlar, savollar, rasmlar, sozlamalar va tarix.
- Faylni tanlash yozishni boshlamaydi. Avval tarkib soni va almashtirish izohi chiqadi; Bekor qilish joriy ma’lumotni o‘zgartirmaydi.
- Oddiy studiyada tiklash joriy qurilma PINi va Sinf himoyasini saqlaydi. PIN mavjud bo‘lsa almashtirishdan oldin tasdiqlanadi.
- Buzilgan bazadan boshlang‘ich tiklashda fayldagi PIN va himoya ham qaytadi.
- Umumiy format tekshiruvi yaratildi; noma’lum format/versiya, takroriy ID va buzilgan maydonlar rad etiladi. To‘ldirilmagan qoralamalar va eski natijalar qo‘llab-quvvatlanadi.
- Har saqlashda oxirgi yaroqli oldingi nusxa saqlanadi: Electron’da data.json.bak, brauzerda bilim-arena-data-backup.
- Buzilgan asosiy nusxa yaroqli zaxiraning ustiga yozilmaydi. Asosiy nusxa o‘qilmasa zaxira ochiladi va xabar beriladi.
- Ikkala nusxa buzilgan bo‘lsa jim boshlang‘ich holat ochilmaydi; asl qiymatlar saqlanib, tiklash oynasi chiqadi.
- Saqlash navbat bilan bajariladi. Xatoda eng yangi o‘zgarish xotirada qoladi; Qayta saqlash va Zaxira olish tugmalari ko‘rinadi.
- Saqlash muvaffaqiyatsiz bo‘lsa dasturdan chiqish/hozir yangilash davom etmaydi. Brauzerda kechiktirilgan yozish yopilishda bajarishga uriniladi.
- Natijalarda Xato savollarni takrorlash tugmasi qo‘shildi: eng ko‘p xato qilingan 10 tagacha savol, besh tur, vaqt cheklovisiz.
- Takrorlash musobaqa natijasi yoki o‘yinlar tarixiga yangi g‘alaba yozmaydi. Yakunda to‘g‘ri javoblar soni ko‘rinadi.
- Eski natijalarda faqat xato matni bor; ularga savol nusxasi o‘ylab topilmaydi. Takrorlash yangi o‘yinlar natijasida ishlaydi.
- Haqiqiy dars uchun SINF_SINOVI.md tayyorlandi. Bu sinov hali o‘tkazilmagan.

### Amaldagi zaxira qoidalari va chegaralar
- Avtomatik nusxa bir qurilmada saqlanadi va barcha vaqtlar arxivi emas — oxirgi yaroqli oldingi holat. Qurilma buzilishiga qarshi alohida fayl nusxasi kerak.
- JSON shifrlanmagan; PIN ochiq emas, xesh ko‘rinishida. Faylni egasi nazorat qiladigan joyda saqlash kerak.
- To‘liq import 25 MB bilan cheklangan. Juda katta rasmli tarix uchun keyin alohida arxivlash kerak bo‘lishi mumkin.
- To‘liq tiklash birlashtirish emas: joriy to‘plamlar va tarix almashtiriladi; ishlayotgan qurilmaning PIN/himoyasi saqlanadi.
- Disk yoki brauzer xotirasida joy yetmasa, alohida JSON nusxani yuklab olib joyni bo‘shatish kerak; ilova bu muammoni yashirmaydi.

### Tekshiruv dalillari
- npm test — 17/17 test o‘tdi: oldingi qoidalar, javoblar, format tekshiruvi, buzilgan ikki nusxa, yozish xatosi, kvota va saqlash navbati.
- npm run build — muvaffaqiyatli.
- scripts/verify-recovery.cjs — zaxira yuklab olish, noto‘g‘ri fayl, bekor qilish, tiklash, avtomatik zaxira, buzilgan ikki nusxa, boshlang‘ich tiklash, kvota xatosi/qayta saqlash, besh turdagi savolni takrorlash va asl natija o‘zgarmasligi brauzerda o‘tdi.
- scripts/verify-ui.cjs — oldingi PIN, navigatsiya, mobil va matnli javob sinovlari ham o‘tdi.
- Zaxira sozlamalari, buzilgan ma’lumot oynasi va takrorlash ko‘rinishi skrinshotda tekshirildi.
- Electron fayl moduli haqiqiy vaqtinchalik fayllarda testlandi; Windows o‘rnatuvchisi, avtomatik update jarayoni va sensorli doskada real dars hali tekshirilmagan.

## 2026-10-25 — mavjud Windows dasturini 0.3.0 ga yangilash
- Foydalanuvchi talabi: boshqa ilova o‘rnatmasdan kompyuterdagi mavjud Bilim Arena yangilansin.
- Mavjud o‘rnatilish: C:/Users/acer/AppData/Local/Programs/Bilim Arena. Shu papka va mavjud dastur yozuvi 0.2.3 dan 0.3.0 ga yangilandi.
- Yangilash oldidan 1 ta to‘plam, 22 ta savol va 1 ta natija yangi format bilan mosligi tekshirildi. PIN ham saqlandi.
- release/pre-update-backup ichiga oldingi data.json va app.asar nusxasi olindi; bu papka Gitga kirmaydi.
- O‘rnatuvchi yakunlanish kodi 0. Windows dasturlar ro‘yxati va paket ichidagi versiya 0.3.0 ekanligi tekshirildi.
- Haqiqiy ma’lumot fayli yangilashdan oldingi SHA-256 bilan bir xil — savollar va natijalar o‘zgartirilmagan.
- Windows ikonka konvertoridagi xotira xatosi tuzatildi: build/icon.ico tayyorlandi va paket shu formatdan foydalanadi.
- Aynan yangilangan o‘rnatilgan exe alohida test ma’lumot papkasida yashirin oynada ishga tushirildi. Bu boshqa dastur o‘rnatilishi emas; foydalanuvchining haqiqiy profiliga tegmaslik uchun test ma’lumotlari ajratilgan.
- Desktop sinovi o‘tdi: file:// dan ochilish, preload/IPC, sozlama va .bak saqlash, o‘yin/savol ochish, qayta ishga tushganda qiymat saqlanishi va renderer xatolari yo‘qligi.
- npm test: 17/17 o‘tdi. npm run dist: Windows paketi muvaffaqiyatli yig‘ildi.
- GitHubga push yoki ommaviy release qilinmadi; kompyuterdagi dastur yangilandi. Foydalanuvchi avvalgi yorliqdan kirib sinaydi.
- Haqiqiy doskada dars va avtomatik internet yangilanishi hali tekshirilmagan.

## 2026-10-25 — zamonaviy ko‘rinish va animatsiyalar
### Qarorlar (5–11-sinflar uchun)
- Jonli, o‘yinga o‘xshash, lekin bolalarcha emas: aniq tipografiya, yorqin ranglar, ma’noli harakat. Animatsiya vaqtni cho‘zmaydi — har biri 0,3–1,6 soniya.
- Proyektorda o‘qilishi birinchi o‘rinda: javob plitalarida to‘q rang va oq matn, savol matni kattaroq va qalinroq.
- Rang bilan birga shakl (◆●▲■) va belgilar (✓ / ✗) ishlatiladi: rangni ajrata olmaydigan o‘quvchilar ham tushunadi.
- Shrift: Nunito (OFL litsenziyasi) dastur ichiga qo‘shilgan, internet talab qilmaydi.
- Sekin kompyuterlar uchun Sozlamalarda "Animatsiyalar" o‘chirgichi qo‘shildi; Windows’dagi "harakatni kamaytirish" ham hisobga olinadi.

### Bajarilgan ishlar
- Tuzatildi: To‘g‘ri/Noto‘g‘ri tugmalarida to‘q fonda to‘q matn edi; javobdan keyingi xabar xira edi; natijalar ekranida raqamlar oq fonda oq edi.
- Tuzatildi: faol jamoa kartasi atrofidagi katta pushti dog‘; navbat panelida matnning ikki qatorga bo‘linishi.
- Savol oynasi: kartaning sakrab chiqishi, javob plitalarining navbat bilan paydo bo‘lishi, aylana taymer, to‘g‘ri javobda belgi va uchqunlar, xatoda silkinish.
- Taxta: har qadamda qahramon sakraydi va qo‘nish to‘lqini chiqadi; navbat almashganda ekran bo‘ylab jamoa banneri; hisob kartalarida yo‘l chizig‘i; bonus/girdob xabarlari alohida rangda.
- G‘alaba: aylanuvchi nurlar, kubok tushishi, rangli konfetti.
- Natijalar: shohsupa (g‘olib o‘rtada), ko‘rsatkichlar sanab chiqadi.
- Sinf ekrani: harakatlanuvchi rangli fon va suzib yuruvchi qahramonlar. Ekranlar orasida yumshoq o‘tish.
- Savol oynasidagi orqa fonni xiralashtirish (backdrop-filter) olib tashlandi: kuchsiz kompyuterlarni sekinlashtiradi va taxtada iz qoldirardi.

### Tekshiruv
- npm test — 18/18 o‘tdi (animatsiya sozlamasi testi qo‘shildi). npm run build — muvaffaqiyatli.
- Brauzerda 1600×900 da ko‘rildi: taxta, navbat banneri, yozma va variantli savol, to‘g‘ri/xato javob, natijalar, sinf ekrani. Konsolda xato yo‘q.
- G‘alaba oynasi skrinshotda alohida ko‘rilmadi. Haqiqiy doska va proyektorda ranglar hali tekshirilmagan.

## 2026-10-27 — Robot dasturlash: Robo Kod va Java Robot
### Qoidalar
1. Savol to'plami kerak emas; darajalar o'yin ichida. Studiya → 🤖 Robot dasturlash.
2. Jamoaviy rejim: har daraja — bitta raund, har jamoaga bittadan navbat; har raundda birinchi bo'lib boshqa jamoa chiqadi. Navbatda dastur bo'sh holatdan boshlanadi.
3. Robo Kod: buyruq soni ≤ par — 3 ★, ≤ par+3 — 2 ★, aks holda 1 ★. Java Robot: yechilsa 3 ★.
4. Har xato urinish 1 ★ kamaytiradi, yechilsa kamida 1 ★. Urinishlar (2/3/5) yoki navbat vaqti tugasa — 0 ★.
5. Eng ko'p ★ yiqqan jamoa g'olib; teng bo'lsa yechilgan darajalar soni, u ham teng bo'lsa — durang. Muddatidan oldin yakunlansa navbatlar tengligi kafolatlanmaydi.
6. Pauza PINsiz. Yakunlash, navbatni o'tkazish va studiyaga qaytish Sinf himoyasi yoqilganda PIN so'raydi.
7. Mashq rejimi: daraja erkin tanlanadi, eng yaxshi ★ saqlanadi; natijalar tarixiga yozilmaydi.

### Bajarilgan ishlar
- Alohida HTML o'yinlar React'ga ko'chirildi; tashqi shriftlar olib tashlandi, internetsiz ishlaydi.
- Robo Kod: 10 ta daraja (4 tasi yangi), P funksiyasi va rekursiya; Java Robot: 6 ta dars (while, if, kamayuvchi o'zgaruvchi — yangi).
- Doska uchun: katta tugmalar, maydon ekranga moslashadi, Java'da ekran tugmalari va tayyor kod bo'laklari, avtomatik chekinish, bekor qilish.
- Qadam-baqadam bajarish, tezlik tanlash, robot izi, Java'da bajarilayotgan/xato qatorni belgilash.
- Tuzatildi: robot boshiga qaytishda aylanib uchishi; "Qayta"dan keyin batareyaning yo'qolishi; vazifa sharti bajarilmasa ham g'alaba animatsiyasi; `while (...);` cheksiz sikli, “ ” qo'shtirnoqlar va yopilmagan /* uchun tushunarsiz xabarlar.
- Ma'lumot sxemasi robot natijalari (kind: 'robot') va mashq yulduzlarini saqlaydi; noto'g'ri qiymatlar rad etiladi.

### Tekshiruv
- npm test — 19/19 o'tdi (robot sxemasi testi qo'shildi). npm run build — muvaffaqiyatli.
- Barcha 10 daraja va 6 dars namunaviy yechim bilan skriptda yechildi.
- Brauzerda 1600×900 va 1280×720: jamoaviy raund, ball, urinishlar, PINsiz pauza, yakunlash, natijalar, tarix, qayta yuklashdan keyin saqlanish; Java muharriri, ekran tugmalari va xato qatori.
- Electron oynasi, Windows o'rnatuvchisi va haqiqiy sensorli doska hali tekshirilmagan.

## 2026-11-09 — o‘yin modullari reyestri
Maqsad: yangi o‘yin qo‘shish va mavjudlarini yaxshilashni arzonlashtirish (tarqatish va obunaga tayyorgarlikning 1-qadami).

### Bajarilgan ishlar
- `src/games/registry.jsx` yaratildi: har bir o‘yin (Xazina poygasi, Robo Kod, Java Robot) bitta modul — nomi, belgisi, tayyorgarlik ekrani, o‘yin ekrani, natija tartibi, shohsupa ko‘rsatkichlari va tarix yozuvi.
- `App.jsx` dagi o‘yinga xos `race`/`robot`/`robotSetup` ekranlari ikkita umumiy ekranga almashtirildi: `setup` va `play` (`game` maydoni bilan).
- `Results` va natijalar tarixi ko‘rsatkichlarni o‘yin modulidan oladi; `if robot … else …` shoxlari olib tashlandi.
- Studiyadagi robot kartochkalari reyestrdan chiqadi.
- O‘yin ID lari `shared/game-ids.mjs` da bir joyda; schema shu ro‘yxatdan foydalanadi. `tests/games.test.js` reyestr va schema mosligini tekshiradi.
- Saqlanadigan ma’lumot formati o‘zgarmadi: eski natijalar va mashq yulduzlari avvalgidek o‘qiladi.
- Kichik o‘zgarish: robot o‘yini natijasidan “Dars studiyasi” endi Robot dasturlash bo‘limiga qaytaradi (avval Savol to‘plamlariga qaytardi).

### Yangi o‘yin qo‘shish tartibi
1. O‘yin ekranini `src/screens/` ga yozish (`config`, `askPin`, `onExit`, `onFinish` props).
2. `src/games/registry.jsx` ga modul qo‘shish.
3. Natija yangi formatda saqlansa — `shared/game-ids.mjs` va `shared/data-schema.mjs` ga qo‘shish va test yozish.

### Tekshiruv
- `npm test` — 22/22 o‘tdi (3 ta yangi reyestr testi bilan).
- `npm run build` — muvaffaqiyatli.
- Brauzerda qo‘lda: poyga tayyorgarligi → o‘yin → pauza → studiya; Robo Kod mashqi → chiqish (Robot bo‘limiga); Java jamoaviy o‘yin → yakunlash → natijalar → Yana o‘ynash; poyga natijalari; natijalar tarixida ikkala tur. Konsolda xato yo‘q.
- `scripts/verify-ui.cjs` ishga tushmadi: Playwright o‘rnatilmagan. Electron oynasi va sensorli doskada alohida sinalmagan.

## 2026-11-18 — shaxsiy o‘yin platformasi (branch: platforma)
Maqsad: Bilim Arena faqat sinf o‘yini emas, balki shaxsiy o‘yinlar platformasi bo‘ladi. Sinf rejimi o‘z holicha qoladi.

### Bajarilgan ishlar
- Yangi bosh ekran — **O‘yinlar zali** (`src/screens/Hall.jsx`, `src/hall.css`): yakka o‘yinlar katta afishalarda (har birining o‘z SVG sahnasi), sinf o‘yinlari alohida qatorda va o‘qituvchi studiyasi orqali ochiladi. Barcha yakka o‘yinlardagi yulduzlar yig‘indisi va oxirgi o‘ynalgan o‘yinni davom ettirish qatori bor.
- Reyestrga `SOLO_GAMES` qo‘shildi: `id, title, icon, tagline, about, Component, summary()`. Har o‘yin `React.lazy` bilan faqat ochilganda yuklanadi.
- **Kodbuzar** (`src/games/kodbuzar/`): alohida loyihadan ko‘chirildi. Shadow DOM ichida o‘z React ildizi bilan ishlaydi (`KodbuzarHost.jsx`) — platformaning `.btn`, `.key`, `.home` kabi global stillari unga ta’sir qilmaydi. CSS `.kb` ichiga o‘ralgan, animatsiyalar `kb-` prefiksli. Bosh sahifasida zalga qaytish tugmasi.
- **Soya** (`src/games/soya/`): Phaser o‘yini `engine/` ga ko‘chirildi, `start.js` uni berilgan elementga o‘rnatadi va to‘xtatadi (canvas, musiqa va kuzatuv taymeri tozalanadi). Phaser alohida bo‘lak (~1,2 MB) — zal va sinf o‘yinlarini sekinlashtirmaydi. Zalga qaytish tugmasi faqat Soyaning bosh menyusida (boshqa ekranlarda u yerda Soyaning o‘z tugmasi bor). `music.js` ga `stopMusic()` qo‘shildi.
- Ilova endi zaldan ochiladi. Sinf himoyasi yoqilgan bo‘lsa — avvalgidek sinf ekrani; u yerda “O‘yinlar zali” tugmasi. Studiya tepasida “← Zal” tugmasi. Himoya yoqilgan bo‘lsa, zalga o‘tish o‘qituvchi sessiyasini yopadi.
- Yangi bog‘liqliklar: `phaser@3.88.2`, `@fontsource/nunito@5`.

### Tekshiruv
- `npm test` — 53/53 o‘tdi (Kodbuzar va Soya testlari ham ko‘chirildi).
- `npm run build` — muvaffaqiyatli; bo‘laklar: asosiy ~423 KB, Kodbuzar ~30 KB, Soya/Phaser ~1,2 MB.
- Brauzerda (web rejim): zal → Kodbuzar (o‘yin, klaviatura, zalga qaytish) → Soya (menyu, daraja, chiqqanda canvas va o‘yin to‘liq yo‘qoladi, StrictMode’da bitta canvas) → sinf kartasi → studiya → Xazina poygasi tayyorgarligi → “← Zal”. 375 px telefon kengligi. Konsolda xato yo‘q.
- Electron oynasi va sensorli doska alohida sinalmagan.

### Qolgan ishlar
- Umumiy ovoz sozlamasi va platforma saqlash API’si (hozir Kodbuzar va Soya o‘z `localStorage` kalitlarida saqlaydi; Electron’da ham ishlaydi, lekin platforma zaxirasiga kirmaydi).
- Platforma nomi (“Bilim Arena” qoladimi) — qaror kutilmoqda; nom o‘zgarsa appId va o‘rnatuvchi nomi ham o‘zgaradi.
- Robo Kod mustaqil loyihasini platformaga qaytarish — qaror kutilmoqda.

## 2026-11-18 — Electron sinovi, umumiy ovoz, o‘yinlar zaxirasi, kod tekshiruvi
### Bajarilgan ishlar
- **Electron sinovi:** `scripts/electron-smoke.mjs` (`npm run smoke:electron`) — haqiqiy `main.cjs` va `dist/` ni `file://` orqali, vaqtinchalik profilda (`BILIM_ARENA_TEST_DATA_DIR`) ishga tushirib, CDP orqali boshqaradi: zal → Kodbuzar (taxmin, g‘alaba, natija saqlanishi) → zal → Soya (menyu, daraja, chiqish, canvas tozalanishi) → oxirgi o‘yin eslab qolinishi → studiya; konsol xatolari. Skrinshotlar OS vaqtinchalik papkasida.
- `electron/main.cjs`: `BILIM_ARENA_TEST_SHOW=1` — sinovda oynani ko‘rsatish (yashirin oynada Phaser tsikli sekinlashib, natija beqaror bo‘ladi). Oddiy ishga tushirishga ta’siri yo‘q.
- **Umumiy ovoz:** zalda 🔊 tugmasi platformaning `settings.sound` sozlamasini o‘zgartiradi. O‘chiq bo‘lsa Kodbuzar ham, Soya ham jim (Soyada master ovoz 0 — effektlar va musiqa); o‘yinlarning o‘z saqlangan sozlamalari o‘zgarmaydi.
- **Zaxira:** to‘liq zaxira faylida ixtiyoriy `games` maydoni — Kodbuzar va Soya natijalari (`shared/game-saves.mjs`, faqat ma’lum kalitlar va to‘g‘ri JSON). Ma’lumot formati va `backupVersion` o‘zgarmadi; eski zaxiralar va eski versiyalar ishlayveradi. Tiklashda avval asosiy ma’lumot, keyin o‘yin natijalari yoziladi; o‘yin natijasi yozilmasa ham asosiy tiklash yakunlanadi va ogohlantirish chiqadi.
- **Kod tekshiruvi (code-review skill) natijasida tuzatildi:** Soya musiqasi uslub almashtirish taymeri tufayli o‘yindan chiqqandan keyin qayta yoqilib qolishi; Soyaning global tinglovchilari o‘yin yopilgandan keyin ham ovoz kontekstini uyg‘otishi (endi kontekst uxlatiladi); sinf himoyasi ekranidagi “O‘yinlar zali” tugmasi PINsiz qulfni chetlab o‘tishi (endi PIN so‘raladi); zaxira tiklashdagi xavfli tartib.

### Tekshiruv
- `npm test` — 57/57 (4 ta yangi zaxira testi).
- `npm run build` — muvaffaqiyatli.
- `BILIM_ARENA_TEST_SHOW=1 npm run smoke:electron` — oxirgi 5 urinishdan 4 tasida 11/11; bittasida yangi ochilgan oyna fokus olguncha Soyaning Enter bosilishi o‘tkazib yuborildi (sinov vaqti, ilova xatosi emas). Yashirin oynada Soya qadamlari beqaror.
- Brauzerda: zaldagi ovoz tugmasi holati saqlanadi va qaytariladi; konsolda xato yo‘q.

### Qolgan ishlar (tekshiruvda topilgan, ataylab qoldirilgan)
- Platforma ovozi o‘chiq bo‘lsa, Soya menyusidagi “Ovoz/Musiqa” tugmalari yoqiq ko‘rinadi (eshitilmaydi) — izoh qo‘shish mumkin.
- Zal kartalari uchun Kodbuzar va Soyaning saqlash/darajalar modullari asosiy bo‘lakka kiradi — kichik umumiy “summary” moduli bilan ajratish mumkin.
- Kodbuzar va Soya manbalari mustaqil loyihalardan nusxa — ikkalasini yagona manbaga keltirish qarori kerak.
- Zal, `SOLO_GAMES` va sinf himoyasi oqimi uchun avtomatik testlar yo‘q (Electron smoke zal va o‘yinlarni qamraydi, himoyani emas).
