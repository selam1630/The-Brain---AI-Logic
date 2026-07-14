# The Brain - AI & Logic Platform

A full-stack Speech-to-Text and AI Logic platform built with **NestJS**, **Next.js**, and **PostgreSQL**.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guidelines](#development-guidelines)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [GDPR & Compliance](#gdpr--compliance)
- [Contributing](#contributing)

---

## Overview

**The Brain** is an enterprise-grade Speech-to-Text platform that:

- Converts real-time audio/video streams into accurate, normalized text transcripts
- Provides a clean, modern UI with dark/light mode support
- Ensures GDPR compliance and data privacy
- Supports multiple languages (8+ languages including Amharic)
- Includes comprehensive testing and production-ready architecture

### Key Features

✅ Real-time audio/video transcription  
✅ Automatic text normalization  
✅ Multi-language support (i18n)  
✅ Dark/Light theme with Tailwind CSS  
✅ End-to-end encryption  
✅ GDPR compliant  
✅ Jest unit & integration tests  
✅ Production-ready deployment  

---

## Tech Stack

### Backend
- **NestJS** (v10+) - Server framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database (Neon)
- **Jest** - Testing framework
- **class-validator** - Input validation
- **Passport** - Authentication

### Frontend
- **Next.js** (v14+) - React framework
- **React** 18+ - UI library
- **Tailwind CSS** - Styling
- **next-themes** - Dark mode support
- **Axios** - HTTP client
- **Zustand** - State management

### Tools & Utilities
- **TypeScript** - Type safety
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Prisma CLI** - Database management

---

## Project Structure

```
the-brain-ai-logic/
├── apps/
│   ├── backend/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   └── prisma/         # Database service
│   │   │   └── modules/
│   │   │       └── chat-to-text/   # Main module
│   │   │           ├── dtos/       # Data Transfer Objects
│   │   │           ├── chat-to-text.module.ts
│   │   │           ├── chat-to-text.service.ts
│   │   │           ├── chat-to-text.controller.ts
│   │   │           ├── chat-to-text.service.spec.ts
│   │   │           └── chat-to-text.controller.spec.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema
│   │   │   └── seed.ts             # Database seeding
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── jest.config.js
│   │   └── .env.example
│   │
│   └── frontend/                   # Next.js frontend
│       ├── src/
│       │   ├── pages/
│       │   │   ├── _app.tsx        # App wrapper
│       │   │   ├── _document.tsx   # HTML setup
│       │   │   ├── index.tsx       # Home page
│       │   │   └── chat-to-text.tsx # Main feature
│       │   ├── components/
│       │   │   ├── ThemeProvider.tsx
│       │   │   └── ThemeToggle.tsx
│       │   ├── styles/
│       │   │   └── globals.css     # Tailwind & custom CSS
│       │   ├── hooks/
│       │   ├── store/
│       │   ├── types/
│       │   └── utils/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       └── postcss.config.js
│
├── packages/
│   └── shared/                     # Shared code
│       ├── types/
│       │   └── index.ts            # Common types
│       ├── i18n.ts                 # i18n configuration
│       ├── gdpr.ts                 # GDPR utilities
│       └── package.json
│
├── .env.example
├── .gitignore
├── package.json                    # Root monorepo config
└── README.md                       # This file
```

---

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm 10+ or yarn
- PostgreSQL 14+ (or Neon database)
- Git

### Installation

1. **Clone the repository** (or initialize from template)
   ```bash
   cd "The Brain - AI & Logic"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database (Neon PostgreSQL)
   DATABASE_URL=postgresql://user:password@host/database

   # Frontend
   NEXT_PUBLIC_API_URL=http://localhost:3001

   # Backend
   PORT=3001
   NODE_ENV=development

   # Local Speech-to-Text (faster-whisper)
   FASTER_WHISPER_PYTHON_PATH=python3
   FASTER_WHISPER_MODEL=base
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Both frontend and backend
   npm run dev

   # Or separately
   npm run dev:backend    # http://localhost:3001
   npm run dev:frontend   # http://localhost:3000
   ```

### Verify Installation

- Frontend: Visit http://localhost:3000
- Backend API: Visit http://localhost:3001/health
- API Docs: http://localhost:3001/api/v1/api-docs (Swagger - optional)

---

## Development Guidelines

### Code Quality Standards

#### 1. **No `any` Type Usage**
❌ FORBIDDEN
```typescript
const data: any = response.data;
```

✅ CORRECT
```typescript
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = response.data;
```

#### 2. **Type Safety**
- Always use interfaces or types
- Use strict mode in TypeScript (`strict: true`)
- Enable `noImplicitAny` in tsconfig.json

#### 3. **Clean Code Architecture**

**Backend (NestJS)**
```typescript
// Module structure
module/
├── module.ts          # Module definition
├── service.ts         # Business logic
├── controller.ts      # API endpoints
├── dtos/
│   ├── create.dto.ts
│   ├── update.dto.ts
│   └── index.ts
└── *.spec.ts         # Tests
```

**Frontend (Next.js)**
```typescript
// Component structure
components/
├── MyComponent.tsx         # Component file
├── MyComponent.module.css  # Scoped styles
└── MyComponent.test.tsx    # Tests

pages/
├── index.tsx              # Page component
└── [slug].tsx             # Dynamic routes
```

#### 4. **Naming Conventions**

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `chat-to-text.service.ts` |
| Classes | PascalCase | `ChatToTextService` |
| Functions | camelCase | `createTranscript()` |
| Constants | UPPER_SNAKE_CASE | `MAX_AUDIO_DURATION` |
| Interfaces | PrefixWithI | `ITranscript` |
| Enums | PascalCase | `TranscriptStatus` |

#### 5. **Comment & Documentation Standards**

Use TSDoc comments for all public APIs:

```typescript
/**
 * Creates a new transcript from audio/video
 * 
 * @param createTranscriptDto - Transcript creation payload
 * @returns {Promise<Transcript>} Created transcript record
 * @throws {NotFoundException} If conversation not found
 * 
 * @example
 * const transcript = await service.create({
 *   conversationId: 'conv_123',
 *   rawText: 'Hello world',
 *   language: 'en'
 * });
 */
async create(createTranscriptDto: CreateTranscriptDto): Promise<Transcript> {
  // Implementation
}
```

#### 6. **Error Handling**

```typescript
// Use NestJS built-in exceptions
throw new NotFoundException(`Transcript with ID ${id} not found`);
throw new BadRequestException('Invalid input data');
throw new UnauthorizedException('Access denied');

// Log errors properly
this.logger.error(`Error message: ${error.message}`, error.stack);
```

#### 7. **Validation**

**Backend - Use class-validator:**
```typescript
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateTranscriptDto {
  @IsString()
  conversationId: string;

  @IsString()
  rawText: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}
```

**Frontend - Use React hook form + Zod/class-validator:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    email: '',
    language: 'en',
  },
});
```

### Git Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feat/the-brain-chat-to-text
   ```

2. **Follow conventional commits**
   ```
   feat: Add speech-to-text transcription
   fix: Correct text normalization logic
   docs: Update README with setup guide
   test: Add integration tests for API
   refactor: Improve error handling
   ```

3. **Commit early and often**
   ```bash
   git commit -m "feat: Implement transcript creation endpoint"
   ```

4. **Push and create PR**
   ```bash
   git push origin feat/the-brain-chat-to-text
   ```

### Pre-commit Checklist

- [ ] Code follows styling guidelines (Prettier, ESLint)
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] No console.log() statements
- [ ] Comments are clear and accurate
- [ ] No hardcoded API keys or secrets
- [ ] Performance is acceptable
- [ ] No accessibility violations (WCAG 2.1 AA)

---

## API Documentation

### Chat-to-Text Endpoints

#### 1. Transcribe an Audio or Video File

```http
POST /api/v1/chat-to-text/transcribe
Content-Type: multipart/form-data

file=@recording.webm
conversationId=your_conversation_id
language=en
```

- Accepts `aac`, `flac`, `m4a`, `mp3`, `mp4`, `ogg`, `wav`, and `webm` containers up to 25 MB.
- The backend transcribes the upload locally with faster-whisper, normalizes the returned text, and persists a `Transcript` plus linked conversation `Message`.
- Raw audio is used only for local processing, then deleted; it is not stored in the database.

#### 2. Create Transcript
```http
POST /api/v1/chat-to-text
Content-Type: application/json

{
  "conversationId": "conv_123",
  "rawText": "Hello world",
  "language": "en",
  "audioUrl": "https://example.com/audio.mp3",
  "duration": 5000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "transcript_456",
    "conversationId": "conv_123",
    "rawText": "Hello world",
    "normalizedText": "Hello world.",
    "language": "en",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Transcript created successfully"
}
```

#### 2. Get Transcript by ID
```http
GET /api/v1/chat-to-text/:id
```

#### 3. Get Transcripts for Conversation
```http
GET /api/v1/chat-to-text/conversation/:conversationId
```

#### 4. Update Transcript
```http
PATCH /api/v1/chat-to-text/:id
Content-Type: application/json

{
  "rawText": "Updated text"
}
```

#### 5. Delete Transcript
```http
DELETE /api/v1/chat-to-text/:id
```

#### 6. Get Conversation History
```http
GET /api/v1/chat-to-text/history/:conversationId
```

#### 7. Get Conversation Statistics
```http
GET /api/v1/chat-to-text/stats/:conversationId
```

---

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

### Backend Tests
```bash
npm run test:backend

# Specific test file
npm run test -- chat-to-text.service.spec.ts
```

### Frontend Tests
```bash
npm run test:frontend
```

### Test Coverage Requirements

- **Minimum**: 80% coverage
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Example Test Structure

```typescript
describe('ChatToTextService', () => {
  let service: ChatToTextService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ChatToTextService, PrismaService],
    }).compile();
    
    service = module.get<ChatToTextService>(ChatToTextService);
  });

  describe('create', () => {
    it('should create a transcript', async () => {
      const result = await service.create(mockDto);
      expect(result).toBeDefined();
      expect(result.normalizedText).toBe('Hello world.');
    });

    it('should throw error if conversation not found', async () => {
      await expect(service.create(invalidDto)).rejects.toThrow();
    });
  });
});
```

---

## Production Deployment

### Build for Production

```bash
# Build all apps
npm run build

# Build backend only
npm run build -w apps/backend

# Build frontend only
npm run build -w apps/frontend
```

### Environment Variables for Production

Create `.env.production`:
```env
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=postgresql://user:password@prod-host/database

# Frontend
NEXT_PUBLIC_API_URL=https://api.thebrain.com
NEXT_PUBLIC_APP_URL=https://www.thebrain.com

# Security
JWT_SECRET=very-long-random-secret-key
CORS_ORIGIN=https://www.thebrain.com
```

### Docker Deployment

Backend Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "prod"]
```

Frontend Dockerfile:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Performance Optimization

- ✅ Enable gzip compression
- ✅ Use CDN for static assets
- ✅ Implement caching strategies
- ✅ Optimize database queries with indexes
- ✅ Use connection pooling (PgBouncer)
- ✅ Enable HTTP/2
- ✅ Minify and bundle assets

---

## GDPR & Compliance

### Data Protection

All user data is protected with:
- **End-to-end encryption** for audio/video files
- **SSL/TLS** for data in transit
- **Database encryption** at rest
- **Regular backups** with encryption

### User Rights (GDPR)

Implemented endpoints for:
- ✅ **Right to Access**: Export all user data
- ✅ **Right to Deletion**: Delete account and data
- ✅ **Right to Rectification**: Update personal data
- ✅ **Right to Portability**: Export data in standard format

### Privacy Policy

Available at: `/api/v1/privacy-policy`

### Cookie Consent

Implemented using localStorage for theme preference:
```javascript
localStorage.setItem('the-brain-theme', 'dark');
localStorage.setItem('the-brain-language', 'en');
```

---

## Contributing

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows all guidelines above
- [ ] No `any` types used
- [ ] Tests written and passing
- [ ] No console.log() or debug code
- [ ] Comments are accurate and helpful
- [ ] Security best practices followed
- [ ] Performance is acceptable
- [ ] No sensitive data in code

### Issues & Bug Reports

Use the following format:
```markdown
**Description**: Brief description

**Steps to Reproduce**:
1. 
2.
3.

**Expected Behavior**: What should happen

**Actual Behavior**: What happens instead

**Screenshots**: If applicable

**Environment**:
- OS: 
- Node version:
- Browser:
```

---

## FAQ

**Q: Can I use `any` type?**  
A: No. Use specific types or interfaces always.

**Q: How do I add a new feature?**  
A: Create a feature branch, implement with tests, and submit a PR.

**Q: Where are API keys stored?**  
A: In `.env.local` (never commit `.env` file). Use environment variables in production.

**Q: How do I contribute translations?**  
A: Add language to `packages/shared/i18n.ts` with complete translations.

---

## Support

For questions or issues:
- 📧 Email: support@thebrain.com
- 🐛 Bug Reports: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## License

MIT License - See LICENSE file for details

---

**Last Updated**: January 2024  
**Version**: 1.0.0
