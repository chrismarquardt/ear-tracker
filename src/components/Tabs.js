// Minimal Tabs component
// Usage: Tabs({ active, onChange })

export function Tabs({ active = 'morning', onChange }) {
  const times = [
    { key: 'morning', label: 'Morning' },
    { key: 'midday', label: 'Mid-Day' },
    { key: 'evening', label: 'Evening' },
    { key: 'night', label: 'Night' }
  ];
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.margin = '16px 0';

  times.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.type = 'button';
    btn.style.flex = '1';
    btn.style.margin = '0 2px';
    btn.style.padding = '10px 0';
    btn.style.background = key === active ? '#1976d2' : '#f0f0f0';
    btn.style.color = key === active ? '#fff' : '#222';
    btn.style.border = 'none';
    btn.style.fontWeight = key === active ? 'bold' : 'normal';
    btn.style.cursor = 'pointer';
    btn.setAttribute('data-tab', key);
    btn.onclick = () => onChange && onChange(key);
    container.appendChild(btn);
  });

  return container;
}
