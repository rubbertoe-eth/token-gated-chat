# Brain Armstrong Telegram gate

Cojones Checker (@BrainArmWhaleBot) grants access to one Telegram account per verified wallet holding **strictly more than 10,000,000** Brain Armstrong tokens on Base. Contract: `0xb2000000000000000000005a0c125da6cf531d01` (18 decimals).

## Architecture

Deploy this Next.js app to Vercel and attach Upstash Redis. Telegram calls `/api/telegram` using an authenticated webhook; no separate polling worker is needed. Do not run the original polling bot or Express server. The legacy scripts are not part of this deployment.

Members DM `/start`, receive a private expiring ticket, connect their wallet, and sign a SIWE message. The server checks Base holdings and provides a 10-minute join-request invite. Entry is approved only after checking the requesting Telegram account and its current balance. A shared link alone grants no access. SIWE tickets and nonces are single-use; the expected domain, URI, group, and chain are enforced. RPC failures preserve existing memberships and leave joins pending.

## Telegram group

Use a **private supergroup**. The supplied ID `-3812739644` appears to be a basic group; conversion changes its ID. Obtain and configure the new ID after conversion. The setup script checks group type and permissions before registering the webhook. Bot needs Invite Users and Ban Users. Keep all ordinary member invitation permissions disabled, revoke old direct-join links, and use bot-issued join-request links. Admins can bypass the gate by adding or approving people, so reserve admin roles for trusted operators.

Telegram bots cannot enumerate all pre-existing members. Ask current members to verify before launch; the periodic job only checks registered wallets. Administrators and owners are not removable by this bot. Existing unverified members must be reviewed manually.

## Environment

Copy `.env.example` to `.env.local` for local setup, or use Vercel environment settings for deployment:

- `TELEGRAM_BOT_TOKEN`: BotFather credential. Keep private.
- `TELEGRAM_CHAT_ID`: final supergroup ID.
- `WEB_URL`: exact production HTTPS origin, without a trailing slash.
- `TELEGRAM_WEBHOOK_SECRET`: random secret, at least 32 characters, using letters, digits, `_` or `-`.
- `CRON_SECRET`: separate random secret for scheduled rechecks.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`: Upstash Redis REST credentials. If integration provides `UPSTASH_REDIS_REST_*`, map the matching values to these variable names.
- `BASE_RPC_URL`: production Base RPC endpoint; public RPC is fine for initial testing.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: your own WalletConnect/Reown project ID; allowlist the production domain.

Create secrets locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Never commit `.env.local`, bot tokens, or Redis credentials.

## Deployment and activation

1. Import this repository into Vercel, connect Redis, and set environment variables.
2. Deploy; this repository includes a daily recheck at 09:00 UTC. Vercel Hobby permits daily cron only. On a plan supporting frequent cron, change schedule to `0 */4 * * *` for checks every four hours. Sales may preserve access until the next successful recheck; this is not continuous monitoring.
3. On your own computer, run `npm ci`, then `npm run setup:telegram` with `.env.local` configured. The script verifies the bot, supergroup, rights, and webhook endpoint, then registers the webhook and bot commands. It prints no secrets.
4. Test with a holder wallet and a non-holder wallet before sharing the bot publicly.

The successful DM uses: “Over 10M? Those are some heavy bags, señor. Cojones confirmed. You're in.”

## Checks

`npm test` checks the exact threshold boundary, authentication with unset secrets, and session expiry/group/identity validation. `npm run build` checks the production app. Live Telegram, wallet, RPC, and Redis testing requires configured credentials.

## Limits

Designed for a small initial group. Rechecks currently scan registered wallets sequentially in a 60-second function. Larger groups need a queued/batched recheck before relying on removals. Redis/RPC outages delay access decisions and removals; watch hosting logs and cron results. Telegram webhook retries can produce duplicate informational DMs or links, but do not grant unverified entry.
