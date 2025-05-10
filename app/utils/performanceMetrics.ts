import { PerformanceObserver, performance } from 'perf_hooks';

interface TranslationMetrics {
    latency: number;  // in milliseconds
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    accuracy?: number;  // WER (Word Error Rate) if reference translation is provided
}

export class PerformanceMetrics {
    private static measurements: Map<string, TranslationMetrics[]> = new Map();

    static startMeasurement(id: string): void {
        performance.mark(`start-${id}`);
    }

    static endMeasurement(id: string, sourceText: string, translatedText: string, referenceTranslation?: string): TranslationMetrics {
        performance.mark(`end-${id}`);
        performance.measure(id, `start-${id}`, `end-${id}`);

        const duration = performance.getEntriesByName(id)[0].duration;
        const memoryUsage = process.memoryUsage();

        let accuracy: number | undefined;
        if (referenceTranslation) {
            accuracy = this.calculateWER(translatedText, referenceTranslation);
        }

        const metrics: TranslationMetrics = {
            latency: duration,
            memoryUsage: {
                heapUsed: memoryUsage.heapUsed,
                heapTotal: memoryUsage.heapTotal,
                external: memoryUsage.external,
                rss: memoryUsage.rss
            },
            accuracy
        };

        if (!this.measurements.has(id)) {
            this.measurements.set(id, []);
        }
        this.measurements.get(id)?.push(metrics);

        return metrics;
    }

    static calculateWER(hypothesis: string, reference: string): number {
        // Normalize strings: lowercase, remove punctuation, and split into words
        const normalizeText = (text: string): string[] => {
            return text.toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim()
                .split(/\s+/);
        };

        const hypothesisWords = normalizeText(hypothesis);
        const referenceWords = normalizeText(reference);

        // Handle edge cases
        if (referenceWords.length === 0) return hypothesisWords.length > 0 ? 1 : 0;
        if (hypothesisWords.length === 0) return 1;

        // Create matrix for dynamic programming
        const matrix = Array(hypothesisWords.length + 1).fill(null)
            .map(() => Array(referenceWords.length + 1).fill(0));

        // Initialize first row and column
        for (let i = 0; i <= hypothesisWords.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= referenceWords.length; j++) matrix[0][j] = j;

        // Fill in the rest of the matrix
        for (let i = 1; i <= hypothesisWords.length; i++) {
            for (let j = 1; j <= referenceWords.length; j++) {
                const cost = hypothesisWords[i - 1] === referenceWords[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        // Calculate WER
        const distance = matrix[hypothesisWords.length][referenceWords.length];
        const wer = distance / referenceWords.length;

        // Return normalized WER (between 0 and 1)
        return Math.min(1, Math.max(0, wer));
    }

    static getAverageMetrics(id: string): TranslationMetrics | null {
        const measurements = this.measurements.get(id);
        if (!measurements || measurements.length === 0) return null;

        const sum = measurements.reduce((acc, curr) => ({
            latency: acc.latency + curr.latency,
            memoryUsage: {
                heapUsed: acc.memoryUsage.heapUsed + curr.memoryUsage.heapUsed,
                heapTotal: acc.memoryUsage.heapTotal + curr.memoryUsage.heapTotal,
                external: acc.memoryUsage.external + curr.memoryUsage.external,
                rss: acc.memoryUsage.rss + curr.memoryUsage.rss
            },
            accuracy: (acc.accuracy || 0) + (curr.accuracy || 0)
        }));

        return {
            latency: sum.latency / measurements.length,
            memoryUsage: {
                heapUsed: sum.memoryUsage.heapUsed / measurements.length,
                heapTotal: sum.memoryUsage.heapTotal / measurements.length,
                external: sum.memoryUsage.external / measurements.length,
                rss: sum.memoryUsage.rss / measurements.length
            },
            accuracy: measurements.some(m => m.accuracy !== undefined)
                ? (sum.accuracy || 0) / measurements.filter(m => m.accuracy !== undefined).length
                : undefined
        };
    }

    static clearMeasurements(): void {
        this.measurements.clear();
        performance.clearMarks();
        performance.clearMeasures();
    }
} 