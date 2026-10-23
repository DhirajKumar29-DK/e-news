'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Language, Edition } from '@/types/news';
import { SUPPORTED_LANGUAGES, LanguageOption } from '@/utils/languageTranslator';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  edition: Edition;
  setEdition: (edition: Edition) => void;
  toggleLanguage: () => void;
  isTranslating: boolean;
  t: (str: any) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('hi');
  const [edition, setEditionState] = useState<Edition>('national');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const pathname = usePathname();
  const scriptLoadedRef = useRef(false);

  // Initialize language from localStorage or cookies on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vartiq_lang') as Language | null;
      const cookies = document.cookie;
      if (saved === 'en' || saved === 'hi') {
        setLanguageState(saved);
      } else if (cookies.includes('googtrans=/auto/en')) {
        setLanguageState('en');
      } else {
        setLanguageState('hi');
      }
    } catch {
      // ignore
    }
  }, []);

  // Actively remove any injected Google Translate top banners and reset body top offset
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const killBanner = () => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
        document.documentElement.style.top = '0px';
      }
      const bannerIframes = document.querySelectorAll<HTMLElement>(
        'iframe.skiptranslate, iframe.goog-te-banner-frame, iframe[id*=":container"], [class*="VIpgJd-ZVi9od"]'
      );
      bannerIframes.forEach((el) => {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      });
    };

    killBanner();
    const observer = new MutationObserver(killBanner);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'], childList: true });

    return () => observer.disconnect();
  }, []);

  // Setup Google Translate hidden element and script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'auto',
              includedLanguages: 'hi,en',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      } catch (err) {
        console.warn('Google Translate initialization note:', err);
      }
    };

    if (!scriptLoadedRef.current && !document.getElementById('vartiq-google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'vartiq-google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
      scriptLoadedRef.current = true;
    }
  }, []);

  // Sync translation across client-side page route transitions
  useEffect(() => {
    if (language === 'en') {
      const timer = setTimeout(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select && select.value !== 'en') {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, language]);

  const setCookiesForLanguage = (targetLang: Language) => {
    try {
      const host = window.location.hostname;
      const cookieVal = `/auto/${targetLang}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; domain=${host}; path=/;`;

      const parts = host.split('.');
      if (parts.length > 2) {
        const rootDomain = parts.slice(-2).join('.');
        document.cookie = `googtrans=${cookieVal}; domain=.${rootDomain}; path=/;`;
      }
    } catch {
      // ignore
    }
  };

  const setLanguage = (targetLang: Language) => {
    if (targetLang === language) return;
    setIsTranslating(true);
    setLanguageState(targetLang);

    try {
      localStorage.setItem('vartiq_lang', targetLang);
      setCookiesForLanguage(targetLang);

      const triggerCombo = () => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = targetLang;
          select.dispatchEvent(new Event('change'));
          setTimeout(() => setIsTranslating(false), 500);
          return true;
        }
        return false;
      };

      if (!triggerCombo()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (triggerCombo() || attempts > 7) {
            clearInterval(interval);
            setIsTranslating(false);
          }
        }, 200);
      }
    } catch {
      setIsTranslating(false);
    }
  };

  const toggleLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    setLanguage(next);
  };

  const setEdition = (ed: Edition) => {
    setEditionState(ed);
    try {
      localStorage.setItem('e_news_edition', ed);
    } catch {
      // ignore
    }
  };

  const t = (str: any): string => {
    if (!str) return '';
    if (typeof str === 'string') return str;
    if (typeof str === 'object') {
      return str[language] || str.hi || str.en || Object.values(str)[0] || '';
    }
    return String(str);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      edition,
      setEdition,
      toggleLanguage,
      isTranslating,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES
    }}>
      <div className={language === 'hi' ? 'lang-hi' : 'lang-en'}>
        {/* Invisible Google Translate Mount Element */}
        <div id="google_translate_element" aria-hidden="true" />
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
