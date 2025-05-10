import { useState, useEffect, useRef } from 'react';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

interface TranslationPanelProps {
    sourceLanguage: string;
    targetLanguage: string;
}

export default function TranslationPanel({
    sourceLanguage,
    targetLanguage,
}: TranslationPanelProps) {
    const [isListening, setIsListening] = useState(false);
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const translatorRef = useRef<speechsdk.TranslationRecognizer | null>(null);

    const cleanupTranslator = async () => {
        if (translatorRef.current) {
            try {
                console.log('Cleaning up existing translator...');
                await new Promise<void>((resolve, reject) => {
                    translatorRef.current?.stopContinuousRecognitionAsync(
                        () => {
                            translatorRef.current?.close();
                            translatorRef.current = null;
                            resolve();
                        },
                        (err) => {
                            console.error('Error stopping recognition:', err);
                            reject(err);
                        }
                    );
                });
            } catch (err) {
                console.error('Error during cleanup:', err);
            } finally {
                translatorRef.current = null;
            }
        }
    };

    const initializeTranslator = async () => {
        setIsInitializing(true);
        setError(null);

        try {
            await cleanupTranslator();

            const apiKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
            const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

            console.log('Initializing translator with:', {
                sourceLanguage,
                targetLanguage,
                hasApiKey: !!apiKey,
                hasRegion: !!region
            });

            if (!apiKey || !region) {
                throw new Error('Translation service configuration error. Please check environment variables.');
            }

            const speechTranslationConfig = speechsdk.SpeechTranslationConfig.fromSubscription(
                apiKey,
                region
            );

            // Configure speech recognition language (e.g., 'en-US' for English)
            const speechLanguage = sourceLanguage.split('-')[0] + '-' + sourceLanguage.split('-')[1].toUpperCase();
            speechTranslationConfig.speechRecognitionLanguage = speechLanguage;

            // Configure target language (e.g., 'es' for Spanish)
            const translationLanguage = targetLanguage.split('-')[0];
            speechTranslationConfig.addTargetLanguage(translationLanguage);

            console.log('Translation configuration:', {
                speechRecognitionLanguage: speechTranslationConfig.speechRecognitionLanguage,
                targetLanguages: speechTranslationConfig.targetLanguages,
                sourceLanguageConfig: speechLanguage,
                targetLanguageConfig: translationLanguage
            });

            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new speechsdk.TranslationRecognizer(
                speechTranslationConfig,
                audioConfig
            );

            recognizer.recognizing = (s, e) => {
                console.log('Recognizing:', {
                    text: e.result.text,
                    language: speechLanguage,
                    offset: e.result.offset,
                    duration: e.result.duration
                });
                setSourceText(e.result.text);
            };

            recognizer.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
                    // Use the short language code for getting the translation
                    const translation = e.result.translations.get(translationLanguage);
                    console.log('Translation result:', {
                        sourceText: e.result.text,
                        targetLanguage: translationLanguage,
                        translation,
                        hasTranslations: !!e.result.translations,
                        reason: speechsdk.ResultReason[e.result.reason]
                    });

                    if (translation) {
                        setTranslatedText(translation);
                    } else {
                        console.warn('Translation unavailable:', {
                            targetLanguage: translationLanguage,
                            configuredLanguage: translationLanguage,
                            resultReason: speechsdk.ResultReason[e.result.reason]
                        });
                    }
                } else {
                    console.warn('Recognition completed but not translated:', {
                        reason: speechsdk.ResultReason[e.result.reason],
                        text: e.result.text,
                        offset: e.result.offset,
                        duration: e.result.duration
                    });
                }
            };

            recognizer.canceled = (s, e) => {
                console.error('Translation canceled:', {
                    reason: speechsdk.CancellationReason[e.reason],
                    errorDetails: e.errorDetails
                });
                if (e.reason === speechsdk.CancellationReason.Error) {
                    setError(`Error: ${e.errorDetails}`);
                }
                setIsListening(false);
            };

            translatorRef.current = recognizer;
            return true;
        } catch (err) {
            console.error('Error initializing translator:', err);
            setError(err instanceof Error ? err.message : 'Failed to initialize translation service');
            return false;
        } finally {
            setIsInitializing(false);
        }
    };

    const startTranslation = async () => {
        if (!translatorRef.current) {
            const initialized = await initializeTranslator();
            if (!initialized) return;
        }

        try {
            console.log('Starting translation...');
            translatorRef.current?.startContinuousRecognitionAsync(
                () => {
                    console.log('Translation started successfully');
                    setIsListening(true);
                    setError(null);
                },
                (err) => {
                    console.error('Error starting translation:', err);
                    setError('Failed to start translation');
                    setIsListening(false);
                }
            );
        } catch (err) {
            console.error('Error in startTranslation:', err);
            setError('Failed to start translation');
            setIsListening(false);
        }
    };

    const stopTranslation = async () => {
        try {
            console.log('Stopping translation...');
            translatorRef.current?.stopContinuousRecognitionAsync(
                () => {
                    console.log('Translation stopped successfully');
                    setIsListening(false);
                },
                (err) => {
                    console.error('Error stopping translation:', err);
                    setIsListening(false);
                }
            );
        } catch (err) {
            console.error('Error in stopTranslation:', err);
            setIsListening(false);
        }
    };

    // Cleanup on unmount or language change
    useEffect(() => {
        return () => {
            cleanupTranslator();
        };
    }, [sourceLanguage, targetLanguage]);

    return (
        <div className="card backdrop-blur-md relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                    Real-time Translation
                </h2>
                <button
                    onClick={isListening ? stopTranslation : startTranslation}
                    disabled={isInitializing}
                    className={`group w-full md:w-auto px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-lg ${isListening
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20'
                        : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-blue-500/20'
                        } ${isListening ? 'animate-pulse' : ''}`}
                >
                    {isInitializing ? (
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                            <span className="font-medium">Initializing...</span>
                        </div>
                    ) : isListening ? (
                        <>
                            <StopIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                            <span className="font-medium">Stop Translation</span>
                        </>
                    ) : (
                        <>
                            <MicrophoneIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                            <span className="font-medium">Start Translation</span>
                        </>
                    )}
                </button>
            </div>

            <div className="relative z-[100] mb-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="w-full md:w-auto relative">
                        {/* Source language dropdown */}
                    </div>
                    <div className="w-full md:w-auto relative">
                        {/* Target language dropdown */}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-6 mb-8 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl animate-fade-in relative z-[1]">
                    <p className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-[1]">
                <div className="space-y-4">
                    <h3 className="font-medium text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Original Speech ({sourceLanguage})
                    </h3>
                    <div className={`group min-h-[200px] p-6 bg-gray-900/50 rounded-xl border border-gray-700/50 transition-all duration-300 ${isListening ? 'shadow-lg shadow-blue-500/20 border-blue-500/30' : ''}`}>
                        <p className="text-gray-300 text-lg">
                            {sourceText || (
                                <span className={`text-gray-500 ${isListening ? 'animate-pulse' : ''}`}>
                                    {isListening ? 'Listening...' : 'Waiting for speech...'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Translation ({targetLanguage})
                    </h3>
                    <div className={`group min-h-[200px] p-6 bg-gray-900/50 rounded-xl border border-gray-700/50 transition-all duration-300 ${translatedText ? 'shadow-lg shadow-purple-500/20 border-purple-500/30' : ''}`}>
                        <p className="text-gray-300 text-lg">
                            {translatedText || (
                                <span className="text-gray-500">
                                    Translation will appear here...
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 