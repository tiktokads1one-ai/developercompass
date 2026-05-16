const KEY = 'oss_recently_viewed';
const MAX = 10;

export function addRecentlyViewed(project) {
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || '[]');
    const filtered = existing.filter(p => p.name !== project.name);
    const updated = [{ name: project.name, description: project.description }, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}