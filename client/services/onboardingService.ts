import { api } from './api';
import {
  ApiResponse,
  OnboardingQuestion,
  OnboardingSection,
  OnboardingAnswer,
  OnboardingProgress,
  OnboardingQuestionsResponse,
  OnboardingAnswersResponse,
} from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const onboardingService = {
  // Get all questions structure
  async getQuestions(): Promise<ApiResponse<OnboardingQuestionsResponse>> {
    return api.get<ApiResponse<OnboardingQuestionsResponse>>('/onboarding/questions');
  },

  // Get a single question
  async getQuestion(questionId: string): Promise<ApiResponse<{ question: OnboardingQuestion; section: OnboardingSection }>> {
    return api.get<ApiResponse<{ question: OnboardingQuestion; section: OnboardingSection }>>(`/onboarding/questions/${questionId}`);
  },

  // Get all answers for a persona
  async getPersonaAnswers(personaId: string): Promise<ApiResponse<OnboardingAnswersResponse>> {
    return api.get<ApiResponse<OnboardingAnswersResponse>>(`/personas/${personaId}/onboarding`);
  },

  // Get answer for a specific question
  async getAnswer(personaId: string, questionId: string): Promise<ApiResponse<{ question: OnboardingQuestion; answer: OnboardingAnswer | null }>> {
    return api.get<ApiResponse<{ question: OnboardingQuestion; answer: OnboardingAnswer | null }>>(`/personas/${personaId}/onboarding/${questionId}`);
  },

  // Get onboarding progress
  async getProgress(personaId: string): Promise<ApiResponse<OnboardingProgress>> {
    return api.get<ApiResponse<OnboardingProgress>>(`/personas/${personaId}/onboarding/progress`);
  },

  // Save or update an answer
  async saveAnswer(
    personaId: string,
    questionId: string,
    data: {
      textResponse?: string;
      voiceTranscript?: string;
      selectedOption?: string;
    }
  ): Promise<ApiResponse<{ answer: OnboardingAnswer; progress: OnboardingProgress }>> {
    return api.put<ApiResponse<{ answer: OnboardingAnswer; progress: OnboardingProgress }>>(
      `/personas/${personaId}/onboarding/${questionId}`,
      data
    );
  },

  // Upload media for an answer
  async uploadMedia(
    personaId: string,
    questionId: string,
    file: Blob,
    filename: string,
    mediaType: 'photos' | 'audio' | 'video'
  ): Promise<ApiResponse<{ answer: OnboardingAnswer; uploadedFile: { path: string; filename: string } }>> {
    const formData = new FormData();
    formData.append('file', file as any, filename);
    formData.append('mediaType', mediaType);

    const url = `${API_URL}/personas/${personaId}/onboarding/${questionId}/media`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  },

  // Remove media from an answer
  async deleteMedia(
    personaId: string,
    questionId: string,
    mediaId: string,
    mediaType: 'photos' | 'audio' | 'video'
  ): Promise<ApiResponse<{ answer: OnboardingAnswer }>> {
    const url = `${API_URL}/personas/${personaId}/onboarding/${questionId}/media/${mediaId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mediaType }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  },

  // Transcribe voice recording
  async transcribeAudio(audioBlob: Blob, filename: string): Promise<{ success: boolean; text: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob as any, filename);

    const url = `${API_URL}/transcribe`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  },
};
