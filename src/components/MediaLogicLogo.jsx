import React from 'react';

/**
 * Media Logic Company Logo SVG Component
 * Exact vector rendition of the Media Logic trademark logo
 */
const MediaLogicLogo = ({ width = 240, height = 120, className = '' }) => {
  return (
    <div className={`media-logic-logo-container d-inline-flex flex-column align-items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 300 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Media Logic Logo"
        role="img"
      >
        <defs>
          {/* Sphere Drop Red Gradient */}
          <radialGradient id="mlRedDropGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#F56056" />
            <stop offset="50%" stopColor="#D92B20" />
            <stop offset="100%" stopColor="#96130C" />
          </radialGradient>

          {/* Needle Stem Blue #2E3192 Gradient */}
          <linearGradient id="mlNeedleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B3FAD" />
            <stop offset="50%" stopColor="#2E3192" />
            <stop offset="100%" stopColor="#1B1D61" />
          </linearGradient>

          <filter id="subtleDropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* --- Top Red Sphere Drop --- */}
        <g filter="url(#subtleDropShadow)">
          {/* Main sphere */}
          <circle cx="150" cy="42" r="24" fill="url(#mlRedDropGrad)" />
          
          {/* Teardrop tip extending downwards */}
          <path
            d="M 141 58 Q 150 78 150 82 Q 150 78 159 58 Z"
            fill="url(#mlRedDropGrad)"
          />

          {/* Registered Trademark symbol ® */}
          <text
            x="178"
            y="24"
            fill="#333333"
            fontSize="10"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            ®
          </text>
        </g>

        {/* --- Base Concentric Oval Rings --- */}
        <g stroke="#333333" strokeWidth="1.5" fill="none">
          <ellipse cx="150" cy="148" rx="42" ry="9" />
          <ellipse cx="150" cy="148" rx="28" ry="6" />
          <ellipse cx="150" cy="148" rx="14" ry="3" fill="#EAEAEA" />
        </g>

        {/* --- Center Blue Needle (#2E3192) --- */}
        <path
          d="M 148 83 L 152 83 L 154 148 L 146 148 Z"
          fill="url(#mlNeedleGrad)"
        />

        {/* --- Outer Twin Black Arches (M Shape) --- */}
        <g stroke="#222222" strokeWidth="6" strokeLinecap="round" fill="none">
          {/* Left Arch */}
          <path d="M 64 148 C 64 92, 138 92, 142 148" />
          {/* Right Arch */}
          <path d="M 158 148 C 162 92, 236 92, 236 148" />
        </g>

        {/* --- MEDIA LOGIC Text --- */}
        <text
          x="150"
          y="180"
          textAnchor="middle"
          fill="#1F2428"
          fontSize="20"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          letterSpacing="3"
        >
          MEDIA LOGIC
        </text>
      </svg>
    </div>
  );
};

export default MediaLogicLogo;
