import OpenAI from 'openai';
import { ValidationError } from '../utils/errorHandler.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handleMessage = async (req, res, next) => {
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

    // Construct AI prompt
    const prompt = `You are simulating the personality of a deceased loved one based ONLY on the memories provided.
You are NOT the real person.
You must NOT imply supernatural awareness.
You must NOT reference information you were not explicitly given.

Your goal is to respond in a comforting, grounded, realistic, emotionally intelligent way.
You may reflect their quirks, humor, tone, and personality—but only using the user's memory inputs.

Tone Mode: ${tone_mode || 'not specified'}
Emotional State: ${emotional_state || 'not specified'}
Memories Provided: ${memory_bank || 'none provided'}
User Message: ${user_message}`;

    let reply;

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: user_message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      reply = completion.choices[0].message.content;
    } catch (aiError) {
      // Fallback to stub response if AI call fails
      console.error('OpenAI API error:', aiError.message);
      reply = `Yo Ish… I hear you: '${user_message}'. I'm not fully wired up yet, but this is where EverSpeak will answer you in my voice.`;
    }

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
