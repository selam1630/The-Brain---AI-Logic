
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ChatToTextController } from './chat-to-text.controller';
import { ChatToTextService } from './chat-to-text.service';
import { TranscriptStatus } from '@prisma/client';

describe('ChatToTextController (Integration)', () => {
  let app: INestApplication;
  let chatToTextService: ChatToTextService;

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ChatToTextController],
      providers: [
        {
          provide: ChatToTextService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByConversation: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getConversationHistory: jest.fn(),
            getStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    chatToTextService = moduleFixture.get<ChatToTextService>(ChatToTextService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /chat-to-text', () => {
    it('should create a new transcript', async () => {
      const createDto = {
        conversationId: 'conv_123',
        rawText: 'hello world',
        language: 'en',
      };

      jest.spyOn(chatToTextService, 'create').mockResolvedValue(mockTranscript);

      const response = await request(app.getHttpServer())
        .post('/chat-to-text')
        .send(createDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(JSON.parse(JSON.stringify(mockTranscript)));
      expect(chatToTextService.create).toHaveBeenCalledWith(createDto);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        // Missing conversationId and rawText
        language: 'en',
      };

      await request(app.getHttpServer())
        .post('/chat-to-text')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /chat-to-text/:id', () => {
    it('should retrieve a transcript by id', async () => {
      jest.spyOn(chatToTextService, 'findById').mockResolvedValue(mockTranscript);

      const response = await request(app.getHttpServer())
        .get('/chat-to-text/transcript_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(JSON.parse(JSON.stringify(mockTranscript)));
      expect(chatToTextService.findById).toHaveBeenCalledWith('transcript_123');
    });
  });

  describe('GET /chat-to-text/conversation/:conversationId', () => {
    it('should retrieve all transcripts for a conversation', async () => {
      const transcripts = [mockTranscript];
      jest
        .spyOn(chatToTextService, 'findByConversation')
        .mockResolvedValue(transcripts);

      const response = await request(app.getHttpServer())
        .get('/chat-to-text/conversation/conv_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(JSON.parse(JSON.stringify(transcripts)));
      expect(response.body.count).toBe(1);
    });
  });

  describe('PATCH /chat-to-text/:id', () => {
    it('should update a transcript', async () => {
      const updateDto = { rawText: 'updated text' };
      const updatedTranscript = {
        ...mockTranscript,
        rawText: 'updated text',
      };

      jest.spyOn(chatToTextService, 'update').mockResolvedValue(updatedTranscript);

      const response = await request(app.getHttpServer())
        .patch('/chat-to-text/transcript_123')
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(JSON.parse(JSON.stringify(updatedTranscript)));
      expect(chatToTextService.update).toHaveBeenCalledWith(
        'transcript_123',
        updateDto,
      );
    });
  });

  describe('DELETE /chat-to-text/:id', () => {
    it('should delete a transcript', async () => {
      jest.spyOn(chatToTextService, 'delete').mockResolvedValue(mockTranscript);

      const response = await request(app.getHttpServer())
        .delete('/chat-to-text/transcript_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(chatToTextService.delete).toHaveBeenCalledWith('transcript_123');
    });
  });

  describe('GET /chat-to-text/history/:conversationId', () => {
    it('should retrieve conversation history', async () => {
      const history = {
        id: 'conv_123',
        userId: 'user_123',
        title: 'Test Conversation',
        description: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        transcripts: [mockTranscript],
        messages: [],
        user: {
          id: 'user_123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      jest
        .spyOn(chatToTextService, 'getConversationHistory')
        .mockResolvedValue(history);

      const response = await request(app.getHttpServer())
        .get('/chat-to-text/history/conv_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(JSON.parse(JSON.stringify(history)));
    });
  });

  describe('GET /chat-to-text/stats/:conversationId', () => {
    it('should retrieve conversation statistics', async () => {
      const stats = {
        totalTranscripts: 1,
        completedTranscripts: 1,
        failedTranscripts: 0,
        pendingTranscripts: 0,
        processingTranscripts: 0,
        totalDuration: 5000,
        languages: ['en'],
      };

      jest.spyOn(chatToTextService, 'getStatistics').mockResolvedValue(stats);

      const response = await request(app.getHttpServer())
        .get('/chat-to-text/stats/conv_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(stats);
    });
  });
});
