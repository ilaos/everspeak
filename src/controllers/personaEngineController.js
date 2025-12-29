// Persona Engine Controller
// Handles hydration and prompt generation for personas

import { hydratePersonaPrompt, validateHydration } from '../persona-engine/index.js';
import { loadPersonas, findPersonaById } from '../personas/utils.js';
import { AppError } from '../utils/errorHandler.js';

export const personaEngineController = {
  /**
   * GET /api/personas/:personaId/hydrate
   * Generate a hydrated system prompt for a persona.
   * Useful for testing and inspection before chat integration.
   */
  async hydratePrompt(req, res, next) {
    try {
      const { personaId } = req.params;
      const { includePrompt = 'false' } = req.query;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      // Hydrate the prompt
      const result = await hydratePersonaPrompt({
        personaId,
        personaName: persona.name,
      });

      // Validate the hydration
      const validation = validateHydration(result);

      // Build response
      const response = {
        success: true,
        data: {
          personaId,
          personaName: persona.name,
          meta: result.meta,
          validation,
          promptLength: result.prompt.length,
          approximateTokens: Math.ceil(result.prompt.length / 4),
        },
        message: 'Prompt hydrated successfully',
      };

      // Include full prompt only if requested (it's large)
      if (includePrompt === 'true') {
        response.data.prompt = result.prompt;
      }

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/personas/:personaId/hydrate/preview
   * Get a preview of what sections have content.
   * Lighter endpoint for UI display.
   */
  async previewHydration(req, res, next) {
    try {
      const { personaId } = req.params;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      // Hydrate to get metadata
      const result = await hydratePersonaPrompt({
        personaId,
        personaName: persona.name,
      });

      const validation = validateHydration(result);

      res.status(200).json({
        success: true,
        data: {
          personaId,
          personaName: persona.name,
          sectionsReady: result.meta.injectedSections,
          sectionsMissing: result.meta.missingSections,
          totalAnswers: result.meta.totalAnswers,
          isValid: validation.isValid,
          warnings: validation.warnings,
          completionPercentage: Math.round(
            (result.meta.injectedSections.length / 8) * 100
          ),
        },
        message: 'Hydration preview generated',
      });
    } catch (error) {
      next(error);
    }
  },
};
