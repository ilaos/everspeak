import { readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSONAS_FILE = path.join(__dirname, 'personas.json');

const VALID_CATEGORIES = ['humor', 'regrets', 'childhood', 'advice', 'personality', 'misc'];

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
      memories: JSON.parse(JSON.stringify(persona.memories))
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
    updated_at: new Date().toISOString()
  };
}
