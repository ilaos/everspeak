// Polyfill for Node.js < 20 (required for OpenAI SDK file uploads)
import { File as NodeFile } from 'node:buffer';
if (!globalThis.File) {
  globalThis.File = NodeFile;
}

import OpenAI from 'openai';
import { AppError } from '../utils/errorHandler.js';
import fs from 'node:fs';
import { unlink } from 'node:fs/promises';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

      // Transcribe using OpenAI Whisper
      // Use createReadStream to pass a File-like object to OpenAI SDK
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1'
      });

      res.status(200).json({
        success: true,
        text: transcription.text
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
