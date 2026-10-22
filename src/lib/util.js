export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const normalizeAnswer = (value) =>
  String(value ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');

// Bir nechta to'g'ri javobni ";" bilan ajratib yozish mumkin: "11; 11.0"
export function checkInputAnswer(question, value) {
  const accepted = String(question.answer || '')
    .split(';')
    .map(normalizeAnswer)
    .filter(Boolean);
  return accepted.includes(normalizeAnswer(value));
}

export const QUESTION_TYPES = {
  choice: { label: 'Variantli', icon: '🔠' },
  tf: { label: 'To‘g‘ri / Noto‘g‘ri', icon: '⚖️' },
  input: { label: 'Javob yozish', icon: '🔢' },
};

export const CODE_LANGS = { '': 'Kod yo‘q', python: 'Python', pascal: 'Pascal', cpp: 'C++' };

export function newQuestion(type = 'choice') {
  return {
    id: uid(),
    type,
    text: '',
    image: '',
    code: '',
    lang: '',
    options: type === 'choice' ? ['', '', '', ''] : [],
    correct: 0,
    answer: '',
    keypad: 'number',
    explanation: '',
  };
}

export function newSet(name = 'Yangi to‘plam') {
  return { id: uid(), name, subject: 'Informatika', grade: '7', questions: [newQuestion()] };
}

// O'yinga yaroqsiz savolni qaytaradi: null — hammasi joyida.
export function questionProblem(q) {
  if (!q.text.trim() && !q.code.trim() && !q.image) return 'Savol matni yo‘q';
  if (q.type === 'choice') {
    const filled = q.options.filter((o) => o.trim()).length;
    if (filled < 2) return 'Kamida 2 ta variant kerak';
    if (!q.options[q.correct]?.trim()) return 'To‘g‘ri javob belgilanmagan';
  }
  if (q.type === 'input' && !q.answer.trim()) return 'To‘g‘ri javob yozilmagan';
  return null;
}

export const playableQuestions = (set) => set.questions.filter((q) => !questionProblem(q));

// Rasmni kichraytirib dataURL qiladi, aks holda ma'lumotlar fayli juda kattalashadi.
export function resizeImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
