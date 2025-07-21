// Minimal localStorage abstraction for app data
const STORAGE_KEY = 'ear-tracker-data';

export function loadData() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData() {
  return localStorage.getItem(STORAGE_KEY) || '{}';
}

export function importData(json) {
  try {
    const data = JSON.parse(json);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}
