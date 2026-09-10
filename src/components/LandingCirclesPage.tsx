import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Person } from '../types';
import { useGifts } from '../context/GiftContext';
import { calculateDaysUntil } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import {
  Sparkles,
  Plus,
  Filter,
  Flame,
  Info,
  Search,
  Zap,
  RotateCcw,
  Gift,
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
  const [collisionCount, setCollisionCount] = useState(0);

  // Screen container and physics refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const circleElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const physicsCirclesRef = useRef<PhysicsCircle[]>([]);
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 900, height: 620 });
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{
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

  // Month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Calculate days until birthday and radius for each person
  const peopleWithProximity = useMemo(() => {
    return people.map((person) => {
      const { days } = calculateDaysUntil(person.birthMonth, person.birthDay);

      // Circle radius based on birthday proximity:
      // Today: r = 88px (diameter 176px)
      // <= 7 days: r = 82px (diameter 164px)
      // <= 14 days: r = 74px (diameter 148px)
      // <= 35 days: r = 66px (diameter 132px)
      // <= 90 days: r = 58px (diameter 116px)
      // > 90 days: r = 48px to 54px
      let radius = 50;
      let urgencyTier: 'today' | 'urgent' | 'soon' | 'upcoming' | 'later' = 'later';

      if (days === 0) {
        radius = 88;
        urgencyTier = 'today';
      } else if (days <= 7) {
        radius = 82;
        urgencyTier = 'urgent';
      } else if (days <= 14) {
        radius = 74;
        urgencyTier = 'urgent';
      } else if (days <= 35) {
        radius = 66;
        urgencyTier = 'soon';
      } else if (days <= 90) {
        radius = 58;
        urgencyTier = 'upcoming';
      } else {
        radius = Math.max(46, Math.round(54 - (days / 365) * 8));
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
  }, [people, gifts]);

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

    // Scale radii if on smaller screen
    const scaleFactor = Math.min(1, Math.max(0.75, width / 950));

    filteredPeople.forEach((person, index) => {
      const existing = currentList.find((c) => c.id === person.id);
      const scaledRadius = Math.round(person.radius * scaleFactor);

      if (existing) {
        // Keep current position and velocity, update metadata and radius
        newCircles.push({
          ...existing,
          person,
          radius: scaledRadius,
          mass: (scaledRadius * scaledRadius) / 1000,
          daysUntil: person.daysUntil,
          urgencyTier: person.urgencyTier,
          giftCount: person.giftCount,
        });
      } else {
        // Place new circle gracefully in grid/spiral inside container
        const total = filteredPeople.length;
        const cols = Math.ceil(Math.sqrt(total * 1.5)) || 1;
        const col = index % cols;
        const row = Math.floor(index / cols);

        const cellW = (width - 120) / Math.max(1, cols);
        const cellH = (height - 120) / Math.max(1, Math.ceil(total / cols));

        const initX = Math.min(
          Math.max(scaledRadius + 10, 60 + col * cellW + (cellW / 2) + (Math.random() * 20 - 10)),
          width - scaledRadius - 10
        );
        const initY = Math.min(
          Math.max(scaledRadius + 10, 60 + row * cellH + (cellH / 2) + (Math.random() * 20 - 10)),
          height - scaledRadius - 10
        );

        // Gentle random initial velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 0.6;

        newCircles.push({
          id: person.id,
          person,
          radius: scaledRadius,
          x: initX,
          y: initY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          mass: (scaledRadius * scaledRadius) / 1000,
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

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          containerSizeRef.current = { width, height };

          // Keep all circles strictly within bounds when container resizes
          physicsCirclesRef.current.forEach((c) => {
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
  }, []);

  // Main 60fps Physics & Collision Engine
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updatePhysics = (now: number) => {
      const dt = Math.min(2.0, (now - lastTime) / 16.666);
      lastTime = now;

      const { width, height } = containerSizeRef.current;
      const circles = physicsCirclesRef.current;
      const mouse = mouseRef.current;

      // Update mouse velocity
      if (mouse.isInside && mouse.prevX > -500) {
        mouse.vx = (mouse.x - mouse.prevX) * 0.3;
        mouse.vy = (mouse.y - mouse.prevY) * 0.3;
      } else {
        mouse.vx = 0;
        mouse.vy = 0;
      }
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      // 1. Mouse Interaction / Hover impulse
      if (mouse.isInside && !draggedCircleRef.current) {
        for (let i = 0; i < circles.length; i++) {
          const c = circles[i];
          const mdx = c.x - mouse.x;
          const mdy = c.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);

          // If hovering over circle or within touch boundary
          if (mdist < c.radius + 16) {
            c.isHovered = true;

            // Apply push impulse away from mouse (or along mouse direction if cursor moving fast)
            const pushDirX = mdist > 0.001 ? mdx / mdist : 1;
            const pushDirY = mdist > 0.001 ? mdy / mdist : 0;
            const pushStrength = Math.min(4.5, (c.radius + 16 - mdist) * 0.18 + 1.2);

            c.vx += (pushDirX * pushStrength + mouse.vx * 0.4) * dt;
            c.vy += (pushDirY * pushStrength + mouse.vy * 0.4) * dt;
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

            // Separate circles to prevent overlapping
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

            // Only bounce if they are moving towards each other
            if (velAlongNormal < 0) {
              // High elasticity (0.92) for delightful bouncy reaction
              const restitution = 0.92;
              const impulse = -(1 + restitution) * velAlongNormal / (1 / c1.mass + 1 / c2.mass);

              if (!c1.isDragging) {
                c1.vx -= (impulse / c1.mass) * nx;
                c1.vy -= (impulse / c1.mass) * ny;
              }
              if (!c2.isDragging) {
                c2.vx += (impulse / c2.mass) * nx;
                c2.vy += (impulse / c2.mass) * ny;
              }

              // Visual collision energy
              c1.collisionEnergy = 1.0;
              c2.collisionEnergy = 1.0;

              // Occasional subtle count tick for feedback
              if (Math.random() < 0.1) {
                setCollisionCount((prev) => (prev + 1) % 9999);
              }
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
          c.collisionEnergy = 0.7;
        }
        // Right wall
        if (c.x + c.radius > width) {
          c.x = width - c.radius;
          c.vx = -Math.abs(c.vx) * wallRestitution;
          c.collisionEnergy = 0.7;
        }
        // Top wall
        if (c.y - c.radius < 0) {
          c.y = c.radius;
          c.vy = Math.abs(c.vy) * wallRestitution;
          c.collisionEnergy = 0.7;
        }
        // Bottom wall
        if (c.y + c.radius > height) {
          c.y = height - c.radius;
          c.vy = -Math.abs(c.vy) * wallRestitution;
          c.collisionEnergy = 0.7;
        }

        // Damping / Friction
        c.vx *= Math.pow(0.994, dt);
        c.vy *= Math.pow(0.994, dt);

        // Speed clamping
        const speed = Math.hypot(c.vx, c.vy);
        const maxSpeed = 12.0;
        if (speed > maxSpeed) {
          c.vx = (c.vx / speed) * maxSpeed;
          c.vy = (c.vy / speed) * maxSpeed;
        }

        // Gentle buoyancy / ambient drift (never completely freeze)
        const minSpeed = 0.35;
        if (speed < minSpeed) {
          const driftAngle = (c.id.charCodeAt(0) * 0.7 + now * 0.0003) % (Math.PI * 2);
          c.vx += Math.cos(driftAngle) * 0.08 * dt;
          c.vy += Math.sin(driftAngle) * 0.08 * dt;
        }

        // Update position
        c.x += c.vx * dt;
        c.y += c.vy * dt;

        // Decay collision energy
        if (c.collisionEnergy > 0) {
          c.collisionEnergy = Math.max(0, c.collisionEnergy - 0.04 * dt);
        }
      }

      // 4. Update DOM transforms directly for 60/120fps GPU performance
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const el = circleElementsRef.current.get(c.id);
        if (el) {
          // Centered translate
          const left = c.x - c.radius;
          const top = c.y - c.radius;
          el.style.transform = `translate3d(${left}px, ${top}px, 0)`;

          // Subtle collision squish/ripple feedback
          if (c.collisionEnergy > 0.3) {
            el.style.filter = `drop-shadow(0 0 ${Math.round(c.collisionEnergy * 8)}px ${c.person.avatarColor}99)`;
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
      const boost = 3.5 + Math.random() * 4.5;
      c.vx += Math.cos(angle) * boost;
      c.vy += Math.sin(angle) * boost;
      c.collisionEnergy = 1.0;
    });
  }, []);

  // Reset positions gently inside the screen container
  const handleResetPositions = useCallback(() => {
    const { width, height } = containerSizeRef.current;
    const circles = physicsCirclesRef.current;
    const count = circles.length;
    const cols = Math.ceil(Math.sqrt(count * 1.5)) || 1;
    const rows = Math.ceil(count / cols);

    const cellW = (width - 120) / cols;
    const cellH = (height - 120) / rows;

    circles.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      c.x = 60 + col * cellW + cellW / 2;
      c.y = 60 + row * cellH + cellH / 2;
      const angle = Math.random() * Math.PI * 2;
      c.vx = Math.cos(angle) * 1.2;
      c.vy = Math.sin(angle) * 1.2;
    });
  }, []);

  // Mouse / Touch handlers for the screen container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    mouseRef.current.x = clientX;
    mouseRef.current.y = clientY;
    mouseRef.current.isInside = true;

    // Handle active drag if dragging a circle
    if (draggedCircleRef.current) {
      const circle = draggedCircleRef.current;
      const dx = clientX - circle.dragStartX;
      const dy = clientY - circle.dragStartY;
      if (Math.hypot(dx, dy) > 6) {
        circle.hasMovedDuringDrag = true;
      }
      circle.x = Math.max(circle.radius, Math.min(containerSizeRef.current.width - circle.radius, clientX));
      circle.y = Math.max(circle.radius, Math.min(containerSizeRef.current.height - circle.radius, clientY));
      circle.vx = mouseRef.current.vx * 1.2;
      circle.vy = mouseRef.current.vy * 1.2;
    }
  };

  const handleMouseEnter = () => {
    mouseRef.current.isInside = true;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isInside = false;
    mouseRef.current.x = -1000;
    mouseRef.current.y = -1000;
    setHoveredPersonId(null);
    if (draggedCircleRef.current) {
      draggedCircleRef.current.isDragging = false;
      draggedCircleRef.current = null;
    }
  };

  // Drag initiation on a circle
  const handleCircleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    personId: string
  ) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const circle = physicsCirclesRef.current.find((c) => c.id === personId);
    if (circle) {
      circle.isDragging = true;
      circle.dragStartX = clientX;
      circle.dragStartY = clientY;
      circle.hasMovedDuringDrag = false;
      circle.vx = 0;
      circle.vy = 0;
      draggedCircleRef.current = circle;
    }
  };

  const handleCircleMouseUp = (
    e: React.MouseEvent<HTMLDivElement>,
    person: Person
  ) => {
    e.stopPropagation();
    const circle = physicsCirclesRef.current.find((c) => c.id === person.id);
    if (circle) {
      const wasDragging = circle.hasMovedDuringDrag;
      circle.isDragging = false;
      draggedCircleRef.current = null;

      // If user simply clicked (didn't drag), open person detail drawer!
      if (!wasDragging) {
        onSelectPerson(person);
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col justify-between select-none">
      {/* Top Controls & Header Bar */}
      <div className="w-full max-w-6xl mx-auto pt-1 pb-4 px-2 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Birthday Sketchpad</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef08a] text-stone-900 border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] flex items-center gap-1 font-sketch">
              <Sparkles className="w-3 h-3 text-amber-700" />
              Hand-Drawn & Bouncy
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 font-medium">
            Each person is a hand-sketched pastel circle face on paper. Bigger circles mean closer birthdays! Hover to bounce them into each other, drag to fling, or click to view gift ideas.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewPersonModal}
            className="px-4 py-2 bg-[#fbcfe8] hover:bg-[#f9a8d4] text-stone-900 border-2 border-stone-800 rounded-xl text-xs font-bold shadow-[2.5px_2.5px_0px_#292524] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-stone-900" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Filter and relationship bar (Styled like notebook index tabs) */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-stone-500 font-bold mr-1 flex items-center gap-1 text-xs font-sketch">
            <Filter className="w-3 h-3 text-stone-700" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Loved Ones' },
            { id: 'partner', label: '❤️ Partner' },
            { id: 'family', label: '🏡 Family' },
            { id: 'friend', label: '✨ Friends' },
            { id: 'colleague', label: '💼 Colleagues' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedRelation(pill.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedRelation === pill.id
                  ? 'bg-stone-900 text-[#fffefb] border-2 border-stone-900 shadow-[2px_2px_0px_#292524]'
                  : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 border-2 border-stone-700/60 shadow-[1px_1px_0px_#292524]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Quick search input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-stone-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sketch by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 bg-[#fffefb] border-2 border-stone-800 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-800 shadow-[1.5px_1.5px_0px_#292524]"
          />
        </div>
      </div>

      {/* THE SCREEN CONTAINER (Styled as an authentic Artist's Sketchpad Canvas) */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 flex-1 flex flex-col">
        <div
          id="physics-screen-container"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-full h-[580px] sm:h-[620px] rounded-3xl border-3 border-stone-800 bg-[#fffefb] shadow-[5px_5px_0px_#292524] relative overflow-hidden flex-1 cursor-crosshair select-none"
          style={{
            backgroundImage: `radial-gradient(#d6cebf 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Sketchbook Top Binding Rings / Spiral Accent */}
          <div className="absolute top-0 inset-x-0 h-3 flex items-center justify-around px-8 pointer-events-none z-20">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-3 bg-stone-300 rounded-b-sm border-x border-b border-stone-600 shadow-2xs opacity-70"
              />
            ))}
          </div>

          {/* Screen Bezel HUD (Top Bar) */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
            {/* Live Indicator (Hand-drawn Note Badge) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fffefb] border-2 border-stone-800 shadow-[2px_2px_0px_#292524] text-stone-900 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-sketch text-sm tracking-wide text-stone-800">
                ✏️ Sketchpad • Hover circles to bounce them!
              </span>
            </div>

            {/* Interactive Screen Controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleNudgeAll}
                className="px-3 py-1.5 rounded-xl bg-[#fef08a] hover:bg-[#fde047] text-stone-900 text-xs font-bold shadow-[2px_2px_0px_#292524] border-2 border-stone-800 flex items-center gap-1.5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="Send a bounce impulse through all circles"
              >
                <Zap className="w-3.5 h-3.5 text-stone-900 fill-stone-900" />
                <span>Nudge All</span>
              </button>

              <button
                onClick={handleResetPositions}
                className="p-2 rounded-xl bg-[#fffefb] hover:bg-stone-100 text-stone-800 shadow-[2px_2px_0px_#292524] border-2 border-stone-800 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="Reset layout"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Soft Paper Shadow / Bottom Gradient */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-stone-200/40 to-transparent pointer-events-none" />

          {/* Render All Physics Circles Inside the Screen Container */}
          {filteredPeople.map((person) => {
            const isHovered = hoveredPersonId === person.id;
            const diameter = person.radius * 2;
            const faceSize = Math.max(44, Math.round(diameter * 0.72));

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
                onMouseEnter={() => setHoveredPersonId(person.id)}
                onMouseLeave={() => setHoveredPersonId(null)}
                onMouseDown={(e) => handleCircleMouseDown(e, person.id)}
                onMouseUp={(e) => handleCircleMouseUp(e, person)}
                className="absolute top-0 left-0 rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing will-change-transform z-10 transition-transform duration-150"
                style={{
                  width: diameter,
                  height: diameter,
                  filter: isHovered
                    ? 'drop-shadow(3.5px 5px 0px rgba(41, 37, 36, 0.45))'
                    : 'drop-shadow(2px 3px 0px rgba(41, 37, 36, 0.22))',
                }}
              >
                {/* SVG HANDDRAWN SKETCH CIRCLE BACKGROUND & DOUBLE STROKES */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Soft watercolor / crayon paper wash gradient */}
                    <radialGradient id={`circle-wash-${person.id}`} cx="42%" cy="38%" r="62%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                      <stop offset="85%" stopColor={person.avatarColor || '#fbcfe8'} stopOpacity="1" />
                      <stop offset="100%" stopColor="#292524" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>

                  {/* Pastel Watercolor / Crayon Wash Fill with Organic Hand-Drawn Wobble */}
                  <path
                    d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                    fill={`url(#circle-wash-${person.id})`}
                  />

                  {/* Secondary Graphite Pencil Stroke (Imperfect second pass sketched with pencil) */}
                  <path
                    d="M 50.4 4.5 C 75.2 3.8, 95.5 25.2, 95.1 50.2 C 94.7 74.8, 74.5 95.2, 49.8 95 C 25.1 94.8, 5.2 75, 4.8 50.4 C 4.5 25.4, 25.4 5.2, 50.4 4.5"
                    stroke="#78716c"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeDasharray="90 4 40 3"
                    opacity={isHovered ? 0.8 : 0.55}
                  />

                  {/* Primary Charcoal Ink Stroke (Natural felt-tip pen contour with hand wobble) */}
                  <path
                    d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                    stroke="#292524"
                    strokeWidth={isHovered ? 3.4 : 2.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Sketched Festive Birthday Party Hat if <= 7 days or today! */}
                  {(person.urgencyTier === 'urgent' || person.urgencyTier === 'today') && (
                    <g transform="translate(63, -2) rotate(18)">
                      {/* Handdrawn striped party cone */}
                      <polygon
                        points="12,0 0,26 24,26"
                        fill="#fef08a"
                        stroke="#292524"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {/* Sketched stripes */}
                      <path d="M 4 18 L 20 18" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 8 10 L 16 10" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
                      {/* Fluffy pom-pom on top */}
                      <circle cx="12" cy="0" r="3.4" fill="#f43f5e" stroke="#292524" strokeWidth="1.5" />
                    </g>
                  )}
                </svg>

                {/* THE NATURAL HANDDRAWN FACIAL EXPRESSION */}
                <div className="relative flex items-center justify-center pointer-events-none -mt-1 z-10">
                  <CuteFace
                    name={person.name}
                    config={person.cuteFace}
                    size={faceSize}
                    isHovered={isHovered}
                  />
                </div>

                {/* PERSON NAME & BIRTHDAY NOTE (Styled as a hand-written paper tag) */}
                <div className="absolute bottom-2.5 inset-x-2 flex flex-col items-center justify-center pointer-events-none px-1 text-center z-10">
                  <div className="bg-[#fffefb] border-[1.5px] border-stone-800 rounded-lg px-2 py-0.5 shadow-[1.5px_1.5px_0px_#292524] max-w-[94%] flex flex-col items-center">
                    <span
                      className={`block font-bold text-stone-900 tracking-tight truncate max-w-full leading-tight ${
                        diameter >= 150
                          ? 'text-xs sm:text-sm'
                          : diameter >= 120
                          ? 'text-[11px] sm:text-xs'
                          : 'text-[10px]'
                      }`}
                    >
                      {person.name}
                    </span>

                    {/* Hand-written Birthday Note */}
                    <span
                      className={`font-sketch font-bold tracking-wide leading-none mt-0.5 whitespace-nowrap ${
                        person.daysUntil === 0
                          ? 'text-rose-600 text-xs'
                          : person.daysUntil <= 7
                          ? 'text-amber-800 text-[11px]'
                          : 'text-stone-600 text-[10px]'
                      }`}
                    >
                      {person.daysUntil === 0
                        ? '🎉 Today!'
                        : `in ${person.daysUntil}d`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state if filtered query yields no results */}
          {filteredPeople.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-auto">
              <div className="p-4 bg-[#fffefb] border-2 border-stone-800 rounded-2xl shadow-[3px_3px_0px_#292524] flex flex-col items-center max-w-sm">
                <HelpCircle className="w-10 h-10 text-stone-400 mb-2" />
                <p className="text-sm font-bold text-stone-900">No loved ones match the current filter</p>
                <p className="text-xs text-stone-500 mt-1 font-sketch text-base">
                  Try selecting &quot;All Loved Ones&quot; or clearing your search.
                </p>
                <button
                  onClick={() => {
                    setSelectedRelation('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-stone-900 text-[#fffefb] text-xs font-bold shadow-[2px_2px_0px_#292524] border-2 border-stone-900"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Legend & Status (Paper style) */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-4 pb-2 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 border-t-2 border-dashed border-stone-300">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-stone-900 flex items-center gap-1 font-sketch text-sm">
            <Info className="w-3.5 h-3.5 text-stone-600" /> Sketchpad Guide:
          </span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#fbcfe8] border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] inline-block" />
            <span className="font-medium">&lt; 2 weeks (Bigger Circle)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ddd6fe] border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] inline-block" />
            <span className="font-medium">1–3 months (Medium)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#bbf7d0] border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] inline-block" />
            <span className="font-medium">Later in year (Compact)</span>
          </div>
        </div>

        <div className="text-xs font-sketch text-stone-600 font-bold">
          Drawn for {filteredPeople.length} loved {filteredPeople.length === 1 ? 'one' : 'ones'}
        </div>
      </div>
    </div>
  );
};
