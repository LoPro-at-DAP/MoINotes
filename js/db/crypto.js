// crypto.js
const enc = new TextEncoder();
const dec = new TextDecoder();

export async function hashPassphrase(passphrase) {
  const salt = enc.encode('moi_program_salt');
  const base = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name:'PBKDF2', salt, iterations:150000, hash:'SHA-256' },
    base,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function deriveCryptoKey(passphrase) {
  const salt = enc.encode('moi_program_salt');
  const base = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:150000, hash:'SHA-256' },
    base,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  );
}

export async function encryptObject(obj, cryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pt = enc.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, cryptoKey, pt);
  return { iv:Array.from(iv), data:Array.from(new Uint8Array(ct)) };
}

export async function decryptObject(record, cryptoKey) {
  const iv = new Uint8Array(record.iv);
  const data = new Uint8Array(record.data);
  const pt = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, cryptoKey, data);
  return JSON.parse(dec.decode(pt));
}
