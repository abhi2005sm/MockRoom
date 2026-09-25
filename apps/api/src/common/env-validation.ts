import { Logger } from '@nestjs/common';

export function validateEnvironment() {
  const logger = new Logger('EnvValidation');
  const useRealProviders =
    process.env.USE_REAL_AI_PROVIDERS === 'true' ||
    process.env.NODE_ENV === 'production';

  const baseRequired = ['DATABASE_URL', 'REDIS_URL', 'ALLOWED_ORIGINS'];
  const providerRequired = [
    'LLM_API_KEY',
    'STT_API_KEY',
    'TTS_API_KEY',
    'SANDBOX_URL',
  ];

  const missing: string[] = [];

  for (const envVar of baseRequired) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (useRealProviders) {
    for (const envVar of providerRequired) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(`[EnvValidation] Startup failure: ${msg}`);
    throw new Error(`[EnvValidation] Startup failure: ${msg}`);
  }

  logger.log(
    `[EnvValidation] Environment check passed. Mode: ${
      useRealProviders ? 'Real AI Providers Enabled' : 'Dev/Fake Providers Allowed'
    }`
  );
}
