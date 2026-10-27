import { useEffect, useRef, useState } from 'react';

const ROBOT_SVG = (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <path d="M20 1.5 26 8H14Z" fill="var(--robot)" />
    <rect x="6" y="9" width="28" height="25" rx="8" fill="var(--robot)" />
    <rect x="11.5" y="14" width="17" height="8" rx="4" fill="var(--robot-face)" />
    <circle cx="20" cy="18" r="2.6" fill="var(--robot)" />
    <rect x="14" y="26" width="12" height="3" rx="1.5" fill="var(--robot-face)" opacity=".55" />
  </svg>
);

// Katakli maydon. Katak o'lchami konteynerga qarab avtomatik tanlanadi (doskada katta, noutbukda kichik).
// instant — robot boshiga qaytganda aylanib-uchib bormasligi uchun animatsiyasiz joylashtiriladi.
export default function RobotBoard({ map, snap, bump, win, speed, instant }) {
  const wrapRef = useRef(null);
  const [t, setT] = useState(48);

  useEffect(() => {
    const el = wrapRef.current;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setT(Math.max(22, Math.min(120, Math.floor(Math.min((width - 8) / map.cols, (height - 8) / map.rows)))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [map.cols, map.rows]);

  const trail = new Set(snap.trail);

  return (
    <div className="rb-wrap" ref={wrapRef}>
      <div className="rb-board" style={{ '--t': `${t}px`, '--spd': `${speed * 0.85}ms`, gridTemplateColumns: `repeat(${map.cols}, ${t}px)` }}>
        {map.cells.flatMap((row, y) =>
          row.map((floor, x) => (
            <div key={`${x},${y}`} className={`rb-tile ${floor ? '' : 'void'}`}>
              <i>{floor && trail.has(`${x},${y}`) && <b className="rb-trail" />}</i>
            </div>
          )),
        )}
        {map.bats.map(([x, y], i) => (
          <div key={i} className={`rb-bat ${snap.got[i] ? 'got' : ''}`} style={{ left: (x + 0.5) * t, top: (y + 0.52) * t }} />
        ))}
        <div className={`rb-robot ${instant ? 'instant' : ''}`} style={{ transform: `translate(${snap.x * t}px, ${snap.y * t}px) rotate(${snap.rot}deg)` }}>
          <div key={`${bump}-${win}`} className={`in ${bump ? 'bump' : ''} ${win ? 'win' : ''}`}>
            {ROBOT_SVG}
          </div>
        </div>
      </div>
    </div>
  );
}
