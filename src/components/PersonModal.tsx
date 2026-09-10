import React, { useState, useEffect } from 'react';
import { Person, Relationship, CuteFaceConfig } from '../types';
import { useGifts } from '../context/GiftContext';
import { CuteFace, getDerivedCuteFace } from './CuteFace';
import { X, Heart, Users, User, Briefcase, Plus, Trash2, Smile, Sparkles } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  personToEdit?: Person | null;
}

const AVATAR_COLORS = [
  '#fbcfe8', // pastel rose
  '#fecdd3', // pastel blossom pink
  '#ddd6fe', // pastel lilac / lavender
  '#bae6fd', // pastel sky blue
  '#bbf7d0', // pastel mint green
  '#fef08a', // pastel lemon butter
  '#fed7aa', // pastel peach / apricot
  '#e7e5e4', // pastel pebble warm gray
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#fffefb] rounded-2xl shadow-[6px_6px_0px_#292524] border-2 border-stone-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-stone-800 bg-[#fffefb]">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-sketch text-2xl">
              {personToEdit ? `Edit ${personToEdit.name}` : 'Add Someone Special'} ✨
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-sketch text-sm">
              Keep their birthday, sizing, hobbies, and gift preferences handy.
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
          {/* Name & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-sketch text-sm">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Sarah Jenkins, Mom, Ethan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 bg-[#fffefb] text-stone-900 text-sm shadow-[1.5px_1.5px_0px_#292524] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-sketch text-sm">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-800 bg-[#fffefb] text-stone-900 text-sm shadow-[1.5px_1.5px_0px_#292524] focus:outline-hidden"
              >
                <option value="partner">❤️ Partner / Spouse</option>
                <option value="family">🏡 Family (Parents, Siblings, Kids)</option>
                <option value="friend">✨ Friend</option>
                <option value="colleague">💼 Colleague / Work</option>
                <option value="other">🌟 Other</option>
              </select>
            </div>
          </div>

          {/* Birthday and Year */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-3">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              🎂 Birthday Date (For Reminders & Age Milestones)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm"
                >
                  {months.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={birthDay}
                  onChange={(e) => setBirthDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Birth Year (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1996"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cute Face Expression Customizer with Live Preview */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-600" />
                  Circle Facial Expression
                </h3>
                <p className="text-[11px] text-stone-500">
                  The circle itself is the face! Choose their personality expression:
                </p>
              </div>

              {/* Live Preview Circle */}
              <div className="w-18 h-18 relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                  <defs>
                    <radialGradient id="modal-preview-wash" cx="42%" cy="38%" r="62%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                      <stop offset="85%" stopColor={avatarColor} stopOpacity="1" />
                      <stop offset="100%" stopColor="#292524" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                    fill="url(#modal-preview-wash)"
                  />
                  <path
                    d="M 50.4 4.5 C 75.2 3.8, 95.5 25.2, 95.1 50.2 C 94.7 74.8, 74.5 95.2, 49.8 95 C 25.1 94.8, 5.2 75, 4.8 50.4 C 4.5 25.4, 25.4 5.2, 50.4 4.5"
                    stroke="#78716c"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeDasharray="90 4 40 3"
                    opacity={0.6}
                  />
                  <path
                    d="M 50 3.8 C 75.8 3.2, 96.5 24.2, 96.1 49.8 C 95.7 75.5, 75.8 96.2, 50.2 95.8 C 24.5 95.4, 3.8 74.8, 4.2 49.8 C 4.6 24.5, 24.8 4.5, 50 3.8 Z"
                    stroke="#292524"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <CuteFace
                  name={name || 'Friend'}
                  config={{
                    expression,
                    glasses,
                    freckles,
                    blush,
                  }}
                  size={52}
                  isHovered={true}
                />
              </div>
            </div>

            {/* Expression selector */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Expression
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
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
                      expression === expr.id
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {expr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={glasses}
                  onChange={(e) => setGlasses(e.target.checked)}
                  className="rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="font-medium text-stone-700">Glasses 👓</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freckles}
                  onChange={(e) => setFreckles(e.target.checked)}
                  className="rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="font-medium text-stone-700">Freckles ✨</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blush}
                  onChange={(e) => setBlush(e.target.checked)}
                  className="rounded-sm border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="font-medium text-stone-700">Cheek Blush 🌸</span>
              </label>
            </div>
          </div>

          {/* Color & Annual Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Avatar Theme Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      avatarColor === c ? 'ring-2 ring-offset-2 ring-stone-900 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Annual Gift Budget Target ($)
              </label>
              <input
                type="number"
                placeholder="e.g., 200"
                value={annualBudget}
                onChange={(e) => setAnnualBudget(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Hobbies / Interests */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Hobbies & Interests (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., Specialty Coffee, Watercolor, Hiking, Sourdough, Sci-Fi"
              value={interestsStr}
              onChange={(e) => setInterestsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {/* Sizing Section */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              👕 Sizing Guide (Never guess their size again)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-stone-600 mb-1">Clothing Size</label>
                <input
                  type="text"
                  placeholder="e.g., M / 38 / 6"
                  value={clothingSize}
                  onChange={(e) => setClothingSize(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Shoe Size</label>
                <input
                  type="text"
                  placeholder="e.g., 9.5 US / 42 EU"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Ring / Wrist / Hat</label>
                <input
                  type="text"
                  placeholder="e.g., Ring 7, 7 inch wrist, M hat"
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1">Fit Preferences / Style Notes</label>
              <input
                type="text"
                placeholder="e.g., Likes oversized fits, breathable linen, avoids synthetic fabrics"
                value={sizeNotes}
                onChange={(e) => setSizeNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
              />
            </div>
          </div>

          {/* Preferences & Allergies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Loves / Favorite Things
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Lavender scents, dark chocolate, cozy blankets"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Dislikes / Allergies / Avoid
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Allergic to wool, hates knick-knacks or strong perfumes"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-xs"
              />
            </div>
          </div>

          {/* Custom Events (Anniversary, etc.) */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              💍 Additional Celebrations (Anniversary, Graduation, etc.)
            </h3>

            {customEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs"
              >
                <span className="font-medium text-stone-800">{ev.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-stone-500">{months[ev.month - 1]} {ev.day}</span>
                  <button
                    type="button"
                    onClick={() => setCustomEvents(customEvents.filter((c) => c.id !== ev.id))}
                    className="text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Event Name (e.g. Our Anniversary)"
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
              />
              <select
                value={newCustomMonth}
                onChange={(e) => setNewCustomMonth(Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
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
                className="w-14 px-2 py-1.5 rounded-lg border border-stone-200 bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomEvent}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 font-sketch text-sm">
              General Notes
            </label>
            <textarea
              rows={2}
              placeholder="Any ongoing gift thoughts or shared memories..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border-2 border-stone-800 bg-[#fffefb] text-sm shadow-[1.5px_1.5px_0px_#292524] focus:outline-hidden"
            />
          </div>

          {/* Submit */}
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
              {personToEdit ? 'Save Changes' : 'Add Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
