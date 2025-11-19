// TypeScript types for Everspeak API

export interface Persona {
  id: string;
  name: string;
  relationship?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  memories?: Memory[];
  settings?: PersonaSettings;
}

export interface Memory {
  id: string;
  persona_id: string;
  category: MemoryCategory;
  text: string;
  weight: number; // 0.1 - 5.0
  created_at: string;
  updated_at: string;
}

export type MemoryCategory =
  | 'humor'
  | 'regrets'
  | 'childhood'
  | 'advice'
  | 'personality'
  | 'misc';

export interface PersonaSettings {
  default_tone_mode: ToneMode;
  humor_level: number; // 0-5
  honesty_level: number; // 0-5
  sentimentality_level: number; // 0-5
  energy_level: number; // 0-5
  advice_level: number; // 0-5
  boundaries: {
    avoid_regret_spirals: boolean;
    no_paranormal_language: boolean;
    soften_sensitive_topics: boolean;
    prefer_reassurance: boolean;
  };
}

export type ToneMode = 'auto' | 'playful' | 'honest' | 'comforting' | 'balanced';

export interface JournalEntry {
  id: string;
  persona_id?: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  ai_reflection?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  persona_id?: string;
}

export interface MessageRequest {
  user_message: string;
  persona_id?: string;
  emotional_state?: string;
  tone_mode?: ToneMode;
  memory_bank?: string;
}

export interface MessageResponse {
  success: boolean;
  data: {
    reply: string;
    meta: {
      persona_id?: string;
      persona_name?: string;
      emotional_state?: string;
      tone_mode?: string;
      memories_used?: string;
    };
  };
  message: string;
}

export interface Snapshot {
  id: string;
  persona_id: string;
  name: string;
  memories: Memory[];
  settings: PersonaSettings;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface WizardData {
  personality_traits: string;
  sense_of_humor: string;
  favorite_memories: string;
  memorable_conversations: string;
  tone_preferences: {
    humor_level: number;
    honesty_level: number;
    sentimentality_level: number;
    energy_level: number;
    advice_level: number;
  };
}

export interface BoosterRecommendations {
  missing_categories: MemoryCategory[];
  new_memories: Array<{
    category: MemoryCategory;
    text: string;
    weight: number;
  }>;
  tone_suggestions: {
    humor_level?: number;
    honesty_level?: number;
    sentimentality_level?: number;
    energy_level?: number;
    advice_level?: number;
  };
  boundary_flags: string[];
}
