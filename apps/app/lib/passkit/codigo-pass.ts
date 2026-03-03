import { PKPass } from 'passkit-generator';
import { prisma } from '../db';
import { createSolidPng } from './png';
import { computePassAuthToken } from './auth';

type CodigoPassSnapshot = {
  hid: string;
  verified: boolean;
  consentOn: boolean;
  tierLabel: string;
  visits: number;
};

function getAppUrl(): string {
  const url =
    (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '').trim() ||
    'https://app.hookahplus.net';
  return url.replace(/\/+$/, '');
}

function requireEnv(name: string): string {
  const v = (process.env[name] || '').trim();
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function getCertificates() {
  // These should be PEM contents (base64-encoded in env).
  const wwdr = Buffer.from(requireEnv('PASSKIT_WWDR_PEM_BASE64'), 'base64');
  const signerCert = Buffer.from(requireEnv('PASSKIT_SIGNER_CERT_PEM_BASE64'), 'base64');
  const signerKey = Buffer.from(requireEnv('PASSKIT_SIGNER_KEY_PEM_BASE64'), 'base64');
  const signerKeyPassphrase = (process.env.PASSKIT_SIGNER_KEY_PASSPHRASE || '').trim() || undefined;
  return { wwdr, signerCert, signerKey, signerKeyPassphrase };
}

async function snapshotForHid(hid: string): Promise<CodigoPassSnapshot> {
  const profile = await prisma.networkProfile.findUnique({
    where: { hid },
    select: { hid: true, phoneHash: true, emailHash: true, consentLevel: true, tier: true },
  });
  if (!profile) {
    throw new Error('Member not found');
  }

  const visits = await prisma.session.count({ where: { hid } });
  const verified = Boolean(profile.phoneHash || profile.emailHash);
  const consentOn = profile.consentLevel === 'network_shared';

  const tierLabel =
    (profile.tier && profile.tier.trim()) ||
    (visits >= 10 ? 'Gold' : visits >= 3 ? 'Silver' : 'Founding');

  return { hid, verified, consentOn, tierLabel, visits };
}

export async function generateCodigoPkPass(args: { memberId: string }): Promise<Buffer> {
  const appUrl = getAppUrl();
  const passTypeIdentifier = requireEnv('PASSKIT_PASS_TYPE_IDENTIFIER');
  const teamIdentifier = requireEnv('PASSKIT_TEAM_IDENTIFIER');
  const authSecret = requireEnv('PASSKIT_AUTH_SECRET');

  const snap = await snapshotForHid(args.memberId);
  const serialNumber = snap.hid;
  const authenticationToken = computePassAuthToken({ serialNumber, secret: authSecret });

  // Minimal, compliant media (generated at runtime).
  const icon = createSolidPng({ width: 29, height: 29, rgba: { r: 20, g: 184, b: 166, a: 255 } }); // teal-500
  const icon2x = createSolidPng({ width: 58, height: 58, rgba: { r: 20, g: 184, b: 166, a: 255 } });
  const logo = createSolidPng({ width: 160, height: 50, rgba: { r: 9, g: 9, b: 11, a: 255 } }); // zinc-950
  const logo2x = createSolidPng({ width: 320, height: 100, rgba: { r: 9, g: 9, b: 11, a: 255 } });

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    organizationName: 'CODIGO',
    description: 'CODIGO Passport',
    serialNumber,

    // Updatable wiring (Phase 1): Wallet uses this to check for updated passes.
    webServiceURL: `${appUrl}/api/pkpass`,
    authenticationToken,

    backgroundColor: 'rgb(9, 9, 11)',
    foregroundColor: 'rgb(229, 231, 235)',
    labelColor: 'rgb(161, 161, 170)',
    logoText: 'CODIGO',

    storeCard: {
      primaryFields: [
        {
          key: 'status',
          label: 'STATUS',
          value: snap.verified ? 'Verified' : 'Unverified',
        },
      ],
      secondaryFields: [
        { key: 'tier', label: 'TIER', value: snap.tierLabel },
        { key: 'visits', label: 'VISITS', value: String(snap.visits) },
      ],
      auxiliaryFields: [
        { key: 'recognition', label: 'RECOGNITION', value: snap.consentOn ? 'On' : 'Off' },
      ],
      backFields: [
        { key: 'privacy', label: 'Manage Privacy', value: `${appUrl}/codigo/privacy` },
        { key: 'hid', label: 'Member ID', value: snap.hid },
      ],
    },
  };

  const pass = new PKPass(
    {
      'pass.json': Buffer.from(JSON.stringify(passJson), 'utf8'),
      'icon.png': icon,
      'icon@2x.png': icon2x,
      'logo.png': logo,
      'logo@2x.png': logo2x,
    },
    getCertificates()
  );

  // QR barcode that encodes HID
  pass.setBarcodes({
    message: snap.hid,
    format: 'PKBarcodeFormatQR',
    altText: snap.hid,
  });

  return pass.getAsBuffer();
}

