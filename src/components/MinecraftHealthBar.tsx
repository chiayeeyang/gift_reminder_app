import React from 'react';

interface MinecraftHealthBarProps {
  currentHp: number; // 0 - 20
  maxHp?: number; // default 20
  isGiftSent?: boolean;
  isDead?: boolean;
  size?: 'compact' | 'normal' | 'large';
  showLabel?: boolean;
  showBar?: boolean;
  className?: string;
}

/**
 * Single Minecraft Pixel Heart component
 * Types:
 * - full: standard 2 HP red heart
 * - half: 1 HP half-red heart
 * - empty: 0 HP dark hollow heart
 * - gold: full golden absorption heart (gift sent!)
 * - dead: withered/grey hollow heart (player died)
 */
export const MinecraftHeart: React.FC<{
  type: 'full' | 'half' | 'empty' | 'gold' | 'dead';
  size?: 'compact' | 'normal' | 'large';
  animatePulse?: boolean;
}> = ({ type, size = 'normal', animatePulse = false }) => {
  const pixelSize = size === 'compact' ? 10 : size === 'large' ? 18 : 14;

  let fillColor = '#e11d48'; // Bright Minecraft Red
  let shadeColor = '#9f1239'; // Dark red shadow
  let shineColor = '#ffffff'; // White glint

  if (type === 'gold') {
    fillColor = '#f59e0b'; // Minecraft Gold
    shadeColor = '#b45309';
    shineColor = '#fef08a';
  } else if (type === 'dead') {
    fillColor = '#374151'; // Wither / Dead Ash Gray
    shadeColor = '#1f2937';
    shineColor = '#6b7280';
  }

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={`shrink-0 ${animatePulse ? 'animate-bounce' : ''}`}
    >
      {/* Minecraft Heart Pixel Grid (9x9) */}
      {/* Black Outer Pixel Border */}
      <rect x="1" y="0" width="3" height="1" fill="#000000" />
      <rect x="5" y="0" width="3" height="1" fill="#000000" />
      <rect x="0" y="1" width="1" height="3" fill="#000000" />
      <rect x="4" y="1" width="1" height="2" fill="#000000" />
      <rect x="8" y="1" width="1" height="3" fill="#000000" />
      <rect x="0" y="4" width="1" height="1" fill="#000000" />
      <rect x="8" y="4" width="1" height="1" fill="#000000" />
      <rect x="1" y="5" width="1" height="1" fill="#000000" />
      <rect x="7" y="5" width="1" height="1" fill="#000000" />
      <rect x="2" y="6" width="1" height="1" fill="#000000" />
      <rect x="6" y="6" width="1" height="1" fill="#000000" />
      <rect x="3" y="7" width="1" height="1" fill="#000000" />
      <rect x="5" y="7" width="1" height="1" fill="#000000" />
      <rect x="4" y="8" width="1" height="1" fill="#000000" />

      {/* Heart Background / Interior */}
      {type === 'empty' ? (
        // Empty Heart (Dark slot container)
        <>
          <rect x="1" y="1" width="3" height="3" fill="#262529" />
          <rect x="5" y="1" width="3" height="3" fill="#262529" />
          <rect x="1" y="4" width="7" height="1" fill="#262529" />
          <rect x="2" y="5" width="5" height="1" fill="#262529" />
          <rect x="3" y="6" width="3" height="1" fill="#262529" />
          <rect x="4" y="7" width="1" height="1" fill="#262529" />
          {/* Subtle interior rim */}
          <rect x="1" y="1" width="1" height="1" fill="#44424a" />
          <rect x="5" y="1" width="1" height="1" fill="#44424a" />
        </>
      ) : type === 'half' ? (
        // Half Heart: Left half filled, right half empty
        <>
          {/* Right empty half */}
          <rect x="5" y="1" width="3" height="3" fill="#262529" />
          <rect x="5" y="4" width="3" height="1" fill="#262529" />
          <rect x="5" y="5" width="2" height="1" fill="#262529" />
          <rect x="5" y="6" width="1" height="1" fill="#262529" />

          {/* Left filled half */}
          <rect x="1" y="1" width="3" height="3" fill={fillColor} />
          <rect x="1" y="4" width="4" height="1" fill={fillColor} />
          <rect x="2" y="5" width="3" height="1" fill={fillColor} />
          <rect x="3" y="6" width="2" height="1" fill={fillColor} />
          <rect x="4" y="7" width="1" height="1" fill={fillColor} />

          {/* Left Glint */}
          <rect x="1" y="1" width="1" height="1" fill={shineColor} />
          {/* Left Dark Shade */}
          <rect x="1" y="4" width="1" height="1" fill={shadeColor} />
          <rect x="2" y="5" width="1" height="1" fill={shadeColor} />
        </>
      ) : (
        // Full Heart (Red, Gold, or Dead Wither)
        <>
          <rect x="1" y="1" width="3" height="3" fill={fillColor} />
          <rect x="5" y="1" width="3" height="3" fill={fillColor} />
          <rect x="1" y="4" width="7" height="1" fill={fillColor} />
          <rect x="2" y="5" width="5" height="1" fill={fillColor} />
          <rect x="3" y="6" width="3" height="1" fill={fillColor} />
          <rect x="4" y="7" width="1" height="1" fill={fillColor} />

          {/* Glint highlights */}
          <rect x="1" y="1" width="1" height="1" fill={shineColor} />
          <rect x="5" y="1" width="1" height="1" fill={shineColor} />

          {/* Bottom shadow bevel */}
          <rect x="1" y="4" width="1" height="1" fill={shadeColor} />
          <rect x="7" y="4" width="1" height="1" fill={shadeColor} />
          <rect x="2" y="5" width="1" height="1" fill={shadeColor} />
          <rect x="6" y="5" width="1" height="1" fill={shadeColor} />
          <rect x="3" y="6" width="1" height="1" fill={shadeColor} />
          <rect x="5" y="6" width="1" height="1" fill={shadeColor} />
          <rect x="4" y="7" width="1" height="1" fill={shadeColor} />
        </>
      )}
    </svg>
  );
};

export const MinecraftHealthBar: React.FC<MinecraftHealthBarProps> = ({
  currentHp,
  maxHp = 20,
  isGiftSent = false,
  isDead = false,
  size = 'normal',
  showLabel = true,
  showBar = false,
  className = '',
}) => {
  const hp = Math.max(0, Math.min(maxHp, currentHp));
  const isCritical = !isGiftSent && !isDead && hp <= 4;
  const isDeadState = isDead || hp === 0;

  // 10 hearts in Minecraft (each heart = 2 HP)
  const totalHearts = 10;
  const hearts: Array<'full' | 'half' | 'empty' | 'gold' | 'dead'> = [];

  for (let i = 0; i < totalHearts; i++) {
    const heartHpThreshold = (i + 1) * 2;

    if (isDeadState) {
      hearts.push('dead');
    } else if (isGiftSent) {
      hearts.push('gold');
    } else if (hp >= heartHpThreshold) {
      hearts.push('full');
    } else if (hp >= heartHpThreshold - 1) {
      hearts.push('half');
    } else {
      hearts.push('empty');
    }
  }

  return (
    <div className={`flex flex-col gap-1 font-pixel ${className}`}>
      {/* 10 Hearts Row */}
      <div className="flex items-center gap-0.5 select-none">
        {hearts.map((heartType, index) => (
          <MinecraftHeart
            key={index}
            type={heartType}
            size={size}
            animatePulse={isCritical && (heartType === 'full' || heartType === 'half')}
          />
        ))}

        {/* Optional Label next to or under hearts */}
        {showLabel && (
          <span
            className={`font-bold ml-1.5 whitespace-nowrap leading-none ${
              size === 'compact'
                ? 'text-[9px]'
                : size === 'large'
                ? 'text-xs sm:text-sm'
                : 'text-[10px]'
            } ${
              isDeadState
                ? 'text-[#ff5555] animate-pulse mc-text-shadow'
                : isGiftSent
                ? 'text-[#fef08a] mc-text-shadow'
                : isCritical
                ? 'text-[#ff5555] animate-pulse mc-text-shadow'
                : hp <= 10
                ? 'text-[#ffaa00] mc-text-shadow'
                : 'text-[#55ff55] mc-text-shadow'
            }`}
          >
            {isDeadState
              ? '☠️ 0/20 HP (DIED)'
              : isGiftSent
              ? '✨ 20/20 HP (SAFE)'
              : `${hp}/${maxHp} HP`}
          </span>
        )}
      </div>

      {/* Optional Minecraft XP/Health Gauge Bar */}
      {showBar && (
        <div className="w-full h-2 mc-slot p-0.5">
          <div
            className={`h-full transition-all duration-300 ${
              isDeadState
                ? 'bg-[#374151]'
                : isGiftSent
                ? 'bg-[#fbbf24]'
                : isCritical
                ? 'bg-[#ff5555]'
                : hp <= 10
                ? 'bg-[#f59e0b]'
                : 'bg-[#22c55e]'
            }`}
            style={{ width: `${Math.min(100, Math.round((hp / maxHp) * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
};
