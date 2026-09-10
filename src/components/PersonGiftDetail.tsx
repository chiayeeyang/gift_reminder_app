import React, { useState, useMemo } from 'react';
import { Person, GiftItem, OccasionType } from '../types';
import { useGifts } from '../context/GiftContext';
import { calculateDaysUntil, formatCurrency, getMilestoneBirthdayText } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
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
  ChevronRight,
  Filter,
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
  const { gifts, updateGift, logCraftTime } = useGifts();

  // Budget filter state
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under25' | 'under50' | 'under100' | 'within_budget'>('all');
  // Time/Type filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'bought' | 'diy_quick' | 'diy_medium' | 'diy_long'>('all');

  // Days until next birthday
  const birthdayInfo = calculateDaysUntil(person.birthMonth, person.birthDay);
  const milestone = person.birthYear ? getMilestoneBirthdayText(person.birthYear, birthdayInfo.year) : null;

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
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="person-detail-drawer"
        className="w-full max-w-2xl bg-[#fffefb] h-full shadow-2xl flex flex-col overflow-hidden border-l-3 border-stone-800 animate-in slide-in-from-right duration-300"
      >
        {/* Top bar */}
        <div className="p-4 border-b-2 border-stone-800 flex items-center justify-between bg-[#fffefb]">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524]"
              style={{ backgroundColor: person.avatarColor || '#fbcfe8' }}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-800 font-sketch text-sm">
              {person.relationship} Profile & Wishlist
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPersonModal(person)}
              className="px-3 py-1 text-xs font-bold text-stone-800 bg-[#fffefb] border-2 border-stone-800 rounded-xl hover:bg-stone-100 shadow-[1.5px_1.5px_0px_#292524] transition-all flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-700 hover:text-stone-950 bg-[#fffefb] border-2 border-stone-800 rounded-xl shadow-[1.5px_1.5px_0px_#292524] hover:bg-stone-100 transition-all"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero Profile Card with cute face */}
          <div className="p-5 rounded-2xl border-2 border-stone-800 shadow-[3.5px_3.5px_0px_#292524] relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-[#fffefb]">
            {/* Handdrawn Circle Avatar */}
            <div className="w-24 h-24 relative flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                <defs>
                  <radialGradient id={`profile-wash-${person.id}`} cx="42%" cy="38%" r="62%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="85%" stopColor={person.avatarColor || '#fbcfe8'} stopOpacity="1" />
                    <stop offset="100%" stopColor="#292524" stopOpacity="0.1" />
                  </radialGradient>
                </defs>
                <path
                  d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                  fill={`url(#profile-wash-${person.id})`}
                />
                <path
                  d="M 50.4 4.5 C 75.2 3.8, 95.5 25.2, 95.1 50.2 C 94.7 74.8, 74.5 95.2, 49.8 95 C 25.1 94.8, 5.2 75, 4.8 50.4 C 4.5 25.4, 25.4 5.2, 50.4 4.5"
                  stroke="#78716c"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeDasharray="90 4 40 3"
                  opacity={0.6}
                />
                <path
                  d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                  stroke="#292524"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <CuteFace name={person.name} config={person.cuteFace} size={70} />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-serif font-bold text-stone-900">{person.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-[#fffefb] text-stone-800 border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524]">
                  {person.relationship}
                </span>
                {milestone && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef08a] text-stone-900 border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] animate-pulse font-sketch">
                    ✨ {milestone}
                  </span>
                )}
              </div>

              {/* Birthday row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-stone-700 pt-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>
                    {monthNames[person.birthMonth - 1]} {person.birthDay}
                    {person.birthYear ? `, ${person.birthYear}` : ''}
                  </span>
                </div>
                <span className="text-stone-300">•</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] ${
                    birthdayInfo.days === 0
                      ? 'bg-rose-400 text-stone-950 font-sketch'
                      : birthdayInfo.days <= 7
                      ? 'bg-[#fde047] text-stone-950 font-sketch'
                      : birthdayInfo.days <= 30
                      ? 'bg-[#fed7aa] text-stone-900 font-sketch'
                      : 'bg-[#e7e5e4] text-stone-800 font-sketch'
                  }`}
                >
                  {birthdayInfo.days === 0 ? 'Today! 🎂' : `in ${birthdayInfo.days} days`}
                </span>
              </div>

              {/* Interests preview pills */}
              {person.interests && person.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 justify-center sm:justify-start">
                  {person.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 text-xs font-semibold bg-[#fffefb] border-1.5 border-stone-800 rounded-md text-stone-800 shadow-[1px_1px_0px_#292524]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BUDGET & TIME MANAGEMENT SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2 font-sketch text-base">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              Budget & Time Management
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Budget card */}
              <div className="p-4 bg-[#f0fdf4] rounded-2xl border-2 border-stone-800 shadow-[2.5px_2.5px_0px_#292524] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 font-sketch text-sm">Annual Gift Budget</span>
                  <span className="text-xs font-bold text-stone-900">
                    {formatCurrency(totalPlannedSpent)} / {formatCurrency(annualBudget)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-white border border-stone-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetPercent > 90
                        ? 'bg-rose-500'
                        : budgetPercent > 70
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
                  <span className="font-sketch font-bold">{budgetPercent}% allocated</span>
                  <span className="font-bold text-emerald-800">
                    {formatCurrency(remainingBudget)} remaining
                  </span>
                </div>
              </div>

              {/* DIY Craft Time card */}
              <div className="p-4 bg-[#fdf2f8] rounded-2xl border-2 border-stone-800 shadow-[2.5px_2.5px_0px_#292524] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 font-sketch text-sm">Handmade Craft Time</span>
                  <span className="text-xs font-bold text-stone-900">
                    {totalCraftHoursLogged}h / {totalCraftHoursNeeded}h needed
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-white border border-stone-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalCraftHoursNeeded > 0
                          ? Math.min(100, Math.round((totalCraftHoursLogged / totalCraftHoursNeeded) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
                  <span className="font-sketch font-bold">{handmadeGifts.length} DIY crafts</span>
                  <span className="font-bold text-rose-800">
                    {Math.max(0, totalCraftHoursNeeded - totalCraftHoursLogged)}h remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GIFT IDEAS REVEAL (Based on Budget and Time) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-rose-600" />
                  Gift Ideas ({personGifts.length})
                </h3>
                <p className="text-xs text-stone-600 font-sketch">
                  Filtered by budget limit and crafting time commitment
                </p>
              </div>

              <button
                onClick={() => onOpenGiftModal(undefined, person.id, 'birthday')}
                className="px-3.5 py-1.5 bg-stone-900 text-[#fffefb] rounded-xl text-xs font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-1.5 border-2 border-stone-900 shadow-[2px_2px_0px_#292524] self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Gift Idea
              </button>
            </div>

            {/* Interactive Filters: Budget & Time */}
            <div className="p-3.5 bg-[#fffefb] rounded-2xl border-2 border-stone-800 shadow-[2px_2px_0px_#292524] space-y-2.5">
              {/* Filter Row 1: Budget */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-stone-700 font-bold font-sketch mr-1 flex items-center gap-1 text-sm">
                  <DollarSign className="w-3 h-3 text-emerald-700" /> Budget:
                </span>
                {[
                  { id: 'all', label: 'All Budgets' },
                  { id: 'under25', label: '< $25' },
                  { id: 'under50', label: '< $50' },
                  { id: 'under100', label: '< $100' },
                  { id: 'within_budget', label: `Within remaining ($${remainingBudget})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setBudgetFilter(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-1.5 border-stone-800 ${
                      budgetFilter === item.id
                        ? 'bg-stone-900 text-[#fffefb] shadow-[1.5px_1.5px_0px_#292524]'
                        : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Filter Row 2: Time / Type */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-2 border-t border-stone-300">
                <span className="text-stone-700 font-bold font-sketch mr-1 flex items-center gap-1 text-sm">
                  <Clock className="w-3 h-3 text-rose-600" /> Time / Type:
                </span>
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'bought', label: 'Ready Bought (0 hrs)' },
                  { id: 'diy_quick', label: 'DIY Quick (< 2 hrs)' },
                  { id: 'diy_medium', label: 'DIY Medium (2-5 hrs)' },
                  { id: 'diy_long', label: 'DIY Project (5+ hrs)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTypeFilter(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-1.5 border-stone-800 ${
                      typeFilter === item.id
                        ? 'bg-rose-500 text-white shadow-[1.5px_1.5px_0px_#292524]'
                        : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Filtered Gifts */}
            {filteredGifts.length > 0 ? (
              <div className="space-y-2.5">
                {filteredGifts.map((gift) => {
                  const price = gift.actualPrice ?? gift.estimatedPrice;
                  const isHandmade = gift.type === 'handmade';

                  return (
                    <div
                      key={gift.id}
                      className="p-3.5 bg-[#fffefb] border-2 border-stone-800 rounded-xl hover:bg-stone-50/80 transition-all shadow-[2px_2px_0px_#292524] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] shrink-0 mt-0.5 ${
                            isHandmade ? 'bg-[#ffe4e6] text-rose-800' : 'bg-[#dcfce7] text-emerald-800'
                          }`}
                        >
                          {isHandmade ? <Scissors className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm">{gift.title}</h4>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border border-stone-800 ${
                                gift.status === 'given'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : gift.status === 'wrapped'
                                  ? 'bg-purple-100 text-purple-900'
                                  : gift.status === 'purchased' || gift.status === 'completed'
                                  ? 'bg-blue-100 text-blue-900'
                                  : gift.status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              {gift.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                            {/* Price */}
                            {price !== undefined && (
                              <span className="font-bold text-stone-900">
                                {formatCurrency(price)}
                              </span>
                            )}

                            {/* Crafting hours if handmade */}
                            {isHandmade && (
                              <span className="flex items-center gap-1 text-rose-800 font-bold">
                                <Clock className="w-3 h-3" />
                                {gift.craftingHoursSpent || 0} / {gift.craftingHoursEstimated || 0}h logged
                              </span>
                            )}

                            <span className="capitalize font-medium">{gift.occasion}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {isHandmade && (
                          <button
                            onClick={() => logCraftTime(gift.id, 0.5)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#ffe4e6] text-rose-800 hover:bg-rose-200 rounded-lg border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] transition-all"
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
                            className="px-2.5 py-1 text-[11px] font-bold bg-[#dcfce7] hover:bg-emerald-200 text-stone-900 rounded-lg border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] transition-all flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-800" />
                            {isHandmade ? 'Finish' : 'Got it'}
                          </button>
                        )}

                        <button
                          onClick={() => onOpenGiftModal(gift)}
                          className="p-1.5 text-stone-700 hover:text-stone-950 bg-[#fffefb] border-1.5 border-stone-800 rounded-lg hover:bg-stone-100 shadow-[1px_1px_0px_#292524] transition-all"
                          title="Edit Gift Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#fffefb] border-2 border-dashed border-stone-400 rounded-2xl space-y-2 shadow-[2px_2px_0px_#292524]">
                <p className="text-sm text-stone-700 font-bold font-sketch text-base">
                  No gift ideas match these filters.
                </p>
                <div className="flex justify-center gap-2 pt-1 font-sketch">
                  <button
                    onClick={() => {
                      setBudgetFilter('all');
                      setTypeFilter('all');
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Reset Filters
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => onOpenGiftModal(undefined, person.id, 'birthday')}
                    className="text-xs font-bold text-stone-800 hover:underline"
                  >
                    Add a New Idea
                  </button>
                </div>
              </div>
            )}

            {/* AI Generator suggestion box */}
            <div className="p-4 rounded-2xl bg-[#fef9c3] border-2 border-stone-800 shadow-[2.5px_2.5px_0px_#292524] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-sketch text-sm">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Brainstorm with AI for {person.name}
                </h4>
                <p className="text-[11px] text-stone-700 font-medium">
                  Generate gift ideas tailored to {person.name}'s interests, budget ($
                  {remainingBudget} left), and crafting skills.
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
                className="px-3.5 py-1.5 bg-[#f59e0b] hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#292524] transition-all shrink-0 flex items-center gap-1.5 font-sketch text-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Studio
              </button>
            </div>
          </div>

          {/* PREFERENCES & SIZING SECTION */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2 font-sketch text-base">
              <Heart className="w-4 h-4 text-rose-500" />
              Preferences, Sizing & Wishlist Notes
            </h3>

            <div className="space-y-3">
              {/* Likes & Dislikes */}
              {(person.preferences?.likes || person.preferences?.dislikes) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {person.preferences?.likes && (
                    <div className="p-3.5 bg-[#f0fdf4] rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 mb-1 font-sketch text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Loves & Likes
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {person.preferences.likes}
                      </p>
                    </div>
                  )}

                  {person.preferences?.dislikes && (
                    <div className="p-3.5 bg-[#fff1f2] rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                      <span className="text-xs font-bold text-rose-900 flex items-center gap-1 mb-1 font-sketch text-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                        Dislikes & Avoids
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {person.preferences.dislikes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Allergies & Favorite Colors */}
              {(person.preferences?.allergies || person.preferences?.favoriteColors) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {person.preferences?.allergies && (
                    <div className="p-3.5 bg-[#fefce8] rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1 mb-1 font-sketch text-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        Allergies & Sensitivities
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {person.preferences.allergies}
                      </p>
                    </div>
                  )}

                  {person.preferences?.favoriteColors && (
                    <div className="p-3.5 bg-[#f8fafc] rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#292524]">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1 mb-1 font-sketch text-sm">
                        <Tag className="w-3.5 h-3.5 text-stone-700" />
                        Favorite Colors
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-medium">
                        {person.preferences.favoriteColors}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sizes & Measurements */}
              {person.sizes && Object.values(person.sizes).some((v) => Boolean(v)) && (
                <div className="p-3.5 bg-[#fffefb] rounded-xl border-2 border-stone-800 shadow-[2px_2px_0px_#292524] space-y-2">
                  <span className="text-xs font-bold text-stone-900 block font-sketch text-sm">
                    Sizes & Measurements
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {person.sizes.clothing && (
                      <div className="p-2 bg-[#fffefb] rounded-lg border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524]">
                        <span className="text-[10px] text-stone-500 block font-bold">
                          Clothing
                        </span>
                        <span className="font-bold text-stone-900">
                          {person.sizes.clothing}
                        </span>
                      </div>
                    )}
                    {person.sizes.shoe && (
                      <div className="p-2 bg-[#fffefb] rounded-lg border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524]">
                        <span className="text-[10px] text-stone-500 block font-bold">Shoe</span>
                        <span className="font-bold text-stone-900">{person.sizes.shoe}</span>
                      </div>
                    )}
                    {person.sizes.ring && (
                      <div className="p-2 bg-[#fffefb] rounded-lg border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524]">
                        <span className="text-[10px] text-stone-500 block font-bold">
                          Ring / Wrist
                        </span>
                        <span className="font-bold text-stone-900">{person.sizes.ring}</span>
                      </div>
                    )}
                    {person.sizes.notes && (
                      <div className="p-2 bg-[#fffefb] rounded-lg border-1.5 border-stone-800 shadow-[1px_1px_0px_#292524] col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-stone-500 block font-bold">Notes</span>
                        <span className="text-stone-800 truncate block font-medium">
                          {person.sizes.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Notes & Dropped Hints */}
              {person.notes && (
                <div className="p-3.5 bg-[#fef9c3] rounded-xl border-2 border-stone-800 shadow-[2.5px_2.5px_0px_#292524]">
                  <span className="text-xs font-bold text-amber-950 block mb-1 font-sketch text-sm">
                    Wishlist Notes & Hints Dropped ✏️
                  </span>
                  <p className="text-xs text-stone-900 leading-relaxed font-sketch text-sm">
                    "{person.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t-2 border-stone-800 bg-[#fffefb] flex items-center justify-between">
          <span className="text-xs text-stone-600 font-sketch text-sm font-bold">
            {birthdayInfo.days === 0
              ? `🎉 Happy Birthday ${person.name}!`
              : `Birthday on ${monthNames[person.birthMonth - 1]} ${person.birthDay}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-[#fffefb] rounded-xl text-xs font-bold hover:bg-stone-800 transition-all border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#292524]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
