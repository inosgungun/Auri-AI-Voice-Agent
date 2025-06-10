import { Room, RoomServiceClient, WebhookReceiver, DataPacket_Kind } from 'livekit-server-sdk';
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
    private processingPromises: Map<string, Promise<void>>;

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
        this.processingPromises = new Map();
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
            const sessionId = room.name;
            const startTime = Date.now();
            let ttft = 0;
            let ttfb = 0;

            try {
      
                if (this.processingPromises.has(sessionId)) {
                    await this.processingPromises.get(sessionId);
                }

                const processingPromise = (async () => {
     
                    const audioBuffer = await this.getAudioBuffer(track);
                    const text = await this.stt.listen(audioBuffer);

                    if (!text) {
                        console.error('Failed to transcribe audio');
                        return;
                    }

                    const llmStartTime = Date.now();
                    const response = await this.llm.generateResponse(text);
                    ttft = Date.now() - llmStartTime;
                    
                    const ttsStartTime = Date.now();
                    const audioResponse = await this.tts.synthesize(response);
                    ttfb = Date.now() - ttsStartTime;

                    const endTime = Date.now();
                    this.metrics.logMetrics({
                        timestamp: new Date().toISOString(),
                        sessionId,
                        eouDelay: endTime - startTime,
                        ttft,
                        ttfb,
                        totalLatency: endTime - startTime
                    });

                    await this.sendAudioResponse(room, audioResponse);
                })();

                this.processingPromises.set(sessionId, processingPromise);
                await processingPromise;
            } catch (error) {
                console.error('Error processing audio:', error);
            } finally {
                this.processingPromises.delete(sessionId);
            }
        }
    }

    private async getAudioBuffer(track: any): Promise<Buffer> {
        try {
            const audioData = await track.getAudioData();
            
            const buffer = Buffer.from(audioData);
            
            if (!buffer || buffer.length === 0) {
                throw new Error('Empty audio buffer received');
            }

            return buffer;
        } catch (error) {
            console.error('Error getting audio buffer:', error);
            throw new Error('Failed to process audio data');
        }
    }

    private async sendAudioResponse(room: Room, audioBuffer: Buffer) {
        try {
 
            const audioData = new Uint8Array(audioBuffer);

            await this.roomService.sendData(
                room.name,
                audioData,
                DataPacket_Kind.RELIABLE
            );

            const duration = audioBuffer.length / (16000 * 2);
            await new Promise(resolve => setTimeout(resolve, duration * 1000));
        } catch (error) {
            console.error('Error sending audio response:', error);
            throw new Error('Failed to send audio response');
        }
    }
} 