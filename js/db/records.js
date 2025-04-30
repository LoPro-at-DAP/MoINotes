// records.js
import { encryptObject, decryptObject } from './crypto.js';

export async function saveRecord(db, store, rec, cryptoKey) {
  const encRec = await encryptObject(rec, cryptoKey);
  return db.put(store, encRec);
}

export async function getAllRecords(db, store, cryptoKey) {
  const all = await db.getAll(store);
  return Promise.all(all.map(r => decryptObject(r, cryptoKey)));
}

export function addNote(db, cryptoKey, pid, text) {
  return saveRecord(db, 'CaseNotes', { participantId: pid, text, timestamp: Date.now() }, cryptoKey);
}
export function addRelationship(db, cryptoKey, a, b, type) {
  return saveRecord(db, 'Relationships', { aId: a, bId: b, type, timestamp: Date.now() }, cryptoKey);
}
