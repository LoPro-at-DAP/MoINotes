// tabs.js
export function setActive(tab, renderer) {
    document.querySelectorAll('.app-nav a').forEach(a => a.classList.remove('active'));
    document.getElementById('nav-'+tab).classList.add('active');
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(renderer());
  }
  
  // wires up the nav links
  export function wireTabs(renderers) {
    for (const tab of Object.keys(renderers)) {
      document.getElementById('nav-'+tab).onclick = e => {
        e.preventDefault();
        if (!e.target.classList.contains('disabled')) {
          setActive(tab, renderers[tab]);
        }
      };
    }
  }
  