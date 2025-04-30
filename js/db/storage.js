// storage.js
import { openDB, deleteDB } from 'https://unpkg.com/idb?module';

export function getDbList() {
  return JSON.parse(localStorage.getItem('moi_dbList') || '[]');
}
export function saveDbList(list) {
  localStorage.setItem('moi_dbList', JSON.stringify(list));
}

export function getKeyHash(name) {
  return localStorage.getItem(`moi_key_${name}`);
}
export function saveKeyHash(name, hash) {
  localStorage.setItem(`moi_key_${name}`, hash);
}

export async function initDb(name, entities) {
  const db = await openDB(name, 1, {
    upgrade(db) {
      for (const storeName of entities) {
        if (!db.objectStoreNames.contains(storeName))
          db.createObjectStore(storeName, { keyPath:'id', autoIncrement:true });
      }
    }
  });
  return db;
}

export { deleteDB };
