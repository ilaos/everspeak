// Voice Controller for Persona Voice Chat
// Handles voice reply generation and audio file serving

import { AppError } from '../utils/errorHandler.js';
import { loadPersonas, findPersonaById, AVAILABLE_VOICES } from '../personas/utils.js';
import { ttsService } from '../services/ttsService.js';
import { safetyService } from '../services/safetyService.js';
import path from 'node:path';
import fs from 'node:fs';

export const voiceController = {
  /**
   * POST /api/voice/generate
   * Generate a voice reply for persona text.
   *
   * Only generates voice if:
   * - User has voice enabled for this persona
   * - No high distress detected
   * - No dependency escalation
   */
  async generateVoiceReply(req, res, next) {
    try {
      const { personaId, text, userMessage } = req.body;

      if (!personaId || !text) {
        throw new AppError('personaId and text are required', 400);
      }

      // Load persona and check voice settings
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      // Check if voice is enabled
      const voiceEnabled = persona.settings?.voice?.enabled === true;
      if (!voiceEnabled) {
        return res.status(200).json({
          success: true,
          data: {
            voiceGenerated: false,
            reason: 'voice_disabled',
            text
          },
          message: 'Voice replies not enabled for this persona'
        });
      }

      // Check safety eligibility if user message provided
      if (userMessage) {
        const safety = safetyService.checkVoiceEligibility(userMessage, personaId);

        if (!safety.voiceAllowed) {
          // Voice disabled due to safety - return text only, no announcement
          return res.status(200).json({
            success: true,
            data: {
              voiceGenerated: false,
              reason: safety.reason,
              text
              // Note: We do NOT tell the user why voice was disabled
            },
            message: 'Reply generated'
          });
        }
      }

      // Get voice ID from settings
      const voiceId = persona.settings?.voice?.voice_id || 'alloy';

      // Generate voice
      const voiceResult = await ttsService.generateVoice(text, voiceId);

      res.status(200).json({
        success: true,
        data: {
          voiceGenerated: true,
          text,
          audio: {
            url: voiceResult.audioUrl,
            duration: voiceResult.duration,
            voiceId: voiceResult.voiceId
          }
        },
        message: 'Voice reply generated'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/voice/:filename
   * Serve a voice audio file.
   */
  async serveVoiceFile(req, res, next) {
    try {
      const { filename } = req.params;

      // Validate filename (prevent path traversal)
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new AppError('Invalid filename', 400);
      }

      const filePath = ttsService.getVoiceFilePath(filename);

      if (!filePath) {
        throw new AppError('Voice file not found', 404);
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'private, max-age=3600');

      // Stream the file
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/voice/options
   * Get available voice options.
   */
  async getVoiceOptions(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          voices: AVAILABLE_VOICES,
          note: 'These are curated voices. Voice does not affect persona behavior or memory.'
        },
        message: 'Voice options retrieved'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/personas/:personaId/voice-settings
   * Update voice settings for a persona.
   */
  async updateVoiceSettings(req, res, next) {
    try {
      const { personaId } = req.params;
      const { enabled, voice_id } = req.body;

      // Load persona
      const data = await loadPersonas();
      const personaIndex = data.personas.findIndex(p => p.id === personaId);

      if (personaIndex === -1) {
        throw new AppError('Persona not found', 404);
      }

      const persona = data.personas[personaIndex];

      // Initialize voice settings if not present
      if (!persona.settings) {
        persona.settings = {};
      }
      if (!persona.settings.voice) {
        persona.settings.voice = {
          enabled: false,
          voice_id: 'alloy',
          auto_play: false
        };
      }

      // Update settings
      if (enabled !== undefined) {
        persona.settings.voice.enabled = enabled === true;
      }
      if (voice_id !== undefined) {
        const validVoiceIds = AVAILABLE_VOICES.map(v => v.id);
        if (validVoiceIds.includes(voice_id)) {
          persona.settings.voice.voice_id = voice_id;
        } else {
          throw new AppError(`Invalid voice_id. Must be one of: ${validVoiceIds.join(', ')}`, 400);
        }
      }

      // auto_play is ALWAYS false (safety rule)
      persona.settings.voice.auto_play = false;

      persona.updated_at = new Date().toISOString();
      data.personas[personaIndex] = persona;

      // Save
      const { savePersonas } = await import('../personas/utils.js');
      await savePersonas(data);

      res.status(200).json({
        success: true,
        data: {
          voice: persona.settings.voice
        },
        message: 'Voice settings updated'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/personas/:personaId/voice-settings
   * Get voice settings for a persona.
   */
  async getVoiceSettings(req, res, next) {
    try {
      const { personaId } = req.params;

      // Load persona
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const voiceSettings = persona.settings?.voice || {
        enabled: false,
        voice_id: 'alloy',
        auto_play: false
      };

      res.status(200).json({
        success: true,
        data: {
          voice: voiceSettings,
          availableVoices: AVAILABLE_VOICES
        },
        message: 'Voice settings retrieved'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/voice/:filename
   * Delete a voice file (cleanup).
   */
  async deleteVoiceFile(req, res, next) {
    try {
      const { filename } = req.params;

      if (!filename || filename.includes('..')) {
        throw new AppError('Invalid filename', 400);
      }

      const deleted = ttsService.deleteVoiceFile(filename);

      res.status(200).json({
        success: true,
        data: { deleted },
        message: deleted ? 'Voice file deleted' : 'Voice file not found'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/voice/cleanup
   * Clean up old voice files.
   */
  async cleanupVoiceFiles(req, res, next) {
    try {
      const { maxAgeHours = 24 } = req.body;
      const deleted = ttsService.cleanupOldFiles(maxAgeHours);

      res.status(200).json({
        success: true,
        data: { deletedCount: deleted },
        message: `Cleaned up ${deleted} old voice files`
      });
    } catch (error) {
      next(error);
    }
  }
};
