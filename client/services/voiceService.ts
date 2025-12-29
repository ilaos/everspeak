import { api } from './api';
import { ApiResponse } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export interface VoiceSettings {
  enabled: boolean;
  voice_id: string;
  auto_play: boolean;
}

export interface VoiceGenerateResponse {
  voiceGenerated: boolean;
  text: string;
  reason?: string;
  audio?: {
    url: string;
    duration: number;
    voiceId: string;
  };
}

export const voiceService = {
  // Get available voice options
  async getVoiceOptions(): Promise<ApiResponse<{ voices: VoiceOption[]; note: string }>> {
    return api.get<ApiResponse<{ voices: VoiceOption[]; note: string }>>('/voice/options');
  },

  // Get voice settings for a persona
  async getVoiceSettings(personaId: string): Promise<ApiResponse<{ voice: VoiceSettings; availableVoices: VoiceOption[] }>> {
    return api.get<ApiResponse<{ voice: VoiceSettings; availableVoices: VoiceOption[] }>>(`/personas/${personaId}/voice-settings`);
  },

  // Update voice settings for a persona
  async updateVoiceSettings(
    personaId: string,
    settings: { enabled?: boolean; voice_id?: string }
  ): Promise<ApiResponse<{ voice: VoiceSettings }>> {
    return api.put<ApiResponse<{ voice: VoiceSettings }>>(`/personas/${personaId}/voice-settings`, settings);
  },

  // Generate voice reply
  async generateVoiceReply(
    personaId: string,
    text: string,
    userMessage?: string
  ): Promise<ApiResponse<VoiceGenerateResponse>> {
    return api.post<ApiResponse<VoiceGenerateResponse>>('/voice/generate', {
      personaId,
      text,
      userMessage,
    });
  },

  // Get full audio URL
  getAudioUrl(audioPath: string): string {
    if (audioPath.startsWith('http')) {
      return audioPath;
    }
    return `${API_URL}${audioPath}`;
  },

  // Transcribe audio (already exists but adding here for completeness)
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
