// LLM Service using Groq API

import axios from 'axios';

export class LLMService {
    private apiKey: string;

    constructor (apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(prompt: string): Promise<string> {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: '',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            }
            
        );
        return response.data.choices[0].message.content;
    }
}