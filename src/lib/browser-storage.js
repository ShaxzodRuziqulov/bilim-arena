import { validateData } from '../../shared/data-schema.mjs';
export const DATA_KEY='bilim-arena-data';
export const BACKUP_KEY=DATA_KEY+'-backup';
export function browserStorage(storage) {
  const read=key=>{ const text=storage.getItem(key); if (text === null) throw new Error('Ma’lumot yo‘q'); return validateData(JSON.parse(text)); };
  return {
    async load() {
      const primary=storage.getItem(DATA_KEY), backup=storage.getItem(BACKUP_KEY);
      if (primary === null && backup === null) return {data:null,recovered:false};
      try { return {data:read(DATA_KEY),recovered:false}; } catch {
        try { return {data:read(BACKUP_KEY),recovered:true}; } catch { throw new Error('Asosiy ma’lumot va zaxira buzilgan. Saqlangan fayldan tiklang. Eski ma’lumotlar o‘chirilmadi.'); }
      }
    },
    async save(data) {
      const json=JSON.stringify(validateData(data));
      let previous=null; try { previous=read(DATA_KEY); } catch {}
      if (previous) storage.setItem(BACKUP_KEY,JSON.stringify(previous));
      else if (storage.getItem(BACKUP_KEY) === null) storage.setItem(BACKUP_KEY,json);
      storage.setItem(DATA_KEY,json);
    },
  };
}
