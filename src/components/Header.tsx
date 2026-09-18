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
      id: 'people' as ActiveTab,
      label: 'Villagers & Friends',
      icon: Users,
    },
    {
      id: 'reminders' as ActiveTab,
      label: 'Upcoming Events',
      icon: Calendar,
      badge: urgentCount > 0 ? `${urgentCount}!` : undefined,
      badgeColor: 'bg-[#b71c1c] text-white',
    },
    {
      id: 'ai_studio' as ActiveTab,
      label: 'Gift Wizard',
      icon: Sparkles,
      highlight: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#26252b] border-b-2 border-[#000000] shadow-[0_4px_0_#000000] font-pixel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand & Action buttons */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onSelectTab('people')}
          >
            {/* Minecraft Chest Icon Box */}
            <div className="w-10 h-10 bg-[#8b8b8b] border-2 border-black shadow-[inset_2px_2px_0_#ffffff,inset_-2px_-2px_0_#373737] flex items-center justify-center text-amber-300">
              <span className="text-xl">🎁</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mc text-sm sm:text-base text-[#55ff55] mc-text-shadow tracking-wider">
                  GiftCraft
                </span>
                <span className="px-1.5 py-0.5 bg-[#d97706] border border-black text-[#1c1917] text-[10px] font-bold tracking-wider">
                  SURVIVAL
                </span>
              </div>
              <p className="text-[11px] text-[#a3a4ab] mc-text-shadow-sm -mt-0.5 font-pixel">
                Pixel Tracker & Birthday Quests
              </p>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={onOpenNewGiftModal}
              className="mc-button-emerald px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#a5d6a7]" />
              <span>Craft Gift Idea</span>
            </button>

            <button
              onClick={onOpenNewPersonModal}
              className="mc-button px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-stone-300" />
              <span>Add Player</span>
            </button>

            {/* Overflow menu for export/import/reset */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="mc-button p-2 text-xs"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 mc-panel-dark border-2 border-black py-2 text-xs z-50 shadow-[4px_4px_0_#000000]">
                  <div className="px-3 py-1 font-mc text-[9px] text-[#80ff20] border-b border-[#3c3d44] mb-1">
                    INVENTORY SAVE
                  </div>
                  <button
                    onClick={() => {
                      exportDataJSON();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#3c3d44] flex items-center gap-2 text-[#ffffff] font-pixel"
                  >
                    <Download className="w-3.5 h-3.5 text-[#55ffff]" />
                    Export World Save (JSON)
                  </button>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#3c3d44] flex items-center gap-2 text-[#ffffff] font-pixel"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#ffaa00]" />
                    Import World Save (JSON)
                  </button>

                  <div className="my-1 border-t border-[#3c3d44]" />

                  <button
                    onClick={() => {
                      if (confirm('Reset to initial sample Minecraft players & gift ideas?')) {
                        resetToSampleData();
                      }
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#521313] flex items-center gap-2 text-[#ff5555] font-pixel"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#ff5555]" />
                    Reset to Default World
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
              className="mc-button-emerald p-2"
              title="Add Gift"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mc-button p-2"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Tabs Navigation: Minecraft Hotbar Style */}
        <nav className="hidden sm:flex items-center gap-1.5 -mb-px overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-pixel transition-none select-none border-2 ${
                  isActive
                    ? 'bg-[#404149] border-[#ffffff] text-[#ffffff] shadow-[inset_2px_2px_0_#5a5b66,inset_-2px_-2px_0_#202126]'
                    : 'bg-[#1e1d22] border-[#0a0a0c] text-[#a3a4ab] hover:bg-[#2b2a30] hover:text-[#ffffff] hover:border-[#3c3d44]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? item.highlight
                        ? 'text-[#55ffff]'
                        : 'text-[#80ff20]'
                      : 'text-[#888888]'
                  }`}
                />
                <span className={isActive ? 'mc-text-shadow font-bold text-white' : ''}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 border border-black text-[10px] font-bold ${
                      item.badgeColor || 'bg-[#2b2b2e] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {/* Active selector tick mark */}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ffffff] rotate-45 border border-black"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="sm:hidden py-3 border-t-2 border-[#000000] bg-[#1a191e] space-y-1">
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
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-pixel border-2 ${
                    isActive
                      ? 'bg-[#404149] border-[#ffffff] text-[#ffffff]'
                      : 'bg-[#212026] border-black text-[#a3a4ab]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#b71c1c] text-white border border-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t-2 border-black flex items-center justify-around text-xs">
              <button
                onClick={() => {
                  onOpenNewPersonModal();
                  setMenuOpen(false);
                }}
                className="mc-button py-1.5 px-3"
              >
                + Add Player
              </button>
              <button
                onClick={() => {
                  exportDataJSON();
                  setMenuOpen(false);
                }}
                className="mc-button py-1.5 px-3"
              >
                Export World
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
