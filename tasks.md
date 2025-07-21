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
- [x] Implement `Tabs.js` to render tabs for morning, mid-day, evening, night, with event listeners to switch active tab
- [x] Implement `TrackerRow.js` to render a label and 5 radio buttons (1-5), with event handling for selection
- [x] In `ui.js`, render all tracker rows for symptoms, intake, sleep, stress for the selected tab
- [x] Test: Clicking tabs switches active tab visually; clicking radio buttons updates selected value visually
- [ ] Refactor tracker rows so that:
    - Each sub-symptom (low-frequency hearing loss, low-frequency noise level, high-frequency noise level) is tracked separately
    - Each sub-intake (sodium, refined carbs, sugar, alcohol) is tracked separately
    - Water is tracked as before (button + sum)
    - Symptoms and intake are visually grouped in the UI
    - Test: All sub-items are tracked and grouped as specified

## 4. Water Intake Controls
- [x] Implement `WaterButton.js` to add 200ml to water intake for the day
- [x] Implement editable text field for daily water sum
- [x] Integrate water controls into main tracker UI
- [x] Test: Tapping button increases sum, editing field updates value, and both persist after reload

## 5. State Updates & Persistence
- [x] Ensure all UI changes (radio, water) update in-memory state and persist to localStorage
- [x] Test: All changes persist after reload and are reflected in UI

## 6. Date Handling & Navigation
- [x] Refactor state to be keyed by date (yyyy-mm-dd), with day starting at 5am (changes between midnight and 5am count for previous day)
- [x] Implement date switcher UI (arrows to move day forward/backward)
- [x] Test: Changing date updates all tracker and water values, and persists per day

## 7. Settings Modal & Import/Export
- [x] Implement `SettingsModal.js` with cogwheel icon to open/close
- [x] Add export button: triggers download of JSON
- [x] Add import button: opens file picker, loads JSON (overwriting as needed)
- [x] Test: Export and import work as expected

## 8. Debug Panel
- [x] Implement `DebugPanel.js` to show current localStorage content at bottom of screen
- [x] Test: Debug panel updates live as data changes

## 9. PWA Features
- [x] Implement asset caching in `service-worker.js` for offline use
- [x] Test: App loads offline after first visit; can be added to home screen and launches standalone

## 10. Polish & Review
- [ ] Review UI for mobile usability
- [ ] Remove/disable debug panel for production
- [ ] Final test: Full manual walkthrough of all features 