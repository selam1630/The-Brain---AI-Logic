import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed database with initial data
 * Run with: npm run seed
 */
async function main() {
  console.log('Starting database seed...');

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@thebrain.com' },
    update: {},
    create: {
      email: 'demo@thebrain.com',
      name: 'Demo User',
      password: 'hashed_demo_password',
      language: 'en',
      theme: 'light',
      preferences: {
        create: {
          theme: 'light',
          language: 'en',
          autoSave: true,
          privacy: 'private',
        },
      },
    },
  });

  console.log(`✓ Created user: ${user.email}`);

  // Create sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Welcome to The Brain',
      description: 'Your first conversation',
    },
  });

  console.log(`✓ Created conversation: ${conversation.id}`);

  console.log('Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
