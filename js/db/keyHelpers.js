export function setDbJustCreated(name) {
    localStorage.setItem(`moi_created_${name}`, 'true');
  }
  export function isDbJustCreated(name) {
    return localStorage.getItem(`moi_created_${name}`) === 'true';
  }
  export function clearDbJustCreated(name) {
    localStorage.removeItem(`moi_created_${name}`);
  }
  