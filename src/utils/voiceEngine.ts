// Premium Voice Engine — Jackie Jeans AI Stylist

export type VoiceStatus = 'idle' | 'speaking' | 'listening' | 'processing' | 'error';

interface BestVoiceResult {
  voice: SpeechSynthesisVoice | null;
  name: string;
}

const PREFERRED_VOICES = [
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Guy Online (Natural)',
  'Microsoft Sonia Online (Natural)',
  'Microsoft Aria - English (United States)',
  'Microsoft Jenny - English (United States)',
  'Samantha',
  'Karen',
  'Moira',
  'Daniel',
  'Rishi',
];

const ROBOTIC_VOICES = ['Microsoft David', 'Microsoft Zira', 'Microsoft Mark', 'Alex', 'Fred', 'Victoria', 'Whisper'];

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      const v = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(v);
    };
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
  });
}

export async function getBestVoice(): Promise<BestVoiceResult> {
  if (cachedVoice) return { voice: cachedVoice, name: cachedVoice.name };

  const voices = await loadVoices();
  if (!voices.length) return { voice: null, name: 'Default' };

  // Try preferred voices in order
  for (const preferred of PREFERRED_VOICES) {
    const found = voices.find(v => v.name === preferred);
    if (found) {
      cachedVoice = found;
      return { voice: found, name: found.name };
    }
  }

  // Try any Google or Microsoft natural voice
  const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
  if (googleVoice) {
    cachedVoice = googleVoice;
    return { voice: googleVoice, name: googleVoice.name };
  }

  const msNatural = voices.find(v => v.name.includes('Microsoft') && v.name.includes('Natural') && v.lang.startsWith('en'));
  if (msNatural) {
    cachedVoice = msNatural;
    return { voice: msNatural, name: msNatural.name };
  }

  const msVoice = voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en'));
  if (msVoice && !ROBOTIC_VOICES.some(r => msVoice.name.includes(r.split(' ')[1]))) {
    cachedVoice = msVoice;
    return { voice: msVoice, name: msVoice.name };
  }

  // Any English non-robotic
  const anyEnglish = voices.find(v => v.lang.startsWith('en') && !ROBOTIC_VOICES.some(r => v.name.includes(r)));
  if (anyEnglish) {
    cachedVoice = anyEnglish;
    return { voice: anyEnglish, name: anyEnglish.name };
  }

  cachedVoice = voices[0];
  return { voice: voices[0], name: voices[0].name };
}

export function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): void {
  if (!window.speechSynthesis) {
    onError?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 1.02;
  utterance.volume = 1;
  utterance.lang = 'en-US';

  if (cachedVoice) {
    utterance.voice = cachedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onError?.();

  // Reload voices if not set
  if (!cachedVoice && voicesLoaded) {
    getBestVoice().then(({ voice }) => {
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    });
    return;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

export type SpeechCallback = {
  onResult: (transcript: string, isFinal: boolean, confidence: number) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
};

export class SpeechRecognitionEngine {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private autoRestart = false;
  private callbacks: SpeechCallback | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  static isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  init(callbacks: SpeechCallback): boolean {
    const SpeechRecog = (window.SpeechRecognition || window.webkitSpeechRecognition) as typeof SpeechRecognition;
    if (!SpeechRecog) return false;

    this.callbacks = callbacks;
    this.recognition = new SpeechRecog();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
          confidence = result[0].confidence;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        callbacks.onResult(finalTranscript.trim(), true, confidence);
      } else if (interimTranscript) {
        callbacks.onResult(interimTranscript.trim(), false, 0.5);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') {
        if (this.autoRestart) this.restart();
        return;
      }
      if (event.error === 'aborted') return;
      callbacks.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.autoRestart) {
        this.restartTimer = setTimeout(() => this.restart(), 300);
      } else {
        callbacks.onEnd();
      }
    };

    return true;
  }

  start(autoRestart = false): void {
    this.autoRestart = autoRestart;
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch {
        // Already started
      }
    }
  }

  stop(): void {
    this.autoRestart = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Already stopped
      }
    }
    this.isListening = false;
    this.callbacks?.onEnd();
  }

  private restart(): void {
    if (!this.autoRestart) return;
    try {
      this.recognition?.start();
    } catch {
      setTimeout(() => this.restart(), 500);
    }
  }

  get listening(): boolean {
    return this.isListening;
  }

  destroy(): void {
    this.autoRestart = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    try {
      this.recognition?.stop();
      this.recognition?.abort();
    } catch {
      // ignore
    }
    this.recognition = null;
  }
}

// Natural conversation acknowledgments
const ACKS = [
  'Perfect.', 'Got it.', 'Awesome.', 'Sounds good.',
  'Excellent.', 'Love it.', 'Great choice.', 'Nice!',
];

export function getRandomAck(): string {
  return ACKS[Math.floor(Math.random() * ACKS.length)];
}

export function buildConfirmPhrase(questionId: string, value: unknown): string {
  const ack = getRandomAck();
  
  switch (questionId) {
    case 'height':
      return `${ack} You're ${value as string} tall.`;
    case 'weight':
      if (!value) return "No worries, we'll skip that.";
      return `${ack} ${value} pounds, noted.`;
    case 'waist':
      return `${ack} ${value} inch waist, perfect.`;
    case 'hips':
      return `${ack} ${value} inch hips, got it.`;
    case 'waist_fit':
      return `${ack} You prefer a ${(value as string).toLowerCase()} fit at the waist.`;
    case 'rise':
      return `${ack} ${value} it is!`;
    case 'thigh_fit':
      return `${ack} ${(value as string).toLowerCase()} through the thighs.`;
    case 'brands': {
      const brands = value as string[];
      if (!brands.length) return "Okay, we'll skip that.";
      if (brands.length === 1) return `${ack} You've worn ${brands[0]} before.`;
      const last = brands[brands.length - 1];
      const others = brands.slice(0, -1).join(', ');
      return `${ack} ${others} and ${last} — great choices.`;
    }
    case 'brand_sizes':
      return `${ack} All sizes noted. Almost done!`;
    case 'frustration': {
      const fr = value as string[];
      if (!fr.length) return "Okay, got it!";
      return `${ack} ${fr.join(' and ')} — I'll keep that in mind.`;
    }
    default:
      return ack;
  }
}
