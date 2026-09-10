export type Relationship = 'partner' | 'family' | 'friend' | 'colleague' | 'other';

export type OccasionType =
  | 'birthday'
  | 'christmas'
  | 'anniversary'
  | 'valentines'
  | 'mothers_day'
  | 'fathers_day'
  | 'halloween'
  | 'just_because'
  | 'custom';

export type GiftType = 'bought' | 'handmade';

export type GiftStatus =
  | 'idea'
  | 'researching'
  | 'planning'
  | 'materials_ready'
  | 'in_progress'
  | 'purchased'
  | 'shipped'
  | 'completed'
  | 'wrapped'
  | 'given';

export type Priority = 'low' | 'medium' | 'high';

export interface CraftSupply {
  id: string;
  name: string;
  estimatedCost: number;
  purchased: boolean;
}

export interface CraftStep {
  id: string;
  text: string;
  done: boolean;
  hours?: number;
}

export interface GiftItem {
  id: string;
  title: string;
  recipientId: string; // 'unassigned' or personId
  occasion: OccasionType;
  customOccasionName?: string;
  targetYear: number;
  type: GiftType;
  status: GiftStatus;
  priority: Priority;

  // Bought Details
  estimatedPrice: number;
  actualPrice?: number;
  storeOrUrl?: string;

  // Handmade Details
  craftingHoursEstimated?: number;
  craftingHoursSpent?: number;
  craftDifficulty?: 'Easy' | 'Medium' | 'Advanced';
  craftSupplies?: CraftSupply[];
  craftSteps?: CraftStep[];
  craftDeadline?: string;

  notes?: string;
  createdAt: string;
  archived?: boolean;
}

export interface CustomDateEvent {
  id: string;
  name: string;
  month: number; // 1-12
  day: number; // 1-31
  year?: number; // if anniversary year known (e.g. 2021)
}

export interface CuteFaceConfig {
  expression?: 'happy' | 'wink' | 'sparkle' | 'warm' | 'cool' | 'gentle' | 'grin' | 'sleepy' | 'cheeky';
  hairStyle?: 'short' | 'curly' | 'wavy' | 'bun' | 'beanie' | 'straight' | 'slick' | 'bob';
  hairColor?: string;
  glasses?: boolean;
  freckles?: boolean;
  blush?: boolean;
  accessory?: 'none' | 'beanie' | 'bow' | 'flower' | 'headphones' | 'cap';
}

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  birthMonth: number; // 1-12
  birthDay: number; // 1-31
  birthYear?: number; // optional (e.g. 1994)
  avatarColor: string;
  cuteFace?: CuteFaceConfig;
  interests: string[];
  sizes?: {
    clothing?: string;
    shoe?: string;
    ring?: string;
    notes?: string;
  };
  preferences?: {
    likes?: string;
    dislikes?: string;
    allergies?: string;
    favoriteColors?: string;
  };
  customEvents?: CustomDateEvent[];
  annualBudget?: number;
  notes?: string;
}

export interface UpcomingReminder {
  id: string;
  title: string;
  type: 'birthday' | 'holiday' | 'custom';
  personId?: string;
  personName?: string;
  relationship?: Relationship;
  avatarColor?: string;
  eventDate: string; // YYYY-MM-DD for this occurrence
  daysRemaining: number;
  turningAge?: number;
  isMilestone?: boolean;
  assignedGifts: GiftItem[];
  totalPlannedCost: number;
  totalCraftHoursLeft: number;
  status: 'ready' | 'in_progress' | 'needs_gift';
  urgency: 'overdue' | 'today' | 'within_7_days' | 'within_30_days' | 'later';
}

export interface HolidayDefinition {
  id: string;
  name: string;
  month: number;
  day: number;
  defaultEnabled: boolean;
  iconName: string;
  description: string;
}

export interface AIGeneratedGiftIdea {
  title: string;
  type: GiftType;
  description: string;
  estimatedCost: number;
  craftingHours?: number;
  difficulty?: 'Easy' | 'Medium' | 'Advanced' | 'N/A';
  suppliesNeeded?: string[];
  whereToFindOrMake?: string;
  leadTimeAdvice?: string;
}
