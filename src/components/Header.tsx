import React from 'react';
import { Menu, Plus, Sparkles, Smartphone, Settings as SettingsIcon, Brain } from 'lucide-react';
import { Mode } from '../types';

interface HeaderProps {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenAndroid: () => void;
  isStreaming: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  onOpenAndroid,
  isStreaming,
}) => {
  const modes: { id: Mode; label: string }[] = [
    { id: 'general', label: 'Chat' },
    { id: 'coding', label: 'Code' },
    { id: 'math', label: 'Math' },
    { id: 'study', label: 'Study' },
    { id: 'search', label: 'Search' },
  ];

  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 transition-colors">
      {/* Zone 1: Single text element / brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors md:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNewChat();
          }}
          className="flex items-center gap-2.5 group cursor-pointer text-decoration-none"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/40 shadow-sm shrink-0 flex items-center justify-center bg-slate-900">
            <img
              src="/src/assets/images/india_chatgpt_logo_1793935488895.jpg"
              alt="India ChatGPT"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap flex items-center gap-1.5">
              <span>India</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-emerald-400">
                ChatGPT
              </span>
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: 4-5 concise single-line nav links / mode tabs */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 via-slate-800 to-emerald-500/20 text-white border border-orange-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary action + Android APK & Settings */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenAndroid}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Android App (APK & Capacitor)"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Android App</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          title="Settings & AI Memory"
          aria-label="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        <button
          onClick={onNewChat}
          disabled={isStreaming}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 rounded-lg shadow-sm hover:shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};
