import { TrackType } from 'livekit-server-sdk';

// LiveKit Types
export interface RoomEvent {
    event: 'room_started' | 'room_finished' | 'track_published';
    room: Room;
    participant?: Participant;
    track?: Track;
}

export interface Room {
    name: string;
    numParticipants: number;
    metadata?: string;
}

export interface Participant {
    identity: string;
    name?: string;
    metadata?: string;
}

export interface Track {
    sid: string;
    name: string;
    type: TrackType;
    metadata?: string;
}

// Metrics Types
export interface CallMetrics {
    timestamp: string;
    sessionId: string;
    eouDelay: number;  // End of Utterance delay
    ttft: number;      // Time to First Token
    ttfb: number;      // Time to First Byte
    totalLatency: number;
}

export interface SessionSummary {
    sessionId: string;
    totalCalls: number;
    averageEOUDelay: number;
    averageTTFT: number;
    averageTTFB: number;
    averageLatency: number;
    timestamp: string;
}

// Agent Configuration Types
export interface AgentConfig {
    stt: {
        provider: 'deepgram';
        model: string;
        language: string;
    };
    llm: {
        provider: 'groq';
        model: string;
        temperature: number;
        maxTokens: number;
    };
    tts: {
        provider: 'elevenlabs';
        voiceId: string;
        model: string;
        stability: number;
        similarityBoost: number;
    };
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Webhook Types
export interface WebhookPayload {
    event: string;
    room: Room;
    participant?: Participant;
    track?: Track;
}

declare module 'groq' {
    export default class Groq {
        constructor(config: { apiKey: string });
        chat: {
            completions: {
                create(params: {
                    messages: Array<{
                        role: string;
                        content: string;
                    }>;
                    model: string;
                    temperature?: number;
                    max_tokens?: number;
                    top_p?: number;
                    stream?: boolean;
                }): Promise<{
                    choices: Array<{
                        message?: {
                            content?: string;
                        };
                    }>;
                }>;
            };
        };
    }
} 

export interface DeepgramTranscriptResult {
  results?: {
    alternatives?: {
      transcript?: string;
    }[];
  }[];
}
