import React, { useState } from 'react';
import { GiftProvider, useGifts } from './context/GiftContext';
import { Header, ActiveTab } from './components/Header';
import { LandingCirclesPage } from './components/LandingCirclesPage';
import { PersonGiftDetail } from './components/PersonGiftDetail';
import { RemindersTab } from './components/RemindersTab';
import { GiftsTab } from './components/GiftsTab';
import { PeopleTab } from './components/PeopleTab';
import { BudgetAndTimeTab } from './components/BudgetAndTimeTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { ShoppingListTab } from './components/ShoppingListTab';
import { GiftModal } from './components/GiftModal';
import { PersonModal } from './components/PersonModal';
import { GiftItem, Person, OccasionType } from './types';
import { Gift, Calendar, Heart, Sparkles, AlertTriangle, Flame } from 'lucide-react';

function AppContent() {
  const { reminders, gifts, people } = useGifts();

  // Landing page with colorful circles as default view
  const [activeTab, setActiveTab] = useState<ActiveTab>('circles');

  // Selected person to reveal gift ideas, budget/time and preferences
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Person | null>(null);

  // Modals state
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [giftToEdit, setGiftToEdit] = useState<GiftItem | null>(null);
  const [initialRecipientId, setInitialRecipientId] = useState<string | undefined>();
  const [initialOccasion, setInitialOccasion] = useState<OccasionType | undefined>();

  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);

  // AI assistant initial prep
  const [aiTargetRecipient, setAiTargetRecipient] = useState('');
  const [aiTargetRelation, setAiTargetRelation] = useState('friend');
  const [aiTargetInterests, setAiTargetInterests] = useState('');

  // Selected gift for highlight
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);

  // Open Add Gift modal
  const handleOpenNewGift = (personId?: string, occasion?: OccasionType) => {
    setGiftToEdit(null);
    setInitialRecipientId(personId);
    setInitialOccasion(occasion);
    setGiftModalOpen(true);
  };

  const handleEditGift = (gift: GiftItem) => {
    setGiftToEdit(gift);
    setGiftModalOpen(true);
  };

  const handleOpenNewPerson = () => {
    setPersonToEdit(null);
    setPersonModalOpen(true);
  };

  const handleEditPerson = (person: Person) => {
    setPersonToEdit(person);
    setPersonModalOpen(true);
  };

  const handleNavigateToAI = (name?: string, relationship?: string, interests?: string) => {
    if (name) setAiTargetRecipient(name);
    if (relationship) setAiTargetRelation(relationship);
    if (interests) setAiTargetInterests(interests);
    setActiveTab('ai_studio');
  };

  const handleSelectGift = (giftId: string) => {
    setSelectedGiftId(giftId);
    setActiveTab('gifts');
  };

  // Keep selectedPersonForDetail in sync with updated people
  const activePersonDetail = selectedPersonForDetail
    ? people.find((p) => p.id === selectedPersonForDetail.id) || selectedPersonForDetail
    : null;

  // Urgent event notification banner check
  const urgentReminders = reminders.filter((r) => r.daysRemaining <= 7);

  return (
    <div className="min-h-screen text-[#f1ede4] flex flex-col font-pixel selection:bg-[#55ff55] selection:text-[#000000]">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewGiftModal={() => handleOpenNewGift()}
        onOpenNewPersonModal={handleOpenNewPerson}
      />

      {/* Urgent Birthday Alert Bar (if any birthdays/events within 7 days) */}
      {urgentReminders.length > 0 && activeTab !== 'circles' && activeTab !== 'reminders' && (
        <div className="bg-[#b71c1c] text-[#ffffff] border-y-2 border-[#000000] px-4 py-2 text-xs font-pixel shadow-[0_2px_0_#000000]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔥</span>
              <span className="mc-text-shadow">
                <strong className="text-[#ffea75]">URGENT QUEST:</strong> {urgentReminders[0].title} is coming up in{' '}
                {urgentReminders[0].daysRemaining === 0
                  ? 'TODAY! 🎂'
                  : `${urgentReminders[0].daysRemaining} DAYS!`}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('circles')}
              className="mc-button-gold px-3 py-0.5 text-xs font-pixel"
            >
              [ View Circles ]
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'circles' && (
          <LandingCirclesPage
            onSelectPerson={setSelectedPersonForDetail}
            onOpenNewPersonModal={handleOpenNewPerson}
            onOpenNewGiftModal={() => handleOpenNewGift()}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            onAddGiftForReminder={handleOpenNewGift}
            onSelectGift={handleSelectGift}
            onNavigateToAI={handleNavigateToAI}
          />
        )}

        {activeTab === 'gifts' && (
          <GiftsTab
            onOpenGiftModal={(gift) => (gift ? handleEditGift(gift) : handleOpenNewGift())}
            selectedGiftId={selectedGiftId}
          />
        )}

        {activeTab === 'people' && (
          <PeopleTab
            onOpenPersonModal={(p) => (p ? handleEditPerson(p) : handleOpenNewPerson())}
            onAddGiftForPerson={(personId) => handleOpenNewGift(personId)}
            onNavigateToAI={handleNavigateToAI}
            onSelectGift={handleSelectGift}
          />
        )}

        {activeTab === 'budget_time' && (
          <BudgetAndTimeTab
            onSelectGift={handleSelectGift}
            onOpenNewGift={() => handleOpenNewGift()}
          />
        )}

        {activeTab === 'ai_studio' && (
          <AIAssistantTab
            initialRecipientName={aiTargetRecipient}
            initialRelationship={aiTargetRelation}
            initialInterests={aiTargetInterests}
            onSelectGift={handleSelectGift}
          />
        )}

        {activeTab === 'shopping_list' && <ShoppingListTab />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#000000] bg-[#1a191d] py-5 text-xs text-[#a3a4ab] font-pixel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mc text-[#55ff55] text-xs mc-text-shadow">⛏️ GiftCraft</span>
            <span className="text-[#555555]">■</span>
            <span className="mc-text-shadow-sm">Crafting thoughtful gifts & zero missed birthdays.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#e0b28e] border border-black inline-block"></span>
              <strong className="text-[#ffffff]">{people.length}</strong> Players
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#f59e0b] border border-black inline-block"></span>
              <strong className="text-[#ffea75]">{gifts.length}</strong> Gifts in Chest
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#55ff55] border border-black inline-block"></span>
              <strong className="text-[#55ff55]">
                {gifts
                  .filter((g) => g.type === 'handmade')
                  .reduce((sum, g) => sum + (g.craftingHoursEstimated || 0), 0)}h
              </strong>{' '}
              DIY Crafting XP
            </span>
          </div>
        </div>
      </footer>

      {/* Person Detail Drawer: reveals gift ideas based on budget/time, preferences, and birthday info */}
      {activePersonDetail && (
        <PersonGiftDetail
          person={activePersonDetail}
          onClose={() => setSelectedPersonForDetail(null)}
          onOpenGiftModal={(gift, personId, occasion) => {
            if (gift) {
              handleEditGift(gift);
            } else {
              handleOpenNewGift(personId, occasion);
            }
          }}
          onOpenPersonModal={handleEditPerson}
          onNavigateToAI={handleNavigateToAI}
        />
      )}

      {/* Gift Modal */}
      <GiftModal
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        giftToEdit={giftToEdit}
        initialRecipientId={initialRecipientId}
        initialOccasion={initialOccasion}
      />

      {/* Person Modal */}
      <PersonModal
        isOpen={personModalOpen}
        onClose={() => setPersonModalOpen(false)}
        personToEdit={personToEdit}
      />
    </div>
  );
}

export default function App() {
  return (
    <GiftProvider>
      <AppContent />
    </GiftProvider>
  );
}
