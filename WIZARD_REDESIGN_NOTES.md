# Wizard Redesign - Session Notes

**Date:** 2025-11-19
**Status:** Planning Phase - Ready to Design 15-19 Question Flow

---

## Current Situation

### The Problem
The current 9-step wizard is technically functional but has two critical issues:

1. **Feels mechanical and cold** - Like a survey, not a therapeutic conversation
2. **Produces flat first conversations** - AI sounds generic, not authentically like the deceased person

### What We Tried
User shared a detailed document (`attached_assets/Pasted-You-are-working-on-the-EverSpeak-project...`) proposing:
- Keep same 9 questions/backend structure
- Transform tone to feel like "warm grief counselor"
- Add micro-acknowledgments between steps
- Update all copy to be therapeutic vs clinical

### The Critical Realization
**This approach solves problem #1 but NOT problem #2.**

The 9 current questions are heavily grief-focused:
- When did they pass?
- Circumstances of death?
- Things left unsaid?
- One memory
- Their humor (vague)

**Missing personality data:**
- Specific phrases they used
- Topics they'd ask about
- How they actually talked
- Multiple detailed stories
- Their opinions/worldview
- Communication patterns

**Result:** First conversation will feel like "a grief counselor roleplaying as the person" - therapeutic but not authentic.

---

## The Decision

User rejected "ship it as-is" approach (Option A).

**User's choice:** "Go all in on 15-19 questions and find ways to make it less stressful"

This means:
- More questions, but better questions
- Focus on personality/authenticity, not just grief context
- Make the experience feel warm/supportive despite length
- Design questions that extract actionable AI conversation data

---

## Current 9 Questions (Exact Copy)

**Step 2: User's Name**
- "What's your first name?"

**Step 3: Their Name**
- "Would you mind sharing their first name with me?"

**Step 4: Relationship**
- "Could you tell me about your relationship with [their name]?"

**Step 5: Date of Passing**
- "When did [their name] pass away?"

**Step 6: Circumstances (Optional)**
- "If you feel comfortable sharing, how did [their name] pass?"
- Skip option available

**Step 7: Relationship Dynamics**
- "May I ask you, what was the nature of your relationship with [their name] like in the time leading up to [their] passing?"

**Step 8: Humor**
- "One of the things that makes a person unique is their sense of humor. Would you be willing to share what [theirs] was like?"

**Step 9: Share a Memory**
- "If you feel comfortable, would you share a memory of [their name] that feels particularly significant to you?"

**Step 10: Things Left Unsaid**
- "As you hold [their name] in your thoughts, do any feelings surface about things left unsaid?"

---

## Next Steps - What to Build

### Goal
Design a 15-19 question wizard that:

1. **Maintains therapeutic warmth** (from the document approach)
2. **Collects rich personality data** (for authentic conversations)
3. **Doesn't feel overwhelming** despite length
4. **Keeps backend contract intact** (or minimal changes)

### Questions to Answer in Next Session

1. **Which questions to keep from current 9?**
   - Some grief context IS valuable
   - Not everything needs to change

2. **What new personality questions to add?**
   - Specific phrases/sayings
   - Topics they'd naturally ask about
   - Multiple story prompts (not just one memory)
   - Communication style examples
   - Current life context (what would they want to know?)

3. **How to reduce stress of longer wizard?**
   - Better pacing (breathing exercises between clusters?)
   - Progress indicators that feel encouraging
   - Optional vs required questions
   - Save/resume functionality (already exists)
   - Break into thematic sections with transitions

4. **Question order/flow?**
   - Start light → go deeper?
   - Mix personality + grief questions?
   - Strategic placement of optional/skippable ones?

### Two Critical Questions User Suggested Earlier
These should definitely be included:

1. **"What are 3-5 specific things they used to say? Phrases, jokes, or expressions that were uniquely theirs?"**
   - Gives AI actual voice patterns

2. **"What's happening in your life right now that they would want to know about or ask you about?"**
   - Gives AI conversation starters for first message

---

## Technical Context

### Current Wizard Architecture
- 11 steps total (Step 1 is welcome screen, Steps 2-10 are questions, Step 11 is completion)
- Backend: `POST /api/personas/:id/wizard` with `wizard_inputs` payload
- AI extracts 5-15 memories from inputs and categorizes them
- Progress saved to localStorage for resume capability
- Breathing exercises + AI acknowledgments between steps
- Step Zero (emotional prep modal) already implemented and approved

### Backend Contract (Do Not Break)
Current `wizard_inputs` fields:
```javascript
{
  user_name,
  first_name,
  relationship,
  date_passed,
  humor,
  relationship_end,
  circumstances,
  memories,
  conversations
}
```

Can ADD new fields, just don't remove/rename existing ones without backend coordination.

### Files to Modify
- `public/index.html` - Wizard step HTML structure
- `public/app.js` - Wizard logic, step management
- `public/styles.css` - Wizard styling
- `src/controllers/personaController.js` - Only if backend changes needed

---

## Previous Relevant Discussions

### Progressive Disclosure Model (From Earlier Session)
User and I discussed "Sanctuary System" approach:
- Quick 5-question start → preview conversation → encourage Memory Room additions
- This is still on the table as future evolution
- Current decision is to make ONE solid wizard that works well first

### What Makes Good First Conversations
We identified these data needs:
- How they actually talked (phrases, catchphrases)
- Relationship-specific dynamics
- Their worldview/opinions
- Multiple specific stories (5-10, not just one)
- Emotional patterns
- Daily life details
- Communication style
- Current context (what's happening in user's life)

---

## Status on Last Prompt

User said: "do me a favor- I have to run but can you update or create a doc that will help you pick up where we left off?"

**This is that document.**

When user returns, we should:
1. Review this doc together
2. Start brainstorming the 15-19 question set
3. Map out the flow/order
4. Decide on pacing mechanisms (breathing exercises, section breaks, etc.)
5. Write the therapeutic copy for each question
6. Implement the new wizard structure

---

## Open Questions for User

1. Do you want to keep the breathing exercises + AI acknowledgments between EVERY question, or cluster questions into sections with breaks?

2. Should we keep ALL current grief questions, or are some droppable in favor of personality questions?

3. How do you feel about multiple-choice or guided prompts vs pure open text? (e.g., "Pick 3-5 topics they'd ask about: □ Your work □ Your relationships □ Your health □ Your hobbies")

4. Is 19 questions the absolute max, or are you open to 20-25 if the experience feels right?

5. Do you want me to propose a complete question set, or work through it collaboratively question-by-question?
