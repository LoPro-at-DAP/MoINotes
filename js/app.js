// app.js
// Entry point that imports and wires together all modules

import { hashPassphrase, deriveCryptoKey } from './db/crypto.js';
import {
  getDbList,
  saveDbList,
  getKeyHash,
  saveKeyHash,
  initDb,
  deleteDB
} from './db/storage.js';
import { addNote, addRelationship, saveRecord, getAllRecords } from './db/records.js';
import { setActive, wireTabs } from './ui/tabs.js';
import { renderCall } from './ui/renderCall.js';
import { renderAction } from './ui/renderAction.js';
import { renderResults } from './ui/renderResults.js';
import { renderSpeculation } from './ui/renderSpeculation.js';

// helpers for the “just created” DB flag
import {
  setDbJustCreated,
  isDbJustCreated,
  clearDbJustCreated
} from './db/keyHelpers.js';

let cryptoKey;
let dbPromise;

/** Show a brief toast message */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/** Rebuilds the <select id="db-select"> from localStorage */
function populateDbSelect() {
  const select = document.getElementById('db-select');
  select.innerHTML = '';
  getDbList().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // 1) Show any existing DBs
  populateDbSelect();

  // 2) Create new DB button
  document.getElementById('db-create').onclick = async () => {
    const newDb = document.getElementById('db-new').value.trim();
    if (newDb && !getDbList().includes(newDb)) {
      const list = getDbList();
      list.push(newDb);
      saveDbList(list);
      populateDbSelect();
      setDbJustCreated(newDb);
      showToast(`Created DB: ${newDb}. Now enter a passphrase to secure it.`);
    }
  };

  // 3) Delete selected DB button
  document.getElementById('db-delete').onclick = async () => {
    const name = document.getElementById('db-select').value;
    if (name && confirm(`Delete database "${name}"? This cannot be undone.`)) {
      await deleteDB(name);
      const remaining = getDbList().filter(n => n !== name);
      saveDbList(remaining);
      populateDbSelect();
      showToast(`Deleted DB: ${name}`);
    }
  };

  // 4) Wire up your CARS tabs
  wireTabs({
    call: renderCall,
    action: renderAction,
    results: renderResults,
    speculation: renderSpeculation
  });

  // 5) Unlock / Init DB via passphrase
  document.getElementById('pass-submit').onclick = async () => {
    const dbName = document.getElementById('db-select').value;
    const pass   = document.getElementById('pass-input').value;
    document.getElementById('pass-error').textContent = '';
    try {
      // derive and compare hashes
      const hash  = await hashPassphrase(pass);
      const key   = await deriveCryptoKey(pass);
      const stored = getKeyHash(dbName);

      if (!stored && isDbJustCreated(dbName)) {
        // first-time: save the hash
        saveKeyHash(dbName, hash);
        clearDbJustCreated(dbName);
        showToast('🔐 New passphrase set. Don’t forget it!');
      } else if (stored !== hash) {
        throw new Error('bad key');
      }

      // key is valid
      cryptoKey  = key;
      dbPromise  = await initDb(dbName);

      // enable nav and hide overlay
      ['call','action','results','speculation'].forEach(tab =>
        document.getElementById(`nav-${tab}`).classList.remove('disabled')
      );
      document.getElementById('login-overlay').style.display = 'none';

      // show the first tab
      setActive('call', renderCall);

    } catch {
      document.getElementById('pass-error').textContent = 'Invalid passphrase or DB.';
    }
  };
});

// (Optional) expose for debugging
window._moi = { addNote, addRelationship, getAllRecords, saveRecord };
