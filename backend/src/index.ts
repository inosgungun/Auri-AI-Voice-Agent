import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import { STTService } from './agent/stt';
import { LLMService } from './agent/llm';
import { TTSService } from './agent/tts';
import { LiveKitAgent } from './agent/livekit';
import { MetricsService } from './services/metrics';
import { ApiResponse } from './types';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Initialize services
const stt = new STTService(process.env.DEEPGRAM_API_KEY!);
const llm = new LLMService(process.env.GROQ_API_KEY!);
const tts = new TTSService(process.env.ELEVENLABS_API_KEY!);
const metrics = new MetricsService();
const agent = new LiveKitAgent(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    stt,
    llm,
    tts,
    metrics
);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Webhook endpoint for LiveKit events
app.post('/webhook', (async (req: Request, res: Response) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        await agent.handleWebhook(JSON.stringify(req.body), auth);
        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}) as RequestHandler);

// Get metrics for a session
app.get('/metrics/:sessionId', (req: Request, res: Response) => {
    try {
        const sessionId = req.params.sessionId;
        const summary = metrics.getSessionSummary(sessionId);
        
        const response: ApiResponse<typeof summary> = {
            success: true,
            data: summary
        };
        
        res.json(response);
    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve metrics' 
        });
    }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
