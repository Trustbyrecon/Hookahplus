import { computePassAuthToken, parseApplePassAuthorizationHeader } from './auth';

export function getPasskitConfig() {
  const passTypeIdentifier = (process.env.PASSKIT_PASS_TYPE_IDENTIFIER || '').trim();
  const authSecret = (process.env.PASSKIT_AUTH_SECRET || '').trim();
  return { passTypeIdentifier, authSecret };
}

export function requirePassTypeIdentifierOrThrow(passTypeIdentifierFromPath: string) {
  const { passTypeIdentifier } = getPasskitConfig();
  if (!passTypeIdentifier) throw new Error('Missing required env: PASSKIT_PASS_TYPE_IDENTIFIER');
  if (passTypeIdentifierFromPath !== passTypeIdentifier) {
    const err: any = new Error('Pass type not found');
    err.status = 404;
    throw err;
  }
}

export function assertApplePassAuthOrThrow(args: { authorizationHeader: string | null; serialNumber: string }) {
  const { authSecret } = getPasskitConfig();
  if (!authSecret) throw new Error('Missing required env: PASSKIT_AUTH_SECRET');
  const provided = parseApplePassAuthorizationHeader(args.authorizationHeader);
  if (!provided) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  const expected = computePassAuthToken({ serialNumber: args.serialNumber, secret: authSecret });
  if (provided !== expected) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
}

