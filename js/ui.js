export function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

export function renderDropdown(id, label, options) {
  const div = document.createElement('div');
  div.className = 'form-field';
  div.innerHTML = `<label for="\${id}">\${label}</label>
    <select id="\${id}">
      \${options.map(opt => `<option value="\${opt}">\${opt}</option>`).join('')}
    </select>`;
  return div;
}

export function renderInputField(id, label, type = 'text') {
  const div = document.createElement('div');
  div.className = 'form-field';
  div.innerHTML = `<label for="\${id}">\${label}</label>
    \${type === 'textarea' ? `<textarea id="\${id}" rows="3"></textarea>` : `<input id="\${id}" type="\${type}" />`}`;
  return div;
}

export function renderSection(title, fields, onSave) {
  const sec = document.createElement('section');
  sec.className = 'form-section';
  sec.innerHTML = `<h2>\${title}</h2>`;
  fields.forEach(f => sec.appendChild(f));
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Save';
  btn.onclick = onSave;
  sec.appendChild(btn);
  return sec;
}

export function setActiveTab(tab, renderer) {
  document.querySelectorAll('.app-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-' + tab).classList.add('active');
  const content = document.getElementById('content');
  content.innerHTML = '';
  content.appendChild(renderer());
}
