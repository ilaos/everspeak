# Everspeak Backend

A professional Node.js + Express REST API with organized folder structure, comprehensive error handling, validation, logging, and API documentation.

## 🚀 Features

- **Express Server** configured via environment variable (default port 3000, Replit uses 5000)
- **Environment Configuration** using dotenv
- **Request Logging** with Morgan
- **Error Handling Middleware** for robust error management
- **Input Validation** middleware with partial update support
- **Swagger/OpenAPI Documentation** at `/api-docs`
- **Organized Folder Structure**:
  ```
  /src
    /routes       - API route definitions
    /controllers  - Business logic and request handlers
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
```

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

### Message Endpoint
- **POST** `/api/message` - Process a conversational message
  ```json
  {
    "user_message": "Hello EverSpeak!",
    "emotional_state": "excited",
    "tone_mode": "friendly",
    "memory_bank": "session_123"
  }
  ```
  - **Required**: `user_message` (string)
  - **Optional**: `emotional_state`, `tone_mode`, `memory_bank`
  - Returns:
  ```json
  {
    "success": true,
    "data": {
      "reply": "Yo Ish… I hear you: 'Hello EverSpeak!'. I'm not fully wired up yet, but this is where EverSpeak will answer you in my voice.",
      "meta": {
        "emotional_state": "excited",
        "tone_mode": "friendly",
        "memories_used": "session_123"
      }
    },
    "message": "Message processed successfully"
  }
  ```

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
│   │   ├── messageController.js   # Message processing endpoint
│   │   └── exampleController.js   # Example CRUD operations
│   ├── routes/
│   │   └── index.js               # Route definitions with Swagger docs
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
