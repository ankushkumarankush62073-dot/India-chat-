import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface AndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidModal: React.FC<AndroidModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install on Android: Tap the 3 dots in Chrome (menu) and select "Add to Home screen" or "Install App".'
      );
    }
  };

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const buildCommands = [
    { label: 'Step 1: Install Capacitor Android runtime', cmd: 'npm i @capacitor/core @capacitor/cli @capacitor/android' },
    { label: 'Step 2: Initialize Android platform project', cmd: 'npx cap add android' },
    { label: 'Step 3: Build web assets into dist/', cmd: 'npm run build && npx cap copy' },
    { label: 'Step 4: Launch Android Studio to generate APK/AAB', cmd: 'npx cap open android' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Android App & APK Build</h2>
              <p className="text-[11px] text-slate-400">Capacitor Native Packaging & Web APK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Direct Install PWA Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Instant Android Web App</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                  PWA Ready
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Install India ChatGPT directly onto your Android device home screen with full-screen
                experience and hardware back button support.
              </p>
            </div>
            <button
              onClick={handleInstallPWA}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-semibold shadow-md whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Install to Android</span>
            </button>
          </div>

          {/* Capacitor Native APK Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Build Signed APK / AAB with Capacitor</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">capacitor.config.ts configured</span>
            </div>

            <p className="text-xs text-slate-400">
              Run these commands in your project terminal to package India ChatGPT into a standalone
              native Android APK or Google Play Store AAB bundle:
            </p>

            <div className="space-y-2">
              {buildCommands.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1.5"
                >
                  <span className="text-[11px] font-medium text-slate-300">{item.label}</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-950 rounded-lg font-mono text-xs text-orange-300 border border-slate-800/80">
                    <span className="overflow-x-auto truncate">{item.cmd}</span>
                    <button
                      onClick={() => copyCommand(item.cmd, idx)}
                      className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Android Features checklist */}
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200">Android Optimizations Included:</h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hardware Android Back Button listener enabled (closes modals & drawers)</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Safe area insets (`env(safe-area-inset-bottom)`) for navigation bars</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Maskable 192x192 & 512x512 app icons with Indian flag motifs</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
