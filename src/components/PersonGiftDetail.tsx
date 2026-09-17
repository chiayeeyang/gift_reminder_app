import React, { useState, useMemo } from 'react';
import { Person, GiftItem, OccasionType } from '../types';
import { useGifts } from '../context/GiftContext';
import { calculateDaysUntil, formatCurrency, getMilestoneBirthdayText, getBirthdayHealth } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import { MinecraftHealthBar } from './MinecraftHealthBar';
import {
  X,
  Calendar,
  Gift,
  Clock,
  DollarSign,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  ShoppingBag,
  Scissors,
  Check,
  Tag,
  Shield,
  Skull,
  RotateCcw,
} from 'lucide-react';

interface PersonGiftDetailProps {
  person: Person;
  onClose: () => void;
  onOpenGiftModal: (gift?: GiftItem, personId?: string, occasion?: OccasionType) => void;
  onOpenPersonModal: (person: Person) => void;
  onNavigateToAI: (name: string, relationship: string, interests: string) => void;
}

export const PersonGiftDetail: React.FC<PersonGiftDetailProps> = ({
  person,
  onClose,
  onOpenGiftModal,
  onOpenPersonModal,
  onNavigateToAI,
}) => {
  const { gifts, updateGift, logCraftTime, toggleGiftSent } = useGifts();
  const [showTotemAnimation, setShowTotemAnimation] = useState(false);

  // Budget filter state
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under25' | 'under50' | 'under100' | 'within_budget'>('all');
  // Time/Type filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'bought' | 'diy_quick' | 'diy_medium' | 'diy_long'>('all');

  // Days until next birthday
  const birthdayInfo = calculateDaysUntil(person.birthMonth, person.birthDay);
  const milestone = person.birthYear ? getMilestoneBirthdayText(person.birthYear, birthdayInfo.year) : null;

  // Minecraft Birthday Life Bar Status
  const healthInfo = useMemo(() => {
    return getBirthdayHealth(person);
  }, [person]);

  const handleGiftSentToggle = () => {
    const nextState = !healthInfo.isGiftSent;
    toggleGiftSent(person.id, nextState);

    if (nextState) {
      setShowTotemAnimation(true);
      setTimeout(() => setShowTotemAnimation(false), 3500);

      // Play 8-bit Minecraft triumphant / heal chime
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const now = ctx.currentTime;
          const notes = healthInfo.isDead
            ? [261.63, 329.63, 392.0, 523.25, 659.25, 783.99] // Totem revival chord
            : [440, 554.37, 659.25, 880]; // Golden heart chime

          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = healthInfo.isDead ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.2, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
          });
        }
      } catch (e) {
        // Safely ignore if browser blocks audio
      }
    }
  };

  // Gifts for this person
  const personGifts = useMemo(() => {
    return gifts.filter((g) => g.recipientId === person.id && !g.archived);
  }, [gifts, person.id]);

  // Financial calculations
  const totalPlannedSpent = useMemo(() => {
    return personGifts.reduce((acc, g) => acc + (g.actualPrice ?? g.estimatedPrice ?? 0), 0);
  }, [personGifts]);

  const annualBudget = person.annualBudget || 0;
  const remainingBudget = Math.max(0, annualBudget - totalPlannedSpent);
  const budgetPercent = annualBudget > 0 ? Math.min(100, Math.round((totalPlannedSpent / annualBudget) * 100)) : 0;

  // Handmade time calculations
  const handmadeGifts = personGifts.filter((g) => g.type === 'handmade');
  const totalCraftHoursNeeded = handmadeGifts.reduce((acc, g) => acc + (g.craftingHoursEstimated || 0), 0);
  const totalCraftHoursLogged = handmadeGifts.reduce((acc, g) => acc + (g.craftingHoursSpent || 0), 0);

  // Filtered gift items based on budget and time
  const filteredGifts = useMemo(() => {
    return personGifts.filter((gift) => {
      const price = gift.actualPrice ?? gift.estimatedPrice ?? 0;
      // Budget filtering
      if (budgetFilter === 'under25' && price > 25) return false;
      if (budgetFilter === 'under50' && price > 50) return false;
      if (budgetFilter === 'under100' && price > 100) return false;
      if (budgetFilter === 'within_budget' && price > remainingBudget) return false;

      // Time / Type filtering
      if (typeFilter === 'bought' && gift.type !== 'bought') return false;
      if (typeFilter === 'diy_quick') {
        if (gift.type !== 'handmade') return false;
        if ((gift.craftingHoursEstimated || 0) > 2) return false;
      }
      if (typeFilter === 'diy_medium') {
        if (gift.type !== 'handmade') return false;
        const h = gift.craftingHoursEstimated || 0;
        if (h <= 2 || h > 5) return false;
      }
      if (typeFilter === 'diy_long') {
        if (gift.type !== 'handmade') return false;
        if ((gift.craftingHoursEstimated || 0) <= 5) return false;
      }

      return true;
    });
  }, [personGifts, budgetFilter, typeFilter, remainingBudget]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div
      id="person-detail-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex justify-end animate-in fade-in duration-100 font-pixel"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="person-detail-drawer"
        className="w-full max-w-2xl mc-panel h-full border-l-4 border-black flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      >
        {/* Top bar */}
        <div className="p-3.5 border-b-2 border-[#3c3d44] flex items-center justify-between bg-[#212026]">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 border border-black"
              style={{ backgroundColor: person.avatarColor || '#fbcfe8' }}
            />
            <span className="text-xs font-mc text-white uppercase tracking-wider mc-text-shadow">
              PLAYER DOSSIER: {person.name.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPersonModal(person)}
              className="mc-button px-3 py-1 text-xs flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Player
            </button>
            <button
              onClick={onClose}
              className="mc-button-red p-1 text-xs"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Hero Profile Card with cute face */}
          <div className="p-4 mc-panel border-2 border-black flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Minecraft Item Frame Slot with Player Skin */}
            <div className="w-20 h-20 mc-slot relative flex items-center justify-center shrink-0">
              <CuteFace name={person.name} config={person.cuteFace} size={58} />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-white mc-text-shadow font-pixel">{person.name}</h2>
                <span className="px-2 py-0.5 text-xs uppercase bg-[#212026] text-[#a3a4ab] border border-black">
                  {person.relationship}
                </span>
                {milestone && (
                  <span className="px-2 py-0.5 text-xs bg-[#d97706] text-black border border-black font-bold animate-pulse">
                    ✨ {milestone}
                  </span>
                )}
              </div>

              {/* Birthday row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-[#d1d5db] pt-1">
                <div className="flex items-center gap-1.5 text-white">
                  <Calendar className="w-3.5 h-3.5 text-[#ff5555]" />
                  <span>
                    {monthNames[person.birthMonth - 1]} {person.birthDay}
                    {person.birthYear ? `, ${person.birthYear}` : ''}
                  </span>
                </div>
                <span className="text-[#555555]">■</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xs border border-black ${
                    birthdayInfo.days === 0
                      ? 'bg-[#ff5555] text-white mc-text-shadow'
                      : birthdayInfo.days <= 7
                      ? 'bg-[#ffea75] text-black font-bold'
                      : birthdayInfo.days <= 30
                      ? 'bg-[#d97706] text-black font-bold'
                      : 'bg-[#404149] text-white'
                  }`}
                >
                  {birthdayInfo.days === 0 ? 'Today! 🎂' : `in ${birthdayInfo.days} days`}
                </span>
              </div>

              {/* Interests preview pills */}
              {person.interests && person.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 justify-center sm:justify-start">
                  {person.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] bg-[#212026] border border-black text-[#ffea75]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TOTEM OF UNDYING CELEBRATION BANNER */}
          {showTotemAnimation && (
            <div className="p-3.5 bg-[#d97706]/95 border-2 border-[#fef08a] shadow-[0_0_15px_#fef08a] animate-bounce flex items-center justify-center gap-3 text-center">
              <Sparkles className="w-5 h-5 text-[#fef08a] shrink-0" />
              <div>
                <h4 className="font-mc text-xs text-[#fef08a] mc-text-shadow">
                  ⚡ TOTEM OF UNDYING ACTIVATED!
                </h4>
                <p className="text-[11px] text-white font-bold">
                  Life bar restored to 100% (20/20 HP)! {person.name} is saved and celebrated!
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-[#fef08a] shrink-0" />
            </div>
          )}

          {/* GAMIFIED BIRTHDAY LIFE BAR & GIFT QUEST */}
          <div
            className={`p-4 mc-panel border-2 ${
              healthInfo.isDead
                ? 'border-[#ff5555] bg-[#2a1215]'
                : healthInfo.isGiftSent
                ? 'border-[#f59e0b] bg-[#1c1d18]'
                : healthInfo.status === 'critical'
                ? 'border-[#ff5555] bg-[#22161a]'
                : 'border-black'
            } space-y-3`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3c3d44] pb-2.5">
              <div className="flex items-center gap-2">
                {healthInfo.isDead ? (
                  <Skull className="w-4 h-4 text-[#ff5555] animate-pulse" />
                ) : healthInfo.isGiftSent ? (
                  <Shield className="w-4 h-4 text-[#f59e0b]" />
                ) : (
                  <Heart
                    className={`w-4 h-4 ${
                      healthInfo.status === 'critical' ? 'text-[#ff5555] animate-bounce' : 'text-[#ff5555]'
                    }`}
                  />
                )}
                <h3 className="font-mc text-[10px] text-white mc-text-shadow uppercase tracking-wider">
                  PLAYER HEALTH & BIRTHDAY LIFE BAR
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 text-xs font-bold border border-black ${
                    healthInfo.isDead
                      ? 'bg-[#ff5555] text-white mc-text-shadow animate-pulse'
                      : healthInfo.isGiftSent
                      ? 'bg-[#d97706] text-black font-bold'
                      : healthInfo.status === 'critical'
                      ? 'bg-[#ff5555] text-white mc-text-shadow'
                      : 'bg-[#2b7730] text-[#55ff55] mc-text-shadow'
                  }`}
                >
                  {healthInfo.isDead
                    ? '☠️ 0/20 HP • DIED'
                    : healthInfo.isGiftSent
                    ? '✨ 20/20 HP • SAFE'
                    : `${healthInfo.currentHp}/20 HP`}
                </span>
              </div>
            </div>

            {/* The Minecraft Health Bar Hearts & Gauge */}
            <div className="p-3 mc-slot bg-[#121115] border border-black space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#a3a4ab] block">
                    {healthInfo.isDead
                      ? 'Survival Status: DIED (Succumbed to gift deficiency)'
                      : healthInfo.isGiftSent
                      ? 'Survival Status: Protected by Gift (Full Golden Absorption)'
                      : `Survival Status: ${healthInfo.daysLeft} days until birthday (Life bar countdown)`}
                  </span>
                  <MinecraftHealthBar
                    currentHp={healthInfo.currentHp}
                    maxHp={20}
                    isGiftSent={healthInfo.isGiftSent}
                    isDead={healthInfo.isDead}
                    size="large"
                    showLabel={true}
                  />
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-pixel text-[#ffea75] block">
                    {healthInfo.isDead ? 'Countdown Expired' : `${healthInfo.daysLeft} Days Left`}
                  </span>
                  <span className="text-[10px] text-[#a3a4ab]">
                    {healthInfo.isGiftSent
                      ? 'Life bar restored'
                      : healthInfo.isDead
                      ? 'Respawn Required'
                      : 'Send gift to reset HP'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 mc-slot p-0.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    healthInfo.isDead
                      ? 'bg-[#374151]'
                      : healthInfo.isGiftSent
                      ? 'bg-[#fbbf24]'
                      : healthInfo.status === 'critical'
                      ? 'bg-[#ff5555]'
                      : healthInfo.status === 'warning'
                      ? 'bg-[#f59e0b]'
                      : 'bg-[#22c55e]'
                  }`}
                  style={{ width: `${healthInfo.hpPercent}%` }}
                />
              </div>
            </div>

            {/* Context Explainer */}
            <p className="text-xs text-[#d1d5db] leading-relaxed">
              {healthInfo.isDead ? (
                <span className="text-[#ff9999] font-bold">
                  ☠️ The birthday countdown ran out without a gift sent! Click "GIFT SENT" below to activate a Totem of Undying and resurrect {person.name} back to full health!
                </span>
              ) : healthInfo.isGiftSent ? (
                <span className="text-[#fef08a]">
                  ✨ Gift marked sent! {person.name}'s life bar is at 100% capacity (Golden Absorption Hearts). The life bar will reset on the next birthday cycle.
                </span>
              ) : healthInfo.status === 'critical' ? (
                <span className="text-[#ff9999] font-bold">
                  ⚠️ CRITICAL HEALTH: Only {healthInfo.daysLeft} days left until birthday! If the countdown hits 0 before a gift is sent, {person.name} will die! Click "GIFT SENT" to reset the life bar to 100%.
                </span>
              ) : (
                <span>
                  💡 Days left until birthday acts as this player's life bar (ticking down from 20 HP). Make sure to click <strong className="text-white">"GIFT SENT"</strong> before the birthday is up or this player dies!
                </span>
              )}
            </p>

            {/* Primary "GIFT SENT" Action Button */}
            <div>
              {healthInfo.isDead ? (
                <button
                  onClick={handleGiftSentToggle}
                  className="w-full mc-button bg-[#d97706] hover:bg-[#b45309] text-white border-2 border-[#fef08a] py-3 px-4 font-bold text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0_#000000] animate-pulse transition-none"
                >
                  <Sparkles className="w-4 h-4 text-[#fef08a]" />
                  ⚡ RESPAWN PLAYER • CLICK "GIFT SENT" (Totem of Undying)
                </button>
              ) : !healthInfo.isGiftSent ? (
                <button
                  onClick={handleGiftSentToggle}
                  className="w-full mc-button-emerald py-3 px-4 font-bold text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0_#000000] hover:scale-[1.01] transition-transform"
                >
                  <Gift className="w-4 h-4 text-[#55ff55]" />
                  🎁 CLICK "GIFT SENT" TO RESET LIFE BAR (Restore 20/20 HP)
                </button>
              ) : (
                <div className="p-2.5 mc-slot bg-[#1b2b1e] border-2 border-[#22c55e] flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#55ff55]" />
                    <div>
                      <span className="text-xs font-bold text-[#55ff55] block">
                        GIFT SENT! (Life bar fully protected)
                      </span>
                      <span className="text-[10px] text-[#a3a4ab]">
                        {person.giftSentDate
                          ? `Marked sent on ${new Date(person.giftSentDate).toLocaleDateString()}`
                          : 'Player saved for this birthday cycle'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleGiftSentToggle}
                    className="mc-button px-2.5 py-1 text-[10px] text-[#ffaaaa] flex items-center gap-1 shrink-0"
                    title="Undo gift sent status"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Unmark / Undo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BUDGET & TIME MANAGEMENT SECTION */}
          <div className="space-y-2.5">
            <h3 className="font-mc text-[9px] text-[#ffea75] flex items-center gap-1.5 mc-text-shadow">
              <DollarSign className="w-3.5 h-3.5 text-[#ffea75]" />
              EMERALD BUDGET & CRAFTING TIME MANAGEMENT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Budget card */}
              <div className="p-3 mc-panel-dark border border-black space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a4ab]">Annual Budget</span>
                  <span className="text-[#55ff55] font-bold">
                    {formatCurrency(totalPlannedSpent)} / {formatCurrency(annualBudget)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 mc-slot p-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      budgetPercent > 90
                        ? 'bg-[#ff5555]'
                        : budgetPercent > 70
                        ? 'bg-[#ffea75]'
                        : 'bg-[#55ff55]'
                    }`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[#a3a4ab]">
                  <span>{budgetPercent}% allocated</span>
                  <span className="text-[#55ff55] font-bold">
                    {formatCurrency(remainingBudget)} remaining
                  </span>
                </div>
              </div>

              {/* DIY Craft Time card */}
              <div className="p-3 mc-panel-dark border border-black space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a4ab]">Handmade Craft Time</span>
                  <span className="text-[#55ffff] font-bold">
                    {totalCraftHoursLogged}h / {totalCraftHoursNeeded}h needed
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 mc-slot p-0.5">
                  <div
                    className="h-full bg-[#55ffff] transition-all duration-300"
                    style={{
                      width: `${
                        totalCraftHoursNeeded > 0
                          ? Math.min(100, Math.round((totalCraftHoursLogged / totalCraftHoursNeeded) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[#a3a4ab]">
                  <span>{handmadeGifts.length} DIY recipes</span>
                  <span className="text-[#55ffff] font-bold">
                    {Math.max(0, totalCraftHoursNeeded - totalCraftHoursLogged)}h remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GIFT IDEAS REVEAL (Based on Budget and Time) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white mc-text-shadow font-mc flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#ff5555]" />
                  CHEST INVENTORY ({personGifts.length})
                </h3>
                <p className="text-[11px] text-[#a3a4ab]">
                  Filtered by budget limit and crafting time commitment
                </p>
              </div>

              <button
                onClick={() => onOpenGiftModal(undefined, person.id, 'birthday')}
                className="mc-button-emerald px-3 py-1 text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Gift Loot
              </button>
            </div>

            {/* Interactive Filters: Budget & Time */}
            <div className="p-3 mc-panel border border-black space-y-2">
              {/* Filter Row 1: Budget */}
              <div className="flex flex-wrap items-center gap-1 text-xs">
                <span className="text-[#ffea75] font-bold mr-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Budget:
                </span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'under25', label: '< $25' },
                  { id: 'under50', label: '< $50' },
                  { id: 'under100', label: '< $100' },
                  { id: 'within_budget', label: `Within (${formatCurrency(remainingBudget)})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setBudgetFilter(item.id as any)}
                    className={`px-2 py-0.5 text-xs border transition-none ${
                      budgetFilter === item.id
                        ? 'bg-[#404149] text-white border-white'
                        : 'mc-button'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Filter Row 2: Time / Type */}
              <div className="flex flex-wrap items-center gap-1 text-xs pt-1.5 border-t border-[#3c3d44]">
                <span className="text-[#55ffff] font-bold mr-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time / Type:
                </span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'bought', label: 'Bought (0h)' },
                  { id: 'diy_quick', label: 'Quick (< 2h)' },
                  { id: 'diy_medium', label: 'Medium (2-5h)' },
                  { id: 'diy_long', label: 'Project (5h+)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTypeFilter(item.id as any)}
                    className={`px-2 py-0.5 text-xs border transition-none ${
                      typeFilter === item.id
                        ? 'bg-[#2b7730] text-[#55ff55] border-white'
                        : 'mc-button'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Filtered Gifts */}
            {filteredGifts.length > 0 ? (
              <div className="space-y-2">
                {filteredGifts.map((gift) => {
                  const price = gift.actualPrice ?? gift.estimatedPrice;
                  const isHandmade = gift.type === 'handmade';

                  return (
                    <div
                      key={gift.id}
                      className="p-3 mc-panel border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 mc-slot flex items-center justify-center shrink-0 mt-0.5 ${
                            isHandmade ? 'text-[#55ff55]' : 'text-[#ffea75]'
                          }`}
                        >
                          {isHandmade ? <Scissors className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs mc-text-shadow">{gift.title}</h4>
                            <span
                              className={`px-1.5 py-0.2 text-[9px] uppercase border border-black ${
                                gift.status === 'given'
                                  ? 'bg-[#2b7730] text-[#55ff55]'
                                  : gift.status === 'wrapped'
                                  ? 'bg-[#5b21b6] text-white'
                                  : gift.status === 'purchased' || gift.status === 'completed'
                                  ? 'bg-[#1e40af] text-white'
                                  : gift.status === 'in_progress'
                                  ? 'bg-[#d97706] text-black'
                                  : 'bg-[#212026] text-[#a3a4ab]'
                              }`}
                            >
                              {gift.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#a3a4ab]">
                            {price !== undefined && (
                              <span className="font-bold text-[#ffea75]">
                                {formatCurrency(price)}
                              </span>
                            )}

                            {isHandmade && (
                              <span className="flex items-center gap-1 text-[#55ffff] font-bold">
                                <Clock className="w-3 h-3" />
                                {gift.craftingHoursSpent || 0} / {gift.craftingHoursEstimated || 0}h logged
                              </span>
                            )}

                            <span className="capitalize">{gift.occasion}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {isHandmade && (
                          <button
                            onClick={() => logCraftTime(gift.id, 0.5)}
                            className="mc-button px-2 py-0.5 text-[10px] text-[#55ffff]"
                            title="Log 30 minutes craft time"
                          >
                            +30m Time
                          </button>
                        )}

                        {gift.status !== 'purchased' && gift.status !== 'completed' && gift.status !== 'wrapped' && (
                          <button
                            onClick={() =>
                              updateGift(gift.id, {
                                status: isHandmade ? 'completed' : 'purchased',
                              })
                            }
                            className="mc-button-emerald px-2 py-0.5 text-[10px] flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-[#55ff55]" />
                            {isHandmade ? 'Craft Done' : 'Purchased'}
                          </button>
                        )}

                        <button
                          onClick={() => onOpenGiftModal(gift)}
                          className="mc-button p-1 text-xs"
                          title="Edit Gift Details"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center mc-panel-dark border-2 border-dashed border-[#555555] space-y-1.5">
                <p className="text-xs text-white">
                  No gift items match these filter parameters.
                </p>
                <div className="flex justify-center gap-2 pt-1 text-xs">
                  <button
                    onClick={() => {
                      setBudgetFilter('all');
                      setTypeFilter('all');
                    }}
                    className="text-[#55ffff] hover:underline"
                  >
                    Reset Filters
                  </button>
                  <span className="text-[#555555]">■</span>
                  <button
                    onClick={() => onOpenGiftModal(undefined, person.id, 'birthday')}
                    className="text-[#55ff55] hover:underline"
                  >
                    Add a New Idea
                  </button>
                </div>
              </div>
            )}

            {/* AI Generator suggestion box */}
            <div className="p-3.5 mc-panel border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="font-mc text-[9px] text-[#ffea75] flex items-center gap-1.5 mc-text-shadow">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffea75]" />
                  ENCHANTMENT BRAINSTORM FOR {person.name.toUpperCase()}
                </h4>
                <p className="text-[11px] text-[#d1d5db]">
                  Generate ideas tailored to {person.name}&apos;s interests, budget ($
                  {remainingBudget} left), and DIY craft skill.
                </p>
              </div>

              <button
                onClick={() =>
                  onNavigateToAI(
                    person.name,
                    person.relationship,
                    person.interests?.join(', ') || ''
                  )
                }
                className="mc-button-gold px-3 py-1 text-xs shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Wizard
              </button>
            </div>
          </div>

          {/* PREFERENCES & SIZING SECTION */}
          <div className="space-y-2.5 pt-1">
            <h3 className="font-mc text-[9px] text-[#ff5555] flex items-center gap-1.5 mc-text-shadow">
              <Heart className="w-3.5 h-3.5 text-[#ff5555]" />
              PREFERENCES, ARMOR SIZING & WISHLIST LORE
            </h3>

            <div className="space-y-2.5">
              {/* Likes & Dislikes */}
              {(person.preferences?.likes || person.preferences?.dislikes) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {person.preferences?.likes && (
                    <div className="p-3 mc-panel-dark border border-black">
                      <span className="text-xs font-bold text-[#55ff55] flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#55ff55]" />
                        Loves & Likes
                      </span>
                      <p className="text-xs text-white leading-relaxed">
                        {person.preferences.likes}
                      </p>
                    </div>
                  )}

                  {person.preferences?.dislikes && (
                    <div className="p-3 mc-panel-dark border border-black">
                      <span className="text-xs font-bold text-[#ff5555] flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#ff5555]" />
                        Dislikes & Avoids
                      </span>
                      <p className="text-xs text-white leading-relaxed">
                        {person.preferences.dislikes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Allergies & Favorite Colors */}
              {(person.preferences?.allergies || person.preferences?.favoriteColors) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {person.preferences?.allergies && (
                    <div className="p-3 mc-panel-dark border border-black">
                      <span className="text-xs font-bold text-[#ffea75] flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#ffea75]" />
                        Allergies & Sensitivities
                      </span>
                      <p className="text-xs text-white leading-relaxed">
                        {person.preferences.allergies}
                      </p>
                    </div>
                  )}

                  {person.preferences?.favoriteColors && (
                    <div className="p-3 mc-panel-dark border border-black">
                      <span className="text-xs font-bold text-[#55ffff] flex items-center gap-1 mb-1">
                        <Tag className="w-3.5 h-3.5 text-[#55ffff]" />
                        Favorite Colors
                      </span>
                      <p className="text-xs text-white leading-relaxed">
                        {person.preferences.favoriteColors}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sizes & Measurements */}
              {person.sizes && Object.values(person.sizes).some((v) => Boolean(v)) && (
                <div className="p-3 mc-panel-dark border border-black space-y-2">
                  <span className="font-mc text-[9px] text-[#ffea75] block mc-text-shadow">
                    ARMOR SIZES & MEASUREMENTS
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {person.sizes.clothing && (
                      <div className="p-2 mc-panel border border-black">
                        <span className="text-[10px] text-[#a3a4ab] block">Chestplate</span>
                        <span className="font-bold text-white">{person.sizes.clothing}</span>
                      </div>
                    )}
                    {person.sizes.shoe && (
                      <div className="p-2 mc-panel border border-black">
                        <span className="text-[10px] text-[#a3a4ab] block">Boots</span>
                        <span className="font-bold text-white">{person.sizes.shoe}</span>
                      </div>
                    )}
                    {person.sizes.ring && (
                      <div className="p-2 mc-panel border border-black">
                        <span className="text-[10px] text-[#a3a4ab] block">Ring / Wrist</span>
                        <span className="font-bold text-white">{person.sizes.ring}</span>
                      </div>
                    )}
                    {person.sizes.notes && (
                      <div className="p-2 mc-panel border border-black col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#a3a4ab] block">Notes</span>
                        <span className="text-white truncate block">{person.sizes.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Notes & Dropped Hints */}
              {person.notes && (
                <div className="p-3 mc-panel-dark border border-black">
                  <span className="font-mc text-[9px] text-[#ffea75] block mb-1 mc-text-shadow">
                    WISHLIST LORE & DROPPED HINTS ✏️
                  </span>
                  <p className="text-xs text-white leading-relaxed">
                    &ldquo;{person.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-3.5 border-t-2 border-[#3c3d44] bg-[#212026] flex items-center justify-between">
          <span className="text-xs text-[#a3a4ab]">
            {birthdayInfo.days === 0
              ? `🎉 Happy Birthday ${person.name}!`
              : `Birthday on ${monthNames[person.birthMonth - 1]} ${person.birthDay}`}
          </span>
          <button
            onClick={onClose}
            className="mc-button px-4 py-1 text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
