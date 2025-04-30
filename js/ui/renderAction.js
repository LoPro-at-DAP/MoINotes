// renderAction.js
export function renderAction() {
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