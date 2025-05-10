'use client';

import { useState, useEffect } from 'react';
import TranslationPanel from './components/TranslationPanel';
import LanguageSelector, { SUPPORTED_LANGUAGES } from './components/LanguageSelector';

export default function Home() {
    const [sourceLanguage, setSourceLanguage] = useState(SUPPORTED_LANGUAGES[0]);
    const [targetLanguage, setTargetLanguage] = useState(SUPPORTED_LANGUAGES[1]);
    const [apiKey, setApiKey] = useState('');
    const [region, setRegion] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);

    // Check if source and target are different
    useEffect(() => {
        if (sourceLanguage.code === targetLanguage.code) {
            const nextLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code !== sourceLanguage.code)
                || SUPPORTED_LANGUAGES[1];
            setTargetLanguage(nextLanguage);
        }
    }, [sourceLanguage, targetLanguage]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setConfigError(null);

        // Basic validation
        if (!apiKey || !region) {
            setConfigError("API Key and Region are required");
            setIsLoading(false);
            return;
        }

        // Simulate API validation
        try {
            console.log(`Configuring with: apiKey=${apiKey.substring(0, 3)}... region=${region}`);

            // Just checking if we have the required fields
            if (apiKey.length < 10) {
                setConfigError("API Key seems too short. Please verify.");
                setIsLoading(false);
                return;
            }

            // Everything looks good
            setIsConfigured(true);
            setIsLoading(false);
        } catch (err) {
            console.error("Configuration error:", err);
            setConfigError("Error configuring translation service");
            setIsLoading(false);
        }
    };

    if (!isConfigured) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="card">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Real-time Speech Translator Setup
                    </h1>

                    {configError && (
                        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg">
                            {configError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                                Azure Cognitive Services API Key
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Get this from your Azure Cognitive Services resource
                            </p>
                        </div>

                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                                Azure Region
                            </label>
                            <input
                                type="text"
                                id="region"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g., eastus"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                The region where your Speech service is deployed (e.g., eastus, westeurope)
                            </p>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Language Settings
                            </label>
                            <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full flex justify-center items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Configuring...' : 'Start Translation'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Real-time Speech Translator
            </h1>

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-center gap-8">
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

                <TranslationPanel
                    sourceLanguage={sourceLanguage.code}
                    targetLanguage={targetLanguage.code}
                    apiKey={apiKey}
                    region={region}
                />

                <div className="text-center">
                    <button
                        onClick={() => setIsConfigured(false)}
                        className="text-primary hover:underline"
                    >
                        Change Settings
                    </button>
                </div>
            </div>
        </div>
    );
} 