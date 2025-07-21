// Minimal TrackerRow component
// Usage: TrackerRow({ label, value, onChange })

export function TrackerRow({ label, value = 0, onChange }) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.margin = '12px 0';

  const lbl = document.createElement('span');
  lbl.textContent = label;
  lbl.style.flex = '0 0 100px';
  lbl.style.marginRight = '12px';
  row.appendChild(lbl);

  const btnGroup = document.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.flex = '1';
  btnGroup.style.gap = '6px';

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.type = 'button';
    btn.style.flex = '1';
    btn.style.padding = '16px 0';
    btn.style.fontSize = '1.2rem';
    btn.style.border = value === i ? '2px solid #1976d2' : '1px solid #ccc';
    btn.style.background = value === i ? '#1976d2' : '#f0f0f0';
    btn.style.color = value === i ? '#fff' : '#222';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.onclick = () => onChange && onChange(i);
    btnGroup.appendChild(btn);
  }

  row.appendChild(btnGroup);
  return row;
}
