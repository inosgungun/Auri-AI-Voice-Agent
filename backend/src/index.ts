import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import { STTService } from './agent/stt';
import { LLMService } from './agent/llm';
import { TTSService } from './agent/tts';
import { LiveKitAgent } from './agent/livekit';
import { MetricsService } from './services/metrics';
import { ApiResponse } from './types';
import authRoutes from './routes/auth';
import cors from 'cors';
import { authenticateUser, AuthRequest } from './middleware/auth';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

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

app.use('/api', authRoutes);

app.post('/api/chat', authenticateUser, (async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message is required' 
            });
        }
        const response = await llm.generateResponse(message);
        
        const audio = await tts.synthesize(response);

        metrics.logMetrics(req.user!.uid, message, response);

        res.json({
            success: true,
            response,
            audio
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process message' 
        });
    }
}) as RequestHandler);

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

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

app.get('/metrics/:sessionId', authenticateUser, (req: AuthRequest, res: Response) => {
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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
