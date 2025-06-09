// Speech-To-Text (STT) service for converting audio to text

import { createClient } from '@deepgram/sdk';

export class STTService {
    private deepgram: ReturnType<typeof createClient>;

    constructor (apiKey: string) {
        this.deepgram = createClient(apiKey);
    }

    async transcribe(audio: Buffer): Promise<string> {
        const response = await this.deepgram.listen.prerecorded.transcribeFile(
            audio,
            {
                punctuate: true,
                model: 'nova-2'
            }
        );
     
        const result = response as any;
        if (!result.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
            throw new Error('Failed to transcribe audio');
        }
        
        return result.results.channels[0].alternatives[0].transcript;
    }
}

