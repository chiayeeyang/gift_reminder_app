import { Person, GiftItem, UpcomingReminder, HolidayDefinition } from '../types';

export function calculateDaysUntil(targetMonth: number, targetDay: number, fromDate: Date = new Date()): { days: number; nextDate: Date; year: number } {
  const currentYear = fromDate.getFullYear();
  // Target date for this year (months are 0-indexed in JS Date)
  let candidate = new Date(currentYear, targetMonth - 1, targetDay, 0, 0, 0);

  // Normalize fromDate to midnight
  const normalizedFrom = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);

  let targetYear = currentYear;
  if (candidate.getTime() < normalizedFrom.getTime()) {
    // Already passed this year; look at next year
    targetYear = currentYear + 1;
    candidate = new Date(targetYear, targetMonth - 1, targetDay, 0, 0, 0);
  }

  const diffMs = candidate.getTime() - normalizedFrom.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return {
    days,
    nextDate: candidate,
    year: targetYear,
  };
}

export function isMilestoneAge(age: number): boolean {
  return [1, 16, 18, 21, 30, 40, 50, 60, 65, 70, 75, 80, 85, 90, 95, 100].includes(age);
}

export function getMilestoneBirthdayText(birthYear: number, targetYear: number): string | null {
  const age = targetYear - birthYear;
  if (isMilestoneAge(age)) {
    return `Turning ${age}! Milestone`;
  }
  return `Turning ${age}`;
}

export function computeUpcomingReminders(
  people: Person[],
  gifts: GiftItem[],
  holidays: HolidayDefinition[],
  referenceDate: Date = new Date()
): UpcomingReminder[] {
  const reminders: UpcomingReminder[] = [];

  // 1. Process People Birthdays
  people.forEach((person) => {
    const { days, nextDate, year } = calculateDaysUntil(person.birthMonth, person.birthDay, referenceDate);
    
    let turningAge: number | undefined;
    let isMilestone: boolean | undefined;

    if (person.birthYear) {
      turningAge = year - person.birthYear;
      isMilestone = isMilestoneAge(turningAge);
    }

    const assignedGifts = gifts.filter(
      (g) => !g.archived && g.recipientId === person.id && (g.occasion === 'birthday' || g.occasion === 'custom')
    );

    const totalPlannedCost = assignedGifts.reduce((sum, g) => sum + (g.actualPrice ?? g.estimatedPrice ?? 0), 0);
    const totalCraftHoursLeft = assignedGifts
      .filter((g) => g.type === 'handmade')
      .reduce((sum, g) => {
        const est = g.craftingHoursEstimated || 0;
        const spent = g.craftingHoursSpent || 0;
        return sum + Math.max(0, est - spent);
      }, 0);

    let status: 'ready' | 'in_progress' | 'needs_gift' = 'needs_gift';
    if (assignedGifts.length > 0) {
      const allDone = assignedGifts.every((g) =>
        ['purchased', 'shipped', 'completed', 'wrapped', 'given'].includes(g.status)
      );
      status = allDone ? 'ready' : 'in_progress';
    }

    let urgency: UpcomingReminder['urgency'] = 'later';
    if (days === 0) urgency = 'today';
    else if (days <= 7) urgency = 'within_7_days';
    else if (days <= 30) urgency = 'within_30_days';

    reminders.push({
      id: `reminder-bday-${person.id}`,
      title: `${person.name}'s Birthday`,
      type: 'birthday',
      personId: person.id,
      personName: person.name,
      relationship: person.relationship,
      avatarColor: person.avatarColor,
      eventDate: nextDate.toISOString().split('T')[0],
      daysRemaining: days,
      turningAge,
      isMilestone,
      assignedGifts,
      totalPlannedCost,
      totalCraftHoursLeft,
      status,
      urgency,
    });

    // 2. Custom Events for Person (e.g. Anniversaries)
    if (person.customEvents) {
      person.customEvents.forEach((ev) => {
        const evCalc = calculateDaysUntil(ev.month, ev.day, referenceDate);
        const evGifts = gifts.filter(
          (g) => !g.archived && g.recipientId === person.id && (g.customOccasionName === ev.name || g.occasion === 'anniversary')
        );

        const evCost = evGifts.reduce((sum, g) => sum + (g.actualPrice ?? g.estimatedPrice ?? 0), 0);
        const evCraftHours = evGifts
          .filter((g) => g.type === 'handmade')
          .reduce((sum, g) => sum + Math.max(0, (g.craftingHoursEstimated || 0) - (g.craftingHoursSpent || 0)), 0);

        let evStatus: 'ready' | 'in_progress' | 'needs_gift' = 'needs_gift';
        if (evGifts.length > 0) {
          const allDone = evGifts.every((g) => ['purchased', 'shipped', 'completed', 'wrapped', 'given'].includes(g.status));
          evStatus = allDone ? 'ready' : 'in_progress';
        }

        let evUrgency: UpcomingReminder['urgency'] = 'later';
        if (evCalc.days === 0) evUrgency = 'today';
        else if (evCalc.days <= 7) evUrgency = 'within_7_days';
        else if (evCalc.days <= 30) evUrgency = 'within_30_days';

        reminders.push({
          id: `reminder-custom-${ev.id}`,
          title: `${ev.name} (${person.name})`,
          type: 'custom',
          personId: person.id,
          personName: person.name,
          relationship: person.relationship,
          avatarColor: person.avatarColor,
          eventDate: evCalc.nextDate.toISOString().split('T')[0],
          daysRemaining: evCalc.days,
          assignedGifts: evGifts,
          totalPlannedCost: evCost,
          totalCraftHoursLeft: evCraftHours,
          status: evStatus,
          urgency: evUrgency,
        });
      });
    }
  });

  // 3. Process Holidays
  holidays.forEach((hol) => {
    const { days, nextDate } = calculateDaysUntil(hol.month, hol.day, referenceDate);
    // Holidays apply to all gifts tagged with this occasion
    let occasionKey: GiftItem['occasion'] = 'custom';
    if (hol.id === 'hol-xmas') occasionKey = 'christmas';
    if (hol.id === 'hol-val') occasionKey = 'valentines';
    if (hol.id === 'hol-mom') occasionKey = 'mothers_day';
    if (hol.id === 'hol-dad') occasionKey = 'fathers_day';
    if (hol.id === 'hol-hal') occasionKey = 'halloween';

    const holGifts = gifts.filter((g) => !g.archived && g.occasion === occasionKey);
    const totalPlannedCost = holGifts.reduce((sum, g) => sum + (g.actualPrice ?? g.estimatedPrice ?? 0), 0);
    const totalCraftHoursLeft = holGifts
      .filter((g) => g.type === 'handmade')
      .reduce((sum, g) => sum + Math.max(0, (g.craftingHoursEstimated || 0) - (g.craftingHoursSpent || 0)), 0);

    let status: 'ready' | 'in_progress' | 'needs_gift' = 'needs_gift';
    if (holGifts.length > 0) {
      const allDone = holGifts.every((g) => ['purchased', 'shipped', 'completed', 'wrapped', 'given'].includes(g.status));
      status = allDone ? 'ready' : 'in_progress';
    }

    let urgency: UpcomingReminder['urgency'] = 'later';
    if (days === 0) urgency = 'today';
    else if (days <= 7) urgency = 'within_7_days';
    else if (days <= 30) urgency = 'within_30_days';

    reminders.push({
      id: `reminder-hol-${hol.id}`,
      title: hol.name,
      type: 'holiday',
      eventDate: nextDate.toISOString().split('T')[0],
      daysRemaining: days,
      assignedGifts: holGifts,
      totalPlannedCost,
      totalCraftHoursLeft,
      status,
      urgency,
    });
  });

  // Sort chronologically (soonest first)
  return reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatRelativeDays(days: number): string {
  if (days === 0) return 'Today! 🎉';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days === 7) return 'In 1 week';
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `In ~${weeks} week${weeks > 1 ? 's' : ''} (${days}d)`;
  }
  const months = Math.round(days / 30);
  return `In ~${months} month${months > 1 ? 's' : ''} (${days}d)`;
}

export function getStatusBadge(status: GiftItem['status']) {
  switch (status) {
    case 'idea':
      return { label: 'Idea', bg: 'bg-stone-100 text-stone-700 border-stone-300' };
    case 'researching':
      return { label: 'Researching', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'planning':
      return { label: 'Planning DIY', bg: 'bg-amber-50 text-amber-800 border-amber-300' };
    case 'materials_ready':
      return { label: 'Supplies Ready', bg: 'bg-teal-50 text-teal-800 border-teal-300' };
    case 'in_progress':
      return { label: 'In Progress (Crafting)', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'purchased':
      return { label: 'Purchased', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'shipped':
      return { label: 'Shipped', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'completed':
      return { label: 'Finished Crafting', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
    case 'wrapped':
      return { label: 'Wrapped & Ready 🎁', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'given':
      return { label: 'Delivered', bg: 'bg-emerald-100 text-emerald-800 border-emerald-400' };
    default:
      return { label: status, bg: 'bg-stone-100 text-stone-700 border-stone-300' };
  }
}
