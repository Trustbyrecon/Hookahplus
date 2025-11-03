import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper function to create trust signature
const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

async function testQRCodeFlow() {
  console.log('🧪 Testing QR Code Flow End-to-End\n');

  try {
    // Step 1: Create a test session with QR code URL
    console.log('Step 1: Creating test session...');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
    
    const testSession = await prisma.session.create({
      data: {
        externalRef: `test_session_${Date.now()}`,
        source: 'QR',
        trustSignature: seal({
          loungeId: 'test-lounge',
          source: 'QR',
          externalRef: `test_session_${Date.now()}`,
        }),
        tableId: 'T-001',
        customerRef: 'Test Customer',
        customerPhone: '+15551234567',
        flavor: 'Mint',
        flavorMix: JSON.stringify(['Mint', 'Watermelon']),
        loungeId: 'test-lounge',
        priceCents: 3500,
        state: 'NEW',
        paymentStatus: 'succeeded',
        paymentIntent: 'pi_test_123',
        qrCodeUrl: `${baseUrl}/staff/scan/test_session_${Date.now()}`, // Will be updated below
      },
    });

    // Update QR code URL with actual session ID
    const actualQrScanUrl = `${baseUrl}/staff/scan/${testSession.id}`;
    const updatedSession = await prisma.session.update({
      where: { id: testSession.id },
      data: {
        qrCodeUrl: actualQrScanUrl,
      },
    });

    console.log('✅ Session created:', {
      id: updatedSession.id,
      tableId: updatedSession.tableId,
      qrCodeUrl: updatedSession.qrCodeUrl,
    });

    // Step 2: Verify QR code URL format
    console.log('\nStep 2: Verifying QR code URL format...');
    if (!updatedSession.qrCodeUrl) {
      throw new Error('QR code URL is missing!');
    }

    const urlPattern = /^https?:\/\/.+\/staff\/scan\/.+$/;
    if (!urlPattern.test(updatedSession.qrCodeUrl)) {
      throw new Error(`Invalid QR code URL format: ${updatedSession.qrCodeUrl}`);
    }

    console.log('✅ QR code URL format is valid:', updatedSession.qrCodeUrl);

    // Step 3: Extract session ID from QR URL
    console.log('\nStep 3: Extracting session ID from QR URL...');
    const urlParts = updatedSession.qrCodeUrl.split('/');
    const sessionIdFromUrl = urlParts[urlParts.length - 1];
    console.log('✅ Session ID extracted:', sessionIdFromUrl);

    if (sessionIdFromUrl !== updatedSession.id) {
      throw new Error('Session ID in QR URL does not match database session ID!');
    }

    // Step 4: Verify session can be fetched by ID
    console.log('\nStep 4: Verifying session can be fetched...');
    const fetchedSession = await prisma.session.findUnique({
      where: { id: updatedSession.id },
    });

    if (!fetchedSession) {
      throw new Error('Session not found in database!');
    }

    console.log('✅ Session fetched successfully:', {
      id: fetchedSession.id,
      tableId: fetchedSession.tableId,
      qrCodeUrl: fetchedSession.qrCodeUrl,
      paymentStatus: fetchedSession.paymentStatus,
    });

    // Step 5: Verify QR URL is stored correctly
    console.log('\nStep 5: Verifying QR URL is stored correctly...');
    if (fetchedSession.qrCodeUrl !== actualQrScanUrl) {
      throw new Error('QR code URL mismatch!');
    }

    console.log('✅ QR code URL stored correctly');

    // Step 6: Test that session can be found by externalRef (Stripe checkout session ID)
    console.log('\nStep 6: Testing lookup by externalRef...');
    const sessionByExternalRef = await prisma.session.findFirst({
      where: { externalRef: testSession.externalRef },
    });

    if (!sessionByExternalRef) {
      throw new Error('Session not found by externalRef!');
    }

    console.log('✅ Session found by externalRef:', sessionByExternalRef.id);

    console.log('\n✨ All tests passed! QR Code Flow is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`   Session ID: ${updatedSession.id}`);
    console.log(`   QR Code URL: ${updatedSession.qrCodeUrl}`);
    console.log(`   Table ID: ${updatedSession.tableId}`);
    console.log(`   Payment Status: ${updatedSession.paymentStatus}`);
    console.log('\n🔗 To test in browser:');
    console.log(`   1. Navigate to: ${updatedSession.qrCodeUrl}`);
    console.log(`   2. Verify session details are displayed correctly`);

    // Cleanup: Delete test session
    console.log('\n🧹 Cleaning up test session...');
    await prisma.session.delete({
      where: { id: updatedSession.id },
    });
    console.log('✅ Test session deleted');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testQRCodeFlow()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

