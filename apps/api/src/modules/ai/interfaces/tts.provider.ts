export interface TtsOptions {
  text: string;
  voiceId: string;
  onAudioChunk?: (chunk: Buffer) => void;
}

export interface TtsProvider {
  synthesizeSpeech(options: TtsOptions): Promise<Buffer>;
}
