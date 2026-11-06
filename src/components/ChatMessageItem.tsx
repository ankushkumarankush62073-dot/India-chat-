import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Edit3,
  Trash2,
  FileText,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { Message, UserProfile } from '../types';
import { MarkdownRenderer } from '../utils/markdown';
import { speechHandler } from '../utils/speech';

interface ChatMessageItemProps {
  message: Message;
  isLastAssistant: boolean;
  onRegenerate?: () => void;
  onEditMessage?: (id: string, newText: string) => void;
  onDeleteMessage?: (id: string) => void;
  userProfile: UserProfile;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLastAssistant,
  onRegenerate,
  onEditMessage,
  onDeleteMessage,
  userProfile,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      speechHandler.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechHandler.speak(
        message.content,
        userProfile.preferredLanguage,
        userProfile.voiceSpeed,
        userProfile.voicePitch,
        () => setIsSpeaking(false)
      );
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-900/40 border-y border-slate-800/40'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4 text-slate-300" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/40 bg-slate-950 flex items-center justify-center shadow-xs">
              <img
                src="/src/assets/images/india_chatgpt_logo_1793935488895.jpg"
                alt="India ChatGPT"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 overflow-hidden space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              {isUser ? userProfile.name || 'You' : 'India ChatGPT'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Attachments preview if present */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-2">
              {message.attachments.map((att, idx) => {
                const isImage = att.mimeType.startsWith('image/');
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 max-w-xs"
                  >
                    {isImage ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                    )}
                    <span className="truncate text-xs font-mono">{att.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit mode for user message */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-slate-950 border border-orange-500/70 rounded-xl text-white text-sm focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Save & Resubmit
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-slate-100 text-sm sm:text-base leading-relaxed">
              {/* Error state */}
              {message.error ? (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Generation Error</p>
                    <p className="text-slate-300 mt-0.5">{message.error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <MarkdownRenderer content={message.content} />
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-orange-400 ml-1 animate-pulse align-middle" />
                  )}
                </>
              )}
            </div>
          )}

          {/* Action buttons footer */}
          {!message.isStreaming && !isEditing && (
            <div className="flex items-center gap-1 pt-1 text-slate-500">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Text-to-Speech button */}
              <button
                onClick={handleToggleSpeak}
                className={`p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer ${
                  isSpeaking ? 'text-orange-400' : ''
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud (Text-to-Speech)'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* User edit button */}
              {isUser && onEditMessage && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Assistant Regenerate button */}
              {!isUser && isLastAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete button */}
              {onDeleteMessage && (
                <button
                  onClick={() => onDeleteMessage(message.id)}
                  className="p-1.5 rounded-md hover:bg-slate-800 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
