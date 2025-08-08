# Phase 2 Simple Architecture: Reports & Graphs

## File & Folder Structure

```
src/
  components/
    Reports.js         # All report/graph UI and logic in one file
  storage.js           # (existing) LocalStorage abstraction
  app.js               # (existing) Main app, adds a "Reports" tab/section
  styles.css           # (existing) Add styles for graph and export button
```

## What Each Part Does

- **Reports.js**
  - Handles everything for reports/graphs in one place:
    - Loads data from `storage.js`
    - Lets user pick which report to view:
      - Symptoms vs. Intake (with lag option)
      - Symptoms vs. Sleep (with lag option)
      - Symptoms vs. Stress (with lag option)
    - Lets user select lag (0, 1, 2 days)
    - Lets user toggle averages and trend lines on/off
    - Draws a simple bar/line graph (SVG or Canvas, no external libraries)
    - Adjusts graph size if phone is rotated (uses `window.matchMedia`)
    - Has a button to export the graph as PNG (uses `canvas.toDataURL`)
  - All state (selected report, lag, toggles, orientation) is local to this file.

- **storage.js**
  - Already provides load/save/export/import for localStorage.
  - Used by `Reports.js` to get the data.

- **app.js**
  - Adds a "Reports" tab or button to show/hide the reports UI.
  - No extra state needed.

- **styles.css**
  - Add a few styles for the graph and export button.

## Where State Lives

- **Reports.js**: Local state for report type, lag, toggles, and orientation.
- **storage.js**: All data is in localStorage, as before.

## How Services Connect

- `Reports.js` imports from `storage.js` to get the data.
- `app.js` shows/hides `Reports.js` as a tab or section.

## UI Example (all in Reports.js)

- **Dropdown:**  
  `Compare: [Symptoms vs. Intake] [Symptoms vs. Sleep] [Symptoms vs. Stress]`
- **Lag selector:**  
  `Lag: [0 days] [1 day] [2 days]`
- **Toggles:**  
  `[x] Show averages`  
  `[x] Show trend line`
- **Graph area:**  
  (Shows only the selected comparison, with overlays as needed)
- **Export button:**  
  `Export as PNG`

## Notes

- **No extra folders, no services, no hooks.**
- **No external libraries needed.**
- **All logic for reports/graphs is in one file.**
- **Export is PNG only (PDF is overkill for personal use).**
- **Responsive graph: just check orientation and set width.**
- **KISS: Minimal, focused, and easy to maintain.**
- **iPhone-only, personal use: No cross-browser or desktop complexity.** 