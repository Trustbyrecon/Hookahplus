import { NextRequest, NextResponse } from 'next/server';
import { loadSetupSession } from '../../../../../lib/launchpad/session-manager';
import { generateLoungeOpsConfig } from '../../../../../lib/launchpad/config-generator';

/**
 * GET /api/launchpad/preview/pos-guide
 * Preview POS integration guide for ManyChat
 * Requires token query parameter
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Load setup session
    const progress = await loadSetupSession(token);
    if (!progress) {
      return NextResponse.json(
        { error: 'Setup session not found or expired' },
        { status: 404 }
      );
    }

    const posType = progress.data.step5?.posType || 'none';
    const loungeName = progress.data.step1?.loungeName || 'Your Lounge';

    // Generate POS guide content
    const posGuide = generatePOSGuide(posType, loungeName);

    return NextResponse.json({
      success: true,
      preview: true,
      posType,
      guide: posGuide,
      message: 'This is a preview guide. Complete LaunchPad to get the full integration guide.',
    });
  } catch (error: any) {
    console.error('[Preview POS Guide] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate POS guide' },
      { status: 500 }
    );
  }
}

/**
 * Generate POS integration guide content
 */
function generatePOSGuide(posType: string, loungeName: string): string {
  const baseGuide = {
    none: `# H+ Runs Above Your POS

**${loungeName}** - POS Integration Guide

## How H+ Works With Your POS

H+ tracks sessions, memory, and loyalty. Your POS handles payment.

### Manual Entry Flow

1. **Start Session in H+:** Staff creates session in H+ dashboard
2. **Add Items:** Track flavors, mixes, add-ons in H+
3. **Process Payment in POS:** Enter total from H+ into your POS
4. **End Session in H+:** Mark session as complete

### Reconciliation

- H+ provides session totals
- Match H+ sessions to POS transactions by time/amount
- Use H+ dashboard for customer preferences and loyalty

---

**Next Steps:** Complete LaunchPad to get your full POS integration guide.`,

    square: `# H+ + Square Integration Guide

**${loungeName}** - Running H+ Above Square

## How It Works

H+ tracks sessions and memory. Square processes payments.

### Setup (Coming in Phase 2)

1. Connect Square account in H+ settings
2. Map H+ items to Square items
3. Enable automatic session sync

### Current Flow (Manual)

1. **Start Session:** Create in H+ dashboard
2. **Track Items:** Add flavors, mixes, add-ons in H+
3. **Process Payment:** Use Square POS for payment
4. **End Session:** Mark complete in H+ after Square transaction

### Reconciliation

- H+ session total should match Square transaction
- Use H+ for customer preferences and loyalty
- Square handles payment processing

---

**Phase 2:** Real-time Square sync coming soon.`,

    clover: `# H+ + Clover Integration Guide

**${loungeName}** - Running H+ Above Clover

## How It Works

H+ tracks sessions and memory. Clover processes payments.

### Setup (Coming in Phase 2)

1. Connect Clover account in H+ settings
2. Map H+ items to Clover items
3. Enable automatic session sync

### Current Flow (Manual)

1. **Start Session:** Create in H+ dashboard
2. **Track Items:** Add flavors, mixes, add-ons in H+
3. **Process Payment:** Use Clover POS for payment
4. **End Session:** Mark complete in H+ after Clover transaction

### Reconciliation

- H+ session total should match Clover transaction
- Use H+ for customer preferences and loyalty
- Clover handles payment processing

---

**Phase 2:** Real-time Clover sync coming soon.`,

    toast: `# H+ + Toast Integration Guide

**${loungeName}** - Running H+ Above Toast

## How It Works

H+ tracks sessions and memory. Toast processes payments.

### Setup (Coming in Phase 2)

1. Connect Toast account in H+ settings
2. Map H+ items to Toast items
3. Enable automatic session sync

### Current Flow (Manual)

1. **Start Session:** Create in H+ dashboard
2. **Track Items:** Add flavors, mixes, add-ons in H+
3. **Process Payment:** Use Toast POS for payment
4. **End Session:** Mark complete in H+ after Toast transaction

### Reconciliation

- H+ session total should match Toast transaction
- Use H+ for customer preferences and loyalty
- Toast handles payment processing

---

**Phase 2:** Real-time Toast sync coming soon.`,
  };

  return baseGuide[posType as keyof typeof baseGuide] || baseGuide.none;
}

