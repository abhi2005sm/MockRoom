import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    {
      provide: 'LLM_PROVIDER',
      useFactory: (config: ConfigService, fake: FakeLlmProvider, real: ClaudeLlmProvider) => {
        const useReal =
          config.get<string>('USE_REAL_AI_PROVIDERS') === 'true' ||
          !!config.get<string>('LLM_API_KEY');
        return useReal ? real : fake;
      },
      inject: [ConfigService, FakeLlmProvider, ClaudeLlmProvider],
    },
    {
      provide: 'STT_PROVIDER',
      useFactory: (config: ConfigService, fake: FakeSttProvider, real: DeepgramSttProvider) => {
        const useReal =
          config.get<string>('USE_REAL_AI_PROVIDERS') === 'true' ||
          !!config.get<string>('STT_API_KEY');
        return useReal ? real : fake;
      },
      inject: [ConfigService, FakeSttProvider, DeepgramSttProvider],
    },
    {
      provide: 'TTS_PROVIDER',
      useFactory: (config: ConfigService, fake: FakeTtsProvider, real: ElevenLabsTtsProvider) => {
        const useReal =
          config.get<string>('USE_REAL_AI_PROVIDERS') === 'true' ||
          !!config.get<string>('TTS_API_KEY');
        return useReal ? real : fake;
      },
      inject: [ConfigService, FakeTtsProvider, ElevenLabsTtsProvider],
    },
  ],
  exports: [
    FakeSttProvider,
    FakeLlmProvider,
    FakeTtsProvider,
    DeepgramSttProvider,
    ClaudeLlmProvider,
    ElevenLabsTtsProvider,
    'LLM_PROVIDER',
    'STT_PROVIDER',
    'TTS_PROVIDER',
  ],
})
export class AiModule {}
