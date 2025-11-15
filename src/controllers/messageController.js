import { ValidationError } from '../utils/errorHandler.js';

export const handleMessage = (req, res, next) => {
  try {
    const { user_message, emotional_state, tone_mode, memory_bank } = req.body;

    // Validate required field
    if (!user_message || typeof user_message !== 'string') {
      throw new ValidationError('Validation failed', [
        {
          field: 'user_message',
          message: 'user_message is required and must be a string'
        }
      ]);
    }

    // Stub response
    const reply = `Yo Ish… I hear you: '${user_message}'. I'm not fully wired up yet, but this is where EverSpeak will answer you in my voice.`;

    const response = {
      reply,
      meta: {
        emotional_state: emotional_state || null,
        tone_mode: tone_mode || null,
        memories_used: memory_bank || null
      }
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Message processed successfully'
    });
  } catch (error) {
    next(error);
  }
};
