require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkColumns() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to database\n');
    
    // Use raw SQL to check actual column names
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Session' 
      AND table_schema = 'public' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Actual columns in Session table:');
    console.log('='.repeat(60));
    result.forEach((col) => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}`);
    });
    
    // Check if tableId exists
    const hasTableId = result.some((col) => col.column_name === 'tableId');
    const hasTableIdSnake = result.some((col) => col.column_name === 'table_id');
    
    console.log('\n🔍 Column name check:');
    console.log(`  tableId (camelCase): ${hasTableId ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  table_id (snake_case): ${hasTableIdSnake ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasTableId && !hasTableIdSnake) {
      console.log('\n⚠️  Neither tableId nor table_id found!');
      console.log('   The table might need to be created or migrated.');
    } else if (hasTableIdSnake && !hasTableId) {
      console.log('\n💡 Solution: Database uses snake_case, but Prisma expects camelCase');
      console.log('   Options:');
      console.log('   1. Update Prisma schema to use @map("table_id")');
      console.log('   2. Or run migration to rename column to tableId');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumns();

