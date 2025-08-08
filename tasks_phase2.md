# Phase 2 MVP – Concise Task List (Reports & Graphs)

> **Context for Engineering LLM**  
> This task list pairs with `architecture_phase2.md`.  That file explains the overall design (single `Reports.js`, no external libs, iPhone-only).  Follow the folder paths and component names exactly.  Each checkbox below is an atomic, testable step—complete one, run the associated test, then wait for user confirmation and proceed.

Tick each box ✓ when done.

---

### 0 · Safety Net
- [ ] Create branch `phase2-reports` (clean `git status`).

### 1 · UI Entry Point
- [ ] Add **Reports** tab/button in `app.js`.
- [ ] Toggle placeholder `<div id="reports-root">` on click.

### 2 · Skeleton Component
- [ ] Create `src/components/Reports.js`.
- [ ] Render title, empty controls, empty graph container.
- [ ] Mount inside `#reports-root`.

### 3 · Data → Series Utility
- [ ] Implement `buildReportSeries({ reportType, lagDays, rangeDays, data })`.
- [ ] Return `symptomSeries[]`, `factorSeries[]` (respect lag).
- [ ] Unit-test with mock data.

### 4 · Controls (State Only)
- [ ] Add compare dropdown (Intake/Sleep/Stress).
- [ ] Add lag selector (0/1/2 days).
- [ ] Add toggles: Averages, Trend line.
- [ ] On change → recompute series; log result.

### 5 · Basic Graph
- [ ] Draw bars (symptoms, blue) + line (factor, red) on `<canvas>`.
- [ ] Use y-axis 1-5, evenly spaced x-axis.

### 6 · Average & Trend
- [ ] Draw dashed average lines when enabled.
- [ ] Compute simple trend line (linear regression) when enabled.
- [ ] Unit-test `calcAverage`, `calcTrendLine`.

### 7 · Orientation
- [ ] Listen to `matchMedia('(orientation: landscape)')`.
- [ ] Resize canvas width = 100 % on change.

### 8 · PNG Export
- [ ] Add **Export PNG** button.
- [ ] Use `canvas.toDataURL` → download `reports.png`.

### 9 · Styling Polish
- [ ] Flex column layout, 8 px gaps.
- [ ] 44 px touch-size buttons.
- [ ] Canvas rounded border + shadow.

### 10 · Integration Smoke Test
- [ ] Manual run-through: all report types, lags, toggles, rotate, export.
- [ ] Ensure no JS errors.

### 11 · Cleanup & Merge
- [ ] Remove `console.log`s.
- [ ] Commit + open PR. Merge `phase2-reports` → `main` when tests pass. 