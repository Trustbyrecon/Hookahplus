// Mock Prisma client for development when database is not available
let prisma: any = null;

try {
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined
  }

  prisma = globalForPrisma.prisma ?? new PrismaClient()

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} catch (error) {
  console.warn('Prisma not available, using mock client');
  
  // Mock Prisma client for when database is not available
  prisma = {
    session: {
      findUnique: async () => null,
      update: async (data: any) => ({ ...data.where, ...data.data }),
      create: async (data: any) => ({ id: 'mock-id', ...data.data }),
    },
    sessionTransition: {
      create: async (data: any) => ({ id: 'mock-transition-id', ...data.data }),
    }
  };
}

export { prisma };
