import axios from 'axios';

export class TTSService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string): Promise<Buffer> {
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/your_voice_id',
      { text },
      {
        headers: { 'xi-api-key': this.apiKey },
        responseType: 'arraybuffer'
      }
    );
    return Buffer.from(response.data);
  }
}