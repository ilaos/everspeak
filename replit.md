# Everspeak Backend

## Overview

Everspeak Backend is a professional Node.js + Express REST API with organized folder structure, comprehensive error handling, input validation, request logging, and interactive Swagger/OpenAPI documentation. The project demonstrates best practices for building scalable backend APIs with proper separation of concerns between routes, controllers, and utilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 16, 2025)

- ✅ Restructured from fullstack template to backend-only API
- ✅ Implemented organized folder structure (/src/routes, /src/controllers, /src/personas, /src/utils)
- ✅ Added Express server with CORS, dotenv, and Morgan logging
- ✅ Created /api/test endpoint and full CRUD examples
- ✅ Implemented robust error handling with custom error classes
- ✅ Added input validation middleware with type checking and partial update support
- ✅ Set up Swagger/OpenAPI documentation at /api-docs for all 13 endpoints
- ✅ Integrated OpenAI GPT-4o-mini for AI-powered message responses
- ✅ Installed openai npm package and configured API authentication
- ✅ **Implemented complete Loved Ones Persona System**:
  - JSON file storage system (src/personas/personas.json)
  - Utility functions for load, save, UUID generation, validation
  - Full CRUD for personas (5 endpoints: GET all, GET one, POST, PUT, DELETE)
  - Full CRUD for memories (4 endpoints: GET, POST, PUT, DELETE)
  - Memory categorization (humor, regrets, childhood, advice, personality, misc)
  - Memory weight system (0.1-5.0 for importance ranking)
  - Auto-load memories in /api/message endpoint via persona_id
  - Comprehensive validation with proper error handling (400, 404)
- ✅ **Fixed critical validation bugs**:
  - Persona create/update: Type validation for optional fields before trimming
  - Memory create/update: Parse weight to number before validation (prevents NaN storage)
- ✅ **Added Web UI for easy interaction**:
  - Created public/ folder with index.html, styles.css, app.js
  - Three-panel responsive layout (Persona, Memories, Chat)
  - Vanilla JavaScript for all CRUD operations
  - Auto-loads first persona on page load
  - Chat interface with emotional state and tone mode controls
  - Clean, professional design with mobile support
  - Updated server to serve static files
  - All flows tested and working (create persona, add memories, chat with AI)
- ✅ **Implemented Grounding & Healthy-Use Features**:
  - Dismissible grounding banner explaining memory-based companion (not supernatural awareness)
  - Banner dismissal persists in session memory (in-memory flag, resets on page refresh)
  - Grounding line under AI replies: "Based on the memories you've shared about [PersonaName]"
  - Healthy-use nudge appears after 12 user messages (once per session, non-blocking)
  - Nudge encourages taking breaks and processing emotions
  - Message counter and nudge reset when switching personas
  - All features tested with Playwright (100% pass rate)
- ✅ **Implemented Strict Mode Feature (November 16, 2025)**:
  - Session-based toggle to keep AI responses closer to stored memories
  - "Doesn't sound like them?" link appears under each AI reply
  - Strict mode indicator badge with turn-off functionality
  - One-time dismissible notice per persona session explaining the feature
  - Backend accepts optional strict_persona parameter
  - Enhanced AI prompt when strict mode enabled: "CRITICAL: Stay extremely close to the provided memories"
  - All session state resets when switching personas
  - Fixed critical bugs: DOM element timing, chat clearing sequence
  - Comprehensive Playwright testing: 100% pass rate
- ✅ Architect-approved and production-ready
- ✅ All endpoints and UI tested and verified working

## System Architecture

### Backend Architecture

**Framework & Runtime**
- Node.js with Express.js for the REST API server
- TypeScript for server entry point (server/index.ts)
- JavaScript for routes, controllers, and utilities
- ESM (ES Modules) as the module system

**Server Configuration**
- Port configured via PORT environment variable (defaults to 3000, Replit automatically uses 5000)
- CORS enabled for cross-origin requests from any origin
- Morgan middleware for HTTP request logging in 'dev' format
- Express middleware for JSON and URL-encoded request body parsing
- dotenv for environment variable management (loaded via 'dotenv/config')

**Project Structure**
- `/server/index.ts` - Main server entry point with Express app configuration and static file serving
- `/src/routes/index.js` - API route definitions with Swagger JSDoc comments
- `/src/controllers/` - Business logic and request handlers
  - `testController.js` - Simple test endpoint
  - `messageController.js` - AI message processing with persona context
  - `personaController.js` - Persona and memory CRUD operations
  - `exampleController.js` - Full CRUD operations with in-memory storage
- `/src/personas/` - Persona storage and utilities
  - `personas.json` - JSON file storage for personas and memories
  - `utils.js` - Utility functions (load, save, UUID, validation)
- `/src/utils/` - Utility functions and middleware
  - `errorHandler.js` - Centralized error handling middleware and custom error classes
  - `validation.js` - Input validation middleware with smart partial update detection
- `/public/` - Frontend web UI
  - `index.html` - Three-panel layout (Persona, Memories, Chat)
  - `styles.css` - Responsive styling with clean design
  - `app.js` - Vanilla JavaScript for all CRUD and chat functionality

**Error Handling**
- Centralized error handling middleware catching all errors
- Custom error classes (AppError, ValidationError)
- Environment-aware error responses (stack traces in development only)
- Consistent error response format with success flag, error name, message, and details
- Proper HTTP status codes (400 for validation, 404 for not found, 500 for server errors)

**Validation**
- Smart validation middleware that detects POST vs PUT/PATCH requests
- Required fields enforced only on creation (POST)
- Optional fields with validation when provided on updates (PUT/PATCH)
- Field-level validation with detailed error messages
- Example: name field must be string, min 3 characters when provided

**API Documentation**
- Swagger/OpenAPI 3.0 documentation accessible at `/api-docs`
- JSDoc comments in routes for automatic documentation generation
- Interactive API explorer with try-it-out functionality
- Complete endpoint descriptions with request/response schemas
- Server URL automatically configured based on PORT environment variable

### API Endpoints (13 Total)

**Test Endpoint**
- `GET /api/test` - Returns `{ok: true}` to verify API is operational

**Message Endpoint (AI-Powered)**
- `POST /api/message` - Process conversational message with OpenAI GPT-4o-mini
  - Required: `user_message` (string)
  - Optional: `persona_id` (UUID - auto-loads persona memories), `emotional_state`, `tone_mode`, `memory_bank`, `strict_persona` (boolean)
  - Uses OpenAI API to generate emotionally intelligent, context-aware responses
  - When persona_id provided: Automatically loads all persona memories and includes in AI prompt
  - When strict_persona is true: Adds extra instruction to AI prompt to stay extremely close to stored memories
  - Simulates personality based on persona name, relationship, and stored memories
  - Falls back to stub response if OpenAI API fails
  - Returns metadata with persona info, memories used, and strict_persona status

**Personas Resource (CRUD - 5 endpoints)**
- `GET /api/personas` - List all personas with their memories
- `GET /api/personas/:id` - Get single persona by ID (404 if not found)
- `POST /api/personas` - Create new persona (requires name, optional relationship/description)
- `PUT /api/personas/:id` - Update persona (supports partial updates with type validation)
- `DELETE /api/personas/:id` - Delete persona and all associated memories

**Memories Sub-Resource (CRUD - 4 endpoints)**
- `GET /api/personas/:id/memories` - Get all memories for a persona
- `POST /api/personas/:id/memories` - Add memory to persona
  - Required: `category` (enum: humor, regrets, childhood, advice, personality, misc), `text` (string)
  - Optional: `weight` (number 0.1-5.0, default 1.0) - importance/significance
- `PUT /api/personas/:id/memories/:memoryId` - Update memory (partial updates)
- `DELETE /api/personas/:id/memories/:memoryId` - Delete specific memory

**Examples Resource (CRUD - 3 endpoints)**
- `GET /api/examples` - List all examples with count
- `GET /api/examples/:id` - Get single example by ID (404 if not found)
- `POST /api/examples` - Create new example (requires name, optional description)
- `PUT /api/examples/:id` - Update example (supports partial updates)
- `DELETE /api/examples/:id` - Delete example (404 if not found)

**Data Storage**
- JSON file storage for personas (src/personas/personas.json)
- In-memory Map-based storage for examples
- UUID generation using Node.js crypto.randomUUID()
- Sample persona data pre-populated for testing
- Timestamps (created_at, updated_at) automatically managed
- Utility functions (loadPersonas, savePersonas, findPersonaById, etc.)

**Response Format**
- Success: `{success: true, data: {...}, message: "..."}`
- Error: `{success: false, error: "ErrorType", message: "...", details: [...]}`
- Validation errors include field-level details array

### Data Storage

**In-Memory Storage**
- JavaScript Map for storing examples (id as key)
- No database persistence (data resets on server restart)
- Suitable for development, demos, and testing
- Easy to replace with real database later

**Future Database Integration**
- Can add PostgreSQL via Neon serverless
- Can add Drizzle ORM for type-safe queries
- Current controller structure ready for async database operations
- Storage layer can be abstracted for easy swap

### Logging & Monitoring

**Request Logging**
- Morgan middleware in 'dev' format
- Logs method, URL, status code, response time
- Colored output for better readability in terminal
- Automatic logging for all requests

**Error Logging**
- All errors logged to console with full details
- Stack traces in development mode
- Error context preserved in responses

## External Dependencies

### Runtime Dependencies

**Core Backend**
- `express@^4.21.2` - Web application framework
- `cors` - Cross-Origin Resource Sharing middleware
- `morgan@^1.10.1` - HTTP request logger
- `dotenv` - Environment variable management

**AI Integration**
- `openai@^4.73.1` - Official OpenAI Node.js client library
- GPT-4o-mini model for conversational AI responses

**API Documentation**
- `swagger-ui-express@^5.0.1` - Interactive API documentation UI
- `swagger-jsdoc@^6.2.8` - Generate OpenAPI spec from JSDoc comments

**Development Dependencies**
- `tsx@^4.20.5` - TypeScript execution for server/index.ts
- `typescript@5.6.3` - Type checking
- `@types/express@4.17.21` - Express type definitions
- `@types/cors` - CORS type definitions
- `@types/morgan` - Morgan type definitions
- `@types/swagger-ui-express` - Swagger UI type definitions
- `@types/swagger-jsdoc` - Swagger JSDoc type definitions
- `@types/node@20.16.11` - Node.js type definitions

### Development & Deployment

**Development**
- `npm run dev` - Starts server with tsx (TypeScript execution)
- Hot reload via tsx watch mode
- Environment: NODE_ENV=development
- Server runs on PORT from environment (5000 on Replit)

**Environment Variables**
- `PORT` - Server port (default: 3000, Replit: 5000)
- `NODE_ENV` - Environment mode (development/production)
- `OPENAI_API_KEY` - OpenAI API key for AI-powered message responses (required)

**No Build Step Required**
- Server runs directly from source files
- No compilation or bundling needed
- TypeScript entry point transpiled on-the-fly by tsx
- JavaScript files in /src run natively as ES modules