import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { Person, Relationship } from '../types';
import { calculateDaysUntil, formatCurrency, formatRelativeDays } from '../utils/giftHelpers';
import { CuteFace } from './CuteFace';
import {
  Users,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Gift,
  DollarSign,
  Shirt,
  Info,
  Check,
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
    <div className="space-y-6">
      {/* Circle Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">
            Circle:
          </span>
          <button
            onClick={() => setRelationFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              relationFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Everyone ({people.length})
          </button>
          <button
            onClick={() => setRelationFilter('partner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              relationFilter === 'partner'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            ❤️ Partner
          </button>
          <button
            onClick={() => setRelationFilter('family')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              relationFilter === 'family'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            🏡 Family
          </button>
          <button
            onClick={() => setRelationFilter('friend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              relationFilter === 'friend'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            ✨ Friends
          </button>
          <button
            onClick={() => setRelationFilter('colleague')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              relationFilter === 'colleague'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            💼 Colleagues
          </button>
        </div>

        <button
          onClick={() => onOpenPersonModal()}
          className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Loved One
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
              className="p-5 rounded-2xl bg-white border border-stone-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center p-0.5 shadow-xs shrink-0"
                      style={{ backgroundColor: person.avatarColor || '#64748b' }}
                    >
                      <CuteFace name={person.name} config={person.cuteFace} size={44} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-stone-900">{person.name}</h3>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-600 capitalize">
                          {person.relationship}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {months[person.birthMonth - 1]} {person.birthDay}
                        </span>
                        <span>•</span>
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded-sm ${
                            days <= 7 ? 'bg-amber-100 text-amber-800' : 'text-stone-700 bg-stone-50'
                          }`}
                        >
                          {formatRelativeDays(days)}
                        </span>
                        {turningAge && (
                          <span className="text-stone-500 font-medium">({turningAge} yrs)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      onClick={() => onOpenPersonModal(person)}
                      title="Edit person"
                      className="p-1.5 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${person.name}? Linked gifts will become unassigned.`)) {
                          deletePerson(person.id);
                        }
                      }}
                      title="Remove person"
                      className="p-1.5 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sizing & Measurements Box */}
                {(person.sizes?.clothing || person.sizes?.shoe || person.sizes?.ring) && (
                  <div className="mt-3.5 p-2.5 rounded-xl bg-stone-50 border border-stone-150 flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                      <Shirt className="w-3.5 h-3.5 text-stone-400" /> Sizing:
                    </span>
                    {person.sizes?.clothing && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700 font-medium">
                        Clothes: <strong>{person.sizes.clothing}</strong>
                      </span>
                    )}
                    {person.sizes?.shoe && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700 font-medium">
                        Shoes: <strong>{person.sizes.shoe}</strong>
                      </span>
                    )}
                    {person.sizes?.ring && (
                      <span className="bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-700 font-medium">
                        Ring/Wrist: <strong>{person.sizes.ring}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Interests Pills */}
                {person.interests && person.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {person.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Likes / Dislikes notes */}
                {person.preferences?.likes && (
                  <div className="mt-3 text-xs text-stone-600">
                    <strong className="text-stone-800">Loves:</strong> {person.preferences.likes}
                  </div>
                )}
                {person.preferences?.dislikes && (
                  <div className="mt-1 text-xs text-stone-500">
                    <strong className="text-stone-700">Avoids:</strong> {person.preferences.dislikes}
                  </div>
                )}

                {/* Budget Bar */}
                {budget > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Annual Gift Budget</span>
                      <span className="font-semibold text-stone-800">
                        {formatCurrency(totalSpent)} / {formatCurrency(budget)} ({budgetPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          budgetPct > 100 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, budgetPct)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Planned Gifts List */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-2">
                    <span>Planned Gifts ({personGifts.length})</span>
                    <button
                      onClick={() => onAddGiftForPerson(person.id)}
                      className="text-stone-900 hover:underline flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Plus className="w-3 h-3" /> Add Gift
                    </button>
                  </div>

                  {personGifts.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No gifts planned yet for {person.name}.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {personGifts.slice(0, 3).map((gift) => (
                        <div
                          key={gift.id}
                          onClick={() => onSelectGift(gift.id)}
                          className="flex items-center justify-between p-2 rounded-lg bg-stone-50 hover:bg-stone-100 cursor-pointer text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {gift.type === 'handmade' ? (
                              <span className="px-1.5 py-0.2 rounded-xs bg-rose-100 text-rose-800 text-[10px] font-bold">
                                DIY
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-xs bg-amber-100 text-amber-800 text-[10px] font-bold">
                                BOUGHT
                              </span>
                            )}
                            <span className="font-medium text-stone-800 truncate">{gift.title}</span>
                          </div>
                          <span className="text-stone-500 font-mono shrink-0">
                            {formatCurrency(gift.actualPrice ?? gift.estimatedPrice)}
                          </span>
                        </div>
                      ))}
                      {personGifts.length > 3 && (
                        <span className="text-[11px] text-stone-500 font-medium block text-right">
                          +{personGifts.length - 3} more gifts
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    onNavigateToAI(person.name, person.relationship, person.interests.join(', '))
                  }
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI Brainstorm
                </button>

                <button
                  onClick={() => onAddGiftForPerson(person.id)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
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
