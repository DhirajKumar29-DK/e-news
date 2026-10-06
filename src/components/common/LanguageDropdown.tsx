'use client';

import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/types/news';
import { Check, Globe } from 'lucide-react';

interface LanguageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ isOpen, onClose, align = 'right' }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} z-50 w-52 sm:w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2.5 animate-in fade-in zoom-in-95 duration-150`}
    >
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Globe className="w-3.5 h-3.5 text-jagran-red" />
          <span>Select Language</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">2 Languages</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {supportedLanguages.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                isSelected
                  ? 'bg-red-50 dark:bg-red-950/40 border border-jagran-red text-jagran-red font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 overflow-hidden">
                <span className="text-sm shrink-0">{lang.flag}</span>
                <span className="truncate">{lang.nativeName}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-jagran-red shrink-0 stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
