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

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = label;
    radio.value = i;
    radio.checked = value === i;
    radio.style.margin = '0 4px';
    radio.onclick = () => onChange && onChange(i);
    row.appendChild(radio);
  }

  return row;
}
