// Flight Recorder - Session Logging for Everspeak Deep Synthesis
// Persists chat history and LLM interactions for review and debugging

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, '../logs/session_reviews.json');

// Load existing log data
async function loadLogs() {
  try {
    const data = await fs.readFile(LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultData = { sessions: [] };
      await saveLogs(defaultData);
      return defaultData;
    }
    throw error;
  }
}

// Save log data
async function saveLogs(data) {
  await fs.writeFile(LOG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Log a complete interaction to the Flight Recorder
 *
 * @param {Object} options
 * @param {string} options.sessionId - Unique session identifier
 * @param {string} options.personaId - The persona being used
 * @param {string} options.personaName - Name of the persona
 * @param {string} options.messageType - 'first_contact' | 'user_message' | 'follow_up'
 * @param {string} options.userMessage - The user's input (or null for first contact)
 * @param {string} options.fullPrompt - Complete prompt sent to LLM
 * @param {string} options.llmResponse - Response from the LLM
 * @param {Object} options.activeLayers - Which Everspeak layers were active
 * @param {Object} options.debugInfo - Additional debug information
 * @param {number} options.turnNumber - Which turn in the conversation
 */
export async function logInteraction({
  sessionId,
  personaId,
  personaName,
  messageType,
  userMessage,
  fullPrompt,
  llmResponse,
  activeLayers,
  debugInfo,
  turnNumber
}) {
  const data = await loadLogs();

  // Find or create session
  let session = data.sessions.find(s => s.sessionId === sessionId);

  if (!session) {
    session = {
      sessionId,
      personaId,
      personaName,
      startedAt: new Date().toISOString(),
      interactions: []
    };
    data.sessions.push(session);
  }

  // Add interaction
  const interaction = {
    id: uuidv4(),
    turnNumber,
    timestamp: new Date().toISOString(),
    messageType,
    userMessage: userMessage || null,
    fullPrompt,
    llmResponse,
    activeLayers: {
      linguistic: activeLayers?.linguistic || false,
      valueStack: activeLayers?.valueStack || false,
      friction: activeLayers?.friction || false,
      narrativeAnchoring: activeLayers?.narrativeAnchoring || false,
      awarenessCalibration: activeLayers?.awarenessCalibration || false
    },
    debugInfo: debugInfo || {}
  };

  session.interactions.push(interaction);
  session.lastUpdatedAt = new Date().toISOString();

  await saveLogs(data);

  return interaction.id;
}

/**
 * Get all interactions for a session
 */
export async function getSessionHistory(sessionId) {
  const data = await loadLogs();
  return data.sessions.find(s => s.sessionId === sessionId) || null;
}

/**
 * Get recent sessions for review
 */
export async function getRecentSessions(limit = 10) {
  const data = await loadLogs();
  return data.sessions
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
    .slice(0, limit);
}

/**
 * Console debug output for Scrutiny Mode
 */
export function printScrutinyLog(debugInfo) {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🔍 EVERSPEAK SCRUTINY MODE - Layer Analysis');
  console.log('════════════════════════════════════════════════════════════════');

  if (debugInfo.toneDecision) {
    console.log(`\n📢 TONE DECISION: ${debugInfo.toneDecision.selected}`);
    console.log(`   Reason: ${debugInfo.toneDecision.reason}`);
    if (debugInfo.toneDecision.sourceQuestion) {
      console.log(`   Source: ${debugInfo.toneDecision.sourceQuestion}`);
    }
  }

  if (debugInfo.frictionApplied) {
    console.log(`\n⚡ FRICTION LAYER: Active`);
    console.log(`   Quirks from Q10: ${debugInfo.frictionApplied.quirks || 'none'}`);
    console.log(`   Flaws from Q20: ${debugInfo.frictionApplied.flaws || 'none'}`);
  }

  if (debugInfo.valueStackUsed) {
    console.log(`\n📊 VALUE STACK: Active`);
    console.log(`   Q17 (What mattered): ${debugInfo.valueStackUsed.q17 || 'not set'}`);
    console.log(`   Q18 (Hard times): ${debugInfo.valueStackUsed.q18 || 'not set'}`);
  }

  if (debugInfo.memoryAnchors) {
    console.log(`\n🎯 NARRATIVE ANCHORS: ${debugInfo.memoryAnchors.length} available`);
    debugInfo.memoryAnchors.slice(0, 3).forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.substring(0, 60)}...`);
    });
  }

  if (debugInfo.awarenessMode) {
    console.log(`\n👁️ AWARENESS MODE: ${debugInfo.awarenessMode}`);
  }

  console.log('\n════════════════════════════════════════════════════════════════\n');
}
