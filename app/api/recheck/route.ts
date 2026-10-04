import { NextRequest,NextResponse } from 'next/server';
import { matchesSecret } from '../../../shared/gate.mjs';
import { getVerifiedUsers,getVerifiedUser,removeVerifiedUser } from '~/lib/kv-store';
import { checkBalance } from '~/lib/token';
import { removeMember,telegram } from '~/lib/telegram';
export const maxDuration=60;
export async function GET(req:NextRequest) {
  if (!process.env.CRON_SECRET || !matchesSecret(req.headers.get('authorization'),`Bearer ${process.env.CRON_SECRET}`))
    return NextResponse.json({error:'Unauthorized'},{status:401});
  const result={ok:0,removed:0,errors:0};
  try {
    for (const [tg,user] of Object.entries(await getVerifiedUsers())) {
      try {
        if (await checkBalance(user.wallet)) {result.ok++;continue;}
        const current=await getVerifiedUser(tg);
        if (!current || current.wallet!==user.wallet || current.verifiedAt!==user.verifiedAt) continue;
        const member=await telegram('getChatMember',{chat_id:process.env.TELEGRAM_CHAT_ID,user_id:Number(tg)});
        if (['administrator','creator'].includes(member.status)) continue;
        if (['member','restricted'].includes(member.status)) await removeMember(tg);
        await removeVerifiedUser(tg,user.wallet);
        result.removed++;
        await telegram('sendMessage',{chat_id:Number(tg),text:'Your bags got lighter. Hold over 10M Brain Armstrong to stay in. Send /start once you qualify again.'}).catch(()=>{});
      } catch {result.errors++;}
    }
    return NextResponse.json(result,{status:result.errors?503:200});
  } catch {return NextResponse.json({error:'Recheck temporarily unavailable'},{status:503});}
}
