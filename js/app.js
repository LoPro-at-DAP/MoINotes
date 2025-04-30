import { openDB, deleteDB } from 'https://unpkg.com/idb?module';

let DB_NAME = null;
const DB_VERSION = 1;
const ENTITIES = [
  'ParticipantProfile','StaffOutreachLog','IncidentRecord',
  'CaseNotes','Relationships','ServiceReferrals','EventLog'
];
const enc = new TextEncoder();
const dec = new TextDecoder();
let cryptoKey;
let dbPromise;


function setDbJustCreated(name) {
  localStorage.setItem(moi_created_${name}, 'true');
}
function isDbJustCreated(name) {
  return localStorage.getItem(moi_created_${name}) === 'true';
}
function clearDbJustCreated(name) {
  localStorage.removeItem(moi_created_${name});
}


// Hash the passphrase for comparison with stored key
async function hashPassphrase(passphrase) {
  const salt = enc.encode('moi_program_salt');
  const base = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    base,
    256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

// Derive AES-GCM encryption key
async function deriveCryptoKey(passphrase) {
  const salt = enc.encode('moi_program_salt');
  const base = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Manage DB list and key hashes in localStorage
function getDbList() { return JSON.parse(localStorage.getItem('moi_dbList') || '[]'); }
function saveDbList(list) { localStorage.setItem('moi_dbList', JSON.stringify(list)); }
function getKeyHash(name) { return localStorage.getItem(moi_key_${name}); }
function saveKeyHash(name, hash) { localStorage.setItem(moi_key_${name}, hash); }

// Populate the DB dropdown
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

// Toast message
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// Create Database
document.addEventListener('DOMContentLoaded', () => {
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
      showToast(`Created DB: ${newDb}. Now enter a passphrase to secure it.`);
    }
  };

  //Delete Database
  document.getElementById('db-delete').onclick = async () => {
    const name = document.getElementById('db-select').value;
    if (name && confirm(`Delete database "${name}"? This cannot be undone.`)) {
      await deleteDB(name);
      const list = getDbList().filter(n => n !== name);
      saveDbList(list);
      localStorage.removeItem(`moi_key_${name}`);
      populateDbSelect();
      showToast(`Deleted DB: ${name}`);
    }
  };
});


// Export raw key material for hashing
async function exportKeyHash(key) {
  const raw = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

async function initDb(name) {
  DB_NAME = name;
  document.getElementById('current-db').textContent = name;
  dbPromise = openDB(name, DB_VERSION, {
    upgrade(db) {
      ENTITIES.forEach(n => {
        if (!db.objectStoreNames.contains(n)) {
          db.createObjectStore(n, { keyPath: 'id', autoIncrement: true });
        }
      });
    }
  });
}

async function encryptObject(obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pt = enc.encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, pt);
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(ct)) };
}

async function decryptObject(r) {
  if (!cryptoKey) throw new Error('Encryption key not set');
  const iv = new Uint8Array(r.iv);
  const data = new Uint8Array(r.data);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
  return JSON.parse(dec.decode(pt));
}

async function saveRecord(store, rec) {
  const db = await dbPromise;
  const encRec = await encryptObject(rec);
  return db.put(store, encRec);
}

async function getAllRecords(store) {
  const db = await dbPromise;
  const all = await db.getAll(store);
  const out = [];
  for (const r of all) out.push(await decryptObject(r));
  return out;
}

export async function addNote(pid, text) {
  return saveRecord('CaseNotes', { participantId: pid, text, timestamp: Date.now() });
}
export async function addRelationship(a, b, type) {
  return saveRecord('Relationships', { aId: a, bId: b, type, timestamp: Date.now() });
}

// UI: CARS
const content = document.getElementById('content');
function setActive(tab, renderer) {
  document.querySelectorAll('.app-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-' + tab).classList.add('active');
  content.innerHTML = '';
  content.appendChild(renderer());
}
function renderCall() {
  const sec = document.createElement('div');
  sec.innerHTML = <h2>Call - The Need for Intervention</h2><p>Summarize urgent metrics and dispatch priorities.</p>;
  return sec;
}
function renderAction() {
  const sec = document.createElement('div');
  sec.appendChild(renderSection('Add Note', [
    { id: 'n-pid', label: 'Participant ID', type: 'number' },
    { id: 'n-text', label: 'Note Text', type: 'textarea' }
  ], async () => {
    await addNote(+document.getElementById('n-pid').value, document.getElementById('n-text').value);
    showToast('Note saved');
  }));
  sec.appendChild(renderSection('Add Relationship', [
    { id: 'r-a', label: 'Entity A ID', type: 'number' },
    { id: 'r-b', label: 'Entity B ID', type: 'number' },
    { id: 'r-type', label: 'Type', type: 'text' }
  ], async () => {
    await addRelationship(
      +document.getElementById('r-a').value,
      +document.getElementById('r-b').value,
      document.getElementById('r-type').value
    );
    showToast('Relationship saved');
  }));
  return sec;
}
function renderResults() {
  const sec = document.createElement('div');
  sec.innerHTML = <h2>Results</h2><h3>Notes</h3><div id="notes-list">Loading...</div><h3>Relationships</h3><div id="rels-list">Loading...</div>;
  loadResults(sec);
  return sec;
}
async function loadResults(sec) {
  try {
    const notes = await getAllRecords('CaseNotes');
    const rels = await getAllRecords('Relationships');
    const nl = sec.querySelector('#notes-list');
    const rl = sec.querySelector('#rels-list');
    nl.innerHTML = '';
    notes.forEach(n => {
      const p = document.createElement('p');
      p.textContent = [PID:${n.participantId}] ${n.text};
      nl.appendChild(p);
    });
    rl.innerHTML = '';
    rels.forEach(r => {
      const p = document.createElement('p');
      p.textContent = [${r.aId}↔${r.bId}] ${r.type};
      rl.appendChild(p);
    });
  } catch {
    document.getElementById('pass-error').textContent = 'Decryption failed. Incorrect passphrase or corrupted data.';
    document.getElementById('pass-input').classList.add('error-highlight');
  }
}
function renderSpeculation() {
  const sec = document.createElement('div');
  sec.innerHTML = <h2>Speculation</h2><p>Future projections.</p>;
  return sec;
}
function renderSection(title, fields, onSave) {
  const sec = document.createElement('section');
  sec.className = 'form-section';
  sec.innerHTML = <h2>${title}</h2>;
  fields.forEach(f => {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.innerHTML = <label for="${f.id}">${f.label}</label> +
      (f.type === 'textarea'
        ? <textarea id="${f.id}" rows="3"></textarea>
        : <input id="${f.id}" type="${f.type}"/>);
    sec.appendChild(div);
  });
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Save';
  btn.onclick = onSave;
  sec.appendChild(btn);
  return sec;
}
['call','action','results','speculation'].forEach(tab => {
  document.getElementById('nav-' + tab).onclick = e => {
    e.preventDefault();
    if (!e.target.classList.contains('disabled')) {
      setActive(tab, { call: renderCall, action: renderAction, results: renderResults, speculation: renderSpeculation }[tab]());
    }
  };
});

if (!window.unlockBound) {
  window.unlockBound = true;

  document.getElementById('pass-submit').addEventListener('click', async () => {
    const pass = document.getElementById('pass-input').value;
    const dbName = document.getElementById('db-select').value;
    document.getElementById('pass-error').textContent = '';
    document.getElementById('pass-input').classList.remove('error-highlight');

    try {
      console.log("🔐 Deriving key...");
      const hash = await hashPassphrase(pass);
      const key = await deriveCryptoKey(pass);
      const stored = getKeyHash(dbName);

      if (!stored && isDbJustCreated(dbName)) {
        console.log("🔑 Saving new key for", dbName);
        console.log("Derived hash:", hash);
        saveKeyHash(dbName, hash);
        clearDbJustCreated(dbName);
        showToast('🔐 New passphrase set. Remember this passphrase!');
      } else if (!stored && !isDbJustCreated(dbName)) {
        console.error("❌ Tried to unlock existing DB but no key found.");
        throw new Error('Missing encryption key for existing DB. Cannot unlock.');
      } else if (stored !== hash) {
        console.error("❌ Passphrase does not match stored hash.");
        console.log("Stored:", stored);
        console.log("Derived:", hash);
        throw new Error('bad key');
      }

      cryptoKey = key;
      console.log('✅ Key accepted. Unlocking DB:', dbName);
      await initDb(dbName);
      ['call','action','results','speculation'].forEach(tab =>
        document.getElementById('nav-' + tab).classList.remove('disabled')
      );
      document.getElementById('login-overlay').style.display = 'none';
      setActive('call', renderCall());
    } catch (err) {
        console.error("🔴 UNLOCK ERROR:", err);
        document.getElementById('pass-error').textContent = 'Invalid passphrase or DB.';
        document.getElementById('pass-input').classList.add('error-highlight');
      }
  });
}


populateDbSelect();

// Export database as JSON blob
document.getElementById('nav-results').insertAdjacentHTML('afterend',
  '<button id="backup-export" class="btn small">Export Backup</button><input type="file" id="backup-import" class="btn small" style="display:none;" accept=".json"><label for="backup-import" class="btn small">Import Backup</label>');

document.getElementById('backup-export').onclick = async () => {
  const db = await dbPromise;
  const backup = {};
  for (const store of ENTITIES) {
    backup[store] = await db.getAll(store);
  }
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = DB_NAME + '-backup.json';
  a.click();
};

document.getElementById('backup-import').onchange = async e => {
  if (!cryptoKey) {
    showToast('⚠️ Unlock DB with your passphrase first.', 4000);
    return;
  }
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const data = JSON.parse(text);
  const db = await dbPromise;
  for (const store of ENTITIES) {
    const tx = db.transaction(store, 'readwrite');
    for (const item of data[store]) await tx.store.put(item);
    await tx.done;
  }
  showToast('Backup imported.');
};
