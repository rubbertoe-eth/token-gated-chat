import { timingSafeEqual } from 'node:crypto';
export const TOKEN_ADDRESS = '0xb2000000000000000000005a0c125da6cf531d01';
export const MIN_BALANCE = 10_000_000n * 10n ** 18n;
export function qualifies(balance) { return BigInt(balance) > MIN_BALANCE; }
export function matchesSecret(actual, expected) {
  if (!actual || !expected) return false;
  const a=Buffer.from(actual), b=Buffer.from(expected);
  return a.length===b.length && timingSafeEqual(a,b);
}
export function validIdentity(data, chat, now=Date.now()) {
  return !!data && /^[1-9][0-9]*$/.test(data.tg) && data.chat===chat &&
    Number.isFinite(data.expiresAt) && data.expiresAt>now;
}
