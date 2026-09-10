import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { GiftItem, GiftType, GiftStatus } from '../types';
import { formatCurrency, getStatusBadge } from '../utils/giftHelpers';
import {
  Gift,
  Sparkles,
  Tag,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckSquare,
  AlertCircle,
  Calendar,
  Layers,
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
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
        {/* Search & Main Type Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gifts, notes, recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Gifts ({gifts.length})
            </button>
            <button
              onClick={() => setTypeFilter('bought')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                typeFilter === 'bought'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5" /> Bought ({boughtCount})
            </button>
            <button
              onClick={() => setTypeFilter('handmade')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                typeFilter === 'handmade'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Handmade DIY ({handmadeCount})
            </button>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium">Recipient:</span>
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-700"
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
            <span className="text-stone-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white font-medium text-stone-700"
            >
              <option value="all">All Statuses</option>
              <option value="idea">Idea Stage</option>
              <option value="in_progress">Crafting In Progress</option>
              <option value="purchased">Purchased</option>
              <option value="completed">Craft Finished</option>
              <option value="wrapped">Wrapped & Ready</option>
              <option value="given">Delivered</option>
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => onOpenGiftModal()}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Gift Idea
            </button>
          </div>
        </div>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGifts.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
            <Gift className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-stone-800">No gifts found</p>
            <p className="text-xs text-stone-500 mt-1">
              Add your first gift idea or modify your search filters.
            </p>
            <button
              onClick={() => onOpenGiftModal()}
              className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Gift Idea
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
                className={`rounded-2xl bg-white border transition-all duration-200 ${
                  isHandmade ? 'border-rose-200/80' : 'border-stone-200'
                } hover:shadow-md overflow-hidden flex flex-col`}
              >
                {/* Card Header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isHandmade ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-rose-600" /> Handmade DIY
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-600" /> Bought Gift
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-stone-400">
                      <button
                        onClick={() => onOpenGiftModal(gift)}
                        title="Edit gift"
                        className="p-1.5 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${gift.title}"?`)) {
                            deleteGift(gift.id);
                          }
                        }}
                        title="Delete gift"
                        className="p-1.5 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Recipient */}
                  <h3 className="text-base font-bold text-stone-900 mt-2.5 leading-snug">
                    {gift.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1.5">
                    {recipient ? (
                      <span className="font-semibold text-stone-800 flex items-center gap-1">
                        For: <span className="underline decoration-stone-300">{recipient.name}</span>
                        <span className="text-stone-400 font-normal">({recipient.relationship})</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                        ✨ Unassigned Idea Pool
                      </span>
                    )}
                    <span>•</span>
                    <span className="capitalize">{gift.customOccasionName || gift.occasion}</span>
                    <span>•</span>
                    <span className="font-semibold text-stone-700">
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
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {gift.storeOrUrl.replace(/^https?:\/\//, '').split('/')[0]}
                      </a>
                    </div>
                  )}

                  {/* Notes snippet */}
                  {gift.notes && (
                    <p className="mt-2.5 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 italic">
                      "{gift.notes}"
                    </p>
                  )}

                  {/* HANDMADE TIME & PROGRESS SECTION */}
                  {isHandmade && (
                    <div className="mt-4 p-3.5 rounded-xl bg-rose-50/40 border border-rose-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-rose-600" />
                          Crafting Time:{' '}
                          <strong className="text-stone-900">
                            {spentHours} / {estHours} hrs
                          </strong>
                        </span>
                        <span className="font-mono text-stone-500 font-medium">
                          {hoursProgress}% Done ({hoursLeft}h left)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-300"
                          style={{ width: `${hoursProgress}%` }}
                        />
                      </div>

                      {/* Quick Log Craft Time buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] font-medium text-stone-500">Log time:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => logCraftTime(gift.id, 0.5)}
                            className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-rose-400 hover:text-rose-700 text-stone-700 text-[11px] font-semibold transition-colors shadow-2xs"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => logCraftTime(gift.id, 1)}
                            className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-rose-400 hover:text-rose-700 text-stone-700 text-[11px] font-semibold transition-colors shadow-2xs"
                          >
                            +1 hr
                          </button>
                          <button
                            onClick={() => logCraftTime(gift.id, 2)}
                            className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-rose-400 hover:text-rose-700 text-stone-700 text-[11px] font-semibold transition-colors shadow-2xs"
                          >
                            +2 hrs
                          </button>
                        </div>
                      </div>

                      {/* Supplies & Steps stats */}
                      <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-rose-100/80">
                        <span>
                          📦 Supplies: <strong>{purchasedSupplies}/{totalSupplies}</strong> ready
                        </span>
                        <span>
                          🔨 Steps: <strong>{completedSteps}/{totalSteps}</strong> completed
                        </span>
                        {gift.craftDifficulty && (
                          <span className="px-1.5 py-0.5 rounded-sm bg-white border border-stone-200 text-stone-700 font-medium">
                            {gift.craftDifficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Collapsible checklist for Supplies & Steps */}
                  {isHandmade && (totalSupplies > 0 || totalSteps > 0) && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedGiftId(isExpanded ? null : gift.id)}
                        className="w-full flex items-center justify-between py-1 px-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-stone-500" />
                          {isExpanded ? 'Hide' : 'Show'} Crafting Checklist & Steps
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
                          {totalSupplies > 0 && (
                            <div>
                              <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px] block mb-1.5">
                                Materials to Buy / Gather:
                              </span>
                              <div className="space-y-1">
                                {gift.craftSupplies?.map((sup) => (
                                  <label
                                    key={sup.id}
                                    className="flex items-center gap-2 cursor-pointer text-stone-800 hover:text-stone-950"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={sup.purchased}
                                      onChange={() => toggleSupplyPurchased(gift.id, sup.id)}
                                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                                    />
                                    <span className={sup.purchased ? 'line-through text-stone-400' : ''}>
                                      {sup.name} (${sup.estimatedCost.toFixed(2)})
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {totalSteps > 0 && (
                            <div className="pt-2 border-t border-stone-200">
                              <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px] block mb-1.5">
                                Step-by-Step Instructions:
                              </span>
                              <div className="space-y-1">
                                {gift.craftSteps?.map((st) => (
                                  <label
                                    key={st.id}
                                    className="flex items-center gap-2 cursor-pointer text-stone-800 hover:text-stone-950"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={st.done}
                                      onChange={() => toggleStepDone(gift.id, st.id)}
                                      className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                                    />
                                    <span className={st.done ? 'line-through text-stone-400' : ''}>
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
                <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-medium">Quick Status:</span>
                    <select
                      value={gift.status}
                      onChange={(e) => updateGift(gift.id, { status: e.target.value as GiftStatus })}
                      className="px-2 py-1 rounded-md border border-stone-200 bg-white text-stone-800 text-xs font-semibold"
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
                      <option value="wrapped">Wrapped & Ready 🎁</option>
                      <option value="given">Delivered 🎉</option>
                    </select>
                  </div>

                  {gift.status !== 'wrapped' && (
                    <button
                      onClick={() => updateGift(gift.id, { status: 'wrapped' })}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 font-medium transition-colors"
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
