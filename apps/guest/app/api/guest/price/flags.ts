export const featureFlags = {
  guest: {
    enabled: true,
    qrFirst: true,
    anonymousMode: true,
  },
  rewards: {
    badges: {
      v1: true,
    },
  },
  referral: {
    qr: {
      v1: true,
    },
  },
  memory: {
    breadcrumbs: {
      v1: true,
    },
  },
  ghostlog: {
    lite: true,
  },
  getLoungeFlags: (loungeId: string) => ({
    guest: {
      enabled: true,
      qrFirst: true,
      anonymousMode: true,
    },
    rewards: {
      badges: {
        v1: true,
      },
    },
    referral: {
      qr: {
        v1: true,
      },
    },
    memory: {
      breadcrumbs: {
        v1: true,
      },
    },
    ghostlog: {
      lite: true,
    },
  }),
};

export const isDynamicPricingEnabled = () => true;
export const isPromosEnabled = () => true;
