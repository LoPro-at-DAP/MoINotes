// renderResults.js
export function renderResults() {
    const sec = document.createElement('div');
  sec.innerHTML = `
    <h2>Results</h2>
    <h3>Notes</h3>
    <div id="notes-list">Loading...</div>
    <h3>Relationships</h3>
    <div id="rels-list">Loading...</div>
  `;
  loadResults(sec);
  return sec;
}