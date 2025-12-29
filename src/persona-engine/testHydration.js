#!/usr/bin/env node
/**
 * Test Utility for Persona Prompt Hydration
 *
 * Usage:
 *   node src/persona-engine/testHydration.js                    # Run with mock data
 *   node src/persona-engine/testHydration.js --persona <id>     # Run with real persona
 *   node src/persona-engine/testHydration.js --sparse           # Test sparse data handling
 *   node src/persona-engine/testHydration.js --empty            # Test empty data handling
 */

import { hydratePersonaPrompt, hydratePersonaPromptSync, validateHydration } from './hydrate.js';
import { getAnswersForPersona } from '../onboarding/utils.js';

// Mock data for testing
const MOCK_ANSWERS_FULL = [
  {
    id: 'test-1',
    personaId: 'test-persona',
    questionId: 'q1',
    textResponse: null,
    voiceTranscript: 'This is my grandmother, Margaret. She raised me after my parents passed when I was seven.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-2',
    personaId: 'test-persona',
    questionId: 'q2',
    textResponse: null,
    voiceTranscript: null,
    selectedOption: 'yourself',
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-3',
    personaId: 'test-persona',
    questionId: 'q3',
    textResponse: null,
    voiceTranscript: 'She was more like a mother to me than anyone else.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-4',
    personaId: 'test-persona',
    questionId: 'q4',
    textResponse: null,
    voiceTranscript: 'Warm, patient, and endlessly kind. She had this quiet strength about her.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-5',
    personaId: 'test-persona',
    questionId: 'q5',
    textResponse: null,
    voiceTranscript: 'When she was gardening or cooking Sunday dinner. She would hum old hymns and everything felt peaceful.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-6',
    personaId: 'test-persona',
    questionId: 'q6',
    textResponse: 'She always tapped her wedding ring on the table when she was thinking.',
    voiceTranscript: null,
    selectedOption: null,
    media: { photos: [{ id: 'photo-1', path: '/uploads/grandma-garden.jpg' }], audio: [], video: [] },
  },
  {
    id: 'test-7',
    personaId: 'test-persona',
    questionId: 'q7',
    textResponse: null,
    voiceTranscript: 'Softly, never rushed. She would look at you like you were the only person in the world.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-8',
    personaId: 'test-persona',
    questionId: 'q8',
    textResponse: null,
    voiceTranscript: 'She would make me tea and just sit with me. She never tried to fix it, just be there.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-9',
    personaId: 'test-persona',
    questionId: 'q9',
    textResponse: null,
    voiceTranscript: 'This too shall pass. And she always said "I love you to the moon and back" before bed.',
    selectedOption: null,
    media: { photos: [], audio: [{ id: 'audio-1', path: '/uploads/grandma-voicemail.m4a' }], video: [] },
  },
  {
    id: 'test-10',
    personaId: 'test-persona',
    questionId: 'q10',
    textResponse: null,
    voiceTranscript: 'Family, faith, and being kind to everyone she met.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-11',
    personaId: 'test-persona',
    questionId: 'q11',
    textResponse: null,
    voiceTranscript: 'She believed that hard times make you stronger, but you don\'t have to go through them alone.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-12',
    personaId: 'test-persona',
    questionId: 'q12',
    textResponse: null,
    voiceTranscript: 'That I am loved, that I am capable, and that she\'s proud of who I\'ve become.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-13',
    personaId: 'test-persona',
    questionId: 'q13',
    textResponse: null,
    voiceTranscript: 'The day she taught me to make her apple pie. We spent all afternoon in the kitchen, and I burned the first batch, but she just laughed and said that\'s how you learn.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-14',
    personaId: 'test-persona',
    questionId: 'q14',
    textResponse: null,
    voiceTranscript: 'Sunday dinners, gardening together, watching old movies on rainy days.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-16',
    personaId: 'test-persona',
    questionId: 'q16',
    textResponse: null,
    voiceTranscript: 'Please don\'t talk about the accident or how she passed. I\'m not ready.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-17',
    personaId: 'test-persona',
    questionId: 'q17',
    textResponse: null,
    voiceTranscript: 'She never complained about pain. If the persona acted like she suffered, that would feel wrong.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-18',
    personaId: 'test-persona',
    questionId: 'q18',
    textResponse: null,
    voiceTranscript: null,
    selectedOption: 'gently_aware',
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-19',
    personaId: 'test-persona',
    questionId: 'q19',
    textResponse: null,
    voiceTranscript: 'Just say something like "I\'m here with you" without making it weird or supernatural.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'test-20',
    personaId: 'test-persona',
    questionId: 'q20',
    textResponse: null,
    voiceTranscript: 'She was my anchor. I hope this helps me feel less alone.',
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
];

// Sparse data for testing graceful degradation
const MOCK_ANSWERS_SPARSE = [
  {
    id: 'sparse-1',
    personaId: 'test-persona',
    questionId: 'q1',
    textResponse: 'My dad, John.',
    voiceTranscript: null,
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
  {
    id: 'sparse-2',
    personaId: 'test-persona',
    questionId: 'q4',
    textResponse: 'Funny and loud.',
    voiceTranscript: null,
    selectedOption: null,
    media: { photos: [], audio: [], video: [] },
  },
];

async function runTest() {
  const args = process.argv.slice(2);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PERSONA PROMPT HYDRATION TEST UTILITY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let answers = MOCK_ANSWERS_FULL;
  let personaName = 'Margaret (Test)';
  let testMode = 'Full Mock Data';

  // Parse arguments
  if (args.includes('--sparse')) {
    answers = MOCK_ANSWERS_SPARSE;
    personaName = 'John (Sparse Test)';
    testMode = 'Sparse Mock Data';
  } else if (args.includes('--empty')) {
    answers = [];
    personaName = 'Empty Test';
    testMode = 'Empty Data';
  } else if (args.includes('--persona')) {
    const personaIdIndex = args.indexOf('--persona') + 1;
    if (personaIdIndex < args.length) {
      const personaId = args[personaIdIndex];
      testMode = `Real Persona: ${personaId}`;
      try {
        answers = await getAnswersForPersona(personaId);
        personaName = `Persona ${personaId}`;
        console.log(`Loaded ${answers.length} answers for persona ${personaId}\n`);
      } catch (err) {
        console.error(`Failed to load answers for persona ${personaId}:`, err.message);
        process.exit(1);
      }
    }
  }

  console.log(`Test Mode: ${testMode}`);
  console.log(`Persona Name: ${personaName}`);
  console.log(`Answer Count: ${answers.length}\n`);

  // Run hydration
  console.log('Running hydration...\n');
  const result = hydratePersonaPromptSync({
    personaName,
    answers,
  });

  // Validate
  const validation = validateHydration(result);

  // Output results
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  HYDRATION METADATA');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Persona Name: ${result.meta.personaName}`);
  console.log(`Total Answers: ${result.meta.totalAnswers}`);
  console.log(`Injected Sections: ${result.meta.injectedSections.join(', ') || '(none)'}`);
  console.log(`Missing Sections: ${result.meta.missingSections.join(', ') || '(none)'}`);
  console.log(`Hydrated At: ${result.meta.hydratedAt}`);

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('  VALIDATION RESULTS');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`Valid: ${validation.isValid ? '✓ Yes' : '✗ No'}`);
  if (validation.warnings.length > 0) {
    console.log('Warnings:');
    for (const warning of validation.warnings) {
      console.log(`  - ${warning}`);
    }
  } else {
    console.log('Warnings: (none)');
  }

  console.log('\n───────────────────────────────────────────────────────────────');
  console.log('  HYDRATED PROMPT');
  console.log('───────────────────────────────────────────────────────────────\n');
  console.log(result.prompt);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  END OF TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Output stats
  console.log(`Prompt length: ${result.prompt.length} characters`);
  console.log(`Approximate tokens: ~${Math.ceil(result.prompt.length / 4)}`);
}

// Run if executed directly
runTest().catch(console.error);
