export interface SttTranscriptResult {
  text: string;
  isFinal: boolean;
  startMs: number;
  endMs: number;
  words?: Array<{ word: string; startMs: number; endMs: number; confidence?: number }>;
}

export interface SttProvider {
  transcribeChunk(pcmBuffer: Buffer): Promise<SttTranscriptResult>;
}
