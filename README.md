# Everspeak Backend

A professional Node.js + Express REST API with organized folder structure, comprehensive error handling, validation, logging, and API documentation.

## 🚀 Features

- **Express Server** configured via environment variable (default port 3000, Replit uses 5000)
- **AI-Powered Conversations** using OpenAI GPT-4o-mini
- **Loved Ones Persona System** - Store and manage deceased loved ones' personalities with memories
- **Memory-Grounded AI** - Automatically loads persona memories for contextual responses
- **JSON File Storage** - Reliable file-based storage with UUID generation
- **Complete CRUD Operations** - Personas and memories with full validation
- **Environment Configuration** using dotenv
- **Request Logging** with Morgan
- **Error Handling Middleware** for robust error management
- **Input Validation** middleware with type checking and partial update support
- **Swagger/OpenAPI Documentation** at `/api-docs` for all 13 endpoints
- **Graceful Fallbacks** - AI endpoint falls back to stub response if OpenAI is unavailable
- **Organized Folder Structure**:
  ```
  /src
    /routes       - API route definitions
    /controllers  - Business logic and request handlers
    /personas     - Persona storage and utilities
    /utils        - Utility functions, validation, error handling
  /server
    index.ts      - Main server entry point
  ```

## 📦 Installation

```bash
npm install
```

## 🔧 Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=sk-your-api-key-here
```

**Required Environment Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key for AI-powered message responses (get one at https://platform.openai.com/api-keys)

**Optional Environment Variables:**
- `PORT` - Server port (default: 3000, Replit: 5000)
- `NODE_ENV` - Environment mode (development/production)

**Note**: On Replit, the PORT environment variable is automatically set to 5000 (the only non-firewalled port). The server will use PORT from environment if set, otherwise defaults to 3000.

## 🏃 Running the Server

### Development Mode
```bash
npm run dev
```

The server will start on the port specified in the PORT environment variable (defaults to 3000, or 5000 on Replit)

## 📚 API Documentation

Once the server is running, access the interactive Swagger API documentation at:
```
http://localhost:PORT/api-docs
```
(Replace PORT with your configured port - 3000 by default, 5000 on Replit)

## 🛣️ Available Endpoints

### Test Endpoint
- **GET** `/api/test`
  - Returns: `{ ok: true }`
  - Purpose: Verify the API is running

### Message Endpoint (AI-Powered)
- **POST** `/api/message` - Process a conversational message using OpenAI
  ```json
  {
    "user_message": "Tell me about your favorite memory",
    "persona_id": "uuid-of-persona",
    "emotional_state": "nostalgic",
    "tone_mode": "warm",
    "memory_bank": "We used to go fishing every summer at the lake."
  }
  ```
  - **Required**: `user_message` (string)
  - **Optional**: `persona_id` (UUID - auto-loads persona memories), `emotional_state`, `tone_mode`, `memory_bank`
  - **Uses**: OpenAI GPT-4o-mini for AI-powered responses
  - **Features**:
    - Automatically loads persona memories when `persona_id` is provided
    - Simulates personality based on persona's stored memories
    - Emotionally intelligent and context-aware responses
    - Falls back to stub response if AI service is unavailable
  - Returns:
  ```json
  {
    "success": true,
    "data": {
      "reply": "One of my favorite memories has to be those summers...",
      "meta": {
        "persona_id": "uuid-of-persona",
        "persona_name": "Jimmy",
        "emotional_state": "nostalgic",
        "tone_mode": "warm",
        "memories_used": "We used to go fishing every summer at the lake."
      }
    },
    "message": "Message processed successfully"
  }
  ```

### Personas CRUD
- **GET** `/api/personas` - Get all personas
  - Returns list of all loved ones personas with their memories
- **GET** `/api/personas/:id` - Get persona by ID
  - Returns single persona with full details
- **POST** `/api/personas` - Create new persona
  ```json
  {
    "name": "Jimmy",
    "relationship": "Brother",
    "description": "My older brother who loved fishing"
  }
  ```
  - **Required**: `name` (string)
  - **Optional**: `relationship` (string), `description` (string)
- **PUT** `/api/personas/:id` - Update persona (partial updates supported)
  ```json
  {
    "name": "James",
    "description": "Updated description"
  }
  ```
- **DELETE** `/api/personas/:id` - Delete persona and all associated memories

### Persona Memories CRUD
- **GET** `/api/personas/:id/memories` - Get all memories for a persona
- **POST** `/api/personas/:id/memories` - Add memory to persona
  ```json
  {
    "category": "humor",
    "text": "Always made me laugh with his silly jokes",
    "weight": 2.5
  }
  ```
  - **Required**: `category` (enum: humor, regrets, childhood, advice, personality, misc), `text` (string)
  - **Optional**: `weight` (number 0.1-5.0, default: 1.0) - importance/significance of memory
- **PUT** `/api/personas/:id/memories/:memoryId` - Update memory (partial updates)
  ```json
  {
    "text": "Updated memory text",
    "weight": 3.0
  }
  ```
- **DELETE** `/api/personas/:id/memories/:memoryId` - Delete specific memory

### Examples CRUD
- **GET** `/api/examples` - Get all examples
- **GET** `/api/examples/:id` - Get example by ID
- **POST** `/api/examples` - Create new example (name required, min 3 chars)
  ```json
  {
    "name": "Example Name",
    "description": "Optional description"
  }
  ```
- **PUT** `/api/examples/:id` - Update example (partial updates supported)
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description"
  }
  ```
- **DELETE** `/api/examples/:id` - Delete example

## 🏗️ Project Structure

```
everspeak-backend/
├── server/
│   └── index.ts                   # Main server entry point
├── src/
│   ├── controllers/
│   │   ├── testController.js      # Test endpoint logic
│   │   ├── messageController.js   # AI message processing with persona context
│   │   ├── personaController.js   # Persona and memory CRUD operations
│   │   └── exampleController.js   # Example CRUD operations
│   ├── routes/
│   │   └── index.js               # Route definitions with Swagger docs
│   ├── personas/
│   │   ├── personas.json          # JSON storage for personas and memories
│   │   └── utils.js               # Persona utility functions (load, save, UUID)
│   └── utils/
│       ├── errorHandler.js        # Error handling middleware
│       └── validation.js          # Input validation middleware
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 🔒 Error Handling

The API includes comprehensive error handling:
- **Validation Errors** (400) - Invalid input data
- **Not Found** (404) - Resource doesn't exist
- **Server Errors** (500) - Internal server errors

All errors return JSON with consistent format:
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": []
}
```

## ✅ Input Validation

Routes with validation middleware automatically check:
- Required fields are present (for POST requests)
- Data types are correct
- String lengths meet minimum requirements (name: min 3 characters)
- Supports partial updates (PUT/PATCH - fields are optional)
- Returns detailed validation error messages with field-level details

## 📝 Logging

Morgan middleware logs all HTTP requests in development mode:
- Request method and URL
- Response status code
- Response time
- Request/response size

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **Morgan** - HTTP request logger
- **Swagger** - API documentation
- **UUID** - Unique ID generation

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
