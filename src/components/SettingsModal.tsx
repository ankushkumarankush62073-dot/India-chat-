import React, { useState } from 'react';
import {
  X,
  Languages,
  Moon,
  Sun,
  Volume2,
  Brain,
  Download,
  Trash2,
  User,
  Shield,
  Info,
  Check,
  Plus,
  Play,
  FileCode,
} from 'lucide-react';
import { AIMemory, Conversation, Language, Theme, UserProfile } from '../types';
import { speechHandler } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  memories: AIMemory[];
  onAddMemory: (text: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
  conversations: Conversation[];
  onClearConversations: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'general',
  userProfile,
  onUpdateProfile,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearMemories,
  conversations,
  onClearConversations,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [confirmClearChats, setConfirmClearChats] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [name, setName] = useState(userProfile.name);
  const [lang, setLang] = useState<Language>(userProfile.preferredLanguage);
  const [theme, setTheme] = useState<Theme>(userProfile.theme);
  const [voiceSpeed, setVoiceSpeed] = useState(userProfile.voiceSpeed || 1);
  const [voicePitch, setVoicePitch] = useState(userProfile.voicePitch || 1);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    onUpdateProfile({
      name,
      preferredLanguage: lang,
      theme,
      voiceSpeed,
      voicePitch,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddCustomMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemoryText.trim()) {
      onAddMemory(newMemoryText.trim());
      setNewMemoryText('');
    }
  };

  const handleTestVoice = () => {
    const testPhrase =
      lang === 'hindi'
        ? 'नमस्ते! मैं इंडिया चैटजीपीटी हूँ, अंकुश शर्मा द्वारा निर्मित।'
        : 'Namaste! I am India ChatGPT, your futuristic AI assistant.';
    speechHandler.speak(testPhrase, lang, voiceSpeed, voicePitch);
  };

  const handleExportDataJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      userProfile,
      memories,
      conversations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `india-chatgpt-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white">Settings & Preferences</h2>
            <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">
              India ChatGPT
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout with Tabs */}
        <div className="flex flex-1 overflow-hidden flex-col sm:flex-row">
          {/* Tabs column */}
          <div className="w-full sm:w-48 p-2 border-b sm:border-b-0 sm:border-r border-slate-800 bg-slate-900/40 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible shrink-0">
            {[
              { id: 'general', label: 'General & Lang', icon: <Languages className="w-4 h-4" /> },
              { id: 'appearance', label: 'Appearance', icon: <Moon className="w-4 h-4" /> },
              { id: 'voice', label: 'Voice & Speech', icon: <Volume2 className="w-4 h-4" /> },
              { id: 'memory', label: 'AI Memory', icon: <Brain className="w-4 h-4" /> },
              { id: 'data', label: 'Data & Privacy', icon: <Download className="w-4 h-4" /> },
              { id: 'about', label: 'About Founder', icon: <Info className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700/60 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* GENERAL & LANGUAGE */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name / Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    India ChatGPT will address you by this name.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Conversation Language
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'hinglish', title: 'Hinglish (हिंग्लिश)', desc: 'Natural Hindi-English fusion' },
                      { id: 'hindi', title: 'हिन्दी (Hindi)', desc: 'Pure Devanagari script' },
                      { id: 'english', title: 'English', desc: 'Global English' },
                      { id: 'auto', title: 'Auto-Detect', desc: 'Matches your input dynamically' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLang(item.id as Language)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          lang === item.id
                            ? 'bg-orange-500/10 border-orange-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <p className="text-xs font-semibold text-white">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{savedSuccess ? 'Saved Successfully!' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Theme Selection
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setTheme('dark');
                        onUpdateProfile({ theme: 'dark' });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-slate-900 border-orange-500 text-white shadow-md'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-orange-400 mb-2" />
                      <p className="text-sm font-bold text-white">Obsidian Dark</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Futuristic dark palette with sovereign saffron & emerald accents.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setTheme('light');
                        onUpdateProfile({ theme: 'light' });
                      }}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-slate-900 border-orange-500 text-white shadow-md'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-400 mb-2" />
                      <p className="text-sm font-bold text-white">Crisp Light</p>
                      <p className="text-xs text-slate-400 mt-1">
                        High-contrast daylight theme for reading & long study sessions.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VOICE & SPEECH */}
            {activeTab === 'voice' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Speech Rate</label>
                    <span className="font-mono text-xs text-orange-400">{voiceSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Pitch</label>
                    <span className="font-mono text-xs text-orange-400">{voicePitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleTestVoice}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    <span>Test Voice Speech</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save Voice Settings
                  </button>
                </div>
              </div>
            )}

            {/* AI MEMORY */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
                  <p className="font-semibold text-indigo-300">Verified Memory Guarantee</p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    India ChatGPT strictly remembers only user-approved facts below. It will never
                    invent or pretend to remember details you did not explicitly save.
                  </p>
                </div>

                {/* Add memory form */}
                <form onSubmit={handleAddCustomMemory} className="flex gap-2">
                  <input
                    type="text"
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    placeholder="e.g. 'I am preparing for UPSC civil services', 'I prefer Python code'"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-medium cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Fact</span>
                  </button>
                </form>

                {/* Memories list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Active Saved Memories ({memories.length})</span>
                    {memories.length > 0 && (
                      <button
                        onClick={onClearMemories}
                        className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {memories.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No memories saved yet. Add a preference above!
                    </p>
                  ) : (
                    memories.map((mem) => (
                      <div
                        key={mem.id}
                        className="flex items-start justify-between gap-3 p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <Brain className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-slate-200">{mem.text}</span>
                        </div>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer shrink-0"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* DATA & PRIVACY */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="text-xs font-semibold text-white">Export Conversation Backup</h3>
                  <p className="text-[11px] text-slate-400">
                    Download an offline JSON backup of all your conversations, custom preferences, and
                    active memories.
                  </p>
                  <button
                    onClick={handleExportDataJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2">
                  <h3 className="text-xs font-semibold text-red-400">Clear All Chat History</h3>
                  <p className="text-[11px] text-slate-400">
                    Permanently delete all conversations from your local database. This cannot be
                    undone.
                  </p>
                  {confirmClearChats ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onClearConversations();
                          setConfirmClearChats(false);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        onClick={() => setConfirmClearChats(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClearChats(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete All Chats</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ABOUT FOUNDER */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500/40 shrink-0">
                    <img
                      src="/src/assets/images/ankush_sharma_avatar_1793935489529.jpg"
                      alt="Ankush Sharma"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Ankush Sharma</h3>
                    <p className="text-xs text-orange-400 font-medium">
                      Founder & Chief AI Architect
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Visionary creator of India ChatGPT, dedicated to sovereign AI intelligence,
                      empowering multilingual India with world-class technology.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">AI Engine</span>
                    <span className="font-semibold text-white">Google Gemini API</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Release Edition</span>
                    <span className="font-semibold text-emerald-400">Production v1.0</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Languages Supported</span>
                    <span className="font-semibold text-white">Hindi, English, Hinglish</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Platforms</span>
                    <span className="font-semibold text-white">Web + Android APK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
