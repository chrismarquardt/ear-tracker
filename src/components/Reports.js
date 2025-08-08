// Reports.js: Enhanced reporting with range, correlation, gap fill, and labels
export function Reports(root) {
  root.innerHTML = '';

  // --- Local state ---
  let reportType = 'intake'; // 'intake' | 'sleep' | 'stress'
  let lagDays = 0;
  let showAvg = false;
  let showTrend = false;
  let rangeDays = 14; // now selectable: 7, 14, 30
  let corrType = 'pearson'; // 'pearson' | 'spearman'
  let fillGaps = true; // intraday single-slot gap fill

  // Use app data if available, else empty
  const data = (typeof window !== 'undefined' && window.allData) ? window.allData : {};

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Reports & Graphs';
  root.appendChild(title);

  // Controls container
  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.flexWrap = 'wrap';
  controls.style.gap = '12px';
  controls.style.margin = '12px 0';

  // Compare dropdown
  const compareLabel = document.createElement('label');
  compareLabel.textContent = 'Compare: ';
  const compare = document.createElement('select');
  [['intake','Symptoms vs. Intake'], ['sleep','Symptoms vs. Sleep'], ['stress','Symptoms vs. Stress']].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    compare.appendChild(opt);
  });
  compare.value = reportType;
  compare.onchange = e => { reportType = e.target.value; update(); };
  compareLabel.appendChild(compare);
  controls.appendChild(compareLabel);

  // Range selector
  const rangeLabel = document.createElement('label');
  rangeLabel.textContent = ' Range: ';
  const rangeSel = document.createElement('select');
  [7, 14, 30].forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = `${val} days`;
    rangeSel.appendChild(opt);
  });
  rangeSel.value = String(rangeDays);
  rangeSel.onchange = e => { rangeDays = parseInt(e.target.value, 10); update(); };
  rangeLabel.appendChild(rangeSel);
  controls.appendChild(rangeLabel);

  // Lag selector
  const lagLabel = document.createElement('label');
  lagLabel.textContent = ' Lag: ';
  const lag = document.createElement('select');
  [0,1,2,3,4,5,6,7].forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val + ' day' + (val === 1 ? '' : 's');
    lag.appendChild(opt);
  });
  lag.value = lagDays;
  lag.onchange = e => { lagDays = parseInt(e.target.value,10); update(); };
  lagLabel.appendChild(lag);
  controls.appendChild(lagLabel);

  // Correlation selector
  const corrLabel = document.createElement('label');
  corrLabel.textContent = ' Corr: ';
  const corrSel = document.createElement('select');
  [['pearson','Pearson'], ['spearman','Spearman ρ']].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    corrSel.appendChild(opt);
  });
  corrSel.value = corrType;
  corrSel.onchange = e => { corrType = e.target.value; update(); };
  corrLabel.appendChild(corrSel);
  controls.appendChild(corrLabel);

  // Fill gaps toggle
  const gapsLabel = document.createElement('label');
  const gapsToggle = document.createElement('input');
  gapsToggle.type = 'checkbox';
  gapsToggle.checked = fillGaps;
  gapsToggle.onchange = e => { fillGaps = e.target.checked; update(); };
  gapsLabel.appendChild(gapsToggle);
  gapsLabel.appendChild(document.createTextNode(' Fill small gaps'));
  controls.appendChild(gapsLabel);

  // Show averages toggle
  const avgLabel = document.createElement('label');
  const avgToggle = document.createElement('input');
  avgToggle.type = 'checkbox';
  avgToggle.checked = showAvg;
  avgToggle.onchange = e => { showAvg = e.target.checked; update(); };
  avgLabel.appendChild(avgToggle);
  avgLabel.appendChild(document.createTextNode(' Show averages'));
  controls.appendChild(avgLabel);

  // Show trend line toggle
  const trendLabel = document.createElement('label');
  const trendToggle = document.createElement('input');
  trendToggle.type = 'checkbox';
  trendToggle.checked = showTrend;
  trendToggle.onchange = e => { showTrend = e.target.checked; update(); };
  trendLabel.appendChild(trendToggle);
  trendLabel.appendChild(document.createTextNode(' Show trend line'));
  controls.appendChild(trendLabel);

  // OpenAI key helpers (Shortcut + store)
  const aiWrap = document.createElement('div');
  aiWrap.style.display = 'flex';
  aiWrap.style.gap = '8px';
  aiWrap.style.alignItems = 'center';

  const aiBtn = document.createElement('button');
  aiBtn.textContent = 'Get OpenAI key';
  aiBtn.onclick = () => {
    // Opens Apple Shortcut (works on iOS/macOS)
    const url = 'shortcuts://run-shortcut?name=OpenApikey';
    try { window.location.href = url; } catch (_) {}
  };
  aiWrap.appendChild(aiBtn);

  const keyInput = document.createElement('input');
  keyInput.type = 'password';
  keyInput.placeholder = 'Enter API key';
  keyInput.style.minWidth = '160px';
  keyInput.value = (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key')) || '';
  aiWrap.appendChild(keyInput);

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = () => {
    if (typeof localStorage !== 'undefined') {
      if (keyInput.value) localStorage.setItem('openai_api_key', keyInput.value);
      else localStorage.removeItem('openai_api_key');
      saveBtn.textContent = 'Saved';
      setTimeout(() => (saveBtn.textContent = 'Save'), 800);
    }
  };
  aiWrap.appendChild(saveBtn);

  controls.appendChild(aiWrap);

  root.appendChild(controls);

  // Graph container
  const graph = document.createElement('div');
  graph.id = 'reports-graph';
  graph.style.height = '260px';
  graph.style.background = '#f8f9fb';
  graph.style.border = '1px dashed #bbb';
  graph.style.borderRadius = '8px';
  graph.style.display = 'flex';
  graph.style.alignItems = 'center';
  graph.style.justifyContent = 'center';
  graph.style.position = 'relative';
  graph.style.padding = '8px';

  // Canvas for graph
  const canvas = document.createElement('canvas');
  canvas.width = Math.min((graph.clientWidth || 360) - 16, 560);
  canvas.height = 210;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '560px';
  canvas.style.height = '210px';
  canvas.style.background = 'transparent';
  graph.appendChild(canvas);
  root.appendChild(graph);

  function drawGraph() {
    // Responsive canvas width for mobile
    const targetW = Math.min((graph.clientWidth || 360) - 16, 560);
    if (Math.abs(canvas.width - targetW) > 2) canvas.width = targetW;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { symptomSeries, factorSeries } = buildReportSeries({ reportType, lagDays, rangeDays, data, fillGaps });
    // Y axis: 1-5
    const yMin = 1, yMax = 5;
    const N = symptomSeries.length;
    if (N <= 1) return;

    // X axis: evenly spaced
    const padX = 28;
    const topPad = 18;
    const bottomPad = 26;
    const W = canvas.width - padX * 2;
    const H = canvas.height - (topPad + bottomPad);

    // Axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, topPad);
    ctx.lineTo(padX, topPad + H);
    ctx.lineTo(padX + W, topPad + H);
    ctx.stroke();

    // Draw bars (symptoms)
    const barW = Math.max(6, Math.floor(W / (N * 2)));
    symptomSeries.forEach((pt, i) => {
      if (typeof pt.value !== 'number') return;
      const x = padX + (W * i) / (N - 1) - barW / 2;
      const y = topPad + H * (1 - (pt.value - yMin) / (yMax - yMin));
      ctx.fillStyle = '#3498db';
      ctx.fillRect(x, y, barW, topPad + H - y);
    });

    // Draw line (factor)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    factorSeries.forEach((pt, i) => {
      if (typeof pt.value !== 'number') return;
      const x = padX + (W * i) / (N - 1);
      const y = topPad + H * (1 - (pt.value - yMin) / (yMax - yMin));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw averages (dashed)
    if (showAvg) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      // Symptom avg
      const avg1 = calcAverage(symptomSeries);
      if (typeof avg1 === 'number') {
        const y = topPad + H * (1 - (avg1 - yMin) / (yMax - yMin));
        ctx.strokeStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + W, y);
        ctx.stroke();
      }
      // Factor avg
      const avg2 = calcAverage(factorSeries);
      if (typeof avg2 === 'number') {
        const y = topPad + H * (1 - (avg2 - yMin) / (yMax - yMin));
        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + W, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw trend lines
    if (showTrend) {
      // Symptom trend
      const t1 = calcTrendLine(symptomSeries);
      if (t1) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < N; ++i) {
          const yVal = t1.slope * i + t1.intercept;
          const y = topPad + H * (1 - (yVal - yMin) / (yMax - yMin));
          const x = padX + (W * i) / (N - 1);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Factor trend
      const t2 = calcTrendLine(factorSeries);
      if (t2) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < N; ++i) {
          const yVal = t2.slope * i + t2.intercept;
          const y = topPad + H * (1 - (yVal - yMin) / (yMax - yMin));
          const x = padX + (W * i) / (N - 1);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // Legend
    ctx.fillStyle = '#000';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('Symptoms (bars)  |  Factor (line)', padX, 2);

    // Axis labels and sparse date ticks
    const ticks = Math.min(4, N);
    for (let t = 0; t < ticks; t++) {
      const i = Math.round((t * (N - 1)) / (ticks - 1 || 1));
      const x = padX + (W * i) / (N - 1);
      ctx.fillStyle = '#666';
      ctx.fillRect(x, topPad + H, 1, 4);
      const label = symptomSeries[i].date?.slice(5); // MM-DD
      if (label) ctx.fillText(label, Math.max(padX, Math.min(x - 12, padX + W - 24)), topPad + H + 6);
    }
    ctx.save();
    ctx.translate(6, topPad + H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#666';
    ctx.fillText('Score (1–5)', 0, 0);
    ctx.restore();

    // Correlation annotation
    const xy = alignPairs(symptomSeries, factorSeries);
    let r = null;
    if (xy.length >= 3) {
      r = (corrType === 'spearman') ? spearmanCorr(xy.map(p => p.x), xy.map(p => p.y))
                                    : pearsonCorr(xy.map(p => p.x), xy.map(p => p.y));
    }
    const rText = (typeof r === 'number' && isFinite(r)) ? r.toFixed(2) : 'n/a';
    const nText = xy.length;
    const annot = `${corrType === 'spearman' ? 'ρ' : 'r'}=${rText} (n=${nText}, lag=${lagDays})`;
    ctx.fillStyle = '#222';
    ctx.textAlign = 'right';
    ctx.fillText(annot, padX + W, 2);
    ctx.textAlign = 'left';
  }

  // Redraw on control change
  function update() {
    drawGraph();
  }

  // Initial draw
  update();
}

// Utility: Build report data series
export function buildReportSeries({ reportType, lagDays, rangeDays, data, fillGaps = true }) {
  // reportType: 'intake' | 'sleep' | 'stress'
  // lagDays: 0..7
  // rangeDays: how many days back from today (e.g. 14)
  // data: { [date]: { trackerState, sleep, stress, ... } }
  // Returns: { symptomSeries: [{date, value}], factorSeries: [{date, value}] }
  const today = new Date();
  const pad = n => n.toString().padStart(2, '0');
  function dateKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  const days = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(dateKey(d));
  }

  // For each day, compute average symptom (across times) with optional intraday gap fill
  const TODS = ['morning','midday','evening','night'];
  const symptomSeries = days.map(date => {
    const entry = data[date];
    if (!entry) return { date, value: null };
    const ts = entry.trackerState || {};
    // Gather per-time-of-day average symptom score
    const vals = TODS.map(tod => {
      const s = ts[tod]?.symptoms;
      if (!s) return null;
      const nums = Object.values(s).filter(v => typeof v === 'number' && v > 0);
      if (!nums.length) return null;
      return nums.reduce((a,b) => a + b, 0) / nums.length;
    });
    if (fillGaps) {
      // Single-slot gap fill: if prev and next exist:
      for (let i = 0; i < vals.length; i++) {
        if (vals[i] == null && i - 1 >= 0 && i + 1 < vals.length && vals[i-1] != null && vals[i+1] != null) {
          if (vals[i+1] === vals[i-1]) {
            vals[i] = vals[i-1]; // carry forward last if following is the same
          } else if (vals[i+1] < vals[i-1]) {
            vals[i] = vals[i+1]; // carry forward lower if following is lower
          } // else leave missing when following is higher
        }
      }
    }
    const dayNums = vals.filter(v => typeof v === 'number');
    return { date, value: dayNums.length ? (dayNums.reduce((a,b)=>a+b,0) / dayNums.length) : null };
  });

  // For each day, get factor value (intake: sum, sleep/stress: value) with lag applied
  const factorSeries = days.map((date, idx) => {
    // Apply lag: get value from lagDays before
    const lagIdx = idx - lagDays;
    if (lagIdx < 0) return { date, value: null };
    const lagDate = days[lagIdx];
    const entry = data[lagDate];
    if (!entry) return { date, value: null };
    if (reportType === 'intake') {
      // Sum all intake for the day
      const ts = entry.trackerState || {};
      let sum = 0;
      ['morning','midday','evening','night'].forEach(tod => {
        const intake = ts[tod]?.intake;
        if (intake) {
          Object.values(intake).forEach(v => { if (typeof v === 'number' && v > 0) sum += v; });
        }
      });
      return { date, value: sum };
    } else if (reportType === 'sleep') {
      return { date, value: typeof entry.sleep === 'number' ? entry.sleep : null };
    } else if (reportType === 'stress') {
      return { date, value: typeof entry.stress === 'number' ? entry.stress : null };
    }
    return { date, value: null };
  });

  return { symptomSeries, factorSeries };
}

// Utility: Average of non-null values
export function calcAverage(series) {
  const vals = series.map(pt => pt.value).filter(v => typeof v === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// Utility: Simple linear regression (returns {slope, intercept})
export function calcTrendLine(series) {
  const pts = series.map((pt, i) => [i, pt.value]).filter(([, v]) => typeof v === 'number');
  const N = pts.length;
  if (N < 2) return null;
  const sumX = pts.reduce((a, [x]) => a + x, 0);
  const sumY = pts.reduce((a, [, y]) => a + y, 0);
  const sumXY = pts.reduce((a, [x, y]) => a + x * y, 0);
  const sumX2 = pts.reduce((a, [x]) => a + x * x, 0);
  const slope = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / N;
  return { slope, intercept };
}

// Align pairs by index where both values are numeric
function alignPairs(s1, s2) {
  const out = [];
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    const a = s1[i]?.value, b = s2[i]?.value;
    if (typeof a === 'number' && typeof b === 'number' && isFinite(a) && isFinite(b)) {
      out.push({ x: a, y: b });
    }
  }
  return out;
}

// Pearson correlation
function pearsonCorr(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return null;
  const mx = x.reduce((a,b)=>a+b,0)/n;
  const my = y.reduce((a,b)=>a+b,0)/n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const vx = x[i] - mx, vy = y[i] - my;
    num += vx * vy; dx += vx*vx; dy += vy*vy;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

// Spearman rho (rank then Pearson)
function spearmanCorr(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return null;
  const rx = rankify(x);
  const ry = rankify(y);
  return pearsonCorr(rx, ry);
}

// Average ranks with ties
function rankify(arr) {
  const entries = arr.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v);
  const ranks = new Array(arr.length);
  let i = 0;
  while (i < entries.length) {
    let j = i;
    while (j + 1 < entries.length && entries[j+1].v === entries[i].v) j++;
    const avgRank = (i + j) / 2 + 1; // ranks start at 1
    for (let k = i; k <= j; k++) ranks[entries[k].i] = avgRank;
    i = j + 1;
  }
  return ranks;
}

// Minimal unit tests (node)
if (typeof window === 'undefined' || window.TEST_REPORTS) {
  const s = [ {value:1}, {value:2}, {value:3}, {value:null}, {value:5} ];
  console.log('Test calcAverage:', calcAverage(s));
  console.log('Test calcTrendLine:', calcTrendLine(s));
}