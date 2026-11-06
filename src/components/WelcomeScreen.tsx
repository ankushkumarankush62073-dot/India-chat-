import React from 'react';
import {
  Code,
  Languages,
  Calculator,
  GraduationCap,
  Sparkles,
  Search,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Language, Mode } from '../types';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string, mode?: Mode, lang?: Language) => void;
  onOpenImageGen: () => void;
  onOpenAndroid: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  onOpenImageGen,
  onOpenAndroid,
}) => {
  const quickPrompts = [
    {
      icon: <Languages className="w-4 h-4 text-orange-400" />,
      title: 'Hinglish Q&A',
      desc: 'Hinglish mein explain karo: AI models kaise train hote hain?',
      prompt: 'Hinglish mein detail mein explain karo: AI models kaise train hote hain aur neural networks ka core logic kya hota hai?',
      mode: 'general' as Mode,
      lang: 'hinglish' as Language,
    },
    {
      icon: <Code className="w-4 h-4 text-emerald-400" />,
      title: 'Coding & Architecture',
      desc: 'Build a production-ready Express + TypeScript middleware pipeline',
      prompt: 'Write a complete, production-grade Express + TypeScript middleware for JWT token authentication with rate limiting and clean typed errors.',
      mode: 'coding' as Mode,
      lang: 'english' as Language,
    },
    {
      icon: <Calculator className="w-4 h-4 text-blue-400" />,
      title: 'Math & STEM Solving',
      desc: 'Solve 3x² - 14x + 8 = 0 step-by-step with derivation',
      prompt: 'Solve the quadratic equation 3x² - 14x + 8 = 0 step-by-step with complete derivation, discriminant test, and vertex calculation.',
      mode: 'math' as Mode,
      lang: 'english' as Language,
    },
    {
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
      title: 'UPSC / Exam Prep',
      desc: 'भारतीय संविधान की प्रस्तावना (Preamble) और उसके मूल सिद्धांतों का विश्लेषण',
      prompt: 'भारतीय संविधान की प्रस्तावना (Preamble) के मुख्य सिद्धांतों, 42वें संशोधन द्वारा जोड़े गए शब्दों और इसके ऐतिहासिक महत्व का विस्तृत विश्लेषण कीजिए।',
      mode: 'study' as Mode,
      lang: 'hindi' as Language,
    },
    {
      icon: <Search className="w-4 h-4 text-cyan-400" />,
      title: 'Real-time Grounded Search',
      desc: 'What are the major achievements of ISRO in space exploration?',
      prompt: 'Search and summarize the latest milestone achievements and missions of ISRO (Indian Space Research Organisation) with key mission details.',
      mode: 'search' as Mode,
      lang: 'english' as Language,
    },
    {
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      title: 'Professional Writing',
      desc: 'Draft a compelling startup pitch deck executive summary',
      prompt: 'Draft an executive summary for an Indian high-tech AI startup seeking Seed funding, highlighting market size, sovereign AI necessity, and growth projection.',
      mode: 'writing' as Mode,
      lang: 'english' as Language,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center text-center">
      {/* Emblem & Branding */}
      <div className="relative mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 bg-slate-900 group">
          <img
            src="/src/assets/images/india_chatgpt_logo_1793935488895.jpg"
            alt="India ChatGPT Logo"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-slate-900 shadow-sm">
          PRO
        </div>
      </div>

      {/* Main Title & Tagline */}
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
        <span>Namaste! Welcome to </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-emerald-400">
          India ChatGPT
        </span>
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-4 leading-relaxed">
        Next-generation AI built for India and the world. Fluently conversing in{' '}
        <span className="text-orange-400 font-medium">हिन्दी</span>,{' '}
        <span className="text-slate-200 font-medium">English</span>, and{' '}
        <span className="text-emerald-400 font-medium">Hinglish</span> with deep reasoning, vision, and voice.
      </p>

      {/* Founder Attribution Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 mb-8">
        <div className="w-5 h-5 rounded-full overflow-hidden border border-orange-400/50 shrink-0">
          <img
            src="/src/assets/images/ankush_sharma_avatar_1793935489529.jpg"
            alt="Ankush Sharma"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span>Created & Architected by</span>
        <strong className="text-white font-semibold">Ankush Sharma</strong>
        <span className="text-orange-400">·</span>
        <span className="text-slate-400">Google Gemini Powered</span>
      </div>

      {/* Quick Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt, item.mode, item.lang)}
            className="group p-4 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 group-hover:scale-105 transition-transform">
                  {item.icon}
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400 group-hover:text-slate-300">
                  {item.mode}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-snug line-clamp-2">
                {item.desc}
              </p>
            </div>
            <div className="mt-3 text-[11px] text-orange-400 group-hover:text-orange-300 font-medium flex items-center gap-1">
              <span>Try this prompt</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Feature Pills */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 border border-slate-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Streaming</span>
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>PDF & Vision Analysis</span>
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Persistent AI Memory</span>
        </span>
      </div>
    </div>
  );
};
