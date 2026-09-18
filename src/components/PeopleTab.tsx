import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { Person } from '../types';
import { calculateDaysUntil, formatCurrency, formatRelativeDays, getBirthdayHealth } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import { MinecraftHealthBar } from './MinecraftHealthBar';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Shirt,
  Heart,
  User,
} from 'lucide-react';

interface PeopleTabProps {
  onOpenPersonModal: (person?: Person) => void;
  onAddGiftForPerson: (personId: string) => void;
  onNavigateToAI: (name: string, relationship: string, interests: string) => void;
  onSelectGift: (giftId: string) => void;
  onSelectPerson?: (person: Person) => void;
  viewMode?: 'floating' | 'roster';
  onToggleViewMode?: (mode: 'floating' | 'roster') => void;
}

export const PeopleTab: React.FC<PeopleTabProps> = ({
  onOpenPersonModal,
  onAddGiftForPerson,
  onNavigateToAI,
  onSelectGift,
  onSelectPerson,
  viewMode = 'roster',
  onToggleViewMode,
}) => {
  const { people, gifts, deletePerson } = useGifts();
  const [relationFilter, setRelationFilter] = useState<string>('all');

  const filteredPeople = people.filter((p) => {
    if (relationFilter !== 'all' && p.relationship !== relationFilter) return false;
    return true;
  });

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="space-y-6 font-pixel">
      {/* Player Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 mc-panel border-2 border-black">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mc text-[10px] text-[#80ff20] mr-1 mc-text-shadow">
            PLAYER GROUP:
          </span>
          <button
            onClick={() => setRelationFilter('all')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none ${
              relationFilter === 'all'
                ? 'bg-[#404149] text-white border-white'
                : 'mc-button'
            }`}
          >
            Everyone ({people.length})
          </button>
          <button
            onClick={() => setRelationFilter('partner')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none flex items-center gap-1 ${
              relationFilter === 'partner'
                ? 'bg-[#b71c1c] text-white border-white'
                : 'mc-button'
            }`}
          >
            ❤️ Partner
          </button>
          <button
            onClick={() => setRelationFilter('family')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none flex items-center gap-1 ${
              relationFilter === 'family'
                ? 'bg-[#6d28d9] text-white border-white'
                : 'mc-button'
            }`}
          >
            🏡 Family
          </button>
          <button
            onClick={() => setRelationFilter('friend')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none flex items-center gap-1 ${
              relationFilter === 'friend'
                ? 'bg-[#0284c7] text-white border-white'
                : 'mc-button'
            }`}
          >
            ✨ Friends
          </button>
          <button
            onClick={() => setRelationFilter('colleague')}
            className={`px-3 py-1.5 text-xs font-pixel border-2 transition-none flex items-center gap-1 ${
              relationFilter === 'colleague'
                ? 'bg-[#2b7730] text-white border-white'
                : 'mc-button'
            }`}
          >
            💼 Guild
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onToggleViewMode && (
            <div className="flex items-center mc-panel-dark border-2 border-black p-0.5">
              <button
                onClick={() => onToggleViewMode('floating')}
                className={`px-2.5 py-1 text-xs font-pixel flex items-center gap-1 transition-none ${
                  viewMode === 'floating'
                    ? 'bg-[#404149] text-[#ffff55] border border-white font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Switch to Floating Avatars"
              >
                <span>🎈 Avatars</span>
              </button>
              <button
                onClick={() => onToggleViewMode('roster')}
                className={`px-2.5 py-1 text-xs font-pixel flex items-center gap-1 transition-none ${
                  viewMode === 'roster'
                    ? 'bg-[#404149] text-[#ffff55] border border-white font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Switch to Roster Grid"
              >
                <span>📋 Roster Grid</span>
              </button>
            </div>
          )}

          <button
            onClick={() => onOpenPersonModal()}
            className="mc-button-emerald px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Player
          </button>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPeople.map((person) => {
          const { days, year } = calculateDaysUntil(person.birthMonth, person.birthDay);
          const turningAge = person.birthYear ? year - person.birthYear : undefined;

          const personGifts = gifts.filter((g) => !g.archived && g.recipientId === person.id);
          const totalSpent = personGifts.reduce((sum, g) => sum + (g.actualPrice ?? g.estimatedPrice ?? 0), 0);
          const budget = person.annualBudget || 0;
          const budgetPct = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
          const health = getBirthdayHealth(person);

          return (
            <div
              key={person.id}
              className="p-4 mc-panel border-2 border-black flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => onSelectPerson?.(person)}
                      className="w-12 h-12 mc-slot flex items-center justify-center p-0.5 shrink-0 cursor-pointer hover:border-black"
                      title="View Player Profile"
                    >
                      <CuteFace name={person.name} config={person.cuteFace} size={42} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => onSelectPerson?.(person)}
                          className="text-base font-bold text-[#18181b] font-pixel cursor-pointer hover:underline"
                          title="Open player profile & gifts"
                        >
                          {person.name}
                        </h3>
                        <span className="px-1.5 py-0.2 border border-black bg-[#212026] text-white text-[10px] capitalize font-medium">
                          {person.relationship}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#27272a] mt-1 font-pixel font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#0369a1]" />
                        <span className="text-[#18181b] font-bold">
                          {months[person.birthMonth - 1]} {person.birthDay}
                        </span>
                        <span>■</span>
                        <span
                          className={`font-bold px-1 py-0.2 border border-black ${
                            days === 0
                              ? 'bg-[#b71c1c] text-white mc-text-shadow'
                              : days <= 7
                              ? 'bg-[#d97706] text-black'
                              : 'bg-[#212026] text-white'
                          } text-[10px]`}
                        >
                          {formatRelativeDays(days)}
                        </span>
                        {turningAge && (
                          <span className="text-[#3f3f46] font-semibold">(Lvl {turningAge})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[#888888]">
                    <button
                      onClick={() => onOpenPersonModal(person)}
                      title="Edit player"
                      className="mc-button p-1 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${person.name}? Linked gifts will become unassigned.`)) {
                          deletePerson(person.id);
                        }
                      }}
                      title="Remove player"
                      className="mc-button-red p-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Birthday Life Bar widget */}
                <div
                  onClick={() => onSelectPerson?.(person)}
                  className="mt-2.5 p-2 bg-[#1b1a1f] border border-black cursor-pointer hover:border-stone-400 transition-none"
                  title="Click to view full dossier & register gift sent"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1 font-pixel">
                    <span className="text-white font-bold flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#ef4444] fill-[#ef4444]" />
                      Birthday Life Bar
                    </span>
                    <span className="text-xs font-bold text-stone-300">
                      {health.isDead ? '💀 Player Out of Hearts' : health.isGiftSent ? '✨ Gift Sent (Safe)' : `${health.currentHp}/20 HP`}
                    </span>
                  </div>
                  <MinecraftHealthBar
                    currentHp={health.currentHp}
                    maxHp={20}
                    isGiftSent={health.isGiftSent}
                    isDead={health.isDead}
                    size="compact"
                    showLabel={false}
                  />
                </div>

                {/* Sizing & Measurements Box */}
                {(person.sizes?.clothing || person.sizes?.shoe || person.sizes?.ring) && (
                  <div className="mt-2.5 p-2 mc-panel-dark border border-black flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mc text-[9px] text-[#ffea75] flex items-center gap-1">
                      <Shirt className="w-3.5 h-3.5 text-[#ffea75]" /> ARMOR/SIZING:
                    </span>
                    {person.sizes?.clothing && (
                      <span className="bg-[#212026] px-1.5 py-0.5 border border-black text-white text-[11px]">
                        Armor: <strong>{person.sizes.clothing}</strong>
                      </span>
                    )}
                    {person.sizes?.shoe && (
                      <span className="bg-[#212026] px-1.5 py-0.5 border border-black text-white text-[11px]">
                        Boots: <strong>{person.sizes.shoe}</strong>
                      </span>
                    )}
                    {person.sizes?.ring && (
                      <span className="bg-[#212026] px-1.5 py-0.5 border border-black text-white text-[11px]">
                        Ring/Wrist: <strong>{person.sizes.ring}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Interests Pills */}
                {person.interests && person.interests.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {person.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#212026] border border-black text-[#55ffff] text-xs font-pixel"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Likes / Dislikes notes - High contrast dark readable text */}
                {person.preferences?.likes && (
                  <div className="mt-2 text-xs text-[#18181b] font-pixel">
                    <strong className="text-[#15803d] font-bold">Loves:</strong> {person.preferences.likes}
                  </div>
                )}
                {person.preferences?.dislikes && (
                  <div className="mt-0.5 text-xs text-[#18181b] font-pixel">
                    <strong className="text-[#b91c1c] font-bold">Avoids:</strong> {person.preferences.dislikes}
                  </div>
                )}

                {/* Emerald Budget Bar - High contrast dark readable text */}
                {budget > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-black/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-pixel">
                      <span className="text-[#18181b] font-bold">Annual Emerald Budget</span>
                      <span className="text-[#15803d] font-bold">
                        {formatCurrency(totalSpent)} / {formatCurrency(budget)} ({budgetPct}%)
                      </span>
                    </div>
                    {/* Minecraft Emerald Bar */}
                    <div className="w-full h-2.5 bg-[#18181b] border border-black p-0.5">
                      <div
                        className={`h-full ${
                          budgetPct > 100 ? 'bg-[#b71c1c]' : 'bg-[#15803d]'
                        } shadow-[inset_0_1px_0_#ffffff]`}
                        style={{ width: `${Math.min(100, budgetPct)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Planned Gifts List */}
                <div className="mt-3 pt-2.5 border-t border-black/30">
                  <div className="flex items-center justify-between text-xs text-[#18181b] font-mc text-[10px] mb-2 font-bold">
                    <span>CHEST LOOT ({personGifts.length})</span>
                    <button
                      onClick={() => onAddGiftForPerson(person.id)}
                      className="text-[#0369a1] hover:underline flex items-center gap-1 font-pixel text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" /> Add Gift
                    </button>
                  </div>

                  {personGifts.length === 0 ? (
                    <p className="text-xs text-[#3f3f46] italic">No items stored in chest yet for {person.name}.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {personGifts.slice(0, 3).map((gift) => (
                        <div
                          key={gift.id}
                          onClick={() => onSelectGift(gift.id)}
                          className="flex items-center justify-between p-1.5 mc-panel-dark border border-black hover:border-white cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {gift.type === 'handmade' ? (
                              <span className="px-1 py-0.2 bg-[#2b7730] text-[#55ff55] text-[9px] border border-black">
                                DIY
                              </span>
                            ) : (
                              <span className="px-1 py-0.2 bg-[#d97706] text-black text-[9px] border border-black">
                                TRADE
                              </span>
                            )}
                            <span className="text-white truncate">{gift.title}</span>
                          </div>
                          <span className="text-[#ffea75] shrink-0 font-pixel">
                            {formatCurrency(gift.actualPrice ?? gift.estimatedPrice)}
                          </span>
                        </div>
                      ))}
                      {personGifts.length > 3 && (
                        <span className="text-[10px] text-[#27272a] font-semibold block text-right font-pixel">
                          +{personGifts.length - 3} more items in chest
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3 pt-2.5 border-t border-black/30 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectPerson?.(person)}
                  className="mc-button px-2.5 py-1.5 text-xs flex items-center gap-1 font-pixel"
                >
                  <User className="w-3.5 h-3.5" /> View Profile
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onNavigateToAI(person.name, person.relationship, person.interests.join(', '))
                    }
                    className="mc-button-gold px-2.5 py-1.5 text-xs flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Gift Wizard
                  </button>

                  <button
                    onClick={() => onAddGiftForPerson(person.id)}
                    className="mc-button-emerald px-2.5 py-1.5 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Plan Gift
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
