import OpenAI from 'openai';
import { ValidationError, AppError } from '../utils/errorHandler.js';
import { loadPersonas, findPersonaById } from '../personas/utils.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handleMessage = async (req, res, next) => {
  try {
    const { user_message, emotional_state, tone_mode, memory_bank, persona_id, strict_persona } = req.body;

    // Validate required field
    if (!user_message || typeof user_message !== 'string') {
      throw new ValidationError('Validation failed', [
        {
          field: 'user_message',
          message: 'user_message is required and must be a string'
        }
      ]);
    }

    let personaInfo = null;
    let formattedMemories = memory_bank || 'none provided';
    let personaName = null;
    let personaRelationship = null;

    // Load persona if persona_id is provided
    if (persona_id) {
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, persona_id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      personaInfo = persona;
      personaName = persona.name;
      personaRelationship = persona.relationship;

      // Format persona memories by category with weights
      if (persona.memories && persona.memories.length > 0) {
        const memoryTexts = persona.memories.map(m => 
          `[${m.category} | weight: ${m.weight}] ${m.text}`
        );
        formattedMemories = memoryTexts.join('\n');

        // Append ad-hoc memory_bank if provided
        if (memory_bank) {
          formattedMemories += '\n[Additional context] ' + memory_bank;
        }
      } else if (memory_bank) {
        // Persona has no memories, use memory_bank
        formattedMemories = memory_bank;
      } else {
        // No memories and no memory_bank
        formattedMemories = 'none provided';
      }
    }

    // Construct AI prompt with persona context
    let systemPrompt = `You are simulating the personality of a deceased loved one based ONLY on the memories provided.
You are NOT the real person.
You must NOT imply supernatural awareness.
You must NOT reference information you were not explicitly given.

Your goal is to respond in a comforting, grounded, realistic, emotionally intelligent way.
You may reflect their quirks, humor, tone, and personality—but only using the user's memory inputs.`;

    if (personaName) {
      systemPrompt += `\n\nPersona Name: ${personaName}`;
      if (personaRelationship) {
        systemPrompt += `\nRelationship: ${personaRelationship}`;
      }
    }

    // Add strict persona instruction if enabled
    if (strict_persona === true) {
      systemPrompt += `\n\nIMPORTANT: The user has indicated that some previous replies did not feel like this person. You MUST now adhere very closely to the documented traits and memories. Do not invent new attitudes, life perspectives, or emotional styles that were not implied by the memories. It is okay to be simpler or less talkative if that is more accurate to who they were.`;
    }

    systemPrompt += `

Tone Mode: ${tone_mode || 'not specified'}
Emotional State: ${emotional_state || 'not specified'}
Memories Provided:
${formattedMemories}

User Message: ${user_message}`;

    let reply;

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
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
        memories_used: memory_bank || null,
        persona_id: persona_id || null,
        persona_name: personaName || null,
        memory_count: personaInfo ? personaInfo.memories.length : null,
        strict_persona: strict_persona === true ? true : false
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
