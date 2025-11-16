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
  restoreFromSnapshot
} from '../personas/utils.js';

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
  }
};
