import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Person } from '../types';
import { useGifts } from '../context/GiftContext';
import { calculateDaysUntil } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import {
  Sparkles,
  Plus,
  Filter,
  Info,
  Search,
  Zap,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

interface LandingCirclesPageProps {
  onSelectPerson: (person: Person) => void;
  onOpenNewPersonModal: () => void;
  onOpenNewGiftModal: () => void;
}

interface PhysicsCircle {
  id: string;
  person: Person;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  isHovered: boolean;
  daysUntil: number;
  urgencyTier: 'today' | 'urgent' | 'soon' | 'upcoming' | 'later';
  giftCount: number;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  hasMovedDuringDrag: boolean;
  collisionEnergy: number;
}

export const LandingCirclesPage: React.FC<LandingCirclesPageProps> = ({
  onSelectPerson,
  onOpenNewPersonModal,
}) => {
  const { people, gifts } = useGifts();
  const [selectedRelation, setSelectedRelation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);

  // Measured arena dimensions in state so React re-renders adaptive avatar sizes
  const [arenaDimensions, setArenaDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 24, 950) : 800,
    height: typeof window !== 'undefined' && window.innerWidth < 640 ? 460 : 600,
  });

  // Screen container and physics refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const physicsCirclesRef = useRef<PhysicsCircle[]>([]);
  const containerSizeRef = useRef<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 24, 950) : 800,
    height: typeof window !== 'undefined' && window.innerWidth < 640 ? 460 : 600,
  });
  const animationFrameRef = useRef<number | null>(null);

  // Pointer / Touch tracking
  const pointerRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    prevX: number;
    prevY: number;
    isInside: boolean;
  }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    prevX: -1000,
    prevY: -1000,
    isInside: false,
  });

  const draggedCircleRef = useRef<PhysicsCircle | null>(null);

  // Calculate dynamic radius responsive to screen width
  const getResponsiveRadius = useCallback((daysUntil: number, containerWidth: number): number => {
    // Phone screen (< 500px): Small compact avatars so 5-10 people have generous room to move around
    if (containerWidth < 500) {
      if (daysUntil === 0) return 32;       // 64px diameter
      if (daysUntil <= 7) return 29;        // 58px diameter
      if (daysUntil <= 14) return 26;       // 52px diameter
      if (daysUntil <= 35) return 23;       // 46px diameter
      if (daysUntil <= 90) return 21;       // 42px diameter
      return 19;                           // 38px diameter
    }

    // Tablet screen (500px to 800px)
    if (containerWidth < 800) {
      if (daysUntil === 0) return 44;       // 88px diameter
      if (daysUntil <= 7) return 40;        // 80px diameter
      if (daysUntil <= 14) return 36;       // 72px diameter
      if (daysUntil <= 35) return 32;       // 64px diameter
      if (daysUntil <= 90) return 28;       // 56px diameter
      return 25;                           // 50px diameter
    }

    // Desktop screen (>= 800px)
    if (daysUntil === 0) return 56;         // 112px diameter
    if (daysUntil <= 7) return 50;          // 100px diameter
    if (daysUntil <= 14) return 44;         // 88px diameter
    if (daysUntil <= 35) return 38;         // 76px diameter
    if (daysUntil <= 90) return 33;         // 66px diameter
    return 29;                             // 58px diameter
  }, []);

  // Calculate days until birthday and radius for each person
  const peopleWithProximity = useMemo(() => {
    const width = arenaDimensions.width || 600;

    return people.map((person) => {
      const { days } = calculateDaysUntil(person.birthMonth, person.birthDay);
      const radius = getResponsiveRadius(days, width);

      let urgencyTier: 'today' | 'urgent' | 'soon' | 'upcoming' | 'later' = 'later';
      if (days === 0) {
        urgencyTier = 'today';
      } else if (days <= 7) {
        urgencyTier = 'urgent';
      } else if (days <= 14) {
        urgencyTier = 'urgent';
      } else if (days <= 35) {
        urgencyTier = 'soon';
      } else if (days <= 90) {
        urgencyTier = 'upcoming';
      } else {
        urgencyTier = 'later';
      }

      const personGifts = gifts.filter((g) => g.recipientId === person.id && !g.archived);

      return {
        ...person,
        daysUntil: days,
        radius,
        urgencyTier,
        giftCount: personGifts.length,
      };
    });
  }, [people, gifts, arenaDimensions.width, getResponsiveRadius]);

  // Filtered people
  const filteredPeople = useMemo(() => {
    return peopleWithProximity.filter((p) => {
      if (selectedRelation !== 'all' && p.relationship !== selectedRelation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchInterest = p.interests?.some((i) => i.toLowerCase().includes(q));
        if (!matchName && !matchInterest) return false;
      }
      return true;
    });
  }, [peopleWithProximity, selectedRelation, searchQuery]);

  // Initialize or update physics circles positions
  useEffect(() => {
    const { width, height } = containerSizeRef.current;
    const currentList = physicsCirclesRef.current;
    const newCircles: PhysicsCircle[] = [];

    filteredPeople.forEach((person, index) => {
      const existing = currentList.find((c) => c.id === person.id);
      const targetRadius = person.radius;

      if (existing) {
        // Keep current position and velocity, update metadata and radius
        newCircles.push({
          ...existing,
          person,
          radius: targetRadius,
          mass: (targetRadius * targetRadius) / 600,
          daysUntil: person.daysUntil,
          urgencyTier: person.urgencyTier,
          giftCount: person.giftCount,
        });
      } else {
        // Place new circle gracefully in grid inside container
        const total = filteredPeople.length;
        const cols = Math.ceil(Math.sqrt(total * 1.3)) || 1;
        const col = index % cols;
        const row = Math.floor(index / cols);

        const padX = Math.min(30, width * 0.08);
        const padY = Math.min(30, height * 0.08);
        const cellW = (width - padX * 2) / Math.max(1, cols);
        const cellH = (height - padY * 2) / Math.max(1, Math.ceil(total / cols));

        const initX = Math.min(
          Math.max(targetRadius + 6, padX + col * cellW + cellW / 2 + (Math.random() * 16 - 8)),
          width - targetRadius - 6
        );
        const initY = Math.min(
          Math.max(targetRadius + 6, padY + row * cellH + cellH / 2 + (Math.random() * 16 - 8)),
          height - targetRadius - 6
        );

        // Gentle random initial velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 0.6;

        newCircles.push({
          id: person.id,
          person,
          radius: targetRadius,
          x: initX,
          y: initY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          mass: (targetRadius * targetRadius) / 600,
          isHovered: false,
          daysUntil: person.daysUntil,
          urgencyTier: person.urgencyTier,
          giftCount: person.giftCount,
          isDragging: false,
          dragStartX: 0,
          dragStartY: 0,
          hasMovedDuringDrag: false,
          collisionEnergy: 0,
        });
      }
    });

    physicsCirclesRef.current = newCircles;
  }, [filteredPeople]);

  // Observe container size with ResizeObserver for live mobile orientation/viewport responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          containerSizeRef.current = { width, height };
          setArenaDimensions({ width, height });

          // Keep all circles strictly within bounds and update radii immediately
          physicsCirclesRef.current.forEach((c) => {
            const newRadius = getResponsiveRadius(c.daysUntil, width);
            c.radius = newRadius;
            c.mass = (newRadius * newRadius) / 600;

            if (c.x - c.radius < 0) c.x = c.radius + 2;
            if (c.x + c.radius > width) c.x = width - c.radius - 2;
            if (c.y - c.radius < 0) c.y = c.radius + 2;
            if (c.y + c.radius > height) c.y = height - c.radius - 2;
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [getResponsiveRadius]);

  // Main 60fps Physics & Collision Engine
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updatePhysics = (now: number) => {
      const dt = Math.min(2.0, (now - lastTime) / 16.666);
      lastTime = now;

      const { width, height } = containerSizeRef.current;
      const circles = physicsCirclesRef.current;
      const pointer = pointerRef.current;

      // Update pointer velocity
      if (pointer.isInside && pointer.prevX > -500) {
        pointer.vx = (pointer.x - pointer.prevX) * 0.4;
        pointer.vy = (pointer.y - pointer.prevY) * 0.4;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;

      // 1. Pointer Interaction / Hover / Touch Impulse
      if (pointer.isInside && !draggedCircleRef.current) {
        for (let i = 0; i < circles.length; i++) {
          const c = circles[i];
          const mdx = c.x - pointer.x;
          const mdy = c.y - pointer.y;
          const mdist = Math.hypot(mdx, mdy);

          // Interaction boundary: larger on mobile touch for easy interaction
          const interactDist = c.radius + (width < 500 ? 24 : 18);

          if (mdist < interactDist) {
            c.isHovered = true;

            // Apply push impulse away from finger/mouse
            const pushDirX = mdist > 0.001 ? mdx / mdist : 1;
            const pushDirY = mdist > 0.001 ? mdy / mdist : 0;
            const pushStrength = Math.min(4.8, (interactDist - mdist) * 0.2 + 1.0);

            c.vx += (pushDirX * pushStrength + pointer.vx * 0.4) * dt;
            c.vy += (pushDirY * pushStrength + pointer.vy * 0.4) * dt;
          } else {
            c.isHovered = false;
          }
        }
      }

      // 2. Pairwise Circle-to-Circle Elastic Collisions
      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          const c1 = circles[i];
          const c2 = circles[j];

          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = c1.radius + c2.radius;

          // Collision detected!
          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            // Separate circles smoothly
            const totalMass = c1.mass + c2.mass;
            const m1Ratio = c2.mass / totalMass;
            const m2Ratio = c1.mass / totalMass;

            if (!c1.isDragging) {
              c1.x -= nx * overlap * m1Ratio;
              c1.y -= ny * overlap * m1Ratio;
            }
            if (!c2.isDragging) {
              c2.x += nx * overlap * m2Ratio;
              c2.y += ny * overlap * m2Ratio;
            }

            // Relative velocity
            const dvx = c2.vx - c1.vx;
            const dvy = c2.vy - c1.vy;
            const velAlongNormal = dvx * nx + dvy * ny;

            // Bounce when moving towards each other
            if (velAlongNormal < 0) {
              const restitution = 0.9;
              const impulse = -(1 + restitution) * velAlongNormal / (1 / c1.mass + 1 / c2.mass);

              if (!c1.isDragging) {
                c1.vx -= (impulse / c1.mass) * nx;
                c1.vy -= (impulse / c1.mass) * ny;
              }
              if (!c2.isDragging) {
                c2.vx += (impulse / c2.mass) * nx;
                c2.vy += (impulse / c2.mass) * ny;
              }

              c1.collisionEnergy = 1.0;
              c2.collisionEnergy = 1.0;
            }
          }
        }
      }

      // 3. Wall Collisions (Screen Container Bounds)
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        if (c.isDragging) continue;

        const wallRestitution = 0.88;

        // Left wall
        if (c.x - c.radius < 0) {
          c.x = c.radius;
          c.vx = Math.abs(c.vx) * wallRestitution;
          c.collisionEnergy = 0.6;
        }
        // Right wall
        if (c.x + c.radius > width) {
          c.x = width - c.radius;
          c.vx = -Math.abs(c.vx) * wallRestitution;
          c.collisionEnergy = 0.6;
        }
        // Top wall
        if (c.y - c.radius < 0) {
          c.y = c.radius;
          c.vy = Math.abs(c.vy) * wallRestitution;
          c.collisionEnergy = 0.6;
        }
        // Bottom wall
        if (c.y + c.radius > height) {
          c.y = height - c.radius;
          c.vy = -Math.abs(c.vy) * wallRestitution;
          c.collisionEnergy = 0.6;
        }

        // Damping / Air resistance
        c.vx *= Math.pow(0.992, dt);
        c.vy *= Math.pow(0.992, dt);

        // Speed clamping
        const speed = Math.hypot(c.vx, c.vy);
        const maxSpeed = width < 500 ? 9.0 : 12.0;
        if (speed > maxSpeed) {
          c.vx = (c.vx / speed) * maxSpeed;
          c.vy = (c.vy / speed) * maxSpeed;
        }

        // Ambient gentle buoyancy (they wander freely across the arena)
        const minSpeed = width < 500 ? 0.3 : 0.4;
        if (speed < minSpeed) {
          const driftAngle = (c.id.charCodeAt(0) * 0.7 + now * 0.0003) % (Math.PI * 2);
          c.vx += Math.cos(driftAngle) * 0.07 * dt;
          c.vy += Math.sin(driftAngle) * 0.07 * dt;
        }

        // Update position
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        // Decay collision energy
        if (c.collisionEnergy > 0) {
          c.collisionEnergy = Math.max(0, c.collisionEnergy - 0.04 * dt);
        }
      }

      // 4. Update DOM transforms directly for GPU-accelerated rendering
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const el = circleElementsRef.current.get(c.id);
        if (el) {
          const left = c.x - c.radius;
          const top = c.y - c.radius;
          el.style.transform = `translate3d(${left}px, ${top}px, 0)`;

          if (c.collisionEnergy > 0.3) {
            el.style.filter = `drop-shadow(0 0 ${Math.round(c.collisionEnergy * 6)}px ${c.person.avatarColor}99)`;
          } else {
            el.style.filter = '';
          }
        }
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    animationFrameRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  // Nudge / scatter all circles with an energetic impulse
  const handleNudgeAll = useCallback(() => {
    const circles = physicsCirclesRef.current;
    circles.forEach((c) => {
      const angle = Math.random() * Math.PI * 2;
      const boost = 3.5 + Math.random() * 4.0;
      c.vx += Math.cos(angle) * boost;
      c.vy += Math.sin(angle) * boost;
      c.collisionEnergy = 1.0;
    });
  }, []);

  // Reset positions nicely spaced inside the container
  const handleResetPositions = useCallback(() => {
    const { width, height } = containerSizeRef.current;
    const circles = physicsCirclesRef.current;
    const count = circles.length;
    const cols = Math.ceil(Math.sqrt(count * 1.3)) || 1;
    const rows = Math.ceil(count / cols);

    const padX = Math.min(30, width * 0.08);
    const padY = Math.min(30, height * 0.08);
    const cellW = (width - padX * 2) / cols;
    const cellH = (height - padY * 2) / rows;

    circles.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      c.x = padX + col * cellW + cellW / 2;
      c.y = padY + row * cellH + cellH / 2;
      const angle = Math.random() * Math.PI * 2;
      c.vx = Math.cos(angle) * 1.2;
      c.vy = Math.sin(angle) * 1.2;
    });
  }, []);

  // Pointer / Touch handlers supporting both touch and mouse seamlessly
  const getPointerCoordinates = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { x, y } = getPointerCoordinates(e);

    pointerRef.current.x = x;
    pointerRef.current.y = y;
    pointerRef.current.isInside = true;

    // Handle active drag if dragging an avatar
    if (draggedCircleRef.current) {
      const circle = draggedCircleRef.current;
      const dx = x - circle.dragStartX;
      const dy = y - circle.dragStartY;
      if (Math.hypot(dx, dy) > 5) {
        circle.hasMovedDuringDrag = true;
      }
      const { width, height } = containerSizeRef.current;
      circle.x = Math.max(circle.radius, Math.min(width - circle.radius, x));
      circle.y = Math.max(circle.radius, Math.min(height - circle.radius, y));
      // Give realistic release/throw velocity
      circle.vx = pointerRef.current.vx * 1.2;
      circle.vy = pointerRef.current.vy * 1.2;
    }
  };

  const handlePointerEnter = () => {
    pointerRef.current.isInside = true;
  };

  const handlePointerLeave = () => {
    pointerRef.current.isInside = false;
    pointerRef.current.x = -1000;
    pointerRef.current.y = -1000;
    setHoveredPersonId(null);
    if (draggedCircleRef.current) {
      draggedCircleRef.current.isDragging = false;
      draggedCircleRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (draggedCircleRef.current) {
      const circle = draggedCircleRef.current;
      const wasDragging = circle.hasMovedDuringDrag;
      circle.isDragging = false;
      draggedCircleRef.current = null;

      // If user tapped cleanly without dragging, open dossier!
      if (!wasDragging) {
        onSelectPerson(circle.person);
      }
    }
  };

  // Drag initiation on a circle avatar with pointer capture
  const handleCirclePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    personId: string
  ) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Graceful fallback
    }

    const { x, y } = getPointerCoordinates(e);
    const circle = physicsCirclesRef.current.find((c) => c.id === personId);
    if (circle) {
      circle.isDragging = true;
      circle.dragStartX = x;
      circle.dragStartY = y;
      circle.hasMovedDuringDrag = false;
      circle.vx = 0;
      circle.vy = 0;
      draggedCircleRef.current = circle;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-between select-none font-pixel">
      {/* Top Controls & Header Bar */}
      <div className="w-full max-w-6xl mx-auto pt-1 pb-3 px-2 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-mc text-[#ffffff] mc-text-shadow tracking-wider flex items-center gap-2">
              <span>PLAYER HEADS ARENA</span>
            </h1>
            <span className="px-1.5 sm:px-2 py-0.5 bg-[#2b7730] text-[#ffffff] border-2 border-black text-[10px] sm:text-xs font-pixel flex items-center gap-1 shadow-[2px_2px_0_#000000]">
              <Sparkles className="w-3 h-3 text-[#55ff55]" />
              PHYSICS LIVE
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#a3a4ab] mt-0.5 mc-text-shadow-sm">
            Drag, fling, or tap loved ones to open player gift quests. Closer birthdays wear gold helmets!
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewPersonModal}
            className="mc-button-emerald px-3 sm:px-4 py-1.5 sm:py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#a5d6a7]" />
            <span>Spawn Player</span>
          </button>
        </div>
      </div>

      {/* Filter and relationship bar */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[#80ff20] font-mc text-[9px] sm:text-[10px] mr-1 flex items-center gap-1 mc-text-shadow">
            <Filter className="w-3 h-3 text-[#80ff20]" /> FILTER:
          </span>
          {[
            { id: 'all', label: '[ALL]' },
            { id: 'partner', label: '❤️ Partner' },
            { id: 'family', label: '🏡 Family' },
            { id: 'friend', label: '✨ Friends' },
            { id: 'colleague', label: '💼 Guild' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedRelation(pill.id)}
              className={`px-2 sm:px-3 py-1 text-xs font-pixel border-2 transition-none ${
                selectedRelation === pill.id
                  ? 'bg-[#404149] text-[#ffff55] border-white shadow-[inset_2px_2px_0_#626470,inset_-2px_-2px_0_#1e1f24]'
                  : 'mc-button'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Quick search input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7.5 pr-2.5 py-1 mc-input text-xs placeholder-[#777777]"
          />
        </div>
      </div>

      {/* THE MINECRAFT ARENA CONTAINER (Touch & Pointer Enabled) */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 flex-1 flex flex-col">
        <div
          id="physics-screen-container"
          ref={containerRef}
          onPointerDown={handlePointerMove}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-[460px] sm:h-[540px] lg:h-[620px] border-4 border-[#000000] bg-[#161519] shadow-[6px_6px_0_#000000] relative overflow-hidden flex-1 cursor-crosshair select-none touch-none"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #100f12 25%, transparent 25%), 
              linear-gradient(-45deg, #100f12 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #100f12 75%), 
              linear-gradient(-45deg, transparent 75%, #100f12 75%)
            `,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 0 16px, 16px -16px, -16px 0px',
          }}
        >
          {/* Minecraft Top Inventory Bevel Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#3a3b42] border-b border-[#0a0a0c] pointer-events-none z-20" />

          {/* Screen Bezel HUD (Top Bar) */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
            {/* Action Bar status */}
            <div className="flex items-center gap-1.5 px-2 py-1 mc-panel-dark border-2 border-black text-[#ffffff] text-xs font-pixel shadow-[2px_2px_0_#000000]">
              <span className="w-2 h-2 bg-[#55ff55] border border-black animate-pulse" />
              <span className="mc-text-shadow text-[#80ff20] font-pixel text-[10px] sm:text-xs tracking-wide">
                <span className="hidden sm:inline">⛏️ ARENA ACTIVE • Touch or hover to bounce</span>
                <span className="sm:hidden">⛏️ ARENA • Tap or fling</span>
              </span>
            </div>

            {/* Interactive Screen Controls */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={handleNudgeAll}
                className="mc-button-gold px-2.5 py-1 text-xs flex items-center gap-1"
                title="Send a bounce impulse through all players"
              >
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
                <span className="hidden sm:inline">Nudge</span>
              </button>

              <button
                onClick={handleResetPositions}
                className="mc-button p-1 text-xs"
                title="Reset layout"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Render All Physics Circles with Responsive Diameter */}
          {filteredPeople.map((person) => {
            const isHovered = hoveredPersonId === person.id;
            const diameter = person.radius * 2;
            const faceSize = Math.max(28, Math.round(diameter * 0.74));

            return (
              <div
                key={person.id}
                id={`circle-person-${person.id}`}
                ref={(el) => {
                  if (el) {
                    circleElementsRef.current.set(person.id, el);
                  } else {
                    circleElementsRef.current.delete(person.id);
                  }
                }}
                onPointerEnter={() => setHoveredPersonId(person.id)}
                onPointerLeave={() => setHoveredPersonId(null)}
                onPointerDown={(e) => handleCirclePointerDown(e, person.id)}
                className="absolute top-0 left-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing will-change-transform z-10 touch-none"
                style={{
                  width: diameter,
                  height: diameter,
                  filter: isHovered
                    ? 'drop-shadow(0 0 6px #ffff55) drop-shadow(4px 4px 0 #000000)'
                    : 'drop-shadow(3px 3px 0 #000000)',
                }}
              >
                {/* MINECRAFT BLOCK CONTAINER / ITEM FRAME BACKGROUND */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  shapeRendering="crispEdges"
                >
                  {/* Outer Black Pixel Border */}
                  <rect x="0" y="0" width="100" height="100" fill="#000000" />

                  {/* 3D Beveled Block Outline */}
                  <rect x="3" y="3" width="94" height="94" fill="#3a3835" />
                  {/* Inner Wood / Stone Tile */}
                  <rect x="6" y="6" width="88" height="88" fill={person.avatarColor || '#6d4c41'} />
                  {/* Recessed Slot Screen */}
                  <rect x="9" y="9" width="82" height="82" fill="#1b1a1f" />

                  {/* Top & Left Bevel Highlight */}
                  <rect x="3" y="3" width="94" height="3" fill="#ffffff" opacity="0.4" />
                  <rect x="3" y="3" width="3" height="94" fill="#ffffff" opacity="0.4" />
                  {/* Bottom & Right Bevel Shadow */}
                  <rect x="3" y="94" width="94" height="3" fill="#000000" opacity="0.8" />
                  <rect x="94" y="3" width="3" height="94" fill="#000000" opacity="0.8" />

                  {/* Birthday Celebration Crown / Helmet if <= 7 days or today! */}
                  {(person.urgencyTier === 'urgent' || person.urgencyTier === 'today') && (
                    <g transform="translate(20, -10)">
                      {/* Pixelated Golden Crown */}
                      <rect x="0" y="0" width="60" height="16" fill="#000000" />
                      <rect x="2" y="4" width="56" height="10" fill="#f59e0b" />
                      {/* Crown Peaks */}
                      <rect x="2" y="0" width="10" height="8" fill="#fbbf24" />
                      <rect x="24" y="-3" width="12" height="11" fill="#fef08a" />
                      <rect x="48" y="0" width="10" height="8" fill="#fbbf24" />
                      {/* Gems in crown */}
                      <rect x="6" y="7" width="4" height="4" fill="#ef4444" />
                      <rect x="28" y="5" width="4" height="4" fill="#38bdf8" />
                      <rect x="50" y="7" width="4" height="4" fill="#22c55e" />
                    </g>
                  )}
                </svg>

                {/* THE MINECRAFT 8x8 / 16x16 PLAYER HEAD */}
                <div className="relative flex items-center justify-center pointer-events-none -mt-0.5 z-10">
                  <CuteFace
                    name={person.name}
                    config={person.cuteFace}
                    size={faceSize}
                    isHovered={isHovered}
                  />
                </div>

                {/* MINECRAFT PLAYER NAMETAG */}
                <div className="absolute -bottom-2.5 inset-x-0.5 flex flex-col items-center justify-center pointer-events-none z-20">
                  <div className="bg-[#111111]/90 border border-black px-1.5 py-0.2 shadow-[1px_1px_0_#000000] max-w-[98%] flex items-center gap-1">
                    <span
                      className={`block font-bold text-white mc-text-shadow truncate max-w-full leading-tight font-pixel ${
                        diameter >= 80
                          ? 'text-xs'
                          : diameter >= 54
                          ? 'text-[10px]'
                          : 'text-[9px]'
                      }`}
                    >
                      {person.name}
                    </span>

                    {/* XP Level / Days Tag */}
                    <span
                      className={`font-pixel font-bold whitespace-nowrap px-0.5 py-0.2 border border-black ${
                        person.daysUntil === 0
                          ? 'bg-[#b71c1c] text-white mc-text-shadow'
                          : person.daysUntil <= 7
                          ? 'bg-[#d97706] text-black'
                          : 'bg-[#2b7730] text-[#55ff55] mc-text-shadow'
                      } text-[8px] sm:text-[9px]`}
                    >
                      {person.daysUntil === 0 ? 'TODAY!' : `${person.daysUntil}d`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state if filtered query yields no results */}
          {filteredPeople.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-auto">
              <div className="p-5 mc-panel-dark border-2 border-black max-w-xs flex flex-col items-center shadow-[4px_4px_0_#000000]">
                <HelpCircle className="w-8 h-8 text-[#888888] mb-1.5" />
                <p className="text-xs sm:text-sm font-bold text-white mc-text-shadow font-mc">NO PLAYERS FOUND</p>
                <p className="text-[11px] text-[#a3a4ab] mt-1 font-pixel">
                  No entities found in this chunk matching filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedRelation('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 mc-button px-3 py-1.5 text-xs"
                >
                  [ Clear Filter ]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legend & Status (Minecraft HUD Style) */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-2.5 pb-2 mt-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a3a4ab] border-t-2 border-[#26252b] font-pixel">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mc text-[9px] sm:text-[10px] text-[#ffffff] flex items-center gap-1 mc-text-shadow">
            <Info className="w-3.5 h-3.5 text-[#55ffff]" /> CHUNK GUIDE:
          </span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#b71c1c] border border-black inline-block" />
            <span className="text-white text-[11px]">&lt; 7 days (Crown)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#d97706] border border-black inline-block" />
            <span className="text-white text-[11px]">1–4 wks (Large)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#2b7730] border border-black inline-block" />
            <span className="text-white text-[11px]">Upcoming (Standard)</span>
          </div>
        </div>

        <div className="font-mc text-[9px] sm:text-[10px] text-[#80ff20] mc-text-shadow">
          {filteredPeople.length} ENTITIES ACTIVE
        </div>
      </div>
    </div>
  );
};
