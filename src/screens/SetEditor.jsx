import { useState } from 'react';
import { CODE_LANGS, MATCH_MAX, ORDER_MAX, QUESTION_TYPES, newQuestion, questionProblem, resizeImage } from '../lib/util.js';
import CodeBlock from '../components/CodeBlock.jsx';
import ConfirmButton from '../components/ConfirmButton.jsx';

const GRADES = ['5', '6', '7', '8', '9', '10', '11', 'Aralash'];
const GEMS = ['◆', '●', '▲', '■'];

export default function SetEditor({ set, update, go }) {
  const [selectedId, setSelectedId] = useState(set.questions[0]?.id ?? null);
  const selected = set.questions.find((q) => q.id === selectedId) ?? null;

  const updateSet = (fn) => update((d) => ({ ...d, sets: d.sets.map((s) => (s.id === set.id ? fn(s) : s)) }));
  const updateQuestion = (patch) =>
    updateSet((s) => ({ ...s, questions: s.questions.map((q) => (q.id === selectedId ? { ...q, ...patch } : q)) }));

  const addQuestion = (type) => {
    const q = newQuestion(type);
    updateSet((s) => ({ ...s, questions: [...s.questions, q] }));
    setSelectedId(q.id);
  };

  const duplicate = () => {
    const copy = structuredClone({ ...selected, id: newQuestion().id });
    updateSet((s) => {
      const i = s.questions.findIndex((q) => q.id === selectedId);
      const questions = [...s.questions];
      questions.splice(i + 1, 0, copy);
      return { ...s, questions };
    });
    setSelectedId(copy.id);
  };

  const remove = () => {
    const i = set.questions.findIndex((q) => q.id === selectedId);
    const rest = set.questions.filter((q) => q.id !== selectedId);
    updateSet((s) => ({ ...s, questions: s.questions.filter((q) => q.id !== selectedId) }));
    setSelectedId(rest[Math.min(i, rest.length - 1)]?.id ?? null);
  };

  const move = (dir) =>
    updateSet((s) => {
      const i = s.questions.findIndex((q) => q.id === selectedId);
      const j = i + dir;
      if (j < 0 || j >= s.questions.length) return s;
      const questions = [...s.questions];
      [questions[i], questions[j]] = [questions[j], questions[i]];
      return { ...s, questions };
    });

  return (
    <div className="screen admin">
      <header className="topbar">
        <button className="btn" onClick={() => go({ name: 'admin' })}>
          ← Orqaga
        </button>
        <input
          className="title-input"
          value={set.name}
          onChange={(e) => updateSet((s) => ({ ...s, name: e.target.value }))}
          placeholder="To‘plam nomi"
        />
        <input className="subject-input" aria-label="Fan nomi" placeholder="Fan nomi" value={set.subject} onChange={(e) => updateSet((s) => ({ ...s, subject: e.target.value }))} />
        <select aria-label="Sinf" value={set.grade} onChange={(e) => updateSet((s) => ({ ...s, grade: e.target.value }))}>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g === 'Aralash' ? 'Aralash sinflar' : `${g}-sinf`}
            </option>
          ))}
        </select>
        <span className="spacer" />
        <span className="muted small">O‘zgarishlar avtomatik saqlanadi</span>
        <button className="btn primary" onClick={() => go({ name: 'setup', setId: set.id })}>
          ▶ O‘ynash
        </button>
      </header>

      <div className="editor-layout">
        <aside className="panel question-list">
          <h3>Savollar ({set.questions.length})</h3>
          <div className="question-items">
            {set.questions.map((q, i) => {
              const problem = questionProblem(q);
              return (
                <button
                  key={q.id}
                  className={`question-item ${q.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(q.id)}
                  title={problem || ''}
                >
                  <span className="qi-num">{i + 1}</span>
                  <span className="qi-icon">{QUESTION_TYPES[q.type].icon}</span>
                  <span className="qi-text">{q.text || q.code || '(bo‘sh savol)'}</span>
                  {problem && <span className="qi-warn">⚠</span>}
                </button>
              );
            })}
          </div>
          <p className="muted small">Yangi savol qo‘shish:</p>
          <div className="add-buttons">
            {Object.entries(QUESTION_TYPES).map(([type, t]) => (
              <button key={type} className="btn small-btn" onClick={() => addQuestion(type)}>
                ＋ {t.icon} {t.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="panel question-editor">
          {selected ? (
            <QuestionForm
              key={selected.id}
              q={selected}
              index={set.questions.indexOf(selected)}
              onChange={updateQuestion}
              onDuplicate={duplicate}
              onRemove={remove}
              onMove={move}
            />
          ) : (
            <p className="muted">Chapdan savol tanlang yoki yangisini qo‘shing.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function QuestionForm({ q, index, onChange, onDuplicate, onRemove, onMove }) {
  const problem = questionProblem(q);

  const changeType = (type) => {
    const patch = { type };
    if (type === 'choice' && q.options.length < 4) patch.options = [...q.options, '', '', '', ''].slice(0, 4);
    if (type !== 'input') patch.correct = Math.min(q.correct, type === 'tf' ? 1 : 3);
    if (type === 'order' && q.items.length === 0) patch.items = ['', '', ''];
    if (type === 'match' && q.pairs.length === 0) patch.pairs = [0, 1, 2].map(() => ({ left: '', right: '' }));
    onChange(patch);
  };

  const setItem = (i, value) => onChange({ items: q.items.map((s, j) => (j === i ? value : s)) });
  const moveItem = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= q.items.length) return;
    const items = [...q.items];
    [items[i], items[j]] = [items[j], items[i]];
    onChange({ items });
  };
  const setPair = (i, side, value) => onChange({ pairs: q.pairs.map((p, j) => (j === i ? { ...p, [side]: value } : p)) });

  const pickImage = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (file) onChange({ image: await resizeImage(file) });
  };

  const setOption = (i, value) => onChange({ options: q.options.map((o, j) => (j === i ? value : o)) });

  return (
    <>
      <div className="editor-head">
        <h2>Savol {index + 1}</h2>
        <div className="row-buttons">
          <button className="btn small-btn" onClick={() => onMove(-1)} title="Yuqoriga">
            ↑
          </button>
          <button className="btn small-btn" onClick={() => onMove(1)} title="Pastga">
            ↓
          </button>
          <button className="btn small-btn" onClick={onDuplicate}>
            ⧉ Nusxa
          </button>
          <ConfirmButton className="btn small-btn danger" onConfirm={onRemove}>
            🗑 O‘chirish
          </ConfirmButton>
        </div>
      </div>
      {problem ? <p className="warn-box">⚠ {problem} — bu savol o‘yinga qo‘shilmaydi.</p> : <p className="ok-box">✓ Savol tayyor</p>}

      <label>Savol turi</label>
      <div className="segmented">
        {Object.entries(QUESTION_TYPES).map(([type, t]) => (
          <button key={type} className={q.type === type ? 'active' : ''} onClick={() => changeType(type)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <label>Savol matni</label>
      <textarea value={q.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Masalan: 1011₂ sonini o‘nlik sanoq sistemasiga o‘tkazing." />
      <p className="note small">
        Pastki indeks uchun belgilar: ₀ ₁ ₂ ₈ ₁₀ ₁₆ — nusxa olib qo‘yishingiz mumkin.
      </p>

      <div className="two-col">
        <div>
          <label>Kod parchasi (ixtiyoriy)</label>
          <select value={q.lang} onChange={(e) => onChange({ lang: e.target.value })}>
            {Object.entries(CODE_LANGS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          {q.lang && (
            <textarea
              className="code-input"
              spellCheck={false}
              value={q.code}
              onChange={(e) => onChange({ code: e.target.value })}
              onKeyDown={(e) => {
                if (e.key !== 'Tab') return;
                e.preventDefault();
                const el = e.target;
                const { selectionStart: a, selectionEnd: b } = el;
                onChange({ code: q.code.slice(0, a) + '    ' + q.code.slice(b) });
                requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4));
              }}
              placeholder={'print("Salom")'}
            />
          )}
        </div>
        <div>
          <label>Rasm (ixtiyoriy)</label>
          {q.image ? (
            <div className="image-preview">
              <img src={q.image} alt="" />
              <button className="btn small-btn danger" onClick={() => onChange({ image: '' })}>
                Rasmni olib tashlash
              </button>
            </div>
          ) : (
            <label className="btn file-btn">
              🖼 Rasm tanlash
              <input type="file" accept="image/*" hidden onChange={pickImage} />
            </label>
          )}
        </div>
      </div>
      {q.lang && q.code && (
        <>
          <label>Kod ko‘rinishi</label>
          <CodeBlock code={q.code} lang={q.lang} />
        </>
      )}

      {q.type === 'choice' && (
        <>
          <label>Javob variantlari — to‘g‘risini yashil doiracha bilan belgilang (2–4 ta)</label>
          <div className="options-edit">
            {q.options.map((opt, i) => (
              <div key={i} className={`option-edit ${q.correct === i ? 'correct' : ''}`}>
                <button className="radio" onClick={() => onChange({ correct: i })} title="To‘g‘ri javob">
                  {q.correct === i ? '✓' : GEMS[i]}
                </button>
                <input value={opt} onChange={(e) => setOption(i, e.target.value)} placeholder={`${i + 1}-variant`} />
              </div>
            ))}
          </div>
          <p className="note small">O‘yinda variantlar har safar aralashtirib chiqariladi.</p>
        </>
      )}

      {q.type === 'tf' && (
        <>
          <label>To‘g‘ri javob</label>
          <div className="segmented">
            <button className={q.correct === 0 ? 'active' : ''} onClick={() => onChange({ correct: 0 })}>
              ✓ To‘g‘ri
            </button>
            <button className={q.correct === 1 ? 'active' : ''} onClick={() => onChange({ correct: 1 })}>
              ✗ Noto‘g‘ri
            </button>
          </div>
        </>
      )}

      {q.type === 'input' && (
        <div className="two-col">
          <div>
            <label>To‘g‘ri javob</label>
            <input value={q.answer} onChange={(e) => onChange({ answer: e.target.value })} placeholder="Masalan: 11" />
            <p className="note small">Bir nechta javob qabul qilinsa, “;” bilan ajrating: 0.5; .5</p>
          </div>
          <div>
            <label>Doskadagi klaviatura</label>
            <select value={q.keypad} onChange={(e) => onChange({ keypad: e.target.value })}>
              <option value="number">Raqamlar (0–9, nuqta, minus)</option>
              <option value="hex">Raqamlar + A–F (o‘n oltilik)</option>
                <option value="text">Matn (harflar va bo‘sh joy)</option>
            </select>
          </div>
        </div>
      )}

      {q.type === 'order' && (
        <>
          <label>Qadamlarni TO‘G‘RI tartibda yozing (3–{ORDER_MAX} ta) — o‘yinda aralashtirib ko‘rsatiladi</label>
          <div className="list-edit">
            {q.items.map((item, i) => (
              <div key={i} className="list-edit-row">
                <span className="list-num">{i + 1}</span>
                <input value={item} onChange={(e) => setItem(i, e.target.value)} placeholder={`${i + 1}-qadam`} />
                <button className="btn small-btn" onClick={() => moveItem(i, -1)}>
                  ↑
                </button>
                <button className="btn small-btn" onClick={() => moveItem(i, 1)}>
                  ↓
                </button>
                <button
                  className="btn small-btn danger"
                  disabled={q.items.length <= 2}
                  onClick={() => onChange({ items: q.items.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {q.items.length < ORDER_MAX && (
            <button className="btn small-btn" onClick={() => onChange({ items: [...q.items, ''] })}>
              ＋ Qadam qo‘shish
            </button>
          )}
        </>
      )}

      {q.type === 'match' && (
        <>
          <label>Juftliklar: chap ↔ o‘ng (2–{MATCH_MAX} ta) — o‘yinda o‘ng ustun aralashtiriladi</label>
          <div className="list-edit">
            {q.pairs.map((pair, i) => (
              <div key={i} className="list-edit-row">
                <span className="list-num">{i + 1}</span>
                <input value={pair.left} onChange={(e) => setPair(i, 'left', e.target.value)} placeholder="Chap (masalan: Monitor)" />
                <span className="pair-link">🔗</span>
                <input value={pair.right} onChange={(e) => setPair(i, 'right', e.target.value)} placeholder="O‘ng (masalan: Chiqarish)" />
                <button
                  className="btn small-btn danger"
                  disabled={q.pairs.length <= 2}
                  onClick={() => onChange({ pairs: q.pairs.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {q.pairs.length < MATCH_MAX && (
            <button className="btn small-btn" onClick={() => onChange({ pairs: [...q.pairs, { left: '', right: '' }] })}>
              ＋ Juftlik qo‘shish
            </button>
          )}
        </>
      )}

      <label>Izoh / yechim (ixtiyoriy) — javobdan keyin ekranda ko‘rsatiladi</label>
      <textarea value={q.explanation} onChange={(e) => onChange({ explanation: e.target.value })} placeholder="Masalan: 1·8 + 0·4 + 1·2 + 1·1 = 11" />
    </>
  );
}
