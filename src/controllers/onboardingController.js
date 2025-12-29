// Onboarding Controller - Voice-First Persona Creation
import { ValidationError, AppError } from '../utils/errorHandler.js';
import {
  ONBOARDING_QUESTIONS,
  ONBOARDING_SECTIONS,
  getQuestionById,
  getQuestionsBySection,
  getSectionById,
  getTotalQuestionCount
} from '../onboarding/questions.js';
import {
  getAnswersForPersona,
  getAnswerForQuestion,
  saveAnswer,
  addMediaToAnswer,
  removeMediaFromAnswer,
  getOnboardingProgress
} from '../onboarding/utils.js';
import { loadPersonas, findPersonaById } from '../personas/utils.js';

export const onboardingController = {
  // GET /api/onboarding/questions - Get all questions structure
  async getQuestions(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          sections: ONBOARDING_SECTIONS,
          questions: ONBOARDING_QUESTIONS,
          totalQuestions: getTotalQuestionCount()
        },
        message: 'Questions retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/onboarding/questions/:questionId - Get single question
  async getQuestion(req, res, next) {
    try {
      const { questionId } = req.params;
      const question = getQuestionById(questionId);

      if (!question) {
        throw new AppError('Question not found', 404);
      }

      const section = getSectionById(question.sectionId);

      res.status(200).json({
        success: true,
        data: {
          question,
          section
        },
        message: 'Question retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:personaId/onboarding - Get all answers for a persona
  async getPersonaAnswers(req, res, next) {
    try {
      const { personaId } = req.params;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const answers = await getAnswersForPersona(personaId);
      const progress = await getOnboardingProgress(personaId);

      res.status(200).json({
        success: true,
        data: {
          answers,
          progress
        },
        message: 'Onboarding answers retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:personaId/onboarding/:questionId - Get answer for specific question
  async getAnswer(req, res, next) {
    try {
      const { personaId, questionId } = req.params;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const question = getQuestionById(questionId);
      if (!question) {
        throw new AppError('Question not found', 404);
      }

      const answer = await getAnswerForQuestion(personaId, questionId);

      res.status(200).json({
        success: true,
        data: {
          question,
          answer: answer || null
        },
        message: answer ? 'Answer retrieved successfully' : 'No answer yet for this question'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/personas/:personaId/onboarding/:questionId - Save/update answer
  async saveAnswer(req, res, next) {
    try {
      const { personaId, questionId } = req.params;
      const { textResponse, voiceTranscript, selectedOption } = req.body;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const question = getQuestionById(questionId);
      if (!question) {
        throw new AppError('Question not found', 404);
      }

      // Validate selectedOption for select questions
      if (question.inputType === 'select' && selectedOption) {
        const validOptions = question.options.map(o => o.value);
        if (!validOptions.includes(selectedOption)) {
          throw new ValidationError('Validation failed', [{
            field: 'selectedOption',
            message: `Invalid option. Must be one of: ${validOptions.join(', ')}`
          }]);
        }
      }

      const answer = await saveAnswer(personaId, questionId, {
        textResponse,
        voiceTranscript,
        selectedOption
      });

      const progress = await getOnboardingProgress(personaId);

      res.status(200).json({
        success: true,
        data: {
          answer,
          progress
        },
        message: 'Answer saved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/personas/:personaId/onboarding/:questionId/media - Upload media
  async uploadMedia(req, res, next) {
    try {
      const { personaId, questionId } = req.params;
      const { mediaType } = req.body;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const question = getQuestionById(questionId);
      if (!question) {
        throw new AppError('Question not found', 404);
      }

      if (!req.file) {
        throw new ValidationError('Validation failed', [{
          field: 'file',
          message: 'No file uploaded'
        }]);
      }

      if (!['photos', 'audio', 'video'].includes(mediaType)) {
        throw new ValidationError('Validation failed', [{
          field: 'mediaType',
          message: 'mediaType must be one of: photos, audio, video'
        }]);
      }

      const answer = await addMediaToAnswer(personaId, questionId, mediaType, req.file.path);

      res.status(201).json({
        success: true,
        data: {
          answer,
          uploadedFile: {
            path: req.file.path,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
          }
        },
        message: 'Media uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/personas/:personaId/onboarding/:questionId/media/:mediaId - Remove media
  async deleteMedia(req, res, next) {
    try {
      const { personaId, questionId, mediaId } = req.params;
      const { mediaType } = req.body;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      if (!['photos', 'audio', 'video'].includes(mediaType)) {
        throw new ValidationError('Validation failed', [{
          field: 'mediaType',
          message: 'mediaType must be one of: photos, audio, video'
        }]);
      }

      const answer = await removeMediaFromAnswer(personaId, questionId, mediaType, mediaId);

      if (!answer) {
        throw new AppError('Answer not found', 404);
      }

      res.status(200).json({
        success: true,
        data: { answer },
        message: 'Media removed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/personas/:personaId/onboarding/progress - Get onboarding progress
  async getProgress(req, res, next) {
    try {
      const { personaId } = req.params;

      // Verify persona exists
      const data = await loadPersonas();
      const persona = findPersonaById(data.personas, personaId);

      if (!persona) {
        throw new AppError('Persona not found', 404);
      }

      const progress = await getOnboardingProgress(personaId);

      res.status(200).json({
        success: true,
        data: progress,
        message: 'Progress retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
