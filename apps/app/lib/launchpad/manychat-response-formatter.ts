/**
 * ManyChat Response Formatter
 * 
 * Formats API responses for ManyChat DM delivery
 * Ensures messages are concise, actionable, and Instagram-friendly
 */

export interface ManyChatResponse {
  success: boolean;
  message: string;
  completionLink?: string;
  previewAssets?: {
    qrCodes?: string;
    posGuide?: string;
    checklist?: string;
  };
  error?: string;
}

/**
 * Format success response for ManyChat DM
 */
export function formatManyChatSuccessResponse(
  completionLink: string,
  previewAssets: {
    qrCodes?: string;
    posGuide?: string;
    checklist?: string;
  },
  loungeName?: string
): string {
  const lines: string[] = [];
  
  lines.push('🎉 Your Go-Live Kit is ready!');
  lines.push('');
  
  if (loungeName) {
    lines.push(`I've set up your lounge: ${loungeName}`);
    lines.push('');
  }
  
  lines.push('📱 Complete your setup (10 minutes):');
  lines.push(completionLink);
  lines.push('');
  
  if (previewAssets.qrCodes || previewAssets.posGuide || previewAssets.checklist) {
    lines.push('✨ Preview your assets:');
    
    if (previewAssets.qrCodes) {
      lines.push(`• QR Codes: ${previewAssets.qrCodes}`);
    }
    if (previewAssets.posGuide) {
      lines.push(`• POS Guide: ${previewAssets.posGuide}`);
    }
    if (previewAssets.checklist) {
      lines.push(`• Week-1 Checklist: ${previewAssets.checklist}`);
    }
    
    lines.push('');
  }
  
  lines.push('Your lounge will be live tonight once you complete setup! 🚀');
  
  return lines.join('\n');
}

/**
 * Format error response for ManyChat DM
 */
export function formatManyChatErrorResponse(error: string): string {
  return `Hmm, something went wrong. 😔\n\n${error}\n\nPlease try again or contact support.`;
}

/**
 * Format follow-up message (24 hours later)
 */
export function formatManyChatFollowUp(
  loungeName: string,
  completionLink: string
): string {
  return `Hey! 👋\n\nI noticed you started setting up ${loungeName} but didn't finish.\n\nWant to complete it? Just click:\n${completionLink}\n\nTakes 10 minutes and you'll be live tonight! ⚡`;
}

/**
 * Format initial trigger response
 */
export function formatManyChatWelcome(): string {
  return `🚀 H+ LaunchPad - Get Live Tonight!\n\nI'll help you set up your lounge in 5 minutes. Ready to start?\n\nReply YES to begin.`;
}

/**
 * Format data collection confirmation
 */
export function formatManyChatDataConfirmation(data: {
  loungeName?: string;
  city?: string;
  seatsTables?: string;
  posUsed?: string;
}): string {
  const lines: string[] = [];
  
  lines.push('Perfect! I\'ve got your info:');
  lines.push('');
  
  if (data.loungeName) {
    lines.push(`• Lounge: ${data.loungeName}`);
  }
  if (data.city) {
    lines.push(`• City: ${data.city}`);
  }
  if (data.seatsTables) {
    lines.push(`• Tables: ${data.seatsTables}`);
  }
  if (data.posUsed) {
    lines.push(`• POS: ${data.posUsed}`);
  }
  
  lines.push('');
  lines.push('Setting up your Go-Live Kit now... ⚡');
  
  return lines.join('\n');
}

/**
 * Check if message is within ManyChat limits
 */
export function validateManyChatMessage(message: string): {
  valid: boolean;
  length: number;
  maxLength: number;
  warning?: string;
} {
  const maxLength = 1000; // ManyChat recommended limit
  const length = message.length;
  
  if (length > maxLength) {
    return {
      valid: false,
      length,
      maxLength,
      warning: `Message is ${length - maxLength} characters too long. ManyChat may truncate it.`,
    };
  }
  
  return {
    valid: true,
    length,
    maxLength,
  };
}

/**
 * Format response for ManyChat External Request
 * This is what the API returns to ManyChat
 */
export function formatManyChatAPIResponse(
  setupSessionToken: string,
  completionLink: string,
  previewAssets: {
    qrCodes?: string;
    posGuide?: string;
    checklist?: string;
  },
  loungeName?: string
): ManyChatResponse {
  // Format the DM message
  const message = formatManyChatSuccessResponse(
    completionLink,
    previewAssets,
    loungeName
  );
  
  // Validate message length
  const validation = validateManyChatMessage(message);
  
  if (!validation.valid) {
    // Truncate if needed (shouldn't happen, but safety check)
    console.warn('[ManyChat] Message too long:', validation.warning);
  }
  
  return {
    success: true,
    message,
    completionLink,
    previewAssets,
  };
}

