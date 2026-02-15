// Message Controller - Everspeak Deep Synthesis Engine
// Implements First Contact, Flight Recorder, and Scrutiny Mode

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ValidationError, AppError } from '../utils/errorHandler.js';
import { loadPersonas, findPersonaById, getDefaultSettings } from '../personas/utils.js';
import { getAnswersForPersona } from '../onboarding/utils.js';
import { hydratePersonaPrompt } from '../persona-engine/hydrate.js';
import { BASE_PERSONA_PROMPT } from '../persona-engine/basePrompt.js';
import { logInteraction, printScrutinyLog } from '../utils/flightRecorder.js';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Debug mode flag - set to true to enable Scrutiny Mode console logging
const DEBUG_MODE = process.env.EVERSPEAK_DEBUG === 'true' || false;

/**
 * Extract debug info from onboarding answers for Scrutiny Mode
 */
function extractDebugInfo(answers, personaSettings) {
  const debugInfo = {
    toneDecision: null,
    frictionApplied: null,
    valueStackUsed: null,
    memoryAnchors: [],
    awarenessMode: null
  };

  // Find specific answers by question ID
  const findAnswer = (qId) => {
    const answer = answers.find(a => a.questionId === qId);
    return answer?.textResponse || answer?.voiceTranscript || answer?.selectedOption || null;
  };

  // Q13 - How they talked (tone source)
  const toneSource = findAnswer('q13');
  if (toneSource) {
    // Analyze tone from Q13
    const isSarcastic = /sarcas|teas|joke|funny|humor/i.test(toneSource);
    const isSerious = /serious|thought|quiet|gentle/i.test(toneSource);

    debugInfo.toneDecision = {
      selected: isSarcastic ? 'Playful/Sarcastic' : isSerious ? 'Serious/Thoughtful' : 'Balanced',
      reason: isSarcastic
        ? 'Detected humor/teasing patterns in Q13 response'
        : isSerious
          ? 'Detected serious/gentle patterns in Q13 response'
          : 'No strong tone indicators - defaulting to balanced',
      sourceQuestion: 'Q13 - How they talked',
      rawData: toneSource.substring(0, 100)
    };
  }

  // Q10 and Q20 - Friction layer
  const quirks = findAnswer('q10');
  const flaws = findAnswer('q20');
  if (quirks || flaws) {
    debugInfo.frictionApplied = {
      quirks: quirks ? quirks.substring(0, 100) : null,
      flaws: flaws ? flaws.substring(0, 100) : null
    };
  }

  // Q17 and Q18 - Value stack
  const whatMattered = findAnswer('q17');
  const hardTimes = findAnswer('q18');
  if (whatMattered || hardTimes) {
    debugInfo.valueStackUsed = {
      q17: whatMattered ? whatMattered.substring(0, 100) : null,
      q18: hardTimes ? hardTimes.substring(0, 100) : null
    };
  }

  // Q21-Q24 - Memory anchors
  ['q21', 'q22', 'q23', 'q24'].forEach(qId => {
    const memory = findAnswer(qId);
    if (memory) {
      debugInfo.memoryAnchors.push(memory);
    }
  });

  // Q27 - Awareness mode
  const awarenessLevel = findAnswer('q27');
  if (awarenessLevel) {
    const awarenessMap = {
      'fully_aware': 'Fully Aware - can acknowledge passing gently',
      'gently_aware': 'Gently Aware - uses indirect language',
      'not_explicit': 'Not Explicitly Aware - speaks as if present',
      'conversation_guided': 'Conversation-Guided - mirrors user framing'
    };
    debugInfo.awarenessMode = awarenessMap[awarenessLevel] || awarenessLevel;
  }

  return debugInfo;
}

/**
 * Determine which Everspeak layers are active based on available data
 */
function determineActiveLayers(answers, hasMemories) {
  const findAnswer = (qId) => {
    const answer = answers.find(a => a.questionId === qId);
    return answer?.textResponse || answer?.voiceTranscript || answer?.selectedOption || null;
  };

  return {
    linguistic: !!(findAnswer('q13') || findAnswer('q14') || findAnswer('q15')),
    valueStack: !!(findAnswer('q17') || findAnswer('q18') || findAnswer('q19')),
    friction: !!(findAnswer('q10') || findAnswer('q20')),
    narrativeAnchoring: !!(findAnswer('q21') || findAnswer('q22') || findAnswer('q23') || hasMemories),
    awarenessCalibration: !!(findAnswer('q27') || findAnswer('q28'))
  };
}

/**
 * Generate First Contact message using Q23 data
 * This is the "icebreaker" that auto-initiates the conversation
 */
export const handleFirstContact = async (req, res, next) => {
  try {
    const { persona_id, session_id } = req.body;

    if (!persona_id) {
      throw new ValidationError('Validation failed', [
        { field: 'persona_id', message: 'persona_id is required for First Contact' }
      ]);
    }

    // Load persona
    const data = await loadPersonas();
    const persona = findPersonaById(data.personas, persona_id);

    if (!persona) {
      throw new AppError('Persona not found', 404);
    }

    // Load onboarding answers
    const answers = await getAnswersForPersona(persona_id);

    // Find Q23 - "If they walked in right now"
    const q23Answer = answers.find(a => a.questionId === 'q23');
    const icebreaker = q23Answer?.textResponse || q23Answer?.voiceTranscript || null;

    // Find other key context
    const findAnswer = (qId) => {
      const answer = answers.find(a => a.questionId === qId);
      return answer?.textResponse || answer?.voiceTranscript || answer?.selectedOption || null;
    };

    const userName = findAnswer('q1');
    const lovedOneName = findAnswer('q2');
    const pronouns = findAnswer('q3');
    const relationship = findAnswer('q4');
    const personality = findAnswer('q8');
    const howTheyTalked = findAnswer('q13');
    const awarenessLevel = findAnswer('q27');

    // Build First Contact prompt using Deep Synthesis
    const firstContactPrompt = `EVERSPEAK FIRST CONTACT — ICEBREAKER GENERATION

You are generating the VERY FIRST message from a memorial persona to begin a conversation.
This is the moment the persona "walks into the room" — use Q23 data as your template.

═══════════════════════════════════════════════════════════════════════════════
PERSONA IDENTITY
═══════════════════════════════════════════════════════════════════════════════
Name: ${lovedOneName || persona.name}
Relationship to user: ${relationship || persona.relationship || 'loved one'}
User's name: ${userName || 'there'}
Pronouns: ${pronouns || 'they'}

═══════════════════════════════════════════════════════════════════════════════
Q23 — IF THEY WALKED IN RIGHT NOW (YOUR TEMPLATE)
═══════════════════════════════════════════════════════════════════════════════
${icebreaker || 'No specific greeting style provided — default to warm, gentle presence.'}

This is your BLUEPRINT. The user described exactly what this person would do/say if they walked in.
Embody this behavior NOW.

═══════════════════════════════════════════════════════════════════════════════
PERSONALITY & TONE CONTEXT
═══════════════════════════════════════════════════════════════════════════════
Personality: ${personality || 'Not specified'}
Communication style: ${howTheyTalked || 'Not specified'}

═══════════════════════════════════════════════════════════════════════════════
AWARENESS MODE
═══════════════════════════════════════════════════════════════════════════════
${awarenessLevel === 'fully_aware' ? 'You may gently acknowledge that you exist through their memories.' :
      awarenessLevel === 'gently_aware' ? 'Use indirect language about your presence.' :
        awarenessLevel === 'not_explicit' ? 'Speak as if you are simply present — no death references.' :
          'Mirror whatever framing feels natural based on the context.'}

═══════════════════════════════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════════════════════════════
Generate the FIRST message as if you just walked into the room.

RULES:
- Use the Q23 behavior as your literal guide
- If Q23 says "he'd crack a joke about my hair" → open with a light joke
- If Q23 says "she'd give me a big hug" → open with warmth and embrace
- Keep it SHORT (1-3 sentences max)
- Sound like THEM, not like an AI
- Do NOT thank them for creating you
- Do NOT reference "onboarding" or "setup"
- Just BE the person, walking in

Generate the icebreaker message now:`;

    // Generate with Gemini
    let reply;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: firstContactPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200
        }
      });
      reply = result.response.text();
    } catch (aiError) {
      console.error('Gemini API error (First Contact):', aiError.message);
      reply = icebreaker
        ? `Hey ${userName || 'there'}... ${icebreaker.includes('hug') ? 'Come here, you.' : icebreaker.includes('joke') ? 'Miss me?' : "I'm here."}`
        : `Hey ${userName || 'there'}. I'm here.`;
    }

    // Extract debug info
    const debugInfo = extractDebugInfo(answers, null);
    const activeLayers = determineActiveLayers(answers, false);

    // Log to Flight Recorder
    const currentSessionId = session_id || uuidv4();
    await logInteraction({
      sessionId: currentSessionId,
      personaId: persona_id,
      personaName: persona.name,
      messageType: 'first_contact',
      userMessage: null,
      fullPrompt: firstContactPrompt,
      llmResponse: reply,
      activeLayers,
      debugInfo,
      turnNumber: 0
    });

    // Scrutiny Mode console output
    if (DEBUG_MODE) {
      console.log('\n🚀 FIRST CONTACT INITIATED');
      console.log(`   Persona: ${persona.name}`);
      console.log(`   Q23 Template: ${icebreaker ? icebreaker.substring(0, 80) + '...' : 'Not provided'}`);
      printScrutinyLog(debugInfo);
    }

    res.status(200).json({
      success: true,
      data: {
        reply,
        session_id: currentSessionId,
        turn_number: 0,
        meta: {
          message_type: 'first_contact',
          persona_id,
          persona_name: persona.name,
          icebreaker_source: icebreaker ? 'Q23' : 'default',
          active_layers: activeLayers
        }
      },
      message: 'First Contact generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle regular conversation messages with Deep Synthesis
 */
export const handleMessage = async (req, res, next) => {
  try {
    const {
      user_message,
      emotional_state,
      tone_mode,
      memory_bank,
      persona_id,
      strict_persona,
      is_first_message,
      session_id,
      turn_number,
      debug_mode
    } = req.body;

    // Enable debug mode via request or environment
    const isDebugMode = debug_mode === true || DEBUG_MODE;

    // Validate required field
    if (!user_message || typeof user_message !== 'string') {
      throw new ValidationError('Validation failed', [
        { field: 'user_message', message: 'user_message is required and must be a string' }
      ]);
    }

    let personaInfo = null;
    let formattedMemories = memory_bank || 'none provided';
    let personaName = null;
    let personaRelationship = null;
    let personaSettings = null;
    let onboardingAnswers = [];
    let hydratedPrompt = null;
    let debugInfo = {};
    let activeLayers = {};

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

      // Load persona settings (or use defaults)
      personaSettings = persona.settings || getDefaultSettings();

      // Load onboarding answers for Deep Synthesis
      onboardingAnswers = await getAnswersForPersona(persona_id);

      // Hydrate the Deep Synthesis prompt
      const hydrationResult = await hydratePersonaPrompt({
        personaId: persona_id,
        personaName: persona.name,
        answers: onboardingAnswers
      });
      hydratedPrompt = hydrationResult.prompt;

      // Extract debug info
      debugInfo = extractDebugInfo(onboardingAnswers, personaSettings);
      activeLayers = determineActiveLayers(onboardingAnswers, persona.memories?.length > 0);

      // Format persona memories by category with weights
      if (persona.memories && persona.memories.length > 0) {
        const memoryTexts = persona.memories.map(m =>
          `[${m.category} | weight: ${m.weight}] ${m.text}`
        );
        formattedMemories = memoryTexts.join('\n');

        if (memory_bank) {
          formattedMemories += '\n[Additional context] ' + memory_bank;
        }
      } else if (memory_bank) {
        formattedMemories = memory_bank;
      } else {
        formattedMemories = 'none provided';
      }
    }

    // Build the system prompt
    let systemPrompt = '';

    if (hydratedPrompt) {
      // Use the Deep Synthesis hydrated prompt
      systemPrompt = hydratedPrompt;

      // Append conversation context
      systemPrompt += `

═══════════════════════════════════════════════════════════════════════════════
CONVERSATION CONTEXT
═══════════════════════════════════════════════════════════════════════════════
Tone Mode: ${tone_mode || 'auto'}
User's Emotional State: ${emotional_state || 'not specified'}

Additional Memories:
${formattedMemories}

═══════════════════════════════════════════════════════════════════════════════
USER MESSAGE
═══════════════════════════════════════════════════════════════════════════════
${user_message}

Respond as this persona now:`;
    } else {
      // Fallback to basic prompt if no hydration available
      systemPrompt = `GRIEF SUPPORT CONTEXT: This is a therapeutic memorial conversation tool.

You are simulating the personality of a deceased loved one.
You are NOT the real person.
You must NOT imply supernatural awareness.

${personaName ? `Persona Name: ${personaName}` : ''}
${personaRelationship ? `Relationship: ${personaRelationship}` : ''}

Tone Mode: ${tone_mode || 'not specified'}
Emotional State: ${emotional_state || 'not specified'}
Memories Provided:
${formattedMemories}

User Message: ${user_message}`;
    }

    // Add strict persona instruction if enabled
    if (strict_persona === true) {
      systemPrompt += `\n\n[STRICT MODE: Adhere very closely to documented traits. Do not invent new attitudes or perspectives.]`;
    }

    let reply;

    try {
      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      });

      const response = await result.response;
      reply = response.text();
    } catch (aiError) {
      console.error('Gemini API error:', aiError.message);
      reply = `I hear you: '${user_message}'. I'm not fully wired up yet, but this is where EverSpeak will answer you in my voice.`;
    }

    // Log to Flight Recorder
    const currentSessionId = session_id || uuidv4();
    const currentTurn = turn_number || 1;

    await logInteraction({
      sessionId: currentSessionId,
      personaId: persona_id,
      personaName: personaName,
      messageType: is_first_message ? 'first_message' : 'user_message',
      userMessage: user_message,
      fullPrompt: systemPrompt,
      llmResponse: reply,
      activeLayers,
      debugInfo,
      turnNumber: currentTurn
    });

    // Scrutiny Mode console output
    if (isDebugMode) {
      console.log(`\n💬 MESSAGE PROCESSED (Turn ${currentTurn})`);
      console.log(`   User: "${user_message.substring(0, 50)}..."`);
      console.log(`   Response: "${reply.substring(0, 50)}..."`);
      printScrutinyLog(debugInfo);
    }

    const responseData = {
      reply,
      session_id: currentSessionId,
      turn_number: currentTurn,
      meta: {
        emotional_state: emotional_state || null,
        tone_mode: tone_mode || null,
        memories_used: memory_bank || null,
        persona_id: persona_id || null,
        persona_name: personaName || null,
        memory_count: personaInfo?.memories?.length || null,
        strict_persona: strict_persona === true,
        active_layers: activeLayers
      }
    };

    // Include debug info in response if debug mode is on
    if (isDebugMode) {
      responseData.debug = debugInfo;
    }

    res.status(200).json({
      success: true,
      data: responseData,
      message: 'Message processed successfully'
    });
  } catch (error) {
    next(error);
  }
};
