export async function telegram(method: string, body: Record<string,unknown>): Promise<any> {
  const token=process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Bot is not configured');
  const res=await fetch(`https://api.telegram.org/bot${token}/${method}`,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10_000)
  });
  const data=await res.json();
  if (!res.ok || !data.ok) throw new Error(`Telegram ${method} failed (${data.error_code || res.status})`);
  return data.result;
}
export async function invite(tg: string) {
  const result=await telegram('createChatInviteLink',{chat_id:process.env.TELEGRAM_CHAT_ID,creates_join_request:true,
    expire_date:Math.floor(Date.now()/1000)+600,name:`Verified ${tg}`});
  return result.invite_link as string;
}
export async function removeMember(tg: string) {
  await telegram('banChatMember',{chat_id:process.env.TELEGRAM_CHAT_ID,user_id:Number(tg)});
  await telegram('unbanChatMember',{chat_id:process.env.TELEGRAM_CHAT_ID,user_id:Number(tg),only_if_banned:true});
}
