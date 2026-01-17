// Persona Prompt Hydration Logic
// Assembles a complete system prompt by injecting onboarding answers into the base template.
// Does NOT rewrite, paraphrase, or modify the base rules.

import {
  BASE_PERSONA_PROMPT,
  SECTION_MARKERS,
  QUESTION_TO_SECTION_MAP,
  QUESTION_LABELS,
  AWARENESS_LEVELS,
} from './basePrompt.js';
import { getAnswersForPersona } from '../onboarding/utils.js';
import { ONBOARDING_QUESTIONS } from '../onboarding/questions.js';

/**
 * Hydrates the base persona prompt with onboarding answers.
 *
 * @param {Object} options
 * @param {string} options.personaId - The persona ID to hydrate for
 * @param {string} [options.personaName] - Optional persona name for context
 * @param {Array} [options.answers] - Pre-loaded answers (if not provided, will load from storage)
 * @returns {Promise<{prompt: string, meta: Object}>} Hydrated prompt and metadata
 */
export async function hydratePersonaPrompt({ personaId, personaName, answers }) {
  // Load answers if not provided
  const onboardingAnswers = answers || await getAnswersForPersona(personaId);

  // Organize answers by section
  const sectionData = organizeBySections(onboardingAnswers);

  // Build the hydrated prompt
  let hydratedPrompt = BASE_PERSONA_PROMPT;

  // Track what was injected for metadata
  const injectedSections = [];
  const missingSections = [];

  // Process each section marker
  for (const [sectionKey, marker] of Object.entries(SECTION_MARKERS)) {
    const sectionContent = formatSectionContent(sectionKey, sectionData[sectionKey] || []);

    if (sectionContent) {
      hydratedPrompt = hydratedPrompt.replace(marker, sectionContent + '\n');
      injectedSections.push(sectionKey);
    } else {
      // Remove the marker entirely if no content
      hydratedPrompt = hydratedPrompt.replace(marker + '\n', '');
      hydratedPrompt = hydratedPrompt.replace(marker, '');
      missingSections.push(sectionKey);
    }
  }

  // Add persona name context at the top if provided
  if (personaName) {
    const nameContext = `[PERSONA IDENTITY: ${personaName}]\n\n`;
    hydratedPrompt = nameContext + hydratedPrompt;
  }

  return {
    prompt: hydratedPrompt,
    meta: {
      personaId,
      personaName: personaName || null,
      injectedSections,
      missingSections,
      totalAnswers: onboardingAnswers.length,
      hydratedAt: new Date().toISOString(),
    },
  };
}

/**
 * Organizes raw onboarding answers by their corresponding section.
 *
 * @param {Array} answers - Array of onboarding answer objects
 * @returns {Object} Answers grouped by section key
 */
function organizeBySections(answers) {
  const sections = {
    RELATIONSHIP_CONTEXT: [],
    CORE_PERSONALITY: [],
    COMMUNICATION_STYLE: [],
    VALUES_BELIEFS: [],
    SHARED_MEMORIES: [],
    BOUNDARIES_SAFETY: [],
    PRESENT_AWARENESS: [],
    FINAL_TUNING: [],
  };

  for (const answer of answers) {
    const sectionKey = QUESTION_TO_SECTION_MAP[answer.questionId];
    if (sectionKey && sections[sectionKey]) {
      sections[sectionKey].push(answer);
    }
  }

  return sections;
}

/**
 * Formats the content for a specific section based on its answers.
 * Returns empty string if no meaningful content exists.
 *
 * @param {string} sectionKey - The section identifier
 * @param {Array} answers - Answers for this section
 * @returns {string} Formatted section content or empty string
 */
function formatSectionContent(sectionKey, answers) {
  // Filter to only answers with actual content
  const meaningfulAnswers = answers.filter(hasContent);

  if (meaningfulAnswers.length === 0) {
    return '';
  }

  const lines = ['[CREATOR-PROVIDED CONTEXT]'];

  for (const answer of meaningfulAnswers) {
    const label = QUESTION_LABELS[answer.questionId];
    const content = extractAnswerContent(answer);

    if (content) {
      lines.push(`- ${label}: ${content}`);
    }
  }

  // Add special formatting for certain sections
  if (sectionKey === 'PRESENT_AWARENESS') {
    // q27 is the awareness level question in the enhanced 29-question system
    const awarenessAnswer = meaningfulAnswers.find(a => a.questionId === 'q27');
    if (awarenessAnswer?.selectedOption) {
      const awarenessDescription = AWARENESS_LEVELS[awarenessAnswer.selectedOption];
      if (awarenessDescription) {
        lines.push(`\n[AWARENESS MODE: ${awarenessDescription}]`);
      }
    }
  }

  if (sectionKey === 'BOUNDARIES_SAFETY') {
    // Emphasize that these are hard boundaries
    lines.push('\n[These boundaries are ABSOLUTE and override all other behavior]');
  }

  lines.push('[END CREATOR-PROVIDED CONTEXT]\n');

  return lines.join('\n');
}

/**
 * Checks if an answer has any meaningful content.
 *
 * @param {Object} answer - An onboarding answer
 * @returns {boolean} True if the answer has content
 */
function hasContent(answer) {
  return !!(
    answer.textResponse?.trim() ||
    answer.voiceTranscript?.trim() ||
    answer.selectedOption ||
    (answer.media?.photos?.length > 0) ||
    (answer.media?.audio?.length > 0) ||
    (answer.media?.video?.length > 0)
  );
}

/**
 * Extracts the displayable content from an answer.
 * Prefers voice transcript over text, combines if both exist.
 *
 * @param {Object} answer - An onboarding answer
 * @returns {string} The extracted content
 */
function extractAnswerContent(answer) {
  const parts = [];

  // Voice transcript takes priority (it's the primary input)
  if (answer.voiceTranscript?.trim()) {
    parts.push(`"${answer.voiceTranscript.trim()}"`);
  } else if (answer.textResponse?.trim()) {
    parts.push(`"${answer.textResponse.trim()}"`);
  }

  // Handle selected options (for select-type questions)
  if (answer.selectedOption) {
    // Get the human-readable label for the option
    const question = ONBOARDING_QUESTIONS.find(q => q.id === answer.questionId);
    if (question?.options) {
      const option = question.options.find(o => o.value === answer.selectedOption);
      if (option) {
        parts.push(option.label);
      } else {
        parts.push(answer.selectedOption);
      }
    } else {
      parts.push(answer.selectedOption);
    }
  }

  // Note if media is attached (content is stored separately)
  const mediaCount = (answer.media?.photos?.length || 0) +
                     (answer.media?.audio?.length || 0) +
                     (answer.media?.video?.length || 0);
  if (mediaCount > 0) {
    parts.push(`[${mediaCount} media file(s) attached]`);
  }

  return parts.join(' ');
}

/**
 * Synchronous version that takes pre-loaded answers.
 * Useful for testing and when answers are already available.
 *
 * @param {Object} options
 * @param {string} [options.personaName] - Optional persona name
 * @param {Array} options.answers - Pre-loaded answers array
 * @returns {{prompt: string, meta: Object}} Hydrated prompt and metadata
 */
export function hydratePersonaPromptSync({ personaName, answers }) {
  const onboardingAnswers = answers || [];

  // Organize answers by section
  const sectionData = organizeBySections(onboardingAnswers);

  // Build the hydrated prompt
  let hydratedPrompt = BASE_PERSONA_PROMPT;

  // Track what was injected for metadata
  const injectedSections = [];
  const missingSections = [];

  // Process each section marker
  for (const [sectionKey, marker] of Object.entries(SECTION_MARKERS)) {
    const sectionContent = formatSectionContent(sectionKey, sectionData[sectionKey] || []);

    if (sectionContent) {
      hydratedPrompt = hydratedPrompt.replace(marker, sectionContent + '\n');
      injectedSections.push(sectionKey);
    } else {
      // Remove the marker entirely if no content
      hydratedPrompt = hydratedPrompt.replace(marker + '\n', '');
      hydratedPrompt = hydratedPrompt.replace(marker, '');
      missingSections.push(sectionKey);
    }
  }

  // Add persona name context at the top if provided
  if (personaName) {
    const nameContext = `[PERSONA IDENTITY: ${personaName}]\n\n`;
    hydratedPrompt = nameContext + hydratedPrompt;
  }

  return {
    prompt: hydratedPrompt,
    meta: {
      personaName: personaName || null,
      injectedSections,
      missingSections,
      totalAnswers: onboardingAnswers.length,
      hydratedAt: new Date().toISOString(),
    },
  };
}

/**
 * Validates that a hydrated prompt has critical sections populated.
 * Returns warnings for missing important data.
 *
 * @param {{prompt: string, meta: Object}} hydrationResult
 * @returns {{isValid: boolean, warnings: string[]}}
 */
export function validateHydration(hydrationResult) {
  const warnings = [];
  const { missingSections, totalAnswers } = hydrationResult.meta;

  // Critical sections that significantly impact persona behavior
  const criticalSections = ['BOUNDARIES_SAFETY', 'PRESENT_AWARENESS'];
  const importantSections = ['RELATIONSHIP_CONTEXT', 'CORE_PERSONALITY', 'COMMUNICATION_STYLE'];

  for (const section of criticalSections) {
    if (missingSections.includes(section)) {
      warnings.push(`CRITICAL: ${section} has no creator-provided context. Default safety rules will apply.`);
    }
  }

  for (const section of importantSections) {
    if (missingSections.includes(section)) {
      warnings.push(`IMPORTANT: ${section} has no creator-provided context. Persona may feel generic.`);
    }
  }

  if (totalAnswers === 0) {
    warnings.push('No onboarding answers provided. Persona will use all default behaviors.');
  } else if (totalAnswers < 5) {
    warnings.push(`Only ${totalAnswers} answers provided. Consider completing more onboarding questions for a richer persona.`);
  }

  return {
    isValid: warnings.filter(w => w.startsWith('CRITICAL')).length === 0,
    warnings,
  };
}
