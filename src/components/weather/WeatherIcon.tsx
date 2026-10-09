'use client';

import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind
} from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, className = 'w-6 h-6', size = 24 }) => {
  const iconName = (name || '').toLowerCase();

  if (iconName.includes('moon') || iconName.includes('night')) {
    return <Moon size={size} className={`text-sky-400 fill-sky-200/50 ${className}`} />;
  }
  if (iconName.includes('sun') || iconName.includes('sunny')) {
    return <Sun size={size} className={`text-amber-500 ${className}`} />;
  }
  if (iconName.includes('clear')) {
    // Check if current hour in IST is evening / night (after 6:30 PM or before 6 AM)
    const hr = new Date().getUTCHours() + 5.5; // IST approx
    if (hr >= 18.5 || hr < 6) {
      return <Moon size={size} className={`text-sky-400 fill-sky-200/50 ${className}`} />;
    }
    return <Sun size={size} className={`text-amber-500 ${className}`} />;
  }
  if (iconName.includes('cloud-sun') || iconName.includes('partly')) {
    return <CloudSun size={size} className={`text-amber-400 ${className}`} />;
  }
  if (iconName.includes('fog') || iconName.includes('mist') || iconName.includes('haze')) {
    return <CloudFog size={size} className={`text-slate-400 ${className}`} />;
  }
  if (iconName.includes('drizzle')) {
    return <CloudDrizzle size={size} className={`text-sky-400 ${className}`} />;
  }
  if (iconName.includes('rain')) {
    return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
  }
  if (iconName.includes('lightning') || iconName.includes('thunder')) {
    return <CloudLightning size={size} className={`text-purple-500 ${className}`} />;
  }
  if (iconName.includes('snow')) {
    return <CloudSnow size={size} className={`text-indigo-300 ${className}`} />;
  }
  if (iconName.includes('wind')) {
    return <Wind size={size} className={`text-teal-400 ${className}`} />;
  }
  return <Cloud size={size} className={`text-slate-400 ${className}`} />;
};
