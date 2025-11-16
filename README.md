# Everspeak Backend

A professional Node.js + Express REST API with organized folder structure, comprehensive error handling, validation, logging, and API documentation.

## 🚀 Features

- **🌐 Web UI** - Professional four-panel interface to interact with personas, memories, journals, and chat
  - Four-panel responsive layout (Persona, Memories, Journal, Chat)
  - Responsive design (desktop 4-column, mobile stacked)
  - Create and manage personas with memories and journal entries
  - Chat with AI using persona context
  - Accessible at the root URL `/`

### Core Features
- **Express Server** configured via environment variable (default port 3000, Replit uses 5000)
- **AI-Powered Conversations** using OpenAI GPT-4o-mini
- **Loved Ones Persona System** - Store and manage deceased loved ones' personalities with memories
- **Memory-Grounded AI** - Automatically loads persona memories for contextual responses
- **JSON File Storage** - Reliable file-based storage with UUID generation
- **Complete CRUD Operations** - Personas, memories, journals, snapshots with full validation
- **Environment Configuration** using dotenv
- **Request Logging** with Morgan
- **Error Handling Middleware** for robust error management
- **Input Validation** middleware with type checking and partial update support
- **Swagger/OpenAPI Documentation** at `/api-docs` for all endpoints
- **Graceful Fallbacks** - AI endpoint falls back to stub response if OpenAI is unavailable

### Quick-Start Persona Setup System
A comprehensive 7-component system designed to help users quickly create accurate AI personas:

1. **Bulk Memory Import** - Import large text blocks (letters, stories, notes) with AI-powered categorization and weighting
   - Intelligent text splitting into individual memories
   - Automatic category assignment (humor, childhood, regrets, advice, personality, misc)
   - Smart importance weighting (0.1-5.0)
   - One-click import with progress tracking

2. **6-Step Setup Wizard** - Guided persona creation with AI memory extraction
   - Step 1: Personality traits (3 descriptive words)
   - Step 2: Sense of humor (examples of jokes/humor)
   - Step 3: Favorite memories (free-form text)
   - Step 4: Memorable conversations (dialogue examples)
   - Step 5: Tone calibration (5 sliders for communication style)
   - Step 6: Generate (AI extracts and creates structured memories)
   - Auto-snapshot creation on completion

3. **Voice-to-Text Memory Entry** - Record memories using your voice
   - Click-to-record microphone button
   - OpenAI Whisper transcription
   - Supports webm, wav, mp3, m4a audio formats
   - Auto-fills transcribed text into memory form

4. **Persona Booster (Accuracy Audit)** - AI-powered recommendations to improve personas
   - Analyzes persona data, memories, journals, and settings
   - Provides 4 categories of recommendations:
     - Missing memory categories to fill gaps
     - Suggested new memories based on existing patterns
     - Tone calibration adjustments
     - Boundary/healthy-use flags
   - One-click application of suggestions
   - Auto-snapshot creation after changes

5. **Snapshot System** - Version control for personas
   - Save persona states (memories + settings) at any time
   - Restore previous versions
   - Auto-snapshots created by wizard and booster
   - Named snapshots with timestamps

6. **Emotional Calibration** - Customize AI communication style
   - 5 tone sliders: Humor, Honesty, Sentimentality, Energy, Advice-giving (0-5 scale)
   - 4 tone modes: Auto, Playful, Honest, Comforting, Balanced
   - 4 boundary checkboxes: Avoid regret spirals, No paranormal language, Soften sensitive topics, Prefer reassurance

7. **Journal System** - Process emotions with AI-powered reflections
   - Create journal entries with optional persona linking
   - Mood tracking and custom tags
   - AI-generated reflections using persona memories as context
   - Gentle, grounding, non-prescriptive tone
   - Full CRUD operations for entries

- **Organized Folder Structure**:
  ```
  /src
    /routes       - API route definitions
    /controllers  - Business logic and request handlers
    /personas     - Persona storage and utilities
    /utils        - Utility functions, validation, error handling
  /public
    index.html    - Web UI layout
    styles.css    - UI styling
    app.js        - Frontend logic
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

## 🌐 Using the Web UI

Once the server is running, open your browser and navigate to:
```
http://localhost:PORT
```
(Replace PORT with your configured port - 3000 by default, 5000 on Replit)

### Web UI Features

The web interface provides three main panels:

**Persona Panel (Left)**
- Select from existing personas in the dropdown
- View persona details (name, relationship, description)
- Create new personas with the form below

**Memory Panel (Middle)**
- View all memories for the selected persona
- Add new memories with category, text, and importance weight (0.1-5.0)
- Delete memories with a confirmation dialog
- Memory categories: humor, regrets, childhood, advice, personality, misc

**Chat Panel (Right)**
- Have conversations with the selected persona
- AI responses are grounded in the persona's stored memories
- Control emotional state and tone mode for nuanced conversations
- Chat history is preserved within each session

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
- **POST** `/api/personas/:id/memories/bulk-import` - Bulk import memories with AI categorization
  ```json
  {
    "text": "Long text containing multiple memories...",
    "auto_categorize": true
  }
  ```
  - **Required**: `text` (string)
  - **Optional**: `auto_categorize` (boolean, default: true)
  - Automatically splits text, categorizes, and weights each memory using AI

### Setup Wizard
- **POST** `/api/personas/:id/wizard` - Process 6-step wizard inputs and generate memories
  ```json
  {
    "personality_traits": "warm, funny, gentle",
    "sense_of_humor": "He loved dad jokes...",
    "favorite_memories": "We went fishing every summer...",
    "memorable_conversations": "He once told me...",
    "tone_preferences": {
      "humor_level": 4,
      "honesty_level": 3,
      "sentimentality_level": 3,
      "energy_level": 3,
      "advice_level": 2
    }
  }
  ```
  - Uses AI to extract structured memories from free-form inputs
  - Automatically creates snapshot on completion

### Voice-to-Text Transcription
- **POST** `/api/transcribe` - Transcribe audio to text using OpenAI Whisper
  - Accepts multipart/form-data with audio file
  - Supported formats: webm, wav, mp3, m4a
  - Returns transcribed text for memory entry

### Persona Booster
- **POST** `/api/personas/:id/boost` - Get AI recommendations to improve persona accuracy
  - Analyzes persona memories, journals, and settings
  - Returns:
    - `missing_categories[]` - Memory categories not yet covered
    - `new_memories[]` - Suggested memories with category and weight
    - `tone_suggestions{}` - Recommended tone calibration adjustments
    - `boundary_flags[]` - Healthy-use warnings and suggestions

### Snapshots
- **GET** `/api/personas/:id/snapshots` - Get all snapshots for a persona
- **POST** `/api/personas/:id/snapshots` - Create a snapshot (versioned persona state)
  ```json
  {
    "name": "Before making changes"
  }
  ```
- **POST** `/api/personas/:id/snapshots/:snapshotId/restore` - Restore persona to snapshot state

### Emotional Calibration
- **GET** `/api/personas/:id/settings` - Get persona settings (tone modes, boundaries)
- **PUT** `/api/personas/:id/settings` - Update persona settings
  ```json
  {
    "default_tone_mode": "balanced",
    "humor_level": 4,
    "honesty_level": 3,
    "sentimentality_level": 3,
    "energy_level": 3,
    "advice_level": 2,
    "boundaries": {
      "avoid_regret_spirals": true,
      "no_paranormal_language": true,
      "soften_sensitive_topics": true,
      "prefer_reassurance": true
    }
  }
  ```

### Journal System
- **GET** `/api/journal` - Get all journal entries (sorted newest first)
- **GET** `/api/journal/:id` - Get single journal entry
- **POST** `/api/journal` - Create journal entry
  ```json
  {
    "persona_id": "uuid-optional",
    "title": "Journal title",
    "content": "Entry content...",
    "mood": "reflective",
    "tags": ["grief", "memories"],
    "generate_reflection": true
  }
  ```
  - **Required**: `title`, `content`
  - **Optional**: `persona_id`, `mood`, `tags[]`, `generate_reflection` (boolean)
  - AI reflection uses persona memories as context when persona_id is provided
- **PUT** `/api/journal/:id` - Update journal entry
- **DELETE** `/api/journal/:id` - Delete journal entry

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
