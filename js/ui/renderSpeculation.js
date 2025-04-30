// renderSpeculation.js
export function renderSpeculation() {
    const sec = document.createElement('div');
  sec.innerHTML = `
    <h2>Speculation</h2>
    <p>Future projections.</p>
  `;
  return sec;
}