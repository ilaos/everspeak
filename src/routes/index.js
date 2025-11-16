import express from 'express';
import multer from 'multer';
import { testController } from '../controllers/testController.js';
import { exampleController } from '../controllers/exampleController.js';
import { handleMessage } from '../controllers/messageController.js';
import { personaController } from '../controllers/personaController.js';
import { transcriptionController } from '../controllers/transcriptionController.js';
import { validateExample } from '../utils/validation.js';
import {
  listJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../controllers/journalController.js';

const router = express.Router();

// Configure multer for audio file uploads
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

export { router };
