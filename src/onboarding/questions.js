// Onboarding Questions - Voice-First Persona Creation
// Enhanced 29-question system with example answers to encourage richer responses

export const ONBOARDING_SECTIONS = [
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'A few things before we begin'
  },
  {
    id: 'relationship_context',
    title: 'Your Relationship',
    description: 'Help us understand who this person was to you'
  },
  {
    id: 'core_personality',
    title: 'Who They Were',
    description: 'The essence of their personality'
  },
  {
    id: 'communication_style',
    title: 'How They Connected',
    description: 'The way they spoke and showed love'
  },
  {
    id: 'values_beliefs',
    title: 'What Mattered',
    description: 'Their values, wisdom, and imperfections'
  },
  {
    id: 'shared_memories',
    title: 'Moments Together',
    description: 'The memories you want to preserve'
  },
  {
    id: 'boundaries_safety',
    title: 'Boundaries',
    description: 'What the persona should avoid'
  },
  {
    id: 'present_awareness',
    title: 'Presence',
    description: 'How the persona understands their situation'
  },
  {
    id: 'final_tuning',
    title: 'Finishing Touches',
    description: 'Anything else we should know'
  }
];

export const ONBOARDING_QUESTIONS = [
  // SECTION 0 - Getting Started (NEW)
  {
    id: 'q1',
    sectionId: 'getting_started',
    questionNumber: 1,
    prompt: 'First, what\'s your name?',
    subtext: 'This helps the persona know who they\'re speaking with.',
    example: null,
    inputType: 'voice_primary',
    fieldId: 'user_name',
    mediaHint: null,
    options: null
  },
  {
    id: 'q2',
    sectionId: 'getting_started',
    questionNumber: 2,
    prompt: 'What was their name?',
    subtext: 'Feel free to include any nicknames or what you called them.',
    example: 'For example: "His name was James, but I always called him Jimmy. Sometimes I\'d call him Pop when I was being silly."',
    inputType: 'voice_primary',
    fieldId: 'loved_one_name',
    mediaHint: null,
    options: null
  },
  {
    id: 'q3',
    sectionId: 'getting_started',
    questionNumber: 3,
    prompt: 'When I talk about them, should I say "he," "she," or "they"?',
    subtext: 'So I can speak about them naturally.',
    example: null,
    inputType: 'select',
    fieldId: 'loved_one_pronouns',
    mediaHint: null,
    options: [
      { value: 'he', label: 'He' },
      { value: 'she', label: 'She' },
      { value: 'they', label: 'They' },
      { value: 'name_only', label: 'Just use their name' }
    ]
  },

  // SECTION 1 - Relationship Context
  {
    id: 'q4',
    sectionId: 'relationship_context',
    questionNumber: 4,
    prompt: 'Who were they to you?',
    subtext: 'Tell me about your relationship with them.',
    example: 'For example: "She was my grandmother, but she practically raised me. She was more like a mother to me than anyone else. We talked every single day until the end."',
    inputType: 'voice_primary',
    fieldId: 'relationship_to_user',
    mediaHint: null,
    options: null
  },
  {
    id: 'q5',
    sectionId: 'relationship_context',
    questionNumber: 5,
    prompt: 'When did they pass?',
    subtext: 'Take your time. This can be as specific or general as you\'d like.',
    example: 'For example: "It was about three months ago, in September" or "It\'s been almost two years now."',
    inputType: 'voice_primary',
    fieldId: 'when_passed',
    mediaHint: null,
    options: null
  },
  {
    id: 'q6',
    sectionId: 'relationship_context',
    questionNumber: 6,
    prompt: 'Would you like to share what happened?',
    subtext: 'Only if you feel comfortable. You can skip this one.',
    example: 'You might say something like: "It was cancer. We had about six months to prepare, which was a blessing in some ways." Or simply: "It was sudden and unexpected."',
    inputType: 'voice_primary',
    fieldId: 'how_passed',
    mediaHint: null,
    options: null,
    optional: true
  },
  {
    id: 'q7',
    sectionId: 'relationship_context',
    questionNumber: 7,
    prompt: 'Who is this persona for?',
    subtext: 'Who will be talking with them?',
    example: null,
    inputType: 'select',
    fieldId: 'persona_for',
    mediaHint: null,
    options: [
      { value: 'yourself', label: 'Myself' },
      { value: 'child', label: 'A child or children' },
      { value: 'partner', label: 'My partner' },
      { value: 'family_member', label: 'Other family members' },
      { value: 'multiple', label: 'Multiple people' }
    ]
  },

  // SECTION 2 - Core Personality
  {
    id: 'q8',
    sectionId: 'core_personality',
    questionNumber: 8,
    prompt: 'How would you describe their personality?',
    subtext: 'What was it like to be around them?',
    example: 'For example: "He was the kind of person who could walk into a room and make everyone feel at ease. He had this quiet confidence, but he never took himself too seriously. He\'d crack jokes at the worst times."',
    inputType: 'voice_primary',
    fieldId: 'personality',
    mediaHint: null,
    options: null
  },
  {
    id: 'q9',
    sectionId: 'core_personality',
    questionNumber: 9,
    prompt: 'What were they like when they were at their best?',
    subtext: 'Think of a time when they were really shining.',
    example: 'For example: "When she was cooking for the whole family on holidays, she was in her element. She\'d be humming, tasting everything, and telling stories while stirring three pots at once."',
    inputType: 'voice_primary',
    fieldId: 'at_their_best',
    mediaHint: null,
    options: null
  },
  {
    id: 'q10',
    sectionId: 'core_personality',
    questionNumber: 10,
    prompt: 'What quirks or habits did people notice about them?',
    subtext: 'Those little things that made them uniquely them.',
    example: 'For example: "He always had to have his coffee in this one specific mug. And he\'d tap his foot when he was thinking. Oh, and he\'d whistle the same tune every morning."',
    inputType: 'voice_primary',
    fieldId: 'quirks_habits',
    mediaHint: 'photos_videos_encouraged',
    options: null
  },
  {
    id: 'q11',
    sectionId: 'core_personality',
    questionNumber: 11,
    prompt: 'What did their laugh sound like?',
    subtext: 'Or what made them really laugh?',
    example: 'For example: "She had this big, loud laugh that she was kind of embarrassed about. When something really got her, she\'d cover her mouth. Dad jokes always got her."',
    inputType: 'voice_primary',
    fieldId: 'their_laugh',
    mediaHint: 'audio_encouraged',
    options: null
  },
  {
    id: 'q12',
    sectionId: 'core_personality',
    questionNumber: 12,
    prompt: 'Were there daily rituals or routines that were important to them?',
    subtext: 'Little things they did every day.',
    example: 'For example: "Every morning without fail, he\'d sit on the porch with his coffee and watch the birds. Sundays were for calling his sister. He never missed that call."',
    inputType: 'voice_primary',
    fieldId: 'daily_rituals',
    mediaHint: null,
    options: null
  },

  // SECTION 3 - Communication Style
  {
    id: 'q13',
    sectionId: 'communication_style',
    questionNumber: 13,
    prompt: 'How did they usually talk to you?',
    subtext: 'What was their tone? Formal, casual, playful?',
    example: 'For example: "She had this gentle way of speaking, even when she was being stern. She\'d always start with \'Now honey...\' when she was about to give advice."',
    inputType: 'voice_primary',
    fieldId: 'how_they_spoke',
    mediaHint: null,
    options: null
  },
  {
    id: 'q14',
    sectionId: 'communication_style',
    questionNumber: 14,
    prompt: 'When you were upset, how did they comfort you?',
    subtext: 'What did they say or do?',
    example: 'For example: "He\'d just sit with me. Wouldn\'t say much at first. Then he\'d put his hand on my shoulder and say something like \'We\'ll figure it out together.\'"',
    inputType: 'voice_primary',
    fieldId: 'how_they_comforted',
    mediaHint: null,
    options: null
  },
  {
    id: 'q15',
    sectionId: 'communication_style',
    questionNumber: 15,
    prompt: 'Were there phrases or sayings they used often?',
    subtext: 'Things you can still hear them saying.',
    example: 'For example: "She always said \'This too shall pass\' and \'Don\'t borrow trouble from tomorrow.\' When I was overthinking she\'d say \'You\'re making mountains out of molehills again.\'"',
    inputType: 'voice_primary',
    fieldId: 'phrases_sayings',
    mediaHint: 'audio_encouraged',
    options: null
  },
  {
    id: 'q16',
    sectionId: 'communication_style',
    questionNumber: 16,
    prompt: 'How did they show love without using words?',
    subtext: 'The little things they did.',
    example: 'For example: "He wasn\'t big on saying \'I love you\' but he\'d always warm up my car in winter. Or he\'d cut articles out of the newspaper he thought I\'d find interesting."',
    inputType: 'voice_primary',
    fieldId: 'showing_love',
    mediaHint: null,
    options: null
  },

  // SECTION 4 - Values & Beliefs
  {
    id: 'q17',
    sectionId: 'values_beliefs',
    questionNumber: 17,
    prompt: 'What mattered most to them in life?',
    subtext: 'What did they really care about?',
    example: 'For example: "Family was everything to her. She\'d drop anything for any of us. She also really valued honesty - she couldn\'t stand when people weren\'t straight with her."',
    inputType: 'voice_primary',
    fieldId: 'what_mattered',
    mediaHint: null,
    options: null
  },
  {
    id: 'q18',
    sectionId: 'values_beliefs',
    questionNumber: 18,
    prompt: 'What did they believe about getting through hard times?',
    subtext: 'Their philosophy on life\'s challenges.',
    example: 'For example: "He believed you just had to keep moving forward. \'One foot in front of the other,\' he\'d say. He didn\'t believe in wallowing - action was his answer to everything."',
    inputType: 'voice_primary',
    fieldId: 'hard_times_belief',
    mediaHint: null,
    options: null
  },
  {
    id: 'q19',
    sectionId: 'values_beliefs',
    questionNumber: 19,
    prompt: 'What would they want the person using this to remember?',
    subtext: 'If they could leave one message.',
    example: 'For example: "She\'d want me to remember that I\'m stronger than I think. And that it\'s okay to ask for help - that was something she learned late in life."',
    inputType: 'voice_primary',
    fieldId: 'want_to_remember',
    mediaHint: null,
    options: null
  },
  {
    id: 'q20',
    sectionId: 'values_beliefs',
    questionNumber: 20,
    prompt: 'What frustrated them, or what were their flaws?',
    subtext: 'Nobody\'s perfect. What made them human?',
    example: 'For example: "He could be stubborn as a mule. Once he made up his mind, that was it. And he was terrible at asking for directions - we got lost constantly."',
    inputType: 'voice_primary',
    fieldId: 'flaws_frustrations',
    mediaHint: null,
    options: null
  },

  // SECTION 5 - Shared Memories
  {
    id: 'q21',
    sectionId: 'shared_memories',
    questionNumber: 21,
    prompt: 'Tell me about a memory that feels especially important.',
    subtext: 'One that you hold close.',
    example: 'For example: "The last time we went fishing together. We didn\'t catch anything but we talked for hours. He told me stories about his dad that I\'d never heard before."',
    inputType: 'voice_primary',
    fieldId: 'important_memory',
    mediaHint: null,
    options: null
  },
  {
    id: 'q22',
    sectionId: 'shared_memories',
    questionNumber: 22,
    prompt: 'What kinds of moments did you share most often?',
    subtext: 'The everyday things.',
    example: 'For example: "Sunday dinners. We\'d all pile into her tiny kitchen. The kids would be running around, she\'d be fussing over the food, and there was always way too much of it."',
    inputType: 'voice_primary',
    fieldId: 'moments_shared',
    mediaHint: null,
    options: null
  },
  {
    id: 'q23',
    sectionId: 'shared_memories',
    questionNumber: 23,
    prompt: 'If they walked into the room right now, what would they do?',
    subtext: 'How would they greet you?',
    example: 'For example: "He\'d probably make some joke about my hair. Then give me a big hug and ask if I\'d eaten today. He always worried I wasn\'t eating enough."',
    inputType: 'voice_primary',
    fieldId: 'if_walked_in',
    mediaHint: null,
    options: null
  },
  {
    id: 'q24',
    sectionId: 'shared_memories',
    questionNumber: 24,
    prompt: 'Are there photos or videos that really capture who they were?',
    subtext: 'You can upload these later if you\'d like.',
    example: 'For example: "There\'s this one video from my wedding where she\'s dancing. That\'s exactly who she was - just pure joy. I watch it all the time."',
    inputType: 'voice_primary',
    fieldId: 'photos_videos',
    mediaHint: 'photos_videos_encouraged',
    options: null
  },

  // SECTION 6 - Boundaries & Safety
  {
    id: 'q25',
    sectionId: 'boundaries_safety',
    questionNumber: 25,
    prompt: 'Are there things this persona should avoid talking about?',
    subtext: 'Topics that would be too painful or sensitive.',
    example: 'For example: "I don\'t want to discuss the last few weeks when she was in the hospital. And please don\'t bring up the family disagreements about the will."',
    inputType: 'voice_primary',
    fieldId: 'topics_avoid',
    mediaHint: null,
    options: null
  },
  {
    id: 'q26',
    sectionId: 'boundaries_safety',
    questionNumber: 26,
    prompt: 'Is there anything that would feel wrong or inaccurate if the persona said it?',
    subtext: 'Things that just wouldn\'t be them.',
    example: 'For example: "She would never curse - that just wasn\'t her. And she\'d never push religion on anyone even though she was spiritual herself."',
    inputType: 'voice_primary',
    fieldId: 'would_feel_wrong',
    mediaHint: null,
    options: null
  },

  // SECTION 7 - Present-Day Awareness
  {
    id: 'q27',
    sectionId: 'present_awareness',
    questionNumber: 27,
    prompt: 'How aware should this persona be about their passing?',
    subtext: 'This affects how they\'ll speak about being here.',
    example: null,
    inputType: 'select',
    fieldId: 'awareness_level',
    mediaHint: null,
    options: [
      { value: 'fully_aware', label: 'Fully aware - can acknowledge it gently' },
      { value: 'gently_aware', label: 'Gently aware - uses indirect language' },
      { value: 'not_explicit', label: 'Not explicitly aware - speaks as if present' },
      { value: 'conversation_guided', label: 'Let the conversation guide it' }
    ]
  },
  {
    id: 'q28',
    sectionId: 'present_awareness',
    questionNumber: 28,
    prompt: 'How should they talk about being here now?',
    subtext: 'What would feel natural to you?',
    example: 'For example: "I think she\'d say something like \'I\'m always with you, even when you can\'t see me.\' She believed in that kind of thing."',
    inputType: 'voice_primary',
    fieldId: 'talk_about_presence',
    mediaHint: null,
    options: null
  },

  // SECTION 8 - Final Tuning
  {
    id: 'q29',
    sectionId: 'final_tuning',
    questionNumber: 29,
    prompt: 'Is there anything else you want this persona to understand?',
    subtext: 'About them, about you, about your relationship.',
    example: 'For example: "I want them to know that I\'m trying my best, even when it doesn\'t feel like enough. And that I think about them every single day."',
    inputType: 'voice_primary',
    fieldId: 'anything_else',
    mediaHint: null,
    options: null
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

// Get progress percentage
export function getProgressPercentage(currentQuestion) {
  return Math.round((currentQuestion / ONBOARDING_QUESTIONS.length) * 100);
}

// Get section progress info
export function getSectionProgress(currentQuestion) {
  const currentQ = ONBOARDING_QUESTIONS[currentQuestion - 1];
  if (!currentQ) return null;

  const section = getSectionById(currentQ.sectionId);
  const sectionQuestions = getQuestionsBySection(currentQ.sectionId);
  const questionIndexInSection = sectionQuestions.findIndex(q => q.id === currentQ.id) + 1;

  return {
    sectionTitle: section?.title || '',
    sectionDescription: section?.description || '',
    questionInSection: questionIndexInSection,
    totalInSection: sectionQuestions.length
  };
}
