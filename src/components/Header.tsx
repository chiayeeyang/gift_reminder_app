import React, { useState, useRef } from 'react';
import { useGifts } from '../context/GiftContext';
import {
  Gift,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ShoppingCart,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Menu,
  X,
  Flame,
  MoreVertical,
  Smile,
} from 'lucide-react';

export type ActiveTab =
  | 'circles'
  | 'reminders'
  | 'gifts'
  | 'people'
  | 'budget_time'
  | 'ai_studio'
  | 'shopping_list';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewGiftModal: () => void;
  onOpenNewPersonModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewGiftModal,
  onOpenNewPersonModal,
}) => {
  const { reminders, gifts, resetToSampleData, exportDataJSON, importDataJSON } = useGifts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const urgentCount = reminders.filter((r) => r.daysRemaining <= 7).length;
  const activeCraftsCount = gifts.filter(
    (g) => !g.archived && g.type === 'handmade' && g.status !== 'completed' && g.status !== 'wrapped' && g.status !== 'given'
  ).length;

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Data imported successfully!');
        } else {
          alert('Failed to parse backup JSON. Please ensure it is a valid export.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navItems = [
    {
      id: 'circles' as ActiveTab,
      label: 'Birthday Circles',
      icon: Smile,
    },
    {
      id: 'reminders' as ActiveTab,
      label: 'Reminders & Events',
      icon: Calendar,
      badge: urgentCount > 0 ? `${urgentCount} urgent` : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'gifts' as ActiveTab,
      label: 'Gift Ideas Vault',
      icon: Gift,
      badge: `${gifts.length}`,
      badgeColor: 'bg-stone-200 text-stone-700',
    },
    {
      id: 'people' as ActiveTab,
      label: 'Loved Ones & Circles',
      icon: Users,
    },
    {
      id: 'budget_time' as ActiveTab,
      label: 'Budget & Time Hub',
      icon: Clock,
      badge: activeCraftsCount > 0 ? `${activeCraftsCount} DIY` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'ai_studio' as ActiveTab,
      label: 'AI Gift Studio',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'shopping_list' as ActiveTab,
      label: 'Shopping Checklist',
      icon: ShoppingCart,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fffefb]/95 backdrop-blur-md border-b-2 border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand & Action buttons */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('circles')}>
            <div className="w-10 h-10 rounded-xl bg-[#fed7aa] border-2 border-stone-800 text-stone-900 flex items-center justify-center shadow-[2px_2px_0px_#292524] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
              <Gift className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 text-base tracking-tight font-serif">
                  GiftWise
                </span>
                <span className="px-1.5 py-0.2 rounded-xs bg-[#fef08a] border border-stone-800 text-stone-900 text-[10px] font-bold font-sketch tracking-wider">
                  Sketchbook
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium -mt-0.5 font-sketch text-xs">
                Hand-Drawn Circles, Crafts & Birthday Reminders
              </p>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={onOpenNewGiftModal}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-[#fffefb] border-2 border-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#292524] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Add Gift Idea</span>
            </button>

            <button
              onClick={onOpenNewPersonModal}
              className="px-3.5 py-2 rounded-xl bg-[#fbcfe8] hover:bg-[#f9a8d4] text-stone-900 border-2 border-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#292524] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Users className="w-3.5 h-3.5 text-stone-800" />
              <span>Add Person</span>
            </button>

            {/* Overflow menu for export/import/reset */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 rounded-xl bg-[#fffefb] border-2 border-stone-800 text-stone-800 hover:bg-stone-100 shadow-[1.5px_1.5px_0px_#292524] transition-all"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#fffefb] rounded-xl shadow-[4px_4px_0px_#292524] border-2 border-stone-800 py-1.5 text-xs z-50">
                  <button
                    onClick={() => {
                      exportDataJSON();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-100 flex items-center gap-2 text-stone-800 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    Export Backup (JSON)
                  </button>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-100 flex items-center gap-2 text-stone-800 font-semibold"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    Import Backup (JSON)
                  </button>

                  <div className="my-1 border-t-2 border-dashed border-stone-200" />

                  <button
                    onClick={() => {
                      if (confirm('Reset to initial sample people & gift ideas?')) {
                        resetToSampleData();
                      }
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    Reset to Sample Data
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={onOpenNewGiftModal}
              className="p-2 rounded-xl bg-stone-900 text-amber-300 border-2 border-stone-900 shadow-[1.5px_1.5px_0px_#292524]"
              title="Add Gift"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-800 bg-[#fffefb] border-2 border-stone-800 rounded-xl shadow-[1.5px_1.5px_0px_#292524]"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Tabs Navigation */}
        <nav className="hidden sm:flex items-center gap-1 -mb-px overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 border-b-3 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-stone-900 text-stone-950'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? item.highlight
                        ? 'text-amber-600'
                        : 'text-stone-900'
                      : 'text-stone-500'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border border-stone-800/40 shadow-2xs ${
                      item.badgeColor || 'bg-[#fffefb] text-stone-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="sm:hidden py-3 border-t border-stone-200 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-stone-100 flex items-center justify-around text-xs text-stone-600">
              <button
                onClick={() => {
                  onOpenNewPersonModal();
                  setMenuOpen(false);
                }}
                className="py-1.5 px-3 rounded-lg bg-stone-100 font-medium"
              >
                + Add Person
              </button>
              <button
                onClick={() => {
                  exportDataJSON();
                  setMenuOpen(false);
                }}
                className="py-1.5 px-3 rounded-lg bg-stone-100 font-medium"
              >
                Export JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
