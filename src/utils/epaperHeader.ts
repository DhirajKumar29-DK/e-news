import { EPaperHeaderConfig } from '@/types/epaper';

export interface HeaderMetrics extends Required<EPaperHeaderConfig> {
  totalTopOffset: number;
}

export const HEADER_COLOR_PALETTES = {
  text: [
    { label: 'क्लासिक रेड (Classic Red)', value: '#c51c24' },
    { label: 'गहरा लाल (Crimson)', value: '#991b1b' },
    { label: 'रॉयल ब्लू (Royal Blue)', value: '#1d4ed8' },
    { label: 'नेवी ब्लू (Navy)', value: '#1e3a8a' },
    { label: 'जेट ब्लैक (Jet Black)', value: '#0f172a' },
    { label: 'स्लेट ग्रे (Slate Gray)', value: '#475569' },
    { label: 'एमराल्ड ग्रीन (Emerald)', value: '#047857' },
    { label: 'अंबर गोल्ड (Amber Gold)', value: '#b45309' },
    { label: 'पर्पल (Purple)', value: '#7e22ce' }
  ],
  background: [
    { label: 'प्योर व्हाइट (Pure White)', value: '#ffffff' },
    { label: 'अखबार क्रीम (Warm Cream)', value: '#fdfbf7' },
    { label: 'हल्का स्लेट (Soft Slate)', value: '#f8fafc' },
    { label: 'विंटेज पेपर (Vintage Paper)', value: '#faf8f5' },
    { label: 'डार्क स्लेट (Dark Broad)', value: '#0f172a' }
  ],
  border: [
    { label: 'सिग्नेचर रेड (Signature Red)', value: '#c51c24' },
    { label: 'क्लासिक ब्लैक (Classic Black)', value: '#0f172a' },
    { label: 'रॉयल ब्लू (Royal Blue)', value: '#1d4ed8' },
    { label: 'गोल्डन अंबर (Golden Amber)', value: '#b45309' },
    { label: 'एमराल्ड ग्रीन (Emerald)', value: '#047857' },
    { label: 'सिल्वर स्लेट (Silver Slate)', value: '#94a3b8' }
  ]
};

export const HEADER_PRESETS = [
  {
    id: 'city',
    name: 'अपना [शहर] (City News)',
    desc: 'पेज 2 मुख्य शहर संस्करण',
    badge: '🔴 सिटी',
    config: {
      headerType: 'section' as const,
      titlePrefix: 'अपना',
      titleMain: 'पटना',
      titleColorPrefix: '#475569',
      titleColorMain: '#c51c24',
      titleFontSize: 38,
      bgColor: '#ffffff',
      borderColor: '#c51c24',
      borderWidth: 2.5,
      borderStyle: 'single' as const,
      height: 56,
      bottomMargin: 18,
      pageBadgeBg: '#1e293b',
      pageBadgeColor: '#ffffff'
    }
  },
  {
    id: 'sports',
    name: 'खेल जगत (Sports)',
    desc: 'स्पोर्ट्स व क्रिकेट विशेष',
    badge: '🔵 खेल',
    config: {
      headerType: 'section' as const,
      titlePrefix: 'विशेष',
      titleMain: 'खेल जगत',
      titleColorPrefix: '#1e3a8a',
      titleColorMain: '#1d4ed8',
      titleFontSize: 38,
      bgColor: '#ffffff',
      borderColor: '#1d4ed8',
      borderWidth: 2.5,
      borderStyle: 'single' as const,
      height: 56,
      bottomMargin: 18,
      pageBadgeBg: '#1e3a8a',
      pageBadgeColor: '#ffffff'
    }
  },
  {
    id: 'national',
    name: 'देश-विदेश (National / World)',
    desc: 'राष्ट्रीय व अंतर्राष्ट्रीय समाचार',
    badge: '⚫ देश-विदेश',
    config: {
      headerType: 'section' as const,
      titlePrefix: 'राष्ट्रीय',
      titleMain: 'देश विदेश',
      titleColorPrefix: '#334155',
      titleColorMain: '#0f172a',
      titleFontSize: 38,
      bgColor: '#ffffff',
      borderColor: '#0f172a',
      borderWidth: 2.5,
      borderStyle: 'single' as const,
      height: 56,
      bottomMargin: 18,
      pageBadgeBg: '#0f172a',
      pageBadgeColor: '#ffffff'
    }
  },
  {
    id: 'business',
    name: 'कारोबार & बाज़ार (Business)',
    desc: 'व्यापार, शेयर बाज़ार व अर्थव्यवस्था',
    badge: '🟢 कारोबार',
    config: {
      headerType: 'section' as const,
      titlePrefix: 'बाज़ार',
      titleMain: 'कारोबार',
      titleColorPrefix: '#065f46',
      titleColorMain: '#047857',
      titleFontSize: 38,
      bgColor: '#ffffff',
      borderColor: '#047857',
      borderWidth: 2.5,
      borderStyle: 'single' as const,
      height: 56,
      bottomMargin: 18,
      pageBadgeBg: '#065f46',
      pageBadgeColor: '#ffffff'
    }
  },
  {
    id: 'editorial',
    name: 'संपादकीय & विचार (Editorial)',
    desc: 'संपादक की पसंद, विश्लेषण व विचार',
    badge: '🟡 संपादकीय',
    config: {
      headerType: 'section' as const,
      titlePrefix: 'दैनिक',
      titleMain: 'संपादकीय',
      titleColorPrefix: '#78350f',
      titleColorMain: '#b45309',
      titleFontSize: 38,
      bgColor: '#ffffff',
      borderColor: '#b45309',
      borderWidth: 2.5,
      borderStyle: 'single' as const,
      height: 56,
      bottomMargin: 18,
      pageBadgeBg: '#78350f',
      pageBadgeColor: '#ffffff'
    }
  },
  {
    id: 'entertainment',
    name: 'मनोरंजन & सिनेमा (Entertainment)',
    desc: 'बॉलीवुड, सिनेमा व ग्लैमर',
    badge: '🟣 ग्लैमर',
    config: {
      headerType: 'section' as const,
      titlePrefix: 'ग्लैमर',
      titleMain: 'मनोरंजन',
      titleColorPrefix: '#581c87',
      titleColorMain: '#7e22ce',
      titleFontSize: 38,
      bgColor: '#ffffff',
      borderColor: '#7e22ce',
      borderWidth: 2.5,
      borderStyle: 'single' as const,
      height: 56,
      bottomMargin: 18,
      pageBadgeBg: '#581c87',
      pageBadgeColor: '#ffffff'
    }
  },
  {
    id: 'masthead',
    name: 'पेज 1 मुख्य मस्टहेड (Grand Masthead)',
    desc: 'प्रथम पृष्ठ का भव्य मुख्य शीर्षक (Logo + Tagline)',
    badge: '📰 पेज 1',
    config: {
      headerType: 'masthead' as const,
      titlePrefix: '',
      titleMain: 'वार्तिक',
      titleColorPrefix: '#475569',
      titleColorMain: '#c51c24',
      titleFontSize: 88,
      bgColor: '#ffffff',
      borderColor: '#0f172a',
      borderWidth: 3.5,
      borderStyle: 'double' as const,
      height: 168,
      bottomMargin: 20,
      pageBadgeBg: '#1e293b',
      pageBadgeColor: '#ffffff'
    }
  }
];

export function formatHindiDateParts(dateStr?: string): { day: string; date: string; full: string } {
  if (!dateStr) return { day: 'बुधवार', date: '21 अक्टूबर 2026', full: 'बुधवार • 21 अक्टूबर 2026' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: '', date: dateStr, full: dateStr };
    const days = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const day = days[d.getDay()];
    const date = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    return { day, date, full: `${day} • ${date}` };
  } catch {
    return { day: '', date: dateStr, full: dateStr };
  }
}

export function getEffectiveHeaderConfig(
  page: { pageNumber?: number; headerConfig?: EPaperHeaderConfig },
  editionCity?: string,
  dateStr?: string
): HeaderMetrics {
  const pageNum = Number(page?.pageNumber) || 1;
  const isP1 = pageNum === 1;
  const cfg = page?.headerConfig || {};

  const isCustomMode = cfg.mode === 'custom' || cfg.headerType === 'section';
  const isDefaultMode = cfg.mode === 'default' || cfg.headerType === 'masthead';
  // If explicitly custom, never masthead. If explicitly default, always masthead. Otherwise P1 is masthead.
  const isMasthead = isCustomMode ? false : (isDefaultMode ? true : isP1);
  const defaultCity = editionCity || 'पटना';
  const dateParts = formatHindiDateParts(dateStr);

  const computedPageBadge = String(pageNum).padStart(2, '0');

  // OPTION 1: STANDARD OFFICIAL HEADMASTER (वार्तिक GRAND MASTHEAD)
  // When Headmaster is selected, no typing required, clean official broadsheet layout.
  // Supports dynamic theme color, height, border, and bottom margin.
  if (isMasthead) {
    const height = Number(cfg.height) && Number(cfg.height) >= 120 ? Number(cfg.height) : 168;
    const bottomMargin = Number(cfg.bottomMargin) && Number(cfg.bottomMargin) >= 8 ? Number(cfg.bottomMargin) : 20;
    const themeColor = cfg.titleColorMain || cfg.titleColor || '#c51c24';
    const borderColor = cfg.borderColor || '#0f172a';
    const borderWidth = Number(cfg.borderWidth) || 3.5;
    const borderStyle = cfg.borderStyle || 'double';

    return {
      mode: 'default',
      headerType: 'masthead',
      title: 'वार्तिक',
      twoToneTitle: false,
      titlePrefix: '',
      titleMain: 'वार्तिक',
      titleColor: themeColor,
      titleColorPrefix: '#475569',
      titleColorMain: themeColor,
      titleFontSize: Number(cfg.titleFontSize) || 88,
      bgColor: cfg.bgColor || '#ffffff',
      borderColor,
      borderWidth,
      borderStyle,
      height,
      bottomMargin,
      totalTopOffset: height + bottomMargin,
      cityText: cfg.cityText || defaultCity,
      dayText: cfg.dayText || dateParts.day,
      dateText: cfg.dateText || dateParts.date,
      temperatureText: cfg.temperatureText || '',
      pageBadgeBg: '#1e293b',
      pageBadgeColor: '#ffffff',
      pageBadgeText: computedPageBadge,
      showLogo: true,
      subWebsiteText: 'www.vartiq.com'
    };
  }

  // OPTION 2: CUSTOM SECTION HEADER (TYPE YOURSELF IN HINDI OR ENGLISH)
  // Grand Masthead is NOT shown here at all. User types whatever section title they want.
  let autoPrefix = 'अपना';
  let autoMain = defaultCity;

  if (pageNum === 3) {
    autoPrefix = 'प्रादेशिक';
    autoMain = 'राज्य';
  } else if (pageNum === 4) {
    autoPrefix = 'राष्ट्रीय';
    autoMain = 'देश विदेश';
  } else if (pageNum === 5) {
    autoPrefix = 'विशेष';
    autoMain = 'खेल जगत';
  } else if (pageNum === 6) {
    autoPrefix = 'बाज़ार';
    autoMain = 'कारोबार';
  } else if (pageNum === 7) {
    autoPrefix = 'दैनिक';
    autoMain = 'संपादकीय';
  }

  // Unified single Title handling (English or Hindi typed directly by user)
  let rawTitle = (cfg.title !== undefined && cfg.title !== null) ? String(cfg.title).trim() : '';
  if (!rawTitle) {
    if (cfg.titlePrefix && cfg.titleMain) {
      rawTitle = `${cfg.titlePrefix} ${cfg.titleMain}`.trim();
    } else if (cfg.titleMain) {
      rawTitle = cfg.titleMain.trim();
    } else {
      rawTitle = autoPrefix ? `${autoPrefix} ${autoMain}` : autoMain;
    }
  }

  // Parse title into prefix + main for two-tone rendering if enabled
  const twoToneTitle = cfg.twoToneTitle !== undefined ? cfg.twoToneTitle : (rawTitle.includes(' '));
  let parsedPrefix = '';
  let parsedMain = rawTitle;

  if (twoToneTitle && rawTitle.includes(' ')) {
    const spaceIdx = rawTitle.indexOf(' ');
    parsedPrefix = rawTitle.substring(0, spaceIdx).trim();
    parsedMain = rawTitle.substring(spaceIdx + 1).trim();
  } else {
    parsedPrefix = cfg.titlePrefix || '';
    parsedMain = rawTitle;
  }

  const height = Number(cfg.height) || 56;
  const bottomMargin = Number(cfg.bottomMargin) || 18;
  const totalTopOffset = height + bottomMargin;

  return {
    mode: 'custom',
    headerType: 'section',
    title: rawTitle,
    twoToneTitle,
    titlePrefix: parsedPrefix,
    titleMain: parsedMain,
    titleColor: cfg.titleColor || cfg.titleColorMain || '#c51c24',
    titleColorPrefix: cfg.titleColorPrefix || '#475569',
    titleColorMain: cfg.titleColorMain || cfg.titleColor || '#c51c24',
    titleFontSize: Number(cfg.titleFontSize) || 38,
    bgColor: cfg.bgColor || '#ffffff',
    borderColor: cfg.borderColor || '#c51c24',
    borderWidth: Number(cfg.borderWidth) || 2.5,
    borderStyle: cfg.borderStyle || 'single',
    height,
    bottomMargin,
    totalTopOffset,
    cityText: cfg.cityText || defaultCity,
    dayText: cfg.dayText || dateParts.day,
    dateText: cfg.dateText || dateParts.date,
    pageBadgeBg: cfg.pageBadgeBg || '#1e293b',
    pageBadgeColor: cfg.pageBadgeColor || '#ffffff',
    pageBadgeText: computedPageBadge,
    temperatureText: cfg.temperatureText || '',
    showLogo: cfg.showLogo !== undefined ? cfg.showLogo : true,
    subWebsiteText: cfg.subWebsiteText || 'www.vartiq.com'
  };
}

export function getPageHeaderMetrics(
  page: { pageNumber?: number; headerConfig?: EPaperHeaderConfig },
  editionCity?: string,
  dateStr?: string
): HeaderMetrics {
  return getEffectiveHeaderConfig(page, editionCity, dateStr);
}
