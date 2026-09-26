import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FakeSttProvider } from './providers/fake/fake.stt';
import { FakeLlmProvider } from './providers/fake/fake.llm';
import { FakeTtsProvider } from './providers/fake/fake.tts';
import { DeepgramSttProvider } from './providers/deepgram.stt';
import { ClaudeLlmProvider } from './providers/claude.llm';
import { ElevenLabsTtsProvider } from './providers/elevenlabs.tts';

function isRealKeyValid(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.length > 0 && !trimmed.startsWith('mock_');
}

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
        const useReal = config.get<string>('USE_REAL_AI_PROVIDERS') === 'true';
        const key = config.get<string>('LLM_API_KEY');

        if (useReal) {
          if (!isRealKeyValid(key)) {
            throw new Error(
              '[AiModule] CRITICAL STARTUP ERROR: USE_REAL_AI_PROVIDERS=true but LLM_API_KEY is missing or contains a mock key ("' +
                key +
                '")'
            );
          }
          return real;
        }
        return fake;
      },
      inject: [ConfigService, FakeLlmProvider, ClaudeLlmProvider],
    },
    {
      provide: 'STT_PROVIDER',
      useFactory: (config: ConfigService, fake: FakeSttProvider, real: DeepgramSttProvider) => {
        const useReal = config.get<string>('USE_REAL_AI_PROVIDERS') === 'true';
        const key = config.get<string>('STT_API_KEY');

        if (useReal) {
          if (!isRealKeyValid(key)) {
            throw new Error(
              '[AiModule] CRITICAL STARTUP ERROR: USE_REAL_AI_PROVIDERS=true but STT_API_KEY is missing or contains a mock key ("' +
                key +
                '")'
            );
          }
          return real;
        }
        return fake;
      },
      inject: [ConfigService, FakeSttProvider, DeepgramSttProvider],
    },
    {
      provide: 'TTS_PROVIDER',
      useFactory: (config: ConfigService, fake: FakeTtsProvider, real: ElevenLabsTtsProvider) => {
        const useReal = config.get<string>('USE_REAL_AI_PROVIDERS') === 'true';
        const key = config.get<string>('TTS_API_KEY');

        if (useReal) {
          if (!isRealKeyValid(key)) {
            throw new Error(
              '[AiModule] CRITICAL STARTUP ERROR: USE_REAL_AI_PROVIDERS=true but TTS_API_KEY is missing or contains a mock key ("' +
                key +
                '")'
            );
          }
          return real;
        }
        return fake;
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
export class AiModule implements OnModuleInit {
  private readonly logger = new Logger(AiModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const useReal = this.configService.get<string>('USE_REAL_AI_PROVIDERS') === 'true';
    if (useReal) {
      this.logger.log(
        '=== [AiModule Startup] Active Providers: REAL VENDOR AI PIPELINE (Claude LLM, Deepgram STT, ElevenLabs TTS) ==='
      );
    } else {
      this.logger.warn(
        '=== [AiModule Startup] Active Providers: FAKE / MOCK PIPELINE (FakeLlmProvider, FakeSttProvider, FakeTtsProvider). Set USE_REAL_AI_PROVIDERS=true in .env to enable live vendor integrations. ==='
      );
    }
  }
}
