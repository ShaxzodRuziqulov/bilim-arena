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
