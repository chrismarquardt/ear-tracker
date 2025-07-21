import { Tabs } from './components/Tabs.js';
import { TrackerRow } from './components/TrackerRow.js';
import { WaterButton } from './components/WaterButton.js';

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
// Global water sum
let waterSum = 0;

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  // Water intake controls (global)
  const waterWrap = document.createElement('div');
  waterWrap.style.display = 'flex';
  waterWrap.style.alignItems = 'center';
  waterWrap.style.gap = '8px';
  waterWrap.style.margin = '12px 0 20px 0';

  const waterInput = document.createElement('input');
  waterInput.type = 'number';
  waterInput.min = '0';
  waterInput.step = '50';
  waterInput.value = waterSum;
  waterInput.style.width = '80px';
  waterInput.style.fontSize = '1.1rem';
  waterInput.style.textAlign = 'right';
  waterInput.onchange = (e) => {
    waterSum = parseInt(e.target.value, 10) || 0;
    render();
  };
  waterWrap.appendChild(waterInput);
  const mlLabel = document.createElement('span');
  mlLabel.textContent = 'ml';
  mlLabel.style.marginLeft = '4px';
  waterWrap.appendChild(mlLabel);
  const waterBtn = WaterButton({
    onAdd: () => {
      waterSum += 200;
      render();
    }
  });
  waterWrap.appendChild(waterBtn);
  app.appendChild(waterWrap);

  // Visually delimited tab area
  const tabArea = document.createElement('div');
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
    tabArea.appendChild(row);
  });

  app.appendChild(tabArea);

  const info = document.createElement('div');
  info.style.textAlign = 'center';
  info.style.marginTop = '24px';
  info.textContent = `Active tab: ${currentTab}`;
  app.appendChild(info);
}

window.onload = render;
