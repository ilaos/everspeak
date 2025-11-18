# Everspeak Backend

## Overview
Everspeak Backend is a Node.js + Express REST API designed to power an AI-driven conversational companion system. Its core purpose is to enable users to create and interact with "personas" based on stored memories, offering a customizable and emotionally intelligent conversational experience. Key capabilities include full CRUD operations for personas and their memories, AI-powered message processing using OpenAI GPT-4o-mini, a robust grounding system, memory editing, persona snapshots, emotional calibration, voice-to-text memory entry, bulk memory import, a 10-step persona setup wizard, and a comprehensive journaling system with AI-powered reflections. The project aims to provide deeper, more personalized AI interactions and support emotional processing through guided journaling.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework & Runtime**: Node.js with Express.js, TypeScript for server entry, JavaScript for logic, ESM for modules.
- **Server Configuration**: Configurable port (defaults to 3000), CORS enabled, Morgan for logging, Express for body parsing, dotenv for environment variables.
- **Project Structure**: Organized by function (`routes`, `controllers`, `personas`, `journal`, `utils`, `public`).
- **Error Handling**: Centralized middleware with custom error classes (`AppError`, `ValidationError`) and environment-aware JSON responses.
- **Validation**: Smart middleware for create/update operations with field-level error messages.
- **API Documentation**: Swagger/OpenAPI 3.0, generated from JSDoc, accessible at `/api-docs`.

### API Endpoints
- **Test**: `GET /api/test`
- **AI Message Processing**: `POST /api/message` (GPT-4o-mini, persona context, emotional state, tone, memory bank, grounding, first message detection).
- **Personas (CRUD)**: `GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id` at `/api/personas`.
- **Memories (CRUD & Bulk Import)**: `GET`, `POST`, `PUT/:memoryId`, `DELETE/:memoryId` at `/api/personas/:id/memories`; `POST /api/personas/:id/memories/bulk-import`.
- **Setup Wizard**: `POST /api/personas/:id/wizard` (10-step guided setup, memory extraction, `onboarding_context` storage).
- **Voice-to-Text**: `POST /api/transcribe` (OpenAI Whisper for audio to text).
- **Persona Booster**: `POST /api/personas/:id/boost` (AI analysis for recommendations).
- **Snapshots**: `GET`, `POST`, `POST/:snapshotId/restore` at `/api/personas/:id/snapshots`.
- **Emotional Calibration**: `GET`, `PUT` at `/api/personas/:id/settings` (tone modes, emotional sliders, boundary checkboxes).
- **Journal (CRUD & AI Reflection)**: `GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id` at `/api/journal` (AI-generated insights, persona context).
- **Examples (CRUD)**: In-memory `GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id` at `/api/examples`.

### Data Storage
- **Personas and Memories**: Stored in `src/personas/personas.json`, including `onboarding_context` for wizard data and snapshot preservation.
- **Journal Entries**: Stored in `src/journal/journal.json`.
- **Examples**: In-memory JavaScript Map.
- UUIDs for identifiers; `created_at`, `updated_at` timestamps.

### Logging & Monitoring
- **Request Logging**: Morgan middleware for HTTP requests.
- **Error Logging**: Console logging with details; stack traces in development.

### Design & Visual Identity
- **Color Scheme**: Dark gradient background (`#222831` to `#393E46`), warm cream/beige panels (`#DFD0B8`), muted olive/tan buttons (`#948979`).
- **Typography**: Outfit for titles/buttons, system fonts for body text.
- **Logo**: Everspeak logo in header.
- **Navigation**: Hamburger menu, sliding sidebar with "Speak Now, Journal, Memories, Personas, Settings".

### Frontend Features
- **Wizard Auto-Reopen System**: Guides users through incomplete persona setup based on `onboarding_context.completed_at`. Features snooze functionality and a "Continue Setup" button.
- **Settings Sidebar Navigation**: Sliding overlay with persona setup status, "Restart Wizard" option, conversation preferences (text size, voice response preview), and safety sections.
- **Conversation Room**: Warm, emotionally grounded chat UI.
    - **Visuals**: Soft gradients, distinct message styling (user, persona, first message), persona avatar.
    - **Accessibility**: Text size toggle (Normal/Large), persists in local storage.
    - **Voice UI**: Toggle for future voice response preview.
    - **States**: Handles no persona, incomplete setup, and ready states.
    - **First Conversation**: Special pre-roll message and AI-generated first message styling.
    - **Message Features**: Grounding line, "Doesn't sound like them?" link for strict mode, healthy use nudges, smooth animations, auto-scroll.
    - **Optional Controls**: De-emphasized mood/tone selectors.
    - **Responsiveness**: Adapts for various screen sizes.

## External Dependencies

### Runtime Dependencies
- `express`: Web framework.
- `cors`: Cross-Origin Resource Sharing middleware.
- `morgan`: HTTP request logger.
- `dotenv`: Environment variable management.
- `openai`: OpenAI API client for GPT-4o-mini.
- `swagger-ui-express`: Swagger UI for API documentation.
- `swagger-jsdoc`: Generates OpenAPI spec from JSDoc.

### Development Dependencies
- `tsx`: TypeScript execution.
- `typescript`: Type checking.
- `@types/*`: Type definitions for runtime dependencies and Node.js.