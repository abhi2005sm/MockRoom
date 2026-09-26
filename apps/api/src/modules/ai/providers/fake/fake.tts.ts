import { Injectable, Logger } from '@nestjs/common';
import { TtsProvider, TtsOptions } from '../../interfaces/tts.provider';

function createWavBuffer(durationSec = 1.5, sampleRate = 16000): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * durationSec);
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const frequency = 440;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.15 * 32767;
    buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
  }

  return buffer;
}

@Injectable()
export class FakeTtsProvider implements TtsProvider {
  private readonly logger = new Logger(FakeTtsProvider.name);

  async synthesizeSpeech(options: TtsOptions): Promise<Buffer> {
    const buffer = createWavBuffer(1.5);
    this.logger.log(`[FakeTtsProvider] Generated decodable fake WAV audio chunk of ${buffer.length} bytes`);
    if (options.onAudioChunk) {
      options.onAudioChunk(buffer);
    }
    return buffer;
  }
}
