// Text-to-Speech Service for Persona Voice Replies
// Uses OpenAI TTS API with strict emotional restraint

import OpenAI from 'openai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Voice output directory
const VOICE_OUTPUT_DIR = path.join(__dirname, '..', '..', 'uploads', 'voice');

// Ensure voice directory exists
if (!fs.existsSync(VOICE_OUTPUT_DIR)) {
  fs.mkdirSync(VOICE_OUTPUT_DIR, { recursive: true });
}

/**
 * TTS Service for generating persona voice replies.
 *
 * VOICE CHARACTERISTICS (STRICT):
 * - Calm
 * - Steady
 * - Emotionally restrained
 * - Evenly paced
 * - Non-performative
 *
 * VOICE MUST NOT:
 * - Dramatize
 * - Whisper
 * - Swell emotionally
 * - Act or emote
 * - Intensify over time
 */
export const ttsService = {
  /**
   * Generate voice audio from text.
   *
   * @param {string} text - The text to convert to speech
   * @param {string} voiceId - OpenAI voice ID (alloy, echo, fable, onyx, nova, shimmer)
   * @returns {Promise<{audioPath: string, audioUrl: string, duration: number}>}
   */
  async generateVoice(text, voiceId = 'alloy') {
    // Validate voice ID
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(voiceId)) {
      voiceId = 'alloy'; // Default to neutral voice
    }

    // Generate unique filename
    const filename = `voice_${uuidv4()}.mp3`;
    const outputPath = path.join(VOICE_OUTPUT_DIR, filename);

    try {
      // Generate speech using OpenAI TTS
      // Using 'tts-1' model for lower latency (tts-1-hd for higher quality)
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceId,
        input: text,
        speed: 0.95, // Slightly slower for calm, steady pacing
      });

      // Get the audio buffer
      const buffer = Buffer.from(await response.arrayBuffer());

      // Write to file
      fs.writeFileSync(outputPath, buffer);

      // Estimate duration (rough estimate: ~150 words per minute for TTS)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60);

      return {
        audioPath: outputPath,
        audioUrl: `/api/voice/${filename}`,
        filename,
        duration: estimatedDuration,
        voiceId,
        textLength: text.length
      };
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  },

  /**
   * Get the file path for a voice file.
   *
   * @param {string} filename - The voice filename
   * @returns {string|null} The file path or null if not found
   */
  getVoiceFilePath(filename) {
    const filePath = path.join(VOICE_OUTPUT_DIR, filename);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  },

  /**
   * Delete a voice file.
   *
   * @param {string} filename - The voice filename
   * @returns {boolean} Whether deletion was successful
   */
  deleteVoiceFile(filename) {
    try {
      const filePath = path.join(VOICE_OUTPUT_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete voice file:', error);
      return false;
    }
  },

  /**
   * Clean up old voice files (older than specified hours).
   *
   * @param {number} maxAgeHours - Maximum age in hours
   * @returns {number} Number of files deleted
   */
  cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = fs.readdirSync(VOICE_OUTPUT_DIR);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      let deleted = 0;

      for (const file of files) {
        const filePath = path.join(VOICE_OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      }

      return deleted;
    } catch (error) {
      console.error('Voice file cleanup failed:', error);
      return 0;
    }
  }
};
