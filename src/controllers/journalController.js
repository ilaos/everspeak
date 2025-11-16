import OpenAI from 'openai';
import { ValidationError, AppError } from '../utils/errorHandler.js';
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  validateJournalEntry
} from '../journal/utils.js';
import { loadPersonas, findPersonaById } from '../personas/utils.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateReflection(text, mood, personaMemories) {
  let systemPrompt = `You are EverSpeak's Reflection Layer.
Your role is to offer gentle, grounding emotional insights based solely on the journal entry provided.

Rules:
- Never imply the deceased is aware or communicating
- Never reference the journal writer directly (avoid "you should")
- Keep reflections short (2–4 sentences)
- No therapy, no advice, no diagnosis
- Tone: reflective, warm, grounding
- If persona memories are provided, reference them *as memories* only

You must NOT provide clinical advice or therapy.
You must NOT be prescriptive or directive.
Simply reflect back a gentle, grounding observation.`;

  if (personaMemories) {
    systemPrompt += `\n\nPersona memories for context:\n${personaMemories}`;
  }

  const userPrompt = mood 
    ? `Journal entry (mood: ${mood}):\n${text}`
    : `Journal entry:\n${text}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating reflection:', error);
    return null;
  }
}

export const listJournalEntries = async (req, res, next) => {
  try {
    const entries = await getAllEntries();
    res.json({
      success: true,
      data: entries,
      count: entries.length
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await getEntryById(id);

    if (!entry) {
      throw new AppError('Journal entry not found', 404);
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

export const createJournalEntry = async (req, res, next) => {
  try {
    const { text, persona_id, mood, tags, generate_reflection } = req.body;

    const validationErrors = validateJournalEntry({ text, persona_id, mood, tags });
    if (validationErrors.length > 0) {
      throw new ValidationError('Validation failed', validationErrors.map(err => ({
        field: 'entry',
        message: err
      })));
    }

    let aiReflection = null;

    if (generate_reflection === true) {
      let personaMemories = null;

      if (persona_id) {
        const data = await loadPersonas();
        const persona = findPersonaById(data.personas, persona_id);

        if (persona && persona.memories && persona.memories.length > 0) {
          personaMemories = persona.memories
            .map(m => `[${m.category}] ${m.text}`)
            .join('\n');
        }
      }

      aiReflection = await generateReflection(text, mood, personaMemories);
    }

    const newEntry = await createEntry({
      text,
      persona_id: persona_id || null,
      mood: mood || null,
      tags: tags || null,
      ai_reflection: aiReflection
    });

    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error) {
    next(error);
  }
};

export const updateJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, persona_id, mood, tags } = req.body;

    const existingEntry = await getEntryById(id);
    if (!existingEntry) {
      throw new AppError('Journal entry not found', 404);
    }

    const validationErrors = validateJournalEntry(
      { text, persona_id, mood, tags },
      true
    );
    if (validationErrors.length > 0) {
      throw new ValidationError('Validation failed', validationErrors.map(err => ({
        field: 'entry',
        message: err
      })));
    }

    const updates = {};
    if (text !== undefined) updates.text = text;
    if (persona_id !== undefined) updates.persona_id = persona_id;
    if (mood !== undefined) updates.mood = mood;
    if (tags !== undefined) updates.tags = tags;

    const updatedEntry = await updateEntry(id, updates);

    res.json({
      success: true,
      data: updatedEntry
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await deleteEntry(id);
    if (!deleted) {
      throw new AppError('Journal entry not found', 404);
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
