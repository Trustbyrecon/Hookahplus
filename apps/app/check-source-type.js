require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkSourceType() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected\n');
    
    // Check the actual type of source column
    const result = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'Session' 
      AND table_schema = 'public'
      AND column_name = 'source';
    `;
    
    console.log('📋 Source column type:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if there's an enum type
    const enumCheck = await prisma.$queryRaw`
      SELECT t.typname as enum_name
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname LIKE '%source%' OR t.typname LIKE '%session%'
      GROUP BY t.typname;
    `;
    
    console.log('\n📋 Enum types found:');
    console.log(JSON.stringify(enumCheck, null, 2));
    
    // Try to get allowed values if it's an enum
    if (result && result.length > 0 && result[0].udt_name !== 'text') {
      const enumValues = await prisma.$queryRaw`
        SELECT e.enumlabel as value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = ${result[0].udt_name}
        ORDER BY e.enumsortorder;
      `;
      console.log('\n📋 Allowed enum values:');
      console.log(JSON.stringify(enumValues, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSourceType();

