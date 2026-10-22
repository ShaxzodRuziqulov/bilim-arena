import { useState } from 'react';
import { play } from '../lib/sound.js';

// Tartiblash: o'quvchi kartochkalarni to'g'ri ketma-ketlikda bosadi.
// Surib olib borish o'rniga bosish ishlatiladi — sensorli doskada bu ancha ishonchli.
export default function OrderAnswer({ items, order, answered, result, onAnswer }) {
  const [picked, setPicked] = useState([]); // items ichidagi asl indekslar, bosilgan tartibda

  const toggle = (idx) => {
    if (answered) return;
    play('tap');
    setPicked((p) => (p.includes(idx) ? p.filter((x) => x !== idx) : [...p, idx]));
  };

  const shown = answered ? result.picked ?? [] : picked;

  return (
    <div className="seq-answer">
      <div className="order-pool">
        {order.map((idx) => {
          const n = shown.indexOf(idx);
          const state = answered && n >= 0 ? (n === idx ? 'ok' : 'bad') : '';
          return (
            <button key={idx} className={`seq-tile ${n >= 0 ? 'placed' : ''} ${state}`} disabled={answered} onClick={() => toggle(idx)}>
              <span className="seq-num">{n >= 0 ? n + 1 : ''}</span>
              <span className="seq-text">{items[idx]}</span>
            </button>
          );
        })}
      </div>
      <div className="seq-side">
        {answered ? (
          <>
            <b className="seq-title">To‘g‘ri tartib:</b>
            <ol className="order-solution">
              {items.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <p className="seq-hint">Kartochkalarni to‘g‘ri tartibda bosing. Xato bosilganini qayta bosib bekor qilish mumkin.</p>
            <button className="btn primary huge" disabled={picked.length < items.length} onClick={() => onAnswer(picked.every((v, i) => v === i), { picked })}>
              Javob berish ✓
            </button>
          </>
        )}
      </div>
    </div>
  );
}
