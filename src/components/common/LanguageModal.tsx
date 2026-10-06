'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/types/news';
import { Globe, X, Check } from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-jagran-red text-white rounded-xl shadow">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                Choose Language
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your preferred regional language to read news
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-950/40 border-jagran-red text-jagran-red shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="font-extrabold text-xs">{lang.nativeName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                    {lang.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-jagran-red text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
