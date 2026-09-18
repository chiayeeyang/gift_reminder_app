import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
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
  Filter,
  Check,
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
    <div className="space-y-6 font-pixel">
      {/* Overview Banner / Minecraft Status Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Urgent Redstone Block */}
        <div className="p-4 mc-panel border-2 border-black flex items-center justify-between bg-[#3b1212] text-white">
          <div>
            <span className="font-mc text-[10px] text-[#ff6666] tracking-wider block mc-text-shadow">
              URGENT (NEXT 7 DAYS)
            </span>
            <div className="text-xl font-bold text-white mt-1 mc-text-shadow font-pixel">
              {urgentCount} {urgentCount === 1 ? 'Quest Event' : 'Quest Events'}
            </div>
            <p className="text-xs text-[#ffaaaa] mt-1">
              {urgentCount > 0 ? 'Wrap gifts & ready player trades!' : 'All world events on schedule!'}
            </p>
          </div>
          <div className="w-11 h-11 bg-[#1c0808] border-2 border-black flex items-center justify-center text-[#ff4444] shadow-[inset_2px_2px_0_#441212]">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Missing Gifts Gold Block */}
        <div className="p-4 mc-panel border-2 border-black flex items-center justify-between bg-[#38280f] text-white">
          <div>
            <span className="font-mc text-[10px] text-[#ffea75] tracking-wider block mc-text-shadow">
              EMPTY CHESTS (30 DAYS)
            </span>
            <div className="text-xl font-bold text-white mt-1 mc-text-shadow font-pixel">
              {missingGiftCount} {missingGiftCount === 1 ? 'Celebration' : 'Celebrations'}
            </div>
            <p className="text-xs text-[#fde68a] mt-1">
              No loot assigned yet. Craft new ideas!
            </p>
          </div>
          <div className="w-11 h-11 bg-[#1d1405] border-2 border-black flex items-center justify-center text-[#f59e0b] shadow-[inset_2px_2px_0_#45300e]">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* DIY Crafting XP Emerald Block */}
        <div className="p-4 mc-panel border-2 border-black flex items-center justify-between bg-[#132c14] text-white">
          <div>
            <span className="font-mc text-[10px] text-[#55ff55] tracking-wider block mc-text-shadow">
              DIY CRAFTING XP (30 DAYS)
            </span>
            <div className="text-xl font-bold text-white mt-1 mc-text-shadow font-pixel">
              {totalCraftHoursUpcoming} Hours Needed
            </div>
            <p className="text-xs text-[#a7f3d0] mt-1">
              Handmade gifts in crafting queue.
            </p>
          </div>
          <div className="w-11 h-11 bg-[#09170a] border-2 border-black flex items-center justify-center text-[#55ff55] shadow-[inset_2px_2px_0_#1b3e1c]">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 mc-panel-dark border-2 border-black">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#80ff20] font-mc text-[10px] flex items-center gap-1 mr-1 mc-text-shadow">
            <Filter className="w-3.5 h-3.5" /> QUEST URGENCY:
          </span>
          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none ${
              urgencyFilter === 'all'
                ? 'bg-[#404149] text-[#ffffff] border-white'
                : 'mc-button'
            }`}
          >
            All Quests
          </button>
          <button
            onClick={() => setUrgencyFilter('7days')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none ${
              urgencyFilter === '7days'
                ? 'bg-[#b71c1c] text-white border-white'
                : 'mc-button'
            }`}
          >
            🔥 Next 7 Days ({urgentCount})
          </button>
          <button
            onClick={() => setUrgencyFilter('30days')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none ${
              urgencyFilter === '30days'
                ? 'bg-[#0284c7] text-white border-white'
                : 'mc-button'
            }`}
          >
            🗓️ Next 30 Days
          </button>
          <button
            onClick={() => setUrgencyFilter('needs_gift')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none ${
              urgencyFilter === 'needs_gift'
                ? 'bg-[#d97706] text-black border-white'
                : 'mc-button'
            }`}
          >
            ⚠️ Needs Gift ({reminders.filter((r) => r.status === 'needs_gift').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a3a4ab] font-pixel">Player Group:</span>
          <select
            value={relationshipFilter}
            onChange={(e) => setRelationshipFilter(e.target.value)}
            className="mc-input px-2.5 py-1 text-xs font-pixel"
          >
            <option value="all">All Groups</option>
            <option value="partner">❤️ Partner</option>
            <option value="family">🏡 Family</option>
            <option value="friend">✨ Friends</option>
            <option value="colleague">💼 Guild</option>
          </select>
        </div>
      </div>

      {/* Reminder Cards List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center mc-panel-dark border-2 border-black">
            <Gift className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <p className="text-base font-bold text-white mc-text-shadow font-mc">NO ACTIVE QUESTS IN CHUNK</p>
            <p className="text-xs text-[#a3a4ab] mt-1 font-pixel">Try selecting &quot;All Quests&quot; or add a new player.</p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const isUrgent = reminder.daysRemaining <= 7;
            const person = people.find((p) => p.id === reminder.personId);

            return (
              <div
                key={reminder.id}
                className={`p-4 mc-panel border-2 border-black ${
                  isUrgent ? 'border-[#b71c1c] shadow-[inset_0_0_8px_rgba(183,28,28,0.3)]' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Event info & player head */}
                  <div className="flex items-start gap-3.5">
                    {/* Minecraft Item Slot for Avatar */}
                    <div className="w-14 h-14 mc-slot relative flex items-center justify-center shrink-0">
                      {person ? (
                        <CuteFace
                          name={person.name}
                          config={person.cuteFace}
                          size={44}
                          isHovered={false}
                        />
                      ) : (
                        <span className="font-mc text-sm text-[#ffea75]">
                          {reminder.personName
                            ? reminder.personName.slice(0, 1).toUpperCase()
                            : reminder.title.slice(0, 1)}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#18181b] font-pixel">
                          {reminder.title}
                        </h3>
                        {reminder.isMilestone && (
                          <span className="px-1.5 py-0.5 border border-black bg-[#ffea75] text-[#1c1917] text-[10px] font-bold">
                            Level Milestone {reminder.turningAge}! 🎂
                          </span>
                        )}
                        {reminder.relationship && (
                          <span className="px-1.5 py-0.5 border border-black bg-[#26252b] text-white text-[10px] capitalize font-medium">
                            {reminder.relationship}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#27272a] mt-1.5 font-pixel font-medium">
                        <span className="flex items-center gap-1 text-[#18181b] font-bold">
                          <Calendar className="w-3.5 h-3.5 text-[#0369a1]" />
                          {new Date(reminder.eventDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        {reminder.turningAge && (
                          <span className="text-[#27272a]">
                            Level <strong className="text-[#18181b]">{reminder.turningAge}</strong>
                          </span>
                        )}

                        <span
                          className={`font-bold px-1.5 py-0.2 border border-black ${
                            reminder.daysRemaining === 0
                              ? 'bg-[#b71c1c] text-white mc-text-shadow'
                              : reminder.daysRemaining <= 7
                              ? 'bg-[#d97706] text-black'
                              : 'bg-[#2b7730] text-[#55ff55] mc-text-shadow'
                          } text-[10px]`}
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
                        <span className="text-xs px-2.5 py-1 bg-[#4a1212] border border-black text-[#ff8080] flex items-center gap-1 font-pixel">
                          <AlertCircle className="w-3.5 h-3.5 text-[#ff5555]" /> No Gift Planned
                        </span>
                        {person && (
                          <button
                            onClick={() =>
                              onNavigateToAI(person.name, person.relationship, person.interests.join(', '))
                            }
                            className="mc-button-gold px-3 py-1.5 text-xs flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Craft AI Ideas
                          </button>
                        )}
                        <button
                          onClick={() => onAddGiftForReminder(reminder.personId, reminder.type === 'birthday' ? 'birthday' : undefined)}
                          className="mc-button-emerald px-3 py-1.5 text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Plan Gift
                        </button>
                      </div>
                    ) : reminder.status === 'ready' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 bg-[#133115] border border-black text-[#80ff20] flex items-center gap-1 font-pixel mc-text-shadow">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#55ff55]" /> In Chest & Ready
                        </span>
                        <button
                          onClick={() => onAddGiftForReminder(reminder.personId, reminder.type === 'birthday' ? 'birthday' : undefined)}
                          className="mc-button px-2.5 py-1.5 text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Another
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 bg-[#1e2a3a] border border-black text-[#55ffff] flex items-center gap-1 font-pixel mc-text-shadow">
                          <Clock className="w-3.5 h-3.5 text-[#55ffff]" /> Crafting In Progress
                        </span>
                        <button
                          onClick={() => onAddGiftForReminder(reminder.personId, reminder.type === 'birthday' ? 'birthday' : undefined)}
                          className="mc-button px-2.5 py-1.5 text-xs flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Another
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Craft Lead-Time Advisory Warning */}
                {reminder.totalCraftHoursLeft > 0 && (
                  <div className="mt-3 p-2.5 mc-panel-dark border border-black text-xs text-[#f1ede4] flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#ff5555] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#ff8080]">
                        Crafting Schedule Warning:
                      </span>{' '}
                      You have <strong>{reminder.totalCraftHoursLeft} hours</strong> of handmade crafting remaining.
                      {reminder.daysRemaining <= 10 && reminder.totalCraftHoursLeft > 3 && (
                        <span className="block text-[#ffea75] mt-0.5">
                          ⚠️ Time is tight ({reminder.daysRemaining} days left). Plan ~
                          {Math.ceil((reminder.totalCraftHoursLeft / Math.max(1, reminder.daysRemaining - 1)) * 10) / 10}{' '}
                          hours/day to finish before event!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Assigned Gifts in Chest */}
                {reminder.assignedGifts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#3c3d44] space-y-2">
                    <div className="text-xs font-mc text-[10px] text-[#80ff20] flex items-center justify-between mc-text-shadow">
                      <span>CHEST LOOT ({reminder.assignedGifts.length})</span>
                      <span>TOTAL: {formatCurrency(reminder.totalPlannedCost)}</span>
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
                            className="p-2 mc-panel-dark border border-black flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                {isHandmade ? (
                                  <span className="px-1 py-0.2 bg-[#2b7730] border border-black text-[#55ff55] text-[9px] font-pixel">
                                    DIY
                                  </span>
                                ) : (
                                  <span className="px-1 py-0.2 bg-[#d97706] border border-black text-black text-[9px] font-pixel">
                                    TRADE
                                  </span>
                                )}
                                <span
                                  onClick={() => onSelectGift(gift.id)}
                                  className="font-bold text-white truncate hover:text-[#55ffff] cursor-pointer font-pixel"
                                >
                                  {gift.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-[#a3a4ab] font-pixel text-[11px]">
                                <span className="text-[#ffea75]">{formatCurrency(gift.actualPrice ?? gift.estimatedPrice)}</span>
                                <span>■</span>
                                <span className="text-white">
                                  {badge.label}
                                </span>
                                {isHandmade && estHours > 0 && (
                                  <span className="text-[#55ff55]">
                                    {spentHours}/{estHours}h ({progressPct}%)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Quick status button */}
                            {gift.status !== 'wrapped' && gift.status !== 'given' ? (
                              <button
                                title="Mark as Wrapped & Ready in Chest"
                                onClick={() => updateGift(gift.id, { status: 'wrapped' })}
                                className="mc-button px-2 py-1 text-xs flex items-center gap-1 shrink-0"
                              >
                                <Check className="w-3 h-3 text-[#55ff55]" /> Wrap
                              </button>
                            ) : (
                              <span className="text-[#55ff55] font-bold flex items-center gap-1 text-[10px] shrink-0 mc-text-shadow">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#55ff55]" /> READY
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
