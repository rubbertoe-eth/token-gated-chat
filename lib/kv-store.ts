import { kv } from '@vercel/kv';
export interface VerifiedUser { wallet: string; verifiedAt: number }
export type VerifiedUsers=Record<string,VerifiedUser>;
const USERS='brain:verified-users';
export async function getVerifiedUsers(): Promise<VerifiedUsers> { return await kv.hgetall<VerifiedUsers>(USERS)||{}; }
export async function getVerifiedUser(tg:string): Promise<VerifiedUser|null> { return kv.hget(USERS,tg); }
export async function saveVerifiedUser(tg:string,wallet:string): Promise<boolean> {
  const result=await kv.eval(`
    local owner=redis.call('GET',KEYS[2])
    if owner and owner~=ARGV[1] then return 0 end
    local old=redis.call('HGET',KEYS[1],ARGV[1])
    if old then
      local oldwallet=cjson.decode(old).wallet
      if oldwallet~=ARGV[2] then redis.call('DEL','brain:wallet:'..oldwallet) end
    end
    redis.call('SET',KEYS[2],ARGV[1])
    redis.call('HSET',KEYS[1],ARGV[1],ARGV[3])
    return 1
  `,[USERS,`brain:wallet:${wallet.toLowerCase()}`],[tg,wallet.toLowerCase(),JSON.stringify({wallet:wallet.toLowerCase(),verifiedAt:Date.now()})]);
  return result===1;
}
export async function removeVerifiedUser(tg:string,expectedWallet:string) {
  await kv.eval(`
    local user=redis.call('HGET',KEYS[1],ARGV[1])
    if not user then return 0 end
    local wallet=cjson.decode(user).wallet
    if wallet~=ARGV[2] then return 0 end
    redis.call('HDEL',KEYS[1],ARGV[1])
    if redis.call('GET','brain:wallet:'..wallet)==ARGV[1] then redis.call('DEL','brain:wallet:'..wallet) end
    return 1
  `,[USERS],[tg,expectedWallet]);
}
