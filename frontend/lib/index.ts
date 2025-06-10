export class AuriClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('AuriClient initialized with baseUrl:', this.baseUrl);
  }

  setToken(token: string) {
    this.token = token;
  }

  async sendToAuri(text: string) {
    try {
      if (!this.token) {
        throw new Error('Not authenticated. Please login first.');
      }

      console.log('Sending request to:', `${this.baseUrl}/api/chat`);
      console.log('Request payload:', { message: text });

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ message: text }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      return {
        text: data.response || 'Sorry, I could not process your request.',
        audio: data.audio,
      };
    } catch (error) {
      console.error('Error communicating with Auri:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Could not connect to the Auri server. Please make sure the server is running.');
      }
      throw error;
    }
  }
}

// Create a singleton instance
export const auriClient = new AuriClient(); 