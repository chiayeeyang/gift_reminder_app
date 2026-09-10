import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { GiftItem, GiftStatus } from '../types';
import { formatCurrency, getStatusBadge } from '../utils/giftHelpers';
import {
  Gift,
  Sparkles,
  Tag,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GiftsTabProps {
  onOpenGiftModal: (gift?: GiftItem) => void;
  selectedGiftId?: string | null;
}

export const GiftsTab: React.FC<GiftsTabProps> = ({ onOpenGiftModal, selectedGiftId }) => {
  const {
    gifts,
    people,
    deleteGift,
    updateGift,
    logCraftTime,
    toggleSupplyPurchased,
    toggleStepDone,
  } = useGifts();

  const [typeFilter, setTypeFilter] = useState<'all' | 'bought' | 'handmade'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGiftId, setExpandedGiftId] = useState<string | null>(selectedGiftId || null);

  const filteredGifts = gifts.filter((gift) => {
    if (gift.archived) return false;
    if (typeFilter !== 'all' && gift.type !== typeFilter) return false;
    if (statusFilter !== 'all' && gift.status !== statusFilter) return false;
    if (recipientFilter !== 'all') {
      if (recipientFilter === 'unassigned' && gift.recipientId !== 'unassigned') return false;
      if (recipientFilter !== 'unassigned' && gift.recipientId !== recipientFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const personName = people.find((p) => p.id === gift.recipientId)?.name.toLowerCase() || '';
      const matchTitle = gift.title.toLowerCase().includes(q);
      const matchNotes = gift.notes ? gift.notes.toLowerCase().includes(q) : false;
      const matchPerson = personName.includes(q);
      if (!matchTitle && !matchNotes && !matchPerson) return false;
    }
    return true;
  });

  const boughtCount = gifts.filter((g) => !g.archived && g.type === 'bought').length;
  const handmadeCount = gifts.filter((g) => !g.archived && g.type === 'handmade').length;

  return (
    <div className="space-y-6 font-pixel">
      {/* Top Filter Bar: Minecraft GUI Panel */}
      <div className="p-4 mc-panel border-2 border-black space-y-4">
        {/* Search & Main Type Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chest items, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 mc-input text-xs placeholder-[#777777]"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-pixel border-2 transition-none ${
                typeFilter === 'all'
                  ? 'bg-[#404149] text-[#ffffff] border-white'
                  : 'mc-button'
              }`}
            >
              All Loot ({gifts.length})
            </button>
            <button
              onClick={() => setTypeFilter('bought')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-pixel border-2 transition-none flex items-center justify-center gap-1.5 ${
                typeFilter === 'bought'
                  ? 'bg-[#d97706] text-black border-white'
                  : 'mc-button'
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> Villager Trade ({boughtCount})
            </button>
            <button
              onClick={() => setTypeFilter('handmade')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-pixel border-2 transition-none flex items-center justify-center gap-1.5 ${
                typeFilter === 'handmade'
                  ? 'bg-[#2b7730] text-[#55ff55] border-white'
                  : 'mc-button'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Crafted DIY ({handmadeCount})
            </button>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#3c3d44] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#a3a4ab] font-pixel">Player Target:</span>
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="mc-input px-2.5 py-1 text-xs font-pixel"
            >
              <option value="all">Everyone</option>
              <option value="unassigned">✨ General Idea Pool</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#a3a4ab] font-pixel">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mc-input px-2.5 py-1 text-xs font-pixel"
            >
              <option value="all">All Statuses</option>
              <option value="idea">Idea Stage</option>
              <option value="in_progress">Crafting In Progress</option>
              <option value="purchased">Purchased / Traded</option>
              <option value="completed">Craft Finished</option>
              <option value="wrapped">Wrapped & In Chest</option>
              <option value="given">Delivered to Player</option>
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => onOpenGiftModal()}
              className="mc-button-emerald px-3 py-1.5 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Craft Gift Item
            </button>
          </div>
        </div>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGifts.length === 0 ? (
          <div className="col-span-full p-12 text-center mc-panel-dark border-2 border-black">
            <Gift className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <p className="text-base font-bold text-white mc-text-shadow font-mc">CHEST IS EMPTY</p>
            <p className="text-xs text-[#a3a4ab] mt-1 font-pixel">
              Add your first gift item or modify your search filters.
            </p>
            <button
              onClick={() => onOpenGiftModal()}
              className="mt-4 mc-button-emerald px-4 py-2 text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Craft Gift Item
            </button>
          </div>
        ) : (
          filteredGifts.map((gift) => {
            const recipient = people.find((p) => p.id === gift.recipientId);
            const badge = getStatusBadge(gift.status);
            const isHandmade = gift.type === 'handmade';
            const isExpanded = expandedGiftId === gift.id;

            const spentHours = gift.craftingHoursSpent || 0;
            const estHours = gift.craftingHoursEstimated || 0;
            const hoursLeft = Math.max(0, estHours - spentHours);
            const hoursProgress = estHours > 0 ? Math.min(100, Math.round((spentHours / estHours) * 100)) : 0;

            const totalSupplies = gift.craftSupplies?.length || 0;
            const purchasedSupplies = gift.craftSupplies?.filter((s) => s.purchased).length || 0;

            const totalSteps = gift.craftSteps?.length || 0;
            const completedSteps = gift.craftSteps?.filter((s) => s.done).length || 0;

            return (
              <div
                key={gift.id}
                className="mc-panel border-2 border-black overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isHandmade ? (
                        <span className="px-2 py-0.5 border border-black text-xs font-pixel bg-[#2b7730] text-[#55ff55] flex items-center gap-1 mc-text-shadow">
                          <Sparkles className="w-3 h-3 text-[#55ff55]" /> CRAFTED DIY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 border border-black text-xs font-pixel bg-[#d97706] text-black flex items-center gap-1 font-bold">
                          <Tag className="w-3 h-3 text-black" /> TRADE LOOT
                        </span>
                      )}

                      <span className="px-2 py-0.5 border border-black text-xs font-pixel bg-[#26252b] text-[#ffffff]">
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#888888]">
                      <button
                        onClick={() => onOpenGiftModal(gift)}
                        title="Edit gift"
                        className="mc-button p-1 text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${gift.title}" from inventory?`)) {
                            deleteGift(gift.id);
                          }
                        }}
                        title="Delete gift"
                        className="mc-button-red p-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Recipient */}
                  <h3 className="text-sm font-bold text-white mc-text-shadow mt-2.5 font-pixel leading-snug">
                    {gift.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#a3a4ab] mt-1.5 font-pixel">
                    {recipient ? (
                      <span className="text-[#ffffff] flex items-center gap-1">
                        For: <strong className="text-[#55ffff]">{recipient.name}</strong>
                        <span className="text-[#888888]">({recipient.relationship})</span>
                      </span>
                    ) : (
                      <span className="text-[#ffea75] bg-[#38280f] px-1.5 py-0.2 border border-black">
                        ✨ Unassigned Loot
                      </span>
                    )}
                    <span>■</span>
                    <span className="capitalize">{gift.customOccasionName || gift.occasion}</span>
                    <span>■</span>
                    <span className="text-[#55ff55] font-bold">
                      {formatCurrency(gift.actualPrice ?? gift.estimatedPrice)}
                    </span>
                  </div>

                  {/* Store Link if bought */}
                  {!isHandmade && gift.storeOrUrl && (
                    <div className="mt-2 text-xs">
                      <a
                        href={gift.storeOrUrl.startsWith('http') ? gift.storeOrUrl : `https://${gift.storeOrUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#55ffff] hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {gift.storeOrUrl.replace(/^https?:\/\//, '').split('/')[0]}
                      </a>
                    </div>
                  )}

                  {/* Notes snippet */}
                  {gift.notes && (
                    <p className="mt-2.5 text-xs text-[#d1d5db] mc-panel-dark p-2 border border-black italic">
                      &quot;{gift.notes}&quot;
                    </p>
                  )}

                  {/* HANDMADE TIME & XP PROGRESS BAR */}
                  {isHandmade && (
                    <div className="mt-3 p-3 mc-panel-dark border border-black space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#55ff55]" />
                          Crafting XP:{' '}
                          <strong className="text-[#55ff55]">
                            {spentHours} / {estHours} hrs
                          </strong>
                        </span>
                        <span className="text-[#ffea75] font-pixel">
                          {hoursProgress}% Done ({hoursLeft}h left)
                        </span>
                      </div>

                      {/* Minecraft XP Bar */}
                      <div className="w-full h-3 bg-[#0a0a0c] border border-black p-0.5">
                        <div
                          className="h-full bg-[#55ff55] shadow-[inset_0_1px_0_#ffffff,inset_0_-1px_0_#2b7730]"
                          style={{ width: `${hoursProgress}%` }}
                        />
                      </div>

                      {/* Quick Log Craft Time buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-[#a3a4ab]">Log Crafting:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => logCraftTime(gift.id, 0.5)}
                            className="mc-button px-2 py-0.5 text-[11px]"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => logCraftTime(gift.id, 1)}
                            className="mc-button px-2 py-0.5 text-[11px]"
                          >
                            +1 hr
                          </button>
                          <button
                            onClick={() => logCraftTime(gift.id, 2)}
                            className="mc-button px-2 py-0.5 text-[11px]"
                          >
                            +2 hrs
                          </button>
                        </div>
                      </div>

                      {/* Supplies & Steps stats */}
                      <div className="flex items-center justify-between text-[11px] text-[#a3a4ab] pt-1 border-t border-[#3c3d44]">
                        <span>
                          📦 Supplies: <strong className="text-white">{purchasedSupplies}/{totalSupplies}</strong>
                        </span>
                        <span>
                          🔨 Steps: <strong className="text-white">{completedSteps}/{totalSteps}</strong>
                        </span>
                        {gift.craftDifficulty && (
                          <span className="px-1.5 py-0.2 bg-[#212026] border border-black text-[#ffea75]">
                            {gift.craftDifficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Collapsible checklist for Supplies & Steps */}
                  {isHandmade && (totalSupplies > 0 || totalSteps > 0) && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => setExpandedGiftId(isExpanded ? null : gift.id)}
                        className="w-full flex items-center justify-between py-1 px-2 mc-button text-xs"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-[#55ffff]" />
                          {isExpanded ? 'Hide' : 'Show'} Recipe Ingredients & Steps
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 mc-panel-dark border border-black space-y-3 text-xs">
                          {totalSupplies > 0 && (
                            <div>
                              <span className="font-mc text-[9px] text-[#ffea75] block mb-1">
                                MATERIALS TO CRAFT / BUY:
                              </span>
                              <div className="space-y-1">
                                {gift.craftSupplies?.map((sup) => (
                                  <label
                                    key={sup.id}
                                    className="flex items-center gap-2 cursor-pointer text-white hover:text-[#55ffff]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={sup.purchased}
                                      onChange={() => toggleSupplyPurchased(gift.id, sup.id)}
                                      className="accent-[#2b7730]"
                                    />
                                    <span className={sup.purchased ? 'line-through text-[#666666]' : ''}>
                                      {sup.name} (${sup.estimatedCost.toFixed(2)})
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {totalSteps > 0 && (
                            <div className="pt-2 border-t border-[#3c3d44]">
                              <span className="font-mc text-[9px] text-[#80ff20] block mb-1">
                                STEP-BY-STEP RECIPE:
                              </span>
                              <div className="space-y-1">
                                {gift.craftSteps?.map((st) => (
                                  <label
                                    key={st.id}
                                    className="flex items-center gap-2 cursor-pointer text-white hover:text-[#55ffff]"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={st.done}
                                      onChange={() => toggleStepDone(gift.id, st.id)}
                                      className="accent-[#2b7730]"
                                    />
                                    <span className={st.done ? 'line-through text-[#666666]' : ''}>
                                      {st.text} {st.hours ? `(~${st.hours}h)` : ''}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-4 py-2.5 border-t border-[#3c3d44] bg-[#212026] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#a3a4ab]">Status:</span>
                    <select
                      value={gift.status}
                      onChange={(e) => updateGift(gift.id, { status: e.target.value as GiftStatus })}
                      className="mc-input px-2 py-0.5 text-xs font-pixel"
                    >
                      <option value="idea">Idea</option>
                      {gift.type === 'bought' ? (
                        <>
                          <option value="researching">Researching</option>
                          <option value="purchased">Purchased</option>
                          <option value="shipped">Shipped</option>
                        </>
                      ) : (
                        <>
                          <option value="planning">Planning DIY</option>
                          <option value="materials_ready">Supplies Ready</option>
                          <option value="in_progress">Crafting (In Progress)</option>
                          <option value="completed">Completed Craft</option>
                        </>
                      )}
                      <option value="wrapped">Wrapped & In Chest 🎁</option>
                      <option value="given">Delivered 🎉</option>
                    </select>
                  </div>

                  {gift.status !== 'wrapped' && (
                    <button
                      onClick={() => updateGift(gift.id, { status: 'wrapped' })}
                      className="mc-button-emerald px-2.5 py-1 text-xs"
                    >
                      🎁 Mark Wrapped
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
