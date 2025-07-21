import { Tabs } from './components/Tabs.js';
import { TrackerRow } from './components/TrackerRow.js';

let currentTab = 'morning';
const trackerKeys = [
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'intake', label: 'Intake' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'stress', label: 'Stress' }
];
// Per-tab state: { [tab]: { [trackerKey]: value } }
let trackerState = {
  morning: {},
  noon: {},
  evening: {},
  night: {}
};

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const tabs = Tabs({
    active: currentTab,
    onChange: (tab) => {
      currentTab = tab;
      render();
    }
  });
  app.appendChild(tabs);

  // Render all tracker rows for the selected tab
  trackerKeys.forEach(({ key, label }) => {
    const row = TrackerRow({
      label,
      value: trackerState[currentTab][key] || 0,
      onChange: (val) => {
        trackerState[currentTab][key] = val;
        render();
      }
    });
    app.appendChild(row);
  });

  const info = document.createElement('div');
  info.style.textAlign = 'center';
  info.style.marginTop = '24px';
  info.textContent = `Active tab: ${currentTab}`;
  app.appendChild(info);
}

window.onload = render;
