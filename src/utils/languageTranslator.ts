import { Language } from '@/types/news';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
];

export function translateText(textOrObj: any, lang: Language): string {
  if (!textOrObj) return '';
  
  if (typeof textOrObj === 'object') {
    let res = textOrObj[lang] ?? textOrObj['hi'] ?? textOrObj['en'] ?? Object.values(textOrObj)[0];
    if (res && typeof res === 'object') {
      return translateText(res, lang);
    }
    if (typeof res === 'string') {
      return res;
    }
    return '';
  }

  return String(textOrObj);
}
