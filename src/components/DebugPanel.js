// Minimal DebugPanel component
// Usage: DebugPanel({ storageKey })

export function DebugPanel({ storageKey, activeTab = '' }) {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'stretch';

  // Will append SW status later inside panel
  let swStatusText = 'Service Worker: checking...';
  function setStatus(text) {
    swStatusText = text;
    if (statusBlock) {
      statusBlock.textContent = `${swStatusText} | Active tab: ${activeTab}`;
    }
  }

  // Detailed SW debug info
  const swDebug = document.createElement('div');
  swDebug.style.fontSize = '0.75rem';
  swDebug.style.background = '#f5f5f5';
  swDebug.style.color = '#333';
  swDebug.style.border = '1px solid #eee';
  swDebug.style.borderRadius = '6px';
  swDebug.style.padding = '6px 10px';
  swDebug.style.marginBottom = '6px';
  swDebug.style.wordBreak = 'break-all';
  swDebug.style.display = 'none';
  wrap.appendChild(swDebug);

  let lastEvent = null;
  function updateSWDebug(reg, err) {
    let info = '';
    if (reg) {
      info += `scope: ${reg.scope}\n`;
      if (reg.active) info += `active: ${reg.active.state}\n`;
      if (reg.installing) info += `installing: ${reg.installing.state}\n`;
      if (reg.waiting) info += `waiting: ${reg.waiting.state}\n`;
    }
    if (lastEvent) info += `last event: ${lastEvent}\n`;
    if (err) info += `error: ${err.message || err}`;
    swDebug.textContent = info;
    swDebug.style.display = info ? 'block' : 'none';
  }

  setTimeout(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (!reg) {
          setStatus('Service Worker: not registered');
          updateSWDebug(null);
        } else if (reg.active) {
          setStatus('Service Worker: active');
          updateSWDebug(reg);
        } else if (reg.installing) {
          setStatus('Service Worker: installing...');
          updateSWDebug(reg);
        } else {
          setStatus('Service Worker: registered (not active)');
          updateSWDebug(reg);
        }
      }).catch(err => {
        setStatus('Service Worker: error');
        updateSWDebug(null, err);
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        lastEvent = 'controllerchange';
        setTimeout(() => navigator.serviceWorker.getRegistration().then(updateSWDebug), 100);
      });
      navigator.serviceWorker.addEventListener('message', () => {
        lastEvent = 'message';
        setTimeout(() => navigator.serviceWorker.getRegistration().then(updateSWDebug), 100);
      });
      navigator.serviceWorker.addEventListener('error', (e) => {
        lastEvent = 'error';
        updateSWDebug(null, e);
      });
    } else {
      setStatus('Service Worker: not supported');
      updateSWDebug(null);
    }
  }, 0);

  // Collapsible localStorage output (arrow inside black box)
  let expanded = localStorage.getItem('debug_expanded') === '1';
  const panel = document.createElement('pre');
  panel.style.background = '#222';
  panel.style.color = '#fff';
  panel.style.fontSize = '0.75rem';
  panel.style.padding = '0';
  panel.style.borderRadius = '8px';
  panel.style.marginTop = '0';
  panel.style.overflowX = 'auto';
  panel.style.maxHeight = '400px';
  panel.style.whiteSpace = 'pre-wrap';
  panel.style.lineHeight = '1.4';
  panel.style.boxShadow = '0 1px 4px rgba(0,0,0,0.12)';
  panel.style.border = '1px solid #444';
  panel.style.marginBottom = '8px';
  panel.style.display = 'block';

  // Header with collapse arrow
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.background = 'transparent';
  header.style.padding = '8px 12px 4px 12px';
  header.style.borderTopLeftRadius = '8px';
  header.style.borderTopRightRadius = '8px';

  const collapseBtn = document.createElement('button');
  collapseBtn.textContent = expanded ? '▼' : '►';
  collapseBtn.style.background = 'none';
  collapseBtn.style.border = 'none';
  collapseBtn.style.color = '#fff';
  collapseBtn.style.fontWeight = 'bold';
  collapseBtn.style.fontSize = '1rem';
  collapseBtn.style.cursor = 'pointer';
  collapseBtn.style.marginRight = '8px';
  collapseBtn.onclick = () => {
    expanded = !expanded;
    content.style.display = expanded ? 'block' : 'none';
    collapseBtn.textContent = expanded ? '▼' : '►';
    localStorage.setItem('debug_expanded', expanded ? '1' : '0');
  };
  header.appendChild(collapseBtn);

  const label = document.createElement('span');
  label.textContent = 'LocalStorage';
  label.style.color = '#fff';
  label.style.fontWeight = 'bold';
  label.style.fontSize = '0.85rem';
  header.appendChild(label);

  panel.appendChild(header);

  // Status block (SW + active tab)
  const statusBlock = document.createElement('div');
  statusBlock.style.padding = '4px 12px 4px 12px';
  statusBlock.style.fontSize = '0.75rem';
  statusBlock.style.color = '#fff';
  statusBlock.textContent = `${swStatusText} | Active tab: ${activeTab}`;
  panel.appendChild(statusBlock);

  const content = document.createElement('div');
  content.style.padding = '0 12px 12px 12px';
  content.style.display = expanded ? 'block' : 'none';
  content.textContent = pretty(localStorage.getItem(storageKey));
  panel.appendChild(content);

  wrap.appendChild(panel);

  // Clear App Cache button
  const clearCacheBtn = document.createElement('button');
  clearCacheBtn.textContent = 'Clear App Cache';
  clearCacheBtn.style.background = '#fbc02d';
  clearCacheBtn.style.color = '#222';
  clearCacheBtn.style.border = 'none';
  clearCacheBtn.style.borderRadius = '6px';
  clearCacheBtn.style.padding = '4px 8px';
  clearCacheBtn.style.fontWeight = 'bold';
  clearCacheBtn.style.fontSize = '0.8rem';
  clearCacheBtn.style.margin = '8px auto 0 auto';
  clearCacheBtn.style.cursor = 'pointer';
  clearCacheBtn.onclick = () => {
    if (window.confirm('Clear all app cache and reload?')) {
      if ('caches' in window) {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
              if (reg) reg.unregister().then(() => location.reload());
              else location.reload();
            });
          } else {
            location.reload();
          }
        });
      } else {
        location.reload();
      }
    }
  };
  wrap.appendChild(clearCacheBtn);

  const nukeBtn = document.createElement('button');
  nukeBtn.textContent = 'Nuke LocalStorage';
  nukeBtn.style.background = '#c62828';
  nukeBtn.style.color = '#fff';
  nukeBtn.style.border = 'none';
  nukeBtn.style.borderRadius = '6px';
  nukeBtn.style.padding = '4px 8px';
  nukeBtn.style.fontWeight = 'bold';
  nukeBtn.style.fontSize = '0.8rem';
  nukeBtn.style.margin = '8px auto 0 auto';
  nukeBtn.style.cursor = 'pointer';
  nukeBtn.onclick = () => {
    if (window.confirm('Are you sure you want to delete all app data?')) {
      localStorage.removeItem(storageKey);
      location.reload();
    }
  };
  wrap.appendChild(nukeBtn);

  return wrap;
}

function pretty(json) {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json || '{}';
  }
}
