# Everspeak Backend

## Overview

Everspeak Backend is a professional Node.js + Express REST API designed for building scalable backend applications. It features an organized folder structure, comprehensive error handling, input validation, request logging, and interactive Swagger/OpenAPI documentation. The project's core purpose is to power an AI-driven conversational companion system, allowing users to create and interact with "personas" based on stored memories. Key capabilities include full CRUD operations for personas and their memories, AI-powered message processing using OpenAI GPT-4o-mini, a robust grounding system to manage user expectations, and advanced features like memory editing, persona snapshots, and emotional calibration for AI responses. The overarching vision is to provide a customizable and emotionally intelligent conversational experience, enabling deeper and more personalized interactions with AI companions based on curated memories.

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
- `/src/controllers/`: Business logic and request handlers for test, message, persona, and example operations.
- `/src/personas/`: Persona storage and utility functions.
- `/src/utils/`: Utility functions and middleware, including error handling and input validation.
- `/public/`: Frontend web UI assets (HTML, CSS, JS) for a three-panel responsive layout (Persona, Memories, Chat).

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
- **Snapshots Sub-Resource**:
  - `GET /api/personas/:id/snapshots`
  - `POST /api/personas/:id/snapshots` (creates versioned persona states)
  - `POST /api/personas/:id/snapshots/:snapshotId/restore`
- **Emotional Calibration**:
  - `GET /api/personas/:id/settings`
  - `PUT /api/personas/:id/settings` (customizable AI communication style via tone modes, sliders for humor, honesty, sentimentality, energy, advice-giving, and boundary checkboxes).
- **Examples Resource (CRUD)**: `GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id` (in-memory only).

### Data Storage

- **Personas and Memories**: Stored in a JSON file (`src/personas/personas.json`) for persistence across sessions.
- **Examples**: Stored in an in-memory JavaScript Map, resetting on server restart.
- UUID generation for unique identifiers.
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