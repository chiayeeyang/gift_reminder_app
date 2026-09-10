import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { formatCurrency } from '../utils/giftHelpers';
import {
  DollarSign,
  Clock,
  PieChart,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Hammer,
} from 'lucide-react';

interface BudgetAndTimeTabProps {
  onSelectGift: (giftId: string) => void;
  onOpenNewGift: () => void;
}

export const BudgetAndTimeTab: React.FC<BudgetAndTimeTabProps> = ({
  onSelectGift,
  onOpenNewGift,
}) => {
  const { gifts, people, logCraftTime } = useGifts();
  const [activeYear, setActiveYear] = useState(2026);

  const activeGifts = gifts.filter((g) => !g.archived && g.targetYear === activeYear);

  // Financial calculations
  const totalEstimatedCost = activeGifts.reduce((sum, g) => sum + (g.estimatedPrice || 0), 0);
  const totalActualCost = activeGifts.reduce(
    (sum, g) => sum + (g.actualPrice !== undefined ? g.actualPrice : g.estimatedPrice || 0),
    0
  );

  const boughtSpend = activeGifts
    .filter((g) => g.type === 'bought')
    .reduce((sum, g) => sum + (g.actualPrice !== undefined ? g.actualPrice : g.estimatedPrice || 0), 0);

  const craftSuppliesSpend = activeGifts
    .filter((g) => g.type === 'handmade')
    .reduce((sum, g) => {
      // If actualPrice is set use it, else sum supplies or estimated
      if (g.actualPrice !== undefined) return sum + g.actualPrice;
      if (g.craftSupplies && g.craftSupplies.length > 0) {
        return sum + g.craftSupplies.reduce((sSum, s) => sSum + s.estimatedCost, 0);
      }
      return sum + (g.estimatedPrice || 0);
    }, 0);

  const totalTargetBudget = people.reduce((sum, p) => sum + (p.annualBudget || 0), 0);

  // Crafting hours calculations
  const handmadeGifts = activeGifts.filter((g) => g.type === 'handmade');
  const totalEstimatedCraftHours = handmadeGifts.reduce((sum, g) => sum + (g.craftingHoursEstimated || 0), 0);
  const totalLoggedCraftHours = handmadeGifts.reduce((sum, g) => sum + (g.craftingHoursSpent || 0), 0);
  const totalCraftHoursRemaining = Math.max(0, totalEstimatedCraftHours - totalLoggedCraftHours);
  const overallCraftProgress =
    totalEstimatedCraftHours > 0
      ? Math.min(100, Math.round((totalLoggedCraftHours / totalEstimatedCraftHours) * 100))
      : 0;

  // Occasion breakdown
  const occasionTotals: Record<string, { count: number; spend: number }> = {};
  activeGifts.forEach((g) => {
    const occ = g.customOccasionName || g.occasion;
    if (!occasionTotals[occ]) occasionTotals[occ] = { count: 0, spend: 0 };
    occasionTotals[occ].count += 1;
    occasionTotals[occ].spend += g.actualPrice ?? g.estimatedPrice ?? 0;
  });

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Budget & Crafting Time Command Hub</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor overall gift expenditures and ensure DIY handmade crafts are on schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">Plan Year:</span>
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-800"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026 (Current)</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Spend
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-2">
            {formatCurrency(totalActualCost)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Across {activeGifts.length} planned gifts in {activeYear}
          </p>
        </div>

        {/* Target Budget Cap */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Annual Budget Goal
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-2">
            {formatCurrency(totalTargetBudget)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              Remaining:{' '}
              <strong className={totalTargetBudget - totalActualCost < 0 ? 'text-red-600' : 'text-emerald-700'}>
                {formatCurrency(Math.max(0, totalTargetBudget - totalActualCost))}
              </strong>
            </span>
            <span className="font-semibold text-stone-700">
              {totalTargetBudget > 0 ? Math.round((totalActualCost / totalTargetBudget) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* DIY Craft Hours Done */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Craft Hours Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-950 mt-2">
            {totalLoggedCraftHours} hrs
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Out of {totalEstimatedCraftHours} hrs estimated ({overallCraftProgress}% finished)
          </p>
        </div>

        {/* Craft Hours Remaining */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Hours Remaining
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-950 mt-2">
            {totalCraftHoursRemaining} hrs
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Across {handmadeGifts.filter((g) => g.status !== 'completed' && g.status !== 'wrapped').length} active crafts
          </p>
        </div>
      </div>

      {/* Detailed Side-by-Side: Budget Breakdown vs Crafting Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Breakdown */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-stone-700" />
            Financial Breakdown: Bought vs Handmade
          </h3>

          {/* Dual Bar: Bought vs Craft Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-900">
                <Tag className="w-3.5 h-3.5 text-amber-600" /> Bought Gifts: {formatCurrency(boughtSpend)}
              </span>
              <span className="flex items-center gap-1.5 text-rose-900">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" /> DIY Materials: {formatCurrency(craftSuppliesSpend)}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden flex">
              <div
                className="bg-amber-500 transition-all duration-500"
                style={{
                  width: `${totalActualCost > 0 ? (boughtSpend / totalActualCost) * 100 : 50}%`,
                }}
                title={`Bought: ${formatCurrency(boughtSpend)}`}
              />
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{
                  width: `${totalActualCost > 0 ? (craftSuppliesSpend / totalActualCost) * 100 : 50}%`,
                }}
                title={`Craft Materials: ${formatCurrency(craftSuppliesSpend)}`}
              />
            </div>

            <p className="text-xs text-stone-500 italic">
              💡 Handmade gifts accounted for {Math.round(totalEstimatedCraftHours)} hours of love while keeping materials at just {formatCurrency(craftSuppliesSpend)}.
            </p>
          </div>

          {/* Per Person Budget Table */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Per-Person Budget Tracking
            </h4>
            <div className="space-y-3">
              {people.map((person) => {
                const personGifts = activeGifts.filter((g) => g.recipientId === person.id);
                const spent = personGifts.reduce(
                  (sum, g) => sum + (g.actualPrice ?? g.estimatedPrice ?? 0),
                  0
                );
                const target = person.annualBudget || 0;
                const isOver = target > 0 && spent > target;
                const pct = target > 0 ? Math.min(100, Math.round((spent / target) * 100)) : 0;

                return (
                  <div key={person.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">
                        {person.name}{' '}
                        <span className="text-stone-400 font-normal">({person.relationship})</span>
                      </span>
                      <span className="font-medium text-stone-700">
                        {formatCurrency(spent)}
                        {target > 0 && (
                          <span className="text-stone-400"> / {formatCurrency(target)}</span>
                        )}
                        {isOver && (
                          <span className="ml-1 text-red-600 font-bold">
                            (Over by {formatCurrency(spent - target)}!)
                          </span>
                        )}
                      </span>
                    </div>

                    {target > 0 && (
                      <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Occasion Distribution */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Spending by Occasion
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(occasionTotals).map(([occ, data]) => (
                <div
                  key={occ}
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                >
                  <div className="font-bold text-stone-800 capitalize">{occ}</div>
                  <div className="text-stone-500 mt-0.5">
                    {data.count} gifts • <strong>{formatCurrency(data.spend)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: DIY Crafting Time Workload & Active Crafts */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              Handmade DIY Workload & Time Schedule
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              {handmadeGifts.length} Crafts
            </span>
          </div>

          {/* Progress bar of hours */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-950">Overall Crafting Completion</span>
              <span className="font-bold text-rose-900">{overallCraftProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-rose-100 overflow-hidden">
              <div
                className="h-full bg-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${overallCraftProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-600">
              <span>{totalLoggedCraftHours} hours finished</span>
              <span>{totalCraftHoursRemaining} hours left to wrap</span>
            </div>
          </div>

          {/* Active Crafting Projects List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Active Handmade Gift Projects
            </h4>

            {handmadeGifts.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No handmade gifts scheduled for {activeYear}.</p>
            ) : (
              handmadeGifts.map((gift) => {
                const recipient = people.find((p) => p.id === gift.recipientId);
                const spent = gift.craftingHoursSpent || 0;
                const est = gift.craftingHoursEstimated || 0;
                const pct = est > 0 ? Math.min(100, Math.round((spent / est) * 100)) : 0;
                const isFinished = gift.status === 'completed' || gift.status === 'wrapped' || gift.status === 'given';

                return (
                  <div
                    key={gift.id}
                    className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div
                          onClick={() => onSelectGift(gift.id)}
                          className="font-bold text-stone-900 text-xs hover:underline cursor-pointer"
                        >
                          {gift.title}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Recipient:{' '}
                          <strong className="text-stone-700">{recipient ? recipient.name : 'Idea Pool'}</strong> •{' '}
                          Difficulty: <strong>{gift.craftDifficulty || 'Medium'}</strong>
                          {gift.craftDeadline && ` • Due: ${gift.craftDeadline}`}
                        </div>
                      </div>

                      {isFinished ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
                          {Math.max(0, est - spent)}h Left
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Time Logger Buttons */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-stone-500 text-[11px]">
                        <strong>{spent}</strong> of <strong>{est}</strong> hrs ({pct}%)
                      </span>

                      {!isFinished && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => logCraftTime(gift.id, 0.5)}
                            className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-rose-400 hover:text-rose-700 text-stone-700 text-[11px] font-semibold transition-colors"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => logCraftTime(gift.id, 1)}
                            className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-rose-400 hover:text-rose-700 text-stone-700 text-[11px] font-semibold transition-colors"
                          >
                            +1h
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
