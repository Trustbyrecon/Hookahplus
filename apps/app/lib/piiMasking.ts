// apps/app/lib/piiMasking.ts

export type PiiLevel = 'none' | 'low' | 'medium' | 'high';

export interface PiiMaskingConfig {
  enabled: boolean;
  maskNames: boolean;
  maskPhones: boolean;
  maskEmails: boolean;
  maskAddresses: boolean;
  customPatterns?: RegExp[];
}

export const defaultPiiConfig: PiiMaskingConfig = {
  enabled: true,
  maskNames: true,
  maskPhones: true,
  maskEmails: true,
  maskAddresses: true,
};

/**
 * Masks PII in text content based on the specified level and configuration
 */
export function maskPiiContent(
  content: string, 
  piiLevel: PiiLevel, 
  config: PiiMaskingConfig = defaultPiiConfig
): string {
  if (!config.enabled || piiLevel === 'none') {
    return content;
  }

  let maskedContent = content;

  // Mask names (First Last pattern)
  if (config.maskNames && (piiLevel === 'low' || piiLevel === 'medium' || piiLevel === 'high')) {
    maskedContent = maskedContent.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CUSTOMER NAME]');
  }

  // Mask phone numbers
  if (config.maskPhones && (piiLevel === 'medium' || piiLevel === 'high')) {
    // Various phone number formats
    maskedContent = maskedContent.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]');
    maskedContent = maskedContent.replace(/\b\(\d{3}\) \d{3}-\d{4}\b/g, '[PHONE]');
    maskedContent = maskedContent.replace(/\b\+1 \(\d{3}\) \d{3}-\d{4}\b/g, '[PHONE]');
    maskedContent = maskedContent.replace(/\b\d{10}\b/g, '[PHONE]');
  }

  // Mask email addresses
  if (config.maskEmails && piiLevel === 'high') {
    maskedContent = maskedContent.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
  }

  // Mask addresses (basic patterns)
  if (config.maskAddresses && piiLevel === 'high') {
    maskedContent = maskedContent.replace(/\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/g, '[ADDRESS]');
  }

  // Apply custom patterns
  if (config.customPatterns) {
    config.customPatterns.forEach(pattern => {
      maskedContent = maskedContent.replace(pattern, '[MASKED]');
    });
  }

  return maskedContent;
}

/**
 * Detects PII level in content based on the presence of personal information
 */
export function detectPiiLevel(content: string): PiiLevel {
  const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
  const phonePattern = /\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\) \d{3}-\d{4}\b|\b\+1 \(\d{3}\) \d{3}-\d{4}\b/g;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const addressPattern = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b/g;

  const hasEmail = emailPattern.test(content);
  const hasAddress = addressPattern.test(content);
  const hasPhone = phonePattern.test(content);
  const hasName = namePattern.test(content);

  if (hasEmail || hasAddress) {
    return 'high';
  }
  if (hasPhone) {
    return 'medium';
  }
  if (hasName) {
    return 'low';
  }
  return 'none';
}

/**
 * Gets the appropriate color class for PII level indicators
 */
export function getPiiLevelColor(piiLevel: PiiLevel): string {
  switch (piiLevel) {
    case 'none':
      return 'text-green-400 bg-green-600/20';
    case 'low':
      return 'text-yellow-400 bg-yellow-600/20';
    case 'medium':
      return 'text-orange-400 bg-orange-600/20';
    case 'high':
      return 'text-red-400 bg-red-600/20';
    default:
      return 'text-gray-400 bg-gray-600/20';
  }
}

/**
 * Gets the appropriate icon for PII level indicators
 */
export function getPiiLevelIcon(piiLevel: PiiLevel): string {
  switch (piiLevel) {
    case 'none':
      return '✅';
    case 'low':
      return '⚠️';
    case 'medium':
      return '🔒';
    case 'high':
      return '🛡️';
    default:
      return '❓';
  }
}

/**
 * Masks customer data in session objects
 */
export function maskSessionData(session: any, piiLevel: PiiLevel, config: PiiMaskingConfig = defaultPiiConfig): any {
  if (!config.enabled || piiLevel === 'none') {
    return session;
  }

  const maskedSession = { ...session };

  // Mask customer name
  if (maskedSession.customerName && config.maskNames) {
    maskedSession.customerName = '[CUSTOMER NAME]';
  }

  // Mask customer phone
  if (maskedSession.customerPhone && config.maskPhones) {
    maskedSession.customerPhone = '[PHONE]';
  }

  // Mask notes
  if (maskedSession.notes) {
    maskedSession.notes = maskPiiContent(maskedSession.notes, piiLevel, config);
  }

  // Mask edge case notes
  if (maskedSession.edgeCase) {
    maskedSession.edgeCase = maskPiiContent(maskedSession.edgeCase, piiLevel, config);
  }

  return maskedSession;
}

/**
 * Creates a PII-safe summary for logging and analytics
 */
export function createPiiSafeSummary(session: any, piiLevel: PiiLevel): any {
  return {
    id: session.id,
    tableId: session.tableId,
    status: session.status,
    currentStage: session.currentStage,
    flavor: session.flavor,
    amount: session.amount,
    sessionDuration: session.sessionDuration,
    coalStatus: session.coalStatus,
    refillStatus: session.refillStatus,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    // PII-safe fields
    customerName: piiLevel === 'none' ? session.customerName : '[CUSTOMER NAME]',
    customerPhone: piiLevel === 'none' ? session.customerPhone : '[PHONE]',
    notes: maskPiiContent(session.notes || '', piiLevel),
    edgeCase: maskPiiContent(session.edgeCase || '', piiLevel),
    piiLevel,
    piiMasked: piiLevel !== 'none'
  };
}
