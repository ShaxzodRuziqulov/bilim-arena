// Jamoa nomlari: bo'sh nom — standart nom bilan; bir xil nomlar (katta-kichik harf farqisiz) avtomatik farqlanadi:
// "A", "A" → "A", "A 2" (X-3: aks holda natijalar va nominatsiyalar jamoalar orasida aralashib ketardi).
export function uniqueTeamNames(names, defaults) {
  const used = new Set();
  return names.map((raw, i) => {
    const base = (raw || '').trim() || defaults[i] || `Jamoa ${i + 1}`;
    let name = base;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base} ${n}`;
    used.add(name.toLowerCase());
    return name;
  });
}
