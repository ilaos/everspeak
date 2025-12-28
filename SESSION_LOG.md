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
