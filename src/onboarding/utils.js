// Onboarding data utilities
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ONBOARDING_FILE = path.join(__dirname, 'onboarding.json');

// Initialize empty onboarding data structure
const defaultOnboardingData = {
  answers: []
};

// Load onboarding data from file
export async function loadOnboardingData() {
  try {
    const data = await fs.readFile(ONBOARDING_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it with default data
      await saveOnboardingData(defaultOnboardingData);
      return defaultOnboardingData;
    }
    throw error;
  }
}

// Save onboarding data to file
export async function saveOnboardingData(data) {
  await fs.writeFile(ONBOARDING_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Create a new onboarding answer
export function createOnboardingAnswer(personaId, questionId, data = {}) {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    personaId,
    questionId,
    textResponse: data.textResponse || null,
    voiceTranscript: data.voiceTranscript || null,
    selectedOption: data.selectedOption || null,
    media: {
      photos: data.media?.photos || [],
      audio: data.media?.audio || [],
      video: data.media?.video || []
    },
    createdAt: now,
    updatedAt: now
  };
}

// Get all answers for a persona
export async function getAnswersForPersona(personaId) {
  const data = await loadOnboardingData();
  return data.answers.filter(a => a.personaId === personaId);
}

// Get answer for a specific question
export async function getAnswerForQuestion(personaId, questionId) {
  const data = await loadOnboardingData();
  return data.answers.find(a => a.personaId === personaId && a.questionId === questionId);
}

// Save or update an answer (upsert)
export async function saveAnswer(personaId, questionId, answerData) {
  const data = await loadOnboardingData();
  const existingIndex = data.answers.findIndex(
    a => a.personaId === personaId && a.questionId === questionId
  );

  if (existingIndex >= 0) {
    // Update existing answer
    const existing = data.answers[existingIndex];
    data.answers[existingIndex] = {
      ...existing,
      textResponse: answerData.textResponse !== undefined ? answerData.textResponse : existing.textResponse,
      voiceTranscript: answerData.voiceTranscript !== undefined ? answerData.voiceTranscript : existing.voiceTranscript,
      selectedOption: answerData.selectedOption !== undefined ? answerData.selectedOption : existing.selectedOption,
      media: {
        photos: answerData.media?.photos || existing.media.photos,
        audio: answerData.media?.audio || existing.media.audio,
        video: answerData.media?.video || existing.media.video
      },
      updatedAt: new Date().toISOString()
    };
  } else {
    // Create new answer
    const newAnswer = createOnboardingAnswer(personaId, questionId, answerData);
    data.answers.push(newAnswer);
  }

  await saveOnboardingData(data);
  return data.answers.find(a => a.personaId === personaId && a.questionId === questionId);
}

// Add media to an answer
export async function addMediaToAnswer(personaId, questionId, mediaType, mediaPath) {
  const data = await loadOnboardingData();
  let answer = data.answers.find(a => a.personaId === personaId && a.questionId === questionId);

  if (!answer) {
    // Create answer if it doesn't exist
    answer = createOnboardingAnswer(personaId, questionId);
    data.answers.push(answer);
  }

  // Add media to the appropriate array
  if (['photos', 'audio', 'video'].includes(mediaType)) {
    answer.media[mediaType].push({
      id: uuidv4(),
      path: mediaPath,
      uploadedAt: new Date().toISOString()
    });
    answer.updatedAt = new Date().toISOString();
  }

  await saveOnboardingData(data);
  return answer;
}

// Remove media from an answer
export async function removeMediaFromAnswer(personaId, questionId, mediaType, mediaId) {
  const data = await loadOnboardingData();
  const answer = data.answers.find(a => a.personaId === personaId && a.questionId === questionId);

  if (!answer) {
    return null;
  }

  if (['photos', 'audio', 'video'].includes(mediaType)) {
    answer.media[mediaType] = answer.media[mediaType].filter(m => m.id !== mediaId);
    answer.updatedAt = new Date().toISOString();
  }

  await saveOnboardingData(data);
  return answer;
}

// Delete all answers for a persona
export async function deleteAnswersForPersona(personaId) {
  const data = await loadOnboardingData();
  data.answers = data.answers.filter(a => a.personaId !== personaId);
  await saveOnboardingData(data);
}

// Get onboarding progress summary for a persona
export async function getOnboardingProgress(personaId) {
  const answers = await getAnswersForPersona(personaId);
  const answeredQuestions = answers.filter(a =>
    a.textResponse || a.voiceTranscript || a.selectedOption ||
    a.media.photos.length > 0 || a.media.audio.length > 0 || a.media.video.length > 0
  );

  return {
    totalQuestions: 21,
    answeredCount: answeredQuestions.length,
    answeredQuestionIds: answeredQuestions.map(a => a.questionId),
    percentComplete: Math.round((answeredQuestions.length / 21) * 100)
  };
}
