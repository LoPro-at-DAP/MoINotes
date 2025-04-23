import { getDecryptedNotes, exportNotesToCSV } from '../notes.js';

export function renderResults() {
  const sec = document.createElement('div');
  sec.innerHTML = `<h2>Results</h2>
    <button id="export-notes" class="btn small">Export CSV</button>
    <div id="grouped-notes">Loading...</div>`;
  loadGroupedNotes(sec.querySelector('#grouped-notes'));

  sec.querySelector('#export-notes').onclick = async () => {
    const notes = await getDecryptedNotes();
    exportNotesToCSV(notes);
  };

  return sec;
}

async function loadGroupedNotes(container) {
  const grouped = {};
  const notes = await getDecryptedNotes();
  notes.forEach(note => {
    if (!grouped[note.dimension]) grouped[note.dimension] = [];
    grouped[note.dimension].push(note);
  });

  container.innerHTML = '';
  Object.entries(grouped).forEach(([dimension, notes]) => {
    const block = document.createElement('div');
    block.innerHTML = `<h3>\${dimension}</h3>`;
    notes.forEach(n => {
      const p = document.createElement('p');
      p.textContent = `[\${n.category}] \${n.text}`;
      block.appendChild(p);
    });
    container.appendChild(block);
  });
}
