import { prisma } from '../prisma';
import { sendEmail } from '../email-retention';

export interface RetentionTrigger {
  type: 'churn_risk' | 'win_back' | 're_engagement' | 'loyalty_milestone' | 'abandoned_cart';
  customerPhone?: string;
  customerId?: string;
  loungeId: string;
  tenantId?: string | null;
  metadata?: Record<string, any>;
}

export interface RetentionCampaign {
  id: string;
  name: string;
  trigger: RetentionTrigger['type'];
  conditions: {
    daysSinceLastVisit?: number;
    visitCount?: number;
    pointsBalance?: number;
    lastPurchaseAmount?: number;
  };
  actions: {
    email?: {
      template: string;
      subject: string;
      delayHours?: number;
    };
    sms?: {
      template: string;
      delayHours?: number;
    };
    campaign?: {
      campaignId: string;
      autoApply?: boolean;
    };
  };
  isActive: boolean;
}

/**
 * Customer Retention Automation Engine
 * Automatically identifies at-risk customers and triggers retention campaigns
 */
export class RetentionAutomationEngine {
  /**
   * Check for customers who need retention campaigns
   */
  async checkRetentionTriggers(loungeId: string, tenantId?: string | null): Promise<RetentionTrigger[]> {
    const triggers: RetentionTrigger[] = [];

    try {
      // 1. Churn Risk: Customers who haven't visited in 30+ days but had regular visits
      const churnRiskCustomers = await this.identifyChurnRisk(loungeId, tenantId);
      triggers.push(...churnRiskCustomers);

      // 2. Win-Back: Customers who haven't visited in 60+ days
      const winBackCustomers = await this.identifyWinBack(loungeId, tenantId);
      triggers.push(...winBackCustomers);

      // 3. Re-engagement: Customers with low visit frequency
      const reEngagementCustomers = await this.identifyReEngagement(loungeId, tenantId);
      triggers.push(...reEngagementCustomers);

      // 4. Loyalty Milestones: Customers approaching tier upgrades
      const milestoneCustomers = await this.identifyLoyaltyMilestones(loungeId, tenantId);
      triggers.push(...milestoneCustomers);

      // 5. Abandoned Sessions: Customers who started but didn't complete checkout
      const abandonedCustomers = await this.identifyAbandonedSessions(loungeId, tenantId);
      triggers.push(...abandonedCustomers);

    } catch (error) {
      console.error('[Retention Automation] Error checking triggers:', error);
    }

    return triggers;
  }

  /**
   * Process retention triggers and send campaigns
   */
  async processTriggers(triggers: RetentionTrigger[]): Promise<void> {
    for (const trigger of triggers) {
      try {
        await this.processTrigger(trigger);
      } catch (error) {
        console.error(`[Retention Automation] Error processing trigger ${trigger.type}:`, error);
      }
    }
  }

  /**
   * Process a single retention trigger
   */
  private async processTrigger(trigger: RetentionTrigger): Promise<void> {
    // Get retention campaign configuration
    const campaign = await this.getRetentionCampaign(trigger.type, trigger.loungeId, trigger.tenantId);
    
    if (!campaign || !campaign.isActive) {
      return;
    }

    // Check if customer already received this campaign recently
    const recentCampaign = await prisma.campaignUsage.findFirst({
      where: {
        campaignId: campaign.id,
        customerRef: trigger.customerId || trigger.customerPhone || undefined,
        appliedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    if (recentCampaign) {
      console.log(`[Retention Automation] Skipping ${trigger.type} - already sent recently`);
      return;
    }

    // Execute campaign actions
    if (campaign.actions.email) {
      await this.sendEmailCampaign(trigger, campaign.actions.email);
    }

    if (campaign.actions.sms) {
      await this.sendSMSCampaign(trigger, campaign.actions.sms);
    }

    if (campaign.actions.campaign) {
      await this.applyCampaign(trigger, campaign.actions.campaign);
    }

    // Log retention action
    await this.logRetentionAction(trigger, campaign);
  }

  /**
   * Identify customers at risk of churning
   */
  private async identifyChurnRisk(loungeId: string, tenantId?: string | null): Promise<RetentionTrigger[]> {
    const triggers: RetentionTrigger[] = [];

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      // Find customers who:
      // - Had at least 3 visits in the past
      // - Last visit was 30-60 days ago
      // - Had regular visits before (not one-time customers)
      const sessions = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          customerPhone: { not: null },
          paymentStatus: 'succeeded',
          createdAt: {
            gte: sixtyDaysAgo
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Group by customer
      const customerSessions = new Map<string, any[]>();
      for (const session of sessions) {
        if (session.customerPhone) {
          const existing = customerSessions.get(session.customerPhone) || [];
          existing.push(session);
          customerSessions.set(session.customerPhone, existing);
        }
      }

      // Check each customer
      Array.from(customerSessions.entries()).forEach(([phone, customerSessionsList]) => {
        const sortedSessions = customerSessionsList.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const lastVisit = sortedSessions[0];
        const daysSinceLastVisit = Math.floor(
          (Date.now() - new Date(lastVisit.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        );

        // Churn risk: 3+ visits total, last visit 30-60 days ago
        if (customerSessionsList.length >= 3 && daysSinceLastVisit >= 30 && daysSinceLastVisit < 60) {
          triggers.push({
            type: 'churn_risk',
            customerPhone: phone,
            loungeId,
            tenantId: tenantId || null,
            metadata: {
              daysSinceLastVisit,
              visitCount: customerSessionsList.length,
              lastVisitAmount: lastVisit.priceCents || 0
            }
          });
        }
      });
    } catch (error) {
      console.error('[Retention Automation] Error identifying churn risk:', error);
    }

    return triggers;
  }

  /**
   * Identify customers for win-back campaigns
   */
  private async identifyWinBack(loungeId: string, tenantId?: string | null): Promise<RetentionTrigger[]> {
    const triggers: RetentionTrigger[] = [];

    try {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      // Find customers who haven't visited in 60+ days
      const lastVisits = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          customerPhone: { not: null },
          paymentStatus: 'succeeded',
          createdAt: {
            lt: sixtyDaysAgo
          }
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['customerPhone']
      });

      for (const session of lastVisits) {
        if (session.customerPhone) {
          const daysSinceLastVisit = Math.floor(
            (Date.now() - new Date(session.createdAt).getTime()) / (24 * 60 * 60 * 1000)
          );

          // Only win-back if it's been 60+ days
          if (daysSinceLastVisit >= 60) {
            triggers.push({
              type: 'win_back',
              customerPhone: session.customerPhone,
              loungeId,
              tenantId: tenantId || null,
              metadata: {
                daysSinceLastVisit,
                lastVisitAmount: session.priceCents || 0
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('[Retention Automation] Error identifying win-back:', error);
    }

    return triggers;
  }

  /**
   * Identify customers needing re-engagement
   */
  private async identifyReEngagement(loungeId: string, tenantId?: string | null): Promise<RetentionTrigger[]> {
    const triggers: RetentionTrigger[] = [];

    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Find customers with low visit frequency (1-2 visits in last 90 days)
      const sessions = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          customerPhone: { not: null },
          paymentStatus: 'succeeded',
          createdAt: {
            gte: ninetyDaysAgo
          }
        }
      });

      const customerVisitCount = new Map<string, number>();
      for (const session of sessions) {
        if (session.customerPhone) {
          customerVisitCount.set(
            session.customerPhone,
            (customerVisitCount.get(session.customerPhone) || 0) + 1
          );
        }
      }

      Array.from(customerVisitCount.entries()).forEach(([phone, visitCount]) => {
        if (visitCount <= 2) {
          triggers.push({
            type: 're_engagement',
            customerPhone: phone,
            loungeId,
            tenantId: tenantId || null,
            metadata: {
              visitCount,
              daysSinceLastVisit: 0 // Will be calculated
            }
          });
        }
      });
    } catch (error) {
      console.error('[Retention Automation] Error identifying re-engagement:', error);
    }

    return triggers;
  }

  /**
   * Identify customers approaching loyalty milestones
   */
  private async identifyLoyaltyMilestones(loungeId: string, tenantId?: string | null): Promise<RetentionTrigger[]> {
    const triggers: RetentionTrigger[] = [];

    try {
      // Get loyalty accounts close to tier upgrades
      const accounts = await prisma.loyaltyAccount.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          isActive: true,
          pointsBalance: { gt: 0 }
        }
      });

      // Get tier definitions
      const tiers = await prisma.loyaltyTier.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          isActive: true
        },
        orderBy: { minPoints: 'asc' }
      });

      for (const account of accounts) {
        // Find next tier
        const currentTierIndex = tiers.findIndex(t => t.tierName === account.currentTier);
        if (currentTierIndex < tiers.length - 1) {
          const nextTier = tiers[currentTierIndex + 1];
          const pointsNeeded = nextTier.minPoints - account.pointsBalance;

          // If within 100 points of next tier, trigger milestone campaign
          if (pointsNeeded > 0 && pointsNeeded <= 100) {
            triggers.push({
              type: 'loyalty_milestone',
              customerPhone: account.customerPhone || undefined,
              customerId: account.customerId || undefined,
              loungeId,
              tenantId: account.tenantId || null,
              metadata: {
                currentTier: account.currentTier,
                nextTier: nextTier.tierName,
                pointsNeeded,
                currentPoints: account.pointsBalance
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('[Retention Automation] Error identifying loyalty milestones:', error);
    }

    return triggers;
  }

  /**
   * Identify abandoned sessions
   */
  private async identifyAbandonedSessions(loungeId: string, tenantId?: string | null): Promise<RetentionTrigger[]> {
    const triggers: RetentionTrigger[] = [];

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find sessions that were created but never paid
      const abandonedSessions = await prisma.session.findMany({
        where: {
          loungeId,
          ...(tenantId ? { tenantId } : {}),
          customerPhone: { not: null },
          paymentStatus: { not: 'succeeded' },
          createdAt: {
            gte: oneDayAgo,
            lt: new Date(Date.now() - 2 * 60 * 60 * 1000) // At least 2 hours old
          }
        }
      });

      for (const session of abandonedSessions) {
        if (session.customerPhone) {
          triggers.push({
            type: 'abandoned_cart',
            customerPhone: session.customerPhone,
            customerId: session.customerRef || undefined,
            loungeId,
            tenantId: session.tenantId || null,
            metadata: {
              sessionId: session.id,
              sessionAmount: session.priceCents || 0,
              hoursSinceAbandoned: Math.floor(
                (Date.now() - new Date(session.createdAt).getTime()) / (60 * 60 * 1000)
              )
            }
          });
        }
      }
    } catch (error) {
      console.error('[Retention Automation] Error identifying abandoned sessions:', error);
    }

    return triggers;
  }

  /**
   * Get retention campaign configuration
   */
  private async getRetentionCampaign(
    triggerType: RetentionTrigger['type'],
    loungeId: string,
    tenantId?: string | null
  ): Promise<RetentionCampaign | null> {
    // Default campaigns (can be stored in database later)
    const defaultCampaigns: Record<string, RetentionCampaign> = {
      churn_risk: {
        id: 'churn_risk_default',
        name: 'Churn Risk Campaign',
        trigger: 'churn_risk',
        conditions: { daysSinceLastVisit: 30 },
        actions: {
          email: {
            template: 'churn_risk',
            subject: "We miss you! Come back for 15% off",
            delayHours: 0
          },
          campaign: {
            campaignId: 'churn_risk_discount',
            autoApply: true
          }
        },
        isActive: true
      },
      win_back: {
        id: 'win_back_default',
        name: 'Win-Back Campaign',
        trigger: 'win_back',
        conditions: { daysSinceLastVisit: 60 },
        actions: {
          email: {
            template: 'win_back',
            subject: "Welcome back! 20% off your next visit",
            delayHours: 0
          },
          campaign: {
            campaignId: 'win_back_discount',
            autoApply: true
          }
        },
        isActive: true
      },
      re_engagement: {
        id: 're_engagement_default',
        name: 'Re-Engagement Campaign',
        trigger: 're_engagement',
        conditions: { visitCount: 2 },
        actions: {
          email: {
            template: 're_engagement',
            subject: "Try something new! 10% off premium flavors",
            delayHours: 24
          }
        },
        isActive: true
      },
      loyalty_milestone: {
        id: 'loyalty_milestone_default',
        name: 'Loyalty Milestone Campaign',
        trigger: 'loyalty_milestone',
        conditions: {},
        actions: {
          email: {
            template: 'loyalty_milestone',
            subject: "You're close to {nextTier}! Earn {pointsNeeded} more points",
            delayHours: 0
          }
        },
        isActive: true
      },
      abandoned_cart: {
        id: 'abandoned_cart_default',
        name: 'Abandoned Cart Campaign',
        trigger: 'abandoned_cart',
        conditions: {},
        actions: {
          email: {
            template: 'abandoned_cart',
            subject: "Complete your order - 10% off",
            delayHours: 2
          }
        },
        isActive: true
      }
    };

    return defaultCampaigns[triggerType] || null;
  }

  /**
   * Send email campaign
   */
  private async sendEmailCampaign(trigger: RetentionTrigger, emailConfig: any): Promise<void> {
    // Get customer email if available
    // For now, we'll use phone-based lookup
    // In production, you'd have customer email addresses

    try {
      await sendEmail({
        to: trigger.customerPhone || trigger.customerId || '',
        triggerType: trigger.type,
        template: emailConfig.template,
        subject: emailConfig.subject,
        metadata: trigger.metadata || {}
      });
    } catch (error) {
      console.error('[Retention Automation] Error sending email:', error);
    }
  }

  /**
   * Send SMS campaign
   */
  private async sendSMSCampaign(trigger: RetentionTrigger, smsConfig: any): Promise<void> {
    // TODO: Implement SMS sending
    console.log(`[Retention Automation] SMS campaign would be sent for ${trigger.type}`);
  }

  /**
   * Apply campaign discount
   */
  private async applyCampaign(trigger: RetentionTrigger, campaignConfig: any): Promise<void> {
    // Create or find campaign and apply to customer
    // This would link to the campaign system we built
    console.log(`[Retention Automation] Campaign would be applied for ${trigger.type}`);
  }

  /**
   * Log retention action
   */
  private async logRetentionAction(trigger: RetentionTrigger, campaign: RetentionCampaign): Promise<void> {
    try {
      await prisma.campaignUsage.create({
        data: {
          campaignId: campaign.id,
          customerRef: trigger.customerId || trigger.customerPhone || undefined,
          metadata: {
            triggerType: trigger.type,
            ...trigger.metadata
          }
        }
      });
    } catch (error) {
      console.error('[Retention Automation] Error logging action:', error);
    }
  }
}

// Singleton instance
export const retentionEngine = new RetentionAutomationEngine();

