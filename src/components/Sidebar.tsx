import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Sparkles,
  Smartphone,
  Settings as SettingsIcon,
  Brain,
  Palette,
  X,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Conversation, UserProfile } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: (tab?: string) => void;
  onOpenAndroid: () => void;
  onOpenImageGen: () => void;
  onOpenAuth: () => void;
  userProfile: UserProfile;
  memoryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onClose,
  onOpenSettings,
  onOpenAndroid,
  onOpenImageGen,
  onOpenAuth,
  userProfile,
  memoryCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/40 bg-slate-900 shrink-0">
              <img
                src="/src/assets/images/india_chatgpt_logo_1793935488895.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                <span>India</span>
                <span className="text-orange-400">ChatGPT</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">By Ankush Sharma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          {/* Quick AI Tools row */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => {
                onOpenImageGen();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-orange-400" />
              <span>Image Studio</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings('memory');
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Memory ({memoryCount})</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Recent Chats</span>
            <span className="font-mono text-[10px] text-slate-500">{filteredConversations.length}</span>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center px-4">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-500">No conversations yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Start typing to talk with India ChatGPT</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-medium border border-slate-700/60 shadow-xs'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-950 px-1 py-0.5 rounded text-white text-xs border border-orange-500 focus:outline-none w-full"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {/* Action icons on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                        title="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => startEditing(conv, e)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer User Profile & Founder Attribution */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-2">
          {/* Android App Button */}
          <button
            onClick={() => {
              onOpenAndroid();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-xs text-emerald-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Download Android APK</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">v1.0</span>
          </button>

          {/* User Profile Card */}
          <div
            onClick={onOpenAuth}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500/30 shrink-0 bg-slate-900">
                <img
                  src="/src/assets/images/ankush_sharma_avatar_1793935489529.jpg"
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{userProfile.name}</p>
                  <span title="Verified Creator">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{userProfile.email}</p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
