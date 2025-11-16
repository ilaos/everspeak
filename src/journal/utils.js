import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOURNAL_FILE = path.join(__dirname, 'journal.json');

export async function loadJournal() {
  try {
    const data = await readFile(JOURNAL_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error loading journal:', error);
    return [];
  }
}

export async function saveJournal(journal) {
  try {
    await writeFile(JOURNAL_FILE, JSON.stringify(journal, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving journal:', error);
    return false;
  }
}

export function generateUUID() {
  return randomUUID();
}

export function validateJournalEntry(entry, isUpdate = false) {
  const errors = [];

  if (!isUpdate || entry.text !== undefined) {
    if (!entry.text || typeof entry.text !== 'string' || entry.text.trim() === '') {
      errors.push('Text is required and must be a non-empty string');
    }
  }

  if (entry.persona_id !== undefined && entry.persona_id !== null) {
    if (typeof entry.persona_id !== 'string' || entry.persona_id.trim() === '') {
      errors.push('Persona ID must be a valid string or null');
    }
  }

  if (entry.mood !== undefined && entry.mood !== null) {
    if (typeof entry.mood !== 'string') {
      errors.push('Mood must be a string or null');
    } else if (entry.mood.trim() === '') {
      errors.push('Mood cannot be an empty string');
    }
  }

  if (entry.tags !== undefined && entry.tags !== null) {
    if (!Array.isArray(entry.tags)) {
      errors.push('Tags must be an array or null');
    } else if (!entry.tags.every(tag => typeof tag === 'string' && tag.trim() !== '')) {
      errors.push('All tags must be non-empty strings');
    }
  }

  return errors;
}

export function sanitizeJournalEntry(entry) {
  const sanitized = { ...entry };
  
  // Strip empty mood
  if (sanitized.mood !== undefined && sanitized.mood !== null) {
    sanitized.mood = sanitized.mood.trim() || null;
  }
  
  // Strip empty tags and filter out empty strings
  if (sanitized.tags !== undefined && sanitized.tags !== null) {
    if (Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      if (sanitized.tags.length === 0) {
        sanitized.tags = null;
      }
    } else {
      sanitized.tags = null;
    }
  }
  
  // Strip empty persona_id
  if (sanitized.persona_id !== undefined && sanitized.persona_id !== null) {
    sanitized.persona_id = sanitized.persona_id.trim() || null;
  }
  
  return sanitized;
}

export async function getAllEntries() {
  const journal = await loadJournal();
  return journal.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getEntryById(id) {
  const journal = await loadJournal();
  return journal.find(entry => entry.id === id);
}

export async function createEntry(entryData) {
  const journal = await loadJournal();
  const now = new Date().toISOString();
  
  // Sanitize input
  const sanitized = sanitizeJournalEntry(entryData);
  
  const newEntry = {
    id: generateUUID(),
    created_at: now,
    updated_at: now,
    text: sanitized.text.trim(),
    persona_id: sanitized.persona_id,
    mood: sanitized.mood,
    tags: sanitized.tags,
    ai_reflection: sanitized.ai_reflection || null
  };

  journal.push(newEntry);
  await saveJournal(journal);
  return newEntry;
}

export async function updateEntry(id, updates) {
  const journal = await loadJournal();
  const index = journal.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    return null;
  }

  // Sanitize updates
  const sanitized = sanitizeJournalEntry(updates);

  const updatedEntry = {
    ...journal[index],
    ...sanitized,
    id: journal[index].id,
    created_at: journal[index].created_at,
    updated_at: new Date().toISOString()
  };

  if (sanitized.text !== undefined) {
    updatedEntry.text = sanitized.text.trim();
  }

  journal[index] = updatedEntry;
  await saveJournal(journal);
  return updatedEntry;
}

export async function deleteEntry(id) {
  const journal = await loadJournal();
  const index = journal.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    return false;
  }

  journal.splice(index, 1);
  await saveJournal(journal);
  return true;
}
