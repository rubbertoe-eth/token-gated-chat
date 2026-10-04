import { NextRequest,NextResponse } from 'next/server';
import { matchesSecret } from '../../../shared/gate.mjs';
import { createTicket } from '~/lib/nonce';
import { getVerifiedUser,removeVerifiedUser } from '~/lib/kv-store';
import { checkBalance } from '~/lib/token';
import { invite,removeMember,telegram } from '~/lib/telegram';
export const maxDuration=60;
export async function POST(req:NextRequest) {
  if (!matchesSecret(req.headers.get('x-telegram-bot-api-secret-token'),process.env.TELEGRAM_WEBHOOK_SECRET))
    return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    const update=await req.json();
    const join=update.chat_join_request;
    if (join && String(join.chat.id)===process.env.TELEGRAM_CHAT_ID) {
      const tg=String(join.from.id), user=await getVerifiedUser(tg);
      const allowed=user && await checkBalance(user.wallet);
      await telegram(allowed?'approveChatJoinRequest':'declineChatJoinRequest',{chat_id:join.chat.id,user_id:join.from.id});
      if (!allowed) await telegram('sendMessage',{chat_id:join.user_chat_id,text:'Cojones check first. Hold over 10M and send /start to @BrainArmWhaleBot.'}).catch(()=>{});
    }
    const member=update.chat_member;
    if (member && String(member.chat.id)===process.env.TELEGRAM_CHAT_ID &&
      ['left','kicked'].includes(member.old_chat_member.status) && member.new_chat_member.status==='member') {
      const tg=String(member.new_chat_member.user.id), user=await getVerifiedUser(tg);
      if (!user || !await checkBalance(user.wallet)) await removeMember(tg);
    }
    const msg=update.message;
    if (msg?.chat.type==='private' && msg.from && !msg.from.is_bot) {
      const tg=String(msg.from.id), cmd=(msg.text||'').split(/\s/)[0].split('@')[0];
      const user=await getVerifiedUser(tg), allowed=user && await checkBalance(user.wallet);
      if (cmd==='/status') {
        await telegram('sendMessage',{chat_id:msg.chat.id,text:allowed?'Cojones confirmed. Your wallet still holds over 10M Brain Armstrong.':'Not verified with enough tokens. Send /start.'});
      } else if (allowed) {
        const link=await invite(tg);
        await telegram('sendMessage',{chat_id:msg.chat.id,text:`Cojones confirmed. Come on in.\n\n${link}`});
      } else {
        if (user) {
          const member=await telegram('getChatMember',{chat_id:process.env.TELEGRAM_CHAT_ID,user_id:Number(tg)});
          if (['member','restricted'].includes(member.status)) await removeMember(tg);
          await removeVerifiedUser(tg,user.wallet);
        }
        const ticket=await createTicket(tg,process.env.TELEGRAM_CHAT_ID!);
        await telegram('sendMessage',{chat_id:msg.chat.id,text:`Big brain. Big arms. Bigger cojones.\n\nHold over 10M Brain Armstrong on Base? Verify here:\n${process.env.WEB_URL}/verify?ticket=${ticket}\n\nSign a message only. No token approval or payment required. Link expires in 10 minutes.`});
      }
    }
    return NextResponse.json({ok:true});
  } catch { return NextResponse.json({error:'Service temporarily unavailable'},{status:503}); }
}
