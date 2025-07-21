# Ear Tracker App Architecture

## Overview
A simple Progressive Web App (PWA) for tracking ear symptoms and external factors, designed for mobile browsers (iPhone, Android). All data is stored locally (no backend). The app is modular, minimal, and easy to maintain.

---

## File & Folder Structure

```
ear-tracker/
│
├── index.html            # Main HTML entry point
├── manifest.json         # PWA manifest
├── service-worker.js     # PWA offline support
├── /src                  # All app source code
│   ├── app.js            # App entry, state mgmt, routing
│   ├── storage.js        # Local storage service (get/set/export/import)
│   ├── ui.js             # UI rendering, event handlers
│   ├── components/       # UI components (modular, reusable)
│   │   ├── Tabs.js           # Tab navigation (morning, noon, etc)
│   │   ├── TrackerRow.js     # Row for each tracked value (label + radio buttons)
│   │   ├── WaterButton.js    # Button for adding water intake
│   │   ├── SettingsModal.js  # Settings (import/export)
│   │   └── DebugPanel.js     # Shows local storage for dev
│   └── styles.css        # All app styles
└── README.md             # Project info
```

---

## What Each Part Does

- **index.html**: Loads the app, root for mounting UI, links manifest and styles.
- **manifest.json**: PWA metadata (icon, name, etc).
- **service-worker.js**: Enables offline use, caches assets.
- **/src/app.js**: Main entry. Initializes app, manages global state, handles tab switching, and coordinates between UI and storage.
- **/src/storage.js**: Abstracts all localStorage access. Handles saving, loading, exporting, and importing data as JSON.
- **/src/ui.js**: Renders UI, attaches event listeners, updates DOM on state changes.
- **/src/components/**: Small, focused UI modules:
    - **Tabs.js**: Renders and manages time-of-day tab navigation.
    - **TrackerRow.js**: Renders a label and 5 radio buttons for each tracked value.
    - **WaterButton.js**: Button to add 200ml water, updates daily sum.
    - **SettingsModal.js**: Cogwheel-triggered modal for import/export.
    - **DebugPanel.js**: Shows raw localStorage for dev/debugging.
- **/src/styles.css**: All app styles (mobile-first, simple, responsive).

---

## State Management

- **Where State Lives:**
    - All tracked data (symptoms, intake, sleep, stress) is stored in `localStorage` as a single JSON object, keyed by date and time frame (morning, noon, etc).
    - UI state (current tab, modal open/close) is kept in memory (in JS variables in `app.js`).
    - Water intake is tracked as a sum per day, with each button tap adding 200ml and an editable text field that holds the sum per day.

- **State Flow:**
    1. On load, `app.js` loads data from `localStorage` via `storage.js`.
    2. UI is rendered based on current state.
    3. User actions (radio tap, water button, import/export) update state in memory and persist to `localStorage`.
    4. Debug panel always shows current `localStorage` content.

---

## Service Connections

- **No external services.**
- **All data is local.**
- **Import/Export:**
    - Export: User taps button, app generates JSON from localStorage, triggers file download.
    - Import: User selects JSON file, app parses and loads data into localStorage (overwriting if needed, merging not required).
- **PWA:**
    - `service-worker.js` caches assets for offline use.
    - `manifest.json` enables "Add to Home Screen" and app-like experience.

---

## KISS Principles Applied
- Minimal files, clear separation of concerns.
- No frameworks, just vanilla JS/HTML/CSS.
- All logic is modular and testable.
- No backend, no user accounts, no cloud.
- Easy to debug (debug panel always visible during dev).
- Easy to extend (add new tracked values by editing a config array).

---

## Next Steps
- Review and iterate on this architecture as needed.
- Start with `index.html`, `app.js`, and `storage.js` for core logic.
- Build UI components as simple JS modules. 