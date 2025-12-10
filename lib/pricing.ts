import { applyTokenToSession } from "@/lib/reward-tokens";

type AddOn = { name: string; priceCents: number; quantity?: number; premium?: boolean };

const toInt = (value: any, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const DEFAULT_BASE = toInt(process.env.BASE_PRICE_CENTS, 2500);
const DEFAULT_MARGIN = toInt(process.env.LOUNGE_MARGIN_CENTS, 500);
const PREMIUM_FLOOR = toInt(process.env.PREMIUM_ADDON_FLOOR_CENTS, 500);

export type ReceiptPreviewInput = {
  basePriceCents?: number;
  premiumAddOns?: AddOn[];
  marginCents?: number;
  sessionId?: string;
  qrLink?: string;
  tableId?: string;
  rewardToken?: any; // RewardToken from database
};

export type ReceiptPreview = {
  basePriceCents: number;
  premiumAddOns: AddOn[];
  loungeMarginCents: number;
  discountCents: number;
  totalCents: number;
  sessionId?: string;
  qrLink?: string;
  tableId?: string;
  appliedRewardToken?: any;
  stripeLineItems: Array<{
    price_data: {
      currency: "usd";
      product_data: { name: string };
      unit_amount: number;
    };
    quantity: number;
  }>;
};

export function buildReceiptPreview(input: ReceiptPreviewInput): ReceiptPreview {
  const basePriceCents = toInt(input.basePriceCents, DEFAULT_BASE);
  const loungeMarginCents = Math.max(0, toInt(input.marginCents, DEFAULT_MARGIN));
  const premiumAddOns =
    input.premiumAddOns?.map((a) => ({
      ...a,
      quantity: a.quantity ?? 1,
      priceCents: Math.max(a.priceCents, PREMIUM_FLOOR),
      premium: a.premium ?? true,
    })) ?? [];

  const addOnsTotal = premiumAddOns.reduce(
    (sum, a) => sum + a.priceCents * (a.quantity ?? 1),
    0
  );
  const subtotalCents = basePriceCents + loungeMarginCents + addOnsTotal;

  // Apply reward token discount if provided
  let discountCents = 0;
  let appliedRewardToken = null;
  if (input.rewardToken) {
    const result = applyTokenToSession(
      input.rewardToken,
      basePriceCents,
      premiumAddOns,
      loungeMarginCents
    );
    discountCents = result.discountCents;
    appliedRewardToken = result.appliedToken;
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);

  const stripeLineItems = [
    {
      price_data: {
        currency: "usd" as const,
        product_data: { name: "Hookah Session" },
        unit_amount: basePriceCents,
      },
      quantity: 1,
    },
    ...premiumAddOns.map((addon) => ({
      price_data: {
        currency: "usd" as const,
        product_data: { name: addon.name || "Premium add-on" },
        unit_amount: addon.priceCents,
      },
      quantity: addon.quantity ?? 1,
    })),
    {
      price_data: {
        currency: "usd" as const,
        product_data: { name: "Lounge margin" },
        unit_amount: loungeMarginCents,
      },
      quantity: 1,
    },
  ];

  // Add discount line item if applicable
  if (discountCents > 0) {
    stripeLineItems.push({
      price_data: {
        currency: "usd" as const,
        product_data: { name: "Reward Discount" },
        unit_amount: -discountCents, // Negative for discount
      },
      quantity: 1,
    });
  }

  return {
    basePriceCents,
    premiumAddOns,
    loungeMarginCents,
    discountCents,
    totalCents,
    sessionId: input.sessionId,
    qrLink: input.qrLink,
    tableId: input.tableId,
    appliedRewardToken,
    stripeLineItems,
  };
}

