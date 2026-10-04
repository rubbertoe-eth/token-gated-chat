import crypto from 'crypto';
import { kv } from '@vercel/kv';
import { validIdentity } from '../shared/gate.mjs';
export interface Session { tg: string; chat: string; expiresAt: number; ticket?: string }
export async function createTicket(tg: string, chat: string) {
  const ticket=crypto.randomBytes(32).toString('hex');
  await kv.set(`gate:ticket:${ticket}`,{tg,chat,expiresAt:Date.now()+600_000},{ex:600});
  return ticket;
}
export async function createNonce(ticket: string) {
  if (!/^[a-f0-9]{64}$/.test(ticket)) return null;
  const session=await kv.get<Session>(`gate:ticket:${ticket}`);
  if (!validIdentity(session,process.env.TELEGRAM_CHAT_ID)) return null;
  const nonce=crypto.randomBytes(32).toString('hex');
  await kv.set(`gate:nonce:${nonce}`,{...session,ticket},{ex:600});
  return {nonce,session:session!};
}
export async function consumeNonce(nonce: string) {
  if (!/^[a-f0-9]{64}$/.test(nonce)) return null;
  const session=await kv.getdel<Session>(`gate:nonce:${nonce}`);
  if (!validIdentity(session,process.env.TELEGRAM_CHAT_ID)) return null;
  const ticket=await kv.getdel<Session>(`gate:ticket:${session!.ticket}`);
  return validIdentity(ticket,process.env.TELEGRAM_CHAT_ID)?session:null;
}
