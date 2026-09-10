import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { formatCurrency } from '../utils/giftHelpers';
import {
  DollarSign,
  Clock,
  Sparkles,
  TrendingUp,
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
    <div className="space-y-6 font-pixel">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 mc-panel border-2 border-black">
        <div>
          <h2 className="text-sm font-bold text-white mc-text-shadow font-mc">
            EMERALD BUDGET & CRAFTING XP HUB
          </h2>
          <p className="text-xs text-[#a3a4ab] mt-0.5 font-pixel">
            Track realm currency expenditures and ensure workbench crafts finish before event ticks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a3a4ab] font-pixel">Game Year:</span>
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(Number(e.target.value))}
            className="mc-input px-3 py-1 text-xs font-pixel"
          >
            <option value={2025}>Year 2025</option>
            <option value={2026}>Year 2026 (Current)</option>
            <option value={2027}>Year 2027</option>
          </select>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="p-4 mc-panel border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="font-mc text-[9px] text-[#ffea75] tracking-wider block mc-text-shadow">
              TOTAL EMERALDS SPENT
            </span>
            <div className="w-7 h-7 mc-slot flex items-center justify-center text-[#ffea75]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white mt-1.5 mc-text-shadow font-pixel">
            {formatCurrency(totalActualCost)}
          </div>
          <p className="text-[11px] text-[#a3a4ab] mt-1">
            Across {activeGifts.length} items in {activeYear}
          </p>
        </div>

        {/* Target Budget Cap */}
        <div className="p-4 mc-panel border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="font-mc text-[9px] text-[#80ff20] tracking-wider block mc-text-shadow">
              REALM BUDGET GOAL
            </span>
            <div className="w-7 h-7 mc-slot flex items-center justify-center text-[#55ff55]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#55ff55] mt-1.5 mc-text-shadow font-pixel">
            {formatCurrency(totalTargetBudget)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-[#a3a4ab]">
              Left:{' '}
              <strong className={totalTargetBudget - totalActualCost < 0 ? 'text-[#ff5555]' : 'text-[#55ff55]'}>
                {formatCurrency(Math.max(0, totalTargetBudget - totalActualCost))}
              </strong>
            </span>
            <span className="text-white">
              {totalTargetBudget > 0 ? Math.round((totalActualCost / totalTargetBudget) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* DIY Craft Hours Done */}
        <div className="p-4 mc-panel border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="font-mc text-[9px] text-[#ff8080] tracking-wider block mc-text-shadow">
              CRAFT XP LOGGED
            </span>
            <div className="w-7 h-7 mc-slot flex items-center justify-center text-[#ff8080]">
              <Hammer className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-white mt-1.5 mc-text-shadow font-pixel">
            {totalLoggedCraftHours} hrs
          </div>
          <p className="text-[11px] text-[#a3a4ab] mt-1">
            Out of {totalEstimatedCraftHours} hrs estimated ({overallCraftProgress}%)
          </p>
        </div>

        {/* Craft Hours Remaining */}
        <div className="p-4 mc-panel border-2 border-black">
          <div className="flex items-center justify-between">
            <span className="font-mc text-[9px] text-[#55ffff] tracking-wider block mc-text-shadow">
              WORKBENCH TIME LEFT
            </span>
            <div className="w-7 h-7 mc-slot flex items-center justify-center text-[#55ffff]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#55ffff] mt-1.5 mc-text-shadow font-pixel">
            {totalCraftHoursRemaining} hrs
          </div>
          <p className="text-[11px] text-[#a3a4ab] mt-1">
            Across {handmadeGifts.filter((g) => g.status !== 'completed' && g.status !== 'wrapped').length} active projects
          </p>
        </div>
      </div>

      {/* Detailed Side-by-Side: Budget Breakdown vs Crafting Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial Breakdown */}
        <div className="p-4 mc-panel border-2 border-black space-y-4">
          <h3 className="font-mc text-[10px] text-[#80ff20] flex items-center gap-1.5 mc-text-shadow">
            <DollarSign className="w-3.5 h-3.5 text-[#55ff55]" />
            RESOURCE BREAKDOWN: TRADE VS CRAFT MATERIALS
          </h3>

          {/* Dual Bar: Bought vs Craft Materials */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-pixel">
              <span className="flex items-center gap-1.5 text-[#ffea75]">
                <Tag className="w-3.5 h-3.5 text-[#ffea75]" /> Villager Trades: {formatCurrency(boughtSpend)}
              </span>
              <span className="flex items-center gap-1.5 text-[#55ff55]">
                <Sparkles className="w-3.5 h-3.5 text-[#55ff55]" /> DIY Recipe Items: {formatCurrency(craftSuppliesSpend)}
              </span>
            </div>

            {/* Split Minecraft bar */}
            <div className="w-full h-3 bg-[#0a0a0c] border border-black flex p-0.5">
              <div
                className="bg-[#d97706] h-full shadow-[inset_0_1px_0_#ffffff]"
                style={{
                  width: `${totalActualCost > 0 ? (boughtSpend / totalActualCost) * 100 : 50}%`,
                }}
                title={`Trades: ${formatCurrency(boughtSpend)}`}
              />
              <div
                className="bg-[#2b7730] h-full shadow-[inset_0_1px_0_#ffffff]"
                style={{
                  width: `${totalActualCost > 0 ? (craftSuppliesSpend / totalActualCost) * 100 : 50}%`,
                }}
                title={`Craft Materials: ${formatCurrency(craftSuppliesSpend)}`}
              />
            </div>

            <p className="text-xs text-[#a3a4ab] italic">
              💡 Workbench crafting accounted for {Math.round(totalEstimatedCraftHours)} hours of love while keeping materials at just {formatCurrency(craftSuppliesSpend)}.
            </p>
          </div>

          {/* Per Person Budget Table */}
          <div className="pt-3 border-t border-[#3c3d44]">
            <h4 className="font-mc text-[9px] text-[#ffea75] mb-2.5 mc-text-shadow">
              PLAYER EMERALD CAPS
            </h4>
            <div className="space-y-2.5">
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
                      <span className="text-white">
                        {person.name}{' '}
                        <span className="text-[#888888]">({person.relationship})</span>
                      </span>
                      <span className="text-[#a3a4ab]">
                        <strong className="text-[#55ff55]">{formatCurrency(spent)}</strong>
                        {target > 0 && (
                          <span className="text-[#888888]"> / {formatCurrency(target)}</span>
                        )}
                        {isOver && (
                          <span className="ml-1 text-[#ff5555] font-bold">
                            (Over {formatCurrency(spent - target)}!)
                          </span>
                        )}
                      </span>
                    </div>

                    {target > 0 && (
                      <div className="w-full h-2 bg-[#0a0a0c] border border-black p-0.5">
                        <div
                          className={`h-full ${
                            isOver ? 'bg-[#b71c1c]' : 'bg-[#2b7730]'
                          } shadow-[inset_0_1px_0_#ffffff]`}
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
          <div className="pt-3 border-t border-[#3c3d44]">
            <h4 className="font-mc text-[9px] text-[#55ffff] mb-2 mc-text-shadow">
              SPENDING BY QUEST EVENT
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(occasionTotals).map(([occ, data]) => (
                <div
                  key={occ}
                  className="px-2.5 py-1.5 mc-panel-dark border border-black text-xs"
                >
                  <div className="font-bold text-white capitalize">{occ}</div>
                  <div className="text-[#a3a4ab] mt-0.5 text-[11px]">
                    {data.count} items • <strong className="text-[#55ff55]">{formatCurrency(data.spend)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: DIY Crafting Time Workload & Active Crafts */}
        <div className="p-4 mc-panel border-2 border-black space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mc text-[10px] text-[#ff8080] flex items-center gap-1.5 mc-text-shadow">
              <Clock className="w-3.5 h-3.5 text-[#ff5555]" />
              HANDMADE RECIPES & TIME SCHEDULE
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-[#212026] text-[#ff8080] border border-black font-mc">
              {handmadeGifts.length} CRAFTS
            </span>
          </div>

          {/* Minecraft XP progress bar of hours */}
          <div className="p-3 mc-panel-dark border border-black space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-pixel">Overall Recipe Progress</span>
              <span className="text-[#55ff55] font-mc text-[10px] mc-text-shadow">{overallCraftProgress}%</span>
            </div>
            <div className="w-full h-3 bg-[#0a0a0c] border border-black p-0.5">
              <div
                className="h-full bg-[#55ff55] shadow-[inset_0_1px_0_#ffffff,inset_0_-1px_0_#2b7730]"
                style={{ width: `${overallCraftProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#a3a4ab]">
              <span>{totalLoggedCraftHours} hrs crafted</span>
              <span>{totalCraftHoursRemaining} hrs left to wrap</span>
            </div>
          </div>

          {/* Active Crafting Projects List */}
          <div className="space-y-2.5">
            <h4 className="font-mc text-[9px] text-[#ffea75] mc-text-shadow">
              ACTIVE WORKBENCH PROJECTS
            </h4>

            {handmadeGifts.length === 0 ? (
              <p className="text-xs text-[#777777] italic">No handmade items scheduled for {activeYear}.</p>
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
                    className="p-3 mc-panel-dark border border-black space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div
                          onClick={() => onSelectGift(gift.id)}
                          className="font-bold text-white text-xs hover:text-[#55ffff] cursor-pointer"
                        >
                          {gift.title}
                        </div>
                        <div className="text-[11px] text-[#a3a4ab] font-pixel">
                          Target:{' '}
                          <strong className="text-[#55ffff]">{recipient ? recipient.name : 'Idea Pool'}</strong> •{' '}
                          Difficulty: <strong className="text-white">{gift.craftDifficulty || 'Medium'}</strong>
                          {gift.craftDeadline && ` • Due: ${gift.craftDeadline}`}
                        </div>
                      </div>

                      {isFinished ? (
                        <span className="bg-[#133115] text-[#55ff55] border border-black px-1.5 py-0.2 text-[10px] flex items-center gap-1 font-mc mc-text-shadow">
                          <CheckCircle2 className="w-3 h-3 text-[#55ff55]" /> READY
                        </span>
                      ) : (
                        <span className="bg-[#4a1212] text-[#ff8080] border border-black px-1.5 py-0.2 text-[10px] font-pixel">
                          {Math.max(0, est - spent)}h Left
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#0a0a0c] border border-black p-0.5">
                      <div
                        className="h-full bg-[#55ff55] shadow-[inset_0_1px_0_#ffffff]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Time Logger Buttons */}
                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <span className="text-[#a3a4ab] text-[11px]">
                        <strong className="text-white">{spent}</strong> of <strong className="text-white">{est}</strong> hrs ({pct}%)
                      </span>

                      {!isFinished && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => logCraftTime(gift.id, 0.5)}
                            className="mc-button px-2 py-0.5 text-[11px]"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => logCraftTime(gift.id, 1)}
                            className="mc-button px-2 py-0.5 text-[11px]"
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
