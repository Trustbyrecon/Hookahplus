import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPartnershipData() {
  try {
    console.log('🌱 Seeding partnership data...');

    // Create demo partner
    const partner = await prisma.partner.upsert({
      where: { email: 'demo@partner.com' },
      update: {},
      create: {
        id: 'demo-partner',
        name: 'Demo Partner',
        email: 'demo@partner.com',
        tier: 'silver',
        isActive: true
      }
    });

    console.log('✅ Created partner:', partner.name);

    // Create partner stats
    const stats = await prisma.partnerStats.upsert({
      where: { partnerId: partner.id },
      update: {
        totalReferrals: 17,
        activeLounges: 12,
        referralsLast30d: 6,
        qualityScore: 0.71,
        lastUpdated: new Date()
      },
      create: {
        partnerId: partner.id,
        totalReferrals: 17,
        activeLounges: 12,
        referralsLast30d: 6,
        qualityScore: 0.71
      }
    });

    console.log('✅ Created partner stats:', stats);

    // Create demo referrals
    const referrals = [
      {
        code: 'ref_abc123',
        partnerId: partner.id,
        loungeId: 'lounge_001',
        isActive: true,
        uses: 5,
        createdAt: new Date('2025-01-01')
      },
      {
        code: 'ref_def456',
        partnerId: partner.id,
        loungeId: 'lounge_002',
        isActive: true,
        uses: 12,
        createdAt: new Date('2025-01-15')
      }
    ];

    for (const referralData of referrals) {
      await prisma.referral.upsert({
        where: { code: referralData.code },
        update: {},
        create: referralData
      });
    }

    console.log('✅ Created referrals:', referrals.length);

    // Create demo payouts
    const payouts = [
      {
        partnerId: partner.id,
        period: '2025-01',
        gross: 2500.00,
        revSharePct: 5.0,
        net: 125.00,
        status: 'paid',
        paidAt: new Date('2025-02-05')
      },
      {
        partnerId: partner.id,
        period: '2024-12',
        gross: 1800.00,
        revSharePct: 4.0,
        net: 72.00,
        status: 'paid',
        paidAt: new Date('2025-01-05')
      },
      {
        partnerId: partner.id,
        period: '2024-11',
        gross: 3200.00,
        revSharePct: 4.0,
        net: 128.00,
        status: 'paid',
        paidAt: new Date('2024-12-05')
      }
    ];

    for (const payoutData of payouts) {
      await prisma.payout.create({
        data: payoutData
      });
    }

    console.log('✅ Created payouts:', payouts.length);

    console.log('🎉 Partnership data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding partnership data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPartnershipData();
