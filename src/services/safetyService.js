// Safety Service for Voice Chat
// Detects emotional distress and dependency patterns

/**
 * Safety detection patterns for voice reply eligibility.
 *
 * Voice replies are DISABLED when:
 * - High emotional distress detected (panic, self-harm, flooding)
 * - Dependency/exclusivity language detected repeatedly
 *
 * These checks run silently - no announcements to user.
 */

// Patterns indicating high emotional distress
const DISTRESS_PATTERNS = [
  // Self-harm / suicidal ideation
  /\b(kill\s*(myself|me)|suicide|end\s*(it|my\s*life)|want\s*to\s*die|don'?t\s*want\s*to\s*(live|be\s*here))\b/i,
  /\b(hurt\s*(myself|me)|cutting|self[- ]?harm)\b/i,

  // Panic indicators
  /\b(can'?t\s*breathe|panic\s*attack|having\s*a\s*panic|freaking\s*out|losing\s*(it|my\s*mind))\b/i,
  /\b(i'?m\s*scared|terrified|can'?t\s*stop\s*(crying|shaking))\b/i,

  // Emotional flooding
  /\b(i\s*can'?t\s*(do\s*this|take\s*it|handle|cope)|too\s*much|overwhelmed)\b/i,
];

// Patterns indicating dependency / exclusivity
const DEPENDENCY_PATTERNS = [
  /\b(only\s*(one|person)\s*(who|that)\s*(understands?|gets?\s*me|listens?))\b/i,
  /\b(you'?re\s*the\s*only\s*(one|person))\b/i,
  /\b(don'?t\s*(want|need)\s*to\s*talk\s*to\s*anyone\s*else)\b/i,
  /\b(rather\s*(just\s*)?talk\s*to\s*you)\b/i,
  /\b(no\s*one\s*else\s*(understands?|cares?|listens?))\b/i,
  /\b(you'?re\s*all\s*i\s*(have|need))\b/i,
  /\b(only\s*you)\b/i,
  /\b(instead\s*of\s*(real\s*)?(people|others|friends|family))\b/i,
];

// Session tracking for dependency escalation
// Maps personaId to array of recent dependency detections
const dependencyHistory = new Map();
const DEPENDENCY_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const DEPENDENCY_THRESHOLD = 2; // Triggers after 2 occurrences in window

export const safetyService = {
  /**
   * Check if voice replies should be disabled due to safety concerns.
   *
   * @param {string} message - The user's message text
   * @param {string} personaId - The persona ID for session tracking
   * @returns {{voiceAllowed: boolean, reason: string|null, flags: string[]}}
   */
  checkVoiceEligibility(message, personaId) {
    const flags = [];
    let voiceAllowed = true;
    let reason = null;

    // Check for high emotional distress
    for (const pattern of DISTRESS_PATTERNS) {
      if (pattern.test(message)) {
        flags.push('HIGH_DISTRESS');
        voiceAllowed = false;
        reason = 'distress_detected';
        break;
      }
    }

    // Check for dependency patterns
    if (voiceAllowed) {
      let dependencyDetected = false;
      for (const pattern of DEPENDENCY_PATTERNS) {
        if (pattern.test(message)) {
          dependencyDetected = true;
          flags.push('DEPENDENCY_LANGUAGE');
          break;
        }
      }

      if (dependencyDetected) {
        // Track dependency over time
        const now = Date.now();
        let history = dependencyHistory.get(personaId) || [];

        // Clean old entries
        history = history.filter(t => now - t < DEPENDENCY_WINDOW_MS);

        // Add current detection
        history.push(now);
        dependencyHistory.set(personaId, history);

        // Check if threshold exceeded
        if (history.length >= DEPENDENCY_THRESHOLD) {
          voiceAllowed = false;
          reason = 'dependency_escalation';
          flags.push('DEPENDENCY_THRESHOLD_EXCEEDED');
        }
      }
    }

    return {
      voiceAllowed,
      reason,
      flags
    };
  },

  /**
   * Check if a message contains distress indicators (for text-only responses too).
   *
   * @param {string} message - The user's message text
   * @returns {{isDistressed: boolean, level: 'low'|'medium'|'high', indicators: string[]}}
   */
  assessDistressLevel(message) {
    const indicators = [];
    let level = 'low';

    // Check for self-harm / suicidal content
    if (/\b(kill\s*(myself|me)|suicide|end\s*(it|my\s*life)|want\s*to\s*die|don'?t\s*want\s*to\s*(live|be\s*here))\b/i.test(message)) {
      indicators.push('suicidal_ideation');
      level = 'high';
    }

    if (/\b(hurt\s*(myself|me)|cutting|self[- ]?harm)\b/i.test(message)) {
      indicators.push('self_harm');
      level = 'high';
    }

    // Check for panic
    if (/\b(can'?t\s*breathe|panic\s*attack|having\s*a\s*panic)\b/i.test(message)) {
      indicators.push('panic');
      if (level !== 'high') level = 'medium';
    }

    // Check for emotional flooding
    if (/\b(i\s*can'?t\s*(do\s*this|take\s*it|handle|cope)|too\s*much|overwhelmed)\b/i.test(message)) {
      indicators.push('emotional_flooding');
      if (level !== 'high') level = 'medium';
    }

    // Check for general distress
    if (/\b(so\s*(sad|depressed|hopeless|lost)|i'?m\s*breaking|falling\s*apart)\b/i.test(message)) {
      indicators.push('general_distress');
      if (level === 'low') level = 'medium';
    }

    return {
      isDistressed: indicators.length > 0,
      level,
      indicators
    };
  },

  /**
   * Reset dependency tracking for a persona (e.g., after session ends or user takes a break).
   *
   * @param {string} personaId - The persona ID
   */
  resetDependencyTracking(personaId) {
    dependencyHistory.delete(personaId);
  },

  /**
   * Clear all session tracking data.
   */
  clearAllTracking() {
    dependencyHistory.clear();
  }
};
