import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JOURNAL_FILE = path.join(__dirname, 'journal.json');

export function loadJournal() {
  try {
    const data = fs.readFileSync(JOURNAL_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading journal:', error);
    return [];
  }
}

export function saveJournal(journal) {
  try {
    fs.writeFileSync(JOURNAL_FILE, JSON.stringify(journal, null, 2));
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
    }
  }

  if (entry.tags !== undefined && entry.tags !== null) {
    if (!Array.isArray(entry.tags)) {
      errors.push('Tags must be an array or null');
    } else if (!entry.tags.every(tag => typeof tag === 'string')) {
      errors.push('All tags must be strings');
    }
  }

  return errors;
}

export function getAllEntries() {
  const journal = loadJournal();
  return journal.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getEntryById(id) {
  const journal = loadJournal();
  return journal.find(entry => entry.id === id);
}

export function createEntry(entryData) {
  const journal = loadJournal();
  const now = new Date().toISOString();
  
  const newEntry = {
    id: generateUUID(),
    created_at: now,
    updated_at: now,
    text: entryData.text.trim(),
    persona_id: entryData.persona_id || null,
    mood: entryData.mood || null,
    tags: entryData.tags || null,
    ai_reflection: entryData.ai_reflection || null
  };

  journal.push(newEntry);
  saveJournal(journal);
  return newEntry;
}

export function updateEntry(id, updates) {
  const journal = loadJournal();
  const index = journal.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    return null;
  }

  const updatedEntry = {
    ...journal[index],
    ...updates,
    id: journal[index].id,
    created_at: journal[index].created_at,
    updated_at: new Date().toISOString()
  };

  if (updates.text !== undefined) {
    updatedEntry.text = updates.text.trim();
  }

  journal[index] = updatedEntry;
  saveJournal(journal);
  return updatedEntry;
}

export function deleteEntry(id) {
  const journal = loadJournal();
  const index = journal.findIndex(entry => entry.id === id);
  
  if (index === -1) {
    return false;
  }

  journal.splice(index, 1);
  saveJournal(journal);
  return true;
}
