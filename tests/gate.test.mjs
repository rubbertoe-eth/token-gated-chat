import test from 'node:test';
import assert from 'node:assert/strict';
import { qualifies,MIN_BALANCE,matchesSecret,validIdentity } from '../shared/gate.mjs';
test('strict 10M integer boundary',()=>{
 assert.equal(qualifies(MIN_BALANCE-1n),false);
 assert.equal(qualifies(MIN_BALANCE),false);
 assert.equal(qualifies(MIN_BALANCE+1n),true);
});
test('missing and incorrect secrets cannot authenticate',()=>{
 assert.equal(matchesSecret(undefined,undefined),false);
 assert.equal(matchesSecret('Bearer undefined',undefined),false);
 assert.equal(matchesSecret('secret','secret'),true);
 assert.equal(matchesSecret('secret','secrex'),false);
 assert.equal(matchesSecret('secret','secretx'),false);
});
test('session needs valid identity, group and expiry',()=>{
 const s={tg:'12345',chat:'-3812739644',expiresAt:2000};
 assert.equal(validIdentity(s,s.chat,1000),true);
 assert.equal(validIdentity(s,'-100999',1000),false);
 assert.equal(validIdentity(s,s.chat,2000),false);
 assert.equal(validIdentity({...s,tg:'../123'},s.chat,1000),false);
 assert.equal(validIdentity({...s,expiresAt:undefined},s.chat,1000),false);
});
