'use client';

import { useState, useEffect } from 'react';
import TranslationPanel from './components/TranslationPanel';
import LanguageSelector, { SUPPORTED_LANGUAGES } from './components/LanguageSelector';

export default function Home() {
    const [sourceLanguage, setSourceLanguage] = useState(SUPPORTED_LANGUAGES.find(lang => lang.code === 'en-US') || SUPPORTED_LANGUAGES[0]);
    const [targetLanguage, setTargetLanguage] = useState(SUPPORTED_LANGUAGES.find(lang => lang.code === 'es-ES') || SUPPORTED_LANGUAGES[1]);

    // Check if source and target are different
    useEffect(() => {
        if (sourceLanguage.code === targetLanguage.code) {
            const nextLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code !== sourceLanguage.code)
                || SUPPORTED_LANGUAGES[1];
            setTargetLanguage(nextLanguage);
        }
    }, [sourceLanguage, targetLanguage]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                        Real-time Speech Translator
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Break language barriers with instant voice translation. Speak in your language, hear in theirs.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row justify-center gap-8 items-center bg-gray-800/30 p-8 rounded-2xl backdrop-blur-sm border border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative z-50">
                        <LanguageSelector
                            selected={sourceLanguage}
                            onChange={setSourceLanguage}
                            label="Source Language"
                        />
                        <LanguageSelector
                            selected={targetLanguage}
                            onChange={setTargetLanguage}
                            label="Target Language"
                        />
                    </div>

                    <div className="relative z-40">
                        <TranslationPanel
                            sourceLanguage={sourceLanguage.code}
                            targetLanguage={targetLanguage.code}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 