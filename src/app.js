import { Tabs } from './components/Tabs.js';
import { TrackerRow } from './components/TrackerRow.js';
import { WaterButton } from './components/WaterButton.js';
import { DebugPanel } from './components/DebugPanel.js';
import { SettingsModal } from './components/SettingsModal.js';
import { Reports } from './components/Reports.js';
import { loadData, saveData, exportData, importData } from './storage.js';

const STORAGE_KEY = 'ear-tracker-data';

// Tracker config
const symptomKeys = [
  { key: 'lf_completeness', label: 'LF Qual' },
  { key: 'lf_noise', label: 'LF Noise' },
  { key: 'hf_noise', label: 'HF Noise' },
  { key: 'vertigo', label: 'Vertigo' }
];
const intakeKeys = [
  { key: 'sodium', label: 'Sodium' },
  { key: 'carbs', label: 'RF Carbs' },
  { key: 'sugar', label: 'Sugar' },
  { key: 'alcohol', label: 'Alc' }
];
const sleepKey = { key: 'sleep', label: 'Sleep Qual' };
const stressKey = { key: 'stress', label: 'Stress Lvl' };

// Helper: get current date string (yyyy-mm-dd) with 5am day start
function getTodayKey(now = new Date()) {
  const d = new Date(now);
  if (d.getHours() < 5) d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Helper: get current tab based on hour
function getCurrentTab(now = new Date()) {
  const h = now.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'midday';
  if (h >= 17 && h < 23) return 'evening';
  return 'night';
}

// App state: all data keyed by date
let allData = loadData() || {};
let selectedDate = getTodayKey();
let currentTab = getCurrentTab();
let settingsOpen = false;
let reportsVisible = false; // Track if reports section is shown

function getDayData(dateKey) {
  if (!allData[dateKey]) {
    allData[dateKey] = {
      trackerState: {
        morning: { symptoms: {}, intake: {} },
        midday: { symptoms: {}, intake: {} },
        evening: { symptoms: {}, intake: {} },
        night: { symptoms: {}, intake: {} }
      },
      waterSum: 0,
      sleep: 0,
      stress: 0
    };
  }
  // Ensure all time-of-day keys and groups exist
  const ts = allData[dateKey].trackerState;
  ['morning', 'midday', 'evening', 'night'].forEach(tod => {
    if (!ts[tod]) ts[tod] = { symptoms: {}, intake: {} };
    if (!ts[tod].symptoms) ts[tod].symptoms = {};
    if (!ts[tod].intake) ts[tod].intake = {};
  });
  if (typeof allData[dateKey].sleep !== 'number') allData[dateKey].sleep = 0;
  if (typeof allData[dateKey].stress !== 'number') allData[dateKey].stress = 0;
  return allData[dateKey];
}

function persist() {
  saveData(allData);
}

function handleExport() {
  const data = exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ear-tracker-data.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (importData(evt.target.result)) {
        allData = loadData() || {};
        selectedDate = getTodayKey();
        currentTab = getCurrentTab();
        settingsOpen = false;
        window.allData = allData;
        render();
      } else {
        alert('Import failed: invalid JSON');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // --- Reports Button ---
  const reportsBtn = document.createElement('button');
  reportsBtn.textContent = reportsVisible ? 'Hide Reports' : 'Show Reports';
  reportsBtn.style.margin = '12px 0 8px 0';
  reportsBtn.style.padding = '8px 16px';
  reportsBtn.style.fontSize = '1rem';
  reportsBtn.onclick = () => {
    reportsVisible = !reportsVisible;
    render();
  };
  app.appendChild(reportsBtn);

  // --- Reports Root Placeholder ---
  if (reportsVisible) {
    const reportsRoot = document.createElement('div');
    reportsRoot.id = 'reports-root';
    reportsRoot.style.margin = '16px 0';
    app.appendChild(reportsRoot);
    Reports(reportsRoot);
  }

  // Top bar for date and water intake
  const topBar = document.createElement('div');
  topBar.style.display = 'flex';
  topBar.style.alignItems = 'center';
  topBar.style.justifyContent = 'space-between';
  // topBar.style.padding = '8px 16px';
  topBar.style.padding = '0px 6px';
  topBar.style.background = '#f5f7fa';
  topBar.style.borderRadius = '12px';
  topBar.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
  topBar.style.marginBottom = '0px';

  // Date switcher
  const dateWrap = document.createElement('div');
  dateWrap.style.display = 'flex';
  dateWrap.style.alignItems = 'center';
  dateWrap.style.gap = '12px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '←';
  prevBtn.style.fontSize = '1.4rem';
  prevBtn.style.padding = '6px 12px';
  prevBtn.onclick = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    selectedDate = d.toISOString().slice(0, 10);
    render();
  };
  dateWrap.appendChild(prevBtn);

  const dateLabel = document.createElement('span');
  dateLabel.textContent = selectedDate;
  dateLabel.style.fontWeight = 'bold';
  dateLabel.style.fontSize = '0.95rem';
  dateWrap.appendChild(dateLabel);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '→';
  nextBtn.style.fontSize = '1.4rem';
  nextBtn.style.padding = '6px 12px';
  nextBtn.onclick = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    selectedDate = d.toISOString().slice(0, 10);
    render();
  };
  dateWrap.appendChild(nextBtn);


  // Water intake controls
  const dayData = getDayData(selectedDate);
  const waterWrap = document.createElement('div');
  waterWrap.style.display = 'flex';
  waterWrap.style.alignItems = 'center';
  waterWrap.style.gap = '6px';
  waterWrap.style.paddingLeft = '6px';

  const waterBtn = WaterButton({
    onAdd: () => {
      dayData.waterSum += 200;
      persist();
      render();
    }
  });
  waterBtn.style.width = '80px';
  waterBtn.style.padding = '8px 0';
  waterWrap.appendChild(waterBtn);

  const waterInput = document.createElement('input');
  waterInput.type = 'number';
  waterInput.min = '0';
  waterInput.step = '50';
  waterInput.value = dayData.waterSum;
  waterInput.style.flex = '0 0 50px';
  waterInput.style.width = '60px';
  waterInput.style.fontSize = '0.9rem';
  waterInput.style.textAlign = 'right';
  waterInput.onfocus = () => waterInput.select();
  waterInput.onchange = (e) => {
    dayData.waterSum = parseInt(e.target.value, 10) || 0;
    persist();
    render();
  };
  waterWrap.appendChild(waterInput);
  const mlLabel = document.createElement('span');
  mlLabel.textContent = 'ml';
  mlLabel.style.fontSize = '0.8rem';
  mlLabel.style.marginLeft = '2px';
  waterWrap.appendChild(mlLabel);

  topBar.appendChild(waterWrap);
  topBar.appendChild(dateWrap);

  // Settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = 'Settings';
  settingsBtn.style.padding = '6px 12px';
  settingsBtn.style.marginLeft = '8px';
  settingsBtn.onclick = () => { settingsOpen = true; render(); };
  topBar.appendChild(settingsBtn);

  app.appendChild(topBar);

  // Visually delimited tab area
  const tabArea = document.createElement('div');
  tabArea.className = 'tracker-tab-area';
  tabArea.style.background = '#f5f7fa';
  tabArea.style.borderRadius = '12px';
  tabArea.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
  tabArea.style.padding = '4px';
  tabArea.style.marginBottom = '16px';

  const tabs = Tabs({
    active: currentTab,
    onChange: (tab) => {
      currentTab = tab;
      render();
    }
  });
  tabArea.appendChild(tabs);

  // --- Symptoms group ---
  const symptomsGroup = document.createElement('div');
  symptomsGroup.className = 'tracker-group';
  const symptomsTitle = document.createElement('div');
  symptomsTitle.className = 'tracker-group-title';
  symptomsTitle.textContent = 'Symptoms';
  symptomsGroup.appendChild(symptomsTitle);
  symptomKeys.forEach(({ key, label }) => {
    const row = TrackerRow({
      label,
      value: dayData.trackerState[currentTab].symptoms[key] || 0,
      onChange: (val) => {
        dayData.trackerState[currentTab].symptoms[key] = val;
        persist();
        render();
      }
    });
    symptomsGroup.appendChild(row);
  });
  tabArea.appendChild(symptomsGroup);

  // --- Intake group ---
  const intakeGroup = document.createElement('div');
  intakeGroup.className = 'tracker-group';
  intakeGroup.style.marginTop = '18px';
  const intakeTitle = document.createElement('div');
  intakeTitle.className = 'tracker-group-title';
  intakeTitle.textContent = 'Intake';
  intakeGroup.appendChild(intakeTitle);
  intakeKeys.forEach(({ key, label }) => {
    const row = TrackerRow({
      label,
      value: dayData.trackerState[currentTab].intake[key] || 0,
      onChange: (val) => {
        dayData.trackerState[currentTab].intake[key] = val;
        persist();
        render();
      }
    });
    intakeGroup.appendChild(row);
  });
  tabArea.appendChild(intakeGroup);

  // --- Other (Sleep & Stress) ---
  const otherGroup = document.createElement('div');
  otherGroup.className = 'tracker-group';
  otherGroup.style.marginTop = '18px';
  const otherTitle = document.createElement('div');
  otherTitle.className = 'tracker-group-title';
  otherTitle.textContent = 'Other';
  otherGroup.appendChild(otherTitle);

  const sleepRow = TrackerRow({
    label: sleepKey.label,
    value: dayData.sleep || 0,
    onChange: (val) => {
      dayData.sleep = val;
      persist();
      render();
    }
  });
  otherGroup.appendChild(sleepRow);

  const stressRow = TrackerRow({
    label: stressKey.label,
    value: dayData.stress || 0,
    onChange: (val) => {
      dayData.stress = val;
      persist();
      render();
    }
  });
  otherGroup.appendChild(stressRow);

  tabArea.appendChild(otherGroup);

  // --- Notes ---
  const noteGroup = document.createElement('div');
  noteGroup.className = 'tracker-group';
  noteGroup.style.marginTop = '18px';
  const noteTitle = document.createElement('div');
  noteTitle.className = 'tracker-group-title';
  noteTitle.textContent = 'Notes';
  noteGroup.appendChild(noteTitle);
  const noteArea = document.createElement('textarea');
  noteArea.rows = 3;
  noteArea.style.width = '100%';
  noteArea.style.fontSize = '0.9rem';
  noteArea.value = dayData.note || '';
  noteArea.oninput = (e) => {
    dayData.note = e.target.value;
    persist();
  };
  noteGroup.appendChild(noteArea);
  tabArea.appendChild(noteGroup);

  app.appendChild(tabArea);

  // Debug panel (always visible, updates live)
  const debug = DebugPanel({ storageKey: STORAGE_KEY, activeTab: currentTab });
  app.appendChild(debug);

  // Settings modal
  const modal = SettingsModal({
    open: settingsOpen,
    onClose: () => { settingsOpen = false; render(); },
    onExport: handleExport,
    onImport: handleImport
  });
  if (modal) app.appendChild(modal);
}

window.onload = () => {
  allData = loadData() || {};
  selectedDate = getTodayKey();
  currentTab = getCurrentTab();
  settingsOpen = false;
  reportsVisible = false;
  window.allData = allData;
  render();
};
