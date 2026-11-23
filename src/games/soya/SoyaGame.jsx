import { useEffect, useRef, useState } from 'react';
import './soya.css';
import { useLandscape } from '../../lib/platform.js';

/** Soya platforma ichida: Phaser o'yini butun oynani egallaydi, chap yuqorida zalga qaytish tugmasi turadi. */
export default function SoyaGame({ onExit, soundOn = true }) {
  // Android ilovasida ekran o'zi yon tomonga o'tadi.
  useLandscape();
  const host = useRef(null);
  const [state, setState] = useState('loading');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let stop = null;
    let cancelled = false;
    import('./start.js')
      .then(({ startSoya }) => startSoya(host.current, { isCancelled: () => cancelled, onPlaying: setPlaying, soundOn }))
      .then((stopFn) => {
        if (cancelled) stopFn();
        else {
          stop = stopFn;
          setState('ready');
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return (
    <div className="soya-host">
      <div ref={host} className="soya-canvas" />
      {/* Zalga qaytish faqat Soyaning bosh menyusida: boshqa ekranlarda chap yuqorida Soyaning o'z tugmasi turadi. */}
      {!playing && <button className="soya-exit" onClick={onExit} aria-label="O‘yinlar zaliga qaytish" title="O‘yinlar zali">←</button>}
      {state === 'loading' && <p className="soya-status">Soya yuklanmoqda…</p>}
      {state === 'error' && (
        <div className="soya-status" role="alert">
          <p>O‘yinni ochib bo‘lmadi.</p>
          <button className="btn" onClick={onExit}>Zalga qaytish</button>
        </div>
      )}
      <div className="soya-rotate">
        <div className="phone" aria-hidden="true" />
        <p role="status">Telefonni yon tomonga burang</p>
        <button className="btn" onClick={onExit}>← O‘yinlar zaliga qaytish</button>
      </div>
    </div>
  );
}
