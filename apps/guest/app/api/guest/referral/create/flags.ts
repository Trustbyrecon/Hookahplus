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
    points: true,
  },
  referral: {
    qr: {
      v1: true,
    },
    p2p: true,
    connector: true,
  },
  memory: {
    breadcrumbs: {
      v1: true,
    },
    timeline: true,
  },
  ghostlog: {
    lite: true,
    full: false,
  },
  pricing: {
    dynamic: true,
    promos: true,
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
      points: true,
    },
    referral: {
      qr: {
        v1: true,
      },
      p2p: true,
      connector: true,
    },
    memory: {
      breadcrumbs: {
        v1: true,
      },
      timeline: true,
    },
    ghostlog: {
      lite: true,
      full: false,
    },
    pricing: {
      dynamic: true,
      promos: true,
    },
  }),
};

export const isDynamicPricingEnabled = () => true;
export const isPromosEnabled = () => true;
