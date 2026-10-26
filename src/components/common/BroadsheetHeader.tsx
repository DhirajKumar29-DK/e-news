import React, { useState, useEffect } from 'react';
import { EPaperHeaderConfig } from '@/types/epaper';
import { getEffectiveHeaderConfig } from '@/utils/epaperHeader';
import { SlidersHorizontal } from 'lucide-react';
import { weatherService } from '@/services/weatherService';

export interface BroadsheetHeaderProps {
  page: { pageNumber?: number; headerConfig?: EPaperHeaderConfig };
  editionCity?: string;
  dateStr?: string;
  onEditHeader?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const BroadsheetHeader: React.FC<BroadsheetHeaderProps> = ({
  page,
  editionCity,
  dateStr,
  onEditHeader,
  className = '',
  style: customStyle
}) => {
  const cfg = getEffectiveHeaderConfig(page, editionCity, dateStr);
  const isMasthead = cfg.headerType === 'masthead';
  const pageNumber = Number(page?.pageNumber) || 1;

  const [liveTemp, setLiveTemp] = useState<string>('31°C');

  useEffect(() => {
    let isCancelled = false;
    const targetCity = cfg.cityText || editionCity || 'पटना';
    weatherService.getCityTemperature(targetCity, dateStr).then((t) => {
      if (!isCancelled && t) {
        setLiveTemp(t);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [cfg.cityText, editionCity, dateStr]);

  const displayTemp = cfg.temperatureText || liveTemp || '31°C';

  return (
    <header
      translate="no"
      className={`notranslate relative select-none group w-full ${className}`}
      style={{
        backgroundColor: cfg.bgColor,
        marginBottom: `${cfg.bottomMargin}px`,
        ...customStyle
      }}
      data-testid="broadsheet-header"
    >
      {/* Admin Quick Edit Button Overlay */}
      {onEditHeader && (
        <div className="absolute top-1 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditHeader();
            }}
            className="px-3 py-1 bg-slate-900/90 hover:bg-red-600 text-white text-[11px] font-sans font-bold rounded-md shadow-md flex items-center space-x-1.5 cursor-pointer backdrop-blur-xs transition-colors"
            title="Customize header title, colors, font size and border"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
            <span>🎨 Edit Header</span>
          </button>
        </div>
      )}

      {isMasthead ? (
        /* ========================================================
           PAGE 1: GRAND BROADSHEET MASTHEAD (वार्तिक मुख्य शीर्षक)
           ======================================================== */
        <div className="w-full">
          <div
            className="flex items-center justify-between bg-white w-full px-2"
            style={{
              height: `${cfg.height}px`,
              backgroundColor: cfg.bgColor
            }}
          >
            {/* LEFT COLUMN: DIGITAL & TEMP (TOP) + BRAND LOGO + LOCATION & DATE (BOTTOM) */}
            <div className="w-[290px] h-full shrink-0 flex flex-col items-center justify-center px-3 select-none">
              <div className="font-sans text-[11px] font-bold text-slate-700 tracking-wide flex items-center justify-center gap-1.5 whitespace-nowrap mb-1">
                <span>डिजिटल संस्करण</span>
                <span>•</span>
                <span>तापमान {displayTemp}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/vartiq-logo.png"
                alt="Vartiq"
                className="h-[80px] max-w-[235px] object-contain drop-shadow-xs"
              />
              <div className="font-sans text-[11.5px] font-bold text-slate-800 tracking-wide mt-1.5 flex items-center justify-center gap-1.5 whitespace-nowrap">
                <span className="text-[#b31e21] font-black">{cfg.cityText ? `अपना ${cfg.cityText}` : 'अपना पटना'}</span>
                <span>•</span>
                <span>{cfg.dayText ? `${cfg.dayText} • ${cfg.dateText}` : cfg.dateText}</span>
              </div>
            </div>

            {/* CENTER COLUMN: GRAND "वार्तिक" + TAGLINE & RED SWOOSH */}
            <div className="flex-1 h-full flex flex-col items-center justify-center text-center px-4 relative select-none">
              <div className="flex items-center justify-center gap-4 w-full">
                <div
                  className="h-[3px] w-14 sm:w-24 rounded-full shadow-xs opacity-90"
                  style={{ backgroundColor: cfg.titleColorMain || '#c51c24' }}
                />
                <h1
                  style={{
                    fontFamily: "'Mukta', 'Hind', 'Noto Sans Devanagari', sans-serif",
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: '-0.01em',
                    fontSize: `${cfg.titleFontSize || 88}px`,
                    color: cfg.titleColorMain || '#c51c24',
                    filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25))'
                  }}
                  className="select-none m-0 p-0 pt-1"
                >
                  वार्तिक
                </h1>
                <div
                  className="h-[3px] w-14 sm:w-24 rounded-full shadow-xs opacity-90"
                  style={{ backgroundColor: cfg.titleColorMain || '#c51c24' }}
                />
              </div>

              {/* Tagline */}
              <div className="flex flex-col items-center justify-center -mt-1 select-none">
                <div
                  style={{ fontFamily: "'Mukta', 'Hind', 'Noto Sans Devanagari', sans-serif" }}
                  className="text-[16px] font-black text-[#0f172a] tracking-wider drop-shadow-xs"
                >
                  खबर समझो, दुनिया समझो।
                </div>
                {/* Dynamic Red Swoosh */}
                <svg width="240" height="8" viewBox="0 0 240 8" className="mt-0.5 overflow-visible">
                  <defs>
                    <linearGradient id="headerSwooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={cfg.titleColorMain || '#e51d27'} />
                      <stop offset="50%" stopColor={cfg.titleColorMain || '#b80d15'} />
                      <stop offset="100%" stopColor={cfg.titleColorMain || '#e51d27'} />
                    </linearGradient>
                  </defs>
                  <path d="M 4,1.5 Q 120,7.5 236,1.5 Q 120,4.5 4,1.5 Z" fill="url(#headerSwooshGrad)" />
                </svg>
              </div>
            </div>

            {/* RIGHT COLUMN: PAGE NUMBER BADGE (Page 1 NEVER shows page number! Starts from Page 2 onwards) */}
            <div className="w-[290px] h-full shrink-0 flex flex-col items-end justify-between pt-3.5 pb-3 px-4 select-none">
              <div className="font-sans text-[12px] font-bold text-slate-800 tracking-wide flex items-center justify-end whitespace-nowrap">
                {pageNumber > 1 && cfg.pageBadgeText && (
                  <span>पेज {cfg.pageBadgeText}</span>
                )}
              </div>
              <div />
            </div>
          </div>

          {/* BORDER RULE */}
          {cfg.borderStyle === 'double' ? (
            <div
              className="w-full"
              style={{
                borderTop: `1px solid ${cfg.borderColor}`,
                borderBottom: `${Math.max(2, cfg.borderWidth)}px solid ${cfg.borderColor}`,
                height: '4px',
                backgroundColor: cfg.bgColor
              }}
            />
          ) : (
            <div
              className="w-full"
              style={{
                height: `${cfg.borderWidth}px`,
                backgroundColor: cfg.borderColor
              }}
            />
          )}
        </div>
      ) : (
        /* ========================================================
           PAGE 2+: HINDUSTAN-STYLE REAL BROADSHEET SECTION HEADER
           ======================================================== */
        <div className="w-full">
          <div
            className="flex items-center justify-between w-full px-4"
            style={{
              height: `${cfg.height}px`,
              backgroundColor: cfg.bgColor
            }}
          >
            {/* LEFT: BRAND LOGO + SUBTITLE WEBSITE */}
            <div className="w-[280px] shrink-0 flex items-center space-x-3 select-none">
              {cfg.showLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/vartiq-logo.png"
                  alt="वार्तिक"
                  className="h-[34px] max-w-[130px] object-contain drop-shadow-xs"
                />
              )}
              {cfg.subWebsiteText && (
                <div className="border-l border-slate-300 pl-2.5 font-sans">
                  <div className="text-[10px] font-bold text-slate-500 tracking-wider">
                    {cfg.subWebsiteText}
                  </div>
                </div>
              )}
            </div>

            {/* CENTER: HEADMASTER SECTION TITLE (Supports Hindi & English bilingual broadsheet typography) */}
            <div className="flex-1 flex items-baseline justify-center gap-2.5 text-center px-4 select-none whitespace-nowrap">
              {cfg.twoToneTitle && cfg.titlePrefix ? (
                <>
                  <span
                    style={{
                      color: cfg.titleColorPrefix,
                      fontSize: `${cfg.titleFontSize}px`,
                      fontWeight: 900,
                      fontFamily: "'Mukta', 'Noto Serif Devanagari', 'Poppins', 'Inter', sans-serif",
                      lineHeight: 1
                    }}
                    className="tracking-tight whitespace-nowrap"
                  >
                    {cfg.titlePrefix}
                  </span>
                  <span
                    style={{
                      color: cfg.titleColorMain || cfg.titleColor,
                      fontSize: `${cfg.titleFontSize}px`,
                      fontWeight: 900,
                      fontFamily: "'Mukta', 'Noto Serif Devanagari', 'Poppins', 'Inter', sans-serif",
                      lineHeight: 1
                    }}
                    className="tracking-tight whitespace-nowrap"
                  >
                    {cfg.titleMain}
                  </span>
                </>
              ) : (
                <span
                  style={{
                    color: cfg.titleColor || cfg.titleColorMain,
                    fontSize: `${cfg.titleFontSize}px`,
                    fontWeight: 900,
                    fontFamily: "'Mukta', 'Noto Serif Devanagari', 'Poppins', 'Inter', sans-serif",
                    lineHeight: 1
                  }}
                  className="tracking-tight whitespace-nowrap"
                >
                  {cfg.title || cfg.titleMain}
                </span>
              )}
            </div>

            {/* RIGHT: CITY / DAY / DATE STACK + SOLID PAGE NUMBER BADGE */}
            <div className="w-[280px] shrink-0 flex items-center justify-end space-x-3 select-none">
              <div className="text-right font-sans leading-tight">
                <div className="text-[12px] font-black text-slate-900 tracking-wide">
                  {cfg.cityText}
                </div>
                <div className="text-[10.5px] font-bold text-slate-600 tracking-tight">
                  {cfg.dayText} {cfg.dayText && cfg.dateText ? '•' : ''} {cfg.dateText}
                </div>
              </div>

              {/* SOLID COLOR PAGE NUMBER BADGE (e.g. "02", "03") */}
              <div
                style={{
                  backgroundColor: cfg.pageBadgeBg,
                  color: cfg.pageBadgeColor
                }}
                className="min-w-[42px] px-2.5 py-1 rounded-sm font-sans font-black text-[15px] tracking-wider text-center shadow-xs flex items-center justify-center border border-black/10"
              >
                {cfg.pageBadgeText}
              </div>
            </div>
          </div>

          {/* CRISP SOLID HORIZONTAL BORDER RULE */}
          {cfg.borderStyle === 'double' ? (
            <div
              className="w-full"
              style={{
                borderTop: `1px solid ${cfg.borderColor}`,
                borderBottom: `${Math.max(2, cfg.borderWidth)}px solid ${cfg.borderColor}`,
                height: '4px',
                backgroundColor: cfg.bgColor
              }}
            />
          ) : (
            <div
              className="w-full"
              style={{
                height: `${cfg.borderWidth}px`,
                backgroundColor: cfg.borderColor
              }}
            />
          )}
        </div>
      )}
    </header>
  );
};

export default BroadsheetHeader;
