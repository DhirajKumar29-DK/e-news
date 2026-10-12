'use client';

import React from 'react';
import { MatchInfoData } from '@/types/cricket';
import { Info, MapPin, Calendar, Sun, CloudRain, Shield, Award } from 'lucide-react';

interface Props {
  info: MatchInfoData;
}

export const MatchInfo: React.FC<Props> = ({ info }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-5 text-slate-100">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Info className="w-5 h-5 text-red-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Official Match Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
        {/* Series */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase font-bold">Series</span>
          <p className="font-semibold text-white">{info.series}</p>
        </div>

        {/* Match Title */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase font-bold">Match</span>
          <p className="font-semibold text-white">{info.matchTitle}</p>
        </div>

        {/* Venue */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase font-bold">Venue</span>
          <p className="font-semibold text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{info.venue}</span>
          </p>
        </div>

        {/* Date & Time */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase font-bold">Date & Time</span>
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{info.dateTime}</span>
          </p>
        </div>

        {/* Toss */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
          <span className="text-slate-400 text-[11px] uppercase font-bold">Toss Update</span>
          <p className="font-semibold text-amber-300 text-sm">{info.toss}</p>
        </div>

        {/* Pitch Report */}
        {info.pitchReport && (
          <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
            <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1.5">
              <span>🏟️</span>
              <span>Pitch Report</span>
            </span>
            <p className="text-slate-200 leading-relaxed text-xs md:text-sm">{info.pitchReport}</p>
          </div>
        )}

        {/* Weather */}
        {info.weather && (
          <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
            <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Weather Conditions</span>
            </span>
            <p className="text-slate-200 text-xs md:text-sm">{info.weather}</p>
          </div>
        )}

        {/* On-Field Umpires */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>On-Field Umpires</span>
          </span>
          <p className="font-semibold text-slate-200">{info.umpires.join(' & ')}</p>
        </div>

        {/* TV / Third Umpire */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>TV / Third Umpire</span>
          </span>
          <p className="font-semibold text-slate-200">{info.thirdUmpire || 'Official ICC TV Umpire'}</p>
        </div>

        {/* Match Referee */}
        <div className="bg-slate-850/60 p-3.5 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
          <span className="text-slate-400 text-[11px] uppercase font-bold flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Match Referee</span>
          </span>
          <p className="font-semibold text-slate-200">{info.matchReferee.join(', ')}</p>
        </div>
      </div>
    </div>
  );
};
