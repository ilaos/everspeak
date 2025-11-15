# Everspeak Backend

## Overview

Everspeak Backend is a professional Node.js + Express REST API with organized folder structure, comprehensive error handling, input validation, request logging, and interactive Swagger/OpenAPI documentation. The project demonstrates best practices for building scalable backend APIs with proper separation of concerns between routes, controllers, and utilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (November 15, 2025)

- ✅ Restructured from fullstack template to backend-only API
- ✅ Implemented organized folder structure (/src/routes, /src/controllers, /src/utils)
- ✅ Added Express server with CORS, dotenv, and Morgan logging
- ✅ Created /api/test endpoint and full CRUD examples
- ✅ Implemented robust error handling with custom error classes
- ✅ Added input validation middleware with partial update support
- ✅ Set up Swagger/OpenAPI documentation at /api-docs
- ✅ All endpoints tested and verified working

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
- `/server/index.ts` - Main server entry point with Express app configuration
- `/src/routes/index.js` - API route definitions with Swagger JSDoc comments
- `/src/controllers/` - Business logic and request handlers
  - `testController.js` - Simple test endpoint
  - `exampleController.js` - Full CRUD operations with in-memory storage
- `/src/utils/` - Utility functions and middleware
  - `errorHandler.js` - Centralized error handling middleware and custom error classes
  - `validation.js` - Input validation middleware with smart partial update detection

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

### API Endpoints

**Test Endpoint**
- `GET /api/test` - Returns `{ok: true}` to verify API is operational

**Examples Resource (CRUD)**
- `GET /api/examples` - List all examples with count
- `GET /api/examples/:id` - Get single example by ID (404 if not found)
- `POST /api/examples` - Create new example (requires name, optional description)
- `PUT /api/examples/:id` - Update example (supports partial updates)
- `DELETE /api/examples/:id` - Delete example (404 if not found)

**Data Storage**
- In-memory Map-based storage for examples
- UUID generation using Node.js crypto.randomUUID()
- Sample data pre-populated for testing
- Timestamps (createdAt, updatedAt) automatically managed

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

**No Build Step Required**
- Server runs directly from source files
- No compilation or bundling needed
- TypeScript entry point transpiled on-the-fly by tsx
- JavaScript files in /src run natively as ES modules