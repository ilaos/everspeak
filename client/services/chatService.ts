import { api } from './api';
import { MessageRequest, MessageResponse } from '../types';

export const chatService = {
  async sendMessage(data: MessageRequest): Promise<MessageResponse> {
    return api.post<MessageResponse>('/message', data);
  },

  async transcribeAudio(
    audioBlob: Blob,
    filename: string
  ): Promise<{ success: boolean; data: { text: string } }> {
    return api.uploadFile<{ success: boolean; data: { text: string } }>(
      '/transcribe',
      audioBlob,
      filename
    );
  },
};
