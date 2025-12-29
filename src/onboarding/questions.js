// Onboarding Questions - Voice-First Persona Creation
// 21 questions across 8 sections

export const ONBOARDING_SECTIONS = [
  {
    id: 'relationship_context',
    title: 'Relationship Context',
    description: 'Help us understand who this persona represents'
  },
  {
    id: 'core_personality',
    title: 'Core Personality',
    description: 'What made them who they were'
  },
  {
    id: 'communication_style',
    title: 'Communication Style',
    description: 'How they spoke and connected'
  },
  {
    id: 'values_beliefs',
    title: 'Values & Beliefs',
    description: 'What mattered most to them'
  },
  {
    id: 'shared_memories',
    title: 'Shared Memories',
    description: 'Moments you want to preserve'
  },
  {
    id: 'boundaries_safety',
    title: 'Boundaries & Safety',
    description: 'What the persona should avoid'
  },
  {
    id: 'present_awareness',
    title: 'Present-Day Awareness',
    description: 'How the persona understands their situation'
  },
  {
    id: 'final_tuning',
    title: 'Final Tuning',
    description: 'Anything else we should know'
  }
];

export const ONBOARDING_QUESTIONS = [
  // SECTION 1 - Relationship Context
  {
    id: 'q1',
    sectionId: 'relationship_context',
    questionNumber: 1,
    prompt: 'Who are you creating this persona for, and who were they to you?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q2',
    sectionId: 'relationship_context',
    questionNumber: 2,
    prompt: 'Who is this persona meant to be for?',
    inputType: 'select',
    mediaHint: null,
    options: [
      { value: 'yourself', label: 'Yourself' },
      { value: 'child', label: 'A child' },
      { value: 'partner', label: 'Partner' },
      { value: 'family_member', label: 'Family member' },
      { value: 'multiple', label: 'Multiple people' }
    ]
  },
  {
    id: 'q3',
    sectionId: 'relationship_context',
    questionNumber: 3,
    prompt: 'How would you describe your relationship with them in one sentence?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },

  // SECTION 2 - Core Personality
  {
    id: 'q4',
    sectionId: 'core_personality',
    questionNumber: 4,
    prompt: 'How would you describe their personality?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q5',
    sectionId: 'core_personality',
    questionNumber: 5,
    prompt: 'What were they like when they were at their best?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q6',
    sectionId: 'core_personality',
    questionNumber: 6,
    prompt: 'What little quirks, habits, or traits do people remember about them?',
    inputType: 'voice_primary',
    mediaHint: 'photos_videos_encouraged',
    options: null
  },

  // SECTION 3 - Communication Style
  {
    id: 'q7',
    sectionId: 'communication_style',
    questionNumber: 7,
    prompt: 'How did they usually speak to you?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q8',
    sectionId: 'communication_style',
    questionNumber: 8,
    prompt: 'When you were upset, how did they comfort you?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q9',
    sectionId: 'communication_style',
    questionNumber: 9,
    prompt: 'Were there phrases, sayings, or expressions they used often?',
    inputType: 'voice_primary',
    mediaHint: 'audio_encouraged',
    options: null
  },

  // SECTION 4 - Values & Beliefs
  {
    id: 'q10',
    sectionId: 'values_beliefs',
    questionNumber: 10,
    prompt: 'What mattered most to them in life?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q11',
    sectionId: 'values_beliefs',
    questionNumber: 11,
    prompt: 'What did they believe about getting through hard times?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q12',
    sectionId: 'values_beliefs',
    questionNumber: 12,
    prompt: 'What would they want the person using this persona to remember?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },

  // SECTION 5 - Shared Memories
  {
    id: 'q13',
    sectionId: 'shared_memories',
    questionNumber: 13,
    prompt: 'Tell me about a memory that feels especially important.',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q14',
    sectionId: 'shared_memories',
    questionNumber: 14,
    prompt: 'What kinds of moments did you share most often?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q15',
    sectionId: 'shared_memories',
    questionNumber: 15,
    prompt: 'Are there photos or videos that capture who they really were?',
    inputType: 'voice_primary',
    mediaHint: 'photos_videos_encouraged',
    options: null
  },

  // SECTION 6 - Boundaries & Safety
  {
    id: 'q16',
    sectionId: 'boundaries_safety',
    questionNumber: 16,
    prompt: 'Are there things this persona should avoid talking about?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q17',
    sectionId: 'boundaries_safety',
    questionNumber: 17,
    prompt: 'Is there anything that would feel inaccurate or upsetting if said?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },

  // SECTION 7 - Present-Day Awareness
  {
    id: 'q18',
    sectionId: 'present_awareness',
    questionNumber: 18,
    prompt: 'How aware should this persona be about their passing?',
    inputType: 'select',
    mediaHint: null,
    options: [
      { value: 'fully_aware', label: 'Fully aware' },
      { value: 'gently_aware', label: 'Gently aware' },
      { value: 'not_explicit', label: 'Not explicitly aware' },
      { value: 'conversation_guided', label: 'Let conversation guide it' }
    ]
  },
  {
    id: 'q19',
    sectionId: 'present_awareness',
    questionNumber: 19,
    prompt: 'How should they talk about being here now?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },

  // SECTION 8 - Final Tuning
  {
    id: 'q20',
    sectionId: 'final_tuning',
    questionNumber: 20,
    prompt: 'Is there anything else you want this persona to understand about themselves or about you?',
    inputType: 'voice_primary',
    mediaHint: null,
    options: null
  },
  {
    id: 'q21',
    sectionId: 'final_tuning',
    questionNumber: 21,
    prompt: 'Would you like to review or add to this later?',
    inputType: 'select',
    mediaHint: null,
    options: [
      { value: 'yes_later', label: 'Yes, I\'d like to add more later' },
      { value: 'complete_for_now', label: 'This feels complete for now' }
    ]
  }
];

// Helper to get questions by section
export function getQuestionsBySection(sectionId) {
  return ONBOARDING_QUESTIONS.filter(q => q.sectionId === sectionId);
}

// Helper to get a single question
export function getQuestionById(questionId) {
  return ONBOARDING_QUESTIONS.find(q => q.id === questionId);
}

// Get section by ID
export function getSectionById(sectionId) {
  return ONBOARDING_SECTIONS.find(s => s.id === sectionId);
}

// Get total question count
export function getTotalQuestionCount() {
  return ONBOARDING_QUESTIONS.length;
}
