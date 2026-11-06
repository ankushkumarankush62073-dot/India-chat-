import express, { Request, Response } from 'express';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Persistence Setup (JSON-based local secure database)
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredLanguage: 'hindi' | 'english' | 'hinglish' | 'auto';
  theme: 'dark' | 'light';
  voiceSpeed: number;
  voicePitch: number;
  selectedVoice: string;
  createdAt: string;
}

interface AIMemory {
  id: string;
  userId: string;
  text: string;
  category: 'preference' | 'personal' | 'custom';
  createdAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    mimeType: string;
    dataUrl?: string;
  }>;
}

interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  mode: string;
  language: string;
}

interface DatabaseSchema {
  users: Record<string, { profile: UserProfile; passwordHash?: string }>;
  memories: AIMemory[];
  conversations: ChatConversation[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading database file:', err);
  }
  return {
    users: {
      'guest-1': {
        profile: {
          id: 'guest-1',
          name: 'Ankush Sharma',
          email: 'ankush@indiachatgpt.ai',
          preferredLanguage: 'hinglish',
          theme: 'dark',
          voiceSpeed: 1,
          voicePitch: 1,
          selectedVoice: 'hi-IN',
          createdAt: new Date().toISOString(),
        },
      },
    },
    memories: [
      {
        id: 'mem-1',
        userId: 'guest-1',
        text: 'User enjoys explanations in Hinglish and English with clean code examples',
        category: 'preference',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mem-2',
        userId: 'guest-1',
        text: 'User is the founder and AI Architect of India ChatGPT: Ankush Sharma',
        category: 'personal',
        createdAt: new Date().toISOString(),
      },
    ],
    conversations: [],
  };
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// System prompt builder for India ChatGPT
function buildSystemInstruction(
  language: string,
  mode: string,
  userMemories: string[],
  userName: string
): string {
  const memoryContext =
    userMemories.length > 0
      ? `\n### USER APPROVED MEMORIES (You MUST respect these exactly, never hallucinate other details):\n${userMemories
          .map((m) => `- ${m}`)
          .join('\n')}`
      : '\nNo explicit memories stored yet. Do not invent any false background details about the user.';

  let languageDirective = '';
  if (language === 'hindi') {
    languageDirective =
      'PRIMARY LANGUAGE: Shuddh & fluent Hindi (हिन्दी) in Devanagari script. Maintain high cultural eloquence and respectful tone (Aap / आप). Format technical terms clearly in brackets when helpful.';
  } else if (language === 'hinglish') {
    languageDirective =
      'PRIMARY LANGUAGE: Hinglish (Natural Indian fusion of Hindi written in Roman English script + fluent English). Example tone: "Haan bilkul, main aapko step-by-step samjhata hoon...". Keep it friendly, clear, respectful, and sharp.';
  } else if (language === 'english') {
    languageDirective =
      'PRIMARY LANGUAGE: Clear, articulate global English with Indian warmth and intellectual precision.';
  } else {
    languageDirective =
      'LANGUAGE: Detect the user language automatically. If they talk in Hindi, answer in Hindi. If in Hinglish, answer in conversational Hinglish. If in English, answer in English.';
  }

  let modeInstruction = '';
  switch (mode) {
    case 'coding':
      modeInstruction =
        'SPECIALIZATION: Elite Senior Software Engineer. Provide complete, production-grade, bug-free code blocks with syntax highlighting language tags (e.g. ```typescript, ```python). Explain logic cleanly with time/space complexity if applicable.';
      break;
    case 'math':
      modeInstruction =
        'SPECIALIZATION: Advanced Mathematical and STEM Professor. Provide step-by-step derivations, clear formulas, LaTeX-style notation, and verify all arithmetic steps.';
      break;
    case 'study':
      modeInstruction =
        'SPECIALIZATION: Academic & Competitive Exam Mentor (UPSC, JEE, NEET, GATE, CBSE). Break down complex concepts with mnemonics, structured bullet points, key facts, and practice questions.';
      break;
    case 'writing':
      modeInstruction =
        'SPECIALIZATION: Professional Editor and Creative Copywriter. Produce impactful, well-structured articles, emails, letters, poetry, or speeches tailored to Indian & global contexts.';
      break;
    case 'translation':
      modeInstruction =
        'SPECIALIZATION: High-Fidelity Linguistic Translator between Hindi, English, and Hinglish. Provide accurate translations preserving nuance, idioms, and emotional tone.';
      break;
    default:
      modeInstruction =
        'SPECIALIZATION: All-round intellectual AI Assistant. Adaptable, helpful, polite, and deeply knowledgeable.';
  }

  return `You are "India ChatGPT", a world-class, sovereign-grade AI chatbot created by Founder & AI Architect Ankush Sharma.
Brand Identity:
- Name: India ChatGPT
- Creator/Owner: Ankush Sharma
- Engine: Google Gemini API (State-of-the-art multimodal reasoning)
- Heritage: Born with pride from India's technology ecosystem, built for India and the entire world.

Core Rules & Persona:
1. Always be polite, respectful (use Indian etiquette like "Namaste / Namaskar" when greeting), intelligent, and honest.
2. If asked "Who created you?" or "Who is your owner?", proudly answer that you are "India ChatGPT", created and architected by Ankush Sharma.
3. ${languageDirective}
4. ${modeInstruction}
5. ${memoryContext}
6. Never output generic AI disclaimers or repetitive apologies.
7. Support code blocks, tables, and structured markdown seamlessly.`;
}

// ----------------- API ROUTES -----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'India ChatGPT',
    owner: 'Ankush Sharma',
    hasKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Authentication & Profile Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  // Find user or create
  const existingKey = Object.keys(db.users).find(
    (k) => db.users[k].profile.email.toLowerCase() === email.toLowerCase()
  );

  if (existingKey) {
    const user = db.users[existingKey];
    res.json({ success: true, user: user.profile, token: user.profile.id });
    return;
  }

  // Auto register if new
  const id = 'user-' + Date.now();
  const nameFromEmail = email.split('@')[0];
  const formattedName =
    nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  const newUser: UserProfile = {
    id,
    name: formattedName || 'User',
    email,
    preferredLanguage: 'hinglish',
    theme: 'dark',
    voiceSpeed: 1,
    voicePitch: 1,
    selectedVoice: 'hi-IN',
    createdAt: new Date().toISOString(),
  };

  db.users[id] = { profile: newUser, passwordHash: password || 'default' };
  saveDatabase(db);

  res.json({ success: true, user: newUser, token: id });
});

app.post('/api/auth/profile', (req: Request, res: Response) => {
  const { id, name, preferredLanguage, theme, voiceSpeed, voicePitch, selectedVoice } =
    req.body;
  const userId = id || 'guest-1';

  if (!db.users[userId]) {
    db.users[userId] = {
      profile: {
        id: userId,
        name: name || 'Ankush Sharma',
        email: 'ankush@indiachatgpt.ai',
        preferredLanguage: preferredLanguage || 'hinglish',
        theme: theme || 'dark',
        voiceSpeed: voiceSpeed || 1,
        voicePitch: voicePitch || 1,
        selectedVoice: selectedVoice || 'hi-IN',
        createdAt: new Date().toISOString(),
      },
    };
  } else {
    const p = db.users[userId].profile;
    if (name) p.name = name;
    if (preferredLanguage) p.preferredLanguage = preferredLanguage;
    if (theme) p.theme = theme;
    if (voiceSpeed !== undefined) p.voiceSpeed = voiceSpeed;
    if (voicePitch !== undefined) p.voicePitch = voicePitch;
    if (selectedVoice) p.selectedVoice = selectedVoice;
  }

  saveDatabase(db);
  res.json({ success: true, profile: db.users[userId].profile });
});

app.get('/api/auth/profile/:id', (req: Request, res: Response) => {
  const userId = req.params.id || 'guest-1';
  const user = db.users[userId] || db.users['guest-1'];
  res.json({ success: true, profile: user ? user.profile : null });
});

// Memory Endpoints
app.get('/api/memories/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId || 'guest-1';
  const userMemories = db.memories.filter((m) => m.userId === userId);
  res.json({ success: true, memories: userMemories });
});

app.post('/api/memories', (req: Request, res: Response) => {
  const { userId, text, category } = req.body;
  if (!text || !text.trim()) {
    res.status(400).json({ error: 'Memory text is required' });
    return;
  }

  const newMem: AIMemory = {
    id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: userId || 'guest-1',
    text: text.trim(),
    category: category || 'preference',
    createdAt: new Date().toISOString(),
  };

  db.memories.push(newMem);
  saveDatabase(db);
  res.json({ success: true, memory: newMem });
});

app.delete('/api/memories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.memories = db.memories.filter((m) => m.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Memory deleted' });
});

app.delete('/api/memories/clear/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  db.memories = db.memories.filter((m) => m.userId !== userId);
  saveDatabase(db);
  res.json({ success: true, message: 'All memories cleared for user' });
});

// Conversations CRUD
app.get('/api/conversations/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId || 'guest-1';
  const list = db.conversations
    .filter((c) => c.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  res.json({ success: true, conversations: list });
});

app.post('/api/conversations', (req: Request, res: Response) => {
  const { id, userId, title, messages, mode, language } = req.body;
  const convId = id || 'conv-' + Date.now();

  const existingIdx = db.conversations.findIndex((c) => c.id === convId);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    db.conversations[existingIdx].title =
      title || db.conversations[existingIdx].title;
    db.conversations[existingIdx].messages =
      messages || db.conversations[existingIdx].messages;
    db.conversations[existingIdx].updatedAt = now;
    if (mode) db.conversations[existingIdx].mode = mode;
    if (language) db.conversations[existingIdx].language = language;
    saveDatabase(db);
    res.json({ success: true, conversation: db.conversations[existingIdx] });
    return;
  }

  const newConv: ChatConversation = {
    id: convId,
    userId: userId || 'guest-1',
    title: title || 'New Conversation',
    messages: messages || [],
    createdAt: now,
    updatedAt: now,
    mode: mode || 'general',
    language: language || 'hinglish',
  };

  db.conversations.push(newConv);
  saveDatabase(db);
  res.json({ success: true, conversation: newConv });
});

app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.conversations = db.conversations.filter((c) => c.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Conversation deleted' });
});

app.delete('/api/conversations/clear/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  db.conversations = db.conversations.filter((c) => c.userId !== userId);
  saveDatabase(db);
  res.json({ success: true, message: 'All conversations cleared' });
});

// Title Generator
app.post('/api/chat/title', async (req: Request, res: Response) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      res.json({ title: 'New Conversation' });
      return;
    }

    const currentKey = process.env.GEMINI_API_KEY || apiKey;
    if (!currentKey) {
      const truncated = message.trim().slice(0, 24);
      res.json({ title: truncated.charAt(0).toUpperCase() + truncated.slice(1) });
      return;
    }

    const prompt = `Provide a concise 3-5 word title for a conversation starting with this message: "${message.substring(
      0,
      120
    )}". Language: ${language || 'Hinglish/English'}. Output ONLY the plain title without quotes or punctuation.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });
    }

    const title = (response.text ?? '').trim().replace(/["']/g, '');
    res.json({ title: title || message.trim().slice(0, 24) });
  } catch (err: any) {
    const clean = (req.body.message || 'New Conversation').trim().slice(0, 24);
    res.json({ title: clean });
  }
});

// Streaming Chat Endpoint with SSE
app.post('/api/chat', async (req: Request, res: Response) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const {
      message,
      history = [],
      language = 'hinglish',
      mode = 'general',
      userId = 'guest-1',
      enableSearch = false,
      attachments = [],
    } = req.body;

    if (!message && attachments.length === 0) {
      res.write(
        `data: ${JSON.stringify({
          error: 'Please provide a message or attachment.',
        })}\n\n`
      );
      res.end();
      return;
    }

    // Retrieve user memories
    const userMemories = db.memories
      .filter((m) => m.userId === userId)
      .map((m) => m.text);
    const userName = db.users[userId]?.profile?.name || 'User';

    const systemInstruction = buildSystemInstruction(
      language,
      mode,
      userMemories,
      userName
    );

    // Build contents for Gemini generateContentStream
    // Map prior history into alternating user/model turns
    const contents: any[] = [];

    // Prior history (up to last 12 turns for context efficiency)
    const recentHistory = history.slice(-12);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    // Current turn parts (text + any image/pdf inlineData)
    const currentParts: any[] = [];

    // Handle attachments (Images & PDFs)
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.dataUrl && att.mimeType) {
          // Extract base64 without prefix
          const base64Data = att.dataUrl.includes(';base64,')
            ? att.dataUrl.split(';base64,')[1]
            : att.dataUrl;

          currentParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: base64Data,
            },
          });
        }
      }
    }

    // Add user text
    if (message) {
      currentParts.push({ text: message });
    } else if (currentParts.length > 0) {
      currentParts.push({
        text: 'Please analyze this uploaded document / image thoroughly.',
      });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    const config: any = {
      systemInstruction,
    };

    // Google Search Grounding if requested
    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const currentKey = process.env.GEMINI_API_KEY || apiKey;
    if (!currentKey) {
      // Simulate streaming response explaining India ChatGPT and key setup
      const sampleResponse = `**Namaste!** Main **India ChatGPT** hoon — created & architected by **Ankush Sharma** with Google Gemini intelligence.

Welcome to sovereign-grade Indian AI. Main aapki help kar sakta hoon:
- **Languages**: Shuddh Hindi (हिन्दी), Fluent English, aur natural Hinglish.
- **Coding & Tech**: Full-stack web, Python, TypeScript, algorithms aur debugging.
- **Mathematics & STEM**: Step-by-step problem derivations aur formulas.
- **Academic Mentorship**: UPSC Civil Services, JEE, NEET, aur CBSE prep.
- **Multimodal Intelligence**: Image understanding aur document/PDF analysis.

> 💡 **Notice**: Apka Gemini API key attach karne ke liye AI Studio ke **Settings > Secrets** panel mein jaakar \`GEMINI_API_KEY\` select karein for unlimited live streaming inference.

Aap mujhse koi bhi question pooch sakte hain!`;

      // Stream words
      const words = sampleResponse.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ chunk: word + ' ' })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }
      res.write(`data: ${JSON.stringify({ done: true, fullText: sampleResponse })}\n\n`);
      res.end();
      return;
    }

    // Call Gemini streaming with automatic high-demand fallback
    let stream;
    try {
      stream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });
    } catch (modelErr: any) {
      console.warn('gemini-3.8-flash busy, falling back to gemini-flash-latest:', modelErr?.message);
      try {
        stream = await ai.models.generateContentStream({
          model: 'gemini-flash-latest',
          contents,
          config,
        });
      } catch (liteErr: any) {
        stream = await ai.models.generateContentStream({
          model: 'gemini-3.1-flash-lite',
          contents,
          config,
        });
      }
    }

    let fullText = '';
    for await (const chunk of stream) {
      const c = chunk as GenerateContentResponse;
      const textChunk = c.text || '';
      if (textChunk) {
        fullText += textChunk;
        res.write(`data: ${JSON.stringify({ chunk: textChunk })}\n\n`);
      }
    }

    // Send completion event
    res.write(
      `data: ${JSON.stringify({ done: true, fullText: fullText })}\n\n`
    );
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat stream:', error);
    let errMsg =
      error?.message ||
      'An unexpected error occurred while communicating with Gemini API.';

    if (error?.status === 403 || error?.message?.includes('PERMISSION_DENIED')) {
      errMsg = 'Permission Denied: Please check your API key in the Settings > Secrets panel.';
    } else if (error?.status === 429) {
      errMsg = 'Quota limit reached. Please verify your Gemini API key in Settings > Secrets.';
    } else if (error?.status === 503 || error?.message?.includes('high demand')) {
      errMsg = 'The Gemini model is temporarily experiencing high global demand. Please retry in a few moments.';
    }

    res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
    res.end();
  }
});

// Image Generation Endpoint (Interactive visual generation)
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, style = 'futuristic' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Generate artistic SVG or visual canvas description with Gemini
    const synthesisPrompt = `Create a high quality, breathtaking SVG illustration depicting: "${prompt}".
Style: ${style}, vibrant Indian modern aesthetics, elegant gradient vectors, high-tech glowing lines, clean paths.
Output ONLY raw valid SVG code with xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" and width="100%" height="100%". No markdown code fences, no explanations.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: synthesisPrompt,
    });

    let rawSvg = (result.text ?? '').trim();
    if (rawSvg.startsWith('```xml')) rawSvg = rawSvg.replace(/^```xml\s*/, '');
    if (rawSvg.startsWith('```svg')) rawSvg = rawSvg.replace(/^```svg\s*/, '');
    if (rawSvg.startsWith('```')) rawSvg = rawSvg.replace(/^```\s*/, '');
    if (rawSvg.endsWith('```')) rawSvg = rawSvg.replace(/```$/, '');

    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
      rawSvg.trim()
    )}`;

    res.json({
      success: true,
      imageUrl: svgDataUrl,
      prompt,
    });
  } catch (err: any) {
    console.error('Image generation error:', err);
    res.status(500).json({
      error:
        err?.message || 'Failed to generate visual asset. Please try again.',
    });
  }
});

// Serve frontend in production or mount Vite in development
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`India ChatGPT server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
