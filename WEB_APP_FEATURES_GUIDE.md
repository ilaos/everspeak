# EVERSPEAK Web App - Advanced Features Testing Guide

## Features Location Map

All 4 advanced features are **fully implemented and ready to test**:

### 1. Setup Wizard 🌟
- **Access:** Personas page → "Setup Wizard" button
- **Purpose:** 6-step guided persona creation with AI
- **Steps:**
  1. Basic info (name, relationship, circumstances)
  2. Personality traits
  3. Favorite memories
  4. Notable conversations
  5. Tone calibration
  6. Generate memories with AI
- **Backend API:** `POST /api/personas/:id/wizard`

### 2. Bulk Import ☁️
- **Access:** Memories page → "Bulk Import" button
- **Purpose:** Paste large text blocks, AI splits into memories
- **Features:**
  - Auto-categorize with AI (checkbox)
  - Auto-assign importance weights
  - Processes letters, journals, stories
- **Backend API:** `POST /api/personas/:id/memories/bulk-import`

### 3. Persona Booster 📊
- **Access:** Settings page → "Improve Persona Accuracy" button
- **Purpose:** AI analyzes persona and suggests improvements
- **Recommendations:**
  - Missing memory categories
  - Suggested new memories
  - Tone calibration adjustments
  - Healthy-use boundary warnings
- **Backend API:** `POST /api/personas/:id/boost`

### 4. Snapshots Manager 📸
- **Access:** Settings page → "Snapshots" section
- **Purpose:** Version control for persona states
- **Features:**
  - Create snapshot (saves current memories + settings)
  - View all snapshots with timestamps
  - Restore to previous version
  - Auto-snapshots from wizard/booster
- **Backend API:**
  - `GET /api/personas/:id/snapshots`
  - `POST /api/personas/:id/snapshots`
  - `POST /api/personas/:id/snapshots/:snapshotId/restore`

---

## Testing Workflow via ngrok

1. **Start Backend:**
   ```bash
   cd C:\Users\ishla\Desktop\EVERSPEAK
   npm start
   ```
   Backend runs on `http://localhost:3000`

2. **Start ngrok:**
   ```bash
   C:\ngrok\ngrok.exe http 3000
   ```
   Get your public URL: `https://[something].ngrok-free.dev`

3. **Test on Phone:**
   - Open ngrok URL in mobile browser
   - Navigate to each page and test features:

### Test Checklist:

**Setup Wizard:**
- [ ] Go to Personas page
- [ ] Create or select a persona
- [ ] Click "Setup Wizard" button
- [ ] Complete all 6 steps
- [ ] Verify memories are created

**Bulk Import:**
- [ ] Go to Memories page
- [ ] Click "Bulk Import" button
- [ ] Paste sample text (letter/journal)
- [ ] Check "Auto-categorize with AI"
- [ ] Click Import
- [ ] Verify memories appear in list

**Persona Booster:**
- [ ] Go to Settings page
- [ ] Click "Improve Persona Accuracy"
- [ ] Wait for AI analysis
- [ ] Review recommendations
- [ ] Verify categories/suggestions display

**Snapshots:**
- [ ] Go to Settings page
- [ ] Scroll to "Snapshots" section
- [ ] Click "Create Snapshot"
- [ ] Enter snapshot name
- [ ] Verify snapshot appears in list
- [ ] Test restore functionality

---

## Mobile Responsiveness

All features are mobile-optimized:
- ✅ Modals scale to 90% screen width
- ✅ Touch targets ≥44px (Apple/Google guidelines)
- ✅ Responsive layouts for screens ≤768px
- ✅ Scrollable content in modals
- ✅ Proper spacing for touch interaction

---

## Implementation Status

| Feature | Status | Location | Backend API |
|---------|--------|----------|-------------|
| Setup Wizard | ✅ Complete | Personas page | `/api/personas/:id/wizard` |
| Bulk Import | ✅ Complete | Memories page | `/api/personas/:id/memories/bulk-import` |
| Persona Booster | ✅ Complete | Settings page | `/api/personas/:id/boost` |
| Snapshots | ✅ Complete | Settings page | `/api/personas/:id/snapshots/*` |

---

## Code References

- **HTML Structure:** `public/index.html`
  - Bulk Import Modal: Line 365
  - Wizard Modal: Line 392+
  - Boost Modal: Line 557+

- **JavaScript Logic:** `public/app.js`
  - Bulk Import: `handleBulkImport()` (line 1183)
  - Wizard: `openWizardModal()` + auto-open logic
  - Boost: `fetchBoostRecommendations()` (line 2147)
  - Snapshots: `handleCreateSnapshot()` (line 2524), `restoreSnapshot()` (line 2558)

- **Styling:** `public/styles.css`
  - Modal styles: Line 2061
  - Mobile media queries: Lines 2010, 3073

---

## Next Steps (Optional Enhancements)

If you want to match the React Native UX:

### Option: Consolidate to Personas Page

Move all 4 feature buttons to the Personas page for one-stop access:

```html
<!-- Add to Personas page after persona info -->
<div class="advanced-features-section">
  <h3>Advanced Tools</h3>
  <div class="feature-buttons">
    <button id="setup-wizard-btn" class="btn-feature wizard">
      🌟 Setup Wizard
    </button>
    <button id="bulk-import-btn" class="btn-feature import">
      ☁️ Bulk Import
    </button>
    <button id="boost-persona-btn" class="btn-feature boost">
      📊 Boost Accuracy
    </button>
    <button id="create-snapshot-btn" class="btn-feature snapshot">
      📸 Create Snapshot
    </button>
  </div>
</div>
```

Currently, features are logically grouped by purpose:
- **Personas page:** Setup
- **Memories page:** Memory import
- **Settings page:** Configuration & versioning

Both approaches are valid - choose based on your preference!

---

**Built with:** Vanilla JavaScript, HTML5, CSS3
**Mobile-first:** Optimized for ngrok + mobile browser workflow
**Backend:** Express REST API at `localhost:3000`
