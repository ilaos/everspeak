import { readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSONAS_FILE = path.join(__dirname, 'personas.json');

const VALID_CATEGORIES = ['humor', 'regrets', 'childhood', 'advice', 'personality', 'misc'];
const VALID_TONE_MODES = ['auto', 'comforting', 'honest', 'playful', 'balanced'];

export async function loadPersonas() {
  try {
    const data = await readFile(PERSONAS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { personas: [] };
    }
    throw error;
  }
}

export async function savePersonas(data) {
  await writeFile(PERSONAS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function generateUUID() {
  return randomUUID();
}

export function isValidCategory(category) {
  return VALID_CATEGORIES.includes(category);
}

export function isValidWeight(weight) {
  const num = parseFloat(weight);
  return !isNaN(num) && num >= 0.1 && num <= 5.0;
}

export function findPersonaById(personas, id) {
  return personas.find(p => p.id === id);
}

export function findMemoryById(persona, memoryId) {
  return persona.memories.find(m => m.id === memoryId);
}

export function createPersona(name, relationship, description) {
  return {
    id: generateUUID(),
    name,
    relationship,
    description,
    memories: [],
    settings: getDefaultSettings(),
    snapshots: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function createMemory(category, text, weight = 1.0) {
  return {
    id: generateUUID(),
    category,
    text,
    weight: parseFloat(weight)
  };
}

export function updatePersona(persona, updates) {
  return {
    ...persona,
    ...updates,
    id: persona.id,
    memories: persona.memories,
    snapshots: persona.snapshots,
    created_at: persona.created_at,
    updated_at: new Date().toISOString()
  };
}

export function createSnapshot(persona, name) {
  const snapshotName = name && name.trim() 
    ? name.trim() 
    : `Snapshot - ${new Date().toISOString()}`;
  
  return {
    id: generateUUID(),
    name: snapshotName,
    created_at: new Date().toISOString(),
    persona_state: {
      name: persona.name,
      relationship: persona.relationship,
      description: persona.description,
      memories: JSON.parse(JSON.stringify(persona.memories)),
      settings: persona.settings 
        ? JSON.parse(JSON.stringify(persona.settings))
        : getDefaultSettings()
    }
  };
}

export function findSnapshotById(persona, snapshotId) {
  if (!persona.snapshots) {
    return null;
  }
  return persona.snapshots.find(s => s.id === snapshotId);
}

export function restoreFromSnapshot(persona, snapshot) {
  return {
    ...persona,
    name: snapshot.persona_state.name,
    relationship: snapshot.persona_state.relationship,
    description: snapshot.persona_state.description,
    memories: JSON.parse(JSON.stringify(snapshot.persona_state.memories)),
    settings: snapshot.persona_state.settings 
      ? JSON.parse(JSON.stringify(snapshot.persona_state.settings))
      : getDefaultSettings(),
    updated_at: new Date().toISOString()
  };
}

export function getDefaultSettings() {
  return {
    default_tone_mode: 'auto',
    humor_level: 3,
    honesty_level: 3,
    sentimentality_level: 3,
    energy_level: 3,
    advice_level: 2,
    boundaries: {
      avoid_regret_spirals: true,
      no_paranormal_language: true,
      soften_sensitive_topics: true,
      prefer_reassurance: true
    }
  };
}

export function validateSettings(settings) {
  const errors = [];
  
  // Validate tone mode
  if (settings.default_tone_mode !== undefined) {
    if (typeof settings.default_tone_mode !== 'string' || !VALID_TONE_MODES.includes(settings.default_tone_mode)) {
      errors.push(`default_tone_mode must be one of: ${VALID_TONE_MODES.join(', ')}`);
    }
  }
  
  // Validate level fields (0-5)
  const levelFields = ['humor_level', 'honesty_level', 'sentimentality_level', 'energy_level', 'advice_level'];
  for (const field of levelFields) {
    if (settings[field] !== undefined) {
      const value = Number(settings[field]);
      if (isNaN(value) || value < 0 || value > 5) {
        errors.push(`${field} must be a number between 0 and 5`);
      }
    }
  }
  
  // Validate boundaries
  if (settings.boundaries !== undefined) {
    if (typeof settings.boundaries !== 'object' || settings.boundaries === null) {
      errors.push('boundaries must be an object');
    } else {
      const boundaryFields = ['avoid_regret_spirals', 'no_paranormal_language', 'soften_sensitive_topics', 'prefer_reassurance'];
      for (const field of boundaryFields) {
        if (settings.boundaries[field] !== undefined && typeof settings.boundaries[field] !== 'boolean') {
          errors.push(`boundaries.${field} must be a boolean`);
        }
      }
    }
  }
  
  return errors;
}
