export class WebAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private onSpeakingChange?: (isSpeaking: boolean) => void;

  constructor(onSpeakingChange?: (isSpeaking: boolean) => void) {
    this.onSpeakingChange = onSpeakingChange;
  }

  /**
   * Must be called inside a user gesture event handler (e.g. click "Start Interview" or "I'm Ready")
   */
  unlockAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().then(() => {
        console.log('[WebAudioPlayer] AudioContext resumed after user gesture');
      });
    }
  }

  async playChunk(base64Chunk: string) {
    this.unlockAudio();

    if (!this.audioCtx) return;

    try {
      const binaryString = window.atob(base64Chunk);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      this.audioQueue.push(bytes.buffer);

      if (!this.isPlaying) {
        this.processQueue();
      }
    } catch (err) {
      console.warn('[WebAudioPlayer] Failed to decode audio chunk:', err);
    }
  }

  private async processQueue() {
    if (this.audioQueue.length === 0 || !this.audioCtx) {
      this.isPlaying = false;
      if (this.onSpeakingChange) this.onSpeakingChange(false);
      return;
    }

    this.isPlaying = true;
    if (this.onSpeakingChange) this.onSpeakingChange(true);

    const buffer = this.audioQueue.shift()!;
    try {
      const audioBuffer = await this.audioCtx.decodeAudioData(buffer.slice(0));
      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);
      source.onended = () => {
        this.processQueue();
      };
      source.start(0);
    } catch (err) {
      console.warn('[WebAudioPlayer] Error playing audio buffer:', err);
      this.processQueue();
    }
  }

  speakText(text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Alex'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        if (this.onSpeakingChange) this.onSpeakingChange(true);
      };

      utterance.onend = () => {
        this.isPlaying = false;
        if (this.onSpeakingChange) this.onSpeakingChange(false);
      };

      utterance.onerror = (e) => {
        console.warn('[WebAudioPlayer] SpeechSynthesis error:', e);
        this.isPlaying = false;
        if (this.onSpeakingChange) this.onSpeakingChange(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[WebAudioPlayer] SpeechSynthesis failed:', err);
    }
  }

  clearQueue() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.audioQueue = [];
    this.isPlaying = false;
    if (this.onSpeakingChange) this.onSpeakingChange(false);
  }
}

export const globalAudioPlayer = new WebAudioPlayer();
