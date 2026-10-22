import { useEffect, useState } from 'react';

// Birinchi bosishda "Rostdanmi?" so'raydi, ikkinchisida bajaradi.
export default function ConfirmButton({ children, onConfirm, className = 'btn danger', ask = 'Rostdanmi? ✓' }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      className={className + (armed ? ' armed' : '')}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? ask : children}
    </button>
  );
}
