import { useState } from 'react';
import { hashPin } from '../lib/pin.js';
import { play } from '../lib/sound.js';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
const MIN = 4;
const MAX = 6;

// mode="verify" — mavjud PINni tekshiradi; mode="set" — yangi PINni ikki marta so'raydi.
export default function PinModal({ title, mode = 'verify', pinHash, onSuccess, onCancel, note }) {
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const fail = (message) => {
    setError(message);
    setPin('');
    setShake(true);
    play('wrong');
    setTimeout(() => setShake(false), 400);
  };

  const press = (key) => {
    play('tap');
    setError('');
    if (key === 'C') setPin('');
    else if (key === '⌫') setPin((p) => p.slice(0, -1));
    else setPin((p) => (p.length < MAX ? p + key : p));
  };

  const submit = async () => {
    if (pin.length < MIN) return fail(`PIN kamida ${MIN} ta raqam bo‘lishi kerak`);
    if (mode === 'verify') {
      if ((await hashPin(pin)) === pinHash) onSuccess();
      else fail('PIN noto‘g‘ri');
      return;
    }
    if (first === null) {
      setFirst(pin);
      setPin('');
      return;
    }
    if (pin !== first) {
      setFirst(null);
      return fail('PINlar mos kelmadi, qaytadan kiriting');
    }
    onSuccess(await hashPin(pin));
  };

  const hint =
    mode === 'set' ? (first === null ? 'Yangi PIN kiriting (4–6 raqam)' : 'PINni yana bir marta kiriting') : 'PIN kodni kiriting';

  return (
    <div className="overlay pin-overlay">
      <div className={`pin-card ${shake ? 'shake' : ''}`}>
        <div className="pin-lock">🔒</div>
        <h2>{title}</h2>
        {note && <p className="note">{note}</p>}
        <p className="muted">{hint}</p>
        <div className="pin-dots">
          {Array.from({ length: MAX }, (_, i) => (
            <span key={i} className={i < pin.length ? 'on' : ''} />
          ))}
        </div>
        <div className="pin-error">{error}</div>
        <div className="pin-grid">
          {KEYS.map((key) => (
            <button key={key} className="pin-key" onClick={() => press(key)}>
              {key}
            </button>
          ))}
        </div>
        <div className="row-buttons">
          {onCancel && (
            <button className="btn" onClick={onCancel}>
              Bekor qilish
            </button>
          )}
          <button className="btn primary" onClick={submit}>
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}
