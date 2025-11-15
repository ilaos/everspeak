import express from 'express';
import { testController } from '../controllers/testController.js';
import { exampleController } from '../controllers/exampleController.js';
import { handleMessage } from '../controllers/messageController.js';
import { validateExample } from '../utils/validation.js';

const router = express.Router();

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
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error - user_message is required
 */
router.post('/message', handleMessage);

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

export { router };
