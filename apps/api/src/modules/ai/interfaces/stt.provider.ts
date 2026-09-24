export interface SttTranscriptResult {
  text: string;
  isFinal: boolean;
  startMs: number;
  endMs: number;
}

export interface SttProvider {
  transcribeChunk(pcmBuffer: Buffer): Promise<SttTranscriptResult>;
}
