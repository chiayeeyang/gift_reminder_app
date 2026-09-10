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
export function getDerivedCuteFace(name: string): CuteFaceConfig {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const abs = Math.abs(hash);

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
    expression: expressions[abs % expressions.length],
    glasses: (abs % 4) === 0,
    blush: true,
    freckles: (abs % 5) === 0,
  };
}

export const CuteFace: React.FC<CuteFaceProps> = ({
  name,
  config,
  size = 100,
  isHovered = false,
  className = '',
  circleColor,
  showCircleBackground = false,
}) => {
  const finalConfig: CuteFaceConfig = {
    ...getDerivedCuteFace(name),
    ...(config || {}),
  };

  const {
    expression = 'happy',
    glasses = false,
    freckles = false,
    blush = true,
  } = finalConfig;

  // Charcoal ink & graphite pencil tones for authentic hand-drawn feel
  const inkColor = '#292524'; // Stone-800 charcoal ink
  const pencilColor = '#78716c'; // Stone-500 graphite pencil
  const blushChalk = '#f472b6'; // Soft pastel pink chalk
  const tonguePastel = '#fca5a5'; // Soft pastel coral pink
  const mouthInk = '#44403c'; // Dark charcoal interior

  return (
    <div
      className={`relative select-none pointer-events-none transition-transform duration-200 ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Soft chalk / colored pencil smudge filter */}
          <filter id="pastel-chalk-smudge" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>

          {/* Paper texture overlay pattern for watercolor / crayon fill */}
          <radialGradient id="paper-wash-soft" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#292524" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {/* --- OPTIONAL HANDDRAWN CIRCLE BACKGROUND (Organic Sketch Strokes) --- */}
        {showCircleBackground && (
          <g>
            {/* Base pastel watercolor wash with organic hand-drawn wobble */}
            <path
              d="M 50 4.5 C 75.5 3.8, 96.2 24.2, 95.8 49.5 C 95.4 75.2, 75.8 95.8, 50.2 95.4 C 24.5 95, 4.2 74.8, 4.5 49.8 C 4.8 24.5, 24.8 5.2, 50 4.5 Z"
              fill={circleColor || '#fbcfe8'}
            />
            {/* Paper wash shading */}
            <path
              d="M 50 4.5 C 75.5 3.8, 96.2 24.2, 95.8 49.5 C 95.4 75.2, 75.8 95.8, 50.2 95.4 C 24.5 95, 4.2 74.8, 4.5 49.8 C 4.8 24.5, 24.8 5.2, 50 4.5 Z"
              fill="url(#paper-wash-soft)"
            />

            {/* Secondary light graphite pencil sketch stroke (imperfect second pass) */}
            <path
              d="M 50.5 5 C 74.8 4.2, 95 25.5, 94.8 50 C 94.6 74.5, 74.2 94.5, 49.5 94.8 C 25.2 95.1, 5.2 75.2, 5 50.5 C 4.8 25.8, 25.5 5.8, 50.5 5"
              stroke={pencilColor}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="95 3 45 2"
              opacity="0.6"
            />

            {/* Primary charcoal ink stroke (handdrawn wobble line) */}
            <path
              d="M 50 4.5 C 75.5 3.8, 96.2 24.2, 95.8 49.5 C 95.4 75.2, 75.8 95.8, 50.2 95.4 C 24.5 95, 4.2 74.8, 4.5 49.8 C 4.8 24.5, 24.8 5.2, 50 4.5 Z"
              stroke={inkColor}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* --- HANDDRAWN EYEBROWS --- */}
        {expression === 'wink' ? (
          <g stroke={inkColor} strokeWidth="2.2" strokeLinecap="round">
            {/* Left normal eyebrow with slight organic curve */}
            <path d="M 28 33 Q 35 29 42 32" />
            {/* Right raised winking eyebrow */}
            <path d="M 57 29 Q 64 24 72 29" />
          </g>
        ) : expression === 'sparkle' || isHovered ? (
          <g stroke={inkColor} strokeWidth="2.4" strokeLinecap="round">
            {/* Expressive raised arches */}
            <path d="M 27 30 Q 35 25 43 29" />
            <path d="M 57 29 Q 65 25 73 30" />
          </g>
        ) : expression === 'cool' ? (
          <g stroke={inkColor} strokeWidth="2.2" strokeLinecap="round">
            {/* Relaxed slightly angled brows */}
            <path d="M 28 32 Q 35 31 42 33" />
            <path d="M 58 33 Q 65 31 72 32" />
          </g>
        ) : expression === 'grin' ? (
          <g stroke={inkColor} strokeWidth="2.3" strokeLinecap="round">
            {/* Cheerful high brows */}
            <path d="M 28 29 Q 35 24 43 28" />
            <path d="M 57 28 Q 65 24 72 29" />
          </g>
        ) : (
          <g stroke={inkColor} strokeWidth="2.2" strokeLinecap="round">
            {/* Natural gentle doodle eyebrows */}
            <path d="M 29 33 Q 35 29 42 32" />
            <path d="M 58 32 Q 65 29 71 33" />
          </g>
        )}

        {/* --- HANDDRAWN EYES --- */}
        {expression === 'cool' ? (
          // Hand-drawn sunglasses with ink pen outlines and pencil glare lines
          <g>
            {/* Left lens */}
            <path
              d="M 23 39 C 23 39, 44 38.5, 44.5 39 C 45 47, 42 54, 34 54 C 26 54, 23 48, 23 39 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Right lens */}
            <path
              d="M 55.5 39 C 56 38.5, 77 39, 77 39 C 77 48, 74 54, 66 54 C 58 54, 55 47, 55.5 39 Z"
              fill={inkColor}
              stroke={inkColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Hand-drawn bridge */}
            <path d="M 44.5 42 Q 50 39.5 55.5 42" stroke={inkColor} strokeWidth="2.6" strokeLinecap="round" />
            {/* Lens white glare strokes */}
            <path d="M 28 42 L 32 42 L 29 50" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            <path d="M 60 42 L 64 42 L 61 50" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          </g>
        ) : expression === 'wink' ? (
          <g>
            {/* Left Eye: Hand-drawn round ink eye with charming white highlight */}
            <path
              d="M 35 38.5 C 38.5 38.5, 41 41, 41 44.5 C 41 48, 38.5 50.5, 35 50.5 C 31.5 50.5, 29 48, 29 44.5 C 29 41, 31.5 38.5, 35 38.5 Z"
              fill={inkColor}
            />
            {/* White paper shine dot */}
            <circle cx="33.5" cy="42.5" r="2.2" fill="#ffffff" />
            <circle cx="37" cy="46" r="1.1" fill="#ffffff" />

            {/* Right Eye: Hand-sketched winking arch with charming flick */}
            <path
              d="M 57 45 Q 64 51.5 71 44.5"
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Sketched lash flicks */}
            <path d="M 70 44 L 74 41.5" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 71 47 L 75 46" stroke={inkColor} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        ) : expression === 'sparkle' ? (
          <g>
            {/* Left Eye: Hand-drawn doodle eye with 4-point star shine */}
            <path
              d="M 35 38.5 C 38.5 38.5, 41 41, 41 44.5 C 41 48, 38.5 50.5, 35 50.5 C 31.5 50.5, 29 48, 29 44.5 C 29 41, 31.5 38.5, 35 38.5 Z"
              fill={inkColor}
            />
            {/* Star sparkle shine */}
            <path
              d="M 34.5 41 L 35.5 39.5 L 36.5 41 L 38 42 L 36.5 43 L 35.5 44.5 L 34.5 43 L 33 42 Z"
              fill="#ffffff"
            />
            <circle cx="37" cy="46.5" r="1.1" fill="#ffffff" />

            {/* Right Eye: Hand-drawn doodle eye with 4-point star shine */}
            <path
              d="M 65 38.5 C 68.5 38.5, 71 41, 71 44.5 C 71 48, 68.5 50.5, 65 50.5 C 61.5 50.5, 59 48, 59 44.5 C 59 41, 61.5 38.5, 65 38.5 Z"
              fill={inkColor}
            />
            <path
              d="M 64.5 41 L 65.5 39.5 L 66.5 41 L 68 42 L 66.5 43 L 65.5 44.5 L 64.5 43 L 63 42 Z"
              fill="#ffffff"
            />
            <circle cx="67" cy="46.5" r="1.1" fill="#ffffff" />
          </g>
        ) : expression === 'warm' || expression === 'gentle' ? (
          // Adorable hand-sketched happy smiling eyes ( ^  ^ )
          <g stroke={inkColor} strokeWidth="3" strokeLinecap="round">
            <path d="M 28 46 Q 35 38.5 42 46" />
            <path d="M 58 46 Q 65 38.5 72 46" />
            {/* Tiny sketched lash ticks */}
            <path d="M 27 46 L 25 48" strokeWidth="1.8" />
            <path d="M 73 46 L 75 48" strokeWidth="1.8" />
          </g>
        ) : expression === 'grin' ? (
          // Joyful closed squinting doodle eyes ( > < )
          <g stroke={inkColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 27 42 L 36 47 L 27 52" />
            <path d="M 73 42 L 64 47 L 73 52" />
          </g>
        ) : expression === 'cheeky' ? (
          // Cheeky wink + open eye
          <g>
            <path
              d="M 35 38.5 C 38.5 38.5, 41 41, 41 44.5 C 41 48, 38.5 50.5, 35 50.5 C 31.5 50.5, 29 48, 29 44.5 C 29 41, 31.5 38.5, 35 38.5 Z"
              fill={inkColor}
            />
            <circle cx="33.5" cy="42.5" r="2.2" fill="#ffffff" />

            {/* Winking arch */}
            <path
              d="M 58 45 Q 65 51 72 44.5"
              stroke={inkColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path d="M 71 44 L 75 42" stroke={inkColor} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        ) : (
          // Default Happy: Natural hand-drawn ink dots with paper shine
          <g>
            <path
              d="M 35 39 C 38.2 39, 40.8 41.4, 40.8 44.5 C 40.8 47.8, 38.2 50.2, 35 50.2 C 31.8 50.2, 29.2 47.8, 29.2 44.5 C 29.2 41.4, 31.8 39, 35 39 Z"
              fill={inkColor}
            />
            <circle cx="33.5" cy="42.5" r="2" fill="#ffffff" />
            <circle cx="37" cy="46" r="1" fill="#ffffff" />

            <path
              d="M 65 39 C 68.2 39, 70.8 41.4, 70.8 44.5 C 70.8 47.8, 68.2 50.2, 65 50.2 C 61.8 50.2, 59.2 47.8, 59.2 44.5 C 59.2 41.4, 61.8 39, 65 39 Z"
              fill={inkColor}
            />
            <circle cx="63.5" cy="42.5" r="2" fill="#ffffff" />
            <circle cx="67" cy="46" r="1" fill="#ffffff" />
          </g>
        )}

        {/* --- HANDDRAWN GLASSES (wireframe spectacles with pencil bridge) --- */}
        {glasses && expression !== 'cool' && (
          <g stroke={inkColor} strokeWidth="2" fill="none">
            {/* Left wireframe circle with handdrawn wobble */}
            <path
              d="M 35 34 C 41 34, 45.5 38.5, 45.5 44.5 C 45.5 50.5, 40.8 55, 35 55 C 29 55, 24.5 50.5, 24.5 44.5 C 24.5 38.5, 29 34, 35 34 Z"
              fill="#ffffff"
              fillOpacity="0.25"
            />
            {/* Right wireframe circle */}
            <path
              d="M 65 34 C 71 34, 75.5 38.5, 75.5 44.5 C 75.5 50.5, 70.8 55, 65 55 C 59 55, 54.5 50.5, 54.5 44.5 C 54.5 38.5, 59 34, 65 34 Z"
              fill="#ffffff"
              fillOpacity="0.25"
            />
            {/* Bridge */}
            <path d="M 45.5 44 Q 50 41.5 54.5 44" strokeLinecap="round" />
            {/* Temples */}
            <path d="M 24.5 43.5 L 18 42" strokeLinecap="round" />
            <path d="M 75.5 43.5 L 82 42" strokeLinecap="round" />
          </g>
        )}

        {/* --- SOFT PASTEL CHALK BLUSH + SKETCH HATCH LINES --- */}
        {blush && (
          <g>
            {/* Left cheek pastel chalk smudge */}
            <ellipse
              cx="23"
              cy="53"
              rx="7"
              ry="4.5"
              fill={blushChalk}
              opacity={isHovered ? 0.55 : 0.38}
              filter="url(#pastel-chalk-smudge)"
            />
            {/* Handdrawn pencil blush tick marks // */}
            <g stroke={pencilColor} strokeWidth="1.3" strokeLinecap="round" opacity="0.6">
              <line x1="20" y1="55" x2="23" y2="51" />
              <line x1="24" y1="55" x2="27" y2="51" />
            </g>

            {/* Right cheek pastel chalk smudge */}
            <ellipse
              cx="77"
              cy="53"
              rx="7"
              ry="4.5"
              fill={blushChalk}
              opacity={isHovered ? 0.55 : 0.38}
              filter="url(#pastel-chalk-smudge)"
            />
            {/* Handdrawn pencil blush tick marks // */}
            <g stroke={pencilColor} strokeWidth="1.3" strokeLinecap="round" opacity="0.6">
              <line x1="74" y1="55" x2="77" y2="51" />
              <line x1="78" y1="55" x2="81" y2="51" />
            </g>
          </g>
        )}

        {/* --- DELICATE HANDDRAWN FRECKLES --- */}
        {freckles && (
          <g fill={pencilColor} opacity="0.75">
            <circle cx="26" cy="51" r="0.9" />
            <circle cx="29" cy="53" r="0.9" />
            <circle cx="25" cy="55" r="0.8" />
            <circle cx="48" cy="52" r="0.7" />
            <circle cx="52" cy="53" r="0.8" />
            <circle cx="71" cy="53" r="0.9" />
            <circle cx="74" cy="51" r="0.9" />
            <circle cx="75" cy="55" r="0.8" />
          </g>
        )}

        {/* --- NATURAL HANDDRAWN MOUTH --- */}
        {expression === 'grin' || expression === 'sparkle' || isHovered ? (
          // Joyful open doodle mouth with hand-drawn charcoal outline and pastel pink tongue
          <g>
            <path
              d="M 39 56.5 Q 50 71 61 56.5 Z"
              fill={mouthInk}
              stroke={inkColor}
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Cute pastel tongue */}
            <path
              d="M 43 62 Q 50 58 57 62 Q 50 69 43 62 Z"
              fill={tonguePastel}
            />
            {/* Dimple ticks at mouth corners */}
            <path d="M 37.5 55.5 L 39 58" stroke={inkColor} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 62.5 55.5 L 61 58" stroke={inkColor} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        ) : expression === 'cheeky' ? (
          // Cheeky cat-mouth / wavy smile with little tongue sticking out :P
          <g>
            <path
              d="M 39 57.5 Q 44.5 62.5 49.5 58.5 Q 54.5 62.5 60.5 57.5"
              stroke={inkColor}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Little pink tongue poking out */}
            <path
              d="M 48 59.5 Q 50.5 67 53 59.5 Z"
              fill={tonguePastel}
              stroke={inkColor}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </g>
        ) : expression === 'cool' ? (
          // Subtle wry doodle smirk with dimple
          <g>
            <path
              d="M 43 59.5 Q 52 61.5 59 56.5"
              stroke={inkColor}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path d="M 58 55 L 60 58" stroke={inkColor} strokeWidth="1.8" strokeLinecap="round" />
          </g>
        ) : (
          // Sweet natural curved doodle smile with corner dimples
          <g>
            <path
              d="M 41 57.5 Q 50 65.5 59 57.5"
              stroke={inkColor}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Subtle sketched dimple ticks */}
            <path d="M 39.5 56.5 L 41 58.5" stroke={inkColor} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 60.5 56.5 L 59 58.5" stroke={inkColor} strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
