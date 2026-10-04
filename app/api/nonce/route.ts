import { NextRequest,NextResponse } from 'next/server';
import { createNonce } from '~/lib/nonce';
export async function GET(req:NextRequest) {
  try {
    const result=await createNonce(req.nextUrl.searchParams.get('ticket')||'');
    if (!result) return NextResponse.json({error:'Link expired. Send /start for a new one.'},{status:400});
    return NextResponse.json({nonce:result.nonce,telegramUserId:result.session.tg},{headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'Verification temporarily unavailable.'},{status:503}); }
}
