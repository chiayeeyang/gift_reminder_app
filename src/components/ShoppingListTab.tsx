import React, { useState } from 'react';
import { useGifts } from '../context/GiftContext';
import { formatCurrency } from '../utils/giftHelpers';
import {
  ShoppingCart,
  Printer,
  Copy,
  Check,
  Tag,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const ShoppingListTab: React.FC = () => {
  const { gifts, people, updateGift, toggleSupplyPurchased } = useGifts();
  const [copied, setCopied] = useState(false);

  // 1. Bought gifts that still need to be purchased
  const itemsToBuy = gifts.filter(
    (g) =>
      !g.archived &&
      g.type === 'bought' &&
      g.status !== 'purchased' &&
      g.status !== 'shipped' &&
      g.status !== 'wrapped' &&
      g.status !== 'given'
  );

  // 2. Craft supplies needed across handmade gifts
  const suppliesNeeded: Array<{
    giftId: string;
    giftTitle: string;
    supplyId: string;
    supplyName: string;
    cost: number;
    recipientName: string;
  }> = [];

  gifts
    .filter((g) => !g.archived && g.type === 'handmade' && g.status !== 'wrapped' && g.status !== 'given')
    .forEach((g) => {
      const recipient = people.find((p) => p.id === g.recipientId);
      g.craftSupplies?.forEach((sup) => {
        if (!sup.purchased) {
          suppliesNeeded.push({
            giftId: g.id,
            giftTitle: g.title,
            supplyId: sup.id,
            supplyName: sup.name,
            cost: sup.estimatedCost,
            recipientName: recipient ? recipient.name : 'Idea Pool',
          });
        }
      });
    });

  const totalProcurementCost =
    itemsToBuy.reduce((sum, g) => sum + (g.estimatedPrice || 0), 0) +
    suppliesNeeded.reduce((sum, s) => sum + s.cost, 0);

  const handleCopyText = () => {
    let text = `🎁 GIFT PROCUREMENT & SHOPPING CHECKLIST\nTotal Estimated: ${formatCurrency(totalProcurementCost)}\n\n`;

    if (itemsToBuy.length > 0) {
      text += `🛒 BOUGHT GIFTS TO PURCHASE (${itemsToBuy.length}):\n`;
      itemsToBuy.forEach((g) => {
        const r = people.find((p) => p.id === g.recipientId);
        text += `- [ ] ${g.title} (For: ${r ? r.name : 'Unassigned'}) - ~${formatCurrency(g.estimatedPrice)}${
          g.storeOrUrl ? ` [${g.storeOrUrl}]` : ''
        }\n`;
      });
      text += '\n';
    }

    if (suppliesNeeded.length > 0) {
      text += `🧶 DIY CRAFT MATERIALS NEEDED (${suppliesNeeded.length}):\n`;
      suppliesNeeded.forEach((s) => {
        text += `- [ ] ${s.supplyName} (~$${s.cost}) for "${s.giftTitle}" (${s.recipientName})\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Print toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-stone-700" />
            Shopping & Craft Materials Checklist
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Everything you need to buy or source across both retail gifts and DIY projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied List!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Checklist
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Total Estimated Procurement Budget
          </span>
          <div className="text-2xl font-extrabold text-amber-950 mt-0.5">
            {formatCurrency(totalProcurementCost)}
          </div>
        </div>
        <div className="text-right text-xs text-amber-900 font-medium">
          <div>{itemsToBuy.length} Gifts to purchase</div>
          <div>{suppliesNeeded.length} Craft materials to gather</div>
        </div>
      </div>

      {/* Section 1: Retail / Bought Gifts */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            Retail Gifts to Purchase ({itemsToBuy.length})
          </h3>
          <span className="text-xs text-stone-500 font-medium">Click checkbox once purchased</span>
        </div>

        {itemsToBuy.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 italic">
            🎉 All scheduled retail gifts have already been purchased!
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {itemsToBuy.map((gift) => {
              const recipient = people.find((p) => p.id === gift.recipientId);

              return (
                <div
                  key={gift.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => updateGift(gift.id, { status: 'purchased' })}
                      className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{gift.title}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        For:{' '}
                        <strong className="text-stone-700">
                          {recipient ? recipient.name : 'Unassigned'}
                        </strong>{' '}
                        • Occasion: <span className="capitalize">{gift.customOccasionName || gift.occasion}</span>
                        {gift.storeOrUrl && (
                          <span className="ml-2">
                            • Store: <span className="text-blue-600 underline">{gift.storeOrUrl}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-stone-900 text-sm">
                      {formatCurrency(gift.estimatedPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Crafting Materials & Supplies */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            Handmade Craft Supplies to Buy ({suppliesNeeded.length})
          </h3>
          <span className="text-xs text-stone-500 font-medium">Click checkbox once bought</span>
        </div>

        {suppliesNeeded.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 italic">
            🧶 All required craft materials and supplies are ready!
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {suppliesNeeded.map((sup) => (
              <div
                key={sup.supplyId}
                className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50/70 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleSupplyPurchased(sup.giftId, sup.supplyId)}
                    className="w-4 h-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-stone-900 text-sm">{sup.supplyName}</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      For Craft:{' '}
                      <strong className="text-stone-700">{sup.giftTitle}</strong> ({sup.recipientName})
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-stone-900 text-sm">${sup.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
