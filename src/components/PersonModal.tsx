import React, { useState, useEffect } from 'react';
import { Person, Relationship, CuteFaceConfig } from '../types';
import { useGifts } from '../context/GiftContext';
import { CuteFace, getDerivedCuteFace } from './CuteFace';
import { X, Trash2, Smile } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
}

const AVATAR_COLORS = [
  '#fbcfe8', // pink wool
  '#fecdd3', // blossom
  '#ddd6fe', // purple wool
  '#bae6fd', // light blue wool
  '#bbf7d0', // lime wool
  '#fef08a', // yellow wool
  '#fed7aa', // orange wool
  '#e7e5e4', // light gray wool
];

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  personToEdit,
}) => {
  const { addPerson, updatePerson } = useGifts();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('friend');
  const [birthMonth, setBirthMonth] = useState<number>(9);
  const [birthDay, setBirthDay] = useState<number>(15);
  const [birthYear, setBirthYear] = useState<number | ''>('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [annualBudget, setAnnualBudget] = useState<number | ''>('');
  const [interestsStr, setInterestsStr] = useState('');

  // Cute face appearance mimic states
  const [expression, setExpression] = useState<CuteFaceConfig['expression']>('happy');
  const [hairStyle, setHairStyle] = useState<CuteFaceConfig['hairStyle']>('short');
  const [hairColor, setHairColor] = useState('#451a03');
  const [glasses, setGlasses] = useState(false);
  const [freckles, setFreckles] = useState(false);
  const [blush, setBlush] = useState(true);
  const [accessory, setAccessory] = useState<CuteFaceConfig['accessory']>('none');

  const [clothingSize, setClothingSize] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [ringSize, setRingSize] = useState('');
  const [sizeNotes, setSizeNotes] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [allergies, setAllergies] = useState('');
  const [favoriteColors, setFavoriteColors] = useState('');
  const [notes, setNotes] = useState('');

  // Custom events
  const [customEvents, setCustomEvents] = useState<Array<{ id: string; name: string; month: number; day: number; year?: number }>>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomMonth, setNewCustomMonth] = useState<number>(1);
  const [newCustomDay, setNewCustomDay] = useState<number>(1);

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setRelationship(personToEdit.relationship);
      setBirthMonth(personToEdit.birthMonth);
      setBirthDay(personToEdit.birthDay);
      setBirthYear(personToEdit.birthYear ?? '');
      setAvatarColor(personToEdit.avatarColor || AVATAR_COLORS[0]);
      setAnnualBudget(personToEdit.annualBudget ?? '');
      setInterestsStr(personToEdit.interests ? personToEdit.interests.join(', ') : '');

      if (personToEdit.cuteFace) {
        setExpression(personToEdit.cuteFace.expression || 'happy');
        setHairStyle(personToEdit.cuteFace.hairStyle || 'short');
        setHairColor(personToEdit.cuteFace.hairColor || '#451a03');
        setGlasses(Boolean(personToEdit.cuteFace.glasses));
        setFreckles(Boolean(personToEdit.cuteFace.freckles));
        setBlush(personToEdit.cuteFace.blush !== false);
        setAccessory(personToEdit.cuteFace.accessory || 'none');
      } else {
        const derived = getDerivedCuteFace(personToEdit.name);
        setExpression(derived.expression || 'happy');
        setHairStyle(derived.hairStyle || 'short');
        setHairColor(derived.hairColor || '#451a03');
        setGlasses(Boolean(derived.glasses));
        setFreckles(Boolean(derived.freckles));
        setBlush(true);
        setAccessory(derived.accessory || 'none');
      }

      setClothingSize(personToEdit.sizes?.clothing || '');
      setShoeSize(personToEdit.sizes?.shoe || '');
      setRingSize(personToEdit.sizes?.ring || '');
      setSizeNotes(personToEdit.sizes?.notes || '');
      setLikes(personToEdit.preferences?.likes || '');
      setDislikes(personToEdit.preferences?.dislikes || '');
      setAllergies(personToEdit.preferences?.allergies || '');
      setFavoriteColors(personToEdit.preferences?.favoriteColors || '');
      setNotes(personToEdit.notes || '');
      setCustomEvents(personToEdit.customEvents ? [...personToEdit.customEvents] : []);
    } else {
      setName('');
      setRelationship('friend');
      setBirthMonth(new Date().getMonth() + 1);
      setBirthDay(new Date().getDate());
      setBirthYear('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setAnnualBudget('');
      setInterestsStr('');
      setExpression('happy');
      setHairStyle('short');
      setHairColor('#451a03');
      setGlasses(false);
      setFreckles(false);
      setBlush(true);
      setAccessory('none');
      setClothingSize('');
      setShoeSize('');
      setRingSize('');
      setSizeNotes('');
      setLikes('');
      setDislikes('');
      setAllergies('');
      setFavoriteColors('');
      setNotes('');
      setCustomEvents([]);
    }
  }, [personToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddCustomEvent = () => {
    if (!newCustomName.trim()) return;
    setCustomEvents([
      ...customEvents,
      {
        id: `custom-ev-${Date.now()}`,
        name: newCustomName.trim(),
        month: Number(newCustomMonth),
        day: Number(newCustomDay),
      },
    ]);
    setNewCustomName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const interests = interestsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      relationship,
      birthMonth: Number(birthMonth),
      birthDay: Number(birthDay),
      birthYear: birthYear !== '' ? Number(birthYear) : undefined,
      avatarColor,
      cuteFace: {
        expression,
        hairStyle,
        hairColor,
        glasses,
        freckles,
        blush,
        accessory,
      },
      annualBudget: annualBudget !== '' ? Number(annualBudget) : undefined,
      interests,
      sizes: {
        clothing: clothingSize.trim() || undefined,
        shoe: shoeSize.trim() || undefined,
        ring: ringSize.trim() || undefined,
        notes: sizeNotes.trim() || undefined,
      },
      preferences: {
        likes: likes.trim() || undefined,
        dislikes: dislikes.trim() || undefined,
        allergies: allergies.trim() || undefined,
        favoriteColors: favoriteColors.trim() || undefined,
      },
      customEvents: customEvents.length > 0 ? customEvents : undefined,
      notes: notes.trim() || undefined,
    };

    if (personToEdit) {
      updatePerson(personToEdit.id, payload);
    } else {
      addPerson(payload);
    }
    onClose();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto font-pixel">
      <div className="relative w-full max-w-2xl mc-panel border-4 border-black overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#3c3d44] bg-[#212026]">
          <div>
            <h2 className="text-sm font-bold text-white mc-text-shadow font-mc">
              {personToEdit ? `EDIT PLAYER: ${personToEdit.name.toUpperCase()}` : 'ADD NEW PLAYER'}
            </h2>
            <p className="text-[11px] text-[#a3a4ab] mt-0.5 font-pixel">
              Configure player birthday, armor sizing, interests, and emerald budget.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Name & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                Player Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Alex, Steve, Mom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
              />
            </div>

            <div>
              <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                Player Group / Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship)}
                className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
              >
                <option value="partner">❤️ Partner / Spouse</option>
                <option value="family">🏡 Family</option>
                <option value="friend">✨ Friend</option>
                <option value="colleague">💼 Guild Companion</option>
                <option value="other">🌟 Other</option>
              </select>
            </div>
          </div>

          {/* Birthday and Year */}
          <div className="p-3.5 mc-panel-dark border border-black space-y-2.5">
            <h3 className="font-mc text-[9px] text-[#ffea75] mc-text-shadow">
              🎂 BIRTHDAY EVENT TICK (FOR REMINDERS & LEVEL MILESTONES)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1">Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1">Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={birthDay}
                  onChange={(e) => setBirthDay(Number(e.target.value))}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1">Birth Year (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1996"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>
            </div>
          </div>

          {/* Minecraft Pixel Player Head Customizer with Live Preview */}
          <div className="p-3.5 mc-panel-dark border border-black space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mc text-[9px] text-[#55ffff] flex items-center gap-1.5 mc-text-shadow">
                  <Smile className="w-3.5 h-3.5 text-[#55ffff]" />
                  MINECRAFT PLAYER SKIN HEAD
                </h3>
                <p className="text-[11px] text-[#a3a4ab] font-pixel">
                  Pixel-art character avatar preview:
                </p>
              </div>

              {/* Live Preview in Item Slot */}
              <div className="w-14 h-14 mc-slot relative flex items-center justify-center shrink-0">
                <CuteFace
                  name={name || 'Player'}
                  config={{
                    expression,
                    glasses,
                    freckles,
                    blush,
                  }}
                  size={46}
                  isHovered={true}
                />
              </div>
            </div>

            {/* Expression selector */}
            <div>
              <label className="block text-[10px] text-[#a3a4ab] mb-1 font-pixel">
                Facial Expression:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'happy', label: 'Happy 😊' },
                  { id: 'wink', label: 'Wink 😉' },
                  { id: 'sparkle', label: 'Sparkle ✨' },
                  { id: 'warm', label: 'Warm 😌' },
                  { id: 'cool', label: 'Cool 😎' },
                  { id: 'gentle', label: 'Gentle 😇' },
                  { id: 'grin', label: 'Grin 😆' },
                  { id: 'cheeky', label: 'Cheeky 😜' },
                ].map((expr) => (
                  <button
                    key={expr.id}
                    type="button"
                    onClick={() => setExpression(expr.id as any)}
                    className={`px-2 py-1 text-xs border transition-none font-pixel ${
                      expression === expr.id
                        ? 'bg-[#404149] text-white border-white'
                        : 'mc-button'
                    }`}
                  >
                    {expr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={glasses}
                  onChange={(e) => setGlasses(e.target.checked)}
                  className="accent-[#2b7730]"
                />
                <span className="font-pixel">Glasses 👓</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={freckles}
                  onChange={(e) => setFreckles(e.target.checked)}
                  className="accent-[#2b7730]"
                />
                <span className="font-pixel">Freckles ✨</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-white">
                <input
                  type="checkbox"
                  checked={blush}
                  onChange={(e) => setBlush(e.target.checked)}
                  className="accent-[#2b7730]"
                />
                <span className="font-pixel">Cheek Blush 🌸</span>
              </label>
            </div>
          </div>

          {/* Color & Annual Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                Player Wool Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 border-2 border-black ${
                      avatarColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                Annual Emerald Budget Target ($)
              </label>
              <input
                type="number"
                placeholder="e.g., 200"
                value={annualBudget}
                onChange={(e) => setAnnualBudget(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
              />
            </div>
          </div>

          {/* Hobbies / Interests */}
          <div>
            <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
              Hobbies & Interests (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., Coffee brewing, Watercolor, Hiking, Baking, Sci-Fi"
              value={interestsStr}
              onChange={(e) => setInterestsStr(e.target.value)}
              className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
            />
          </div>

          {/* Sizing Section */}
          <div className="p-3.5 mc-panel-dark border border-black space-y-2.5">
            <h3 className="font-mc text-[9px] text-[#ffea75] mc-text-shadow">
              👕 ARMOR & SIZING GUIDE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1">Chestplate / Clothing</label>
                <input
                  type="text"
                  placeholder="e.g., M / 38 / 6"
                  value={clothingSize}
                  onChange={(e) => setClothingSize(e.target.value)}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1">Boots / Shoe Size</label>
                <input
                  type="text"
                  placeholder="e.g., 9.5 US / 42 EU"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>

              <div>
                <label className="block text-xs text-[#a3a4ab] mb-1">Ring / Wrist / Hat</label>
                <input
                  type="text"
                  placeholder="e.g., Ring 7, 7 inch wrist"
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                  className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#a3a4ab] mb-1">Fit Preferences / Style Notes</label>
              <input
                type="text"
                placeholder="e.g., Oversized fits, natural cotton/linen, avoids synthetic"
                value={sizeNotes}
                onChange={(e) => setSizeNotes(e.target.value)}
                className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
              />
            </div>
          </div>

          {/* Preferences & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-pixel text-[#55ff55] mb-1">
                Loves / Favorite Items
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Lavender tea, dark chocolate, cozy wool blankets"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
              />
            </div>

            <div>
              <label className="block text-xs font-pixel text-[#ff5555] mb-1">
                Dislikes / Allergies / Avoid
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Allergic to wool, dislikes knick-knacks or loud perfumes"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
              />
            </div>
          </div>

          {/* Custom Events */}
          <div className="p-3.5 mc-panel-dark border border-black space-y-2.5">
            <h3 className="font-mc text-[9px] text-[#80ff20] mc-text-shadow">
              💍 ADDITIONAL QUEST CELEBRATIONS
            </h3>

            {customEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2 mc-panel border border-black text-xs"
              >
                <span className="text-white">{ev.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#a3a4ab]">{months[ev.month - 1]} {ev.day}</span>
                  <button
                    type="button"
                    onClick={() => setCustomEvents(customEvents.filter((c) => c.id !== ev.id))}
                    className="mc-button-red p-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Event Name (e.g. Guild Anniversary)"
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                className="flex-1 mc-input px-2.5 py-1 text-xs font-pixel"
              />
              <select
                value={newCustomMonth}
                onChange={(e) => setNewCustomMonth(Number(e.target.value))}
                className="mc-input px-2 py-1 text-xs font-pixel"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m.slice(0, 3)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="31"
                value={newCustomDay}
                onChange={(e) => setNewCustomDay(Number(e.target.value))}
                className="w-14 mc-input px-2 py-1 text-xs font-pixel"
              />
              <button
                type="button"
                onClick={handleAddCustomEvent}
                className="mc-button-emerald px-3 py-1 text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
              General Notes
            </label>
            <textarea
              rows={2}
              placeholder="Any ongoing gift thoughts or shared memories..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full mc-input px-2.5 py-1 text-xs font-pixel"
            />
          </div>

          {/* Submit */}
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
              {personToEdit ? 'Save Player Changes' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
