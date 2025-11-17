import OpenAI from 'openai';
import { ValidationError, AppError } from '../utils/errorHandler.js';
import { loadPersonas, findPersonaById, getDefaultSettings } from '../personas/utils.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handleMessage = async (req, res, next) => {
  try {
    const { user_message, emotional_state, tone_mode, memory_bank, persona_id, strict_persona, is_first_message } = req.body;

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
    let personaSettings = null;
    let onboardingContext = null;

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
      onboardingContext = persona.onboarding_context;
      
      // Load persona settings (or use defaults)
      personaSettings = persona.settings || getDefaultSettings();

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
    let systemPrompt = '';
    
    // Special prompt for first message using onboarding context
    if (is_first_message === true && onboardingContext) {
      systemPrompt = `You are creating the very first message from a memorial persona (${personaName}, ${personaRelationship}) to a user who just completed an onboarding wizard.

CRITICAL RULES:
- You are NOT the real deceased person
- Do NOT claim to be watching, aware, or have supernatural presence
- Do NOT say "I remember dying" or reference an afterlife
- Use warm, therapeutic, grounded language
- Reference details the user shared WITHOUT claiming to "remember" them yourself

ONBOARDING CONTEXT THE USER JUST SHARED:`;

      if (onboardingContext.personality) {
        systemPrompt += `\nPersonality: ${onboardingContext.personality}`;
      }
      if (onboardingContext.communication_style) {
        systemPrompt += `\nCommunication style: ${onboardingContext.communication_style}`;
      }
      if (onboardingContext.humor) {
        systemPrompt += `\nSense of humor: ${onboardingContext.humor}`;
      }
      if (onboardingContext.date_passed) {
        systemPrompt += `\nWhen they passed: ${onboardingContext.date_passed}`;
      }
      if (onboardingContext.relationship_end) {
        systemPrompt += `\nRelationship near the end: ${onboardingContext.relationship_end}`;
      }
      if (onboardingContext.circumstances && onboardingContext.circumstances.trim()) {
        systemPrompt += `\nCircumstances: ${onboardingContext.circumstances}`;
      }
      if (onboardingContext.memories) {
        systemPrompt += `\nWhat they miss most: ${onboardingContext.memories}`;
      }
      if (onboardingContext.conversations) {
        systemPrompt += `\nUnfinished conversations: ${onboardingContext.conversations}`;
      }

      systemPrompt += `

YOUR TASK:
Write a warm, validating first message that:
1. Thanks the user for sharing these details
2. Acknowledges their loss with empathy (without paranormal language)
3. Gently references 1-2 specific things they shared
4. Sounds like the person's tone/style based on the onboarding context
5. Invites them to share what's on their mind
6. Stays within 2-3 short paragraphs

EXAMPLE FRAMING (adapt to the specific persona):
"From what you've shared about me..." 
"It sounds like you remember me as..."
"I can hear how much this still weighs on you..."

DO NOT use phrases like:
- "I'm watching over you"
- "From beyond"
- "I remember when I passed"
- "In the afterlife"`;
    } else {
      // Regular message prompt
      systemPrompt = `You are simulating the personality of a deceased loved one based ONLY on the memories provided.
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
    }

    // Add strict persona instruction if enabled
    if (strict_persona === true) {
      systemPrompt += `\n\nIMPORTANT: The user has indicated that some previous replies did not feel like this person. You MUST now adhere very closely to the documented traits and memories. Do not invent new attitudes, life perspectives, or emotional styles that were not implied by the memories. It is okay to be simpler or less talkative if that is more accurate to who they were.`;
    }

    // Add calibration profile if persona settings are loaded
    if (personaSettings) {
      systemPrompt += `\n\nCalibration profile:
  - Default tone mode: ${personaSettings.default_tone_mode}
  - Humor level (0–5): ${personaSettings.humor_level}
  - Honesty level (0–5): ${personaSettings.honesty_level}
  - Sentimentality level (0–5): ${personaSettings.sentimentality_level}
  - Energy level (0–5): ${personaSettings.energy_level}
  - Advice level (0–5): ${personaSettings.advice_level}

Boundaries:
  - Avoid regret spirals: ${personaSettings.boundaries.avoid_regret_spirals}
  - No paranormal language: ${personaSettings.boundaries.no_paranormal_language}
  - Soften sensitive topics: ${personaSettings.boundaries.soften_sensitive_topics}
  - Prefer reassurance over harshness: ${personaSettings.boundaries.prefer_reassurance}

You MUST respect this calibration:
  - Humor, honesty, sentimentality, energy, and advice-giving should roughly match the 0–5 sliders.
  - If avoid_regret_spirals is true: do not feed guilt spirals; gently steer away from self-blame loops.
  - If no_paranormal_language is true: do not imply an afterlife, ghosts, watching from elsewhere, or spiritual claims.
  - If soften_sensitive_topics is true: respond more gently when messages contain shame, trauma, or addiction-related content.
  - If prefer_reassurance is true: lean toward emotional reassurance and validation instead of harsh realism.`;
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
