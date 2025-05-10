import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY = 'test-key';
process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION = 'test-region';

// Create a more comprehensive mock of the Speech SDK
jest.mock('microsoft-cognitiveservices-speech-sdk', () => {
    const ResultReason = {
        NoMatch: 0,
        Canceled: 1,
        RecognizingSpeech: 2,
        RecognizedSpeech: 3,
        TranslatingSpeech: 4,
        TranslatedSpeech: 5,
        SynthesizingAudio: 6,
        SynthesizingAudioCompleted: 7,
        RecognizingIntent: 8,
        RecognizedIntent: 9,
        TranslatingVoice: 10,
        TranslatedVoice: 11,
        SynthesizingVoice: 12,
        SynthesizingVoiceCompleted: 13
    };

    class Translations {
        private privMap: Map<string, string>;
        public languages: string[];

        constructor(translations: [string, string][]) {
            this.privMap = new Map(translations);
            this.languages = Array.from(this.privMap.keys());
        }

        get(lang: string): string | undefined {
            return this.privMap.get(lang);
        }
    }

    class MockAudioConfig {
        constructor() { }
    }

    class MockTranslationRecognizer {
        constructor(config, audioConfig) {
            this.config = config;
            this.audioConfig = audioConfig;
            this.recognizing = () => { };
            this.recognized = () => { };
        }

        recognizeOnceAsync(callback, errorCallback) {
            setTimeout(() => {
                callback({
                    text: "Hello, how are you today?",
                    translations: new Translations([
                        ['es-ES', '¿Hola, cómo estás hoy?'],
                        ['fr-FR', 'Bonjour, comment allez-vous aujourd\'hui?']
                    ]),
                    reason: ResultReason.TranslatedSpeech,
                    duration: 500,
                    offset: 0,
                    errorDetails: '',
                    resultId: 'mock-result-id',
                    speakerId: '',
                    privResultId: 'mock-result-id',
                    privSpeakerId: '',
                    privTranslations: null
                });
            }, 100);
        }

        startContinuousRecognitionAsync(callback, errorCallback) {
            setTimeout(() => {
                callback();
                // Simulate continuous recognition events
                setInterval(() => {
                    this.recognized(null, {
                        result: {
                            text: "This is a test sentence",
                            translations: new Translations([['es-ES', 'Esta es una frase de prueba']]),
                            reason: ResultReason.TranslatedSpeech,
                            duration: 500,
                            offset: 0,
                            errorDetails: '',
                            resultId: 'mock-continuous-id',
                            speakerId: '',
                            privResultId: 'mock-continuous-id',
                            privSpeakerId: '',
                            privTranslations: null
                        }
                    });
                }, 1000);
            }, 100);
        }

        stopContinuousRecognitionAsync(callback, errorCallback) {
            setTimeout(callback, 100);
        }

        close() { }
    }

    return {
        AudioConfig: {
            fromDefaultMicrophoneInput: () => new MockAudioConfig(),
            fromWavFileInput: () => new MockAudioConfig()
        },
        SpeechTranslationConfig: {
            fromSubscription: (key, region) => ({
                speechRecognitionLanguage: '',
                addTargetLanguage: (lang) => { }
            })
        },
        TranslationRecognizer: MockTranslationRecognizer,
        ResultReason,
        Translations
    };
}); 