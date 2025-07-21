// Minimal TrackerRow component
// Usage: TrackerRow({ label, value, onChange })

export function TrackerRow({ label, value = 0, onChange }) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.margin = '4px 4px 4px 4px';

  const lbl = document.createElement('span');
  lbl.textContent = label;
  lbl.style.flex = '0 0 90px';
  lbl.style.marginRight = '8px';
  lbl.style.fontSize = '0.9rem';
  row.appendChild(lbl);

  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.flex = '1';
  btnGroup.style.gap = '4px';

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.type = 'button';
    btn.style.flex = '1';
    btn.style.padding = '10px 0';
    btn.style.fontSize = '1rem';
    btn.style.border = value === i ? '1px solid #1976d2' : 'none';
    // btn.style.border = value === i ? '1px solid #1976d2' : '1px solid #ccc';
    btn.style.background = value === i ? '#1976d2' : '#f0f0f0';
    btn.style.color = value === i ? '#fff' : '#222';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.onclick = () => onChange && onChange(i);
    btnGroup.appendChild(btn);
  }

  // Cancel / clear button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '×';
  cancelBtn.type = 'button';
  cancelBtn.style.padding = '10px 12px';
  cancelBtn.style.margin = '0px 0px 0px 4px';
  cancelBtn.style.fontSize = '1rem';
  cancelBtn.style.border = 'none';
  cancelBtn.style.background = '#ffe7e7';
  cancelBtn.style.color = '#222';
  cancelBtn.style.borderRadius = '6px';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.onclick = () => onChange && onChange(0);
  btnGroup.appendChild(cancelBtn);

  row.appendChild(btnGroup);
  return row;
}
