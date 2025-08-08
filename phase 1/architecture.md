# Ear Tracker App Architecture

## Overview
A simple Progressive Web App (PWA) for tracking ear symptoms and external factors, designed for mobile browsers (iPhone, Android). All data is stored locally (no backend). The app is modular, minimal, and easy to maintain.

---

## File & Folder Structure

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
│   │   ├── Tabs.js           # Tab navigation (morning, mid-day, etc)
│   │   ├── TrackerRow.js     # Row for each tracked value (label + radio buttons)
│   │   ├── WaterButton.js    # Button for adding water intake
│   │   ├── SettingsModal.js  # Settings (import/export)
│   │   └── DebugPanel.js     # Shows local storage for dev
│   └── styles.css        # All app styles
└── README.md             # Project info

---

## State Management

- **What is Tracked:**
    - **Symptoms:**
        - Low-frequency hearing loss
        - Low-frequency noise level
        - High-frequency noise level
    - **Daily Intake:**
        - Water (special button for +200ml, editable sum)
        - Sodium
        - Refined carbs
        - Sugar
        - Alcohol
    - **Sleep Quality:** (1 is bad, 5 is great)
    - **Stress Level:** (1 is little, 5 is lots)

- **Where State Lives:**
    - All tracked data is stored in `localStorage` as a single JSON object, keyed by date in `yyyy-mm-dd` format. The app determines the current date based on a day starting at 5am (i.e., changes between midnight and 5am are counted for the previous day).
    - UI state (current tab, modal open/close, selected date) is kept in memory (in JS variables in `app.js`).
    - Water intake is tracked as a sum per day, with each button tap adding 200ml and an editable text field that holds the sum per day.

- **State Flow:**
    1. On load, `app.js` determines the current date (with 5am day start), loads data for that date from `localStorage` via `storage.js`.
    2. UI is rendered based on current state and selected date.
    3. User actions (radio tap, water button, import/export, date switch) update state in memory and persist to `localStorage` for the correct date.
    4. Debug panel always shows current `localStorage` content.
    5. UI includes a date switcher (arrows to move day forward/backward).
    6. **Symptoms and Intake are visually grouped in the UI, and each sub-item is tracked separately.**

---

## Service Connections

- **No external services.**
- **All data is local.**
- **Import/Export:**
    - Export: User taps button, app generates JSON from localStorage, triggers file download.
    - Import: User selects JSON file, app parses and loads data into localStorage (overwriting as needed, merging not required).
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