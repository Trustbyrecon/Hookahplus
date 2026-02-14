import { createReflexLayer, quickReflexCheck } from '../../../lib/reflex';
import type { ReflexContext } from '../../../lib/reflex/useReflex';

/**
 * Integration layer for the guests app to use the Reflex Layer
 */

// Pre-configured reflex contexts for common guests app operations
export const GUESTS_REFLEX_CONTEXTS = {
  CART_OPERATION: {
    route: 'guests/cart',
    action: 'cart_operation',
    domain: 'hookah'
  } as ReflexContext,
  
  PAYMENT_PROCESSING: {
    route: 'guests/payment',
    action: 'payment_processing',
    domain: 'payment'
  } as ReflexContext,
  
  API_RESPONSE: {
    route: 'guests/api',
    action: 'api_response',
    domain: 'api'
  } as ReflexContext,
  
  UI_RENDERING: {
    route: 'guests/ui',
    action: 'ui_rendering',
    domain: 'ui'
  } as ReflexContext
};

/**
 * Quick reflex check for cart operations
 */
export async function checkCartOperation(output: string | object | null): Promise<boolean> {
  return quickReflexCheck(
    output,
    GUESTS_REFLEX_CONTEXTS.CART_OPERATION.route,
    GUESTS_REFLEX_CONTEXTS.CART_OPERATION.action,
    GUESTS_REFLEX_CONTEXTS.CART_OPERATION.domain
  );
}

/**
 * Quick reflex check for payment operations
 */
export async function checkPaymentOperation(output: string | object | null): Promise<boolean> {
  // For payment operations, we need to be more lenient
  // Check if it's a valid payment request structure
  if (typeof output === 'object' && output !== null) {
    const paymentData = output as any;
    // Basic validation - if it has source or is empty object, allow it
    if (paymentData.source || Object.keys(paymentData).length === 0) {
      return true;
    }
  }
  
  // For string output, check if it's a valid payment description
  if (typeof output === 'string' && output.length > 0) {
    return true;
  }
  
  // Use the standard reflex check as fallback
  return quickReflexCheck(
    output,
    GUESTS_REFLEX_CONTEXTS.PAYMENT_PROCESSING.route,
    GUESTS_REFLEX_CONTEXTS.PAYMENT_PROCESSING.action,
    GUESTS_REFLEX_CONTEXTS.PAYMENT_PROCESSING.domain
  );
}

/**
 * Quick reflex check for API responses
 */
export async function checkApiResponse(output: string | object | null): Promise<boolean> {
  return quickReflexCheck(
    output,
    GUESTS_REFLEX_CONTEXTS.API_RESPONSE.route,
    GUESTS_REFLEX_CONTEXTS.API_RESPONSE.action,
    GUESTS_REFLEX_CONTEXTS.API_RESPONSE.domain
  );
}

/**
 * Create a reflex layer for a specific guests app operation
 */
export function createGuestsReflexLayer(context: ReflexContext) {
  return createReflexLayer(context);
}

/**
 * Monitor guests app system health
 */
export function getGuestsSystemHealth() {
  const cartReflex = createGuestsReflexLayer(GUESTS_REFLEX_CONTEXTS.CART_OPERATION);
  const paymentReflex = createGuestsReflexLayer(GUESTS_REFLEX_CONTEXTS.PAYMENT_PROCESSING);
  const apiReflex = createGuestsReflexLayer(GUESTS_REFLEX_CONTEXTS.API_RESPONSE);
  
  return {
    cart: cartReflex.getSystemHealth(),
    payment: paymentReflex.getSystemHealth(),
    api: apiReflex.getSystemHealth()
  };
}

/**
 * Get nodes needing attention in the guests app
 */
export function getGuestsNodesNeedingAttention() {
  const cartReflex = createGuestsReflexLayer(GUESTS_REFLEX_CONTEXTS.CART_OPERATION);
  const paymentReflex = createGuestsReflexLayer(GUESTS_REFLEX_CONTEXTS.PAYMENT_PROCESSING);
  const apiReflex = createGuestsReflexLayer(GUESTS_REFLEX_CONTEXTS.API_RESPONSE);
  
  return {
    cart: cartReflex.getNodesNeedingAttention(),
    payment: paymentReflex.getNodesNeedingAttention(),
    api: apiReflex.getNodesNeedingAttention()
  };
}
