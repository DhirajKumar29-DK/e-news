'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { weatherService, WeatherState, WeatherCity } from '@/services/weatherService';

interface CitySelectorProps {
  initialStateId?: string;
  initialCitySlug?: string;
  className?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  initialStateId,
  initialCitySlug,
  className = ''
}) => {
  const router = useRouter();
  const [states, setStates] = useState<WeatherState[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>(initialStateId || '');
  const [cities, setCities] = useState<WeatherCity[]>([]);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>(initialCitySlug || '');
  const [loadingCities, setLoadingCities] = useState(false);

  // Load states on mount
  useEffect(() => {
    let mounted = true;
    weatherService.getStates().then((data) => {
      if (mounted) {
        setStates(data);
        if (initialStateId) {
          const matched = data.find((s) => s.id === initialStateId || s.slug === initialStateId);
          if (matched) {
            setSelectedStateId(matched.id);
            if (matched.cities && matched.cities.length > 0) {
              setCities(matched.cities);
            }
          }
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [initialStateId]);

  // Load cities when state changes
  useEffect(() => {
    if (!selectedStateId) {
      setCities([]);
      return;
    }

    const stateObj = states.find((s) => s.id === selectedStateId);
    if (stateObj && stateObj.cities && stateObj.cities.length > 0) {
      setCities(stateObj.cities);
      return;
    }

    let mounted = true;
    setLoadingCities(true);
    weatherService.getCities(selectedStateId).then((data) => {
      if (mounted) {
        setCities(data);
        setLoadingCities(false);
      }
    }).catch(() => {
      if (mounted) setLoadingCities(false);
    });

    return () => {
      mounted = false;
    };
  }, [selectedStateId, states]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value;
    setSelectedStateId(stateId);
    setSelectedCitySlug('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelectedCitySlug(slug);
    if (slug) {
      router.push(`/weather/${slug}-weather-forecast-today`);
    }
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* State Dropdown */}
      <div className="relative min-w-[130px] sm:min-w-[150px]">
        <select
          value={selectedStateId}
          onChange={handleStateChange}
          aria-label="Select State"
          className="w-full appearance-none bg-white border border-gray-300/90 hover:border-gray-400 text-gray-800 text-xs sm:text-[13px] font-medium py-1.5 pl-3.5 pr-7 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer transition-all"
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
      </div>

      {/* City Dropdown */}
      <div className="relative min-w-[130px] sm:min-w-[150px]">
        <select
          value={selectedCitySlug}
          onChange={handleCityChange}
          disabled={!selectedStateId || loadingCities}
          aria-label="Select City"
          className="w-full appearance-none bg-white border border-gray-300/90 hover:border-gray-400 text-gray-800 text-xs sm:text-[13px] font-medium py-1.5 pl-3.5 pr-7 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingCities ? 'Loading...' : 'Select City'}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
      </div>
    </div>
  );
};
