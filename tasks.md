# MVP Implementation Plan: Ear Tracker App (Bundled)

Each task is focused, testable, and bundles related concerns for faster implementation without sacrificing clarity.

---

## 1. Project Setup & App Shell
- [x] Create project folder structure as per architecture.md
- [x] Add empty `index.html`, `manifest.json`, `service-worker.js`, `/src/app.js`, `/src/storage.js`, `/src/ui.js`, `/src/styles.css`, and `/src/components/` with placeholder files
- [x] Implement minimal `index.html` with root div, links to JS and CSS
- [x] Add PWA manifest (`manifest.json`) with app name, icon placeholder, and theme color
- [x] Add empty `service-worker.js` and register it in `index.html`
- [x] Add a basic `/src/styles.css` with mobile-friendly base styles
- [x] Test: App loads without errors and displays placeholder

## 2. State & Storage Core
- [x] Implement `storage.js` with functions: `loadData()`, `saveData(data)`, `exportData()`, `importData(json)`
- [x] In `app.js`, load state from storage on startup
- [x] Write tests to verify data can be saved, loaded, exported, and imported from localStorage

## 3. Tab Navigation & Tracker Rows
- [x] Implement `Tabs.js` to render tabs for morning, noon, evening, night, with event listeners to switch active tab
- [x] Implement `TrackerRow.js` to render a label and 5 radio buttons (1-5), with event handling for selection
- [x] In `ui.js`, render all tracker rows for symptoms, intake, sleep, stress for the selected tab
- [x] Test: Clicking tabs switches active tab visually; clicking radio buttons updates selected value visually

## 4. Water Intake Controls
- [ ] Implement `WaterButton.js` to add 200ml to water intake for the day
- [ ] Implement editable text field for daily water sum
- [ ] Integrate water controls into main tracker UI
- [ ] Test: Tapping button increases sum, editing field updates value, and both persist after reload

## 5. State Updates & Persistence
- [ ] Ensure all UI changes (radio, water) update in-memory state and persist to localStorage
- [ ] Test: All changes persist after reload and are reflected in UI

## 6. Settings Modal & Import/Export
- [ ] Implement `SettingsModal.js` with cogwheel icon to open/close
- [ ] Add export button: triggers download of JSON
- [ ] Add import button: opens file picker, loads JSON (overwriting as needed)
- [ ] Test: Export and import work as expected

## 7. Debug Panel
- [ ] Implement `DebugPanel.js` to show current localStorage content at bottom of screen
- [ ] Test: Debug panel updates live as data changes

## 8. PWA Features
- [ ] Implement asset caching in `service-worker.js` for offline use
- [ ] Test: App loads offline after first visit; can be added to home screen and launches standalone

## 9. Polish & Review
- [ ] Review UI for mobile usability
- [ ] Remove/disable debug panel for production
- [ ] Final test: Full manual walkthrough of all features 