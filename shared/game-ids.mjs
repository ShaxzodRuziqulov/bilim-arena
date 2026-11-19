// O'yin identifikatorlari — saqlangan ma'lumot (schema) va ilova reyestri (src/games) shu ro'yxatga tayanadi.
// tests/games.test.js moslikni tekshiradi.
export const QUIZ_GAME_IDS = ['race'];
// Robot dasturlash qismlari: mashq yulduzlari data.robot.<qism> da saqlanadi.
export const ROBOT_PART_IDS = ['kod', 'java'];
// Jamoaviy natijalar tarixidagi robot o'yini ID lari. 'robot' — yagona zinapoya (0.7.0 dan);
// 'kod' va 'java' — avvalgi versiyalarda alohida o'yinlar bo'lgan, eski natijalar uchun qabul qilinadi.
export const ROBOT_GAME_IDS = ['robot', ...ROBOT_PART_IDS];
export const GAME_IDS = [...QUIZ_GAME_IDS, 'robot'];
