/**
 * Chat-to-Text Service Unit Tests
 * Comprehensive Jest test suite for ChatToTextService
 * Tests all core functionality including:
 * - Transcript creation and validation
 * - Text normalization
 * - Database operations (CRUD)
 * - Error handling
 * - Conversation history retrieval
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChatToTextService } from './chat-to-text.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateTranscriptDto } from './dtos';
import { TranscriptStatus } from '@prisma/client';

describe('ChatToTextService', () => {
  let service: ChatToTextService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    conversation: {
      findUnique: jest.fn(),
    },
    transcript: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockConversation = {
    id: 'conv_123',
    userId: 'user_123',
    title: 'Test Conversation',
    description: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTranscript = {
    id: 'transcript_123',
    conversationId: 'conv_123',
    audioUrl: 'https://example.com/audio.mp3',
    videoUrl: null,
    duration: 5000,
    rawText: 'hello world',
    normalizedText: 'Hello world.',
    language: 'en',
    confidence: 0.95,
    provider: 'web-speech-api',
    processingTime: 2000,
    status: TranscriptStatus.COMPLETED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatToTextService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ChatToTextService>(ChatToTextService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: string): string | undefined => {
        if (key === 'OPENAI_API_KEY') {
          return 'test-api-key';
        }
        return defaultValue;
      },
    );
  });

  describe('create', () => {
    it('should successfully create a transcript', async () => {
      const createDto: CreateTranscriptDto = {
        conversationId: 'conv_123',
        rawText: 'hello world',
        language: 'en',
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.transcript.create.mockResolvedValue(mockTranscript);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTranscript);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
      });
      expect(mockPrismaService.transcript.create).toHaveBeenCalled();
      expect(mockPrismaService.transcript.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messages: expect.objectContaining({
              create: expect.objectContaining({ content: 'Hello world.' }),
            }),
          }),
        }),
      );
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      const createDto: CreateTranscriptDto = {
        conversationId: 'invalid_conv',
        rawText: 'hello world',
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should normalize text when creating transcript', async () => {
      const createDto: CreateTranscriptDto = {
        conversationId: 'conv_123',
        rawText: '  hello   world  ',
        language: 'en',
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.transcript.create.mockResolvedValue({
        ...mockTranscript,
        rawText: createDto.rawText,
        normalizedText: 'Hello world.',
      });

      await service.create(createDto);

      const createCall = mockPrismaService.transcript.create.mock.calls[0];
      expect(createCall[0].data.normalizedText).toBe('Hello world.');
    });
  });

  describe('findById', () => {
    it('should find transcript by id', async () => {
      mockPrismaService.transcript.findUnique.mockResolvedValue(mockTranscript);

      const result = await service.findById('transcript_123');

      expect(result).toEqual(mockTranscript);
      expect(mockPrismaService.transcript.findUnique).toHaveBeenCalledWith({
        where: { id: 'transcript_123' },
        include: {
          conversation: true,
          messages: true,
        },
      });
    });

    it('should throw NotFoundException if transcript does not exist', async () => {
      mockPrismaService.transcript.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid_id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByConversation', () => {
    it('should find all transcripts for a conversation', async () => {
      const transcripts = [mockTranscript, { ...mockTranscript, id: 'transcript_124' }];
      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.transcript.findMany.mockResolvedValue(transcripts);

      const result = await service.findByConversation('conv_123');

      expect(result).toEqual(transcripts);
      expect(mockPrismaService.transcript.findMany).toHaveBeenCalledWith({
        where: { conversationId: 'conv_123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findByConversation('invalid_conv')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing transcript', async () => {
      const updateDto = { rawText: 'updated text' };
      const updatedTranscript = {
        ...mockTranscript,
        rawText: 'updated text',
        normalizedText: 'Updated text.',
      };

      mockPrismaService.transcript.findUnique.mockResolvedValue(mockTranscript);
      mockPrismaService.transcript.update.mockResolvedValue(updatedTranscript);

      const result = await service.update('transcript_123', updateDto);

      expect(result).toEqual(updatedTranscript);
      expect(mockPrismaService.transcript.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if transcript does not exist', async () => {
      mockPrismaService.transcript.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid_id', { rawText: 'test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a transcript', async () => {
      mockPrismaService.transcript.findUnique.mockResolvedValue(mockTranscript);
      mockPrismaService.transcript.delete.mockResolvedValue(mockTranscript);

      const result = await service.delete('transcript_123');

      expect(result).toEqual(mockTranscript);
      expect(mockPrismaService.transcript.delete).toHaveBeenCalledWith({
        where: { id: 'transcript_123' },
      });
    });

    it('should throw NotFoundException if transcript does not exist', async () => {
      mockPrismaService.transcript.findUnique.mockResolvedValue(null);

      await expect(service.delete('invalid_id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversationHistory', () => {
    it('should retrieve full conversation history', async () => {
      const history = {
        ...mockConversation,
        transcripts: [mockTranscript],
        messages: [],
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(history);

      const result = await service.getConversationHistory('conv_123');

      expect(result).toEqual(history);
      expect(mockPrismaService.conversation.findUnique).toHaveBeenCalledWith({
        where: { id: 'conv_123' },
        include: {
          transcripts: { orderBy: { createdAt: 'desc' } },
          messages: { orderBy: { createdAt: 'asc' } },
          user: { select: { id: true, email: true, name: true } },
        },
      });
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrismaService.conversation.findUnique.mockResolvedValue(null);

      await expect(service.getConversationHistory('invalid_conv')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('should calculate conversation statistics', async () => {
      const transcripts = [
        { ...mockTranscript, status: TranscriptStatus.COMPLETED, duration: 5000 },
        { ...mockTranscript, id: 'transcript_124', status: TranscriptStatus.COMPLETED, duration: 3000 },
        {
          ...mockTranscript,
          id: 'transcript_125',
          status: TranscriptStatus.FAILED,
          duration: undefined,
        },
      ];

      mockPrismaService.transcript.findMany.mockResolvedValue(transcripts);

      const result = await service.getStatistics('conv_123');

      expect(result).toEqual({
        totalTranscripts: 3,
        completedTranscripts: 2,
        failedTranscripts: 1,
        pendingTranscripts: 0,
        processingTranscripts: 0,
        totalDuration: 8000,
        languages: ['en'],
      });
    });
  });

  describe('Text Normalization', () => {
    it('should normalize text correctly', async () => {
      const createDto: CreateTranscriptDto = {
        conversationId: 'conv_123',
        rawText: '  hello   world!!!  ',
        language: 'en',
      };

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);

      await service.create(createDto);

      const createCall = mockPrismaService.transcript.create.mock.calls[0];
      const normalizedText = createCall[0].data.normalizedText;

      expect(normalizedText).toMatch(/^[A-Z]/); // Starts with capital
      expect(normalizedText).not.toContain('  '); // No double spaces
      expect(normalizedText.match(/!/g)?.length || 0).toBeLessThanOrEqual(1); // No multiple !
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe with OpenAI and persist the normalized transcript', async () => {
      const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ text: '  hello from audio  ' }), { status: 200 }),
      );

      mockPrismaService.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrismaService.transcript.create.mockResolvedValue(mockTranscript);

      const result = await service.transcribeAudio(
        {
          buffer: Buffer.from('audio bytes'),
          mimetype: 'audio/webm',
          originalname: 'recording.webm',
          size: 11,
        },
        { conversationId: 'conv_123', language: 'en' },
      );

      expect(result).toEqual(mockTranscript);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-key' },
          method: 'POST',
        }),
      );
      expect(mockPrismaService.transcript.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            normalizedText: 'Hello from audio.',
            provider: 'openai',
          }),
        }),
      );
      fetchMock.mockRestore();
    });
  });
});
