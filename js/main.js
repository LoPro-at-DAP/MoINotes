import { initDb, ENTITIES } from './db.js';
import { hashPassphrase, deriveCryptoKey } from './crypto.js';
import {
  getDbList, saveDbList, getKeyHash, saveKeyHash,
  setDbJustCreated, isDbJustCreated, clearDbJustCreated
} from './storage.js';
import { setCryptoKey } from './notes.js';
import { showToast, setActiveTab } from './ui.js';
import { renderCall } from './views/call.js';
import { renderAction } from './views/action.js';
import { renderResults } from './views/results.js';
import { renderSpeculation } from './views/speculation.js';

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
  populateDbSelect();

  document.getElementById('db-create').onclick = async () => {
    const newDb = document.getElementById('db-new').value.trim();
    if (newDb && !getDbList().includes(newDb)) {
      const list = getDbList();
      list.push(newDb);
      saveDbList(list);
      populateDbSelect();
      document.getElementById('db-select').value = newDb;
      document.getElementById('pass-input').value = '';
      document.getElementById('pass-input').focus();
      setDbJustCreated(newDb);
      showToast(`Created DB: \${newDb}. Now enter a passphrase to secure it.`);
    }
  };

  document.getElementById('db-delete').onclick = async () => {
    const name = document.getElementById('db-select').value;
    if (name && confirm(`Delete database "\${name}"? This cannot be undone.`)) {
      indexedDB.deleteDatabase(name);
      const list = getDbList().filter(n => n !== name);
      saveDbList(list);
      localStorage.removeItem(`moi_key_\${name}`);
      populateDbSelect();
      showToast(`Deleted DB: \${name}`);
    }
  };

  if (!window.unlockBound) {
    window.unlockBound = true;
    document.getElementById('pass-submit').addEventListener('click', async () => {
      const pass = document.getElementById('pass-input').value;
      const dbName = document.getElementById('db-select').value;
      document.getElementById('pass-error').textContent = '';
      document.getElementById('pass-input').classList.remove('error-highlight');

      try {
        const hash = await hashPassphrase(pass);
        const key = await deriveCryptoKey(pass);
        const stored = getKeyHash(dbName);

        if (!stored && isDbJustCreated(dbName)) {
          saveKeyHash(dbName, hash);
          clearDbJustCreated(dbName);
        } else if (stored !== hash) {
          throw new Error('bad key');
        }

        setCryptoKey(key);
        await initDb(dbName);
        ['call','action','results','speculation'].forEach(tab =>
          document.getElementById('nav-' + tab).classList.remove('disabled')
        );
        document.getElementById('login-overlay').style.display = 'none';
        setActiveTab('call', renderCall());
      } catch (err) {
        console.error("🔴 UNLOCK ERROR:", err);
        document.getElementById('pass-error').textContent = 'Invalid passphrase or DB.';
        document.getElementById('pass-input').classList.add('error-highlight');
      }
    });
  }

  const views = {
    call: renderCall,
    action: renderAction,
    results: renderResults,
    speculation: renderSpeculation
  };

  Object.entries(views).forEach(([tab, renderer]) => {
    document.getElementById('nav-' + tab).onclick = e => {
      e.preventDefault();
      if (!e.target.classList.contains('disabled')) {
        setActiveTab(tab, renderer());
      }
    };
  });
});
