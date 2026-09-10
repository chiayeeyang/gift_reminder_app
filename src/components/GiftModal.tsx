import React, { useState, useEffect } from 'react';
import { GiftItem, GiftType, OccasionType, GiftStatus, Priority, CraftSupply, CraftStep } from '../types';
import { useGifts } from '../context/GiftContext';
import { X, Plus, Trash2, Sparkles, Clock, DollarSign, Tag, CheckCircle2 } from 'lucide-react';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftToEdit?: GiftItem | null;
  initialRecipientId?: string;
  initialOccasion?: OccasionType;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  isOpen,
  onClose,
  giftToEdit,
  initialRecipientId,
  initialOccasion,
}) => {
  const { people, addGift, updateGift } = useGifts();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<GiftType>('bought');
  const [recipientId, setRecipientId] = useState('unassigned');
  const [occasion, setOccasion] = useState<OccasionType>('birthday');
  const [customOccasionName, setCustomOccasionName] = useState('');
  const [targetYear, setTargetYear] = useState(2026);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<GiftStatus>('idea');
  const [estimatedPrice, setEstimatedPrice] = useState<number | ''>('');
  const [actualPrice, setActualPrice] = useState<number | ''>('');
  const [storeOrUrl, setStoreOrUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Handmade specifics
  const [craftingHoursEstimated, setCraftingHoursEstimated] = useState<number | ''>('');
  const [craftingHoursSpent, setCraftingHoursSpent] = useState<number | ''>('');
  const [craftDifficulty, setCraftDifficulty] = useState<'Easy' | 'Medium' | 'Advanced'>('Medium');
  const [craftDeadline, setCraftDeadline] = useState('');
  const [supplies, setSupplies] = useState<CraftSupply[]>([]);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyCost, setNewSupplyCost] = useState<number | ''>('');

  const [steps, setSteps] = useState<CraftStep[]>([]);
  const [newStepText, setNewStepText] = useState('');
  const [newStepHours, setNewStepHours] = useState<number | ''>('');

  useEffect(() => {
    if (giftToEdit) {
      setTitle(giftToEdit.title);
      setType(giftToEdit.type);
      setRecipientId(giftToEdit.recipientId);
      setOccasion(giftToEdit.occasion);
      setCustomOccasionName(giftToEdit.customOccasionName || '');
      setTargetYear(giftToEdit.targetYear || 2026);
      setPriority(giftToEdit.priority || 'medium');
      setStatus(giftToEdit.status);
      setEstimatedPrice(giftToEdit.estimatedPrice || '');
      setActualPrice(giftToEdit.actualPrice ?? '');
      setStoreOrUrl(giftToEdit.storeOrUrl || '');
      setNotes(giftToEdit.notes || '');
      setCraftingHoursEstimated(giftToEdit.craftingHoursEstimated ?? '');
      setCraftingHoursSpent(giftToEdit.craftingHoursSpent ?? '');
      setCraftDifficulty(giftToEdit.craftDifficulty || 'Medium');
      setCraftDeadline(giftToEdit.craftDeadline || '');
      setSupplies(giftToEdit.craftSupplies ? [...giftToEdit.craftSupplies] : []);
      setSteps(giftToEdit.craftSteps ? [...giftToEdit.craftSteps] : []);
    } else {
      setTitle('');
      setType('bought');
      setRecipientId(initialRecipientId || (people.length > 0 ? people[0].id : 'unassigned'));
      setOccasion(initialOccasion || 'birthday');
      setCustomOccasionName('');
      setTargetYear(2026);
      setPriority('medium');
      setStatus('idea');
      setEstimatedPrice('');
      setActualPrice('');
      setStoreOrUrl('');
      setNotes('');
      setCraftingHoursEstimated('');
      setCraftingHoursSpent('');
      setCraftDifficulty('Medium');
      setCraftDeadline('');
      setSupplies([]);
      setSteps([]);
    }
  }, [giftToEdit, isOpen, initialRecipientId, initialOccasion, people]);

  if (!isOpen) return null;

  const handleAddSupply = () => {
    if (!newSupplyName.trim()) return;
    const supply: CraftSupply = {
      id: `sup-${Date.now()}`,
      name: newSupplyName.trim(),
      estimatedCost: Number(newSupplyCost) || 0,
      purchased: false,
    };
    setSupplies([...supplies, supply]);
    setNewSupplyName('');
    setNewSupplyCost('');
  };

  const handleRemoveSupply = (id: string) => {
    setSupplies(supplies.filter((s) => s.id !== id));
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    const step: CraftStep = {
      id: `st-${Date.now()}`,
      text: newStepText.trim(),
      done: false,
      hours: Number(newStepHours) || undefined,
    };
    setSteps([...steps, step]);
    setNewStepText('');
    setNewStepHours('');
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      type,
      recipientId,
      occasion,
      customOccasionName: occasion === 'custom' ? customOccasionName.trim() : undefined,
      targetYear: Number(targetYear) || 2026,
      priority,
      status,
      estimatedPrice: Number(estimatedPrice) || 0,
      actualPrice: actualPrice !== '' ? Number(actualPrice) : undefined,
      storeOrUrl: storeOrUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      craftingHoursEstimated: type === 'handmade' ? Number(craftingHoursEstimated) || 0 : undefined,
      craftingHoursSpent: type === 'handmade' ? Number(craftingHoursSpent) || 0 : undefined,
      craftDifficulty: type === 'handmade' ? craftDifficulty : undefined,
      craftDeadline: type === 'handmade' && craftDeadline ? craftDeadline : undefined,
      craftSupplies: type === 'handmade' ? supplies : undefined,
      craftSteps: type === 'handmade' ? steps : undefined,
    };

    if (giftToEdit) {
      updateGift(giftToEdit.id, payload);
    } else {
      addGift(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fffefb] rounded-2xl shadow-[6px_6px_0px_#292524] border-2 border-stone-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-stone-800 bg-[#fffefb]">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-sketch text-2xl">
              {giftToEdit ? 'Edit Gift Idea' : 'Add New Gift Idea'} 🎁
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-sketch text-sm">
              Keep track of purchased items, handmade crafts, budgets, and crafting time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-700 hover:text-stone-950 bg-[#fffefb] border-2 border-stone-800 rounded-xl shadow-[1.5px_1.5px_0px_#292524] hover:bg-stone-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Gift Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sketch text-sm">
              Gift Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('bought');
                  if (status === 'planning' || status === 'materials_ready') setStatus('idea');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-stone-800 text-sm font-bold transition-all ${
                  type === 'bought'
                    ? 'bg-[#fef3c7] text-stone-900 shadow-[2px_2px_0px_#292524]'
                    : 'bg-[#fffefb] text-stone-600 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
                }`}
              >
                <Tag className="w-4 h-4 text-amber-700" />
                <span>Bought / Retail Gift</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('handmade');
                  if (status === 'purchased' || status === 'shipped') setStatus('planning');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-stone-800 text-sm font-bold transition-all ${
                  type === 'handmade'
                    ? 'bg-[#ffe4e6] text-stone-900 shadow-[2px_2px_0px_#292524]'
                    : 'bg-[#fffefb] text-stone-600 hover:bg-stone-100 shadow-[1px_1px_0px_#292524]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Handmade / DIY Craft</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Gift Name / Idea *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'handmade' ? 'e.g., Hand-carved Wooden Spoon Set' : 'e.g., Sony Noise Cancelling Headphones'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          {/* Recipient & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Recipient
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="unassigned">✨ General Idea Pool (Not Assigned)</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as OccasionType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="birthday">🎂 Birthday</option>
                <option value="christmas">🎄 Christmas / Winter Holidays</option>
                <option value="anniversary">💍 Anniversary</option>
                <option value="valentines">❤️ Valentine's Day</option>
                <option value="mothers_day">🌸 Mother's Day</option>
                <option value="fathers_day">👔 Father's Day</option>
                <option value="halloween">🎃 Halloween</option>
                <option value="just_because">🌟 Just Because / Surprise</option>
                <option value="custom">✨ Custom Occasion</option>
              </select>
            </div>
          </div>

          {occasion === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Custom Occasion Name
              </label>
              <input
                type="text"
                placeholder="e.g., Graduation, Housewarming, Baby Shower"
                value={customOccasionName}
                onChange={(e) => setCustomOccasionName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          )}

          {/* Status, Priority & Target Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GiftStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="idea">💡 Idea</option>
                {type === 'bought' ? (
                  <>
                    <option value="researching">🔍 Researching</option>
                    <option value="purchased">💳 Purchased</option>
                    <option value="shipped">📦 Shipped</option>
                  </>
                ) : (
                  <>
                    <option value="planning">📋 Planning DIY</option>
                    <option value="materials_ready">🧶 Supplies Ready</option>
                    <option value="in_progress">🔨 In Progress (Crafting)</option>
                    <option value="completed">✅ Craft Completed</option>
                  </>
                )}
                <option value="wrapped">🎁 Wrapped & Ready</option>
                <option value="given">🎉 Given / Delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Target Year
              </label>
              <input
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Pricing & Budget section */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-stone-600" />
              {type === 'handmade' ? 'Crafting Materials & Budget' : 'Cost & Purchase Info'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0.00"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Actual Paid Cost ($) {actualPrice !== '' ? '(Recorded)' : ''}
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Leave blank if not paid yet"
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                />
              </div>
            </div>

            {type === 'bought' && (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Store, Brand, or URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amazon, Etsy, local boutique, or https://..."
                  value={storeOrUrl}
                  onChange={(e) => setStoreOrUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                />
              </div>
            )}
          </div>

          {/* HANDMADE / CRAFTING SPECIFICS */}
          {type === 'handmade' && (
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-4">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                DIY Crafting Time & Materials Planner
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Est. Crafting Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 6.5"
                    value={craftingHoursEstimated}
                    onChange={(e) => setCraftingHoursEstimated(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Hours Spent So Far
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={craftingHoursSpent}
                    onChange={(e) => setCraftingHoursSpent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={craftDifficulty}
                    onChange={(e) => setCraftDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                  >
                    <option value="Easy">Easy (Beginner friendly)</option>
                    <option value="Medium">Medium (Takes attention)</option>
                    <option value="Advanced">Advanced (Multi-day/complex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Target Finish Deadline (Leave buffer before event!)
                </label>
                <input
                  type="date"
                  value={craftDeadline}
                  onChange={(e) => setCraftDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-900 text-sm"
                />
              </div>

              {/* Supplies checklist */}
              <div className="pt-2 border-t border-rose-200/60">
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Materials & Supplies Needed ({supplies.length})
                </label>
                <div className="space-y-2 mb-3">
                  {supplies.map((sup) => (
                    <div
                      key={sup.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={sup.purchased}
                          onChange={() => {
                            setSupplies(
                              supplies.map((s) => (s.id === sup.id ? { ...s, purchased: !s.purchased } : s))
                            );
                          }}
                          className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className={sup.purchased ? 'line-through text-stone-400' : 'text-stone-800 font-medium'}>
                          {sup.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500">${sup.estimatedCost.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupply(sup.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New material (e.g. 2 skeins wool)"
                    value={newSupplyName}
                    onChange={(e) => setNewSupplyName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Cost $"
                    value={newSupplyCost}
                    onChange={(e) => setNewSupplyCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-20 px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSupply}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Crafting steps */}
              <div className="pt-2 border-t border-rose-200/60">
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Crafting Steps / Timeline ({steps.length})
                </label>
                <div className="space-y-2 mb-3">
                  {steps.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={st.done}
                          onChange={() => {
                            setSteps(steps.map((s) => (s.id === st.id ? { ...s, done: !s.done } : s)));
                          }}
                          className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className={st.done ? 'line-through text-stone-400' : 'text-stone-800'}>
                          {st.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {st.hours && <span className="text-stone-400 font-mono">~{st.hours}h</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(st.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New step (e.g. Cut pattern, carve shape)"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Hours"
                    value={newStepHours}
                    onChange={(e) => setNewStepHours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Private Notes & Secret Hints
            </label>
            <textarea
              rows={2}
              placeholder="Sizes, favorite color choice, hints they dropped, wrapping ideas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 bg-[#fffefb] text-stone-900 text-sm shadow-[1.5px_1.5px_0px_#292524] focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-stone-800 text-stone-800 bg-[#fffefb] hover:bg-stone-100 text-xs font-bold shadow-[1.5px_1.5px_0px_#292524] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-[#fffefb] text-xs font-bold border-2 border-stone-900 shadow-[2px_2px_0px_#292524] transition-all"
            >
              {giftToEdit ? 'Save Changes' : 'Add Gift Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
