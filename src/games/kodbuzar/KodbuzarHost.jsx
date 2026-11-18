import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import css from './kodbuzar.css?inline';
import KodbuzarApp from './KodbuzarApp.jsx';

// Kodbuzar Shadow DOM ichida, o'z React ildizi bilan ishlaydi: platformaning global stillari (.btn, .key,
// .home, .overlay va h.k.) unga yetib bormaydi, uning stillari ham platformaga chiqmaydi.
export default function KodbuzarHost({ onExit, soundOn = true }) {
  const host = useRef(null);
  const root = useRef(null);
  const exitRef = useRef(onExit);
  exitRef.current = onExit;
  const exit = () => exitRef.current?.();

  useEffect(() => {
    const shadow = host.current.shadowRoot || host.current.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    const mount = document.createElement('div');
    shadow.replaceChildren(style, mount);
    const r = createRoot(mount);
    root.current = r;
    // React render paytida boshqa ildizni sinxron o'chirishga ruxsat bermaydi — keyingi navbatda o'chiramiz.
    return () => {
      if (root.current === r) root.current = null;
      setTimeout(() => r.unmount());
    };
  }, []);

  // Props o'zgarsa (masalan, umumiy ovoz) — ichki ildiz qayta chiziladi, o'yin holati saqlanadi.
  useEffect(() => {
    root.current?.render(<KodbuzarApp onExit={exit} soundOn={soundOn} />);
  });

  return <div ref={host} className="kb-host" />;
}
