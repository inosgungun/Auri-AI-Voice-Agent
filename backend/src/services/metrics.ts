import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface CallMetrics {
    timestamp: string;
    eouDelay: number;  // End of Utterance delay
    ttft: number;      // Time to First Token
    ttfb: number;      // Time to First Byte
    totalLatency: number;
    sessionId: string;
    provider?: string;
    model?: string;
    language?: string;
}

interface SessionSummary {
    sessionId: string;
    totalCalls: number;
    averageEOUDelay: number;
    averageTTFT: number;
    averageTTFB: number;
    averageLatency: number;
    timestamp: string;
    provider?: string;
    model?: string;
    language?: string;
    minLatency: number;
    maxLatency: number;
    callsUnder2s: number;
    callsOver2s: number;
}

export class MetricsService {
    private metricsLogPath: string;
    private workbook!: XLSX.WorkBook;
    private worksheet!: XLSX.WorkSheet;

    constructor(logPath: string = './logs/metrics.xlsx') {
        this.metricsLogPath = logPath;
        this.initializeWorkbook();
    }

    private initializeWorkbook() {
   
        const logDir = path.dirname(this.metricsLogPath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        if (fs.existsSync(this.metricsLogPath)) {
            this.workbook = XLSX.readFile(this.metricsLogPath);
            this.worksheet = this.workbook.Sheets['Call Metrics'];
        } else {
            this.workbook = XLSX.utils.book_new();
            this.worksheet = XLSX.utils.json_to_sheet([]);
            XLSX.utils.book_append_sheet(this.workbook, this.worksheet, 'Call Metrics');
        }
    }

    logMetrics(metrics: CallMetrics) {
        const data = XLSX.utils.sheet_to_json(this.worksheet);
        data.push(metrics);
        
        const newWorksheet = XLSX.utils.json_to_sheet(data);
        this.workbook.Sheets['Call Metrics'] = newWorksheet;
        
        XLSX.writeFile(this.workbook, this.metricsLogPath);
    }

    getSessionMetrics(sessionId: string): CallMetrics[] {
        const data = XLSX.utils.sheet_to_json(this.worksheet) as CallMetrics[];
        return data.filter(metric => metric.sessionId === sessionId);
    }

    getSessionSummary(sessionId: string): SessionSummary | null {
        const metrics = this.getSessionMetrics(sessionId);
        if (metrics.length === 0) return null;

        const latencies = metrics.map(m => m.totalLatency);
        const callsUnder2s = latencies.filter(l => l <= 2000).length;
        const callsOver2s = latencies.filter(l => l > 2000).length;

        return {
            sessionId,
            totalCalls: metrics.length,
            averageEOUDelay: this.calculateAverage(metrics.map(m => m.eouDelay)),
            averageTTFT: this.calculateAverage(metrics.map(m => m.ttft)),
            averageTTFB: this.calculateAverage(metrics.map(m => m.ttfb)),
            averageLatency: this.calculateAverage(latencies),
            minLatency: Math.min(...latencies),
            maxLatency: Math.max(...latencies),
            callsUnder2s,
            callsOver2s,
            timestamp: new Date().toISOString(),
            provider: metrics[0].provider,
            model: metrics[0].model,
            language: metrics[0].language
        };
    }

    private calculateAverage(numbers: number[]): number {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }
}