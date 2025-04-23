import { addNote } from '../notes.js';
import { renderInputField, renderDropdown, renderSection, showToast } from '../ui.js';

const CATEGORIES = ['Call', 'Action', 'Result', 'Speculation'];
const DIMENSIONS = [
  'Violence Reduction', 'Trauma & Health', 'Trust & Cohesion',
  'Police–Community Partnership', 'Economic Mobility', 'Youth Resilience'
];

export function renderAction() {
  const sec = document.createElement('div');
  sec.appendChild(renderSection('Add Note', [
    renderInputField('n-pid', 'Participant ID', 'number'),
    renderDropdown('n-category', 'Category', CATEGORIES),
    renderDropdown('n-dimension', 'Dimension', DIMENSIONS),
    renderInputField('n-text', 'Note Text', 'textarea')
  ], async () => {
    const note = {
      participantId: +document.getElementById('n-pid').value,
      category: document.getElementById('n-category').value,
      dimension: document.getElementById('n-dimension').value,
      text: document.getElementById('n-text').value,
      timestamp: Date.now()
    };
    await addNote(note);
    showToast('Note saved');
  }));
  return sec;
}
