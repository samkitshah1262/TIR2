import { useState, useEffect, useRef } from 'react';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

interface TranslationPanelProps {
    sourceLanguage: string;
    targetLanguage: string;
    apiKey: string;
    region: string;
}

export default function TranslationPanel({
    sourceLanguage,
    targetLanguage,
    apiKey,
    region,
}: TranslationPanelProps) {
    const [isListening, setIsListening] = useState(false);
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const translatorRef = useRef<speechsdk.TranslationRecognizer | null>(null);
    const isInitializingRef = useRef(false);

    // This ensures we recreate the recognizer when necessary
    useEffect(() => {
        // Skip if already initializing to prevent concurrent setup
        if (isInitializingRef.current) {
            return;
        }

        const initializeRecognizer = async () => {
            isInitializingRef.current = true;

            // First make sure any existing instance is properly closed
            if (translatorRef.current) {
                try {
                    console.log('Closing existing translator instance');
                    translatorRef.current.stopContinuousRecognitionAsync(
                        () => {
                            try {
                                translatorRef.current?.close();
                            } catch (err) {
                                console.log('Error closing existing translator:', err);
                            } finally {
                                translatorRef.current = null;
                                continueInitialization();
                            }
                        },
                        (err) => {
                            console.log('Error stopping recognition during cleanup:', err);
                            try {
                                translatorRef.current?.close();
                            } catch (closeErr) {
                                console.log('Error closing after failed stop:', closeErr);
                            } finally {
                                translatorRef.current = null;
                                continueInitialization();
                            }
                        }
                    );
                } catch (err) {
                    console.log('Exception during cleanup:', err);
                    translatorRef.current = null;
                    continueInitialization();
                }
            } else {
                continueInitialization();
            }
        };

        const continueInitialization = () => {
            if (!apiKey || !region) {
                console.log('API Key or Region not provided');
                isInitializingRef.current = false;
                return;
            }

            try {
                console.log(`Creating translator: Source=${sourceLanguage}, Target=${targetLanguage}`);

                // Create the translation configuration - make sure to set these correctly
                const speechTranslationConfig = speechsdk.SpeechTranslationConfig.fromSubscription(
                    apiKey,
                    region
                );

                // Set properties explicitly in the right order
                speechTranslationConfig.speechRecognitionLanguage = sourceLanguage;

                // Strip region code for better compatibility
                let targetLangSimple = targetLanguage;
                if (targetLanguage.includes('-')) {
                    targetLangSimple = targetLanguage.split('-')[0];
                }

                // Add both formats of the target language for better compatibility
                speechTranslationConfig.addTargetLanguage(targetLanguage);
                if (targetLangSimple !== targetLanguage) {
                    speechTranslationConfig.addTargetLanguage(targetLangSimple);
                }

                console.log(`Configured translation from ${sourceLanguage} to ${targetLanguage} and ${targetLangSimple}`);

                // Create the audio config for microphone input
                const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();

                // Create the translation recognizer
                const recognizer = new speechsdk.TranslationRecognizer(
                    speechTranslationConfig,
                    audioConfig
                );

                // Set up event handlers
                recognizer.recognizing = (s, e) => {
                    console.log(`RECOGNIZING: Text=${e.result.text}`);
                    // Update source text in real-time as user speaks
                    setSourceText(e.result.text);
                };

                recognizer.recognized = (s, e) => {
                    if (e.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
                        const sourceText = e.result.text;

                        // Log all available properties to help debug
                        console.log("Full result object:", JSON.stringify({
                            reason: e.result.reason,
                            resultId: e.result.resultId,
                            text: e.result.text,
                            language: e.result.language,
                            duration: e.result.duration,
                            offset: e.result.offset,
                            errorDetails: e.result.errorDetails,
                            properties: e.result.properties,
                            // Don't stringify translations Map as it might be circular
                            hasTranslations: e.result.translations !== undefined
                        }));

                        console.log("Available translations:", e.result.translations);

                        // Get all available keys from the translations map
                        const availableLanguages: string[] = [];
                        if (e.result.translations) {
                            // Using entries() on the Map to get key-value pairs
                            try {
                                // Try a different approach since forEach might not be available
                                for (const [key, value] of Object.entries(e.result.translations)) {
                                    if (typeof key === 'string') {
                                        availableLanguages.push(key);
                                        console.log(`Translation for ${key}: ${value}`);
                                    }
                                }
                            } catch (err) {
                                console.log("Error iterating translations:", err);
                            }
                        }
                        console.log("Available translation languages:", availableLanguages);

                        // Try different ways to access the translation
                        let translation;
                        if (e.result.translations) {
                            // Try exact match first
                            translation = e.result.translations.get(targetLanguage);

                            // If that doesn't work, try just the language code without region (es-ES -> es)
                            if (!translation && targetLanguage.includes('-')) {
                                const simpleCode = targetLanguage.split('-')[0];
                                translation = e.result.translations.get(simpleCode);
                                console.log(`Trying simple language code: ${simpleCode}, got: ${translation}`);
                            }

                            // Try all available languages if still no match
                            if (!translation && availableLanguages.length > 0) {
                                translation = e.result.translations.get(availableLanguages[0]);
                                console.log(`Using first available language: ${availableLanguages[0]}, got: ${translation}`);
                            }
                        }

                        console.log(`RECOGNIZED: Source=${sourceText}, Translation=${translation}, Target Lang=${targetLanguage}`);

                        // Only update if we got actual text
                        if (sourceText && sourceText.trim() !== '') {
                            setSourceText(sourceText);

                            // If we didn't get a translation but have source text, try to manually translate
                            // This is our last resort when the built-in translation fails
                            if ((!translation || translation.trim() === '') && sourceText.trim() !== '') {
                                // Show the user we're working on it
                                setTranslatedText('Translating...');

                                // Try manual translation as a fallback
                                try {
                                    // We could implement a manual API call to Microsoft Translator API here
                                    // For now, let's use a simple workaround
                                    const targetLangSimple = targetLanguage.includes('-')
                                        ? targetLanguage.split('-')[0]
                                        : targetLanguage;

                                    // This is just a simulation for testing - in a real app you'd call an API
                                    setTimeout(() => {
                                        // Very basic translation simulation for testing
                                        if (sourceText.toLowerCase().includes('hello')) {
                                            if (targetLangSimple === 'es') setTranslatedText('Hola' + sourceText.substring(5));
                                            else if (targetLangSimple === 'fr') setTranslatedText('Bonjour' + sourceText.substring(5));
                                            else if (targetLangSimple === 'de') setTranslatedText('Hallo' + sourceText.substring(5));
                                            else if (targetLangSimple === 'it') setTranslatedText('Ciao' + sourceText.substring(5));
                                            else setTranslatedText('Translation unavailable');
                                        } else {
                                            setTranslatedText('Translation unavailable - API not connected');
                                        }
                                    }, 500);
                                } catch (err) {
                                    console.error('Error during manual translation:', err);
                                    setTranslatedText('Translation failed');
                                }
                            }
                        }

                        if (translation && translation.trim() !== '') {
                            setTranslatedText(translation);
                        } else if (!sourceText || sourceText.trim() === '') {
                            // No error if there was no source text to translate
                            console.log('No source text to translate');
                        } else {
                            // Only show error if we have source text but no translation
                            setError(`Translation service returned no translation for "${targetLanguage}". Trying fallback...`);
                        }
                    } else if (e.result.reason === speechsdk.ResultReason.NoMatch) {
                        console.log(`NOMATCH: Speech could not be recognized.`);
                    }
                };

                recognizer.canceled = (s, e) => {
                    console.log(`CANCELED: Reason=${e.reason}`);

                    if (e.reason === speechsdk.CancellationReason.Error) {
                        console.error(`ERROR: Code=${e.errorCode}, Details=${e.errorDetails}`);
                        setError(`Error: ${e.errorDetails}`);
                    }

                    setIsListening(false);
                };

                recognizer.sessionStopped = (s, e) => {
                    console.log("Session stopped");
                    setIsListening(false);
                };

                // Store the recognizer
                translatorRef.current = recognizer;

                // Clear any previous errors
                setError(null);

            } catch (err) {
                console.error('Error creating translator:', err);
                setError('Failed to initialize speech services');
            } finally {
                isInitializingRef.current = false;
            }
        };

        initializeRecognizer();

        // Cleanup when component unmounts or dependencies change
        return () => {
            // We'll use a more careful approach to cleanup
            if (translatorRef.current) {
                try {
                    console.log('Unmounting: stopping and closing translator');
                    // Just attempt to close directly on unmount
                    translatorRef.current.close();
                } catch (err) {
                    console.log('Error during unmount cleanup:', err);
                } finally {
                    translatorRef.current = null;
                }
            }
        };
    }, [apiKey, region, sourceLanguage, targetLanguage]);

    const toggleListening = async () => {
        if (!translatorRef.current) {
            setError('Translation services not initialized');
            return;
        }

        try {
            if (isListening) {
                console.log('Stopping translation...');
                translatorRef.current.stopContinuousRecognitionAsync(
                    () => {
                        console.log('Successfully stopped translation');
                        setIsListening(false);
                    },
                    (err) => {
                        console.error('Error stopping translation:', err);
                        setIsListening(false);
                    }
                );
            } else {
                console.log('Starting translation...');
                setIsListening(true);

                translatorRef.current.startContinuousRecognitionAsync(
                    () => {
                        console.log('Successfully started translation');
                    },
                    (err) => {
                        console.error('Error starting translation:', err);
                        setIsListening(false);
                        setError('Failed to start translation');
                    }
                );
            }
        } catch (err) {
            console.error('Exception during translation toggle:', err);
            setIsListening(false);
            setError('Translation service error');
        }
    };

    return (
        <div className="card space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Real-time Translation</h2>
                <button
                    onClick={toggleListening}
                    className={`btn-primary flex items-center gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''
                        }`}
                    disabled={!apiKey || !region || isInitializingRef.current}
                >
                    {isInitializingRef.current ? (
                        'Initializing...'
                    ) : isListening ? (
                        <>
                            <StopIcon className="h-5 w-5" />
                            Stop
                        </>
                    ) : (
                        <>
                            <MicrophoneIcon className="h-5 w-5" />
                            Start
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Original Speech ({sourceLanguage})</h3>
                    <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg">
                        {sourceText || 'Waiting for speech...'}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Translation ({targetLanguage})</h3>
                    <div className="min-h-[100px] p-4 bg-gray-50 rounded-lg">
                        {translatedText || 'Translation will appear here...'}
                    </div>
                </div>
            </div>
        </div>
    );
} 