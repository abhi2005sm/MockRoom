import { Module } from '@nestjs/common';
import { FakeSttProvider } from './providers/fake/fake.stt';
import { FakeLlmProvider } from './providers/fake/fake.llm';
import { FakeTtsProvider } from './providers/fake/fake.tts';
import { DeepgramSttProvider } from './providers/deepgram.stt';
import { ClaudeLlmProvider } from './providers/claude.llm';
import { ElevenLabsTtsProvider } from './providers/elevenlabs.tts';

@Module({
  providers: [
    FakeSttProvider,
    FakeLlmProvider,
    FakeTtsProvider,
    DeepgramSttProvider,
    ClaudeLlmProvider,
    ElevenLabsTtsProvider,
  ],
  exports: [
    FakeSttProvider,
    FakeLlmProvider,
    FakeTtsProvider,
    DeepgramSttProvider,
    ClaudeLlmProvider,
    ElevenLabsTtsProvider,
  ],
})
export class AiModule {}
