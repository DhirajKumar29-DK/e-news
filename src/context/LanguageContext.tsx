'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Edition } from '@/types/news';
import { translateText, SUPPORTED_LANGUAGES, LanguageOption } from '@/utils/languageTranslator';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  edition: Edition;
  setEdition: (edition: Edition) => void;
  toggleLanguage: () => void;
  t: (str: any) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [edition, setEditionState] = useState<Edition>('national');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState('en');
    localStorage.setItem('e_news_lang', 'en');
  };

  const toggleLanguage = () => {
    setLanguage('en');
  };

  const setEdition = (ed: Edition) => {
    setEditionState(ed);
    localStorage.setItem('e_news_edition', ed);
  };

  const t = (str: any): string => {
    if (!str) return '';
    if (typeof str === 'string') return str;
    if (typeof str === 'object') {
      return str.en || Object.values(str)[0] || '';
    }
    return String(str);
  };

  return (
    <LanguageContext.Provider value={{
      language: 'en',
      setLanguage,
      edition,
      setEdition,
      toggleLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES
    }}>
      <div className="lang-en">
        {children}
      </div>
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
