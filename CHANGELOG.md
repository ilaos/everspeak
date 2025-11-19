# Changelog

All notable changes to the Everspeak project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added - 2025-11-19

#### Therapeutic Wizard Experience
Transformed the wizard from a transactional form into a therapeutic grief processing experience:

**User Experience Improvements:**
- Added user's first name collection as Step 2 for personalization throughout the app
- Implemented guided breathing exercises between emotionally challenging questions
  - 4-second inhale → 2-second hold → 6-second exhale rhythm
  - Animated breathing circle with visual guidance
  - Automatic timing and transitions
- Integrated AI-powered personalized acknowledgments after each user response
  - Context-aware empathetic responses using OpenAI
  - Smooth typing animation effect for natural therapeutic pacing
  - 4-second reading pause for emotional absorption
  - Replaces generic "cookie-cutter" acknowledgments with truly personalized validation

**Mobile UX Enhancements:**
- Implemented auto-hiding bottom tab bar on scroll
  - Slides down when scrolling down for distraction-free experience
  - Slides up when scrolling up or tapping screen
  - Smooth CSS transitions with debounced scroll detection
  - 50px scroll threshold before hiding
- Fixed mobile spacing issues:
  - Added proper bottom padding to wizard navigation (80px on mobile)
  - Added bottom padding to breathing screens (100px on mobile)
  - Added bottom padding to acknowledgment screens (100px on mobile)
  - Prevents sticky footer from blocking "Next" button and content
- Hidden static acknowledgment text (AI generates them now)

**Backend Additions:**
- `POST /api/wizard/acknowledgment` endpoint for generating AI acknowledgments
- `generateAcknowledment` controller with OpenAI integration
- Stores user's first name in `wizard_inputs` for future personalization
- Graceful error handling with fallback acknowledgments

**Technical Implementation:**
- Updated wizard from 10 to 11 total steps
- Implemented `setupBottomTabBarAutoHide()` with scroll direction detection
- Added `typeText()` animation function for acknowledgment displays
- Updated step mappings and progress text for all 11 steps
- Mobile-first responsive design with desktop overrides

**Files Modified:**
- `public/index.html` - Added user name step, updated wizard structure
- `public/styles.css` - Mobile spacing fixes, tab bar transitions, hidden acknowledgments
- `public/app.js` - Wizard logic updates, auto-hide functionality, typing animations
- `src/routes/index.js` - Added acknowledgment route
- `src/controllers/personaController.js` - Added generateAcknowledment controller
- `server/index.ts` - CORS configuration for ngrok support

---

## [Previous Work]

### Quick-Start Persona Setup System
Comprehensive 7-component system for rapid, accurate AI persona creation:

1. **Bulk Memory Import** - AI-powered text parsing and categorization
2. **6-Step Setup Wizard** - Guided persona creation with memory extraction
3. **Voice-to-Text Memory Entry** - OpenAI Whisper transcription
4. **Persona Booster** - AI accuracy audit and recommendations
5. **Snapshot System** - Version control for personas
6. **Emotional Calibration** - Tone customization (5 sliders, 4 modes, 4 boundaries)
7. **Journal System** - AI-powered reflections with persona context

### Core Features
- Express REST API with Swagger documentation
- AI-powered conversations using OpenAI GPT-4o-mini
- Loved ones persona system with memory management
- JSON file storage with UUID generation
- Complete CRUD operations for personas, memories, journals
- Four-panel responsive web UI
- Mobile-optimized design
- Environment configuration with dotenv
- Comprehensive error handling and validation
- Request logging with Morgan
