// Speech-To-Text (STT) service for converting audio to text

import { createClient } from '@deepgram/sdk';
import { DeepgramTranscriptResult } from '../types';

export class STTService {
  private deepgram: ReturnType<typeof createClient>;

  constructor(apiKey: string) {
    this.deepgram = createClient(apiKey);
  }

  async listen(audioBuffer: Buffer) {
  const { result, error } = await this.deepgram.listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-3',
      language: 'en',
      smart_format: true,
    },
  );

    if (error) {
      console.error('Transcription error:', error);
      return null;
    }

    const data = result as unknown as DeepgramTranscriptResult;

    const transcript = (result as any).results?.[0]?.alternatives?.[0]?.transcript || '';

    return transcript;
  }
}


