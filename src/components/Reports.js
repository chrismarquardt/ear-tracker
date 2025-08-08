// Reports.js: Minimal skeleton for Reports tab
export function Reports(root) {
  root.innerHTML = '';

  // --- Local state ---
  let reportType = 'intake'; // 'intake' | 'sleep' | 'stress'
  let lagDays = 0;
  let showAvg = false;
  let showTrend = false;
  const rangeDays = 14;
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
  [ ['intake','Symptoms vs. Intake'], ['sleep','Symptoms vs. Sleep'], ['stress','Symptoms vs. Stress'] ].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    compare.appendChild(opt);
  });
  compare.value = reportType;
  compare.onchange = e => { reportType = e.target.value; update(); };
  compareLabel.appendChild(compare);
  controls.appendChild(compareLabel);

  // Lag selector
  const lagLabel = document.createElement('label');
  lagLabel.textContent = 'Lag: ';
  const lag = document.createElement('select');
  [0,1,2].forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val + ' day' + (val === 1 ? '' : 's');
    lag.appendChild(opt);
  });
  lag.value = lagDays;
  lag.onchange = e => { lagDays = parseInt(e.target.value,10); update(); };
  lagLabel.appendChild(lag);
  controls.appendChild(lagLabel);

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

  root.appendChild(controls);

  // Graph container
  const graph = document.createElement('div');
  graph.id = 'reports-graph';
  graph.style.height = '220px';
  graph.style.background = '#f8f9fb';
  graph.style.border = '1px dashed #bbb';
  graph.style.borderRadius = '8px';
  graph.style.display = 'flex';
  graph.style.alignItems = 'center';
  graph.style.justifyContent = 'center';
  graph.style.position = 'relative';

  // Canvas for graph
  const canvas = document.createElement('canvas');
  canvas.width = 340;
  canvas.height = 180;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '340px';
  canvas.style.height = '180px';
  canvas.style.background = 'transparent';
  graph.appendChild(canvas);
  root.appendChild(graph);

  function drawGraph() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { symptomSeries, factorSeries } = buildReportSeries({ reportType, lagDays, rangeDays, data });
    // Y axis: 1-5
    const yMin = 1, yMax = 5;
    const N = symptomSeries.length;
    if (N <= 1) return;
    // X axis: evenly spaced
    const padX = 24;
    const W = canvas.width - padX * 2;
    const H = canvas.height - 24;
    // Draw bars (symptoms)
    const barW = Math.max(8, Math.floor(W / (N * 2)));
    symptomSeries.forEach((pt, i) => {
      if (typeof pt.value !== 'number') return;
      const x = padX + (W * i) / (N - 1) - barW / 2;
      const y = 12 + H * (1 - (pt.value - yMin) / (yMax - yMin));
      ctx.fillStyle = '#3498db';
      ctx.fillRect(x, y, barW, H + 12 - y);
    });
    // Draw line (factor)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    factorSeries.forEach((pt, i) => {
      if (typeof pt.value !== 'number') return;
      const x = padX + (W * i) / (N - 1);
      const y = 12 + H * (1 - (pt.value - yMin) / (yMax - yMin));
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
        const y = 12 + H * (1 - (avg1 - yMin) / (yMax - yMin));
        console.log('Symptom avg:', avg1, 'y:', y);
        ctx.strokeStyle = '#3498db';
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + W, y);
        ctx.stroke();
      } else {
        console.log('No symptom avg');
      }
      // Factor avg
      const avg2 = calcAverage(factorSeries);
      if (typeof avg2 === 'number') {
        const y = 12 + H * (1 - (avg2 - yMin) / (yMax - yMin));
        console.log('Factor avg:', avg2, 'y:', y);
        ctx.strokeStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + W, y);
        ctx.stroke();
      } else {
        console.log('No factor avg');
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
          const y = 12 + H * (1 - (yVal - yMin) / (yMax - yMin));
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
          const y = 12 + H * (1 - (yVal - yMin) / (yMax - yMin));
          const x = padX + (W * i) / (N - 1);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }

  // Redraw on control change
  function update() {
    const res = buildReportSeries({ reportType, lagDays, rangeDays, data });
    drawGraph();
    console.log('Reports controls changed:', { reportType, lagDays, showAvg, showTrend, res });
  }

  // Initial draw
  update();
}

// Utility: Build report data series
export function buildReportSeries({ reportType, lagDays, rangeDays, data }) {
  // reportType: 'intake' | 'sleep' | 'stress'
  // lagDays: 0, 1, 2
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
  // For each day, compute average symptom (across all times)
  const symptomSeries = days.map(date => {
    const entry = data[date];
    if (!entry) return { date, value: null };
    const ts = entry.trackerState;
    let sum = 0, count = 0;
    ['morning','midday','evening','night'].forEach(tod => {
      if (ts[tod] && ts[tod].symptoms) {
        Object.values(ts[tod].symptoms).forEach(v => {
          if (typeof v === 'number' && v > 0) { sum += v; count++; }
        });
      }
    });
    return { date, value: count ? sum / count : null };
  });
  // For each day, get factor value (intake: sum, sleep/stress: value)
  const factorSeries = days.map((date, idx) => {
    // Apply lag: get value from lagDays before
    const lagIdx = idx - lagDays;
    if (lagIdx < 0) return { date, value: null };
    const lagDate = days[lagIdx];
    const entry = data[lagDate];
    if (!entry) return { date, value: null };
    if (reportType === 'intake') {
      // Sum all intake for the day
      const ts = entry.trackerState;
      let sum = 0;
      ['morning','midday','evening','night'].forEach(tod => {
        if (ts[tod] && ts[tod].intake) {
          Object.values(ts[tod].intake).forEach(v => {
            if (typeof v === 'number' && v > 0) sum += v;
          });
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
  const pts = series.map((pt, i) => [i, pt.value]).filter(([i, v]) => typeof v === 'number');
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
// Minimal unit tests
if (typeof window === 'undefined' || window.TEST_REPORTS) {
  const s = [ {value:1}, {value:2}, {value:3}, {value:null}, {value:5} ];
  console.log('Test calcAverage:', calcAverage(s));
  console.log('Test calcTrendLine:', calcTrendLine(s));
} 