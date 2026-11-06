export type Language = 'hindi' | 'english' | 'hinglish' | 'auto';
export type Mode = 'general' | 'coding' | 'math' | 'writing' | 'translation' | 'study' | 'search';
export type Theme = 'dark' | 'light';

export interface Attachment {
  name: string;
  mimeType: string;
  dataUrl: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  mode: Mode;
  language: Language;
}

export interface AIMemory {
  id: string;
  userId: string;
  text: string;
  category: 'preference' | 'personal' | 'custom';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredLanguage: Language;
  theme: Theme;
  voiceSpeed: number;
  voicePitch: number;
  selectedVoice: string;
  createdAt: string;
}
