import { Room, RoomServiceClient, WebhookReceiver } from 'livekit-server-sdk';
import { STTService } from './stt';
import { LLMService } from './llm';
import { TTSService } from './tts';
import { MetricsService } from '../services/metrics';

export class LiveKitAgent {
    private roomService: RoomServiceClient;
    private stt: STTService;
    private llm: LLMService;
    private tts: TTSService;
    private metrics: MetricsService;
    private activeRooms: Map<string, Room>;

    constructor(
        apiKey: string,
        apiSecret: string,
        stt: STTService,
        llm: LLMService,
        tts: TTSService,
        metrics: MetricsService
    ) {
        this.roomService = new RoomServiceClient(apiKey, apiSecret);
        this.stt = stt;
        this.llm = llm;
        this.tts = tts;
        this.metrics = metrics;
        this.activeRooms = new Map();
    }

    async handleWebhook(payload: string, auth: string) {
        const receiver = new WebhookReceiver(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);
        const event = await receiver.receive(payload, auth);

        if (!event.room) {
            console.error('No room information in webhook event');
            return;
        }

        switch (event.event) {
            case 'room_started':
                await this.handleRoomStarted(event.room);
                break;
            case 'room_finished':
                await this.handleRoomFinished(event.room);
                break;
            case 'track_published':
                if (event.participant && event.track) {
                    await this.handleTrackPublished(event.room, event.participant, event.track);
                }
                break;
        }
    }

    private async handleRoomStarted(room: Room) {
        this.activeRooms.set(room.name, room);
        console.log(`Room started: ${room.name}`);
    }

    private async handleRoomFinished(room: Room) {
        this.activeRooms.delete(room.name);
        console.log(`Room finished: ${room.name}`);
    }

    private async handleTrackPublished(room: Room, participant: any, track: any) {
        if (track.kind === 'audio') {
            const startTime = Date.now();
            try {
                // 1. Convert audio to text
                const audioBuffer = await this.getAudioBuffer(track);
                const text = await this.stt.transcribe(audioBuffer);
                
                // 2. Generate response using LLM
                const response = await this.llm.generateResponse(text);
                
                // 3. Convert response to speech
                const audioResponse = await this.tts.synthesize(response);

                // Log metrics
                const endTime = Date.now();
                this.metrics.logMetrics({
                    timestamp: new Date().toISOString(),
                    sessionId: room.name,
                    eouDelay: endTime - startTime,
                    ttft: 0, // To be implemented based on LLM response timing
                    ttfb: 0, // To be implemented based on first byte timing
                    totalLatency: endTime - startTime
                });

                // Send audio response back to the room
                await this.sendAudioResponse(room, audioResponse);
            } catch (error) {
                console.error('Error processing audio:', error);
            }
        }
    }

    private async getAudioBuffer(track: any): Promise<Buffer> {
        // Implementation depends on how LiveKit provides audio data
        // This is a placeholder
        return Buffer.from([]);
    }

    private async sendAudioResponse(room: Room, audioBuffer: Buffer) {
        // Implementation depends on how to send audio back to LiveKit
        // This is a placeholder
    }
} 