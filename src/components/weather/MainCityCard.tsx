'use client';

import React from 'react';
import Link from 'next/link';
import { MainCityWeather } from '@/services/weatherService';
import { MonumentIcon } from './MonumentIcon';

interface MainCityCardProps {
  city: MainCityWeather;
}

export const MainCityCard: React.FC<MainCityCardProps> = ({ city }) => {
  // Determine standard AQI category and bottom bar color matching reference image
  const getStatusBarInfo = (aqiVal: number, rawBadge?: string) => {
    if (aqiVal <= 50) {
      return {
        label: 'Good',
        bgColor: '#66BB6A', // fresh vibrant green
        textColor: '#FFFFFF',
      };
    }
    if (aqiVal <= 100) {
      return {
        label: 'Moderate',
        bgColor: '#F1C40F', // warm golden yellow
        textColor: '#FFFFFF',
      };
    }
    if (aqiVal <= 200) {
      return {
        label: 'Moderate',
        bgColor: '#E6A23C', // amber golden
        textColor: '#FFFFFF',
      };
    }
    if (aqiVal <= 300) {
      return {
        label: 'Poor',
        bgColor: '#E67E22', // warm terracotta orange
        textColor: '#FFFFFF',
      };
    }
    if (aqiVal <= 400) {
      return {
        label: 'Very Poor',
        bgColor: '#E74C3C', // bright red
        textColor: '#FFFFFF',
      };
    }
    return {
      label: 'Severe',
      bgColor: '#9B59B6', // deep purple
      textColor: '#FFFFFF',
    };
  };

  const status = getStatusBarInfo(city.aqi, city.aqiBadge);

  return (
    <Link
      href={`/weather/${city.slug}-weather-forecast-today`}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_rgba(244,63,94,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Section: Monument Vector sketch & City Title */}
      <div className="p-4 pt-4 pb-3 flex items-center gap-3.5">
        {/* Monument Icon */}
        <div className="shrink-0 text-slate-800 group-hover:scale-105 transition-transform duration-300">
          <MonumentIcon
            type={city.monumentIcon || city.slug}
            className="w-12 h-10 text-slate-800"
          />
        </div>

        {/* City Name & AQI */}
        <div className="min-w-0">
          <h3 className="text-base md:text-[17px] font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight truncate">
            {city.name}
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {city.aqi} AQI
          </p>
        </div>
      </div>

      {/* Middle Section: Temp & Humidity with divider line */}
      <div className="px-4 pb-3 pt-2">
        <div className="flex items-center justify-between text-center">
          {/* Temperature */}
          <div className="flex-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">
              Temp
            </span>
            <div className="text-xl md:text-[22px] font-extrabold text-gray-900 mt-0.5">
              {city.temp} <span className="text-sm font-semibold text-gray-500">°C</span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-gray-200/80 mx-2" />

          {/* Humidity */}
          <div className="flex-1">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block">
              Hum
            </span>
            <div className="text-xl md:text-[22px] font-extrabold text-gray-900 mt-0.5">
              {city.humidity} <span className="text-sm font-semibold text-gray-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Colored Status Bar */}
      <div
        className="w-full py-1 text-center text-[11px] font-bold tracking-wider text-white uppercase rounded-b-2xl shadow-inner transition-colors"
        style={{ backgroundColor: status.bgColor }}
      >
        {status.label}
      </div>
    </Link>
  );
};
