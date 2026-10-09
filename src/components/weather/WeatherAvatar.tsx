'use client';

import React from 'react';

interface WeatherAvatarProps {
  mood?: 'happy' | 'coughing' | 'masked';
  className?: string;
}

export const WeatherAvatar: React.FC<WeatherAvatarProps> = ({ mood = 'happy', className = 'w-20 h-28' }) => {
  // 1. Masked Avatar (Exact match to Chandigarh screenshot: wearing white mask, pink kurta)
  if (mood === 'masked') {
    return (
      <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Hair back */}
        <ellipse cx="50" cy="38" rx="22" ry="24" fill="#2D2013" />
        {/* Body (Pink/Magenta Kurta with buttons) */}
        <path d="M38 68 C35 76 34 94 36 102 H64 C66 94 65 76 62 68 Z" fill="#E84393" />
        <path d="M50 68 V86" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="50" cy="72" r="1.2" fill="#FFFFFF" />
        <circle cx="50" cy="78" r="1.2" fill="#FFFFFF" />
        <circle cx="50" cy="84" r="1.2" fill="#FFFFFF" />
        {/* Pants */}
        <path d="M38 102 L38 118 H48 L49 106 L51 106 L52 118 H62 L62 102 Z" fill="#7F8C8D" />
        {/* Shoes */}
        <ellipse cx="43" cy="120" rx="6" ry="3" fill="#2C3E50" />
        <ellipse cx="57" cy="120" rx="6" ry="3" fill="#2C3E50" />
        {/* Arms holding waist or sides */}
        <rect x="29" y="70" width="7" height="22" rx="3.5" fill="#E84393" />
        <rect x="64" y="70" width="7" height="22" rx="3.5" fill="#E84393" />
        <circle cx="32.5" cy="93" r="3.5" fill="#FAD7A0" />
        <circle cx="67.5" cy="93" r="3.5" fill="#FAD7A0" />
        {/* Head */}
        <circle cx="50" cy="40" r="18" fill="#FAD7A0" />
        {/* Hair front bangs */}
        <path d="M33 36 C34 24 42 20 50 20 C58 20 66 24 67 36 C61 29 56 29 51 33 C47 28 40 29 33 36 Z" fill="#2D2013" />
        {/* Concerned/Squinted Eyes */}
        <path d="M38 39 Q 42 36 46 39" stroke="#333" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M54 39 Q 58 36 62 39" stroke="#333" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {/* Eyebrows */}
        <path d="M38 34 L45 36" stroke="#2D2013" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M62 34 L55 36" stroke="#2D2013" strokeWidth="1.8" strokeLinecap="round" />
        {/* Blush cheeks */}
        <ellipse cx="37" cy="45" rx="3" ry="1.5" fill="#FF7675" opacity="0.6" />
        <ellipse cx="63" cy="45" rx="3" ry="1.5" fill="#FF7675" opacity="0.6" />
        {/* White Protective Face Mask with loops */}
        <path d="M34 44 Q 31 47 34 50 L 40 50" stroke="#74B9FF" strokeWidth="1.5" fill="none" />
        <path d="M66 44 Q 69 47 66 50 L 60 50" stroke="#74B9FF" strokeWidth="1.5" fill="none" />
        <rect x="36" y="44" width="28" height="13" rx="4" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
        <line x1="40" y1="50" x2="60" y2="50" stroke="#E5E7EB" strokeWidth="1.5" />
      </svg>
    );
  }

  // 2. Coughing Avatar (Hand on chest, coughing puffs)
  if (mood === 'coughing') {
    return (
      <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Hair back */}
        <ellipse cx="50" cy="40" rx="22" ry="24" fill="#2D2013" />
        {/* Body */}
        <path d="M40 70 C36 78 35 95 38 102 H62 C65 95 64 78 60 70 Z" fill="#D35400" />
        <path d="M47 70 L50 82 L53 70" stroke="#FDEBD0" strokeWidth="2" />
        {/* Pants */}
        <path d="M38 102 L38 118 H48 L49 106 L51 106 L52 118 H62 L62 102 Z" fill="#34495E" />
        {/* Shoes */}
        <ellipse cx="43" cy="120" rx="6" ry="3" fill="#2C3E50" />
        <ellipse cx="57" cy="120" rx="6" ry="3" fill="#2C3E50" />
        {/* Hand on Chest (coughing) */}
        <path d="M60 78 Q 50 82 48 86" stroke="#F5CBA7" strokeWidth="5" strokeLinecap="round" />
        <circle cx="48" cy="86" r="4" fill="#F5CBA7" />
        {/* Coughing puffs */}
        <path d="M30 46 Q 24 42 20 45" stroke="#BDC3C7" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
        <path d="M28 52 Q 20 50 16 54" stroke="#BDC3C7" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
        {/* Head */}
        <circle cx="50" cy="42" r="18" fill="#FAD7A0" />
        {/* Hair front */}
        <path d="M34 38 C34 26 42 22 50 22 C58 22 66 26 66 38 C60 30 54 30 50 33 C46 30 40 30 34 38 Z" fill="#2D2013" />
        {/* Squinted uncomfortable eyes (> <) */}
        <path d="M40 40 L45 42 L40 44" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 40 L55 42 L60 44" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Mouth */}
        <ellipse cx="49" cy="50" rx="3.5" ry="4" fill="#C0392B" />
        {/* Sweat drop */}
        <path d="M66 38 Q 69 44 66 46 Q 63 44 66 38" fill="#3498DB" />
      </svg>
    );
  }

  // 3. Happy / Normal Standing Avatar
  return (
    <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="50" cy="38" rx="22" ry="24" fill="#3D2B1F" />
      <rect x="46" y="55" width="8" height="9" fill="#FAD7A0" />
      <path d="M34 64 C34 60 42 60 50 60 C58 60 66 60 66 64 L70 88 H30 L34 64 Z" fill="#95A5A6" />
      <path d="M44 60 Q 50 66 56 60" stroke="#BDC3C7" strokeWidth="2" fill="none" />
      <rect x="27" y="66" width="6" height="24" rx="3" fill="#FAD7A0" />
      <rect x="67" y="66" width="6" height="24" rx="3" fill="#FAD7A0" />
      <path d="M35 88 H65 L66 104 H53 L51 94 L49 94 L47 104 H34 L35 88 Z" fill="#7F8C8D" />
      <rect x="38" y="104" width="6" height="15" fill="#FAD7A0" />
      <rect x="56" y="104" width="6" height="15" fill="#FAD7A0" />
      <ellipse cx="41" cy="121" rx="6" ry="3.5" fill="#2C3E50" />
      <ellipse cx="59" cy="121" rx="6" ry="3.5" fill="#2C3E50" />
      <circle cx="50" cy="40" r="18" fill="#FAD7A0" />
      <path d="M33 36 C34 24 42 20 50 20 C58 20 66 24 67 36 C61 30 56 30 51 34 C47 29 40 30 33 36 Z" fill="#3D2B1F" />
      <ellipse cx="43" cy="40" rx="4" ry="5.5" fill="#2C3E50" />
      <circle cx="44.5" cy="38" r="1.8" fill="#FFFFFF" />
      <circle cx="42" cy="43" r="0.8" fill="#FFFFFF" />
      <ellipse cx="57" cy="40" rx="4" ry="5.5" fill="#2C3E50" />
      <circle cx="58.5" cy="38" r="1.8" fill="#FFFFFF" />
      <circle cx="56" cy="43" r="0.8" fill="#FFFFFF" />
      <ellipse cx="38" cy="46" rx="3" ry="1.5" fill="#F1948A" opacity="0.6" />
      <ellipse cx="62" cy="46" rx="3" ry="1.5" fill="#F1948A" opacity="0.6" />
      <path d="M46 47 Q 50 51 54 47" stroke="#922B21" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
};
