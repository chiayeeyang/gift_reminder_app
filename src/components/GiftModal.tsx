import React, { useState, useEffect } from 'react';
import { GiftItem, GiftType, OccasionType, GiftStatus, Priority, CraftSupply, CraftStep } from '../types';
import { useGifts } from '../context/GiftContext';
import { X, Plus, Trash2, Sparkles, Clock, DollarSign, Tag } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto font-pixel">
      <div className="relative w-full max-w-2xl mc-panel border-4 border-black overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#3c3d44] bg-[#212026]">
          <div>
            <h2 className="text-sm font-bold text-white mc-text-shadow font-mc">
              {giftToEdit ? 'EDIT GIFT LOOT' : 'CRAFT / LOG NEW GIFT'} 🎁
            </h2>
            <p className="text-[11px] text-[#a3a4ab] mt-0.5 font-pixel">
              Track trade items, crafting materials, emerald budgets, and assembly time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="mc-button-red p-1 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Gift Type Switcher */}
          <div>
            <label className="block text-xs font-pixel text-[#a3a4ab] mb-1.5">
              Item Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('bought');
                  if (status === 'planning' || status === 'materials_ready') setStatus('idea');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-pixel border-2 transition-none ${
                  type === 'bought'
                    ? 'bg-[#d97706] text-black border-white font-bold'
                    : 'mc-button'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Villager Trade / Bought</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('handmade');
                  if (status === 'purchased' || status === 'shipped') setStatus('planning');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-pixel border-2 transition-none ${
                  type === 'handmade'
                    ? 'bg-[#2b7730] text-[#55ff55] border-white font-bold'
                    : 'mc-button'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#55ff55]" />
                <span>Handmade / DIY Recipe</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
              Item Name / Idea *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'handmade' ? 'e.g., Hand-carved Birch Spoon Set' : 'e.g., Noise Cancelling Headphones'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
            />
          </div>

          {/* Recipient & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                Recipient Player
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
              >
                <option value="unassigned">✨ General Chest (Unassigned)</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                Quest Occasion
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as OccasionType)}
                className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
              >
                <option value="birthday">🎂 Birthday / Level Up</option>
                <option value="christmas">🎄 Winter Holidays</option>
                <option value="anniversary">💍 Guild Anniversary</option>
                <option value="valentines">❤️ Heart Day</option>
                <option value="mothers_day">🌸 Mother&apos;s Day</option>
                <option value="fathers_day">👔 Father&apos;s Day</option>
                <option value="halloween">🎃 Spooky Fest</option>
                <option value="just_because">🌟 Surprise Drop</option>
                <option value="custom">✨ Custom Occasion</option>
              </select>
            </div>
          </div>

          {occasion === 'custom' && (
            <div>
              <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                Custom Occasion Name
              </label>
              <input
                type="text"
                placeholder="e.g., Housewarming, Graduation"
                value={customOccasionName}
                onChange={(e) => setCustomOccasionName(e.target.value)}
                className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
              />
            </div>
          )}

          {/* Status, Priority & Target Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                Progress Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GiftStatus)}
                className="w-full mc-input px-2.5 py-1.5 text-xs font-pixel"
              >
                <option value="idea">💡 Idea</option>
                {type === 'bought' ? (
                  <>
                    <option value="researching">🔍 Researching</option>
                    <option value="purchased">💳 Purchased</option>
                    <option value="shipped">📦 In Delivery</option>
                  </>
                ) : (
                  <>
                    <option value="planning">📋 Planning Recipe</option>
                    <option value="materials_ready">🧶 Supplies Ready</option>
                    <option value="in_progress">🔨 Crafting In Progress</option>
                    <option value="completed">✅ Craft Completed</option>
                  </>
                )}
                <option value="wrapped">🎁 Wrapped in Chest</option>
                <option value="given">🎉 Given to Player</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full mc-input px-2.5 py-1.5 text-xs font-pixel"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                Target Year
              </label>
              <input
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full mc-input px-2.5 py-1.5 text-xs font-pixel"
              />
            </div>
          </div>

          {/* Pricing & Budget section */}
          <div className="p-3.5 mc-panel-dark border border-black space-y-3">
            <h3 className="font-mc text-[9px] text-[#ffea75] flex items-center gap-1.5 mc-text-shadow">
              <DollarSign className="w-3.5 h-3.5 text-[#ffea75]" />
              {type === 'handmade' ? 'MATERIALS COST & EMERALD BUDGET' : 'PRICE & MERCHANT TRADE INFO'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                  Estimated Cost ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="0.00"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                  Actual Paid ($) {actualPrice !== '' ? '(Recorded)' : ''}
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Blank if unpaid"
                  value={actualPrice}
                  onChange={(e) => setActualPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>
            </div>

            {type === 'bought' && (
              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                  Merchant, Store, or Item URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. Local shop, Etsy, or web link..."
                  value={storeOrUrl}
                  onChange={(e) => setStoreOrUrl(e.target.value)}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>
            )}
          </div>

          {/* HANDMADE / CRAFTING SPECIFICS */}
          {type === 'handmade' && (
            <div className="p-3.5 mc-panel-dark border border-black space-y-3">
              <h3 className="font-mc text-[9px] text-[#55ff55] flex items-center gap-1.5 mc-text-shadow">
                <Clock className="w-3.5 h-3.5 text-[#55ff55]" />
                DIY CRAFTING TIME & RECIPE INGREDIENTS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                    Est. Craft Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 6.5"
                    value={craftingHoursEstimated}
                    onChange={(e) => setCraftingHoursEstimated(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="0"
                    value={craftingHoursSpent}
                    onChange={(e) => setCraftingHoursSpent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                    Recipe Difficulty
                  </label>
                  <select
                    value={craftDifficulty}
                    onChange={(e) => setCraftDifficulty(e.target.value as any)}
                    className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                  >
                    <option value="Easy">Easy (Beginner friendly)</option>
                    <option value="Medium">Medium (Takes patience)</option>
                    <option value="Advanced">Advanced (Master Crafter)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1 font-pixel">
                  Target Finish Deadline (Before Quest Tick)
                </label>
                <input
                  type="date"
                  value={craftDeadline}
                  onChange={(e) => setCraftDeadline(e.target.value)}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>

              {/* Supplies checklist */}
              <div className="pt-2 border-t border-[#3c3d44]">
                <label className="block font-mc text-[9px] text-[#80ff20] mb-2 mc-text-shadow">
                  INGREDIENTS & SUPPLIES ({supplies.length})
                </label>
                <div className="space-y-1.5 mb-2">
                  {supplies.map((sup) => (
                    <div
                      key={sup.id}
                      className="flex items-center justify-between p-2 mc-panel border border-black text-xs"
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
                          className="accent-[#2b7730]"
                        />
                        <span className={sup.purchased ? 'line-through text-[#808080]' : 'text-white'}>
                          {sup.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#ffea75]">${sup.estimatedCost.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupply(sup.id)}
                          className="mc-button-red p-1 text-xs"
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
                    placeholder="New ingredient (e.g. 2 Oak planks)"
                    value={newSupplyName}
                    onChange={(e) => setNewSupplyName(e.target.value)}
                    className="flex-1 mc-input px-2.5 py-1 text-xs font-pixel"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Cost $"
                    value={newSupplyCost}
                    onChange={(e) => setNewSupplyCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-20 mc-input px-2.5 py-1 text-xs font-pixel"
                  />
                  <button
                    type="button"
                    onClick={handleAddSupply}
                    className="mc-button-emerald px-3 py-1 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Crafting steps */}
              <div className="pt-2 border-t border-[#3c3d44]">
                <label className="block font-mc text-[9px] text-[#55ffff] mb-2 mc-text-shadow">
                  CRAFTING PHASES & TIMELINE ({steps.length})
                </label>
                <div className="space-y-1.5 mb-2">
                  {steps.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2 mc-panel border border-black text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={st.done}
                          onChange={() => {
                            setSteps(steps.map((s) => (s.id === st.id ? { ...s, done: !s.done } : s)));
                          }}
                          className="accent-[#2b7730]"
                        />
                        <span className={st.done ? 'line-through text-[#808080]' : 'text-white'}>
                          {st.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {st.hours && <span className="text-[#55ffff] font-pixel">~{st.hours}h</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(st.id)}
                          className="mc-button-red p-1 text-xs"
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
                    className="flex-1 mc-input px-2.5 py-1 text-xs font-pixel"
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Hours"
                    value={newStepHours}
                    onChange={(e) => setNewStepHours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 mc-input px-2.5 py-1 text-xs font-pixel"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="mc-button-emerald px-3 py-1 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
              Private Notes & Secret Lore
            </label>
            <textarea
              rows={2}
              placeholder="Sizes, favorite color choice, hints they dropped, wrapping ideas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3c3d44]">
            <button
              type="button"
              onClick={onClose}
              className="mc-button px-4 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mc-button-emerald px-5 py-1.5 text-xs"
            >
              {giftToEdit ? 'Save Loot Changes' : 'Store In Chest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
