import { NextRequest,NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { consumeNonce } from '~/lib/nonce';
import { checkBalance } from '~/lib/token';
import { saveVerifiedUser } from '~/lib/kv-store';
import { invite,telegram } from '~/lib/telegram';
export async function POST(req:NextRequest) {
  let verified:SiweMessage;
  try {
    const {message,signature}=await req.json();
    const origin=new URL(process.env.WEB_URL!);
    const siwe=new SiweMessage(message);
    if (siwe.chainId!==8453 || siwe.uri!==origin.origin) throw new Error('Wrong origin');
    const result=await siwe.verify({signature,domain:origin.host});
    verified=result.data;
  } catch { return NextResponse.json({error:'Invalid wallet signature or verification origin.'},{status:400}); }
  try {
    const session=await consumeNonce(verified.nonce);
    if (!session || verified.statement!==`Verify Brain Armstrong ownership for Telegram user ${session.tg}`)
      return NextResponse.json({error:'Link expired or used. Send /start for a new one.'},{status:400});
    if (!await checkBalance(verified.address)) return NextResponse.json({error:'Hold MORE than 10,000,000 Brain Armstrong tokens on Base. Send /start to retry.'},{status:403});
    if (!await saveVerifiedUser(session.tg,verified.address)) return NextResponse.json({error:'Wallet already linked to another Telegram account.'},{status:409});
    const inviteLink=await invite(session.tg);
    await telegram('sendMessage',{chat_id:Number(session.tg),text:`Over 10M? Those are some heavy bags, señor. Cojones confirmed. You're in.\n\n${inviteLink}`}).catch(()=>{});
    return NextResponse.json({success:true,inviteLink});
  } catch { return NextResponse.json({error:'Service temporarily unavailable. Send /start for a new link.'},{status:503}); }
}
