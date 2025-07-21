// Minimal WaterButton component
// Usage: WaterButton({ onAdd })

export function WaterButton({ onAdd }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '+200ml';
  btn.style.padding = '16px 0';
  btn.style.fontSize = '0.9rem';
  btn.style.background = '#1976d2';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.width = '100%';
  btn.onclick = () => onAdd && onAdd();
  return btn;
}
