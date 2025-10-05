import { useEffect, useMemo, useState } from "react";

type Item = { id: string; label: string };

const TOP_BUTTONS: Item[] = [
  { id: "BINGO", label: "Bingo Thingy" },
  { id: "SOUND", label: "Sound Thingy" },
  { id: "DRIVEBY", label: "DriveBy Thingy" },
  { id: "TRIVIA", label: "Trivia Thingy" },
];

const PANEL_BUTTONS: Item[] = [
  { id: "BONK", label: "BONK" },
  { id: "SEXY_SAX", label: "Sexy Sax" },
  { id: "HOW_RUDE", label: "How Rude!" },
  { id: "DUNDUN", label: "Dun Dun Duuun" },
  { id: "CANTINA", label: "Cantina Band" },
  { id: "RIMSHOT", label: "Joke Drum" },
];

const TWITCH_AUTHORIZE = "https://id.twitch.tv/oauth2/authorize";
const TWITCH_VALIDATE  = "https://id.twitch.tv/oauth2/validate";

export default function AcidJurassicClicker() {
  // auth
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // panel gating
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Bot Offline");

  // Buttons are active only when you are logged in + connected + enabled
  const buttonsDisabled = useMemo(
    () => !authed || !connected || !enabled,
    [authed, connected, enabled]
  );

  useEffect(() => {
    setStatus(connected ? "Bot Online" : "Bot Offline");
  }, [connected]);

  // Parse token from hash OR from localStorage, then validate with Twitch
  useEffect(() => {
    async function validateAndStore(tok: string) {
      try {
        const res = await fetch(TWITCH_VALIDATE, {
          headers: { Authorization: `OAuth ${tok}` },
        });
        if (!res.ok) throw new Error("validate failed");
        const data = await res.json(); // { login, user_id, client_id, ... }
        setUsername(data.login ?? null);
        setAuthed(true);
        setToken(tok);
        localStorage.setItem("twitch_token", tok);
        // clear the hash so refreshes are clean
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      } catch {
        // bad/expired token
        localStorage.removeItem("twitch_token");
        setAuthed(false);
        setUsername(null);
        setToken(null);
      }
    }

    // 1) If Twitch just redirected us back with #access_token=...
    if (location.hash.includes("access_token=")) {
      const params = new URLSearchParams(location.hash.slice(1));
      const tok = params.get("access_token");
      if (tok) validateAndStore(tok);
      return;
    }

    // 2) Else try existing token
    const existing = localStorage.getItem("twitch_token");
    if (existing) validateAndStore(existing);
  }, []);

  function handleLogin() {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    if (!clientId) {
      alert("Missing VITE_TWITCH_CLIENT_ID in your Vercel Environment Variables.");
      return;
    }
    const redirect = window.location.origin; // send back to the same page
    const url = new URL(TWITCH_AUTHORIZE);
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirect);
    url.searchParams.set("response_type", "token"); // implicit flow
    // Minimal scope is fine for identity; add more (e.g., user:read:email) if needed.
    url.searchParams.set("scope", "");
    window.location.href = url.toString();
  }

  function handleLogout() {
    localStorage.removeItem("twitch_token");
    setAuthed(false);
    setUsername(null);
    setToken(null);
  }

  function trigger(item: Item) {
    if (buttonsDisabled) return;
    setStatus(`Triggered: ${item.label}`);
    // TODO: send to your backend or Streamer.bot here, including token if needed
    // fetch('/api/trigger', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id:item.id, token }) })
  }

  // ---------- UI ----------

  // If not logged in, show the "WELCOME / Login with Twitch" card
  if (!authed) {
    return (
      <section className="rounded-2xl border border-emerald-500/60 bg-neutral-900/90 shadow-[0_0_25px_rgba(0,255,153,0.25)] p-8 text-center">
        <h1 className="text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(0,255,153,.5)] mb-4">
          WELCOME!
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto mb-8">
          Log in with Twitch to use the clicker. No personal data is stored — we only confirm your identity with Twitch.
        </p>
        <button
          onClick={handleLogin}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 text-black font-semibold py-3 px-6 hover:bg-emerald-500 transition shadow-[0_2px_6px_rgba(0,0,0,.4)]"
        >
          Login with Twitch
        </button>
      </section>
    );
  }

  // Logged in view
  return (
    <section className="rounded-2xl border border-emerald-500/60 bg-neutral-900/90 shadow-[0_0_25px_rgba(0,255,153,0.25)] overflow-hidden">
      {/* Header bar */}
      <div className="bg-emerald-600/90 text-black px-6 py-5 shadow-[0_0_15px_rgba(0,255,153,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">The Isla Tóxica Clicker</h2>
            <p className="text-black/80 font-medium">
              Connected as: {username ?? "…" }
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full bg-black/10 border border-black/20 px-4 py-1.5 font-semibold hover:bg-black/20"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Top row “Thingy” buttons (outline, pill) */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {TOP_BUTTONS.map((b) => (
            <button
              key={b.id}
              onClick={() => trigger(b)}
              disabled={buttonsDisabled}
              className="rounded-full px-5 py-2 text-lg font-semibold
                         bg-transparent border-2 border-emerald-400 text-emerald-300
                         hover:bg-emerald-500/15 transition
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Info / content area */}
        <div className="rounded-xl border border-emerald-500/40 bg-neutral-800/70 p-6 sm:p-8 shadow-inner mb-6">
          <h3 className="text-2xl font-extrabold text-emerald-400 text-center mb-3">
            WELCOME!
          </h3>
          <p className="text-center text-gray-300 max-w-2xl mx-auto">
            Select a “Thingy” to interact. Buttons work only when{" "}
            <strong>Connected</strong> and <strong>Enabled</strong>.
          </p>

          {/* Larger inner buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {PANEL_BUTTONS.map((i) => (
              <button
                key={i.id}
                onClick={() => trigger(i)}
                disabled={buttonsDisabled}
                className="bg-emerald-600 text-black font-semibold rounded-xl py-3
                           hover:bg-emerald-500 shadow-[0_2px_6px_rgba(0,0,0,.4)]
                           hover:shadow-[0_0_12px_rgba(0,255,153,.6)]
                           transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls + status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = !connected;
                setConnected(next);
                setStatus(next ? "Bot Online" : "Bot Offline");
              }}
              className={`px-6 py-2 rounded-full font-semibold transition
                          ${connected ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
            >
              {connected ? "Connected" : "Connect"}
            </button>

            <button
              onClick={() => setEnabled((e) => !e)}
              className={`px-6 py-2 rounded-full font-semibold transition
                          ${enabled ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
            >
              {enabled ? "Enabled" : "Enable"}
            </button>
          </div>

          <div className={`px-5 py-2 rounded-full font-semibold ${connected ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {connected ? "Online" : "Bot Offline"}
          </div>
        </div>

        <div className="h-px bg-white/10 my-6" />
        <div className="text-sm text-gray-300">{status}</div>
      </div>
    </section>
  );
}


