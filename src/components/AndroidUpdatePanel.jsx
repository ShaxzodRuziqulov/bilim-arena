import { useEffect, useRef, useState } from 'react';
import { registerPlugin } from '@capacitor/core';
import { flushData } from '../lib/store.js';

const updates = registerPlugin('BilimUpdate');

const messages = {
  idle: 'GitHub’dagi rasmiy Android relizini tekshirish va o‘rnatish.',
  checking: 'Yangilanish tekshirilmoqda…',
  latest: 'Sizda eng so‘nggi versiya.',
  downloading: 'Yangi versiya yuklanmoqda va imzosi tekshirilmoqda…',
  permission: 'Android sozlamasida Bilim Arena uchun o‘rnatishga ruxsat bering. Qaytgach, «Yangilash»ni yana bosing.',
  installer: 'Android oynasida yangilashni tasdiqlang.',
};

export default function AndroidUpdatePanel() {
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const mounted = useRef(false);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    updates.info().then((value) => {
      if (active) setInfo(value);
    }).catch(() => {
      if (active) setError('Yangilanish xizmatini ochib bo‘lmadi.');
    });
    return () => { active = false; mounted.current = false; };
  }, []);

  const update = async () => {
    setError('');
    setStatus('checking');
    try {
      const { available } = await updates.check();
      if (!mounted.current) return;
      if (!available) {
        setStatus('latest');
        return;
      }
      setStatus('downloading');
      const prepared = await updates.prepare({ version: available });
      if (!mounted.current) return;
      if (prepared.status === 'permission') {
        setStatus('permission');
        return;
      }
      if (!await flushData()) throw new Error('Joriy ma’lumotlarni saqlab bo‘lmadi. Qayta saqlab ko‘ring.');
      if (!mounted.current) return;
      const result = await updates.install({ version: available });
      setStatus(result.status);
    } catch (failure) {
      if (!mounted.current) return;
      setStatus('idle');
      setError(failure?.message || 'Yangilab bo‘lmadi. Qayta urinib ko‘ring.');
    }
  };

  return (
    <div className="update-box">
      <p className="note">Joriy versiya <b>{info?.version || '—'}</b></p>
      <p className="note" role="status">
        {error || (info
          ? info.enabled ? messages[status] : 'Ushbu nusxa Google Play orqali yangilanadi.'
          : 'Versiya aniqlanmoqda…')}
      </p>
      {info?.enabled && (
        <button className="btn primary" onClick={update} disabled={status === 'checking' || status === 'downloading'}>
          ↓ Yangilash
        </button>
      )}
    </div>
  );
}
