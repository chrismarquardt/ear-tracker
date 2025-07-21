import { Tabs } from './components/Tabs.js';
import { TrackerRow } from './components/TrackerRow.js';
import { WaterButton } from './components/WaterButton.js';
import { DebugPanel } from './components/DebugPanel.js';
import { SettingsModal } from './components/SettingsModal.js';
import { loadData, saveData, exportData, importData } from './storage.js';

const STORAGE_KEY = 'ear-tracker-data';

// Tracker config
const symptomKeys = [
  { key: 'lf_loss', label: 'Low-freq loss' },
  { key: 'lf_noise', label: 'Low-freq noise' },
  { key: 'hf_noise', label: 'High-freq noise' }
];
const intakeKeys = [
  { key: 'sodium', label: 'Sodium' },
  { key: 'carbs', label: 'Refined carbs' },
  { key: 'sugar', label: 'Sugar' },
  { key: 'alcohol', label: 'Alcohol' }
];
const sleepKey = { key: 'sleep', label: 'Sleep' };
const stressKey = { key: 'stress', label: 'Stress' };

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

  // Cogwheel button (top right)
  const cog = document.createElement('button');
  cog.innerHTML = '⚙️';
  cog.title = 'Settings';
  cog.style.position = 'absolute';
  cog.style.top = '12px';
  cog.style.right = '16px';
  cog.style.background = 'none';
  cog.style.border = 'none';
  cog.style.fontSize = '1.6rem';
  cog.style.cursor = 'pointer';
  cog.onclick = () => {
    settingsOpen = true;
    render();
  };
  app.appendChild(cog);

  // Date switcher UI
  const dateWrap = document.createElement('div');
  dateWrap.style.display = 'flex';
  dateWrap.style.alignItems = 'center';
  dateWrap.style.justifyContent = 'center';
  dateWrap.style.gap = '12px';
  dateWrap.style.margin = '8px 0 16px 0';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '←';
  prevBtn.style.fontSize = '1.2rem';
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
  dateLabel.style.fontSize = '1.1rem';
  dateWrap.appendChild(dateLabel);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '→';
  nextBtn.style.fontSize = '1.2rem';
  nextBtn.onclick = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    selectedDate = d.toISOString().slice(0, 10);
    render();
  };
  dateWrap.appendChild(nextBtn);

  app.appendChild(dateWrap);

  // Water intake controls (per day)
  const dayData = getDayData(selectedDate);
  const waterWrap = document.createElement('div');
  waterWrap.style.display = 'flex';
  waterWrap.style.alignItems = 'center';
  waterWrap.style.gap = '8px';
  waterWrap.style.margin = '12px 0 20px 0';

  const waterInput = document.createElement('input');
  waterInput.type = 'number';
  waterInput.min = '0';
  waterInput.step = '50';
  waterInput.value = dayData.waterSum;
  waterInput.style.width = '80px';
  waterInput.style.fontSize = '1.1rem';
  waterInput.style.textAlign = 'right';
  waterInput.onchange = (e) => {
    dayData.waterSum = parseInt(e.target.value, 10) || 0;
    persist();
    render();
  };
  waterWrap.appendChild(waterInput);
  const mlLabel = document.createElement('span');
  mlLabel.textContent = 'ml';
  mlLabel.style.marginLeft = '4px';
  waterWrap.appendChild(mlLabel);
  const waterBtn = WaterButton({
    onAdd: () => {
      dayData.waterSum += 200;
      persist();
      render();
    }
  });
  waterWrap.appendChild(waterBtn);
  app.appendChild(waterWrap);

  // Visually delimited tab area
  const tabArea = document.createElement('div');
  tabArea.className = 'tracker-tab-area';
  tabArea.style.background = '#f5f7fa';
  tabArea.style.borderRadius = '12px';
  tabArea.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
  tabArea.style.padding = '16px';
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

  // --- Sleep quality ---
  const sleepGroup = document.createElement('div');
  sleepGroup.className = 'tracker-group';
  sleepGroup.style.marginTop = '18px';
  const sleepTitle = document.createElement('div');
  sleepTitle.className = 'tracker-group-title';
  sleepTitle.textContent = 'Sleep Quality';
  sleepGroup.appendChild(sleepTitle);
  const sleepRow = TrackerRow({
    label: sleepKey.label,
    value: dayData.sleep || 0,
    onChange: (val) => {
      dayData.sleep = val;
      persist();
      render();
    }
  });
  sleepGroup.appendChild(sleepRow);
  tabArea.appendChild(sleepGroup);

  // --- Stress level ---
  const stressGroup = document.createElement('div');
  stressGroup.className = 'tracker-group';
  stressGroup.style.marginTop = '18px';
  const stressTitle = document.createElement('div');
  stressTitle.className = 'tracker-group-title';
  stressTitle.textContent = 'Stress Level';
  stressGroup.appendChild(stressTitle);
  const stressRow = TrackerRow({
    label: stressKey.label,
    value: dayData.stress || 0,
    onChange: (val) => {
      dayData.stress = val;
      persist();
      render();
    }
  });
  stressGroup.appendChild(stressRow);
  tabArea.appendChild(stressGroup);

  app.appendChild(tabArea);

  const info = document.createElement('div');
  info.style.textAlign = 'center';
  info.style.marginTop = '24px';
  info.textContent = `Active tab: ${currentTab}`;
  app.appendChild(info);

  // Debug panel (always visible, updates live)
  const debug = DebugPanel({ storageKey: STORAGE_KEY });
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
  render();
};
