// api/trigger.js
// Vercel Serverless Function (Node runtime)
// Validates a viewer's Twitch token, rate-limits per user, and (optionally) forwards to your bot.

const lastHit = new Map();          // in-memory per-user cooldown
const COOLDOWN_MS = 1200;           // 1.2s anti-spam

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // 1) Viewer OAuth token (sent by the browser)
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("OAuth ") ? auth.slice(6) : "";
  if (!token) return res.status(401).send("Missing token");

  // 2) Validate with Twitch: who is this viewer?
  const vr = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${token}` },
    cache: "no-store",
  });
  if (!vr.ok) return res.status(401).send("Invalid/expired token");
  const v = await vr.json(); // { login, user_id, client_id, scopes, expires_in }

  // 3) Per-user cooldown
  const now = Date.now();
  const last = lastHit.get(v.user_id) ?? 0;
  if (now - last < COOLDOWN_MS) {
    return res.status(429).send("Cooldown");
  }
  lastHit.set(v.user_id, now);

  // 4) Parse action
  let body = {};
  try { body = req.body ?? {}; } catch {}
  const actionId = body?.actionId;
  if (!actionId) return res.status(400).send("Missing actionId");

  // 5) (Optional) Forward to your bot / Streamer.bot webhook
  // If you set BOT_HOOK_URL in Vercel env, we POST { actionId, user, userId }
  const hook = process.env.BOT_HOOK_URL;
  if (hook) {
    const f = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionId,
        user: v.login,
        userId: v.user_id,
        platform: "twitch",
      }),
    });
    if (!f.ok) {
      const msg = await f.text();
      return res.status(502).send(`Bot hook failed: ${msg || f.statusText}`);
    }
  }

  // 6) Tell the browser it worked
  return res.status(200).json({ ok: true, user: v.login, actionId });
}
