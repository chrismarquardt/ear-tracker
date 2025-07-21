import { Tabs } from './components/Tabs.js';

let currentTab = 'morning';

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
  const info = document.createElement('div');
  info.style.textAlign = 'center';
  info.style.marginTop = '24px';
  info.textContent = `Active tab: ${currentTab}`;
  app.appendChild(info);
}

window.onload = render;
