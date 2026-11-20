# Bilim Arena — ma’lum xatolar va kamchiliklar

Bu ro‘yxatda topilgan, lekin hali tuzatilmagan muammolar turadi. Har birini tuzatishdan oldin reja tuziladi va tasdiqlanadi. Tuzatilgan muammo ro‘yxatdan o‘chirilmaydi: “✅ Tuzatildi (versiya, sana)” deb belgilanadi, natijasi esa [ISHLAR_VA_QOIDALAR.md](ISHLAR_VA_QOIDALAR.md) ga yoziladi.

Muhimlik darajasi: **Yuqori** — o‘quvchi yoki o‘qituvchi darhol sezadi; **O‘rta** — ba’zi holatlarda ko‘rinadi; **Past** — kosmetik yoki juda kam uchraydi.

Tekshiruv sanasi: 2026-11-20, versiya 0.9.0.

---

## X-1. Xazina poygasi tayyorgarlik ekranida logotip buzilgan — Yuqori
✅ **Tuzatildi (0.9.1, 2026-11-20):** `race-board.css` va `RaceScenery.jsx` dagi barcha `rs-` nomlari `rb-` ga almashtirildi. Brauzerda tekshirildi: tayyorgarlikda palma barglari va orol joyida (`rs-sway`, `rs-bob`), dengiz blokida xarita animatsiyasi yo‘q, gorizontal aylantirish yo‘q; xaritada `rb-sway`, `rb-sea`, `rb-foam` ishlaydi.

**Qayerda:** Xazina poygasi → tayyorgarlik ekrani (sarlavha, orol va dengiz).
**Ko‘rinishi:**
- palmaning yashil barglari yo‘q, faqat tanasi ko‘rinadi (foydalanuvchi skrinshoti, 2026-11-20);
- orol rasmi o‘z joyidan chiqib, yuqoriga ko‘tariladi va kesilib qoladi;
- ba’zan sahifa pastida gorizontal aylantirish chizig‘i paydo bo‘ladi.

**Sababi:** CSS nomlari to‘qnashgan. 0.9.0 da qo‘shilgan `src/race-board.css` (o‘yin xaritasi) va `src/race-setup.css` (tayyorgarlik ekrani) bir xil nomlardan foydalanadi:
- `@keyframes rs-sway`: xaritadagi versiya barglarni (−6, −80) px suradi, shuning uchun tayyorgarlikdagi barglar rasm chegarasidan chiqib ketadi;
- `@keyframes rs-bob`: xaritadagi versiyada `translate(-50%, -100%)` bor, u tayyorgarlikdagi butun orolni (`.rs-island`) siljitadi;
- `.rs-sea` klassi: tayyorgarlik ekranidagi dengiz blokiga xaritaning `rs-sea` animatsiyasi ham tushadi, blok 140 px suzib, ekran chetidan chiqadi.

**Tasdiqlangan:** brauzerda `getComputedStyle` bilan (palma `matrix(…, -6, -80)`, orolda `rs-bob`, dengizda `rs-sea`). Boshqa CSS fayllarida bunday to‘qnashuv yo‘q (butun `src/` skript bilan tekshirildi).
**Tuzatish rejasi:** `race-board.css` va `RaceScenery.jsx` dagi nomlarni `rb-` bilan almashtirish (`rb-sway`, `rb-bob`, `rb-sea`); tayyorgarlik ekrani va xaritani brauzerda ko‘rish; 0.9.1 qilib chiqarish.
**Nima uchun sezilmadi:** 0.9.0 sinovlarida tayyorgarlik ekranining skrinshoti olinmagan, kod testlari esa CSS’ni tekshirmaydi.

## X-2. Yakka rejimdan jamoalarga o‘tilganda birinchi jamoa “O‘yinchi” nomida qoladi — O‘rta
✅ **Tuzatildi (0.9.1, 2026-11-20):** `GameSetup.jsx` — jamoalar soni o‘zgarganda 1-o‘rindagi standart nom almashadi (“O‘yinchi” ↔ “Qizillar”); foydalanuvchi o‘zi yozgan nomga tegilmaydi. Brauzerda: Yakka → 2 jamoa → Yakka = “O‘yinchi” → “Qizillar” → “O‘yinchi”.

**Qayerda:** Xazina poygasi → tayyorgarlik → “Kim o‘ynaydi”.
**Ko‘rinishi:** zaldan “Yakka o‘ynash” orqali kirib, “2 jamoa”ni tanlasangiz, birinchi jamoa “Qizillar” emas, “O‘yinchi” deb nomlanadi. Bu o‘yinda, marosimda va natijalarda ham shunday ko‘rinadi.
**Sababi:** `GameSetup.jsx` yakka rejim uchun 1-jamoa nomini “O‘yinchi” qilib boshlaydi, jamoalar soni o‘zgarganda esa nom qaytarilmaydi. Bu xato 0.9.0 dan oldin ham bor edi.
**Tuzatish rejasi:** jamoalar soni 1 dan ko‘pga o‘zgarganda, foydalanuvchi nomni o‘zi o‘zgartirmagan bo‘lsa, standart nomni (“Qizillar”) qaytarish. Teskari holatda ham shunday qilish.

## X-3. Bir xil nomli jamoalar natijada aralashib ketishi mumkin — Past
**Ko‘rinishi:** o‘qituvchi ikki jamoaga bir xil nom bersa (masalan, ikkalasi ham “A”), natijalar ekranida shohsupa kartalari bir xil kalit oladi va nominatsiyalar ikkalasiga ham ko‘rsatiladi. Nominatsiyalar natijaga jamoa nomi bilan yoziladi.
**Tuzatish rejasi:** tayyorgarlikda bir xil nomlarga ogohlantirish chiqarish yoki ularni avtomatik farqlash (“A”, “A 2”). Natijalarda kalit sifatida jamoa tartib raqamini ishlatish.

## X-4. Fon musiqasi dastur yashirilganda to‘xtamaydi yoki uzilib qoladi — O‘rta (tekshirilmagan)
**Ko‘rinishi (kutilayotgan):** Xazina poygasi ochiq turganda boshqa oynaga o‘tilsa yoki dastur kichraytirilsa, musiqa chalinaveradi. Brauzer taymerlarni sekinlashtirgani uchun u uzuq-yuluq ham chiqishi mumkin.
**Sababi:** `src/lib/race-music.js` va `src/lib/sound.js` sahifa ko‘rinishi o‘zgarishini (`visibilitychange`) kuzatmaydi. Soya o‘yinida bu holat hisobga olingan.
**Tuzatish rejasi:** sahifa yashirinsa musiqani pasaytirish yoki to‘xtatish, qaytganda davom ettirish. Electron’da va telefonda quloq bilan tekshirish.

## X-5. Kunlik sarguzashtda javob variantlarining tartibi har kimda boshqacha — Past
**Ko‘rinishi:** bugungi xarita va savollar tartibi hamma uchun bir xil, lekin variantli savollardagi javoblarning joylashuvi har o‘yinda aralashadi.
**Sababi:** `prepare()` (`Race.jsx`) variantlarni `Math.random` bilan aralashtiradi, kunlik urug‘dan foydalanmaydi.
**Qaror kerak:** bu xatomi yoki yo‘qmi, o‘qituvchi aytadi. Variantlar aralashib tursa, javob joyini yodlab olib bo‘lmaydi.

## X-6. Kunlik sarguzashtni yarim tundan keyin “Yana o‘ynash” bilan davom ettirish — Past
**Ko‘rinishi:** kechqurun boshlangan kunlik sarguzashtda yarim tundan keyin “Yana o‘ynash” bosilsa, kechagi xarita ochiladi va natija kechagi kunga yoziladi.
**Tuzatish rejasi:** “Yana o‘ynash” bosilganda sana o‘zgargan bo‘lsa, bugungi xaritani ochish yoki “Bu kechagi sarguzasht” deb ogohlantirish.

## X-7. “Eng aniq” nominatsiyasi kam javob bergan jamoaga ketishi mumkin — Past
**Ko‘rinishi:** aniqlik foizda hisoblanadi: 1 ta savolga 1 ta to‘g‘ri javob (100%) 10 tadan 9 ta (90%) dan yuqori turadi. Navbatlar teng bo‘lgani uchun bu kam uchraydi, lekin muddatidan oldin yakunlangan o‘yinda bo‘lishi mumkin. Hozir bunday o‘yinda nominatsiya umuman berilmaydi.
**Tuzatish rejasi:** kerak bo‘lsa, “Eng aniq” uchun eng kam javoblar sonini belgilash (masalan, 3 ta).

## X-8. Ko‘prikdan sakrash “Eng katta qaytish” nominatsiyasiga qo‘shilmaydi — Past
**Ko‘rinishi:** girdobdan keyingi qadamlar sanaladi, lekin ko‘prik bilan o‘tilgan 3 katak hisobga kirmaydi.
**Tuzatish rejasi:** `jump()` da ham `comeback`ni oshirish.

## X-9. “Bilim maydoni” mavzusida xazina sandig‘i katagi to‘rtburchak bo‘lib qoladi — Past
**Ko‘rinishi:** sokin mavzuda oxirgi katak chizilgan sandiq ostida to‘rtburchak sariq fon bilan chiqadi, boshqa kataklar bilan uyg‘un emas.
**Sababi:** `styles.css` dagi `.theme-arena .node.end` uslubi yangi sandiq bilan to‘qnashadi.
**Tuzatish rejasi:** Arena mavzusi uchun sandiq katagining alohida uslubi.

## X-10. Electron sinovi bir marta 6/10 natija berdi — O‘rta (sababi noma’lum)
**Ko‘rinishi:** 0.9.0 relizidan oldin `npm run smoke:electron` birinchi urinishda 6/10, kodga tegmasdan qayta ishga tushirilganda 12/12 o‘tdi.
**Taxmin:** vaqtga bog‘liq tasodifiy nosozlik (kompyuter band bo‘lgan). Natija fayli: `%TEMP%\bilim-arena-smoke`.
**Tuzatish rejasi:** sinovni bir necha marta ketma-ket ishga tushirib, qaysi qadamlar yiqilishini aniqlash. Kerak bo‘lsa, kutish vaqtlarini oshirish.

---

## Tekshirilgan va muammo topilmagan
- **CSS to‘qnashuvlari:** `race-board.css` dagi barcha klasslar boshqa fayllar bilan solishtirildi. X-1 dagilardan boshqasi o‘z ekraniga bog‘langan, ya’ni xavfsiz.
- **Xazina poygasi:** 2–4 jamoa, yakka, vaqt cheklanmagan, “Bilim maydoni”, telefon (752×336), animatsiyasiz rejim, pauza, ilib olish, takrorlash rejimi, natijalar. Bular 4-fazada sinalgan.
- **Saqlash formati:** eski natijalar (tanga va nominatsiyalarsiz) yangi versiyada o‘qiladi (test).

## Hali sinalmagan
- Haqiqiy sensorli doska va telefonda dars.
- Musiqa va ovozlarni quloq bilan eshitish.
- Windows o‘rnatuvchisini GitHub Actions’ning yangi versiyalari bilan yig‘ish. Bu keyingi relizda tekshiriladi.
