import React from 'react';
import { CuteFaceConfig } from '../types';

interface CuteFaceProps {
  name: string;
  config?: CuteFaceConfig;
  size?: number; // size in pixels
  isHovered?: boolean;
  className?: string;
  circleColor?: string;
  showCircleBackground?: boolean;
}

// Deterministic generator if no config provided
export function getDerivedCuteFace(name?: string): CuteFaceConfig {
  const safeName = typeof name === 'string' && name.trim() ? name.trim() : 'Player';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const abs = Math.abs(hash) || 0;

  const expressions: CuteFaceConfig['expression'][] = [
    'happy',
    'wink',
    'sparkle',
    'warm',
    'cool',
    'gentle',
    'grin',
    'cheeky',
  ];

  return {
    expression: expressions[abs % expressions.length] || 'happy',
    glasses: (abs % 4) === 0,
    blush: true,
    freckles: (abs % 5) === 0,
  };
}

export const CuteFace: React.FC<CuteFaceProps> = ({
  name = 'Player',
  config,
  size = 100,
  isHovered = false,
  className = '',
  circleColor,
  showCircleBackground = false,
}) => {
  const safeName = typeof name === 'string' && name.trim() ? name.trim() : 'Player';
  const finalConfig: CuteFaceConfig = {
    ...getDerivedCuteFace(safeName),
    ...(config || {}),
  };

  const {
    expression = 'happy',
    glasses = false,
    freckles = false,
    blush = true,
  } = finalConfig;

  // Derive stable hair & eye colors from name hash
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const abs = Math.abs(hash) || 0;

  const hairPalette = [
    { base: '#4a2f13', shadow: '#311e0b', highlight: '#6a4723' }, // Brown (Steve)
    { base: '#b55222', shadow: '#7e3512', highlight: '#d96c34' }, // Ginger (Alex)
    { base: '#1e1c1b', shadow: '#0d0c0c', highlight: '#333130' }, // Black
    { base: '#d8aa42', shadow: '#9c7521', highlight: '#eed178' }, // Blonde
    { base: '#7c3f58', shadow: '#502336', highlight: '#a35777' }, // Plum / Violet
    { base: '#3b5a7a', shadow: '#22364c', highlight: '#547ea8' }, // Blue
  ];
  const hair = hairPalette[abs % hairPalette.length] || hairPalette[0];

  const eyePalette = [
    { pupil: '#2c478a', iris: '#4d75d6' }, // Steve Blue
    { pupil: '#246b36', iris: '#42a35c' }, // Alex Green
    { pupil: '#5a3012', iris: '#82481f' }, // Warm Brown
    { pupil: '#4a2663', iris: '#7940a1' }, // Ender Purple
    { pupil: '#1b1b1b', iris: '#383838' }, // Charcoal
  ];
  const eye = eyePalette[Math.floor(abs / 7) % eyePalette.length] || eyePalette[0];

  // Skin tone
  const skinPalette = [
    { base: '#f0be92', shadow: '#d69d6e', dark: '#b77d50' }, // Medium Peach
    { base: '#f7d2b2', shadow: '#e0b28e', dark: '#c2926e' }, // Fair
    { base: '#c98a58', shadow: '#aa6c3d', dark: '#8a4f23' }, // Tan
    { base: '#8d5732', shadow: '#6d3f20', dark: '#522c12' }, // Deep
    { base: '#ffd9b3', shadow: '#e5b98f', dark: '#bf946b' }, // Rose fair
  ];
  const skin = skinPalette[Math.floor(abs / 13) % skinPalette.length] || skinPalette[0];

  // Scale: 16x16 grid for high-fidelity Minecraft skin face
  // 0 to 15 coordinates (each unit is 6.25px in a 100x100 viewBox)
  const U = 6.25;

  return (
    <div
      className={`relative select-none pointer-events-none transition-transform duration-100 ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        {/* Optional Item Frame / Block background */}
        {showCircleBackground && (
          <g>
            {/* Minecraft Item Frame Bevel / Block */}
            <rect x="0" y="0" width="100" height="100" fill="#000000" />
            <rect x="3" y="3" width="94" height="94" fill="#382212" />
            {/* Inner frame */}
            <rect x="6" y="6" width="88" height="88" fill={circleColor || '#85542b'} />
            {/* Recessed slot backing */}
            <rect x="10" y="10" width="80" height="80" fill="#1b1816" />
            {/* Highlight & Shadow edges */}
            <rect x="3" y="3" width="94" height="3" fill="#664426" />
            <rect x="3" y="3" width="3" height="94" fill="#664426" />
            <rect x="3" y="94" width="94" height="3" fill="#1f1207" />
            <rect x="94" y="3" width="3" height="94" fill="#1f1207" />
          </g>
        )}

        {/* --- MINECRAFT 8x8 / 16x16 PLAYER HEAD --- */}
        <g transform={showCircleBackground ? 'translate(14, 14) scale(0.72)' : 'translate(6, 6) scale(0.88)'}>
          {/* Black Outer Pixel Border of Head */}
          <rect x="0" y="0" width="100" height="100" fill="#000000" />

          {/* Head Base Skin (8x8 cells, each 12.5 x 12.5) */}
          <rect x="6" y="6" width="88" height="88" fill={skin.base} />

          {/* Skin Shading on bottom and sides */}
          <rect x="6" y="78" width="88" height="16" fill={skin.shadow} />
          <rect x="6" y="6" width="6" height="88" fill={skin.shadow} opacity="0.6" />
          <rect x="88" y="6" width="6" height="88" fill={skin.dark} opacity="0.6" />

          {/* --- HAIR LAYER (Helmet/Hair) --- */}
          {/* Top hair block */}
          <rect x="6" y="6" width="88" height="26" fill={hair.base} />
          <rect x="6" y="6" width="88" height="8" fill={hair.highlight} />
          {/* Sideburns */}
          <rect x="6" y="32" width="16" height="28" fill={hair.base} />
          <rect x="78" y="32" width="16" height="28" fill={hair.shadow} />

          {/* Bangs Variations based on expression/hash */}
          {(abs % 3 === 0) && (
            <>
              <rect x="22" y="32" width="16" height="14" fill={hair.base} />
              <rect x="54" y="32" width="24" height="10" fill={hair.base} />
            </>
          )}
          {(abs % 3 === 1) && (
            <>
              <rect x="22" y="32" width="28" height="12" fill={hair.base} />
              <rect x="60" y="32" width="18" height="16" fill={hair.base} />
            </>
          )}
          {(abs % 3 === 2) && (
            <>
              <rect x="22" y="32" width="18" height="8" fill={hair.base} />
              <rect x="40" y="32" width="20" height="14" fill={hair.highlight} />
              <rect x="60" y="32" width="18" height="8" fill={hair.base} />
            </>
          )}

          {/* --- EYES --- */}
          {expression === 'wink' ? (
            <>
              {/* Left eye open */}
              <rect x="20" y="46" width="18" height="14" fill="#ffffff" />
              <rect x="28" y="48" width="10" height="12" fill={eye.iris} />
              <rect x="32" y="52" width="6" height="8" fill={eye.pupil} />
              <rect x="28" y="48" width="4" height="4" fill="#ffffff" />
              {/* Right eye wink (closed pixel line) */}
              <rect x="62" y="52" width="18" height="5" fill="#201a15" />
            </>
          ) : expression === 'cool' ? (
            <>
              {/* Pixel Sunglasses (Deal With It sunglasses!) */}
              <rect x="14" y="44" width="72" height="16" fill="#050505" />
              <rect x="20" y="46" width="22" height="12" fill="#1b1c20" />
              <rect x="58" y="46" width="22" height="12" fill="#1b1c20" />
              {/* White reflection shine */}
              <rect x="22" y="48" width="4" height="4" fill="#ffffff" />
              <rect x="26" y="52" width="4" height="4" fill="#ffffff" />
              <rect x="60" y="48" width="4" height="4" fill="#ffffff" />
              <rect x="64" y="52" width="4" height="4" fill="#ffffff" />
            </>
          ) : expression === 'sparkle' ? (
            <>
              {/* Sparkle starry eyes */}
              <rect x="18" y="44" width="22" height="16" fill="#ffffff" />
              <rect x="24" y="44" width="10" height="16" fill="#55ffff" />
              <rect x="28" y="48" width="6" height="8" fill="#ffffff" />
              <rect x="60" y="44" width="22" height="16" fill="#ffffff" />
              <rect x="66" y="44" width="10" height="16" fill="#55ffff" />
              <rect x="70" y="48" width="6" height="8" fill="#ffffff" />
            </>
          ) : (
            <>
              {/* Standard Classic Minecraft Eyes (Steve / Alex style) */}
              {/* Left Eye */}
              <rect x="18" y="46" width="20" height="14" fill="#ffffff" />
              <rect x="26" y="46" width="12" height="14" fill={eye.iris} />
              <rect x="30" y="50" width="8" height="10" fill={eye.pupil} />
              <rect x="26" y="48" width="4" height="4" fill="#ffffff" />

              {/* Right Eye */}
              <rect x="62" y="46" width="20" height="14" fill="#ffffff" />
              <rect x="62" y="46" width="12" height="14" fill={eye.iris} />
              <rect x="62" y="50" width="8" height="10" fill={eye.pupil} />
              <rect x="68" y="48" width="4" height="4" fill="#ffffff" />
            </>
          )}

          {/* Optional Glasses if not cool shades */}
          {glasses && expression !== 'cool' && (
            <g>
              <rect x="14" y="42" width="28" height="22" fill="none" stroke="#222222" strokeWidth="4" />
              <rect x="58" y="42" width="28" height="22" fill="none" stroke="#222222" strokeWidth="4" />
              <rect x="42" y="48" width="16" height="4" fill="#222222" />
            </g>
          )}

          {/* --- BLUSH --- */}
          {blush && (
            <g>
              <rect x="16" y="62" width="14" height="8" fill="#f472b6" opacity="0.85" />
              <rect x="70" y="62" width="14" height="8" fill="#f472b6" opacity="0.85" />
            </g>
          )}

          {/* --- FRECKLES --- */}
          {freckles && (
            <g fill="#9a582b">
              <rect x="24" y="62" width="4" height="4" />
              <rect x="34" y="64" width="4" height="4" />
              <rect x="62" y="64" width="4" height="4" />
              <rect x="72" y="62" width="4" height="4" />
            </g>
          )}

          {/* --- NOSE --- */}
          <rect x="44" y="58" width="12" height="8" fill={skin.dark} />

          {/* --- MOUTH --- */}
          {expression === 'grin' || expression === 'happy' ? (
            <g>
              {/* Wide smile / open mouth */}
              <rect x="36" y="70" width="28" height="8" fill="#421a15" />
              <rect x="40" y="74" width="20" height="4" fill="#ff708f" />
              {/* White teeth row */}
              <rect x="38" y="70" width="24" height="3" fill="#ffffff" />
            </g>
          ) : expression === 'cheeky' ? (
            <g>
              {/* Tongue sticking out */}
              <rect x="38" y="70" width="24" height="6" fill="#381b16" />
              <rect x="46" y="74" width="12" height="8" fill="#ff6b8b" />
              <rect x="50" y="80" width="4" height="4" fill="#d94b6a" />
            </g>
          ) : expression === 'gentle' || expression === 'warm' ? (
            <g>
              {/* Gentle smile */}
              <rect x="40" y="72" width="20" height="5" fill="#592b1d" />
              <rect x="36" y="70" width="5" height="4" fill="#592b1d" />
              <rect x="59" y="70" width="5" height="4" fill="#592b1d" />
            </g>
          ) : (
            <g>
              {/* Classic Steve/Alex goatee/smile block */}
              <rect x="40" y="72" width="20" height="6" fill="#5c2e1f" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
