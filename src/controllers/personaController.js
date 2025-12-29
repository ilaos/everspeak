import { GoogleGenerativeAI } from '@google/generative-ai';
import { ValidationError, AppError } from '../utils/errorHandler.js';
import {
  loadPersonas,
  savePersonas,
  createPersona,
  createMemory,
  updatePersona,
  findPersonaById,
  findMemoryById,
  isValidCategory,
  isValidWeight,
  createSnapshot,
  findSnapshotById,
  restoreFromSnapshot,
  getDefaultSettings,
  validateSettings
} from '../personas/utils.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const personaController = {
  // GET /api/personas - List all personas
  async getAll(req, res, next) {
    try {
      const data = await loadPersonas();
      res.status(200).json({
        success: true,
        data: data.personas,
        count: data.personas.length,
        message: 'Personas retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:id - Get single persona
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      res.status(200).json({
        success: true,
        data: persona,
        message: 'Persona retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas - Create new persona
  async create(req, res, next) {
    try {
      const { name, relationship, description } = req.body;

      // Validate required and optional fields
      const errors = [];
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push({
          field: 'name',
          message: 'Name is required and must be a non-empty string'
        });
      }

      if (relationship !== undefined && typeof relationship !== 'string') {
        errors.push({
          field: 'relationship',
          message: 'Relationship must be a string'
        });
      }

      if (description !== undefined && typeof description !== 'string') {
        errors.push({
          field: 'description',
          message: 'Description must be a string'
        });
      }

      if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      const data = await loadPersonas();
      const newPersona = createPersona(
        name.trim(),
        typeof relationship === 'string' ? relationship.trim() : '',
        typeof description === 'string' ? description.trim() : ''
      );

      data.personas.push(newPersona);
      await savePersonas(data);

      res.status(201).json({
        success: true,
        data: newPersona,
        message: 'Persona created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/personas/:id - Update persona
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, relationship, description } = req.body;

      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === id);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const errors = [];
      const updates = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          errors.push({
            field: 'name',
            message: 'Name must be a non-empty string'
          });
        } else {
          updates.name = name.trim();
        }
      }

      if (relationship !== undefined) {
        if (typeof relationship !== 'string') {
          errors.push({
            field: 'relationship',
            message: 'Relationship must be a string'
          });
        } else {
          updates.relationship = relationship.trim();
        }
      }

      if (description !== undefined) {
        if (typeof description !== 'string') {
          errors.push({
            field: 'description',
            message: 'Description must be a string'
          });
        } else {
          updates.description = description.trim();
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      data.personas[personaIndex] = updatePersona(data.personas[personaIndex], updates);
      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: data.personas[personaIndex],
        message: 'Persona updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/personas/:id - Delete persona
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === id);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const deletedPersona = data.personas.splice(personaIndex, 1)[0];
      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: deletedPersona,
        message: 'Persona deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:id/memories - Get all memories for a persona
  async getMemories(req, res, next) {
    try {
      const { id } = req.params;
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      res.status(200).json({
        success: true,
        data: persona.memories,
        count: persona.memories.length,
        message: 'Memories retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas/:id/memories - Add memory to persona
  async createMemory(req, res, next) {
    try {
      const { id } = req.params;
      const { category, text, weight } = req.body;

      // Validate required fields
      const errors = [];
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        errors.push({
          field: 'text',
          message: 'Memory text is required and must be a non-empty string'
        });
      }
      if (!category || !isValidCategory(category)) {
        errors.push({
          field: 'category',
          message: 'Category is required and must be one of: humor, regrets, childhood, advice, personality, misc'
        });
      }

      // Parse and validate weight
      let parsedWeight = 1.0;
      if (weight !== undefined) {
        parsedWeight = parseFloat(weight);
        if (!isValidWeight(parsedWeight)) {
          errors.push({
            field: 'weight',
            message: 'Weight must be a number between 0.1 and 5.0'
          });
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const newMemory = createMemory(category, text.trim(), parsedWeight);
      persona.memories.push(newMemory);
      persona.updated_at = new Date().toISOString();
      await savePersonas(data);

      res.status(201).json({
        success: true,
        data: newMemory,
        message: 'Memory created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/personas/:id/memories/:memoryId - Update memory
  async updateMemory(req, res, next) {
    try {
      const { id, memoryId } = req.params;
      const { category, text, weight } = req.body;

      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const memory = findMemoryById(persona, memoryId);
      if (!memory) {
        throw new AppError('Memory not found', 404);
      }

      // Validate updates
      const errors = [];
      if (text !== undefined && (typeof text !== 'string' || text.trim().length === 0)) {
        errors.push({
          field: 'text',
          message: 'Memory text must be a non-empty string'
        });
      }
      if (category !== undefined && !isValidCategory(category)) {
        errors.push({
          field: 'category',
          message: 'Category must be one of: humor, regrets, childhood, advice, personality, misc'
        });
      }

      // Parse and validate weight
      let parsedWeight;
      if (weight !== undefined) {
        parsedWeight = parseFloat(weight);
        if (!isValidWeight(parsedWeight)) {
          errors.push({
            field: 'weight',
            message: 'Weight must be a number between 0.1 and 5.0'
          });
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      // Update memory fields
      if (text !== undefined) memory.text = text.trim();
      if (category !== undefined) memory.category = category;
      if (parsedWeight !== undefined) memory.weight = parsedWeight;

      persona.updated_at = new Date().toISOString();
      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: memory,
        message: 'Memory updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/personas/:id/memories/:memoryId - Delete memory
  async deleteMemory(req, res, next) {
    try {
      const { id, memoryId } = req.params;
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const memoryIndex = persona.memories.findIndex(m => m.id === memoryId);
      if (memoryIndex === -1) {
        throw new AppError('Memory not found', 404);
      }

      const deletedMemory = persona.memories.splice(memoryIndex, 1)[0];
      persona.updated_at = new Date().toISOString();
      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: deletedMemory,
        message: 'Memory deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:id/snapshots - Get all snapshots for a persona
  async getSnapshots(req, res, next) {
    try {
      const { id } = req.params;
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const snapshots = persona.snapshots || [];

      res.status(200).json({
        success: true,
        data: snapshots,
        count: snapshots.length,
        message: 'Snapshots retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas/:id/snapshots - Create a new snapshot
  async createSnapshot(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      // Validate name if provided
      const errors = [];
      if (name !== undefined && typeof name !== 'string') {
        errors.push({
          field: 'name',
          message: 'Name must be a string'
        });
      }

      if (errors.length > 0) {
        throw new ValidationError('Validation failed', errors);
      }

      // Initialize snapshots array if it doesn't exist
      if (!persona.snapshots) {
        persona.snapshots = [];
      }

      const snapshot = createSnapshot(persona, name);
      persona.snapshots.push(snapshot);
      await savePersonas(data);

      res.status(201).json({
        success: true,
        data: snapshot,
        message: 'Snapshot created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas/:id/snapshots/:snapshotId/restore - Restore from snapshot
  async restoreSnapshot(req, res, next) {
    try {
      const { id, snapshotId } = req.params;

      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === id);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const persona = data.personas[personaIndex];
      const snapshot = findSnapshotById(persona, snapshotId);

      if (!snapshot) {
        throw new AppError('Snapshot not found', 404);
      }

      // Restore persona from snapshot
      data.personas[personaIndex] = restoreFromSnapshot(persona, snapshot);
      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: data.personas[personaIndex],
        message: 'Persona restored from snapshot successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:id/settings - Get persona settings
  async getSettings(req, res, next) {
    try {
      const { id } = req.params;

      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      // Return existing settings or default settings
      const settings = persona.settings || getDefaultSettings();

      res.status(200).json({
        success: true,
        data: settings,
        message: 'Settings retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/personas/:id/settings - Update persona settings
  async updateSettings(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === id);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const persona = data.personas[personaIndex];

      // Validate settings
      const validationErrors = validateSettings(updates);
      if (validationErrors.length > 0) {
        throw new ValidationError('Invalid settings', validationErrors.map(msg => ({ message: msg })));
      }

      // Get current settings or defaults
      const currentSettings = persona.settings || getDefaultSettings();

      // Merge updates into current settings (partial updates)
      const updatedSettings = {
        ...currentSettings,
        ...updates
      };

      // Handle boundaries separately to allow partial updates
      if (updates.boundaries) {
        updatedSettings.boundaries = {
          ...currentSettings.boundaries,
          ...updates.boundaries
        };
      }

      // Convert level fields to numbers
      const levelFields = ['humor_level', 'honesty_level', 'sentimentality_level', 'energy_level', 'advice_level'];
      for (const field of levelFields) {
        if (updatedSettings[field] !== undefined) {
          updatedSettings[field] = Number(updatedSettings[field]);
        }
      }

      // Update persona with new settings
      persona.settings = updatedSettings;
      persona.updated_at = new Date().toISOString();
      data.personas[personaIndex] = persona;

      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas/:id/memories/bulk-import - Bulk import memories with AI categorization
  async bulkImportMemories(req, res, next) {
    try {
      const { id } = req.params;
      const { text, auto_weight = true } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new ValidationError('Validation failed', [{
          field: 'text',
          message: 'Text is required and must be a non-empty string'
        }]);
      }

      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === id);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const persona = data.personas[personaIndex];

      // Split text into discrete memories
      const rawSegments = text
        .split(/[\n;.]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length >= 5); // Filter out very short or empty segments

      if (rawSegments.length === 0) {
        throw new ValidationError('Validation failed', [{
          field: 'text',
          message: 'No valid memory segments found in text'
        }]);
      }

      const importedMemories = [];
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Process each segment with AI categorization and weighting
      for (const segment of rawSegments) {
        try {
          let category = 'misc';
          let weight = 1.0;

          if (auto_weight) {
            // Use AI to categorize and weight the memory
            const prompt = `Analyze this memory snippet and provide:
1. A category (must be one of: humor, regrets, childhood, advice, personality, misc)
2. A weight/importance score from 0.5 to 5.0 where:
   - 5.0 = deeply sentimental, defining trait, or major life event
   - 3.0 = meaningful memory or notable characteristic
   - 1.0 = typical everyday memory
   - 0.5 = trivial detail

Memory: "${segment}"

Respond ONLY with JSON in this format: {"category": "...", "weight": ...}`;

            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 100 }
            });

            const responseText = result.response.text().trim();
            // Extract JSON from response (handle potential markdown)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);

              if (parsed.category && ['humor', 'regrets', 'childhood', 'advice', 'personality', 'misc'].includes(parsed.category)) {
                category = parsed.category;
              }

              if (parsed.weight && !isNaN(parseFloat(parsed.weight))) {
                weight = Math.max(0.5, Math.min(5.0, parseFloat(parsed.weight)));
              }
            }
          }

          const memory = createMemory(category, segment, weight);
          persona.memories.push(memory);
          importedMemories.push(memory);
        } catch (aiError) {
          console.error('AI categorization failed for segment, using defaults:', aiError);
          // Fall back to defaults if AI fails
          const memory = createMemory('misc', segment, 1.0);
          persona.memories.push(memory);
          importedMemories.push(memory);
        }
      }

      persona.updated_at = new Date().toISOString();
      data.personas[personaIndex] = persona;
      await savePersonas(data);

      // Auto-create snapshot
      const snapshot = createSnapshot(persona, `Auto Snapshot – Bulk Import (${new Date().toISOString()})`);
      persona.snapshots.push(snapshot);
      await savePersonas(data);

      res.status(201).json({
        success: true,
        imported: importedMemories.length,
        memories: importedMemories,
        message: `Successfully imported ${importedMemories.length} memories`
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas/:id/wizard - Process wizard inputs and generate memories
  async processWizard(req, res, next) {
    try {
      const { id } = req.params;
      const { wizard_inputs } = req.body;

      if (!wizard_inputs || typeof wizard_inputs !== 'object') {
        throw new ValidationError('Validation failed', [{
          field: 'wizard_inputs',
          message: 'wizard_inputs is required and must be an object'
        }]);
      }

      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === id);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const persona = data.personas[personaIndex];

      // Combine all wizard inputs into text for processing (enhanced 28-question system)
      const wizardText = `
User's Name: ${wizard_inputs.user_name || ''}
Loved One's Name: ${wizard_inputs.first_name || ''}
Relationship: ${wizard_inputs.relationship || ''}
When They Passed: ${wizard_inputs.date_passed || ''}
How They Passed: ${wizard_inputs.circumstances || ''}
Persona For: ${wizard_inputs.relationship_end || ''}
Personality: ${wizard_inputs.personality || ''}
At Their Best: ${wizard_inputs.at_their_best || ''}
Quirks and Habits: ${wizard_inputs.quirks_habits || ''}
Their Laugh: ${wizard_inputs.their_laugh || ''}
Daily Rituals: ${wizard_inputs.daily_rituals || ''}
How They Spoke: ${wizard_inputs.how_they_spoke || ''}
How They Comforted: ${wizard_inputs.how_they_comforted || ''}
Phrases and Sayings: ${wizard_inputs.phrases_sayings || ''}
How They Showed Love: ${wizard_inputs.showing_love || ''}
What Mattered Most: ${wizard_inputs.what_mattered || ''}
Hard Times Beliefs: ${wizard_inputs.hard_times_belief || ''}
What They'd Want Remembered: ${wizard_inputs.want_to_remember || ''}
Flaws and Frustrations: ${wizard_inputs.flaws_frustrations || ''}
Important Memory: ${wizard_inputs.important_memory || wizard_inputs.memories || ''}
Moments Shared Often: ${wizard_inputs.moments_shared || ''}
If They Walked In: ${wizard_inputs.if_walked_in || ''}
Topics to Avoid: ${wizard_inputs.topics_avoid || ''}
Would Feel Wrong: ${wizard_inputs.would_feel_wrong || ''}
Awareness Level: ${wizard_inputs.awareness_level || ''}
Talk About Presence: ${wizard_inputs.talk_about_presence || ''}
Anything Else: ${wizard_inputs.anything_else || wizard_inputs.conversations || ''}
      `.trim();

      // Use AI to extract and categorize memories from wizard inputs
      const prompt = `You are helping set up a memorial persona based on user input. Extract discrete, meaningful memories from the following wizard responses.

For each memory:
1. Create a clear, specific memory statement
2. Categorize it (humor, regrets, childhood, advice, personality, misc)
3. Assign a weight from 0.5 to 5.0 based on emotional significance

Wizard Responses:
${wizardText}

Return a JSON array of memories in this format:
[
  {"text": "memory statement", "category": "humor", "weight": 3.5},
  {"text": "another memory", "category": "personality", "weight": 4.0}
]

Extract 5-15 memories. Focus on specific, concrete details rather than general descriptions.`;

      let extractedMemories = [];

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1500 }
        });

        const responseText = result.response.text().trim();
        // Extract JSON array from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          extractedMemories = JSON.parse(jsonMatch[0]);
        }
      } catch (aiError) {
        console.error('AI memory extraction failed:', aiError);
        // Fallback: create basic memories from wizard text
        if (wizardText.length > 0) {
          extractedMemories = [
            { text: wizard_inputs.personality || 'Personality description', category: 'personality', weight: 3.0 },
            { text: wizard_inputs.humor || 'Humor description', category: 'humor', weight: 2.5 },
            { text: wizard_inputs.memories || 'Important memories', category: 'misc', weight: 3.5 }
          ].filter(m => m.text && m.text.trim().length > 0);
        }
      }

      // Create memories
      const createdMemories = [];
      for (const memData of extractedMemories) {
        if (memData.text && memData.text.trim().length > 0) {
          const memory = createMemory(
            memData.category || 'misc',
            memData.text.trim(),
            memData.weight || 3.0
          );
          persona.memories.push(memory);
          createdMemories.push(memory);
        }
      }

      // Update persona settings from wizard tone preferences
      if (!persona.settings) {
        persona.settings = getDefaultSettings();
      }

      if (wizard_inputs.tone_preferences) {
        const tp = wizard_inputs.tone_preferences;
        if (tp.humor_level !== undefined) persona.settings.humor_level = parseFloat(tp.humor_level);
        if (tp.honesty_level !== undefined) persona.settings.honesty_level = parseFloat(tp.honesty_level);
        if (tp.sentimentality_level !== undefined) persona.settings.sentimentality_level = parseFloat(tp.sentimentality_level);
        if (tp.energy_level !== undefined) persona.settings.energy_level = parseFloat(tp.energy_level);
        if (tp.advice_level !== undefined) persona.settings.advice_level = parseFloat(tp.advice_level);
      }

      // Save onboarding context for use in first message and future features (enhanced 28-question system)
      persona.onboarding_context = {
        // User and loved one basics
        user_name: wizard_inputs.user_name || null,
        first_name: wizard_inputs.first_name || null,
        relationship: wizard_inputs.relationship || null,
        date_passed: wizard_inputs.date_passed || null,
        circumstances: wizard_inputs.circumstances || null,
        persona_for: wizard_inputs.relationship_end || null,

        // Core personality
        personality: wizard_inputs.personality || null,
        at_their_best: wizard_inputs.at_their_best || null,
        quirks_habits: wizard_inputs.quirks_habits || null,
        their_laugh: wizard_inputs.their_laugh || null,
        daily_rituals: wizard_inputs.daily_rituals || null,

        // Communication style
        how_they_spoke: wizard_inputs.how_they_spoke || null,
        how_they_comforted: wizard_inputs.how_they_comforted || null,
        phrases_sayings: wizard_inputs.phrases_sayings || null,
        showing_love: wizard_inputs.showing_love || null,

        // Values and beliefs
        what_mattered: wizard_inputs.what_mattered || null,
        hard_times_belief: wizard_inputs.hard_times_belief || null,
        want_to_remember: wizard_inputs.want_to_remember || null,
        flaws_frustrations: wizard_inputs.flaws_frustrations || null,

        // Shared memories
        important_memory: wizard_inputs.important_memory || wizard_inputs.memories || null,
        moments_shared: wizard_inputs.moments_shared || null,
        if_walked_in: wizard_inputs.if_walked_in || null,
        photos_videos: wizard_inputs.photos_videos || null,

        // Boundaries and safety
        topics_avoid: wizard_inputs.topics_avoid || null,
        would_feel_wrong: wizard_inputs.would_feel_wrong || null,

        // Present-day awareness
        awareness_level: wizard_inputs.awareness_level || null,
        talk_about_presence: wizard_inputs.talk_about_presence || null,

        // Final tuning
        anything_else: wizard_inputs.anything_else || wizard_inputs.conversations || null,

        // Legacy fields for backwards compatibility
        humor: wizard_inputs.their_laugh || wizard_inputs.humor || null,
        memories: wizard_inputs.important_memory || wizard_inputs.memories || null,
        conversations: wizard_inputs.anything_else || wizard_inputs.conversations || null,
        relationship_end: wizard_inputs.relationship_end || null,

        completed_at: new Date().toISOString()
      };

      persona.updated_at = new Date().toISOString();
      data.personas[personaIndex] = persona;
      await savePersonas(data);

      // Auto-create snapshot
      const snapshot = createSnapshot(persona, `Auto Snapshot – Setup Wizard (${new Date().toISOString()})`);
      persona.snapshots.push(snapshot);
      await savePersonas(data);

      res.status(201).json({
        success: true,
        memories_created: createdMemories.length,
        memories: createdMemories,
        persona: persona,  // Return full updated persona with onboarding_context
        message: `Wizard completed! Created ${createdMemories.length} memories.`
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/wizard/acknowledgment - Generate personalized acknowledgment
  async generateAcknowledgment(req, res, next) {
    try {
      const { question, answer, personaName } = req.body;

      // Validate required fields
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        throw new ValidationError('Validation failed', [{
          field: 'question',
          message: 'Question is required and must be a non-empty string'
        }]);
      }

      if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
        throw new ValidationError('Validation failed', [{
          field: 'answer',
          message: 'Answer is required and must be a non-empty string'
        }]);
      }

      // Generate personalized acknowledgment using Gemini
      const prompt = `You are a compassionate grief therapist helping someone through an onboarding process. They just answered a question.

Question they were asked: "${question}"
Their answer: "${answer}"
${personaName ? `Their loved one's name: ${personaName}` : ''}

Context: Pay attention to what the question is asking. Some questions are about the user themselves (like their name), and some are about their loved one. Respond appropriately based on what they actually shared.

Generate a warm, genuine, therapeutic acknowledgment of their answer. The acknowledgment should:
- Be 1-3 sentences long
- Feel personal and empathetic, not generic
- Acknowledge what they actually shared (about themselves OR about their loved one, based on the question)
- Reference specific details from their answer when appropriate
- Use their loved one's name naturally if provided and relevant
- Feel like it's from a caring human therapist, not a robot
- Be gentle and warm

DO NOT:
- Say "thank you for sharing" (too formal/clinical)
- Use overly flowery or poetic language
- Make assumptions beyond what they said
- Confuse the user's information with their loved one's information
- Give advice or try to fix anything
- Use generic therapy-speak

Just acknowledge what they shared with warmth and presence.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
      });

      const acknowledgment = result.response.text().trim();

      res.status(200).json({
        success: true,
        acknowledgment: acknowledgment,
        message: 'Acknowledgment generated successfully'
      });
    } catch (error) {
      // If Gemini fails, provide a graceful fallback
      if (error.name === 'ValidationError') {
        next(error);
      } else {
        console.error('AI acknowledgment generation failed:', error);
        // Return a gentle generic acknowledgment as fallback
        res.status(200).json({
          success: true,
          acknowledgment: 'I hear you. What you\'ve shared holds a lot of meaning.',
          message: 'Acknowledgment generated (fallback)'
        });
      }
    }
  },

  // POST /api/personas/:id/boost - Analyze persona and get improvement recommendations
  async boostPersona(req, res, next) {
    try {
      const { id } = req.params;
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, id);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      // Load journal entries for this persona
      const { loadJournal } = await import('../journal/utils.js');
      const allJournals = await loadJournal();
      const personaJournals = allJournals.filter(j => j.persona_id === id);

      // Package persona data for analysis
      const analysisData = {
        persona: {
          name: persona.name,
          relationship: persona.relationship,
          description: persona.description
        },
        memories: persona.memories || [],
        journals: personaJournals.map(j => ({
          text: j.text,
          mood: j.mood,
          created_at: j.created_at
        })),
        settings: persona.settings || getDefaultSettings(),
        chat_logs: [] // Not implemented yet - placeholder for future
      };

      // Construct AI prompt for persona analysis
      const prompt = `You are analyzing a conversational AI persona to provide improvement recommendations.

PERSONA DATA:
${JSON.stringify(analysisData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Do NOT invent unknown biographical facts.
2. Only suggest memories or traits that could plausibly emerge from patterns in the supplied data.
3. Never claim supernatural information.
4. Base all recommendations strictly on the provided persona data.

TASK: Analyze this persona and return ONLY valid JSON (no markdown, no explanations) with the following structure:

{
  "missing_categories": ["category1", "category2"],
  "new_memories": [
    {
      "category": "humor|regrets|childhood|advice|personality|misc",
      "text": "specific memory suggestion based on existing data patterns",
      "weight": 1.0-5.0
    }
  ],
  "tone_suggestions": {
    "humor": 0-5,
    "honesty": 0-5,
    "sentimentality": 0-5,
    "energy": 0-5,
    "advice_giving": 0-5
  },
  "boundary_flags": [
    "descriptive flag about potential issues"
  ]
}

CATEGORY ANALYSIS:
- Valid categories: humor, regrets, childhood, advice, personality, misc
- Identify which categories have few or no memories
- Suggest 3-5 new memories that would fill gaps

TONE ANALYSIS:
- Current settings: ${JSON.stringify(analysisData.settings)}
- Suggest adjustments based on persona description and existing memories

BOUNDARY FLAGS:
- Identify potential issues like: tone inconsistencies, risk of regret spirals, overly sentimental, etc.

Return ONLY the JSON object, nothing else.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      });

      const responseText = result.response.text();
      let recommendations;

      try {
        // Extract JSON from response (handle potential markdown)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseText);
        throw new AppError('Failed to generate recommendations. Please try again.', 500);
      }

      // Validate recommendations structure
      if (!recommendations.missing_categories) recommendations.missing_categories = [];
      if (!recommendations.new_memories) recommendations.new_memories = [];
      if (!recommendations.tone_suggestions) recommendations.tone_suggestions = {};
      if (!recommendations.boundary_flags) recommendations.boundary_flags = [];

      res.status(200).json({
        success: true,
        recommendations
      });
    } catch (error) {
      next(error);
    }
  }
};
