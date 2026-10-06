import { Language } from '@/types/news';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
];

export function translateText(textOrObj: any, lang: Language): string {
  if (!textOrObj) return '';
  
  if (typeof textOrObj === 'object') {
    let res = textOrObj['en'] ?? textOrObj[lang] ?? Object.values(textOrObj)[0];
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
