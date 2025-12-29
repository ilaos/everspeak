import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnswer, OnboardingProgress, OnboardingQuestion } from '../types';

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_STATE: 'everspeak_onboarding_state',
  DRAFT_ANSWERS: 'everspeak_onboarding_drafts',
};

// Interface for persisted onboarding state
export interface PersistedOnboardingState {
  personaId: string;
  personaName: string;
  currentQuestionIndex: number;
  progress: OnboardingProgress | null;
  lastUpdated: string;
  isComplete: boolean;
}

// Interface for draft answer (unsaved input)
export interface DraftAnswer {
  questionId: string;
  textInput: string;
  voiceTranscript: string;
  selectedOption: string | null;
  lastUpdated: string;
}

// Interface for all drafts keyed by personaId
interface DraftAnswersMap {
  [personaId: string]: {
    [questionId: string]: DraftAnswer;
  };
}

// Sample persona data for dev tools
export const SAMPLE_PERSONA_DATA: { [questionId: string]: DraftAnswer } = {
  'q1': {
    questionId: 'q1',
    textInput: 'John Smith',
    voiceTranscript: '',
    selectedOption: null,
    lastUpdated: new Date().toISOString(),
  },
  'q2': {
    questionId: 'q2',
    textInput: '',
    voiceTranscript: '',
    selectedOption: 'parent',
    lastUpdated: new Date().toISOString(),
  },
  'q3': {
    questionId: 'q3',
    textInput: 'He had a warm, hearty laugh and always knew how to lighten the mood. Quick-witted with a dry sense of humor, but also deeply caring and thoughtful.',
    voiceTranscript: '',
    selectedOption: null,
    lastUpdated: new Date().toISOString(),
  },
  'q4': {
    questionId: 'q4',
    textInput: 'Summer road trips to the lake, teaching me how to fish, Sunday morning pancakes with his "secret" recipe.',
    voiceTranscript: '',
    selectedOption: null,
    lastUpdated: new Date().toISOString(),
  },
  'q5': {
    questionId: 'q5',
    textInput: '"Hard work beats talent when talent doesn\'t work hard" - he said this whenever I felt discouraged.',
    voiceTranscript: '',
    selectedOption: null,
    lastUpdated: new Date().toISOString(),
  },
};

export const onboardingPersistence = {
  // Save the current onboarding state
  async saveState(state: PersistedOnboardingState): Promise<void> {
    try {
      const existingData = await this.getAllStates();
      existingData[state.personaId] = {
        ...state,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(existingData));
      console.log('[Persistence] Saved onboarding state for persona:', state.personaId);
    } catch (error) {
      console.error('[Persistence] Failed to save onboarding state:', error);
      throw error;
    }
  },

  // Get onboarding state for a specific persona
  async getState(personaId: string): Promise<PersistedOnboardingState | null> {
    try {
      const allStates = await this.getAllStates();
      return allStates[personaId] || null;
    } catch (error) {
      console.error('[Persistence] Failed to get onboarding state:', error);
      return null;
    }
  },

  // Get all persisted states
  async getAllStates(): Promise<{ [personaId: string]: PersistedOnboardingState }> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('[Persistence] Failed to get all states:', error);
      return {};
    }
  },

  // Save a draft answer (on every input change)
  async saveDraftAnswer(personaId: string, draft: DraftAnswer): Promise<void> {
    try {
      const allDrafts = await this.getAllDrafts();
      if (!allDrafts[personaId]) {
        allDrafts[personaId] = {};
      }
      allDrafts[personaId][draft.questionId] = {
        ...draft,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts));
      console.log('[Persistence] Saved draft for question:', draft.questionId);
    } catch (error) {
      console.error('[Persistence] Failed to save draft answer:', error);
      throw error;
    }
  },

  // Get draft answer for a specific question
  async getDraftAnswer(personaId: string, questionId: string): Promise<DraftAnswer | null> {
    try {
      const allDrafts = await this.getAllDrafts();
      return allDrafts[personaId]?.[questionId] || null;
    } catch (error) {
      console.error('[Persistence] Failed to get draft answer:', error);
      return null;
    }
  },

  // Get all drafts for a persona
  async getPersonaDrafts(personaId: string): Promise<{ [questionId: string]: DraftAnswer }> {
    try {
      const allDrafts = await this.getAllDrafts();
      return allDrafts[personaId] || {};
    } catch (error) {
      console.error('[Persistence] Failed to get persona drafts:', error);
      return {};
    }
  },

  // Get all drafts
  async getAllDrafts(): Promise<DraftAnswersMap> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_ANSWERS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('[Persistence] Failed to get all drafts:', error);
      return {};
    }
  },

  // Clear draft for a specific question (after successful server save)
  async clearDraft(personaId: string, questionId: string): Promise<void> {
    try {
      const allDrafts = await this.getAllDrafts();
      if (allDrafts[personaId]) {
        delete allDrafts[personaId][questionId];
        await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts));
      }
    } catch (error) {
      console.error('[Persistence] Failed to clear draft:', error);
    }
  },

  // ==================== DEV TOOLS ====================

  // Reset onboarding for a persona (clear state and drafts)
  async resetOnboarding(personaId: string): Promise<void> {
    try {
      // Clear state
      const allStates = await this.getAllStates();
      delete allStates[personaId];
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(allStates));

      // Clear drafts
      const allDrafts = await this.getAllDrafts();
      delete allDrafts[personaId];
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts));

      console.log('[DevTools] Reset onboarding for persona:', personaId);
    } catch (error) {
      console.error('[DevTools] Failed to reset onboarding:', error);
      throw error;
    }
  },

  // Reset all onboarding data
  async resetAllOnboarding(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.ONBOARDING_STATE, STORAGE_KEYS.DRAFT_ANSWERS]);
      console.log('[DevTools] Reset all onboarding data');
    } catch (error) {
      console.error('[DevTools] Failed to reset all onboarding:', error);
      throw error;
    }
  },

  // Load sample persona data into drafts
  async loadSamplePersona(personaId: string): Promise<void> {
    try {
      const allDrafts = await this.getAllDrafts();
      allDrafts[personaId] = { ...SAMPLE_PERSONA_DATA };
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_ANSWERS, JSON.stringify(allDrafts));

      // Also set progress state
      const allStates = await this.getAllStates();
      allStates[personaId] = {
        personaId,
        personaName: 'Sample Persona',
        currentQuestionIndex: Object.keys(SAMPLE_PERSONA_DATA).length,
        progress: {
          totalQuestions: 10,
          answeredCount: Object.keys(SAMPLE_PERSONA_DATA).length,
          answeredQuestionIds: Object.keys(SAMPLE_PERSONA_DATA),
          percentComplete: (Object.keys(SAMPLE_PERSONA_DATA).length / 10) * 100,
        },
        lastUpdated: new Date().toISOString(),
        isComplete: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(allStates));

      console.log('[DevTools] Loaded sample persona data for:', personaId);
    } catch (error) {
      console.error('[DevTools] Failed to load sample persona:', error);
      throw error;
    }
  },

  // Skip to a specific step
  async skipToStep(personaId: string, personaName: string, stepIndex: number): Promise<void> {
    try {
      const allStates = await this.getAllStates();
      allStates[personaId] = {
        personaId,
        personaName,
        currentQuestionIndex: stepIndex,
        progress: allStates[personaId]?.progress || null,
        lastUpdated: new Date().toISOString(),
        isComplete: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify(allStates));
      console.log('[DevTools] Skipped to step:', stepIndex);
    } catch (error) {
      console.error('[DevTools] Failed to skip to step:', error);
      throw error;
    }
  },

  // Get debug info
  async getDebugInfo(): Promise<{
    states: { [personaId: string]: PersistedOnboardingState };
    drafts: DraftAnswersMap;
    storageKeys: string[];
  }> {
    const states = await this.getAllStates();
    const drafts = await this.getAllDrafts();
    const allKeys = await AsyncStorage.getAllKeys();
    return {
      states,
      drafts,
      storageKeys: allKeys.filter(k => k.startsWith('everspeak')),
    };
  },

  // Export all data (for debugging)
  async exportData(): Promise<string> {
    const debugInfo = await this.getDebugInfo();
    return JSON.stringify(debugInfo, null, 2);
  },
};

// Expose dev tools to global scope in development
if (__DEV__) {
  (global as any).onboardingDevTools = {
    reset: (personaId: string) => onboardingPersistence.resetOnboarding(personaId),
    resetAll: () => onboardingPersistence.resetAllOnboarding(),
    loadSample: (personaId: string) => onboardingPersistence.loadSamplePersona(personaId),
    skipTo: (personaId: string, personaName: string, step: number) =>
      onboardingPersistence.skipToStep(personaId, personaName, step),
    debug: () => onboardingPersistence.getDebugInfo(),
    export: () => onboardingPersistence.exportData(),
  };
  console.log('[DevTools] Onboarding dev tools available on global.onboardingDevTools');
}
