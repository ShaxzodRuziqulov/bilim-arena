// PIN ochiq holda saqlanmaydi, faqat uning xeshi saqlanadi.
export async function hashPin(pin) {
  const bytes = new TextEncoder().encode('bilim-arena:' + pin);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
