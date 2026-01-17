import express from 'express';
import multer from 'multer';
import path from 'path';
import { testController } from '../controllers/testController.js';
import { exampleController } from '../controllers/exampleController.js';
import { handleMessage, handleFirstContact } from '../controllers/messageController.js';
import { personaController } from '../controllers/personaController.js';
import { transcriptionController } from '../controllers/transcriptionController.js';
import { onboardingController } from '../controllers/onboardingController.js';
import { personaEngineController } from '../controllers/personaEngineController.js';
import { voiceController } from '../controllers/voiceController.js';
import { validateExample } from '../utils/validation.js';
import {
  listJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../controllers/journalController.js';

const router = express.Router();

// Configure multer for audio file uploads (transcription)
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit (OpenAI Whisper max)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/m4a'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: webm, wav, mp3, m4a'));
    }
  }
});

// Configure multer for onboarding media uploads (photos, audio, video)
const onboardingMediaUpload = multer({
  dest: 'uploads/onboarding/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for video files
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      // Photos
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
      // Audio
      'audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/aac',
      // Video
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Supported: jpg, png, gif, webp, heic, mp3, wav, m4a, mp4, webm, mov, avi'));
    }
  }
});

// Multer error handler middleware
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
}

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     description: Returns a simple test response to verify the API is working
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */
router.get('/test', testController.getTest);

/**
 * @swagger
 * /api/message:
 *   post:
 *     summary: Process a conversational message
 *     description: Send a message to EverSpeak AI and receive a response
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_message
 *             properties:
 *               user_message:
 *                 type: string
 *                 description: The message from the user
 *                 example: "Hey, how are you doing today?"
 *               emotional_state:
 *                 type: string
 *                 description: Optional emotional state context
 *                 example: "happy"
 *               tone_mode:
 *                 type: string
 *                 description: Optional tone mode for the response
 *                 example: "casual"
 *               memory_bank:
 *                 type: string
 *                 description: Optional memory context
 *                 example: "previous_conversation_id"
 *               persona_id:
 *                 type: string
 *                 description: Optional persona ID to load memories from
 *                 example: "uuid-of-persona"
 *     responses:
 *       200:
 *         description: Message processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         emotional_state:
 *                           type: string
 *                         tone_mode:
 *                           type: string
 *                         memories_used:
 *                           type: string
 *                         persona_id:
 *                           type: string
 *                         persona_name:
 *                           type: string
 *                         memory_count:
 *                           type: number
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error - user_message is required
 *       404:
 *         description: Persona not found (if persona_id provided)
 */
router.post('/message', handleMessage);

/**
 * @swagger
 * /api/first-contact:
 *   post:
 *     summary: Generate first contact icebreaker message
 *     description: Auto-initiates a conversation using Q23 ("If they walked in right now") data to generate an authentic first message from the persona
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - persona_id
 *             properties:
 *               persona_id:
 *                 type: string
 *                 description: The persona ID to generate first contact for
 *                 example: "uuid-of-persona"
 *               session_id:
 *                 type: string
 *                 description: Optional session ID for Flight Recorder logging
 *                 example: "session-uuid"
 *               debug_mode:
 *                 type: boolean
 *                 description: Enable scrutiny mode for this request
 *                 example: false
 *     responses:
 *       200:
 *         description: First contact message generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     first_message:
 *                       type: string
 *                       description: The generated icebreaker message
 *                     persona_id:
 *                       type: string
 *                     persona_name:
 *                       type: string
 *                     session_id:
 *                       type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         q23_source:
 *                           type: string
 *                           description: The Q23 data used as template
 *                         generated_at:
 *                           type: string
 *                           format: date-time
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error - persona_id is required
 *       404:
 *         description: Persona not found or no onboarding data
 */
router.post('/first-contact', handleFirstContact);

/**
 * @swagger
 * /api/transcribe:
 *   post:
 *     summary: Transcribe audio to text
 *     description: Upload an audio file and receive a text transcription using OpenAI Whisper
 *     tags: [Transcription]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file to transcribe (webm, wav, mp3, m4a)
 *     responses:
 *       200:
 *         description: Transcription successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 text:
 *                   type: string
 *                   example: "This is the transcribed text from the audio file."
 *       400:
 *         description: Bad request (no file or invalid format)
 *       500:
 *         description: Transcription failed
 */
router.post('/transcribe', upload.single('audio'), handleMulterError, transcriptionController.transcribe);

/**
 * @swagger
 * /api/extract-name:
 *   post:
 *     summary: Extract display name from transcript
 *     description: Uses AI to extract the primary name/nickname from a verbose transcript for display in subsequent questions
 *     tags: [Transcription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript
 *             properties:
 *               transcript:
 *                 type: string
 *                 description: The full transcript to extract a name from
 *                 example: "His professional name was Jim, but anyone close to him called him Jimmy"
 *               type:
 *                 type: string
 *                 enum: [name, user_name]
 *                 description: Type of extraction (name = loved one, user_name = user's name)
 *                 default: name
 *     responses:
 *       200:
 *         description: Name extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 display_name:
 *                   type: string
 *                   description: The extracted name for display
 *                   example: "Jimmy"
 *                 full_transcript:
 *                   type: string
 *                   description: The original transcript (preserved for context)
 *       400:
 *         description: Transcript is required
 *       500:
 *         description: Extraction failed
 */
router.post('/extract-name', transcriptionController.extractName);

/**
 * @swagger
 * /api/examples:
 *   get:
 *     summary: Get all examples
 *     description: Retrieve a list of all example items
 *     tags: [Examples]
 *     responses:
 *       200:
 *         description: List of examples
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/examples', exampleController.getAll);

/**
 * @swagger
 * /api/examples/{id}:
 *   get:
 *     summary: Get example by ID
 *     description: Retrieve a single example item by its ID
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The example ID
 *     responses:
 *       200:
 *         description: Example found
 *       404:
 *         description: Example not found
 */
router.get('/examples/:id', exampleController.getById);

/**
 * @swagger
 * /api/examples:
 *   post:
 *     summary: Create a new example
 *     description: Create a new example item with validation
 *     tags: [Examples]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Example Name"
 *               description:
 *                 type: string
 *                 example: "This is an example description"
 *     responses:
 *       201:
 *         description: Example created successfully
 *       400:
 *         description: Validation error
 */
router.post('/examples', validateExample, exampleController.create);

/**
 * @swagger
 * /api/examples/{id}:
 *   put:
 *     summary: Update an example
 *     description: Update an existing example item
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Example updated successfully
 *       404:
 *         description: Example not found
 */
router.put('/examples/:id', validateExample, exampleController.update);

/**
 * @swagger
 * /api/examples/{id}:
 *   delete:
 *     summary: Delete an example
 *     description: Delete an example item by ID
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Example deleted successfully
 *       404:
 *         description: Example not found
 */
router.delete('/examples/:id', exampleController.delete);

// Persona Routes

/**
 * @swagger
 * /api/personas:
 *   get:
 *     summary: Get all personas
 *     description: Retrieve a list of all loved one personas
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: List of personas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       relationship:
 *                         type: string
 *                       description:
 *                         type: string
 *                       memories:
 *                         type: array
 *                       created_at:
 *                         type: string
 *                       updated_at:
 *                         type: string
 *                 count:
 *                   type: number
 */
router.get('/personas', personaController.getAll);

/**
 * @swagger
 * /api/personas:
 *   post:
 *     summary: Create a new persona
 *     description: Create a new loved one persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jimmy"
 *               relationship:
 *                 type: string
 *                 example: "Brother"
 *               description:
 *                 type: string
 *                 example: "Funny, caring brother who loved fishing"
 *     responses:
 *       201:
 *         description: Persona created successfully
 *       400:
 *         description: Validation error
 */
router.post('/personas', personaController.create);

/**
 * @swagger
 * /api/personas/{id}:
 *   get:
 *     summary: Get persona by ID
 *     description: Retrieve a single persona by its ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: Persona found
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:id', personaController.getById);

/**
 * @swagger
 * /api/personas/{id}:
 *   put:
 *     summary: Update a persona
 *     description: Update an existing persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               relationship:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Persona updated successfully
 *       404:
 *         description: Persona not found
 */
router.put('/personas/:id', personaController.update);

/**
 * @swagger
 * /api/personas/{id}:
 *   delete:
 *     summary: Delete a persona
 *     description: Delete a persona by ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Persona deleted successfully
 *       404:
 *         description: Persona not found
 */
router.delete('/personas/:id', personaController.delete);

// Memory Routes

/**
 * @swagger
 * /api/personas/{id}/memories:
 *   get:
 *     summary: Get all memories for a persona
 *     description: Retrieve all memories associated with a persona
 *     tags: [Memories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: List of memories
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:id/memories', personaController.getMemories);

/**
 * @swagger
 * /api/personas/{id}/memories:
 *   post:
 *     summary: Add a memory to a persona
 *     description: Create a new memory for a persona
 *     tags: [Memories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - text
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [humor, regrets, childhood, advice, personality, misc]
 *                 example: "childhood"
 *               text:
 *                 type: string
 *                 example: "We used to go fishing every summer at the lake"
 *               weight:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 5.0
 *                 example: 1.5
 *     responses:
 *       201:
 *         description: Memory created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Persona not found
 */
router.post('/personas/:id/memories', personaController.createMemory);

/**
 * @swagger
 * /api/personas/{id}/memories/bulk-import:
 *   post:
 *     summary: Bulk import memories
 *     description: Import multiple memories at once with automatic AI categorization and weighting
 *     tags: [Memories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Raw text to import (will be split into discrete memories)
 *                 example: "He loved fishing at the lake. Always told dad jokes. Gave great advice about work."
 *               auto_weight:
 *                 type: boolean
 *                 description: Whether to use AI for automatic categorization and weighting
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Memories imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 imported:
 *                   type: number
 *                 memories:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Persona not found
 */
router.post('/personas/:id/memories/bulk-import', personaController.bulkImportMemories);

/**
 * @swagger
 * /api/personas/{id}/wizard:
 *   post:
 *     summary: Process wizard setup
 *     description: Complete persona setup wizard with multi-step inputs to automatically generate memories
 *     tags: [Wizard]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wizard_inputs
 *             properties:
 *               wizard_inputs:
 *                 type: object
 *                 properties:
 *                   personality:
 *                     type: string
 *                     description: Personality description
 *                   humor:
 *                     type: string
 *                     description: Humor and playfulness details
 *                   memories:
 *                     type: string
 *                     description: Important memories
 *                   conversations:
 *                     type: string
 *                     description: Unfinished conversations or regrets
 *                   tone_preferences:
 *                     type: object
 *                     properties:
 *                       humor_level:
 *                         type: number
 *                       honesty_level:
 *                         type: number
 *                       sentimentality_level:
 *                         type: number
 *                       energy_level:
 *                         type: number
 *                       advice_level:
 *                         type: number
 *     responses:
 *       201:
 *         description: Wizard completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 memories_created:
 *                   type: number
 *                 memories:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Persona not found
 */
router.post('/personas/:id/wizard', personaController.processWizard);

/**
 * @swagger
 * /api/wizard/acknowledgment:
 *   post:
 *     summary: Generate personalized acknowledgment
 *     description: Generate AI-powered acknowledgment based on user's wizard answer
 *     tags: [Wizard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *                 description: The wizard question that was asked
 *                 example: "What was their sense of humor like?"
 *               answer:
 *                 type: string
 *                 description: The user's answer to the question
 *                 example: "He always told dad jokes and loved making people laugh"
 *               personaName:
 *                 type: string
 *                 description: Optional name of the persona
 *                 example: "Jimmy"
 *     responses:
 *       200:
 *         description: Acknowledgment generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 acknowledgment:
 *                   type: string
 *                   example: "That's beautiful. Dad jokes have a way of sticking with us - they're simple, but they carry so much warmth. It sounds like Jimmy knew how to bring lightness into a room."
 *       400:
 *         description: Validation error
 */
router.post('/wizard/acknowledgment', personaController.generateAcknowledgment);

/**
 * @swagger
 * /api/personas/{id}/boost:
 *   post:
 *     summary: Analyze persona and get improvement recommendations
 *     description: Uses AI to analyze the persona and provide structured recommendations for missing categories, new memories, tone adjustments, and boundary warnings
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Persona ID
 *     responses:
 *       200:
 *         description: Analysis complete with recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recommendations:
 *                   type: object
 *                   properties:
 *                     missing_categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["childhood", "humor"]
 *                     new_memories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           text:
 *                             type: string
 *                           weight:
 *                             type: number
 *                     tone_suggestions:
 *                       type: object
 *                       properties:
 *                         humor:
 *                           type: number
 *                         honesty:
 *                           type: number
 *                         sentimentality:
 *                           type: number
 *                         energy:
 *                           type: number
 *                         advice_giving:
 *                           type: number
 *                     boundary_flags:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Persona not found
 *       500:
 *         description: Analysis failed
 */
router.post('/personas/:id/boost', personaController.boostPersona);

/**
 * @swagger
 * /api/personas/{id}/memories/{memoryId}:
 *   put:
 *     summary: Update a memory
 *     description: Update an existing memory
 *     tags: [Memories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *       - in: path
 *         name: memoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The memory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [humor, regrets, childhood, advice, personality, misc]
 *               text:
 *                 type: string
 *               weight:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 5.0
 *     responses:
 *       200:
 *         description: Memory updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Persona or memory not found
 */
router.put('/personas/:id/memories/:memoryId', personaController.updateMemory);

/**
 * @swagger
 * /api/personas/{id}/memories/{memoryId}:
 *   delete:
 *     summary: Delete a memory
 *     description: Delete a memory from a persona
 *     tags: [Memories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *       - in: path
 *         name: memoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The memory ID
 *     responses:
 *       200:
 *         description: Memory deleted successfully
 *       404:
 *         description: Persona or memory not found
 */
router.delete('/personas/:id/memories/:memoryId', personaController.deleteMemory);

/**
 * @swagger
 * /api/personas/{id}/snapshots:
 *   get:
 *     summary: Get all snapshots for a persona
 *     description: Retrieve all saved snapshots (versions) for a persona
 *     tags: [Snapshots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: Snapshots retrieved successfully
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:id/snapshots', personaController.getSnapshots);

/**
 * @swagger
 * /api/personas/{id}/snapshots:
 *   post:
 *     summary: Create a new snapshot
 *     description: Save a snapshot of the current persona state
 *     tags: [Snapshots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional name for the snapshot
 *                 example: "Before memory edit"
 *     responses:
 *       201:
 *         description: Snapshot created successfully
 *       404:
 *         description: Persona not found
 */
router.post('/personas/:id/snapshots', personaController.createSnapshot);

/**
 * @swagger
 * /api/personas/{id}/snapshots/{snapshotId}/restore:
 *   post:
 *     summary: Restore a persona from a snapshot
 *     description: Restore persona state from a saved snapshot
 *     tags: [Snapshots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *       - in: path
 *         name: snapshotId
 *         required: true
 *         schema:
 *           type: string
 *         description: The snapshot ID
 *     responses:
 *       200:
 *         description: Persona restored successfully
 *       404:
 *         description: Persona or snapshot not found
 */
router.post('/personas/:id/snapshots/:snapshotId/restore', personaController.restoreSnapshot);

/**
 * @swagger
 * /api/personas/{id}/settings:
 *   get:
 *     summary: Get persona settings
 *     description: Get the emotional calibration settings for a persona
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:id/settings', personaController.getSettings);

/**
 * @swagger
 * /api/personas/{id}/settings:
 *   put:
 *     summary: Update persona settings
 *     description: Update the emotional calibration settings for a persona
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               default_tone_mode:
 *                 type: string
 *                 enum: [auto, comforting, honest, playful, balanced]
 *               humor_level:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               honesty_level:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               sentimentality_level:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               energy_level:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               advice_level:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *               boundaries:
 *                 type: object
 *                 properties:
 *                   avoid_regret_spirals:
 *                     type: boolean
 *                   no_paranormal_language:
 *                     type: boolean
 *                   soften_sensitive_topics:
 *                     type: boolean
 *                   prefer_reassurance:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Persona not found
 */
router.put('/personas/:id/settings', personaController.updateSettings);

/**
 * @swagger
 * /api/journal:
 *   get:
 *     summary: List all journal entries
 *     description: Retrieve all journal entries sorted by newest first
 *     tags: [Journal]
 *     responses:
 *       200:
 *         description: List of journal entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       text:
 *                         type: string
 *                       persona_id:
 *                         type: string
 *                         nullable: true
 *                       mood:
 *                         type: string
 *                         nullable: true
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         nullable: true
 *                       ai_reflection:
 *                         type: string
 *                         nullable: true
 *                 count:
 *                   type: number
 */
router.get('/journal', listJournalEntries);

/**
 * @swagger
 * /api/journal/{id}:
 *   get:
 *     summary: Get a single journal entry
 *     description: Retrieve a specific journal entry by ID
 *     tags: [Journal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Journal entry ID
 *     responses:
 *       200:
 *         description: Journal entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     text:
 *                       type: string
 *                     persona_id:
 *                       type: string
 *                       nullable: true
 *                     mood:
 *                       type: string
 *                       nullable: true
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       nullable: true
 *                     ai_reflection:
 *                       type: string
 *                       nullable: true
 *       404:
 *         description: Journal entry not found
 */
router.get('/journal/:id', getJournalEntry);

/**
 * @swagger
 * /api/journal:
 *   post:
 *     summary: Create a new journal entry
 *     description: Create a journal entry with optional persona linking and AI reflection
 *     tags: [Journal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The journal entry text
 *                 example: "Today I was thinking about our conversations..."
 *               persona_id:
 *                 type: string
 *                 nullable: true
 *                 description: Optional persona ID to link this entry to
 *                 example: "uuid-of-persona"
 *               mood:
 *                 type: string
 *                 nullable: true
 *                 description: Optional mood descriptor
 *                 example: "reflective"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Optional tags for categorization
 *                 example: ["grief", "memory"]
 *               generate_reflection:
 *                 type: boolean
 *                 description: Whether to generate an AI reflection
 *                 example: true
 *     responses:
 *       201:
 *         description: Journal entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                     text:
 *                       type: string
 *                     persona_id:
 *                       type: string
 *                     mood:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     ai_reflection:
 *                       type: string
 *       400:
 *         description: Validation error
 */
router.post('/journal', createJournalEntry);

/**
 * @swagger
 * /api/journal/{id}:
 *   put:
 *     summary: Update a journal entry
 *     description: Update an existing journal entry
 *     tags: [Journal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Journal entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Updated journal entry text
 *               persona_id:
 *                 type: string
 *                 nullable: true
 *                 description: Updated persona ID
 *               mood:
 *                 type: string
 *                 nullable: true
 *                 description: Updated mood
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Updated tags
 *     responses:
 *       200:
 *         description: Journal entry updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Journal entry not found
 */
router.put('/journal/:id', updateJournalEntry);

/**
 * @swagger
 * /api/journal/{id}:
 *   delete:
 *     summary: Delete a journal entry
 *     description: Delete a specific journal entry
 *     tags: [Journal]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Journal entry ID
 *     responses:
 *       200:
 *         description: Journal entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Journal entry not found
 */
router.delete('/journal/:id', deleteJournalEntry);

// Onboarding Routes (Voice-First Persona Creation)

/**
 * @swagger
 * /api/onboarding/questions:
 *   get:
 *     summary: Get all onboarding questions
 *     description: Retrieve the full structure of onboarding questions and sections
 *     tags: [Onboarding]
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 */
router.get('/onboarding/questions', onboardingController.getQuestions);

/**
 * @swagger
 * /api/onboarding/questions/{questionId}:
 *   get:
 *     summary: Get a single question
 *     description: Retrieve details for a specific onboarding question
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID (e.g., q1, q2, etc.)
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *       404:
 *         description: Question not found
 */
router.get('/onboarding/questions/:questionId', onboardingController.getQuestion);

/**
 * @swagger
 * /api/personas/{personaId}/onboarding:
 *   get:
 *     summary: Get all onboarding answers for a persona
 *     description: Retrieve all answers and progress for a persona's onboarding
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: Answers retrieved successfully
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:personaId/onboarding', onboardingController.getPersonaAnswers);

/**
 * @swagger
 * /api/personas/{personaId}/onboarding/progress:
 *   get:
 *     summary: Get onboarding progress for a persona
 *     description: Get a summary of onboarding completion status
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:personaId/onboarding/progress', onboardingController.getProgress);

/**
 * @swagger
 * /api/personas/{personaId}/onboarding/{questionId}:
 *   get:
 *     summary: Get answer for a specific question
 *     description: Retrieve the answer for a specific onboarding question
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Answer retrieved successfully
 *       404:
 *         description: Persona or question not found
 */
router.get('/personas/:personaId/onboarding/:questionId', onboardingController.getAnswer);

/**
 * @swagger
 * /api/personas/{personaId}/onboarding/{questionId}:
 *   put:
 *     summary: Save or update an answer
 *     description: Save or update the answer for a specific onboarding question. Supports incremental saves.
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               textResponse:
 *                 type: string
 *                 description: Text response (optional)
 *               voiceTranscript:
 *                 type: string
 *                 description: Transcribed voice response (optional)
 *               selectedOption:
 *                 type: string
 *                 description: Selected option value for select questions (optional)
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *       404:
 *         description: Persona or question not found
 */
router.put('/personas/:personaId/onboarding/:questionId', onboardingController.saveAnswer);

/**
 * @swagger
 * /api/personas/{personaId}/onboarding/{questionId}/media:
 *   post:
 *     summary: Upload media for an answer
 *     description: Upload a photo, audio, or video file for a specific question
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - mediaType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               mediaType:
 *                 type: string
 *                 enum: [photos, audio, video]
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *       400:
 *         description: Invalid file or media type
 *       404:
 *         description: Persona or question not found
 */
router.post('/personas/:personaId/onboarding/:questionId/media', onboardingMediaUpload.single('file'), handleMulterError, onboardingController.uploadMedia);

/**
 * @swagger
 * /api/personas/{personaId}/onboarding/{questionId}/media/{mediaId}:
 *   delete:
 *     summary: Remove media from an answer
 *     description: Remove a previously uploaded media file
 *     tags: [Onboarding]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mediaType
 *             properties:
 *               mediaType:
 *                 type: string
 *                 enum: [photos, audio, video]
 *     responses:
 *       200:
 *         description: Media removed successfully
 *       404:
 *         description: Persona, question, or media not found
 */
router.delete('/personas/:personaId/onboarding/:questionId/media/:mediaId', onboardingController.deleteMedia);

// Persona Engine Routes (Hydration & Prompt Generation)

/**
 * @swagger
 * /api/personas/{personaId}/hydrate:
 *   get:
 *     summary: Generate hydrated system prompt for a persona
 *     description: Assembles the full persona system prompt by injecting onboarding answers. Useful for testing.
 *     tags: [Persona Engine]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *       - in: query
 *         name: includePrompt
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *           default: 'false'
 *         description: Whether to include the full prompt text in response
 *     responses:
 *       200:
 *         description: Prompt hydrated successfully
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:personaId/hydrate', personaEngineController.hydratePrompt);

/**
 * @swagger
 * /api/personas/{personaId}/hydrate/preview:
 *   get:
 *     summary: Preview hydration status for a persona
 *     description: Get a lightweight summary of which sections have content and validation status
 *     tags: [Persona Engine]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *         description: The persona ID
 *     responses:
 *       200:
 *         description: Preview generated successfully
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:personaId/hydrate/preview', personaEngineController.previewHydration);

// Voice Chat Routes

/**
 * @swagger
 * /api/voice/options:
 *   get:
 *     summary: Get available voice options
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: Voice options retrieved
 */
router.get('/voice/options', voiceController.getVoiceOptions);

/**
 * @swagger
 * /api/voice/generate:
 *   post:
 *     summary: Generate voice reply for persona text
 *     description: Generates TTS audio if voice is enabled and safety checks pass
 *     tags: [Voice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personaId
 *               - text
 *             properties:
 *               personaId:
 *                 type: string
 *               text:
 *                 type: string
 *                 description: The persona's text reply
 *               userMessage:
 *                 type: string
 *                 description: The user's original message (for safety checks)
 *     responses:
 *       200:
 *         description: Voice generated or text-only returned
 */
router.post('/voice/generate', voiceController.generateVoiceReply);

/**
 * @swagger
 * /api/voice/{filename}:
 *   get:
 *     summary: Serve a voice audio file
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audio file
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/voice/:filename', voiceController.serveVoiceFile);

/**
 * @swagger
 * /api/voice/{filename}:
 *   delete:
 *     summary: Delete a voice file
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted
 */
router.delete('/voice/:filename', voiceController.deleteVoiceFile);

/**
 * @swagger
 * /api/voice/cleanup:
 *   post:
 *     summary: Clean up old voice files
 *     tags: [Voice]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxAgeHours:
 *                 type: number
 *                 default: 24
 *     responses:
 *       200:
 *         description: Cleanup completed
 */
router.post('/voice/cleanup', voiceController.cleanupVoiceFiles);

/**
 * @swagger
 * /api/personas/{personaId}/voice-settings:
 *   get:
 *     summary: Get voice settings for a persona
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voice settings retrieved
 *       404:
 *         description: Persona not found
 */
router.get('/personas/:personaId/voice-settings', voiceController.getVoiceSettings);

/**
 * @swagger
 * /api/personas/{personaId}/voice-settings:
 *   put:
 *     summary: Update voice settings for a persona
 *     tags: [Voice]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               voice_id:
 *                 type: string
 *                 enum: [alloy, echo, fable, onyx, nova, shimmer]
 *     responses:
 *       200:
 *         description: Voice settings updated
 *       404:
 *         description: Persona not found
 */
router.put('/personas/:personaId/voice-settings', voiceController.updateVoiceSettings);

export { router };
