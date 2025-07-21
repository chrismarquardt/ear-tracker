// Minimal SettingsModal component
// Usage: SettingsModal({ onExport, onImport })

export function SettingsModal({ open, onClose, onExport, onImport }) {
  if (!open) return null;
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.3)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';
  overlay.onclick = (e) => {
    if (e.target === overlay) onClose();
  };

  const modal = document.createElement('div');
  modal.style.background = '#fff';
  modal.style.borderRadius = '12px';
  modal.style.padding = '24px 20px 20px 20px';
  modal.style.minWidth = '260px';
  modal.style.boxShadow = '0 2px 16px rgba(0,0,0,0.18)';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.alignItems = 'center';
  modal.onclick = (e) => e.stopPropagation();

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '12px';
  closeBtn.style.right = '18px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.5rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = onClose;
  modal.appendChild(closeBtn);

  const title = document.createElement('div');
  title.textContent = 'Settings';
  title.style.fontWeight = 'bold';
  title.style.fontSize = '1.2rem';
  title.style.marginBottom = '18px';
  modal.appendChild(title);

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export Data';
  exportBtn.style.margin = '8px 0';
  exportBtn.style.padding = '8px 18px';
  exportBtn.style.fontSize = '1rem';
  exportBtn.style.borderRadius = '6px';
  exportBtn.style.border = '1px solid #1976d2';
  exportBtn.style.background = '#1976d2';
  exportBtn.style.color = '#fff';
  exportBtn.style.cursor = 'pointer';
  exportBtn.onclick = onExport;
  modal.appendChild(exportBtn);

  const importBtn = document.createElement('button');
  importBtn.textContent = 'Import Data';
  importBtn.style.margin = '8px 0';
  importBtn.style.padding = '8px 18px';
  importBtn.style.fontSize = '1rem';
  importBtn.style.borderRadius = '6px';
  importBtn.style.border = '1px solid #1976d2';
  importBtn.style.background = '#fff';
  importBtn.style.color = '#1976d2';
  importBtn.style.cursor = 'pointer';
  importBtn.onclick = onImport;
  modal.appendChild(importBtn);

  overlay.appendChild(modal);
  return overlay;
}
