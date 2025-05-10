import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export const SUPPORTED_LANGUAGES = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ar-SA', name: 'Arabic' },
];

interface LanguageSelectorProps {
    selected: { code: string; name: string };
    onChange: (language: { code: string; name: string }) => void;
    label: string;
}

export default function LanguageSelector({ selected, onChange, label }: LanguageSelectorProps) {
    return (
        <div className="w-72">
            <Listbox value={selected} onChange={onChange}>
                {({ open }) => (
                    <div className="relative">
                        <Listbox.Label className="block text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-3">
                            {label}
                        </Listbox.Label>
                        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-900/50 py-4 pl-4 pr-10 text-left border border-gray-700/50 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-lg hover:bg-gray-800/50 transition-all duration-300">
                            <span className="block truncate text-gray-200 font-medium">{selected.name}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronUpDownIcon
                                    className={`h-5 w-5 text-blue-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                            </span>
                        </Listbox.Button>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => { }}
                        >
                            <Listbox.Options className="absolute z-[60] mt-2 w-full overflow-auto rounded-xl bg-gray-900/95 py-2 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-700/50 backdrop-blur-sm max-h-[240px]">
                                {SUPPORTED_LANGUAGES.map((language) => (
                                    <Listbox.Option
                                        key={language.code}
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-3 pl-10 pr-4 ${active ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300'
                                            } hover:bg-blue-500/10 transition-all duration-200`
                                        }
                                        value={language}
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                    {language.name}
                                                </span>
                                                {selected ? (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                )}
            </Listbox>
        </div>
    );
} 