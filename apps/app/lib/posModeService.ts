import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type POSMode = 'shadow' | 'mirror' | 'ticket';

export interface POSModeConfig {
  mode: POSMode;
  description: string;
  features: string[];
  limitations: string[];
}

export class POSModeService {
  private static instance: POSModeService;
  private currentMode: POSMode = 'shadow';

  static getInstance(): POSModeService {
    if (!POSModeService.instance) {
      POSModeService.instance = new POSModeService();
    }
    return POSModeService.instance;
  }

  /**
   * Get current POS mode configuration
   */
  async getCurrentMode(): Promise<POSMode> {
    try {
      const setting = await prisma.orgSetting.findUnique({
        where: { key: 'posMode' }
      });
      this.currentMode = (setting?.value as POSMode) || 'shadow';
      return this.currentMode;
    } catch (error) {
      console.error('[POSModeService] Error getting current mode:', error);
      return 'shadow';
    }
  }

  /**
   * Set POS mode
   */
  async setMode(mode: POSMode): Promise<boolean> {
    try {
      await prisma.orgSetting.upsert({
        where: { key: 'posMode' },
        update: { value: mode },
        create: {
          key: 'posMode',
          value: mode,
          description: 'POS integration mode',
          category: 'pos'
        }
      });
      this.currentMode = mode;
      console.log(`[POSModeService] ✅ Mode set to: ${mode}`);
      return true;
    } catch (error) {
      console.error('[POSModeService] Error setting mode:', error);
      return false;
    }
  }

  /**
   * Get mode configuration details
   */
  getModeConfig(mode: POSMode): POSModeConfig {
    const configs: Record<POSMode, POSModeConfig> = {
      shadow: {
        mode: 'shadow',
        description: 'Hookah+ runs alongside existing POS without integration',
        features: [
          'Independent session management',
          'Full Hookah+ feature set',
          'No POS dependencies',
          'Real-time timer management',
          'Custom reporting'
        ],
        limitations: [
          'Manual data entry required',
          'No automatic order sync',
          'Separate payment processing'
        ]
      },
      mirror: {
        mode: 'mirror',
        description: 'Hookah+ mirrors existing POS data for enhanced management',
        features: [
          'Bidirectional data sync',
          'POS order import',
          'Enhanced session tracking',
          'Unified reporting',
          'Timer integration with orders'
        ],
        limitations: [
          'Requires POS API access',
          'Sync delays possible',
          'Limited to POS capabilities'
        ]
      },
      ticket: {
        mode: 'ticket',
        description: 'Hookah+ generates tickets for existing POS system',
        features: [
          'POS-compatible ticket generation',
          'Seamless POS integration',
          'Standard POS workflow',
          'Automatic order transmission'
        ],
        limitations: [
          'Limited to POS ticket format',
          'No real-time sync',
          'Basic session tracking'
        ]
      }
    };

    return configs[mode];
  }

  /**
   * Process session based on current POS mode
   */
  async processSession(sessionData: any): Promise<any> {
    const mode = await this.getCurrentMode();
    
    switch (mode) {
      case 'shadow':
        return this.processShadowMode(sessionData);
      case 'mirror':
        return this.processMirrorMode(sessionData);
      case 'ticket':
        return this.processTicketMode(sessionData);
      default:
        return this.processShadowMode(sessionData);
    }
  }

  /**
   * Shadow mode: Independent session management
   */
  private async processShadowMode(sessionData: any): Promise<any> {
    console.log('[POSModeService] 🔍 Processing in SHADOW mode');
    
    // Create independent session
    const session = await prisma.session.create({
      data: {
        ...sessionData,
        posMode: 'shadow',
        state: 'NEW'
      }
    });

    // Log session creation
    await prisma.sessionTransition.create({
      data: {
        sessionId: session.id,
        fromState: 'NONE',
        toState: 'NEW',
        transition: 'session_created_shadow',
        userId: 'hookahplus_system',
        note: 'Session created in shadow mode'
      }
    });

    return {
      session,
      mode: 'shadow',
      requiresManualEntry: true,
      posIntegration: false
    };
  }

  /**
   * Mirror mode: Sync with existing POS
   */
  private async processMirrorMode(sessionData: any): Promise<any> {
    console.log('[POSModeService] 🔄 Processing in MIRROR mode');
    
    // Check if session exists in POS
    const existingSession = await this.findExistingPOSSession(sessionData.tableId);
    
    if (existingSession) {
      // Update existing session
      const session = await prisma.session.update({
        where: { id: existingSession.id },
        data: {
          ...sessionData,
          posMode: 'mirror',
          updatedAt: new Date()
        }
      });

      await prisma.sessionTransition.create({
        data: {
          sessionId: session.id,
          fromState: existingSession.state,
          toState: session.state,
          transition: 'session_updated_mirror',
          userId: 'pos_sync',
          note: 'Session updated via POS mirror'
        }
      });

      return {
        session,
        mode: 'mirror',
        requiresManualEntry: false,
        posIntegration: true,
        syncedFromPOS: true
      };
    } else {
      // Create new session and sync to POS
      const session = await prisma.session.create({
        data: {
          ...sessionData,
          posMode: 'mirror',
          state: 'NEW'
        }
      });

      // Attempt to sync to POS
      const syncResult = await this.syncToPOS(session);
      
      await prisma.sessionTransition.create({
        data: {
          sessionId: session.id,
          fromState: 'NONE',
          toState: 'NEW',
          transition: 'session_created_mirror',
          userId: 'hookahplus_system',
          note: `Session created in mirror mode, POS sync: ${syncResult.success ? 'success' : 'failed'}`
        }
      });

      return {
        session,
        mode: 'mirror',
        requiresManualEntry: false,
        posIntegration: true,
        posSyncResult: syncResult
      };
    }
  }

  /**
   * Ticket mode: Generate POS-compatible tickets
   */
  private async processTicketMode(sessionData: any): Promise<any> {
    console.log('[POSModeService] 🎫 Processing in TICKET mode');
    
    // Create session
    const session = await prisma.session.create({
      data: {
        ...sessionData,
        posMode: 'ticket',
        state: 'NEW'
      }
    });

    // Generate POS ticket
    const ticket = await this.generatePOSTicket(session);

    await prisma.sessionTransition.create({
      data: {
        sessionId: session.id,
        fromState: 'NONE',
        toState: 'NEW',
        transition: 'session_created_ticket',
        userId: 'hookahplus_system',
        note: `Session created in ticket mode, ticket: ${ticket.id}`
      }
    });

    return {
      session,
      mode: 'ticket',
      requiresManualEntry: false,
      posIntegration: true,
      ticket
    };
  }

  /**
   * Find existing POS session
   */
  private async findExistingPOSSession(tableId: string): Promise<any> {
    // This would integrate with actual POS system
    // For now, return null to simulate no existing session
    return null;
  }

  /**
   * Sync session to POS
   */
  private async syncToPOS(session: any): Promise<{ success: boolean; error?: string }> {
    try {
      // This would integrate with actual POS API
      // For now, simulate successful sync
      console.log(`[POSModeService] 🔄 Syncing session ${session.id} to POS`);
      return { success: true };
    } catch (error) {
      console.error('[POSModeService] POS sync failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate POS-compatible ticket
   */
  private async generatePOSTicket(session: any): Promise<any> {
    // This would generate actual POS ticket
    // For now, return mock ticket data
    return {
      id: `TICKET_${Date.now()}`,
      sessionId: session.id,
      tableId: session.tableId,
      items: session.orderItems || [],
      total: session.priceCents,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get all available modes
   */
  getAllModes(): POSModeConfig[] {
    return ['shadow', 'mirror', 'ticket'].map(mode => 
      this.getModeConfig(mode as POSMode)
    );
  }
}

// Export singleton instance
export const posModeService = POSModeService.getInstance();
