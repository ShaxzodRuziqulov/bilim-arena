import { useState } from 'react';
import { play } from '../lib/sound.js';

const COLORS = ['#4da3ff', '#ff8f5c', '#3fe0a0', '#c77dff', '#ffd36b'];

// Moslashtirish: avval chapdagi, keyin o'ngdagi elementni bosib juftlik hosil qilinadi.
// Juftlik bir xil rang bilan belgilanadi; qayta bosilsa bekor bo'ladi.
export default function MatchAnswer({ pairs, rightOrder, answered, result, onAnswer }) {
  const [links, setLinks] = useState({}); // chap indeks -> o'ng indeks
  const [active, setActive] = useState(null);

  const shown = answered ? result.links ?? {} : links;
  const leftOf = (right) => Object.keys(shown).find((l) => shown[l] === right);

  const tapLeft = (left) => {
    if (answered) return;
    play('tap');
    if (links[left] !== undefined) {
      const { [left]: _, ...rest } = links;
      setLinks(rest);
    }
    setActive(active === left ? null : left);
  };

  const tapRight = (right) => {
    if (answered) return;
    play('tap');
    const owner = leftOf(right);
    if (active === null) {
      if (owner !== undefined) {
        const { [owner]: _, ...rest } = links;
        setLinks(rest);
      }
      return;
    }
    const next = { ...links };
    if (owner !== undefined) delete next[owner];
    next[active] = right;
    setLinks(next);
    setActive(null);
  };

  const complete = Object.keys(links).length === pairs.length;

  return (
    <div className="seq-answer">
      <div className="match-grid">
        <div className="match-col">
          {pairs.map((p, i) => {
            const linked = shown[i] !== undefined;
            const ok = answered && shown[i] === i;
            return (
              <button
                key={i}
                className={`match-item ${active === i ? 'active' : ''} ${linked ? 'linked' : ''} ${answered ? (ok ? 'ok' : 'bad') : ''}`}
                style={{ '--pair': COLORS[i] }}
                disabled={answered}
                onClick={() => tapLeft(i)}
              >
                <span className="match-dot" />
                <span>
                  {p.left}
                  {answered && !ok && <small className="match-fix">→ {p.right}</small>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {rightOrder.map((r) => {
            const owner = leftOf(r);
            return (
              <button
                key={r}
                className={`match-item right ${owner !== undefined ? 'linked' : ''}`}
                style={{ '--pair': owner !== undefined ? COLORS[owner] : 'transparent' }}
                disabled={answered}
                onClick={() => tapRight(r)}
              >
                <span className="match-dot" />
                <span>{pairs[r].right}</span>
              </button>
            );
          })}
        </div>
      </div>
      {!answered && (
        <div className="seq-side">
          <p className="seq-hint">Avval chapdan, keyin o‘ngdan bosing — juftlik bir xil rangga bo‘yaladi.</p>
          <button
            className="btn primary huge"
            disabled={!complete}
            onClick={() => onAnswer(pairs.every((_, i) => links[i] === i), { links })}
          >
            Javob berish ✓
          </button>
        </div>
      )}
    </div>
  );
}
