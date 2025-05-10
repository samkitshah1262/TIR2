import { PerformanceMetrics } from '../utils/performanceMetrics';

describe('PerformanceMetrics', () => {
    beforeEach(() => {
        PerformanceMetrics.clearMeasurements();
    });

    test('calculates Word Error Rate (WER) correctly', () => {
        const testId = 'wer-test';
        PerformanceMetrics.startMeasurement(testId);

        // Perfect match
        let metrics = PerformanceMetrics.endMeasurement(
            testId,
            'Hello world',
            'Hola mundo',
            'Hola mundo'
        );
        expect(metrics.accuracy).toBe(0);

        // One word different
        metrics = PerformanceMetrics.endMeasurement(
            testId,
            'Hello world',
            'Hola earth',
            'Hola mundo'
        );
        expect(metrics.accuracy).toBeGreaterThan(0);

        // Completely different
        metrics = PerformanceMetrics.endMeasurement(
            testId,
            'Hello world',
            'Goodbye universe',
            'Hola mundo'
        );
        expect(metrics.accuracy).toBe(1);
    });

    test('tracks memory usage', () => {
        const testId = 'memory-test';
        PerformanceMetrics.startMeasurement(testId);

        const metrics = PerformanceMetrics.endMeasurement(
            testId,
            'Hello',
            'Hola',
            'Hola'
        );

        expect(metrics.memoryUsage).toBeDefined();
        expect(metrics.memoryUsage.heapUsed).toBeGreaterThan(0);
        expect(metrics.memoryUsage.heapTotal).toBeGreaterThan(0);
        expect(metrics.memoryUsage.external).toBeGreaterThanOrEqual(0);
        expect(metrics.memoryUsage.rss).toBeGreaterThan(0);
    });

    test('calculates average metrics correctly', () => {
        const testId = 'average-test';

        // First measurement
        PerformanceMetrics.startMeasurement(testId);
        PerformanceMetrics.endMeasurement(
            testId,
            'Hello',
            'Hola',
            'Hola'
        );

        // Second measurement
        PerformanceMetrics.startMeasurement(testId);
        PerformanceMetrics.endMeasurement(
            testId,
            'World',
            'Mundo',
            'Mundo'
        );

        const averageMetrics = PerformanceMetrics.getAverageMetrics(testId);

        expect(averageMetrics).toBeDefined();
        expect(averageMetrics?.accuracy).toBe(0); // Both translations were perfect
    });

    test('clears measurements correctly', () => {
        const testId = 'clear-test';

        PerformanceMetrics.startMeasurement(testId);
        PerformanceMetrics.endMeasurement(
            testId,
            'Hello',
            'Hola',
            'Hola'
        );

        PerformanceMetrics.clearMeasurements();

        const averageMetrics = PerformanceMetrics.getAverageMetrics(testId);
        expect(averageMetrics).toBeNull();
    });
}); 