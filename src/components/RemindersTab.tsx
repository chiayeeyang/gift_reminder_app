import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { UpcomingReminder, Relationship } from '../types';
import { formatCurrency, formatRelativeDays, getStatusBadge } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import {
  Calendar,
  Gift,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface RemindersTabProps {
  onAddGiftForReminder: (personId?: string, occasion?: any) => void;
  onSelectGift: (giftId: string) => void;
  onNavigateToAI: (personName?: string, relationship?: string, interests?: string) => void;
}

export const RemindersTab: React.FC<RemindersTabProps> = ({
  onAddGiftForReminder,
  onSelectGift,
  onNavigateToAI,
}) => {
  const { reminders, people, updateGift } = useGifts();

  const [urgencyFilter, setUrgencyFilter] = useState<'all' | '7days' | '30days' | 'needs_gift'>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');

  const filteredReminders = reminders.filter((r) => {
    if (urgencyFilter === '7days' && r.daysRemaining > 7) return false;
    if (urgencyFilter === '30days' && r.daysRemaining > 30) return false;
    if (urgencyFilter === 'needs_gift' && r.status !== 'needs_gift') return false;

    if (relationshipFilter !== 'all' && r.relationship !== relationshipFilter) return false;

    return true;
  });

  const urgentCount = reminders.filter((r) => r.daysRemaining <= 7).length;
  const missingGiftCount = reminders.filter((r) => r.daysRemaining <= 30 && r.status === 'needs_gift').length;
  const totalCraftHoursUpcoming = reminders
    .filter((r) => r.daysRemaining <= 30)
    .reduce((sum, r) => sum + r.totalCraftHoursLeft, 0);

  return (
    <div className="space-y-6">
      {/* Overview Banner / Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#fef3c7] border-2 border-stone-800 shadow-[3px_3px_0px_#292524] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block font-sketch text-sm">
              Urgent (Next 7 Days)
            </span>
            <div className="text-2xl font-bold text-stone-900 mt-0.5 font-sketch text-3xl">
              {urgentCount} {urgentCount === 1 ? 'Event' : 'Events'}
            </div>
            <p className="text-xs text-stone-700 mt-1 font-sketch text-sm">
              {urgentCount > 0 ? 'Review purchases & wrap gifts!' : 'You are currently on schedule!'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fffefb] border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] text-amber-700 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#ffe4e6] border-2 border-stone-800 shadow-[3px_3px_0px_#292524] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block font-sketch text-sm">
              Gifts Needed (Next 30 Days)
            </span>
            <div className="text-2xl font-bold text-stone-900 mt-0.5 font-sketch text-3xl">
              {missingGiftCount} {missingGiftCount === 1 ? 'Celebration' : 'Celebrations'}
            </div>
            <p className="text-xs text-stone-700 mt-1 font-sketch text-sm">
              No gift planned yet. Brainstorm ideas!
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fffefb] border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#ede9fe] border-2 border-stone-800 shadow-[3px_3px_0px_#292524] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block font-sketch text-sm">
              DIY Crafting (Next 30 Days)
            </span>
            <div className="text-2xl font-bold text-stone-900 mt-0.5 font-sketch text-3xl">
              {totalCraftHoursUpcoming} Hours Left
            </div>
            <p className="text-xs text-stone-700 mt-1 font-sketch text-sm">
              Handmade gifts in progress.
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#fffefb] border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] text-purple-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#fffefb] rounded-2xl border-2 border-stone-800 shadow-[2.5px_2.5px_0px_#292524]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1 mr-1 font-sketch text-sm">
            <Filter className="w-3.5 h-3.5" /> Urgency:
          </span>
          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-3 py-1.5 rounded-xl border-2 border-stone-800 text-xs font-bold transition-all ${
              urgencyFilter === 'all'
                ? 'bg-stone-900 text-[#fffefb] shadow-[1.5px_1.5px_0px_#292524]'
                : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
            }`}
          >
            All Upcoming
          </button>
          <button
            onClick={() => setUrgencyFilter('7days')}
            className={`px-3 py-1.5 rounded-xl border-2 border-stone-800 text-xs font-bold transition-all ${
              urgencyFilter === '7days'
                ? 'bg-[#fef08a] text-stone-900 shadow-[1.5px_1.5px_0px_#292524]'
                : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
            }`}
          >
            🔥 Next 7 Days ({urgentCount})
          </button>
          <button
            onClick={() => setUrgencyFilter('30days')}
            className={`px-3 py-1.5 rounded-xl border-2 border-stone-800 text-xs font-bold transition-all ${
              urgencyFilter === '30days'
                ? 'bg-[#bae6fd] text-stone-900 shadow-[1.5px_1.5px_0px_#292524]'
                : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
            }`}
          >
            🗓️ Next 30 Days
          </button>
          <button
            onClick={() => setUrgencyFilter('needs_gift')}
            className={`px-3 py-1.5 rounded-xl border-2 border-stone-800 text-xs font-bold transition-all ${
              urgencyFilter === 'needs_gift'
                ? 'bg-[#fecdd3] text-stone-900 shadow-[1.5px_1.5px_0px_#292524]'
                : 'bg-[#fffefb] text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
            }`}
          >
            ⚠️ Needs Gift ({reminders.filter((r) => r.status === 'needs_gift').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 font-sketch text-sm">Circle:</span>
          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border-2 border-stone-800 bg-[#fffefb] text-xs font-bold text-stone-800 shadow-[1.5px_1.5px_0px_#292524]"
          >
            <option value="all">All Relationships</option>
            <option value="partner">❤️ Partner</option>
            <option value="family">🏡 Family</option>
            <option value="friend">✨ Friends</option>
            <option value="colleague">💼 Work</option>
          </select>
        </div>
      </div>

      {/* Reminder Cards List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center bg-[#fffefb] rounded-2xl border-2 border-dashed border-stone-400 shadow-[2px_2px_0px_#292524]">
            <Gift className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-base font-bold text-stone-800 font-sketch text-xl">No matching reminders found</p>
            <p className="text-xs text-stone-600 mt-1 font-sketch text-sm">Try relaxing your filters or add a new person or gift.</p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const isUrgent = reminder.daysRemaining <= 7;
            const isSoon = reminder.daysRemaining <= 30;
            const person = people.find((p) => p.id === reminder.personId);

            return (
              <div
                key={reminder.id}
                className={`p-5 rounded-2xl bg-[#fffefb] border-2 border-stone-800 shadow-[3.5px_3.5px_0px_#292524] transition-all duration-200 ${
                  isUrgent ? 'bg-[#fffdf7]' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Event info & countdown badge */}
                  <div className="flex items-start gap-4">
                    {/* Circle avatar or icon */}
                    <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                        <path
                          d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                          fill={reminder.avatarColor || '#fecdd3'}
                        />
                        <path
                          d="M 50.4 4.5 C 75.2 3.8, 95.5 25.2, 95.1 50.2 C 94.7 74.8, 74.5 95.2, 49.8 95 C 25.1 94.8, 5.2 75, 4.8 50.4 C 4.5 25.4, 25.4 5.2, 50.4 4.5"
                          stroke="#78716c"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeDasharray="70 4 30 3"
                          opacity={0.5}
                        />
                        <path
                          d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                          stroke="#292524"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {person ? (
                        <CuteFace
                          name={person.name}
                          config={person.cuteFace}
                          size={46}
                          isHovered={false}
                        />
                      ) : (
                        <span className="font-bold text-stone-900 font-sketch text-lg relative z-10">
                          {reminder.personName
                            ? reminder.personName.slice(0, 1).toUpperCase()
                            : reminder.title.slice(0, 1)}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-stone-900 font-sketch text-lg">{reminder.title}</h3>
                        {reminder.isMilestone && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold border-2 border-stone-800 bg-[#fef08a] text-stone-900 shadow-[1px_1px_0px_#292524]">
                            Milestone Age {reminder.turningAge}! 🎉
                          </span>
                        )}
                        {reminder.relationship && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold border border-stone-800 bg-[#fffefb] text-stone-700 capitalize shadow-[1px_1px_0px_#292524]">
                            {reminder.relationship}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-1">
                        <span className="flex items-center gap-1 font-medium font-sketch text-sm">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          {new Date(reminder.eventDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        {reminder.turningAge && (
                          <span className="font-sketch text-sm">
                            Turning <strong>{reminder.turningAge}</strong>
                          </span>
                        )}

                        <span
                          className={`font-bold px-2 py-0.5 rounded-md border border-stone-800 shadow-[1px_1px_0px_#292524] ${
                            reminder.daysRemaining === 0
                              ? 'bg-[#ffe4e6] text-rose-900'
                              : reminder.daysRemaining <= 7
                              ? 'bg-[#fef3c7] text-amber-900'
                              : 'bg-[#fffefb] text-stone-800'
                          }`}
                        >
                          {formatRelativeDays(reminder.daysRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Quick Actions */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center">
                    {reminder.status === 'needs_gift' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#ffe4e6] border-2 border-stone-800 text-rose-900 flex items-center gap-1 shadow-[1.5px_1.5px_0px_#292524]">
                          <AlertCircle className="w-3.5 h-3.5" /> No Gift Planned
                        </span>
                        {person && (
                          <button
                            onClick={() =>
                              onNavigateToAI(person.name, person.relationship, person.interests.join(', '))
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#fef3c7] hover:bg-amber-100 border-2 border-stone-800 text-amber-950 text-xs font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#292524] transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> AI Ideas
                          </button>
                        )}
                        <button
                          onClick={() => onAddGiftForReminder(reminder.personId, reminder.type === 'birthday' ? 'birthday' : undefined)}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-[#fffefb] text-xs font-bold flex items-center gap-1 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#292524] transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Plan Gift
                        </button>
                      </div>
                    ) : reminder.status === 'ready' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#dcfce7] border-2 border-stone-800 text-emerald-900 flex items-center gap-1 shadow-[1.5px_1.5px_0px_#292524]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> All Set & Ready
                        </span>
                        <button
                          onClick={() => onAddGiftForReminder(reminder.personId, reminder.type === 'birthday' ? 'birthday' : undefined)}
                          className="px-2.5 py-1.5 rounded-xl border-2 border-stone-800 bg-[#fffefb] hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#292524] transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Another
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#ede9fe] border-2 border-stone-800 text-indigo-900 flex items-center gap-1 shadow-[1.5px_1.5px_0px_#292524]">
                          <Clock className="w-3.5 h-3.5 text-indigo-700" /> Gift In Progress
                        </span>
                        <button
                          onClick={() => onAddGiftForReminder(reminder.personId, reminder.type === 'birthday' ? 'birthday' : undefined)}
                          className="px-2.5 py-1.5 rounded-xl border-2 border-stone-800 bg-[#fffefb] hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#292524] transition-all"
                        >
                          <Plus className="w-3 h-3" /> Add Another
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Craft Lead-Time Advisory Warning (if crafting needed) */}
                {reminder.totalCraftHoursLeft > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-[#ffe4e6] border-2 border-stone-800 text-xs text-stone-900 flex items-start gap-2.5 shadow-[2px_2px_0px_#292524]">
                    <Clock className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950 font-sketch text-sm">
                        Crafting Schedule Alert:
                      </span>{' '}
                      You have <strong>{reminder.totalCraftHoursLeft} hours</strong> of handmade
                      crafting remaining for this celebration.
                      {reminder.daysRemaining <= 10 && reminder.totalCraftHoursLeft > 3 && (
                        <span className="block font-bold text-rose-900 mt-0.5">
                          ⚠️ Time is tight ({reminder.daysRemaining} days left). Plan ~
                          {Math.ceil((reminder.totalCraftHoursLeft / Math.max(1, reminder.daysRemaining - 1)) * 10) / 10}{' '}
                          hours/day to wrap before the party!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Gifts List for this reminder */}
                {reminder.assignedGifts.length > 0 && (
                  <div className="mt-4 pt-3 border-t-2 border-stone-800 space-y-2">
                    <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between font-sketch text-sm">
                      <span>Planned Gifts ({reminder.assignedGifts.length})</span>
                      <span>Total: {formatCurrency(reminder.totalPlannedCost)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {reminder.assignedGifts.map((gift) => {
                        const badge = getStatusBadge(gift.status);
                        const isHandmade = gift.type === 'handmade';
                        const spentHours = gift.craftingHoursSpent || 0;
                        const estHours = gift.craftingHoursEstimated || 0;
                        const progressPct =
                          estHours > 0 ? Math.min(100, Math.round((spentHours / estHours) * 100)) : 0;

                        return (
                          <div
                            key={gift.id}
                            className="p-2.5 rounded-xl bg-[#fffefb] border-2 border-stone-800 shadow-[1.5px_1.5px_0px_#292524] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {isHandmade ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#ffe4e6] border border-stone-800 text-stone-900 text-[10px] font-bold uppercase">
                                    DIY
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-[#fef3c7] border border-stone-800 text-stone-900 text-[10px] font-bold uppercase">
                                    Bought
                                  </span>
                                )}
                                <span
                                  onClick={() => onSelectGift(gift.id)}
                                  className="font-bold text-stone-900 truncate hover:underline cursor-pointer"
                                >
                                  {gift.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-stone-600">
                                <span className="font-semibold">{formatCurrency(gift.actualPrice ?? gift.estimatedPrice)}</span>
                                <span>•</span>
                                <span className="px-1.5 py-0.5 rounded-md border border-stone-800 bg-[#fffefb] text-stone-800 text-[10px] font-bold">
                                  {badge.label}
                                </span>
                                {isHandmade && estHours > 0 && (
                                  <span className="font-mono text-stone-700 font-semibold">
                                    {spentHours}/{estHours}h ({progressPct}%)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quick status button */}
                            {gift.status !== 'wrapped' && gift.status !== 'given' ? (
                              <button
                                title="Mark as Wrapped & Ready"
                                onClick={() => updateGift(gift.id, { status: 'wrapped' })}
                                className="px-2 py-1 rounded-xl bg-[#fffefb] border-2 border-stone-800 text-stone-800 font-bold text-xs flex items-center gap-1 shadow-[1px_1px_0px_#292524] hover:bg-stone-100 transition-all shrink-0"
                              >
                                <Check className="w-3 h-3" /> Wrap
                              </button>
                            ) : (
                              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
