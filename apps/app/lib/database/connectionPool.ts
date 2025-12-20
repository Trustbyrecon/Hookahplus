/**
 * Database Connection Pool Configuration
 * 
 * Optimizes Prisma connection pooling for production
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

// Connection pool configuration
const connectionPoolConfig = {
  // Maximum number of connections in the pool
  maxConnections: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  
  // Minimum number of connections to keep alive
  minConnections: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  
  // Connection timeout in milliseconds
  connectionTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10000', 10),
  
  // Idle timeout in milliseconds
  idleTimeout: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '30000', 10),
};

/**
 * Create a Prisma client with optimized connection pooling
 */
export function createPrismaClient(): PrismaClient {
  const datasourceUrl = process.env.DATABASE_URL;
  
  if (!datasourceUrl) {
    logger.warn('DATABASE_URL not set, using default Prisma configuration', {
      component: 'database',
    });
    return new PrismaClient();
  }

  // Parse connection string to add pool parameters
  const url = new URL(datasourceUrl);
  
  // Add connection pool parameters
  url.searchParams.set('connection_limit', connectionPoolConfig.maxConnections.toString());
  url.searchParams.set('pool_timeout', connectionPoolConfig.connectionTimeout.toString());
  
  const optimizedUrl = url.toString();

  logger.info('Creating Prisma client with connection pooling', {
    component: 'database',
    maxConnections: connectionPoolConfig.maxConnections,
    minConnections: connectionPoolConfig.minConnections,
  });

  return new PrismaClient({
    datasources: {
      db: {
        url: optimizedUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']
      : ['error'],
  });
}

// Export singleton instance
let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (prismaInstance) {
    logger.info('Disconnecting Prisma client', { component: 'database' });
    await prismaInstance.$disconnect();
  }
});

