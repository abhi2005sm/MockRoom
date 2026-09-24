export interface TtsOptions {
  text: string;
  voiceId: string;
}

export interface TtsProvider {
  synthesizeSpeech(options: TtsOptions): Promise<Buffer>;
}
