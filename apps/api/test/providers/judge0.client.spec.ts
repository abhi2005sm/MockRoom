import { Judge0Client } from '../../src/modules/runner/judge0.client';
import { ConfigService } from '@nestjs/config';

describe('Judge0Client Execution & Sandbox Verification', () => {
  let judge0Client: Judge0Client;

  beforeEach(() => {
    const mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'SANDBOX_URL') return 'http://localhost:2358';
        return undefined;
      }),
    } as any;
    judge0Client = new Judge0Client(mockConfig);
  });

  it('should return execution unavailable response when sandbox runner is unreachable', async () => {
    const result = await judge0Client.executeCode({
      sourceCode: 'console.log("Hello MockRoom");',
      language: 'javascript',
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('passed', 0);
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('executionUnavailable');
    expect(result.stderr).toContain('Execution unavailable');
  });

  it('should not contain hardcoded regex pass/fail stub logic', async () => {
    const codeWithErrorString = 'const msg = "error handling is essential";';
    const result = await judge0Client.executeCode({
      sourceCode: codeWithErrorString,
      language: 'javascript',
    });

    // Verify it attempts real HTTP request rather than returning hardcoded stub
    expect(result.executionUnavailable).toBe(true);
  });
});
