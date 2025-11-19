import { api } from './api';
import {
  Persona,
  Memory,
  PersonaSettings,
  Snapshot,
  WizardData,
  BoosterRecommendations,
  ApiResponse,
} from '../types';

export const personaService = {
  // Personas
  async getAllPersonas(): Promise<ApiResponse<Persona[]>> {
    return api.get<ApiResponse<Persona[]>>('/personas');
  },

  async getPersona(id: string): Promise<ApiResponse<Persona>> {
    return api.get<ApiResponse<Persona>>(`/personas/${id}`);
  },

  async createPersona(data: {
    name: string;
    relationship?: string;
    description?: string;
  }): Promise<ApiResponse<Persona>> {
    return api.post<ApiResponse<Persona>>('/personas', data);
  },

  async updatePersona(
    id: string,
    data: Partial<Persona>
  ): Promise<ApiResponse<Persona>> {
    return api.put<ApiResponse<Persona>>(`/personas/${id}`, data);
  },

  async deletePersona(id: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/personas/${id}`);
  },

  // Memories
  async getMemories(personaId: string): Promise<ApiResponse<Memory[]>> {
    return api.get<ApiResponse<Memory[]>>(`/personas/${personaId}/memories`);
  },

  async createMemory(
    personaId: string,
    data: {
      category: Memory['category'];
      text: string;
      weight?: number;
    }
  ): Promise<ApiResponse<Memory>> {
    return api.post<ApiResponse<Memory>>(
      `/personas/${personaId}/memories`,
      data
    );
  },

  async updateMemory(
    personaId: string,
    memoryId: string,
    data: Partial<Memory>
  ): Promise<ApiResponse<Memory>> {
    return api.put<ApiResponse<Memory>>(
      `/personas/${personaId}/memories/${memoryId}`,
      data
    );
  },

  async deleteMemory(
    personaId: string,
    memoryId: string
  ): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(
      `/personas/${personaId}/memories/${memoryId}`
    );
  },

  async bulkImportMemories(
    personaId: string,
    data: {
      text: string;
      auto_categorize?: boolean;
    }
  ): Promise<ApiResponse<Memory[]>> {
    return api.post<ApiResponse<Memory[]>>(
      `/personas/${personaId}/memories/bulk-import`,
      data
    );
  },

  // Settings
  async getSettings(personaId: string): Promise<ApiResponse<PersonaSettings>> {
    return api.get<ApiResponse<PersonaSettings>>(
      `/personas/${personaId}/settings`
    );
  },

  async updateSettings(
    personaId: string,
    data: Partial<PersonaSettings>
  ): Promise<ApiResponse<PersonaSettings>> {
    return api.put<ApiResponse<PersonaSettings>>(
      `/personas/${personaId}/settings`,
      data
    );
  },

  // Snapshots
  async getSnapshots(personaId: string): Promise<ApiResponse<Snapshot[]>> {
    return api.get<ApiResponse<Snapshot[]>>(
      `/personas/${personaId}/snapshots`
    );
  },

  async createSnapshot(
    personaId: string,
    data: { name: string }
  ): Promise<ApiResponse<Snapshot>> {
    return api.post<ApiResponse<Snapshot>>(
      `/personas/${personaId}/snapshots`,
      data
    );
  },

  async restoreSnapshot(
    personaId: string,
    snapshotId: string
  ): Promise<ApiResponse<void>> {
    return api.post<ApiResponse<void>>(
      `/personas/${personaId}/snapshots/${snapshotId}/restore`
    );
  },

  // Wizard
  async runWizard(
    personaId: string,
    data: WizardData
  ): Promise<ApiResponse<{ persona: Persona; memories: Memory[] }>> {
    return api.post<ApiResponse<{ persona: Persona; memories: Memory[] }>>(
      `/personas/${personaId}/wizard`,
      data
    );
  },

  // Booster
  async getBoosterRecommendations(
    personaId: string
  ): Promise<ApiResponse<BoosterRecommendations>> {
    return api.post<ApiResponse<BoosterRecommendations>>(
      `/personas/${personaId}/boost`
    );
  },
};
