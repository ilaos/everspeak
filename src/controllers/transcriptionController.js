import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errorHandler.js';
import fs from 'node:fs';
import { unlink } from 'node:fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extraction prompts for different question types
const EXTRACTION_PROMPTS = {
  name: `Extract the primary name or nickname the user wants to use for this person.
Rules:
- If multiple names are given, prefer the nickname or the name "everyone close to them" used
- Return ONLY the name itself, nothing else
- If the answer is something like "His name was James but everyone called him Jimmy", return "Jimmy"
- If the answer is "Sarah", return "Sarah"
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
    let tempFilePath = null;

    try {
      // Validate that a file was uploaded
      if (!req.file) {
        throw new AppError('No audio file provided', 400);
      }

      tempFilePath = req.file.path;

      // Read the audio file and convert to base64
      const audioBuffer = fs.readFileSync(tempFilePath);
      const base64Audio = audioBuffer.toString('base64');

      // Determine MIME type from file extension or use default
      const mimeType = req.file.mimetype || 'audio/webm';

      // Use Gemini to transcribe the audio
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

      res.status(200).json({
        success: true,
        text: transcribedText
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        console.error('Transcription error:', error);
        next(new AppError('Failed to transcribe audio. Please try again.', 500));
      }
    } finally {
      // Clean up temporary file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch (cleanupError) {
          console.error('Failed to delete temp file:', cleanupError);
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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const result = await model.generateContent(prompt + trimmedTranscript);
      const response = await result.response;
      let extractedName = response.text().trim();

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
