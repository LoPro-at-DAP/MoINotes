const enc = new TextEncoder();
const dec = new TextDecoder();

export async function hashPassphrase(pass) {
  const salt = enc.encode('moi_program_salt');
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, base, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function deriveCryptoKey(pass) {
  const salt = enc.encode('moi_program_salt');
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function encryptObject(obj, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pt = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt);
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(ct)) };
}

export async function decryptObject(encObj, key) {
  const iv = new Uint8Array(encObj.iv);
  const data = new Uint8Array(encObj.data);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return JSON.parse(new TextDecoder().decode(pt));
}
