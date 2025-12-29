import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errorHandler.js';
import fs from 'node:fs';
import { unlink } from 'node:fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  }
};
