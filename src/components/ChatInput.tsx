import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Globe,
  X,
  Sparkles,
} from 'lucide-react';
import { Attachment, Language } from '../types';
import { speechHandler } from '../utils/speech';

interface ChatInputProps {
  onSendMessage: (
    text: string,
    attachments: Attachment[],
    enableSearch: boolean,
    lang: Language
  ) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  selectedLanguage: Language;
  onChangeLanguage: (lang: Language) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  selectedLanguage,
  onChangeLanguage,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [enableSearch, setEnableSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isStreaming) return;
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text.trim(), attachments, enableSearch, selectedLanguage);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Limit file size to 15MB
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            dataUrl: result,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleVoice = () => {
    if (isListening) {
      speechHandler.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechHandler.startListening(
        selectedLanguage,
        (transcript, isFinal) => {
          setText((prev) => {
            const prefix = prev ? prev + ' ' : '';
            return prefix + transcript;
          });
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*,application/pdf,.txt,.docx,.csv"
        className="hidden"
      />

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-900/80 border border-slate-800 rounded-xl">
          {attachments.map((att, idx) => {
            const isImage = att.mimeType.startsWith('image/');
            return (
              <div
                key={idx}
                className="relative group flex items-center gap-2 p-1.5 bg-slate-800/90 rounded-lg text-xs text-slate-200 border border-slate-700/60 max-w-[200px]"
              >
                {isImage ? (
                  <img
                    src={att.dataUrl}
                    alt={att.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <FileText className="w-5 h-5 text-orange-400 shrink-0" />
                )}
                <span className="truncate text-xs font-mono">{att.name}</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="p-0.5 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Futuristic ChatGPT Floating Input Shell */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800/90 focus-within:border-orange-500/50 shadow-xl backdrop-blur-md transition-all">
        {/* Top Control Strip inside Input */}
        <div className="flex items-center justify-between px-3 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {/* Language switch */}
            <select
              value={selectedLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as Language)}
              className="bg-slate-950/80 text-slate-300 hover:text-white px-2 py-1 rounded-md border border-slate-800 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="hinglish">Hinglish (हिंग्लिश)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="english">English</option>
              <option value="auto">Auto-Detect</option>
            </select>

            {/* Google Search Grounding Toggle */}
            <button
              onClick={() => setEnableSearch(!enableSearch)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                enableSearch
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Google Search Grounding"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span>Web Search</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 hidden sm:block">
            Shift + Enter for new line
          </div>
        </div>

        {/* Textarea */}
        <div className="px-3 py-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedLanguage === 'hindi'
                ? 'इंडिया चैटजीपीटी से कुछ भी पूछें... (उदा: कोडिंग, गणित, इतिहास)'
                : selectedLanguage === 'hinglish'
                ? 'Ask India ChatGPT anything in Hinglish, English ya Hindi...'
                : 'Message India ChatGPT... (e.g. coding, math, documents)'
            }
            rows={1}
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none leading-relaxed max-h-48 overflow-y-auto"
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Attach Image or Document / PDF"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice Input (Speech-to-Text)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Send / Stop Generation Button */}
          <div>
            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-md"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!text.trim() && attachments.length === 0}
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all cursor-pointer ${
                  text.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 hover:opacity-90'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sovereign India AI Footer text */}
      <div className="text-center mt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
        <span>India ChatGPT by Ankush Sharma</span>
        <span>·</span>
        <span>Powered by Google Gemini API</span>
      </div>
    </div>
  );
};
