require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkStateType() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    
    // Check the actual type of state column
    const result = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'Session' 
      AND table_schema = 'public'
      AND column_name = 'state';
    `;
    
    console.log('📋 State column type:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if there's an enum type
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

checkStateType();

