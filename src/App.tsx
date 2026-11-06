import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Conversation,
  Message,
  Attachment,
  Language,
  Mode,
  Theme,
  UserProfile,
  AIMemory,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { AndroidModal } from './components/AndroidModal';
import { ImageGenModal } from './components/ImageGenModal';
import { AuthModal } from './components/AuthModal';

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-1',
  name: 'Ankush Sharma',
  email: 'ankush@indiachatgpt.ai',
  preferredLanguage: 'hinglish',
  theme: 'dark',
  voiceSpeed: 1,
  voicePitch: 1,
  selectedVoice: 'hi-IN',
  createdAt: new Date().toISOString(),
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>('general');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hinglish');

  // Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [isAndroidOpen, setIsAndroidOpen] = useState(false);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme
  useEffect(() => {
    if (userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.theme]);

  // Initial Data Load (User, Memories, Conversations)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load profile
        const profileRes = await fetch(`/api/auth/profile/${userProfile.id}`);
        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.profile) {
            setUserProfile(pData.profile);
            setSelectedLanguage(pData.profile.preferredLanguage || 'hinglish');
          }
        }

        // Load memories
        const memRes = await fetch(`/api/memories/${userProfile.id}`);
        if (memRes.ok) {
          const mData = await memRes.json();
          if (mData.memories) setMemories(mData.memories);
        }

        // Load conversations
        const convRes = await fetch(`/api/conversations/${userProfile.id}`);
        if (convRes.ok) {
          const cData = await convRes.json();
          if (cData.conversations && cData.conversations.length > 0) {
            setConversations(cData.conversations);
          }
        }
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    };

    fetchData();
  }, []);

  // Android Hardware Back Button Handling via popstate
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
      }
      if (isAndroidOpen) {
        setIsAndroidOpen(false);
        return;
      }
      if (isImageGenOpen) {
        setIsImageGenOpen(false);
        return;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        return;
      }
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return;
      }
      if (activeConversationId) {
        setActiveConversationId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isSettingsOpen,
    isAndroidOpen,
    isImageGenOpen,
    isAuthOpen,
    isSidebarOpen,
    activeConversationId,
  ]);

  // Push state to history stack when opening modals or chats for Android back navigation
  const pushModalHistory = (name: string) => {
    window.history.pushState({ modal: name }, '');
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isStreaming]);

  // Active conversation
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // New Chat
  const handleNewChat = () => {
    if (isStreaming) handleStopStreaming();
    setActiveConversationId(null);
    setCurrentMode('general');
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    if (isStreaming) handleStopStreaming();
    setActiveConversationId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      if (conv.mode) setCurrentMode(conv.mode);
      if (conv.language) setSelectedLanguage(conv.language);
    }
    pushModalHistory('chat');
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error('Delete conv error:', err);
    }
  };

  // Rename conversation
  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: newTitle }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  // Clear all conversations
  const handleClearConversations = async () => {
    try {
      await fetch(`/api/conversations/clear/${userProfile.id}`, {
        method: 'DELETE',
      });
      setConversations([]);
      setActiveConversationId(null);
    } catch (err) {
      console.error('Clear convs error:', err);
    }
  };

  // AI Memories management
  const handleAddMemory = async (text: string) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id, text }),
      });
      const data = await res.json();
      if (data.success && data.memory) {
        setMemories((prev) => [...prev, data.memory]);
      }
    } catch (err) {
      console.error('Add memory error:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete memory error:', err);
    }
  };

  const handleClearMemories = async () => {
    try {
      await fetch(`/api/memories/clear/${userProfile.id}`, { method: 'DELETE' });
      setMemories([]);
    } catch (err) {
      console.error('Clear memories error:', err);
    }
  };

  // Profile update
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Core Send Message function with real SSE Streaming from Gemini API
  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = [],
    enableSearch = false,
    lang: Language = selectedLanguage
  ) => {
    if (isStreaming) return;

    let convId = activeConversationId;
    let targetConv = conversations.find((c) => c.id === convId);

    // Create new conversation if none active
    if (!convId || !targetConv) {
      convId = 'conv-' + Date.now();
      const newTitle = text.slice(0, 36) || 'New Conversation';
      const newConv: Conversation = {
        id: convId,
        userId: userProfile.id,
        title: newTitle,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mode: currentMode,
        language: lang,
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(convId);
      targetConv = newConv;
    }

    const userMessage: Message = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantPlaceholderId = 'msg-' + Date.now() + '-assistant';
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    const updatedMessages = [...(targetConv.messages || []), userMessage, assistantMessage];

    // Optimistically update conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history: targetConv.messages || [],
          language: lang,
          mode: currentMode,
          userId: userProfile.id,
          enableSearch,
          attachments,
        }),
      });

      if (!response.body) {
        throw new Error('No streaming response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                accumulatedText += data.chunk;
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id === convId) {
                      return {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantPlaceholderId
                            ? { ...m, content: accumulatedText }
                            : m
                        ),
                      };
                    }
                    return c;
                  })
                );
              }

              if (data.done) {
                // Done event
              }
            } catch (err: any) {
              if (err.name !== 'AbortError') {
                console.warn('SSE parsing issue:', err);
              }
            }
          }
        }
      }

      // Finalize message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: accumulatedText, isStreaming: false }
                  : m
              ),
            };
          }
          return c;
        })
      );

      // Save conversation state to backend database
      fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: convId,
          userId: userProfile.id,
          title: targetConv.title,
          messages: updatedMessages.map((m) =>
            m.id === assistantPlaceholderId
              ? { ...m, content: accumulatedText, isStreaming: false }
              : m
          ),
          mode: currentMode,
          language: lang,
        }),
      }).catch(console.warn);

      // If this was the first turn, generate an intelligent title
      if ((targetConv.messages || []).length === 0 && text) {
        fetch('/api/chat/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, language: lang }),
        })
          .then((res) => res.json())
          .then((tData) => {
            if (tData.title) {
              handleRenameConversation(convId!, tData.title);
            }
          })
          .catch(console.warn);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chat stream error:', err);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === convId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        content: accumulatedText || 'Could not complete response.',
                        error: err?.message || 'Error communicating with Gemini API',
                        isStreaming: false,
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    if (msgs.length < 2) return;

    // Find last user message
    const lastUserMsgIdx = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const actualIdx = msgs.length - 1 - lastUserMsgIdx;
    const userMsg = msgs[actualIdx];

    // Remove following assistant message
    const trimmedMsgs = msgs.slice(0, actualIdx);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmedMsgs } : c
      )
    );

    // Re-send
    handleSendMessage(
      userMsg.content,
      userMsg.attachments || [],
      false,
      selectedLanguage
    );
  };

  // Edit previous message
  const handleEditMessage = (msgId: string, newText: string) => {
    if (!activeConversation || isStreaming) return;
    const msgs = activeConversation.messages;
    const idx = msgs.findIndex((m) => m.id === msgId);
    if (idx === -1) return;

    const trimmedMsgs = msgs.slice(0, idx);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmedMsgs } : c
      )
    );

    handleSendMessage(newText, [], false, selectedLanguage);
  };

  // Delete single message
  const handleDeleteMessage = (msgId: string) => {
    if (!activeConversation) return;
    const filtered = activeConversation.messages.filter((m) => m.id !== msgId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: filtered } : c
      )
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-orange-500/30">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={(tab) => {
          setSettingsTab(tab || 'general');
          setIsSettingsOpen(true);
          pushModalHistory('settings');
        }}
        onOpenAndroid={() => {
          setIsAndroidOpen(true);
          pushModalHistory('android');
        }}
        onOpenImageGen={() => {
          setIsImageGenOpen(true);
          pushModalHistory('imagegen');
        }}
        onOpenAuth={() => {
          setIsAuthOpen(true);
          pushModalHistory('auth');
        }}
        userProfile={userProfile}
        memoryCount={memories.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Header */}
        <Header
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => {
            setSettingsTab('general');
            setIsSettingsOpen(true);
            pushModalHistory('settings');
          }}
          onOpenAndroid={() => {
            setIsAndroidOpen(true);
            pushModalHistory('android');
          }}
          isStreaming={isStreaming}
        />

        {/* Chat / Welcome Viewport */}
        <div className="flex-1 overflow-y-auto">
          {!activeConversation || (activeConversation.messages || []).length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt, mode, lang) => {
                if (mode) setCurrentMode(mode);
                if (lang) setSelectedLanguage(lang);
                handleSendMessage(prompt, [], false, lang || selectedLanguage);
              }}
              onOpenImageGen={() => {
                setIsImageGenOpen(true);
                pushModalHistory('imagegen');
              }}
              onOpenAndroid={() => {
                setIsAndroidOpen(true);
                pushModalHistory('android');
              }}
            />
          ) : (
            <div className="pb-8">
              {activeConversation.messages.map((msg, idx) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  isLastAssistant={
                    msg.role === 'assistant' &&
                    idx === activeConversation.messages.length - 1
                  }
                  onRegenerate={handleRegenerate}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  userProfile={userProfile}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={(l) => setSelectedLanguage(l)}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsTab}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearMemories={handleClearMemories}
        conversations={conversations}
        onClearConversations={handleClearConversations}
      />

      <AndroidModal
        isOpen={isAndroidOpen}
        onClose={() => setIsAndroidOpen(false)}
      />

      <ImageGenModal
        isOpen={isImageGenOpen}
        onClose={() => setIsImageGenOpen(false)}
        onSendToChat={(imgUrl, prompt) => {
          handleSendMessage(
            `Here is a generated vector artwork depicting: ${prompt}`,
            [
              {
                name: 'india-chatgpt-art.svg',
                mimeType: 'image/svg+xml',
                dataUrl: imgUrl,
              },
            ],
            false,
            selectedLanguage
          );
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={userProfile}
        onLoginSuccess={(usr) => {
          setUserProfile(usr);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }}
      />
    </div>
  );
}
