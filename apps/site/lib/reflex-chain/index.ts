/**
 * Site Build Reflex Chain Integration
 * 
 * Provides Reflex Chain visualization and demo functionality for site build
 */

export interface ReflexChainDemo {
  sessionId: string;
  layers: {
    boh: { status: 'pending' | 'processing' | 'complete'; output?: any };
    foh: { status: 'pending' | 'processing' | 'complete'; output?: any };
    delivery: { status: 'pending' | 'processing' | 'complete'; output?: any };
    customer: { status: 'pending' | 'processing' | 'complete'; output?: any };
  };
  sync: {
    trust: number;
    timing: {
      totalFlowTime: number;
      bohTime: number;
      fohTime: number;
      deliveryTime: number;
      customerTime: number;
    };
  };
}

/**
 * Get demo Reflex Chain flow for site build visualization
 */
export function getDemoReflexFlow(): ReflexChainDemo {
  return {
    sessionId: 'demo-session-001',
    layers: {
      boh: {
        status: 'complete',
        output: {
          readyForService: {
            sessionId: 'demo-session-001',
            prepCompletedAt: Date.now() - 900000, // 15 minutes ago
            status: 'ready',
            estimatedReadyTime: Date.now() - 600000, // 10 minutes ago
          },
        },
      },
      foh: {
        status: 'complete',
        output: {
          sessionActivated: {
            sessionId: 'demo-session-001',
            activatedAt: Date.now() - 600000, // 10 minutes ago
            assignedStaff: 'staff-001',
            tableId: 'T-001',
            zone: 'VIP',
            flavorMix: 'Blue Mist + Mint',
          },
        },
      },
      delivery: {
        status: 'complete',
        output: {
          deliveryCompletion: {
            sessionId: 'demo-session-001',
            deliveredAt: Date.now() - 300000, // 5 minutes ago
            deliveredBy: 'runner-001',
            tableId: 'T-001',
            heatmapUpdate: {
              zone: 'VIP',
              tableId: 'T-001',
              status: 'delivered',
              timestamp: Date.now() - 300000,
            },
            trustLoopData: {
              deliveryTime: 300, // 5 minutes
              onTime: true,
              qualityScore: 95,
            },
          },
        },
      },
      customer: {
        status: 'processing',
        output: {
          sessionFingerprint: {
            sessionId: 'demo-session-001',
            customerId: 'customer-001',
            preferences: {
              favoriteFlavors: ['Blue Mist', 'Mint'],
              averageRating: 4.5,
              preferredTime: 45,
              visitFrequency: 3,
            },
            trustScore: 92,
            loyaltyTier: 'gold',
          },
        },
      },
    },
    sync: {
      trust: 92,
      timing: {
        totalFlowTime: 600, // 10 minutes total
        bohTime: 900, // 15 minutes prep
        fohTime: 300, // 5 minutes activation
        deliveryTime: 300, // 5 minutes delivery
        customerTime: 0, // Still active
      },
    },
  };
}

