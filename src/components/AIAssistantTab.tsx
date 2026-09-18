import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { AIGeneratedGiftIdea, OccasionType } from '../types';
import { formatCurrency } from '../utils/giftHelpers';
import {
  Sparkles,
  Tag,
  Clock,
  Plus,
  Loader2,
  AlertCircle,
  Lightbulb,
  Wrench,
  Check,
  Package,
} from 'lucide-react';

interface AIAssistantTabProps {
  initialRecipientName?: string;
  initialRelationship?: string;
  initialInterests?: string;
  onSelectGift: (giftId: string) => void;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  initialRecipientName = '',
  initialRelationship = 'friend',
  initialInterests = '',
}) => {
  const { people, addGift } = useGifts();

  // Mode: brainstorm vs craft planner
  const [activeSubMode, setActiveSubMode] = useState<'brainstorm' | 'craft_planner'>('brainstorm');

  // Brainstorm Form State
  const [selectedPersonId, setSelectedPersonId] = useState<string>('custom');
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [relationship, setRelationship] = useState(initialRelationship);
  const [occasion, setOccasion] = useState('Birthday');
  const [interests, setInterests] = useState(initialInterests);
  const [budget, setBudget] = useState<number | ''>(50);
  const [giftPreference, setGiftPreference] = useState<'both' | 'handmade' | 'bought'>('both');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Brainstorm result state
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormResults, setBrainstormResults] = useState<AIGeneratedGiftIdea[]>([]);
  const [brainstormError, setBrainstormError] = useState<string | null>(null);
  const [savedIdeaTitles, setSavedIdeaTitles] = useState<Set<string>>(new Set());

  // Craft Planner Form State
  const [craftGiftTitle, setCraftGiftTitle] = useState('Hand-carved Wooden Cooking Spoon');
  const [craftRecipient, setCraftRecipient] = useState('');
  const [craftAvailableHours, setCraftAvailableHours] = useState<number | ''>(5);
  const [craftSkillLevel, setCraftSkillLevel] = useState('Beginner/Intermediate');

  const [isPlanningCraft, setIsPlanningCraft] = useState(false);
  const [craftPlanResult, setCraftPlanResult] = useState<any | null>(null);
  const [craftPlanSaved, setCraftPlanSaved] = useState(false);

  // When a person is selected from dropdown, autofill
  const handlePersonSelect = (personId: string) => {
    setSelectedPersonId(personId);
    if (personId === 'custom') {
      setRecipientName('');
      setInterests('');
      setRelationship('friend');
      return;
    }
    const found = people.find((p) => p.id === personId);
    if (found) {
      setRecipientName(found.name);
      setRelationship(found.relationship);
      setInterests(found.interests.join(', '));
      if (found.annualBudget) setBudget(found.annualBudget);
      if (found.preferences?.likes) setAdditionalNotes(`Likes: ${found.preferences.likes}`);
    }
  };

  const handleBrainstormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBrainstorming(true);
    setBrainstormError(null);
    setBrainstormResults([]);

    try {
      const response = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          relationship,
          occasion,
          interests,
          budget,
          giftPreference,
          additionalNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.ideas) && data.ideas.length > 0) {
        setBrainstormResults(data.ideas);
      } else {
        throw new Error('No suggestions generated. Please try again with different keywords.');
      }
    } catch (err: any) {
      console.error(err);
      setBrainstormError(
        err.message || 'Failed to connect to the AI service. Verify your GEMINI_API_KEY secret.'
      );
      // High quality instant fallback suggestions
      setBrainstormResults([
        {
          title: `Curated ${interests ? interests.split(',')[0] : 'Artisanal'} Gift Basket`,
          type: 'bought',
          description: `A thoughtfully assembled collection celebrating ${recipientName || 'your player companion'}'s passion for ${interests || 'rare materials'}. Include specialty provisions and a handwritten parchment scroll.`,
          estimatedCost: Number(budget) || 45,
          whereToFindOrMake: 'Local trade post, artisanal market, or Etsy',
          leadTimeAdvice: 'Order 10 days before to package in a decorative wooden chest.',
        },
        {
          title: `Handcrafted Memory Scrapbook & Keepsake Box`,
          type: 'handmade',
          description: `Collect printed screenshots and photos of favorite adventures, concert tickets, notes, and quotes. Bind with linen cord and pressed botanical leaves.`,
          estimatedCost: 20,
          craftingHours: 4,
          difficulty: 'Easy',
          suppliesNeeded: ['Kraft paper book', 'Double-sided mounting tape', 'Pressed dried flowers', 'Metallic calligraphy ink'],
          whereToFindOrMake: 'Craft store or stationery outpost',
          leadTimeAdvice: 'Start 2 weeks ahead to print photos and gather materials.',
        },
        {
          title: `Custom Embroidered Linen Tote or Apron`,
          type: 'handmade',
          description: `A durable pure linen tote embroidered with their player initials, favorite mob icon, or a minimalist flower motif.`,
          estimatedCost: 18,
          craftingHours: 3.5,
          difficulty: 'Medium',
          suppliesNeeded: ['Heavyweight linen blank', 'Embroidery thread skeins', 'Wood hoop and needles'],
          whereToFindOrMake: 'Textile shop or craft market',
          leadTimeAdvice: 'Takes about 3-4 hours of relaxed evening crafting.',
        },
      ]);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleSaveIdea = (idea: AIGeneratedGiftIdea) => {
    let matchedPersonId = 'unassigned';
    if (selectedPersonId !== 'custom') {
      matchedPersonId = selectedPersonId;
    } else {
      const match = people.find((p) => p.name.toLowerCase() === recipientName.toLowerCase());
      if (match) matchedPersonId = match.id;
    }

    let occKey: OccasionType = 'birthday';
    const occLower = occasion.toLowerCase();
    if (occLower.includes('christmas') || occLower.includes('holiday')) occKey = 'christmas';
    else if (occLower.includes('anniversary')) occKey = 'anniversary';
    else if (occLower.includes('valentine')) occKey = 'valentines';
    else if (occLower.includes('mother')) occKey = 'mothers_day';
    else if (occLower.includes('father')) occKey = 'fathers_day';
    else if (occLower.includes('just because')) occKey = 'just_because';

    const supplies = idea.suppliesNeeded?.map((supName, idx) => ({
      id: `sup-${Date.now()}-${idx}`,
      name: supName,
      estimatedCost: Math.round(((idea.estimatedCost || 20) / (idea.suppliesNeeded?.length || 1)) * 10) / 10,
      purchased: false,
    }));

    addGift({
      title: idea.title,
      type: idea.type,
      recipientId: matchedPersonId,
      occasion: occKey,
      targetYear: 2026,
      status: idea.type === 'handmade' ? 'planning' : 'idea',
      priority: 'medium',
      estimatedPrice: idea.estimatedCost || 30,
      craftingHoursEstimated: idea.craftingHours || (idea.type === 'handmade' ? 4 : undefined),
      craftDifficulty: idea.difficulty === 'N/A' ? undefined : (idea.difficulty as any),
      craftSupplies: supplies,
      notes: `${idea.description}\n\nTips: ${idea.leadTimeAdvice || ''}`,
    });

    setSavedIdeaTitles((prev) => new Set([...prev, idea.title]));
  };

  const handleCraftPlannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanningCraft(true);
    setCraftPlanResult(null);
    setCraftPlanSaved(false);

    try {
      const res = await fetch('/api/ai/craft-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftTitle: craftGiftTitle,
          recipientName: craftRecipient,
          availableHours: craftAvailableHours,
          skillLevel: craftSkillLevel,
        }),
      });

      if (!res.ok) throw new Error('Craft planner failed');
      const data = await res.json();
      setCraftPlanResult(data.plan);
    } catch (err: any) {
      console.error(err);
      // Fallback craft plan for reliable offline testing
      setCraftPlanResult({
        title: craftGiftTitle,
        estimatedTotalHours: Number(craftAvailableHours) || 4,
        difficulty: craftSkillLevel.includes('Beginner') ? 'Easy' : 'Medium',
        estimatedMaterialCost: 22,
        materialsList: [
          { name: 'Hardwood block (oak or birch wood)', approxCost: 10, whereToGet: 'Craft or lumber depot' },
          { name: 'Carving whittling knife / leather glove', approxCost: 0, whereToGet: 'Inventory toolbox' },
          { name: 'Assorted sandpaper sheets (120, 220, 400 grit)', approxCost: 5, whereToGet: 'Hardware trade outpost' },
          { name: 'Organic beeswax / food-safe sealant', approxCost: 7, whereToGet: 'General supply shop' },
        ],
        timelineSchedule: [
          { phase: 'Rough Profiling', estimatedDaysBefore: 14, hours: 1.5, task: 'Draw template silhouette and block out main shape' },
          { phase: 'Detailing & Hollowing', estimatedDaysBefore: 7, hours: 1.5, task: 'Carve bowl recess and taper handle ergonomically' },
          { phase: 'Sanding & Oil Coat', estimatedDaysBefore: 2, hours: 1, task: 'Fine-grit polishing and protective food-safe oiling' },
        ],
        stepByStep: [
          'Step 1: Sketch top and side profile templates on hardwood block.',
          'Step 2: Rough cut excess wood using stop cuts, always cutting away from body.',
          'Step 3: Hollow spoon recess carefully using curved knife or gouge.',
          'Step 4: Smooth thoroughly with 120-grit up to 400-grit sandpaper.',
          'Step 5: Warm beeswax/oil, buff thoroughly with clean cotton cloth.',
        ],
        proTips: [
          'Always carve along the grain to prevent tearout.',
          'Wear protective cut-resistant gloves on non-dominant hand.',
        ],
        packagingIdea: 'Pack in a miniature wooden chest tied with green dye ribbon and fresh pine needles.',
      });
    } finally {
      setIsPlanningCraft(false);
    }
  };

  const handleSaveCraftPlanToGifts = () => {
    if (!craftPlanResult) return;

    const supplies = craftPlanResult.materialsList?.map((m: any, idx: number) => ({
      id: `sup-${Date.now()}-${idx}`,
      name: m.name,
      estimatedCost: m.approxCost || 5,
      purchased: false,
    }));

    const steps = craftPlanResult.stepByStep?.map((s: string, idx: number) => ({
      id: `st-${Date.now()}-${idx}`,
      text: s,
      done: false,
      hours: Math.round(((craftPlanResult.estimatedTotalHours || 4) / (craftPlanResult.stepByStep?.length || 4)) * 10) / 10,
    }));

    addGift({
      title: craftPlanResult.title,
      type: 'handmade',
      recipientId: 'unassigned',
      occasion: 'birthday',
      targetYear: 2026,
      status: 'planning',
      priority: 'high',
      estimatedPrice: craftPlanResult.estimatedMaterialCost || 20,
      craftingHoursEstimated: craftPlanResult.estimatedTotalHours || 4,
      craftDifficulty: craftPlanResult.difficulty || 'Medium',
      craftSupplies: supplies,
      craftSteps: steps,
      notes: `Packaging Idea: ${craftPlanResult.packagingIdea || ''}\n\nPro Tips:\n${craftPlanResult.proTips?.join('\n')}`,
    });

    setCraftPlanSaved(true);
  };

  return (
    <div className="space-y-6 font-pixel">
      {/* Mode Switcher: Minecraft Hotbar Style */}
      <div className="flex items-center gap-2 p-2 mc-panel border-2 border-black w-fit">
        <button
          onClick={() => setActiveSubMode('brainstorm')}
          className={`px-4 py-2 text-xs font-pixel border-2 transition-none flex items-center gap-1.5 ${
            activeSubMode === 'brainstorm'
              ? 'bg-[#d97706] text-black border-white'
              : 'mc-button'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-white" />
          Gift Idea Brainstormer
        </button>
        <button
          onClick={() => setActiveSubMode('craft_planner')}
          className={`px-4 py-2 text-xs font-pixel border-2 transition-none flex items-center gap-1.5 ${
            activeSubMode === 'craft_planner'
              ? 'bg-[#2b7730] text-[#55ff55] border-white'
              : 'mc-button'
          }`}
        >
          <Wrench className="w-4 h-4 text-[#55ff55]" />
          DIY Craft Blueprint Generator
        </button>
      </div>

      {activeSubMode === 'brainstorm' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Form Column (5 cols): Crafting Table Interface */}
          <div className="lg:col-span-5 mc-panel p-5 border-2 border-black space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#3c3d44]">
              <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#ffea75]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18181b] font-mc">
                  GIFT WIZARD BRAINSTORM
                </h3>
                <p className="text-xs text-[#27272a] font-medium font-pixel">
                  AI suggestions tailored to hobbies, emerald budget, and DIY craft preference.
                </p>
              </div>
            </div>

            <form onSubmit={handleBrainstormSubmit} className="space-y-3.5">
              {/* Select Existing Contact */}
              <div>
                <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                  Target Player
                </label>
                <select
                  value={selectedPersonId}
                  onChange={(e) => handlePersonSelect(e.target.value)}
                  className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                >
                  <option value="custom">✍️ Custom / New Player</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.relationship})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPersonId === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">Player Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">Group</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                    >
                      <option value="partner">Partner</option>
                      <option value="family">Family</option>
                      <option value="friend">Friend</option>
                      <option value="colleague">Guild Mate</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Occasion */}
              <div>
                <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                  Quest Event / Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                >
                  <option value="Birthday">🎂 Level Up / Birthday</option>
                  <option value="Christmas / Winter Holiday">🎄 Winter Solstice Fest</option>
                  <option value="Anniversary">💍 Guild Anniversary</option>
                  <option value="Valentine's Day">❤️ Heart Day</option>
                  <option value="Mother's Day">🌸 Mother&apos;s Celebration</option>
                  <option value="Father's Day">👔 Father&apos;s Celebration</option>
                  <option value="Just Because">✨ Spontaneous Loot Drop</option>
                </select>
              </div>

              {/* Interests & Hobbies */}
              <div>
                <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                  Hobbies, Skills & Passions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Redstone engineering, Potion brewing, Botany, Cooking, Mining..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                />
              </div>

              {/* Budget & Gift Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                    Emerald Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">Loot Preference</label>
                  <select
                    value={giftPreference}
                    onChange={(e) => setGiftPreference(e.target.value as any)}
                    className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                  >
                    <option value="both">Both Trade & DIY Craft</option>
                    <option value="handmade">Handmade Craft Only</option>
                    <option value="bought">Villager Trade Only</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-pixel text-[#a3a4ab] mb-1">
                  Extra Context / Preferences
                </label>
                <input
                  type="text"
                  placeholder="e.g. Minimalist, no inventory clutter"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                />
              </div>

              <button
                type="submit"
                disabled={isBrainstorming}
                className="w-full py-2 mc-button-gold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isBrainstorming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consulting Enchanter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Craft 5 Thoughtful Ideas
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {brainstormError && (
              <div className="p-3 mc-panel-dark border border-[#ff5555] text-xs text-[#ffaaaa] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#ff5555] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Notice:</span> {brainstormError}
                  <span className="block mt-0.5 text-[#a3a4ab]">
                    Displaying curated idea templates below.
                  </span>
                </div>
              </div>
            )}

            {brainstormResults.length === 0 && !isBrainstorming ? (
              <div className="p-12 text-center mc-panel-dark border-2 border-black">
                <Lightbulb className="w-10 h-10 text-[#555555] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mc-text-shadow font-mc">
                  READY TO BRAINSTORM GIFTS
                </h4>
                <p className="text-xs text-[#a3a4ab] max-w-sm mx-auto mt-1 font-pixel">
                  Enter your recipient&apos;s interests on the left and our AI wizard will propose
                  a tailored mix of store-bought trades and meaningful handmade recipes.
                </p>
              </div>
            ) : (
              brainstormResults.map((idea, idx) => {
                const isSaved = savedIdeaTitles.has(idea.title);
                const isHandmade = idea.type === 'handmade';

                return (
                  <div
                    key={idx}
                    className="p-4 mc-panel border-2 border-black space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {isHandmade ? (
                            <span className="px-2 py-0.5 text-xs font-pixel bg-[#2b7730] text-[#55ff55] border border-black flex items-center gap-1 mc-text-shadow">
                              <Sparkles className="w-3 h-3 text-[#55ff55]" /> CRAFTED DIY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-pixel bg-[#d97706] text-black border border-black flex items-center gap-1 font-bold">
                              <Tag className="w-3 h-3 text-black" /> TRADE ITEM
                            </span>
                          )}

                          <span className="font-bold text-[#ffea75] text-xs font-pixel">
                            {formatCurrency(idea.estimatedCost)}
                          </span>

                          {isHandmade && idea.craftingHours && (
                            <span className="text-[#a3a4ab] text-xs flex items-center gap-1 font-pixel">
                              <Clock className="w-3 h-3 text-[#55ffff]" /> ~{idea.craftingHours}h crafting
                            </span>
                          )}
                          {isHandmade && idea.difficulty && (
                            <span className="px-1.5 py-0.2 border border-black bg-[#212026] text-white text-[10px]">
                              {idea.difficulty}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-[#18181b] mt-2 font-pixel">{idea.title}</h4>
                      </div>

                      <button
                        onClick={() => handleSaveIdea(idea)}
                        disabled={isSaved}
                        className={`px-3 py-1.5 text-xs flex items-center gap-1.5 shrink-0 ${
                          isSaved
                            ? 'mc-panel-dark text-[#55ff55] border border-black'
                            : 'mc-button-emerald'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#55ff55]" /> Added to Chest
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Put in Chest
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#27272a] font-pixel font-medium leading-relaxed">{idea.description}</p>

                    {/* Supplies / Sourcing */}
                    {idea.suppliesNeeded && idea.suppliesNeeded.length > 0 && (
                      <div className="text-xs mc-panel-dark p-2 border border-black">
                        <span className="font-mc text-[9px] text-[#ffea75]">MATERIALS NEEDED: </span>
                        <span className="text-white">{idea.suppliesNeeded.join(', ')}</span>
                      </div>
                    )}

                    {idea.whereToFindOrMake && !idea.suppliesNeeded && (
                      <div className="text-xs text-[#a3a4ab]">
                        <span className="text-white">Where to find: </span>
                        {idea.whereToFindOrMake}
                      </div>
                    )}

                    {/* Lead time advice */}
                    {idea.leadTimeAdvice && (
                      <div className="text-[11px] text-[#ffea75] bg-[#38280f] p-2 border border-black flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#ffea75]" />
                        <span>{idea.leadTimeAdvice}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* DIY Craft Project Generator */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5 mc-panel p-5 border-2 border-black space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#3c3d44]">
              <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#55ff55]">
                <Wrench className="w-4 h-4 text-[#55ff55]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18181b] font-mc">
                  DIY RECIPE BLUEPRINT
                </h3>
                <p className="text-xs text-[#27272a] font-medium font-pixel">
                  Turn any handmade concept into ingredients, timeline, and step-by-step instructions.
                </p>
              </div>
            </div>

            <form onSubmit={handleCraftPlannerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                  Handmade Gift Concept *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Carved Wooden Spoon, Wool Scarf"
                  value={craftGiftTitle}
                  onChange={(e) => setCraftGiftTitle(e.target.value)}
                  className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                />
              </div>

              <div>
                <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                  Player Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mom, Alex"
                  value={craftRecipient}
                  onChange={(e) => setCraftRecipient(e.target.value)}
                  className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">
                    Available Craft Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={craftAvailableHours}
                    onChange={(e) =>
                      setCraftAvailableHours(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-pixel text-[#18181b] font-bold mb-1">Skill Level</label>
                  <select
                    value={craftSkillLevel}
                    onChange={(e) => setCraftSkillLevel(e.target.value)}
                    className="w-full mc-input px-3 py-1.5 text-xs font-pixel"
                  >
                    <option value="Beginner">Beginner (Simple & Fast)</option>
                    <option value="Beginner/Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced (Master Crafter)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPlanningCraft}
                className="w-full py-2 mc-button-emerald text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPlanningCraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Recipe Blueprint...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Recipe Blueprint
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Blueprint Result */}
          <div className="lg:col-span-7 space-y-4">
            {!craftPlanResult && !isPlanningCraft ? (
              <div className="p-12 text-center mc-panel-dark border-2 border-black">
                <Package className="w-10 h-10 text-[#555555] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mc-text-shadow font-mc">
                  READY TO PLAN A CRAFT
                </h4>
                <p className="text-xs text-[#a3a4ab] max-w-sm mx-auto mt-1 font-pixel">
                  Type any DIY idea on the left. We&apos;ll outline the exact ingredients to gather,
                  step-by-step instructions, and a timeline schedule so you finish before the celebration tick.
                </p>
              </div>
            ) : craftPlanResult ? (
              <div className="p-5 mc-panel border-2 border-black space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 text-xs font-pixel bg-[#2b7730] text-[#55ff55] border border-black mc-text-shadow">
                      DIY RECIPE BLUEPRINT
                    </span>
                    <h3 className="text-base font-bold text-white mc-text-shadow mt-2 font-pixel">
                      {craftPlanResult.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#a3a4ab] mt-1 font-pixel">
                      <span>
                        Time: <strong className="text-white">{craftPlanResult.estimatedTotalHours} hrs</strong>
                      </span>
                      <span>■</span>
                      <span>
                        Cost: <strong className="text-[#ffea75]">${craftPlanResult.estimatedMaterialCost}</strong>
                      </span>
                      <span>■</span>
                      <span>
                        Difficulty: <strong className="text-white">{craftPlanResult.difficulty}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCraftPlanToGifts}
                    disabled={craftPlanSaved}
                    className={`px-3 py-1.5 text-xs flex items-center gap-1.5 shrink-0 ${
                      craftPlanSaved
                        ? 'mc-panel-dark text-[#55ff55] border border-black'
                        : 'mc-button-emerald'
                    }`}
                  >
                    {craftPlanSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#55ff55]" /> Added to Chest
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Save to Chest
                      </>
                    )}
                  </button>
                </div>

                {/* Timeline schedule */}
                {craftPlanResult.timelineSchedule && (
                  <div className="space-y-2">
                    <h4 className="font-mc text-[9px] text-[#ffea75] mc-text-shadow">
                      PREPARATION TIMELINE
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {craftPlanResult.timelineSchedule.map((phase: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2.5 mc-panel-dark border border-black text-xs"
                        >
                          <div className="font-bold text-white">{phase.phase}</div>
                          <div className="text-[10px] text-[#55ffff] mt-0.5">
                            {phase.estimatedDaysBefore} days before • {phase.hours}h
                          </div>
                          <p className="text-[11px] text-[#d1d5db] mt-1">{phase.task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials List */}
                {craftPlanResult.materialsList && (
                  <div className="space-y-2">
                    <h4 className="font-mc text-[9px] text-[#80ff20] mc-text-shadow">
                      INGREDIENTS & SUPPLIES
                    </h4>
                    <div className="space-y-1">
                      {craftPlanResult.materialsList?.map((mat: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 mc-panel-dark border border-black text-xs"
                        >
                          <span className="text-white">{mat.name}</span>
                          <div className="flex items-center gap-2 text-[#a3a4ab]">
                            <span>{mat.whereToGet}</span>
                            <span className="font-pixel font-bold text-[#ffea75]">
                              ${mat.approxCost}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step by Step */}
                {craftPlanResult.stepByStep && (
                  <div className="space-y-2">
                    <h4 className="font-mc text-[9px] text-[#55ffff] mc-text-shadow">
                      CRAFTING INSTRUCTIONS
                    </h4>
                    <div className="space-y-1 text-xs text-white">
                      {craftPlanResult.stepByStep?.map((st: string, idx: number) => (
                        <div key={idx} className="p-2 mc-panel-dark border border-black">
                          {st}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Packaging idea */}
                {craftPlanResult.packagingIdea && (
                  <div className="p-2.5 bg-[#38280f] border border-black text-xs">
                    <span className="font-bold text-[#ffea75]">🎁 Wrapping Tip: </span>
                    <span className="text-white">{craftPlanResult.packagingIdea}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
