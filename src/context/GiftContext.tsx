import React, { createContext, useContext, useState, useEffect } from 'react';
import { Person, GiftItem, HolidayDefinition, UpcomingReminder } from '../types';
import { INITIAL_PEOPLE, INITIAL_GIFTS, DEFAULT_HOLIDAYS } from '../initialData';
import { computeUpcomingReminders } from '../utils/giftHelpers';

interface GiftContextType {
  people: Person[];
  gifts: GiftItem[];
  holidays: HolidayDefinition[];
  reminders: UpcomingReminder[];
  addPerson: (person: Omit<Person, 'id'>) => Person;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  toggleGiftSent: (personId: string, forcedState?: boolean) => void;
  addGift: (gift: Omit<GiftItem, 'id' | 'createdAt'>) => GiftItem;
  updateGift: (id: string, updates: Partial<GiftItem>) => void;
  deleteGift: (id: string) => void;
  logCraftTime: (giftId: string, additionalHours: number) => void;
  toggleSupplyPurchased: (giftId: string, supplyId: string) => void;
  toggleStepDone: (giftId: string, stepId: string) => void;
  resetToSampleData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY_PEOPLE = 'giftwise_people_v1';
const STORAGE_KEY_GIFTS = 'giftwise_gifts_v1';
const STORAGE_KEY_HOLIDAYS = 'giftwise_holidays_v1';

const GiftContext = createContext<GiftContextType | null>(null);

const COLOR_TO_PASTEL: Record<string, string> = {
  '#f43f5e': '#fbcfe8',
  '#ec4899': '#fecdd3',
  '#8b5cf6': '#ddd6fe',
  '#3b82f6': '#bae6fd',
  '#0ea5e9': '#bae6fd',
  '#10b981': '#bbf7d0',
  '#f59e0b': '#fef08a',
  '#78716c': '#e7e5e4',
};

const normalizePersonColor = (p: Person): Person => {
  if (p.avatarColor && COLOR_TO_PASTEL[p.avatarColor.toLowerCase()]) {
    return { ...p, avatarColor: COLOR_TO_PASTEL[p.avatarColor.toLowerCase()] };
  }
  return p;
};

export const GiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PEOPLE);
      if (stored) {
        const parsed: Person[] = JSON.parse(stored);
        return parsed.map(normalizePersonColor);
      }
    } catch (e) {
      console.error('Failed to parse stored people:', e);
    }
    return INITIAL_PEOPLE;
  });

  const [gifts, setGifts] = useState<GiftItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GIFTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored gifts:', e);
    }
    return INITIAL_GIFTS;
  });

  const [holidays, setHolidays] = useState<HolidayDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HOLIDAYS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored holidays:', e);
    }
    return DEFAULT_HOLIDAYS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
    } catch (e) {
      console.error('Failed to save people:', e);
    }
  }, [people]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GIFTS, JSON.stringify(gifts));
    } catch (e) {
      console.error('Failed to save gifts:', e);
    }
  }, [gifts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HOLIDAYS, JSON.stringify(holidays));
    } catch (e) {
      console.error('Failed to save holidays:', e);
    }
  }, [holidays]);

  // Dynamic Reminders calculation
  const reminders = computeUpcomingReminders(people, gifts, holidays);

  // People operations
  const addPerson = (personData: Omit<Person, 'id'>): Person => {
    const newPerson: Person = {
      ...personData,
      id: `person-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setPeople((prev) => [...prev, newPerson]);
    return newPerson;
  };

  const updatePerson = (id: string, updates: Partial<Person>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    // Reassign gifts from this person to unassigned idea pool
    setGifts((prev) =>
      prev.map((g) => (g.recipientId === id ? { ...g, recipientId: 'unassigned' } : g))
    );
  };

  const toggleGiftSent = (personId: string, forcedState?: boolean) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p;
        const currentYear = new Date().getFullYear();
        const nextState = forcedState !== undefined ? forcedState : !p.giftSent;
        return {
          ...p,
          giftSent: nextState,
          lastGiftSentYear: nextState ? currentYear : undefined,
          giftSentDate: nextState ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  // Gift operations
  const addGift = (giftData: Omit<GiftItem, 'id' | 'createdAt'>): GiftItem => {
    const newGift: GiftItem = {
      ...giftData,
      id: `gift-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setGifts((prev) => [newGift, ...prev]);
    return newGift;
  };

  const updateGift = (id: string, updates: Partial<GiftItem>) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGift = (id: string) => {
    setGifts((prev) => prev.filter((g) => g.id !== id));
  };

  const logCraftTime = (giftId: string, additionalHours: number) => {
    setGifts((prev) =>
      prev.map((g) => {
        if (g.id !== giftId) return g;
        const currentSpent = g.craftingHoursSpent || 0;
        const updatedSpent = Math.max(0, Math.round((currentSpent + additionalHours) * 10) / 10);
        const est = g.craftingHoursEstimated || 0;

        let status = g.status;
        if (updatedSpent > 0 && status === 'planning') {
          status = 'in_progress';
        }
        if (est > 0 && updatedSpent >= est && status === 'in_progress') {
          status = 'completed';
        }

        return {
          ...g,
          craftingHoursSpent: updatedSpent,
          status,
        };
      })
    );
  };

  const toggleSupplyPurchased = (giftId: string, supplyId: string) => {
    setGifts((prev) =>
      prev.map((g) => {
        if (g.id !== giftId || !g.craftSupplies) return g;
        const updatedSupplies = g.craftSupplies.map((s) =>
          s.id === supplyId ? { ...s, purchased: !s.purchased } : s
        );
        // If all supplies purchased and was planning, set to materials_ready
        const allBought = updatedSupplies.every((s) => s.purchased);
        let status = g.status;
        if (allBought && status === 'planning') {
          status = 'materials_ready';
        }
        return {
          ...g,
          craftSupplies: updatedSupplies,
          status,
        };
      })
    );
  };

  const toggleStepDone = (giftId: string, stepId: string) => {
    setGifts((prev) =>
      prev.map((g) => {
        if (g.id !== giftId || !g.craftSteps) return g;
        const updatedSteps = g.craftSteps.map((st) =>
          st.id === stepId ? { ...st, done: !st.done } : st
        );
        const allDone = updatedSteps.every((st) => st.done);
        let status = g.status;
        if (allDone && (status === 'in_progress' || status === 'materials_ready' || status === 'planning')) {
          status = 'completed';
        }
        return {
          ...g,
          craftSteps: updatedSteps,
          status,
        };
      })
    );
  };

  const resetToSampleData = () => {
    setPeople(INITIAL_PEOPLE);
    setGifts(INITIAL_GIFTS);
    setHolidays(DEFAULT_HOLIDAYS);
    localStorage.removeItem(STORAGE_KEY_PEOPLE);
    localStorage.removeItem(STORAGE_KEY_GIFTS);
    localStorage.removeItem(STORAGE_KEY_HOLIDAYS);
  };

  const exportDataJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      people,
      gifts,
      holidays,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gift_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.people) && Array.isArray(parsed.gifts)) {
        setPeople(parsed.people);
        setGifts(parsed.gifts);
        if (Array.isArray(parsed.holidays)) {
          setHolidays(parsed.holidays);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <GiftContext.Provider
      value={{
        people,
        gifts,
        holidays,
        reminders,
        addPerson,
        updatePerson,
        deletePerson,
        toggleGiftSent,
        addGift,
        updateGift,
        deleteGift,
        logCraftTime,
        toggleSupplyPurchased,
        toggleStepDone,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </GiftContext.Provider>
  );
};

export const useGifts = () => {
  const context = useContext(GiftContext);
  if (!context) {
    throw new Error('useGifts must be used within a GiftProvider');
  }
  return context;
};
