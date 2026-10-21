'use client';

import React from 'react';
import { getEffectiveHeaderConfig } from '@/utils/epaperHeader';
import { EPaperHeaderConfig } from '@/types/epaper';

export interface BroadsheetFooterProps {
  pageNumber?: number;
  totalPages?: number;
  editionCity?: string;
  dateStr?: string;
  borderColor?: string;
  borderWidth?: number;
  headerConfig?: EPaperHeaderConfig;
  style?: React.CSSProperties;
  className?: string;
}

export const BroadsheetFooter: React.FC<BroadsheetFooterProps> = ({
  pageNumber,
  editionCity,
  dateStr,
  borderColor,
  borderWidth = 1.5,
  headerConfig,
  style,
  className = ''
}) => {
  // Dynamically match the top headmaster (header) border color (e.g. #0f172a for black masthead)
  const effectiveBorderColor = React.useMemo(() => {
    if (borderColor) return borderColor;
    try {
      const metrics = getEffectiveHeaderConfig(
        { pageNumber, headerConfig },
        editionCity,
        dateStr
      );
      return metrics.borderColor || '#0f172a';
    } catch {
      return '#0f172a';
    }
  }, [borderColor, pageNumber, headerConfig, editionCity, dateStr]);

  // Reusable CMYK color calibration registration block exactly like real print press!
  const renderCmykRegistrationCluster = (keyId: string) => (
    <div key={keyId} className="flex items-center space-x-1.5 shrink-0 select-none">
      {/* Grey Capsule Pill */}
      <span className="w-8 h-3 rounded-full bg-[#9ca3af] inline-block shadow-2xs opacity-90" />

      {/* Cyan & Light Cyan Dots */}
      <span className="w-3.5 h-3.5 rounded-full bg-[#00aef0] inline-block shadow-2xs" />
      <span className="w-3.5 h-3.5 rounded-full bg-[#bfeeff] inline-block shadow-2xs" />

      {/* Magenta & Light Pink Dots */}
      <span className="w-3.5 h-3.5 rounded-full bg-[#ec008c] inline-block shadow-2xs" />
      <span className="w-3.5 h-3.5 rounded-full bg-[#fcd5eb] inline-block shadow-2xs" />

      {/* Yellow & Light Yellow Dots */}
      <span className="w-3.5 h-3.5 rounded-full bg-[#fff100] inline-block shadow-2xs" />
      <span className="w-3.5 h-3.5 rounded-full bg-[#fffce0] inline-block shadow-2xs" />

      {/* Black & Grey Dots */}
      <span className="w-3.5 h-3.5 rounded-full bg-[#000000] inline-block shadow-2xs" />
      <span className="w-3.5 h-3.5 rounded-full bg-[#4b5563] inline-block shadow-2xs" />
      <span className="w-3.5 h-3.5 rounded-full bg-[#d1d5db] inline-block shadow-2xs" />

      {/* Grey Capsule Pill */}
      <span className="w-8 h-3 rounded-full bg-[#9ca3af] inline-block shadow-2xs opacity-90" />

      {/* 4-Color Registration Pin Dots (2x2 Matrix) */}
      <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 p-0.5 items-center justify-center shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#fff100] inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#00aef0] inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#ec008c] inline-block" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#000000] inline-block" />
      </div>

      {/* Registration Crosshair (Circle with Cross) */}
      <div className="relative w-3.5 h-3.5 rounded-full border border-black/80 flex items-center justify-center shrink-0">
        <div className="absolute w-full h-[0.75px] bg-black" />
        <div className="absolute h-full w-[0.75px] bg-black" />
        <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
      </div>
    </div>
  );

  return (
    <footer
      style={style}
      className={`w-full bg-white select-none ${className}`}
    >
      {/* 1. TOP SOLID THIN RULE (Matches Top Headmaster Border Color & Thin 1.5px Crisp Line) */}
      <div className="w-full relative">
        <div
          className="w-full"
          style={{
            height: `${borderWidth}px`,
            backgroundColor: effectiveBorderColor
          }}
        />
      </div>

      {/* 2. PURE CMYK COLOR REGISTRATION CONTROL STRIP (100% TEXT-FREE, EXACT REPLICA OF REAL PRINT PRESS) */}
      <div className="w-full h-7 px-6 flex items-center justify-between bg-white overflow-hidden">
        {renderCmykRegistrationCluster('cluster-1')}
        {renderCmykRegistrationCluster('cluster-2')}
        {renderCmykRegistrationCluster('cluster-3')}
        {renderCmykRegistrationCluster('cluster-4')}
      </div>
    </footer>
  );
};

export default BroadsheetFooter;
