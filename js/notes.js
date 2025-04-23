import { putRecord, getAllRecords } from './db.js';
import { encryptObject, decryptObject } from './crypto.js';

let cryptoKey = null;

export function setCryptoKey(key) {
  cryptoKey = key;
}

export async function addNote(note) {
  const encrypted = await encryptObject(note, cryptoKey);
  return putRecord('CaseNotes', encrypted);
}

export async function getDecryptedNotes() {
  const records = await getAllRecords('CaseNotes');
  const decrypted = [];
  for (const r of records) {
    try {
      decrypted.push(await decryptObject(r, cryptoKey));
    } catch (e) {
      console.warn("Decryption failed for a note:", e);
    }
  }
  return decrypted;
}

export function exportNotesToCSV(notes) {
  const headers = ['participantId', 'category', 'dimension', 'text', 'timestamp'];
  const rows = notes.map(n => headers.map(h => JSON.stringify(n[h] ?? '')).join(','));
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'MoI_CaseNotes_Export.csv';
  a.click();
}
