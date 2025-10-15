# 🗄️ Production Database Setup Guide

## **Step 5: Configure production database**

### **5.1 Database Options**

#### **Option A: Vercel Postgres (Recommended)**
- **Pros**: Integrated with Vercel, automatic scaling, managed service
- **Cons**: Vendor lock-in, limited customization
- **Cost**: Pay-per-use, starts at $20/month

#### **Option B: Supabase (Recommended)**
- **Pros**: Open source, PostgreSQL, real-time features, good free tier
- **Cons**: Additional service to manage
- **Cost**: Free tier available, then $25/month

#### **Option C: PlanetScale (MySQL)**
- **Pros**: Serverless MySQL, branching, good performance
- **Cons**: MySQL instead of PostgreSQL
- **Cost**: Free tier available, then $29/month

#### **Option D: Railway (PostgreSQL)**
- **Pros**: Simple setup, good pricing, PostgreSQL
- **Cons**: Smaller company, less enterprise features
- **Cost**: $5/month for starter plan

### **5.2 Vercel Postgres Setup (Recommended)**

#### **Step 1: Create Database**
1. Go to Vercel Dashboard → Storage
2. Click "Create Database"
3. Select "Postgres"
4. Choose region (us-east-1 recommended)
5. Set database name: `hookahplus_prod`

#### **Step 2: Get Connection String**
1. Go to Database → Settings
2. Copy the connection string
3. Format: `postgresql://username:password@hostname:port/database_name`

#### **Step 3: Configure Environment Variables**
```bash
DATABASE_URL=postgresql://username:password@hostname:port/database_name
```

### **5.3 Supabase Setup (Alternative)**

#### **Step 1: Create Project**
1. Go to [Supabase Dashboard](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Set project name: `hookahplus-prod`
5. Set database password (strong password required)
6. Choose region: US East (N. Virginia)

#### **Step 2: Get Connection String**
1. Go to Settings → Database
2. Copy the connection string
3. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

#### **Step 3: Configure Environment Variables**
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### **5.4 Database Migration**

#### **Step 1: Update Prisma Schema**
Ensure your `prisma/schema.prisma` is configured for production:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your existing models...
```

#### **Step 2: Run Migrations**
```bash
# Install Prisma CLI globally if not already installed
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed the database
npx prisma db seed
```

#### **Step 3: Verify Database Connection**
```bash
# Test database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

### **5.5 Database Security**

#### **Connection Security**
- Use SSL connections in production
- Rotate database passwords regularly
- Use connection pooling
- Set up IP whitelisting if possible

#### **Environment Variables Security**
```bash
# Use strong passwords
DATABASE_URL=postgresql://username:STRONG_PASSWORD@hostname:port/database_name

# Enable SSL
DATABASE_URL=postgresql://username:password@hostname:port/database_name?sslmode=require
```

### **5.6 Database Monitoring**

#### **Set up Monitoring**
1. **Query Performance**: Monitor slow queries
2. **Connection Pooling**: Monitor connection usage
3. **Storage Usage**: Monitor database size
4. **Backup Status**: Verify backups are working

#### **Alerting**
- High connection usage (>80%)
- Slow queries (>1 second)
- Storage usage (>80%)
- Failed connections

### **5.7 Database Backup Strategy**

#### **Automated Backups**
- **Vercel Postgres**: Automatic daily backups
- **Supabase**: Automatic daily backups
- **Manual Backups**: Weekly full backups

#### **Backup Testing**
```bash
# Test backup restoration
pg_dump $DATABASE_URL > backup.sql
psql $DATABASE_URL < backup.sql
```

### **5.8 Database Optimization**

#### **Indexes**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_table_id ON sessions(table_id);
```

#### **Connection Pooling**
```javascript
// In your database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **5.9 Testing Database Connection**

#### **Health Check Endpoint**
```javascript
// apps/app/app/api/db-health/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

#### **Test Script**
```bash
# Test database connection
curl https://hookahplus.net/api/db-health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z"}
```

### **5.10 Database Migration Checklist**

- [ ] Choose database provider (Vercel Postgres recommended)
- [ ] Create production database
- [ ] Get connection string
- [ ] Update environment variables
- [ ] Run Prisma migrations
- [ ] Seed initial data
- [ ] Test database connection
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test backup restoration
- [ ] Optimize database performance
- [ ] Set up alerting

---

## **🚨 Critical Notes**

1. **Never use development database in production**
2. **Always use SSL connections in production**
3. **Set up monitoring before going live**
4. **Test backup restoration regularly**
5. **Keep database credentials secure**

---

## **📞 Support**

If you encounter issues:
1. Check database connection string format
2. Verify environment variables are set
3. Check database provider status
4. Review Prisma migration logs
5. Test with simple queries first
