/**
 * Faster-Whisper Service
 * Runs local faster-whisper transcription without sending audio to a third party.
 */

import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { extname, join } from 'path';

const DEFAULT_MODEL = 'base';
const MAX_PROCESS_OUTPUT_BYTES = 1024 * 1024;

export interface IUploadedAudioFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface ITranscriptionResult {
  text: string;
}

interface ITranscriptionProcessOutput {
  text: string;
}

@Injectable()
export class FasterWhisperService {
  private readonly logger = new Logger(FasterWhisperService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Transcribes an upload using the local faster-whisper Python package.
   * The temporary file is removed whether processing succeeds or fails.
   */
  async transcribe(
    file: IUploadedAudioFile,
    language?: string,
  ): Promise<ITranscriptionResult> {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'the-brain-transcription-'));
    const extension = extname(file.originalname) || '.webm';
    const audioPath = join(temporaryDirectory, `upload${extension}`);

    try {
      await writeFile(audioPath, file.buffer);
      return await this.runProcess(audioPath, language);
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  }

  /** Runs the Python bridge and validates its JSON response. */
  private runProcess(audioPath: string, language?: string): Promise<ITranscriptionResult> {
    const pythonExecutable = this.configService.get<string>(
      'FASTER_WHISPER_PYTHON_PATH',
      'python3',
    );
    const model = this.configService.get<string>('FASTER_WHISPER_MODEL', DEFAULT_MODEL);
    const scriptPath = join(process.cwd(), 'scripts', 'transcribe-with-faster-whisper.py');
    const processArguments = ['--file', audioPath, '--model', model];

    if (language) {
      processArguments.push('--language', language);
    }

    return new Promise<ITranscriptionResult>((resolve, reject) => {
      const process = spawn(pythonExecutable, [scriptPath, ...processArguments]);
      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let outputSize = 0;

      process.stdout.on('data', (chunk: Buffer) => {
        outputSize += chunk.length;
        if (outputSize <= MAX_PROCESS_OUTPUT_BYTES) {
          stdoutChunks.push(chunk);
        }
      });
      process.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));
      process.on('error', (error: Error) => {
        this.logger.error(`Unable to start faster-whisper: ${error.message}`, error.stack);
        reject(new BadGatewayException('Local speech-to-text service could not start'));
      });
      process.on('close', (exitCode: number | null) => {
        if (outputSize > MAX_PROCESS_OUTPUT_BYTES || exitCode !== 0) {
          const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();
          this.logger.error(`faster-whisper failed (exit ${exitCode}): ${stderr}`);
          reject(
            new BadGatewayException(
              'Local transcription failed. Ensure the faster-whisper model is installed.',
            ),
          );
          return;
        }

        const output = Buffer.concat(stdoutChunks).toString('utf8');
        const parsed = this.parseProcessOutput(output);
        if (!parsed) {
          reject(new BadGatewayException('Local transcription returned an invalid response'));
          return;
        }

        resolve(parsed);
      });
    });
  }

  /** Safely validates the Python bridge's standard-output JSON. */
  private parseProcessOutput(output: string): ITranscriptionProcessOutput | undefined {
    try {
      const parsed: unknown = JSON.parse(output);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'text' in parsed &&
        typeof parsed.text === 'string'
      ) {
        return { text: parsed.text };
      }
    } catch {
      return undefined;
    }

    return undefined;
  }
}
