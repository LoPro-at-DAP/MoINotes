import { openDB } from 'https://unpkg.com/idb?module';

let dbPromise;
export let DB_NAME = null;

export const ENTITIES = ['CaseNotes', 'Relationships'];
export const DB_VERSION = 1;

export async function initDb(name) {
  DB_NAME = name;
  dbPromise = openDB(name, DB_VERSION, {
    upgrade(db) {
      ENTITIES.forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
        }
      });
    }
  });
  return dbPromise;
}

export async function getAllRecords(store) {
  const db = await dbPromise;
  return db.getAll(store);
}

export async function putRecord(store, record) {
  const db = await dbPromise;
  return db.put(store, record);
}
