# Bilim Arena — ishlar va qoidalar

## Maqsad
Maktabdagi 5–11-sinf o‘quvchilarini darsga qiziqtirish, jamoaviy ishtirok va bilimni mustahkamlash. Asosiy platforma — sensorli elektron doska.

## Ishlash tamoyillari
- Avval mavjud Xazina poygasining xatolari va darsdagi qulayligi yaxshilanadi.
- O‘qituvchi savollarni sinf darajasiga moslaydi; har navbatda boshqa o‘quvchi chiqishini boshqaradi.
- Amalga oshirilmagan imkoniyatlar tayyor deb ko‘rsatilmaydi.
- Har yakunlangan ish uchun ushbu faylga sana, bajarilgan o‘zgarish, amaldagi qoida, istisno, tekshiruv natijasi va ochiq qolgan holat yoziladi. O‘yinchi yoki o‘qituvchi uchun amaldagi foydalanish tartibi o‘zgarsa, README ham yangilanadi.

## 2026-11-23 — zaxira, Xazina poygasi va Soya

| Ish | Amaldagi qoida va istisno | Tekshiruv |
| --- | --- | --- |
| To‘liq zaxirani tiklash | 25 MB chegarasi olib tashlandi. Fayl tanlanganda tarkib tekshiriladi va oldindan ko‘rsatiladi. Saqlash tasdiqdan keyin boshlanadi. Buzilgan JSON yoki mos kelmaydigan format rad etiladi. Brauzer xotirasi kvotasi va diskdagi bo‘sh joy hali ham tiklashga ta’sir qiladi. | Electron’da taxminan 28 MB zaxiradagi 100 ta rasmli savol tiklandi va diskdan qayta o‘qildi. |
| Xazina poygasida navbat | «Savolni ochish» darhol bosiladi. Navbat banneri 0,6 soniya ko‘rinadi. Bir katakda bir nechta jamoa turganda belgilar yonma-yon joylashadi. Bitta jamoa turgan katakda belgi markazda qoladi. | Electron’da boshlang‘ich katakdagi to‘rtta belgi ustma-ust tushmasligi va tugma darhol savol ochishi tekshirildi. |
| Soya’da sokin rejim | Ilovada animatsiyalar o‘chirilganda yoki tizimda harakat kamaytirilganda menyudagi qahramon joyida turadi va sahnalar qorayishsiz almashadi. Yozilgan soyaning harakati va izi o‘yin mexanikasining bir qismi sifatida saqlanadi. | Electron’da menyu tasviri o‘zgarmasligi, darajaga kirish, soya izining ko‘rinishi, menyuga va zalga qaytish tekshirildi. |

- To‘liq zaxira joriy ma’lumotlarni almashtiradi. Ma’lumotlari ochilgan qurilmada joriy PIN saqlanadi. Ilova bazani ocholmay, tiklash ekranidan ish boshlasa, zaxiradagi PIN tiklanadi. Zaxirada saqlamasi yo‘q yakka o‘yinning natijalari saqlanadi.
- `npm test` — 61/61. `npm run build` — muvaffaqiyatli. Vaqtinchalik profil bilan Electron tekshiruvi — 7/7, renderer xatosi kuzatilmadi.
- Haqiqiy sensorli doskada dars, Windows o‘rnatuvchisi va avtomatik yangilanish ushbu o‘zgarishlar bilan tekshirilmagan. Doska uchun qadamlar [SINF_SINOVI.md](SINF_SINOVI.md) faylida.

## 2026-11-23 — tarqatishga tayyorlik auditi

**Qaror.** Windows yig‘ilmasi nazoratli sinovga tayyor. Keng tarqatish uchun o‘rnatuvchi, yangilanish va haqiqiy doskadagi dars sinovi qoldi. Telefon uchun alohida Android/iOS paketi yo‘q. Telefon brauzeri tajribasi uchun kichik ekrandagi boshqaruv va haqiqiy qurilmalar sinovi qoldi.

| Yo‘nalish | Dalil va istisno |
| --- | --- |
| Windows | 61/61 avtomatik test o‘tdi. Vite yig‘ildi. NSIS o‘rnatuvchisi birinchi urinishda sandbox DNS chekloviga uchradi, ruxsatli qayta urinishda yig‘ildi. `win-unpacked` ichidagi 0.7.0 ishga tushdi va Electron ko‘prigi ishladi. `Get-AuthenticodeSignature` o‘rnatuvchi uchun `NotSigned` qaytardi. Toza Windows’da o‘rnatish va versiyalar oralig‘ida yangilanish hali sinovdan o‘tmagan. |
| Telefon, 390×844 | Electron Chromium emulyatsiyasida Kodbuzar sensorli taxminni baholadi, Robot birinchi bosqichi uch yulduz bilan yakunlandi. Xazina poygasida javob va aloqa ishladi, ammo savolni ochish tugmasi 25 px baland, matni 7 px. Soya telefonni burish ekranini ko‘rsatdi. Tik holatdagi Soya sinovi o‘yin boshqaruvi uchun dalil sifatida qabul qilinmaydi. |
| Telefon, 844×390 | Xazina poygasi savol tugmasi taxminan 45 px baland bo‘ldi. Soya’da sensor bilan harakat yozildi va iz ko‘rindi. Android Chrome, iPhone Safari, ekran klaviaturasi va real qurilma unumdorligi hali tekshirilmagan. |
| Personajlar | Kalitjon javoblarga mos yo‘l-yo‘riq beradi. Robi bosh ekran va o‘yindagi vazifani bog‘laydi, robotning yo‘nalishi ko‘rinadi. Soya va izi mexanikani tushuntiradi. Xazina poygasidagi emojilar jamoalarni ajratadi. Doskaning orqa qatoridan siluetlar va telefon ekranida kichik belgilar alohida baholanishi kerak. |
| Animatsiyalar | Xazina poygasining savol tugmasi kutmaydi. Soya’da sokin rejim menyu yurishi va sahna qorayishini to‘xtatadi, o‘yin ichidagi soya saqlanadi. Klaviatura va sensor sinovlaridan tashqari haqiqiy doska va turli telefonlarda ravonlik hali o‘lchanmagan. |

- Tarqatishdan oldin toza Windows’da o‘rnatish, eski versiyadan yangilash, internet bo‘lmaganda ochish va savol bankining saqlanishi tekshiriladi. GitHub reliz jarayonida testlar va asosiy Electron oqimi nashrdan oldin bajarilishi kerak. Joriy ish oqimi paketni yig‘adi va e’lon qiladi, unda ushbu tekshiruvlar alohida bosqich sifatida yo‘q.
- Telefon uchun avval veb-versiya yoki alohida ilova yetkazilishi kelishiladi. Qaysi yo‘l tanlansa, tik va yon holatlarda boshqaruv, ortga qaytish, ovoz, natija saqlanishi va qayta ochish haqiqiy qurilmalarda tasdiqlanadi.
- Ushbu auditda o‘yin kodi o‘zgartirilmadi. O‘rnatuvchi lokal yig‘ildi.

## 2026-11-23 — Xazina poygasi qahramonlari namunalari

- ImageGen yordamida shaffof fonli tulki va astronavt portretlari yaratildi. Tulkining uchli quloqlari va astronavtning dumaloq dubulg‘asi 32 va 48 px ko‘rinishda bir-biridan ajraldi.
- Uslub tasdiqlangach toshbaqa va sher ham ImageGen’da yaratildi. Xazina poygasida to‘rtta standart qahramon 192×192 shaffof PNG sifatida jamoa tanlash, maydon, navbat, savol va natija ekranlarida ko‘rsatiladi.
- Saqlash formati o‘zgarmadi. Eski natijalardagi shu to‘rtta belgi portretga moslanadi, qolgan tanlovlar emoji sifatida chiqadi. Robot o‘z jamoa belgilaridan foydalanishda davom etadi.
- `npm test` 61/61, `npm run build` muvaffaqiyatli. Electron’da 5/5 tekshiruv o‘tdi: tanlash, muqobil emoji, to‘rtta rasmning Windows va 844×390 yon telefon o‘lchamida ajralishi hamda natijalar. Haqiqiy telefon va sensorli doskada ko‘rinishi hali tekshirilmagan.

## 2026-11-23 — Xazina poygasining telefon maketi

- Tik holatda navbatdagi o‘yinchi yoki jamoa, portret va «Savolni ochish» tugmasi pastki panelda turadi. Savol ochilganda javoblar bir ustunda chiqadi. Uzun savol, rasm, kod yoki javoblar kartaning ichida siljitib ko‘riladi.
- Yon holatda xaritaning 16:9 nisbati saqlanadi. Qisqa ekranlarda boshqaruv tugmalari kattaroq va savol kartasi siljiydi. Shu moslashuv xato savollarni takrorlashda ham ishlaydi.
- Poyga qoidalari, savol turlari va natijalarni saqlash formati saqlanadi. Haqiqiy Android Chrome, iPhone Safari va sensorli doskada alohida tekshiruv kerak.
- `npm test` 61/61, `npm run build` muvaffaqiyatli. Electron sensor emulyatsiyasida 13/13 tekshiruv o‘tdi. 390×844 va 844×390 ekranlarda yakka poyga tayyorgarlikdan diskda saqlangan g‘alabagacha o‘ynaldi. 320 px kenglikda raqam, matn, o‘n oltilik, tartiblash va moslashtirish tugmalari bosildi. Tik ekranda to‘rt jamoa tanlash, natijalar va takrorlashdan qaytish tasdiqlandi. 1366×768 ekranda maydonning 16:9 nisbati tekshirildi.

## 2026-11-23 — Soya telefon boshqaruvi

- Sensorli qurilma tik turganda yon tomonga burish tavsiyasi va «O‘yinlar zaliga qaytish» tugmasi ko‘rinadi. O‘yin davomida telefon tik holatga qaytsa ham shu tugma ishlaydi. Yon holatda Soya o‘z menyusi va boshqaruvlari bilan ochiladi.
- Yozish va soyani bekor qilish tugmalari yurish va sakrash tugmalari bilan bir xil diametrga keltirildi. 844×390 emulyatsiyada diametr 51 px bo‘ldi. Uchta daraja maslahati qo‘llanayotgan boshqaruvga qarab Q yoki ekrandagi ● tugmasini ko‘rsatadi.
- 61/61 avtomatik test, muvaffaqiyatli build va 4/4 Electron tekshiruvi. 390×844 holatda darajadan oldin va o‘yin davomida zalga chiqish tekshirildi. Yon holatda yozish, yurish, sakrash va bekor qilish natijalari skrinshotlarda ko‘rildi. Kompyuterda Enter darajani ochdi.
- Haqiqiy Android va iPhone’da bir yoki ikki qo‘l bilan boshqarish qulayligi hali baholanmagan.

## 2026-11-23 — Soya’da ikki barmoq bilan boshqarish sinovi

- 844×390 Electron Chromium sensor emulyatsiyasida ikki alohida sensor nuqtasi yuborildi. Yurish bosib turilganda ikkinchi bosish sakrashni boshladi. Skrinshotlarda Soya qahramoni o‘ngga siljigan va poldan ko‘tarilgan. Ikkala bosish tugagach, ketma-ket ikki tasvirda gorizontal joyi bir xil qoldi.
- Yurish bosib turilganda yozish tugmasi ishga tushdi. Yozuv tugagach soya soni 0/2 dan 1/2 ga o‘tdi, soya va izi ko‘rindi. Bekor qilish tugmasi sonni 0/2 ga qaytardi. Sinovda renderer xatosi qayd etilmadi.
- Haqiqiy telefon aniqlanmadi. Ushbu natija ikki bir vaqtdagi sensor hodisasi ishlashini tasdiqlaydi. Bosh barmoq bilan yetish qulayligi, iPhone Safari va Android Chrome’dagi aylantirish va ko‘p barmoqli boshqaruv uchun haqiqiy qurilma kerak. O‘yin kodiga o‘zgartirish kiritilmadi.

## 2026-11-23 — Robot dasturlashning telefondagi birinchi darsi

- Birinchi yakka mashqning ixcham ekranida topshiriq, robot maydoni, asosiy dastur va ishga tushirish tugmasi ko‘rinadi. «Darajalar» tugmasi 16 darajali ro‘yxatni ochadi. P funksiyasi odatda yashiriladi, ammo katta oynada tuzilgan dastur P dan foydalansa, kichik oynada ham uni tahrirlash mumkin.
- Ishlayotgan buyruq ajratiladi. Robot yo‘ldan chiqishga urinsa, shu buyruq raqami ko‘rsatiladi va blok belgilangan holda qoladi. Noto‘g‘ri burilish undan oldin bo‘lishi mumkin, shu sababli izoh robot yo‘nalishi va avvalgi burilishlarni tekshirishni aytadi.
- Jamoaviy rejim, boshqa blok darajalari va Java muharriri bo‘yicha ushbu bosqichda maket o‘zgartirilmadi. Kompyuterda oldingi P, qadam va tezlik boshqaruvlari mavjud.
- 61/61 avtomatik test va build muvaffaqiyatli. Electron’dagi sensor taqlidida 390×844 va 844×390 ekranda noto‘g‘ri dasturni bajarish, uchinchi buyruqni topish, oldingi burilishni tuzatish, uch yulduz olish va ikkinchi darajaga o‘tish tekshirildi. 320 px kenglikda gorizontal toshish kuzatilmadi. Haqiqiy telefonda yangi o‘yinchining mustaqil sinovi hali o‘tkazilmagan.

## 2026-11-23 — Robot mashqlari va Kodbuzar mantiq sinovi

- Robotning yakka mashqlarida kichik ekranlarda 16 daraja ro‘yxati «Darajalar» tugmasi orqali ochiladi. Bloklarda ishlayotgan buyruq ko‘rinadi, robot yo‘ldan chiqsa tegishli blok va raqam belgilanadi. P funksiyasi uchinchi darsdan boshlab ko‘rinadi. Avvalgi ikki darsda katta ekranda P ishlatilgan dastur kichik ekranda ham tahrirlanadi.
- Oltita Java darsida boshlang‘ich kod bor. «Kodni shu yerdan tahrirlash» tugmasi mavjud o‘zgaruvchini, sonni yoki buyruqni tanlaydi, yangi qator kerak bo‘lgan darsda esa kursorni kod oxiriga qo‘yadi. Oddiy muharrir, ekran klaviaturasi, kod bo‘laklari va nazariya mavjud. Jamoaviy o‘yin tartibi, baholar va yulduzlarning saqlash shakli saqlanadi.
- Kodbuzar bosh ekranida «Mantiq sinovi» bor. Tayyor dalilda ikki dalilga mos kod tanlanadi. Eng foydali taxminda eng yomon javob guruhida kamroq kod qoladigan taxmin tanlanadi. «Xatoni toping» vazifasida berilgan kodga zid bo‘lgan izoh aniqlanadi. Xato javobni qayta tanlash mumkin. Yakunda raqamlari qayta aralashtirilgan sinov boshlanadi. Ushbu mashq kunlik seriya yoki asosiy yulduzlarni hisoblamaydi.
- 62/62 avtomatik test va muvaffaqiyatli build. Yangi test 120 ta boshlang‘ich qiymatda uchala vazifaning yagona javobini tekshirdi. Electron’da 19 ta amaliy tekshiruv, jumladan ikkinchi blok darsini yakunlash, P ga buyruq qo‘shish, Java darsini tahrirlab yechish hamda Kodbuzarning uch vazifasini tugatish o‘tdi.
- 320×640 va 844×390 emulyatsiyada 16 darajaning har biri ochildi. Maydon ekranga sig‘di va gorizontal siljish talab qilinmadi. Kodbuzar sinovi bosh ekranining tugmalari ikki o‘lchamda ham kamida 44 px balandlikda chiqdi.
- Android va iPhone’da haqiqiy ekran klaviaturasi hamda Kodbuzarni bir necha marta o‘ynagandagi qiziqish hali foydalanuvchi bilan baholanmagan.

## 2026-11-23 — Windows 0.7.0 lokal yig‘ilmasi

- `npm run dist` bilan joriy koddan Windows x64 uchun `release/Bilim-Arena-Setup.exe` va joylashtirish uchun `dist/` veb papkasi yig‘ildi.
- 62/62 avtomatik test o‘tdi. O‘rnatuvchisiz paket nusxasi vaqtinchalik profil bilan ochildi. Unda versiya, zal, Kodbuzar mantiq sinovi, Robot ish maydoni, Soya va Xazina poygasidagi portretlar tasdiqlandi. Oltita tekshiruv o‘tdi.
- O‘rnatuvchi SHA-256 qiymati `7DED37FE0229C70D4B84B25FA8E80C39B32E5910110A3A3B178BF589F13C96C5`. Raqamli imzo mavjud emas. Joriy qurilmaga o‘rnatish, eski versiyadan yangilash va GitHub’ga e’lon qilish bu yig‘ish ishining tarkibiga kirmadi.

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
- Ushbu versiyada to‘liq import 25 MB bilan cheklangan edi. Chegara 2026-11-23 da olib tashlandi.
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

## 2026-11-18 — barcha o‘yinlar bitta zalda, bir xil tartibda
Muammo: zaldagi “Sinf bilan” kartalari (Xazina poygasi, Robo Kod, Java Robot) o‘qituvchi studiyasiga yuborardi, o‘yindan chiqqanda ham studiyaga qaytilardi — platforma ikki xil ilovadek tuyulardi.

### Bajarilgan ishlar
- Zalda beshala o‘yin bitta “O‘yinlar” to‘rida, bir xil afishada: har birining o‘z sahnasi (SVG), rejimi (Yakka / Yakka yoki jamoa / 2–4 jamoa), natija qatori va bir xil joylashgan tugmalar.
- Har afisha o‘yinning o‘zini ochadi: Kodbuzar va Soya — o‘yin; Robo Kod va Java Robot — “Mashq qilish” (yakka) yoki “Jamoa bilan” (tayyorgarlik); Xazina poygasi — “Jamoalarni tuzish” (savol to‘plami bo‘lmasa tugma o‘chiq va izoh chiqadi).
- `App.jsx`: zaldan ochilgan o‘yin `from: 'hall'` belgisini oladi. Tayyorgarlikdagi “Orqaga”, o‘yin ichidagi chiqish, natijalar va takrorlash ekranlari zalga qaytaradi (“← O‘yinlar zaliga qaytish”). Studiyadan ochilgan o‘yinlar avvalgidek studiyaga qaytadi. O‘yin komponentlariga faqat `exitLabel` / `adminLabel` yozuvlari qo‘shildi.
- Zal tepasida “✎ Studiya” tugmasi — savol to‘plamlari, natijalar va sozlamalar uchun.
- “Davom ettirish” qatori barcha o‘yinlar uchun ishlaydi.

### Tekshiruv
- `npm test` — 57/57, `npm run build` — muvaffaqiyatli.
- Brauzerda: Robo Kod mashqi → pauza → zalga; Robo Kod jamoa tayyorgarligi → Orqaga → zal; Java mashqi → zal; Xazina poygasi → tayyorgarlik → Orqaga → zal; Xazina poygasi → boshlash → yakunlash → natijalar (“← O‘yinlar zali”) → zal. Konsolda xato yo‘q.
- `BILIM_ARENA_TEST_SHOW=1 npm run smoke:electron` — 12/12 (yangi: Robo Kod mashqi zaldan ochilib zalga qaytadi, Studiya tugmasi).

## 2026-11-18 — Boshqaruv: yashirinroq va zal bilan bir xil dizayn
Muammo: zaldagi “✎ Studiya” tugmasi o‘yinlar bilan raqobatlashardi; ichkarisi och yashil “Dars studiyasi” mavzusida edi — to‘q zaldan keyin boshqa ilovadek tuyulardi.

### Bajarilgan ishlar
- Zalda “✎ Studiya” o‘rniga kichik dumaloq ⚙ (ovoz tugmasi bilan bir xil); nomi hamma joyda **Boshqaruv**.
- Boshqaruv, tayyorgarlik, savol muharriri va natijalar ekrani platformaning to‘q mavzusiga o‘tkazildi (`styles.css` dagi och mavzu bloki almashtirildi; ogohlantirish, tiklash va saqlash xabarlari ham to‘q ranglarda).
- Boshqaruv sarlavhasi: dumaloq ← (zalga), “Boshqaruv — Savollar, natijalar va sozlamalar”. “Dars studiyasi” reklama bloki va bosh harfli yorliqlar olib tashlandi.
- O‘yin qayerdan boshlanmasin (zal yoki Boshqaruvdagi “O‘ynash”), undan chiqqanda va natijalardan keyin har doim zalga qaytiladi.
- `scripts/electron-smoke.mjs`: production rejimida mavjud bo‘lmagan `window.__game` ga tayangan tekshiruvlar tuzatildi (Soya darajasi zal tugmasi yashirinishi bo‘yicha tekshiriladi, Enter 3 martagacha qayta bosiladi). Shu xato sabab avvalgi takroriy “muvaffaqiyatsiz” natijalar ilova xatosi emas edi.

### Tekshiruv
- `npm test` — 57/57, `npm run build` — muvaffaqiyatli.
- Brauzerda: Boshqaruvning 4 bo‘limi, savol muharriri — och fonli element qolmagan (faqat asosiy yashil tugmalar); Boshqaruv → O‘ynash → tayyorgarlik → o‘yin → yakunlash → natijalar (“← O‘yinlar zali”) → zal.
- Tuzatilgan Electron smoke qayta ishga tushirilmadi.

## 2026-11-18 — Sozlamalar: barcha o‘yinlar uchun bitta tuzilma
Muammo: ⚙ “Boshqaruv”ni ochardi, ichida yana “⚙️ Sozlamalar” bo‘limi bor edi; u yerdagi “O‘yin” sozlamalari (vaqt, qadamlar) faqat Xazina poygasiga tegishli edi, Kodbuzar va Soya uchun esa hech narsa yo‘q edi.

### Bajarilgan ishlar
- ⚙ endi to‘g‘ridan-to‘g‘ri **Sozlamalar** sahifasini ochadi. Bo‘limlar: **Umumiy** · **O‘yinlar** · **Savollar** · **Natijalar** (ichida “Sozlamalar” bo‘limi yo‘q).
- **Umumiy** — barcha o‘yinlar uchun: “Ovoz va musiqa”, “Animatsiyalar”, xavfsizlik (PIN, sinf himoyasi), yangilanishlar, zaxira.
- **O‘yinlar** — har o‘yin o‘z panelida: Kodbuzar va Soya (yulduzlar, natijalarni tozalash — o‘yinning o‘z sozlamalari saqlanadi), Robo Kod va Java Robot (mashqni tozalash), Xazina poygasi (savol vaqti, qadamlar soni, savollarga o‘tish). Robot bo‘limidagi takroriy “o‘ynash” tugmalari olib tashlandi — o‘yinlar zalda.
- “Animatsiyalar” endi Kodbuzar (Shadow DOM ichiga `reduceMotion` orqali) va Soyaga (`theme.reducedMotion()` platformaning `html.reduce-motion` belgisini ham tekshiradi) ham ta’sir qiladi. Ovoz avvaldan umumiy edi.
- Nomlar: hamma joyda “Boshqaruv” → “Sozlamalar”; robot o‘yinlarining `adminTab` → `games`.

### Tekshiruv
- `npm test` — 57/57, `npm run build` — muvaffaqiyatli.
- Brauzerda: ⚙ → “Sozlamalar”, 4 bo‘lim; O‘yinlar bo‘limida 5 ta o‘yin; “Animatsiyalar” o‘chirilganda `html.reduce-motion` va Kodbuzar ichida `.kb.reduce` yoqildi, qayta yoqilganda olib tashlandi.

## 2026-11-18 — Savollar va natijalar o‘z o‘yinida; Qulflash tugmasi olib tashlandi
- Sozlamalar tepasida faqat **Umumiy** va **O‘yinlar**. “Savollar” va “Natijalar” alohida o‘yinlarga tegishli bo‘lgani uchun o‘sha o‘yin panelidan ochiladi: Xazina poygasi — “Savollar” va “Natijalar (N)”; Robo Kod va Java Robot — “Natijalar (N)”. Ichki sahifalarda “← O‘yinlar”.
- Natijalar tarixi o‘yin bo‘yicha ajratildi (`HistoryTab` `game` bo‘yicha filtrlaydi); “Tarixni tozalash” ham faqat shu o‘yin natijalarini o‘chiradi.
- Sozlamalar sarlavhasidagi “🔒 Qulflash” tugmasi olib tashlandi.

### Tekshiruv
- `npm test` — 57/57, `npm run build` — muvaffaqiyatli.
- Brauzerda: 2 ta bo‘lim, Qulflash yo‘q; Xazina poygasi → Savollar (yuqorida “O‘yinlar” belgili) → ← O‘yinlar; Robo Kod → Natijalar (Xazina poygasi yozuvlari ko‘rinmaydi); Xazina poygasi → Natijalar (2 ta yozuv).

## 2026-11-18/19 — Sinf himoyasi olib tashlandi, PIN sessiyada bir marta
Muammo: “Sinf himoyasi” yoqilganda dastur alohida sinf ekranidan (`Home.jsx`) ochilar va o‘yindan chiqishda PIN so‘rardi — zal bilan bir platforma tuyg‘usini buzardi, Qulflash tugmasi esa avvalroq olib tashlangan edi.

### Bajarilgan ishlar
- `src/screens/Home.jsx` (sinf ekrani) o‘chirildi; dastur har doim O‘yinlar zalidan ochiladi.
- PIN o‘rnatilgan bo‘lsa faqat ⚙ Sozlamalarni ochish va dasturdan chiqishda so‘raladi, dastur yopilguncha bir marta (`guard` / `pinUnlocked` — `App.jsx`). PINni almashtirish va zaxiradan tiklash har safar so‘raydi. O‘yin ichidagi yakunlash/zalga qaytish PINsiz.
- Sozlamalar → Umumiy → PIN bo‘limi matni yangi tartibga moslandi; zaxiradan tiklagach Umumiy bo‘lim ochiladi.
- `classroomLock` sozlamasi `DEFAULT_SETTINGS`, normallashtirilgan ma’lumot va zaxira tiklashdan olib tashlandi. Eski fayllardagi maydon xato bermaydi, e’tiborsiz qoldiriladi.
- README, MAHSULOT_QARORLARI (PIN jadvali, bosh sahifa qarori) va SINF_SINOVI yangi tartibga moslandi.

### Tekshiruv
- `npm test` — 57/57, `npm run build` — muvaffaqiyatli.
- `BILIM_ARENA_TEST_SHOW=1 npm run smoke:electron` — 12/12.
- Brauzerda: PIN yaratish (ikki marta) → qayta ochish → ⚙ PIN so‘radi → noto‘g‘ri PIN “PIN noto‘g‘ri” → to‘g‘ri PIN → ⚙ ikkinchi marta PINsiz. Xazina poygasi: tayyorgarlik → o‘yin → pauza → yakunlash (PINsiz) → natijalar → zal. Java mashqi → pauza → zal. Sozlamalar → O‘yinlar: 5 ta o‘yin paneli, Xazina poygasi Savollar va Natijalar. Konsolda xato yo‘q.

### Qolgan ishlar
- PIN va Sozlamalar oqimi uchun avtomatik test yo‘q.
- `platforma` branchi `main`ga qo‘shilmagan va GitHub’ga push qilinmagan.
- Qarorlar kutilmoqda: platforma nomi, Robo Kod mustaqil loyihasi, Kodbuzar/Soya manbalarini yagona qilish.

## 2026-11-19 — Robo Kod va Java Robot bitta zinapoyada: Robot dasturlash
Muammo: zalda ikkita deyarli bir xil afisha bor edi — ikkalasi ham bir xil robot dunyosi, faqat buyruq berish usuli (bloklar / Java) va yosh farq qilardi.

### Qaror
- Bitta o‘yin **Robot dasturlash** (`id: robot`), 16 daraja: 1–10 — Bloklar (avvalgi Robo Kod), 11–16 — Java (avvalgi Java Robot). Har daraja o‘z qismining ish maydonida ochiladi va o‘z yulduz qoidasini saqlaydi.
- Mashqda darajalar erkin tanlanadi (8–11-sinf o‘qituvchisi to‘g‘ridan-to‘g‘ri Java’dan boshlay oladi); ochilganda birinchi yechilmagan daraja tanlanadi, “Keyingi daraja” 10-dan 11-ga o‘tadi.
- **Saqlash formati o‘zgarmadi:** mashq yulduzlari avvalgidek `data.robot.kod` / `data.robot.java` da, zinapoya ularni o‘qiydi va yozadi (`src/lib/robot/games.js` — `ROBOT_LADDER`, `ladderStars`, `withLadderStars`). Eski yulduzlar joyida qoladi, migratsiya kerak emas.
- Yangi jamoaviy natijalar `game: 'robot'` bilan saqlanadi; eski `kod` / `java` natijalari qabul qilinadi va Robot dasturlash natijalarida ko‘rinadi. Eslatma: 0.7.0 dan keyingi zaxira faylini 0.6.0 yoki eskiroq versiyaga tiklab bo‘lmaydi, agar unda yangi robot natijasi bo‘lsa.
- Zal: 4 ta afisha; yangi “Robot dasturlash” rasmi (bloklar → Java kodi). Eski “oxirgi o‘yin” (`kod` / `java`) Robot dasturlashga yo‘naltiriladi.
- Jamoaviy tayyorgarlik: “🧩 Bloklar”, “☕ Java”, “🤖 Butun zinapoya” tez tanlash tugmalari; navbat vaqti tanlanmaguncha oraliqda Java bo‘lsa 5 daqiqa, aks holda 3 daqiqa; qoidalar matni oraliqdagi qismlarga mos.
- Sozlamalar → O‘yinlar: bitta “Robot dasturlash” paneli (har qism bo‘yicha yechilganlar, umumiy natijalar, mashqni tozalash).

### Tekshiruv
- `npm test` — 59/59 (yangi: zinapoya tartibi, yulduzlarni eski formatda o‘qish/yozish, eski va yangi natija ID lari).
- `npm run build` — muvaffaqiyatli. `BILIM_ARENA_TEST_SHOW=1 npm run smoke:electron` — 12/12 (zal 4 afisha; Robot dasturlash 16 daraja, Java qismi ochiladi, zalga qaytadi).
- Brauzerda eski formatdagi ma’lumot bilan: zal ★ 8/48 va “Robot dasturlash: davom etish” (eski `kod`); mashq 3-darajadan ochildi; 4-daraja (Bloklar) yechildi → `kod.stars[3]`, 12-daraja (Java) yechildi → `java.stars[1]`; jamoaviy o‘yin 10 (Bloklar) → 11 (Java) raundlari, natijalar; Sozlamalar paneli “Bloklar: 3/10, Java: 2/6”, natijalarda eski Java Robot va Robo Kod yozuvlari ham bor. Konsolda xato yo‘q.
- Haqiqiy doskada sinalmagan.

### Darajalar tartibi: osondan qiyinga (2026-11-19)
Bloklar qismida tartib buzilgan edi: 3-daraja “Zinapoya” P funksiyasini majburiy qilardi (P siz eng qisqa yechim 17 buyruq, asosiy dasturda 12 joy), 4-daraja “Orqaga qaytish” esa P siz ham yechiladi (11 buyruq). Rekursiya (“Cheksiz yo‘l”, “Tog‘ga chiqish”) 7–8-o‘rinda, P bilan oddiy uzun yo‘llar (“Ilon”, “Spiral”) undan keyin turardi.
- Har daraja uchun P siz eng qisqa yechim hisoblandi va tushunchalar bo‘yicha tartiblandi: Birinchi qadam → Burilish → Orqaga qaytish → Zinapoya (P) → Kvadrat → Katta kvadrat → Ilon → Spiral → Cheksiz yo‘l (rekursiya) → Tog‘ga chiqish (rekursiya + zinapoya).
- Java qismi allaqachon to‘g‘ri: metod → int → for → while → if → o‘zgaruvchini o‘zgartirish.
- Tartib `ROBOT_GAMES.<qism>.order` da; `KOD_LEVELS` massivi o‘zgarmadi, shuning uchun saqlangan yulduzlar o‘z darajasida qoladi.
- 10 → 11 o‘tishida grid oson bo‘ladi, lekin vazifa qiyinroq: tugmalardan haqiqiy Java sintaksisini yozishga o‘tiladi.
- Tekshiruv: `npm test` — 60/60 (yangi: tartib va yulduz kaliti), `npm run build` — muvaffaqiyatli; brauzerda 1–11 darajalar yangi tartibda.
- Mustaqil `robot-kod` loyihasidagi tartib o‘zgartirilmadi.

## 2026-11-19 — Xazina poygasida yakka rejim; har o‘yinga o‘z kirish ekrani
### Xazina poygasi: yakka rejim
- Tayyorgarlikda “👤 Yakka | 2 | 3 | 4 jamoa”; zalda “Yakka o‘ynash” va “Jamoa bilan” tugmalari.
- Yakkada: savollar ketma-ket, to‘g‘ri javob — 1 qadam, xatoda joyda qolinadi; bonus va girdob avvalgidek. Xazinaga yetganda aniqlik bo‘yicha yulduz: xatosiz ★★★, ≥75% ★★, qolgani ★ (`soloStars`, `src/lib/race-rules.js`).
- Matnlar yakkaga moslandi (“O‘yinchi, 3-savol”, “Joyingizda qolasiz”), g‘alaba kartasi “Xazina topildi!” va yulduzlar, natija ekrani shohsupa o‘rniga bitta o‘yinchi kartasi.
- Saqlash formati o‘zgarmadi: yakka natija — bitta jamoali poyga natijasi.
- Topilgan va tuzatilgan xato: natija ekranidagi ko‘rsatkich raqamlari eski och mavzu rangida (#17312a) qolgan edi — to‘q fonda deyarli ko‘rinmasdi (jamoaviy shohsupada ham). Endi `--text` / `--muted`.

### Dizayn: har o‘yin o‘ziga yarasha (andoza — Kodbuzar)
Solishtiruv: Kodbuzar va Soyada o‘z kirish ekrani bor edi; Robot dasturlash to‘g‘ridan-to‘g‘ri ish maydoniga tushardi, Xazina poygasi tayyorgarligi sozlamalar formasiga o‘xshardi.
- **Robot dasturlash** — yangi bosh ekran `src/screens/RobotHome.jsx` + `src/robot-home.css` (robot laboratoriyasi: to‘r fon, uchib yuruvchi kod belgilari, “ROBOT > dasturlash_” logotipi, gapiradigan maskot Robi — gapi yutuqqa qarab o‘zgaradi, 16 tugunli zinapoya xaritasi, “Davom etish” kartasi, Bloklar / Java / Jamoa kartalari). Zal → bosh ekran → mashq → “Robot menyusiga qaytish”. O‘yin ekrani ham shu uslubda (to‘r fon, g‘alaba kartasi va yulduzlar animatsiyasi).
- **Xazina poygasi** — tayyorgarlik ekrani `src/race-setup.css`: dengiz va to‘lqinlar, tebranayotgan palma va yaltiroq tangali orol, oltin “XAZINA poygasi” logotipi, oltin tugmalar.
- **Soya** — atrofdagi qora chiziq o‘rniga o‘yin osmoniga mos gradient.
- Barcha yangi animatsiyalar “Animatsiyalar” sozlamasi o‘chirilganda to‘xtaydi.

### Tekshiruv
- `npm test` — 61/61 (yangi: yakka yulduzlar), `npm run build` — muvaffaqiyatli.
- `BILIM_ARENA_TEST_SHOW=1 npm run smoke:electron` — 12/12 (yangilangan: Robot bosh ekrani, 16 tugun, menyuga va zalga qaytish). Bir urinishda Soya qadami avvaldan ma’lum vaqt muammosi bilan o‘tmadi, keyingi ikki urinish 12/12.
- Brauzerda: yakka Xazina poygasi boshidan oxirigacha (g‘alaba kartasi, natija ekrani), Robot bosh ekrani → 12-daraja → menyu → zal, Xazina tayyorgarligi, Soya. Konsolda xato yo‘q.

## 2026-11-19 — Bepul tarqatish va 0.7.0
- Qaror: dastur hozircha bepul; keyin pullik qo‘shimchalar qo‘shish huquqi saqlanadi. `LICENSE.md` — bepul foydalanish va o‘zgartirmasdan ulashish ruxsat, sotish va o‘z nomidan tarqatish taqiqlangan (ochiq kodli litsenziya emas).
- `THIRD_PARTY_LICENSES.md` — dasturga kiradigan kutubxonalar va litsenziya matnlari (`node scripts/third-party-licenses.mjs` bilan yaratiladi; yangi kutubxonadan keyin qayta ishga tushirish). Ikkala fayl o‘rnatuvchi ichida (`resources/`).
- O‘rnatuvchi nomi versiyasiz: `Bilim-Arena-Setup.exe`. Doimiy havola: https://github.com/ShaxzodRuziqulov/bilim-arena/releases/latest/download/Bilim-Arena-Setup.exe
- Release sahifasi matni `.github/release-notes.md` dan (yuklab olish, SmartScreen ogohlantirishi, ulashish shartlari, zaxira).
- README boshida “Yuklab olish” bo‘limi.
- Tekshiruv: `npm run dist` mahalliy yig‘ildi — `release/Bilim-Arena-Setup.exe`, `latest.yml` shu nomni ko‘rsatadi, `resources/` da ikkala litsenziya fayli bor.
