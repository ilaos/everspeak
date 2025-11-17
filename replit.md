# Everspeak Backend

## Overview

Everspeak Backend is a professional Node.js + Express REST API designed for building scalable backend applications. It features an organized folder structure, comprehensive error handling, input validation, request logging, and interactive Swagger/OpenAPI documentation. The project's core purpose is to power an AI-driven conversational companion system, allowing users to create and interact with "personas" based on stored memories. Key capabilities include full CRUD operations for personas and their memories, AI-powered message processing using OpenAI GPT-4o-mini, a robust grounding system to manage user expectations, and advanced features like memory editing, persona snapshots, emotional calibration for AI responses, voice-to-text memory entry using OpenAI Whisper, bulk memory import, 10-step persona setup wizard, comprehensive journaling system with AI-powered reflections, and a warm, emotionally grounded "Conversation Room" UI. The overarching vision is to provide a customizable and emotionally intelligent conversational experience, enabling deeper and more personalized interactions with AI companions based on curated memories, while also supporting emotional processing through guided journaling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Framework & Runtime**
- Node.js with Express.js for the REST API server.
- TypeScript for server entry point, JavaScript for routes, controllers, and utilities.
- ESM (ES Modules) as the module system.

**Server Configuration**
- Port configured via `PORT` environment variable (defaults to 3000).
- CORS enabled for cross-origin requests.
- Morgan middleware for HTTP request logging.
- Express middleware for JSON and URL-encoded request body parsing.
- dotenv for environment variable management.

**Project Structure**
- `/server/index.ts`: Main server entry point.
- `/src/routes/`: API route definitions.
- `/src/controllers/`: Business logic and request handlers for test, message, persona, journal, and example operations.
- `/src/personas/`: Persona storage and utility functions.
- `/src/journal/`: Journal storage and utility functions.
- `/src/utils/`: Utility functions and middleware, including error handling and input validation.
- `/public/`: Frontend web UI assets (HTML, CSS, JS) for a four-panel responsive layout (Persona, Memories, Journal, Conversation Room).

**Error Handling**
- Centralized middleware with custom error classes (`AppError`, `ValidationError`).
- Environment-aware error responses with consistent JSON format and appropriate HTTP status codes.

**Validation**
- Smart validation middleware supporting both creation (POST) and partial updates (PUT/PATCH) with field-level error messages.

**API Documentation**
- Swagger/OpenAPI 3.0 documentation accessible at `/api-docs`.
- Generated from JSDoc comments within route definitions, offering an interactive API explorer.

### API Endpoints

- **Test Endpoint**: `GET /api/test`
- **Message Endpoint (AI-Powered)**: `POST /api/message`
  - Processes conversational messages using OpenAI GPT-4o-mini.
  - Supports `persona_id` for context, emotional state, tone mode, memory bank, and a `strict_persona` mode to keep AI responses close to stored memories.
  - Includes grounding and healthy-use features (e.g., grounding banner, "Based on memories" line, healthy-use nudge).
  - First message detection: when `is_first_message: true` is sent, builds special warm AI prompt using `onboarding_context` from wizard.
- **Personas Resource (CRUD)**:
  - `GET /api/personas`
  - `GET /api/personas/:id`
  - `POST /api/personas`
  - `PUT /api/personas/:id`
  - `DELETE /api/personas/:id`
- **Memories Sub-Resource (CRUD)**:
  - `GET /api/personas/:id/memories`
  - `POST /api/personas/:id/memories` (supports categorization and weighting)
  - `PUT /api/personas/:id/memories/:memoryId` (inline editing supported on frontend)
  - `DELETE /api/personas/:id/memories/:memoryId`
  - `POST /api/personas/:id/memories/bulk-import` (bulk memory import with AI categorization/weighting)
- **Setup Wizard**:
  - `POST /api/personas/:id/wizard` (10-step guided persona setup with AI memory extraction)
  - Includes Step Zero pre-onboarding education flow
  - Creates snapshot, extracts memories from wizard inputs, applies tone preferences
  - Saves `onboarding_context` field with all wizard responses for first-message generation
- **Voice-to-Text Transcription**:
  - `POST /api/transcribe` (transcribe audio to text using OpenAI Whisper)
  - Accepts audio file uploads (webm, wav, mp3, m4a)
  - Returns transcribed text for memory entry
- **Persona Booster / Accuracy Improvement**:
  - `POST /api/personas/:id/boost` (AI-powered persona analysis and recommendations)
  - Analyzes persona data, memories, journals, and settings
  - Returns structured recommendations: missing categories, suggested memories, tone adjustments, boundary flags
  - Frontend modal with interactive UI to apply suggestions
  - Auto-snapshot creation after applying recommendations
- **Snapshots Sub-Resource**:
  - `GET /api/personas/:id/snapshots`
  - `POST /api/personas/:id/snapshots` (creates versioned persona states)
  - `POST /api/personas/:id/snapshots/:snapshotId/restore`
- **Emotional Calibration**:
  - `GET /api/personas/:id/settings`
  - `PUT /api/personas/:id/settings` (customizable AI communication style via tone modes, sliders for humor, honesty, sentimentality, energy, advice-giving, and boundary checkboxes).
- **Journal Resource (CRUD)**:
  - `GET /api/journal` (list all journal entries, sorted newest → oldest)
  - `GET /api/journal/:id` (get single journal entry)
  - `POST /api/journal` (create journal entry with optional persona linking, mood, tags, and AI reflection generation)
  - `PUT /api/journal/:id` (update journal entry)
  - `DELETE /api/journal/:id` (delete journal entry)
  - AI Reflection Engine: Optional AI-generated insights using OpenAI GPT-4o-mini with gentle, grounding, non-prescriptive tone
  - Reflection uses persona memories as context when persona_id is linked
- **Examples Resource (CRUD)**: `GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id` (in-memory only).

### Data Storage

- **Personas and Memories**: Stored in a JSON file (`src/personas/personas.json`) for persistence across sessions.
  - Each persona includes `onboarding_context` field containing wizard responses (personality, communication_style, humor, date_passed, relationship_end, circumstances, memories, conversations)
  - `onboarding_context` is saved in snapshots for complete state preservation
  - Used for generating warm, personalized first messages after wizard completion
- **Journal Entries**: Stored in a JSON file (`src/journal/journal.json`) for persistence across sessions.
- **Examples**: Stored in an in-memory JavaScript Map, resetting on server restart.
- UUID generation for unique identifiers using Node.js crypto.randomUUID().
- Timestamps (`created_at`, `updated_at`) automatically managed.

### Logging & Monitoring

- **Request Logging**: Morgan middleware provides 'dev' format logging for all HTTP requests.
- **Error Logging**: All errors are logged to the console with details; stack traces are included in development mode.

## External Dependencies

### Runtime Dependencies

- `express`: Web application framework.
- `cors`: Middleware for Cross-Origin Resource Sharing.
- `morgan`: HTTP request logger middleware.
- `dotenv`: Loads environment variables from a `.env` file.
- `openai`: Official OpenAI Node.js client library for interacting with the GPT-4o-mini model.
- `swagger-ui-express`: Serves auto-generated API documentation via Swagger UI.
- `swagger-jsdoc`: Generates OpenAPI specification from JSDoc comments.

### Development Dependencies

- `tsx`: TypeScript execution for server entry point.
- `typescript`: Type checking for the project.
- `@types/express`, `@types/cors`, `@types/morgan`, `@types/swagger-ui-express`, `@types/swagger-jsdoc`, `@types/node`: Type definitions for respective libraries and Node.js.

## Frontend Features

### Conversation Room

The Conversation Room is a warm, emotionally grounded chat interface that serves as the primary space for talking with a loved one's persona.

**Visual Design**
- Soft, warm color palette using gradients (#f8f4f0, #f5ede5) with earthy accent colors (#d4a574, #c8956a)
- Three-section layout: header with persona avatar and controls, scrollable messages area, footer with input
- Persona avatar displays initials in a circular badge
- Messages have distinct styling: user messages (right-aligned, warm gradient) vs persona messages (left-aligned, white with subtle border)
- First messages after wizard completion have special enhanced styling to emphasize the moment

**Text Size Accessibility**
- Segmented control in header allows toggling between "Normal" and "Large" text sizes
- Preference persists in localStorage (`everspeak_chat_text_size`)
- Large mode increases font size, line height, and padding for better readability (especially helpful for older users)

**Voice UI Hook (Preview)**
- Toggle switch in header labeled "Voice responses (preview)"
- UI-only at this stage - no actual TTS functionality yet
- Prepares users for future voice playback features

**Room States**
1. **No Persona Selected**: Shows empty state message prompting user to select or create a persona
2. **Incomplete Setup**: Displays message asking user to complete wizard setup, with "Continue Setup" button
3. **Ready**: Shows conversation interface with persona name, subtitle referencing shared memories

**First Conversation Experience**
- After wizard completion, conversation room is scrolled into view with a temporary highlight glow effect
- Pre-roll message appears: "EverSpeak is gently gathering what you've shared about this person…" with animated loading dots
- After ~2 seconds, pre-roll is removed and the AI-generated first message fades in
- First message has special styling (enhanced background, border) to mark the significance of the moment
- Uses `onboarding_context` from wizard for warm, therapeutic, personalized greeting

**Message Features**
- All persona messages include grounding line: "Based on the memories you've shared about [name]."
- "Doesn't sound like them?" link enables strict mode for more accurate responses
- Smooth fade-in animations for all messages
- Auto-scroll to newest message
- Healthy use nudge appears after extended conversation sessions
- Strict mode indicator shows when stricter persona adherence is active

**Optional Controls**
- Emotional state and tone mode selectors are visually de-emphasized as "Optional: mood" and "Optional: tone"
- Placed above main input area with smaller, subdued styling
- Don't feel like required form fields - reinforce that conversation can be natural and unstructured

**Responsive Design**
- Adapts layout for different screen sizes
- Controls stack vertically on smaller screens
- Message bubbles maintain readability across devices