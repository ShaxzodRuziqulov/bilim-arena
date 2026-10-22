import { useEffect, useState } from 'react';
import { isDesktop } from './store.js';

// Electron'dagi yangilanish holatini kuzatadi: idle | dev | checking | latest | downloading | ready | error
export function useUpdateStatus() {
  const [state, setState] = useState({ status: isDesktop ? 'idle' : 'web' });

  useEffect(() => {
    if (!isDesktop) return;
    window.api.updateState().then(setState);
    return window.api.onUpdateStatus(setState);
  }, []);

  return state;
}

export const checkUpdate = () => isDesktop && window.api.checkUpdate();
export const installUpdate = () => isDesktop && window.api.installUpdate();
