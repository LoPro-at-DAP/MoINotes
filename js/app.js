// app.js
import {
  hashPassphrase, deriveCryptoKey
} from './db/crypto.js';

import {
  getDbList, saveDbList,
  getKeyHash, saveKeyHash,
  initDb, deleteDB
} from './db/storage.js';

import {
  saveRecord, getAllRecords,
  addNote, addRelationship
} from './db/records.js';

import { setActive, wireTabs } from './ui/tabs.js';
import { renderCall } from './ui/renderCall.js';
import { renderAction } from './ui/renderAction.js';
import { renderResults } from './ui/renderResults.js';
import { renderSpeculation } from './ui/renderSpeculation.js';

const ENTITIES = [/* same as before */];
let cryptoKey, db;

// wire up your nav once unlocked
const tabRenderers = { call:renderCall, action:renderAction, results:renderResults, speculation:renderSpeculation };
wireTabs(tabRenderers);

// then your DOMContentLoaded / unlock logic...
// — populateDbSelect, create/delete DB, hashPassphrase, deriveCryptoKey, initDb(name,ENTITIES),
//    then after unlock do: setActive('call', renderCall);
