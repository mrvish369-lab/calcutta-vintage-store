import React from 'react';

// Iconic Howrah Bridge Silhouette
export const HowrahBridge = ({ size = 120, color = "currentColor", className = "" }) => (
  <svg width={size} height={size * 0.4} viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 100 H290 M50 100 V40 L150 20 L250 40 V100 M50 60 L150 40 L250 60 M50 80 L150 60 L250 80" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M10 100 Q150 0 290 100" stroke={color} strokeWidth="2" fill="none" opacity="0.3"/>
    <circle cx="50" cy="100" r="4" fill={color}/>
    <circle cx="250" cy="100" r="4" fill={color}/>
  </svg>
);

// Iconic Kolkata Yellow Taxi (Ambassador)
export const YellowTaxi = ({ size = 60, className = "" }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="10" y="25" width="80" height="20" rx="5" fill="#FFD700"/>
    <path d="M25 25 L35 10 H65 L75 25" fill="#FFD700" stroke="#000" strokeWidth="2"/>
    <rect x="15" y="30" width="70" height="4" fill="#000" opacity="0.1"/>
    <circle cx="25" cy="45" r="8" fill="#333" stroke="#000" strokeWidth="2"/>
    <circle cx="75" cy="45" r="8" fill="#333" stroke="#000" strokeWidth="2"/>
    <rect x="10" y="32" width="80" height="2" fill="#000" opacity="0.8"/>
  </svg>
);

// Kolkata Tram
export const CalcuttaTram = ({ size = 80, className = "" }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="5" y="10" width="110" height="35" rx="4" fill="rgba(255,255,255,0.05)" stroke="var(--color-accent-amber)" strokeWidth="2"/>
    <rect x="15" y="15" width="20" height="15" rx="2" fill="var(--color-accent-amber)" opacity="0.3"/>
    <rect x="50" y="15" width="20" height="15" rx="2" fill="var(--color-accent-amber)" opacity="0.3"/>
    <rect x="85" y="15" width="20" height="15" rx="2" fill="var(--color-accent-amber)" opacity="0.3"/>
    <path d="M60 10 V2 L40 5 M60 2 L80 5" stroke="var(--color-accent-amber)" strokeWidth="1"/>
    <line x1="0" y1="50" x2="120" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
  </svg>
);

export const ArchiveSeal = ({ size = 100, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="45" stroke="var(--color-accent-amber)" strokeWidth="1" strokeDasharray="4 4"/>
    <circle cx="50" cy="50" r="38" stroke="var(--color-accent-amber)" strokeWidth="2"/>
    <text x="50" y="45" fontSize="8" fill="var(--color-accent-amber)" textAnchor="middle" fontFamily="serif" letterSpacing="2">IMPERIAL</text>
    <text x="50" y="58" fontSize="10" fill="var(--color-accent-amber)" textAnchor="middle" fontFamily="serif" fontWeight="bold">CALCUTTA</text>
    <text x="50" y="70" fontSize="6" fill="var(--color-accent-amber)" textAnchor="middle" opacity="0.6">ARCHIVES</text>
  </svg>
);
