export function getDbList() {
  return JSON.parse(localStorage.getItem('moi_dbList') || '[]');
}

export function saveDbList(list) {
  localStorage.setItem('moi_dbList', JSON.stringify(list));
}

export function getKeyHash(name) {
  return localStorage.getItem(`moi_key_${name}`);
}

export function saveKeyHash(name, hash) {
  localStorage.setItem(`moi_key_${name}`, hash);
}

export function setDbJustCreated(name) {
  localStorage.setItem(`moi_created_${name}`, 'true');
}

export function isDbJustCreated(name) {
  return localStorage.getItem(`moi_created_${name}`) === 'true';
}

export function clearDbJustCreated(name) {
  localStorage.removeItem(`moi_created_${name}`);
}
