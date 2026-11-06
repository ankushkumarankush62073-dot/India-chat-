// Voice Recognition (Speech-to-Text) and Speech Synthesis (Text-to-Speech)

export class SpeechHandler {
  private recognition: any = null;
  private isListening = false;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      this.synthesis = window.speechSynthesis || null;
    }
  }

  public isSpeechSupported(): boolean {
    return Boolean(this.recognition);
  }

  public isTTSSupported(): boolean {
    return Boolean(this.synthesis);
  }

  public startListening(
    lang: string,
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition not supported in this browser.'));
      return;
    }

    try {
      this.recognition.lang = lang === 'hindi' ? 'hi-IN' : 'en-IN';
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          onResult(final, true);
        } else if (interim) {
          onResult(interim, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    this.isListening = false;
  }

  public speak(
    text: string,
    language: string,
    speed: number = 1,
    pitch: number = 1,
    onEnd?: () => void
  ) {
    if (!this.synthesis) return;

    this.stopSpeaking();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted for speech.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/#+\s+/g, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .substring(0, 1000); // Limit length for fluid response

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speed || 1;
    utterance.pitch = pitch || 1;

    // Pick best Indian voice
    const voices = this.synthesis.getVoices();
    let selectedVoice = null;

    if (language === 'hindi') {
      selectedVoice = voices.find((v) => v.lang.startsWith('hi'));
    } else {
      selectedVoice =
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return Boolean(this.synthesis && this.synthesis.speaking);
  }
}

export const speechHandler = new SpeechHandler();
