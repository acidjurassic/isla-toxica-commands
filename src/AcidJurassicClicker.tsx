import { useEffect, useMemo, useState } from "react";

console.log("Twitch Client ID:", import.meta.env.VITE_TWITCH_CLIENT_ID);


// ---- Types ----
type Item = { id: string; label: string };
type ThingyKey = "BINGO" | "SOUND" | "DRIVEBY" | "TRIVIA";

// ---- Thingy labels + per-thingy buttons ----
const THINGY_LABEL: Record<ThingyKey, string> = {
  BINGO: "Bingo Thingy",
  SOUND: "Sound Thingy",
  DRIVEBY: "DriveBy Thingy",
  TRIVIA: "Trivia Thingy",
};

const THINGY_BUTTONS: Record<ThingyKey, Item[]> = {
  BINGO: [
    { id: "BINGO_NEW", label: "New Card" },
    { id: "BINGO_CALL", label: "Call Number" },
    { id: "BINGO_CLEAR", label: "Clear Board" },
  ],
  SOUND: [
    { id: "BONK", label: "BONK" },
    { id: "SEXY_SAX", label: "Sexy Sax" },
    { id: "HOW_RUDE", label: "How Rude!" },
    { id: "DUNDUN", label: "Dun Dun Duuun" },
    { id: "CANTINA", label: "Cantina Band" },
    { id: "RIMSHOT", label: "Joke Drum" },
  ],
  DRIVEBY: [
    { id: "SIREN", label: "Siren" },
    { id: "HONK", label: "Honk" },
    { id: "ZOOM", label: "Zoom Past" },
  ],
  TRIVIA: [
    { id: "TRIVIA_START", label: "Start Trivia" },
    { id: "TRIVIA_HINT", label: "Hint" },
    { id: "TRIVIA_REVEAL", label: "Reveal Answer" },
  ],
};

// ---- Twitch OAuth (implicit) ----
const TWITCH_AUTHORIZE = "https://id.twitch.tv/oauth2/authorize";
const TWITCH_VALIDATE = "https://id.twitch.tv/oauth2/validate";

export default function AcidJurassicClicker() {
  // Auth
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Panel gating
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Bot Offline");

  // Tabs: null = Welcome
  const [active, setActive] = useState<ThingyKey | null>(null);

  // Action buttons require: authed + connected + enabled
  const actionsDisabled = useMemo(
    () => !authed || !connected || !enabled,
    [authed, connected, enabled]
  );

  useEffect(() => {
    setStatus(connected ? "Bot Online" : "Bot Offline");
  }, [connected]);

  // Parse token from hash/localStorage, validate with Twitch
  useEffect(() => {
    async function validate(tok: string) {
      try {
        const r = await fetch(TWITCH_VALIDATE, {
          headers: { Authorization: `OAuth ${tok}` },
        });
        if (!r.ok) throw new Error("bad token");
        const data = await r.json();
        setUsername(data.login ?? null);
        setAuthed(true);
        localStorage.setItem("twitch_token", tok);
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
      } catch {
        localStorage.removeItem("twitch_token");
        setAuthed(false);
        setUsername(null);
      }
    }

    if (location.hash.includes("access_token=")) {
      const q = new URLSearchParams(location.hash.slice(1));
      const tok = q.get("access_token");
      if (tok) validate(tok);
      return;
    }
    const existing = localStorage.getItem("twitch_token");
    if (existing) validate(existing);
  }, []);

  function loginWithTwitch() {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    if (!clientId) {
      alert("Missing VITE_TWITCH_CLIENT_ID in Vercel env vars.");
      return;
    }
    const u = new URL(TWITCH_AUTHORIZE);
    u.searchParams.set("client_id", clientId);
    u.searchParams.set("redirect_uri", window.location.origin);
    u.searchParams.set("response_type", "token");
    u.searchParams.set("scope", "");
    window.location.href = u.toString();
  }

  function logout() {
    localStorage.removeItem("twitch_token");
    setAuthed(false);
    setUsername(null);
    setActive(null);
  }

  function trigger(item: Item) {
    if (actionsDisabled) return;
    setStatus(`Triggered: ${item.label}`);
    // TODO: POST to /api/trigger with item.id
  }

  // ---------- UI ----------

  // STEP 1: Login
  if (!authed) {
    return (
      <section className="rounded-2xl border border-emerald-500/60 bg-neutral-900/90 shadow-[0_0_25px_rgba(0,255,153,0.25)] p-8 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(0,255,153,.5)] mb-4">
          WELCOME!
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto mb-8">
          Log in with Twitch to continue. We don’t store personal data — Twitch only confirms your identity.
        </p>
        <button
          onClick={loginWithTwitch}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 text-black font-semibold py-3 px-6 hover:bg-emerald-500 transition"
        >
          Login with Twitch
        </button>
      </section>
    );
  }

  // STEP 2: Tabs then content
  return (
    <section className="rounded-2xl border border-emerald-500/60 bg-neutral-900/90 shadow-[0_0_25px_rgba(0,255,153,0.25)] overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-emerald-600/90 text-black px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">The Isla Tóxica Clicker</h2>
            <p className="text-black/80 font-medium">Connected as: {username ?? "…"}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-full bg-black/10 border border-black/20 px-4 py-1.5 font-semibold hover:bg-black/20"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Tabs — always clickable after login */}
        <div className="flex flex-wrap gap-4 mb-6">
          {(Object.keys(THINGY_LABEL) as ThingyKey[]).map((key) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`rounded-full px-5 py-2 text-lg font-semibold transition border-2
                  ${isActive
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_12px_rgba(0,255,153,.6)]"
                    : "bg-transparent text-emerald-300 border-emerald-400 hover:bg-emerald-500/15"}`}
              >
                {THINGY_LABEL[key]}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="rounded-xl border border-emerald-500/40 bg-neutral-800/70 p-6 sm:p-8 shadow-inner mb-6">
          {!active ? (
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-emerald-400 mb-3">
                WELCOME!
              </h3>
              <p className="text-gray-300">
                Pick a Thingy above to open its controls. Actions work only when{" "}
                <strong>Connected</strong> and <strong>Enabled</strong>.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-emerald-400 mb-4 text-center">
                {THINGY_LABEL[active]}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THINGY_BUTTONS[active].map((i) => (
                  <button
                    key={i.id}
                    onClick={() => trigger(i)}
                    disabled={actionsDisabled}
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
            </>
          )}
        </div>

        {/* Controls + Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const next = !connected;
                setConnected(next);
                setStatus(next ? "Bot Online" : "Bot Offline");
              }}
              className={`px-6 py-2 rounded-full font-semibold transition
                ${connected ? "bg-emerald-500 text-black hover:bg-emerald-400"
                            : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
            >
              {connected ? "Connected" : "Connect"}
            </button>

            <button
              onClick={() => setEnabled((e) => !e)}
              className={`px-6 py-2 rounded-full font-semibold transition
                ${enabled ? "bg-emerald-500 text-black hover:bg-emerald-400"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
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
