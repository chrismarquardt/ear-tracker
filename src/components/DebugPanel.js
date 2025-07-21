// Minimal DebugPanel component
// Usage: DebugPanel({ storageKey })

export function DebugPanel({ storageKey }) {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = 'stretch';

  const panel = document.createElement('pre');
  panel.style.background = '#222';
  panel.style.color = '#fff';
  panel.style.fontSize = '0.75rem';
  panel.style.padding = '12px';
  panel.style.borderRadius = '8px';
  panel.style.marginTop = '0';
  panel.style.overflowX = 'auto';
  panel.style.maxHeight = '200px';
  panel.style.whiteSpace = 'pre-wrap';
  panel.style.lineHeight = '1.4';
  panel.style.boxShadow = '0 1px 4px rgba(0,0,0,0.12)';
  panel.style.border = '1px solid #444';
  panel.style.marginBottom = '8px';
  panel.textContent = pretty(localStorage.getItem(storageKey));
  wrap.appendChild(panel);

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
