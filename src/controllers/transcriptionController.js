import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errorHandler.js';
import fs from 'node:fs';
import { unlink } from 'node:fs/promises';
import crypto from 'node:crypto';

if (!process.env.GEMINI_API_KEY) {
  console.error('[Transcription] GEMINI_API_KEY is not set — transcription will fail');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GEMINI_MODEL = 'gemini-2.5-flash';

// Extraction prompts for different question types
const EXTRACTION_PROMPTS = {
  name: `Extract the PERSONAL name the user wants to use for this person.

CRITICAL PRIORITY ORDER:
1. ALWAYS prefer the name the user personally used: "to me he was", "I called him", "I knew him as"
2. Second choice: nicknames used by close people: "everyone close called him", "family called her"
3. LAST choice: professional/formal names: "professionally known as", "in the professional world"

Rules:
- Return ONLY the single name itself, nothing else
- NEVER return the professional/formal name if a personal nickname is given
- Examples:
  - "In the professional world he was Jim, but to me he was Jimmy" → "Jimmy"
  - "His name was James but everyone called him Jimmy" → "Jimmy"
  - "Everyone knew him as Jim but I called him Jimmy" → "Jimmy"
  - "Professionally Jim, but to me Jimmy" → "Jimmy"
  - "Sarah" → "Sarah"
- If no clear name is found, return "them"
- Never return explanations, just the name

Transcript: `,

  user_name: `Extract the user's name from this text.
Rules:
- Return ONLY the name itself, nothing else
- If they say "My name is John" or "I'm John" or "John", return "John"
- If no clear name is found, return "friend"

Transcript: `
};

export const transcriptionController = {
  // POST /api/transcribe - Transcribe audio to text
  async transcribe(req, res, next) {
    const reqId = crypto.randomUUID().slice(0, 8);
    let tempFilePath = null;

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.error(`[Transcribe ${reqId}] GEMINI_API_KEY is not configured`);
        return next(Object.assign(
          new AppError('Transcription service is not configured.', 500),
          { error_code: 'MISSING_API_KEY' }
        ));
      }

      // Validate that a file was uploaded
      if (!req.file) {
        throw new AppError('No audio file provided', 400);
      }

      tempFilePath = req.file.path;
      const mimeType = req.file.mimetype || 'audio/webm';

      console.log(`[Transcribe ${reqId}] file=${req.file.originalname} size=${req.file.size} mime=${mimeType}`);

      // Read the audio file and convert to base64
      const audioBuffer = fs.readFileSync(tempFilePath);
      const base64Audio = audioBuffer.toString('base64');

      // Use Gemini to transcribe the audio
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio
          }
        },
        { text: 'Transcribe this audio recording exactly as spoken. Return only the transcription text with no additional commentary, labels, or formatting. If the audio is unclear or empty, return an empty string.' }
      ]);

      const response = await result.response;
      const transcribedText = response.text().trim();

      console.log(`[Transcribe ${reqId}] success, length=${transcribedText.length}`);

      res.status(200).json({
        success: true,
        text: transcribedText
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        const errorCode = error.status === 403 || error.code === 403 ? 'AUTH_FAILED'
          : error.status === 429 || error.code === 429 ? 'RATE_LIMITED'
          : error.message?.includes('not found') ? 'MODEL_NOT_FOUND'
          : error.message?.includes('API key') ? 'INVALID_API_KEY'
          : 'PROVIDER_ERROR';

        console.error(`[Transcribe ${reqId}] ${errorCode}:`, {
          message: error.message,
          name: error.name,
          code: error.code,
          status: error.status,
          errorDetails: error.errorDetails || error.response?.data,
          fileSize: req.file?.size,
          mimeType: req.file?.mimetype,
          model: GEMINI_MODEL
        });

        const appError = new AppError(
          `Transcription failed (${errorCode}). Please try again.`, 500
        );
        appError.error_code = errorCode;
        next(appError);
      }
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (cleanupError) {
          console.error(`[Transcribe ${reqId}] Failed to delete temp file:`, cleanupError.message);
        }
      }
    }
  },

  // POST /api/extract-name - Extract display name from transcript
  async extractName(req, res, next) {
    try {
      const { transcript, type = 'name' } = req.body;

      if (!transcript || typeof transcript !== 'string') {
        throw new AppError('Transcript is required', 400);
      }

      // If transcript is very short (likely just a name), return it directly
      const trimmedTranscript = transcript.trim();
      if (trimmedTranscript.split(/\s+/).length <= 2 && !trimmedTranscript.includes(',')) {
        // Single word or two words without commas - likely just a name
        return res.status(200).json({
          success: true,
          display_name: trimmedTranscript,
          full_transcript: trimmedTranscript
        });
      }

      // Use LLM to extract the name
      const prompt = EXTRACTION_PROMPTS[type] || EXTRACTION_PROMPTS.name;
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      console.log(`[Name Extraction] Input transcript: "${trimmedTranscript}"`);
      const result = await model.generateContent(prompt + trimmedTranscript);
      const response = await result.response;
      let extractedName = response.text().trim();
      console.log(`[Name Extraction] LLM returned: "${extractedName}"`)

      // Clean up any quotes or extra formatting
      extractedName = extractedName.replace(/^["']|["']$/g, '').trim();

      // Fallback if extraction failed
      if (!extractedName || extractedName.toLowerCase() === 'them' || extractedName.length > 50) {
        // Try to grab the first capitalized word as a fallback
        const nameMatch = trimmedTranscript.match(/\b([A-Z][a-z]+)\b/);
        extractedName = nameMatch ? nameMatch[1] : 'them';
      }

      res.status(200).json({
        success: true,
        display_name: extractedName,
        full_transcript: trimmedTranscript
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        console.error('Name extraction error:', error);
        next(new AppError('Failed to extract name. Please try again.', 500));
      }
    }
  }
};
