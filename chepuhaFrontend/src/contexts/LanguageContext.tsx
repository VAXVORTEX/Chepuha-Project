import React, { createContext, useContext, useState, useEffect } from 'react';
import { DICTIONARY, Language, TranslationKey } from '../config/i18n';
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('uk');
    useEffect(() => {
        const saved = localStorage.getItem('chepuha_lang') as Language;
        if (saved && (saved === 'uk' || saved === 'en')) {
            setLanguageState(saved);
        }
    }, []);
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('chepuha_lang', lang);
    };
    const t = (key: TranslationKey): string => {
        return DICTIONARY[language][key] || key;
    };
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};