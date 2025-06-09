import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class LLMService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are Auri, a helpful and concise AI assistant.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.choices[0]?.message?.content ?? 'No response.';
    } catch (error: any) {
      console.error('Groq API error:', error.response?.data || error.message);
      throw error;
    }
  }
}
