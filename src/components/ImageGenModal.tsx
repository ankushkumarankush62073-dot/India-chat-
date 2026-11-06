import React, { useState } from 'react';
import {
  X,
  Palette,
  Sparkles,
  Download,
  Loader2,
  Image as ImageIcon,
  Copy,
  Check,
} from 'lucide-react';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (imageUrl: string, prompt: string) => void;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('futuristic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    'Futuristic Indian Smart City with neon saffron fiber optics and flying metro',
    'High-tech holographic Ashoka Chakra mandala with glowing emerald photon beams',
    'ISRO deep space station orbiting the moon with Earth rising in background',
    'Modern cybernetic tiger emblem in sleek dark titanium and gold styling',
  ];

  const handleGenerate = async (targetPrompt?: string) => {
    const textToUse = targetPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToUse.trim(), style }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedUrl(data.imageUrl);
    } catch (err: any) {
      console.error('Image gen error:', err);
      setError(err?.message || 'Failed to generate visual asset. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const a = document.createElement('a');
    a.href = generatedUrl;
    a.download = `india-chatgpt-art-${Date.now()}.svg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Image & Vector Studio</h2>
              <p className="text-[11px] text-slate-400">Powered by India ChatGPT Visual Engine</p>
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Visual Prompt Description
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image or vector artwork you want to create..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Popular Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(preset);
                    handleGenerate(preset);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 text-left transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-slate-900 text-xs text-slate-300 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="futuristic">Futuristic Cyberpunk</option>
              <option value="minimalist">Minimalist Modern Vector</option>
              <option value="traditional">Indian Heritage & Gold</option>
              <option value="scientific">Technical & Isometric</option>
            </select>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Artwork</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Result Area */}
          {generatedUrl && (
            <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col items-center">
              <div className="w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                <img
                  src={generatedUrl}
                  alt="Generated Artwork"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>

                {onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(generatedUrl, prompt);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <span>Insert into Chat</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
