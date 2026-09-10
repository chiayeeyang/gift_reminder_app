import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { Person } from '../types';
import { calculateDaysUntil, formatCurrency, formatRelativeDays } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Shirt,
} from 'lucide-react';

interface PeopleTabProps {
  onOpenPersonModal: (person?: Person) => void;
  onAddGiftForPerson: (personId: string) => void;
  onNavigateToAI: (name: string, relationship: string, interests: string) => void;
  onSelectGift: (giftId: string) => void;
}

export const PeopleTab: React.FC<PeopleTabProps> = ({
  onOpenPersonModal,
  onAddGiftForPerson,
  onNavigateToAI,
  onSelectGift,
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

        <button
          onClick={() => onOpenPersonModal()}
          className="mc-button-emerald px-3.5 py-1.5 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Spawn Player
        </button>
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

          return (
            <div
              key={person.id}
              className="p-4 mc-panel border-2 border-black flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 mc-slot flex items-center justify-center p-0.5 shrink-0">
                      <CuteFace name={person.name} config={person.cuteFace} size={42} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white mc-text-shadow font-pixel">{person.name}</h3>
                        <span className="px-1.5 py-0.2 border border-black bg-[#26252b] text-[#a3a4ab] text-[10px] capitalize">
                          {person.relationship}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#a3a4ab] mt-1 font-pixel">
                        <Calendar className="w-3.5 h-3.5 text-[#55ffff]" />
                        <span className="text-white">
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
                          <span className="text-[#a3a4ab]">(Lvl {turningAge})</span>
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

                {/* Sizing & Measurements Box */}
                {(person.sizes?.clothing || person.sizes?.shoe || person.sizes?.ring) && (
                  <div className="mt-3 p-2 mc-panel-dark border border-black flex flex-wrap items-center gap-2 text-xs">
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

                {/* Likes / Dislikes notes */}
                {person.preferences?.likes && (
                  <div className="mt-2 text-xs text-[#a3a4ab]">
                    <strong className="text-[#55ff55]">Loves:</strong> {person.preferences.likes}
                  </div>
                )}
                {person.preferences?.dislikes && (
                  <div className="mt-0.5 text-xs text-[#a3a4ab]">
                    <strong className="text-[#ff5555]">Avoids:</strong> {person.preferences.dislikes}
                  </div>
                )}

                {/* Emerald Budget Bar */}
                {budget > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#3c3d44] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#a3a4ab]">Annual Emerald Budget</span>
                      <span className="text-[#55ff55] font-pixel">
                        {formatCurrency(totalSpent)} / {formatCurrency(budget)} ({budgetPct}%)
                      </span>
                    </div>
                    {/* Minecraft Emerald Bar */}
                    <div className="w-full h-2.5 bg-[#0a0a0c] border border-black p-0.5">
                      <div
                        className={`h-full ${
                          budgetPct > 100 ? 'bg-[#b71c1c]' : 'bg-[#2b7730]'
                        } shadow-[inset_0_1px_0_#ffffff]`}
                        style={{ width: `${Math.min(100, budgetPct)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Planned Gifts List */}
                <div className="mt-3 pt-2.5 border-t border-[#3c3d44]">
                  <div className="flex items-center justify-between text-xs text-[#80ff20] font-mc text-[10px] mb-2 mc-text-shadow">
                    <span>CHEST LOOT ({personGifts.length})</span>
                    <button
                      onClick={() => onAddGiftForPerson(person.id)}
                      className="text-[#55ffff] hover:underline flex items-center gap-1 font-pixel text-xs"
                    >
                      <Plus className="w-3 h-3" /> Add Gift
                    </button>
                  </div>

                  {personGifts.length === 0 ? (
                    <p className="text-xs text-[#777777] italic">No items stored in chest yet for {person.name}.</p>
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
                        <span className="text-[10px] text-[#a3a4ab] block text-right font-pixel">
                          +{personGifts.length - 3} more items in chest
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3 pt-2.5 border-t border-[#3c3d44] flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    onNavigateToAI(person.name, person.relationship, person.interests.join(', '))
                  }
                  className="mc-button-gold px-3 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Craft AI Ideas
                </button>

                <button
                  onClick={() => onAddGiftForPerson(person.id)}
                  className="mc-button-emerald px-3 py-1.5 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Plan Gift
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
