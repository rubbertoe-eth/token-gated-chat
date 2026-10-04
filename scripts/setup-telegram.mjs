// Run locally with .env.local. Never paste secrets into a chat or browser URL.
const required=['TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID','WEB_URL','TELEGRAM_WEBHOOK_SECRET'];
for(const key of required) if(!process.env[key]) throw new Error(`Missing ${key}`);
const origin=new URL(process.env.WEB_URL);
if(origin.protocol!=='https:') throw new Error('WEB_URL must use HTTPS');
if(!/^[A-Za-z0-9_-]{32,256}$/.test(process.env.TELEGRAM_WEBHOOK_SECRET)) throw new Error('Use a random 32+ character webhook secret');
async function api(method,body={}) {
 const res=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data=await res.json();
 if(!res.ok||!data.ok) throw new Error(`Telegram ${method} failed (${data.error_code||res.status})`);
 return data.result;
}
try {
 const bot=await api('getMe');
 const chat=await api('getChat',{chat_id:process.env.TELEGRAM_CHAT_ID});
 if(chat.type!=='supergroup') throw new Error('Convert the holders group to a supergroup first, then update TELEGRAM_CHAT_ID to its new ID.');
 const member=await api('getChatMember',{chat_id:chat.id,user_id:bot.id});
 if(member.status!=='administrator'||!member.can_invite_users||!member.can_restrict_members) throw new Error('Bot needs Invite Users and Ban Users admin permissions');
 const health=await fetch(`${origin.origin}/api/telegram`,{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Bot-Api-Secret-Token':process.env.TELEGRAM_WEBHOOK_SECRET},body:'{}'});
 if(!health.ok) throw new Error('Deploy the app and matching webhook secret before setup');
 await api('setMyCommands',{commands:[{command:'start',description:'Verify holdings and get access'},{command:'status',description:'Check your current holdings status'}]});
 await api('setWebhook',{url:`${origin.origin}/api/telegram`,secret_token:process.env.TELEGRAM_WEBHOOK_SECRET,allowed_updates:['message','chat_member','chat_join_request'],max_connections:1});
 const webhook=await api('getWebhookInfo');
 console.log(`Connected @${bot.username} to ${chat.title} (${chat.id}). Webhook: ${webhook.url}`);
} catch(err) {console.error(err.message);process.exitCode=1;}
