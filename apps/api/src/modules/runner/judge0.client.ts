import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CodeSubmissionInput {
  sourceCode: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  stdin?: string;
  expectedOutput?: string;
}

export interface CodeExecutionResult {
  passed: number;
  total: number;
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number;
  executionUnavailable?: boolean;
  statusDescription?: string;
}

const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 63, // Node.js
  python: 71, // Python 3.8+
  java: 62, // OpenJDK
  cpp: 54, // GCC
};

@Injectable()
export class Judge0Client {
  private readonly logger = new Logger(Judge0Client.name);

  constructor(private readonly configService: ConfigService) {}

  async executeCode(input: CodeSubmissionInput): Promise<CodeExecutionResult> {
    const sandboxUrl =
      this.configService.get<string>('SANDBOX_URL') ||
      process.env.SANDBOX_URL ||
      'http://localhost:2358';

    const languageId = LANGUAGE_ID_MAP[input.language] || 63;

    this.logger.log(
      `[Judge0Client] Submitting ${input.language} (id: ${languageId}) code to sandbox at ${sandboxUrl}`
    );

    const payload = {
      source_code: input.sourceCode,
      language_id: languageId,
      stdin: input.stdin || '',
      expected_output: input.expectedOutput || null,
      cpu_time_limit: 5.0, // 5 seconds CPU limit per TRD
      memory_limit: 256000, // 256MB memory limit per TRD
      wall_time_limit: 10.0,
      max_file_size: 1024,
      enable_network: false, // No network access per TRD
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`${sandboxUrl}/submissions?wait=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text();
        this.logger.warn(`[Judge0Client] Sandbox returned HTTP ${response.status}: ${errBody}`);
        return {
          passed: 0,
          total: 1,
          stdout: '',
          stderr: `Execution unavailable: Sandbox HTTP ${response.status}`,
          timeMs: 0,
          memoryKb: 0,
          executionUnavailable: true,
          statusDescription: `HTTP ${response.status}`,
        };
      }

      const resData = await response.json();

      // Map Judge0 status IDs:
      // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compile Error, 7-12 = Runtime Error
      const statusId = resData.status?.id || 0;
      const statusDescription = resData.status?.description || 'Unknown Status';
      const stdout = resData.stdout || '';
      const stderr =
        resData.stderr ||
        resData.compile_output ||
        (statusId !== 3 ? `Judge0: ${statusDescription}` : '');
      const timeMs = Math.round(parseFloat(resData.time || '0') * 1000);
      const memoryKb = resData.memory || 0;

      let passed = 0;
      let total = 1;

      if (statusId === 3) {
        passed = 1;
        total = 1;
      }

      this.logger.log(
        `[Judge0Client] Execution result for ${input.language}: status="${statusDescription}" (${statusId}), time=${timeMs}ms, memory=${memoryKb}KB`
      );

      return {
        passed,
        total,
        stdout,
        stderr,
        timeMs,
        memoryKb,
        executionUnavailable: false,
        statusDescription,
      };
    } catch (err: any) {
      this.logger.error(
        `[Judge0Client] Sandbox request failed for ${sandboxUrl}: ${err.message}`
      );

      return {
        passed: 0,
        total: 1,
        stdout: '',
        stderr: `Execution unavailable: Unable to connect to Judge0 sandbox runner at ${sandboxUrl} (${err.message})`,
        timeMs: 0,
        memoryKb: 0,
        executionUnavailable: true,
        statusDescription: 'Service Unavailable',
      };
    }
  }
}
