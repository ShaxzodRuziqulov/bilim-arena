import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import css from './kodbuzar.css?inline';
import KodbuzarApp from './KodbuzarApp.jsx';

// Kodbuzar Shadow DOM ichida, o'z React ildizi bilan ishlaydi: platformaning global stillari (.btn, .key,
// .home, .overlay va h.k.) unga yetib bormaydi, uning stillari ham platformaga chiqmaydi.
export default function KodbuzarHost({ onExit }) {
  const host = useRef(null);
  const exitRef = useRef(onExit);
  exitRef.current = onExit;

  useEffect(() => {
    const shadow = host.current.shadowRoot || host.current.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    const mount = document.createElement('div');
    shadow.replaceChildren(style, mount);
    const root = createRoot(mount);
    root.render(<KodbuzarApp onExit={() => exitRef.current?.()} />);
    // React render paytida boshqa ildizni sinxron o'chirishga ruxsat bermaydi — keyingi navbatda o'chiramiz.
    return () => setTimeout(() => root.unmount());
  }, []);

  return <div ref={host} className="kb-host" />;
}
