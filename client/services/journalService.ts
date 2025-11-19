import { api } from './api';
import { JournalEntry, ApiResponse } from '../types';

export const journalService = {
  async getAllEntries(): Promise<ApiResponse<JournalEntry[]>> {
    return api.get<ApiResponse<JournalEntry[]>>('/journal');
  },

  async getEntry(id: string): Promise<ApiResponse<JournalEntry>> {
    return api.get<ApiResponse<JournalEntry>>(`/journal/${id}`);
  },

  async createEntry(data: {
    persona_id?: string;
    title: string;
    content: string;
    mood?: string;
    tags?: string[];
    generate_reflection?: boolean;
  }): Promise<ApiResponse<JournalEntry>> {
    return api.post<ApiResponse<JournalEntry>>('/journal', data);
  },

  async updateEntry(
    id: string,
    data: Partial<JournalEntry>
  ): Promise<ApiResponse<JournalEntry>> {
    return api.put<ApiResponse<JournalEntry>>(`/journal/${id}`, data);
  },

  async deleteEntry(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/journal/${id}`);
  },
};
