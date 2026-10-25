# Bilim Arena — mahsulot, dizayn va rivojlanish qarorlari

Sana: 2026-10-24. Bu hujjat amalga oshirilgan imkoniyatlarni takliflardan ajratadi. Sotuv modeli — sinovdan o‘tkaziladigan taxmin, bozor tadqiqoti natijasi emas.

## Mahsulotning markazi
5–11-sinflar uchun o‘qituvchi boshqaradigan, internet bo‘lmasa ham ishlaydigan jamoaviy bilim o‘yini. Xaridor — o‘qituvchi yoki maktab; asosiy ishtirokchilar — o‘quvchilar. O‘qituvchi darsni tez tayyorlaydi, bolalar navbat bilan javob beradi, yakunda xatolar muhokama qilinadi.

## Qabul qilingan dizayn qarorlari
- O‘qituvchining bosh sahifasi endi Dars studiyasi. Birinchi harakat parol kiritish emas, to‘plam tanlash yoki darsni boshlash.
- Studiyada och fon, yashil urg‘u, aniq kartalar va yordamchi amallardan ajralgan asosiy boshlash tugmasi ishlatiladi.
- Namuna HTMLdagi och muharrir va sarguzasht kayfiyati olindi. Platformer mexanikasi, tashqi kod, audio va resurslar ko‘chirilmadi.
- O‘yin hamma sinfga bir xil multfilm muhitini majburlamaydi: Sarguzasht va sokinroq Bilim maydoni tanlanadi. Bular ikkita vizual mavzu; alohida o‘yin rejimlari emas.
- Savol o‘qilishi animatsiyadan ustun. Savol oynasida katta matn, rang orqali farqlanadigan javoblar va doim ochiq pauza boshqaruvi bor.
- Mavjud qahramonlar emoji ko‘rinishida qoldi. Sotuvdan oldin yagona mualliflik grafik uslubi kerak; bu hozircha bajarilmagan.
- Mobil qurilmada studiya moslashadi. O‘yinning asosiy nishoni gorizontal sensorli doska; telefon uchun multiplayer hali yo‘q.

## PIN va kirish tartibi — amaldagi qoidalar
| Vaziyat | Natija |
| --- | --- |
| Birinchi ochilish, PIN yo‘q | Studiyaga to‘g‘ridan-to‘g‘ri kiradi |
| PIN bor, Sinf himoyasi o‘chiq | Oddiy ishlar parolsiz davom etadi |
| Sozlamalarda PIN yaratish | Ikki marta kiritiladi, xesh saqlanadi |
| Mavjud PINni almashtirish | Joriy PIN tasdiqlanadi |
| Qo‘lda Qulflash | Sinf ekrani ochiladi, studiyaga qaytish PIN bilan |
| Sinf himoyasi yoqilgan yangi o‘yin | O‘qituvchi sessiyasi yopiladi |
| Pauza yoki davom etish | PIN so‘ralmaydi |
| Himoyalangan o‘yinni yakunlash/studiyaga qaytish | Bir marta PIN kerak |
| PIN to‘g‘ri tasdiqlandi | Yangi qulflash/yangi himoyalangan o‘yingacha qayta so‘ralmaydi |
| Himoya yoqilgan dastur qayta ochildi | Sinf ekrani ochiladi |

PIN sinfdagi tasodifiy aralashuvdan saqlaydi. Bu Windows hisob himoyasi yoki majburiy kiosk emas. Oddiy oynani operatsion tizim vositalari bilan boshqarish mumkin. PIN yo‘q bo‘lsa Qulflash va Sinf himoyasi faol emas; avval PIN yaratiladi.

## Boshqa fanlarga tayyorgarlik — bajarilgan
- To‘plamning fan nomi erkin tahrirlanadi; sinflar 5–11 va Aralash.
- Kutubxonada fan, sinf va nom bo‘yicha topish mumkin.
- Matn, rasm, test, to‘g‘ri/noto‘g‘ri, tartiblash va moslashtirish mavjud.
- Javob yozishda son, o‘n oltilik yoki matnli klaviatura tanlanadi.
- Matnli javob ekran harflari bilan ham kiritiladi. Oddiy klaviatura yoki tilga xos belgilarni fizik klaviaturadan kiritish mumkin.
- Qabul qilinadigan bir nechta javob nuqtali vergul bilan ajratiladi. Katta/kichik harf va bo‘sh joylar e’tiborga olinmaydi; odatiy o‘zbekcha apostroflar birlashtiriladi.
- Bu semantik tekshiruv emas: sinonimni o‘qituvchi kiritadi. Formulalar uchun LaTeX muharriri, kimyoviy yozuvlar va xarita savollari hali yo‘q.

## Sotuvga olib chiqish uchun tavsiya etiladigan tartib
### 1. Avval darsdagi foydani tekshirish
Informatika bilan birga matematika va til/geografiya kabi turli yo‘nalishdagi darslarda sinash. Har sinovda quyidagilar yozilsin:
- O‘qituvchi tayyor to‘plamdan darsni necha daqiqada boshladi?
- Nechta bola javob berishda ishtirok etdi, nechta bola faqat tomoshabin bo‘ldi?
- Qaysi bosqichda kutish yoki chalkashlik bo‘ldi?
- Dars oxirida o‘qituvchi xato tushunchalarni aniqlay oldimi?
- Dasturdagi nosozlik darsni to‘xtatdimi?

Taklif etiladigan maqsad: tayyor to‘plam bilan 2 daqiqada boshlash. Bu hozir o‘lchangan natija emas.

### 2. Sotuvdan oldin ishonchlilik
- Saqlash muvaffaqiyatsizligini ekranda ko‘rsatish; avtomatik zaxira va tiklash.
- To‘liq ma’lumotlar eksport/importi, buzilgan importni xavfsiz rad etish.
- Yangilanish oldidan zaxira; eski ma’lumotlar yangi versiyada saqlanishi.
- Windows o‘rnatish, yangilash, o‘chirish va 1366×768/1920×1080 doskalarda qo‘lda sinov.
- Sinovdan o‘tgan versiyani chiqarish va nosozlikni xabar qilishning sodda usuli.
- Dastur imzosi va foydalanilgan grafika/audio/kutubxonalar litsenziyalari ro‘yxati.

2026-10-25 holati: saqlash xatosi, avtomatik zaxira va to‘liq eksport/import lokal dasturda bajarildi va testlandi. Yangilashdan oldin saqlash kutiladi; to‘liq o‘rnatish/yangilash sinovi, imzolash va haqiqiy doska sinovi hali qolgan. Sotuv tayyorligi hali tasdiqlanmagan.

### 3. O‘qituvchiga qiymat beradigan pullik taklif
Boshlang‘ich taxmin: internetsiz ishlaydigan asosiy dastur + fan va sinf bo‘yicha tekshirilgan savol paketlari. Keyin maktab uchun bir nechta qurilma litsenziyasi va yangilanish/yordam xizmati sinab ko‘rilishi mumkin.

Narx hozir belgilanmaydi. Avval bir nechta o‘qituvchi bilan sinov va to‘lashga tayyorlik suhbati o‘tkaziladi. Litsenziya/to‘lov, foydalanuvchi hisobi, obuna va paket do‘koni hozir dasturda yo‘q. Internet yoki to‘lov tekshiruvi sabab boshlangan darsni o‘rtada to‘xtatish tavsiya etilmaydi.

## G‘oyalar va ularning holati
1. Xato savollarni dars oxirida qayta yechish — 2026-10-25 da bajarildi. Vaqt cheklanmaydi va musobaqa natijasi saqlanadi.
2. Savol qiyinligi va mavzusi teglari; jamoalarga qiyinlikni teng taqsimlash.
3. Navbatdagi o‘quvchini eslatish; bolalarning ism-sharifini majburiy yig‘masdan ishtirokni boshqarish.
4. 10/15/20 daqiqalik dars ssenariylari va vaqt ichida teng davralar.
5. Alohida tekshirilgan savol paketlari; muallif, versiya va manba maydonlari.
6. Rasmni kattalashtirish va matematik formula ko‘rinishi.
7. Keyin Duel/Boss kabi yangi rejimlar. Telefon multiplayeri esa mavjud sinf rejimi barqarorlashgach ko‘rib chiqiladi.

## Ishlash va hujjatlashtirish qoidalari
- Foydalanuvchi ma’lumotlari saqlansin; mavjud PINlar o‘chirib yuborilmasin.
- Bajarilgan ishlar ISHLAR_VA_QOIDALAR.md ga, mahsulot qarorlari ushbu hujjatga yozilsin.
- Taxmin, taklif va sinov natijasi alohida ko‘rsatilsin.
- Yangi amal tushunarli bo‘lsin; odatiy ishga ortiqcha tasdiq qo‘shilmasin.
- GitHubga chiqarish va sotuv tayyorligi lokal build bilan tenglashtirilmasin.
- Hozirgi o‘zgarishlar lokal. Release/publish va pullik tizim ishga tushirilmagan.

## 2026-10-25 — qo‘shimcha qarorlar
- Saqlash xatosi shunchaki konsolga yozilmaydi: o‘qituvchiga ko‘rinadi va xotiradagi o‘zgarishni eksport qilish imkoniyati qoladi.
- Buzilgan bazani yangisi bilan jim almashtirish taqiqlanadi. Avval yaroqli zaxira, u ham bo‘lmasa operatorning fayldan tiklashi.
- Zaxiradan to‘liq tiklash oldindan ko‘rib tasdiqlanadi; kundalik tahrirlarga qo‘shimcha PINlar qo‘shilmaydi.
- Qurilmalar orasida savollarni ko‘chirish joriy PINni o‘zgartirmaydi. Bu o‘qituvchining o‘z qurilmasida ishlashni davom ettirishiga yordam beradi.
- Takrorlash jamoalarga yangi ball bermaydi: raqobatdan keyingi ta’lim bosqichi sifatida ishlaydi.
- Savollar o‘yin vaqtidagi nusxa bilan takrorlanadi, keyingi muharrir o‘zgarishiga bog‘liq emas. Natijada eng ko‘p xato qilingan 10 tagacha savol saqlanadi; rasmli tarix hajmini keyin nazorat qilish kerak.
- Keyingi amaliy bosqich: SINF_SINOVI.md bo‘yicha haqiqiy dars. Windows o‘rnatuvchisi va ma’lumotlar saqlanishi tekshirilmasdan sotuvga tayyor deb e’lon qilinmaydi.

## 2026-10-25 — kompyuterdagi sinov nashri
Mavjud Windows o‘rnatilishi 0.3.0 ga yangilandi; ikkinchi dastur yaratilmagan. Windows o‘rnatish, desktop ochilish va saqlab qayta ochish sinovi o‘tdi. Haqiqiy ma’lumot fayli o‘zgarmadi. Avtomatik updater va real dars hali alohida sinov talab qiladi.
