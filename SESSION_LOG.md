# EverSpeak Development Session Log

## Session: December 28, 2025

### Summary
This session focused on fixing the onboarding wizard flow and setting up HTTPS for production.

---

## Fixes Implemented

### 1. CORS Configuration Fix
**Problem:** API calls returning 500 errors due to CORS rejection on production server.

**Root Cause:** The deployed server code was behind the local version. The CORS fix commit (`f1450fc`) hadn't been deployed.

**Solution:** Deployed latest code via SSH:
```bash
ssh everspeak "cd /var/www/everspeak && git pull && pm2 restart everspeak"
```

**Commit:** `f1450fc` - Fix rate limiter validation error and expand CORS origins

---

### 2. Wizard Modal Visibility Fix
**Problem:** Clicking "Create your first persona" opened the wizard modal, but it appeared blank/invisible.

**Root Cause:** CSS uses `opacity: 0` for `.wizard-modal` by default, requiring `.visible` class for `opacity: 1`. The JavaScript only set `display: flex` but never added the `.visible` class.

**File:** `public/app.js`

**Solution:** Added `.visible` class handling:
```javascript
// In openWizardModal()
wizardModal.style.display = 'flex';
setTimeout(() => wizardModal.classList.add('visible'), 10);

// In closeWizardModal()
wizardModal.classList.remove('visible');
setTimeout(() => wizardModal.style.display = 'none', 300);
```

**Commit:** `1e96220` - Fix wizard modal visibility - add .visible class for CSS opacity transition

---

### 3. Wizard Step Content Visibility Fix
**Problem:** Wizard modal opened but content inside (steps) was invisible.

**Root Cause:** Same pattern - CSS uses `opacity: 0` for `.wizard-step` requiring `.active` class. The `updateWizardUI()` function only set `display: block/none` without managing the `.active` class.

**File:** `public/app.js` (lines 1775-1788)

**Solution:**
```javascript
// Before (broken)
step.style.display = i === wizardCurrentStep ? 'block' : 'none';

// After (fixed)
if (i === wizardCurrentStep) {
  step.style.display = 'block';
  step.classList.add('active');
} else {
  step.style.display = 'none';
  step.classList.remove('active');
}
```

**Commit:** `fc86936` - Fix wizard step visibility - add .active class for CSS opacity

---

### 4. HTTPS Setup for Production
**Problem:** Microphone/voice features require HTTPS (secure context). Site was running on HTTP only.

**Solution:** Set up nginx reverse proxy with Let's Encrypt SSL:

1. **Created nginx config:** `/etc/nginx/sites-available/everspeak`
2. **Obtained SSL certificate:** `certbot --nginx -d everspeak.almaseo.com`
3. **Added domain to CORS:** `https://everspeak.almaseo.com`

**Commit:** `7b2f978` - Add everspeak.almaseo.com to CORS allowed origins

---

## Current Production URLs

| URL | Purpose |
|-----|---------|
| `https://everspeak.almaseo.com` | Production (HTTPS - voice features work) |
| `http://165.22.44.109:3000` | Direct IP access (HTTP - voice features blocked) |

---

## Server Access

```bash
# SSH into server
ssh everspeak

# Or with full path
ssh root@165.22.44.109

# Deploy latest code
ssh everspeak "cd /var/www/everspeak && git pull && pm2 restart everspeak"

# Check logs
ssh everspeak "pm2 logs everspeak --lines 50 --nostream"

# Check nginx
ssh everspeak "nginx -t && systemctl reload nginx"
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `public/app.js` | Main frontend JavaScript (wizard logic, UI) |
| `public/index.html` | HTML structure including wizard modal |
| `public/styles.css` | CSS including `.wizard-step` and `.wizard-modal` visibility |
| `server/index.ts` | Express server with CORS configuration |
| `/etc/nginx/sites-enabled/everspeak` | Nginx config for HTTPS |

---

## Pending Work

### Wizard Redesign (from attached_assets notes)
The 10-step onboarding wizard needs to be updated to feel more like a "warm grief counselor" instead of a "cold form":
- Update copy/tone for all 10 steps
- Add per-step acknowledgments (micro-responses)
- Keep same `wizard_inputs` structure and backend API

See: `attached_assets/Pasted-You-are-working-on-the-EverSpeak-project-We-have-a-10-step-onboarding-wizard...txt`

### Voice/Microphone Feature
- HTTPS is now configured and working
- Need to test microphone recording in wizard
- Voice transcription endpoint needs verification

---

## Git Commits This Session

```
7b2f978 Add everspeak.almaseo.com to CORS allowed origins
fc86936 Fix wizard step visibility - add .active class for CSS opacity
1e96220 Fix wizard modal visibility - add .visible class for CSS opacity transition
f1450fc Fix rate limiter validation error and expand CORS origins (deployed)
```

---

## Session: December 28, 2025 (Continued)

### Summary
This session focused on fixing the wizard persistence/resume feature, breathing exercise, and mobile UX issues.

---

## Fixes Implemented

### 5. Wizard Resume/Continue Feature
**Problem:** "Continue where you left off" button wasn't appearing for users who started a persona but quit mid-wizard.

**Root Cause:** Multiple issues:
1. Home button always created a NEW persona instead of checking for existing incomplete one
2. `saveWizardProgress()` only saved when step > 1, missing initial persona creation
3. Calling non-existent `showWizardModal()` instead of `openWizardModal()`

**Solution:**
- Check localStorage for saved progress before creating new persona
- Save progress at step 1 immediately after persona creation
- Fix function name to `openWizardModal()`

**Commits:** `f04364f`, `3b6dcad`, `310f96a`

---

### 6. Cache-Busting Version Strings
**Problem:** Users not seeing deployed changes.

**Solution:** Added version query strings to script/style references in `index.html`:
```html
<link rel="stylesheet" href="/styles.css?v=20241228-4">
<script src="/app.js?v=20241228-9"></script>
```

**Commit:** `5801a7f`

---

### 7. Breathing Exercise Screen Fix
**Problem:** Breathing exercise between wizard questions was invisible (12-second blank screen).

**Root Cause:** CSS had `opacity: 0` by default, requiring `.visible` class which was never added.

**Solution:**
```javascript
// Show breathing screen
breathingScreen.style.display = 'flex';
setTimeout(() => breathingScreen.classList.add('visible'), 10);

// Cleanup
breathingScreen.classList.remove('visible');
breathingScreen.style.display = 'none';
```

**Commit:** `dcb085f`

---

### 8. Skip Button for Breathing Exercise
**Problem:** Users wanted ability to skip the 12-second breathing exercise.

**Solution:** Added skip button to breathing screen HTML and CSS, with JavaScript handler to immediately resolve the promise.

**Commit:** `3189c72`

---

### 9. Wizard Button Sizing
**Problem:** "Continue where you left off" button was smaller than other welcome buttons.

**Solution:** Updated CSS to match all three buttons:
```css
.btn-wizard-continue {
  padding: 16px 32px;
  font-size: 1.1rem;
}
```

**Commit:** `09660a1`

---

### 10. Wizard Step Fade-In Transition
**Problem:** Next question appeared abruptly after breathing screen.

**Root Cause:** CSS transitions don't work from `display: none`. The `.active` class was added simultaneously with `display: block`.

**Solution:**
```javascript
// First show element, then add active class after delay for transition
step.style.display = 'block';
setTimeout(() => step.classList.add('active'), 20);
```

**Commit:** `92723e2`

---

### 11. Mobile Double-Tap Fix
**Problem:** On mobile, Next button required two taps - first tap triggered bottom tab bar to appear.

**Root Cause:** `touchstart` event listener showed hidden tab bar on ANY tap, causing layout shift.

**Solution:** Hide bottom tab bar entirely when wizard is open:
```javascript
// In openWizardModal()
const bottomTabBar = document.getElementById('bottom-tab-bar');
if (bottomTabBar) bottomTabBar.style.display = 'none';

// In closeWizardModal()
if (bottomTabBar) bottomTabBar.style.display = 'flex';
```

**Commit:** `93fc5a1`

---

### 12. Bulk Feature Commit
**Features committed:**
- Onboarding flow (21 questions, persistence, controller)
- Voice recording and transcription components
- Persona engine for AI hydration
- Safety and TTS services
- Updated client navigation and screens

**Commit:** `d5ce519` (30 files, +6446 lines)

---

## Current Version
`app.js v2024.12.28.9`
`styles.css v20241228-4`

---

## Key Lessons Learned

1. **Don't blame browser cache first** - Check CSS opacity, visibility, and class requirements
2. **CSS transitions require state change** - Can't transition from `display: none`
3. **Mobile touch events can interfere** - Auto-hide features can steal first tap
4. **Always add debug logging** - Console logs reveal exactly where flow breaks
5. **Check if changes need deployment** - Local changes aren't visible on production until pushed and deployed with: `ssh everspeak "cd /var/www/everspeak && git pull && pm2 restart everspeak"`
6. **Voice recorder has logic in THREE files** - `wizardEngine.js`, `app.js`, AND `index.html`

---

## Session: December 29, 2025

### Summary
This session focused on implementing an **audio preview feature** for voice recordings, fixing the **breathing animation**, and debugging **voice recorder issues**.

---

## Features Implemented

### 1. Audio Preview Before Transcription
**Request:** User wanted to hear their recording before it gets transcribed, with options to re-record or confirm.

**Implementation:**
- Added new UI state: `.voice-recorder-preview` between recording and processing states
- Play/pause button with progress bar showing playback position
- "Re-record" button to discard and start over
- "Use this recording" button to proceed with transcription
- WhatsApp-style UI matching existing voice recorder design

**Key Files Modified:**
- `public/app.js` - Added functions:
  - `injectPreviewState()` - Dynamically injects preview HTML into voice recorders
  - `setupPreviewButtons()` - Sets up event listeners for preview controls
  - `showPreviewState()` - Displays preview with audio blob
  - `toggleAudioPlayback()` - Play/pause control
  - `updateAudioProgress()` - Progress bar updates during playback
  - `resetAudioPlayback()` - Resets player when audio ends
  - `formatTime()` - Formats seconds as M:SS
  - `showGetReadyState()` - Shows "Get ready..." before recording starts

- `public/styles.css` - Added styles (lines 3125-3230):
  - `.voice-recorder-preview` - Container for preview state
  - `.audio-preview-container` - Holds player controls
  - `.btn-play-preview` - Play/pause button (circular, brand color)
  - `.audio-progress-bar` / `.audio-progress-fill` - Progress indicator
  - `.audio-duration` - Time display
  - `.btn-re-record-preview` - Secondary action button
  - `.btn-use-recording` - Primary action button

**Commits:**
- `812feff` - Add audio preview feature before transcription
- `b934c26` - Fix voice recorder preview issues
- `e89a775` - Fix audio preview duration showing 0:00

---

## Fixes Implemented

### 2. Choppy Breathing Animation Fix
**Problem:** Breathing exercise ball animation became choppy - growing/shrinking in jerky motions instead of smooth transitions.

**Root Cause:** Duplicate CSS animation definitions at the end of `styles.css` (lines 4889-4910) were overriding the original smooth animations:
- Original: `breathe-in` with scale(0.7→1) and opacity transitions, 4s inhale / 6s exhale
- Duplicate: `breatheIn` with scale(1→1.4), no opacity, same duration for both

**Solution:** Removed the duplicate animation definitions at lines 4889-4910.

**Commit:** `61daaa0` - Fix choppy breathing animation - remove duplicate CSS

---

### 3. Re-record Button Not Working
**Problem:** Clicking "Re-record" in preview state didn't show the recorder again.

**Root Cause:** `resetVoiceRecorder()` function didn't include the preview state in its list of elements to hide.

**Solution:** Updated `resetVoiceRecorder()` to:
- Hide `.voice-recorder-preview` state
- Clear stored audio blob (`container._audioBlob = null`)
- Reset audio player (pause and clear source)

**File:** `public/app.js` lines 3348-3383

---

### 4. Recording Starts Immediately After Permission
**Problem:** As soon as user grants microphone permission, recording starts immediately - user wasn't ready.

**Solution:**
1. Show "Get ready..." in timer display while requesting permission
2. Add 800ms delay after permission granted before starting recording
3. New function `showGetReadyState()` updates UI during this waiting period

**File:** `public/app.js` lines 3180-3187, 3241-3253

---

### 5. Audio Duration Showing 0:00
**Problem:** Preview player showed 0:00 instead of actual recording duration.

**Root Cause:** `loadedmetadata` event doesn't reliably fire for blob URLs in all browsers.

**Solution:**
- Immediately show `voiceRecorderSeconds` (the timer value we tracked during recording)
- Force `audio.load()` to initialize playback
- Add `canplaythrough` listener as backup for metadata
- Clean up previous blob URLs to prevent memory leaks

**File:** `public/app.js` lines 3151-3181

---

### 6. Improved Audio Recording Format
**Problem:** Audio might not play back properly in some browsers.

**Solution:** Added MIME type detection for best compatibility:
```javascript
const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
  ? 'audio/webm;codecs=opus'
  : MediaRecorder.isTypeSupported('audio/webm')
    ? 'audio/webm'
    : 'audio/mp4';
```

Also added `timeslice: 100` to `mediaRecorder.start()` to ensure data chunks are captured.

---

## CRITICAL: Pending Issue - OpenAI API Key Invalid

### Transcription Error: "Error: AppError"
**Problem:** When user clicks "Use this recording", transcription fails with generic error.

**Server Log Error:**
```
'Incorrect API key provided: sk-proj-...JikA. You can find your API key at https://platform.openai.com/account/api-keys.'
type: 'invalid_request_error'
code: 'invalid_api_key'
```

**Root Cause:** The OpenAI API key on the production server is invalid or expired.

**File Affected:** Server reads from `process.env.OPENAI_API_KEY`

**REQUIRED ACTION:**
1. SSH into server: `ssh everspeak`
2. Edit .env file: `nano /var/www/everspeak/.env`
3. Update `OPENAI_API_KEY` with valid key from https://platform.openai.com/api-keys
4. Restart app: `pm2 restart everspeak`

**Note:** This is NOT a code bug. The transcription controller (`src/controllers/transcriptionController.js`) has the correct polyfill for Node.js 18's File global. The issue is purely the API key.

---

## Audio Playback Status (Needs Testing)

After the latest fix (`e89a775`), the preview should:
1. Show recorded duration immediately (e.g., "0:06" for 6 seconds)
2. Allow clicking play button to hear the recording
3. Show progress bar filling as audio plays
4. "Re-record" should reset to default state
5. "Use this recording" will fail until API key is fixed

**To Test:** Refresh the page, record audio, check if duration shows correctly and playback works.

---

## Git Commits This Session

```
e89a775 Fix audio preview duration showing 0:00
b934c26 Fix voice recorder preview issues
61daaa0 Fix choppy breathing animation - remove duplicate CSS
812feff Add audio preview feature before transcription
```

---

## Current Production State

- **URL:** https://everspeak.almaseo.com
- **Audio Preview UI:** Implemented and deployed ✓
- **Breathing Animation:** Fixed ✓
- **Voice Transcription:** BLOCKED - waiting for API key fix

---

## Files Changed This Session

| File | Changes |
|------|---------|
| `public/app.js` | Added audio preview functions, fixed resetVoiceRecorder, added recording delay |
| `public/styles.css` | Added .voice-recorder-preview styles, removed duplicate breathing animations |

---

## Next Steps When Resuming

1. **Fix OpenAI API Key** - SSH to server, update `.env`, restart PM2
2. **Test full voice flow** - Record → Preview → Playback → Transcribe
3. **Test re-record flow** - Record → Preview → Re-record → Record again
4. **Continue with any remaining wizard/onboarding work**

---

## Session: December 29, 2025 (Continued)

### Summary
This session focused on **switching from OpenAI to Google Gemini** for AI features, **adding a pronoun question** to the onboarding wizard, and **redesigning the voice recorder UI** to show a horizontal bar by default.

---

## Major Changes

### 1. Switched AI Provider: OpenAI → Google Gemini

**Reason:** User preferred to use their existing Gemini API key instead of OpenAI.

**Files Updated:**
| File | Change |
|------|--------|
| `src/controllers/transcriptionController.js` | OpenAI Whisper → Gemini 2.0 Flash (audio as base64) |
| `src/controllers/messageController.js` | GPT-4o-mini → Gemini 2.0 Flash for persona conversations |
| `src/controllers/personaController.js` | All AI features → Gemini (wizard, acknowledgments, bulk import, boost) |
| `src/controllers/journalController.js` | Journal reflections → Gemini |
| `src/services/ttsService.js` | **Kept with OpenAI** (Gemini has no TTS API) |

**Environment Variables:**
```
GEMINI_API_KEY=... (text generation, transcription)
OPENAI_API_KEY=... (TTS only)
```

**Commits:**
- `3e628ea` - Switch transcription to Gemini
- `e3800ed` - Switch all AI text features to Gemini

---

### 2. Added Pronoun Question to Onboarding (Q3)

**Request:** User wanted to know how to refer to the loved one without asking about gender directly (to avoid political sensitivity).

**Solution:** Added question after "What was their name?":
> **"When I talk about them, should I say 'he,' 'she,' or 'they'?"**
>
> Options: He | She | They | Just use their name

**Files Updated:**
| File | Change |
|------|--------|
| `src/onboarding/questions.js` | Added Q3, renumbered Q4-Q29 (now 29 total questions) |
| `public/wizardEngine.js` | Added `loved_one_pronouns` to wizard submission |
| `src/controllers/personaController.js` | Store pronouns in `onboarding_context.loved_one_pronouns` |
| `src/controllers/messageController.js` | Inject pronoun instructions into AI system prompt |

**How It Works:**
- `"he"` → AI prompt includes: "When referring to yourself (the persona), use he/him pronouns."
- `"she"` → "...use she/her pronouns."
- `"they"` → "...use they/them pronouns."
- `"name_only"` → "...avoid pronouns and use the name instead."

**Commit:** `ae8b604` - Add pronoun question to onboarding wizard (Q3)

---

### 3. Voice Recorder UI: Horizontal Bar by Default

**Request:** Instead of showing a mic icon that expands to a recording bar, show the horizontal bar immediately in a "ready" state.

**Before:**
```
        🎤
  "Tap to record"
```

**After:**
```
┌────────────────────────────────────────┐
│  🎤  │    Tap to record    │          │
└────────────────────────────────────────┘
```

**Files Updated:**
| File | Change |
|------|--------|
| `public/wizardEngine.js` | Renamed `.voice-recorder-default` → `.voice-recorder-ready`, new HTML structure |
| `public/app.js` | Updated all 14 references to use `.voice-recorder-ready` |
| `public/styles.css` | Added `.voice-recorder-ready` styles (horizontal bar layout) |

**Commits:**
- `6e3bf34` - Change voice recorder to show horizontal bar by default
- `2398bf9` - Fix voice recorder: update app.js to use .voice-recorder-ready class

---

## Key Lesson Learned (NEW)

5. **Voice recorder has logic in THREE files** - When changing voice recorder UI:
   - `wizardEngine.js` generates HTML dynamically (for API-driven wizard)
   - `app.js` controls the behavior and state transitions
   - `index.html` has **hardcoded HTML** for an older wizard version
   - **All THREE must be updated together** or selectors won't match

This caused the "still seeing mic icon" bug - we updated wizardEngine.js and app.js but missed the hardcoded HTML in index.html.

---

## Git Commits This Session

```
a0a8c8f Fix voice recorder: update hardcoded HTML in index.html to use .voice-recorder-ready
2398bf9 Fix voice recorder: update app.js to use .voice-recorder-ready class
1c2328e Bump cache version strings to 20241229-1
6e3bf34 Change voice recorder to show horizontal bar by default
ae8b604 Add pronoun question to onboarding wizard (Q3)
e3800ed Switch all AI text features from OpenAI to Google Gemini
3e628ea Switch from OpenAI Whisper to Google Gemini for audio transcription
```

---

## Current Production State

- **URL:** https://everspeak.almaseo.com
- **AI Provider:** Gemini 2.0 Flash (text), OpenAI (TTS only)
- **Onboarding Questions:** 29 total (added pronoun question as Q3)
- **Voice Recorder:** Horizontal bar UI by default

---

## Server Environment

```
GEMINI_API_KEY=AIzaSy...  ✓
OPENAI_API_KEY=sk-proj... ✓ (for TTS)
```

---

## Session: January 16, 2026

### Summary
This session focused on fixing two critical issues reported during wizard testing:
1. **Name extraction not preferring personal names** - When user says "professionally Jim, but to me Jimmy", it was still using "Jim" instead of "Jimmy"
2. **Voice recording error** - User got an error when recording on the "things left unsaid" question

---

## Issues Fixed

### 1. Name Extraction Priority Fix

**Problem:** When the user provided verbose name answers like:
- "In the professional world, everyone knew him as Jim, but to me, I knew him as Jimmy"

The subsequent questions would use "Jim" instead of the personal name "Jimmy".

**Root Cause:** The LLM extraction prompt wasn't explicit enough about prioritizing personal names over professional names.

**Solution:** Completely rewrote the extraction prompt with explicit priority ordering:

**File:** `src/controllers/transcriptionController.js` (lines 8-29)

**Before:**
```javascript
const EXTRACTION_PROMPTS = {
  name: `Extract the primary name or nickname the user wants to use for this person.
Rules:
- If multiple names are given, prefer the nickname or the name "everyone close to them" used
- Return ONLY the name itself, nothing else
...`
```

**After:**
```javascript
const EXTRACTION_PROMPTS = {
  name: `Extract the PERSONAL name the user wants to use for this person.

CRITICAL PRIORITY ORDER:
1. ALWAYS prefer the name the user personally used: "to me he was", "I called him", "I knew him as"
2. Second choice: nicknames used by close people: "everyone close called him", "family called her"
3. LAST choice: professional/formal names: "professionally known as", "in the professional world"

Rules:
- Return ONLY the single name itself, nothing else
- NEVER return the professional/formal name if a personal nickname is given
- Examples:
  - "In the professional world he was Jim, but to me he was Jimmy" → "Jimmy"
  - "His name was James but everyone called him Jimmy" → "Jimmy"
  - "Everyone knew him as Jim but I called him Jimmy" → "Jimmy"
  - "Professionally Jim, but to me Jimmy" → "Jimmy"
  - "Sarah" → "Sarah"
- If no clear name is found, return "them"
- Never return explanations, just the name

Transcript: `
```

**Also added logging** for debugging:
```javascript
console.log(`[Name Extraction] Input transcript: "${trimmedTranscript}"`);
// ... LLM call ...
console.log(`[Name Extraction] LLM returned: "${extractedName}"`);
```

**Commit:** `5bf04ab`

---

### 2. Voice Recording Error Handling Improvements

**Problem:** User recorded a deep memory on the "things left unsaid" question, clicked stop, and got an error saying it wasn't recorded.

**Root Cause:** Could be one of several issues:
- Empty audio blob
- Server transcription error
- Empty transcription result (no speech detected)

The previous error handling was generic and unhelpful.

**Solution:** Improved error handling in `public/app.js` (lines 3567-3629):

**Added:**
1. **Audio blob validation** - Check if blob is empty before sending:
```javascript
if (!audioBlob || audioBlob.size === 0) {
  console.error('[Voice Recorder] Audio blob is empty or invalid');
  showError('No audio was captured. Please try recording again.');
  resetVoiceRecorder(container);
  return;
}
```

2. **Audio size logging**:
```javascript
console.log(`[Voice Recorder] Processing audio: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
```

3. **Server response error handling**:
```javascript
if (!response.ok) {
  const errorText = await response.text();
  console.error('[Voice Recorder] Server error:', response.status, errorText);
  showError('Server error while transcribing. Please try again.');
  resetVoiceRecorder(container);
  return;
}
```

4. **Empty transcription detection**:
```javascript
} else if (result.success && !result.text) {
  console.warn('[Voice Recorder] Transcription returned empty text');
  showError('Could not hear any speech. Please speak clearly and try again.');
  resetVoiceRecorder(container);
}
```

**Also added server-side logging** in `transcriptionController.js` (lines 74-81):
```javascript
console.error('Transcription error:', error.message || error);
console.error('Transcription error details:', {
  name: error.name,
  code: error.code,
  status: error.status,
  fileSize: req.file?.size,
  mimeType: req.file?.mimetype
});
```

**Commit:** `5bf04ab`

---

## Current Deployment

**Verification command:**
```bash
cd /var/www/everspeak && git log -1 --oneline
```

**Expected output:**
```
5bf04ab Fix name extraction to prefer personal names and improve error handling
```

---

## Two Wizard Systems Reminder

The app has **TWO** wizard systems that both need to be maintained:

| System | File | Used When |
|--------|------|-----------|
| Legacy wizard | `public/app.js` | Hardcoded wizard in index.html |
| New wizard | `public/wizardEngine.js` | API-driven wizard with questions from backend |

Both systems call:
- `/api/transcribe` - For voice transcription
- `/api/extract-name` - For extracting display names from verbose answers

Both store display names:
- Legacy: Creates hidden input `{fieldId}-display`
- New: Uses `this.userNameDisplay` and `this.lovedOneNameDisplay`

---

## Name Extraction Flow (How It Works)

1. User records voice answer for "What was their name?"
2. Audio sent to `/api/transcribe` → Returns full transcript
3. Full transcript stored in hidden input (for Deep Synthesis later)
4. Transcript sent to `/api/extract-name` → Returns extracted display name
5. Display name stored in separate `-display` hidden input
6. `getDisplayName()` function uses display name for subsequent question text
7. Toast shows "Understood, we're talking about Jimmy."

**Files involved:**
- `src/controllers/transcriptionController.js` - Both endpoints
- `public/app.js` - `extractAndStoreDisplayName()`, `getDisplayName()`, `showWizardToast()`
- `public/wizardEngine.js` - `extractDisplayName()`, `showConfirmationToast()`

---

## Testing Instructions

To verify fixes work:

1. **Test name extraction:**
   - Start new persona wizard
   - On "What was their name?" question, record: "Professionally everyone knew him as Jim, but to me he was always Jimmy"
   - Toast should say: "Understood, we're talking about Jimmy."
   - Next question should say: "Could you tell me about your relationship with Jimmy?"

2. **Test recording error handling:**
   - Try recording with no audio (stay silent)
   - Should show: "Could not hear any speech. Please speak clearly and try again."
   - Check browser console for detailed logging

---

## Known Issues / Still To Investigate

1. **SSH authentication failing** - Could not check server PM2 logs during this session:
   ```
   Permission denied, please try again.
   root@165.22.44.109: Permission denied (publickey,password).
   ```

   May need to re-add SSH key or check if key has expired.

2. **Recording error specifics unknown** - Without server logs, we couldn't determine exactly why the "things left unsaid" recording failed. The improved logging will help diagnose this next time it happens.

---

## Files Changed This Session

| File | Changes |
|------|---------|
| `src/controllers/transcriptionController.js` | Rewrote name extraction prompt, added detailed logging |
| `public/app.js` | Improved voice recording error handling with specific messages |

---

## Git Commits This Session

```
5bf04ab Fix name extraction to prefer personal names and improve error handling
```

---

## Next Steps When Resuming

1. **Test the name extraction fix** - Have user try wizard again with "professionally X, but to me Y" phrasing
2. **Test recording on "things left unsaid"** - Try to reproduce the recording error
3. **Check server logs if error recurs** - The new logging will show exactly what failed
4. **Fix SSH access** - May need to regenerate or re-add SSH keys
5. **Continue wizard testing** - User was at question ~10 of 29 when they stopped

---

## Quick Reference Commands

```bash
# Deploy latest code (from local)
cd "C:\Users\ishla\Desktop\EVERSPEAK" && git pull origin main && git merge festive-leakey --no-edit && git push origin main

# Verify deployment (on server)
cd /var/www/everspeak && git log -1 --oneline

# Check server logs (on server)
pm2 logs everspeak --lines 50 --nostream

# Restart app (on server)
pm2 restart everspeak
```
