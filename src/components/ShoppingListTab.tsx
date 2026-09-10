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
    <div className="space-y-4 font-pixel">
      {/* Header & Print toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 mc-panel border-2 border-black print:hidden">
        <div>
          <h2 className="text-sm font-bold text-white mc-text-shadow font-mc flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#ffea75]" />
            MERCHANT TRADE & INGREDIENTS MANIFEST
          </h2>
          <p className="text-xs text-[#a3a4ab] mt-0.5">
            Everything you need to trade with villagers or gather for DIY crafting recipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="mc-button px-3 py-1 text-xs flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#55ff55]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Manifest!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handlePrint}
            className="mc-button px-3.5 py-1 text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Manifest
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-3.5 mc-panel-dark border-2 border-black flex items-center justify-between">
        <div>
          <span className="font-mc text-[9px] text-[#ffea75] uppercase tracking-wider block mc-text-shadow">
            TOTAL PROCUREMENT EMERALDS NEEDED
          </span>
          <div className="text-xl font-bold text-[#55ff55] font-pixel mt-0.5">
            {formatCurrency(totalProcurementCost)}
          </div>
        </div>
        <div className="text-right text-xs text-[#a3a4ab]">
          <div>{itemsToBuy.length} Merchant Trades to acquire</div>
          <div>{suppliesNeeded.length} Recipe Ingredients to gather</div>
        </div>
      </div>

      {/* Section 1: Retail / Bought Gifts */}
      <div className="p-4 mc-panel border-2 border-black space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[#3c3d44] pb-2">
          <h3 className="font-mc text-[10px] text-white uppercase tracking-wider flex items-center gap-2 mc-text-shadow">
            <Tag className="w-3.5 h-3.5 text-[#ffea75]" />
            MERCHANT TRADES TO BUY ({itemsToBuy.length})
          </h3>
          <span className="text-[11px] text-[#a3a4ab]">Check box once acquired</span>
        </div>

        {itemsToBuy.length === 0 ? (
          <p className="text-xs text-[#a3a4ab] py-2">
            🎉 All scheduled merchant trades have already been acquired!
          </p>
        ) : (
          <div className="space-y-1.5">
            {itemsToBuy.map((gift) => {
              const recipient = people.find((p) => p.id === gift.recipientId);

              return (
                <div
                  key={gift.id}
                  className="p-2.5 mc-panel-dark border border-black flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => updateGift(gift.id, { status: 'purchased' })}
                      className="accent-[#2b7730] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-xs mc-text-shadow">{gift.title}</div>
                      <div className="text-[11px] text-[#a3a4ab] mt-0.5">
                        For:{' '}
                        <strong className="text-white">
                          {recipient ? recipient.name : 'Unassigned'}
                        </strong>{' '}
                        • Occasion: <span className="capitalize text-[#ffea75]">{gift.customOccasionName || gift.occasion}</span>
                        {gift.storeOrUrl && (
                          <span className="ml-2">
                            • Merchant: <span className="text-[#55ffff] underline">{gift.storeOrUrl}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-[#ffea75] text-xs">
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
      <div className="p-4 mc-panel border-2 border-black space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[#3c3d44] pb-2">
          <h3 className="font-mc text-[10px] text-white uppercase tracking-wider flex items-center gap-2 mc-text-shadow">
            <Sparkles className="w-3.5 h-3.5 text-[#55ff55]" />
            RECIPE INGREDIENTS TO MINE / GATHER ({suppliesNeeded.length})
          </h3>
          <span className="text-[11px] text-[#a3a4ab]">Check box once gathered</span>
        </div>

        {suppliesNeeded.length === 0 ? (
          <p className="text-xs text-[#a3a4ab] py-2">
            🧶 All required craft ingredients and supplies are ready in chest!
          </p>
        ) : (
          <div className="space-y-1.5">
            {suppliesNeeded.map((sup) => (
              <div
                key={sup.supplyId}
                className="p-2.5 mc-panel-dark border border-black flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleSupplyPurchased(sup.giftId, sup.supplyId)}
                    className="accent-[#2b7730] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-white text-xs mc-text-shadow">{sup.supplyName}</div>
                    <div className="text-[11px] text-[#a3a4ab] mt-0.5">
                      For Recipe:{' '}
                      <strong className="text-white">{sup.giftTitle}</strong> ({sup.recipientName})
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-[#55ff55] text-xs">${sup.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
